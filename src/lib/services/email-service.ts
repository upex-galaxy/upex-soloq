import { Resend } from 'resend';
import { escapeHtml as escapeHtmlShared } from '@/lib/utils/sanitize';

// =============================================================================
// Constants
// =============================================================================

const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const FROM_EMAIL = 'facturas@soloq.upexgalaxy.com';
const FROM_NAME = 'SoloQ';

// =============================================================================
// Types
// =============================================================================

/**
 * Payment method data for email template (SQ-44)
 * Subset of PaymentMethod optimized for email rendering
 */
export interface PaymentMethodForEmail {
  type: 'bank_transfer' | 'paypal' | 'mercado_pago' | 'cash' | 'other';
  label: string;
  value: string;
}

export interface SendInvoiceEmailParams {
  /** Recipient email address */
  to: string;
  /** Invoice number for subject and filename */
  invoiceNumber: string;
  /** Client name for personalization */
  clientName: string;
  /** Formatted total amount (e.g., "$1,234.56") */
  total: string;
  /** Due date in readable format */
  dueDate: string;
  /** PDF buffer to attach */
  pdfBuffer: Buffer;
  /** Business name for sender identification */
  businessName: string;
  /** Payment methods to display in email (SQ-44) */
  paymentMethods?: PaymentMethodForEmail[];
}

export interface SendInvoiceEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  code?: 'PDF_TOO_LARGE' | 'PDF_EMPTY' | 'EMAIL_SEND_FAILED' | 'RESEND_NOT_CONFIGURED';
}

// =============================================================================
// Resend Client
// =============================================================================

/**
 * Get Resend client instance
 * Returns null if API key is not configured
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured');
    return null;
  }
  return new Resend(apiKey);
}

// =============================================================================
// Email Templates
// =============================================================================

/**
 * Escape HTML special characters to prevent XSS.
 * Re-exported from the shared sanitize util so email templates and any other
 * HTML interpolation site share a single implementation. See SQ-156.
 */
const escapeHtml = (text: string): string => escapeHtmlShared(text);

/**
 * Format a single payment method as HTML (SQ-44)
 * Uses monospace font for values to enable easy copy-paste
 */
function formatPaymentMethodHtml(method: PaymentMethodForEmail): string {
  const safeLabel = escapeHtml(method.label);
  const safeValue = escapeHtml(method.value);

  return `
    <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
      <p style="font-weight: bold; color: #374151; margin: 0 0 4px 0;">${safeLabel}</p>
      <p style="font-family: 'Courier New', Courier, monospace; background: #f3f4f6; padding: 6px 10px; margin: 0; border-radius: 4px; color: #111827; word-break: break-all;">${safeValue}</p>
    </div>
  `;
}

/**
 * Format a single payment method as plain text (SQ-44)
 */
function formatPaymentMethodText(method: PaymentMethodForEmail): string {
  return `${method.label}\n${method.value}`;
}

/**
 * Generate payment methods section HTML (SQ-44)
 * Returns empty string if no payment methods provided
 */
function generatePaymentMethodsSectionHtml(paymentMethods?: PaymentMethodForEmail[]): string {
  if (!paymentMethods || paymentMethods.length === 0) {
    return '';
  }

  const methodsHtml = paymentMethods.map(formatPaymentMethodHtml).join('');

  return `
  <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">💳 Información de Pago</h2>
    <p style="color: #3b82f6; margin: 0 0 16px 0; font-size: 14px;">Puedes realizar el pago mediante cualquiera de los siguientes métodos:</p>
    ${methodsHtml}
  </div>
  `;
}

/**
 * Generate payment methods section plain text (SQ-44)
 * Returns empty string if no payment methods provided
 */
function generatePaymentMethodsSectionText(paymentMethods?: PaymentMethodForEmail[]): string {
  if (!paymentMethods || paymentMethods.length === 0) {
    return '';
  }

  const methodsText = paymentMethods.map(formatPaymentMethodText).join('\n\n');

  return `
---
INFORMACIÓN DE PAGO

Puedes realizar el pago mediante cualquiera de los siguientes métodos:

${methodsText}
---
`;
}

/**
 * Generate HTML email body for invoice
 */
