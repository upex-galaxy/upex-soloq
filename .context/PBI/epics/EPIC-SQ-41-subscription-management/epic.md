# EPIC: Subscription Management

**Jira Key:** [SQ-41](https://upexgalaxy64.atlassian.net/browse/SQ-41)
**Priority:** MEDIUM
**Phase:** Pro Features (Sprint 7-8)
**Total Story Points:** 10

---

## Description

Gestión de la suscripción del usuario (Free vs Pro). Incluye visualización de features Pro, upgrade, gestión de suscripción e historial de pagos.

## Business Value

Monetización del producto. Sin subscription management, no hay forma de generar ingresos recurrentes ni diferenciar usuarios Free de Pro.

---

## User Stories (4)

| Key                                                      | Story                             | Points | Priority |
| -------------------------------------------------------- | --------------------------------- | ------ | -------- |
| [SQ-64](https://upexgalaxy64.atlassian.net/browse/SQ-64) | View Pro Features and Limitations | 2      | High     |
| [SQ-65](https://upexgalaxy64.atlassian.net/browse/SQ-65) | Upgrade to Pro Subscription       | 3      | High     |
| [SQ-66](https://upexgalaxy64.atlassian.net/browse/SQ-66) | Manage Subscription (View/Cancel) | 3      | High     |
| [SQ-67](https://upexgalaxy64.atlassian.net/browse/SQ-67) | View Subscription Payment History | 2      | Medium   |

---

## Technical Considerations

### Payment Provider

- **Stripe** - Payment processing and subscription management
- Stripe Customer Portal for self-service

### Database Tables

```sql
-- subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan VARCHAR(20) DEFAULT 'free', -- free, pro
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, past_due, unpaid
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- subscription_history for audit
CREATE TABLE subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type VARCHAR(50), -- created, upgraded, downgraded, cancelled, renewed
  plan_before VARCHAR(20),
  plan_after VARCHAR(20),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_invoice_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own history"
ON subscription_history FOR SELECT
USING (subscription_id IN (SELECT id FROM subscriptions WHERE user_id = auth.uid()));
```

### Pro Features

```typescript
const PRO_FEATURES = {
  automaticReminders: true,
  customTemplates: true,
  unlimitedInvoices: true, // Free has limit of 10/month
  prioritySupport: true,
  exportReports: true,
};

const FREE_LIMITS = {
  invoicesPerMonth: 10,
  clients: 20,
  templates: 1, // classic only
};
```

### Stripe Webhooks

```typescript
// Webhook events to handle
type StripeWebhookEvent =
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.paid'
  | 'invoice.payment_failed';
```

### API Endpoints

| Method | Endpoint                     | Description                           |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/api/subscription`          | Get current subscription              |
| POST   | `/api/subscription/checkout` | Create Stripe checkout session        |
| POST   | `/api/subscription/portal`   | Create Stripe customer portal session |
| GET    | `/api/subscription/history`  | Get payment history                   |
| POST   | `/api/webhooks/stripe`       | Handle Stripe webhooks                |

---

## Dependencies

### Blocked By

- SQ-1 (Epic: User Authentication) - needs user account

### Blocks

- SQ-40 (Epic: Automatic Reminders) - Pro feature gate

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC 10)
- **SRS:** `.context/SRS/functional-specs.md` (FR-055 to FR-058)

---

_Documento parte del PBI de SoloQ_
_Última actualización: 2026-01-20_
