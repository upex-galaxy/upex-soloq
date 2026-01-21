# EPIC: Invoice Creation

**Jira Key:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20)
**Priority:** CRITICAL
**Phase:** Core Features (Sprint 3-4)
**Total Story Points:** 26

---

## Description

Creación y gestión de facturas. Incluye selección de cliente, líneas de items, cálculos automáticos, impuestos, descuentos, preview, numeración y fechas.

## Business Value

El core del producto. Sin la capacidad de crear facturas, SoloQ no tiene valor. Esta funcionalidad debe ser intuitiva, rápida y libre de errores de cálculo.

---

## User Stories (10)

| Key                                                      | Story                                    | Points | Priority |
| -------------------------------------------------------- | ---------------------------------------- | ------ | -------- |
| [SQ-21](https://upexgalaxy64.atlassian.net/browse/SQ-21) | Create Invoice by Selecting Client       | 3      | High     |
| [SQ-22](https://upexgalaxy64.atlassian.net/browse/SQ-22) | Add Line Items to Invoice                | 5      | High     |
| [SQ-23](https://upexgalaxy64.atlassian.net/browse/SQ-23) | Automatic Subtotal and Total Calculation | 3      | High     |
| [SQ-24](https://upexgalaxy64.atlassian.net/browse/SQ-24) | Add Taxes to Invoice                     | 2      | High     |
| [SQ-25](https://upexgalaxy64.atlassian.net/browse/SQ-25) | Add Discounts to Invoice                 | 2      | Medium   |
| [SQ-26](https://upexgalaxy64.atlassian.net/browse/SQ-26) | Preview Invoice Before Sending           | 3      | High     |
| [SQ-27](https://upexgalaxy64.atlassian.net/browse/SQ-27) | Assign Unique Invoice Number             | 2      | High     |
| [SQ-28](https://upexgalaxy64.atlassian.net/browse/SQ-28) | Set Invoice Due Date                     | 2      | High     |
| [SQ-29](https://upexgalaxy64.atlassian.net/browse/SQ-29) | Add Notes and Terms to Invoice           | 2      | Low      |
| [SQ-30](https://upexgalaxy64.atlassian.net/browse/SQ-30) | Save Invoice as Draft                    | 2      | Medium   |

---

## Technical Considerations

### Database Tables

```sql
-- invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  invoice_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_type VARCHAR(10), -- percentage, fixed
  discount_value DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  UNIQUE(user_id, invoice_number)
);

-- invoice_items table
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

| Method | Endpoint                          | Description           |
| ------ | --------------------------------- | --------------------- |
| GET    | `/api/invoices`                   | List all invoices     |
| POST   | `/api/invoices`                   | Create invoice        |
| GET    | `/api/invoices/:id`               | Get invoice details   |
| PUT    | `/api/invoices/:id`               | Update invoice        |
| DELETE | `/api/invoices/:id`               | Delete/cancel invoice |
| POST   | `/api/invoices/:id/items`         | Add line item         |
| PUT    | `/api/invoices/:id/items/:itemId` | Update line item      |
| DELETE | `/api/invoices/:id/items/:itemId` | Remove line item      |

---

## Dependencies

### Blocked By

- SQ-13 (Epic: Client Management) - needs clients to create invoices
- SQ-7 (Epic: Business Profile) - needs business data for invoice header

### Blocks

- EPIC 5 (PDF Generation)
- EPIC 6 (Invoice Sending)
- EPIC 7 (Dashboard & Tracking)
- EPIC 8 (Payment Tracking)

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC 4)
- **SRS:** `.context/SRS/functional-specs.md` (FR-018 to FR-027)

---

_Documento parte del PBI de SoloQ_
_Última actualización: 2026-01-20_
