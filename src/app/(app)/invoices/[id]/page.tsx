'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Loader2, FileX, CheckCircle, Undo2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useInvoice } from '@/hooks/invoices/use-invoice';
import { useRevertPayment } from '@/hooks/invoices';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';
import { MarkAsPaidDialog } from '@/components/invoices/mark-as-paid-dialog';
import { SendInvoiceDialog } from '@/components/invoices/send-invoice-dialog';
import { isInvoiceOverdue } from '@/lib/utils/overdue';

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
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const revertPayment = useRevertPayment();

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
  const canSend = invoice.status === 'draft';
  const canMarkAsPaid =
    invoice.status === 'sent' ||
    invoice.status === 'overdue' ||
    isInvoiceOverdue(invoice.status, invoice.due_date);

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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight" data-testid="invoice-number-title">
                {invoice.invoice_number}
              </h1>
              <InvoiceStatusBadge
                status={
                  isInvoiceOverdue(invoice.status, invoice.due_date)
                    ? 'overdue'
                    : (invoice.status ?? 'draft')
                }
              />
            </div>
            <p className="text-muted-foreground">
              {invoice.client.name}
              {invoice.client.company && ` - ${invoice.client.company}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canSend && (
            <Button
              onClick={() => setSendDialogOpen(true)}
              data-testid="send-invoice-button"
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar Factura
            </Button>
          )}
          {canMarkAsPaid && (
            <Button
              onClick={() => setPaymentDialogOpen(true)}
              data-testid="mark-as-paid-button"
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar como Pagada
            </Button>
          )}
          {invoice.status === 'paid' && (
            <Button
              variant="outline"
              onClick={() => setRevertDialogOpen(true)}
              disabled={revertPayment.isPending}
              data-testid="revert-payment-button"
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Revertir Pago
            </Button>
          )}
        </div>
      </div>

      {/* PDF Preview Card */}
      <Card>
        <CardContent className="p-0">
          <InvoicePreview invoice={invoice} />
        </CardContent>
      </Card>

      {/* Mark as Paid Dialog */}
      {canMarkAsPaid && (
        <MarkAsPaidDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoice_number}
          invoiceTotal={invoice.total}
          invoiceIssueDate={invoice.issue_date}
          configuredMethods={invoice.payment_methods}
        />
      )}

      {/* Send Invoice Dialog */}
      {canSend && (
        <SendInvoiceDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoice_number}
          clientName={invoice.client.name}
          clientEmail={invoice.client.email}
        />
      )}

      {/* Revert Payment Confirmation Dialog */}
      <AlertDialog open={revertDialogOpen} onOpenChange={setRevertDialogOpen}>
        <AlertDialogContent data-testid="revert-payment-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Revertir Pago</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción revertirá el pago registrado para la factura {invoice.invoice_number}.
              La factura volverá al estado pendiente. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revertPayment.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                revertPayment.mutate(
                  { invoiceId: invoice.id },
                  { onSuccess: () => setRevertDialogOpen(false) }
                );
              }}
              disabled={revertPayment.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-revert-button"
            >
              {revertPayment.isPending ? 'Revirtiendo...' : 'Revertir Pago'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
