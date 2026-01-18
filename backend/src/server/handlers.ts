import WebSocket from "ws";
import { Room } from "./room";
import { ClientMessage, ServerMessage, RoomInfo, PlayerInfo } from "./protocol";
import { gameReducer } from "../engine/reducer";
import { createInitialGameState } from "./initState";

// Store player names globally (shared with server.ts)
export const playerNames = new Map<string, string>();

function requireAdmin(room: Room, clientId: string) {
    if (room.adminClientId !== clientId) {
        throw new Error("Admin privileges required");
    }
}

function getRoomInfo(room: Room): RoomInfo {
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

function broadcast(room: Room) {
    const message: ServerMessage = {
        type: "ROOM_STATE",
        state: room.game,
        room: getRoomInfo(room)
    };
    const payload = JSON.stringify(message);
    
    for (const socket of room.sockets.values()) {
        if (socket.readyState === WebSocket.OPEN) {
        socket.send(payload);
        }
    }
}

export function handleClientMessage(
    room: Room,
    clientId: string,
    socket: WebSocket,
    msg: ClientMessage
    ) {
    try {
        switch (msg.type) {
        case "PLAY_CARD": {
            if (!room.game) throw new Error("Game not started");
            
            const playerId = [...room.players.entries()]
            .find(([, cid]) => cid === clientId)?.[0];

            if (playerId === undefined) {
            throw new Error("Not a player");
            }

            const action = {
            type: "PLAY_CARD",
            playerId,
            cardId: msg.cardId,
            ...(msg.pawnIds ? { pawnIds: msg.pawnIds } : {}),
            ...(msg.asCardType ? { asCardType: msg.asCardType } : {}),
            } as const;

            room.game = gameReducer(room.game, action);
            broadcast(room);
            break;
        }

        case "END_TURN": {
            if (!room.game) throw new Error("Game not started");
            room.game = gameReducer(room.game, { type: "END_TURN" });
            broadcast(room);
            break;
        }

        case "BECOME_PLAYER": {
            if (room.game) throw new Error("Game already started");
            if (room.players.size >= room.settings.maxPlayers) {
            throw new Error("Player limit reached");
            }

            // Store player name if provided
            if (msg.playerName) {
            playerNames.set(clientId, msg.playerName);
            }

            const playerId = room.players.size;
            room.players.set(playerId, clientId);
            room.spectators.delete(clientId);

            socket.send(JSON.stringify({
            type: "ROLE_ASSIGNED",
            role: "PLAYER",
            playerId,
            } satisfies ServerMessage));

            broadcast(room);
            break;
        }

        case "SET_SETTINGS": {
            requireAdmin(room, clientId);
            if (room.game) throw new Error("Game already started");

            if (msg.maxPlayers !== undefined) {
            if (msg.maxPlayers < 2 || msg.maxPlayers > 8) {
                throw new Error("Invalid player count");
            }
            room.settings.maxPlayers = msg.maxPlayers;
            }

            if (msg.teamsEnabled !== undefined) {
            room.settings.teamsEnabled = msg.teamsEnabled;
            }

            if (msg.private !== undefined) {
            room.private = msg.private;
            }

            broadcast(room);
            break;
        }

        case "START_GAME": {
            requireAdmin(room, clientId);
            if (room.game) throw new Error("Already started");
            if (room.players.size < 2) {
            throw new Error("Not enough players");
            }

            const playerCount = room.players.size;
            room.game = createInitialGameState(playerCount);

            // Deal cards FIFO (4 cards per player)
            for (let i = 0; i < 4; i++) {
            for (let pid = 0; pid < playerCount; pid++) {
                const card = room.game.drawPile.shift();
                if (card) {
                room.game.players[pid]!.hand.push(card);
                }
            }
            }

            // Set phase to PLAYING
            room.game.phase = "PLAYING";

            broadcast(room);
            break;
        }
        }
    } catch (e: any) {
        socket.send(JSON.stringify({
        type: "ERROR",
        message: e.message,
        } satisfies ServerMessage));
    }
}