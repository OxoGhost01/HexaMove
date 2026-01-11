import { BoardConfig } from "./types";

export const BASE_PLAYERS = 4;
export const TRACK_PER_PART = 32;
export const HOME_PATH_LENGTH = 4;
export const PAWNS_PER_PLAYER = 4;


export function advance(index: number, steps: number, len: number) {
    return (index + steps + len) % len;
}

export function retreat(index: number, steps: number, len: number) {
    return (index - steps + len) % len;
}

export function computeTrackLength(playerCount: number): number {
    if (playerCount <= 4) {
        return TRACK_PER_PART * 2;
    }

    const extensions = Math.ceil((playerCount - 4) / 2);
        return TRACK_PER_PART * (2 + extensions);
}


export function computeStartIndex(
    playerCount: number,
    trackLength: number
    ): number[] {
    const indices: number[] = [];

    for (let i = 0; i < playerCount; i++) {
        indices.push(
        Math.floor((i * trackLength) / BASE_PLAYERS)
        );
    }

    return indices;
}

export function createBoardConfig(playerCount: number): BoardConfig {
    const trackLength = computeTrackLength(playerCount);
    return {
        playerCount,
        trackLength,
        homeLength: 4,
        startIndices: computeStartIndex(playerCount, trackLength),
        homeEntryIndices: computeStartIndex(playerCount, trackLength),
    };
}
