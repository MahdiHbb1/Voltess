import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env first
config({ path: resolve(__dirname, '../../.env') });

/** Supabase configuration */
export const supabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// Validate config
if (!supabaseConfig.url || !supabaseConfig.serviceRoleKey) {
  console.warn('Supabase config missing - using in-memory fallback');
}
