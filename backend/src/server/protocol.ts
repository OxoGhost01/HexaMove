import { CardType, GameState } from "../engine/types";

export type ClientMessage =
    | { type: "JOIN_ROOM"; roomId: string; playerName?: string }
    | { type: "BECOME_PLAYER"; playerName?: string }
    | { type: "SET_SETTINGS"; maxPlayers?: number; teamsEnabled?: boolean; private?: boolean }
    | { type: "START_GAME" }
    | {
        type: "PLAY_CARD";
        cardId: string;
        pawnIds?: number[];
        asCardType?: CardType;
        }
    | { type: "END_TURN" };

export interface PlayerInfo {
    playerId: number;
    clientId: string;
    name?: string | undefined;
}

export interface RoomInfo {
    roomId: string;
    adminClientId: string;
    players: PlayerInfo[];
    spectators: string[];
    settings: {
        maxPlayers: number;
        teamsEnabled: boolean;
    };
    private: boolean;
    gameStarted: boolean;
}

export type ServerMessage =
    | { type: "ROOM_STATE"; state: GameState | null; room: RoomInfo }
    | { type: "ROLE_ASSIGNED"; role: "PLAYER" | "SPECTATOR"; playerId?: number | undefined }
    | { type: "CHAT_MESSAGE"; clientId: string; playerName?: string; message: string; timestamp: number }
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