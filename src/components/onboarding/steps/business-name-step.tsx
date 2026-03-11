'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { OnboardingContainer } from '../onboarding-container';
import type { OnboardingStep } from '../progress-indicator';
import type { OnboardingFormData } from '@/hooks/use-onboarding';

const formSchema = z.object({
  businessName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
});

type FormValues = z.infer<typeof formSchema>;

interface BusinessNameStepProps {
  steps: OnboardingStep[];
  currentStep: number;
  formData: OnboardingFormData;
  isSaving: boolean;
  errors: Record<string, string>;
  onNext: () => Promise<void>;
  onFormDataChange: (data: Partial<OnboardingFormData>) => void;
}

export function BusinessNameStep({
  steps,
  currentStep,
  formData,
  isSaving,
  errors,
  onNext,
  onFormDataChange,
}: BusinessNameStepProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: formData.businessName,
    },
  });

  // Sync form with parent state
  useEffect(() => {
    form.reset({ businessName: formData.businessName });
  }, [formData.businessName, form]);

  const onSubmit = async (values: FormValues) => {
    onFormDataChange({ businessName: values.businessName });
    await onNext();
  };

  return (
    <OnboardingContainer
      steps={steps}
      currentStep={currentStep}
      title="¿Cómo se llama tu negocio?"
      description="Este nombre aparecerá en todas tus facturas y comunicaciones con clientes."
      tip="Usa el nombre con el que tus clientes te conocen. Puede ser tu nombre personal o el de tu empresa."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del negocio</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ej: Diseño Creativo García"
                    autoFocus
                    data-testid="business-name-input"
                  />
                </FormControl>
                <FormDescription>
                  Mínimo 2 caracteres, máximo 100
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {errors.general && (
            <p className="text-sm text-destructive" data-testid="general-error">
              {errors.general}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} data-testid="next-button">
              {isSaving ? 'Guardando...' : 'Continuar'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </OnboardingContainer>
  );
}
