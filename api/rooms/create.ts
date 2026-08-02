import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { PlayerInfo, generateRoomCode, mapRowToApiShape, systemChatMessage, RoomRow } from '../_lib/roomTypes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { host, timeControl } = req.body ?? {};
  if (!host || !timeControl) {
    return res.status(400).json({ error: 'Missing host or timeControl parameter' });
  }

  // Cari kode room unik (retry beberapa kali kalau kebetulan bentrok).
  let code = generateRoomCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabaseAdmin.from('rooms').select('code').eq('code', code).maybeSingle();
    if (!existing) break;
    code = generateRoomCode();
  }

  const hostPlayer: PlayerInfo = {
    id: host.id,
    name: host.name || host.username || 'PrajuritGuest',
    avatar: host.avatar || '⚔️',
    rating: host.rating || 1200,
    color: Math.random() < 0.5 ? 'w' : 'b'
  };

  const { data, error } = await supabaseAdmin
    .from('rooms')
    .insert({
      code,
      host: hostPlayer,
      status: 'waiting',
      time_control: timeControl,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      pgn: '',
      history: [],
      chat_messages: [systemChatMessage(`Room dibuat dengan kode [${code}]. Bagikan kode ke teman untuk bergabung!`)],
      current_turn: 'w'
    })
    .select()
    .single();

  if (error || !data) {
    return res.status(500).json({ error: error?.message || 'Gagal membuat room' });
  }

  return res.status(200).json({ success: true, roomCode: code, room: mapRowToApiShape(data as RoomRow) });
}
