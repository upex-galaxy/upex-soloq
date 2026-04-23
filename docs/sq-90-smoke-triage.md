# SQ-90 Smoke Triage (Staging)

## Observed Failure

- Test: `SQ-90: TC1 Should create client with valid data`
- Error: `expect(received).toBeDefined()` where `matchingClient` is `undefined`
- Location: `qa/tests/e2e/clients/createClient.test.ts:27`
- Context: environment validation and UI authentication passed in the same run.

---

## Initial Classification

- **Type:** Functional inconsistency (create vs searchable/read consistency)
- **Severity (recommended):** Medium
- **Priority (recommended):** High
- **Environment:** Staging
- **Scope impact:** Client management flow (`SQ-90`) and smoke suite stability

Rationale:

- Not a platform outage (app/auth operational), so not Critical severity.
- Impacts reliability of an expected business flow and can mask regressions in CI smoke.
- Should be fixed quickly to keep smoke suite trustworthy.

---

## Blocking Decision for Current QA Stream

- **Decision:** Non-blocking for `SQ-55` and `SQ-51` exploratory work.
- **Condition:** continue with existing data where possible; if test setup requires new client creation, re-evaluate blocking status.

---

## Hypotheses to Verify (Dev/QA)

1. Eventual consistency delay after create before search index/list refresh.
2. Search query mismatch (`"Test Client"`) vs persisted canonical value.
3. Assertion expects exact `name + email` but response shape/value normalization differs.
4. Real backend/search defect in clients lookup endpoint.

---

## Evidence Checklist for Jira Bug

- Full failing test log (already captured).
- Create request payload and response body.
- Search request query and response payload immediately after create.
- Retest with short retry/backoff to confirm race condition.
- Screenshot/video of UI steps if reproducible manually.

---

## Next Recommended Actions

1. Open or update Jira bug for this regression with above evidence.
2. Add temporary retry/consistency guard in test only if product behavior allows eventual consistency.
3. Keep smoke suite green by isolating known flaky path until root cause is fixed.
