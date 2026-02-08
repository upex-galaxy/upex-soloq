// src/app/(auth)/register/_components/register-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerUser } from '@/lib/auth/auth-helpers';
import { useToast } from '@/components/ui/use-toast'; // Assuming useToast is available

const formSchema = z
  .object({
    email: z.string().email('Por favor, ingresa un correo electrónico válido.'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        'La contraseña debe incluir al menos una mayúscula, una minúscula y un número.'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export type RegisterFormSchema = z.infer<typeof formSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast(); // Assuming useToast is imported and works
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: RegisterFormSchema) {
    setIsLoading(true);
    try {
      await registerUser(values);
      toast({
        title: 'Registro exitoso',
        description: 'Por favor, revisa tu correo para verificar tu cuenta.',
      });
      router.push('/auth/verify-email'); // Redirect to a verification message page
    } catch (error: any) {
      toast({
        title: 'Error de registro',
        description: error.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="********"
          {...form.register('confirmPassword')}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Registrando...' : 'Registrarme'}
      </Button>
    </form>
  );
}
