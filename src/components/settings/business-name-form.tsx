'use client';

import { useEffect } from 'react';
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
import { useUpdateBusinessProfile } from '@/hooks/business-profile';
import { businessNameSchema, type BusinessNameFormData } from '@/lib/validations/business-profile';
import type { BusinessProfile } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BusinessNameFormProps {
  businessProfile: BusinessProfile | null;
  onSuccess?: () => void;
}

export function BusinessNameForm({ businessProfile, onSuccess }: BusinessNameFormProps) {
  const { mutate, isPending } = useUpdateBusinessProfile();

  const form = useForm<BusinessNameFormData>({
    resolver: zodResolver(businessNameSchema),
    defaultValues: {
      businessName: businessProfile?.business_name ?? '',
    },
  });

  useEffect(() => {
    if (businessProfile?.business_name) {
      form.reset({ businessName: businessProfile.business_name });
    }
  }, [businessProfile?.business_name, form]);

  const watchedName = form.watch('businessName');
  const charCount = watchedName?.length ?? 0;

  function onSubmit(data: BusinessNameFormData) {
    mutate(
      { business_name: data.businessName.trim() },
      {
        onSuccess: () => {
          toast.success('Nombre de negocio actualizado');
          onSuccess?.();
        },
        onError: () => {
          toast.error('Error al guardar. Intenta de nuevo.');
        },
      }
    );
  }

  return (
    <Card data-testid="businessNameForm">
      <CardHeader>
        <CardTitle>Nombre del negocio</CardTitle>
        <CardDescription>Este nombre aparecerá en el encabezado de tus facturas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del negocio</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        className="pr-16"
                        maxLength={100}
                        placeholder="Ej: Diseño Creativo García"
                        data-testid="business-name-input"
                      />
                      <span
                        data-testid="char-counter"
                        className={cn(
                          'absolute right-3 top-1/2 -translate-y-1/2 text-xs',
                          charCount >= 100
                            ? 'text-destructive'
                            : charCount >= 90
                              ? 'text-amber-500'
                              : 'text-muted-foreground'
                        )}
                      >
                        {charCount}/100
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>Máximo 100 caracteres.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending} data-testid="save-business-name-button">
                {isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
