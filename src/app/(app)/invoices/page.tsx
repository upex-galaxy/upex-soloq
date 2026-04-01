'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, FileText, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};
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
import { PaginationControls } from '@/components/invoices/pagination-controls';
import { INVOICE_STATUS_OPTIONS, type InvoiceStatus } from '@/lib/types';

/**
 * Format currency in USD
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format date in user-friendly format
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: invoices,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
  } = useInvoices({
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: currentPage,
    limit: 20,
  });

  // Reset to page 1 when filter changes
  const handleStatusChange = (value: string) => {
    setStatusFilter(value as InvoiceStatus | 'all');
    setCurrentPage(1);
  };

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      data-testid="invoices-page"
    >
      {/* Header */}
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
          <p className="text-muted-foreground">Gestiona todas tus facturas en un solo lugar.</p>
        </div>
        <Button asChild data-testid="create-invoice-button" className="shadow-sm hover:shadow-md transition-shadow">
          <Link href="/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Link>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div className="flex items-center gap-4" variants={itemVariants}>
        <Select
          value={statusFilter}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px] shadow-sm" data-testid="status-filter">
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
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants}>
      <Card className="card-elevated border-border/50">
        <CardHeader>
          <CardTitle>
            {statusFilter === 'all'
              ? 'Todas las facturas'
              : INVOICE_STATUS_OPTIONS.find(o => o.value === statusFilter)?.label || 'Facturas'}
          </CardTitle>
          <CardDescription>
            {isLoading
              ? 'Cargando...'
              : `${pagination?.total ?? invoices.length} factura${(pagination?.total ?? invoices.length) !== 1 ? 's' : ''} encontrada${(pagination?.total ?? invoices.length) !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading state */}
          {isLoading && (
            <div className="space-y-4" data-testid="invoice-list-loading">
              {[1, 2, 3, 4, 5].map(i => (
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
            <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="invoice-list-error">
              <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
              <h3 className="text-lg font-medium">Error al cargar facturas</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                {(error as Error)?.message || 'Ocurrió un error inesperado'}
              </p>
              <Button variant="outline" onClick={() => refetch()} data-testid="invoice-list-retry">
                Reintentar
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && invoices.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-testid="invoice-empty-state"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
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
                <Button asChild className="shadow-sm hover:shadow-md transition-shadow" data-testid="create-first-invoice-button">
                  <Link href="/invoices/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primera factura
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Invoices table */}
          {!isLoading && !isError && invoices.length > 0 && (
            <>
              <div className="rounded-lg border border-border/50 overflow-hidden" data-testid="invoice-list">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">Número</TableHead>
                      <TableHead className="font-semibold">Cliente</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                      <TableHead className="text-right font-semibold">Total</TableHead>
                      <TableHead className="font-semibold">Fecha</TableHead>
                      <TableHead className="font-semibold">Vencimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map(invoice => (
                      <TableRow
                        key={invoice.id}
                        className="table-row-interactive cursor-pointer"
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
                            data-testid={`invoice-number-${invoice.id}`}
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
                          {formatDate(invoice.issue_date)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invoice.due_date)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && (
                <PaginationControls
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  limit={pagination.limit}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}
