import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  CreditCard,
  Plus,
} from 'lucide-react';

import { createServer } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Database } from '@/types/supabase';

type InvoiceStatus = Database['public']['Enums']['invoice_status'];
type DiscountType = Database['public']['Enums']['discount_type'];

type ClientRow = Database['public']['Tables']['clients']['Row'];
type BusinessProfileRow = Database['public']['Tables']['business_profiles']['Row'];
type InvoiceItemRow = Database['public']['Tables']['invoice_items']['Row'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];
type PaymentMethodRow = Database['public']['Tables']['payment_methods']['Row'];

type InvoiceDetail = Database['public']['Tables']['invoices']['Row'] & {
  client: Pick<ClientRow, 'id' | 'name' | 'email' | 'company' | 'address' | 'tax_id'> | null;
  items: InvoiceItemRow[] | null;
  payments: PaymentRow[] | null;
};

const statusConfig = {
  draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
  sent: { label: 'Enviada', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  paid: { label: 'Pagada', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  overdue: { label: 'Vencida', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
  cancelled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-500 hover:bg-gray-100' },
} as const;

function formatCurrency(amount: number | null, currency: string = 'USD'): string {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(value);
}

function formatDate(date: string | null): string {
  if (!date) return 'Sin fecha';

  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatPercent(rate: number | null): string {
  if (rate === null || rate === undefined) return '0%';
  return `${rate}%`;
}

function formatDiscount(type: DiscountType | null, value: number | null): string {
  if (!value) return 'Sin descuento';
  if (type === 'percentage') return `${value}%`;
  return formatCurrency(value);
}

export default async function InvoiceDetailPage({ params }: { params: { invoiceId: string } }) {
  const supabase = await createServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-8" data-testid="invoiceDetailPage">
        <Card>
          <CardHeader>
            <CardTitle>Necesitas iniciar sesión</CardTitle>
            <CardDescription>Inicia sesión para ver el detalle de la factura.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild data-testid="login_link">
              <Link href="/login">Ir a Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const invoiceSelect = `
    id,
    invoice_number,
    status,
    issue_date,
    due_date,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    notes,
    sent_at,
    paid_at,
    currency,
    discount_value,
    discount_type,
    client:clients(id, name, email, company, address, tax_id),
    items:invoice_items(id, description, quantity, unit_price, subtotal, sort_order),
    payments:payments(id, payment_method, amount_received, payment_date, reference, notes)
  ` as const;

  const [invoiceResult, businessResult, paymentMethodsResult] = await Promise.all([
    supabase
      .from('invoices')
      .select(invoiceSelect)
      .eq('id', params.invoiceId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle(),
    supabase
      .from('business_profiles')
      .select('business_name, contact_email, contact_phone, address, tax_id, logo_url')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('payment_methods')
      .select('id, type, label, value, is_default, sort_order')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('sort_order', { ascending: true }),
  ]);

  const invoice = invoiceResult.data as unknown as InvoiceDetail | null;
  const business = businessResult.data as Pick<
    BusinessProfileRow,
    'business_name' | 'contact_email' | 'contact_phone' | 'address' | 'tax_id' | 'logo_url'
  > | null;
  const paymentMethods = (paymentMethodsResult.data ?? []) as PaymentMethodRow[];

  if (!invoice) {
    return (
      <div className="space-y-8" data-testid="invoiceDetailPage">
        <Card>
          <CardHeader>
            <CardTitle>No encontramos esta factura</CardTitle>
            <CardDescription>Puede que haya sido eliminada o no exista.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild data-testid="back_to_invoices_button">
              <Link href="/invoices">Volver a facturas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadError =
    userError || invoiceResult.error || businessResult.error || paymentMethodsResult.error;

  const items = (invoice.items ?? []).slice().sort((a, b) => {
    const orderA = a.sort_order ?? 0;
    const orderB = b.sort_order ?? 0;
    return orderA - orderB;
  });

  const itemsSubtotal = items.reduce((sum, item) => sum + (item.subtotal ?? 0), 0);
  const subtotal = invoice.subtotal ?? itemsSubtotal;
  const taxAmount = invoice.tax_amount ?? 0;
  const total = invoice.total ?? subtotal + taxAmount;
  const currency = invoice.currency ?? 'USD';

  const statusKey = (invoice.status ?? 'draft') as keyof typeof statusConfig;
  const statusMeta = statusConfig[statusKey];

  return (
    <div className="space-y-8" data-testid="invoiceDetailPage">
      {loadError ? (
        <div
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          data-testid="invoice_detail_error"
        >
          No pudimos cargar todos los datos de esta factura. Intenta recargar la pagina.
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="sm" asChild data-testid="back_to_invoices">
              <Link href="/invoices">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Badge
              variant="secondary"
              className={statusMeta.className}
              data-testid="invoice_status"
            >
              {statusMeta.label}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="invoice_number">
            Factura {invoice.invoice_number}
          </h1>
          <p className="text-muted-foreground">
            Emitida el {formatDate(invoice.issue_date)} • Vence el {formatDate(invoice.due_date)}
          </p>
        </div>
        <Button asChild data-testid="new_invoice_button">
          <Link href="/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3" data-testid="invoice_summary_grid">
        <Card className="lg:col-span-2" data-testid="invoice_items_card">
          <CardHeader>
            <CardTitle>Detalle de items</CardTitle>
            <CardDescription>Servicios y productos incluidos en la factura.</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No hay items registrados para esta factura.</p>
              </div>
            ) : (
              <Table data-testid="invoice_items_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripcion</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unit_price, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.subtotal, currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6" data-testid="invoice_totals_section">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>Totales y estado de pago.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Descuento</span>
                <span>{formatDiscount(invoice.discount_type, invoice.discount_value)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Impuesto</span>
                <span>
                  {formatPercent(invoice.tax_rate)} · {formatCurrency(taxAmount, currency)}
                </span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {invoice.status === 'paid' && invoice.paid_at
                  ? `Pagada el ${formatDate(invoice.paid_at)}`
                  : 'Pago pendiente'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datos del cliente</CardTitle>
              <CardDescription>Informacion principal del cliente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="font-medium">{invoice.client?.name || 'Cliente sin nombre'}</div>
              <div className="text-muted-foreground">
                {invoice.client?.company || 'Sin empresa'}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{invoice.client?.email || 'Sin email'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{invoice.client?.address || 'Sin direccion'}</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                <span>{invoice.client?.tax_id || 'Sin identificacion fiscal'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2" data-testid="invoice_extra_section">
        <Card data-testid="business_profile_card">
          <CardHeader>
            <CardTitle>Datos de tu negocio</CardTitle>
            <CardDescription>Informacion que aparece en la factura.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="font-medium">
              {business?.business_name || 'Nombre de negocio pendiente'}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{business?.contact_email || user.email || 'Sin email'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{business?.contact_phone || 'Sin telefono'}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{business?.address || 'Sin direccion'}</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-muted-foreground" />
              <span>{business?.tax_id || 'Sin identificacion fiscal'}</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="payment_methods_card">
          <CardHeader>
            <CardTitle>Metodos de pago</CardTitle>
            <CardDescription>Opciones que el cliente puede usar para pagar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {paymentMethods.length === 0 ? (
              <p className="text-muted-foreground">No hay metodos de pago configurados.</p>
            ) : (
              <ul className="space-y-3" data-testid="payment_methods_list">
                {paymentMethods.map(method => (
                  <li key={method.id} className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {method.label} {method.is_default ? '(Principal)' : ''}
                      </div>
                      <div className="text-muted-foreground">{method.value}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="invoice_payments_card">
        <CardHeader>
          <CardTitle>Pagos registrados</CardTitle>
          <CardDescription>Historial de pagos asociados a esta factura.</CardDescription>
        </CardHeader>
        <CardContent>
          {(invoice.payments ?? []).length === 0 ? (
            <p className="text-muted-foreground">Aun no hay pagos registrados.</p>
          ) : (
            <Table data-testid="invoice_payments_table">
              <TableHeader>
                <TableRow>
                  <TableHead>Metodo</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Referencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(invoice.payments ?? []).map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.payment_method}</TableCell>
                    <TableCell>{formatCurrency(payment.amount_received, currency)}</TableCell>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.reference || 'Sin referencia'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {invoice.notes ? (
        <Card data-testid="invoice_notes_card">
          <CardHeader>
            <CardTitle>Notas</CardTitle>
            <CardDescription>Notas internas o condiciones adicionales.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
