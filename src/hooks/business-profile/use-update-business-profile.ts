'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { BusinessProfile, BusinessProfileUpdate } from '@/lib/types';

/**
 * Updates the current user's business profile via Supabase client
 * Profile must already exist (created during onboarding)
 */
async function updateBusinessProfile(data: BusinessProfileUpdate): Promise<BusinessProfile> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No autorizado');
  }

  const { data: profile, error } = await supabase
    .from('business_profiles')
    .update(data)
    .eq('user_id', user.id)
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
