import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socketManager } from '../api/socket';
import type { ServerMessage, GameState } from '../types/protocol';

interface RoomState {
    gameState: GameState | null;
    myRole: 'SPECTATOR' | 'PLAYER' | null;
    myPlayerId?: number;
    error: string | null;
}

export const RoomView: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [room, setRoom] = useState<RoomState>({
        gameState: null,
        myRole: null,
        error: null
    });
    const [isConnected, setIsConnected] = useState(false);
    const [copiedRoomId, setCopiedRoomId] = useState(false);

    const handleMessage = useCallback((message: ServerMessage) => {
        console.log('Received message:', message);

        switch (message.type) {
        case 'ROOM_STATE':
            setRoom(prev => ({ ...prev, gameState: message.state, error: null }));
            setIsConnected(true);
            break;

        case 'ROLE_ASSIGNED':
            setRoom(prev => ({
            ...prev,
            myRole: message.role,
            myPlayerId: message.playerId,
            error: null
            }));
            break;

        case 'ERROR':
            setRoom(prev => ({ ...prev, error: message.message }));
            setTimeout(() => setRoom(prev => ({ ...prev, error: null })), 5000);
            break;
        }
    }, []);

    useEffect(() => {
        if (!roomId) {
        navigate('/');
        return;
        }

        socketManager.connect(roomId, handleMessage);

        return () => {
        socketManager.disconnect(handleMessage);
        };
    }, [roomId, navigate, handleMessage]);

    const handleBecomePlayer = () => {
        socketManager.becomePlayer();
    };

    const handleStartGame = () => {
        socketManager.startGame();
    };

    const handleSettingChange = (key: 'maxPlayers' | 'teamsEnabled' | 'private', value: any) => {
        socketManager.setSettings({ [key]: value });
    };

    const copyRoomId = () => {
        if (roomId) {
        navigator.clipboard.writeText(roomId);
        setCopiedRoomId(true);
        setTimeout(() => setCopiedRoomId(false), 2000);
        }
    };

    const { gameState, myRole, myPlayerId, error } = room;
    const isInLobby = !gameState || gameState.phase === 'LOBBY';
    const isAdmin = myRole === 'PLAYER' && myPlayerId === 0;
    const playerCount = gameState?.players?.length || 0;
    const maxPlayers = 4;

    if (!isConnected) {
        return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5'
        }}>
            <div style={{ textAlign: 'center' }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #ddd',
                borderTopColor: '#667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
            }} />
            <p style={{ color: '#666', fontSize: '18px' }}>Connecting to room...</p>
            </div>
        </div>
        );
    }

    return (
        <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
        {/* Error Toast */}
        {error && (
            <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: '#ef4444',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out'
            }}>
            ⚠️ {error}
            </div>
        )}

        <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            {/* Header */}
            <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                <h1 style={{
                    margin: 0,
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#333'
                }}>
                    {isInLobby ? 'Game Lobby' : 'Game in Progress'}
                </h1>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '8px'
                }}>
                    <span style={{ color: '#666', fontSize: '14px' }}>Room ID:</span>
                    <code style={{
                    background: '#f5f5f5',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                    }}>
                    {roomId}
                    </code>
                    <button
                    onClick={copyRoomId}
                    style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        background: copiedRoomId ? '#10b981' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    >
                    {copiedRoomId ? '✓ Copied!' : '📋 Copy'}
                    </button>
                </div>
                </div>
                <button
                onClick={() => navigate('/')}
                style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    background: 'white',
                    color: '#667eea',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8f9ff';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                }}
                >
                ← Leave Room
                </button>
            </div>
            </div>

            {isInLobby ? (
            /* LOBBY VIEW */
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Players Section */}
                <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                <h2 style={{
                    margin: '0 0 20px 0',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#333'
                }}>
                    Players ({playerCount}/{maxPlayers})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {gameState?.players?.map((player, idx) => (
                    <div key={player.id} style={{
                        padding: '16px',
                        background: idx === 0 ? '#fef3c7' : '#f5f5f5',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: player.id === myPlayerId ? '2px solid #667eea' : 'none'
                    }}>
                        <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: `hsl(${player.id * 60}, 70%, 60%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'white'
                        }}>
                        {player.id + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#333' }}>
                            Player {player.id + 1}
                            {player.id === myPlayerId && ' (You)'}
                            {idx === 0 && ' 👑'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {idx === 0 ? 'Admin' : 'Player'}
                        </div>
                        </div>
                    </div>
                    ))}

                    {playerCount < maxPlayers && Array.from({ length: maxPlayers - playerCount }).map((_, idx) => (
                    <div key={`empty-${idx}`} style={{
                        padding: '16px',
                        background: '#fafafa',
                        borderRadius: '12px',
                        border: '2px dashed #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '14px'
                    }}>
                        Waiting for player...
                    </div>
                    ))}
                </div>

                {myRole === 'SPECTATOR' && playerCount < maxPlayers && (
                    <button
                    onClick={handleBecomePlayer}
                    style={{
                        width: '100%',
                        marginTop: '20px',
                        padding: '16px',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'white',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    >
                    Join as Player
                    </button>
                )}
                </div>

                {/* Settings & Controls */}
                <div>
                {/* Settings */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#333'
                    }}>
                    Game Settings
                    </h3>

                    {isAdmin ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                            Max Players
                        </label>
                        <select
                            value={maxPlayers}
                            onChange={(e) => handleSettingChange('maxPlayers', parseInt(e.target.value))}
                            style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '16px',
                            cursor: 'pointer'
                            }}
                        >
                            {[2, 3, 4, 5, 6, 7, 8].map(n => (
                            <option key={n} value={n}>{n} Players</option>
                            ))}
                        </select>
                        </div>

                        <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '12px',
                        background: '#f5f5f5',
                        borderRadius: '8px'
                        }}>
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            onChange={(e) => handleSettingChange('teamsEnabled', e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px', color: '#333' }}>Enable Teams</span>
                        </label>

                        <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '12px',
                        background: '#f5f5f5',
                        borderRadius: '8px'
                        }}>
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            onChange={(e) => handleSettingChange('private', e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px', color: '#333' }}>Private Room</span>
                        </label>
                    </div>
                    ) : (
                    <div style={{
                        padding: '16px',
                        background: '#f8f9ff',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#666',
                        textAlign: 'center'
                    }}>
                        Only the admin can change settings
                    </div>
                    )}
                </div>

                {/* Start Button */}
                {isAdmin && (
                    <button
                    onClick={handleStartGame}
                    disabled={playerCount < 2}
                    style={{
                        width: '100%',
                        padding: '20px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: 'white',
                        background: playerCount >= 2
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : '#ccc',
                        border: 'none',
                        borderRadius: '16px',
                        cursor: playerCount >= 2 ? 'pointer' : 'not-allowed',
                        boxShadow: playerCount >= 2 ? '0 8px 24px rgba(102, 126, 234, 0.4)' : 'none',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (playerCount >= 2) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = playerCount >= 2 ? '0 8px 24px rgba(102, 126, 234, 0.4)' : 'none';
                    }}
                    >
                    {playerCount < 2 ? 'Need 2+ Players' : '🚀 Start Game'}
                    </button>
                )}

                {!isAdmin && myRole === 'PLAYER' && (
                    <div style={{
                    padding: '20px',
                    background: 'white',
                    borderRadius: '16px',
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                    Waiting for admin to start...
                    </div>
                )}
                </div>
            </div>
            ) : (
            /* GAME VIEW */
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '48px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🎮 Game Started!</h2>
                <p style={{ color: '#666', fontSize: '18px', marginBottom: '24px' }}>
                Phase: {gameState.phase}
                </p>
                <p style={{ color: '#999' }}>
                The game interface will be implemented here...
                </p>
                <div style={{ marginTop: '32px', padding: '24px', background: '#f5f5f5', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '16px' }}>Current Game State</h3>
                <div style={{ textAlign: 'left', fontSize: '14px' }}>
                    <p>Turn: Player {gameState.turnIndex + 1}</p>
                    <p>Draw Pile: {gameState.drawPile.length} cards</p>
                    <p>Players: {gameState.players.length}</p>
                </div>
                </div>
            </div>
            )}
        </div>

        <style>{`
            @keyframes spin {
            to { transform: rotate(360deg); }
            }
            @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
            }
        `}</style>
        </div>
    );
};