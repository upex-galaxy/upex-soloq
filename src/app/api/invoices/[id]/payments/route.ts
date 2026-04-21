import { NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';
import { z } from 'zod';

const createPaymentSchema = z.object({
  amount_received: z.number().positive('El monto debe ser mayor a 0'),
  payment_method: z.string().min(1, 'El método de pago es requerido'),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
  notes: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/invoices/[id]/payments - Mark invoice as paid
 *
 * Creates a payment record and updates invoice status to 'paid'.
 * Only invoices with status 'sent' or 'overdue' can be marked as paid.
 *
 * Request body:
 * - amount_received: number (required) - Payment amount
 * - payment_method: string (required) - Payment method
 * - payment_date: string (required) - Payment date YYYY-MM-DD
 * - notes: string (optional) - Payment notes
 * - reference: string (optional) - Payment reference number
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: invoiceId } = await context.params;
    const supabase = await createServerFromRequest(request);

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(invoiceId)) {
      return NextResponse.json({ error: 'ID de factura inválido' }, { status: 400 });
    }

    // Fetch invoice (RLS scopes to user)
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, status, total')
      .eq('id', invoiceId)
      .is('deleted_at', null)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Only sent or overdue invoices can be paid
    if (invoice.status !== 'sent' && invoice.status !== 'overdue') {
      if (invoice.status === 'paid') {
        return NextResponse.json({ error: 'Esta factura ya está pagada' }, { status: 400 });
      }
      return NextResponse.json(
        { error: 'Solo se pueden pagar facturas enviadas o vencidas' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { amount_received, payment_method, payment_date, notes, reference } =
      validationResult.data;

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        amount_received,
        payment_method,
        payment_date,
        notes: notes || null,
        reference: reference || null,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return NextResponse.json(
        { error: 'Error al registrar el pago' },
        { status: 500 }
      );
    }

    // Update invoice status to 'paid' and persist paid_at (SQ-174)
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid' as const,
        paid_at: now,
        updated_at: now,
      })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('Error updating invoice status:', updateError);
      return NextResponse.json(
        { error: 'Pago registrado pero error al actualizar estado de factura' },
        { status: 500 }
      );
    }

    // Emit 'paid' invoice event for audit/timeline history (SQ-174)
    // Mirrors the pattern used by the send route for the 'sent' event.
    const { error: eventError } = await supabase.from('invoice_events').insert({
      invoice_id: invoiceId,
      event_type: 'paid',
      metadata: {
        paid_at: now,
        paid_by: user.id,
        payment_id: payment.id,
        amount_received,
        payment_method,
        payment_date,
        reference: reference || null,
      },
    });

    if (eventError) {
      // Log but don't fail - event tracking is secondary to the payment itself
      console.error('Error creating invoice event (paid):', eventError);
    }

    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/invoices/[id]/payments:', error);
    return NextResponse.json(
      { error: 'Error al registrar el pago' },
      { status: 500 }
    );
  }
}
