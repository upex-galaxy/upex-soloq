import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import {
  formatCurrency,
  formatDateShort,
  sanitizeForPDF,
  formatBusinessAddress,
  isValidImageUrl,
} from '@/lib/utils/pdf-utils';
import { calculateDiscountAmount } from '@/lib/utils/invoice-calculations';
import type { InvoiceWithDetails } from '@/hooks/invoices/use-invoice';

// =============================================================================
// Color Palette
// =============================================================================

const colors = {
  primary: '#6366f1', // Indigo-500
  primaryDark: '#4f46e5', // Indigo-600
  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  backgroundAlt: '#f9fafb',
  white: '#ffffff',
};

// =============================================================================
// Styles (SQ-132: restructured to match mockup from QA comments)
// =============================================================================

// CRITICAL: Use Helvetica (built-in font) to avoid font loading issues
const styles = StyleSheet.create({
  // Page
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: colors.white,
  },

  // =========================================================================
  // Section A: Header - Logo (A1) + Business Info (A2)
  // =========================================================================
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  // A1: Logo area (left)
  headerLogoArea: {
    width: '40%',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 70,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logo: {
    maxWidth: 140,
    maxHeight: 70,
    objectFit: 'contain',
  },
  headerFallbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  // A2: Business info (right)
  headerBusinessInfo: {
    width: '55%',
    alignItems: 'flex-end',
  },
  businessName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'right',
  },
  businessInfoText: {
    fontSize: 9,
    color: colors.textSecondary,
    marginBottom: 2,
    textAlign: 'right',
    lineHeight: 1.4,
  },
  businessInfoLabel: {
    fontSize: 8,
    color: colors.textMuted,
    textAlign: 'right',
  },

  // =========================================================================
  // Section B: Client Info (B1) + Invoice Meta (B2)
  // =========================================================================
  sectionB: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  // B1: Client info (left)
  clientBox: {
    width: '55%',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 4,
  },
  // B2: Invoice meta (right)
  invoiceMetaBox: {
    width: '40%',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    backgroundColor: colors.backgroundAlt,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoTextBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 10,
    color: colors.textPrimary,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  infoLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    marginBottom: 1,
  },
  invoiceNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  // =========================================================================
  // Section C: Items Table
  // =========================================================================
  table: {
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableRowAlt: {
    backgroundColor: colors.backgroundAlt,
  },
  tableText: {
    fontSize: 10,
    color: colors.textPrimary,
  },
  tableTextMuted: {
    fontSize: 10,
    color: colors.textSecondary,
  },

  // Column widths
  colDescription: { flex: 3 },
  colQuantity: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right' },

  // Empty state for items
  emptyItems: {
    padding: 20,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 10,
    fontStyle: 'italic',
  },

  // =========================================================================
  // Section D: Totals (right-aligned)
  // =========================================================================
  totalsContainer: {
    alignItems: 'flex-end',
    marginBottom: 25,
  },
  totalsBox: {
    width: 220,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  totalsLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  totalsValue: {
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  totalsFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  totalsFinalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  totalsFinalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },

  // =========================================================================
  // Section E: Notes/Terms (E1) + Payment Methods (E2)
  // =========================================================================
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesSection: {
    width: '48%',
  },
  bottomSectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 9,
    color: colors.textSecondary,
    lineHeight: 1.5,
  },
  paymentMethodLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  paymentMethodValue: {
    fontSize: 8,
    color: colors.textSecondary,
    backgroundColor: '#f3f4f6',
    padding: '3 6',
    borderRadius: 2,
  },

  // =========================================================================
  // Footer with page numbering
  // =========================================================================
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },
  footerPageNumber: {
    fontSize: 8,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
});

// =============================================================================
// Component Props
// =============================================================================

interface InvoiceDocumentProps {
  data: InvoiceWithDetails;
}

// =============================================================================
// InvoiceDocument Component (SQ-132: restructured to match mockup)
// =============================================================================

/**
 * Format payment method value JSON string for PDF display
 */
