import Link from 'next/link';
import type { Route } from 'next';
import { Plus, FileText, Search, X, ArrowUpDown } from 'lucide-react';

import { createServer } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
type InvoiceRow = Database['public']['Tables']['invoices']['Row'];

type InvoiceListRow = Pick<
  InvoiceRow,
  'id' | 'invoice_number' | 'status' | 'total' | 'issue_date' | 'due_date'
> & {
  client: { name: string | null; email: string | null } | null;
};

type SortField = 'issue_date' | 'total' | 'created_at';
type SortOrder = 'asc' | 'desc';

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

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = await createServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-8" data-testid="invoicesPage">
        <Card>
          <CardHeader>
            <CardTitle>Necesitas iniciar sesión</CardTitle>
            <CardDescription>Inicia sesión para ver tus facturas.</CardDescription>
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

  const search = typeof searchParams?.search === 'string' ? searchParams.search.trim() : '';
  const statusParam = typeof searchParams?.status === 'string' ? searchParams.status : 'all';
  const statusFilter = statusParam === 'all' ? null : statusParam;

  const sortField: SortField =
    searchParams?.sort === 'total' || searchParams?.sort === 'created_at'
      ? searchParams.sort
      : 'issue_date';
  const orderParam =
    searchParams?.order === 'asc' || searchParams?.order === 'desc'
      ? searchParams.order
      : undefined;
  const sortOrder: SortOrder = orderParam ?? 'desc';

  const pageParam = typeof searchParams?.page === 'string' ? Number(searchParams.page) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const query = supabase
    .from('invoices')
    .select(
      'id, invoice_number, status, total, issue_date, due_date, client:clients(name, email)',
      { count: 'exact' }
    )
    .eq('user_id', user.id)
    .is('deleted_at', null);

  if (statusFilter) {
    query.eq('status', statusFilter as InvoiceStatus);
  }

  const sanitizedSearch = search.replace(/[%_]/g, '');
  if (sanitizedSearch.length > 0) {
    query.or(
      `invoice_number.ilike.%${sanitizedSearch}%,clients.name.ilike.%${sanitizedSearch}%,clients.email.ilike.%${sanitizedSearch}%`
    );
  }

  query.order(sortField, { ascending: sortOrder === 'asc' }).range(from, to);

  const { data, count, error: invoicesError } = await query;
  const invoices = (data ?? []) as InvoiceListRow[];
  const totalInvoices = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalInvoices / pageSize));
  const currentPage = Math.min(page, totalPages);

  const buildHref = (
    updates: Partial<Record<'search' | 'status' | 'sort' | 'order' | 'page', string>>
  ): Route => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (statusParam) params.set('status', statusParam);
    if (sortField) params.set('sort', sortField);
    if (sortOrder) params.set('order', sortOrder);
    params.set('page', currentPage.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    return `/invoices${queryString ? `?${queryString}` : ''}` as Route;
  };

  const issueDateNextOrder = sortField === 'issue_date' && sortOrder === 'asc' ? 'desc' : 'asc';
  const totalNextOrder = sortField === 'total' && sortOrder === 'asc' ? 'desc' : 'asc';
  const createdNextOrder = sortField === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc';

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="space-y-8" data-testid="invoicesPage">
      {userError || invoicesError ? (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          data-testid="invoices_error"
        >
          No pudimos cargar tus facturas. Intenta recargar la pagina.
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
          <p className="text-muted-foreground">Gestiona todas tus facturas en un solo lugar.</p>
        </div>
        <Button asChild data-testid="new_invoice_button">
          <Link href="/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Tu lista de facturas</CardTitle>
            <CardDescription>Filtra por estado o busca por cliente o numero.</CardDescription>
          </div>
          <form
            className="flex flex-col gap-3 lg:flex-row lg:items-center"
            method="get"
            data-testid="invoices_filters_form"
          >
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Buscar por cliente o numero"
                className="pl-9"
                data-testid="invoice_search_input"
              />
              <input type="hidden" name="sort" value={sortField} />
              <input type="hidden" name="order" value={sortOrder} />
              <input type="hidden" name="status" value={statusParam} />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                name="status"
                defaultValue={statusParam}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                data-testid="invoice_status_filter"
              >
                <option value="all">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="sent">Enviada</option>
                <option value="paid">Pagada</option>
                <option value="overdue">Vencida</option>
                <option value="cancelled">Cancelada</option>
              </select>
              <Button type="submit" data-testid="invoice_search_button">
                Buscar
              </Button>
              {(search || statusParam !== 'all') && (
                <Button variant="outline" asChild data-testid="clear_invoice_filters_button">
                  <Link href="/invoices">
                    <X className="mr-2 h-4 w-4" />
                    Limpiar
                  </Link>
                </Button>
              )}
            </div>
          </form>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-testid="invoices_empty_state"
            >
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">
                {search || statusParam !== 'all'
                  ? 'Sin resultados de busqueda'
                  : 'No hay facturas aun'}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {search || statusParam !== 'all'
                  ? 'Prueba con otro termino o quita los filtros para ver todas tus facturas.'
                  : 'Crea tu primera factura para comenzar a facturar profesionalmente.'}
              </p>
              <Button asChild className="mt-4" data-testid="create_invoice_button">
                <Link href="/invoices/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Factura
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Table data-testid="invoices_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Numero</TableHead>
                    <TableHead>
                      <Link
                        href={buildHref({
                          sort: 'issue_date',
                          order: issueDateNextOrder,
                          page: '1',
                        })}
                        className="inline-flex items-center gap-2"
                        data-testid="sort_issue_date_link"
                      >
                        Fecha
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </TableHead>
                    <TableHead>
                      <Link
                        href={buildHref({
                          sort: 'total',
                          order: totalNextOrder,
                          page: '1',
                        })}
                        className="inline-flex items-center gap-2"
                        data-testid="sort_total_link"
                      >
                        Total
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>
                      <Link
                        href={buildHref({
                          sort: 'created_at',
                          order: createdNextOrder,
                          page: '1',
                        })}
                        className="inline-flex items-center gap-2"
                        data-testid="sort_created_at_link"
                      >
                        Creacion
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(invoice => {
                    const statusKey = (invoice.status ?? 'draft') as keyof typeof statusConfig;
                    const statusMeta = statusConfig[statusKey];

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{invoice.client?.name || 'Cliente sin nombre'}</span>
                            <span className="text-xs text-muted-foreground">
                              {invoice.client?.email || 'Sin email'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <Link
                            href={`/invoices/${invoice.id}` as Route}
                            className="text-primary hover:underline"
                            data-testid="invoice_detail_link"
                          >
                            {invoice.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(invoice.issue_date)}</TableCell>
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

              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p
                  className="text-sm text-muted-foreground"
                  data-testid="invoices_pagination_label"
                >
                  Pagina {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  {hasPrev ? (
                    <Button variant="outline" size="sm" asChild data-testid="invoices_prev_page">
                      <Link href={buildHref({ page: String(currentPage - 1) })}>Anterior</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled data-testid="invoices_prev_page">
                      Anterior
                    </Button>
                  )}
                  {hasNext ? (
                    <Button variant="outline" size="sm" asChild data-testid="invoices_next_page">
                      <Link href={buildHref({ page: String(currentPage + 1) })}>Siguiente</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled data-testid="invoices_next_page">
                      Siguiente
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
