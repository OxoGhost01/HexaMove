import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export const Lobby: React.FC = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateGame = () => {
        setIsCreating(true);
        const newRoomId = uuidv4();
        navigate(`/room/${newRoomId}`);
    };

    const handleJoinGame = () => {
        if (roomId.trim()) {
        navigate(`/room/${roomId.trim()}`);
        }
    };

    return (
        <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '48px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: '500px',
            width: '100%'
        }}>
            <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '8px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
            }}>
            Welcome to the Game
            </h1>
            <p style={{
            textAlign: 'center',
            color: '#666',
            marginBottom: '32px'
            }}>
            Create a new game or join an existing one
            </p>

            <button
            onClick={handleCreateGame}
            disabled={isCreating}
            style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: isCreating ? 'not-allowed' : 'pointer',
                opacity: isCreating ? 0.7 : 1,
                transition: 'transform 0.2s, opacity 0.2s',
                marginBottom: '24px'
            }}
            onMouseEnter={(e) => {
                if (!isCreating) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
            {isCreating ? 'Creating...' : 'Create New Game'}
            </button>

            <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px'
            }}>
            <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
            <span style={{ padding: '0 16px', color: '#999', fontSize: '14px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
            </div>

            <div>
            <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyPress={(e) => {
                if (e.key === 'Enter') handleJoinGame();
                }}
                placeholder="Enter Room ID"
                style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                marginBottom: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                }}
            />
            <button
                onClick={handleJoinGame}
                disabled={!roomId.trim()}
                style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                color: roomId.trim() ? '#667eea' : '#999',
                background: 'white',
                border: `2px solid ${roomId.trim() ? '#667eea' : '#ddd'}`,
                borderRadius: '12px',
                cursor: roomId.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                if (roomId.trim()) {
                    e.currentTarget.style.background = '#f8f9ff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }
                }}
                onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                Join Game
            </button>
            </div>

            <div style={{
            marginTop: '32px',
            padding: '16px',
            background: '#f8f9ff',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#666'
            }}>
            <p style={{ margin: 0 }}>
                💡 <strong>Tip:</strong> Share the room ID with your friends to invite them to your game!
            </p>
            </div>
        </div>
        </div>
    );
};