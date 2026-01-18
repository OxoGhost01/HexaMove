import { GameState } from "../engine/types";
import { createBoardConfig } from "../engine/board";
import { createDeck } from "../engine/deck";

export function createInitialGameState(playerCount = 4): GameState {
    const deck = createDeck();

    return {
        board: createBoardConfig(playerCount),
        players: Array.from({ length: playerCount }, (_, i) => ({
        id: i,
        pawns: [
            { id: i * 10 + 0, ownerId: i, location: { type: "BASE" }, isPieu: false },
            { id: i * 10 + 1, ownerId: i, location: { type: "BASE" }, isPieu: false },
            { id: i * 10 + 2, ownerId: i, location: { type: "BASE" }, isPieu: false },
            { id: i * 10 + 3, ownerId: i, location: { type: "BASE" }, isPieu: false },
        ],
        hand: [],
        })),
        drawPile: deck,
        turnIndex: 0,
        firstPlayerIndex: 0,
        phase: "SETUP",
    };
}

export function createGameForRoom(playersClientIds: string[], settings: { maxPlayers: number; teamsEnabled: boolean }): GameState {
    const numPlayers = playersClientIds.length;
    const game: GameState = {
        phase: "PLAYING",
        players: playersClientIds.map((id, idx) => ({
            clientId: id,
            seat: idx,
            hand: [],
            pawns: [],
        })),
        board: createBoardConfig(numPlayers),
        drawPile: createDeck(),
        discard: [],
        turnIndex: 0,
        firstPlayerIndex: 0,
    } as any;

    // TODO: Deal initial cards here

    return game;
}
