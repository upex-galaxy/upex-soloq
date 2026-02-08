'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { BusinessProfile } from '@/lib/types';

/**
 * Hook for fetching the current user's business profile
 *
 * @example
 * const { data: profile, isLoading } = useBusinessProfile();
 * const defaultTerms = profile?.default_terms;
 */
export function useBusinessProfile() {
  return useQuery<BusinessProfile | null>({
    queryKey: ['business-profile'],
    queryFn: async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // PGRST116 = no rows found, which is ok (user hasn't set up profile yet)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
