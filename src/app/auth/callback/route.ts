import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createServer();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', data.user.id)
        .single();

      // Determine redirect destination
      let redirectTo = '/dashboard';

      if (!profile?.onboarding_completed) {
        // New user or incomplete onboarding - go to onboarding
        redirectTo = '/onboarding';
      } else if (next && !next.startsWith('/auth')) {
        // User has completed onboarding and has a valid next URL
        redirectTo = next;
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
