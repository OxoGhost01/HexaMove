import { Card, CardType } from "./types";

const CARD_COUNTS: Record<CardType, number> = {
    START_1: 4,
    "2": 4,
    "3": 4,
    BACK_4: 4,
    "5": 4,
    "6": 4,
    SPLIT_7: 4,
    "8": 4,
    "9": 4,
    START_10: 4,
    "12": 4,
    SWAP: 4,
    JOKER: 1,
};

export function createDeck(): Card[] {
    const deck: Card[] = [];
    for (const [type, count] of Object.entries(CARD_COUNTS)) {
        for (let i = 0; i < count; i++) {
        deck.push({
            id: crypto.randomUUID(),
            type: type as CardType,
        });
        }
    }
    return deck;
}

export function shuffle(deck: Card[]) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        const a = deck[i]!;
        const b = deck[j]!;

        deck[i] = b;
        deck[j] = a;
    }
}

