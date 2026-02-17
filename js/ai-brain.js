import { ACTIONS, PHASES, getStartingHandTier, randomFloat, clamp, weightedRandom } from './utils.js';
import { HandEvaluator } from './hand-evaluator.js';

export class AIBrain {

    /**
     * Main entry point: decide what action to take.
     * Returns { action: string, amount: number }
     */
    static decideAction(player, gameState) {
        const situation = this.assessSituation(player, gameState);
        let probs = this.getBaseStrategy(situation);
        probs = this.applyPersona(probs, player.persona, situation);

        // Dampen emotional influence (Pro players don't tilt)
        const effectiveEmotion = this.dampenEmotion(player.emotionalState);
        probs = this.applyEmotionalState(probs, effectiveEmotion, situation);

        probs = this.applyOpponentReads(probs, player.opponentModels, gameState, situation);

        // GTO balance enforcement
        probs = this.applyGTOBalance(probs, situation);

        // Multi-street plan: create on flop, consult on turn/river
        if (!situation.isPreflop) {
            if (situation.phase === PHASES.FLOP && !player.streetPlan) {
                player.streetPlan = this.createStreetPlan(situation, player);
            }
            if (player.streetPlan) {
                probs = this.applyStreetPlan(probs, player.streetPlan, situation);
            }
        }

        probs = this.normalize(probs);

        return this.selectAction(probs, situation, player, gameState);
    }

    // ── Layer 1: Situation Assessment ──────────────────────────────────────

    static assessSituation(player, gameState) {
        const holeCards = player.holeCards;
        const communityCards = gameState.communityCards;
        const isPreflop = communityCards.length === 0;
        const pot = gameState.pot;
        const callAmount = gameState.callAmount || 0;
        const bigBlind = gameState.bigBlind;
        const numActivePlayers = gameState.players.filter(p => !p.hasFolded && !p.isBusted).length;

        // ── Parse action history early (needed for range-weighted equity) ──
        const handReads = this.parseActionHistory(gameState, player);

        // Hand strength
        let handStrength;
        let handTier = 7;
        let madeHandStrength = 0;
        let equity = 0;

        if (isPreflop) {
            handTier = getStartingHandTier(holeCards[0], holeCards[1]);
            handStrength = HandEvaluator.quickHandStrength(holeCards, []);
            equity = handStrength;
            madeHandStrength = handStrength;
        } else {
            madeHandStrength = HandEvaluator.relativeHandStrength(holeCards, communityCards);

            // Per-street range narrowing with high-sim equity
            const opponentRange = this.estimateOpponentRangePerStreet(handReads, gameState.phase, numActivePlayers);
            equity = HandEvaluator.estimateEquityWithRanges(
                holeCards, communityCards, numActivePlayers - 1, opponentRange, 800
            );

            handStrength = equity * 0.75 + madeHandStrength * 0.25;
        }

        // Draw detection
        const draws = isPreflop
            ? { flushDraw: false, straightDraw: false, gutshot: false, outs: 0, drawStrength: 0,
                backdoorFlush: false, backdoorStraight: false, overcards: 0, flushDrawOuts: 0,
                straightDrawOuts: 0, gutshotOuts: 0 }
            : HandEvaluator.detectDraws(holeCards, communityCards);

        // Board texture
        const boardTexture = HandEvaluator.analyzeBoardTexture(communityCards);

        // Blocker awareness
        const blockers = isPreflop
            ? { blocksNutFlush: false, blocksTopSet: false, blocksOverpair: false, blocksTopPair: false, blockerStrength: 0 }
            : HandEvaluator.detectBlockers(holeCards, communityCards);

        // Position (0 = early, 0.5 = middle, 1 = late/dealer)
        const activePlayers = gameState.players.filter(p => !p.isBusted);
        const myPos = activePlayers.findIndex(p => p.id === player.id);
        const position = activePlayers.length > 1 ? myPos / (activePlayers.length - 1) : 0.5;

        // Pot odds
        const potOdds = callAmount > 0 ? callAmount / (pot + callAmount) : 0;

        // Stack to pot ratio
        const spr = pot > 0 ? player.chips / pot : 20;

        // Effective stack in big blinds
        const stackBB = player.chips / bigBlind;

        // Has someone raised?
        const facingRaise = callAmount > bigBlind && isPreflop;
        const facingBet = callAmount > 0;

        // Bet size relative to pot (how much pressure)
        const betToPotRatio = pot > 0 && callAmount > 0 ? callAmount / pot : 0;

        // How many players still to act after us
        const playersLeftToAct = activePlayers.filter(p =>
            !p.hasFolded && !p.isAllIn && p.id !== player.id
        ).length;

        // How many players already in the pot this round
        const playersInPot = gameState.players.filter(p =>
            !p.hasFolded && !p.isBusted && (p.currentBet > 0 || !isPreflop)
        ).length;

        // Implied odds factor: how much more can we win if we hit
        let impliedOdds = 0;
        if (draws.outs > 0 && callAmount > 0) {
            const futureValue = Math.min(player.chips, pot * 1.5);
            impliedOdds = (pot + futureValue) > 0
                ? callAmount / (pot + futureValue + callAmount)
                : potOdds;
        }

        return {
            handStrength,
            madeHandStrength,
            equity,
            handTier,
            isPreflop,
            position,
            potOdds,
            impliedOdds,
            spr,
            stackBB,
            pot,
            callAmount,
            bigBlind,
            numActivePlayers,
            facingRaise,
            facingBet,
            betToPotRatio,
            playersLeftToAct,
            playersInPot,
            phase: gameState.phase,
            playerChips: player.chips,
            communityCards,
            draws,
            boardTexture,
            blockers,
            handReads
        };
    }

    // ── Action History Parser ──────────────────────────────────────────────

