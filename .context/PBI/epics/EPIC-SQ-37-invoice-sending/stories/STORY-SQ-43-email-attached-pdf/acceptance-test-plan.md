## Acceptance Test Plan - Generated 2026-02-09

**QA Engineer:** AI-Generated
**Status:** Draft - Pending PO/Dev Review

---

# Acceptance Test Plan: STORY-SQ-43 - Include PDF Attachment in Email

**Fecha:** 2026-02-09
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-43
**Epic:** EPIC-SQ-37 - Invoice Sending
**Status:** Draft

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos - needs professional invoices sent with no manual steps
- **Secondary:** Valentina - wants reliable sending so clients can pay on time

**Business Value:**

- **Value Proposition:** Email includes PDF so the client receives the invoice without extra steps
- **Business Impact:** Supports KPI for invoices sent by email and reduces time to first invoice

**Related User Journey:**

- Journey: J1 Registro y Primera Factura
- Step: Step 13-14 (send invoice and confirm sending)

---

### Technical Context of This Story

**Architecture Components:**

**Frontend:**

- Components: Invoice detail send action, invoice list quick send, email preview modal
- Pages/Routes: /invoices, /invoices/[id]
- State Management: React state + server actions

**Backend:**

- API Endpoints: POST /api/invoices/{invoiceId}/send, GET /api/invoices/{invoiceId}/pdf
- Services: PDF generator (@react-pdf/renderer), email sender (Resend)
- Database: invoices, invoice_items, business_profiles, clients, payment_methods, email_logs, invoice_events

**External Services:**

- Resend API (email send)
- Supabase Storage (optional PDF cache)

**Integration Points:**

- Frontend to Backend API (send invoice)
- Backend to PDF generator (create attachment)
- Backend to Resend (send email with attachment)
- Backend to DB (email_logs, invoice_events, invoice status)
- Backend to Storage (optional cache)

---

### Story Complexity Analysis

**Overall Complexity:** Medium

**Complexity Factors:**

- Business logic complexity: Medium - attachment rules + naming + size
- Integration complexity: Medium - PDF generator + Resend + DB logging
- Data validation complexity: Medium - size limits, MIME type, naming
- UI complexity: Low - relies on existing send flow

**Estimated Test Effort:** Medium
**Rationale:** Multiple integration points and file constraints to validate

---

### Epic-Level Context (From Feature Test Plan in Jira)

**Critical Risks Already Identified at Epic Level:**

- Risk 1: PDF generation/attachment failure
  - **Relevance to This Story:** Directly impacts attachment creation and send success
- Risk 2: State inconsistencies on retries
  - **Relevance to This Story:** Failed attachment should not mark invoice as sent

**Integration Points from Epic Analysis:**

- Frontend to/from Backend API (send)
  - **Applies to This Story:** Yes
  - **If Yes:** User triggers send and backend attaches PDF
- Backend to/from PDF Generator
  - **Applies to This Story:** Yes
  - **If Yes:** Attachment buffer is generated before sending
- Backend to/from Resend API
  - **Applies to This Story:** Yes
  - **If Yes:** Attachment is sent via Resend
- Backend to/from Database (invoices, email_logs, invoice_events)
  - **Applies to This Story:** Yes
  - **If Yes:** Log send attempt and update invoice status
- Resend Webhooks to/from Backend (delivery status)
  - **Applies to This Story:** No

**Critical Questions Already Asked at Epic Level:**

**Questions for PO:**

- Subject/message limits
  - **Status:** Not Relevant to This Story
  - **Impact on This Story:** None
- Quick send vs personalization
  - **Status:** Not Relevant to This Story
  - **Impact on This Story:** None
- Sent vs delivered semantics
  - **Status:** Not Relevant to This Story
  - **Impact on This Story:** None

**Questions for Dev:**

- Missing endpoints in OpenAPI (/email-status, /webhooks/resend)
  - **Status:** Not Relevant to This Story
  - **Impact on This Story:** None
- Payment methods structure
  - **Status:** Not Relevant to This Story
  - **Impact on This Story:** None

