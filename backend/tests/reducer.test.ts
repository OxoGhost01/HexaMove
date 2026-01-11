import { gameReducer } from "../src/engine/reducer";
import { GameState } from "../src/engine/types";

function baseState(): GameState {
    return {
        board: {
        playerCount: 4,
        trackLength: 32,
        homeLength: 4,
        startIndices: [0, 8, 16, 24],
        homeEntryIndices: [31, 7, 15, 23],
        },
        players: [
        {
            id: 0,
            pawns: [
            { id: 1, ownerId: 0, location: { type: "TRACK", index: 0 }, isPieu: false },
            ],
            hand: [{ id: "c1", type: "5" }],
        },
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

test("playing a movement card moves pawn", () => {
    const state = baseState();

    gameReducer(state, {
        type: "PLAY_CARD",
        playerId: 0,
        cardId: "c1",
        pawnIds: [1],
    });

    expect(state.players[0].pawns[0].location).toEqual({
        type: "TRACK",
        index: 5,
    });
});

test("played card is added to draw pile", () => {
    const state = baseState();

    gameReducer(state, {
        type: "PLAY_CARD",
        playerId: 0,
        cardId: "c1",
        pawnIds: [1],
    });

    expect(state.drawPile.length).toBe(1);
    expect(state.players[0].hand.length).toBe(0);
});

test("swap card swaps pawn locations", () => {
    const state: GameState = {
        ...baseState(),
        players: [
        {
            id: 0,
            pawns: [
            { id: 1, ownerId: 0, location: { type: "TRACK", index: 2 }, isPieu: false },
            ],
            hand: [{ id: "s1", type: "SWAP" }],
        },
        {
            id: 1,
            pawns: [
            { id: 2, ownerId: 1, location: { type: "TRACK", index: 10 }, isPieu: false },
            ],
            hand: [],
        },
        { id: 2, pawns: [], hand: [] },
        { id: 3, pawns: [], hand: [] },
        ],
    };

    gameReducer(state, {
        type: "PLAY_CARD",
        playerId: 0,
        cardId: "s1",
        pawnIds: [1, 2],
    });

    expect(state.players[0].pawns[0].location).toEqual({
        type: "TRACK",
        index: 10,
    });
    expect(state.players[1].pawns[0].location).toEqual({
        type: "TRACK",
        index: 2,
    });
    });

    test("end turn rotates turn index", () => {
    const state = baseState();

    gameReducer(state, { type: "END_TURN" });

    expect(state.turnIndex).toBe(1);
});
