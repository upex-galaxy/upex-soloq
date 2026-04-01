'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, AlertTriangle, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMarkAsPaid } from '@/hooks/invoices';

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  invoiceTotal: number;
}

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Transferencia Bancaria' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'mercado_pago', label: 'Mercado Pago' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'other', label: 'Otro' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function MarkAsPaidDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  invoiceTotal,
}: MarkAsPaidDialogProps) {
  const [amountReceived, setAmountReceived] = useState(invoiceTotal.toString());
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const markAsPaid = useMarkAsPaid();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(amountReceived);
    if (isNaN(amount) || amount <= 0) return;

    markAsPaid.mutate(
      {
        invoiceId,
        amount_received: amount,
        payment_method: paymentMethod,
        payment_date: paymentDate,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="mark-as-paid-dialog">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Registrar pago para la factura {invoiceNumber} ({formatCurrency(invoiceTotal)})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount_received">Monto Recibido</Label>
            <Input
              id="amount_received"
              type="number"
              step="0.01"
              min="0.01"
              value={amountReceived}
              onChange={e => setAmountReceived(e.target.value)}
              required
              data-testid="payment-amount-input"
            />
            {/* Amount comparison feedback */}
            {(() => {
              const amount = parseFloat(amountReceived);
              if (isNaN(amount) || amount <= 0) return null;

              if (amount < invoiceTotal) {
                return (
                  <div
                    className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-2 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                    data-testid="payment-partial-warning"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Pago parcial: {formatCurrency(amount)} de {formatCurrency(invoiceTotal)}
                    </span>
                  </div>
                );
              }

              if (amount > invoiceTotal) {
                return (
                  <div
                    className="flex items-start gap-2 rounded-md border border-blue-300 bg-blue-50 p-2 text-sm text-blue-800 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                    data-testid="payment-overpayment-notice"
                  >
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Sobrepago: {formatCurrency(amount)} excede el total de {formatCurrency(invoiceTotal)}
                    </span>
                  </div>
                );
              }

              return (
                <p className="text-xs text-green-600" data-testid="payment-full-match">
                  Coincide con el total de la factura
                </p>
              );
            })()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Método de Pago</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger data-testid="payment-method-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map(method => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_date">Fecha de Pago</Label>
            <Input
              id="payment_date"
              type="date"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              required
              data-testid="payment-date-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notas adicionales sobre el pago..."
              rows={2}
              data-testid="payment-notes-input"
            />
          </div>

          {markAsPaid.isError && (
            <p className="text-sm text-destructive" data-testid="payment-error-message">
              {markAsPaid.error?.message || 'Error al registrar el pago'}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={markAsPaid.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={markAsPaid.isPending}
              data-testid="confirm-payment-button"
            >
              {markAsPaid.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Confirmar Pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