**Test Strategy from Epic:**

- Test Levels: Unit, Integration, E2E, API
- Tools: Playwright, Postman/Newman, Vitest/Jest
- **How This Story Aligns:** Requires Integration (PDF generator + Resend) and E2E send flow validation

**Updates and Clarifications from Epic Refinement:**

- No updates found after initial Feature Test Plan comment

**Summary: How This Story Fits in Epic:**

- **Story Role in Epic:** Adds the PDF attachment requirement to the send flow
- **Inherited Risks:** PDF generation/attachment failure and state consistency
- **Unique Considerations:** Attachment naming and size limit enforcement

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Attachment filename format

- **Location in Story:** Scenario 2 (Attachment name)
- **Question for PO/Dev:** Should the filename be `Invoice-{invoiceNumber}.pdf` or `{invoiceNumber}.pdf` as per FR-018 content-disposition example?
- **Impact on Testing:** Cannot assert exact filename without clarity
- **Suggested Clarification:** Align story with FR-018 naming or update FR-018 example

**Ambiguity 2:** Size limit definition and enforcement

- **Location in Story:** Scenario 3 (Attachment size under 5MB)
- **Question for PO/Dev:** Is 5MB limit applied to raw PDF size or base64 payload size, and what should happen when it exceeds?
- **Impact on Testing:** Cannot validate failure behavior without expected error and status
- **Suggested Clarification:** Define size threshold and expected error (code + UI copy)

**Ambiguity 3:** Where PDF is generated (server vs client)

- **Location in Story:** Technical Notes
- **Question for Dev:** Is PDF always generated server-side for sending, or can client-side generation be used?
- **Impact on Testing:** Affects how we validate attachment generation and error handling
- **Suggested Clarification:** Prefer server-side generation to ensure consistency

---

### Missing Information / Gaps

**Gap 1:** Error handling for PDF generation failure

- **Type:** Acceptance Criteria / Technical Details
- **Why It's Critical:** We need expected status code, UI message, and DB updates
- **Suggested Addition:** Define error response and UI message when PDF generation fails
- **Impact if Not Added:** Inconsistent UX and unclear test assertions

**Gap 2:** Error handling for attachment size limit exceeded

- **Type:** Acceptance Criteria / Business Rule
- **Why It's Critical:** Must know if send is blocked or retried
- **Suggested Addition:** Define expected behavior and error code when PDF exceeds 5MB
- **Impact if Not Added:** Risk of silent failure or unexpected invoice status changes

---

### Edge Cases NOT Covered in Original Story

**Edge Case 1:** Large logo + many items produces PDF over 5MB

- **Scenario:** Invoice with high-res logo and 100+ items
- **Expected Behavior:** Send is blocked, clear error shown, invoice remains draft
- **Criticality:** High
- **Action Required:** Add to story and test cases

**Edge Case 2:** PDF generation returns empty/0 bytes

- **Scenario:** PDF generator error or template failure
- **Expected Behavior:** Send fails with error, no email sent
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 3:** Invoice number contains special characters

- **Scenario:** Invoice number contains spaces or slashes
- **Expected Behavior:** Filename is sanitized to a safe format
- **Criticality:** Low
- **Action Required:** Ask PO/Dev to confirm expected behavior

---

### Testability Validation

**Is this story testable as written?** Partially

**Testability Issues:**

- Expected results are not specific enough
- Missing error scenarios
- Missing performance criteria (size limit enforcement)
- Cannot be tested in isolation (depends on PDF generator and Resend)

**Recommendations to Improve Testability:**

- Define exact filename pattern and error responses
- Define size limit enforcement behavior and UI copy
- Confirm PDF generation location (server-side preferred)

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: PDF attachment included on send

**Type:** Positive
**Priority:** Critical

- **Given:**
  - User is authenticated with a business profile and at least one payment method
  - Invoice exists in status `draft` with number `INV-2026-0042` and 3 items
  - Client has a valid email address

- **When:**
  - User sends the invoice via the send action (UI or API)

