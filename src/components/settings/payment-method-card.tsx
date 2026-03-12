'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PaymentMethod, PaymentMethodType } from '@/lib/types';
import { parsePaymentValue } from '@/lib/validations/payment-method';
import { PAYMENT_METHOD_OPTIONS } from '@/lib/types';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isLastActive: boolean;
  onEdit: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
  onToggle: (method: PaymentMethod, active: boolean) => void;
  isToggling?: boolean;
}

const TYPE_ICONS: Record<PaymentMethodType, string> = {
  bank_transfer: '\u{1F3E6}',
  paypal: '\u{1F4B3}',
  mercado_pago: '\u{1F4F1}',
  cash: '\u{1F4B5}',
  other: '\u{1F4C4}',
};

function getValueSummary(value: string, type: PaymentMethodType): string {
  const parsed = parsePaymentValue(value, type);

  switch (type) {
    case 'bank_transfer': {
      const v = parsed as { bank_name?: string; clabe?: string; cbu?: string; account_number?: string };
      if (v.clabe) return `CLABE: ${v.clabe.slice(0, 4)}...${v.clabe.slice(-4)}`;
      if (v.cbu) return `CBU: ${v.cbu.slice(0, 4)}...${v.cbu.slice(-4)}`;
      if (v.account_number) return `Cuenta: ${v.account_number}`;
      return v.bank_name || '';
    }
    case 'paypal': {
      const v = parsed as { email?: string };
      return v.email || '';
    }
    case 'mercado_pago': {
      const v = parsed as { alias?: string; cvu?: string };
      return v.alias || v.cvu || '';
    }
    case 'cash': {
      const v = parsed as { instructions?: string };
      const instr = v.instructions || '';
      return instr.length > 50 ? `${instr.slice(0, 50)}...` : instr;
    }
    case 'other': {
      const v = parsed as { name?: string; instructions?: string };
      return v.name || '';
    }
  }
}

function getTypeLabel(type: PaymentMethodType): string {
  return PAYMENT_METHOD_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export function PaymentMethodCard({
  method,
  isLastActive,
  onEdit,
  onDelete,
  onToggle,
  isToggling,
}: PaymentMethodCardProps) {
  const icon = TYPE_ICONS[method.type];
  const summary = getValueSummary(method.value, method.type);
  const typeLabel = getTypeLabel(method.type);
  const isDisabledSwitch = isLastActive && method.is_active;

  return (
    <div data-testid="paymentMethodCard">
      <div className="flex items-start justify-between gap-4 py-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-2xl mt-0.5" aria-hidden="true">
            {icon}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium" data-testid="payment_method_label">
                {method.label}
              </span>
              <Badge variant="outline" className="text-xs">
                {typeLabel}
              </Badge>
              {method.is_default && (
                <Badge variant="secondary" className="text-xs">
                  Preferido
                </Badge>
              )}
            </div>
            {summary && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate" data-testid="payment_method_value">
                {summary}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    checked={method.is_active}
                    onCheckedChange={(checked) => onToggle(method, checked)}
                    disabled={isDisabledSwitch || isToggling}
                    data-testid="payment_method_toggle"
                    aria-label={method.is_active ? 'Desactivar método' : 'Activar método'}
                  />
                </div>
              </TooltipTrigger>
              {isDisabledSwitch && (
                <TooltipContent>
                  <p>Debes tener al menos un método de pago activo</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(method)}
            data-testid="payment_method_edit"
            aria-label="Editar método"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(method)}
            disabled={isLastActive && method.is_active}
            data-testid="payment_method_delete"
            aria-label="Eliminar método"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Separator />
    </div>
  );
}
