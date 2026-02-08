// src/app/(auth)/register/page.tsx
import { RegisterForm } from './_components/register-form';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Crear una cuenta</h1>
        <p className="text-center text-muted-foreground mb-8">
          Bienvenido a SoloQ. Ingresa tus datos para comenzar a facturar.
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
