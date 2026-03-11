'use client';

import Link from 'next/link';
import { Plus, SearchX, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ClientsEmptyStateProps {
  /** Whether this is a search result with no matches */
  isSearchResult?: boolean;
  /** Callback to clear search */
  onClearSearch?: () => void;
}

/**
 * Empty state component for clients list
 * Shows different content based on whether it's a search result or no clients at all
 */
export function ClientsEmptyState({
  isSearchResult = false,
  onClearSearch,
}: ClientsEmptyStateProps) {
  if (isSearchResult) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        data-testid="clients-empty-state"
      >
        <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No se encontraron clientes</h3>
        <p className="text-muted-foreground mb-4">Intenta con otros términos de búsqueda</p>
        {onClearSearch && (
          <Button variant="outline" onClick={onClearSearch} data-testid="clients-clear-search">
            Limpiar búsqueda
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center"
      data-testid="clients-empty-state"
    >
      <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium">No tienes clientes aún</h3>
      <p className="text-muted-foreground mb-4">
        Agrega tu primer cliente para comenzar a facturar.
      </p>
      <Button asChild data-testid="clients-add-first">
        <Link href="/clients/create">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Primer Cliente
        </Link>
      </Button>
    </div>
  );
}
