'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvoices } from '@/hooks/invoices';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';
import { INVOICE_STATUS_OPTIONS, type InvoiceStatus } from '@/lib/types';

/**
 * Format currency in Mexican pesos
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

/**
 * Format date in Spanish locale
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  const {
    data: invoices,
    isLoading,
    isError,
    error,
    refetch,
  } = useInvoices(statusFilter === 'all' ? undefined : { status: statusFilter });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
          <p className="text-muted-foreground">Gestiona todas tus facturas en un solo lugar.</p>
        </div>
        <Button asChild data-testid="create-invoice-button">
          <Link href="/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Link>
        </Button>
      </div>

      {/* Filters (TC-03) */}
      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={value => setStatusFilter(value as InvoiceStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]" data-testid="status-filter">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {INVOICE_STATUS_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === 'all'
              ? 'Todas las facturas'
              : INVOICE_STATUS_OPTIONS.find(o => o.value === statusFilter)?.label || 'Facturas'}
          </CardTitle>
          <CardDescription>
            {isLoading
              ? 'Cargando...'
              : `${invoices.length} factura${invoices.length !== 1 ? 's' : ''} encontrada${invoices.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading state */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
              <h3 className="text-lg font-medium">Error al cargar facturas</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                {(error as Error)?.message || 'Ocurrió un error inesperado'}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && invoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">
                {statusFilter === 'all'
                  ? 'No tienes facturas aún'
                  : `No hay facturas en estado "${INVOICE_STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}"`}
              </h3>
              <p className="text-muted-foreground max-w-md mb-4">
                {statusFilter === 'all'
                  ? 'Crea tu primera factura para comenzar a facturar a tus clientes.'
                  : 'Intenta con otro filtro o crea una nueva factura.'}
              </p>
              {statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/invoices/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear factura
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Invoices table */}
          {!isLoading && !isError && invoices.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Actualizada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(invoice => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer hover:bg-muted/50"
                    data-testid={`invoice-row-${invoice.id}`}
                  >
                    <TableCell>
                      <Link
                        href={
                          invoice.status === 'draft'
                            ? `/invoices/${invoice.id}/edit`
                            : `/invoices/${invoice.id}`
                        }
                        className="font-medium text-primary hover:underline"
                      >
                        {invoice.invoice_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.client?.name || 'Sin cliente'}</div>
                        {invoice.client?.company && (
                          <div className="text-sm text-muted-foreground">
                            {invoice.client.company}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status ?? 'draft'} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.total ?? 0)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(invoice.due_date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(invoice.updated_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
