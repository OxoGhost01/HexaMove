// src/components/RoomView.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { socketManager } from '../api/socket';
import type { ServerMessage, GameState, RoomInfo, PlayerInfo } from '../types/protocol';
import { Chat } from './Chat';
import type { ChatMessage } from './Chat';
import { GameBoard } from './GameBoard';
import { Card } from './Card';
import { generateRandomName } from '../utils/nameGenerator';

interface RoomState {
    gameState: GameState | null;
    roomInfo: RoomInfo | null;
    myRole: 'SPECTATOR' | 'PLAYER' | null;
    myPlayerId?: number;
    myClientId?: string;
    error: string | null;
    chatMessages: ChatMessage[];
}

export const RoomView: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [room, setRoom] = useState<RoomState>({
        gameState: null,
        roomInfo: null,
        myRole: null,
        error: null,
        chatMessages: []
    });
    const [isConnected, setIsConnected] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [selectedPawns, setSelectedPawns] = useState<number[]>([]);

    const handleMessage = useCallback((message: ServerMessage) => {
        console.log('Received message:', message);

        switch (message.type) {
        case 'ROOM_STATE':
            setRoom(prev => ({ 
            ...prev, 
            gameState: message.state, 
            roomInfo: message.room, 
            error: null 
            }));
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

        case 'CHAT_MESSAGE':
            setRoom(prev => ({
            ...prev,
            chatMessages: [...prev.chatMessages, {
                clientId: message.clientId,
                playerName: message.playerName,
                message: message.message,
                timestamp: message.timestamp
            }]
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

        const state = location.state as any;
        let name = state?.playerName || localStorage.getItem('playerName') || '';
        
        // Generate random name if empty
        if (!name.trim()) {
        name = generateRandomName();
        localStorage.setItem('playerName', name);
        }
        
        setPlayerName(name);

        socketManager.connect(roomId, handleMessage);

        return () => {
        socketManager.disconnect(handleMessage);
        };
    }, [roomId, navigate, handleMessage, location.state]);

    const handleBecomePlayer = () => {
        socketManager.becomePlayer(playerName);
    };

    const handleStartGame = () => {
        socketManager.startGame();
    };

    const handleSettingChange = (key: 'maxPlayers' | 'teamsEnabled' | 'private', value: any) => {
        socketManager.setSettings({ [key]: value });
    };

    const handleSendChat = (message: string) => {
        socketManager.sendChat(message);
    };

    const handleCardClick = (cardId: string) => {
        setSelectedCard(selectedCard === cardId ? null : cardId);
        setSelectedPawns([]);
    };

    const handlePawnClick = (pawnId: number) => {
        if (selectedPawns.includes(pawnId)) {
        setSelectedPawns(selectedPawns.filter(id => id !== pawnId));
        } else {
        setSelectedPawns([...selectedPawns, pawnId]);
        }
    };

    const handlePlayCard = () => {
        if (!selectedCard) return;
        socketManager.playCard(selectedCard, selectedPawns.length > 0 ? selectedPawns : undefined);
        setSelectedCard(null);
        setSelectedPawns([]);
    };

    const handleEndTurn = () => {
        socketManager.endTurn();
        setSelectedCard(null);
        setSelectedPawns([]);
    };

    const copyRoomCode = () => {
        if (roomId) {
        navigator.clipboard.writeText(roomId);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const { gameState, roomInfo, myRole, myPlayerId, error, chatMessages } = room;
    const isInLobby = !gameState || gameState.phase === 'LOBBY';
    const isAdmin = roomInfo?.adminClientId && myPlayerId !== undefined && 
                    roomInfo.players.find(p => p.playerId === myPlayerId)?.clientId === roomInfo.adminClientId;
    const playerCount = roomInfo?.players.length || 0;
    const maxPlayers = roomInfo?.settings.maxPlayers || 4;
    const isMyTurn = gameState && gameState.turnIndex === myPlayerId;

    if (!isConnected) {
        return (
        <div style={{
            minHeight: '100vh',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{ textAlign: 'center' }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #334155',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
            }} />
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>Connecting...</p>
            </div>
        </div>
        );
    }

    return (
        <div style={{
        minHeight: '100vh',
        background: '#0f172a',
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
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            fontWeight: '500'
            }}>
            ⚠️ {error}
            </div>
        )}

        {/* Header */}
        <div style={{
            background: '#1e293b',
            borderBottom: '1px solid #334155',
            padding: '16px 24px'
        }}>
            <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                onClick={() => navigate('/')}
                style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#94a3b8',
                    background: 'transparent',
                    border: '2px solid #334155',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#475569';
                    e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#334155';
                    e.currentTarget.style.color = '#94a3b8';
                }}
                >
                ← Leave
                </button>
                <div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '2px' }}>
                    Room Code
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                    fontFamily: 'monospace',
                    letterSpacing: '0.2em'
                    }}>
                    {roomId}
                    </code>
                    <button
                    onClick={copyRoomCode}
                    style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        background: copiedCode ? '#10b981' : '#334155',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    >
                    {copiedCode ? '✓' : '📋'}
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>

        {isInLobby ? (
            /* LOBBY VIEW */
            <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '32px 24px'
            }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 380px',
                gap: '24px'
            }}>
                {/* Left: Players + Chat */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Players Section */}
                <div style={{
                    background: '#1e293b',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #334155'
                }}>
                    <h2 style={{
                    margin: '0 0 20px 0',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: 'white'
                    }}>
                    Players <span style={{ color: '#64748b' }}>({playerCount}/{maxPlayers})</span>
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {roomInfo?.players.map((player: PlayerInfo) => {
                        const isMe = player.playerId === myPlayerId;
                        const isRoomAdmin = player.clientId === roomInfo.adminClientId;
                        
                        return (
                        <div key={player.playerId} style={{
                            padding: '16px',
                            background: isMe ? '#334155' : '#0f172a',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: isMe ? '2px solid #3b82f6' : '2px solid transparent',
                            transition: 'all 0.2s'
                        }}>
                            <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${getPlayerColor(player.playerId)})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: 'white',
                            flexShrink: 0
                            }}>
                            {(player.name || `P${player.playerId + 1}`).charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontWeight: '600',
                                color: 'white',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                                }}>
                                {player.name || `Player ${player.playerId + 1}`}
                                </span>
                                {isRoomAdmin && <span>👑</span>}
                                {isMe && (
                                <span style={{
                                    fontSize: '12px',
                                    padding: '2px 8px',
                                    background: '#3b82f6',
                                    borderRadius: '4px',
                                    fontWeight: '500'
                                }}>
                                    YOU
                                </span>
                                )}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                {isRoomAdmin ? 'Host' : 'Player'}
                            </div>
                            </div>
                        </div>
                        );
                    })}

                    {playerCount < maxPlayers && Array.from({ length: maxPlayers - playerCount }).map((_, idx) => (
                        <div key={`empty-${idx}`} style={{
                        padding: '16px',
                        background: '#0f172a',
                        borderRadius: '12px',
                        border: '2px dashed #334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569',
                        fontSize: '14px',
                        fontWeight: '500'
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
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'white',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Join Game
                    </button>
                    )}
                </div>

                {/* Chat */}
                <div style={{ height: '400px' }}>
                    <Chat 
                    messages={chatMessages} 
                    onSendMessage={handleSendChat}
                    myClientId={roomInfo?.players.find(p => p.playerId === myPlayerId)?.clientId}
                    />
                </div>
                </div>

                {/* Right: Settings & Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Settings */}
                <div style={{
                    background: '#1e293b',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #334155'
                }}>
                    <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white'
                    }}>
                    Settings
                    </h3>

                    {isAdmin ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#94a3b8',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            Max Players
                        </label>
                        <select
                            value={maxPlayers}
                            onChange={(e) => handleSettingChange('maxPlayers', parseInt(e.target.value))}
                            style={{
                            width: '100%',
                            padding: '12px',
                            background: '#0f172a',
                            border: '2px solid #334155',
                            borderRadius: '8px',
                            fontSize: '15px',
                            color: 'white',
                            cursor: 'pointer',
                            outline: 'none'
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
                        background: '#0f172a',
                        borderRadius: '8px',
                        border: '2px solid #334155'
                        }}>
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            onChange={(e) => handleSettingChange('teamsEnabled', e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px', color: 'white', fontWeight: '500' }}>
                            Enable Teams
                        </span>
                        </label>

                        <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '12px',
                        background: '#0f172a',
                        borderRadius: '8px',
                        border: '2px solid #334155'
                        }}>
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            onChange={(e) => handleSettingChange('private', e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px', color: 'white', fontWeight: '500' }}>
                            Private Room
                        </span>
                        </label>
                    </div>
                    ) : (
                    <div style={{
                        padding: '16px',
                        background: '#0f172a',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#64748b',
                        textAlign: 'center',
                        border: '2px solid #334155'
                    }}>
                        Only the host can change settings
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
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'white',
                        background: playerCount >= 2
                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        : '#334155',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: playerCount >= 2 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (playerCount >= 2) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                    {playerCount < 2 ? 'Need 2+ Players' : '🚀 Start Game'}
                    </button>
                )}

                {!isAdmin && myRole === 'PLAYER' && (
                    <div style={{
                    padding: '20px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '15px'
                    }}>
                    Waiting for host to start...
                    </div>
                )}
                </div>
            </div>
            </div>
        ) : (
            /* GAME VIEW */
            <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: '24px',
            minHeight: 'calc(100vh - 100px)'
            }}>
            {/* Main Game Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Turn Indicator */}
                <div style={{
                background: isMyTurn ? '#10b981' : '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '16px 24px',
                textAlign: 'center'
                }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>
                    {isMyTurn ? "🎯 Your Turn!" : `Waiting for ${gameState.players[gameState.turnIndex]?.hand ? 'Player ' + (gameState.turnIndex + 1) : 'player...'}`}
                </div>
                </div>

                {/* Game Board */}
                <div style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                justifyContent: 'center'
                }}>
                <GameBoard
                    gameState={gameState}
                    myPlayerId={myPlayerId}
                    onPawnClick={handlePawnClick}
                    selectedPawns={selectedPawns}
                />
                </div>

                {/* Player Hand */}
                {myRole === 'PLAYER' && gameState.players[myPlayerId!] && (
                <div style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '16px',
                    padding: '24px'
                }}>
                    <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white'
                    }}>
                    Your Cards
                    </h3>
                    <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                    }}>
                    {gameState.players[myPlayerId!].hand.map(card => (
                        <Card
                        key={card.id}
                        card={card}
                        onClick={() => handleCardClick(card.id)}
                        selected={selectedCard === card.id}
                        disabled={!isMyTurn}
                        size="large"
                        />
                    ))}
                    </div>

                    {/* Action Buttons */}
                    {isMyTurn && (
                    <div style={{
                        marginTop: '20px',
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center'
                    }}>
                        <button
                        onClick={handlePlayCard}
                        disabled={!selectedCard}
                        style={{
                            padding: '14px 32px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'white',
                            background: selectedCard ? '#10b981' : '#334155',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: selectedCard ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s'
                        }}
                        >
                        Play Card
                        </button>
                        <button
                        onClick={handleEndTurn}
                        style={{
                            padding: '14px 32px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'white',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        >
                        End Turn
                        </button>
                    </div>
                    )}
                </div>
                )}
            </div>

            {/* Right Sidebar: Players + Chat */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Mini Players List */}
                <div style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '16px'
                }}>
                <h3 style={{
                    margin: '0 0 12px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white'
                }}>
                    Players
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {gameState.players.map((player, idx) => {
                    const info = roomInfo?.players.find(p => p.playerId === idx);
                    const isCurrent = gameState.turnIndex === idx;
                    return (
                        <div
                        key={idx}
                        style={{
                            padding: '8px 12px',
                            background: isCurrent ? '#334155' : '#0f172a',
                            borderRadius: '8px',
                            border: isCurrent ? '2px solid #10b981' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        >
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${getPlayerColor(idx)})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: 'white',
                            flexShrink: 0
                        }}>
                            {(info?.name || `P${idx + 1}`).charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'white',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                            }}>
                            {info?.name || `Player ${idx + 1}`}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {player.hand.length} cards
                            </div>
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>

                {/* Chat */}
                <div style={{ flex: 1, minHeight: '400px' }}>
                <Chat 
                    messages={chatMessages} 
                    onSendMessage={handleSendChat}
                    myClientId={roomInfo?.players.find(p => p.playerId === myPlayerId)?.clientId}
                />
                </div>
            </div>
            </div>
        )}

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

function getPlayerColor(playerId: number): string {
    const colors = [
        '#3b82f6, #2563eb', // blue
        '#10b981, #059669', // green
        '#f59e0b, #d97706', // orange
        '#ef4444, #dc2626', // red
        '#8b5cf6, #7c3aed', // purple
        '#ec4899, #db2777', // pink
        '#06b6d4, #0891b2', // cyan
        '#f97316, #ea580c', // orange-red
    ];
    return colors[playerId % colors.length];
}