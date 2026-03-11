'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Loader2, AlertTriangle, Eye, EyeOff, Clock } from 'lucide-react';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PasswordStrengthIndicator,
  validatePassword,
} from '@/components/auth/password-strength-indicator';

// Utility to mask email
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const maskedLocal =
    localPart.length <= 2 ? localPart[0] + '***' : localPart[0] + '***' + localPart.slice(-1);

  return `${maskedLocal}@${domain}`;
}

type TokenStatus = 'loading' | 'valid' | 'expired' | 'invalid' | 'used';

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <Card className="w-full shadow-lg">
      <CardContent className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}

// Main content component (uses useSearchParams which requires Suspense)
function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('loading');
  const [userEmail, setUserEmail] = useState<string>('');
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Check for password recovery session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First, check URL params for Supabase error redirects
        const errorCode = searchParams.get('error_code');
        const error = searchParams.get('error');

        // Handle expired token from Supabase redirect (SQ-86)
        if (errorCode === 'otp_expired' || error === 'access_denied') {
          setTokenStatus('expired');
          return;
        }

        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setTokenStatus('invalid');
          return;
        }

        // If we have a session, user came from email link
        if (session?.user) {
          setUserEmail(session.user.email || '');
          setTokenStatus('valid');
          return;
        }

        // No session - check if this is a password recovery flow
        // Supabase may have already processed the token
        // Listen for auth state changes
        setTokenStatus('invalid');
      } catch (err) {
        console.error('Error checking session:', err);
        setTokenStatus('invalid');
      }
    };

    // Listen for PASSWORD_RECOVERY event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked the reset link and Supabase verified the token
        setUserEmail(session?.user?.email || '');
        setTokenStatus('valid');
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Sometimes Supabase fires SIGNED_IN for password recovery
        // Check if we're on the reset password page
        setUserEmail(session.user.email || '');
        setTokenStatus('valid');
      }
    });

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, searchParams]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password meets requirements (FT-SQ4-07)
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError('La contraseña no cumple con todos los requisitos.');
      return;
    }

    // Validate passwords match (FT-SQ4-08)
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        // Handle specific errors
        if (
          updateError.message.includes('expired') ||
          updateError.message.includes('Token has expired')
        ) {
          setTokenStatus('expired');
          setShowExpiredModal(true);
          return;
        }

        if (
          updateError.message.includes('invalid') ||
          updateError.message.includes('Invalid token')
        ) {
          setTokenStatus('invalid');
          setError('El link de recuperación no es válido. Solicita uno nuevo.');
          return;
        }

        setError(updateError.message || 'No se pudo actualizar la contraseña.');
        return;
      }

      // Password updated successfully!
      // Sign out from ALL sessions globally (FT-SQ4-15)
      await supabase.auth.signOut({ scope: 'global' });

      // Redirect to login with success message (FT-SQ4-16)
      router.push('/login?reset=success');
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend from expired modal (FT-SQ4-13)
  const handleResendEmail = useCallback(async () => {
    if (!userEmail) {
      setShowExpiredModal(false);
      router.push('/forgot-password');
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'No se pudo enviar el email. Intenta de nuevo.');
        setShowExpiredModal(false);
        return;
      }

      // Success - close modal and show confirmation
      setShowExpiredModal(false);
      router.push('/forgot-password');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
      setShowExpiredModal(false);
    } finally {
      setIsResending(false);
    }
  }, [userEmail, router]);

  // Check if form is valid
  const isFormValid = validatePassword(password).isValid && password === confirmPassword;

  // Loading state while checking token
  if (tokenStatus === 'loading') {
    return (
      <Card className="w-full shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Expired token - show specific message with option to request new link (SQ-86)
  if (tokenStatus === 'expired') {
    return (
      <Card className="w-full shadow-lg" data-testid="reset-password-expired">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Link Expirado</CardTitle>
          <CardDescription>
            Este link de recuperación ha expirado. Por seguridad, los links son válidos solo por 1
            hora.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-amber-50 border-amber-200">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              No te preocupes, puedes solicitar un nuevo link de recuperación.
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Solicitar Nuevo Link</Link>
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
            Volver a Iniciar Sesión
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Invalid token - redirect to forgot password
  if (tokenStatus === 'invalid') {
    return (
      <Card className="w-full shadow-lg" data-testid="reset-password-invalid">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Link Inválido</CardTitle>
          <CardDescription>
            Este link de recuperación no es válido o ya ha sido utilizado.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild className="w-full">
            <Link href="/forgot-password">Solicitar Nuevo Link</Link>
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
            Volver a Iniciar Sesión
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Valid token - show reset form
  return (
    <>
      <Card className="w-full shadow-lg" data-testid="reset-password-form">
        <CardHeader className="space-y-1 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Nueva Contraseña</CardTitle>
          <CardDescription>Ingresa tu nueva contraseña para tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="reset-form-submit">
            {error && (
              <Alert variant="destructive" data-testid="reset-password-error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading || tokenStatus !== 'valid'}
                  autoComplete="new-password"
                  className="pr-10"
                  data-testid="new-password-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Password requirements - always visible (FT-SQ4-19) */}
            <PasswordStrengthIndicator password={password} />

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading || tokenStatus !== 'valid'}
                  autoComplete="new-password"
                  className={`pr-10 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                  data-testid="confirm-password-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {/* Password match error (FT-SQ4-08) */}
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-500" data-testid="password-mismatch-error">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isFormValid || tokenStatus !== 'valid'}
              data-testid="submit-reset-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Contraseña'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
            Volver a Iniciar Sesión
          </Link>
        </CardFooter>
      </Card>

      {/* Expired Token Modal (FT-SQ4-12, FT-SQ4-13) */}
      <Dialog open={showExpiredModal} onOpenChange={setShowExpiredModal}>
        <DialogContent data-testid="expired-token-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Link Expirado
            </DialogTitle>
            <DialogDescription>
              Este link de recuperación ha expirado. Los links son válidos por 1 hora por seguridad.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-sm text-muted-foreground">Email</Label>
            <Input
              value={userEmail ? maskEmail(userEmail) : 'Email no disponible'}
              disabled
              className="mt-1"
              data-testid="expired-modal-email"
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowExpiredModal(false);
                router.push('/login');
              }}
              disabled={isResending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              data-testid="resend-link-btn"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Nuevo Link'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Page component with Suspense boundary for useSearchParams (SQ-86)
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
