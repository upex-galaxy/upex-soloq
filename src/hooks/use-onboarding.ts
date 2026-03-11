'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { PaymentMethodType } from '@/lib/types';

export interface OnboardingFormData {
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logoUrl: string | null;
  paymentMethods: Array<{
    type: PaymentMethodType;
    label: string;
    value: string;
    isDefault: boolean;
  }>;
}

interface UseOnboardingReturn {
  currentStep: number;
  formData: OnboardingFormData;
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  setFormData: (data: Partial<OnboardingFormData>) => void;
  goNext: () => Promise<void>;
  goBack: () => void;
  skip: () => Promise<void>;
  complete: () => Promise<void>;
  setErrors: (errors: Record<string, string>) => void;
  clearError: (field: string) => void;
}

const INITIAL_FORM_DATA: OnboardingFormData = {
  businessName: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  logoUrl: null,
  paymentMethods: [],
};

const TOTAL_STEPS = 5;

export function useOnboarding(): UseOnboardingReturn {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormDataState] = useState<OnboardingFormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing data and current step from DB
  useEffect(() => {
    async function loadOnboardingData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Get current step from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_step, onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (profile?.onboarding_completed) {
          router.push('/dashboard');
          return;
        }

        if (profile?.onboarding_step) {
          setCurrentStep(profile.onboarding_step);
        }

        // Get existing business profile data
        const { data: businessProfile } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (businessProfile) {
          setFormDataState(prev => ({
            ...prev,
            businessName: businessProfile.business_name || '',
            contactEmail: businessProfile.contact_email || user.email || '',
            contactPhone: businessProfile.contact_phone || '',
            address: typeof businessProfile.address === 'string'
              ? businessProfile.address
              : (businessProfile.address as Record<string, string> | null)?.street || '',
            logoUrl: businessProfile.logo_url || null,
          }));
        } else {
          // Pre-fill with user email
          setFormDataState(prev => ({
            ...prev,
            contactEmail: user.email || '',
          }));
        }

        // Get existing payment methods
        const { data: paymentMethods } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .order('sort_order');

        if (paymentMethods && paymentMethods.length > 0) {
          setFormDataState(prev => ({
            ...prev,
            paymentMethods: paymentMethods.map(pm => ({
              type: pm.type,
              label: pm.label,
              value: pm.value,
              isDefault: pm.is_default ?? false,
            })),
          }));
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadOnboardingData();
  }, [router]);

  const setFormData = useCallback((data: Partial<OnboardingFormData>) => {
    setFormDataState(prev => ({ ...prev, ...data }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const saveStepData = useCallback(
    async (step: number) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Save based on current step
      if (step === 1 || step === 2 || step === 3) {
        // Business info, contact info, or logo step - upsert business_profiles
        const { error } = await supabase.from('business_profiles').upsert(
          {
            user_id: user.id,
            business_name: formData.businessName,
            contact_email: formData.contactEmail,
            contact_phone: formData.contactPhone || null,
            address: formData.address || null,
            logo_url: formData.logoUrl,
          },
          { onConflict: 'user_id' }
        );

        if (error) throw error;
      }

      if (step === 4) {
        // Payment methods step
        // Delete existing and insert new
        await supabase.from('payment_methods').delete().eq('user_id', user.id);

        if (formData.paymentMethods.length > 0) {
          const { error } = await supabase.from('payment_methods').insert(
            formData.paymentMethods.map((pm, index) => ({
              user_id: user.id,
              type: pm.type,
              label: pm.label,
              value: pm.value,
              is_default: pm.isDefault,
              sort_order: index,
            }))
          );

          if (error) throw error;
        }
      }

      // Update current step in profile
      const nextStep = Math.min(step + 1, TOTAL_STEPS);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_step: nextStep })
        .eq('user_id', user.id);

      if (profileError) throw profileError;
    },
    [formData]
  );

  const goNext = useCallback(async () => {
    if (currentStep >= TOTAL_STEPS) return;

    setIsSaving(true);
    try {
      await saveStepData(currentStep);
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
      setErrors({});
    } catch (error) {
      console.error('Error saving step:', error);
      setErrors({ general: 'Error al guardar. Por favor intenta de nuevo.' });
    } finally {
      setIsSaving(false);
    }
  }, [currentStep, saveStepData]);

  const goBack = useCallback(() => {
    if (currentStep <= 1) return;
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  }, [currentStep]);

  const skip = useCallback(async () => {
    // Only allowed on optional steps (step 3 - logo)
    if (currentStep !== 3) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Just update the step without saving logo
      const nextStep = currentStep + 1;
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_step: nextStep })
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentStep(nextStep);
      setErrors({});
    } catch (error) {
      console.error('Error skipping step:', error);
      setErrors({ general: 'Error al saltar paso. Por favor intenta de nuevo.' });
    } finally {
      setIsSaving(false);
    }
  }, [currentStep]);

  const complete = useCallback(async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Mark onboarding as completed
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_step: TOTAL_STEPS,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setErrors({ general: 'Error al completar. Por favor intenta de nuevo.' });
    } finally {
      setIsSaving(false);
    }
  }, [router]);

  return {
    currentStep,
    formData,
    isLoading,
    isSaving,
    errors,
    setFormData,
    goNext,
    goBack,
    skip,
    complete,
    setErrors,
    clearError,
  };
}
