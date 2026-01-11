import { createGame } from "../src/engine/init";
import { drawCards } from "../src/engine/round";

test("players draw 4 cards FIFO", () => {
    const game = createGame(4);
    drawCards(game);

    for (const p of game.players) {
        expect(p.hand.length).toBe(4);
    }
});
