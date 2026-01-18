import { WebSocketServer } from "ws";
import crypto from "crypto";
import { createRoom } from "./room";
import { handleClientMessage } from "./handlers";
import { ClientMessage, ServerMessage, RoomInfo, PlayerInfo } from "./protocol";
import { createApiServer } from "../api";

const wss = new WebSocketServer({ port: 3001 });
const rooms = new Map<string, ReturnType<typeof createRoom>>();

// Store player names
const playerNames = new Map<string, string>(); // clientId -> name

console.log("WebSocket server running on port 3001");

// Start API server for room listing
createApiServer(rooms, 3002);

function getRoomInfo(room: ReturnType<typeof createRoom>): RoomInfo {
    return {
        roomId: room.id,
        adminClientId: room.adminClientId,
        players: Array.from(room.players.entries()).map(([playerId, clientId]) => ({
        playerId,
        clientId,
        name: playerNames.get(clientId)
        })),
        spectators: Array.from(room.spectators),
        settings: room.settings,
        private: room.private,
        gameStarted: room.game !== null
    };
    }

    wss.on("connection", socket => {
    const clientId = crypto.randomUUID();
    let roomId: string | null = null;

    console.log(`Client connected: ${clientId}`);

    socket.on("message", raw => {
        try {
        const msg = JSON.parse(raw.toString()) as ClientMessage;
        console.log(`Message from ${clientId}:`, msg.type);

        if (msg.type === "JOIN_ROOM") {
            roomId = msg.roomId;

            // Store player name if provided
            if (msg.playerName) {
            playerNames.set(clientId, msg.playerName);
            }

            // Create room if it doesn't exist
            if (!rooms.has(roomId)) {
            console.log(`Creating new room: ${roomId}`);
            rooms.set(roomId, createRoom(roomId, clientId));
            }

            const room = rooms.get(roomId)!;
            
            // Add socket and spectator
            room.sockets.set(clientId, socket);
            room.spectators.add(clientId);

            console.log(`Client ${clientId} joined room ${roomId}`);

            // Determine role
            let role: "PLAYER" | "SPECTATOR" = "SPECTATOR";
            let playerId: number | undefined;

            // Check if this client is already a player
            for (const [pid, cid] of room.players.entries()) {
            if (cid === clientId) {
                role = "PLAYER";
                playerId = pid;
                break;
            }
            }

            // If first person in room, make them a player automatically
            if (room.sockets.size === 1 && room.players.size === 0) {
            room.players.set(0, clientId);
            room.spectators.delete(clientId);
            role = "PLAYER";
            playerId = 0;
            }

            // Send initial state
            socket.send(JSON.stringify({
            type: "ROOM_STATE",
            state: room.game,
            room: getRoomInfo(room)
            } satisfies ServerMessage));

            // Send role assignment
            socket.send(JSON.stringify({
            type: "ROLE_ASSIGNED",
            role,
            playerId,
            } satisfies ServerMessage));

            return;
        }

        // Handle other messages
        if (roomId) {
            const room = rooms.get(roomId);
            if (room) {
            handleClientMessage(room, clientId, socket, msg);
            }
        }
        } catch (error) {
        console.error("Error handling message:", error);
        socket.send(JSON.stringify({
            type: "ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
        } satisfies ServerMessage));
        }
    });

    socket.on("close", () => {
        console.log(`Client disconnected: ${clientId}`);
        
        if (!roomId) return;
        
        const room = rooms.get(roomId);
        if (!room) return;

        room.sockets.delete(clientId);
        room.spectators.delete(clientId);

        // Remove from players
        for (const [pid, cid] of room.players) {
        if (cid === clientId) {
            room.players.delete(pid);
            console.log(`Player ${pid} left room ${roomId}`);
        }
        }

        // Clean up empty rooms
        if (room.sockets.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
        }
    });

    socket.on("error", (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
    });
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
    console.log("Shutting down server...");
    wss.close(() => {
        console.log("WebSocket server closed");
        process.exit(0);
    });
});