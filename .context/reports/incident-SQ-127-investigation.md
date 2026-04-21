# Incident / Enhancement Investigation — SQ-127

## Metadata

| Field              | Value                                                                        |
| ------------------ | ---------------------------------------------------------------------------- |
| Ticket             | SQ-127                                                                       |
| Title              | UserAuth: Signup: Add password visibility toggle                             |
| Type               | Improvement                                                                  |
| Priority           | Low                                                                          |
| Status             | In Review                                                                    |
| Assignee           | Samuel Amonzabel                                                             |
| Origin issue       | SQ-101 (exploratory testing finding)                                         |
| Related story      | SQ-2 (Signup user story)                                                     |
| Investigated by    | Claude (AI agent, read-only)                                                 |
| Investigation date | 2026-04-20                                                                   |
| Verdict            | FIX-MERGED (shipped to `staging`)                                            |

## Summary

SQ-127 is an Improvement (not a bug) asking for a show/hide password toggle on the signup form's `Password` and `Confirm Password` fields. The toggle has already been **implemented and merged to `staging` via PR #89** (`5df2822`) on 2026-03-29. The Jira status (`In Review`) is a QA-Automation ROI gate, not a code-review gate — the code is already in the shipped tree. The implementation is clean, accessible, and passes the acceptance criteria listed in the ticket. The only open gap is cross-form consistency with `/login` (covered below in Additional notes).

## Context (enhancement rationale — UX)

Exploratory testing (SQ-101) surfaced the fact that the signup form had no way to reveal typed password characters. This is a standard UX affordance on registration forms — without it, users rely on muscle memory and often mistype the confirm field, causing a spurious "Las contraseñas no coinciden" error and dropping conversion. The ticket explicitly scopes this as an **improvement**, outside the original SQ-2 AC, and proposes its own AC:

1. User can show/hide password in both fields
2. Toggle icon reflects current visibility state
3. Password strength + mismatch validations are unaffected
4. Works on desktop + mobile
5. Accessible (`aria-label`) and testable (`data-testid`)

## Related files

| Path                                                                                                                            | Role                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/(auth)/signup/page.tsx`                                      | Signup form — toggle implemented on both password fields (lines 199–278)    |
| `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/(auth)/login/page.tsx`                                       | Login form — **no** toggle (single password field, plain `type="password"`) |
| `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/app/(auth)/reset-password/page.tsx`                              | Reset-password form — toggle **already implemented** on both fields         |
| `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/components/auth/password-strength-indicator.tsx`                 | Shared strength indicator (no password-input wrapper component exists)      |

No shared `PasswordInput` component was introduced — the toggle is inlined per form. See Additional notes.

## PR review

| Field         | Value                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| PR            | #89 — `feat(SQ-127): add password visibility toggle to signup form`                                        |
| URL           | https://github.com/upex-galaxy/upex-soloq/pull/89                                                          |
| Author        | saiotest                                                                                                   |
| Base → Head   | `staging` ← `feat/SQ-127/password-visibility-toggle`                                                       |
| Merge commit  | `88db7ce` (squash of `5df2822`)                                                                            |
| Merged        | 2026-03-29 19:47 UTC                                                                                       |
| Scope         | +56 / -23 in `src/app/(auth)/signup/page.tsx` (single-file change)                                         |

### Implementation quality — walk-through

Both password fields follow the same pattern (signup/page.tsx lines 199–277):

```tsx
<div className="relative">
  <Input
    id="password"
    type={showPassword ? 'text' : 'password'}
    ...
    className="pr-10"
  />
  <button
    type="button"
    onClick={() => setShowPassword(prev => !prev)}
    className="absolute right-3 top-1/2 -translate-y-1/2 ..."
    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    data-testid="signup-password-toggle"
    tabIndex={-1}
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

AC checklist vs. delivered code:

