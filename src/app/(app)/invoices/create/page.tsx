'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter';
import {
  ClientSelector,
  CreateClientDialog,
  DueDatePicker,
  TaxInput,
  DiscountInput,
  InvoiceSummary,
} from '@/components/invoices';

// Dynamic import to avoid SSR issues with @react-pdf/renderer
const InvoicePreviewDialog = dynamic(
  () =>
    import('@/components/invoices/invoice-preview-dialog').then(mod => ({
      default: mod.InvoicePreviewDialog,
    })),
  { ssr: false }
);
import { LineItemsTable } from '@/components/invoices/line-items-table';
import { InvoiceNumberInput } from '@/components/invoices/invoice-number-input';
import { calculateDiscountAmount } from '@/lib/utils/invoice-calculations';
import {
  buildPreviewData,
  canShowPreview,
  getPreviewDisabledReason,
} from '@/lib/utils/invoice-preview';
import type { DiscountType } from '@/lib/validations/invoice';
import { useClients } from '@/hooks/clients';
import { useCreateInvoice } from '@/hooks/invoices';
import { useBusinessProfile } from '@/hooks/business-profile';
import { createInvoiceSchema, type CreateInvoiceFormData } from '@/lib/validations/invoice';
import type { Client } from '@/lib/types';

/**
 * Calculate default due date (30 days from now)
 */
function getDefaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}

