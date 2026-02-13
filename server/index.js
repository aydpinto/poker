import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { RoomManager } from './room-manager.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Serve static files from project root
app.use(express.static('.'));

const roomManager = new RoomManager(io);

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    roomManager.handleConnection(socket);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Poker server running on http://localhost:${PORT}`);
});
