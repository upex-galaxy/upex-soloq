// src/app/(app)/clients/create/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ClientForm } from '@/components/clients/client-form';
import { useCreateClient } from '@/hooks/clients/use-create-client';
import { ClientFormData } from '@/lib/validations/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'; // Assuming shadcn/ui breadcrumb

export default function CreateClientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createClient = useCreateClient();

  const onSubmit = async (data: ClientFormData) => {
    try {
      await createClient.mutateAsync(data);
      toast({
        title: 'Cliente guardado correctamente',
        description: 'El nuevo cliente ha sido añadido a tu lista.',
      });
      router.push('/clients');
    } catch (error: any) {
      const errorMessage = error.message || 'Error al guardar el cliente. Intenta de nuevo.';
      let displayMessage = errorMessage;

      // Handle specific duplicate email error from API
      if (errorMessage.includes('Ya existe un cliente con este email')) {
        displayMessage = 'Ya existe un cliente con este email.';
      }

      toast({
        title: 'Error al guardar cliente',
        description: displayMessage,
        variant: 'destructive',
      });
    }
  };

  const onCancel = () => {
    router.push('/clients');
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/clients">Clientes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Nuevo Cliente</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Agregar Cliente</h1>
          <p className="text-muted-foreground">Ingresa los datos de tu nuevo cliente.</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <ClientForm onSubmit={onSubmit} onCancel={onCancel} isLoading={createClient.isPending} />
      </div>
    </div>
  );
}
