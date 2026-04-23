# Incident Investigation: SQ-74

## Metadata
- **Key:** SQ-74
- **Type:** Defect
- **Priority:** Highest
- **Status:** Open (stale — last RTX by tester reported "no longer reproducible" on 2026-03-31)
- **Assignee:** Ely (elyermad@gmail.com)
- **Reporter:** Joel Armando Ramirez Rodriguez (tester that executed RTX)
- **Sprint:** SoloQ Sprint 2 (active, ends 2026-03-30). Also present in SoloQ Sprint 1 (closed). Bug has been carried across sprints due to 5 failed fix attempts.
- **Linked US/items:** Blocks SQ-3 "User Login with Credentials" (Story, Ready For Release).

## Summary
User-reported logout failure after multiple rapid page refreshes has been debugged through 5 distinct fix attempts on `src/contexts/auth-context.tsx` (commits ca3d66f, 28e4f75, 61a7632, 2ab2001, f8de82b). Fix #5 (currently deployed on `staging`) consolidates auth bootstrap on `supabase.auth.onAuthStateChange` only, removing the competing `getUser()` call that was racing with Supabase's internal token refresh. The last tester RTX (2026-03-31) confirmed the bug is no longer reproducible in staging — the ticket is stale and can be moved to Ready For Release pending a final verification.

## Context
### Feature affected
- **User story:** SQ-3 "User Login with Credentials" (blocked by SQ-74).
- **Feature:** Session lifecycle — specifically the browser-side `AuthProvider` that hydrates `user`/`session` from Supabase cookies on every route mount and the `NavUser` component that renders the "Cerrar Sesion" dropdown option.
- **Business impact (security / session):** A logout that silently fails is a session-integrity risk. If a user clicks "Cerrar Sesion" and nothing happens, they may leave a shared machine believing the session is terminated while the Supabase refresh cookies still allow another user to regain authenticated access. Although the RTX on 2026-03-31 shows the failure no longer reproduces, the history of five regressions on the same flow means the logout path remains a high-sensitivity area.

### Reporter observations
Original description (2026-02-09):
> Prerequisites: user has created a new account.
> 1. Open https://staging-upexsoloq.vercel.app/
> 2. Click "Sign in" and log in with valid credentials.
> 3. Refresh the page several times until you see the username change to "Usuario".
> 4. Click the profile and click "Cerrar Sesion" — nothing happens / logout never completes.

Comment timeline (chronological):
- 2026-02-10 Ely (dev): Fix #1 merged (#41) — swapped `getSession()` for `getUser()` in auth-context.
- 2026-02-10 Joel (tester): RTX FAIL — still reproducible, attached video `RTX SQ-74.mp4`.
- 2026-03-01 … 2026-03-17: iterative comments about Fixes #2, #3, #4 — "TOKEN_REFRESHED not updating profile", "race condition showing 'Cargando…' or 'Usuario'", "skeleton never clearing". Commits 28e4f75, 61a7632, 2ab2001. Each RTX failed.
- 2026-03-18 Ely: Fix #5 merged (f8de82b) — removed the competing `getUser()` call; `onAuthStateChange` (`INITIAL_SESSION`) becomes the sole auth bootstrap; profile fetch wrapped in a 4s `Promise.race` with graceful degradation; safety timeout shortened from 8s to 5s; generation counter (`initGenRef`) added to ignore stale updates from unmounted effects.
- 2026-03-28 Ely: "Phase 8 Educational Feedback" comment summarising that Fix #5 resolved the race condition; 9/10 feedback to tester for persistent RTX.
- 2026-03-31 Joel (tester): RTX PASS — "ahora no es reproducible", but noted the landing shows the username after a brief extra delay (a few hundred ms), not a functional failure. Attached `Screen Recording 2026-03-31 at 7.13.22 PM.mov`.
- No status transition after the successful RTX — ticket remains "Open" because nobody moved it to Ready For Release.