function generateInvoiceEmailHtml(params: {
  clientName: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
  businessName: string;
  paymentMethods?: PaymentMethodForEmail[];
}): string {
  const { clientName, invoiceNumber, total, dueDate, businessName, paymentMethods } = params;

  // Generate payment methods section (SQ-44)
  const paymentMethodsSection = generatePaymentMethodsSectionHtml(paymentMethods);

  // Escape user-controlled values before interpolating into the HTML template.
  // Defense-in-depth for SQ-156: even though notes/terms are sanitized at the
  // write boundary, clientName / businessName / invoiceNumber come from
  // user-entered records and must not be trusted as HTML here.
  const safeClientName = escapeHtml(clientName);
  const safeInvoiceNumber = escapeHtml(invoiceNumber);
  const safeTotal = escapeHtml(total);
  const safeDueDate = escapeHtml(dueDate);
  const safeBusinessName = escapeHtml(businessName);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${safeInvoiceNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f9fafb; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
    <h1 style="color: #6366f1; margin: 0 0 8px 0; font-size: 24px;">${safeBusinessName}</h1>
    <p style="color: #6b7280; margin: 0; font-size: 14px;">Factura adjunta</p>
  </div>

  <p style="margin-bottom: 16px;">Hola <strong>${safeClientName}</strong>,</p>

  <p style="margin-bottom: 24px;">
    Te enviamos la factura <strong>${safeInvoiceNumber}</strong> por un total de <strong>${safeTotal}</strong>.
  </p>

  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; color: #92400e;">
      <strong>Fecha de vencimiento:</strong> ${safeDueDate}
    </p>
  </div>

  ${paymentMethodsSection}

  <p style="margin-bottom: 8px;">
    Encontraras el PDF de la factura adjunto a este correo.
  </p>

  <p style="margin-bottom: 24px; color: #6b7280; font-size: 14px;">
    Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
    Este correo fue enviado desde <strong>${safeBusinessName}</strong> usando SoloQ.
  </p>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email body for invoice
 */
function generateInvoiceEmailText(params: {
  clientName: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
  businessName: string;
  paymentMethods?: PaymentMethodForEmail[];
}): string {
  const { clientName, invoiceNumber, total, dueDate, businessName, paymentMethods } = params;

  // Generate payment methods section (SQ-44)
  const paymentMethodsSection = generatePaymentMethodsSectionText(paymentMethods);

  return `
${businessName}
Factura adjunta

Hola ${clientName},

Te enviamos la factura ${invoiceNumber} por un total de ${total}.

Fecha de vencimiento: ${dueDate}
${paymentMethodsSection}
Encontraras el PDF de la factura adjunto a este correo.

Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos.

---
Este correo fue enviado desde ${businessName} usando SoloQ.
  `.trim();
}

// =============================================================================
// Send Invoice Email
// =============================================================================

/**
 * Send invoice email with PDF attachment
 *
 * Sends an email to the client with the invoice PDF attached.
 * Validates PDF size before sending.
 *
 * @param params - Email parameters including PDF buffer
 * @returns Result with success status and optional error
 *
 * @example
 * const result = await sendInvoiceEmail({
 *   to: 'client@example.com',
 *   invoiceNumber: 'INV-2026-0001',
 *   clientName: 'John Doe',
 *   total: '$1,234.56',
 *   dueDate: '28 de febrero de 2026',
 *   pdfBuffer: buffer,
 *   businessName: 'Mi Negocio',
 * });
 *
 * if (result.success) {
 *   console.log('Email sent:', result.messageId);
 * } else {
 *   console.error('Email failed:', result.error);
 * }
 */
export async function sendInvoiceEmail(
  params: SendInvoiceEmailParams
): Promise<SendInvoiceEmailResult> {
  const { to, invoiceNumber, clientName, total, dueDate, pdfBuffer, businessName, paymentMethods } =
    params;

  // Get Resend client
  const resend = getResendClient();
  if (!resend) {
    return {
      success: false,
      error: 'Servicio de email no configurado',
      code: 'RESEND_NOT_CONFIGURED',
    };
  }

  // Validate PDF is not empty
  if (!pdfBuffer || pdfBuffer.length === 0) {
    return {
      success: false,
      error: 'El PDF esta vacio',
      code: 'PDF_EMPTY',
    };
  }

  // Validate PDF size
  if (pdfBuffer.length > MAX_ATTACHMENT_SIZE_BYTES) {
    return {
      success: false,
      error: `El PDF es demasiado grande (${Math.round(pdfBuffer.length / 1024 / 1024)}MB). Maximo permitido: 5MB`,
      code: 'PDF_TOO_LARGE',
    };
  }

  // Generate email content
  const subject = `Factura ${invoiceNumber} - ${businessName}`;
  const html = generateInvoiceEmailHtml({
    clientName,
    invoiceNumber,
    total,
    dueDate,
    businessName,
    paymentMethods, // SQ-44
  });
  const text = generateInvoiceEmailText({
    clientName,
    invoiceNumber,
    total,
    dueDate,
    businessName,
    paymentMethods, // SQ-44
  });

  // Generate attachment filename
  const attachmentFilename = `Invoice-${invoiceNumber}.pdf`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      text,
      attachments: [
        {
          filename: attachmentFilename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    if (error) {
      console.error('Resend API error:', error);
      return {
        success: false,
        error: error.message || 'Error al enviar el email',
        code: 'EMAIL_SEND_FAILED',
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('Unexpected error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado al enviar el email',
      code: 'EMAIL_SEND_FAILED',
    };
  }
}