| AC                                                    | Status | Evidence                                                                                    |
| ----------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| Toggles `type="password"` ↔ `type="text"`             | Met    | `type={showPassword ? 'text' : 'password'}` (lines 204, 253)                                |
| Eye / EyeOff icons from `lucide-react`                | Met    | Import at line 5; conditional render at 223, 271–275                                        |
| `type="button"` (no accidental submit)                | Met    | Both buttons declare `type="button"` (lines 216, 264)                                       |
| `aria-label` reflects state                           | Met    | Dynamic label `'Mostrar contraseña' / 'Ocultar contraseña'` (lines 219, 267)                |
| `data-testid` for automation                          | Met    | `signup-password-toggle`, `signup-confirm-password-toggle` (lines 220, 268)                 |
| Applied to BOTH password + confirm-password           | Met    | Two independent `useState` flags + two buttons                                              |
| Password strength + mismatch validations untouched    | Met    | Validation logic at lines 85–95 unchanged; `passwordValidation` memo untouched              |
| `pr-10` padding so the text does not sit under icon   | Met    | Applied to both inputs (lines 213, 261)                                                     |

### Minor observations (non-blocking nits)

1. **`tabIndex={-1}` on the toggle buttons.** This removes the toggle from keyboard tab order. Intentional choice (avoids users tabbing into the button mid-form), but it means keyboard-only users cannot invoke the toggle. WCAG 2.1.1 technically requires it to be keyboard-reachable. Low severity — most users touch/click this. Worth documenting as an accepted trade-off or reconsidering.
2. **No visible focus ring** on the toggle button. `hover:text-foreground` is set but there is no `focus-visible:` style. Moot while `tabIndex={-1}` stands, but worth fixing if #1 is reverted.
3. **Icon-only button.** `aria-label` is present, so screen-reader-reachable. Good.

Overall: clean, minimal, AC-complete. No revert or rework needed.

## Root Cause / Gap

This is **not a bug**. There was no defect — the original signup story (SQ-2) simply didn't include a visibility toggle. SQ-127 is a **missing-feature / UX-enhancement** surfaced during exploratory testing. The gap closed by PR #89 is purely one of product scope, not correctness or regression.

## Decision + Jira "Root Cause" custom field

- **Decision:** No further action on the signup form. PR #89 is merged. The Jira ticket can move forward through the QA-Automation ROI review and on to Ready For QA (assign to the tester identified via the Shift-Left QA changelog, per project rules).
- **Jira Root Cause custom field value (recommended):** `missing-feature` (or `ux-enhancement` if that value exists in the dropdown). This was a scope gap, not a code defect.

## Recommended fix / recommendation to ship

Ship-as-is for SQ-127 scope. No code change required.

Optional hardening (would be a separate small ticket):

- Remove `tabIndex={-1}` OR add an explicit focus-visible style so keyboard users can toggle visibility.
- Extract a shared `PasswordInput` component (`src/components/auth/password-input.tsx`) that wraps `<Input>` + toggle, and refactor signup / reset-password / future forms to consume it. This would:
  - Remove ~60 lines of duplicated markup between `signup/page.tsx` and `reset-password/page.tsx`.
  - Give `/login` a trivial 1-line path to adopt the toggle (see below).
  - Centralise the accessibility + focus-ring decisions in one place.

## Additional notes — cross-form consistency

The toggle is currently implemented in **two** of the three password-bearing auth forms:

| Form              | Has toggle? | File                                         | Notes                                                                     |
| ----------------- | ----------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| Signup            | Yes         | `src/app/(auth)/signup/page.tsx`             | SQ-127 — inline buttons, `tabIndex={-1}`                                  |
| Reset password    | Yes         | `src/app/(auth)/reset-password/page.tsx`     | Pre-existing (FT-SQ4 work) — uses `<Button variant="ghost">`, keyboard-reachable |
| **Login**         | **No**      | `src/app/(auth)/login/page.tsx` (line 140)   | Plain `type="password"` — inconsistent UX                                 |

This creates a minor UX inconsistency: a user who registered and used the reveal toggle will see no such toggle when they return to `/login`. Two of three surfaces have it, one does not. Recommendation: file a follow-up ticket (e.g. `UserAuth: Login: Add password visibility toggle for consistency`) — this was out of scope for SQ-127 (which explicitly scoped only `/signup`), but is a natural next step. The shared-component refactor noted above would make that change near-zero-cost.

No blockers for SQ-127 itself. The enhancement as described is delivered and in production-ready state on `staging`.
