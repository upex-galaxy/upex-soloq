// src/app/(app)/onboarding/_components/onboarding-wizard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Assuming shadcn/ui Progress component is available
import { useToast } from '@/components/ui/use-toast';

// Step Components
import { BusinessDetailsStep } from './business-details-step';
import { LogoUploadStep } from './logo-upload-step';
import { PaymentMethodsStep } from './payment-methods-step';

// Define the steps of the onboarding wizard
const steps = [
  { id: 'businessDetails', name: 'Datos del Negocio', Component: BusinessDetailsStep },
  { id: 'logoUpload', name: 'Sube tu Logo', Component: LogoUploadStep },
  { id: 'paymentMethods', name: 'Métodos de Pago', Component: PaymentMethodsStep },
];

export function OnboardingWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = async (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
    setIsLoading(true); // Assuming each step might involve an API call

    // Simulate API call for saving step data
    try {
      // In a real scenario, you'd call specific API endpoints here
      // For example: if (steps[currentStep].id === 'businessDetails') await saveBusinessDetails(data);
      // For this example, we'll just log and proceed
      console.log(`Saving data for step ${steps[currentStep].name}:`, data);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Last step completed
        toast({
          title: 'Onboarding Completado',
          description: 'Tu negocio está listo para facturar!',
        });
        router.push('/dashboard'); // Redirect to dashboard after completion
      }
    } catch (error) {
      toast({
        title: 'Error al guardar',
        description: 'Ocurrió un error al guardar los datos del paso.',
        variant: 'destructive',
      });
      console.error('Onboarding step save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const StepComponent = steps[currentStep].Component;

  return (
    <div className="space-y-6">
      <Progress value={progress} className="w-full" />
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Paso {currentStep + 1} de {totalSteps}: {steps[currentStep].name}
        </span>
        {currentStep < totalSteps - 1 && (
          <Button variant="link" onClick={() => handleNext({})} disabled={isLoading}>
            Saltar este paso
          </Button>
        )}
      </div>

      <StepComponent
        onNext={handleNext}
        onBack={handleBack}
        initialData={formData}
        isLoading={isLoading}
      />
    </div>
  );
}
