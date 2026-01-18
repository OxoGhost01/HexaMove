// src/components/Card.tsx
import React from 'react';
import type { Card as CardType } from '../types/protocol';
import { getCardDisplay, renderDiceDots } from '../utils/cardUtils';

interface CardProps {
    card: CardType;
    onClick?: () => void;
    selected?: boolean;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({ 
    card, 
    onClick, 
    selected = false, 
    disabled = false,
    size = 'medium'
    }) => {
    const display = getCardDisplay(card.type);
    
    const sizes = {
        small: { width: '70px', height: '100px', fontSize: '14px', padding: '6px' },
        medium: { width: '90px', height: '130px', fontSize: '16px', padding: '8px' },
        large: { width: '110px', height: '160px', fontSize: '18px', padding: '10px' }
    };

    const { width, height, padding } = sizes[size];

    return (
        <div
        onClick={!disabled ? onClick : undefined}
        style={{
            width,
            height,
            background: disabled ? '#e5e7eb' : display.bgColor,
            border: `3px solid ${selected ? '#3b82f6' : disabled ? '#9ca3af' : display.color}`,
            borderRadius: '8px',
            padding,
            cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            opacity: disabled ? 0.6 : 1,
            boxShadow: selected ? `0 0 20px ${display.color}60` : '0 2px 4px rgba(0,0,0,0.1)',
            transform: selected ? 'translateY(-8px)' : 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        onMouseEnter={(e) => {
            if (!disabled && onClick) {
            e.currentTarget.style.transform = selected ? 'translateY(-8px)' : 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${display.color}40`;
            }
        }}
        onMouseLeave={(e) => {
            if (!selected) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }
        }}
        >
        {/* Top - Number/Label */}
        <div style={{
            fontSize: size === 'large' ? '32px' : size === 'medium' ? '28px' : '24px',
            fontWeight: 'bold',
            color: disabled ? '#6b7280' : display.color,
            lineHeight: 1
        }}>
            {display.label}
        </div>

        {/* Middle - Dice dots (if applicable) */}
        {display.diceCount && display.diceCount <= 9 && (
            <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px',
            padding: '4px'
            }}>
            {renderDiceDots(display.diceCount).map((row, i) =>
                row.map((dot, j) => (
                <div
                    key={`${i}-${j}`}
                    style={{
                    width: size === 'large' ? '8px' : '6px',
                    height: size === 'large' ? '8px' : '6px',
                    borderRadius: '50%',
                    background: dot ? (disabled ? '#6b7280' : display.color) : 'transparent'
                    }}
                />
                ))
            )}
            </div>
        )}

        {/* Bottom - Description */}
        <div style={{
            fontSize: size === 'large' ? '10px' : size === 'medium' ? '9px' : '8px',
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
        }}>
            {display.description}
        </div>
        </div>
    );
};