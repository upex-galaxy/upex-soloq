// src/app/api/profile/payment-methods/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

const paymentMethodSchema = z.object({
  type: z.enum(['bank_transfer', 'paypal', 'mercado_pago', 'cash', 'other']),
  label: z.string().min(1, 'La etiqueta es requerida.').max(50),
  value: z.string().min(1, 'El valor es requerido.').max(200),
  isDefault: z.boolean().default(false).optional(), // Optional, will be handled by logic
  sortOrder: z.number().int().optional(),
});

const paymentMethodsSchema = z.object({
  paymentMethods: z.array(paymentMethodSchema),
});

export async function PUT(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: { message: 'No autenticado.' } },
      { status: 401 }
    );
  }

  const formData = await request.json();

  try {
    const { paymentMethods } = paymentMethodsSchema.parse(formData);

    // Start a transaction for atomicity (Supabase doesn't have native transactions in client-side JS)
    // A simple approach is to delete all existing and then insert new ones.
    // This is safe if 'paymentMethods' is for the current user.

    // 1. Delete existing payment methods for this user
    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting old payment methods:', deleteError);
      return NextResponse.json(
        { success: false, error: { message: 'Error al actualizar métodos de pago.' } },
        { status: 500 }
      );
    }

    // 2. Insert new payment methods
    const paymentMethodsToInsert = paymentMethods.map((method, index) => ({
      user_id: user.id,
      type: method.type,
      label: method.label,
      value: method.value,
      is_default: method.isDefault || false,
      sort_order: index, // Use index for sort order
    }));

    const { data: newPaymentMethods, error: insertError } = await supabase
      .from('payment_methods')
      .insert(paymentMethodsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting new payment methods:', insertError);
      return NextResponse.json(
        { success: false, error: { message: 'Error al guardar nuevos métodos de pago.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, paymentMethods: newPaymentMethods }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: error.errors[0].message } },
        { status: 400 }
      );
    }
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Error interno del servidor.' } },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: { message: 'No autenticado.' } },
      { status: 401 }
    );
  }

  try {
    const { data: paymentMethods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching payment methods:', error);
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, paymentMethods }, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Error interno del servidor.' } },
      { status: 500 }
    );
  }
}
