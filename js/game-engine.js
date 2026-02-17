import { PHASES, ACTIONS, EventEmitter, delay } from './utils.js';
import { Deck } from './deck.js';
import { HandEvaluator } from './hand-evaluator.js';

export class GameEngine extends EventEmitter {
    constructor(players, config = {}) {
        super();
        this.players = players;
        this.config = {
            smallBlind: 10,
            bigBlind: 20,
            startingChips: 1000,
            aiThinkDelay: true,
            ...config
        };

        this.deck = new Deck();
        this.communityCards = [];
        this.pots = [];
        this.dealerIndex = -1; // will advance to 0 on first hand
        this.currentBetToMatch = 0;
        this.minRaise = this.config.bigBlind;
        this.lastRaiseAmount = this.config.bigBlind;
        this.phase = null;
        this.handNumber = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.handHistory = []; // actions this hand

        // Resolve function for awaiting human input
        this._humanActionResolve = null;
    }

    // ── Public API ─────────────────────────────────────────────────────────

    async startGame() {
        this.isRunning = true;
        this.emit('gameStart', { players: this.players, config: this.config });

        while (this.isRunning && this.getActivePlayers().length > 1) {
            await this.playHand();
            await delay(1500);
        }

        if (this.getActivePlayers().length === 1) {
            this.emit('gameOver', { winner: this.getActivePlayers()[0] });
        }
        this.isRunning = false;
    }

    stopGame() {
        this.isRunning = false;
    }

    // Called by UI when human makes a decision
    submitHumanAction(action, amount = 0) {
        if (this._humanActionResolve) {
            this._humanActionResolve({ action, amount });
            this._humanActionResolve = null;
        }
    }

