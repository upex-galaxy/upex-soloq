import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';
import { supabaseUrl, supabaseAnonKey } from '../config';

/**
 * Creates a Supabase client for browser/client components
 *
 * Use this in:
 * - Client Components ('use client')
 * - Event handlers
 * - useEffect hooks
 *
 * @example
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * export function MyComponent() {
 *   const supabase = createClient()
 *
 *   const handleClick = async () => {
 *     const { data } = await supabase.from('clients').select('*')
 *   }
 * }
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
