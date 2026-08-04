import { AILevelConfig, TimeControl, BoardTheme } from '../types';

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const AI_LEVELS: AILevelConfig[] = [
  {
    id: 'easy',
    name: 'Easy (Pemula)',
    depth: 5,
    skill: 'Pemula',
    elo: 800,
    description: 'Cocok untuk belajar & pemain kasual. Membuat beberapa blunder.',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    limitStrength: true,
    skillLevel: 0,
    movetimeMs: 300
  },
  {
    id: 'medium',
    name: 'Medium (Menengah)',
    depth: 8,
    skill: 'Menengah',
    elo: 1500,
    description: 'Tantangan seimbang dengan pemahaman taktik dasar.',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    limitStrength: true,
    skillLevel: 8,
    movetimeMs: 800
  },
  {
    id: 'hard',
    name: 'Hard (Klub)',
    depth: 12,
    skill: 'Pemain Klub',
    elo: 1900,
    description: 'Bermain sangat presisi, memanfaatkan kesalahan lawan dengan cepat.',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    limitStrength: true,
    skillLevel: 15,
    movetimeMs: 2000
  },
  {
    id: 'master',
    name: 'Master (Stockfish 18)',
    depth: 18,
    skill: 'Master',
    elo: 3000,
    description: 'Kekuatan penuh Stockfish 18. Praktis tanpa cela.',
    badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    limitStrength: false,
    skillLevel: 20,
    movetimeMs: 4000
  },
  {
    id: 'custom',
    name: 'Kustom (Atur Depth)',
    depth: 8,
    skill: 'Kustom',
    elo: 1800,
    description: 'Tentukan kedalaman analisis engine dari depth 1 hingga 15.',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    limitStrength: false,
    skillLevel: 20,
    movetimeMs: 0
  }
];

export const TIME_CONTROLS: TimeControl[] = [
  { id: 'unlimited', name: 'Tanpa Waktu', minutes: 0, increment: 0, label: 'Santai' },
  { id: '1m', name: '1 Menit Bullet', minutes: 1, increment: 0, label: '1m Bullet' },
  { id: '3m', name: '3 Menit Blitz', minutes: 3, increment: 0, label: '3m Blitz' },
  { id: '5m', name: '5 Menit Blitz', minutes: 5, increment: 3, label: '5m+3s Blitz' },
  { id: '10m', name: '10 Menit Rapid', minutes: 10, increment: 0, label: '10m Rapid' },
  { id: '15m', name: '15 Menit Classical', minutes: 15, increment: 10, label: '15m+10s' }
];

export const BOARD_THEMES: { id: BoardTheme; name: string; lightSquare: string; darkSquare: string }[] = [
  { id: 'default', name: 'Prajurit Classic', lightSquare: '#f0d9b5', darkSquare: '#b58863' },
  { id: 'emerald', name: 'Emerald Green', lightSquare: '#eeeed2', darkSquare: '#769656' },
  { id: 'wood', name: 'Natural Wood', lightSquare: '#e3c193', darkSquare: '#9c6f44' },
  { id: 'glass', name: 'Dark Cyber Glass', lightSquare: '#334155', darkSquare: '#1e293b' },
  { id: 'canvas', name: 'Minimalist Monochr', lightSquare: '#e2e8f0', darkSquare: '#64748b' },
  { id: 'cyber', name: 'Prajurit Pink Neo', lightSquare: '#fce7f3', darkSquare: '#fe4c6f' }
];

export const AVATARS = [
  '👑', '♟️', '🦄', '🦁', '🐉', '⚔️', '🛡️', '⚡', '🦅', '🐺', '🔥', '💎'
];
