import { SUIT_SYMBOLS, RANK_NAMES, STARTING_HAND_TIERS, getStartingHandTier, formatChips, delay } from './utils.js';
import { HandEvaluator } from './hand-evaluator.js';

export class UIRenderer {
    constructor() {
        this.engine = null;
        this.humanPlayer = null;
        this.currentAction = null;
        this.raiseMin = 0;
        this.raiseMax = 0;
        this.currentRaiseValue = 0;
        this.pot = 0;
        this.quipTimeouts = {};

        // Multiplayer state
        this.isMultiplayer = false;
        this.socketClient = null;
        this.localSeatIndex = -1;
        this.playersState = [];
        this.localHoleCards = [];
        this.communityCards = [];
        this.actionTimer = null;
        this.actionTimerInterval = null;

        // Training aids state
        this.trainingAids = {
            odds: true,
            coach: false,
            position: true,
            handChart: false
        };
        this._lastActionData = null;
    }

    init(engine, humanPlayer) {
        this.engine = engine;
        this.humanPlayer = humanPlayer;
        this.isMultiplayer = false;
        this.bindEngineEvents();
        this.bindControls();
    }

    // ── Card Hydration (for multiplayer socket data) ────────────────────

    hydrateCard(card) {
        return {
            rank: card.rank,
            suit: card.suit,
            rankName: RANK_NAMES[card.rank] || String(card.rank),
            suitSymbol: SUIT_SYMBOLS[card.suit] || card.suit,
            color: (card.suit === 'hearts' || card.suit === 'diamonds') ? 'red' : 'black'
        };
    }

    // ── Multiplayer Init ─────────────────────────────────────────────────

    initMultiplayer(socketClient, localSeatIndex, players, config) {
        this.isMultiplayer = true;
        this.socketClient = socketClient;
        this.localSeatIndex = localSeatIndex;
        this.engine = null;
        this.humanPlayer = null;
        this.playersState = players;
        this.localHoleCards = [];
        this.communityCards = [];

        // Disable training aids in multiplayer
        this.trainingAids = { odds: false, coach: false, position: false, handChart: false };

        // Hide training panel
        const trainingPanel = document.getElementById('training-aids-panel');
        if (trainingPanel) trainingPanel.classList.add('hidden');

        this.bindControls();
        this.bindMultiplayerEvents();
        this.showScreen('game-screen');
    }

    bindMultiplayerEvents() {
        const sc = this.socketClient;

        sc.on('handStart', (data) => {
            this.playersState = data.players;
            document.getElementById('hand-number-display').textContent = `Hand #${data.handNumber}`;

            // Clear community cards
            this.communityCards = [];
            for (let i = 0; i < 5; i++) {
                document.getElementById(`cc-${i}`).innerHTML = '';
            }

            this.updatePot(0);
            document.getElementById('game-message').classList.add('hidden');
            document.getElementById('continue-controls').classList.add('hidden');

            this.renderAllSeatsMultiplayer(data.players);
        });

        sc.on('blindsPosted', (data) => {
            this.updatePot(data.pot);
            // Update player states with blind bets and chips
            if (data.playerChips) {
                for (const pc of data.playerChips) {
                    const p = this.playersState.find(pl => pl.seatIndex === pc.seatIndex);
                    if (p) p.chips = pc.chips;
                }
            }
            for (const p of this.playersState) {
                if (p.seatIndex === data.smallBlind.seatIndex) p.currentBet = data.smallBlind.amount;
                if (p.seatIndex === data.bigBlind.seatIndex) p.currentBet = data.bigBlind.amount;
            }
            this.renderAllSeatsMultiplayer(this.playersState);
        });

        sc.on('holeCardsDealt', (data) => {
            this.localHoleCards = data.yourCards.map(c => this.hydrateCard(c));
            // Render cards for all players
            for (const p of data.players) {
                const container = document.getElementById(`cards-${p.seatIndex}`);
                if (!container) continue;
                container.innerHTML = '';

                if (p.seatIndex === this.localSeatIndex) {
                    // Show our cards face-up
                    for (const card of this.localHoleCards) {
                        const cardEl = this.createCardElement(card, false, true);
                        cardEl.classList.add('dealing');
                        container.appendChild(cardEl);
                    }
                } else if (p.hasCards) {
                    // Show face-down cards for opponents
                    for (let i = 0; i < 2; i++) {
                        const cardEl = this.createCardElement({}, true, true);
                        cardEl.classList.add('dealing');
                        container.appendChild(cardEl);
                    }
                }
            }

            // Update hand strength for local player
            this.updateHandStrengthMultiplayer();
        });

        sc.on('communityCardsDealt', (data) => {
            this.communityCards = data.cards.map(c => this.hydrateCard(c));
            this.renderCommunityCards(this.communityCards);
            this.updateHandStrengthMultiplayer();
            // Reset bet displays after pot collection
            for (const p of this.playersState) p.currentBet = 0;
            this.renderAllSeatsMultiplayer(this.playersState);
        });

        sc.on('phaseChange', () => {
            document.querySelectorAll('.player-action-indicator').forEach(el => {
                el.classList.remove('visible');
            });
        });

        sc.on('playerTurn', (data) => {
            // Remove previous turn highlights
            document.querySelectorAll('.player-seat').forEach(el => el.classList.remove('current-turn'));
            const seatEl = document.getElementById(`seat-${data.seatIndex}`);
            if (seatEl) seatEl.classList.add('current-turn');
        });

        sc.on('awaitingAction', (data) => {
            this.showControlsMultiplayer(data);
            this.startActionCountdown(data.timeLimit || 30000);
        });

        sc.on('playerActed', (data) => {
            this.updatePot(data.pot);

            // Update player state
            const ps = this.playersState.find(p => p.seatIndex === data.seatIndex);
            if (ps) {
                ps.chips = data.playerChips;
                ps.currentBet = data.playerCurrentBet;
                ps.hasFolded = data.hasFolded;
                ps.isAllIn = data.isAllIn;
            }
            this.renderSeatMultiplayer(ps || { seatIndex: data.seatIndex, name: data.playerName, chips: data.playerChips ?? 0 });

            // Show action indicator
            const el = document.getElementById(`action-${data.seatIndex}`);
            if (el) {
                let label = data.action.toUpperCase();
                if ((data.action === 'raise' || data.action === 'call') && data.amount > 0) {
                    label += ` ${formatChips(data.amount)}`;
                }
                el.textContent = label;
                el.className = `player-action-indicator action-${data.action.replace('-', '')} visible`;
                setTimeout(() => el.classList.remove('visible'), 2000);
            }

            // Remove turn highlight
            const seatEl = document.getElementById(`seat-${data.seatIndex}`);
            if (seatEl) seatEl.classList.remove('current-turn');
        });

        sc.on('handEnd', (data) => {
            // Update chip counts
            if (data.playerChips) {
                for (const pc of data.playerChips) {
                    const ps = this.playersState.find(p => p.seatIndex === pc.seatIndex);
                    if (ps) ps.chips = pc.chips;
                }
            }

            // Reveal hands at showdown
            if (data.showdown && data.allHands) {
                for (const h of data.allHands) {
                    const container = document.getElementById(`cards-${h.seatIndex}`);
                    if (!container) continue;
                    container.innerHTML = '';
                    for (const card of h.cards) {
                        const cardEl = this.createCardElement(this.hydrateCard(card), false, true);
                        container.appendChild(cardEl);
                    }
                }
            }

            if (data.communityCards) {
                this.communityCards = data.communityCards.map(c => this.hydrateCard(c));
                this.renderCommunityCards(this.communityCards);
            }

            // Show winner message
            let message = '';
            if (data.winners.length === 1) {
                const w = data.winners[0];
                const handName = w.handName ? ` with ${w.handName}` : '';
                message = `${w.playerName} wins ${formatChips(w.amount)}${handName}`;
            } else {
                const names = data.winners.map(w => w.playerName).join(', ');
                message = `Split pot! ${names}`;
            }
            this.showMessage(message);

            // Reset bets and re-render
            for (const p of this.playersState) p.currentBet = 0;
            this.renderAllSeatsMultiplayer(this.playersState);
            this.updateHandStrengthMultiplayer();
        });

        sc.on('playerEliminated', (data) => {
            const ps = this.playersState.find(p => p.seatIndex === data.seatIndex);
            if (ps) ps.isBusted = true;
            this.renderSeatMultiplayer(ps || { seatIndex: data.seatIndex, name: data.playerName, isBusted: true });
        });

        sc.on('gameOver', (data) => {
            const isLocalWinner = data.winnerSeatIndex === this.localSeatIndex;
            const message = isLocalWinner
                ? `You win the game! Congratulations!`
                : `${data.winnerName} wins the game!`;
            this.showMessage(message);

            document.getElementById('continue-controls').classList.remove('hidden');
            document.getElementById('btn-continue').textContent = 'Back to Lobby';
            document.getElementById('btn-continue').onclick = () => {
                this.isMultiplayer = false;
                this.showScreen('start-screen');
            };
        });

        sc.on('nextHand', () => {
            document.getElementById('game-message').classList.add('hidden');
        });

        sc.on('actionTimeout', (data) => {
            const seatEl = document.getElementById(`seat-${data.seatIndex}`);
            if (seatEl) seatEl.classList.remove('current-turn');
        });

        sc.on('playerDisconnected', (data) => {
            const ps = this.playersState.find(p => p.seatIndex === data.seatIndex);
            if (ps) ps.disconnected = true;
            this.renderSeatMultiplayer(ps || { seatIndex: data.seatIndex, name: data.playerName, chips: 0 });
        });
    }

