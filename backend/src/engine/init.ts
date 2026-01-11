import { GameState, Player, Pawn } from "./types";
import { createDeck, shuffle } from "./deck";

export function createGame(playerCount: number): GameState {
const deck = createDeck();
shuffle(deck);

const players: Player[] = [];

for (let p = 0; p < playerCount; p++) {
    const pawns: Pawn[] = [];
    for (let i = 0; i < 4; i++) {
    pawns.push({
        id: p * 10 + i,
        ownerId: p,
        location: { type: "START" },
        isPieu: false,
    });
    }

    players.push({
    id: p,
    pawns,
    hand: [],
    });
}

return {
    board: {
    playerCount,
    trackLength: 64 + Math.max(0, playerCount - 4) * 32,
    homeLength: 4,
    startIndices: Array.from({ length: playerCount }, (_, i) => i * 16),
    homeEntryIndices: Array.from({ length: playerCount }, (_, i) => i * 16),
    },
    players,
    drawPile: deck,
    turnIndex: 0,
    firstPlayerIndex: 0,
    phase: "PLAYING",
};
}
