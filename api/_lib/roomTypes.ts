export interface PlayerInfo {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  color: 'w' | 'b';
}

export interface MovePayload {
  from: string;
  to: string;
  san: string;
  fenAfter: string;
  promotion?: string;
  playedBy: string;
}

export interface ChatMsg {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface TimeControlInfo {
  id: string;
  name: string;
  minutes: number;
  increment: number;
  label: string;
}

// Bentuk baris apa adanya di tabel Postgres `rooms` (snake_case).
export interface RoomRow {
  code: string;
  host: PlayerInfo;
  guest: PlayerInfo | null;
  status: 'waiting' | 'active' | 'finished';
  time_control: TimeControlInfo;
  fen: string;
  pgn: string;
  history: MovePayload[];
  chat_messages: ChatMsg[];
  current_turn: 'w' | 'b';
  draw_offered_by: string | null;
  winner: 'w' | 'b' | 'draw' | null;
  status_reason: string | null;
  created_at: string;
}

// Bentuk yang dikonsumsi frontend (camelCase) — sengaja dibuat sama persis
// dengan bentuk ServerRoom lama di server.ts supaya komponen React tidak
// perlu banyak berubah.
export interface RoomApiShape {
  code: string;
  host: PlayerInfo;
  guest?: PlayerInfo;
  status: 'waiting' | 'active' | 'finished';
  timeControl: TimeControlInfo;
  fen: string;
  pgn: string;
  history: MovePayload[];
  chatMessages: ChatMsg[];
  currentTurn: 'w' | 'b';
  drawOfferedBy?: string;
  winner?: 'w' | 'b' | 'draw';
  statusReason?: string;
  viewersCount: number;
}

export function mapRowToApiShape(row: RoomRow): RoomApiShape {
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
    // Catatan: tanpa SSE, kita tidak lagi menghitung jumlah koneksi live.
    // Sebagai gantinya, tampilkan jumlah partisipan (host + guest) yang
    // sudah bergabung ke room ini.
    viewersCount: (row.host ? 1 : 0) + (row.guest ? 1 : 0)
  };
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function systemChatMessage(message: string): ChatMsg {
  return {
    id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    senderId: 'system',
    senderName: 'Prajurit Digital Bot',
    message,
    timestamp: Date.now(),
    isSystem: true
  };
}
