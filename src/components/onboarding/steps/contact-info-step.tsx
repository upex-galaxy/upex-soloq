'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  contactEmail: z.string().email('Ingresa un email válido'),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactInfoStepProps {
  steps: OnboardingStep[];
  currentStep: number;
  formData: OnboardingFormData;
  isSaving: boolean;
  errors: Record<string, string>;
  onNext: () => Promise<void>;
  onBack: () => void;
  onFormDataChange: (data: Partial<OnboardingFormData>) => void;
}

export function ContactInfoStep({
  steps,
  currentStep,
  formData,
  isSaving,
  errors,
  onNext,
  onBack,
  onFormDataChange,
}: ContactInfoStepProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      address: formData.address,
    },
  });

  // Sync form with parent state
  useEffect(() => {
    form.reset({
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      address: formData.address,
    });
  }, [formData.contactEmail, formData.contactPhone, formData.address, form]);

  const onSubmit = async (values: FormValues) => {
    onFormDataChange({
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone || '',
      address: values.address || '',
    });
    await onNext();
  };

  return (
    <OnboardingContainer
      steps={steps}
      currentStep={currentStep}
      title="Información de contacto"
      description="Estos datos aparecerán en tus facturas para que tus clientes puedan contactarte."
      tip="El email es obligatorio. El teléfono y dirección son opcionales pero recomendados."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de contacto *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="tu@email.com"
                    autoFocus
                    data-testid="contact-email-input"
                  />
                </FormControl>
                <FormDescription>Este email aparecerá en tus facturas</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono (opcional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    data-testid="contact-phone-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Calle, número, colonia, ciudad, país"
                    rows={2}
                    data-testid="contact-address-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
