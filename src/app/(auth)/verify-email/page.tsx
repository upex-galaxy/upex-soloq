// src/app/(auth)/verify-email/page.tsx
export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Verifica tu correo electrónico</h1>
      <p className="text-muted-foreground mb-8">
        Te hemos enviado un correo electrónico con un enlace para verificar tu cuenta. Por favor,
        revisa tu bandeja de entrada y spam para completar el registro.
      </p>
      {/* Optionally add a resend email button or instructions */}
    </div>
  );
}
