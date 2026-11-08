import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase.config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Ensure .env is loaded before reading config
config({ path: resolve(__dirname, '../../.env') });

/** Supabase database client */
export class DatabaseService {
  private client: SupabaseClient | null = null;

  constructor() {
    if (supabaseConfig.url && supabaseConfig.serviceRoleKey) {
      this.client = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }

  /** Get Supabase client (throws if not configured) */
  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }
    return this.client;
  }

  /** Check if DB is available */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /** Test connection */
  async testConnection(): Promise<boolean> {
    if (!this.client) return false;
    
    try {
      const { error } = await this.client.from('users').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}
