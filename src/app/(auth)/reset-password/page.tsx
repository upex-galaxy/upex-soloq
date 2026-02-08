// src/app/(auth)/reset-password/page.tsx
import { ResetPasswordForm } from './_components/reset-password-form';

export default function ResetPasswordPage({ searchParams }: { searchParams: { code: string } }) {
  const code = searchParams.code;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Restablecer Contraseña</h1>
        <p className="text-center text-muted-foreground mb-8">Ingresa tu nueva contraseña.</p>
        {code ? (
          <ResetPasswordForm code={code} />
        ) : (
          <div className="text-center text-red-500">
            Token de restablecimiento inválido o no proporcionado.
          </div>
        )}
      </div>
    </div>
  );
}
