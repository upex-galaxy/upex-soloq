# Incident Investigation — SQ-173

## Metadata

| Field          | Value                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Ticket         | SQ-173                                                                                             |
| Summary        | [SQ-55][A11y] Label "Método de Pago" no asociado correctamente en modal Registrar Pago            |
| Type           | Defect                                                                                             |
| Priority       | Medium                                                                                             |
| Status         | Open                                                                                               |
| Assignee       | Fernando Javier Masci                                                                              |
| Related        | SQ-55 (Record amount received — BLOCKED)                                                           |
| Environment    | Staging (`https://staging-upexsoloq.vercel.app`)                                                   |
| Module         | Invoices > Registrar Pago (modal)                                                                  |
| Reported from  | Exploratory testing of SQ-55 (DevTools Issues panel warning)                                       |
| Investigator   | Claude (Opus 4.7, 1M context) — read-only                                                          |
| Investigated   | 2026-04-20                                                                                         |

## Summary

The "Registrar Pago" modal renders a `<Label htmlFor="payment_method">` whose referenced id (`payment_method`) does not exist anywhere in the rendered DOM. The control it is supposed to label is a Radix UI `Select`, but its `SelectTrigger` is never given an `id` prop, so Radix auto-generates an opaque `radix-<hash>` id on the trigger button instead. The browser reports `Incorrect use of <label for=FORM_ELEMENT>` / `hasMatchingId=false` and screen readers do not announce "Método de Pago" when the combobox receives focus. This is a pure frontend / JSX bug, scoped to a single component, with a one-line fix. No backend, DB, or auth changes are required.

## Context — A11y / WCAG impact

- **WCAG 2.1 SC 1.3.1 Info and Relationships (Level A):** the label-control relationship must be programmatically determinable. An orphaned `htmlFor` breaks that relationship.
- **WCAG 2.1 SC 4.1.2 Name, Role, Value (Level A):** form controls must expose an accessible name. Without an associated `<label>`, the Radix Select trigger falls back to its visible value text ("Transferencia Bancaria", etc.) and the semantic label "Método de Pago" is lost.
- **WCAG 2.1 SC 3.3.2 Labels or Instructions (Level A):** although the visual label is present, assistive tech cannot pair it with the control.
- **User impact:** screen-reader users (NVDA, JAWS, VoiceOver) hear only the current selection value, not "Método de Pago". Browser autofill heuristics may also misfire. No functional blocker — the form still submits.
- **Severity:** Medium. Non-blocking, but fails a Level-A success criterion, so it is a legitimate a11y defect (as the reporter already classified it).

## Related Files

| # | Path | Role |
| - | ---- | ---- |
| 1 | `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/components/invoices/mark-as-paid-dialog.tsx` | The buggy component. Renders the "Registrar Pago" modal including the orphan label at line 161. |
| 2 | `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/components/ui/select.tsx` | shadcn/ui Select primitive. `SelectTrigger` is a thin wrapper over `@radix-ui/react-select`'s `Trigger` and forwards all props, so passing `id="..."` does land on the rendered `<button>`. |
| 3 | `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/components/onboarding/steps/payment-methods-step.tsx` | Reference / "good" pattern. Line 158 `<Label htmlFor={`type-${index}`}>` is paired with line 165 `<SelectTrigger id={`type-${index}`} ...>`. Proves the codebase knows the correct idiom. |
| 4 | `/home/sai/Desktop/upex/web-apps/polyrepo-soloq/upex-soloq/src/components/settings/contact-info-form.tsx` | Alternative correct pattern using shadcn `FormField` + `FormLabel` (React Hook Form auto-wires `htmlFor`). Not applicable here because `mark-as-paid-dialog.tsx` uses plain `useState`, not RHF. |

## Reproduction attempt (DOM trace)

Render path for line 160-192 of `mark-as-paid-dialog.tsx` produces roughly:

```html
<div class="space-y-2">
  <!-- 1) The label: points to an id that never appears below -->
  <label for="payment_method" ...>Método de Pago</label>

  <!-- 2) Radix Select.Root is a Provider, emits no DOM -->
  <!-- 3) SelectTrigger -> <button> with Radix-auto-generated id  -->
  <button
    type="button"
    role="combobox"
    aria-controls="radix-«r5»"
    aria-expanded="false"
    aria-autocomplete="none"
    data-slot="select-trigger"
    data-testid="payment-method-select"
    id="radix-«r4»"              <!-- NOT "payment_method" -->
    ...
  >
    <span data-slot="select-value">Transferencia Bancaria</span>
    <svg ...><!-- chevron --></svg>
  </button>
</div>
```

What a screen reader announces when the trigger is focused:
- **Actual:** "Transferencia Bancaria, combobox, collapsed" (value + role only).
- **Expected:** "Método de Pago, Transferencia Bancaria, combobox, collapsed".

DevTools Issues / aXe verification:
- `hasMatchingId=false` for `<label for="payment_method">` (as the ticket reports).
- Console warning: `Incorrect use of <label for=FORM_ELEMENT>`.

Other three labels in the same modal (`amount_received`, `payment_date`, `notes`) all point to native `<input>` / `<textarea>` elements that do carry the matching `id` prop — those work correctly. Only the Select-backed one is broken.

## Root Cause

**Forgotten `id` prop on `<SelectTrigger>`.**

At `src/components/invoices/mark-as-paid-dialog.tsx:161-165`:

```tsx
<Label htmlFor="payment_method">Método de Pago</Label>
<Select value={paymentMethod} onValueChange={setPaymentMethod}>
  <SelectTrigger data-testid="payment-method-select">
    <SelectValue />
  </SelectTrigger>
```

