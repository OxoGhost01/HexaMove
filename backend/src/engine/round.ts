import { GameState } from "./types";

export function drawCards(state: GameState) {
    const players = state.players;
    let drawIndex = state.firstPlayerIndex;

    for (let r = 0; r < 4; r++) {
        for (let i = 0; i < players.length; i++) {
        const p = players[drawIndex];
        const card = state.drawPile.shift();
        if (!card) throw new Error("Draw pile empty");
        p!.hand.push(card);
        drawIndex = (drawIndex + 1) % players.length;
        }
    }
    }

    export function endRound(state: GameState) {
    state.firstPlayerIndex =
        (state.firstPlayerIndex + 1) % state.players.length;

    state.turnIndex = state.firstPlayerIndex;

    drawCards(state);
}
