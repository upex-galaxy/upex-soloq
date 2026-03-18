'use client';

import { use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Loader2, FileX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvoice } from '@/hooks/invoices/use-invoice';

// =============================================================================
// Dynamic Imports - Avoid SSR issues with react-pdf
// =============================================================================

const InvoicePreview = dynamic(
  () => import('./components/invoice-preview').then(mod => ({ default: mod.InvoicePreview })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

// =============================================================================
// Types
// =============================================================================

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

// =============================================================================
// Invoice Detail Page
// =============================================================================

/**
 * Invoice Detail Page
 *
 * Displays a single invoice with PDF preview and download functionality.
 *
 * Features:
 * - Fetches invoice data with all related info (client, items, business profile)
 * - Shows loading state while fetching
 * - Handles 404 gracefully
 * - Provides PDF preview and download
 */
export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const resolvedParams = use(params);
  const invoiceId = resolvedParams.id;

  const { data: invoice, isLoading, isError } = useInvoice(invoiceId);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-center h-[600px]">
              <Loader2
                className="h-8 w-8 animate-spin text-muted-foreground"
                data-testid="invoice-loading-spinner"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found state
  if (!invoice || isError) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Factura no encontrada</h1>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No pudimos encontrar esta factura</CardTitle>
            <CardDescription>
              La factura que buscas no existe o no tienes acceso a ella.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-testid="invoice-not-found"
            >
              <FileX className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground max-w-md mb-6">
                Verifica que el enlace sea correcto o regresa a la lista de facturas.
              </p>
              <Button asChild>
                <Link href="/invoices">Ver todas las facturas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invoice found - show preview
  return (
    <div className="space-y-8" data-testid="invoice-detail-page">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices" data-testid="back-to-invoices">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="invoice-number-title">
              {invoice.invoice_number}
            </h1>
            <p className="text-muted-foreground">
              {invoice.client.name}
              {invoice.client.company && ` - ${invoice.client.company}`}
            </p>
          </div>
        </div>
      </div>

      {/* PDF Preview Card */}
      <Card>
        <CardContent className="p-0">
          <InvoicePreview invoice={invoice} />
        </CardContent>
      </Card>
    </div>
  );
}
