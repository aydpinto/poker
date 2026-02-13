import { MultiplayerGame } from './multiplayer-game.js';
import crypto from 'crypto';

export class RoomManager {
    constructor(io) {
        this.io = io;
        this.rooms = new Map();         // code -> Room
        this.socketToRoom = new Map();  // socketId -> roomCode

        // Cleanup stale rooms every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    handleConnection(socket) {
        socket.on('createRoom', (data) => this.createRoom(socket, data));
        socket.on('joinRoom', (data) => this.joinRoom(socket, data));
        socket.on('leaveRoom', () => this.leaveRoom(socket));
        socket.on('startGame', () => this.startGame(socket));
        socket.on('submitAction', (data) => this.handleAction(socket, data));
        socket.on('disconnect', () => this.handleDisconnect(socket));
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
        let code;
        do {
            code = '';
            const bytes = crypto.randomBytes(4);
            for (let i = 0; i < 4; i++) {
                code += chars[bytes[i] % chars.length];
            }
        } while (this.rooms.has(code));
        return code;
    }

    generateSessionToken() {
        return crypto.randomBytes(16).toString('hex');
    }

    createRoom(socket, data) {
        const { playerName, config } = data;

        if (!playerName || playerName.trim().length === 0) {
            socket.emit('roomError', { message: 'Please enter a name' });
            return;
        }

        // Leave any existing room
        this.leaveRoom(socket, true);

        const code = this.generateRoomCode();
        const sessionToken = this.generateSessionToken();

        const room = {
            code,
            hostSocketId: socket.id,
            players: [{
                socketId: socket.id,
                name: playerName.trim().substring(0, 12),
                seatIndex: 0,
                sessionToken
            }],
            config: {
                startingChips: config?.startingChips || 1000,
                smallBlind: config?.smallBlind || 10,
                bigBlind: config?.bigBlind || 20
            },
            game: null,
            state: 'waiting',
            maxPlayers: 8,
            createdAt: Date.now()
        };

        this.rooms.set(code, room);
        this.socketToRoom.set(socket.id, code);
        socket.join(code);

        socket.emit('roomCreated', {
            roomCode: code,
            players: this.sanitizePlayers(room.players),
            config: room.config,
            sessionToken
        });

        console.log(`Room ${code} created by ${playerName}`);
    }

    joinRoom(socket, data) {
        const { roomCode, playerName } = data;

        if (!playerName || playerName.trim().length === 0) {
            socket.emit('roomError', { message: 'Please enter a name' });
            return;
        }

        const code = roomCode?.toUpperCase().trim();
        const room = this.rooms.get(code);

        if (!room) {
            socket.emit('roomError', { message: 'Room not found' });
            return;
        }

        if (room.state !== 'waiting') {
            socket.emit('roomError', { message: 'Game already in progress' });
            return;
        }

        if (room.players.length >= room.maxPlayers) {
            socket.emit('roomError', { message: 'Room is full' });
            return;
        }

        const trimmedName = playerName.trim().substring(0, 12);
        if (room.players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
            socket.emit('roomError', { message: 'Name already taken in this room' });
            return;
        }

        // Leave any existing room
        this.leaveRoom(socket, true);

        // Assign next available seat
        const usedSeats = new Set(room.players.map(p => p.seatIndex));
        let seatIndex = 0;
        while (usedSeats.has(seatIndex)) seatIndex++;

        const sessionToken = this.generateSessionToken();

        room.players.push({
            socketId: socket.id,
            name: trimmedName,
            seatIndex,
            sessionToken
        });

        this.socketToRoom.set(socket.id, code);
        socket.join(code);

        socket.emit('roomJoined', {
            roomCode: code,
            players: this.sanitizePlayers(room.players),
            config: room.config,
            sessionToken,
            isHost: false
        });

        // Notify everyone else
        this.io.to(code).emit('playerJoined', {
            players: this.sanitizePlayers(room.players)
        });

        console.log(`${trimmedName} joined room ${code} (${room.players.length} players)`);
    }

