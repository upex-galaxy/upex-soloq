'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, FileText, AlertCircle, Search, X, CheckCircle, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isInvoiceOverdue, getDaysOverdue, formatDaysOverdue } from '@/lib/utils/overdue';

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvoices, useDashboardSummary } from '@/hooks/invoices';
import { useDebounce } from '@/hooks/use-debounce';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';
import { PaginationControls } from '@/components/invoices/pagination-controls';
import { MarkAsPaidDialog } from '@/components/invoices/mark-as-paid-dialog';
import { SendInvoiceDialog } from '@/components/invoices/send-invoice-dialog';
import { INVOICE_STATUS_OPTIONS, type InvoiceStatus } from '@/lib/types';

type StatusFilterValue = InvoiceStatus | 'all';

const STATUS_TABS: { value: StatusFilterValue; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'draft', label: 'Borrador' },
  { value: 'sent', label: 'Enviada' },
  { value: 'paid', label: 'Pagada' },
  { value: 'overdue', label: 'Vencida' },
];

const VALID_STATUS_VALUES = new Set<StatusFilterValue>(STATUS_TABS.map(t => t.value));

function parseStatusParam(raw: string | null): StatusFilterValue {
  if (!raw) return 'all';
  return VALID_STATUS_VALUES.has(raw as StatusFilterValue)
    ? (raw as StatusFilterValue)
    : 'all';
}

function parsePageParam(raw: string | null): number {
  if (!raw) return 1;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}


function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function InvoicesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive filter state from URL (source of truth)
  const statusFilter = parseStatusParam(searchParams.get('status'));
  const urlSearch = searchParams.get('q') ?? '';
  const currentPage = parsePageParam(searchParams.get('page'));

  // Local state mirrors the search input so typing is responsive; URL is
  // updated on debounce to keep the source of truth stable and shareable.
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Keep local input in sync when the URL changes externally (e.g. navigation,
  // back/forward). We intentionally only react to external URL changes, not to
  // our own debounced writes.
  useEffect(() => {
    setSearchQuery(prev => (prev === urlSearch ? prev : urlSearch));
  }, [urlSearch]);

  const [paymentInvoice, setPaymentInvoice] = useState<{
    id: string;
    invoice_number: string;
    total: number;
  } | null>(null);
  const [sendInvoice, setSendInvoice] = useState<{
    id: string;
    invoice_number: string;
    client_name: string;
    client_email: string;
  } | null>(null);

  const { data: summary } = useDashboardSummary();

  // Build a URL with the given patch applied on top of the current params.
  const buildUrl = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  // Propagate debounced search to URL. Resets page when the term changes.
  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    const nextUrl = buildUrl({
      q: debouncedSearch || null,
      page: null, // reset pagination when the search term changes
    });
    router.replace(nextUrl, { scroll: false });
  }, [debouncedSearch, urlSearch, buildUrl, router]);

  const {
    data: invoices,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
  } = useInvoices({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    page: currentPage,
    limit: 20,
  });

  const handleTabChange = (value: string) => {
    const next = parseStatusParam(value);
    const nextUrl = buildUrl({
      status: next === 'all' ? null : next,
      page: null, // reset pagination on filter change
    });
    router.replace(nextUrl, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    // Only update local state here — the debounced effect above writes to URL.
    setSearchQuery(value);
  };

  const handlePageChange = (nextPage: number) => {
    const nextUrl = buildUrl({
      page: nextPage > 1 ? String(nextPage) : null,
    });
    router.replace(nextUrl, { scroll: false });
  };

  const getTabCount = (status: StatusFilterValue): number | undefined => {
    if (!summary) return undefined;
    if (status === 'all') {
      return (
        summary.status_counts.draft +
        summary.status_counts.sent +
        summary.status_counts.paid +
        summary.status_counts.overdue +
        summary.status_counts.cancelled
      );
    }
    return summary.status_counts[status];
  };

  const tabCounts = STATUS_TABS.map(tab => ({ ...tab, count: getTabCount(tab.value) }));

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

      {/* Status Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs
          value={statusFilter}
          onValueChange={handleTabChange}
          data-testid="status-filter-tabs"
        >
          <TabsList className="shadow-sm">
            {tabCounts.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-testid={`status-tab-${tab.value}`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 min-w-[20px] px-1.5 text-xs"
                    data-testid={`status-count-${tab.value}`}
                  >
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <div className="relative" data-testid="search-container">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, cliente o email..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-9 pr-9"
            data-testid="invoice-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="search-clear-button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
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
                      <TableHead className="font-semibold w-[80px]">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map(invoice => {
                      const overdue = isInvoiceOverdue(invoice.status, invoice.due_date);
                      const daysOverdue = overdue ? getDaysOverdue(invoice.due_date) : 0;
                      const effectiveStatus = overdue ? 'overdue' : (invoice.status ?? 'draft');

                      return (
                      <TableRow
                        key={invoice.id}
                        className={`table-row-interactive cursor-pointer ${overdue ? 'bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30' : ''}`}
                        data-testid={`invoice-row-${invoice.id}`}
                        data-overdue={overdue || undefined}
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
                          <div className="flex flex-col gap-1">
                            <InvoiceStatusBadge status={effectiveStatus as import('@/lib/types').InvoiceStatus} />
                            {overdue && daysOverdue > 0 && (
                              <span className="text-xs text-destructive" data-testid={`days-overdue-${invoice.id}`}>
                                {formatDaysOverdue(daysOverdue)}
                              </span>
                            )}
                          </div>
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
                        <TableCell>
                          {invoice.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() =>
                                setSendInvoice({
                                  id: invoice.id,
                                  invoice_number: invoice.invoice_number ?? '',
                                  client_name: invoice.client?.name || 'Sin cliente',
                                  client_email: invoice.client?.email || '',
                                })
                              }
                              title="Enviar factura"
                              data-testid={`quick-send-${invoice.id}`}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {(invoice.status === 'sent' || invoice.status === 'overdue' || overdue) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() =>
                                setPaymentInvoice({
                                  id: invoice.id,
                                  invoice_number: invoice.invoice_number ?? '',
                                  total: invoice.total ?? 0,
                                })
                              }
                              title="Marcar como pagada"
                              data-testid={`quick-pay-${invoice.id}`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      );
                    })}
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
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
      </motion.div>

      {/* Mark as Paid Dialog */}
      {paymentInvoice && (
        <MarkAsPaidDialog
          open={!!paymentInvoice}
          onOpenChange={open => {
            if (!open) setPaymentInvoice(null);
          }}
          invoiceId={paymentInvoice.id}
          invoiceNumber={paymentInvoice.invoice_number}
          invoiceTotal={paymentInvoice.total}
        />
      )}

      {/* Send Invoice Dialog */}
      {sendInvoice && (
        <SendInvoiceDialog
          open={!!sendInvoice}
          onOpenChange={open => {
            if (!open) setSendInvoice(null);
          }}
          invoiceId={sendInvoice.id}
          invoiceNumber={sendInvoice.invoice_number}
          clientName={sendInvoice.client_name}
          clientEmail={sendInvoice.client_email}
        />
      )}
    </motion.div>
  );
}

export default function InvoicesPage() {
  // Suspense boundary is required because the inner component reads
  // useSearchParams(), which opts the subtree into client-side rendering.
  return (
    <Suspense fallback={null}>
      <InvoicesPageContent />
    </Suspense>
  );
}
