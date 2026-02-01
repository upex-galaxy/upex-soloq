'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText, Loader2, MailCheck } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        setError('No pudimos enviar el email. Verifica tu direccion e intenta de nuevo.');
        return;
      }

      setIsSuccess(true);
    } catch {
      setError('Ocurrio un error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-testid="forgotPasswordPage">
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Recupera tu acceso</CardTitle>
          <CardDescription>
            Te enviaremos un enlace para restablecer tu contrasena de SoloQ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <Alert
              className="bg-primary/5 border-primary/20"
              data-testid="forgot_password_success_alert"
            >
              <AlertDescription className="flex items-start gap-3 text-sm">
                <MailCheck className="mt-0.5 h-4 w-4 text-primary" />
                <span>
                  Enviamos un enlace de recuperacion a <strong>{email}</strong>. Revisa tu bandeja
                  de entrada (y spam).
                </span>
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="forgot_password_form">
              {error && (
                <Alert variant="destructive" data-testid="forgot_password_error_alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  data-testid="forgot_password_email_input"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="forgot_password_submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando enlace...
                  </>
                ) : (
                  'Enviar enlace de recuperacion'
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline" data-testid="login_link">
              Volver a iniciar sesion
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
