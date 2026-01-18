import { CardType, GameState } from "../engine/types";

export type ClientMessage =
    | { type: "JOIN_ROOM"; roomId: string }
    | { type: "BECOME_PLAYER" }
    | { type: "SET_SETTINGS"; maxPlayers?: number; teamsEnabled?: boolean; private?: boolean }
    | { type: "START_GAME" }
    | {
        type: "PLAY_CARD";
        cardId: string;
        pawnIds?: number[];
        asCardType?: CardType;
        }
    | { type: "END_TURN" };

export type ServerMessage =
    | { type: "ROOM_STATE"; state: GameState | null }
    | { type: "ROLE_ASSIGNED"; role: "PLAYER" | "SPECTATOR"; playerId?: number }
    | { type: "ERROR"; message: string };

export interface LobbyState {
    roomId: string;
    adminClientId: string;
    connectedClients: { id: string; name?: string }[];
    settings: {
        maxPlayers: number;
        teamsEnabled: boolean;
    };
    players: { seat: number; clientId: string }[];
}