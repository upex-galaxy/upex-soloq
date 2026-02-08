// src/lib/auth/auth-helpers.ts
'use client';

import { RegisterFormSchema } from '@/app/(auth)/register/_components/register-form';
import { LoginFormSchema } from '@/app/(auth)/login/_components/login-form';
import { ForgotPasswordFormSchema } from '@/app/(auth)/forgot-password/_components/forgot-password-form';
import { ResetPasswordFormSchema } from '@/app/(auth)/reset-password/_components/reset-password-form';

export async function registerUser(credentials: RegisterFormSchema) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Error al registrar el usuario');
  }

  return data;
}

// New loginUser function
export async function loginUser(credentials: LoginFormSchema) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Error al iniciar sesión');
  }

  return data;
}

// New requestPasswordReset function
export async function requestPasswordReset(credentials: ForgotPasswordFormSchema) {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  // For security, always return success to the client, even if email doesn't exist
  // The actual error is logged server-side
  const data = await response.json();

  if (!response.ok) {
    // Log the actual error for debugging, but don't expose to client
    console.error('Server error during password reset request:', data.error?.message);
    // Still return a "success" message to prevent email enumeration
    // Or handle a generic error if the response status is a critical server error (e.g., 500)
    if (response.status >= 500) {
      throw new Error(data.error?.message || 'Error interno del servidor.');
    }
  }

  return data;
}

// New resetPassword function
export async function resetPassword(credentials: ResetPasswordFormSchema & { token: string }) {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Error al restablecer la contraseña');
  }

  return data;
}

// New logoutUser function
export async function logoutUser() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Error al cerrar sesión');
  }

  return data;
}
