# EPIC: Payment Tracking

**Jira Key:** [SQ-39](https://upexgalaxy64.atlassian.net/browse/SQ-39)
**Priority:** HIGH
**Phase:** Core Features (Sprint 6)
**Total Story Points:** 12

---

## Description

Registro de pagos recibidos y actualización de estado de facturas. Incluye método de pago, monto, fecha, notas y posibilidad de revertir.

## Business Value

Cierra el ciclo de facturación. Sin tracking de pagos, el usuario no puede saber qué facturas han sido cobradas ni generar reportes precisos de ingresos.

---

## User Stories (6)

| Key                                                      | Story                      | Points | Priority |
| -------------------------------------------------------- | -------------------------- | ------ | -------- |
| [SQ-53](https://upexgalaxy64.atlassian.net/browse/SQ-53) | Mark Invoice as Paid       | 2      | High     |
| [SQ-54](https://upexgalaxy64.atlassian.net/browse/SQ-54) | Record Payment Method Used | 2      | Medium   |
| [SQ-55](https://upexgalaxy64.atlassian.net/browse/SQ-55) | Record Payment Amount      | 2      | High     |
| [SQ-56](https://upexgalaxy64.atlassian.net/browse/SQ-56) | Add Payment Notes          | 2      | Low      |
| [SQ-57](https://upexgalaxy64.atlassian.net/browse/SQ-57) | Record Payment Date        | 2      | Medium   |
| [SQ-58](https://upexgalaxy64.atlassian.net/browse/SQ-58) | Revert Payment Status      | 2      | Low      |

---

## Technical Considerations

### Database Tables

```sql
-- payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50), -- bank_transfer, paypal, cash, crypto, other
  payment_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own payments"
ON payments FOR ALL USING (auth.uid() = user_id);
```

### Payment Logic

```typescript
interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'paypal' | 'cash' | 'crypto' | 'other';
  paymentDate: Date;
  notes?: string;
}

// When payment is recorded:
// 1. Create payment record
// 2. If amount >= invoice.total, set invoice.status = 'paid'
// 3. Update invoice.paid_at timestamp

// When payment is reverted:
// 1. Delete payment record
// 2. Recalculate total paid
// 3. If total paid < invoice.total, set invoice.status = 'sent' or 'overdue'
```

### API Endpoints

| Method | Endpoint                     | Description            |
| ------ | ---------------------------- | ---------------------- |
| POST   | `/api/invoices/:id/payments` | Record payment         |
| GET    | `/api/invoices/:id/payments` | Get payment history    |
| DELETE | `/api/payments/:id`          | Revert/delete payment  |
| PUT    | `/api/payments/:id`          | Update payment details |

---

## Dependencies

### Blocked By

- SQ-20 (Epic: Invoice Creation) - needs invoices to record payments

### Blocks

- EPIC 7 (Dashboard) - affects paid amounts in stats

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC 8)
- **SRS:** `.context/SRS/functional-specs.md` (FR-044 to FR-049)

---

_Documento parte del PBI de SoloQ_
_Última actualización: 2026-01-20_
