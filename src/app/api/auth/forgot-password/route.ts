import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServer } from '@/lib/supabase/server';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

// Rate limiting storage (in-memory for MVP)
// In production, use Redis or database
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const emailRequestCounts = new Map<string, { count: number; resetTime: number }>();

// Rate limit constants
const IP_LIMIT = 20; // requests per minute
const IP_WINDOW_MS = 60 * 1000; // 1 minute

const EMAIL_LIMIT = 3; // requests per hour
const EMAIL_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Check rate limit for IP (FT-SQ4-05a)
function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now > record.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + IP_WINDOW_MS });
    return true;
  }

  if (record.count >= IP_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Check rate limit for email (FT-SQ4-05b)
function checkEmailRateLimit(email: string): boolean {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();
  const record = emailRequestCounts.get(normalizedEmail);

  if (!record || now > record.resetTime) {
    emailRequestCounts.set(normalizedEmail, { count: 1, resetTime: now + EMAIL_WINDOW_MS });
    return true;
  }

  if (record.count >= EMAIL_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Get client IP from request
function getClientIp(request: NextRequest): string {
  // Check various headers for IP (behind proxies)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a placeholder (in development)
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const clientIp = getClientIp(request);

    // Check IP rate limit first (FT-SQ4-05a)
    if (!checkIpRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta más tarde.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = forgotPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }

    const { email } = validationResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check email rate limit (FT-SQ4-05b)
    if (!checkEmailRateLimit(normalizedEmail)) {
      // Return same generic message to prevent enumeration
      // But internally we blocked it
      return NextResponse.json(
        { error: 'Demasiadas solicitudes para este email. Intenta más tarde.' },
        { status: 429 }
      );
    }

    // Create Supabase client
    const supabase = await createServer();

    // Get the base URL for redirect
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const redirectTo = `${baseUrl}/reset-password`;

    // Send password reset email
    // This will work whether or not the email exists in the system
    // Supabase handles this securely
    await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    // IMPORTANT: Always return the same response regardless of whether
    // the email exists or not (FT-SQ4-01, FT-SQ4-02, FT-SQ4-04)
    // This prevents email enumeration attacks

    // Add small random delay to prevent timing attacks (0-200ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200));

    return NextResponse.json({
      success: true,
      message: 'Si existe una cuenta con este email, enviamos un link de recuperación.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    // Generic error to avoid leaking information
    return NextResponse.json({ error: 'Ocurrió un error. Intenta de nuevo.' }, { status: 500 });
  }
}
