'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientForm } from '@/components/clients/client-form';
import { useClient } from '@/hooks/clients/use-client';
import { useUpdateClient } from '@/hooks/clients/use-update-client';
import type { ClientFormData } from '@/lib/validations/client';

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: client, isLoading, error } = useClient(id);
  const { mutate: updateClient, isPending } = useUpdateClient();

  const handleSubmit = (data: ClientFormData) => {
    updateClient(
      { id, data },
      {
        onSuccess: () => {
          toast.success('Cliente actualizado correctamente');
        },
        onError: err => {
          toast.error(err.message);
        },
      }
    );
  };

  const handleCancel = () => {
    router.push('/clients');
  };

  const handleBack = () => {
    router.push('/clients');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} data-testid="back-button">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar cliente</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-destructive mb-4">{error?.message || 'Cliente no encontrado'}</p>
              <Button variant="outline" onClick={handleBack} data-testid="error-back-button">
                Volver a clientes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare default values for form
  const defaultValues: Partial<ClientFormData> = {
    name: client.name,
    email: client.email,
    company: client.company || '',
    phone: client.phone || '',
    address: client.address || '',
    notes: client.notes || '',
    tax_id: client.tax_id || '',
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack} data-testid="back-button">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar cliente</h1>
          <p className="text-muted-foreground">Actualiza los datos de {client.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <ClientForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isPending}
        />
      </div>
    </div>
  );
}
