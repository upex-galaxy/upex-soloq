/**
 * PDF generation utility functions
 *
 * Used by InvoiceDocument and InvoicePreview components
 * for formatting data in PDF output.
 */

/**
 * Format currency with thousands separator
 *
 * @param amount - Amount to format
 * @param symbol - Currency symbol (default: '$')
 * @param code - Optional currency code to append (e.g., 'USD')
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56) // => "$1,234.56"
 * formatCurrency(1000, '$', 'USD') // => "$1,000.00 USD"
 */
export function formatCurrency(amount: number, symbol = '$', code?: string): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return code ? `${symbol}${formatted} ${code}` : `${symbol}${formatted}`;
}

/**
 * Remove emojis from text
 *
 * CRITICAL: PDFs don't render emojis properly with @react-pdf/renderer.
 * This function strips all emoji characters to prevent rendering issues.
 *
 * @param text - Text that may contain emojis
 * @returns Text with emojis removed
 *
 * @example
 * removeEmojis("Hello World!") // => "Hello World!"
 */
export function removeEmojis(text: string): string {
  if (!text) return '';

  return text.replace(
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu,
    ''
  );
}

/**
 * Format date for PDF display
 *
 * @param isoDate - ISO date string (YYYY-MM-DD or full ISO)
 * @param locale - Locale for formatting (default: 'es-ES')
 * @returns Formatted date string (e.g., "8 de febrero de 2026")
 *
 * @example
 * formatDateForPDF('2026-02-08') // => "8 de febrero de 2026"
 * formatDateForPDF('2026-02-08', 'en-US') // => "February 8, 2026"
 */
export function formatDateForPDF(isoDate: string, locale = 'es-ES'): string {
  if (!isoDate) return '---';

  try {
    // Handle both YYYY-MM-DD and full ISO strings
    const date = new Date(isoDate + (isoDate.length === 10 ? 'T00:00:00' : ''));
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

/**
 * Format date in short format for PDF
 *
 * @param isoDate - ISO date string
 * @returns Formatted date (DD/MM/YYYY)
 */
export function formatDateShort(isoDate: string): string {
  if (!isoDate) return '---';

  try {
    const date = new Date(isoDate + (isoDate.length === 10 ? 'T00:00:00' : ''));
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

/**
 * Sanitize text for PDF rendering
 *
 * Removes emojis and trims whitespace.
 *
 * @param text - Text to sanitize
 * @returns Sanitized text safe for PDF
 */
export function sanitizeForPDF(text: string | null | undefined): string {
  if (!text) return '';
  return removeEmojis(text.trim());
}

/**
 * Formats a JSONB business address into a single-line display string for PDF.
 * Handles both the new JSONB format and legacy string format.
 */
export function formatBusinessAddress(address: unknown): string {
  if (!address) return '';
  if (typeof address === 'string') return address;
  if (typeof address === 'object') {
    const addr = address as Record<string, string | undefined>;
    const parts = [addr.street, addr.city, addr.state, addr.postal_code].filter(Boolean);
    return parts.join(', ');
  }
  return '';
}

/**
 * Check if a URL is valid for image loading in PDF
 *
 * Validates that the URL is properly formatted and uses http/https protocol.
 * Used to prevent react-pdf rendering errors with invalid image URLs.
 *
 * @param url - URL to validate
 * @returns true if URL is valid for image loading
 *
 * @example
 * isValidImageUrl('https://example.com/logo.png') // => true
 * isValidImageUrl('not-a-url') // => false
 * isValidImageUrl(null) // => false
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  // Must start with http:// or https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }

  // Basic URL structure validation
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize text for use in filename
 *
 * Removes accents, replaces special characters with hyphens,
 * and limits length for filesystem compatibility.
 *
 * @param text - Text to sanitize
 * @param maxLength - Maximum length (default: 50)
 * @returns Sanitized text safe for filenames
 *
 * @example
 * sanitizeFilename("Diseño & Cía.") // => "Diseno-Cia"
 * sanitizeFilename("John's \"Company\"") // => "Johns-Company"
 * sanitizeFilename("Café López") // => "Cafe-Lopez"
 */
export function sanitizeFilename(text: string, maxLength = 50): string {
  if (!text) return '';

  return (
    text
      // Normalize unicode and remove accents
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Replace special characters with hyphen
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      // Replace whitespace with hyphen
      .replace(/\s+/g, '-')
      // Remove consecutive hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
      // Limit length
      .slice(0, maxLength)
      // Remove trailing hyphen after slice
      .replace(/-+$/, '')
  );
}

/**
 * Generate invoice filename for download
 *
 * Creates a professional filename with invoice number and client name.
 * Format: Invoice-{number}-{client}.pdf
 *
 * @param invoiceNumber - Invoice number (e.g., "INV-2026-0001")
 * @param clientName - Client name to include in filename
 * @returns Formatted filename with .pdf extension
 *
 * @example
 * generateInvoiceFilename("INV-2026-0001", "Acme Corp")
 * // => "Invoice-INV-2026-0001-Acme-Corp.pdf"
 *
 * generateInvoiceFilename("INV-2026-0002", "Diseño & Cía. López")
 * // => "Invoice-INV-2026-0002-Diseno-Cia-Lopez.pdf"
 */
export function generateInvoiceFilename(invoiceNumber: string, clientName: string): string {
  const sanitizedClient = sanitizeFilename(clientName, 40);
  const sanitizedNumber = sanitizeFilename(invoiceNumber, 30);

  // Ensure we always have at least the invoice number
  if (!sanitizedClient) {
    return `Invoice-${sanitizedNumber || 'draft'}.pdf`;
  }

  return `Invoice-${sanitizedNumber}-${sanitizedClient}.pdf`;
}
