'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Loader2, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

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

// Utility to mask email (e.g., "john@example.com" -> "j***@example.com")
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const maskedLocal =
    localPart.length <= 2 ? localPart[0] + '***' : localPart[0] + '***' + localPart.slice(-1);

  return `${maskedLocal}@${domain}`;
}

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation (FT-SQ4-03)
    if (!email.trim()) {
      setError('Por favor ingresa tu email.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Por favor ingresa un email válido.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Rate limit error
        if (response.status === 429) {
          setError('Has realizado demasiadas solicitudes. Intenta más tarde.');
          return;
        }
        setError(data.error || 'Ocurrió un error. Intenta de nuevo.');
        return;
      }

      // Success - show confirmation (FT-SQ4-01, FT-SQ4-02, FT-SQ4-04)
      // Same message regardless of whether email exists
      setSubmittedEmail(email);
      setIsSubmitted(true);
    } catch {
      setError('Ocurrió un error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmation view after successful submission (FT-SQ4-17)
  if (isSubmitted) {
    return (
      <Card className="w-full shadow-lg" data-testid="forgot-password-confirmation">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Revisa tu Email</CardTitle>
          <CardDescription className="text-base">
            Si existe una cuenta para{' '}
            <span className="font-medium text-foreground">{maskEmail(submittedEmail)}</span>,
            enviamos un link de recuperación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-primary/5 border-primary/20">
            <Mail className="h-4 w-4" />
            <AlertDescription className="text-sm">
              El email puede tardar unos minutos en llegar. Revisa también tu carpeta de spam.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline" data-testid="back-to-login-btn">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Iniciar Sesión
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Request form view
  return (
    <Card className="w-full shadow-lg" data-testid="forgot-password-form">
      <CardHeader className="space-y-1 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileText className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu email y te enviaremos un link para restablecer tu contraseña
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="forgot-password-submit">
          {error && (
            <Alert variant="destructive" data-testid="forgot-password-error">
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
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
              autoFocus
              data-testid="email-input"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading} data-testid="submit-btn">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Link de Recuperación'
            )}
          </Button>
        </form>
      </CardContent>
      {/* Back to login link (FT-SQ4-18) */}
      <CardFooter className="flex justify-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          data-testid="back-to-login-link"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Iniciar Sesión
        </Link>
      </CardFooter>
    </Card>
  );
}
