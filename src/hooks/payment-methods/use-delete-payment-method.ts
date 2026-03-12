'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

async function deletePaymentMethod(id: string): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No autorizado');
  }

  // Check it's not the last active method
  const { data: activeMethods, error: countError } = await supabase
    .from('payment_methods')
    .select('id, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (countError) {
    throw new Error('Error al verificar métodos activos');
  }

  const activeCount = activeMethods?.length ?? 0;
  const isTargetActive = activeMethods?.some((m) => m.id === id);

  if (activeCount <= 1 && isTargetActive) {
    throw new Error('No puedes eliminar el último método de pago activo');
  }

  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message || 'Error al eliminar método de pago');
  }
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}
