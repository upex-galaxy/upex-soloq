# Test Implementation Plan: SQ-211

> **Ticket**: [SQ-211: SQ-53: TC1: Validate successful mark-as-paid transition when invoice is sent](https://upexgalaxy67.atlassian.net/browse/SQ-211)
> **Type**: `integration`
> **Created**: 2026-05-11

---

## 1. Ticket Summary

**What to test:**
Validate that marking a `sent` invoice as paid updates invoice state and persists payment data.

**Acceptance Criteria (from ticket):**
1. Invoice status changes to `paid`.
2. Payment record is created.
3. `paid_at` timestamp is stored.

**Dependencies:**
- `SQ-53` (Story) - mark-as-paid feature.
- `SQ-196` (Test Set) - repository ticket for evidence grouping.

---

## 2. Architecture Decisions

| Decision | Value | Rationale |
|----------|-------|-----------|
| Component | `InvoicesApi.ts` | New integration domain component for invoice payment lifecycle |
| Fixture | `{ api }` | API-only validation, no UI required |
| Test file | `tests/integration/invoices/markAsPaid.test.ts` | Explicit and traceable naming |
| Preconditions | Inline API setup | Create client + sent invoice before register payment |

---

## 3. Existing vs New Assets

**Existing reusable pieces:**
- `AuthApi` with token propagation via `api-setup`.
- `ClientsApi` to create a valid client for invoice ownership.
- `ApiFixture` DI container.

**New assets required:**
- `api/schemas/invoices.types.ts` (OpenAPI facade for invoices/payments)
- `tests/components/api/InvoicesApi.ts` (ATC + helpers)
- `tests/integration/invoices/markAsPaid.test.ts` (SQ-211 scenario)
- `ApiFixture` registration for `invoices` component

---

## 4. Data Strategy

- Generate unique client email per run to avoid collisions.
- Create invoice with `status: "sent"`.
- Payment payload uses valid `paymentMethod`, `amountReceived`, `paymentDate`.
- No static IDs; all runtime IDs come from API responses.

---

## 5. Test Scenario Design

### Scenario 1 (Critical)

**Test name:**
`SQ-211: should mark sent invoice as paid and persist payment metadata`

**Flow:**
1. Create client (precondition).
2. Create invoice in `sent` state.
3. Register payment for that invoice.
4. Re-fetch invoice.

**Validation:**
- Register payment response returns `201`.
- Returned invoice has `status = paid`.
- Returned invoice has `paidAt`.
- Payment record exists and references invoice.

---

## 6. Tags and Traceability

- Test tags: `@integration`, `@critical`, `@regression`, `@sq-53`.
- ATC ID: `SQ-211` in `@atc('SQ-211')`.
- Evidence destination: `SQ-211` + repository ticket `SQ-196`.
