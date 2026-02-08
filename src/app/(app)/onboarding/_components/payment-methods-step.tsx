// src/app/(app)/onboarding/_components/payment-methods-step.tsx
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Assuming shadcn/ui Select components
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2 } from 'lucide-react'; // Assuming Lucide icons are configured

const paymentMethodSchema = z.object({
  type: z.enum(['bank_transfer', 'paypal', 'mercado_pago', 'cash', 'other']),
  label: z.string().min(1, 'La etiqueta es requerida.'),
  value: z.string().min(1, 'El valor es requerido.'),
});

const formSchema = z.object({
  paymentMethods: z
    .array(paymentMethodSchema)
    .min(0, 'Debes añadir al menos un método de pago.')
    .optional(),
});

export type PaymentMethodsFormSchema = z.infer<typeof formSchema>;

interface PaymentMethodsStepProps {
  onNext: (data: PaymentMethodsFormSchema) => void;
  onBack: () => void;
  initialData?: PaymentMethodsFormSchema;
  isLoading: boolean;
}

export function PaymentMethodsStep({
  onNext,
  onBack,
  initialData,
  isLoading,
}: PaymentMethodsStepProps) {
  const { toast } = useToast();
  const form = useForm<PaymentMethodsFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { paymentMethods: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'paymentMethods',
  });

  const onSubmit = async (data: PaymentMethodsFormSchema) => {
    // In a real scenario, you'd call a specific API endpoint to save payment methods here
    try {
      console.log('Saving payment methods:', data.paymentMethods);
      const response = await fetch('/api/profile/payment-methods', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Error al guardar métodos de pago.');
      }

      toast({
        title: 'Métodos de pago guardados',
        description: 'Tus métodos de pago se han configurado exitosamente.',
      });
      onNext(data);
    } catch (error: any) {
      toast({
        title: 'Error al guardar métodos de pago',
        description: error.message || 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
      console.error('Payment methods save error:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="relative rounded-md border p-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
              onClick={() => remove(index)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="space-y-2">
              <div>
                <Label htmlFor={`paymentMethods.${index}.type`}>Tipo</Label>
                <Select
                  onValueChange={value =>
                    form.setValue(
                      `paymentMethods.${index}.type`,
                      value as PaymentMethodsFormSchema['paymentMethods'][number]['type']
                    )
                  }
                  defaultValue={field.type}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="mercado_pago">Mercado Pago</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentMethods?.[index]?.type && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.paymentMethods[index]?.type?.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`paymentMethods.${index}.label`}>Etiqueta</Label>
                <Input
                  id={`paymentMethods.${index}.label`}
                  type="text"
                  placeholder="Ej: BBVA México"
                  {...form.register(`paymentMethods.${index}.label`)}
                  disabled={isLoading}
                />
                {form.formState.errors.paymentMethods?.[index]?.label && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.paymentMethods[index]?.label?.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`paymentMethods.${index}.value`}>Valor (Cuenta, Link, etc.)</Label>
                <Input
                  id={`paymentMethods.${index}.value`}
                  type="text"
                  placeholder="Ej: CLABE 012345678901234567"
                  {...form.register(`paymentMethods.${index}.value`)}
                  disabled={isLoading}
                />
                {form.formState.errors.paymentMethods?.[index]?.value && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.paymentMethods[index]?.value?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => append({ type: 'bank_transfer', label: '', value: '' })}
        disabled={isLoading}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Añadir método de pago
      </Button>

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          Atrás
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Finalizando...' : 'Finalizar Onboarding'}
        </Button>
      </div>
    </form>
  );
}
