'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { PaymentMethod, PaymentMethodUpdate } from '@/lib/types';

interface UpdatePaymentMethodInput {
  id: string;
  data: PaymentMethodUpdate;
}

async function updatePaymentMethod({ id, data }: UpdatePaymentMethodInput): Promise<PaymentMethod> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No autorizado');
  }

  // If deactivating, check it's not the last active method
  if (data.is_active === false) {
    const { data: activeMethods, error: countError } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (countError) {
      throw new Error('Error al verificar métodos activos');
    }

    const activeCount = activeMethods?.length ?? 0;
    const isCurrentMethodActive = activeMethods?.some((m) => m.id === id);

    if (activeCount <= 1 && isCurrentMethodActive) {
      throw new Error('Debes tener al menos un método de pago activo');
    }
  }

  const { data: updated, error } = await supabase
    .from('payment_methods')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Error al actualizar método de pago');
  }

  return updated;
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}
