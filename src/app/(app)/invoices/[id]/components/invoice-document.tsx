import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatDateShort, sanitizeForPDF } from '@/lib/utils/pdf-utils';
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
// Styles
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  invoiceNumber: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  invoiceDate: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Info containers (From/To)
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoBox: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 4,
  },
  infoTitle: {
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
  infoText: {
    fontSize: 10,
    color: colors.textPrimary,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  infoTextBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    marginBottom: 1,
  },

  // Items table
  table: {
    marginBottom: 30,
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

  // Totals section
  totalsContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
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

  // Notes and Terms section
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
  sectionTitle: {
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

  // Empty state for items
  emptyItems: {
    padding: 20,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 10,
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },
});

// =============================================================================
// Component Props
// =============================================================================

interface InvoiceDocumentProps {
  data: InvoiceWithDetails;
}

// =============================================================================
// InvoiceDocument Component
// =============================================================================

/**
 * PDF Document template for invoices
 *
 * Uses @react-pdf/renderer to generate a professional PDF.
 * All text is sanitized to remove emojis (not supported by PDF renderer).
 *
 * Sections:
 * 1. Header: Invoice title, number, dates
 * 2. Info boxes: From (Business) / Bill To (Client)
 * 3. Items table: Description, Qty, Price, Total
 * 4. Totals: Subtotal, Discount, Tax, Total
 * 5. Footer: Notes and Terms
 */
export function InvoiceDocument({ data }: InvoiceDocumentProps) {
  const { client, items, business_profile } = data;

  // Calculate discount amount based on type
  const discountAmount =
    data.discount_type === 'percentage'
      ? (data.subtotal * (data.discount_value ?? 0)) / 100
      : (data.discount_value ?? 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            {/* Business name or placeholder */}
            <Text style={styles.invoiceTitle}>
              {sanitizeForPDF(business_profile?.business_name) || 'FACTURA'}
            </Text>
            {business_profile?.tax_id && (
              <Text style={styles.invoiceDate}>
                RFC/NIF: {sanitizeForPDF(business_profile.tax_id)}
              </Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceNumber}>N {data.invoice_number}</Text>
            <Text style={styles.invoiceDate}>Emision: {formatDateShort(data.issue_date)}</Text>
            <Text style={styles.invoiceDate}>Vencimiento: {formatDateShort(data.due_date)}</Text>
          </View>
        </View>

        {/* FROM / TO INFO BOXES */}
        <View style={styles.infoContainer}>
          {/* From (Business) */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>De</Text>
            <Text style={styles.infoTextBold}>
              {sanitizeForPDF(business_profile?.business_name) || 'Mi Negocio'}
            </Text>
            {business_profile?.address && (
              <Text style={styles.infoText}>{sanitizeForPDF(business_profile.address)}</Text>
            )}
            {business_profile?.contact_email && (
              <Text style={styles.infoLabel}>{business_profile.contact_email}</Text>
            )}
            {business_profile?.contact_phone && (
              <Text style={styles.infoLabel}>{business_profile.contact_phone}</Text>
            )}
          </View>

          {/* To (Client) */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Para</Text>
            <Text style={styles.infoTextBold}>{sanitizeForPDF(client.name)}</Text>
            {client.company && (
              <Text style={styles.infoText}>{sanitizeForPDF(client.company)}</Text>
            )}
            {client.address && (
              <Text style={styles.infoText}>{sanitizeForPDF(client.address)}</Text>
            )}
            <Text style={styles.infoLabel}>{client.email}</Text>
            {client.tax_id && (
              <Text style={styles.infoLabel}>RFC/NIF: {sanitizeForPDF(client.tax_id)}</Text>
            )}
          </View>
        </View>

        {/* ITEMS TABLE */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Descripcion</Text>
            <Text style={[styles.tableHeaderText, styles.colQuantity]}>Cant.</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Precio</Text>
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

        {/* TOTALS */}
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
                  Descuento {data.discount_type === 'percentage' ? `(${data.discount_value}%)` : ''}
                </Text>
                <Text style={styles.totalsValue}>-{formatCurrency(discountAmount)}</Text>
              </View>
            )}

            {/* Tax (if any) */}
            {(data.tax_rate ?? 0) > 0 && (
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

        {/* NOTES & TERMS */}
        {(data.notes || data.terms) && (
          <View style={styles.bottomSection}>
            {/* Notes */}
            {data.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.sectionTitle}>Notas</Text>
                <Text style={styles.notesText}>{sanitizeForPDF(data.notes)}</Text>
              </View>
            )}

            {/* Terms */}
            {data.terms && (
              <View style={styles.notesSection}>
                <Text style={styles.sectionTitle}>Terminos y Condiciones</Text>
                <Text style={styles.notesText}>{sanitizeForPDF(data.terms)}</Text>
              </View>
            )}
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generado con SoloQ | {data.invoice_number} | {formatDateShort(data.issue_date)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