    // ── Multiplayer Rendering Helpers ─────────────────────────────────────

    renderAllSeatsMultiplayer(players) {
        for (let i = 0; i < 8; i++) {
            const el = document.getElementById(`seat-${i}`);
            el.classList.remove('active');
            el.innerHTML = '';
        }
        for (const p of players) {
            this.renderSeatMultiplayer(p);
        }
    }

    renderSeatMultiplayer(player) {
        const seat = document.getElementById(`seat-${player.seatIndex}`);
        if (!seat) return;
        seat.classList.add('active');

        const initials = player.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const hue = (player.name.charCodeAt(0) * 37 + (player.name.charCodeAt(1) || 0) * 17) % 360;
        const avatarHTML = `<div class="player-avatar avatar-circle" style="background: hsl(${hue}, 55%, 40%)">${initials}</div>`;

        const stateClass = player.isBusted ? 'busted' : (player.hasFolded ? 'folded' : '');

        let badges = '';
        if (player.isDealer) badges += '<span class="badge badge-dealer">D</span>';
        if (player.isSmallBlind) badges += '<span class="badge badge-sb">SB</span>';
        if (player.isBigBlind) badges += '<span class="badge badge-bb">BB</span>';

        let betHTML = '';
        if (player.currentBet > 0) {
            betHTML = `<span class="chip-icon"></span>${formatChips(player.currentBet)}`;
        }

        const disconnectedBadge = player.disconnected ? '<span style="color:#e55;font-size:11px"> (DC)</span>' : '';

        seat.innerHTML = `
            <div class="player-quip" id="quip-${player.seatIndex}"></div>
            <div class="player-cards" id="cards-${player.seatIndex}"></div>
            <div class="player-info ${stateClass}">
                ${avatarHTML}
                <div class="player-name">${player.name}${disconnectedBadge}</div>
                <div class="player-chips"><span class="chip-icon chip-small"></span>${player.isBusted ? 'BUSTED' : formatChips(player.chips ?? 0)}</div>
                <div class="player-status">${badges}</div>
            </div>
            <div class="player-bet-display">${betHTML}</div>
            <div class="player-action-indicator" id="action-${player.seatIndex}"></div>
        `;
    }

    showControlsMultiplayer(data) {
        const { validActions, callAmount, minRaise, maxRaise, pot } = data;
        this.callAmount = callAmount;
        this.raiseMin = minRaise;
        this.raiseMax = maxRaise;
        this.pot = pot;

        // Find local player's chips from playersState
        const localPlayer = this.playersState.find(p => p.seatIndex === this.localSeatIndex);
        const localChips = localPlayer ? localPlayer.chips : 0;

        const controls = document.getElementById('controls');
        controls.classList.remove('hidden');

        const btnFold = document.getElementById('btn-fold');
        const btnCheck = document.getElementById('btn-check');
        const btnCall = document.getElementById('btn-call');
        const btnAllin = document.getElementById('btn-allin');
        const raiseControls = document.getElementById('raise-controls');

        btnFold.classList.add('hidden');
        btnCheck.classList.add('hidden');
        btnCall.classList.add('hidden');
        raiseControls.style.display = 'none';
        btnAllin.classList.add('hidden');

        const hasCheck = validActions.some(a => a.type === 'check');
        const hasCall = validActions.some(a => a.type === 'call');
        const hasFold = validActions.some(a => a.type === 'fold');
        const hasRaise = validActions.some(a => a.type === 'raise');

        if (hasFold) btnFold.classList.remove('hidden');
        if (hasCheck) btnCheck.classList.remove('hidden');

        if (hasCall) {
            btnCall.classList.remove('hidden');
            document.getElementById('call-amount').textContent = formatChips(callAmount);
        }

        if (hasRaise) {
            raiseControls.style.display = 'flex';
            const slider = document.getElementById('raise-slider');
            slider.value = 30;
            this.currentRaiseValue = Math.round(this.raiseMin + (this.raiseMax - this.raiseMin) * 0.3);
            this.updateRaiseDisplay();
        }

        btnAllin.classList.remove('hidden');
        btnAllin.textContent = `All In (${formatChips(localChips)})`;
    }

