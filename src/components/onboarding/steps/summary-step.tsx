'use client';

import { ArrowLeft, Check, Building2, Mail, Phone, MapPin, CreditCard, ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { OnboardingContainer } from '../onboarding-container';
import type { OnboardingStep } from '../progress-indicator';
import type { OnboardingFormData } from '@/hooks/use-onboarding';
import { PAYMENT_METHOD_OPTIONS } from '@/lib/types';

interface SummaryStepProps {
  steps: OnboardingStep[];
  currentStep: number;
  formData: OnboardingFormData;
  isSaving: boolean;
  errors: Record<string, string>;
  onBack: () => void;
  onComplete: () => Promise<void>;
}

export function SummaryStep({
  steps,
  currentStep,
  formData,
  isSaving,
  errors,
  onBack,
  onComplete,
}: SummaryStepProps) {
  const getPaymentMethodLabel = (type: string) => {
    return PAYMENT_METHOD_OPTIONS.find(opt => opt.value === type)?.label || type;
  };

  return (
    <OnboardingContainer
      steps={steps}
      currentStep={currentStep}
      title="¡Todo listo!"
      description="Revisa la información de tu negocio. Podrás modificarla después en configuración."
    >
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="space-y-4">
          {/* Business Name */}
          <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-4">
            <Building2 className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Nombre del negocio</p>
              <p className="text-sm text-muted-foreground">{formData.businessName}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-4">
            <Mail className="mt-0.5 h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Información de contacto</p>
              <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                <p>{formData.contactEmail}</p>
                {formData.contactPhone && (
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {formData.contactPhone}
                  </p>
                )}
                {formData.address && (
                  <p className="flex items-start gap-1">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    {formData.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-4">
            <ImageIcon className="mt-0.5 h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Logo</p>
              {formData.logoUrl ? (
                <div className="mt-2">
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="h-12 w-12 rounded object-contain"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No configurado (opcional)</p>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-4">
            <CreditCard className="mt-0.5 h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Métodos de pago</p>
              <div className="mt-1 space-y-1">
                {formData.paymentMethods.map((method, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    <span className="font-medium">{method.label}</span>
                    <span className="text-xs ml-2">({getPaymentMethodLabel(method.type)})</span>
                    {method.isDefault && (
                      <span className="ml-2 text-xs text-primary">(Preferido)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {errors.general && (
          <p className="text-sm text-destructive" data-testid="general-error">
            {errors.general}
          </p>
        )}

        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSaving}
            data-testid="back-button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <Button
            type="button"
            onClick={onComplete}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
            data-testid="complete-button"
          >
            {isSaving ? 'Finalizando...' : 'Comenzar a facturar'}
            <Check className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </OnboardingContainer>
  );
}
