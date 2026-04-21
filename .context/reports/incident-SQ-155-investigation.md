# Incident Investigation: SQ-155

## Metadata
- **Key:** SQ-155
- **Type:** Bug
- **Priority:** High
- **Status:** In Review
- **Assignee:** Maxe Aguilera
- **Reporter:** (not exposed in `--json` payload; reporter of the bug flagged it during exploratory testing of SQ-4 on staging — reporter identity likely the QA tester who ran SQ-4 exploratory)
- **Sprint:** SoloQ Sprint 2
- **Linked US/items / PRs:**
  - Related story: `SQ-4` (Password Recovery via Email)
  - Related ticket: `SQ-84`
  - Fix branch: `fix/SQ-155/rate-limit-generic-response`
  - PR: https://github.com/upex-galaxy/upex-soloq/pull/83 (status: **MERGED**)
  - Fix commit on staging: `e84b5ff` / merge commit `d7a2c83`

## Summary
The `/api/auth/forgot-password` endpoint violated the anti-enumeration pattern: when the per-email rate limit was exceeded (4th consecutive request for the same email within the hour), the server returned HTTP 429 with a specific error body, whereas normal calls returned HTTP 200 with a generic success message. An attacker could use this deterministic divergence to confirm that an email was being actively processed by the system, enabling account enumeration despite the masking on the success path. A fix has already been merged to `staging`.

## Context
### Feature affected
- **User story / feature:** EPIC-SQ-1 (User Auth & Onboarding) → STORY-SQ-4 (Password Recovery via Email) → endpoint `POST /api/auth/forgot-password` + UI route `/(auth)/forgot-password`.
- **Business impact:** Security. Account enumeration primitive in a sensitive auth flow. Breaks the documented acceptance criteria FT-SQ4-01 / FT-SQ4-02 / FT-SQ4-04 that require indistinguishable responses for existing vs. non-existing emails. Not a data-integrity issue; does not block functionality, but compromises privacy and is a pre-condition for targeted credential-stuffing / phishing campaigns.

### Reporter observations
Found during **exploratory testing of SQ-4** in staging. Reporter ran the following (from Jira description):
1. Open `/forgot-password` in staging.
2. Enter the **same valid email** repeatedly.
3. Submit **4 consecutive requests within the same rate-limit window**.
4. On the 4th attempt the UX changes: a specific error state is displayed instead of the generic success confirmation.

Technical notes attached to the ticket:
- Archivo señalado: `src/app/api/auth/forgot-password/route.ts` + UI `/forgot-password`.
- Network: `POST /api/auth/forgot-password` returns **HTTP 429** on the 4th attempt.
- Console: associated 429 error message visible.
- DB: no persistence observed in `public.email_logs` for password-recovery requests (rate-limit state is in-memory, not DB-backed).

Impact bullets from the ticket:
- Flow switches to explicit error state instead of keeping a generic consistent response.
- Introduces a security/UX inconsistency in a sensitive authentication flow.
- Affects users (and attackers) who repeat recovery requests in a short window.

## Related files / code
- **Backend route handler (primary):** `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/api/auth/forgot-password/route.ts`
  - In-memory maps `ipRequestCounts` (20/min) and `emailRequestCounts` (3/hour) at lines 12–13.
  - `checkEmailRateLimit` at lines 41–57 (returns false on 4th hit per normalized email).
  - **Affected branch (current staging, post-fix):** lines 100–109 — when `checkEmailRateLimit` returns false the handler now applies a random 0–200 ms delay and returns the same `HTTP 200` + `{ success: true, message: "Si existe una cuenta con este email..." }` body as the happy path.
  - Happy path: lines 121–135 — `supabase.auth.resetPasswordForEmail(...)` call then identical 200 response.
  - IP rate-limit still returns `HTTP 429` at lines 82–87 (unchanged; does not leak email-specific info).
- **UI form:** `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/(auth)/forgot-password/page.tsx`
  - Submission logic lines 44–91: on `response.status === 429` the UI shows the destructive alert "Has realizado demasiadas solicitudes. Intenta más tarde." (lines 73–77). After the fix, this branch is only reachable via IP-based rate-limit, not email-based.
  - Success view lines 94–128 with email masked via `maskEmail` helper (lines 21–29) — this is what should be rendered for every happy-path/email-rate-limited request.
