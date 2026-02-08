// src/app/(auth)/reset-password/_components/reset-password-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '@/lib/auth/auth-helpers'; // This will be created next
import { useToast } from '@/components/ui/use-toast';

const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        'La nueva contraseña debe incluir al menos una mayúscula, una minúscula y un número.'
      ),
    confirmNewPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmNewPassword'],
  });

export type ResetPasswordFormSchema = z.infer<typeof formSchema>;

interface ResetPasswordFormProps {
  code: string;
}

export function ResetPasswordForm({ code }: ResetPasswordFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetPasswordFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  async function onSubmit(values: ResetPasswordFormSchema) {
    setIsLoading(true);
    try {
      await resetPassword({
        token: code,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido restablecida exitosamente.',
      });
      router.push('/auth/login?reset=success'); // Redirect to login with success message
    } catch (error: any) {
      toast({
        title: 'Error al restablecer contraseña',
        description:
          error.message ||
          'Ocurrió un error inesperado. El token podría ser inválido o haber expirado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="newPassword">Nueva Contraseña</Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="********"
          {...form.register('newPassword')}
        />
        {form.formState.errors.newPassword && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.newPassword.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="confirmNewPassword">Confirmar Nueva Contraseña</Label>
        <Input
          id="confirmNewPassword"
          type="password"
          placeholder="********"
          {...form.register('confirmNewPassword')}
        />
        {form.formState.errors.confirmNewPassword && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.confirmNewPassword.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
      </Button>
    </form>
  );
}
