import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { supabaseUrl, supabaseServiceRoleKey } from '../config';

/**
 * Creates a Supabase Admin client with service_role key
 *
 * WARNING: This client BYPASSES Row Level Security!
 * Only use for:
 * - Server-side operations that need elevated privileges
 * - Admin operations
 * - Background jobs/cron tasks
 * - Seed data scripts
 *
 * NEVER:
 * - Use in client components
 * - Expose the service_role key to the browser
 * - Use when user-scoped data access is sufficient
 *
 * @example
 * // Server-side admin operation
 * import { createAdmin } from '@/lib/supabase/admin'
 *
 * export async function adminDeleteUser(userId: string) {
 *   const supabase = createAdmin()
 *   // This bypasses RLS - be careful!
 *   await supabase.from('profiles').delete().eq('user_id', userId)
 * }
 */
export function createAdmin() {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required for admin operations.\n' +
        'This key should only be available server-side.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