    /**
     * Parse the action history to extract useful hand-reading information.
     * Includes per-street opponent action tracking for range narrowing.
     */
    static parseActionHistory(gameState, player) {
        const history = gameState.actionHistory || [];
        const currentPhase = gameState.phase;

        const reads = {
            weArePreflopAggressor: false,
            opponentCheckedBack: false,
            opponentBetMultipleStreets: false,
            preflopRaiserFolded: false,
            numRaisesThisStreet: 0,
            opponentShowedAggression: false,
            streetsBetByOpponent: 0,
            // Per-street tracking for range narrowing
            opponentRaisedPreflop: false,
            opponentCalledPreflop: false,
            opponentBetFlop: false,
            opponentCheckedFlop: false,
            opponentBetTurn: false,
            opponentCheckedTurn: false,
            opponentBetRiver: false,
            preflopRaiseCount: 0
        };

        if (history.length === 0) return reads;

        let preflopRaiser = null;
        const phaseActions = { preflop: [], flop: [], turn: [], river: [] };
        const phaseNames = ['preflop', 'flop', 'turn', 'river'];

        // Handle phase key mapping (game uses 'pre-flop' but we normalize)
        for (const entry of history) {
            let phase = (entry.phase || 'preflop').toLowerCase();
            if (phase === 'pre-flop') phase = 'preflop';
            if (phaseActions[phase]) {
                phaseActions[phase].push(entry);
            }
        }

        // Identify preflop aggressor and count preflop raises
        for (const action of phaseActions.preflop) {
            if (action.action === 'raise' || action.action === 'all-in') {
                preflopRaiser = action.playerId;
                if (action.playerId !== player.id) {
                    reads.opponentRaisedPreflop = true;
                    reads.preflopRaiseCount++;
                }
            }
            if (action.playerId !== player.id && action.action === 'call') {
                reads.opponentCalledPreflop = true;
            }
        }

        reads.weArePreflopAggressor = (preflopRaiser === player.id);

        if (preflopRaiser) {
            const raiserPlayer = gameState.players.find(p => p.id === preflopRaiser);
            if (raiserPlayer && raiserPlayer.hasFolded) {
                reads.preflopRaiserFolded = true;
            }
        }

        // Analyze opponent actions by street (including per-street tracking)
        let opponentStreetsBet = 0;
        let currentPhaseNorm = (currentPhase || 'preflop').toLowerCase();
        if (currentPhaseNorm === 'pre-flop') currentPhaseNorm = 'preflop';
        const previousPhases = phaseNames.slice(0, phaseNames.indexOf(currentPhaseNorm));
        let opponentCheckedPrevStreet = false;

        for (const phase of previousPhases) {
            const actions = phaseActions[phase];
            let opponentBetThisStreet = false;
            let opponentCheckedThisStreet = false;

            for (const action of actions) {
                if (action.playerId === player.id) continue;

                if (action.action === 'raise' || action.action === 'bet' || action.action === 'all-in') {
                    opponentBetThisStreet = true;
                    reads.opponentShowedAggression = true;
                } else if (action.action === 'check') {
                    opponentCheckedThisStreet = true;
                }
            }

            if (opponentBetThisStreet) opponentStreetsBet++;
            if (opponentCheckedThisStreet && !opponentBetThisStreet) {
                opponentCheckedPrevStreet = true;
            }

            // Per-street tracking
            if (phase === 'flop') {
                reads.opponentBetFlop = opponentBetThisStreet;
                reads.opponentCheckedFlop = opponentCheckedThisStreet && !opponentBetThisStreet;
            } else if (phase === 'turn') {
                reads.opponentBetTurn = opponentBetThisStreet;
                reads.opponentCheckedTurn = opponentCheckedThisStreet && !opponentBetThisStreet;
            }
        }

        // Also check current street for actions already taken
        const currentActions = phaseActions[currentPhaseNorm] || [];
        for (const action of currentActions) {
            if (action.action === 'raise' || action.action === 'all-in') {
                reads.numRaisesThisStreet++;
            }
            if (action.playerId !== player.id) {
                if (action.action === 'raise' || action.action === 'bet' || action.action === 'all-in') {
                    reads.opponentShowedAggression = true;
                    if (currentPhaseNorm === 'flop') reads.opponentBetFlop = true;
                    if (currentPhaseNorm === 'turn') reads.opponentBetTurn = true;
                    if (currentPhaseNorm === 'river') reads.opponentBetRiver = true;
                }
            }
        }

        reads.opponentCheckedBack = opponentCheckedPrevStreet;
        reads.streetsBetByOpponent = opponentStreetsBet;
        reads.opponentBetMultipleStreets = opponentStreetsBet >= 2;

        return reads;
    }

    // ── Layer 2: Base Strategy ─────────────────────────────────────────────

    static getBaseStrategy(situation) {
        if (situation.isPreflop) {
            return this.getPreflopBaseStrategy(situation);
        }
        return this.getPostflopBaseStrategy(situation);
    }