- **Story + AC:** `.context/PBI/epics/EPIC-SQ-1-user-auth-onboarding/stories/STORY-SQ-4-password-recovery/story.md` and `implementation-plan.md` document FT-SQ4-01/02/04/05a/05b (anti-enumeration + rate-limit requirements).

### Pre-fix faulty snippet (from commit `e84b5ff` / PR #83 context)
Before the fix the email rate-limit branch was:

```
if (!checkEmailRateLimit(normalizedEmail)) {
  return NextResponse.json(
    { error: 'Demasiadas solicitudes para este email.' },
    { status: 429 }
  );
}
```

— specific error string + distinct status code, despite the comment claiming it returned a "generic message".

## Reproduction attempt
### Steps
1. Navigate to `https://staging-upexsoloq.vercel.app/forgot-password`.
2. Enter a valid-format email (existing or non-existing — the bug is observable regardless).
3. Submit the form 3 times; each attempt returns `HTTP 200` with the generic "Si existe una cuenta..." confirmation UI (with masked email).
4. Submit a 4th time **within the same 1-hour window for that normalized email**.
5. Observe the response.

### Result
- **Reproduced: NOT-APPLICABLE (already fixed on staging).**
- The fix (`e84b5ff`, merged via PR #83 `d7a2c83`) is already on the `staging` branch, so a live attempt against the staging environment will no longer reproduce the original behavior. The defect is, however, fully documented by the code that was removed in the fix commit and by the merged-PR body which enumerates the exact difference (HTTP 200 vs HTTP 429 + distinct error body).
- Evidence of original behavior (pre-fix):
  - Normal call → `HTTP 200` + `{"success": true, "message": "Si existe una cuenta con este email, enviamos un link de recuperación."}`
  - Rate-limited call (4th attempt / same email / <1h) → `HTTP 429` + `{"error": "Demasiadas solicitudes para este email."}`
  - The two responses differ in status code, body shape (`success` vs `error`), and message — a distinguisher that trivially exceeds noise thresholds even without timing analysis.
- Evidence of current (post-fix) behavior on staging, per `src/app/api/auth/forgot-password/route.ts` lines 100–109:
  - Rate-limited call → `HTTP 200` + same body as happy path, gated behind a random 0–200 ms delay consistent with the success path (line 130).

### Data seed (if any)
None. The rate-limit counters live in an in-memory `Map` (not DB), so no seed data was required. No `public.email_logs` rows are written by the recovery flow (confirmed by ticket's "no persistence observable" note).

## In-flight fix (since status is In Review)
A PR has already been **merged** to `staging`:
- **PR #83** — `fix(SQ-155): mask rate-limit response in forgot-password flow`
- **Branch:** `fix/SQ-155/rate-limit-generic-response`
- **Commit on staging:** `e84b5ff` (merge: `d7a2c83`)
- **Diff scope:** 1 file, 7 insertions / 6 deletions — all inside `checkEmailRateLimit` consequence branch.

What the fix does:
1. Replaces the `HTTP 429 + specific error` response with the same `HTTP 200 + generic success` JSON as the happy path.
2. Adds a random 0–200 ms delay (mirroring the one already applied on the success path) so a timing-based distinguisher is also neutralized.
3. Leaves the IP-level rate limit untouched (still `HTTP 429`) — correctly, because it is per-IP, not per-email, and therefore does not leak email-existence information.
4. The ticket status of **In Review** appears to correspond to the QA review stage of the already-merged fix (workflow: the fix PR has merged to `staging`, the issue now needs QA sign-off).

Sufficiency assessment: **Yes, sufficient for the reported defect.** The change closes the enumeration gap both in body/status and in timing. A residual consideration (not a regression, but a hardening opportunity) is noted below under "Additional notes".

## Root Cause
**Classification:** code-defect (security / information disclosure).

The original implementation (shipped in the initial SQ-4 rollout, commit `0e3484e` / merge `71c1e3e`) had a mismatch between **the code's comment intent** and **the code's actual behavior**. The comment above the `checkEmailRateLimit` branch stated "Return same generic message to prevent enumeration", but the `NextResponse.json(...)` call returned a distinct payload (`{ error: "Demasiadas solicitudes para este email." }`) with a distinct status code (`429`). That violated the anti-enumeration invariant the rest of the route already enforced (generic 200 with `supabase.auth.resetPasswordForEmail` that does not distinguish existing vs non-existing accounts, plus a 0–200 ms random timing delay on the success path).

Mechanics of the enumeration primitive:
- An attacker submits 3 requests for a target email. All three return `200`/success.
- The 4th request's response reveals the server recognized and processed the email as a "real candidate" (i.e., it reached the per-email counter). Whether the account exists or not, the simple fact that an attacker can trigger the 429 with a given email value confirms that email is being actively funneled into `resetPasswordForEmail`, which — combined with Supabase auth side-channels (email delivery timing observed externally) — tightens an enumeration attack. Even in isolation, the response shape divergence breaks the "all responses must be indistinguishable" security invariant required by SQ-4 AC FT-SQ4-01/02/04.

Why it was missed: the defensive comment created a false sense of correctness during code review; no automated test asserted "response body equality" across happy-path vs. rate-limited paths; the rate-limit test case (FT-SQ4-05b) likely only checked "blocks after N requests" without asserting response shape.

## Decision
**Verdict:** FIX (already landed)
**Justification:** The defect is real, reproducible by design (in-memory counter + Jira's 4-attempt repro steps), and has clear security impact. A minimal, targeted fix has already been merged to `staging` (PR #83). The ticket should move through QA verification on staging and close. No additional code change required to close this specific defect.
**Jira custom field suggestion (Root Cause):** `code-defect`

## Recommended fix
*(Describes what was done and what still could be hardened.)*

- **Scope:** xs (already implemented — 1 file, 13 LOC net change)
- **Files to touch:** `src/app/api/auth/forgot-password/route.ts` (done)
- **Approach:** generic 200 JSON identical to happy-path + random 0–200 ms delay on the email rate-limit branch (done); IP rate-limit left returning 429 (correct — per-IP, not per-email).
- **Edge cases covered:**
  - Per-email limit exceeded for an **existing** account → indistinguishable from success.
  - Per-email limit exceeded for a **non-existing** account → indistinguishable from success.
  - Per-IP abuse burst (>20/min) → still returns 429 (intentional — no email context in the throttle key).
  - Invalid payload / schema violation → still returns 400 with generic "Email inválido." (acceptable — does not depend on account existence).
  - Supabase call failing → caught by `try/catch`, returns generic 500 "Ocurrió un error. Intenta de nuevo." (already in place).
- **Tests needed (to prevent regression):**
  - Unit/integration test for `POST /api/auth/forgot-password` that issues N+1 requests for the same email and asserts **exact response body equality** (status, JSON shape, message string) between the Nth and (N+1)th calls.
  - Timing-variance assertion: measure latency distribution of happy-path vs rate-limited path within a tolerance band (both should be dominated by the `0–200 ms` random delay; neither should be consistently faster/slower).
  - Playwright E2E for `(auth)/forgot-password` verifying UI shows the **same** confirmation card (`data-testid="forgot-password-confirmation"`) and never the destructive alert when only email-level throttling is triggered.
  - Negative control: burst 20+ requests from the same IP and assert the UI does show the 429-style destructive alert (proves IP path is still enforced).

## Additional notes
- **In-memory rate-limit counters won't survive multi-instance deploys.** The maps at lines 12–13 are module-local; on Vercel serverless / multi-region a request may hit a warm instance where the counter is not yet populated, effectively raising the real-world per-email cap beyond 3/hour. This is not the SQ-155 defect, but it's worth tracking separately as a hardening item (move to Redis, Upstash, or a Supabase-backed table — the top-of-file comment already flags this as "in-memory for MVP").
- **Schema failures return `400` with `"Email inválido."`.** This is also a divergent response vs. the generic 200 success, but it leaks only "the input was not a valid email string" — not "this email exists" — so it's acceptable. Worth keeping in mind when auditing.
- **Context from other auth bugs already closed:** SQ-98, SQ-99, SQ-86 — these are part of the broader auth-hardening cluster in EPIC-SQ-1. SQ-155 fits the same pattern (UX/security inconsistency found during exploratory testing of auth flows). Recommend a cross-cutting code-review checklist item: "For every auth endpoint, every failure branch must produce an output byte-for-byte indistinguishable from the success branch (or be strictly input-shape validation, not account-existence dependent)."
- **Sentry / Supabase auth logs** were not queried here (the fix is already merged and the incident is well-documented by the ticket + PR + diff); a short runbook step for QA verification on staging is to re-run the 4-attempt repro and confirm (a) the browser shows the masked-email confirmation card on all four attempts, and (b) the network tab shows `200` on all four responses with identical JSON bodies.
