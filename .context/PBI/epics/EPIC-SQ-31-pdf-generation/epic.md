# EPIC: PDF Generation & Download

**Jira Key:** [SQ-31](https://upexgalaxy64.atlassian.net/browse/SQ-31)
**Priority:** CRITICAL
**Phase:** Core Features (Sprint 4-5)
**Total Story Points:** 13

---

## Description

Generación de facturas en formato PDF profesional. Incluye diseño con logo, datos del negocio, métodos de pago y opción de descarga.

## Business Value

El entregable final al cliente. Sin PDF profesional, la factura no tiene valor como documento de cobro. La calidad del PDF refleja la profesionalidad del freelancer.

---

## User Stories (5)

| Key                                                      | Story                                 | Points | Priority |
| -------------------------------------------------------- | ------------------------------------- | ------ | -------- |
| [SQ-32](https://upexgalaxy64.atlassian.net/browse/SQ-32) | Generate Professional PDF Invoice     | 5      | High     |
| [SQ-33](https://upexgalaxy64.atlassian.net/browse/SQ-33) | Include Logo and Business Data in PDF | 3      | High     |
| [SQ-34](https://upexgalaxy64.atlassian.net/browse/SQ-34) | Include Payment Methods in PDF        | 2      | High     |
| [SQ-35](https://upexgalaxy64.atlassian.net/browse/SQ-35) | Download PDF to Device                | 2      | High     |
| [SQ-36](https://upexgalaxy64.atlassian.net/browse/SQ-36) | Choose PDF Template (Pro Feature)     | 1      | Low      |

---

## Technical Considerations

### Libraries

- **@react-pdf/renderer** - PDF generation in React
- **file-saver** - Client-side file download

### PDF Structure

```typescript
interface InvoicePDF {
  // Header
  businessLogo: string;
  businessName: string;
  businessAddress: string;
  businessTaxId: string;

  // Client Info
  clientName: string;
  clientEmail: string;
  clientTaxId?: string;

  // Invoice Details
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;

  // Line Items
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];

  // Totals
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;

  // Footer
  paymentMethods: PaymentMethod[];
  notes?: string;
  terms?: string;
}
```

### Templates (Pro Feature)

```typescript
type InvoiceTemplate = 'classic' | 'modern' | 'minimal' | 'professional';

interface TemplateConfig {
  id: InvoiceTemplate;
  name: string;
  isPro: boolean;
  primaryColor: string;
  fontFamily: string;
}
```

---

## Dependencies

### Blocked By

- SQ-20 (Epic: Invoice Creation) - needs invoice data to generate PDF
- SQ-7 (Epic: Business Profile) - needs business data for PDF header

### Blocks

- EPIC 6 (Invoice Sending) - needs PDF to attach to email

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC 5)
- **SRS:** `.context/SRS/functional-specs.md` (FR-028 to FR-032)

---

_Documento parte del PBI de SoloQ_
_Última actualización: 2026-01-20_
