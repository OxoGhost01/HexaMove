// src/api/socket.ts
import type { ClientMessage, ServerMessage } from '../types/protocol';

type MessageHandler = (message: ServerMessage) => void;

class SocketManager {
    private socket: WebSocket | null = null;
    private handlers: Set<MessageHandler> = new Set();
    private reconnectTimeout: number | null = null;
    private currentRoomId: string | null = null;
    private isConnecting: boolean = false;

    connect(roomId: string, onMessage: MessageHandler) {
        this.currentRoomId = roomId;
        this.handlers.add(onMessage);

        // If already connected, just join the room
        if (this.socket?.readyState === WebSocket.OPEN) {
        const playerName = localStorage.getItem('playerName') || undefined;
        this.joinRoom(roomId, playerName);
        return;
        }

        // If already connecting, don't create another connection
        if (this.isConnecting) {
        return;
        }

        this.isConnecting = true;
        this.socket = new WebSocket('ws://localhost:3001');

        this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        const playerName = localStorage.getItem('playerName') || undefined;
        this.joinRoom(roomId, playerName);
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
        this.isConnecting = false;
        };

        this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
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
        
        // Only close socket if no handlers remain
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

    private joinRoom(roomId: string, playerName?: string) {
        this.send({ type: 'JOIN_ROOM', roomId, ...(playerName && { playerName }) });
    }

    send(message: ClientMessage) {
        if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
        } else {
        console.error('WebSocket is not connected');
        }
    }

    becomePlayer(playerName?: string) {
        this.send({ type: 'BECOME_PLAYER', ...(playerName && { playerName }) });
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

    sendChat(message: string) {
        this.send({ type: 'SEND_CHAT', message });
    }
}

export const socketManager = new SocketManager();