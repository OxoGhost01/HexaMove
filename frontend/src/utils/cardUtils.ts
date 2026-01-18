// src/utils/cardUtils.ts
import type { CardType } from '../types/protocol';

export interface CardDisplay {
    label: string;
    color: string;
    bgColor: string;
    description: string;
    diceCount?: number;
}

export function getCardDisplay(type: CardType): CardDisplay {
    switch (type) {
        case 'START_1':
        return {
            label: '1',
            color: '#059669',
            bgColor: '#f0fdf4',
            description: 'Démarrer ou avancer 1',
            diceCount: 1
        };
        case '2':
        return {
            label: '2',
            color: '#2563eb',
            bgColor: '#eff6ff',
            description: 'Avancer 2',
            diceCount: 2
        };
        case '3':
        return {
            label: '3',
            color: '#2563eb',
            bgColor: '#eff6ff',
            description: 'Avancer 3',
            diceCount: 3
        };
        case 'BACK_4':
        return {
            label: '4',
            color: '#dc2626',
            bgColor: '#fef2f2',
            description: 'Reculer 4',
            diceCount: 4
        };
        case '5':
        return {
            label: '5',
            color: '#2563eb',
            bgColor: '#eff6ff',
            description: 'Avancer 5',
            diceCount: 5
        };
        case '6':
        return {
            label: '6',
            color: '#2563eb',
            bgColor: '#eff6ff',
            description: 'Avancer 6',
            diceCount: 6
        };
        case 'SPLIT_7':
        return {
            label: '7',
            color: '#ea580c',
            bgColor: '#fff7ed',
            description: 'Partager 7',
            diceCount: 7
        };
        case '8':
        return {
            label: '8',
            color: '#2563eb',
            bgColor: '#eff6ff',
            description: 'Avancer 8',
            diceCount: 8
        };
        case '9':
        return {
            label: '9',
            color: '#2563eb',
            bgColor: '#eff6ff',
            description: 'Avancer 9',
            diceCount: 9
        };
        case 'START_10':
        return {
            label: '10',
            color: '#059669',
            bgColor: '#f0fdf4',
            description: 'Démarrer ou avancer 10',
            diceCount: 10
        };
        case '12':
        return {
            label: '12',
            color: '#2563eb',
            bgColor: '#eff6ff',
            description: 'Avancer 12',
            diceCount: 12
        };
        case 'SWAP':
        return {
            label: 'PERMUTER',
            color: '#7c3aed',
            bgColor: '#faf5ff',
            description: 'Échanger 2 pions'
        };
        case 'JOKER':
        return {
            label: 'JOKER',
            color: '#be123c',
            bgColor: '#fff1f2',
            description: 'Utiliser comme n\'importe quelle carte'
        };
    }
}

// Render dice dots based on count
export function renderDiceDots(count: number): string[][] {
    const patterns: Record<number, string[][]> = {
        1: [['•', '', ''], ['', '', ''], ['', '', '']],
        2: [['•', '', ''], ['', '', ''], ['', '', '•']],
        3: [['•', '', ''], ['', '•', ''], ['', '', '•']],
        4: [['•', '', '•'], ['', '', ''], ['•', '', '•']],
        5: [['•', '', '•'], ['', '•', ''], ['•', '', '•']],
        6: [['•', '', '•'], ['•', '', '•'], ['•', '', '•']],
        7: [['•', '•', '•'], ['', '•', ''], ['•', '•', '•']],
        8: [['•', '•', '•'], ['•', '', '•'], ['•', '•', '•']],
        9: [['•', '•', '•'], ['•', '•', '•'], ['•', '•', '•']],
        10: [['•', '•', '•'], ['•', '•', '•'], ['•', '•', '•', '•']],
        12: [['•', '•', '•', '•'], ['•', '•', '•', '•'], ['•', '•', '•', '•']]
    };
    
    return patterns[count] || [['', '', ''], ['', '', ''], ['', '', '']];
}