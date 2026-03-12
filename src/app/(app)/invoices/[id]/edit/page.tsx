'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Trash2, Save, AlertCircle, Check, Clock, Eye } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ClientSelector,
  CreateClientDialog,
  DueDatePicker,
  TaxInput,
  DiscountInput,
  InvoiceSummary,
  InvoiceStatusBadge,
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
import { useClients } from '@/hooks/clients';
import { useInvoice, useUpdateInvoice, useDeleteInvoice, useAutoSave } from '@/hooks/invoices';
import {
  updateInvoiceSchema,
  type UpdateInvoiceData,
  type DiscountType,
} from '@/lib/validations/invoice';
import { calculateDiscountAmount } from '@/lib/utils/invoice-calculations';
import {
  buildPreviewData,
  canShowPreview,
  getPreviewDisabledReason,
} from '@/lib/utils/invoice-preview';
import { useBusinessProfile } from '@/hooks/business-profile';
import type { Client } from '@/lib/types';

/**
 * Edit Invoice Page (TC-04: Resume editing draft)
 *
 * Features:
 * - Load existing draft data
 * - Auto-save with 2s debounce (TC-02)
 * - Manual save button (TC-01)
 * - Delete with confirmation (TC-05)
 * - Unsaved changes warning (TC-11)
 * - Error handling for auto-save failures (TC-09)
 */
