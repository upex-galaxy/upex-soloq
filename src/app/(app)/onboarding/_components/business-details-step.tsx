// src/app/(app)/onboarding/_components/business-details-step.tsx
'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assuming shadcn/ui Textarea

const formSchema = z.object({
  businessName: z.string().min(1, 'El nombre del negocio es requerido.'),
  contactEmail: z.string().email('Ingresa un correo electrónico válido.'),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

export type BusinessDetailsFormSchema = z.infer<typeof formSchema>;

interface BusinessDetailsStepProps {
  onNext: (data: BusinessDetailsFormSchema) => void;
  onBack: () => void;
  initialData?: Partial<BusinessDetailsFormSchema>;
  isLoading: boolean;
}

export function BusinessDetailsStep({
  onNext,
  onBack,
  initialData,
  isLoading,
}: BusinessDetailsStepProps) {
  const form = useForm<BusinessDetailsFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = (data: BusinessDetailsFormSchema) => {
    onNext(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="businessName">Nombre del Negocio</Label>
        <Input
          id="businessName"
          type="text"
          placeholder="Mi Negocio S.A."
          {...form.register('businessName')}
        />
        {form.formState.errors.businessName && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.businessName.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="contactEmail">Correo de Contacto</Label>
        <Input
          id="contactEmail"
          type="email"
          placeholder="contacto@minegocio.com"
          {...form.register('contactEmail')}
        />
        {form.formState.errors.contactEmail && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.contactEmail.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="contactPhone">Teléfono de Contacto (Opcional)</Label>
        <Input
          id="contactPhone"
          type="tel"
          placeholder="+52 55 1234 5678"
          {...form.register('contactPhone')}
        />
      </div>
      <div>
        <Label htmlFor="address">Dirección (Opcional)</Label>
        <Textarea
          id="address"
          placeholder="Calle Falsa 123, Ciudad, País"
          {...form.register('address')}
        />
      </div>
      <div>
        <Label htmlFor="taxId">RFC/NIT/CUIT (Opcional)</Label>
        <Input id="taxId" type="text" placeholder="ABC123456XYZ" {...form.register('taxId')} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Siguiente'}
        </Button>
      </div>
    </form>
  );
}
