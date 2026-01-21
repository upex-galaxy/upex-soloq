# EPIC: Invoice Sending

**Jira Key:** [SQ-37](https://upexgalaxy64.atlassian.net/browse/SQ-37)
**Priority:** CRITICAL
**Phase:** Core Features (Sprint 5)
**Total Story Points:** 11

---

## Description

Envío de facturas por email. Incluye PDF adjunto, datos de pago en el email, personalización del mensaje y confirmación de envío.

## Business Value

Completa el flujo principal de facturación. Sin envío por email, el usuario tendría que descargar y enviar manualmente, reduciendo significativamente la productividad.

---

## User Stories (5)

| Key                                                      | Story                                | Points | Priority |
| -------------------------------------------------------- | ------------------------------------ | ------ | -------- |
| [SQ-42](https://upexgalaxy64.atlassian.net/browse/SQ-42) | Send Invoice by Email with One Click | 3      | High     |
| [SQ-43](https://upexgalaxy64.atlassian.net/browse/SQ-43) | Include Attached PDF in Email        | 2      | High     |
| [SQ-44](https://upexgalaxy64.atlassian.net/browse/SQ-44) | Include Payment Data in Email        | 2      | High     |
| [SQ-45](https://upexgalaxy64.atlassian.net/browse/SQ-45) | Customize Email Subject and Message  | 2      | Medium   |
| [SQ-46](https://upexgalaxy64.atlassian.net/browse/SQ-46) | See Email Delivery Confirmation      | 2      | Medium   |

---

## Technical Considerations

### Email Service

- **Resend** - Transactional email service
- React Email templates for consistent branding

### Database Updates

```sql
-- Add to invoices table
ALTER TABLE invoices ADD COLUMN sent_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN email_message_id VARCHAR(255);

-- email_logs table for tracking
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, bounced, failed
  message_id VARCHAR(255),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

| Method | Endpoint                         | Description               |
| ------ | -------------------------------- | ------------------------- |
| POST   | `/api/invoices/:id/send`         | Send invoice email        |
| GET    | `/api/invoices/:id/email-status` | Get email delivery status |

### Email Template

```typescript
interface InvoiceEmailData {
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  customMessage?: string;
  paymentMethods: PaymentMethod[];
  pdfAttachment: Buffer;
}
```

---

## Dependencies

### Blocked By

- SQ-31 (Epic: PDF Generation) - needs PDF to attach to email
- SQ-13 (Epic: Client Management) - needs client email

### Blocks

- EPIC 7 (Dashboard & Tracking) - sent status for filtering

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC 6)
- **SRS:** `.context/SRS/functional-specs.md` (FR-033 to FR-037)

---

_Documento parte del PBI de SoloQ_
_Última actualización: 2026-01-20_
