# EPIC: Invoice Dashboard & Tracking

**Jira Key:** [SQ-38](https://upexgalaxy64.atlassian.net/browse/SQ-38)
**Priority:** HIGH
**Phase:** Core Features (Sprint 5-6)
**Total Story Points:** 14

---

## Description

Panel de control para visualizar y gestionar el estado de las facturas. Incluye filtros, totales pendientes, facturas vencidas destacadas y búsqueda.

## Business Value

Proporciona visibilidad del estado financiero del freelancer. Sin un dashboard, el usuario no puede gestionar eficientemente sus facturas ni priorizar cobros.

---

## User Stories (6)

| Key                                                      | Story                               | Points | Priority |
| -------------------------------------------------------- | ----------------------------------- | ------ | -------- |
| [SQ-47](https://upexgalaxy64.atlassian.net/browse/SQ-47) | View Invoice Dashboard              | 3      | High     |
| [SQ-48](https://upexgalaxy64.atlassian.net/browse/SQ-48) | Filter Invoices by Status           | 2      | High     |
| [SQ-49](https://upexgalaxy64.atlassian.net/browse/SQ-49) | See Total Pending Amount            | 2      | High     |
| [SQ-50](https://upexgalaxy64.atlassian.net/browse/SQ-50) | See Overdue Invoices Highlighted    | 2      | High     |
| [SQ-51](https://upexgalaxy64.atlassian.net/browse/SQ-51) | Search Invoices by Client or Number | 3      | Medium   |
| [SQ-52](https://upexgalaxy64.atlassian.net/browse/SQ-52) | See Monthly Income Summary          | 2      | Medium   |

---

## Technical Considerations

### Dashboard Components

```typescript
interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  overdueCount: number;
  paidThisMonth: number;
  sentThisMonth: number;
}

interface InvoiceFilters {
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  clientId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string; // client name or invoice number
}
```

### Database Queries

```sql
-- Dashboard stats view
CREATE VIEW dashboard_stats AS
SELECT
  user_id,
  COUNT(*) as total_invoices,
  COALESCE(SUM(total), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN status = 'sent' THEN total ELSE 0 END), 0) as pending_amount,
  COALESCE(SUM(CASE WHEN status = 'sent' AND due_date < CURRENT_DATE THEN total ELSE 0 END), 0) as overdue_amount,
  COUNT(CASE WHEN status = 'sent' AND due_date < CURRENT_DATE THEN 1 END) as overdue_count,
  COALESCE(SUM(CASE WHEN status = 'paid' AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', CURRENT_DATE) THEN total ELSE 0 END), 0) as paid_this_month
FROM invoices
GROUP BY user_id;

-- Overdue status update (scheduled job)
UPDATE invoices
SET status = 'overdue'
WHERE status = 'sent'
  AND due_date < CURRENT_DATE;
```

### API Endpoints

| Method | Endpoint                         | Description                  |
| ------ | -------------------------------- | ---------------------------- |
| GET    | `/api/dashboard/stats`           | Get dashboard statistics     |
| GET    | `/api/invoices?status=&search=`  | List invoices with filters   |
| GET    | `/api/dashboard/monthly-summary` | Get monthly income breakdown |

---

## Dependencies

### Blocked By

- SQ-20 (Epic: Invoice Creation) - needs invoices to display
- SQ-37 (Epic: Invoice Sending) - needs sent status

### Blocks

- Nothing directly

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC 7)
- **SRS:** `.context/SRS/functional-specs.md` (FR-038 to FR-043)

---

_Documento parte del PBI de SoloQ_
_Última actualización: 2026-01-20_
