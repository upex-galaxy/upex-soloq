import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
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

/**
 * Creates a Supabase client from a Request object, supporting both:
 * - Bearer token authentication (Authorization header)
 * - Cookie-based authentication (default SSR behavior)
 *
 * This is useful for API routes that need to support external clients
 * (Postman, mobile apps, third-party integrations) via Bearer tokens,
 * while still working with browser requests that use cookies.
 *
 * @example
 * // Route Handler with dual auth support
 * import { createServerFromRequest } from '@/lib/supabase/server'
 *
 * export async function GET(request: Request) {
 *   const supabase = await createServerFromRequest(request)
 *   const { data: { user } } = await supabase.auth.getUser()
 *   // ...
 * }
 *
 * @example
 * // Postman request with Bearer token
 * // GET /api/clients
 * // Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
export async function createServerFromRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');

  // If Bearer token is provided, use it directly
  if (authHeader?.startsWith('Bearer ')) {
    const accessToken = authHeader.slice(7); // Remove "Bearer " prefix

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Fallback to cookie-based authentication
  return createServer();
}
