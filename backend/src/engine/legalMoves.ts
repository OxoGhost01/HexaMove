import { GameState, Pawn, Card, CardType, LegalMove } from "./types";
import { resolveForwardMove } from "./movement";


export function pawnCanMoveWithCard(
    state: GameState,
    pawn: Pawn,
    card: Card,
    asCardType?: CardType
    ): boolean {
    const type = card.type === "JOKER" ? asCardType! : card.type;

    switch (type) {
        case "START_1":
        case "START_10":
        return pawn.location.type === "BASE";

        case "BACK_4":
        if (pawn.location.type === "TRACK") {
            const target = (pawn.location.index - 4 + state.board.trackLength) % state.board.trackLength;
            return true;
        }
        return false;

        case "SPLIT_7":
        return pawn.location.type === "TRACK";

        default:
        if (pawn.location.type === "TRACK") {
            const loc = resolveForwardMove(pawn, parseInt(type.match(/\d+/)![0]), state);
            return loc !== null;
        }
        return false;
    }
}

export function generateLegalMoves(
    state: GameState,
    playerId: number
    ): LegalMove[] {
    const player = state.players[playerId];
    const moves: LegalMove[] = [];

    for (const card of player!.hand) {
        if (card.type === "JOKER") {
        // Joker: can mimic any playable card
        for (const mimic of player!.hand.filter(c => c.type !== "JOKER")) {
            for (const pawn of player!.pawns) {
            if (pawnCanMoveWithCard(state, pawn, mimic, mimic.type)) {
                moves.push({
                pawnId: pawn.id,
                cardId: card.id,
                asCardType: mimic.type,
                });
            }
            }
        }
        } else {
        for (const pawn of player!.pawns) {
            if (pawnCanMoveWithCard(state, pawn, card)) {
            moves.push({ pawnId: pawn.id, cardId: card.id });
            }
        }
        }
    }

    return moves;
}

export function forcedDiscard(
    state: GameState,
    playerId: number
    ): Card[] | null {
    const player = state.players[playerId];

    const pawnsOnTrack = player!.pawns.filter(p => p.location.type === "TRACK");

    // case 1: no pawns on track AND no start cards
    const hasStartCard = player!.hand.some(c => c.type.startsWith("START"));
    if (pawnsOnTrack.length === 0 && !hasStartCard) {
        return [...player!.hand]; // discard all
    }

    // case 2: pawns on track but cannot move any
    const legalMoves = generateLegalMoves(state, playerId);
    if (pawnsOnTrack.length > 0 && legalMoves.length === 0) {
        // discard any single card (usually first)
        return [player!.hand[0]!];
    }

    return null;
}
