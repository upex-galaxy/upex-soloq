'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { BusinessProfile, BusinessProfileInsert, BusinessProfileUpdate } from '@/lib/types';

/**
 * Updates or creates the current user's business profile via Supabase client
 * Uses upsert to handle both first-time setup and updates
 */
async function updateBusinessProfile(data: BusinessProfileUpdate): Promise<BusinessProfile> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No autorizado');
  }

  // If business_name is not provided, fetch it from existing profile for the upsert
  let businessName = data.business_name;
  if (!businessName) {
    const { data: existing } = await supabase
      .from('business_profiles')
      .select('business_name')
      .eq('user_id', user.id)
      .maybeSingle();
    businessName = existing?.business_name ?? '';
  }

  const { data: profile, error } = await supabase
    .from('business_profiles')
    .upsert(
      { ...data, user_id: user.id, business_name: businessName } satisfies BusinessProfileInsert,
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Error al guardar. Intenta de nuevo.');
  }

  return profile;
}

/**
 * React Query mutation hook for updating the business profile
 *
 * Features:
 * - Automatic cache invalidation on success
 * - Invalidates business-profile query key
 *
 * @returns Mutation result with mutate function
 */
export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBusinessProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
    },
  });
}