    static getPostflopBaseStrategy(situation) {
        const {
            handStrength, madeHandStrength, equity, potOdds, impliedOdds,
            facingBet, draws, boardTexture, phase, spr, position,
            numActivePlayers, betToPotRatio, callAmount, pot,
            blockers, handReads
        } = situation;

        let fold = 0, check = 0, call = 0, raise = 0;

        const hasGoodDraw = draws.outs >= 8;
        const hasAnyDraw = draws.outs >= 4;
        const isMonster = madeHandStrength >= 0.75;  // full house+
        const isStrong = madeHandStrength >= 0.55;   // trips+
        const isMedium = madeHandStrength >= 0.3;    // pair+
        const isWeak = madeHandStrength < 0.2;       // high card / weak pair

        // Effective odds: use implied odds for draws, pot odds for made hands
        const effectiveOdds = hasAnyDraw ? impliedOdds : potOdds;

        if (!facingBet) {
            // ── No bet to face: check or bet ──

            if (isMonster) {
                // Slow-play some monsters, bet others (base—persona modifies this)
                raise = 0.65;
                check = 0.35;
            } else if (isStrong) {
                // Value bet strongly
                raise = 0.7;
                check = 0.3;
            } else if (isMedium) {
                // Medium hands: position matters
                if (position > 0.6) {
                    raise = 0.45;
                    check = 0.55;
                } else {
                    raise = 0.25;
                    check = 0.75;
                }
            } else if (hasGoodDraw) {
                // Semi-bluff with good draws
                raise = 0.55;
                check = 0.45;
            } else if (hasAnyDraw) {
                // Smaller draws: check more, occasionally bet
                raise = 0.25;
                check = 0.75;
            } else {
                // Weak hand: mostly check, occasional bluff
                check = 0.8;
                raise = 0.1;
                // Bluff more on dry boards, less on wet
                if (boardTexture.wetness < 0.3) {
                    raise += 0.1;
                    check -= 0.1;
                }
                // ── Blocker-based bluffing ──
                if (blockers.blockerStrength > 0.1) {
                    // We block strong hands: better bluff candidate
                    raise += blockers.blockerStrength * 0.4;
                    check -= blockers.blockerStrength * 0.4;
                }
            }

            // ── Probe betting: opponent checked back previous street ──
            if (handReads.opponentCheckedBack && !isWeak) {
                // Opponent showed weakness by checking—attack
                raise += 0.2;
                check -= 0.2;
                // Even weak hands can probe if we have position
                if (isWeak && position > 0.6) {
                    raise += 0.12;
                    check -= 0.12;
                }
            }

            // ── C-bet as preflop aggressor ──
            if (handReads.weArePreflopAggressor && phase === PHASES.FLOP) {
                // We raised preflop: c-bet more often
                raise += 0.15;
                check -= 0.15;
                // But reduce on very wet boards
                if (boardTexture.wetness > 0.6 && isWeak) {
                    raise -= 0.1;
                    check += 0.1;
                }
            }

            // ── Street-specific adjustments (no bet facing) ──
            if (phase === PHASES.TURN && !isStrong && !hasGoodDraw) {
                // Be more cautious on turn with marginal hands
                check += 0.1;
                raise -= 0.1;
            }
            if (phase === PHASES.RIVER) {
                // River: no more draws, polarize (bet strong or bluff, check medium)
                if (isStrong || isMonster) {
                    raise += 0.15;
                    check -= 0.15;
                } else if (isMedium) {
                    // Medium hands become check-calls on river
                    check += 0.15;
                    raise -= 0.15;
                } else if (isWeak) {
                    // River bluff frequency based on blockers and position
                    let bluffFreq = position > 0.6 ? 0.18 : 0.08;
                    // Better bluffs with blockers
                    if (blockers.blockerStrength > 0.1) {
                        bluffFreq += blockers.blockerStrength * 0.3;
                    }
                    raise = bluffFreq;
                    check = 1 - bluffFreq;
                }
            }

        } else {
            // ── Facing a bet ──

            // ── Check-raise logic (we checked, opponent bet, now we raise) ──
            // This is handled naturally by the raise probability when facing a bet
            // after checking. Boost raise % in specific check-raise spots.
            const isCheckRaiseSpot = !handReads.weArePreflopAggressor && position < 0.5;

            if (isMonster) {
                // Raise for value with monsters
                raise = 0.6;
                call = 0.35;
                fold = 0;
                // Check-raise more with monsters out of position
                if (isCheckRaiseSpot) {
                    raise += 0.15;
                    call -= 0.15;
                }
            } else if (isStrong) {
                raise = 0.35;
                call = 0.5;
                fold = 0.05;
                // Check-raise with strong hands OOP
                if (isCheckRaiseSpot) {
                    raise += 0.1;
                    call -= 0.1;
                }
            } else if (equity > effectiveOdds + 0.12) {
                // Clear profitable call/raise
                call = 0.45;
                raise = Math.max(0, equity - 0.4);
                fold = 0.05;
            } else if (hasGoodDraw && draws.drawStrength > effectiveOdds) {
                // Good draw with implied odds: semi-bluff raise or call
                raise = 0.35;
                call = 0.45;
                fold = 0.1;
                // Check-raise semi-bluff with good draws OOP
                if (isCheckRaiseSpot) {
                    raise += 0.1;
                    call -= 0.1;
                }
            } else if (hasAnyDraw && draws.drawStrength > effectiveOdds * 0.8) {
                // Marginal draw with some implied odds
                call = 0.55;
                raise = 0.1;
                fold = 0.25;
            } else if (equity > effectiveOdds) {
                // Marginally profitable
                call = 0.55;
                raise = 0.08;
                fold = 0.3;
            } else if (equity > effectiveOdds * 0.7) {
                // Close to break-even: can still call sometimes
                call = 0.3;
                fold = 0.55;
                raise = 0.05;
            } else {
                // Weak hand facing bet
                fold = 0.7;
                call = 0.1;
                raise = 0.04; // pure bluff

                // Check-raise bluff with good blockers OOP
                if (isCheckRaiseSpot && blockers.blockerStrength > 0.12) {
                    raise += blockers.blockerStrength * 0.4;
                    fold -= blockers.blockerStrength * 0.4;
                }

                // Bluff-raise more against large bets on scary boards
                if (betToPotRatio > 0.7 && boardTexture.wetness > 0.5) {
                    raise += 0.06;
                    fold -= 0.06;
                }
            }

            // ── Respect multi-street aggression ──
            if (handReads.opponentBetMultipleStreets) {
                // Opponent has been betting multiple streets: likely strong
                if (!isStrong && !isMonster) {
                    fold += 0.1;
                    call -= 0.05;
                    raise -= 0.05;
                }
            }

            // ── Multiple raises on this street: extreme caution ──
            if (handReads.numRaisesThisStreet >= 2) {
                if (!isMonster) {
                    fold += 0.15;
                    call -= 0.08;
                    raise -= 0.07;
                }
            }

            // ── Street-specific adjustments (facing bet) ──
            if (phase === PHASES.TURN) {
                // Turn plays tighter: less floating
                if (!isStrong && !hasGoodDraw) {
                    fold += 0.08;
                    call -= 0.08;
                }
            }
            if (phase === PHASES.RIVER) {
                // River: no draw equity, so evaluate made hand only
                if (!isStrong && !isMedium) {
                    // Only continue with bluff-catchers if odds are right
                    if (equity < potOdds) {
                        fold += 0.15;
                        call -= 0.1;
                        raise -= 0.05;
                    }
                }
                // Don't semi-bluff raise on river (no cards to come)
                if (!isStrong) {
                    // Convert some raises to folds or calls
                    const excessRaise = raise * 0.5;
                    raise -= excessRaise;
                    if (equity > potOdds) {
                        call += excessRaise;
                    } else {
                        fold += excessRaise;
                    }
                }
            }

            // ── SPR-based commitment ──
            if (spr < 3 && isMedium) {
                // Low SPR: pot-committed with medium+ hands
                fold -= 0.2;
                call += 0.1;
                raise += 0.1;
            } else if (spr < 1) {
                // Very low SPR: almost always commit with any piece
                if (madeHandStrength > 0.15) {
                    fold = 0.05;
                    raise = 0.6;
                    call = 0.35;
                }
            }
        }

        // ── Multi-way pot adjustment ──
        if (numActivePlayers > 2) {
            // Tighten up in multi-way pots
            fold += 0.05 * (numActivePlayers - 2);
            raise -= 0.03 * (numActivePlayers - 2);
            // But still value bet strong hands
            if (isStrong || isMonster) {
                raise += 0.05 * (numActivePlayers - 2);
                fold -= 0.05 * (numActivePlayers - 2);
            }
        }

        return this.normalize({ fold, check, call, raise });
    }

