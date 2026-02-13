export class SocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            // Socket.IO client is loaded as a global from /socket.io/socket.io.js
            this.socket = window.io();

            this.socket.on('connect', () => {
                this.connected = true;
                console.log('Connected to server');
                resolve();
            });

            this.socket.on('disconnect', () => {
                this.connected = false;
                console.log('Disconnected from server');
            });

            this.socket.on('connect_error', (err) => {
                console.error('Connection error:', err);
                reject(err);
            });
        });
    }

    // ── Room Operations ─────────────────────────────────────────────────

    createRoom(playerName, config) {
        this.socket.emit('createRoom', { playerName, config });
    }

    joinRoom(roomCode, playerName) {
        this.socket.emit('joinRoom', { roomCode, playerName });
    }

    leaveRoom() {
        this.socket.emit('leaveRoom');
    }

    startGame() {
        this.socket.emit('startGame');
    }

    submitAction(action, amount) {
        this.socket.emit('submitAction', { action, amount });
    }

    // ── Event Registration ──────────────────────────────────────────────

    on(event, callback) {
        this.socket.on(event, callback);
    }

    off(event, callback) {
        this.socket.off(event, callback);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}
