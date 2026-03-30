'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, Loader2, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
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
import { cn } from '@/lib/utils';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Al menos 1 mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos 1 minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Al menos 1 número', test: (p: string) => /[0-9]/.test(p) },
];

// Email validation regex (RFC 5321 compliant basic pattern)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email: string): boolean => EMAIL_REGEX.test(email);

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();

  // Check password requirements in real-time
  const passwordValidation = useMemo(() => {
    return PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      met: req.test(password),
    }));
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return passwordValidation.every(req => req.met);
  }, [passwordValidation]);

  // Real-time email validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !isValidEmail(value)) {
      setEmailError('Por favor ingresa un email válido');
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);

    // Validate email format
    if (!email || !isValidEmail(email)) {
      setEmailError('Por favor ingresa un email válido');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Validate password strength (all requirements must be met)
    if (!isPasswordValid) {
      const missing = passwordValidation.filter(req => !req.met).map(req => req.label);
      setError(`La contraseña no cumple los requisitos: ${missing.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Este email ya está registrado. ¿Quieres iniciar sesión?');
        } else if (error.message.includes('invalid email')) {
          setError('Por favor ingresa un email válido.');
        } else {
          setError(error.message);
        }
        return;
      }

      // Show success message
      setIsSuccess(true);
    } catch {
      setError('Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state - email verification sent
  if (isSuccess) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">¡Revisa tu email!</CardTitle>
          <CardDescription className="text-base">
            Te enviamos un enlace de confirmación a <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-primary/5 border-primary/20">
            <AlertDescription>
              Haz clic en el enlace del email para activar tu cuenta y comenzar a facturar.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground text-center">
            ¿No recibiste el email? Revisa tu carpeta de spam o{' '}
            <button onClick={() => setIsSuccess(false)} className="text-primary hover:underline">
              intenta de nuevo
            </button>
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/login">Ir a Iniciar Sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileText className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Crea tu cuenta gratis</CardTitle>
        <CardDescription>Comienza a facturar profesionalmente en minutos</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
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
              onChange={e => handleEmailChange(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
              data-testid="signup-email-input"
              className={emailError ? 'border-destructive' : ''}
            />
            {emailError && (
              <p className="text-xs text-destructive" data-testid="email-error">
                {emailError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setShowPasswordRequirements(true)}
                required
                disabled={isLoading}
                autoComplete="new-password"
                data-testid="signup-password-input"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                data-testid="signup-password-toggle"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Real-time password requirements indicator */}
            {showPasswordRequirements && password.length > 0 && (
              <div className="mt-2 space-y-1 text-xs" data-testid="password-requirements">
                {passwordValidation.map((req, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center gap-1.5',
                      req.met ? 'text-green-600' : 'text-muted-foreground'
                    )}
                  >
                    {req.met ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="new-password"
                data-testid="signup-confirm-password-input"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                data-testid="signup-confirm-password-toggle"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !!emailError || (password.length > 0 && !isPasswordValid)}
            data-testid="signup-submit-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta gratis'
            )}
          </Button>
        </form>

        <p className="mt-4 text-xs text-center text-muted-foreground">
          Al registrarte, aceptas nuestros{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Política de Privacidad
          </Link>
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
