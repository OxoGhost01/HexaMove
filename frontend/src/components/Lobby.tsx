import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoomId, isValidRoomId } from '../utils/roomsId';

export const Lobby: React.FC = () => {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Load saved name from localStorage
    useEffect(() => {
        const savedName = localStorage.getItem('playerName');
        if (savedName) setPlayerName(savedName);
    }, []);

    const handleQuickPlay = async () => {
        if (!playerName.trim()) {
        alert('Please enter your name first!');
        return;
        }

        setIsLoading(true);
        localStorage.setItem('playerName', playerName.trim());

        try {
        // Try to find an available public room
        const response = await fetch('http://localhost:3002/api/rooms');
        const data = await response.json();

        if (data.rooms && data.rooms.length > 0) {
            // Join the first available room
            navigate(`/${data.rooms[0].id}`, { state: { playerName: playerName.trim() } });
        } else {
            // Create a new public room
            const newRoomId = generateRoomId();
            navigate(`/${newRoomId}`, { state: { playerName: playerName.trim(), isPublic: true } });
        }
        } catch (error) {
        console.error('Failed to fetch rooms:', error);
        // Fallback: create new room
        const newRoomId = generateRoomId();
        navigate(`/${newRoomId}`, { state: { playerName: playerName.trim(), isPublic: true } });
        } finally {
        setIsLoading(false);
        }
    };

    const handleCreatePrivate = () => {
        if (!playerName.trim()) {
        alert('Please enter your name first!');
        return;
        }

        localStorage.setItem('playerName', playerName.trim());
        const newRoomId = generateRoomId();
        navigate(`/${newRoomId}`, { state: { playerName: playerName.trim(), isPublic: false } });
    };

    const handleJoinRoom = () => {
        if (!playerName.trim()) {
        alert('Please enter your name first!');
        return;
        }

        if (!roomCode.trim()) {
        alert('Please enter a room code!');
        return;
        }

        const code = roomCode.trim().toUpperCase();
        if (!isValidRoomId(code)) {
        alert('Room code must be 4 letters (e.g., ABCD)');
        return;
        }

        localStorage.setItem('playerName', playerName.trim());
        navigate(`/${code}`, { state: { playerName: playerName.trim() } });
    };

    return (
        <div style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
        <div style={{
            maxWidth: '480px',
            width: '100%'
        }}>
            {/* Logo/Title */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                letterSpacing: '-0.02em'
            }}>
                Game
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>
                Play with friends online
            </p>
            </div>

            {/* Main Card */}
            <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}>
            {/* Name Input */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{
                display: 'block',
                color: '#94a3b8',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
                }}>
                Your Name
                </label>
                <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '16px',
                    background: '#0f172a',
                    border: '2px solid #334155',
                    borderRadius: '12px',
                    color: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                />
            </div>

            {/* Quick Play Button */}
            <button
                onClick={handleQuickPlay}
                disabled={isLoading || !playerName.trim()}
                style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                color: 'white',
                background: playerName.trim() ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#334155',
                border: 'none',
                borderRadius: '12px',
                cursor: playerName.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                marginBottom: '12px'
                }}
                onMouseEnter={(e) => {
                if (playerName.trim() && !isLoading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                }
                }}
                onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                }}
            >
                {isLoading ? '🎲 Finding game...' : '🎮 Quick Play'}
            </button>

            {/* Divider */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '24px 0',
                gap: '12px'
            }}>
                <div style={{ flex: 1, height: '1px', background: '#334155' }} />
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#334155' }} />
            </div>

            {/* Join Room */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{
                display: 'block',
                color: '#94a3b8',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
                }}>
                Room Code
                </label>
                <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 4))}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') handleJoinRoom();
                }}
                placeholder="ABCD"
                maxLength={4}
                style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '20px',
                    fontWeight: '600',
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                    background: '#0f172a',
                    border: '2px solid #334155',
                    borderRadius: '12px',
                    color: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    textTransform: 'uppercase',
                    boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
                />
            </div>

            <button
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || !roomCode.trim()}
                style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                color: playerName.trim() && roomCode.trim() ? 'white' : '#64748b',
                background: playerName.trim() && roomCode.trim() ? '#334155' : '#1e293b',
                border: '2px solid #334155',
                borderRadius: '12px',
                cursor: playerName.trim() && roomCode.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                marginBottom: '16px'
                }}
                onMouseEnter={(e) => {
                if (playerName.trim() && roomCode.trim()) {
                    e.currentTarget.style.background = '#475569';
                }
                }}
                onMouseLeave={(e) => {
                if (playerName.trim() && roomCode.trim()) {
                    e.currentTarget.style.background = '#334155';
                }
                }}
            >
                Join Room
            </button>

            {/* Create Private */}
            <button
                onClick={handleCreatePrivate}
                disabled={!playerName.trim()}
                style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                color: playerName.trim() ? '#94a3b8' : '#475569',
                background: 'transparent',
                border: '2px solid #334155',
                borderRadius: '12px',
                cursor: playerName.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                if (playerName.trim()) {
                    e.currentTarget.style.borderColor = '#475569';
                    e.currentTarget.style.color = 'white';
                }
                }}
                onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                if (playerName.trim()) {
                    e.currentTarget.style.color = '#94a3b8';
                }
                }}
            >
                🔒 Create Private Game
            </button>
            </div>

            {/* Footer */}
            <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#1e293b',
            borderRadius: '12px',
            fontSize: '13px',
            color: '#64748b',
            textAlign: 'center'
            }}>
            <p style={{ margin: 0 }}>
                💡 Room codes are 4 letters. Share them with friends!
            </p>
            </div>
        </div>
        </div>
    );
};