- **Then:**
  - Email is sent with exactly one PDF attachment
  - Attachment MIME type is `application/pdf`
  - Invoice status becomes `sent`
  - `invoice_events` includes a `sent` event
  - `email_logs` records the send attempt

---

### Scenario 2: Attachment filename uses invoice number

**Type:** Positive
**Priority:** High

- **Given:** Client receives the email for invoice `INV-2026-0042`
- **When:** Client views the attachment
- **Then:** Filename matches `Invoice-INV-2026-0042.pdf` (requires PO/Dev confirmation)

---

### Scenario 3: Attachment size within limit

**Type:** Boundary
**Priority:** High

- **Given:** Invoice includes a logo and many items
- **When:** PDF is generated and attached
- **Then:** PDF size is at most 5MB and email send succeeds

---

### Scenario 4: Attachment opens correctly with all data

**Type:** Positive
**Priority:** High

- **Given:** Client downloads the attachment
- **When:** PDF is opened
- **Then:** PDF displays invoice number, client name, totals, and due date

---

### Scenario 5: PDF generation fails

**Type:** Negative
**Priority:** High

- **Given:** PDF generator fails (template or data error)
- **When:** User attempts to send the invoice
- **Then:**
  - Send fails with error response
  - No email is sent
  - Invoice status remains `draft`
  - Error message is shown to user (exact copy TBD)

---

### Scenario 6: PDF exceeds size limit

**Type:** Negative
**Priority:** High

- **Given:** PDF generated exceeds 5MB
- **When:** User attempts to send the invoice
- **Then:**
  - Send is blocked with a clear error response
  - No email is sent
  - Invoice status remains `draft`

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 10

**Breakdown:**

- Positive: 3
- Negative: 3
- Boundary: 2
- Integration: 1
- API: 1

**Rationale for This Number:**

Attachment requires validation of content, name, size, and failure paths across multiple integration points.

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** Yes

**Parametrized Test Group 1:** PDF size and content variability

- **Base Scenario:** Attachment size within limit
- **Parameters to Vary:** Logo size, item count, template type
- **Test Data Sets:**

| Logo Size | Item Count | Template | Expected Result        |
| --------- | ---------- | -------- | ---------------------- |
| 200KB     | 5          | basic    | Attachment at most 1MB |
| 1.5MB     | 25         | basic    | Attachment at most 5MB |
| 3MB       | 60         | basic    | Attachment at most 5MB |
| 4.5MB     | 80         | basic    | Attachment at most 5MB |

**Total Tests from Parametrization:** 4
**Benefit:** Covers size thresholds without duplicating setup steps

---

### Test Outlines

#### **Should attach PDF when sending invoice**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E
**Parametrized:** No

**Preconditions:**

- User with business profile and payment methods exists
- Client with email `client@example.com` exists
- Invoice `INV-2026-0042` exists in status `draft` with 3 items

**Test Steps:**

1. Open invoice detail for `INV-2026-0042`
2. Click `Send invoice`
3. Confirm send
4. Open the sent email in Resend sandbox or test inbox
   - **Verify:** Attachment is present

**Expected Result:**

- **UI:** Success confirmation shown
- **API Response:** 200 OK
- **Database:**
  - `invoices.status` = `sent`
  - `invoice_events` includes `sent`
  - `email_logs` has a new record

**Test Data:**

```json
{
  "invoiceNumber": "INV-2026-0042",
  "clientEmail": "client@example.com",
  "items": 3
}
```

**Post-conditions:**

- Invoice remains in sent state
- Email log record exists

---

#### **Should use invoice number in attachment filename**

**Related Scenario:** Scenario 2
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** No

**Preconditions:**

- Email was sent for invoice `INV-2026-0042`

**Test Steps:**

1. Open the sent email
2. Inspect attachment filename

**Expected Result:**

- **UI:** Attachment filename matches `Invoice-INV-2026-0042.pdf` (pending confirmation)

**Test Data:**

```json
{
  "expectedFilename": "Invoice-INV-2026-0042.pdf"
}
```

**Post-conditions:**

- None

---

#### **Should open PDF attachment with correct invoice data**

