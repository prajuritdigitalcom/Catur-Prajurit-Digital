import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_lib/supabaseAdmin';
import { MovePayload, RoomRow } from '../../_lib/roomTypes';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const code = String(req.query.code).toUpperCase();
  const { move } = (req.body ?? {}) as { move: MovePayload };

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
  if (room.status !== 'active') {
    return res.status(400).json({ error: 'Pertandingan belum aktif atau sudah selesai' });
  }

  const { error: updateError } = await supabaseAdmin
    .from('rooms')
    .update({
      fen: move.fenAfter,
      current_turn: room.current_turn === 'w' ? 'b' : 'w',
      history: [...(room.history ?? []), move],
      draw_offered_by: null
    })
    .eq('code', code);

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  res.status(200).json({ success: true });
}
