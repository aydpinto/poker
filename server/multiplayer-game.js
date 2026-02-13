import { GameEngine } from '../js/game-engine.js';
import { MultiplayerPlayer } from '../js/player.js';
import { ACTIONS } from '../js/utils.js';

export class MultiplayerGame {
    constructor(room, io) {
        this.room = room;
        this.io = io;
        this.pendingActions = new Map(); // socketId -> { resolve, validActions, player }
        this.actionTimers = {};
        this.disconnectedPlayers = new Set(); // socketIds

        // Create player objects from room data
        const players = room.players.map(p =>
            new MultiplayerPlayer(p.name, room.config.startingChips, p.seatIndex, p.socketId)
        );

        // Create engine
        this.engine = new GameEngine(players, {
            smallBlind: room.config.smallBlind,
            bigBlind: room.config.bigBlind,
            startingChips: room.config.startingChips,
            aiThinkDelay: false
        });

        // Override getHumanAction to use sockets
        this.engine.getHumanAction = (player, validActions) => {
            return this.getRemoteAction(player, validActions);
        };

        this.bindEngineEvents();
    }

    async start() {
        try {
            await this.runGame();
        } catch (err) {
            console.error(`Game error in room ${this.room.code}:`, err);
            this.io.to(this.room.code).emit('roomError', { message: 'Game error occurred' });
        }
    }

    async runGame() {
        this.engine.isRunning = true;

        while (this.engine.isRunning && this.engine.getActivePlayers().length > 1) {
            await this.engine.playHand();

            // Pause between hands
            await new Promise(r => setTimeout(r, 3000));

            // Check game still valid
            if (this.engine.getActivePlayers().length <= 1) break;

            this.io.to(this.room.code).emit('nextHand');
        }

        if (this.engine.getActivePlayers().length === 1) {
            const winner = this.engine.getActivePlayers()[0];
            this.io.to(this.room.code).emit('gameOver', {
                winnerName: winner.name,
                winnerSeatIndex: winner.seatIndex
            });
        }

        this.room.state = 'finished';
    }

    // ── Remote Action Handling ───────────────────────────────────────────

    getRemoteAction(player, validActions) {
        return new Promise((resolve) => {
            // If player is disconnected, auto-fold/check
            if (this.disconnectedPlayers.has(player.socketId)) {
                const hasCheck = validActions.some(a => a.type === ACTIONS.CHECK);
                resolve({ action: hasCheck ? ACTIONS.CHECK : ACTIONS.FOLD, amount: 0 });
                return;
            }

            // Store the resolver
            this.pendingActions.set(player.socketId, { resolve, validActions, player });

            // Notify the specific player it's their turn
            this.io.to(player.socketId).emit('awaitingAction', {
                validActions: validActions.map(a => ({
                    type: a.type,
                    amount: a.amount,
                    minAmount: a.minAmount,
                    maxAmount: a.maxAmount
                })),
                callAmount: this.engine.currentBetToMatch - player.currentBet,
                minRaise: this.engine.currentBetToMatch + this.engine.minRaise,
                maxRaise: player.currentBet + player.chips,
                pot: this.engine.getTotalPot(),
                timeLimit: 30000
            });

            // Notify everyone who's turn it is
            this.io.to(this.room.code).emit('playerTurn', {
                seatIndex: player.seatIndex,
                playerName: player.name
            });

            // Start timeout
            this.startActionTimer(player.socketId, resolve, validActions);
        });
    }

    handleAction(socketId, data) {
        const pending = this.pendingActions.get(socketId);
        if (!pending) return; // Not this player's turn

        const { action, amount } = data;

        // Validate action
        if (!this.validateAction(pending.validActions, action, amount)) {
            this.io.to(socketId).emit('invalidAction', { message: 'Invalid action' });
            return;
        }

        this.clearActionTimer(socketId);
        this.pendingActions.delete(socketId);
        pending.resolve({ action, amount: amount || 0 });
    }

    validateAction(validActions, action, amount) {
        const validTypes = validActions.map(a => a.type);
        if (!validTypes.includes(action)) return false;

        if (action === ACTIONS.RAISE) {
            const raiseAction = validActions.find(a => a.type === ACTIONS.RAISE);
            if (!raiseAction) return false;
            if (amount < raiseAction.minAmount || amount > raiseAction.maxAmount) return false;
        }

        return true;
    }

    // ── Action Timer ────────────────────────────────────────────────────

    startActionTimer(socketId, resolve, validActions) {
        this.actionTimers[socketId] = setTimeout(() => {
            if (!this.pendingActions.has(socketId)) return;

            this.pendingActions.delete(socketId);
            const hasCheck = validActions.some(a => a.type === ACTIONS.CHECK);

            resolve({
                action: hasCheck ? ACTIONS.CHECK : ACTIONS.FOLD,
                amount: 0
            });

            // Notify everyone about the timeout
            const player = this.engine.players.find(p => p.socketId === socketId);
            if (player) {
                this.io.to(this.room.code).emit('actionTimeout', {
                    seatIndex: player.seatIndex
                });
            }
        }, 30000);
    }

