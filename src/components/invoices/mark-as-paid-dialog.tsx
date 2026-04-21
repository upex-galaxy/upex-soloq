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

interface ConfiguredPaymentMethod {
  type: string;
  label: string;
}

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  invoiceTotal: number;
  invoiceIssueDate?: string;
  configuredMethods?: ConfiguredPaymentMethod[];
}

const ALL_PAYMENT_METHODS = [
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
  invoiceIssueDate,
  configuredMethods,
}: MarkAsPaidDialogProps) {
  const [amountReceived, setAmountReceived] = useState(invoiceTotal.toString());
  const defaultMethod = configuredMethods?.[0]?.type || 'bank_transfer';
  const [paymentMethod, setPaymentMethod] = useState(defaultMethod);
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
              <SelectTrigger id="payment_method" data-testid="payment-method-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {configuredMethods && configuredMethods.length > 0 ? (
                  <>
                    {configuredMethods.map(method => (
                      <SelectItem key={method.type} value={method.type}>
                        {method.label}
                      </SelectItem>
                    ))}
                    <div className="my-1 border-t border-border" />
                    {ALL_PAYMENT_METHODS.filter(
                      m => !configuredMethods.some(cm => cm.type === m.value)
                    ).map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </>
                ) : (
                  ALL_PAYMENT_METHODS.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))
                )}
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
              max={new Date().toISOString().split('T')[0]}
              required
              data-testid="payment-date-input"
            />
            {invoiceIssueDate && paymentDate && paymentDate < invoiceIssueDate && (
              <div
                className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-2 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400"
                data-testid="payment-date-before-issue-warning"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>La fecha de pago es anterior a la fecha de emisión de la factura</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => {
                if (e.target.value.length <= 500) setNotes(e.target.value);
              }}
              placeholder="Referencia de pago, número de transacción, notas..."
              rows={3}
              data-testid="payment-notes-input"
            />
            <div className="flex justify-end">
              <span
                className={`text-xs ${notes.length >= 450 ? 'text-yellow-600' : 'text-muted-foreground'} ${notes.length >= 500 ? 'text-destructive' : ''}`}
                data-testid="payment-notes-counter"
              >
                {notes.length}/500
              </span>
            </div>
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
