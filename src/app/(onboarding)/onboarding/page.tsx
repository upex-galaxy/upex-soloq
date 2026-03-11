'use client';

import { useOnboarding } from '@/hooks/use-onboarding';
import { BusinessNameStep } from '@/components/onboarding/steps/business-name-step';
import { ContactInfoStep } from '@/components/onboarding/steps/contact-info-step';
import { LogoStep } from '@/components/onboarding/steps/logo-step';
import { PaymentMethodsStep } from '@/components/onboarding/steps/payment-methods-step';
import { SummaryStep } from '@/components/onboarding/steps/summary-step';
import { Skeleton } from '@/components/ui/skeleton';
import type { OnboardingStep } from '@/components/onboarding/progress-indicator';

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 1, name: 'business', title: 'Negocio', required: true },
  { id: 2, name: 'contact', title: 'Contacto', required: true },
  { id: 3, name: 'logo', title: 'Logo', required: false },
  { id: 4, name: 'payment', title: 'Pagos', required: true },
  { id: 5, name: 'summary', title: 'Resumen', required: true },
];

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl space-y-6" data-testid="onboarding-loading">
      {/* Progress indicator skeleton */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            {i < 5 && <Skeleton className="mx-2 h-0.5 w-12" />}
          </div>
        ))}
      </div>

      {/* Card skeleton */}
      <div className="rounded-lg border p-6 space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const {
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
  } = useOnboarding();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const commonProps = {
    steps: ONBOARDING_STEPS,
    currentStep,
    formData,
    isSaving,
    errors,
    onFormDataChange: setFormData,
  };

  switch (currentStep) {
    case 1:
      return <BusinessNameStep {...commonProps} onNext={goNext} />;
    case 2:
      return <ContactInfoStep {...commonProps} onNext={goNext} onBack={goBack} />;
    case 3:
      return <LogoStep {...commonProps} onNext={goNext} onBack={goBack} onSkip={skip} />;
    case 4:
      return <PaymentMethodsStep {...commonProps} onNext={goNext} onBack={goBack} />;
    case 5:
      return <SummaryStep {...commonProps} onBack={goBack} onComplete={complete} />;
    default:
      return <BusinessNameStep {...commonProps} onNext={goNext} />;
  }
}