Radix's `Select.Root` has no `id` prop that maps to a DOM element (the component renders no DOM of its own). The id must be placed on `SelectTrigger`, which is what ends up as the focusable `<button role="combobox">` that the label needs to point to. Because no `id` is passed, Radix falls back to its auto-generated `radix-«...»` id, and the label's `for="payment_method"` becomes a dangling reference.

The bug is a pure authoring slip; the rest of the modal (three other label/control pairs) is wired correctly, and the project already has the correct pattern in `payment-methods-step.tsx:158-165`.

## Decision + Jira Root Cause custom field

- **Verdict:** Confirmed bug. Scope strictly frontend; fix is a one-line JSX addition. No data corruption, no regression in functional flow, no security implication.
- **Valid for development:** Yes.
- **Proposed Jira "Root Cause" custom field value:** `Frontend / UI — Accessibility (label not associated with form control)`.
  - If the Jira field uses a constrained dropdown: the nearest common categories observed in sibling tickets are `Frontend` or `UI/UX / Accessibility`. Tester/PM should pick whichever exists.

## Recommended fix

Single file, single line. In `src/components/invoices/mark-as-paid-dialog.tsx`:

```diff
           <div className="space-y-2">
             <Label htmlFor="payment_method">Método de Pago</Label>
             <Select value={paymentMethod} onValueChange={setPaymentMethod}>
-              <SelectTrigger data-testid="payment-method-select">
+              <SelectTrigger id="payment_method" data-testid="payment-method-select">
                 <SelectValue />
               </SelectTrigger>
```

This mirrors the existing working pattern at `src/components/onboarding/steps/payment-methods-step.tsx:165` (`<SelectTrigger id={`type-${index}`} ...>`).

### Alternative (not recommended for this ticket)

Migrate the modal to shadcn's `Form` + `FormField` + `FormLabel` stack (React Hook Form). That auto-wires `htmlFor`/`id`/`aria-describedby` for every control in the modal and would also benefit the other three labels (though those are already correct). It is a larger refactor and out of scope for a Medium a11y defect — track separately if desired.

### Verification steps after fix

1. Rebuild / reload the modal in staging.
2. DevTools Issues panel: the `Incorrect use of <label for=FORM_ELEMENT>` warning for `payment_method` is gone.
3. Console snippet to re-run the reporter's check:
   ```js
   [...document.querySelectorAll('label[for]')].map(l => ({
     for: l.htmlFor,
     hasMatchingId: !!document.getElementById(l.htmlFor)
   }));
   ```
   All entries should now be `hasMatchingId: true`.
4. Screen reader (NVDA or VoiceOver) focuses the "Método de Pago" trigger and announces the label text.
5. aXe / Lighthouse a11y scan on the modal: no orphan-label violations.

## Additional notes — codebase-wide `<Label>` audit

I searched every `<Label htmlFor=...>` occurrence in `src/` and mapped it to the control that follows. Summary:

| File | Label target | Control with matching `id`? | Status |
| ---- | ------------ | --------------------------- | ------ |
| `src/components/invoices/mark-as-paid-dialog.tsx:108` | `amount_received` | `<Input id="amount_received">` (L110) | OK |
| `src/components/invoices/mark-as-paid-dialog.tsx:161` | `payment_method` | **none** (SelectTrigger has no id) | **BROKEN — this ticket** |
| `src/components/invoices/mark-as-paid-dialog.tsx:195` | `payment_date` | `<Input id="payment_date">` (L197) | OK |
| `src/components/invoices/mark-as-paid-dialog.tsx:217` | `notes` | `<Textarea id="notes">` (L219) | OK |
| `src/components/invoices/invoice-number-input.tsx:139` | `invoice-number` | `<Input id="invoice-number">` downstream | OK |
| `src/app/(auth)/signup/page.tsx:180, 200, 249` | `email`, `password`, `confirmPassword` | matching `<Input id=...>` in each block | OK |
| `src/app/(auth)/login/page.tsx:120, 135` | `email`, `password` | matching `<Input id=...>` | OK |
| `src/app/(auth)/forgot-password/page.tsx:154` | `email` | matching `<Input id=...>` | OK |
| `src/app/(auth)/reset-password/page.tsx:345, 382` | `password`, `confirmPassword` | matching `<Input id=...>` | OK |
| `src/components/onboarding/steps/payment-methods-step.tsx:158, 165` | `type-${index}` | `<SelectTrigger id={`type-${index}`}>` | OK (reference pattern) |
| `src/components/onboarding/steps/payment-methods-step.tsx:179, 193, 218` | `label-${index}`, `value-${index}`, `default-${index}` | matching `<Input>` / `<Checkbox>` | OK |

Search heuristic used:
- `Grep "Label htmlFor"` to enumerate every dangling-label candidate.
- `Grep "SelectTrigger[^/]*\\bid=" multiline` to enumerate Select triggers that DO carry an id — only one hit (`payment-methods-step.tsx:165`), reinforcing that `mark-as-paid-dialog.tsx` is the sole regression.
- `Grep "Label htmlFor=.*\\n.*Select value" multiline` to find any other `<Label>`-followed-by-`<Select>` pairs — only one match, and it is the buggy one.

Components that use shadcn's `FormField` / `FormLabel` (`contact-info-form.tsx`, etc.) rely on React Hook Form to auto-generate matching ids and are not affected.

**Conclusion:** this is an isolated bug — not a systemic a11y issue in the project. The fix is the one-liner above, no other components need changes.
