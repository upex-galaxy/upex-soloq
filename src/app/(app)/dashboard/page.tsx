import Link from 'next/link';
import type { Route } from 'next';
import { DollarSign, FileText, AlertTriangle, Users, Plus, ArrowUpRight } from 'lucide-react';

import { createServer } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Database } from '@/types/supabase';

type InvoiceStatus = Database['public']['Enums']['invoice_status'];

type RecentInvoiceRow = {
  id: string;
  invoice_number: string;
  total: number | null;
  status: InvoiceStatus | null;
  due_date: string | null;
  client: { name: string | null } | null;
};

type StatsInvoiceRow = {
  total: number | null;
  status: InvoiceStatus | null;
  due_date: string | null;
  paid_at: string | null;
  issue_date: string | null;
  client_id: string | null;
};

const statusConfig = {
  draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
  sent: { label: 'Enviada', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  paid: { label: 'Pagada', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  overdue: { label: 'Vencida', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
  cancelled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-500 hover:bg-gray-100' },
} as const;

function formatCurrency(amount: number | null, currency: string = 'USD'): string {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(value);
}

function formatDate(date: string | null): string {
  if (!date) return 'Sin fecha';

  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default async function DashboardPage() {
  const supabase = await createServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-8" data-testid="dashboardPage">
        <Card>
          <CardHeader>
            <CardTitle>Necesitas iniciar sesión</CardTitle>
            <CardDescription>Inicia sesión para ver tu dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild data-testid="login_link">
              <Link href="/login">Ir a Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [businessResult, recentInvoicesResult, statsInvoicesResult] = await Promise.all([
    supabase.from('business_profiles').select('business_name').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('invoices')
      .select('id, invoice_number, total, status, due_date, client:clients(name)')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('invoices')
      .select('total, status, due_date, paid_at, issue_date, client_id')
      .eq('user_id', user.id)
      .is('deleted_at', null),
  ]);

  const recentInvoices = (recentInvoicesResult.data ?? []) as RecentInvoiceRow[];
  const statsInvoices = (statsInvoicesResult.data ?? []) as StatsInvoiceRow[];

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const totalPending = statsInvoices.reduce((sum, invoice) => {
    if (invoice.status === 'sent' || invoice.status === 'overdue') {
      return sum + (invoice.total ?? 0);
    }

    return sum;
  }, 0);

  const overdueCount = statsInvoices.filter(invoice => {
    if (invoice.status === 'overdue') return true;
    if (invoice.status === 'sent' && invoice.due_date) {
      return new Date(invoice.due_date) < startOfToday;
    }

    return false;
  }).length;

  const paidThisMonth = statsInvoices.reduce((sum, invoice) => {
    if (invoice.status !== 'paid' || !invoice.paid_at) return sum;

    const paidAt = new Date(invoice.paid_at);
    if (paidAt >= startOfMonth) {
      return sum + (invoice.total ?? 0);
    }

    return sum;
  }, 0);

  const activeClientIds = new Set(
    statsInvoices
      .filter(invoice => invoice.issue_date && new Date(invoice.issue_date) >= ninetyDaysAgo)
      .map(invoice => invoice.client_id)
      .filter((clientId): clientId is string => Boolean(clientId))
  );

  const activeClients = activeClientIds.size;

  const displayName = businessResult.data?.business_name || user.email?.split('@')[0] || 'Usuario';

  const loadError =
    userError || businessResult.error || recentInvoicesResult.error || statsInvoicesResult.error;

  return (
    <div className="space-y-8" data-testid="dashboardPage">
      {loadError ? (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          data-testid="dashboard_error"
        >
          No pudimos cargar todo tu resumen. Intenta recargar la pagina.
        </div>
      ) : null}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {displayName}</h1>
          <p className="text-muted-foreground">
            Aqui esta el resumen de tu actividad de facturacion.
          </p>
        </div>
        <Button asChild data-testid="new_invoice_button">
          <Link href="/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="dashboardStats">
        <Card data-testid="pending_total_card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">Facturas enviadas sin pagar</p>
          </CardContent>
        </Card>

        <Card data-testid="overdue_invoices_card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">Requieren seguimiento</p>
          </CardContent>
        </Card>

        <Card data-testid="paid_this_month_card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobrado este Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(paidThisMonth)}</div>
            <p className="text-xs text-muted-foreground">Ultimos pagos confirmados</p>
          </CardContent>
        </Card>

        <Card data-testid="active_clients_card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">Con facturas este trimestre</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card data-testid="recent_invoices_section">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Facturas Recientes</CardTitle>
            <CardDescription>Ultimas facturas creadas y su estado actual</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild data-testid="view_all_invoices_button">
            <Link href="/invoices">
              Ver todas
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-testid="invoices_empty_state"
            >
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No hay facturas aun</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera factura para comenzar a facturar profesionalmente.
              </p>
              <Button asChild data-testid="create_first_invoice_button">
                <Link href="/invoices/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Factura
                </Link>
              </Button>
            </div>
          ) : (
            <Table data-testid="recent_invoices_table">
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Numero</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vencimiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map(invoice => {
                  const statusKey = (invoice.status ?? 'draft') as keyof typeof statusConfig;
                  const statusMeta = statusConfig[statusKey];

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.client?.name || 'Cliente sin nombre'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <Link
                          href={`/invoices/${invoice.id}` as Route}
                          className="text-primary hover:underline"
                          data-testid="recent_invoice_detail_link"
                        >
                          {invoice.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusMeta.className}>
                          {statusMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invoice.due_date)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
