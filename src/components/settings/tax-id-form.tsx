'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUpdateBusinessProfile } from '@/hooks/business-profile';
import type { BusinessProfile, BusinessAddress } from '@/lib/types';
import { LATAM_COUNTRIES } from '@/lib/types';
import { getTaxIdConfig, validateTaxId, getTaxIdErrorMessage } from '@/lib/validations/tax-id';

interface TaxIdFormProps {
  businessProfile: BusinessProfile | null;
  onSuccess?: () => void;
}

export function TaxIdForm({ businessProfile, onSuccess }: TaxIdFormProps) {
  const { mutate, isPending } = useUpdateBusinessProfile();

  const existingAddress = businessProfile?.address as BusinessAddress | null;
  const countryCode = existingAddress?.country;

  const taxIdConfig = useMemo(() => getTaxIdConfig(countryCode), [countryCode]);

  const countryName = useMemo(() => {
    if (!countryCode) return null;
    return LATAM_COUNTRIES.find((c) => c.code === countryCode)?.name ?? countryCode;
  }, [countryCode]);

  const taxIdSchema = useMemo(
    () =>
      z.object({
        taxId: z
          .string()
          .transform((val) => {
            // Auto-uppercase for RFC (Mexico)
            if (countryCode === 'MX') return val.toUpperCase();
            return val;
          })
          .refine(
            (val) => validateTaxId(val, countryCode),
            getTaxIdErrorMessage(countryCode) ?? 'Formato inválido.'
          ),
      }),
    [countryCode]
  );

  type TaxIdFormData = z.infer<typeof taxIdSchema>;

  const form = useForm<TaxIdFormData>({
    resolver: zodResolver(taxIdSchema),
    defaultValues: {
      taxId: businessProfile?.tax_id ?? '',
    },
  });

  // Sync form when profile data loads or country changes
  useEffect(() => {
    if (businessProfile) {
      form.reset({
        taxId: businessProfile.tax_id ?? '',
      });
    }
  }, [businessProfile, form]);

  function onSubmit(data: TaxIdFormData) {
    const trimmedValue = data.taxId.trim();

    mutate(
      {
        tax_id: trimmedValue || null,
        tax_id_type: trimmedValue ? taxIdConfig.type : null,
      },
      {
        onSuccess: () => {
          toast.success('Datos fiscales actualizados');
          onSuccess?.();
        },
        onError: () => {
          toast.error('Error al guardar. Intenta de nuevo.');
        },
      }
    );
  }

  return (
    <Card data-testid="taxIdForm">
      <CardHeader>
        <CardTitle>Datos fiscales</CardTitle>
        <CardDescription>
          Tu identificación fiscal aparecerá en tus facturas. Este campo es opcional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Country badge or no-country alert */}
            {countryCode ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">País detectado:</span>
                <Badge variant="secondary" data-testid="tax-id-type-badge">
                  {countryCode} {countryName}
                </Badge>
              </div>
            ) : (
              <Alert data-testid="no-country-alert">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Configura tu país en la pestaña &quot;Contacto&quot; para obtener validación
                  específica.
                </AlertDescription>
              </Alert>
            )}

            {/* Tax ID input */}
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{taxIdConfig.label} (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={taxIdConfig.placeholder}
                      data-testid="tax-id-input"
                    />
                  </FormControl>
                  <FormDescription>{taxIdConfig.description}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending} data-testid="save-tax-id-button">
                {isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
