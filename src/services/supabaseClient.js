import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Checks connectivity to the Supabase backend.
 * @returns {Promise<{ ok: boolean, message: string, error?: any }>}
 */
export async function checkSupabaseConnection() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, message: 'Supabase credentials not configured in .env yet.' };
  }
  try {
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { ok: true, message: `Connected to Supabase (Notice: ${error.message})` };
    }
    return { ok: true, message: 'Successfully connected to Supabase database!' };
  } catch (err) {
    return { ok: false, message: err.message || 'Failed to connect to Supabase.' };
  }
}

export default supabase;

