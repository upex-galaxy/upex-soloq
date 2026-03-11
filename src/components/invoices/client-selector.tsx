'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, Search, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Client } from '@/lib/types';

interface ClientSelectorProps {
  /** Currently selected client */
  value?: Client | null;
  /** List of available clients */
  clients: Client[];
  /** Loading state */
  isLoading?: boolean;
  /** Called when a client is selected */
  onSelect: (client: Client | null) => void;
  /** Called when "Add new client" is clicked */
  onAddNew: () => void;
  /** Error message to display */
  error?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * Client selector with search and inline add functionality
 *
 * Features:
 * - Searchable dropdown with client list
 * - Format: "{name} ({email})"
 * - Empty state for no clients
 * - "Add new client" button
 * - Case-insensitive search
 */
export function ClientSelector({
  value,
  clients,
  isLoading = false,
  onSelect,
  onAddNew,
  error,
  disabled = false,
}: ClientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter clients based on search
  const filteredClients = clients.filter(client => {
    const searchLower = search.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.company?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const hasNoClients = clients.length === 0;
  const hasNoResults = !hasNoClients && filteredClients.length === 0 && search.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle client selection
  const handleSelect = (client: Client) => {
    onSelect(client);
    setIsOpen(false);
    setSearch('');
  };

  // Format client display text
  const formatClient = (client: Client) => `${client.name} (${client.email})`;

  return (
    <div ref={containerRef} className="relative" data-testid="client-selector">
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'w-full justify-between font-normal',
          !value && 'text-muted-foreground',
          error && 'border-destructive'
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        data-testid="client-selector-trigger"
      >
        {isLoading ? (
          'Cargando clientes...'
        ) : value ? (
          <span className="truncate">{formatClient(value)}</span>
        ) : (
          'Selecciona un cliente'
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive mt-1" data-testid="client-selector-error">
          {error}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-0 shadow-md"
          role="listbox"
          data-testid="client-selector-dropdown"
        >
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={inputRef}
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
              data-testid="client-search-input"
            />
          </div>

          {/* Client List */}
          <div className="max-h-60 overflow-y-auto p-1">
            {/* Empty state - No clients at all */}
            {hasNoClients && (
              <div
                className="flex flex-col items-center justify-center py-6 text-center"
                data-testid="no-clients-message"
              >
                <UserPlus className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No tienes clientes aún.
                  <br />
                  ¡Crea tu primer cliente!
                </p>
              </div>
            )}

            {/* No search results */}
            {hasNoResults && (
              <div
                className="py-4 text-center text-sm text-muted-foreground"
                data-testid="no-results-message"
              >
                No se encontraron clientes
              </div>
            )}

            {/* Client options */}
            {filteredClients.map(client => (
              <button
                key={client.id}
                type="button"
                className={cn(
                  'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-2 text-sm outline-none',
                  'hover:bg-accent hover:text-accent-foreground',
                  value?.id === client.id && 'bg-accent'
                )}
                onClick={() => handleSelect(client)}
                data-testid={`client-option-${client.id}`}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value?.id === client.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{client.name}</span>
                  <span className="text-xs text-muted-foreground">{client.email}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Add New Client Button */}
          <div className="border-t p-1">
            <button
              type="button"
              className="flex w-full items-center rounded-sm py-2 px-2 text-sm text-primary hover:bg-accent"
              onClick={() => {
                setIsOpen(false);
                onAddNew();
              }}
              data-testid="add-client-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar nuevo cliente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
