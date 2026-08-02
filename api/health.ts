import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { count } = await supabaseAdmin
    .from('rooms')
    .select('*', { count: 'exact', head: true });

  res.status(200).json({ status: 'ok', activeRooms: count ?? 0, timestamp: Date.now() });
}
