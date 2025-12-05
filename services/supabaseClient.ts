import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://suutxirrvvrocxrnaddv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_q_k72dRhtIMdxaz0jjPKpg_5KJ5P310'; // Using the publishable key provided

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to check if we are connected
export const checkSupabaseConnection = async () => {
  try {
    const { count, error } = await supabase.from('tests').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return true;
  } catch (e) {
    console.warn("Supabase connection check failed, falling back to mock mode:", e);
    return false;
  }
};