    startActionCountdown(timeLimit) {
        this.clearActionCountdown();
        const startTime = Date.now();
        const seatEl = document.getElementById(`seat-${this.localSeatIndex}`);

        // Add timer bar to seat
        let timerEl = seatEl?.querySelector('.turn-timer');
        if (!timerEl && seatEl) {
            timerEl = document.createElement('div');
            timerEl.className = 'turn-timer';
            timerEl.innerHTML = '<div class="turn-timer-bar"></div>';
            seatEl.querySelector('.player-info')?.appendChild(timerEl);
        }

        this.actionTimerInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, timeLimit - elapsed);
            const pct = (remaining / timeLimit) * 100;

            const bar = timerEl?.querySelector('.turn-timer-bar');
            if (bar) {
                bar.style.width = `${pct}%`;
                bar.classList.remove('warning', 'critical');
                if (pct < 20) bar.classList.add('critical');
                else if (pct < 50) bar.classList.add('warning');
            }

            if (remaining <= 0) {
                this.clearActionCountdown();
            }
        }, 200);
    }

    clearActionCountdown() {
        if (this.actionTimerInterval) {
            clearInterval(this.actionTimerInterval);
            this.actionTimerInterval = null;
        }
        // Remove timer bars
        document.querySelectorAll('.turn-timer').forEach(el => el.remove());
    }

    updateHandStrengthMultiplayer() {
        const display = document.getElementById('hand-strength-display');
        const text = document.getElementById('hand-strength-text');

        if (!this.localHoleCards || this.localHoleCards.length < 2) {
            display.classList.add('hidden');
            return;
        }

        display.classList.remove('hidden');

        if (this.communityCards.length >= 3) {
            const hand = HandEvaluator.bestHandFromHole(this.localHoleCards, this.communityCards);
            text.textContent = `Your Hand: ${hand.name}`;
        } else {
            const c1 = this.localHoleCards[0];
            const c2 = this.localHoleCards[1];
            const s1 = SUIT_SYMBOLS[c1.suit] || c1.suit;
            const s2 = SUIT_SYMBOLS[c2.suit] || c2.suit;
            const r1 = RANK_NAMES[c1.rank] || c1.rank;
            const r2 = RANK_NAMES[c2.rank] || c2.rank;
            text.textContent = `Your Cards: ${r1}${s1} ${r2}${s2}`;
        }
    }

    // ── Engine Event Bindings ──────────────────────────────────────────────

    bindEngineEvents() {
        this.engine.on('handStart', data => this.onHandStart(data));
        this.engine.on('blindsPosted', data => this.onBlindsPosted(data));
        this.engine.on('holeCardsDealt', data => this.onHoleCardsDealt(data));
        this.engine.on('phaseChange', data => this.onPhaseChange(data));
        this.engine.on('communityCardsDealt', data => this.onCommunityCardsDealt(data));
        this.engine.on('awaitingHumanAction', data => this.onAwaitingHumanAction(data));
        this.engine.on('playerActed', data => this.onPlayerActed(data));
        this.engine.on('handEnd', data => this.onHandEnd(data));
        this.engine.on('playerEliminated', data => this.onPlayerEliminated(data));
        this.engine.on('gameOver', data => this.onGameOver(data));
    }

    // ── Control Bindings ───────────────────────────────────────────────────

    bindControls() {
        if (this._controlsBound) return;
        this._controlsBound = true;

        document.getElementById('btn-fold').addEventListener('click', () => {
            this.submitAction('fold', 0);
        });

        document.getElementById('btn-check').addEventListener('click', () => {
            this.submitAction('check', 0);
        });

        document.getElementById('btn-call').addEventListener('click', () => {
            this.submitAction('call', this.callAmount);
        });

        document.getElementById('btn-raise').addEventListener('click', () => {
            this.submitAction('raise', this.currentRaiseValue);
        });

        document.getElementById('btn-allin').addEventListener('click', () => {
            const chips = this.isMultiplayer
                ? (this.playersState.find(p => p.seatIndex === this.localSeatIndex)?.chips || 0)
                : this.humanPlayer.chips;
            this.submitAction('all-in', chips);
        });

        // Raise slider
        const slider = document.getElementById('raise-slider');
        slider.addEventListener('input', () => {
            const pct = parseInt(slider.value) / 100;
            this.currentRaiseValue = Math.round(this.raiseMin + (this.raiseMax - this.raiseMin) * pct);
            this.updateRaiseDisplay();
        });

        // Quick raise buttons
        document.querySelectorAll('.btn-quick').forEach(btn => {
            btn.addEventListener('click', () => {
                const fraction = parseFloat(btn.dataset.fraction);
                const potBet = Math.round(this.pot * fraction);
                this.currentRaiseValue = Math.max(this.raiseMin, Math.min(this.raiseMax, potBet));
                this.updateRaiseSlider();
                this.updateRaiseDisplay();
            });
        });

        // Continue button
        document.getElementById('btn-continue').addEventListener('click', () => {
            document.getElementById('continue-controls').classList.add('hidden');
            document.getElementById('game-message').classList.add('hidden');
        });
    }

    submitAction(action, amount) {
        this.hideControls();
        if (this.isMultiplayer) {
            this.clearActionCountdown();
            this.socketClient.submitAction(action, amount);
        } else {
            this.engine.submitHumanAction(action, amount);
        }
    }

    // ── Event Handlers ─────────────────────────────────────────────────────

    onHandStart(data) {
        // Update hand number
        document.getElementById('hand-number-display').textContent = `Hand #${data.handNumber}`;

        // Clear community cards
        for (let i = 0; i < 5; i++) {
            document.getElementById(`cc-${i}`).innerHTML = '';
        }

        // Reset pot
        this.updatePot(0);

        // Clear messages
        document.getElementById('game-message').classList.add('hidden');
        document.getElementById('continue-controls').classList.add('hidden');

        // Render all player seats
        this.renderAllSeats(data.players);

        // Update position indicator
        this.updatePositionIndicator();

        // Hide overlays from previous hand
        this.hideTrainingOverlays();
    }

    onBlindsPosted(data) {
        // Update pot display
        const totalBlinds = data.smallBlind.amount + data.bigBlind.amount;
        this.updatePot(totalBlinds);

        // Render seats to show blind bets
        this.renderAllSeats(this.engine.players);
    }

    onHoleCardsDealt(data) {
        // Render cards for all players
        for (const player of data.players) {
            this.renderPlayerCards(player);
        }

        // Show hand strength for human
        this.updateHandStrength();

        // Update hand chart if enabled
        if (this.trainingAids.handChart) {
            this.renderHandChart();
        }
    }

    onPhaseChange(data) {
        // Clear action indicators
        document.querySelectorAll('.player-action-indicator').forEach(el => {
            el.classList.remove('visible');
        });
    }

    onCommunityCardsDealt(data) {
        this.renderCommunityCards(data.cards);
        this.updateHandStrength();

        // Update all seat bet displays (reset after collect)
        this.renderAllSeats(this.engine.players);
    }

    onAwaitingHumanAction(data) {
        this.showControls(data);
        this._lastActionData = data;

        // Highlight human seat
        const seatEl = document.getElementById(`seat-${this.humanPlayer.seatIndex}`);
        if (seatEl) seatEl.classList.add('current-turn');

        // Update live odds overlay
        if (this.trainingAids.odds) {
            this.updateLiveOdds(data);
        }

        // Show coaching hint button
        if (this.trainingAids.coach) {
            this.showCoachingControls(data);
        }
    }

    onPlayerActed(data) {
        const { player, action, amount, pot } = data;

        this.updatePot(pot);

        // Update the seat display
        this.renderSeat(player);

        // Show action indicator
        this.showActionIndicator(player, action, amount);

        // Show quip for AI
        if (!player.isHuman && player.persona) {
            this.showQuip(player, action);
        }

        // Remove turn highlight
        const seatEl = document.getElementById(`seat-${player.seatIndex}`);
        if (seatEl) seatEl.classList.remove('current-turn');

        // Highlight next player's seat
        const gameState = this.engine.getGameState();
        // Note: next turn highlighting handled by awaitingHumanAction for human
    }

    onHandEnd(data) {
        const { winners, allHands, showdown, communityCards } = data;

        // Hide training overlays
        this.hideTrainingOverlays();

        // If showdown, reveal all hands
        if (showdown && allHands) {
            for (const { player, hand } of allHands) {
                this.renderPlayerCards(player, true); // face up
            }
        }

        // Show community cards if not all dealt
        if (communityCards) {
            this.renderCommunityCards(communityCards);
        }

        // Build winner message
        let message = '';
        if (winners.length === 1) {
            const w = winners[0];
            const handName = w.hand ? ` with ${w.hand.name}` : '';
            message = `${w.player.name} wins ${formatChips(w.amount)}${handName}`;
        } else {
            const names = winners.map(w => w.player.name).join(', ');
            message = `Split pot! ${names}`;
        }

        this.showMessage(message);

        // Update seats with new chip counts
        this.renderAllSeats(this.engine.players);

        // Update hand strength to final
        this.updateHandStrength();

        // Continue button is shown by main.js game loop
    }

    onPlayerEliminated(data) {
        this.renderSeat(data.player);
    }

    onGameOver(data) {
        const winner = data.winner;
        const isHuman = winner.isHuman;
        const message = isHuman
            ? `You win the game! Congratulations!`
            : `${winner.name} wins the game!`;

        this.showMessage(message);

        // Show new game option
        document.getElementById('continue-controls').classList.remove('hidden');
        document.getElementById('btn-continue').textContent = 'New Game';
        document.getElementById('btn-continue').onclick = () => {
            this.showScreen('start-screen');
        };
    }

    // ── Rendering ──────────────────────────────────────────────────────────

    renderAllSeats(players) {
        // Hide all seats first
        for (let i = 0; i < 8; i++) {
            const el = document.getElementById(`seat-${i}`);
            el.classList.remove('active');
            el.innerHTML = '';
        }

        // Render active players
        for (const player of players) {
            this.renderSeat(player);
        }
    }

    renderSeat(player) {
        const seat = document.getElementById(`seat-${player.seatIndex}`);
        if (!seat) return;

        seat.classList.add('active');

        // Avatar: colored initials circle for human, emoji for AI
        let avatarHTML;
        if (player.persona && player.persona.avatar) {
            avatarHTML = `<div class="player-avatar">${player.persona.avatar}</div>`;
        } else {
            const initials = player.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
            const hue = (player.name.charCodeAt(0) * 37 + (player.name.charCodeAt(1) || 0) * 17) % 360;
            avatarHTML = `<div class="player-avatar avatar-circle" style="background: hsl(${hue}, 55%, 40%)">${initials}</div>`;
        }

        const stateClass = player.isBusted ? 'busted' : (player.hasFolded ? 'folded' : '');

        // Status badges
        let badges = '';
        if (player.isDealer) badges += '<span class="badge badge-dealer">D</span>';
        if (player.isSmallBlind) badges += '<span class="badge badge-sb">SB</span>';
        if (player.isBigBlind) badges += '<span class="badge badge-bb">BB</span>';

        // Bet display with chip icon
        let betHTML = '';
        if (player.currentBet > 0) {
            betHTML = `<span class="chip-icon"></span>${formatChips(player.currentBet)}`;
        }

        seat.innerHTML = `
            <div class="player-quip" id="quip-${player.seatIndex}"></div>
            <div class="player-cards" id="cards-${player.seatIndex}"></div>
            <div class="player-info ${stateClass}">
                ${avatarHTML}
                <div class="player-name">${player.name}</div>
                <div class="player-chips"><span class="chip-icon chip-small"></span>${player.isBusted ? 'BUSTED' : formatChips(player.chips)}</div>
                <div class="player-status">${badges}</div>
            </div>
            <div class="player-bet-display">${betHTML}</div>
            <div class="player-action-indicator" id="action-${player.seatIndex}"></div>
        `;

        // Render cards if they exist
        if (player.holeCards && player.holeCards.length > 0) {
            this.renderPlayerCards(player);
        }
    }

    renderPlayerCards(player, faceUp = false) {
        const container = document.getElementById(`cards-${player.seatIndex}`);
        if (!container) return;

        container.innerHTML = '';

        if (!player.holeCards || player.holeCards.length === 0) return;

        for (const card of player.holeCards) {
            const showFace = player.isHuman || faceUp;
            const cardEl = this.createCardElement(card, !showFace, true);
            cardEl.classList.add('dealing');
            container.appendChild(cardEl);
        }
    }

    createCardElement(card, faceDown = false, small = false) {
        const el = document.createElement('div');
        el.className = `card ${small ? 'small' : ''} ${faceDown ? 'face-down' : card.color}`;

        if (!faceDown) {
            // Determine center content based on card type
            let centerClass = '';
            let centerHTML = '';
            const rank = card.rank;

            if (rank === 14) {
                // Ace: large centered suit
                centerClass = 'ace-card';
                centerHTML = `<span class="center-pip">${card.suitSymbol}</span>`;
            } else if (rank >= 11 && rank <= 13) {
                // Face cards: large faded letter behind suit
                centerClass = 'face-card';
                centerHTML = `<span class="face-letter">${card.rankName}</span><span class="center-pip">${card.suitSymbol}</span>`;
            } else {
                // Number cards: suit symbol in center
                centerHTML = `<span class="center-pip">${card.suitSymbol}</span>`;
            }

            el.innerHTML = `
                <div class="card-corner top-left">
                    <span class="corner-rank">${card.rankName}</span>
                    <span class="corner-suit">${card.suitSymbol}</span>
                </div>
                <div class="card-center ${centerClass}">
                    ${centerHTML}
                </div>
                <div class="card-corner bottom-right">
                    <span class="corner-rank">${card.rankName}</span>
                    <span class="corner-suit">${card.suitSymbol}</span>
                </div>
            `;
        }

        return el;
    }

    renderCommunityCards(cards) {
        for (let i = 0; i < 5; i++) {
            const slot = document.getElementById(`cc-${i}`);
            if (i < cards.length) {
                slot.innerHTML = '';
                const cardEl = this.createCardElement(cards[i], false, false);
                cardEl.classList.add('dealing');
                slot.appendChild(cardEl);
            } else {
                slot.innerHTML = '';
            }
        }
    }

    // ── Controls ───────────────────────────────────────────────────────────

    showControls(data) {
        const { validActions, callAmount, minRaise, maxRaise, pot } = data;
        this.callAmount = callAmount;
        this.raiseMin = minRaise;
        this.raiseMax = maxRaise;
        this.pot = pot;

        const controls = document.getElementById('controls');
        controls.classList.remove('hidden');

        const btnFold = document.getElementById('btn-fold');
        const btnCheck = document.getElementById('btn-check');
        const btnCall = document.getElementById('btn-call');
        const btnRaise = document.getElementById('btn-raise');
        const btnAllin = document.getElementById('btn-allin');
        const raiseControls = document.getElementById('raise-controls');

        // Reset visibility
        btnFold.classList.add('hidden');
        btnCheck.classList.add('hidden');
        btnCall.classList.add('hidden');
        raiseControls.style.display = 'none';
        btnAllin.classList.add('hidden');

        const hasCheck = validActions.some(a => a.type === 'check');
        const hasCall = validActions.some(a => a.type === 'call');
        const hasFold = validActions.some(a => a.type === 'fold');
        const hasRaise = validActions.some(a => a.type === 'raise');
        const hasAllIn = validActions.some(a => a.type === 'all-in');

        if (hasFold) btnFold.classList.remove('hidden');
        if (hasCheck) btnCheck.classList.remove('hidden');

        if (hasCall) {
            btnCall.classList.remove('hidden');
            document.getElementById('call-amount').textContent = formatChips(callAmount);
        }

        if (hasRaise) {
            raiseControls.style.display = 'flex';

            // Set slider range
            const slider = document.getElementById('raise-slider');
            slider.value = 30;
            this.currentRaiseValue = Math.round(this.raiseMin + (this.raiseMax - this.raiseMin) * 0.3);
            this.updateRaiseDisplay();
        }

        btnAllin.classList.remove('hidden');
        btnAllin.textContent = `All In (${formatChips(this.humanPlayer.chips)})`;
    }

    hideControls() {
        document.getElementById('controls').classList.add('hidden');
        this.hideTrainingOverlays();
    }

    updateRaiseDisplay() {
        document.getElementById('raise-amount-text').textContent = formatChips(this.currentRaiseValue);
        document.getElementById('raise-display').textContent = formatChips(this.currentRaiseValue);
    }

    updateRaiseSlider() {
        const pct = (this.currentRaiseValue - this.raiseMin) / Math.max(1, this.raiseMax - this.raiseMin);
        document.getElementById('raise-slider').value = Math.round(pct * 100);
    }

    // ── UI Updates ─────────────────────────────────────────────────────────

    updatePot(amount) {
        this.pot = amount;
        document.getElementById('pot-amount').textContent = formatChips(amount);
    }

    updateHandStrength() {
        const display = document.getElementById('hand-strength-display');
        const text = document.getElementById('hand-strength-text');

        if (!this.humanPlayer || !this.humanPlayer.holeCards || this.humanPlayer.holeCards.length < 2) {
            display.classList.add('hidden');
            return;
        }

        display.classList.remove('hidden');

        const communityCards = this.engine.communityCards;
        if (communityCards.length >= 3) {
            const hand = HandEvaluator.bestHandFromHole(this.humanPlayer.holeCards, communityCards);
            text.textContent = `Your Hand: ${hand.name}`;
        } else {
            const c1 = this.humanPlayer.holeCards[0];
            const c2 = this.humanPlayer.holeCards[1];
            text.textContent = `Your Cards: ${c1.display} ${c2.display}`;
        }
    }

    showActionIndicator(player, action, amount) {
        const el = document.getElementById(`action-${player.seatIndex}`);
        if (!el) return;

        let label = action.toUpperCase();
        if ((action === 'raise' || action === 'call') && amount > 0) {
            label += ` ${formatChips(amount)}`;
        }

        el.textContent = label;
        el.className = `player-action-indicator action-${action.replace('-', '')} visible`;

        setTimeout(() => {
            el.classList.remove('visible');
        }, 2000);
    }

    showQuip(player, action) {
        const quipEl = document.getElementById(`quip-${player.seatIndex}`);
        if (!quipEl || !player.persona) return;

        // Map action to quip category
        let category = action;
        if (action === 'all-in') category = 'allIn';

        const quips = player.persona.actionQuips[category];
        if (!quips || quips.length === 0) return;

        // Only show quip 40% of the time to avoid spam
        if (Math.random() > 0.4) return;

        const quip = quips[Math.floor(Math.random() * quips.length)];
        quipEl.textContent = quip;
        quipEl.classList.add('visible');

        // Clear previous timeout
        if (this.quipTimeouts[player.seatIndex]) {
            clearTimeout(this.quipTimeouts[player.seatIndex]);
        }

        this.quipTimeouts[player.seatIndex] = setTimeout(() => {
            quipEl.classList.remove('visible');
        }, 2500);
    }

    showMessage(text) {
        const el = document.getElementById('game-message');
        document.getElementById('game-message-text').textContent = text;
        el.classList.remove('hidden');
    }

    showContinueButton() {
        const continueEl = document.getElementById('continue-controls');
        continueEl.classList.remove('hidden');

        const btn = document.getElementById('btn-continue');
        btn.textContent = 'Next Hand';

        // Replace click handler
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        return new Promise(resolve => {
            newBtn.addEventListener('click', () => {
                continueEl.classList.add('hidden');
                document.getElementById('game-message').classList.add('hidden');
                resolve();
            }, { once: true });
        });
    }

    // ── Training Aids ─────────────────────────────────────────────────────

    getHumanPositionName() {
        if (!this.engine || !this.humanPlayer) return '';

        const active = this.engine.getActivePlayers();
        const totalActive = active.length;
        if (totalActive < 2) return '';

        if (this.humanPlayer.isDealer) return totalActive === 2 ? 'BTN/SB' : 'BTN';
        if (this.humanPlayer.isSmallBlind) return 'SB';
        if (this.humanPlayer.isBigBlind) return 'BB';

        // Determine position based on distance from dealer
        const dealerIdx = this.engine.dealerIndex;
        const playerIndices = active.map(p => p.seatIndex);

        // Build ordered list starting after BB
        const ordered = [];
        let idx = dealerIdx;
        for (let i = 0; i < totalActive; i++) {
            do { idx = (idx + 1) % this.engine.players.length; }
            while (this.engine.players[idx].isBusted);
            ordered.push(this.engine.players[idx].seatIndex);
        }

        // Skip SB, BB (first two after dealer) unless heads-up
        // Positions: UTG, UTG+1, MP, MP+1, HJ, CO, BTN, SB, BB
        // Dealer was already processed (last in ordered before SB)
        // ordered[0] = SB, ordered[1] = BB, ordered[2..] = UTG onwards
        // But dealer was the starting point, so:
        // Let's reorder: dealer is at dealerIdx, SB is ordered[0], BB is ordered[1]
        // The rest are UTG..CO in order

        const humanSeat = this.humanPlayer.seatIndex;
        const posAfterBlinds = ordered.slice(2); // UTG onwards

        const humanPosIdx = posAfterBlinds.indexOf(humanSeat);
        if (humanPosIdx === -1) return '';

        const numPosAfterBlinds = posAfterBlinds.length;

        if (numPosAfterBlinds <= 2) {
            return humanPosIdx === 0 ? 'UTG' : 'CO';
        }
        if (numPosAfterBlinds <= 3) {
            return ['UTG', 'MP', 'CO'][humanPosIdx];
        }
        if (numPosAfterBlinds <= 4) {
            return ['UTG', 'MP', 'HJ', 'CO'][humanPosIdx];
        }
        // 5+
        const posNames = ['UTG', 'UTG+1'];
        const remaining = numPosAfterBlinds - 2;
        if (remaining >= 3) posNames.push('MP');
        if (remaining >= 4) posNames.push('MP+1');
        if (remaining >= 2) posNames.push('HJ');
        posNames.push('CO');
        return posNames[humanPosIdx] || 'MP';
    }

    getPositionClass(posName) {
        if (!posName) return '';
        if (posName === 'UTG' || posName === 'UTG+1') return 'pos-early';
        if (posName === 'MP' || posName === 'MP+1' || posName === 'HJ') return 'pos-middle';
        if (posName === 'CO' || posName === 'BTN' || posName === 'BTN/SB') return 'pos-late';
        if (posName === 'SB' || posName === 'BB') return 'pos-blinds';
        return '';
    }

    updatePositionIndicator() {
        const el = document.getElementById('position-indicator');
        if (!el) return;

        if (!this.trainingAids.position) {
            el.classList.add('hidden');
            return;
        }

        const posName = this.getHumanPositionName();
        if (!posName) {
            el.classList.add('hidden');
            return;
        }

        el.textContent = posName;
        el.className = `position-indicator ${this.getPositionClass(posName)}`;
    }

    updateLiveOdds(data) {
        const overlay = document.getElementById('odds-overlay');
        if (!overlay) return;

        if (!this.humanPlayer || !this.humanPlayer.holeCards || this.humanPlayer.holeCards.length < 2) {
            overlay.classList.add('hidden');
            return;
        }

        overlay.classList.remove('hidden');

        const communityCards = this.engine.communityCards;
        const numOpponents = this.engine.getActivePlayers().filter(p => !p.hasFolded && p.id !== this.humanPlayer.id).length;

        // Equity via Monte Carlo (fewer sims for responsiveness)
        const equity = HandEvaluator.estimateEquity(this.humanPlayer.holeCards, communityCards, numOpponents, 300);
        const equityPct = Math.round(equity * 100);

        // Pot odds
        const { callAmount, pot } = data;
        let potOddsText = '--';
        let potOddsPct = 0;
        if (callAmount > 0) {
            potOddsPct = Math.round((callAmount / (pot + callAmount)) * 100);
            potOddsText = `${potOddsPct}%`;
        } else {
            potOddsText = 'Free';
        }

        // Outs
        const outs = this.countOuts();

        // Update display
        const equityEl = document.getElementById('odds-equity');
        equityEl.textContent = `${equityPct}%`;
        equityEl.className = 'odds-value ' + (equityPct >= 50 ? 'good' : equityPct >= 30 ? 'marginal' : 'bad');

        const potOddsEl = document.getElementById('odds-pot-odds');
        potOddsEl.textContent = potOddsText;
        if (callAmount > 0) {
            potOddsEl.className = 'odds-value ' + (equityPct >= potOddsPct ? 'good' : 'bad');
        } else {
            potOddsEl.className = 'odds-value good';
        }

        document.getElementById('odds-outs').textContent = outs >= 0 ? outs : '--';
    }

    countOuts() {
        if (!this.humanPlayer || !this.humanPlayer.holeCards || this.humanPlayer.holeCards.length < 2) return -1;

        const communityCards = this.engine.communityCards;
        if (communityCards.length < 3 || communityCards.length >= 5) return -1;

        const holeCards = this.humanPlayer.holeCards;
        const allKnown = [...holeCards, ...communityCards];
        const currentHand = HandEvaluator.bestHand([...holeCards, ...communityCards]);

        // Test each unseen card to see if it improves our hand rank
        let outs = 0;
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        for (let rank = 2; rank <= 14; rank++) {
            for (const suit of suits) {
                if (allKnown.some(c => c.rank === rank && c.suit === suit)) continue;
                const testCard = { rank, suit, color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black' };
                const testHand = HandEvaluator.bestHand([...holeCards, ...communityCards, testCard]);
                if (testHand.rank > currentHand.rank) {
                    outs++;
                }
            }
        }
        return outs;
    }

    showCoachingControls(data) {
        const coachEl = document.getElementById('coaching-hint');
        if (!coachEl) return;

        coachEl.classList.remove('hidden');
        const suggestionEl = document.getElementById('coach-suggestion');
        suggestionEl.classList.add('hidden');
        suggestionEl.textContent = '';
    }

    generateCoachingSuggestion() {
        const data = this._lastActionData;
        if (!data || !this.humanPlayer || !this.humanPlayer.holeCards || this.humanPlayer.holeCards.length < 2) {
            return 'No suggestion available.';
        }

        const communityCards = this.engine.communityCards;
        const numOpponents = this.engine.getActivePlayers().filter(p => !p.hasFolded && p.id !== this.humanPlayer.id).length;
        const { callAmount, pot } = data;

        const equity = HandEvaluator.estimateEquity(this.humanPlayer.holeCards, communityCards, numOpponents, 300);
        const equityPct = Math.round(equity * 100);

        const potOddsPct = callAmount > 0 ? Math.round((callAmount / (pot + callAmount)) * 100) : 0;
        const posName = this.getHumanPositionName();
        const handStrength = HandEvaluator.quickHandStrength(this.humanPlayer.holeCards, communityCards);

        // Pre-flop logic
        if (communityCards.length === 0) {
            const tier = getStartingHandTier(this.humanPlayer.holeCards[0], this.humanPlayer.holeCards[1]);

            if (tier <= 2) {
                return `RAISE -- Premium hand (tier ${tier}). Raise for value regardless of position.`;
            }
            if (tier <= 3) {
                if (['BTN', 'CO', 'BTN/SB'].includes(posName)) {
                    return `RAISE -- Strong hand in late position. Open-raise to steal blinds.`;
                }
                if (callAmount > 0) {
                    return `CALL -- Good hand, but consider position. Calling a raise is fine.`;
                }
                return `RAISE -- Solid hand. Open-raise from any position.`;
            }
            if (tier <= 5) {
                if (['BTN', 'CO', 'BTN/SB'].includes(posName)) {
                    if (callAmount === 0) return `RAISE -- Playable hand in position. Open if folded to you.`;
                    return `CALL -- Marginal hand, but getting good pot odds in position.`;
                }
                if (callAmount > 0) return `FOLD -- Marginal hand out of position facing a raise. Fold and find a better spot.`;
                return `RAISE -- Playable hand. Open with a standard raise.`;
            }
            return `FOLD -- Weak starting hand. Wait for a better opportunity.`;
        }

        // Post-flop logic
        if (callAmount === 0) {
            if (handStrength >= 0.7) return `RAISE -- Strong hand (${equityPct}% equity). Bet for value.`;
            if (handStrength >= 0.4) return `CHECK -- Decent hand. Control the pot size.`;
            if (equityPct >= 35) return `RAISE -- Consider a semi-bluff. You have ${equityPct}% equity with draws.`;
            return `CHECK -- Weak holding. Check to see free cards.`;
        }

        // Facing a bet
        if (equityPct >= potOddsPct + 10 && handStrength >= 0.6) {
            return `RAISE -- You have ${equityPct}% equity vs needing ${potOddsPct}% pot odds. Raise for value.`;
        }
        if (equityPct >= potOddsPct) {
            return `CALL -- ${equityPct}% equity meets the ${potOddsPct}% pot odds requirement.`;
        }
        if (equityPct >= potOddsPct - 5 && handStrength >= 0.35) {
            return `CALL -- Close decision. Implied odds may justify a call.`;
        }
        return `FOLD -- ${equityPct}% equity doesn't meet ${potOddsPct}% pot odds. Save your chips.`;
    }

    renderHandChart() {
        const overlay = document.getElementById('hand-chart-overlay');
        const grid = document.getElementById('hand-chart-grid');
        if (!overlay || !grid) return;

        overlay.classList.remove('hidden');

        // Update position label
        const posName = this.getHumanPositionName();
        document.getElementById('hand-chart-position').textContent = posName || '';

        // Build 13x13 grid
        const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
        grid.innerHTML = '';

        // Get current hand for highlighting
        let currentKey = '';
        if (this.humanPlayer && this.humanPlayer.holeCards && this.humanPlayer.holeCards.length === 2) {
            const c1 = this.humanPlayer.holeCards[0];
            const c2 = this.humanPlayer.holeCards[1];
            const high = Math.max(c1.rank, c2.rank);
            const low = Math.min(c1.rank, c2.rank);
            const suited = c1.suit === c2.suit;
            const suffix = high === low ? '' : (suited ? 's' : 'o');
            const rankChar = r => r === 10 ? 'T' : RANK_NAMES[r];
            currentKey = rankChar(high) + rankChar(low) + suffix;
        }

        // Position-based playability adjustments
        const posLoosen = ['BTN', 'CO', 'BTN/SB'].includes(posName) ? 1 : 0;
        const posTighten = ['UTG', 'UTG+1'].includes(posName) ? 1 : 0;

        for (let row = 0; row < 13; row++) {
            for (let col = 0; col < 13; col++) {
                const cell = document.createElement('div');
                const highRank = ranks[Math.min(row, col)];
                const lowRank = ranks[Math.max(row, col)];

                let label, lookupKey;
                if (row === col) {
                    label = highRank + lowRank;
                    lookupKey = highRank + lowRank + 'o'; // pairs stored as e.g. "AAo"
                } else if (row < col) {
                    label = highRank + lowRank + 's';
                    lookupKey = highRank + lowRank + 's';
                } else {
                    label = highRank + lowRank + 'o';
                    lookupKey = highRank + lowRank + 'o';
                }

                let tier = STARTING_HAND_TIERS[lookupKey] || 7;
                // Adjust for position
                tier = Math.max(1, tier - posLoosen + posTighten);

                let tierClass;
                if (tier <= 1) tierClass = 'tier-1';
                else if (tier <= 2) tierClass = 'tier-2';
                else if (tier <= 3) tierClass = 'tier-3';
                else if (tier <= 4) tierClass = 'tier-4';
                else if (tier <= 5) tierClass = 'tier-5';
                else tierClass = 'tier-fold';

                cell.className = `hand-chart-cell ${tierClass}`;
                cell.textContent = label;

                // Highlight current hand
                if (currentKey && (lookupKey === currentKey || (row === col && currentKey === highRank + lowRank))) {
                    cell.classList.add('current-hand');
                }

                grid.appendChild(cell);
            }
        }
    }

    hideTrainingOverlays() {
        document.getElementById('odds-overlay')?.classList.add('hidden');
        document.getElementById('coaching-hint')?.classList.add('hidden');
        document.getElementById('coach-suggestion')?.classList.add('hidden');
    }

    // ── Screen Management ──────────────────────────────────────────────────

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    // ── Stats Rendering ────────────────────────────────────────────────────

    renderStats(stats) {
        document.getElementById('stat-hands-played').textContent = stats.handsPlayed;
        document.getElementById('stat-win-rate').textContent = `${stats.winRate}%`;

        const profitEl = document.getElementById('stat-profit');
        profitEl.textContent = (stats.totalProfit >= 0 ? '+' : '') + formatChips(stats.totalProfit);
        profitEl.className = `stat-value ${stats.totalProfit < 0 ? 'negative' : ''}`;

        document.getElementById('stat-vpip').textContent = `${stats.vpip}%`;
        document.getElementById('stat-pfr').textContent = `${stats.pfr}%`;
        document.getElementById('stat-aggression').textContent = stats.aggressionFactor;
        document.getElementById('stat-showdown-wr').textContent = `${stats.showdownWinRate}%`;
        document.getElementById('stat-biggest-win').textContent = formatChips(stats.biggestPotWon);

        // Draw chip chart
        this.drawChipChart(stats.chipHistory);
    }

    drawChipChart(chipHistory) {
        const canvas = document.getElementById('chip-chart');
        if (!canvas || chipHistory.length < 2) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 30;

        ctx.clearRect(0, 0, width, height);

        const chips = chipHistory.map(h => h.chips);
        const minChips = Math.min(...chips) * 0.9;
        const maxChips = Math.max(...chips) * 1.1 || 100;

        const xStep = (width - padding * 2) / Math.max(1, chipHistory.length - 1);

        // Grid lines
        ctx.strokeStyle = '#2a3a4a';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (height - padding * 2) * (i / 4);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            // Labels
            const val = maxChips - (maxChips - minChips) * (i / 4);
            ctx.fillStyle = '#666';
            ctx.font = '10px sans-serif';
            ctx.fillText(Math.round(val).toString(), 2, y + 3);
        }

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = '#4a9';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';

        for (let i = 0; i < chipHistory.length; i++) {
            const x = padding + i * xStep;
            const y = padding + (height - padding * 2) * (1 - (chips[i] - minChips) / (maxChips - minChips));

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Starting chips reference line
        const startY = padding + (height - padding * 2) * (1 - (chips[0] - minChips) / (maxChips - minChips));
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, startY);
        ctx.lineTo(width - padding, startY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    renderHandHistory(history) {
        const list = document.getElementById('hand-history-list');
        list.innerHTML = '';

        if (history.length === 0) {
            list.innerHTML = '<p class="analysis-placeholder">No hands played yet.</p>';
            return;
        }

        for (let i = 0; i < history.length; i++) {
            const hand = history[i];
            const item = document.createElement('div');
            item.className = `hand-history-item ${hand.result}`;

            const profitText = hand.profit >= 0
                ? `+${formatChips(hand.profit)}`
                : formatChips(hand.profit);

            const resultText = hand.result === 'won' ? 'Won'
                : hand.result === 'lost' ? 'Lost' : 'Folded';

            let cardsHTML = '';
            if (hand.userHoleCards && hand.userHoleCards.length === 2) {
                cardsHTML = `<div class="hand-history-cards">
                    ${hand.userHoleCards.map(c =>
                        `<span style="color: ${c.color === 'red' ? '#cc0000' : '#ddd'}">${RANK_NAMES[c.rank]}${SUIT_SYMBOLS[c.suit]}</span>`
                    ).join(' ')}
                    ${hand.userFinalHand ? `<span style="color: #888; margin-left: 8px">${hand.userFinalHand.name}</span>` : ''}
                </div>`;
            }

            item.innerHTML = `
                <div class="hand-history-header">
                    <span class="hand-history-number">Hand #${hand.handNumber}</span>
                    <span class="hand-history-result ${hand.result}">${resultText} ${profitText}</span>
                </div>
                <div class="hand-history-details">
                    <span>Pot: ${formatChips(hand.potSize)}</span>
                    ${hand.showdown ? '<span>Showdown</span>' : ''}
                </div>
                ${cardsHTML}
            `;

            item.addEventListener('click', () => {
                this.renderAnalysis(hand);
                // Switch to analysis tab
                document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.stats-tab-content').forEach(t => t.classList.remove('active'));
                document.querySelector('[data-tab="analysis"]').classList.add('active');
                document.getElementById('tab-analysis').classList.add('active');
            });

            list.appendChild(item);
        }
    }

    renderAnalysis(hand) {
        const container = document.getElementById('analysis-content');

        if (!hand.analysis) {
            container.innerHTML = '<p class="analysis-placeholder">No analysis available for this hand.</p>';
            return;
        }

        let html = '';

        // Equity progression
        if (hand.analysis.equityProgression && hand.analysis.equityProgression.length > 0) {
            html += `<div class="analysis-section"><h3>Equity Progression</h3>`;
            for (const ep of hand.analysis.equityProgression) {
                const pct = Math.round(ep.equity * 100);
                html += `
                    <div class="equity-bar">
                        <span class="phase-label">${ep.phase}</span>
                        <div class="bar-bg"><div class="bar-fill" style="width: ${pct}%"></div></div>
                        <span class="equity-value">${pct}%</span>
                    </div>
                `;
            }
            html += `</div>`;
        }

        // Mistakes
        if (hand.analysis.mistakes && hand.analysis.mistakes.length > 0) {
            html += `<div class="analysis-section"><h3>Potential Mistakes</h3>`;
            for (const m of hand.analysis.mistakes) {
                html += `
                    <div class="mistake-item">
                        <span class="mistake-phase">${m.phase}:</span>
                        ${m.description}
                    </div>
                `;
            }
            html += `</div>`;
        } else {
            html += `<div class="analysis-section"><h3>Potential Mistakes</h3><p style="color: #4a9;">No significant mistakes detected. Nice play!</p></div>`;
        }

        // Hand details
        html += `<div class="analysis-section"><h3>Hand Details</h3>`;
        if (hand.userHoleCards && hand.userHoleCards.length === 2) {
            html += `<p>Your cards: <strong style="color: ${hand.userHoleCards[0].color === 'red' ? '#cc0000' : '#fff'}">${RANK_NAMES[hand.userHoleCards[0].rank]}${SUIT_SYMBOLS[hand.userHoleCards[0].suit]}</strong> <strong style="color: ${hand.userHoleCards[1].color === 'red' ? '#cc0000' : '#fff'}">${RANK_NAMES[hand.userHoleCards[1].rank]}${SUIT_SYMBOLS[hand.userHoleCards[1].suit]}</strong></p>`;
        }
        if (hand.communityCards && hand.communityCards.length > 0) {
            html += `<p>Board: ${hand.communityCards.map(c =>
                `<strong style="color: ${c.color === 'red' ? '#cc0000' : '#fff'}">${RANK_NAMES[c.rank]}${SUIT_SYMBOLS[c.suit]}</strong>`
            ).join(' ')}</p>`;
        }
        if (hand.userFinalHand) {
            html += `<p>Your hand: <strong>${hand.userFinalHand.name}</strong></p>`;
        }
        html += `<p>Result: <strong style="color: ${hand.result === 'won' ? '#4a9' : hand.result === 'lost' ? '#e55' : '#888'}">${hand.result.toUpperCase()}</strong> (${hand.profit >= 0 ? '+' : ''}${formatChips(hand.profit)})</p>`;
        html += `</div>`;

        container.innerHTML = html;
    }
}
