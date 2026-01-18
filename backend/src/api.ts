import express from 'express';
import cors from 'cors';
import { Room } from './server/room';

export function createApiServer(rooms: Map<string, Room>, port: number = 3002) {
    const app = express();
    
    app.use(cors());
    app.use(express.json());

    // Get available public rooms
    app.get('/api/rooms', (req, res) => {
        const availableRooms = Array.from(rooms.values())
        .filter(room => 
            !room.private && 
            !room.game && 
            room.players.size < room.settings.maxPlayers
        )
        .map(room => ({
            id: room.id,
            playerCount: room.players.size,
            maxPlayers: room.settings.maxPlayers,
            settings: room.settings
        }));

        res.json({ rooms: availableRooms });
    });

    app.listen(port, () => {
        console.log(`API server running on port ${port}`);
    });

    return app;
}