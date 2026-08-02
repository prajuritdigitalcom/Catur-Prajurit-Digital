import { createClient } from '@supabase/supabase-js';

// Ini HANYA dipakai di sisi server (folder /api). Memakai Service Role Key
// yang melewati Row Level Security, jadi TIDAK BOLEH pernah diimpor atau
// dikirim ke kode frontend (src/). File-file di /api tidak ikut ter-bundle
// ke JS yang dikirim ke browser.
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Konfigurasi Supabase belum lengkap. Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di Environment Variables Vercel.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});