**Related Scenario:** Scenario 4
**Type:** Positive
**Priority:** High
**Test Level:** E2E
**Parametrized:** No

**Preconditions:**

- Email sent with PDF attachment for invoice `INV-2026-0042`

**Test Steps:**

1. Download the PDF attachment
2. Open the PDF
3. Verify invoice number, client name, total, due date

**Expected Result:**

- **UI:** PDF renders correctly and includes all required fields

**Test Data:**

```json
{
  "invoiceNumber": "INV-2026-0042",
  "clientName": "Ana Gomez",
  "total": "USD 1200.00",
  "dueDate": "2026-02-28"
}
```

**Post-conditions:**

- None

---

#### **Should attach PDF with correct MIME type**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** High
**Test Level:** Integration
**Parametrized:** No

**Preconditions:**

- Resend sandbox configured for staging
- Invoice exists in `draft`

**Test Steps:**

1. Send invoice via POST /api/invoices/{invoiceId}/send
2. Inspect email attachment metadata in Resend logs

**Expected Result:**

- **API Response:** 200 OK
- **Integration:** Attachment content type is `application/pdf`

**Test Data:**

```json
{
  "invoiceId": "uuid-of-invoice"
}
```

**Post-conditions:**

- Email log record exists

---

#### **Should keep attachment size under 5MB for large logos**

**Related Scenario:** Scenario 3
**Type:** Boundary
**Priority:** High
**Test Level:** Integration
**Parametrized:** Yes (Group 1)

**Preconditions:**

- Invoice with large logo and many items exists

**Test Steps:**

1. Send invoice via UI or API
2. Check attachment size in email logs or Resend metadata

**Expected Result:**

- **Integration:** Attachment size at most 5MB
- **System State:** Invoice marked as sent

**Test Data:**

```json
{
  "logoSizeKb": 1500,
  "itemCount": 25
}
```

**Post-conditions:**

- Invoice remains in sent state

---

#### **Should accept attachment size at limit (at most 5MB)**

**Related Scenario:** Scenario 3
**Type:** Boundary
**Priority:** Medium
**Test Level:** Integration
**Parametrized:** Yes (Group 1)

**Preconditions:**

- Invoice with near-limit PDF setup exists

**Test Steps:**

1. Send invoice
2. Verify attachment size is just under limit

**Expected Result:**

- **Integration:** Attachment size at most 5MB
- **UI:** Success confirmation shown

**Test Data:**

```json
{
  "logoSizeKb": 4500,
  "itemCount": 80
}
```

**Post-conditions:**

- Invoice remains in sent state

---

#### **Should block send when PDF exceeds size limit**

**Related Scenario:** Scenario 6
**Type:** Negative
**Priority:** High
**Test Level:** Integration
**Parametrized:** No

**Preconditions:**

- Invoice setup produces PDF over 5MB

**Test Steps:**

1. Attempt to send invoice
2. Observe API response and UI message

**Expected Result:**

- **API Response:** 400 or 413 with error code `PDF_TOO_LARGE` (TBD)
- **UI:** Error message shown
- **Database:** No `sent` event, invoice remains `draft`

**Test Data:**

```json
{
  "logoSizeKb": 6000,
  "itemCount": 120
}
```

**Post-conditions:**

- No email log record

---

#### **Should fail send when PDF generation returns empty file**

**Related Scenario:** Scenario 5
**Type:** Negative
**Priority:** High
**Test Level:** Integration
**Parametrized:** No

**Preconditions:**

- PDF generator returns empty buffer (mock or forced error)

**Test Steps:**

1. Attempt to send invoice
2. Observe API response and UI message

**Expected Result:**

- **API Response:** 500 with error code `PDF_GENERATION_FAILED` (TBD)
- **UI:** Error message shown
- **Database:** No `sent` event, invoice remains `draft`

**Test Data:**

```json
{
  "invoiceId": "uuid-of-invoice"
}
```

**Post-conditions:**

- No email log record

---

#### **Should return correct headers for invoice PDF endpoint**

