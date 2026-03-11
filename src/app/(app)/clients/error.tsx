'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ClientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Clients page error:', error);
  }, [error]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Administra tu base de clientes y su historial de facturación.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-12 w-12 text-destructive/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error al cargar clientes</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Ocurrió un error inesperado. Por favor, intenta de nuevo.
            </p>
            <Button onClick={reset} data-testid="clients-error-retry">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
