# EPIC: Automatic Reminders (Pro Feature)

**Jira Key:** [SQ-40](https://upexgalaxy64.atlassian.net/browse/SQ-40)
**Priority:** MEDIUM
**Phase:** Pro Features (Sprint 7)
**Total Story Points:** 13

---

## Description

Sistema de recordatorios automáticos para facturas vencidas. Feature exclusiva para usuarios Pro. Incluye configuración de frecuencia, personalización de mensaje y historial.

## Business Value

Diferenciador clave de la suscripción Pro. Automatiza el cobro de facturas vencidas, mejorando significativamente la tasa de cobro sin esfuerzo manual.

---

## User Stories (5)

| Key                                                      | Story                                | Points | Priority |
| -------------------------------------------------------- | ------------------------------------ | ------ | -------- |
| [SQ-59](https://upexgalaxy64.atlassian.net/browse/SQ-59) | Automatic Overdue Invoice Reminders  | 5      | High     |
| [SQ-60](https://upexgalaxy64.atlassian.net/browse/SQ-60) | Configure Reminder Frequency         | 2      | High     |
| [SQ-61](https://upexgalaxy64.atlassian.net/browse/SQ-61) | Customize Reminder Message           | 2      | Medium   |
| [SQ-62](https://upexgalaxy64.atlassian.net/browse/SQ-62) | Pause Reminders for Specific Invoice | 2      | Medium   |
| [SQ-63](https://upexgalaxy64.atlassian.net/browse/SQ-63) | View Reminder History                | 2      | Low      |

---

## Technical Considerations

### Database Tables

```sql
-- reminder_settings table
CREATE TABLE reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  frequency_days INTEGER DEFAULT 7, -- send reminder every X days
  max_reminders INTEGER DEFAULT 3, -- stop after X reminders
  custom_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- invoice_reminders table
CREATE TABLE invoice_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  message_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, bounced, failed
  reminder_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- invoice reminder pause
ALTER TABLE invoices ADD COLUMN reminders_paused BOOLEAN DEFAULT false;
```

### Scheduled Job (Supabase Edge Function + Cron)

```typescript
// runs daily via pg_cron or external scheduler
async function processReminders() {
  // 1. Get all Pro users with reminders enabled
  // 2. For each user, find overdue invoices
  // 3. Check if reminder should be sent based on:
  //    - Last reminder date + frequency_days
  //    - reminder_number < max_reminders
  //    - reminders_paused = false
  // 4. Send reminder email
  // 5. Log to invoice_reminders table
}
```

### API Endpoints

| Method | Endpoint                             | Description                  |
| ------ | ------------------------------------ | ---------------------------- |
| GET    | `/api/settings/reminders`            | Get reminder settings        |
| PUT    | `/api/settings/reminders`            | Update reminder settings     |
| POST   | `/api/invoices/:id/pause-reminders`  | Pause reminders for invoice  |
| POST   | `/api/invoices/:id/resume-reminders` | Resume reminders for invoice |
| GET    | `/api/invoices/:id/reminder-history` | Get reminder history         |

### Pro Feature Gate

```typescript
// Middleware check
const requirePro = async (userId: string) => {
  const subscription = await getSubscription(userId);
  if (subscription?.plan !== 'pro') {
    throw new Error('This feature requires a Pro subscription');
  }
};
```

---

## Dependencies

### Blocked By

- SQ-37 (Epic: Invoice Sending) - uses same email infrastructure
- SQ-41 (Epic: Subscription Management) - needs Pro status check

### Blocks

- Nothing directly

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC 9)
- **SRS:** `.context/SRS/functional-specs.md` (FR-050 to FR-054)

---

_Documento parte del PBI de SoloQ_
_Última actualización: 2026-01-20_
