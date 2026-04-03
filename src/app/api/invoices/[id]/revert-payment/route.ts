import { NextResponse } from 'next/server';
import { createServerFromRequest } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/invoices/[id]/revert-payment - Revert a paid invoice back to sent/overdue
 *
 * Soft deletes the payment record and reverts invoice status.
 * If due_date < today, status becomes 'overdue'; otherwise 'sent'.
 * Only paid invoices can be reverted.
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
      .select('id, status, due_date')
      .eq('id', invoiceId)
      .is('deleted_at', null)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });
    }

    // Only paid invoices can be reverted
    if (invoice.status !== 'paid') {
      return NextResponse.json(
        { error: 'Solo se pueden revertir facturas pagadas' },
        { status: 400 }
      );
    }

    // Soft delete payment records for this invoice
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('invoice_id', invoiceId)
      .is('deleted_at', null);

    if (paymentError) {
      console.error('Error soft-deleting payments:', paymentError);
      return NextResponse.json(
        { error: 'Error al revertir el pago' },
        { status: 500 }
      );
    }

    // Determine new status: sent or overdue based on due_date
    let newStatus: 'sent' | 'overdue' = 'sent';
    if (invoice.due_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(invoice.due_date);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        newStatus = 'overdue';
      }
    }

    // Update invoice status
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('Error reverting invoice status:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar el estado de la factura' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { invoiceId, newStatus },
      message: 'Pago revertido exitosamente',
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/invoices/[id]/revert-payment:', error);
    return NextResponse.json(
      { error: 'Error al revertir el pago' },
      { status: 500 }
    );
  }
}
