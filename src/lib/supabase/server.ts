import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { supabaseUrl, supabaseAnonKey } from '../config';

/**
 * Creates a Supabase client for Server Components and Route Handlers
 *
 * Use this in:
 * - Server Components (default in App Router)
 * - Route Handlers (app/api/...)
 * - Server Actions
 *
 * Note: This function is async because Next.js 15+ requires await cookies()
 *
 * @example
 * // Server Component
 * import { createServer } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = await createServer()
 *   const { data } = await supabase.from('clients').select('*')
 *   return <div>{data?.length} clients</div>
 * }
 *
 * @example
 * // Route Handler
 * import { createServer } from '@/lib/supabase/server'
 *
 * export async function GET() {
 *   const supabase = await createServer()
 *   const { data } = await supabase.from('invoices').select('*')
 *   return Response.json(data)
 * }
 */
export async function createServer() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component where cookies can't be set
          // This is expected - session refresh happens in middleware
        }
      },
    },
  });
}
