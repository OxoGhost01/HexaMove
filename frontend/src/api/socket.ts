import type { ClientMessage, ServerMessage } from '../types/protocol';

type MessageHandler = (message: ServerMessage) => void;

class SocketManager {
    private socket: WebSocket | null = null;
    private handlers: Set<MessageHandler> = new Set();
    private reconnectTimeout: number | null = null;
    private currentRoomId: string | null = null;

    connect(roomId: string, onMessage: MessageHandler) {
        this.currentRoomId = roomId;
        this.handlers.add(onMessage);

        if (this.socket?.readyState === WebSocket.OPEN) {
        this.joinRoom(roomId);
        return;
        }

        this.socket = new WebSocket('ws://localhost:3001');

        this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.joinRoom(roomId);
        };

        this.socket.onmessage = (event) => {
        try {
            const message: ServerMessage = JSON.parse(event.data);
            this.handlers.forEach(handler => handler(message));
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
        };

        this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
        };
    }

    private attemptReconnect() {
        if (this.reconnectTimeout) return;
        
        this.reconnectTimeout = window.setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.reconnectTimeout = null;
        if (this.currentRoomId) {
            this.connect(this.currentRoomId, [...this.handlers][0]);
        }
        }, 3000);
    }

    disconnect(handler?: MessageHandler) {
        if (handler) {
        this.handlers.delete(handler);
        }
        
        if (this.handlers.size === 0) {
        this.socket?.close();
        this.socket = null;
        this.currentRoomId = null;
        if (this.reconnectTimeout) {
            window.clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        }
    }

    private joinRoom(roomId: string) {
        this.send({ type: 'JOIN_ROOM', roomId });
    }

    send(message: ClientMessage) {
        if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
        } else {
        console.error('WebSocket is not connected');
        }
    }

    becomePlayer() {
        this.send({ type: 'BECOME_PLAYER' });
    }

    setSettings(settings: { maxPlayers?: number; teamsEnabled?: boolean; private?: boolean }) {
        this.send({ type: 'SET_SETTINGS', ...settings });
    }

    startGame() {
        this.send({ type: 'START_GAME' });
    }

    playCard(cardId: string, pawnIds?: number[], asCardType?: any) {
        this.send({ 
        type: 'PLAY_CARD', 
        cardId, 
        ...(pawnIds && { pawnIds }),
        ...(asCardType && { asCardType })
        });
    }

    endTurn() {
        this.send({ type: 'END_TURN' });
    }
}

export const socketManager = new SocketManager();