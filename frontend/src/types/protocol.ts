export type CardType =
    | "START_1"
    | "2" | "3"
    | "BACK_4"
    | "5" | "6"
    | "SPLIT_7"
    | "8" | "9"
    | "START_10"
    | "12"
    | "SWAP"
    | "JOKER";

export interface Card {
    id: string;
    type: CardType;
}

export interface Pawn {
    id: number;
    ownerId: number;
    location: PawnLocation;
    isPieu: boolean;
}

export interface Player {
    id: number;
    pawns: Pawn[];
    hand: Card[];
    teamId?: number;
}

export interface BoardConfig {
    playerCount: number;
    trackLength: number;
    homeLength: number;
    startIndices: number[];
    homeEntryIndices: number[];
}

export interface GameState {
    board: BoardConfig;
    players: Player[];
    drawPile: Card[];
    turnIndex: number;
    firstPlayerIndex: number;
    phase: "LOBBY" | "SETUP" | "PLAYING" | "FINISHED";
}

export type PawnLocation =
    | { type: "BASE" }
    | { type: "START" }
    | { type: "TRACK"; index: number }
    | { type: "HOME"; index: number }
    | { type: "FINISHED" };

export type ClientMessage =
    | { type: "JOIN_ROOM"; roomId: string; playerName?: string }
    | { type: "BECOME_PLAYER"; playerName?: string }
    | { type: "SET_SETTINGS"; maxPlayers?: number; teamsEnabled?: boolean; private?: boolean }
    | { type: "START_GAME" }
    | { type: "SEND_CHAT"; message: string }
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
    name?: string;
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
    | { type: "ROLE_ASSIGNED"; role: "PLAYER" | "SPECTATOR"; playerId?: number }
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