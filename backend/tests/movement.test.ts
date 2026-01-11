import {
    canCapture,
    resolveForwardMove,
    startPawn,
    isPathBlocked,
} from "../src/engine/movement";
import { createBoardConfig } from "../src/engine/board";
import { GameState, Pawn } from "../src/engine/types";

function createPawn(
    ownerId: number,
    location: Pawn["location"],
    isPieu = false
    ): Pawn {
    return {
        id: Math.random(),
        ownerId,
        location,
        isPieu,
    };
    }

function createGame(): GameState {
    return {
        board: createBoardConfig(4),
        players: [
            { id: 0, pawns: [], hand: [] },
            { id: 1, pawns: [], hand: [] },
            { id: 2, pawns: [], hand: [] },
            { id: 3, pawns: [], hand: [] },
        ],
        drawPile: [],
        turnIndex: 0,
        firstPlayerIndex: 0,
        phase: "PLAYING",
    };
}

test("cannot capture pieu pawn", () => {
    const a = createPawn(0, { type: "TRACK", index: 5 });
    const b = createPawn(1, { type: "TRACK", index: 5 }, true);
    expect(canCapture(a, b)).toBe(false);
});

test("pieu blocks path", () => {
    const state = createGame();
    const pieu = createPawn(1, { type: "TRACK", index: 6 }, true);
    state.players[1].pawns.push(pieu);

    expect(isPathBlocked(state, [6])).toBe(true);
});

test("start pawn creates pieu", () => {
    const state = createGame();
    const pawn = createPawn(0, { type: "BASE" });
    state.players[0].pawns.push(pawn);

    const ok = startPawn(state, pawn);
    expect(ok).toBe(true);
    expect(pawn.isPieu).toBe(true);
    expect(pawn.location.type).toBe("TRACK");
});

test("enter home only if landing exactly", () => {
    const state = createGame();
    const pawn = createPawn(0, { type: "TRACK", index: 15 });
    state.players[0].pawns.push(pawn);

    const loc = resolveForwardMove(pawn, 1, state);
    expect(loc?.type).toBe("TRACK");
});
