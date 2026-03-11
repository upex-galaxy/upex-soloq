'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ClientsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination controls for clients list
 * Shows page numbers and prev/next buttons
 */
export function ClientsPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: ClientsPaginationProps) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Generate page numbers to display (max 5)
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    let startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    // Adjust start if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
        Mostrando {total} {total === 1 ? 'cliente' : 'clientes'}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4"
      data-testid="clients-pagination"
    >
      <p className="text-sm text-muted-foreground">
        Mostrando {start}-{end} de {total} clientes
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          data-testid="clients-pagination-prev"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Página anterior</span>
        </Button>

        {getPageNumbers().map(pageNum => (
          <Button
            key={pageNum}
            variant={pageNum === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            data-testid={`clients-pagination-page-${pageNum}`}
          >
            {pageNum}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          data-testid="clients-pagination-next"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Página siguiente</span>
        </Button>
      </div>
    </div>
  );
}
