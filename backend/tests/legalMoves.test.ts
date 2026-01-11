import { createBoardConfig } from "../src/engine/board";
import { GameState, Pawn } from "../src/engine/types";
import { generateLegalMoves, forcedDiscard } from "../src/engine/legalMoves";

function createPawn(ownerId: number, locType: Pawn["location"]) {
    return { id: Math.random(), ownerId, location: locType, isPieu: false };
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

test("forced discard no pawns on track", () => {
    const state = createGame();
    state.players[0].hand = [{ id: "c1", type: "2" }];
    const discard = forcedDiscard(state, 0);
    expect(discard?.length).toBe(1);
});

test("generate moves returns pawns moves", () => {
    const state = createGame();
    const pawn = createPawn(0, { type: "TRACK", index: 0 });
    state.players[0].pawns.push(pawn);
    state.players[0].hand = [{ id: "c1", type: "2" }];
    const moves = generateLegalMoves(state, 0);
    expect(moves.length).toBeGreaterThan(0);
});
