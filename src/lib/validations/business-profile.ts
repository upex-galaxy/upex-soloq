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

/**
 * Zod schema for contact info form validation (SQ-10)
 * Validates email (required), phone (optional, E.164), and address (optional, structured)
 */
export const contactInfoSchema = z.object({
  contactEmail: z.string().email('Ingresa un email válido'),
  contactPhone: z
    .string()
    .refine(
      (val) => !val || /^\+[1-9]\d{6,14}$/.test(val.replace(/\s/g, '')),
      'Formato internacional: +52 55 1234 5678'
    )
    .optional()
    .or(z.literal('')),
  address: z
    .object({
      street: z.string().optional().or(z.literal('')),
      city: z.string().optional().or(z.literal('')),
      state: z.string().optional().or(z.literal('')),
      postal_code: z.string().optional().or(z.literal('')),
      country: z.string().optional().or(z.literal('')),
    })
    .optional(),
});

/** Type inferred from the contact info schema */
export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;
