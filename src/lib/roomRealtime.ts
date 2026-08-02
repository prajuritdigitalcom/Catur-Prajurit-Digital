import { Player, MoveRecord, ChatMessage } from '../types';

// Bentuk baris mentah dari tabel Postgres `rooms` (snake_case), persis
// seperti yang dikirim oleh event Realtime Supabase.
export interface RoomRow {
  code: string;
  host: Player;
  guest: Player | null;
  status: 'waiting' | 'active' | 'finished';
  time_control: { id: string; name: string; minutes: number; increment: number; label: string };
  fen: string;
  pgn: string;
  history: MoveRecord[];
  chat_messages: ChatMessage[];
  current_turn: 'w' | 'b';
  draw_offered_by: string | null;
  winner: 'w' | 'b' | 'draw' | null;
  status_reason: string | null;
}

export interface RoomApiShape {
  code: string;
  host: Player;
  guest?: Player;
  status: 'waiting' | 'active' | 'finished';
  timeControl: { id: string; name: string; minutes: number; increment: number; label: string };
  fen: string;
  pgn: string;
  history: MoveRecord[];
  chatMessages: ChatMessage[];
  currentTurn: 'w' | 'b';
  drawOfferedBy?: string;
  winner?: 'w' | 'b' | 'draw';
  statusReason?: string;
  viewersCount: number;
}

// Sengaja ditulis terpisah dari api/_lib/roomTypes.ts (bukan diimpor
// bersama) karena file di /api dan /src masuk ke dua target build yang
// berbeda (Vercel Functions vs bundel Vite untuk browser).
export function mapRoomRowToApiShape(row: RoomRow): RoomApiShape {
  return {
    code: row.code,
    host: row.host,
    guest: row.guest ?? undefined,
    status: row.status,
    timeControl: row.time_control,
    fen: row.fen,
    pgn: row.pgn,
    history: row.history ?? [],
    chatMessages: row.chat_messages ?? [],
    currentTurn: row.current_turn,
    drawOfferedBy: row.draw_offered_by ?? undefined,
    winner: row.winner ?? undefined,
    statusReason: row.status_reason ?? undefined,
    viewersCount: (row.host ? 1 : 0) + (row.guest ? 1 : 0)
  };
}
