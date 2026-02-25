'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, User } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientForm } from '@/components/clients/client-form';
import { ClientInvoiceHistory } from '@/components/clients/client-invoice-history';
import { useClient } from '@/hooks/clients/use-client';
import { useUpdateClient } from '@/hooks/clients/use-update-client';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import type { ClientFormData } from '@/lib/validations/client';

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: client, isLoading, error } = useClient(id);
  const { mutate: updateClient, isPending } = useUpdateClient();
  const { setOverride, clearOverride } = useBreadcrumb();

  // Set breadcrumb override to show client name instead of UUID
  useEffect(() => {
    if (client?.name) {
      setOverride(id, client.name);
    }
    return () => clearOverride(id);
  }, [client?.name, id, setOverride, clearOverride]);

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
            <h1 className="text-2xl font-bold tracking-tight">Detalle de cliente</h1>
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
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">
            {client.company || client.email}
          </p>
        </div>
      </div>

      {/* Tabs: Datos del cliente / Historial de facturas */}
      <Tabs defaultValue="details" className="w-full" data-testid="client-tabs">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="details" data-testid="tab-details">
            <User className="mr-2 h-4 w-4" />
            Datos
          </TabsTrigger>
          <TabsTrigger value="invoices" data-testid="tab-invoices">
            <FileText className="mr-2 h-4 w-4" />
            Facturas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Client Details Form */}
        <TabsContent value="details" className="mt-6">
          <div className="max-w-2xl">
            <ClientForm
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isPending}
            />
          </div>
        </TabsContent>

        {/* Tab: Invoice History */}
        <TabsContent value="invoices" className="mt-6">
          <ClientInvoiceHistory clientId={id} clientName={client.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
