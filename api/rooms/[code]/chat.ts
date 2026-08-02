import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js';
import { ChatMsg, RoomRow } from '../../_lib/roomTypes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const code = String(req.query.code).toUpperCase();
  const { senderId, senderName, message } = req.body ?? {};

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('rooms')
    .select('chat_messages')
    .eq('code', code)
    .maybeSingle();

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message });
  }
  if (!existing) {
    return res.status(404).json({ error: 'Room tidak ditemukan' });
  }

  const room = existing as Pick<RoomRow, 'chat_messages'>;

  const msg: ChatMsg = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    senderId,
    senderName,
    message,
    timestamp: Date.now()
  };

  const { error: updateError } = await supabaseAdmin
    .from('rooms')
    .update({ chat_messages: [...(room.chat_messages ?? []), msg] })
    .eq('code', code);

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  res.status(200).json({ success: true, chatMessage: msg });
}
