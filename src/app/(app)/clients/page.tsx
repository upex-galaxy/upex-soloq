import Link from 'next/link';
import type { Route } from 'next';
import { Plus, Users, ArrowUpDown, Search, X } from 'lucide-react';

import { createServer } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

type ClientRow = Database['public']['Tables']['clients']['Row'];
type ClientListRow = Pick<ClientRow, 'id' | 'name' | 'email' | 'company' | 'created_at'>;

type SortField = 'name' | 'created_at';
type SortOrder = 'asc' | 'desc';

function formatDate(date: string | null): string {
  if (!date) return 'Sin fecha';

  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default async function ClientsPage({
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
      <div className="space-y-8" data-testid="clientsPage">
        <Card>
          <CardHeader>
            <CardTitle>Necesitas iniciar sesión</CardTitle>
            <CardDescription>Inicia sesión para ver tus clientes.</CardDescription>
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
  const sortField: SortField = searchParams?.sort === 'name' ? 'name' : 'created_at';
  const orderParam =
    searchParams?.order === 'asc' || searchParams?.order === 'desc'
      ? searchParams.order
      : undefined;
  const sortOrder: SortOrder = orderParam ?? (sortField === 'name' ? 'asc' : 'desc');

  const pageParam = typeof searchParams?.page === 'string' ? Number(searchParams.page) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const query = supabase
    .from('clients')
    .select('id, name, email, company, created_at', { count: 'exact' })
    .eq('user_id', user.id)
    .is('deleted_at', null);

  const sanitizedSearch = search.replace(/[%_]/g, '');
  if (sanitizedSearch.length > 0) {
    query.or(`name.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%`);
  }

  query.order(sortField, { ascending: sortOrder === 'asc' }).range(from, to);

  const { data, count, error: clientsError } = await query;
  const clients = (data ?? []) as ClientListRow[];
  const totalClients = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalClients / pageSize));
  const currentPage = Math.min(page, totalPages);

  const buildHref = (
    updates: Partial<Record<'search' | 'sort' | 'order' | 'page', string>>
  ): Route => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
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
    return `/clients${queryString ? `?${queryString}` : ''}` as Route;
  };

  const nameNextOrder = sortField === 'name' && sortOrder === 'asc' ? 'desc' : 'asc';
  const createdNextOrder = sortField === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc';
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="space-y-8" data-testid="clientsPage">
      {userError || clientsError ? (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          data-testid="clients_error"
        >
          No pudimos cargar tus clientes. Intenta recargar la pagina.
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Administra tu base de clientes y su historial de facturacion.
          </p>
        </div>
        <Button asChild data-testid="new_client_button">
          <Link href="/clients/create">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Tu lista de clientes</CardTitle>
            <CardDescription>Busca por nombre o email para encontrar mas rapido.</CardDescription>
          </div>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            method="get"
            data-testid="clients_search_form"
          >
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Buscar cliente por nombre o email"
                className="pl-9"
                data-testid="client_search_input"
              />
              <input type="hidden" name="sort" value={sortField} />
              <input type="hidden" name="order" value={sortOrder} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" data-testid="client_search_button">
                Buscar
              </Button>
              {search ? (
                <Button variant="outline" asChild data-testid="clear_search_button">
                  <Link href="/clients">
                    <X className="mr-2 h-4 w-4" />
                    Limpiar
                  </Link>
                </Button>
              ) : null}
            </div>
          </form>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              data-testid="clients_empty_state"
            >
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">
                {search ? 'Sin resultados de busqueda' : 'No hay clientes aun'}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {search
                  ? 'Prueba con otro termino o limpia el filtro para ver todos tus clientes.'
                  : 'Agrega tu primer cliente para comenzar a crear facturas.'}
              </p>
              <Button asChild className="mt-4" data-testid="create_client_button">
                <Link href="/clients/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Cliente
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Table data-testid="clients_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Link
                        href={buildHref({ sort: 'name', order: nameNextOrder, page: '1' })}
                        className="inline-flex items-center gap-2"
                        data-testid="sort_name_link"
                      >
                        Nombre
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
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
                        Fecha
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map(client => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.company || 'Sin empresa'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(client.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-muted-foreground" data-testid="clients_pagination_label">
                  Pagina {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  {hasPrev ? (
                    <Button variant="outline" size="sm" asChild data-testid="clients_prev_page">
                      <Link href={buildHref({ page: String(currentPage - 1) })}>Anterior</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled data-testid="clients_prev_page">
                      Anterior
                    </Button>
                  )}
                  {hasNext ? (
                    <Button variant="outline" size="sm" asChild data-testid="clients_next_page">
                      <Link href={buildHref({ page: String(currentPage + 1) })}>Siguiente</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled data-testid="clients_next_page">
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
