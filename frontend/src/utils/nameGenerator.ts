
const ADJECTIVES = [
    'Swift', 'Clever', 'Brave', 'Lucky', 'Mighty', 'Wise', 'Bold', 'Calm',
    'Daring', 'Fierce', 'Gentle', 'Happy', 'Jolly', 'Kind', 'Noble', 'Quick',
    'Silent', 'Witty', 'Zealous', 'Cosmic', 'Epic', 'Funky', 'Groovy', 'Hyper',
    'Icy', 'Jazzy', 'Laser', 'Mega', 'Neon', 'Omega', 'Pixel', 'Quantum',
    'Rad', 'Sonic', 'Turbo', 'Ultra', 'Vortex', 'Wild', 'Zen'
];

const NOUNS = [
    'Panda', 'Tiger', 'Eagle', 'Wolf', 'Bear', 'Fox', 'Lion', 'Shark',
    'Falcon', 'Dragon', 'Phoenix', 'Ninja', 'Wizard', 'Knight', 'Pirate', 'Viking',
    'Samurai', 'Ranger', 'Hunter', 'Warrior', 'Champion', 'Hero', 'Legend', 'Master',
    'Ace', 'Boss', 'Chief', 'Duke', 'King', 'Prince', 'Star', 'Comet',
    'Rocket', 'Bolt', 'Flash', 'Storm', 'Thunder', 'Blaze', 'Frost'
];

export function generateRandomName(): string {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const number = Math.floor(Math.random() * 100);
    return `${adjective}${noun}${number}`;
}