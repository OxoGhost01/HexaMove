import { GameState, Pawn, PawnLocation } from "./types";
import { getPawnAtTrackIndex } from "./helpers";

export function advanceIndex(
    from: number,
    steps: number,
    trackLength: number
    ): number {
    return (from + steps) % trackLength;
}

export function retreatIndex(
    from: number,
    steps: number,
    trackLength: number
    ): number {
    return (from - steps + trackLength) % trackLength;
}

export function isPathBlocked(
    state: GameState,
    path: number[]
    ): boolean {
    for (const idx of path) {
        const pawn = getPawnAtTrackIndex(state, idx);
        if (pawn?.isPieu) return true;
    }
    return false;
}

export function canCapture(
    attacker: Pawn,
    target: Pawn
    ): boolean {
    if (target.isPieu) return false;
    if (target.ownerId === attacker.ownerId) return false;
    return true;
}

export function capturePawn(target: Pawn) {
    target.location = { type: "BASE" };
    target.isPieu = false;
}

export function resolveForwardMove(
    pawn: Pawn,
    steps: number,
    state: GameState
    ): PawnLocation | null {
    if (pawn.location.type !== "TRACK") return null;

    const trackLength = state.board.trackLength;
    const HOME_PATH_LENGTH = 4;  // set in board.ts, but this is always this value so i hardcode it here -> no problem
    const homeEntry = state.board.homeEntryIndices[pawn.ownerId];
    let current = pawn.location.index;

    for (let i = 1; i <= steps; i++) {
        const next = advanceIndex(current, 1, trackLength);

        if (
        next === homeEntry) {
        const remaining = steps - i;
        if (remaining < HOME_PATH_LENGTH) {
            return { type: "HOME", index: remaining };
        }
        }

        current = next;
    }

    return { type: "TRACK", index: current };
}

export function startPawn(
    state: GameState,
    pawn: Pawn
    ): boolean {
    if (pawn.location.type !== "BASE") return false;

    const startIndex =
        state.board.startIndices[pawn.ownerId];

    const occupant = getPawnAtTrackIndex(state, startIndex!);

    if (occupant) {
        if (!canCapture(pawn, occupant)) return false;
        capturePawn(occupant);
    }

    pawn.location = { type: "TRACK", index: startIndex! };
    pawn.isPieu = true;
    return true;
}
