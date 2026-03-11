'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EditClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Edit client page error:', error);
  }, [error]);

  const handleBack = () => {
    router.push('/clients');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack} data-testid="error-back-button">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar cliente</h1>
        </div>
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-12 w-12 text-destructive/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error al cargar cliente</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Ocurrió un error inesperado. Por favor, intenta de nuevo.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack}>
                Volver a clientes
              </Button>
              <Button onClick={reset} data-testid="edit-client-error-retry">
                Reintentar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
