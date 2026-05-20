'use client';

import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSendInvoice } from '@/hooks/invoices';

interface SendInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
}

export function SendInvoiceDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  clientName,
  clientEmail,
}: SendInvoiceDialogProps) {
  const { mutate: sendInvoice, isPending } = useSendInvoice();

  const handleSend = () => {
    sendInvoice(invoiceId, {
      onSuccess: () => {
        toast.success('Factura enviada correctamente');
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Error al enviar la factura');
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="send-invoice-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Enviar Factura</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción enviará la factura <strong>{invoiceNumber}</strong> por email a{' '}
            <strong>{clientName}</strong> ({clientEmail}). Se generará un PDF y se enviará como
            adjunto. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} data-testid="cancel-send-button">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSend}
            disabled={isPending}
            data-testid="confirm-send-button"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Factura
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