    static getPreflopBaseStrategy(situation) {
        const { handTier, position, facingRaise, callAmount, bigBlind, stackBB, spr, numActivePlayers } = situation;
        let fold = 0, check = 0, call = 0, raise = 0;

        // Tighter ranges in early position, looser in late
        const positionBonus = position * 1.5; // 0 to 1.5 extra tiers of looseness
        const effectiveTier = handTier - positionBonus;

        if (effectiveTier <= 1) {
            raise = 0.85;
            call = 0.1;
            fold = 0;
            check = 0.05;
        } else if (effectiveTier <= 2) {
            raise = 0.65;
            call = 0.25;
            fold = 0.05;
            check = 0.05;
        } else if (effectiveTier <= 3) {
            raise = 0.4;
            call = 0.35;
            fold = 0.15;
            check = 0.1;
        } else if (effectiveTier <= 4) {
            raise = 0.2;
            call = 0.3;
            fold = 0.35;
            check = 0.15;
        } else if (effectiveTier <= 5) {
            raise = 0.08;
            call = 0.17;
            fold = 0.6;
            check = 0.15;
        } else {
            raise = 0.02;
            call = 0.06;
            fold = 0.82;
            check = 0.1;
        }

        // ── Facing a raise: tighten up ──
        if (facingRaise) {
            const raiseMultiple = callAmount / bigBlind;

            if (raiseMultiple >= 8) {
                // Facing a big 4-bet+ : only continue with premiums
                if (effectiveTier <= 1) {
                    raise = 0.5;
                    call = 0.4;
                    fold = 0.1;
                } else if (effectiveTier <= 2) {
                    raise = 0.15;
                    call = 0.35;
                    fold = 0.5;
                } else {
                    fold = 0.85;
                    call = 0.1;
                    raise = 0.05;
                }
            } else if (raiseMultiple >= 4) {
                // Facing a 3-bet: tighten significantly
                if (effectiveTier <= 1) {
                    raise = 0.55; // 4-bet with premiums
                    call = 0.35;
                    fold = 0.05;
                } else if (effectiveTier <= 2) {
                    raise = 0.2;
                    call = 0.45;
                    fold = 0.3;
                } else if (effectiveTier <= 3) {
                    call = 0.35;
                    fold = 0.55;
                    raise = 0.1;
                } else {
                    fold = 0.8;
                    call = 0.12;
                    raise = 0.03;
                }
            } else {
                // Facing a standard open raise (2-3x)
                const tightenFactor = Math.min(0.35, raiseMultiple * 0.06);
                fold += tightenFactor;
                call -= tightenFactor * 0.3;
                raise -= tightenFactor * 0.3;

                // 3-bet with strong hands
                if (effectiveTier <= 2) {
                    raise += 0.15;
                    call -= 0.1;
                }
            }
        }

        // ── Short stack adjustments ──
        if (stackBB < 15) {
            // Short stack: push/fold mode
            if (effectiveTier <= 3) {
                raise = 0.8;
                call = 0.05;
                fold = 0.1;
                check = 0.05;
            } else if (effectiveTier <= 5) {
                if (position > 0.6) {
                    raise = 0.5;
                    fold = 0.4;
                    call = 0.05;
                } else {
                    fold = 0.75;
                    raise = 0.2;
                    call = 0.05;
                }
            } else {
                fold = 0.9;
                raise = 0.08;
                call = 0.02;
            }
        } else if (stackBB < 30) {
            // Medium-short stack: tighter, more raise-heavy
            call *= 0.6;
            raise += call * 0.3;
            fold += call * 0.1;
        }

        // ── Steal attempts from late position vs few players ──
        if (position > 0.7 && !facingRaise && numActivePlayers <= 4) {
            // Button/cutoff steal
            if (effectiveTier <= 6) {
                raise += 0.12;
                fold -= 0.12;
            }
        }

        return this.normalize({ fold, check, call, raise });
    }

    // ── Layer 3: Persona Modifier ──────────────────────────────────────────

    static applyPersona(probs, persona, situation) {
        let { fold, check, call, raise } = probs;
        const { isPreflop, handStrength, madeHandStrength, facingBet, position,
                draws, boardTexture, phase, spr } = situation;

        // Preflop tightness
        if (isPreflop) {
            const tightnessShift = (persona.preflopTightness - 0.5) * 0.4;
            fold += tightnessShift;
            call -= tightnessShift * 0.5;
            raise -= tightnessShift * 0.5;
        }

        // Postflop aggression
        if (!isPreflop) {
            const aggShift = (persona.postflopAggression - 1) * 0.3;
            raise += aggShift;
            call -= aggShift * 0.5;
            check -= aggShift * 0.5;
        }

        // Bluffing tendency - now applies in more situations
        if (!isPreflop) {
            const isWeak = madeHandStrength < 0.25;
            const hasDraw = draws.outs >= 4;

            // Pure bluff with weak hands
            if (isWeak && !hasDraw) {
                if (facingBet) {
                    const bluffRaise = persona.bluffFrequency * 0.3;
                    raise += bluffRaise;
                    fold -= bluffRaise;
                } else {
                    // Proactive bluffs (betting into opponents)
                    const proactiveBluff = persona.bluffFrequency * 0.25;
                    raise += proactiveBluff;
                    check -= proactiveBluff;

                    // Bluff more on dry boards
                    if (boardTexture.wetness < 0.3) {
                        raise += persona.bluffFrequency * 0.1;
                        check -= persona.bluffFrequency * 0.1;
                    }
                }
            }

            // Semi-bluff with draws (aggressive personas semi-bluff more)
            if (hasDraw && !facingBet) {
                const semiBluff = persona.postflopAggression * 0.15;
                raise += semiBluff;
                check -= semiBluff;
            }
        }

        // Slow-play tendency (when hand is strong)
        if (!isPreflop && madeHandStrength > 0.7) {
            if (!facingBet) {
                const slowPlay = persona.slowplayFrequency * 0.4;
                check += slowPlay;
                raise -= slowPlay;

                // Don't slow-play on wet boards (opponents can outdraw)
                if (boardTexture.wetness > 0.5) {
                    const wetPenalty = boardTexture.wetness * 0.25;
                    check -= wetPenalty;
                    raise += wetPenalty;
                }
            } else {
                // Slow-play by flat calling raises
                const flatCall = persona.slowplayFrequency * 0.25;
                call += flatCall;
                raise -= flatCall;
            }
        }

        // Position awareness
        if (position > 0.7) {
            const posBoost = persona.positionAwareness * 0.15;
            raise += posBoost;
            fold -= posBoost * 0.5;
            call -= posBoost * 0.5;
        } else if (position < 0.3) {
            const posTight = persona.positionAwareness * 0.1;
            fold += posTight;
            raise -= posTight;
        }

        // Continuation bet tendency - now considers board texture
        if (!isPreflop && !facingBet && phase === PHASES.FLOP) {
            let cBetBoost = (persona.cBetFrequency - 0.5) * 0.3;
            // Reduce c-bet on wet boards
            if (boardTexture.wetness > 0.6) {
                cBetBoost *= 0.6;
            }
            // Increase c-bet on dry boards
            if (boardTexture.wetness < 0.3) {
                cBetBoost *= 1.3;
            }
            raise += cBetBoost;
            check -= cBetBoost;
        }

        // Double-barrel tendency (turn c-bet) for aggressive personas
        if (!isPreflop && !facingBet && phase === PHASES.TURN) {
            if (persona.postflopAggression > 1.2) {
                const barrelBoost = (persona.postflopAggression - 1) * 0.15;
                raise += barrelBoost;
                check -= barrelBoost;
            }
        }

        return this.normalize({ fold, check, call, raise });
    }

    // ── Layer 4: Emotional State Modifier ──────────────────────────────────

    static applyEmotionalState(probs, emotion, situation) {
        let { fold, check, call, raise } = probs;

        // Tilt: more aggressive, looser
        if (emotion.tilt > 0.3) {
            const tiltEffect = emotion.tilt * 0.35;
            raise += tiltEffect;
            call += tiltEffect * 0.3;
            fold -= tiltEffect * 0.8;
            check -= tiltEffect * 0.3;
        }

        // High confidence: slight aggression boost
        if (emotion.confidence > 0.7) {
            const confEffect = (emotion.confidence - 0.7) * 0.3;
            raise += confEffect;
            check -= confEffect;
        }

        // Low confidence: more passive
        if (emotion.confidence < 0.3) {
            const weakEffect = (0.3 - emotion.confidence) * 0.3;
            fold += weakEffect;
            call += weakEffect * 0.3;
            raise -= weakEffect;
        }

        // Frustration: more bluffs, wider calls
        if (emotion.frustration > 0.4) {
            const frustEffect = emotion.frustration * 0.25;
            raise += frustEffect * 0.4;
            call += frustEffect * 0.3;
            fold -= frustEffect * 0.5;
        }

        // Boredom: random aggression with weak hands
        if (emotion.boredom > 0.5 && situation.handStrength < 0.4) {
            const boredomEffect = emotion.boredom * 0.3;
            raise += boredomEffect;
            fold -= boredomEffect * 0.5;
            check -= boredomEffect * 0.5;
        }

        return this.normalize({ fold, check, call, raise });
    }

