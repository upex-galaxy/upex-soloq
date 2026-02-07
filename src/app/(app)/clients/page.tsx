'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ClientsTable,
  ClientsSearch,
  ClientsEmptyState,
  ClientsPagination,
} from '@/components/clients';
import { useClients } from '@/hooks/clients/use-clients';
import { useDebounce } from '@/hooks/use-debounce';

type SortField = 'name' | 'created_at' | 'email';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 20;

export default function ClientsPage() {
  // Local state for filters
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(1);

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 300);

  // Fetch clients with React Query
  const { data, isLoading, error } = useClients({
    search: debouncedSearch,
    sortBy,
    sortOrder,
    page,
    limit: ITEMS_PER_PAGE,
  });

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
    // Reset to first page on sort change
    setPage(1);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    // Reset to first page on search change
    setPage(1);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader />
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-destructive mb-4">Error al cargar clientes</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clients = data?.clients ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const hasClients = clients.length > 0;
  const hasSearch = debouncedSearch.length > 0;
  const showEmptyState = !isLoading && !hasClients;

  return (
    <div className="space-y-8">
      <PageHeader />

      <Card>
        <CardContent className="pt-6">
          {/* Search bar - always visible if there are clients or a search is active */}
          {(total > 0 || hasSearch || hasClients) && (
            <div className="mb-6">
              <ClientsSearch value={search} onChange={handleSearchChange} />
            </div>
          )}

          {/* Empty state */}
          {showEmptyState && (
            <ClientsEmptyState
              isSearchResult={hasSearch}
              onClearSearch={hasSearch ? handleClearSearch : undefined}
            />
          )}

          {/* Loading or table */}
          {(isLoading || hasClients) && (
            <>
              <ClientsTable
                clients={clients}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                isLoading={isLoading}
              />

              {/* Pagination */}
              {!isLoading && hasClients && (
                <ClientsPagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  limit={ITEMS_PER_PAGE}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Administra tu base de clientes y su historial de facturación.
        </p>
      </div>
      <Button asChild>
        <Link href="/clients/create">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Link>
      </Button>
    </div>
  );
}