    clearActionTimer(socketId) {
        if (this.actionTimers[socketId]) {
            clearTimeout(this.actionTimers[socketId]);
            delete this.actionTimers[socketId];
        }
    }

    // ── Disconnect Handling ─────────────────────────────────────────────

    handleDisconnect(socketId) {
        this.disconnectedPlayers.add(socketId);

        // If they have a pending action, auto-fold/check
        const pending = this.pendingActions.get(socketId);
        if (pending) {
            this.clearActionTimer(socketId);
            this.pendingActions.delete(socketId);
            const hasCheck = pending.validActions.some(a => a.type === ACTIONS.CHECK);
            pending.resolve({
                action: hasCheck ? ACTIONS.CHECK : ACTIONS.FOLD,
                amount: 0
            });
        }
    }

    handleReconnect(oldSocketId, newSocketId) {
        this.disconnectedPlayers.delete(oldSocketId);

        // Update the player's socketId
        const player = this.engine.players.find(p => p.socketId === oldSocketId);
        if (player) {
            player.socketId = newSocketId;
        }
    }

    // ── Engine Event Broadcasting ───────────────────────────────────────

    bindEngineEvents() {
        this.engine.on('handStart', (data) => {
            this.io.to(this.room.code).emit('handStart', {
                handNumber: data.handNumber,
                players: data.players.map(p => ({
                    seatIndex: p.seatIndex,
                    name: p.name,
                    chips: p.chips,
                    isDealer: p.isDealer,
                    isSmallBlind: p.isSmallBlind,
                    isBigBlind: p.isBigBlind,
                    isBusted: p.isBusted
                }))
            });
        });

        this.engine.on('blindsPosted', (data) => {
            this.io.to(this.room.code).emit('blindsPosted', {
                smallBlind: {
                    seatIndex: data.smallBlind.player.seatIndex,
                    amount: data.smallBlind.amount
                },
                bigBlind: {
                    seatIndex: data.bigBlind.player.seatIndex,
                    amount: data.bigBlind.amount
                },
                pot: this.engine.getTotalPot(),
                playerChips: this.engine.players.filter(p => !p.isBusted).map(p => ({
                    seatIndex: p.seatIndex,
                    chips: p.chips
                }))
            });
        });

        // CRITICAL: Send hole cards only to the player who owns them
        this.engine.on('holeCardsDealt', (data) => {
            for (const player of data.players) {
                if (player.isBusted) continue;

                this.io.to(player.socketId).emit('holeCardsDealt', {
                    yourCards: player.holeCards.map(c => ({
                        rank: c.rank,
                        suit: c.suit
                    })),
                    players: data.players.filter(p => !p.isBusted).map(p => ({
                        seatIndex: p.seatIndex,
                        hasCards: p.holeCards.length > 0
                    }))
                });
            }
        });

        this.engine.on('phaseChange', (data) => {
            this.io.to(this.room.code).emit('phaseChange', { phase: data.phase });
        });

        this.engine.on('communityCardsDealt', (data) => {
            this.io.to(this.room.code).emit('communityCardsDealt', {
                phase: data.phase,
                cards: data.cards.map(c => ({ rank: c.rank, suit: c.suit }))
            });
        });

        this.engine.on('playerActed', (data) => {
            this.io.to(this.room.code).emit('playerActed', {
                seatIndex: data.player.seatIndex,
                playerName: data.player.name,
                action: data.action,
                amount: data.amount,
                pot: data.pot,
                playerChips: data.player.chips,
                playerCurrentBet: data.player.currentBet,
                hasFolded: data.player.hasFolded,
                isAllIn: data.player.isAllIn
            });
        });

        this.engine.on('handEnd', (data) => {
            const payload = {
                winners: data.winners.map(w => ({
                    seatIndex: w.player.seatIndex,
                    playerName: w.player.name,
                    amount: w.amount,
                    handName: w.hand ? w.hand.name : null
                })),
                communityCards: data.communityCards.map(c => ({ rank: c.rank, suit: c.suit })),
                showdown: data.showdown,
                pots: data.pots,
                // Updated chip counts for all players
                playerChips: this.engine.players.map(p => ({
                    seatIndex: p.seatIndex,
                    chips: p.chips
                }))
            };

            // At showdown, reveal all hands
            if (data.showdown && data.allHands) {
                payload.allHands = data.allHands.map(h => ({
                    seatIndex: h.player.seatIndex,
                    playerName: h.player.name,
                    cards: h.player.holeCards.map(c => ({ rank: c.rank, suit: c.suit })),
                    handName: h.hand.name
                }));
            }

            this.io.to(this.room.code).emit('handEnd', payload);
        });

        this.engine.on('playerEliminated', (data) => {
            this.io.to(this.room.code).emit('playerEliminated', {
                seatIndex: data.player.seatIndex,
                playerName: data.player.name
            });
        });
    }
}
