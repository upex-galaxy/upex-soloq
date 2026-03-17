'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function InvoicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Invoices page error:', error);
  }, [error]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
        <p className="text-muted-foreground">
          Gestiona tus facturas y su estado.
        </p>
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-12 w-12 text-destructive/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error al cargar facturas</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Ocurrió un error inesperado. Por favor, intenta de nuevo.
            </p>
            <Button onClick={reset} data-testid="invoices-error-retry">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
