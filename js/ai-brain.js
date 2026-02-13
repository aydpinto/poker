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
        probs = this.applyEmotionalState(probs, player.emotionalState, situation);
        probs = this.applyOpponentReads(probs, player.opponentModels, gameState);
        probs = this.applyDifficultyNoise(probs, player.difficulty);
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

        // Hand strength
        let handStrength;
        let handTier = 7;
        if (isPreflop) {
            handTier = getStartingHandTier(holeCards[0], holeCards[1]);
            handStrength = HandEvaluator.quickHandStrength(holeCards, []);
        } else {
            handStrength = HandEvaluator.quickHandStrength(holeCards, communityCards);
            // Quick equity estimate (fewer sims for speed)
            const equity = HandEvaluator.estimateEquity(holeCards, communityCards, numActivePlayers - 1, 200);
            handStrength = (handStrength + equity) / 2;
        }

        // Position (0 = early, 0.5 = middle, 1 = late/dealer)
        const dealerIdx = gameState.dealerIndex;
        const activePlayers = gameState.players.filter(p => !p.isBusted);
        const myPos = activePlayers.findIndex(p => p.id === player.id);
        const position = activePlayers.length > 1 ? myPos / (activePlayers.length - 1) : 0.5;

        // Pot odds
        const potOdds = callAmount > 0 ? callAmount / (pot + callAmount) : 0;

        // Stack to pot ratio
        const spr = pot > 0 ? player.chips / pot : 20;

        // Has someone raised?
        const facingRaise = callAmount > bigBlind && isPreflop;
        const facingBet = callAmount > 0;

        // How many players still to act after us
        const playersLeftToAct = activePlayers.filter(p =>
            !p.hasFolded && !p.isAllIn && p.id !== player.id
        ).length;

        return {
            handStrength,
            handTier,
            isPreflop,
            position,
            potOdds,
            spr,
            pot,
            callAmount,
            bigBlind,
            numActivePlayers,
            facingRaise,
            facingBet,
            playersLeftToAct,
            phase: gameState.phase,
            playerChips: player.chips,
            communityCards
        };
    }

    // ── Layer 2: Base Strategy ─────────────────────────────────────────────

    static getBaseStrategy(situation) {
        const { handStrength, isPreflop, potOdds, facingBet, callAmount, pot } = situation;

        let fold = 0, check = 0, call = 0, raise = 0;

        if (isPreflop) {
            return this.getPreflopBaseStrategy(situation);
        }

        // Post-flop base strategy
        if (!facingBet) {
            // No bet to face: can check or bet
            check = 1 - handStrength;
            raise = handStrength;
            fold = 0;
            call = 0;
        } else {
            // Facing a bet
            if (handStrength > potOdds + 0.1) {
                // Profitable call or raise
                call = 0.4;
                raise = handStrength - 0.3;
                fold = 0.1;
            } else if (handStrength > potOdds) {
                // Marginal
                call = 0.5;
                raise = 0.1;
                fold = 0.3;
            } else {
                // Weak hand
                fold = 0.6;
                call = 0.2;
                raise = 0.05; // bluff opportunity
            }
        }

        return this.normalize({ fold, check, call, raise });
    }

    static getPreflopBaseStrategy(situation) {
        const { handTier, position, facingRaise, callAmount, bigBlind } = situation;
        let fold = 0, check = 0, call = 0, raise = 0;

        // Tighter ranges in early position, looser in late
        const positionBonus = position * 1.5; // 0 to 1.5 extra tiers of looseness

        const effectiveTier = handTier - positionBonus;

        if (effectiveTier <= 1) {
            // Premium hands
            raise = 0.8;
            call = 0.15;
            fold = 0;
            check = 0.05;
        } else if (effectiveTier <= 2) {
            raise = 0.6;
            call = 0.3;
            fold = 0.05;
            check = 0.05;
        } else if (effectiveTier <= 3) {
            raise = 0.35;
            call = 0.4;
            fold = 0.15;
            check = 0.1;
        } else if (effectiveTier <= 4) {
            raise = 0.15;
            call = 0.35;
            fold = 0.35;
            check = 0.15;
        } else if (effectiveTier <= 5) {
            raise = 0.05;
            call = 0.2;
            fold = 0.6;
            check = 0.15;
        } else {
            raise = 0.02;
            call = 0.08;
            fold = 0.8;
            check = 0.1;
        }

        // If facing a raise, tighten up
        if (facingRaise) {
            const raiseMultiple = callAmount / bigBlind;
            const tightenFactor = Math.min(0.4, raiseMultiple * 0.05);
            fold += tightenFactor;
            call -= tightenFactor * 0.5;
            raise -= tightenFactor * 0.5;
        }

        return this.normalize({ fold, check, call, raise });
    }

    // ── Layer 3: Persona Modifier ──────────────────────────────────────────

    static applyPersona(probs, persona, situation) {
        let { fold, check, call, raise } = probs;
        const { isPreflop, handStrength, facingBet, position } = situation;

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

        // Bluffing tendency (when hand is weak)
        if (handStrength < 0.3 && facingBet) {
            const bluffBoost = persona.bluffFrequency * 0.3;
            raise += bluffBoost;
            fold -= bluffBoost;
        }

        // Slow-play tendency (when hand is strong)
        if (handStrength > 0.75 && !facingBet) {
            const slowPlay = persona.slowplayFrequency * 0.4;
            check += slowPlay;
            raise -= slowPlay;
        }

        // Position awareness
        if (position > 0.7) {
            // Late position: play more aggressively
            const posBoost = persona.positionAwareness * 0.15;
            raise += posBoost;
            fold -= posBoost * 0.5;
            call -= posBoost * 0.5;
        } else if (position < 0.3) {
            // Early position: play tighter
            const posTight = persona.positionAwareness * 0.1;
            fold += posTight;
            raise -= posTight;
        }

        // Continuation bet tendency
        if (!isPreflop && !facingBet && situation.phase === PHASES.FLOP) {
            const cBetBoost = (persona.cBetFrequency - 0.5) * 0.3;
            raise += cBetBoost;
            check -= cBetBoost;
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

    static applyOpponentReads(probs, opponentModels, gameState) {
        let { fold, check, call, raise } = probs;

        // Find the most relevant opponent (the one who bet / is most aggressive)
        const activePlayers = gameState.players.filter(p => !p.hasFolded && !p.isBusted && !p.isHuman);

        if (Object.keys(opponentModels).length === 0) return { fold, check, call, raise };

        // Average opponent tendencies
        let avgAggression = 0.5;
        let avgFoldToBet = 0.5;
        let count = 0;

        for (const model of Object.values(opponentModels)) {
            if (model.totalActions > 3) {
                avgAggression += model.aggression;
                avgFoldToBet += model.foldToBet;
                count++;
            }
        }

        if (count > 0) {
            avgAggression /= count;
            avgFoldToBet /= count;
        }

        // Against aggressive opponents: call/trap more
        if (avgAggression > 0.6) {
            call += 0.1;
            raise -= 0.05;
        }

        // Against passive opponents: bluff more
        if (avgAggression < 0.3) {
            raise += 0.1;
            call -= 0.05;
        }

        // Against players who fold a lot: bluff more
        if (avgFoldToBet > 0.6) {
            raise += 0.12;
            fold -= 0.05;
        }

        // Against calling stations: value bet more, bluff less
        if (avgFoldToBet < 0.3) {
            if (probs.raise > 0 && gameState.callAmount > 0) {
                // If we were going to bluff, reconsider
                fold += 0.1;
                raise -= 0.1;
            }
        }

        return this.normalize({ fold, check, call, raise });
    }

    // ── Layer 6: Difficulty Noise ──────────────────────────────────────────

    static applyDifficultyNoise(probs, difficulty) {
        // difficulty 1 = lots of noise (bad play), difficulty 5 = minimal noise (strong play)
        const noiseFactor = 0.55 * Math.pow((5 - difficulty) / 4, 1.3);

        if (noiseFactor <= 0.01) return probs;

        const uniform = { fold: 0.25, check: 0.25, call: 0.25, raise: 0.25 };

        return {
            fold: probs.fold * (1 - noiseFactor) + uniform.fold * noiseFactor,
            check: probs.check * (1 - noiseFactor) + uniform.check * noiseFactor,
            call: probs.call * (1 - noiseFactor) + uniform.call * noiseFactor,
            raise: probs.raise * (1 - noiseFactor) + uniform.raise * noiseFactor
        };
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
        const { pot, bigBlind, handStrength, isPreflop } = situation;
        const minRaise = gameState.minRaiseTotal;
        const maxRaise = gameState.maxRaiseTotal;

        if (minRaise >= maxRaise) return maxRaise; // all-in is only option

        let targetSize;

        if (isPreflop) {
            // Open raise size
            targetSize = bigBlind * persona.typicalRaiseSizeBB;
            // Add some variability
            targetSize *= randomFloat(0.85, 1.15);
        } else {
            // Post-flop sizing based on persona style
            switch (persona.sizingStyle) {
                case 'precise':
                    // Sizes based on hand strength
                    if (handStrength > 0.7) {
                        targetSize = pot * randomFloat(0.6, 0.8); // value bet
                    } else if (handStrength < 0.3) {
                        targetSize = pot * randomFloat(0.5, 0.7); // bluff sizing
                    } else {
                        targetSize = pot * randomFloat(0.4, 0.6); // medium
                    }
                    break;

                case 'polarized':
                    // Big or small, no in-between
                    if (handStrength > 0.7 || handStrength < 0.25) {
                        targetSize = pot * randomFloat(0.8, 1.2);
                    } else {
                        targetSize = pot * randomFloat(0.3, 0.4);
                    }
                    break;

                case 'random':
                    targetSize = pot * randomFloat(0.3, 1.5);
                    break;

                case 'pot':
                    targetSize = pot * randomFloat(0.65, 1.0);
                    break;

                case 'overbet':
                    targetSize = pot * randomFloat(1.0, 2.0);
                    break;

                default:
                    targetSize = pot * randomFloat(0.5, 0.8);
            }
        }

        // Apply tilt sizing boost
        if (player.emotionalState.tilt > 0.3) {
            targetSize *= 1 + player.emotionalState.tilt * 0.5;
        }

        // For post-flop bets, targetSize is a bet SIZE (additional chips) -- convert to total
        // For preflop, targetSize is already a total raise-to amount
        let totalRaiseTo;
        if (isPreflop) {
            totalRaiseTo = Math.round(targetSize);
        } else {
            // Post-flop: pot-relative size is the desired bet size (additional chips)
            // Total bet = currentBetToMatch + bet size (or just bet size if opening)
            const currentBet = player.currentBet || 0;
            totalRaiseTo = Math.round(targetSize + currentBet);
        }

        totalRaiseTo = Math.max(minRaise, Math.min(maxRaise, totalRaiseTo));

        // If raise is close to all-in (> 80% of stack), just go all-in
        if (totalRaiseTo > maxRaise * 0.8) {
            totalRaiseTo = maxRaise;
        }

        return totalRaiseTo;
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

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
