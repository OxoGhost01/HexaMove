// src/components/GameBoard.tsx
import React from 'react';
import type { GameState, Pawn } from '../types/protocol';

interface GameBoardProps {
    gameState: GameState;
    myPlayerId?: number;
    onPawnClick?: (pawnId: number) => void;
    selectedPawns?: number[];
}

export const GameBoard: React.FC<GameBoardProps> = ({
    gameState,
    myPlayerId,
    onPawnClick,
    selectedPawns = []
    }) => {
    const { board, players } = gameState;
    const boardSize = 700;
    const center = boardSize / 2;
    const trackRadius = 240;
    const baseDistance = 300;

    // Calculate position for track index
    const getTrackPosition = (index: number): { x: number; y: number } => {
        const angle = (index / board.trackLength) * Math.PI * 2 - Math.PI / 2;
        return {
        x: center + Math.cos(angle) * trackRadius,
        y: center + Math.sin(angle) * trackRadius
        };
    };

    // Calculate base position
    const getBasePosition = (playerId: number, pawnIndex: number): { x: number; y: number } => {
        const playerAngle = (playerId / board.playerCount) * Math.PI * 2 - Math.PI / 2;
        const baseX = center + Math.cos(playerAngle) * baseDistance;
        const baseY = center + Math.sin(playerAngle) * baseDistance;
        
        // Arrange 4 pawns in a 2x2 grid within the base
        const offsetX = (pawnIndex % 2) * 24 - 12;
        const offsetY = Math.floor(pawnIndex / 2) * 24 - 12;
        
        return { x: baseX + offsetX, y: baseY + offsetY };
    };

    // Calculate home path position
    const getHomePosition = (playerId: number, homeIndex: number): { x: number; y: number } => {
        const startIndex = board.startIndices[playerId];
        const trackPos = getTrackPosition(startIndex);
        const angle = (playerId / board.playerCount) * Math.PI * 2 - Math.PI / 2;
        
        const distance = 40 + homeIndex * 36;
        return {
        x: trackPos.x + Math.cos(angle) * distance,
        y: trackPos.y + Math.sin(angle) * distance
        };
    };

    // Get pawn position based on location
    const getPawnPosition = (pawn: Pawn): { x: number; y: number } => {
        switch (pawn.location.type) {
        case 'BASE':
            const baseIndex = players[pawn.ownerId].pawns.filter(p => 
            p.location.type === 'BASE'
            ).indexOf(pawn);
            return getBasePosition(pawn.ownerId, baseIndex);
        
        case 'TRACK':
            return getTrackPosition(pawn.location.index);
        
        case 'HOME':
            return getHomePosition(pawn.ownerId, pawn.location.index);
        
        case 'START':
            const startIdx = board.startIndices[pawn.ownerId];
            return getTrackPosition(startIdx);
        
        case 'FINISHED':
            return getHomePosition(pawn.ownerId, 3);
        }
    };

    const getPlayerColor = (playerId: number): string => {
        const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
        return colors[playerId % colors.length];
    };

    return (
        <div style={{ 
        position: 'relative', 
        width: boardSize, 
        height: boardSize, 
        margin: '0 auto',
        background: 'linear-gradient(135deg, #daa520 0%, #b8860b 100%)',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3), inset 0 0 100px rgba(0,0,0,0.1)',
        border: '8px solid #8b6914'
        }}>
        <svg width={boardSize} height={boardSize} style={{ borderRadius: '12px' }}>
            {/* Decorative center */}
            <circle
            cx={center}
            cy={center}
            r="50"
            fill="#8b6914"
            stroke="#654321"
            strokeWidth="3"
            />
            <text
            x={center}
            y={center + 8}
            textAnchor="middle"
            fill="#daa520"
            fontSize="28"
            fontWeight="bold"
            fontFamily="serif"
            >
            TAC-TIK
            </text>
            
            {/* Track spots */}
            {Array.from({ length: board.trackLength }).map((_, index) => {
            const pos = getTrackPosition(index);
            const isStart = board.startIndices.includes(index);
            const startPlayerId = board.startIndices.indexOf(index);
            
            return (
                <g key={`track-${index}`}>
                <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="15"
                    fill={isStart ? getPlayerColor(startPlayerId) : '#654321'}
                    stroke="#3e2a1a"
                    strokeWidth="2"
                    opacity={isStart ? 0.8 : 0.5}
                />
                {isStart && (
                    <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="8"
                    fill="white"
                    opacity="0.6"
                    />
                )}
                </g>
            );
            })}

            {/* Base areas */}
            {players.map((_, playerId) => {
            const playerAngle = (playerId / board.playerCount) * Math.PI * 2 - Math.PI / 2;
            const baseX = center + Math.cos(playerAngle) * baseDistance;
            const baseY = center + Math.sin(playerAngle) * baseDistance;
            const color = getPlayerColor(playerId);
            
            return (
                <g key={`base-${playerId}`}>
                {/* Base rectangle */}
                <rect
                    x={baseX - 45}
                    y={baseY - 45}
                    width="90"
                    height="90"
                    rx="12"
                    fill={color}
                    stroke="#3e2a1a"
                    strokeWidth="3"
                    opacity="0.3"
                />
                {/* 4 spots for pawns */}
                {[0, 1, 2, 3].map(spot => {
                    const offsetX = (spot % 2) * 24 - 12;
                    const offsetY = Math.floor(spot / 2) * 24 - 12;
                    return (
                    <circle
                        key={`base-spot-${playerId}-${spot}`}
                        cx={baseX + offsetX}
                        cy={baseY + offsetY}
                        r="10"
                        fill={color}
                        stroke="#3e2a1a"
                        strokeWidth="2"
                        opacity="0.4"
                    />
                    );
                })}
                </g>
            );
            })}

            {/* Home paths */}
            {players.map((_, playerId) => {
            return Array.from({ length: board.homeLength }).map((_, homeIdx) => {
                const pos = getHomePosition(playerId, homeIdx);
                const color = getPlayerColor(playerId);
                return (
                <circle
                    key={`home-${playerId}-${homeIdx}`}
                    cx={pos.x}
                    cy={pos.y}
                    r="12"
                    fill={color}
                    stroke="#3e2a1a"
                    strokeWidth="2"
                    opacity="0.5"
                />
                );
            });
            })}

            {/* Pawns */}
            {players.flatMap(player => 
            player.pawns.map(pawn => {
                const pos = getPawnPosition(pawn);
                const color = getPlayerColor(pawn.ownerId);
                const isSelected = selectedPawns.includes(pawn.id);
                const isMyPawn = pawn.ownerId === myPlayerId;
                
                return (
                <g 
                    key={`pawn-${pawn.id}`}
                    onClick={() => isMyPawn && onPawnClick?.(pawn.id)}
                    style={{ cursor: isMyPawn ? 'pointer' : 'default' }}
                >
                    {/* Shadow */}
                    <ellipse
                    cx={pos.x + 2}
                    cy={pos.y + 18}
                    rx="10"
                    ry="4"
                    fill="rgba(0,0,0,0.3)"
                    />
                    {/* Pawn body */}
                    <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? '20' : '16'}
                    fill={color}
                    stroke={isSelected ? 'white' : '#3e2a1a'}
                    strokeWidth={isSelected ? '4' : '3'}
                    style={{
                        filter: isSelected ? `drop-shadow(0 0 12px ${color})` : 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
                        transition: 'all 0.2s'
                    }}
                    />
                    {/* Highlight */}
                    <circle
                    cx={pos.x - 5}
                    cy={pos.y - 5}
                    r="4"
                    fill="white"
                    opacity="0.6"
                    />
                    {/* Pieu marker */}
                    {pawn.isPieu && (
                    <g>
                        <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="8"
                        fill="#fbbf24"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        />
                        <text
                        x={pos.x}
                        y={pos.y + 4}
                        textAnchor="middle"
                        fill="#78350f"
                        fontSize="10"
                        fontWeight="bold"
                        >
                        P
                        </text>
                    </g>
                    )}
                </g>
                );
            })
            )}
        </svg>
        </div>
    );
};