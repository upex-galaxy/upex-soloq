# Configure Payment Methods

**Jira Key:** [SQ-12](https://upexgalaxy64.atlassian.net/browse/SQ-12)
**Epic:** [SQ-7](https://upexgalaxy64.atlassian.net/browse/SQ-7) (Business Profile Management)
**Priority:** Highest
**Story Points:** 5
**Status:** Backlog
**Assignee:** Unassigned

---

## User Story

**As a** user
**I want to** configure my accepted payment methods
**So that** my clients know how to pay me

---

## Description

Como freelancer, necesito configurar los métodos de pago que acepto (transferencia bancaria, PayPal, MercadoPago, etc.) para que aparezcan en mis facturas. Esto facilita que mis clientes sepan exactamente cómo pueden pagarme, reduciendo fricción en el cobro.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Add bank transfer details

- **Given:** I am on payment methods configuration
- **When:** I add bank transfer with account details (bank name, account number, CLABE/CBU)
- **Then:** The bank details are saved

### Scenario 2: Add PayPal account

- **Given:** I am on payment methods configuration
- **When:** I add my PayPal email
- **Then:** The PayPal email is validated and saved

### Scenario 3: Add MercadoPago account

- **Given:** I am on payment methods configuration
- **When:** I add my MercadoPago alias or CVU
- **Then:** The MercadoPago details are saved

### Scenario 4: Add custom payment method

- **Given:** I am on payment methods configuration
- **When:** I add a custom payment method with name and instructions
- **Then:** The custom method is saved

### Scenario 5: Payment methods appear on invoice

- **Given:** I have configured payment methods
- **When:** I generate an invoice
- **Then:** All my active payment methods appear in the payment section

### Scenario 6: Require at least one payment method

- **Given:** I am trying to create an invoice
- **When:** I have no payment methods configured
- **Then:** I am prompted to add at least one payment method

### Scenario 7: Disable/enable payment method

- **Given:** I have multiple payment methods
- **When:** I toggle one as inactive
- **Then:** It no longer appears on new invoices but is not deleted

### Scenario 8: Delete payment method

- **Given:** I have a payment method I no longer use
- **When:** I delete it
- **Then:** It is permanently removed

---

## Technical Notes

### Frontend

- List of configured payment methods
- "Add Payment Method" modal/form
- Payment type selector with dynamic fields
- Toggle active/inactive
- Delete with confirmation
- Components: `PaymentMethodsList`, `PaymentMethodForm`, `PaymentMethodCard`
- Route: `/settings/payment-methods` or `/onboarding` (step 4)

### Backend

- API endpoints:
  - `GET /api/payment-methods` - List all
  - `POST /api/payment-methods` - Create
  - `PUT /api/payment-methods/:id` - Update
  - `DELETE /api/payment-methods/:id` - Delete

### Database

```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  details JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Payment Method Types & Fields

```typescript
type PaymentMethodType = 'bank_transfer' | 'paypal' | 'mercadopago' | 'other';

interface BankTransferDetails {
  bank_name: string;
  account_holder: string;
  account_number: string;
  routing_number?: string; // CLABE (MX), CBU (AR), etc.
  swift_code?: string;
}

interface PayPalDetails {
  email: string;
}

interface MercadoPagoDetails {
  alias?: string;
  cvu?: string;
}

interface OtherDetails {
  instructions: string;
}
```

---

## Dependencies

### Blocked By

- SQ-8 (Business Name) - profile must exist first

### Blocks

- EPIC 4 (Invoice Creation) - needs at least one payment method
- EPIC 5 (PDF Generation) - displays payment methods on invoice
- EPIC 6 (Invoice Sending) - includes payment info in email

### Related Stories

- SQ-6: Guided Onboarding (step 4 - at least one required)
- All invoice-related stories

---

## UI/UX Considerations

- Card-based list of payment methods
- Type icons (bank, PayPal, etc.)
- Active/inactive toggle switch
- Delete with confirmation dialog
- "Add" button opens modal
- Dynamic form based on type selection
- Drag to reorder (optional, v2)

---

## Definition of Done

- [ ] Payment methods list implemented
- [ ] Add payment method form (all types)
- [ ] Edit functionality working
- [ ] Delete with confirmation
- [ ] Toggle active/inactive
- [ ] API endpoints working
- [ ] At least one required validation
- [ ] Display on invoice working
- [ ] Unit tests > 80% coverage
- [ ] Integration tests for API
- [ ] E2E test for add/edit/delete flow
- [ ] Code review approved (2 reviewers)
- [ ] Deployed to staging
- [ ] QA testing passed

---

## Testing Strategy

See: `test-cases.md` (Fase 5)

**Test Cases Expected:** 12+ detailed test cases covering:

- Add bank transfer
- Add PayPal
- Add MercadoPago
- Add custom method
- Edit payment method
- Delete payment method
- Toggle active/inactive
- Require at least one
- Display on invoice

---

## Implementation Plan

See: `implementation-plan.md` (Fase 6)

**Implementation Steps Expected:**

1. Create payment_methods table and RLS
2. Create API routes (CRUD)
3. Create PaymentMethodsList component
4. Create PaymentMethodForm component (dynamic by type)
5. Create PaymentMethodCard component
6. Implement add/edit modal
7. Implement delete confirmation
8. Implement active toggle
9. Add validation for "at least one required"
10. Integrate with onboarding flow
11. Update invoice templates
12. Write tests

---

## Notes

- Bank details vary by country (CLABE for MX, CBU for AR, IBAN for international)
- MercadoPago is popular in LATAM
- Consider adding "copy to clipboard" for long account numbers
- Consider adding Wise, Payoneer in v2

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-7-business-profile/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-009)