    getGameState() {
        return {
            handNumber: this.handNumber,
            phase: this.phase,
            communityCards: [...this.communityCards],
            pot: this.getTotalPot(),
            pots: this.pots,
            currentBet: this.currentBetToMatch,
            minRaise: this.minRaise,
            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                chips: p.chips,
                currentBet: p.currentBet,
                totalBetThisHand: p.totalBetThisHand,
                hasFolded: p.hasFolded,
                isAllIn: p.isAllIn,
                isDealer: p.isDealer,
                isBigBlind: p.isBigBlind,
                isSmallBlind: p.isSmallBlind,
                seatIndex: p.seatIndex,
                isHuman: p.isHuman,
                isBusted: p.isBusted,
                holeCards: p.holeCards,
                persona: p.persona ? { name: p.persona.name, displayName: p.persona.displayName } : null
            })),
            dealerIndex: this.dealerIndex,
            actionHistory: [...this.handHistory]
        };
    }

    // ── Hand Flow ──────────────────────────────────────────────────────────

    async playHand() {
        this.handNumber++;
        this.resetForNewHand();
        this.advanceDealer();
        this.postBlinds();

        this.emit('handStart', {
            handNumber: this.handNumber,
            dealerIndex: this.dealerIndex,
            players: this.players
        });

        await delay(300);

        // Deal hole cards
        this.dealHoleCards();
        this.emit('holeCardsDealt', { players: this.players });

        await delay(500);

        // Pre-flop betting
        this.phase = PHASES.PRE_FLOP;
        this.emit('phaseChange', { phase: this.phase });
        const preFlopContinue = await this.runBettingRound(true);
        this.collectBets();

        if (!preFlopContinue || this.countActivePlayers() <= 1) {
            await this.resolveHand();
            return;
        }

        // Flop
        this.phase = PHASES.FLOP;
        this.dealCommunityCards(3);
        this.emit('phaseChange', { phase: this.phase });
        this.emit('communityCardsDealt', { phase: this.phase, cards: [...this.communityCards] });
        await delay(600);

        const flopContinue = await this.runBettingRound(false);
        this.collectBets();

        if (!flopContinue || this.countActivePlayers() <= 1) {
            await this.resolveHand();
            return;
        }

        // Turn
        this.phase = PHASES.TURN;
        this.dealCommunityCards(1);
        this.emit('phaseChange', { phase: this.phase });
        this.emit('communityCardsDealt', { phase: this.phase, cards: [...this.communityCards] });
        await delay(600);

        const turnContinue = await this.runBettingRound(false);
        this.collectBets();

        if (!turnContinue || this.countActivePlayers() <= 1) {
            await this.resolveHand();
            return;
        }

        // River
        this.phase = PHASES.RIVER;
        this.dealCommunityCards(1);
        this.emit('phaseChange', { phase: this.phase });
        this.emit('communityCardsDealt', { phase: this.phase, cards: [...this.communityCards] });
        await delay(600);

        await this.runBettingRound(false);
        this.collectBets();

        // Showdown
        await this.resolveHand();
    }

    resetForNewHand() {
        this.communityCards = [];
        this.pots = [];
        this.currentBetToMatch = 0;
        this.minRaise = this.config.bigBlind;
        this.lastRaiseAmount = this.config.bigBlind;
        this.phase = null;
        this.handHistory = [];
        this.deck.reset();
        this.deck.shuffle();

        for (const p of this.players) {
            if (!p.isBusted) p.resetForNewHand();
        }
    }

    advanceDealer() {
        const active = this.getNonBustedPlayers();
        if (active.length === 0) return;

        // Find next non-busted player after current dealer
        let idx = this.dealerIndex;
        do {
            idx = (idx + 1) % this.players.length;
        } while (this.players[idx].isBusted);

        this.dealerIndex = idx;
        this.players[idx].isDealer = true;
    }

    postBlinds() {
        const active = this.getNonBustedPlayers();
        if (active.length < 2) return;

        let sbIdx, bbIdx;

        if (active.length === 2) {
            // Heads-up: dealer is small blind
            sbIdx = this.dealerIndex;
            bbIdx = this.nextActivePlayer(sbIdx);
        } else {
            sbIdx = this.nextActivePlayer(this.dealerIndex);
            bbIdx = this.nextActivePlayer(sbIdx);
        }

        const sbPlayer = this.players[sbIdx];
        const bbPlayer = this.players[bbIdx];

        const sbAmount = sbPlayer.bet(Math.min(this.config.smallBlind, sbPlayer.chips));
        sbPlayer.isSmallBlind = true;

        const bbAmount = bbPlayer.bet(Math.min(this.config.bigBlind, bbPlayer.chips));
        bbPlayer.isBigBlind = true;

        this.currentBetToMatch = this.config.bigBlind;

        this.handHistory.push({ player: sbPlayer.name, action: 'small blind', amount: sbAmount, phase: 'blinds' });
        this.handHistory.push({ player: bbPlayer.name, action: 'big blind', amount: bbAmount, phase: 'blinds' });

        this.emit('blindsPosted', {
            smallBlind: { player: sbPlayer, amount: sbAmount },
            bigBlind: { player: bbPlayer, amount: bbAmount }
        });
    }

    dealHoleCards() {
        const active = this.getNonBustedPlayers();
        for (const p of active) {
            p.holeCards = this.deck.dealMultiple(2);
        }
    }

    dealCommunityCards(count) {
        // Burn a card
        this.deck.deal();
        for (let i = 0; i < count; i++) {
            this.communityCards.push(this.deck.deal());
        }
    }

    // ── Betting Round ──────────────────────────────────────────────────────

    async runBettingRound(isPreflop) {
        // Reset for new betting round
        for (const p of this.players) {
            if (!p.isBusted) p.resetForNewRound();
        }

        if (isPreflop) {
            // Pre-flop: carry over blind bets to currentBet tracking
            for (const p of this.players) {
                if (p.isSmallBlind) p.currentBet = Math.min(this.config.smallBlind, p.totalBetThisHand);
                if (p.isBigBlind) {
                    p.currentBet = Math.min(this.config.bigBlind, p.totalBetThisHand);
                    // BB hasn't "acted" yet
                    p.hasActedThisRound = false;
                }
            }
            this.currentBetToMatch = this.config.bigBlind;
        } else {
            this.currentBetToMatch = 0;
        }

        this.minRaise = this.config.bigBlind;
        this.lastRaiseAmount = this.config.bigBlind;

        // Determine start position
        let startIdx;
        if (isPreflop) {
            const active = this.getNonBustedPlayers();
            if (active.length === 2) {
                // Heads-up: dealer (SB) acts first preflop
                startIdx = this.dealerIndex;
            } else {
                // UTG: player after BB
                const bbIdx = this.players.findIndex(p => p.isBigBlind);
                startIdx = this.nextActivePlayer(bbIdx);
            }
        } else {
            // Post-flop: first active player after dealer
            startIdx = this.nextActivePlayer(this.dealerIndex);
        }

        let currentIdx = startIdx;
        let consecutiveChecksOrCalls = 0;
        let playersToAct = this.countPlayersWhoCanAct();

        // Safety counter to prevent infinite loops
        let maxIterations = this.players.length * 8;
        let iterations = 0;

        while (iterations < maxIterations) {
            iterations++;
            const player = this.players[currentIdx];

            // Skip players who can't act
            if (!player.canAct() || player.isBusted) {
                currentIdx = this.nextActivePlayer(currentIdx);
                // Check if round is over
                if (this.isBettingRoundOver(isPreflop)) break;
                continue;
            }

            // Check if betting round is done
            if (this.isBettingRoundOver(isPreflop) && player.hasActedThisRound) break;

            // Get valid actions for this player
            const validActions = this.getValidActions(player);

            let action;
            if (player.isHuman) {
                action = await this.getHumanAction(player, validActions);
            } else {
                action = await this.getAIAction(player, validActions);
            }

            // Process the action
            this.processAction(player, action);
            player.hasActedThisRound = true;

            this.emit('playerActed', {
                player,
                action: action.action,
                amount: action.amount,
                pot: this.getTotalPot()
            });

            // Update AI opponent models
            for (const p of this.players) {
                if (!p.isHuman && !p.isBusted && p.id !== player.id) {
                    p.updateOpponentModel(player.id, action.action, { isPreflop });
                }
            }

            await delay(200);

            // Check if only one player left
            if (this.countActivePlayers() <= 1) return false;

            // Move to next player
            currentIdx = this.nextActivePlayer(currentIdx);

            // Check if round is complete
            if (this.isBettingRoundOver(isPreflop)) break;
        }

        return this.countActivePlayers() > 1;
    }

    isBettingRoundOver(isPreflop) {
        const playersWhoCanAct = this.players.filter(p => p.canAct() && !p.isBusted);

        if (playersWhoCanAct.length === 0) return true;

        // All players who can act have acted AND all bets are matched
        const allActed = playersWhoCanAct.every(p => p.hasActedThisRound);
        const allBetsMatched = playersWhoCanAct.every(p =>
            p.currentBet === this.currentBetToMatch || p.isAllIn
        );

        return allActed && allBetsMatched;
    }

    getValidActions(player) {
        const actions = [];
        const callAmount = this.currentBetToMatch - player.currentBet;

        if (callAmount === 0) {
            actions.push({ type: ACTIONS.CHECK });
        } else {
            actions.push({ type: ACTIONS.FOLD });
            if (callAmount >= player.chips) {
                actions.push({ type: ACTIONS.ALL_IN, amount: player.chips });
            } else {
                actions.push({ type: ACTIONS.CALL, amount: callAmount });
            }
        }

        // Raise (if player has enough chips)
        const minRaiseTotal = this.currentBetToMatch + this.minRaise;
        const raiseAmount = minRaiseTotal - player.currentBet;

        if (raiseAmount > 0 && player.chips > callAmount) {
            if (player.chips <= raiseAmount) {
                // Can only go all-in
                if (!actions.find(a => a.type === ACTIONS.ALL_IN)) {
                    actions.push({ type: ACTIONS.ALL_IN, amount: player.chips });
                }
            } else {
                actions.push({
                    type: ACTIONS.RAISE,
                    minAmount: raiseAmount,
                    maxAmount: player.chips,
                    callAmount
                });
            }
        }

        // Always allow fold unless checking is an option
        if (callAmount > 0 && !actions.find(a => a.type === ACTIONS.FOLD)) {
            actions.unshift({ type: ACTIONS.FOLD });
        }

        return actions;
    }

    processAction(player, action) {
        const historyEntry = {
            player: player.name,
            playerId: player.id,
            action: action.action,
            amount: action.amount || 0,
            phase: this.phase,
            pot: this.getTotalPot()
        };

        switch (action.action) {
            case ACTIONS.FOLD:
                player.fold();
                break;

            case ACTIONS.CHECK:
                // Nothing to do
                break;

            case ACTIONS.CALL: {
                const callAmount = Math.min(
                    this.currentBetToMatch - player.currentBet,
                    player.chips
                );
                player.bet(callAmount);
                historyEntry.amount = callAmount;
                break;
            }

            case ACTIONS.RAISE: {
                const totalBet = action.amount;
                const additional = totalBet - player.currentBet;
                const raiseSize = totalBet - this.currentBetToMatch;

                player.bet(additional);
                this.lastRaiseAmount = raiseSize;
                this.minRaise = Math.max(this.config.bigBlind, raiseSize);
                this.currentBetToMatch = totalBet;
                historyEntry.amount = totalBet;

                // Everyone else needs to act again
                for (const p of this.players) {
                    if (p.id !== player.id && p.canAct()) {
                        p.hasActedThisRound = false;
                    }
                }
                break;
            }

            case ACTIONS.ALL_IN: {
                const allInAmount = player.chips;
                player.bet(allInAmount);
                const newTotal = player.currentBet;

                if (newTotal > this.currentBetToMatch) {
                    const raiseSize = newTotal - this.currentBetToMatch;
                    if (raiseSize >= this.minRaise) {
                        this.lastRaiseAmount = raiseSize;
                        this.minRaise = Math.max(this.config.bigBlind, raiseSize);
                    }
                    this.currentBetToMatch = newTotal;

                    for (const p of this.players) {
                        if (p.id !== player.id && p.canAct()) {
                            p.hasActedThisRound = false;
                        }
                    }
                }
                historyEntry.amount = allInAmount;
                break;
            }
        }

        this.handHistory.push(historyEntry);
    }

    // ── Human and AI Actions ───────────────────────────────────────────────

    async getHumanAction(player, validActions) {
        return new Promise(resolve => {
            this._humanActionResolve = resolve;
            this.emit('awaitingHumanAction', {
                player,
                validActions,
                callAmount: this.currentBetToMatch - player.currentBet,
                minRaise: this.currentBetToMatch + this.minRaise,
                maxRaise: player.currentBet + player.chips,
                pot: this.getTotalPot(),
                communityCards: [...this.communityCards]
            });
        });
    }

    async getAIAction(player, validActions) {
        // Think delay
        if (this.config.aiThinkDelay) {
            const thinkTime = this.getAIThinkTime(player, validActions);
            await delay(thinkTime);
        }

        // Dynamic import so this file works on the server without AI deps
        const { AIBrain } = await import('./ai-brain.js');

        const gameState = this.getGameState();
        gameState.validActions = validActions;
        gameState.callAmount = this.currentBetToMatch - player.currentBet;
        gameState.minRaiseTotal = this.currentBetToMatch + this.minRaise;
        gameState.maxRaiseTotal = player.currentBet + player.chips;
        gameState.bigBlind = this.config.bigBlind;

        return AIBrain.decideAction(player, gameState);
    }

    getAIThinkTime(player, validActions) {
        // More complex decisions take longer
        const hasRaiseOption = validActions.some(a => a.type === ACTIONS.RAISE);
        const callAmount = this.currentBetToMatch - player.currentBet;
        const potRatio = callAmount / Math.max(1, this.getTotalPot());

        let baseTime = 600;
        if (hasRaiseOption && potRatio > 0.3) baseTime = 1200;
        if (callAmount > player.chips * 0.3) baseTime = 1800;

        // Add randomness
        return baseTime + Math.random() * 800;
    }

    // ── Pot Management ─────────────────────────────────────────────────────

    collectBets() {
        // Collect all current bets into the pot
        const activePlayers = this.players.filter(p => !p.isBusted && !p.hasFolded);
        const allInPlayers = activePlayers.filter(p => p.isAllIn).sort((a, b) => a.totalBetThisHand - b.totalBetThisHand);

        if (allInPlayers.length === 0) {
            // Simple case: no all-ins, just one main pot
            let potAmount = 0;
            for (const p of this.players) {
                potAmount += p.currentBet;
                p.currentBet = 0;
            }
            if (this.pots.length === 0) {
                this.pots.push({ amount: 0, eligible: activePlayers.map(p => p.id) });
            }
            this.pots[this.pots.length - 1].amount += potAmount;
        } else {
            // Side pot calculation needed
            this.calculateSidePots();
        }
    }

    calculateSidePots() {
        // Rebuild pots from scratch using totalBetThisHand
        const allPlayers = this.players.filter(p => !p.isBusted && p.totalBetThisHand > 0);
        const activePlayers = this.players.filter(p => !p.isBusted && !p.hasFolded);

        // Sort by total bet (ascending) to find all-in thresholds
        const sortedBets = [...new Set(allPlayers.map(p => p.totalBetThisHand))].sort((a, b) => a - b);

        this.pots = [];
        let processedAmount = 0;

        for (const threshold of sortedBets) {
            const potAmount = allPlayers.reduce((sum, p) => {
                const contribution = Math.min(p.totalBetThisHand, threshold) - Math.min(p.totalBetThisHand, processedAmount);
                return sum + contribution;
            }, 0);

            if (potAmount > 0) {
                // Eligible: active players who bet at least this threshold
                const eligible = activePlayers
                    .filter(p => p.totalBetThisHand >= threshold)
                    .map(p => p.id);

                // Also include players who went all-in at this threshold
                const allInAtThreshold = activePlayers
                    .filter(p => p.totalBetThisHand === threshold && p.isAllIn)
                    .map(p => p.id);

                const allEligible = [...new Set([...eligible, ...allInAtThreshold])];

                this.pots.push({ amount: potAmount, eligible: allEligible });
            }
            processedAmount = threshold;
        }

        // Reset current bets
        for (const p of this.players) {
            p.currentBet = 0;
        }
    }

    getTotalPot() {
        let total = this.pots.reduce((sum, p) => sum + p.amount, 0);
        // Add current uncollected bets
        for (const p of this.players) {
            total += p.currentBet;
        }
        return total;
    }

    // ── Hand Resolution ────────────────────────────────────────────────────

    async resolveHand() {
        this.phase = PHASES.SHOWDOWN;

        const activePlayers = this.players.filter(p => !p.isBusted && !p.hasFolded);

        // Collect any remaining bets
        this.collectBets();

        if (activePlayers.length === 1) {
            // Everyone else folded
            const winner = activePlayers[0];
            const totalWon = this.pots.reduce((sum, p) => sum + p.amount, 0);
            winner.chips += totalWon;

            this.emit('handEnd', {
                winners: [{ player: winner, amount: totalWon, hand: null }],
                pots: this.pots,
                communityCards: [...this.communityCards],
                showdown: false,
                handHistory: this.handHistory
            });
        } else {
            // Deal remaining community cards if needed (all players all-in)
            while (this.communityCards.length < 5) {
                this.deck.deal(); // burn
                this.communityCards.push(this.deck.deal());
            }

            this.emit('communityCardsDealt', { phase: this.phase, cards: [...this.communityCards] });
            await delay(500);

            // Evaluate hands
            const evaluations = [];
            for (const p of activePlayers) {
                const hand = HandEvaluator.bestHandFromHole(p.holeCards, this.communityCards);
                evaluations.push({ player: p, hand });
            }

            // Distribute each pot to winners
            const allWinners = [];
            for (const pot of this.pots) {
                const eligible = evaluations.filter(e => pot.eligible.includes(e.player.id));
                if (eligible.length === 0) continue;

                // Find best hand among eligible
                eligible.sort((a, b) => HandEvaluator.compare(b.hand, a.hand));
                const bestScore = eligible[0].hand.score;
                const potWinners = eligible.filter(e => e.hand.score === bestScore);

                const share = Math.floor(pot.amount / potWinners.length);
                let remainder = pot.amount - share * potWinners.length;

                for (const w of potWinners) {
                    const winAmount = share + (remainder > 0 ? 1 : 0);
                    remainder = Math.max(0, remainder - 1);
                    w.player.chips += winAmount;
                    allWinners.push({
                        player: w.player,
                        amount: winAmount,
                        hand: w.hand
                    });
                }
            }

            // Consolidate winners (a player can win multiple pots)
            const consolidated = {};
            for (const w of allWinners) {
                if (consolidated[w.player.id]) {
                    consolidated[w.player.id].amount += w.amount;
                } else {
                    consolidated[w.player.id] = { ...w };
                }
            }

            this.emit('handEnd', {
                winners: Object.values(consolidated),
                allHands: evaluations.map(e => ({ player: e.player, hand: e.hand })),
                pots: this.pots,
                communityCards: [...this.communityCards],
                showdown: true,
                handHistory: this.handHistory
            });
        }

        // Update AI emotional states
        await delay(300);
        this.updateAIStates(activePlayers);

        // Eliminate busted players
        for (const p of this.players) {
            if (p.chips <= 0 && !p.isBusted) {
                p.isBusted = true;
                this.emit('playerEliminated', { player: p });
            }
        }
    }

    updateAIStates(activePlayers) {
        const bigPotThreshold = this.config.bigBlind * 10;
        const wasShowdown = activePlayers.length > 1;

        // Detect if the winner(s) had weak hands (bluffed)
        let winnerHadWeakHand = false;
        if (!wasShowdown && activePlayers.length === 1) {
            // Everyone folded to one player — could be a bluff
            // We can't see their cards, but if they bet a lot, it felt like a bluff
            const winner = activePlayers[0];
            if (winner.totalBetThisHand > bigPotThreshold) {
                winnerHadWeakHand = true; // assume possible bluff for emotional impact
            }
        }

        for (const p of this.players) {
            if (p.isHuman || p.isBusted) continue;

            const wasInHand = !p.hasFolded && !p.isBusted;
            const didFold = p.hasFolded;

            const result = {
                lostBigPot: didFold && p.totalBetThisHand > bigPotThreshold,
                wonBigPot: wasInHand && activePlayers.some(a => a.id === p.id) && p.totalBetThisHand > bigPotThreshold,
                gotBluffed: didFold && p.totalBetThisHand > bigPotThreshold && winnerHadWeakHand,
                foldedPreflop: p.hasFolded && p.totalBetThisHand <= this.config.bigBlind
            };

            p.updateEmotionalState(result);
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    getActivePlayers() {
        return this.players.filter(p => !p.isBusted);
    }

    getNonBustedPlayers() {
        return this.players.filter(p => !p.isBusted);
    }

    countActivePlayers() {
        return this.players.filter(p => !p.isBusted && !p.hasFolded).length;
    }

    countPlayersWhoCanAct() {
        return this.players.filter(p => p.canAct() && !p.isBusted).length;
    }

    nextActivePlayer(fromIndex) {
        let idx = fromIndex;
        do {
            idx = (idx + 1) % this.players.length;
        } while (this.players[idx].isBusted && idx !== fromIndex);
        return idx;
    }
}