    // ── Layer 5: Opponent Read Modifier ────────────────────────────────────

    static applyOpponentReads(probs, opponentModels, gameState, situation) {
        let { fold, check, call, raise } = probs;

        if (Object.keys(opponentModels).length === 0) return { fold, check, call, raise };

        // Find the most relevant opponent: the one who made the current bet/raise
        // or the primary remaining opponent
        const activeOpponents = gameState.players.filter(p =>
            !p.hasFolded && !p.isBusted && !p.isHuman && p.id in opponentModels
        );

        if (activeOpponents.length === 0) return { fold, check, call, raise };

        // Focus on the specific opponent who bet (highest current bet)
        let primaryOpponent = activeOpponents[0];
        let primaryModel = opponentModels[primaryOpponent.id];

        for (const opp of activeOpponents) {
            if (opp.currentBet > primaryOpponent.currentBet && opponentModels[opp.id]) {
                primaryOpponent = opp;
                primaryModel = opponentModels[opp.id];
            }
        }

        if (!primaryModel || primaryModel.totalActions < 3) {
            return { fold, check, call, raise };
        }

        // ── Exploit specific opponent tendencies ──

        const oAggression = primaryModel.aggression;
        const oFoldRate = primaryModel.foldToBet;
        const oVPIP = primaryModel.vpip;

        // Against very aggressive opponents: trap with strong hands, fold weak ones
        if (oAggression > 0.65) {
            if (situation.madeHandStrength > 0.5) {
                // Trap: call more instead of raising
                call += 0.15;
                raise -= 0.1;
            } else if (situation.madeHandStrength < 0.2 && !situation.draws.outs) {
                // Their aggression is real often enough to fold junk
                fold += 0.08;
                call -= 0.08;
            }
        }

        // Against passive opponents: value bet thinner, bluff more
        if (oAggression < 0.3) {
            if (situation.madeHandStrength > 0.3) {
                raise += 0.12;
                check -= 0.06;
                call -= 0.06;
            }
            // Their bets mean more—respect them
            if (situation.facingBet && situation.madeHandStrength < 0.4) {
                fold += 0.1;
                call -= 0.1;
            }
        }

        // Against players who fold a lot: bluff more
        if (oFoldRate > 0.55) {
            if (situation.madeHandStrength < 0.3) {
                raise += 0.15;
                fold -= 0.08;
                check -= 0.07;
            }
        }

        // Against calling stations: value bet relentlessly, never bluff
        if (oFoldRate < 0.25) {
            if (situation.madeHandStrength > 0.35) {
                // Value bet thinner
                raise += 0.12;
                check -= 0.06;
                call -= 0.06;
            }
            if (situation.madeHandStrength < 0.2 && !situation.draws.outs) {
                // Don't bluff calling stations
                raise -= 0.12;
                fold += 0.06;
                check += 0.06;
            }
        }

        // Against very loose preflop players: tighten value range but play bigger pots
        if (situation.isPreflop && oVPIP > 0.7) {
            // They play too many hands, so our good hands gain value
            if (situation.handTier <= 4) {
                raise += 0.08;
                call -= 0.04;
            }
        }

        return this.normalize({ fold, check, call, raise });
    }

    // ── Layer 7: Action Selection ──────────────────────────────────────────

    static selectAction(probs, situation, player, gameState) {
        const validActions = gameState.validActions;

        // Map probabilities to valid actions
        const actionMap = [];
        const canCheck = validActions.some(a => a.type === ACTIONS.CHECK);
        const canCall = validActions.some(a => a.type === ACTIONS.CALL);
        const canRaise = validActions.some(a => a.type === ACTIONS.RAISE);
        const canFold = validActions.some(a => a.type === ACTIONS.FOLD);
        const canAllIn = validActions.some(a => a.type === ACTIONS.ALL_IN);

        if (canFold) actionMap.push({ value: ACTIONS.FOLD, weight: probs.fold });
        if (canCheck) actionMap.push({ value: ACTIONS.CHECK, weight: probs.check + probs.call });
        if (canCall) actionMap.push({ value: ACTIONS.CALL, weight: probs.call + probs.check });
        if (canRaise) actionMap.push({ value: ACTIONS.RAISE, weight: probs.raise });
        if (canAllIn && !canRaise) actionMap.push({ value: ACTIONS.ALL_IN, weight: probs.raise });

        // ── Override: never fold when checking is free ──
        if (canCheck && !canFold) {
            // Remove any fold weight (shouldn't happen but safety)
            for (const a of actionMap) {
                if (a.value === ACTIONS.FOLD) a.weight = 0;
            }
        }

        // ── Override: all-in with monster at low SPR ──
        if (situation.spr < 2 && situation.madeHandStrength > 0.6 && canAllIn) {
            return { action: ACTIONS.ALL_IN, amount: player.chips };
        }

        // Ensure at least one option has weight
        if (actionMap.every(a => a.weight <= 0)) {
            if (canCheck) return { action: ACTIONS.CHECK, amount: 0 };
            if (canFold) return { action: ACTIONS.FOLD, amount: 0 };
            return { action: actionMap[0].value, amount: 0 };
        }

        // Normalize weights
        const totalWeight = actionMap.reduce((sum, a) => sum + Math.max(0, a.weight), 0);
        if (totalWeight > 0) {
            for (const a of actionMap) a.weight = Math.max(0, a.weight) / totalWeight;
        }

        const selectedAction = weightedRandom(actionMap);

        // Determine amount for raises
        let amount = 0;
        if (selectedAction === ACTIONS.CALL) {
            amount = gameState.callAmount;
        } else if (selectedAction === ACTIONS.RAISE) {
            amount = this.determineBetSize(situation, player, gameState);
        } else if (selectedAction === ACTIONS.ALL_IN) {
            amount = player.chips;
        }

        return { action: selectedAction, amount };
    }

    // ── Bet Sizing ─────────────────────────────────────────────────────────

