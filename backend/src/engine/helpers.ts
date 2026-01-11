import { GameState, Pawn } from "./types";

export function getAllPawns(state: GameState): Pawn[] {
    return state.players.flatMap(p => p.pawns);
}

export function getPawnAtTrackIndex(
    state: GameState,
    index: number
    ): Pawn | undefined {
    return getAllPawns(state).find(
        p => p.location.type === "TRACK" && p.location.index === index
    );
}

export function findPawn(state: GameState, pawnId: number): Pawn {
    for (const player of state.players) {
        const pawn = player.pawns.find(p => p.id === pawnId);
        if (pawn) return pawn;
    }
    throw new Error("Pawn not found");
}