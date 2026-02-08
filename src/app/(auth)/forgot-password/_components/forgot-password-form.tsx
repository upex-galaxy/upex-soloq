// src/app/(auth)/forgot-password/_components/forgot-password-form.tsx
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from '@/lib/auth/auth-helpers'; // This will be created next
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  email: z.string().email('Por favor, ingresa un correo electrónico válido.'),
});

export type ForgotPasswordFormSchema = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordFormSchema) {
    setIsLoading(true);
    try {
      await requestPasswordReset(values);
      setIsSubmitted(true); // Show success message regardless of outcome for security
    } catch (error: any) {
      // For security, we don't show specific errors. The success message is always shown.
      // We can log the error for debugging purposes.
      console.error('Password reset request failed:', error);
      setIsSubmitted(true); // Still show the success state
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Revisa tu correo</h2>
        <p className="text-muted-foreground mt-2">
          Si una cuenta con ese correo electrónico existe, te hemos enviado un enlace para recuperar
          tu contraseña.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" type="email" placeholder="tu@ejemplo.com" {...form.register('email')} />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
      </Button>
    </form>
  );
}