export default function CreateInvoicePage() {
  const router = useRouter();

  // State for selected client and dialogs
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch all clients (no pagination for selector)
  const { data: clientsData, isLoading: isLoadingClients } = useClients({
    limit: 100,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Fetch business profile for default terms
  const { data: businessProfile } = useBusinessProfile();

  // Create invoice mutation
  const { mutate: createInvoice, isPending: isCreating } = useCreateInvoice();

  // State for invoice number validation
  const [isInvoiceNumberValid, setIsInvoiceNumberValid] = useState(true);

  // State for subtotal from line items (SQ-22)
  const [subtotal, setSubtotal] = useState(0);

  // Form setup
  const form = useForm<CreateInvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      clientId: '',
      invoiceNumber: '',
      dueDate: getDefaultDueDate(),
      notes: '',
      terms: '',
      taxRate: 0,
      discountType: null,
      discountValue: 0,
      // SQ-22: Start with one empty line item
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  // Prefill terms with default_terms from business profile (only on mount)
  useEffect(() => {
    if (businessProfile?.default_terms && !form.getValues('terms')) {
      form.setValue('terms', businessProfile.default_terms);
    }
  }, [businessProfile, form]);

  // Watch values for reactive summary
  const taxRate = form.watch('taxRate') ?? 0;
  const discountType = form.watch('discountType');
  const discountValue = form.watch('discountValue') ?? 0;

  // Calculate discount amount for summary (SQ-22: subtotal comes from line items)
  const { amount: discountAmount } = calculateDiscountAmount(subtotal, discountType, discountValue);

  // SQ-97: Validate percentage discount cannot exceed 100%
  const isDiscountInvalid = discountType === 'percentage' && discountValue > 100;

  // Handle client selection
  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      form.setValue('clientId', client.id, { shouldValidate: true });
    } else {
      form.setValue('clientId', '', { shouldValidate: true });
    }
  };

  // Handle new client created
  const handleClientCreated = (client: Client) => {
    handleClientSelect(client);
    toast.success(`Cliente "${client.name}" creado`);
  };

  // Handle form submission
  const handleSubmit = (data: CreateInvoiceFormData) => {
    createInvoice(data, {
      onSuccess: invoice => {
        toast.success(`Factura ${invoice.invoice_number} creada`);
        router.push(`/invoices`); // TODO: Change to /invoices/${invoice.id} when detail page exists
      },
      onError: error => {
        toast.error(error.message);
      },
    });
  };

  const clients = clientsData?.clients ?? [];

  return (
    <div className="space-y-6" data-testid="create-invoice-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Factura</h1>
          <p className="text-muted-foreground">Crea una nueva factura seleccionando un cliente.</p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Factura</CardTitle>
          <CardDescription>
            Selecciona un cliente y configura los detalles básicos de la factura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
              data-testid="create-invoice-form"
            >
              {/* Client Selector */}
              <FormField
                control={form.control}
                name="clientId"
                render={({ fieldState }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <FormControl>
                      <ClientSelector
                        value={selectedClient}
                        clients={clients}
                        isLoading={isLoadingClients}
                        onSelect={handleClientSelect}
                        onAddNew={() => setIsCreateClientOpen(true)}
                        error={fieldState.error?.message}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormDescription>
                      Selecciona el cliente al que se enviará esta factura.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invoice Number */}
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InvoiceNumberInput
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onValidate={(isValid, error) => {
                          setIsInvoiceNumberValid(isValid);
                          if (error) {
                            form.setError('invoiceNumber', { message: error });
                          } else {
                            form.clearErrors('invoiceNumber');
                          }
                        }}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Fecha de vencimiento</FormLabel>
                    <FormControl>
                      <DueDatePicker
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        disabled={isCreating}
                        error={fieldState.error?.message}
                      />
                    </FormControl>
                    <FormDescription>La fecha límite de pago para esta factura.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Line Items (SQ-22) */}
              <LineItemsTable
                control={form.control}
                errors={form.formState.errors}
                onSubtotalChange={setSubtotal}
                disabled={isCreating}
              />

              {/* Tax Rate */}
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Impuesto (IVA)</FormLabel>
                    <FormControl>
                      <TaxInput
                        value={field.value ?? 0}
                        onChange={field.onChange}
                        disabled={isCreating}
                        error={fieldState.error?.message}
                      />
                    </FormControl>
                    <FormDescription>
                      Selecciona la tasa de impuesto. Presets comunes para LATAM disponibles.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Discount */}
              <FormItem>
                <FormLabel>Descuento (opcional)</FormLabel>
                <FormControl>
                  <DiscountInput
                    subtotal={subtotal}
                    discountType={discountType as DiscountType | null}
                    discountValue={discountValue}
                    onChange={(type, value) => {
                      form.setValue('discountType', type);
                      form.setValue('discountValue', value);
                    }}
                    disabled={isCreating}
                    error={form.formState.errors.discountValue?.message}
                  />
                </FormControl>
                <FormDescription>
                  Aplica un descuento porcentual o de monto fijo a la factura.
                </FormDescription>
                <FormMessage />
              </FormItem>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (opcional)</FormLabel>
                    <FormControl>
                      <TextareaWithCounter
                        maxLength={2000}
                        placeholder="Mensaje personal para el cliente..."
                        className="min-h-[100px]"
                        {...field}
                        disabled={isCreating}
                        data-testid="invoice-notes-input"
                      />
                    </FormControl>
                    <FormDescription>
                      Mensaje personalizado que aparecerá en la factura.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Terms */}
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Términos y condiciones (opcional)</FormLabel>
                    <FormControl>
                      <TextareaWithCounter
                        maxLength={1000}
                        placeholder="Condiciones de pago, políticas, etc..."
                        className="min-h-[100px]"
                        {...field}
                        disabled={isCreating}
                        data-testid="invoice-terms-input"
                      />
                    </FormControl>
                    <FormDescription>
                      Términos legales o condiciones de pago. Se pre-llenan desde tu perfil de
                      negocio.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invoice Summary */}
              <InvoiceSummary
                subtotal={subtotal}
                discountAmount={discountAmount}
                discountType={discountType as DiscountType | null}
                discountInputValue={discountValue}
                taxRate={taxRate}
              />

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/invoices')}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={isCreating || !canShowPreview(form.getValues(), !!selectedClient)}
                  title={getPreviewDisabledReason(form.getValues(), !!selectedClient) ?? undefined}
                  data-testid="preview-button"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Vista previa
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !selectedClient || !isInvoiceNumberValid || isDiscountInvalid}
                  data-testid="save-invoice-button"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar como borrador'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Create Client Dialog */}
      <CreateClientDialog
        open={isCreateClientOpen}
        onOpenChange={setIsCreateClientOpen}
        onSuccess={handleClientCreated}
      />

      {/* Invoice Preview Dialog (SQ-26) */}
      {selectedClient && businessProfile !== undefined && (
        <InvoicePreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          previewData={buildPreviewData(form.getValues(), selectedClient, businessProfile ?? null)}
        />
      )}
    </div>
  );
}
