// src/components/clients/client-form.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientFormData, clientFormSchema } from '@/lib/validations/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'; // Assuming Card components
import { cn } from '@/lib/utils'; // Assuming cn for class merging
import { Loader2 } from 'lucide-react'; // Assuming lucide-react for spinner icon

interface ClientFormProps {
  defaultValues?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClientForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: ClientFormProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultValues || {
      name: '',
      email: '',
      company: '',
      phone: '',
      address: '',
      notes: '',
    },
  });

  return (
    <Card className="w-full max-w-2xl" data-testid="client-form">
      <CardHeader>
        <CardTitle>Agregar Cliente</CardTitle>
        <CardDescription>Ingresa los datos de tu nuevo cliente.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nombre del cliente"
                {...form.register('name')}
                data-testid="client-name-input"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                {...form.register('email')}
                data-testid="client-email-input"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="company">Empresa (opcional)</Label>
              <Input
                id="company"
                type="text"
                placeholder="Nombre de la empresa (opcional)"
                {...form.register('company')}
                data-testid="client-company-input"
              />
              {form.formState.errors.company && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.company.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+52 55 1234 5678"
                {...form.register('phone')}
                data-testid="client-phone-input"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Dirección (opcional)</Label>
              <Textarea
                id="address"
                placeholder="Dirección de facturación (opcional)"
                {...form.register('address')}
                data-testid="client-address-input"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="notes">Notas internas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Notas internas sobre el cliente (opcional)"
                {...form.register('notes')}
                data-testid="client-notes-input"
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.notes.message}
                </p>
              )}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          data-testid="client-form-cancel"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
          data-testid="client-form-submit"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Guardando...' : 'Guardar cliente'}
        </Button>
      </CardFooter>
    </Card>
  );
}