function formatPaymentMethodValue(type: string, valueStr: string): string {
  try {
    const parsed = typeof valueStr === 'string' ? JSON.parse(valueStr) : valueStr;
    switch (type) {
      case 'bank_transfer': {
        const parts: string[] = [];
        if (parsed.bank_name) parts.push(parsed.bank_name);
        if (parsed.clabe) parts.push(`CLABE: ${parsed.clabe}`);
        if (parsed.cbu) parts.push(`CBU: ${parsed.cbu}`);
        if (parsed.account_number) parts.push(`Cuenta: ${parsed.account_number}`);
        return parts.join(' | ');
      }
      case 'paypal':
        return parsed.email || valueStr;
      case 'mercado_pago': {
        const parts: string[] = [];
        if (parsed.alias) parts.push(`Alias: ${parsed.alias}`);
        if (parsed.cvu) parts.push(`CVU: ${parsed.cvu}`);
        return parts.join(' | ');
      }
      case 'cash':
        return parsed.instructions || 'Efectivo';
      default:
        return parsed.instructions || parsed.name || valueStr;
    }
  } catch {
    return valueStr;
  }
}

/**
 * PDF Document template for invoices
 *
 * Uses @react-pdf/renderer to generate a professional PDF.
 * All text is sanitized to remove emojis (not supported by PDF renderer).
 *
 * Layout follows the mockup from QA (SQ-32 comments):
 * - Section A: Logo (A1) + Business Info (A2)
 * - Section B: Client Info (B1) + Invoice Meta (B2)
 * - Section C: Items Table
 * - Section D: Totals (right-aligned)
 * - Section E: Notes/Terms (E1) + Payment Methods (E2)
 * - Footer: Platform credit + Page numbering
 */