    leaveRoom(socket, silent = false) {
        const code = this.socketToRoom.get(socket.id);
        if (!code) return;

        const room = this.rooms.get(code);
        if (!room) {
            this.socketToRoom.delete(socket.id);
            return;
        }

        const leavingPlayer = room.players.find(p => p.socketId === socket.id);
        if (!leavingPlayer) return;

        // If game is in progress, handle as disconnect (don't remove)
        if (room.state === 'playing') {
            this.handleDisconnect(socket);
            return;
        }

        // Remove from waiting room
        room.players = room.players.filter(p => p.socketId !== socket.id);
        this.socketToRoom.delete(socket.id);
        socket.leave(code);

        if (room.players.length === 0) {
            // Empty room, delete it
            this.rooms.delete(code);
            console.log(`Room ${code} deleted (empty)`);
        } else {
            // Transfer host if the host left
            if (room.hostSocketId === socket.id) {
                room.hostSocketId = room.players[0].socketId;
            }

            if (!silent) {
                this.io.to(code).emit('playerLeft', {
                    players: this.sanitizePlayers(room.players),
                    leftPlayerName: leavingPlayer.name,
                    newHostSocketId: room.hostSocketId
                });
            }
        }
    }

    startGame(socket) {
        const code = this.socketToRoom.get(socket.id);
        if (!code) return;

        const room = this.rooms.get(code);
        if (!room) return;

        if (room.hostSocketId !== socket.id) {
            socket.emit('roomError', { message: 'Only the host can start the game' });
            return;
        }

        if (room.players.length < 2) {
            socket.emit('roomError', { message: 'Need at least 2 players' });
            return;
        }

        if (room.state !== 'waiting') {
            socket.emit('roomError', { message: 'Game already started' });
            return;
        }

        room.state = 'playing';

        // Notify all players
        this.io.to(code).emit('gameStarting', {
            players: this.sanitizePlayers(room.players),
            config: room.config
        });

        // Create and start the multiplayer game
        room.game = new MultiplayerGame(room, this.io);
        room.game.start();

        console.log(`Game started in room ${code} with ${room.players.length} players`);
    }

    handleAction(socket, data) {
        const code = this.socketToRoom.get(socket.id);
        if (!code) return;

        const room = this.rooms.get(code);
        if (!room || !room.game) return;

        room.game.handleAction(socket.id, data);
    }

    handleDisconnect(socket) {
        const code = this.socketToRoom.get(socket.id);
        if (!code) return;

        const room = this.rooms.get(code);
        if (!room) {
            this.socketToRoom.delete(socket.id);
            return;
        }

        const player = room.players.find(p => p.socketId === socket.id);
        if (!player) return;

        if (room.state === 'playing' && room.game) {
            // Mark as disconnected but keep in game
            room.game.handleDisconnect(socket.id);
            this.io.to(code).emit('playerDisconnected', {
                seatIndex: player.seatIndex,
                playerName: player.name
            });
        } else {
            // Waiting room -- remove the player
            room.players = room.players.filter(p => p.socketId !== socket.id);
            this.socketToRoom.delete(socket.id);

            if (room.players.length === 0) {
                this.rooms.delete(code);
                console.log(`Room ${code} deleted (all left)`);
            } else {
                if (room.hostSocketId === socket.id) {
                    room.hostSocketId = room.players[0].socketId;
                }
                this.io.to(code).emit('playerLeft', {
                    players: this.sanitizePlayers(room.players),
                    leftPlayerName: player.name,
                    newHostSocketId: room.hostSocketId
                });
            }
        }

        console.log(`Player ${player.name} disconnected from room ${code}`);
    }

    sanitizePlayers(players) {
        return players.map(p => ({
            name: p.name,
            seatIndex: p.seatIndex,
            isHost: p.socketId === this.rooms.get(
                this.socketToRoom.get(p.socketId)
            )?.hostSocketId,
            chips: this.rooms.get(
                this.socketToRoom.get(p.socketId)
            )?.config?.startingChips ?? 0
        }));
    }

    cleanup() {
        const now = Date.now();
        const maxAge = 2 * 60 * 60 * 1000; // 2 hours

        for (const [code, room] of this.rooms) {
            if (room.state === 'waiting' && now - room.createdAt > maxAge) {
                // Notify remaining players
                this.io.to(code).emit('roomError', { message: 'Room expired due to inactivity' });

                // Clean up socket mappings
                for (const p of room.players) {
                    this.socketToRoom.delete(p.socketId);
                }

                this.rooms.delete(code);
                console.log(`Room ${code} expired`);
            }
        }
    }
}
