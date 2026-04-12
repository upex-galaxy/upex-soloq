# Exploratory Testing Session Notes - SQ-55

**Date:** 2026-04-12  
**Story:** SQ-55 - Payment Amount  
**Environment:** Staging (`https://staging-upexsoloq.vercel.app`)  
**Execution order:** smoke-test -> exploratory-test (UI) -> exploratory-api-test -> exploratory-db-test

---

## 1) Smoke Check

- App and invoices module loaded successfully.
- Authenticated session available for `demo@soloq.app`.
- Invoices list reachable and functional.

Status: **PASSED**

---

## 2) UI Exploratory (SQ-55)

### Scope validated

- Opened payment dialog from quick action on a `sent` invoice (`INV-2026-203783346`, total `$500.00`).
- Verified amount field prefill (`500`).
- Verified comparison feedback states in UI:
  - Partial (`400`) -> `Pago parcial: $400.00 de $500.00`
  - Overpayment (`550`) -> `Sobrepago: $550.00 excede el total de $500.00`
  - Exact (`500`) -> `Coincide con el total de la factura`
- Verified successful submit (`Confirmar Pago`) and immediate list refresh:
  - `Enviada: 1 -> 0`
  - `Pagada: 4 -> 5`

### Validation behavior observed

- `input[type=number]` blocks non-numeric text fill (`abc`) at control level.
- `0` and negative values can be typed in field, but no inline error text was displayed in this run.

Status: **PASSED with observations**

---

## 3) API Exploratory

### Evidence from network (UI submit)

- Request: `POST /api/invoices/a5039370-3ade-4e42-b6db-414d6876c1a1/payments`
- Status: `201`
- Request body:

```json
{
  "amount_received": 500,
  "payment_method": "bank_transfer",
  "payment_date": "2026-04-12",
  "notes": "QA exploratory run 2026-04-12"
}
```

### Additional API check

- Duplicate payment attempt on same invoice returned:
  - Status: `400`
  - Body: `{ "error": "Esta factura ya está pagada" }`

### Contract visibility check

- `openapi_list-api-endpoints` does not include `/invoices/{id}/payments` in current exposed spec list.
- Direct OpenAPI invocation for protected endpoint without auth returned `401`.

Status: **PASSED with observations**

---

## 4) DB Exploratory

Executed verification query for invoice `a5039370-3ade-4e42-b6db-414d6876c1a1`.

### Persisted correctly

- `invoices.status = 'paid'`
- `payments.amount_received = 500.00`
- `payments.payment_method = 'bank_transfer'`
- `payments.payment_date = 2026-04-12T03:00:00.000Z`
- `payments.notes = 'QA exploratory run 2026-04-12'`

### Potential inconsistencies found

- `invoices.paid_at` is `NULL` after successful payment.
- No `invoice_events` row with `event_type = 'paid'` found for this invoice (latest row remains `sent`).

Status: **ISSUES FOUND**

---

## 5) A11y / Quality finding (from manual evidence)

User-provided console + elements evidence confirms label association issue in payment form:

- Warning: `Incorrect use of <label for=FORM_ELEMENT>`
- Manual DOM check result:
  - `text: "Método de Pago"`
  - `for: "payment_method"`
  - `hasMatchingId: false`

Classification: **BUG (Visual/Content-A11y quality issue, non-blocking functional flow)**

---

## Decision Matrix Outcome (SQ-55)

| Gap | Result |
| --- | --- |
| Partial/overpayment warning behavior | PASS-DEFAULT (informative and non-blocking observed) |
| Prefill and formatting | PASS-DEFAULT (prefill and amount comparison messages shown) |
| Input normalization/validation | PO-DECISION (invalid-value UX message behavior still ambiguous in UI) |
| Data integrity post-submit | BUG (`paid_at` null and missing `paid` event) |

---

## Final QA Disposition

- SQ-55 amount behavior is largely working on staging for full/partial/over scenarios.
- At least two bugs should be tracked before closure:
  1. A11y label mismatch in payment form (`label[for]` not mapped to existing input `id`).
  2. Data consistency gap after payment submit (`invoices.paid_at` null, missing `invoice_events.paid`).
