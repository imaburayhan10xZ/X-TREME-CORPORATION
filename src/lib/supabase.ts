import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let client: any = null;

if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error("Supabase environment variables are missing.");
  // Provide a dummy client or handle it to avoid crashes
  client = { from: () => ({ select: () => ({ data: [], error: 'Supabase not configured' }) }) } as any;
}

export const supabase = client;
