// src/app/(app)/onboarding/page.tsx
import { OnboardingWizard } from './_components/onboarding-wizard';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // TODO: Check if onboarding is already completed (e.g., via a profile status or business_profile existence)
  // For now, we allow access, assuming the wizard itself will handle completion.
  // This will be refined in future stories related to profile management.

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">Configura tu Negocio</h1>
        <p className="text-center text-muted-foreground mb-8">
          ¡Casi listo! Necesitamos algunos detalles de tu negocio para empezar a facturar.
        </p>
        <OnboardingWizard />
      </div>
    </div>
  );
}