export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  // State
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isInvoiceNumberValid, setIsInvoiceNumberValid] = useState(true);

  // State for subtotal from line items (SQ-22)
  const [subtotal, setSubtotal] = useState(0);

  // Track if invoice data has been loaded into form (prevents auto-save loop)
  const hasLoadedInvoiceRef = useRef(false);

  // Fetch invoice data (TC-04)
  const {
    data: invoice,
    isLoading: isLoadingInvoice,
    isError: isInvoiceError,
  } = useInvoice(invoiceId);

  // Fetch clients
  const { data: clientsData, isLoading: isLoadingClients } = useClients({
    limit: 100,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Fetch business profile for preview (SQ-26)
  const { data: businessProfile, isLoading: isLoadingBusinessProfile } = useBusinessProfile();

  // Mutations
  const { mutate: updateInvoice, isPending: isUpdating } = useUpdateInvoice();
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();

  // Form setup
  const form = useForm<UpdateInvoiceData>({
    resolver: zodResolver(updateInvoiceSchema),
    defaultValues: {
      clientId: '',
      invoiceNumber: '',
      dueDate: '',
      notes: '',
      terms: '',
      taxRate: 0,
      discountType: null,
      discountValue: 0,
      // SQ-22: Start with one empty line item
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  // Watch form values for auto-save
  const watchedValues = form.watch();

  // Auto-save hook (TC-02, TC-09, TC-10, TC-11)
  const {
    isDirty,
    isSaving,
    isError: isSaveError,
    lastSaved,
    markClean,
    resetError,
  } = useAutoSave(invoice?.status === 'draft' ? invoiceId : null, watchedValues, {
    onSaveSuccess: () => {
      // Toast removed to avoid spam during auto-save
    },
    onSaveError: error => {
      toast.error(`Error al guardar: ${error.message}`);
    },
  });

  // Load invoice data into form when available (TC-04)
  // Only runs on initial load to prevent auto-save loop:
  // auto-save PUT → invalidates query → invoice ref changes → form.reset → auto-save detects "change" → loop
  useEffect(() => {
    if (invoice && !hasLoadedInvoiceRef.current) {
      hasLoadedInvoiceRef.current = true;

      // Find the client object
      const client = clientsData?.clients?.find(c => c.id === invoice.client?.id);
      if (client) {
        setSelectedClient(client);
      } else if (invoice.client) {
        // Create a partial client from invoice data
        setSelectedClient(invoice.client as Client);
      }

      // Transform items from snake_case (DB) to camelCase (form) - SQ-22
      const formItems =
        invoice.items && invoice.items.length > 0
          ? invoice.items.map(item => ({
              id: item.id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unit_price,
            }))
          : [{ description: '', quantity: 1, unitPrice: 0 }];

      // Set initial subtotal from invoice
      setSubtotal(invoice.subtotal ?? 0);

      // Reset form with invoice data
      form.reset({
        clientId: invoice.client?.id || '',
        invoiceNumber: invoice.invoice_number || '',
        dueDate: invoice.due_date || '',
        notes: invoice.notes || '',
        terms: invoice.terms || '',
        taxRate: invoice.tax_rate ?? 0,
        discountType: invoice.discount_type as DiscountType | null,
        discountValue: invoice.discount_value ?? 0,
        items: formItems,
      });

      // Mark as clean after loading
      markClean();
    }
  }, [invoice, clientsData?.clients, form, markClean]);

  // Unsaved changes warning (TC-11)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

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

  // Manual save (TC-01)
  const handleManualSave = useCallback(() => {
    if (!invoiceId) return;

    const values = form.getValues();
    updateInvoice(
      { id: invoiceId, updates: values },
      {
        onSuccess: () => {
          markClean();
          toast.success('Borrador guardado');
        },
        onError: error => {
          toast.error(error.message);
        },
      }
    );
  }, [invoiceId, form, updateInvoice, markClean]);

  // Delete draft (TC-05)
  const handleDelete = useCallback(() => {
    if (!invoiceId) return;

    deleteInvoice(invoiceId, {
      onSuccess: () => {
        toast.success('Borrador eliminado');
        router.push('/invoices');
      },
      onError: error => {
        toast.error(error.message);
        setIsDeleteDialogOpen(false);
      },
    });
  }, [invoiceId, deleteInvoice, router]);

  // Watch values for reactive summary
  const taxRate = form.watch('taxRate') ?? 0;
  const discountType = form.watch('discountType');
  const discountValue = form.watch('discountValue') ?? 0;

  // Calculate discount amount for summary (SQ-22: subtotal comes from line items)
  const { amount: discountAmount } = calculateDiscountAmount(subtotal, discountType, discountValue);

  // SQ-97: Validate percentage discount cannot exceed 100%
  const isDiscountInvalid = discountType === 'percentage' && discountValue > 100;

  const clients = clientsData?.clients ?? [];

  // Loading state
  if (isLoadingInvoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isInvoiceError || !invoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
            <h3 className="text-lg font-medium">Factura no encontrada</h3>
            <p className="text-muted-foreground max-w-md mb-4">
              La factura que buscas no existe o no tienes acceso a ella.
            </p>
            <Button asChild>
              <Link href="/invoices">Volver a facturas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not a draft - redirect to view
  if (invoice.status !== 'draft') {
    router.replace(`/invoices/${invoiceId}`);
    return null;
  }

  return (
    <div className="space-y-6" data-testid="edit-invoice-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{invoice.invoice_number}</h1>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-muted-foreground">Editando borrador de factura</p>
          </div>
        </div>

        {/* Auto-save indicator (TC-02, TC-09) */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Guardando...</span>
            </>
          )}
          {!isSaving && isSaveError && (
            <>
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Error al guardar</span>
              <Button variant="ghost" size="sm" onClick={resetError}>
                Reintentar
              </Button>
            </>
          )}
          {!isSaving && !isSaveError && lastSaved && (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span>Guardado a las {lastSaved.toLocaleTimeString()}</span>
            </>
          )}
          {!isSaving && !isSaveError && isDirty && (
            <>
              <Clock className="h-4 w-4" />
              <span>Cambios sin guardar</span>
            </>
          )}
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Factura</CardTitle>
          <CardDescription>
            Edita los detalles de esta factura. Los cambios se guardan automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" data-testid="edit-invoice-form">
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
                        disabled={isUpdating || isDeleting}
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
                        disabled={isUpdating || isDeleting}
                        currentInvoiceId={invoiceId}
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
                        disabled={isUpdating || isDeleting}
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
                disabled={isUpdating || isDeleting || isSaving}
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
                        disabled={isUpdating || isDeleting}
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
                    disabled={isUpdating || isDeleting}
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
                        value={field.value ?? ''}
                        disabled={isUpdating || isDeleting}
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
                        value={field.value ?? ''}
                        disabled={isUpdating || isDeleting}
                        data-testid="invoice-terms-input"
                      />
                    </FormControl>
                    <FormDescription>Términos legales o condiciones de pago.</FormDescription>
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
              <div className="flex justify-between gap-4">
                {/* Delete button (TC-05) */}
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isUpdating || isDeleting || isSaving}
                  data-testid="delete-draft-button"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar borrador
                </Button>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/invoices')}
                    disabled={isUpdating || isDeleting}
                  >
                    Volver
                  </Button>
                  {/* Preview button (SQ-26, SQ-121 fix) */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPreviewOpen(true)}
                    disabled={
                      isUpdating ||
                      isDeleting ||
                      isSaving ||
                      isLoadingBusinessProfile ||
                      !canShowPreview(form.getValues(), !!selectedClient)
                    }
                    title={
                      isLoadingBusinessProfile
                        ? 'Cargando perfil de negocio...'
                        : (getPreviewDisabledReason(form.getValues(), !!selectedClient) ?? undefined)
                    }
                    data-testid="preview-button"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Vista previa
                  </Button>
                  {/* Manual save button (TC-01) */}
                  <Button
                    type="button"
                    onClick={handleManualSave}
                    disabled={isUpdating || isDeleting || isSaving || !isInvoiceNumberValid || isDiscountInvalid}
                    data-testid="save-draft-button"
                  >
                    {isUpdating || isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar borrador
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog (TC-05) */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar borrador</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este borrador? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              data-testid="confirm-delete-button"
            >
              {isDeleting ? (
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

      {/* Create Client Dialog */}
      <CreateClientDialog
        open={isCreateClientOpen}
        onOpenChange={setIsCreateClientOpen}
        onSuccess={handleClientCreated}
      />

      {/* Invoice Preview Dialog (SQ-26, SQ-121 fix: render when selectedClient exists, handle null businessProfile) */}
      {selectedClient && !isLoadingBusinessProfile && (
        <InvoicePreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          previewData={buildPreviewData(form.getValues(), selectedClient, businessProfile ?? null, invoiceId)}
          invoiceId={invoiceId}
          onSendSuccess={() => router.push('/invoices')}
        />
      )}
    </div>
  );
}
