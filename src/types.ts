export type GameMode = 'ai' | 'local' | 'online';

export type AILevel = 'easy' | 'medium' | 'hard' | 'master' | 'custom';

export interface AILevelConfig {
  id: AILevel;
  name: string;
  depth: number;
  skill: string;
  elo: number;
  description: string;
  badgeColor: string;
}

export interface TimeControl {
  id: string;
  name: string;
  minutes: number;
  increment: number;
  label: string;
}

export type BoardTheme = 'default' | 'wood' | 'emerald' | 'glass' | 'canvas' | 'cyber';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  color: 'w' | 'b';
  isAI?: boolean;
  isGuest?: boolean;
}

export interface MoveRecord {
  moveNumber: number;
  san: string;
  fenAfter: string;
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  timeSpentMs?: number;
  evalScore?: number;
  annotation?: 'brilliant' | 'great' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
}

export interface CapturedPieces {
  p: number;
  n: number;
  b: number;
  r: number;
  q: number;
}

export interface GameState {
  id: string;
  mode: GameMode;
  fen: string;
  pgn: string;
  history: MoveRecord[];
  currentTurn: 'w' | 'b';
  playerWhite: Player;
  playerBlack: Player;
  status: 'ongoing' | 'checkmate' | 'draw' | 'stalemate' | 'resigned' | 'timeout' | 'aborted';
  winner?: 'w' | 'b' | 'draw';
  timeWhite: number; // in seconds
  timeBlack: number; // in seconds
  timeControl: TimeControl;
  evalScore: number; // Centipawns positive for White, negative for Black
  isMateIn?: number;
  bestMoveSuggestion?: { from: string; to: string; san: string };
  aiLevel?: AILevel;
  roomCode?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface Room {
  code: string;
  host: Player;
  guest?: Player;
  status: 'waiting' | 'active' | 'finished';
  timeControl: TimeControl;
  fen: string;
  pgn: string;
  history: MoveRecord[];
  chatMessages: ChatMessage[];
  viewersCount: number;
  currentTurn: 'w' | 'b';
  drawOfferedBy?: string;
  rematchOfferedBy?: string;
  lastMoveTimestamp?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  isGuest: boolean;
  friends: string[];
  createdDate: string;
}

export interface UserSettings {
  boardTheme: BoardTheme;
  soundEnabled: boolean;
  soundVolume: number;
  autoFlip: boolean;
  highlightLegalMoves: boolean;
  showEvalBar: boolean;
  showBestMoveHint: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  isOnline: boolean;
}
