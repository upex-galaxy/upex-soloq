// src/hooks/clients/use-create-client.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientFormData } from '@/lib/validations/client';
import { Client } from '@/lib/types'; // Assuming Client type exists in lib/types.ts

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Error al crear cliente');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
