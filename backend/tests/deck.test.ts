import { createDeck } from "../src/engine/deck";

test("deck has 49 cards", () => {
    const deck = createDeck();
    expect(deck.length).toBe(49);
});