    static determineBetSize(situation, player, gameState) {
        const persona = player.persona;
        const { pot, bigBlind, handStrength, madeHandStrength, isPreflop, draws,
                boardTexture, phase, spr, stackBB, numActivePlayers } = situation;
        const minRaise = gameState.minRaiseTotal;
        const maxRaise = gameState.maxRaiseTotal;

        if (minRaise >= maxRaise) return maxRaise; // all-in is only option

        let targetSize;

        if (isPreflop) {
            // Open raise size -- adjust for position and stack
            let raiseMultiple = persona.typicalRaiseSizeBB;

            // Larger raises from early position
            if (situation.position < 0.3) {
                raiseMultiple += 0.5;
            }

            // Add 1BB per limper already in
            const limpers = gameState.players.filter(p =>
                !p.hasFolded && !p.isBusted && p.currentBet === bigBlind && p.id !== player.id
            ).length;
            raiseMultiple += limpers * 1.0;

            // Short stack: just shove or use standard sizing
            if (stackBB < 15 && raiseMultiple * bigBlind > player.chips * 0.4) {
                return maxRaise; // shove
            }

            targetSize = bigBlind * raiseMultiple;
            targetSize *= randomFloat(0.9, 1.1);

            // 3-bet sizing: larger than standard open
            const facingRaiseSize = gameState.callAmount || 0;
            if (facingRaiseSize > bigBlind) {
                // 3-bet: ~3x the open raise
                targetSize = Math.max(targetSize, facingRaiseSize * randomFloat(2.7, 3.3));
            }
        } else {
            // ── Post-flop sizing ──
            // Use geometric sizing from street plan if available
            let basePotFraction;
            const streetPlan = player.streetPlan;
            const currentStreet = phase === PHASES.FLOP ? 'flop'
                                : phase === PHASES.TURN ? 'turn'
                                : 'river';

            if (streetPlan && streetPlan.betSizes && streetPlan.betSizes[currentStreet]) {
                // Use geometric sizing from the multi-street plan
                basePotFraction = streetPlan.betSizes[currentStreet];
                // Add slight randomness to avoid being too predictable
                basePotFraction *= randomFloat(0.92, 1.08);
            } else {
                // Fallback: strategic sizing based on purpose
                if (madeHandStrength >= 0.7) {
                    // Value bet: size to get max value
                    if (phase === PHASES.RIVER) {
                        basePotFraction = randomFloat(0.6, 0.9);
                    } else {
                        basePotFraction = randomFloat(0.55, 0.75);
                    }
                } else if (madeHandStrength < 0.2 && draws.outs < 4) {
                    // Bluff: use smaller sizing for better risk/reward
                    if (phase === PHASES.RIVER) {
                        basePotFraction = randomFloat(0.5, 0.75);
                    } else {
                        basePotFraction = randomFloat(0.4, 0.6);
                    }
                } else if (draws.outs >= 8) {
                    // Semi-bluff with good draw: bet big to maximize fold equity
                    basePotFraction = randomFloat(0.6, 0.85);
                } else {
                    // Medium hands / protection bets
                    basePotFraction = randomFloat(0.45, 0.65);
                }

                // Board texture adjustment
                if (boardTexture.wetness > 0.6) {
                    basePotFraction *= 1.15;
                } else if (boardTexture.wetness < 0.3) {
                    basePotFraction *= 0.9;
                }
            }

            // Apply persona style as a modifier on top
            switch (persona.sizingStyle) {
                case 'precise':
                    break;
                case 'polarized':
                    if (madeHandStrength > 0.65 || madeHandStrength < 0.2) {
                        basePotFraction = Math.max(basePotFraction, randomFloat(0.75, 1.1));
                    } else {
                        basePotFraction = Math.min(basePotFraction, randomFloat(0.3, 0.4));
                    }
                    break;
                case 'random':
                    basePotFraction = randomFloat(0.3, 1.3);
                    break;
                case 'pot':
                    basePotFraction = Math.max(basePotFraction, randomFloat(0.65, 1.0));
                    break;
                case 'overbet':
                    basePotFraction = Math.max(basePotFraction, randomFloat(1.0, 1.8));
                    break;
                default:
                    break;
            }

            targetSize = pot * basePotFraction;

            // SPR-based sizing: bet bigger when SPR is low (commit)
            if (spr < 4 && madeHandStrength > 0.4) {
                targetSize = Math.max(targetSize, pot * 0.7);
            }
        }

        // Apply tilt sizing boost
        if (player.emotionalState.tilt > 0.3) {
            targetSize *= 1 + player.emotionalState.tilt * 0.5;
        }

        // Convert to total raise amount
        let totalRaiseTo;
        if (isPreflop) {
            totalRaiseTo = Math.round(targetSize);
        } else {
            const currentBet = player.currentBet || 0;
            totalRaiseTo = Math.round(targetSize + currentBet);
        }

        totalRaiseTo = Math.max(minRaise, Math.min(maxRaise, totalRaiseTo));

        // If raise is close to all-in (> 75% of stack), just go all-in
        if (totalRaiseTo > maxRaise * 0.75) {
            totalRaiseTo = maxRaise;
        }

        return totalRaiseTo;
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /**
     * GTO Balance Enforcement Layer.
     * Enforces theoretically sound frequencies:
     * - Minimum defense frequency (MDF) when facing bets
     * - Balanced value-to-bluff ratios when betting
     * - Proper check-raise frequencies
     * - Pot odds discipline
     */
    static applyGTOBalance(probs, situation) {
        let { fold, check, call, raise } = probs;
        const {
            facingBet, callAmount, pot, madeHandStrength, equity,
            phase, position, draws, boardTexture, spr, handReads,
            betToPotRatio, blockers
        } = situation;

        const gtoWeight = 1.0;

        if (facingBet && callAmount > 0) {
            // ── Minimum Defense Frequency ──
            // MDF = pot / (pot + bet): % of hands we must defend to prevent
            // opponent from profiting with pure bluffs
            const mdf = pot / (pot + callAmount);
            const currentDefenseFreq = call + raise;

            if (currentDefenseFreq < mdf) {
                const deficit = (mdf - currentDefenseFreq) * gtoWeight;

                // Only defend if we have some equity or draws to justify it
                if (equity > 0.18 || draws.outs >= 4 || madeHandStrength > 0.25) {
                    const adjustment = deficit * 0.55;
                    call += adjustment * 0.7;
                    raise += adjustment * 0.3;
                    fold -= adjustment;
                }
            }

            // ── Pot Odds Discipline ──
            // Pro/Expert should be more mathematically precise
            const effectiveOdds = draws.outs >= 4
                ? callAmount / (pot + callAmount + Math.min(situation.playerChips, pot * 1.5))
                : callAmount / (pot + callAmount);

            if (equity < effectiveOdds * 0.75 && madeHandStrength < 0.25 && draws.outs < 4) {
                // Clear -EV call: fold more, but keep some bluff-catching
                const foldBoost = (effectiveOdds - equity) * 0.7 * gtoWeight;
                fold += foldBoost;
                call -= foldBoost * 0.7;
                raise -= foldBoost * 0.3;
            } else if (equity > effectiveOdds * 1.4 && madeHandStrength > 0.35) {
                // Clear +EV: raise more for value
                const raiseBoost = (equity - effectiveOdds) * 0.25 * gtoWeight;
                raise += raiseBoost;
                call -= raiseBoost * 0.5;
                fold -= raiseBoost * 0.5;
            }

        } else if (!facingBet) {
            // ── Balanced Betting Frequency ──
            // Construct a polarized betting range: strong value hands + bluffs,
            // checking back medium-strength hands

            // Target betting frequency by street and position
            let targetBetFreq;
            if (phase === PHASES.FLOP) {
                targetBetFreq = position > 0.6 ? 0.52 : 0.38;
                if (handReads.weArePreflopAggressor) targetBetFreq += 0.10;
            } else if (phase === PHASES.TURN) {
                targetBetFreq = position > 0.6 ? 0.42 : 0.32;
            } else if (phase === PHASES.RIVER) {
                targetBetFreq = position > 0.6 ? 0.38 : 0.28;
            } else {
                targetBetFreq = 0.35;
            }

            // Nudge raise frequency toward target
            if (raise < targetBetFreq * 0.6 && madeHandStrength > 0.15) {
                const boost = (targetBetFreq - raise) * 0.25 * gtoWeight;
                raise += boost;
                check -= boost;
            }

            // ── Value-to-Bluff Ratio ──
            // On the river, optimal bluff frequency depends on bet sizing.
            // For pot-sized bet: bluffs should be ~33% of betting range (2:1 ratio)
            // For 2/3 pot: bluffs should be ~28% (5:2 ratio)
            // For 1/2 pot: bluffs should be ~25% (3:1 ratio)
            if (phase === PHASES.RIVER) {
                const avgBetSize = pot * 0.66; // approximate expected bet size
                const optimalBluffPct = avgBetSize / (pot + avgBetSize);

                if (madeHandStrength < 0.2 && draws.outs === 0) {
                    // This is a bluff candidate — cap at optimal frequency
                    const maxBluffRaise = optimalBluffPct * targetBetFreq;
                    if (raise > maxBluffRaise) {
                        const excess = (raise - maxBluffRaise) * gtoWeight;
                        raise -= excess;
                        check += excess;
                    }
                } else if (madeHandStrength >= 0.5) {
                    // Value hand — ensure we're betting enough
                    if (raise < targetBetFreq * 0.7) {
                        const boost = (targetBetFreq * 0.7 - raise) * 0.4 * gtoWeight;
                        raise += boost;
                        check -= boost;
                    }
                }
            }

            // ── Polarized range construction for flop/turn ──
            // Medium hands (showdown value) should check more
            if (phase !== PHASES.RIVER && madeHandStrength >= 0.25 && madeHandStrength < 0.5) {
                const checkBoost = 0.12 * gtoWeight;
                check += checkBoost;
                raise -= checkBoost;
            }
        }

        // ── Balanced Check-Raise Frequency ──
        // GTO check-raise: ~8-12% on flop, ~6-10% on turn, ~5-8% on river
        if (facingBet && position < 0.4) {
            let targetCRFreq;
            if (phase === PHASES.FLOP) {
                targetCRFreq = 0.10;
            } else if (phase === PHASES.TURN) {
                targetCRFreq = 0.08;
            } else {
                targetCRFreq = 0.06;
            }

            targetCRFreq *= gtoWeight;

            // Check-raise with value hands, strong draws, and hands with good blockers
            if (raise < targetCRFreq &&
                (madeHandStrength > 0.55 || draws.outs >= 8 || blockers.blockerStrength > 0.12)) {
                const boost = (targetCRFreq - raise) * 0.5;
                raise += boost;
                call -= boost * 0.5;
                fold -= boost * 0.5;
            }
        }

        // ── Board texture awareness for ranges ──
        // On very wet boards, widen defending range (many draws possible)
        if (facingBet && boardTexture.wetness > 0.6) {
            if (draws.outs >= 4) {
                const wetBoost = boardTexture.wetness * 0.08 * gtoWeight;
                call += wetBoost;
                fold -= wetBoost;
            }
        }
        // On very dry boards, can bluff more (fewer hands can call)
        if (!facingBet && boardTexture.wetness < 0.25 && madeHandStrength < 0.2) {
            const dryBluff = 0.08 * gtoWeight;
            raise += dryBluff;
            check -= dryBluff;
        }

        return this.normalize({ fold, check, call, raise });
    }

    /**
     * Per-street range narrowing: multiplicatively narrows the opponent's
     * likely hand range based on their action on each street.
     * Returns a max tier (1-7) where lower = tighter range.
     */
    static estimateOpponentRangePerStreet(handReads, phase, numActivePlayers) {
        // Start with a wide range (100% of hands = width 1.0)
        let rangeWidth = 1.0;

        // ── Preflop range narrowing ──
        if (handReads.opponentRaisedPreflop) {
            // A preflop raiser typically has top ~22% of hands
            rangeWidth *= 0.22;
            // Multiple raises (3-bet+) narrows further
            if (handReads.preflopRaiseCount >= 2) {
                rangeWidth *= 0.35; // ~8% of hands after 3-bet
            }
        } else if (handReads.opponentCalledPreflop) {
            // Caller has a wider but still defined range (~35-50%)
            rangeWidth *= 0.42;
        }

        // ── Flop range narrowing ──
        if (handReads.opponentBetFlop) {
            // Betting the flop narrows to ~60% of previous range
            rangeWidth *= 0.60;
        } else if (handReads.opponentCheckedFlop) {
            // Checking caps their range (removes strongest hands)
            // but widens what remains (medium/weak)
            rangeWidth *= 0.85;
        }

        // ── Turn range narrowing ──
        if (handReads.opponentBetTurn) {
            // Double-barreling significantly narrows
            rangeWidth *= 0.55;
        } else if (handReads.opponentCheckedTurn) {
            rangeWidth *= 0.80;
        }

        // ── River action ──
        if (handReads.opponentBetRiver) {
            // Triple-barreling: very narrow and strong
            rangeWidth *= 0.45;
        }

        // ── Multiple raises this street ──
        if (handReads.numRaisesThisStreet >= 2) {
            rangeWidth *= 0.30;
        }

        // Widen slightly in heads-up (players defend wider)
        if (numActivePlayers <= 2) {
            rangeWidth = Math.min(1.0, rangeWidth * 1.3);
        }

        // If opponent checked back, their range includes more weak hands
        if (handReads.opponentCheckedBack) {
            rangeWidth = Math.min(1.0, rangeWidth * 1.2);
        }

        // Convert width to tier: width 1.0 = tier 7, width ~0.02 = tier 1
        // Using logarithmic mapping for natural feel
        let tier;
        if (rangeWidth >= 0.70) tier = 7;
        else if (rangeWidth >= 0.45) tier = 6;
        else if (rangeWidth >= 0.25) tier = 5;
        else if (rangeWidth >= 0.14) tier = 4;
        else if (rangeWidth >= 0.07) tier = 3;
        else if (rangeWidth >= 0.03) tier = 2;
        else tier = 1;

        return tier;
    }

    /**
     * Dampen emotional state — Pro players don't tilt.
     */
    static dampenEmotion(emotion) {
        const dampenFactor = 0.2;
        return {
            tilt: emotion.tilt * dampenFactor,
            confidence: 0.5 + (emotion.confidence - 0.5) * dampenFactor,
            frustration: emotion.frustration * dampenFactor,
            boredom: emotion.boredom * dampenFactor
        };
    }

    // ── Multi-Street Planning ────────────────────────────────────────────────

    /**
     * Create a multi-street plan on the flop. The plan specifies a strategic
     * line across flop/turn/river (e.g., bet-bet-shove, check-raise, pot control).
     * The plan includes geometric bet sizes for value lines.
     */
    static createStreetPlan(situation, player) {
        const {
            madeHandStrength, equity, draws, boardTexture,
            position, spr, pot, handReads, numActivePlayers
        } = situation;

        const hasGoodDraw = draws.outs >= 8;
        const hasAnyDraw = draws.outs >= 4;
        const isMonster = madeHandStrength >= 0.75;
        const isStrong = madeHandStrength >= 0.55;
        const isMedium = madeHandStrength >= 0.3;
        const isWeak = madeHandStrength < 0.2;

        let plan = null;

        if (isMonster) {
            if (spr > 4 && boardTexture.wetness < 0.4 && position < 0.5) {
                // Dry board, out of position with monster: check-raise trap
                plan = {
                    type: 'check-raise-trap',
                    flop: 'check-raise',
                    turn: 'bet',
                    river: 'bet',
                    confidence: 0.7
                };
            } else {
                // Three-barrel for max value
                plan = {
                    type: 'three-barrel-value',
                    flop: 'bet',
                    turn: 'bet',
                    river: 'bet',
                    confidence: 0.8
                };
            }
        } else if (isStrong) {
            if (spr <= 4) {
                // Low SPR: get it in fast
                plan = {
                    type: 'three-barrel-value',
                    flop: 'bet',
                    turn: 'bet',
                    river: 'bet',
                    confidence: 0.75
                };
            } else {
                // Two barrels then re-evaluate
                plan = {
                    type: 'two-barrel-value',
                    flop: 'bet',
                    turn: 'bet',
                    river: 'check-or-bet',
                    confidence: 0.6
                };
            }
        } else if (hasGoodDraw) {
            // Semi-bluff aggression with good draw
            plan = {
                type: 'semi-bluff-aggro',
                flop: 'bet',
                turn: 'bet-if-improves',
                river: 'check-or-bet',
                confidence: 0.55
            };
        } else if (isMedium) {
            // Pot control: check back on some streets to get to showdown cheaply
            plan = {
                type: 'pot-control',
                flop: position > 0.6 ? 'bet' : 'check',
                turn: 'check',
                river: 'check-or-bet',
                confidence: 0.5
            };
        } else if (isWeak && handReads.weArePreflopAggressor) {
            // C-bet then give up unless board improves
            if (boardTexture.wetness < 0.5) {
                plan = {
                    type: 'cbet-give-up',
                    flop: 'bet',
                    turn: 'check',
                    river: 'check',
                    confidence: 0.45
                };
            } else {
                // Wet board: double barrel bluff occasionally
                plan = {
                    type: 'double-barrel-bluff',
                    flop: 'bet',
                    turn: 'bet',
                    river: 'check',
                    confidence: 0.35
                };
            }
        }

        // Calculate geometric bet sizes for the plan
        if (plan) {
            const streetsRemaining = 3; // flop, turn, river
            const effectiveStack = player.chips;
            plan.betSizes = this.calculateGeometricSizes(effectiveStack, pot, streetsRemaining);
        }

        return plan;
    }

    /**
     * Apply the multi-street plan to current action probabilities.
     * Nudges probabilities toward the planned action for the current street.
     */
    static applyStreetPlan(probs, plan, situation) {
        let { fold, check, call, raise } = probs;
        const { phase, facingBet, madeHandStrength, draws } = situation;

        if (!plan) return { fold, check, call, raise };

        // Determine the planned action for this street
        let plannedAction;
        if (phase === PHASES.FLOP) {
            plannedAction = plan.flop;
        } else if (phase === PHASES.TURN) {
            plannedAction = plan.turn;
        } else if (phase === PHASES.RIVER) {
            plannedAction = plan.river;
        } else {
            return { fold, check, call, raise };
        }

        // Handle conditional planned actions
        if (plannedAction === 'bet-if-improves') {
            // On turn: if draw hit or hand improved, bet; otherwise check
            if (madeHandStrength >= 0.55 || draws.outs === 0) {
                plannedAction = 'bet';
            } else {
                plannedAction = 'check';
            }
        }

        if (plannedAction === 'check-or-bet') {
            // River decision: bet strong, check medium
            if (madeHandStrength >= 0.5) {
                plannedAction = 'bet';
            } else {
                plannedAction = 'check';
            }
        }

        const confidence = plan.confidence;

        // Apply plan influence
        if (plannedAction === 'bet' && !facingBet) {
            const boost = confidence * 0.3;
            raise += boost;
            check -= boost;
        } else if (plannedAction === 'check' && !facingBet) {
            const boost = confidence * 0.25;
            check += boost;
            raise -= boost;
        } else if (plannedAction === 'check-raise' && facingBet) {
            const boost = confidence * 0.35;
            raise += boost;
            call -= boost * 0.5;
            fold -= boost * 0.5;
        } else if (plannedAction === 'check-raise' && !facingBet) {
            // Check first, hoping opponent bets
            const boost = confidence * 0.3;
            check += boost;
            raise -= boost;
        }

        return this.normalize({ fold, check, call, raise });
    }

    /**
     * Calculate geometric bet sizes across remaining streets.
     * The sizes are chosen so that if we bet every street, we commit
     * our entire effective stack by the river.
     * Formula: betFraction = ((1 + 2*S/P)^(1/N) - 1) / 2
     * where S = effective stack, P = pot, N = streets remaining.
     */
    static calculateGeometricSizes(effectiveStack, pot, streetsRemaining) {
        if (pot <= 0 || effectiveStack <= 0 || streetsRemaining <= 0) {
            return { flop: 0.66, turn: 0.66, river: 0.66 };
        }

        const spr = effectiveStack / pot;
        const betFraction = (Math.pow(1 + 2 * spr, 1 / streetsRemaining) - 1) / 2;

        // Clamp to reasonable range (25% to 150% pot)
        const clampedFraction = clamp(betFraction, 0.25, 1.5);

        // Each street uses the same fraction of the current pot
        return {
            flop: clampedFraction,
            turn: clampedFraction,
            river: clampedFraction
        };
    }

    static normalize(probs) {
        const total = Math.max(0.001,
            Math.max(0, probs.fold) +
            Math.max(0, probs.check) +
            Math.max(0, probs.call) +
            Math.max(0, probs.raise)
        );
        return {
            fold: Math.max(0, probs.fold) / total,
            check: Math.max(0, probs.check) / total,
            call: Math.max(0, probs.call) / total,
            raise: Math.max(0, probs.raise) / total
        };
    }
}
