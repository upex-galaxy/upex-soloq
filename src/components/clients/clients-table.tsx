'use client';

import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { Client } from '@/lib/types';

type SortField = 'name' | 'created_at' | 'email';
type SortOrder = 'asc' | 'desc';

interface ClientsTableProps {
  clients: Client[];
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  isLoading?: boolean;
}

/**
 * Sortable table for displaying clients list
 * Click on header to sort, click on row to navigate to client detail
 */
export function ClientsTable({
  clients,
  sortBy,
  sortOrder,
  onSort,
  isLoading = false,
}: ClientsTableProps) {
  const router = useRouter();

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-LA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleRowClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  if (isLoading) {
    return <ClientsTableSkeleton />;
  }

  return (
    <Table data-testid="clients-table">
      <TableHeader>
        <TableRow>
          <TableHead>
            <button
              type="button"
              className="flex items-center hover:text-foreground transition-colors"
              onClick={() => onSort('name')}
              data-testid="clients-sort-name"
            >
              Nombre
              {getSortIcon('name')}
            </button>
          </TableHead>
          <TableHead>
            <button
              type="button"
              className="flex items-center hover:text-foreground transition-colors"
              onClick={() => onSort('email')}
              data-testid="clients-sort-email"
            >
              Email
              {getSortIcon('email')}
            </button>
          </TableHead>
          <TableHead className="hidden md:table-cell">Empresa</TableHead>
          <TableHead className="hidden sm:table-cell">
            <button
              type="button"
              className="flex items-center hover:text-foreground transition-colors"
              onClick={() => onSort('created_at')}
              data-testid="clients-sort-created"
            >
              Creado
              {getSortIcon('created_at')}
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map(client => (
          <TableRow
            key={client.id}
            className="cursor-pointer"
            onClick={() => handleRowClick(client.id)}
            data-testid={`clients-row-${client.id}`}
          >
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">
              {client.company || '-'}
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground">
              {formatDate(client.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Skeleton loader for clients table (5 rows)
 */
function ClientsTableSkeleton() {
  return (
    <Table data-testid="clients-table-skeleton">
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="hidden md:table-cell">Empresa</TableHead>
          <TableHead className="hidden sm:table-cell">Creado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-40" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Skeleton className="h-4 w-20" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
