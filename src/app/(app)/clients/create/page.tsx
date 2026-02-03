'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { ClientForm } from '@/components/clients/client-form';
import { useCreateClient } from '@/hooks/clients/use-create-client';
import type { ClientFormData } from '@/lib/validations/client';

export default function CreateClientPage() {
  const router = useRouter();
  const { mutate: createClient, isPending } = useCreateClient();

  const handleSubmit = (data: ClientFormData) => {
    createClient(data, {
      onSuccess: () => {
        toast.success('Cliente guardado correctamente');
        router.push('/clients');
      },
      onError: error => {
        toast.error(error.message);
      },
    });
  };

  const handleCancel = () => {
    router.push('/clients');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agregar cliente</h1>
        <p className="text-muted-foreground">Ingresa los datos de tu nuevo cliente</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <ClientForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isPending} />
      </div>
    </div>
  );
}
