'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { DollarSign, FileText, AlertTriangle, Plus, ArrowUpRight } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { useDashboardSummary } from '@/hooks/invoices';
import { useInvoices } from '@/hooks/invoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: summary, isLoading: isSummaryLoading } = useDashboardSummary();
  const { data: recentInvoices, isLoading: isInvoicesLoading } = useInvoices({ limit: 5 });

  const isLoading = isAuthLoading;

  // Show skeleton while loading auth state (SQ-74 fix)
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-9 w-64 animate-pulse rounded bg-muted" />
            <div className="h-5 w-80 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-lg border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  // Get display name - use email as reliable fallback (SQ-74 fix: avoid "Usuario")
  const displayName =
    user?.businessProfile?.business_name || user?.email?.split('@')[0] || 'Mi Cuenta';

  const pendingTotal = summary?.pending_total ?? 0;
  const overdueCount = summary?.overdue_count ?? 0;
  const paidThisMonth = summary?.paid_this_month ?? 0;
  const overdueTotal = summary?.overdue_total ?? 0;

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      data-testid="dashboard-page"
    >
      {/* Header */}
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {displayName}</h1>
          <p className="text-muted-foreground">
            Aquí está el resumen de tu actividad de facturación.
          </p>
        </div>
        <Button asChild className="shadow-sm hover:shadow-md transition-shadow">
          <Link href="/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Link>
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        data-testid="dashboard-summary-cards"
      >
        <motion.div variants={cardVariants}>
          <Card className="card-interactive border-border/50 hover:border-border" data-testid="pending-total-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="pending-total-amount">
                    {formatCurrency(pendingTotal)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1" data-testid="pending-total-message">
                    {pendingTotal === 0
                      ? 'All invoices are paid!'
                      : 'Facturas enviadas sin pagar'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="card-interactive border-border/50 hover:border-border" data-testid="overdue-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-destructive" data-testid="overdue-count">
                    {overdueCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {overdueCount === 0 ? 'Sin vencimientos' : `${formatCurrency(overdueTotal)} total`}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="card-interactive border-border/50 hover:border-border" data-testid="paid-this-month-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobrado este Mes</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600" data-testid="paid-this-month-amount">
                    {formatCurrency(paidThisMonth)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Este mes</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="card-interactive border-border/50 hover:border-border" data-testid="active-clients-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid="total-invoices-count">
                    {summary
                      ? summary.status_counts.draft +
                        summary.status_counts.sent +
                        summary.status_counts.paid +
                        summary.status_counts.overdue +
                        summary.status_counts.cancelled
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">En todos los estados</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Invoices */}
      <motion.div variants={cardVariants}>
        <Card className="card-elevated border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Facturas Recientes</CardTitle>
              <CardDescription>Últimas facturas creadas y su estado actual</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="shadow-sm hover:shadow transition-shadow">
              <Link href="/invoices">
                Ver todas
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isInvoicesLoading ? (
              <div className="space-y-4" data-testid="recent-invoices-loading">
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
            ) : recentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="dashboard-empty-state">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No hay facturas aún</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Crea tu primera factura para comenzar a facturar profesionalmente.
                </p>
                <Button asChild className="shadow-sm hover:shadow-md transition-shadow">
                  <Link href="/invoices/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Factura
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-border/50 overflow-hidden" data-testid="recent-invoices-list">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">Cliente</TableHead>
                      <TableHead className="font-semibold">Número</TableHead>
                      <TableHead className="font-semibold">Monto</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                      <TableHead className="font-semibold">Vencimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map(invoice => (
                      <TableRow
                        key={invoice.id}
                        className="table-row-interactive cursor-pointer"
                        data-testid={`recent-invoice-row-${invoice.id}`}
                      >
                        <TableCell className="font-medium">
                          {invoice.client?.name || 'Sin cliente'}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={
                              invoice.status === 'draft'
                                ? `/invoices/${invoice.id}/edit`
                                : `/invoices/${invoice.id}`
                            }
                            className="font-mono text-sm text-primary hover:underline"
                          >
                            {invoice.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(invoice.total ?? 0)}</TableCell>
                        <TableCell>
                          <InvoiceStatusBadge status={invoice.status ?? 'draft'} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {invoice.due_date ? formatDate(invoice.due_date) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
