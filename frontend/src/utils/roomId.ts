export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I and O to avoid confusion
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
    }

    export function isValidRoomId(roomId: string): boolean {
    return /^[A-Z]{4}$/.test(roomId.toUpperCase());
}