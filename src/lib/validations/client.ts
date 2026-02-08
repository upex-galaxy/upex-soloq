// src/lib/validations/client.ts
import { z } from 'zod';

export const clientFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede exceder 100 caracteres.'),
  email: z
    .string()
    .email('Ingresa un email válido.')
    .max(255, 'El email no puede exceder 255 caracteres.'),
  company: z
    .string()
    .max(100, 'La empresa no puede exceder 100 caracteres.')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres.')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'La dirección no puede exceder 500 caracteres.')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres.')
    .optional()
    .or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
