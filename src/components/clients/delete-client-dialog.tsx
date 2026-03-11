'use client';

import { Loader2, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteClientDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Client name to display in confirmation */
  clientName: string;
  /** Callback when delete is confirmed */
  onConfirm: () => void;
  /** Whether delete is in progress */
  isLoading?: boolean;
}

/**
 * Confirmation dialog for deleting a client
 *
 * Features:
 * - Shows client name in confirmation message
 * - Loading state on confirm button
 * - Prevents duplicate submissions
 * - Cancel and confirm actions
 */
export function DeleteClientDialog({
  open,
  onOpenChange,
  clientName,
  onConfirm,
  isLoading = false,
}: DeleteClientDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} data-testid="delete-client-dialog">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">Eliminar cliente</DialogTitle>
          <DialogDescription className="text-center">
            ¿Estás seguro de que deseas eliminar a <strong>{clientName}</strong>? Esta acción no se
            puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            data-testid="delete-client-cancel"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            data-testid="delete-client-confirm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
