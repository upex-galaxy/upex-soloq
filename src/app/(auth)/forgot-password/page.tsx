// src/app/(auth)/forgot-password/page.tsx
import { ForgotPasswordForm } from './_components/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Recuperar Contraseña</h1>
        <p className="text-center text-muted-foreground mb-8">
          Ingresa tu correo electrónico y te enviaremos un enlace para resetear tu contraseña.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
