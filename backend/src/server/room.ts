import WebSocket from "ws";
import { GameState } from "../engine/types";

export interface Room {
    id: string;
    adminClientId: string;

    sockets: Map<string, WebSocket>;
    spectators: Set<string>;
    players: Map<number, string>;
    private: boolean;

    settings: {
        maxPlayers: number;  // 2-8
        teamsEnabled: boolean;
    };

    game: GameState | null;
}


export function createRoom(id: string, adminClientId: string): Room {
    return {
        id,
        adminClientId,
        sockets: new Map(),
        spectators: new Set(),
        players: new Map(),
        private: true,
        settings: {
            maxPlayers: 4,
            teamsEnabled: true,
        },
        game: null,
    };
}
