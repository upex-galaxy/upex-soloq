import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthCodeErrorPage() {
  return (
    <div
      className="mx-auto flex min-h-screen max-w-lg items-center px-4"
      data-testid="authCodeErrorPage"
    >
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">No pudimos completar la autenticacion</CardTitle>
          <CardDescription>
            El enlace pudo haber expirado o ya fue utilizado. Intenta iniciar sesion de nuevo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild data-testid="auth_code_error_login_button">
            <Link href="/login">Ir a iniciar sesion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
