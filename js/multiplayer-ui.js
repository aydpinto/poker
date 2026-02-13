import { SocketClient } from './socket-client.js';

export class MultiplayerUI {
    constructor(renderer) {
        this.renderer = renderer;
        this.socket = new SocketClient();
        this.roomCode = null;
        this.isHost = false;
        this.sessionToken = null;
        this.localSeatIndex = null;
        this.players = [];

        this.bindLobbyControls();
    }

    // ── Lobby Controls ──────────────────────────────────────────────────

    bindLobbyControls() {
        // Selector buttons in multiplayer lobby (chips, blinds)
        document.querySelectorAll('#multiplayer-lobby .selector-row').forEach(row => {
            row.querySelectorAll('.selector-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    row.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        });

        // Create Room button
        document.getElementById('create-room-btn').addEventListener('click', () => {
            this.handleCreateRoom();
        });

        // Join Room button
        document.getElementById('join-room-btn').addEventListener('click', () => {
            this.handleJoinRoom();
        });

        // Back button from lobby
        document.getElementById('lobby-back-btn').addEventListener('click', () => {
            this.showScreen('start-screen');
        });

        // Leave Room button
        document.getElementById('leave-room-btn').addEventListener('click', () => {
            this.handleLeaveRoom();
        });

        // Start Game button (host only)
        document.getElementById('start-mp-game-btn').addEventListener('click', () => {
            this.socket.startGame();
        });

        // Room code input: auto-uppercase and limit to 4 chars
        const codeInput = document.getElementById('room-code-input');
        codeInput.addEventListener('input', () => {
            codeInput.value = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
        });

        // Enter key on code input triggers join
        codeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleJoinRoom();
            }
        });
    }

    async handleCreateRoom() {
        const name = document.getElementById('mp-player-name').value.trim();
        if (!name) {
            this.showLobbyError('Please enter a name');
            return;
        }

        this.hideLobbyError();

        try {
            await this.ensureConnected();
        } catch {
            this.showLobbyError('Could not connect to server');
            return;
        }

        // Get config from lobby settings
        const config = this.getLobbyConfig();

        this.socket.createRoom(name, config);
    }

    async handleJoinRoom() {
        const name = document.getElementById('mp-player-name').value.trim();
        const code = document.getElementById('room-code-input').value.trim();

        if (!name) {
            this.showLobbyError('Please enter a name');
            return;
        }
        if (!code || code.length !== 4) {
            this.showLobbyError('Please enter a 4-character room code');
            return;
        }

        this.hideLobbyError();

        try {
            await this.ensureConnected();
        } catch {
            this.showLobbyError('Could not connect to server');
            return;
        }

        this.socket.joinRoom(code, name);
    }

    handleLeaveRoom() {
        this.socket.leaveRoom();
        this.roomCode = null;
        this.isHost = false;
        this.showScreen('multiplayer-lobby');
    }

    async ensureConnected() {
        if (!this.socket.connected) {
            await this.socket.connect();
            this.bindSocketEvents();
        }
    }

    getLobbyConfig() {
        // Read from lobby config selectors if they exist
        const chipsEl = document.querySelector('#mp-chips-selector .selector-btn.active');
        const blindsEl = document.querySelector('#mp-blinds-selector .selector-btn.active');

        return {
            startingChips: chipsEl ? parseInt(chipsEl.dataset.value) : 1000,
            smallBlind: blindsEl ? parseInt(blindsEl.dataset.sb) : 10,
            bigBlind: blindsEl ? parseInt(blindsEl.dataset.bb) : 20
        };
    }

    // ── Socket Events ───────────────────────────────────────────────────

