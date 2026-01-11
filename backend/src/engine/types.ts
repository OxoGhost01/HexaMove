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
    phase: "SETUP" | "PLAYING" | "FINISHED";
}

export type PawnLocation =
    | { type: "BASE" }
    | { type: "START" }
    | { type: "TRACK"; index: number }
    | { type: "HOME"; index: number }
    | { type: "FINISHED" };

export interface LegalMove {
  pawnId: number;        // the pawn to move
  cardId: string;        // the card used
  asCardType?: CardType; // only for Joker: which type the player chooses
}

export type GameAction =
    | { type: "PLAY_CARD"; playerId: number; cardId: string; pawnIds?: number[]; asCardType?: CardType }
    | { type: "DISCARD_CARD"; playerId: number; cardIds: string[] }
    | { type: "END_TURN" }
    | { type: "START_GAME"; playerCount: number };