## Related files / code
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/contexts/auth-context.tsx` — single source of auth state; the file the 5 fixes iterated on.
  - lines 121-134: `signOut` — clears local state synchronously before calling `supabase.auth.signOut()`, so the UI always transitions out even if the server call hangs or errors (critical behavior that unlocks the symptom).
  - lines 136-229: `useEffect` bootstrap — generation counter `initGenRef`, 5s safety timeout, `onAuthStateChange` as sole bootstrap, 4s `Promise.race` around `fetchUserProfile`.
  - lines 47-63: `fetchUserProfile` — parallel `profiles` / `business_profiles` / `subscription` queries (uses `maybeSingle()` — related SQ-76 fix).
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/components/layout/nav-user.tsx` — logout button handler.
  - lines 31-34: `handleSignOut` — awaits `signOut()` then routes to `/login`.
  - lines 37-57: `isLoading` branch — deliberately still renders a "Cerrar Sesion" button with `data-testid="logout-button-loading"` so the user can log out even while the auth state is still hydrating (SQ-74 mitigation).
  - lines 60-71: `!user` fallback — secondary recovery path that also surfaces a logout button when hydration finished but the user payload never arrived.
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/middleware.ts` — uses `supabase.auth.getUser()` (validated, not `getSession()`) so stale cookies are invalidated server-side on every navigation. Cookie `setAll` handler correctly rewrites both request and response cookies.
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/lib/supabase/client.ts` — thin wrapper around `createBrowserClient` (no customisation; relies on `@supabase/ssr` defaults for session persistence and token refresh).
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/lib/supabase/server.ts` — `createServer` for RSC/route handlers plus `createServerFromRequest` for Bearer-token fallback. Uses `cookies()` from `next/headers` with try/catch around `cookieStore.set` (expected path when called from RSC).
- `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/layout.tsx` — wraps the whole app in `<AuthProvider>` so the provider mounts once per full page load (and therefore once per refresh, which is what drove the race).
- Fix commits (in order): `ca3d66f` (Fix #1), `28e4f75` (Fix #2), `61a7632` (Fix #3), `2ab2001` (Fix #4), `f8de82b` (Fix #5 — current).

## Reproduction attempt
### Steps
1. Open staging (`https://staging-upexsoloq.vercel.app`).
2. Log in with a valid freelancer account.
3. Press F5 (hard refresh) 5–10 times in quick succession (<2s between refreshes) until the header shows the fallback "Usuario" label (the symptom was: header degrades to "Usuario" because the profile fetch never resolves).
4. Click the profile avatar → "Cerrar Sesion".
5. Expected: redirect to `/login`, cookies cleared. Bug: dropdown closes but the app stays on the dashboard, header still shows "Usuario", next navigation still authenticated.

### Result
- **Reproduced: NO (per tester RTX on 2026-03-31)** — classified as NEEDS-DATA from an investigator-local standpoint because I did not rerun the reproduction myself (READ-ONLY investigation constraint — no browser automation fired, no live Supabase data touched).
- Evidence:
  - Tester video `Screen Recording 2026-03-31 at 7.13.22 PM.mov` attached to the ticket (comment id 10061) showing the flow succeeding after Fix #5.
  - Commit `f8de82b` on `staging` matches the current file byte-for-byte, so the deployed artifact is the one the tester verified.
  - Code inspection confirms the two defensive properties that make the logout robust:
    1. `signOut` clears the React state *before* awaiting the server call (auth-context.tsx:122-133), so even if the Supabase HTTP call to revoke the refresh token hangs, React unmounts the authenticated UI and `router.push('/login')` fires from `nav-user.tsx:33`.
    2. `NavUser` always renders a "Cerrar Sesion" button during both the `isLoading` branch and the `!user` fallback (nav-user.tsx:37-71), so the user can never get stuck without a logout affordance.

### Data seed (if any)
None. No DB state is required to reproduce — the bug is purely a client-side React/Supabase timing issue. A generic signup + login with any `profiles` row is sufficient.

