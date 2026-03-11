import type { TaxIdType } from '@/lib/types';
import { LATAM_COUNTRIES } from '@/lib/types';

interface TaxIdConfig {
  label: string;
  type: TaxIdType;
  placeholder: string;
  description: string;
  regex?: RegExp;
  errorMessage?: string;
}

const TAX_ID_CONFIGS: Record<string, TaxIdConfig> = {
  MX: {
    label: 'RFC',
    type: 'RFC',
    placeholder: 'XAXX010101000',
    description: '13 caracteres para persona física, 12 para persona moral.',
    regex: /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i,
    errorMessage: 'El RFC debe tener 12 o 13 caracteres alfanuméricos.',
  },
  CO: {
    label: 'NIT',
    type: 'NIT',
    placeholder: '900123456-7',
    description: '9 dígitos seguidos del dígito de verificación.',
    regex: /^\d{9}-?\d$/,
    errorMessage: 'El NIT debe tener 9 dígitos más el dígito de verificación.',
  },
  AR: {
    label: 'CUIT',
    type: 'CUIT',
    placeholder: '20-12345678-9',
    description: 'Formato: XX-XXXXXXXX-X (11 dígitos).',
    regex: /^\d{2}-?\d{8}-?\d$/,
    errorMessage: 'El CUIT debe tener 11 dígitos (formato XX-XXXXXXXX-X).',
  },
};

/**
 * Returns tax ID configuration based on country code.
 * For MX/CO/AR returns specific validation; for other LATAM countries
 * returns the known label; for unknown countries returns generic "Tax ID".
 */
export function getTaxIdConfig(countryCode?: string): TaxIdConfig {
  if (!countryCode) {
    return {
      label: 'Tax ID',
      type: 'Tax ID',
      placeholder: 'Ingresa tu identificación fiscal',
      description: 'Ingresa tu identificación fiscal.',
    };
  }

  // Check specific configs first (MX, CO, AR)
  const specific = TAX_ID_CONFIGS[countryCode];
  if (specific) return specific;

  // Check LATAM_COUNTRIES for known label
  const country = LATAM_COUNTRIES.find((c) => c.code === countryCode);
  if (country) {
    return {
      label: country.taxIdLabel,
      type: country.taxIdLabel as TaxIdType,
      placeholder: 'Ingresa tu identificación fiscal',
      description: 'Ingresa tu identificación fiscal.',
    };
  }

  // Fallback for unknown countries
  return {
    label: 'Tax ID',
    type: 'Tax ID',
    placeholder: 'Ingresa tu identificación fiscal',
    description: 'Ingresa tu identificación fiscal.',
  };
}

/**
 * Validates a tax ID value against country-specific format.
 * Returns true if valid or if no specific validation exists.
 * Empty values are always valid (field is optional).
 */
export function validateTaxId(value: string, countryCode?: string): boolean {
  if (!value) return true; // Optional field

  const config = TAX_ID_CONFIGS[countryCode ?? ''];
  if (!config?.regex) return true; // No specific validation for this country

  return config.regex.test(value);
}

/**
 * Returns the validation error message for a country, or undefined if no specific validation.
 */
export function getTaxIdErrorMessage(countryCode?: string): string | undefined {
  return TAX_ID_CONFIGS[countryCode ?? '']?.errorMessage;
}
