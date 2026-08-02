import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js';
import { PlayerInfo, mapRowToApiShape, systemChatMessage, RoomRow } from '../../_lib/roomTypes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const code = String(req.query.code).toUpperCase();
  const { player } = req.body ?? {};

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message });
  }
  if (!existing) {
    return res.status(404).json({ error: 'Room tidak ditemukan' });
  }

  const room = existing as RoomRow;

  if (room.host.id === player.id) {
    return res.status(200).json({ success: true, room: mapRowToApiShape(room), role: 'host' });
  }

  if (room.guest && room.guest.id === player.id) {
    return res.status(200).json({ success: true, room: mapRowToApiShape(room), role: 'guest' });
  }

  if (room.guest && room.guest.id !== player.id) {
    // Slot pemain sudah penuh -> gabung sebagai penonton.
    return res.status(200).json({ success: true, room: mapRowToApiShape(room), role: 'spectator' });
  }

  // Gabung sebagai Guest (pemain ke-2)
  const guestPlayer: PlayerInfo = {
    id: player.id,
    name: player.name || player.username || 'PrajuritGuest',
    avatar: player.avatar || '🛡️',
    rating: player.rating || 1200,
    color: room.host.color === 'w' ? 'b' : 'w'
  };

  const updatedChat = [
    ...(room.chat_messages ?? []),
    systemChatMessage(`${guestPlayer.name} telah bergabung! Pertandingan dimulai.`)
  ];

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('rooms')
    .update({ guest: guestPlayer, status: 'active', chat_messages: updatedChat })
    .eq('code', code)
    .select()
    .single();

  if (updateError || !updated) {
    return res.status(500).json({ error: updateError?.message || 'Gagal bergabung ke room' });
  }

  return res.status(200).json({ success: true, room: mapRowToApiShape(updated as RoomRow), role: 'guest' });
}
