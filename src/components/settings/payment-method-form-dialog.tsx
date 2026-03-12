'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { PaymentMethod, PaymentMethodType } from '@/lib/types';
import { PAYMENT_METHOD_OPTIONS } from '@/lib/types';
import {
  paypalValueSchema,
  cashValueSchema,
  otherValueSchema,
  parsePaymentValue,
  stringifyPaymentValue,
  getDefaultValueForType,
} from '@/lib/validations/payment-method';

interface PaymentMethodFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { type: PaymentMethodType; label: string; value: string; is_default: boolean }) => void;
  method?: PaymentMethod | null;
  country?: string;
  isPending?: boolean;
}

// Build a combined schema for the form dynamically
function buildFormSchema(type: PaymentMethodType, country?: string) {
  const base = z.object({
    type: z.enum(['bank_transfer', 'paypal', 'mercado_pago', 'cash', 'other'] as const),
    label: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
    is_default: z.boolean(),
  });

  switch (type) {
    case 'bank_transfer': {
      const bankSchema = z.object({
        bank_name: z.string().min(1, 'Nombre del banco requerido'),
        account_number: z.string().optional().or(z.literal('')),
        clabe: country === 'MX'
          ? z.string().regex(/^\d{18}$/, 'CLABE debe tener 18 dígitos')
          : z.string().optional().or(z.literal('')),
        cbu: country === 'AR'
          ? z.string().regex(/^\d{22}$/, 'CBU debe tener 22 dígitos')
          : z.string().optional().or(z.literal('')),
      });
      return base.extend({ value: bankSchema });
    }
    case 'paypal':
      return base.extend({ value: paypalValueSchema });
    case 'mercado_pago': {
      const mpSchema = z
        .object({
          alias: z.string().optional().or(z.literal('')),
          cvu: z.string().optional().or(z.literal('')),
        })
        .refine((d) => (d.alias && d.alias.length > 0) || (d.cvu && d.cvu.length > 0), {
          message: 'Ingresa alias o CVU',
        });
      return base.extend({ value: mpSchema });
    }
    case 'cash':
      return base.extend({ value: cashValueSchema });
    case 'other':
      return base.extend({ value: otherValueSchema });
  }
}

type FormValues = {
  type: PaymentMethodType;
  label: string;
  is_default: boolean;
  value: Record<string, string>;
};

export function PaymentMethodFormDialog({
  open,
  onClose,
  onSave,
  method,
  country,
  isPending,
}: PaymentMethodFormDialogProps) {
  const isEditing = !!method;

  const defaultType: PaymentMethodType = method?.type ?? 'bank_transfer';
  const defaultValue = method
    ? parsePaymentValue(method.value, method.type)
    : getDefaultValueForType(defaultType);

  const form = useForm<FormValues>({
    defaultValues: {
      type: defaultType,
      label: method?.label ?? '',
      is_default: method?.is_default ?? false,
      value: defaultValue as Record<string, string>,
    },
  });

  const selectedType = form.watch('type');

  // Dynamic resolver based on selected type
  const schema = useMemo(() => buildFormSchema(selectedType, country), [selectedType, country]);

  // Update resolver when type changes
  useEffect(() => {
    const currentResolver = zodResolver(schema);
    form.clearErrors();
    // Re-set the resolver by triggering revalidation on next submit
    // The resolver is applied through the form's handleSubmit
    void currentResolver;
  }, [schema, form]);

  // Reset value fields when type changes (only for new methods)
  useEffect(() => {
    if (!isEditing) {
      const newDefault = getDefaultValueForType(selectedType);
      form.setValue('value', newDefault as Record<string, string>);
    }
  }, [selectedType, isEditing, form]);

  // Reset form when dialog opens or editing method changes
  useEffect(() => {
    if (!open) return;

    if (method) {
      const parsed = parsePaymentValue(method.value, method.type);
      form.reset({
        type: method.type,
        label: method.label,
        is_default: method.is_default ?? false,
        value: parsed as Record<string, string>,
      });
    } else {
      form.reset({
        type: 'bank_transfer',
        label: '',
        is_default: false,
        value: getDefaultValueForType('bank_transfer') as Record<string, string>,
      });
    }
  }, [method, open, form]);

  async function handleSubmit(data: FormValues) {
    // Validate value with the type-specific schema
    const result = schema.safeParse(data);
    if (!result.success) {
      // Map errors to form
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        form.setError(path as keyof FormValues, { message: issue.message });
      }
      return;
    }

    onSave({
      type: data.type,
      label: data.label,
      value: stringifyPaymentValue(data.value),
      is_default: data.is_default,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg" data-testid="paymentMethodFormDialog">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar método de pago' : 'Agregar método de pago'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Type selector */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                    }}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="payment_type_select">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_METHOD_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Label */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej: BBVA México, PayPal personal"
                      data-testid="payment_label_input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Dynamic fields per type */}
            <DynamicValueFields type={selectedType} country={country} form={form} />

            {/* Default checkbox */}
            <FormField
              control={form.control}
              name="is_default"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="payment_default_checkbox"
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Método preferido</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="payment_cancel_button"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} data-testid="payment_save_button">
                {isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Dynamic Fields Component
// =============================================================================

function DynamicValueFields({
  type,
  country,
  form,
}: {
  type: PaymentMethodType;
  country?: string;
  form: ReturnType<typeof useForm<FormValues>>;
}) {
  switch (type) {
    case 'bank_transfer':
      return (
        <div className="space-y-4" data-testid="bank_transfer_fields">
          <FormField
            control={form.control}
            name="value.bank_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del banco</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="BBVA, Santander, Galicia..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {country === 'MX' && (
            <FormField
              control={form.control}
              name="value.clabe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CLABE (18 dígitos)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="012345678901234567" maxLength={18} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {country === 'AR' && (
            <FormField
              control={form.control}
              name="value.cbu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CBU (22 dígitos)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0123456789012345678901" maxLength={22} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {country !== 'MX' && country !== 'AR' && (
            <FormField
              control={form.control}
              name="value.account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de cuenta</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Número de cuenta bancaria" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      );

    case 'paypal':
      return (
        <div className="space-y-4" data-testid="paypal_fields">
          <FormField
            control={form.control}
            name="value.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de PayPal</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="tu@email.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'mercado_pago':
      return (
        <div className="space-y-4" data-testid="mercado_pago_fields">
          <FormField
            control={form.control}
            name="value.alias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alias</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="tu.alias.mp" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value.cvu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CVU (opcional si tienes alias)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="0000000000000000000000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'cash':
      return (
        <div className="space-y-4" data-testid="cash_fields">
          <FormField
            control={form.control}
            name="value.instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instrucciones (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Instrucciones para el pago en efectivo..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 'other':
      return (
        <div className="space-y-4" data-testid="other_fields">
          <FormField
            control={form.control}
            name="value.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del método</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Wise, Zelle, Crypto..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value.instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instrucciones (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Instrucciones para el pago..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
  }
}
