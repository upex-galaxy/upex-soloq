'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUpdateBusinessProfile } from '@/hooks/business-profile';
import {
  contactInfoSchema,
  type ContactInfoFormData,
} from '@/lib/validations/business-profile';
import type { BusinessProfile, BusinessAddress } from '@/lib/types';
import { LATAM_COUNTRIES } from '@/lib/types';

interface ContactInfoFormProps {
  businessProfile: BusinessProfile | null;
  userEmail?: string;
  onSuccess?: () => void;
}

export function ContactInfoForm({ businessProfile, userEmail, onSuccess }: ContactInfoFormProps) {
  const { mutate, isPending } = useUpdateBusinessProfile();

  const existingAddress = businessProfile?.address as BusinessAddress | null;

  const form = useForm<ContactInfoFormData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      contactEmail: businessProfile?.contact_email ?? userEmail ?? '',
      contactPhone: businessProfile?.contact_phone ?? '',
      address: {
        street: existingAddress?.street ?? '',
        city: existingAddress?.city ?? '',
        state: existingAddress?.state ?? '',
        postal_code: existingAddress?.postal_code ?? '',
        country: existingAddress?.country ?? '',
      },
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (businessProfile) {
      const addr = businessProfile.address as BusinessAddress | null;
      form.reset({
        contactEmail: businessProfile.contact_email ?? userEmail ?? '',
        contactPhone: businessProfile.contact_phone ?? '',
        address: {
          street: addr?.street ?? '',
          city: addr?.city ?? '',
          state: addr?.state ?? '',
          postal_code: addr?.postal_code ?? '',
          country: addr?.country ?? '',
        },
      });
    }
  }, [businessProfile, userEmail, form]);

  const selectedCountry = form.watch('address.country');

  const phonePlaceholder = useMemo(() => {
    const country = LATAM_COUNTRIES.find((c) => c.code === selectedCountry);
    return country ? `${country.phonePre} 55 1234 5678` : '+52 55 1234 5678';
  }, [selectedCountry]);

  function onSubmit(data: ContactInfoFormData) {
    // Build address JSONB - only include non-empty fields
    const address: BusinessAddress = {};
    if (data.address?.street) address.street = data.address.street.trim();
    if (data.address?.city) address.city = data.address.city.trim();
    if (data.address?.state) address.state = data.address.state.trim();
    if (data.address?.postal_code) address.postal_code = data.address.postal_code.trim();
    if (data.address?.country) address.country = data.address.country;

    mutate(
      {
        contact_email: data.contactEmail.trim(),
        contact_phone: data.contactPhone?.replace(/\s/g, '') || null,
        address: Object.keys(address).length > 0 ? (address as unknown as import('@/types/supabase').Json) : null,
      },
      {
        onSuccess: () => {
          toast.success('Información de contacto actualizada');
          onSuccess?.();
        },
        onError: () => {
          toast.error('Error al guardar. Intenta de nuevo.');
        },
      }
    );
  }

  return (
    <Card data-testid="contactInfoForm">
      <CardHeader>
        <CardTitle>Información de contacto</CardTitle>
        <CardDescription>
          Datos con los que tus clientes pueden contactarte. Aparecerán en tus facturas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Email */}
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de contacto</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="tu@negocio.com"
                      data-testid="contact-email-input"
                    />
                  </FormControl>
                  <FormDescription>Puede ser diferente a tu email de cuenta.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder={phonePlaceholder}
                      data-testid="contact-phone-input"
                    />
                  </FormControl>
                  <FormDescription>Formato internacional con código de país.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Address Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Dirección (opcional)</h4>

              {/* Country */}
              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      data-testid="country-select"
                    >
                      <FormControl>
                        <SelectTrigger className="w-full" data-testid="country-select">
                          <SelectValue placeholder="Selecciona tu país" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LATAM_COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Street */}
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calle y número</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Av. Reforma 123, Col. Centro"
                        data-testid="street-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City + State in grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="CDMX" data-testid="city-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado / Provincia</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="CDMX" data-testid="state-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Postal Code */}
              <FormField
                control={form.control}
                name="address.postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código postal</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="06600"
                        className="max-w-[200px]"
                        data-testid="postal-code-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending} data-testid="save-contact-info-button">
                {isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