    bindSocketEvents() {
        // Room events
        this.socket.on('roomCreated', (data) => {
            this.roomCode = data.roomCode;
            this.isHost = true;
            this.sessionToken = data.sessionToken;
            this.players = data.players;
            this.localSeatIndex = 0;
            sessionStorage.setItem('pokerSessionToken', data.sessionToken);
            sessionStorage.setItem('pokerRoomCode', data.roomCode);
            this.showWaitingRoom();
        });

        this.socket.on('roomJoined', (data) => {
            this.roomCode = data.roomCode;
            this.isHost = data.isHost;
            this.sessionToken = data.sessionToken;
            this.players = data.players;
            // Find our seat (the last player added is us)
            const myName = document.getElementById('mp-player-name').value.trim();
            const me = data.players.find(p => p.name === myName);
            this.localSeatIndex = me ? me.seatIndex : data.players.length - 1;
            sessionStorage.setItem('pokerSessionToken', data.sessionToken);
            sessionStorage.setItem('pokerRoomCode', data.roomCode);
            this.showWaitingRoom();
        });

        this.socket.on('playerJoined', (data) => {
            this.players = data.players;
            this.renderPlayerList();
        });

        this.socket.on('playerLeft', (data) => {
            this.players = data.players;
            this.renderPlayerList();
        });

        this.socket.on('roomError', (data) => {
            this.showLobbyError(data.message);
        });

        // Game starting
        this.socket.on('gameStarting', (data) => {
            this.players = data.players;
            // Find our seat index
            const me = data.players.find(p => {
                const myName = document.getElementById('mp-player-name').value.trim();
                return p.name === myName;
            });
            if (me) this.localSeatIndex = me.seatIndex;

            this.startMultiplayerGame(data);
        });
    }

    // ── UI Rendering ────────────────────────────────────────────────────

    showWaitingRoom() {
        this.showScreen('waiting-room');

        // Show room code
        document.getElementById('room-code-display').textContent = this.roomCode;

        // Copy-to-clipboard on room code box click
        const codeBox = document.querySelector('.room-code-box');
        codeBox.onclick = () => {
            navigator.clipboard.writeText(this.roomCode).then(() => {
                const label = document.querySelector('.room-code-label');
                const original = label.textContent;
                label.textContent = 'Copied!';
                setTimeout(() => { label.textContent = original; }, 1500);
            }).catch(() => {});
        };

        // Show/hide start button based on host status
        const startBtn = document.getElementById('start-mp-game-btn');
        if (this.isHost) {
            startBtn.classList.remove('hidden');
        } else {
            startBtn.classList.add('hidden');
        }

        this.renderPlayerList();
    }

    renderPlayerList() {
        const list = document.getElementById('player-list');
        list.innerHTML = '';

        for (const player of this.players) {
            const el = document.createElement('div');
            el.className = 'player-list-item';

            const initials = player.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
            const hue = (player.name.charCodeAt(0) * 37 + (player.name.charCodeAt(1) || 0) * 17) % 360;

            const hostBadge = player.isHost ? '<span class="player-list-host">HOST</span>' : '';
            el.innerHTML = `
                <div class="avatar-circle" style="background: hsl(${hue}, 55%, 40%)">${initials}</div>
                <span class="player-list-name">${player.name}</span>
                <span class="player-list-seat">Seat ${player.seatIndex + 1}</span>
                ${hostBadge}
            `;
            list.appendChild(el);
        }

        // Update player count
        document.getElementById('room-status').textContent =
            `${this.players.length}/8 players`;

        // Enable/disable start button
        const startBtn = document.getElementById('start-mp-game-btn');
        if (this.isHost) {
            startBtn.disabled = this.players.length < 2;
            startBtn.textContent = this.players.length < 2
                ? 'Need at least 2 players'
                : `Start Game (${this.players.length} players)`;
        }
    }

    // ── Game Start ──────────────────────────────────────────────────────

    startMultiplayerGame(data) {
        this.showScreen('game-screen');

        // Initialize the renderer in multiplayer mode
        this.renderer.initMultiplayer(this.socket, this.localSeatIndex, data.players, data.config);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    showLobbyError(message) {
        const el = document.getElementById('lobby-error');
        el.textContent = message;
        el.classList.remove('hidden');
    }

    hideLobbyError() {
        document.getElementById('lobby-error').classList.add('hidden');
    }
}
