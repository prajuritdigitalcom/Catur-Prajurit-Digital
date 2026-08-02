import { createClient } from '@supabase/supabase-js';

// Dipakai di BROWSER. Hanya untuk subscribe ke perubahan Realtime pada
// tabel `rooms` (baca-saja, dibatasi oleh RLS policy "Public read access").
// Kunci di sini adalah anon/public key — aman untuk diekspos ke client,
// BUKAN service role key.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (!supabase) {
  // eslint-disable-next-line no-console
  console.warn(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diset. Update room secara real-time tidak akan berjalan.'
  );
}
