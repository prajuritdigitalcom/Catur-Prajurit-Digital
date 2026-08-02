import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { RoomRow } from '../_lib/roomTypes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { data, error } = await supabaseAdmin
    .from('rooms')
    .select('code, host, guest, status, time_control')
    .in('status', ['waiting', 'active'])
    .order('created_at', { ascending: false })
    .limit(15);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const activeList = (data as Pick<RoomRow, 'code' | 'host' | 'guest' | 'status' | 'time_control'>[]).map((r) => ({
    code: r.code,
    hostName: r.host.name,
    hostRating: r.host.rating,
    hostAvatar: r.host.avatar,
    status: r.status,
    timeControlLabel: r.time_control.label,
    hasGuest: !!r.guest
  }));

  res.status(200).json({ success: true, rooms: activeList });
}