## Root Cause
The original root cause (Fixes #1–#4) was a **multi-layered race condition between two independent auth-bootstrap paths in the browser client**:

1. `AuthProvider` called `supabase.auth.getUser()` directly inside its mount effect to hydrate the cached session.
2. At the same time, `@supabase/ssr`'s internal listener (triggered by `createBrowserClient`) was firing `onAuthStateChange` with `INITIAL_SESSION` and `TOKEN_REFRESHED` events, each of which also tried to set React state.

On a rapid refresh (<2s between reloads) the cookie-stored refresh token was close to expiry, so Supabase's internal refresher was racing the manual `getUser()` call for the same refresh-token slot. Symptoms included:
- `getUser()` hanging past the 8s safety timeout → `isLoading` never dropping → skeleton stuck.
- `TOKEN_REFRESHED` updating `session` but not `user.profile`, so the header rendered with `user = { email: 'Usuario' }` stubs.
- React state from the stale effect (unmount ignored) writing after a newer effect had already run, resurrecting a stale `isAuthenticated: true` for a user that had no valid session.
- `signOut()` being queued while the in-flight `getUser()` held an auth mutex inside `gotrue-js` — the sign-out request would eventually fire, but the UI's React state updates were blocked behind the same mutex, so the click on "Cerrar Sesion" visually did nothing.

Fix #5 (f8de82b, currently on `staging`) addresses the root cause by making `onAuthStateChange` the **single source of truth** for auth state. It:
- Deletes the manual `getUser()` path. `INITIAL_SESSION` is emitted immediately upon subscription and delivers the same data, so there is no need for a second call.
- Adds `initGenRef` to tag each effect run with a monotonically increasing id, so stale writers from a previous mount/refresh cycle cannot clobber fresh state.
- Wraps `fetchUserProfile` in a 4s `Promise.race` so a slow profile query degrades to `{ profile: null }` but still flips `isAuthenticated: true`; the user can then log out normally.
- Makes `signOut()` clear local state **before** calling `supabase.auth.signOut()`, making the visible UX resilient even if the server-side revoke call errors or hangs.
- Reinforces the UI with a two-branch fallback in `NavUser` that always exposes a "Cerrar Sesion" affordance whether or not the provider has hydrated.

This matches the dev's own post-mortem in the "Phase 8" Jira comment and aligns with Supabase's recommendation to not combine `getUser()` / `getSession()` with `onAuthStateChange` in the browser.

## Decision
**Verdict:** NO-FIX (already fixed in staging by commit `f8de82b` / PR #42-class chain; ticket is stale — needs to be closed, not re-fixed). Secondary: NEEDS-INFO from the tester to formally sign off the RTX so the ticket can transition to Ready For Release.

**Justification:**
- Code on `staging` matches the intended Fix #5 implementation verbatim.
- The blocking story SQ-3 is already "Ready For Release" — if SQ-74 were still failing, SQ-3 would not have advanced.
- Tester's 2026-03-31 RTX explicitly states the bug is not reproducible anymore; the only lingering observation is a few-hundred-ms delay in first paint of the username, which is cosmetic and already within the 4s graceful-degradation budget added in Fix #5.
- No new evidence since 2026-03-31 (21 days ago as of 2026-04-20), and five distinct fix attempts already landed. Writing a sixth change without a fresh failing repro would be premature.

**Jira custom field suggestion (Root Cause):** `code-defect` — the bug was a client-side React/Supabase race condition in `src/contexts/auth-context.tsx`. It was not a data issue, not a config/env issue, and not a spec ambiguity.

## Recommended fix
- **Scope:** xs — no source changes required. Action is administrative (close the ticket) plus, optionally, one small hardening commit for the cosmetic delay.
- **Files to touch:** None for the bug itself. If the cosmetic warm-up delay annoys stakeholders, the only candidate is `src/contexts/auth-context.tsx` around lines 158-162 (drop the safety timeout from 5s to 3s and/or precompute initials without waiting on `business_profiles`), but this is polish, not a defect.
- **Approach:**
  1. Ask the tester (Joel) to rerun the RTX on the current `staging` one more time and attach a pass-video.
  2. If it passes: transition SQ-74 to `Ready For Release` and close. Set Root Cause = `code-defect`, Resolution = `Fixed`, Fixed-in-build = commit `f8de82b` (PR in the #41 → #42 chain on `upex-soloq`).
  3. Add an automated regression test to lock in the behavior (see "Tests needed" below) so a sixth regression cannot silently ship.
- **Edge cases (multiple refreshes, stale cookies, race conditions):**
  - Rapid refresh (<2s) — covered by `initGenRef` generation counter and the unmount guard. New effect run cancels any stale writer.
  - Expired/near-expired refresh token — covered by the decision to let `onAuthStateChange` drive bootstrap; `@supabase/ssr` handles silent refresh in one serialised queue.
  - Profile fetch times out (Supabase slow) — graceful-degradation path sets `isAuthenticated: true` with empty profile fields; logout still works because `signOut` does not depend on `profile`.
  - `signOut` server call fails (network down) — local state is already cleared; `router.push('/login')` runs; middleware sees stale-but-soon-to-be-revoked cookies and will reject the next protected-route request because `getUser()` validates server-side.
  - Stale cookies after logout on a different tab — covered implicitly because `onAuthStateChange` fires `SIGNED_OUT` across tabs via the BroadcastChannel Supabase enables by default.
  - Back-button after logout — middleware's `getUser()` validates the JWT, so even if the browser still has a cookie fragment, the request is redirected to `/login` (middleware.ts:52-67).
- **Tests needed:**
  - E2E (Playwright, `qa/tests/ui/auth/logout-after-refresh.spec.ts`): login → loop 5 rapid `page.reload({ waitUntil: 'commit' })` calls with <500ms gaps → click "Cerrar Sesion" → assert URL is `/login` and `sb-*` cookies are either absent or invalid (assert by navigating to `/dashboard` and expecting redirect back to `/login`).
  - Integration test for `AuthProvider` (vitest + React Testing Library): mount/unmount the provider 10× with a mocked `createBrowserClient` that emits `INITIAL_SESSION` on each mount; assert the final `isLoading === false` and `isAuthenticated === true` without stale writes. Also assert that calling the returned `signOut` synchronously drops `isAuthenticated` to `false` before the mocked server call resolves.
  - Unit test for `signOut`: verify that local state clears even when `supabase.auth.signOut()` rejects (simulating offline). Assert returned `error` is the rejection.

## Additional notes
- **Security implications:** A broken logout is a session-invalidation defect. In the original pre-Fix-#5 behaviour the server-side cookie revocation *did* fire eventually (the React UI just did not reflect it), so an attacker taking over the machine could not reuse a fully-revoked refresh token. However, if the logout appeared to hang, users likely walked away thinking they had logged out while the short-lived access token was still valid — an observable session-hijack window on the order of the access-token TTL (default 1h for Supabase). Fix #5 closes this window by making the UI transition deterministic.
- **Process observation:** Five fix iterations on the same file over 6 weeks is a strong signal. Recommend adding (a) the Playwright regression test above, and (b) a short design note in `.context/guidelines/DEV/` on "auth lifecycle — do not combine `getUser()` with `onAuthStateChange` in the browser". This prevents a sixth regression when another engineer touches `auth-context.tsx`.
- **Operational reminder:** The ticket is still "Open" despite a passing RTX. Recommend adding a QA SLA that a passing RTX must be paired with a status transition within 24h to avoid stale "Highest" priority tickets accumulating across sprints.
- **Out of scope but adjacent:** The tester noted a short extra delay before the username appears after login. That delay is the `Promise.race`-bounded profile fetch (up to 4s). If UX wants the username to appear faster, the cheap mitigation is to render the header from the cached `session.user.email` immediately and upgrade to `businessProfile.business_name` only when the parallel profile query resolves — this is a one-line change in `nav-user.tsx` and does not touch the auth-context race logic.
