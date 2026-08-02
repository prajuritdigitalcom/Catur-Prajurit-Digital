import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js';
import { mapRowToApiShape, RoomRow } from '../../_lib/roomTypes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = String(req.query.code).toUpperCase();

  const { data, error } = await supabaseAdmin.from('rooms').select('*').eq('code', code).maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!data) {
    return res.status(404).json({ error: 'Room tidak ditemukan' });
  }

  res.status(200).json({ success: true, room: mapRowToApiShape(data as RoomRow) });
}
