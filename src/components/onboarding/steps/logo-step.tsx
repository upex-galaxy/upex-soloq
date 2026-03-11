'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Upload, ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { OnboardingContainer } from '../onboarding-container';
import type { OnboardingStep } from '../progress-indicator';
import type { OnboardingFormData } from '@/hooks/use-onboarding';

interface LogoStepProps {
  steps: OnboardingStep[];
  currentStep: number;
  formData: OnboardingFormData;
  isSaving: boolean;
  errors: Record<string, string>;
  onNext: () => Promise<void>;
  onBack: () => void;
  onSkip: () => Promise<void>;
  onFormDataChange: (data: Partial<OnboardingFormData>) => void;
}

export function LogoStep({
  steps,
  currentStep,
  formData,
  isSaving,
  errors,
  onNext,
  onBack,
  onSkip,
  onFormDataChange,
}: LogoStepProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(formData.logoUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, just create a preview URL
    // In production, this would upload to Supabase Storage
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFormDataChange({ logoUrl: url });
  };

  const handleContinue = async () => {
    if (previewUrl) {
      await onNext();
    } else {
      await onSkip();
    }
  };

  return (
    <OnboardingContainer
      steps={steps}
      currentStep={currentStep}
      title="Logo de tu negocio"
      description="Agrega tu logo para que tus facturas se vean más profesionales."
      tip="Este paso es opcional. Puedes agregar o cambiar tu logo después en configuración."
    >
      <div className="space-y-6">
        {/* Preview area */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30"
            data-testid="logo-preview"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Logo preview"
                className="h-full w-full rounded-lg object-contain"
              />
            ) : (
              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            )}
          </div>

          {/* Upload button */}
          <label htmlFor="logo-upload">
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-testid="logo-file-input"
            />
            <Button type="button" variant="outline" asChild>
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {previewUrl ? 'Cambiar logo' : 'Subir logo'}
              </span>
            </Button>
          </label>

          <p className="text-xs text-muted-foreground">PNG, JPG o SVG. Máximo 2MB.</p>
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
          <div className="flex gap-2">
            {!previewUrl && (
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                disabled={isSaving}
                data-testid="skip-button"
              >
                Saltar por ahora
              </Button>
            )}
            <Button
              type="button"
              onClick={handleContinue}
              disabled={isSaving}
              data-testid="next-button"
            >
              {isSaving ? 'Guardando...' : 'Continuar'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </OnboardingContainer>
  );
}
