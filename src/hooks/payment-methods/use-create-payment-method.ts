'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { PaymentMethod, PaymentMethodType } from '@/lib/types';

interface CreatePaymentMethodInput {
  type: PaymentMethodType;
  label: string;
  value: string;
  is_default?: boolean;
  is_active?: boolean;
}

const MAX_PAYMENT_METHODS = 10;

async function createPaymentMethod(input: CreatePaymentMethodInput): Promise<PaymentMethod> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No autorizado');
  }

  // Check max limit
  const { count, error: countError } = await supabase
    .from('payment_methods')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (countError) {
    throw new Error('Error al verificar métodos existentes');
  }

  if (count !== null && count >= MAX_PAYMENT_METHODS) {
    throw new Error('Máximo 10 métodos de pago permitidos');
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: user.id,
      type: input.type,
      label: input.label,
      value: input.value,
      is_default: input.is_default ?? false,
      is_active: input.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Error al crear método de pago');
  }

  return data;
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}
