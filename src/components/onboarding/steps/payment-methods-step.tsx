'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingContainer } from '../onboarding-container';
import type { OnboardingStep } from '../progress-indicator';
import type { OnboardingFormData } from '@/hooks/use-onboarding';
import { PAYMENT_METHOD_OPTIONS, type PaymentMethodType } from '@/lib/types';

interface PaymentMethod {
  type: PaymentMethodType;
  label: string;
  value: string;
  isDefault: boolean;
}

interface PaymentMethodsStepProps {
  steps: OnboardingStep[];
  currentStep: number;
  formData: OnboardingFormData;
  isSaving: boolean;
  errors: Record<string, string>;
  onNext: () => Promise<void>;
  onBack: () => void;
  onFormDataChange: (data: Partial<OnboardingFormData>) => void;
}

const EMPTY_METHOD: PaymentMethod = {
  type: 'bank_transfer',
  label: '',
  value: '',
  isDefault: false,
};

export function PaymentMethodsStep({
  steps,
  currentStep,
  formData,
  isSaving,
  errors,
  onNext,
  onBack,
  onFormDataChange,
}: PaymentMethodsStepProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>(
    formData.paymentMethods.length > 0 ? formData.paymentMethods : [{ ...EMPTY_METHOD, isDefault: true }]
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const addMethod = () => {
    setMethods(prev => [...prev, { ...EMPTY_METHOD }]);
  };

  const removeMethod = (index: number) => {
    setMethods(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // If we removed the default, make the first one default
      if (prev[index].isDefault && updated.length > 0) {
        updated[0].isDefault = true;
      }
      return updated;
    });
  };

  const updateMethod = (index: number, field: keyof PaymentMethod, value: string | boolean) => {
    setMethods(prev =>
      prev.map((method, i) => {
        if (i === index) {
          if (field === 'isDefault' && value === true) {
            // When setting as default, unset others
            return { ...method, isDefault: true };
          }
          return { ...method, [field]: value };
        }
        // When setting one as default, unset others
        if (field === 'isDefault' && value === true) {
          return { ...method, isDefault: false };
        }
        return method;
      })
    );
    setValidationError(null);
  };

  const validate = (): boolean => {
    if (methods.length === 0) {
      setValidationError('Debes agregar al menos un método de pago');
      return false;
    }

    for (const method of methods) {
      if (!method.label.trim()) {
        setValidationError('Todos los métodos deben tener un nombre');
        return false;
      }
      if (!method.value.trim()) {
        setValidationError('Todos los métodos deben tener los datos de pago');
        return false;
      }
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    onFormDataChange({ paymentMethods: methods });
    await onNext();
  };

  return (
    <OnboardingContainer
      steps={steps}
      currentStep={currentStep}
      title="Métodos de pago"
      description="Define cómo tus clientes pueden pagarte. Esta información aparecerá en tus facturas."
      tip="Agrega al menos un método. Puedes agregar más o modificarlos después."
    >
      <div className="space-y-6">
        {/* Payment methods list */}
        <div className="space-y-4">
          {methods.map((method, index) => (
            <div
              key={index}
              className="rounded-lg border p-4 space-y-3"
              data-testid={`payment-method-${index}`}
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Método de pago {index + 1}</Label>
                {methods.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMethod(index)}
                    data-testid={`remove-method-${index}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`type-${index}`} className="text-xs">
                    Tipo
                  </Label>
                  <Select
                    value={method.type}
                    onValueChange={value => updateMethod(index, 'type', value)}
                  >
                    <SelectTrigger id={`type-${index}`} data-testid={`method-type-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHOD_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`label-${index}`} className="text-xs">
                    Nombre
                  </Label>
                  <Input
                    id={`label-${index}`}
                    value={method.label}
                    onChange={e => updateMethod(index, 'label', e.target.value)}
                    placeholder="Ej: Banco Azteca"
                    data-testid={`method-label-${index}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`value-${index}`} className="text-xs">
                  Datos de pago
                </Label>
                <Input
                  id={`value-${index}`}
                  value={method.value}
                  onChange={e => updateMethod(index, 'value', e.target.value)}
                  placeholder={
                    method.type === 'bank_transfer'
                      ? 'CLABE: 012345678901234567'
                      : method.type === 'paypal'
                        ? 'paypal.me/tunombre'
                        : 'Datos de pago'
                  }
                  data-testid={`method-value-${index}`}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`default-${index}`}
                  checked={method.isDefault}
                  onCheckedChange={checked => updateMethod(index, 'isDefault', checked === true)}
                  data-testid={`method-default-${index}`}
                />
                <Label htmlFor={`default-${index}`} className="text-xs text-muted-foreground">
                  Método preferido
                </Label>
              </div>
            </div>
          ))}
        </div>

        {/* Add method button */}
        <Button
          type="button"
          variant="outline"
          onClick={addMethod}
          className="w-full"
          data-testid="add-method-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar otro método
        </Button>

        {(validationError || errors.general) && (
          <p className="text-sm text-destructive" data-testid="validation-error">
            {validationError || errors.general}
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
            onClick={handleContinue}
            disabled={isSaving}
            data-testid="next-button"
          >
            {isSaving ? 'Guardando...' : 'Continuar'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </OnboardingContainer>
  );
}
