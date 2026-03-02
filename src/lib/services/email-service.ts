import { Resend } from 'resend';

// =============================================================================
// Constants
// =============================================================================

const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const FROM_EMAIL = 'facturas@soloq.upexgalaxy.com';
const FROM_NAME = 'SoloQ';

// =============================================================================
// Types
// =============================================================================

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
 * Generate HTML email body for invoice
 */
function generateInvoiceEmailHtml(params: {
  clientName: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
  businessName: string;
}): string {
  const { clientName, invoiceNumber, total, dueDate, businessName } = params;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${invoiceNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f9fafb; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
    <h1 style="color: #6366f1; margin: 0 0 8px 0; font-size: 24px;">${businessName}</h1>
    <p style="color: #6b7280; margin: 0; font-size: 14px;">Factura adjunta</p>
  </div>

  <p style="margin-bottom: 16px;">Hola <strong>${clientName}</strong>,</p>

  <p style="margin-bottom: 24px;">
    Te enviamos la factura <strong>${invoiceNumber}</strong> por un total de <strong>${total}</strong>.
  </p>

  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; color: #92400e;">
      <strong>Fecha de vencimiento:</strong> ${dueDate}
    </p>
  </div>

  <p style="margin-bottom: 8px;">
    Encontraras el PDF de la factura adjunto a este correo.
  </p>

  <p style="margin-bottom: 24px; color: #6b7280; font-size: 14px;">
    Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
    Este correo fue enviado desde <strong>${businessName}</strong> usando SoloQ.
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
}): string {
  const { clientName, invoiceNumber, total, dueDate, businessName } = params;

  return `
${businessName}
Factura adjunta

Hola ${clientName},

Te enviamos la factura ${invoiceNumber} por un total de ${total}.

Fecha de vencimiento: ${dueDate}

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
  const { to, invoiceNumber, clientName, total, dueDate, pdfBuffer, businessName } = params;

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
  });
  const text = generateInvoiceEmailText({
    clientName,
    invoiceNumber,
    total,
    dueDate,
    businessName,
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
