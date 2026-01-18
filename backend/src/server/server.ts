import crypto from "crypto";
import { createRoom } from "./room";
import { handleClientMessage } from "./handlers";
import { ClientMessage, ServerMessage } from "./protocol";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });
const rooms = new Map<string, ReturnType<typeof createRoom>>();

console.log("WebSocket server running on port 3001");

wss.on("connection", (socket: import("ws")) => {
    const clientId = crypto.randomUUID();
    let roomId: string | null = null;

    console.log(`Client connected: ${clientId}`);

    socket.on("message", raw => {
        try {
        const msg = JSON.parse(raw.toString()) as ClientMessage;
        console.log(`Message from ${clientId}:`, msg.type);

        if (msg.type === "JOIN_ROOM") {
            roomId = msg.roomId;

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

            for (const [pid, cid] of room.players.entries()) {
            if (cid === clientId) {
                role = "PLAYER";
                playerId = pid;
                break;
            }
            }

            if (room.sockets.size === 1 && room.players.size === 0) {
            room.players.set(0, clientId);
            room.spectators.delete(clientId);
            role = "PLAYER";
            playerId = 0;
            }

            socket.send(JSON.stringify({
            type: "ROOM_STATE",
            state: room.game,
            } satisfies ServerMessage));

            socket.send(JSON.stringify({
            type: "ROLE_ASSIGNED",
            role,
            playerId: playerId as number,
            } satisfies ServerMessage));

            return;
        }

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

        for (const [pid, cid] of room.players) {
        if (cid === clientId) {
            room.players.delete(pid);
            console.log(`Player ${pid} left room ${roomId}`);
        }
        }

        if (room.sockets.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
        }
    });

    socket.on("error", (error: any) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
    });
    });

    process.on("SIGINT", () => {
    console.log("Shutting down server...");
    wss.close(() => {
        console.log("WebSocket server closed");
        process.exit(0);
    });
});