export function InvoiceDocument({ data }: InvoiceDocumentProps) {
  const { client, items, business_profile } = data;

  // Calculate discount amount using shared utility (handles capping + percentage)
  const { amount: discountAmount } = calculateDiscountAmount(
    data.subtotal,
    data.discount_type,
    data.discount_value
  );

  // Check if logo URL is valid (SQ-33)
  const hasValidLogo = isValidImageUrl(business_profile?.logo_url);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ================================================================
            SECTION A: HEADER - Logo (A1) + Business Info (A2)
            ================================================================ */}
        <View style={styles.header}>
          {/* A1: Logo / Brand */}
          <View style={styles.headerLogoArea}>
            {hasValidLogo ? (
              <View style={styles.logoContainer}>
                <Image src={business_profile!.logo_url!} style={styles.logo} />
              </View>
            ) : (
              <Text style={styles.headerFallbackTitle}>
                {sanitizeForPDF(business_profile?.business_name) || 'FACTURA'}
              </Text>
            )}
          </View>

          {/* A2: Business Info */}
          <View style={styles.headerBusinessInfo}>
            <Text style={styles.businessName}>
              {sanitizeForPDF(business_profile?.business_name) || 'Mi Negocio'}
            </Text>
            {business_profile?.address && (
              <Text style={styles.businessInfoText}>
                {sanitizeForPDF(formatBusinessAddress(business_profile.address))}
              </Text>
            )}
            {business_profile?.tax_id && (
              <Text style={styles.businessInfoText}>
                RFC/NIF: {sanitizeForPDF(business_profile.tax_id)}
              </Text>
            )}
            {business_profile?.contact_email && (
              <Text style={styles.businessInfoLabel}>{business_profile.contact_email}</Text>
            )}
            {business_profile?.contact_phone && (
              <Text style={styles.businessInfoLabel}>{business_profile.contact_phone}</Text>
            )}
          </View>
        </View>

        {/* ================================================================
            SECTION B: Client Info (B1) + Invoice Meta (B2)
            ================================================================ */}
        <View style={styles.sectionB}>
          {/* B1: Client Info (Facturar A) */}
          <View style={styles.clientBox}>
            <Text style={styles.sectionTitle}>Facturar A</Text>
            <Text style={styles.infoTextBold}>{sanitizeForPDF(client.name)}</Text>
            {client.company && (
              <Text style={styles.infoText}>{sanitizeForPDF(client.company)}</Text>
            )}
            {client.tax_id && (
              <Text style={styles.infoText}>RFC/NIF: {sanitizeForPDF(client.tax_id)}</Text>
            )}
            {client.address && (
              <Text style={styles.infoText}>{sanitizeForPDF(client.address)}</Text>
            )}
            <Text style={styles.infoLabel}>{client.email}</Text>
          </View>

          {/* B2: Invoice Meta */}
          <View style={styles.invoiceMetaBox}>
            <Text style={styles.sectionTitle}>Factura</Text>
            <Text style={styles.invoiceNumber}>N.{'\u00BA'} {data.invoice_number}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Fecha de Emision:</Text>
              <Text style={styles.metaValue}>{formatDateShort(data.issue_date)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Fecha de Vencim.:</Text>
              <Text style={styles.metaValue}>{formatDateShort(data.due_date)}</Text>
            </View>
          </View>
        </View>

        {/* ================================================================
            SECTION C: ITEMS TABLE
            ================================================================ */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Descripcion</Text>
            <Text style={[styles.tableHeaderText, styles.colQuantity]}>Cant.</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Precio Unit.</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Importe</Text>
          </View>

          {/* Rows */}
          {items.length > 0 ? (
            items.map((item, index) => (
              <View
                key={item.id}
                style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.tableText, styles.colDescription]}>
                  {sanitizeForPDF(item.description) || 'Sin descripcion'}
                </Text>
                <Text style={[styles.tableTextMuted, styles.colQuantity]}>{item.quantity}</Text>
                <Text style={[styles.tableTextMuted, styles.colPrice]}>
                  {formatCurrency(item.unit_price)}
                </Text>
                <Text style={[styles.tableText, styles.colTotal]}>
                  {formatCurrency(item.subtotal)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.emptyItems}>No hay items en esta factura</Text>
            </View>
          )}
        </View>

        {/* ================================================================
            SECTION D: TOTALS (right-aligned)
            ================================================================ */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            {/* Subtotal */}
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatCurrency(data.subtotal)}</Text>
            </View>

            {/* Discount (if any) */}
            {discountAmount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>
                  Descuento Total{data.discount_type === 'percentage' ? ` (${data.discount_value}%)` : ''}
                </Text>
                <Text style={styles.totalsValue}>-{formatCurrency(discountAmount)}</Text>
              </View>
            )}

            {/* Tax (if any) — hide when tax_amount is 0 (e.g. discount >= subtotal) */}
            {(data.tax_rate ?? 0) > 0 && (data.tax_amount ?? 0) > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>IVA ({data.tax_rate}%)</Text>
                <Text style={styles.totalsValue}>{formatCurrency(data.tax_amount)}</Text>
              </View>
            )}

            {/* Total */}
            <View style={styles.totalsFinal}>
              <Text style={styles.totalsFinalLabel}>TOTAL</Text>
              <Text style={styles.totalsFinalValue}>{formatCurrency(data.total)}</Text>
            </View>
          </View>
        </View>

        {/* ================================================================
            SECTION E: NOTES, TERMS & PAYMENT METHODS
            ================================================================ */}
        {(data.notes || data.terms || (data.payment_methods && data.payment_methods.length > 0)) && (
          <View style={styles.bottomSection}>
            {/* E1: Notes & Terms */}
            {(data.notes || data.terms) && (
              <View style={styles.notesSection}>
                {data.notes && (
                  <View style={{ marginBottom: data.terms ? 10 : 0 }}>
                    <Text style={styles.bottomSectionTitle}>Notas</Text>
                    <Text style={styles.notesText}>{sanitizeForPDF(data.notes)}</Text>
                  </View>
                )}
                {data.terms && (
                  <View>
                    <Text style={styles.bottomSectionTitle}>Terminos y Condiciones</Text>
                    <Text style={styles.notesText}>{sanitizeForPDF(data.terms)}</Text>
                  </View>
                )}
              </View>
            )}

            {/* E2: Payment Methods */}
            {data.payment_methods && data.payment_methods.length > 0 && (
              <View style={styles.notesSection}>
                <Text style={styles.bottomSectionTitle}>Metodos de Pago</Text>
                {data.payment_methods.map((pm, idx) => (
                  <View key={idx} style={{ marginBottom: 6 }}>
                    <Text style={styles.paymentMethodLabel}>
                      {sanitizeForPDF(pm.label)}
                    </Text>
                    <Text style={styles.paymentMethodValue}>
                      {sanitizeForPDF(formatPaymentMethodValue(pm.type, pm.value))}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ================================================================
            FOOTER with page numbering (SQ-132)
            ================================================================ */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generado por SoloQ | {data.invoice_number}
          </Text>
          <Text
            style={styles.footerPageNumber}
            render={({ pageNumber, totalPages }) =>
              `Pagina ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
