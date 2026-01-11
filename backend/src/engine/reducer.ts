import { GameState, CardType, Pawn } from "./types";
import { resolveForwardMove, startPawn } from "./movement";
import { findPawn } from "./helpers";


export type GameAction =
    | {
        type: "PLAY_CARD";
        playerId: number;
        cardId: string;
        pawnIds?: number[];
        asCardType?: CardType;
        }
    | {
        type: "DISCARD_CARDS";
        playerId: number;
        cardIds: string[];
        }
    | { type: "END_TURN" };


export function gameReducer(
    state: GameState,
    action: GameAction
    ): GameState {
    switch (action.type) {
        case "PLAY_CARD": {
        const player = state.players[action.playerId];
        const cardIndex = player!.hand.findIndex(c => c.id === action.cardId);
        if (cardIndex === -1) throw new Error("Card not in hand");

        const card = player!.hand[cardIndex];
        const cardType =
            card!.type === "JOKER" ? action.asCardType! : card!.type;

        switch (cardType) {
            case "START_1":
            case "START_10": {
            const pawn = findPawn(state, action.pawnIds![0]!);
            startPawn(state, pawn);
            break;
            }

            case "BACK_4": {
            const pawn = findPawn(state, action.pawnIds![0]!);
            if (pawn.location.type === "TRACK") {
                pawn.location.index =
                (pawn.location.index - 4 + state.board.trackLength) %
                state.board.trackLength;
            }
            break;
            }

            case "SWAP": {
            const p1 = findPawn(state, action.pawnIds![0]!);
            const p2 = findPawn(state, action.pawnIds![1]!);
            const tmp = p1.location;
            p1.location = p2.location;
            p2.location = tmp;
            break;
            }

            case "SPLIT_7": {
            // assumed: client already validated split
            const stepsPerPawn = Math.floor(7 / action.pawnIds!.length);
            for (const pid of action.pawnIds!) {
                const pawn = findPawn(state, pid);
                if (pawn.location.type === "TRACK") {
                const loc = resolveForwardMove(pawn, stepsPerPawn, state);
                if (loc) pawn.location = loc;
                }
            }
            break;
            }

            default: {
            // numeric forward cards
            const steps = parseInt(cardType.replace(/\D/g, ""));
            const pawn = findPawn(state, action.pawnIds![0]!);
            const loc = resolveForwardMove(pawn, steps, state);
            if (loc) pawn.location = loc;
            }
        }

        player!.hand.splice(cardIndex, 1);
        state.drawPile.push(card!);

        return state;
        }

        case "DISCARD_CARDS": {
        const player = state.players[action.playerId];
        for (const id of action.cardIds) {
            const index = player!.hand.findIndex(c => c.id === id);
            if (index !== -1) {
            state.drawPile.push(player!.hand[index]!);
            player!.hand.splice(index, 1);
            }
        }
        return state;
        }

        case "END_TURN": {
        state.turnIndex =
            (state.turnIndex + 1) % state.players.length;
        return state;
        }
    }
}
