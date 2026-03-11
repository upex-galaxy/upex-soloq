import { z } from 'zod';

/**
 * Zod schema for business name form validation
 * Used in Settings page BusinessNameForm component
 */
export const businessNameSchema = z.object({
  businessName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .refine((val) => val.trim().length >= 2, 'El nombre no puede ser solo espacios en blanco'),
});

/** Type inferred from the business name schema */
export type BusinessNameFormData = z.infer<typeof businessNameSchema>;