**Related Scenario:** Scenario 2
**Type:** API
**Priority:** Medium
**Test Level:** API
**Parametrized:** No

**Preconditions:**

- Invoice exists and belongs to user

**Test Steps:**

1. Call GET /api/invoices/{invoiceId}/pdf
2. Inspect response headers and file name

**Expected Result:**

- **API Response:** 200 OK
- **Headers:**
  - `Content-Type: application/pdf`
  - `Content-Disposition` includes filename with invoice number

**Test Data:**

```json
{
  "invoiceId": "uuid-of-invoice"
}
```

**Post-conditions:**

- None

---

## Integration Test Cases (If Applicable)

### Integration Test 1: Backend to PDF Generator

**Integration Point:** API to PDF Generator
**Type:** Integration
**Priority:** High

**Preconditions:**

- PDF generator service available
- Invoice data includes business profile, client, items

**Test Flow:**

1. Trigger PDF generation during send
2. Verify PDF buffer returned is non-empty

**Expected Result:**

- PDF buffer generated with valid size and MIME type

---

### Integration Test 2: Backend to Resend (Attachment)

**Integration Point:** Backend to Resend API
**Type:** Integration
**Priority:** High

**Mock Strategy:**

- Mock Resend in automated tests
- Validate real sending in staging with sandbox

**Test Flow:**

1. Send email with PDF attachment
2. Confirm Resend accepts the payload

**Expected Result:**

- Resend returns success and attachment is visible in logs

---

## Edge Cases Summary

| Edge Case                       | Covered in Original Story? | Added to Refined AC? | Test Case                                               | Priority |
| ------------------------------- | -------------------------- | -------------------- | ------------------------------------------------------- | -------- |
| PDF over 5MB                    | No                         | Yes (Scenario 6)     | Should block send when PDF exceeds size limit           | High     |
| Empty PDF                       | No                         | Yes (Scenario 5)     | Should fail send when PDF generation returns empty file | Medium   |
| Special chars in invoice number | No                         | No (needs PO/Dev)    | TBD                                                     | Low      |

---

## Test Data Summary

### Data Categories

| Data Type       | Count | Purpose        | Examples                                         |
| --------------- | ----- | -------------- | ------------------------------------------------ |
| Valid data      | 3     | Positive tests | Draft invoice with 1-3 items, valid client email |
| Invalid data    | 2     | Negative tests | PDF over 5MB, empty PDF buffer                   |
| Boundary values | 2     | Boundary tests | PDF at ~4.5-5MB, many items                      |
| Edge case data  | 1     | Edge tests     | Invoice number with special chars                |

### Data Generation Strategy

**Static Test Data:**

- Invoice number: `INV-2026-0042`
- Client email: `client@example.com`

**Dynamic Test Data (using Faker.js):**

- User data: faker.internet.email(), faker.person.firstName()
- Numbers: faker.number.int({ min: 1, max: 120 })
- Dates: faker.date.soon()

**Test Data Cleanup:**

- All test data is cleaned up after test execution
- Tests are idempotent and do not depend on execution order

---

## Test Execution Tracking

**Test Execution Date:** TBD
**Environment:** Staging
**Executed By:** TBD

**Results:**

- Total Tests: 10
- Passed: TBD
- Failed: TBD
- Blocked: TBD

**Bugs Found:**

- TBD

**Sign-off:** TBD

---

## Action Required

**PO:**

- Review and answer critical questions (filename pattern, size limit behavior)
- Validate suggested story improvements

**Dev Lead:**

- Confirm PDF generation location (server-side)
- Define error codes and response for size/generation failures

**QA Team:**

- Review test cases for completeness
- Validate parametrization strategy and test data setup

---

**Next Steps:**

1. Team discusses critical questions and ambiguities
2. PO/Dev provide answers and clarifications
3. QA updates test cases based on feedback
4. Dev starts implementation with clear acceptance criteria

---

**Documentation:** Full test cases also available at:
`.context/PBI/epics/EPIC-SQ-37-invoice-sending/stories/STORY-SQ-43-email-attached-pdf/acceptance-test-plan.md`
