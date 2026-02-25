'use client';

import Link from 'next/link';
import { FileText, Plus, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';
import { useClientInvoices, type InvoiceHistorySummary } from '@/hooks/clients';
import type { Invoice } from '@/lib/types';

// =============================================================================
// Types
// =============================================================================

interface ClientInvoiceHistoryProps {
  clientId: string;
  clientName?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// =============================================================================
// Sub-Components
// =============================================================================

interface TotalsSummaryProps {
  summary: InvoiceHistorySummary;
  isLoading: boolean;
}

function TotalsSummary({ summary, isLoading }: TotalsSummaryProps) {
  const cards = [
    {
      title: 'Total Facturado',
      value: summary.totalInvoiced,
      color: 'text-foreground',
      testId: 'total-invoiced',
    },
    {
      title: 'Total Pagado',
      value: summary.totalPaid,
      color: 'text-green-600',
      testId: 'total-paid',
    },
    {
      title: 'Pendiente',
      value: summary.totalPending,
      color: 'text-amber-600',
      testId: 'total-pending',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3" data-testid="invoice-totals-summary">
      {cards.map(card => (
        <Card key={card.testId}>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            ) : (
              <>
                <p className="text-muted-foreground text-sm">{card.title}</p>
                <p
                  className={`text-2xl font-bold ${card.color}`}
                  data-testid={card.testId}
                >
                  {formatCurrency(card.value)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
}

function InvoiceTable({ invoices, isLoading }: InvoiceTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table data-testid="invoice-history-table">
        <TableHeader>
          <TableRow>
            <TableHead>N\u00famero</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map(invoice => (
            <TableRow
              key={invoice.id}
              className="cursor-pointer hover:bg-muted/50"
              data-testid={`invoice-row-${invoice.invoice_number}`}
            >
              <TableCell>
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="font-medium text-primary hover:underline"
                  data-testid={`invoice-link-${invoice.invoice_number}`}
                >
                  {invoice.invoice_number}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(invoice.issue_date)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(Number(invoice.total) || 0, invoice.currency || 'USD')}
              </TableCell>
              <TableCell>
                {invoice.status && <InvoiceStatusBadge status={invoice.status} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface EmptyStateProps {
  clientId: string;
  clientName?: string;
}

function EmptyState({ clientId, clientName }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center"
      data-testid="invoice-history-empty"
    >
      <FileText className="text-muted-foreground mb-4 h-12 w-12" />
      <h3 className="text-lg font-semibold">Sin facturas</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {clientName
          ? `Aún no has enviado facturas a ${clientName}.`
          : 'Este cliente aún no tiene facturas.'}
      </p>
      <Button asChild data-testid="create-invoice-button">
        <Link href={`/invoices/create?client=${clientId}`}>
          <Plus className="mr-2 h-4 w-4" />
          Crear primera factura
        </Link>
      </Button>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * ClientInvoiceHistory - Shows invoice history for a specific client
 *
 * Features:
 * - Summary cards with Total Invoiced, Total Paid, Total Pending
 * - Table with invoice list (number, date, amount, status)
 * - Click to navigate to invoice detail
 * - Empty state with CTA to create invoice
 *
 * Test Cases covered:
 * - FTP-001: View history with existing invoices
 * - FTP-002: Status badges with correct colors
 * - FTP-003: Click to navigate to invoice detail
 * - FTP-004: Empty state handling
 * - FTP-005/006/007: Totals calculation display
 */
export function ClientInvoiceHistory({ clientId, clientName }: ClientInvoiceHistoryProps) {
  const { invoices, summary, isLoading, isError, error, refetch } = useClientInvoices(clientId);

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-destructive mb-4">{error?.message || 'Error al cargar el historial'}</p>
            <Button variant="outline" onClick={() => refetch()} data-testid="retry-button">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="client-invoice-history">
      {/* Totals Summary */}
      <TotalsSummary summary={summary} isLoading={isLoading} />

      {/* Invoice List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Historial de Facturas</CardTitle>
          {invoices.length > 0 && (
            <Button asChild size="sm" variant="outline" data-testid="new-invoice-button">
              <Link href={`/invoices/create?client=${clientId}`}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva factura
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!isLoading && invoices.length === 0 ? (
            <EmptyState clientId={clientId} clientName={clientName} />
          ) : (
            <InvoiceTable invoices={invoices} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
