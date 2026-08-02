import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js';
import { RoomRow, systemChatMessage } from '../../_lib/roomTypes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const code = String(req.query.code).toUpperCase();
  const { action, playerId } = req.body ?? {};

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
  const chat = [...(room.chat_messages ?? [])];
  const update: Partial<RoomRow> = {};

  if (action === 'resign') {
    const isHostResigned = room.host.id === playerId;
    const winner = isHostResigned ? (room.host.color === 'w' ? 'b' : 'w') : room.host.color;
    const statusReason = `${isHostResigned ? room.host.name : room.guest?.name || 'Lawan'} telah menyerah (Resign).`;
    update.status = 'finished';
    update.winner = winner;
    update.status_reason = statusReason;
    chat.push(systemChatMessage(statusReason));
  } else if (action === 'offer_draw') {
    update.draw_offered_by = playerId;
    const offerName = room.host.id === playerId ? room.host.name : room.guest?.name || 'Lawan';
    chat.push(systemChatMessage(`${offerName} menawarkan hasil Remis (Draw).`));
  } else if (action === 'accept_draw') {
    const statusReason = 'Pertandingan berakhir Remis atas kesepakatan bersama.';
    update.status = 'finished';
    update.winner = 'draw';
    update.status_reason = statusReason;
    chat.push(systemChatMessage(statusReason));
  } else if (action === 'checkmate') {
    const winnerColor = req.body.winnerColor as 'w' | 'b';
    const winnerName = room.host.color === winnerColor ? room.host.name : room.guest?.name || 'Lawan';
    const statusReason = `Skakmat (Checkmate)! Selamat kepada ${winnerName}.`;
    update.status = 'finished';
    update.winner = winnerColor;
    update.status_reason = statusReason;
    chat.push(systemChatMessage(statusReason));
  } else {
    return res.status(400).json({ error: 'Action tidak dikenali' });
  }

  update.chat_messages = chat;

  const { error: updateError } = await supabaseAdmin.from('rooms').update(update).eq('code', code);

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  res.status(200).json({ success: true });
}
