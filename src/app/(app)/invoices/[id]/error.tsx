'use client';

import { useEffect } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function InvoiceDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Invoice detail page error:', error);
  }, [error]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Error</h1>
          <p className="text-muted-foreground">
            No se pudo cargar la factura.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-12 w-12 text-destructive/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error al cargar la factura</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Ocurrió un error inesperado. Por favor, intenta de nuevo.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/invoices">Volver a facturas</Link>
              </Button>
              <Button onClick={reset} data-testid="invoice-error-retry">
                Reintentar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
