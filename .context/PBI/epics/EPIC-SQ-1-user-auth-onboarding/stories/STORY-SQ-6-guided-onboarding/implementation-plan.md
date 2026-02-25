# Implementation Plan: SQ-6 - Guided Onboarding for New Users

**Jira Key:** [SQ-6](https://upexgalaxy65.atlassian.net/browse/SQ-6)
**Epic:** EPIC-SQ-1 (User Authentication & Onboarding)
**Branch:** `feat/SQ-6/guided-onboarding`
**Created:** 2026-02-25
**Author:** Claude + Dev

---

## Overview

Implementar un flujo de onboarding guiado multi-step que permite a nuevos usuarios configurar su perfil de negocio antes de usar el dashboard.

### Acceptance Criteria Mapping

| AC | Test Cases | Implementation Step |
|----|-----------|---------------------|
| AC1: Redirect to onboarding after verification | FTP-HP-01, FTP-HP-02 | Step 5 |
| AC2: Complete step by step with progress | FTP-ONB-01 to FTP-ONB-06 | Steps 2, 3 |
| AC3: Skip optional steps | FTP-OPT-01, FTP-OPT-02 | Step 3 |
| AC4: Complete and reach dashboard | FTP-HP-03, FTP-HP-04 | Step 4 |
| AC5: Resume incomplete onboarding | FTP-RES-01 to FTP-RES-03 | Steps 1, 5 |

---

## Pre-Implementation Analysis

### Current State

| Component | Status | Notes |
|-----------|--------|-------|
| `profiles` table | Exists | Missing `onboarding_completed`, `onboarding_step` |
| `business_profiles` table | Exists | Ready to use |
| `payment_methods` table | Exists | Ready to use |
| `/onboarding` route | Not exists | Need to create |
| Auth callback | Exists | Redirects to `/dashboard`, need to check onboarding |
| Middleware | Exists | Protects `/onboarding`, need onboarding check |

### Architecture Decision

**Approach:** Client-side multi-step form with server-side persistence

- Steps managed via React state
- Each step saves to DB via API call
- Progress tracked in `profiles.onboarding_step`
- Layout: Standalone (no sidebar) with centered card

---

## Implementation Steps

### Step 1: Database Migration - Add onboarding fields to profiles

**Files to create/modify:**
- Migration via Supabase MCP

**Changes:**
```sql
ALTER TABLE profiles
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN onboarding_step INTEGER DEFAULT 1;
```

**Test Cases Covered:** FTP-RES-01, FTP-RES-02 (persistence)

---

### Step 2: Create Onboarding Layout and Page Structure

**Files to create:**
- `src/app/(onboarding)/layout.tsx` - Standalone layout (no sidebar)
- `src/app/(onboarding)/onboarding/page.tsx` - Main onboarding page
- `src/components/onboarding/progress-indicator.tsx` - Step progress bar
- `src/components/onboarding/onboarding-container.tsx` - Wrapper with card styling

**Layout Design:**
```
┌─────────────────────────────────────────────────┐
│                    SoloQ Logo                    │
├─────────────────────────────────────────────────┤
│           ● ─ ○ ─ ○ ─ ○ ─ ○                     │
│           Progress Indicator                     │
├─────────────────────────────────────────────────┤
│                                                  │
│    ┌─────────────────────────────────────────┐  │
│    │   Step Content (Card)                   │  │
│    │   - Title                               │  │
│    │   - Description/Tip                     │  │
│    │   - Form Fields                         │  │
│    │                                          │  │
│    │   [Back]              [Skip] [Next]     │  │
│    └─────────────────────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Test Cases Covered:** FTP-ONB-01, FTP-ONB-03

---

### Step 3: Create Step Components

**Files to create:**
- `src/components/onboarding/steps/business-name-step.tsx` (Required)
- `src/components/onboarding/steps/contact-info-step.tsx` (Required)
- `src/components/onboarding/steps/logo-step.tsx` (Optional - Skip allowed)
- `src/components/onboarding/steps/payment-methods-step.tsx` (Required - at least 1)
- `src/components/onboarding/steps/summary-step.tsx` (Final - Get Started button)

**Step Configuration:**
```typescript
const ONBOARDING_STEPS = [
  { id: 1, name: 'business', title: 'Tu Negocio', required: true },
  { id: 2, name: 'contact', title: 'Contacto', required: true },
  { id: 3, name: 'logo', title: 'Logo', required: false },
  { id: 4, name: 'payment', title: 'Métodos de Pago', required: true },
  { id: 5, name: 'summary', title: 'Resumen', required: true },
];
```

**Validation per step:**
- Business Name: Required, min 2 chars, max 100 chars
- Contact Info: Email required (valid format), phone optional, address optional
- Logo: Optional (Skip for now)
- Payment Methods: At least 1 method required

**Test Cases Covered:** FTP-ONB-02, FTP-ONB-04, FTP-ONB-05, FTP-OPT-01, FTP-VAL-01, FTP-VAL-02

---

### Step 4: Implement Navigation and State Management

**Files to create:**
- `src/hooks/use-onboarding.ts` - Custom hook for onboarding state

**State Management:**
```typescript
interface OnboardingState {
  currentStep: number;
  formData: {
    businessName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    logoUrl: string | null;
    paymentMethods: PaymentMethod[];
  };
  isSubmitting: boolean;
  errors: Record<string, string>;
}
```

**Navigation Logic:**
- `goNext()`: Validate current step → Save to DB → Increment step
- `goBack()`: Decrement step (no validation needed)
- `skip()`: Only available on optional steps → Increment step without saving
- `complete()`: Mark `onboarding_completed = true` → Redirect to dashboard

**Test Cases Covered:** FTP-ONB-02, FTP-PER-01, FTP-VAL-04

---

### Step 5: Update Auth Flow for Onboarding Redirect

**Files to modify:**
- `src/app/auth/callback/route.ts` - Check onboarding status after verification
- `middleware.ts` - Add onboarding check for authenticated users

**Auth Callback Changes:**
```typescript
// After successful verification:
// 1. Get user profile
// 2. Check onboarding_completed
// 3. Redirect to /onboarding if not completed, /dashboard if completed
```

**Middleware Changes:**
```typescript
// For authenticated users on protected routes:
// 1. Check if profile.onboarding_completed === false
// 2. If false and not on /onboarding, redirect to /onboarding
// 3. If true and on /onboarding, redirect to /dashboard
```

**Test Cases Covered:** FTP-HP-01, FTP-HP-02, FTP-RES-03, FTP-VAL-03

---

### Step 6: Create API Endpoints for Onboarding

**Files to create:**
- `src/app/api/onboarding/route.ts` - GET current step, PUT update step
- `src/app/api/onboarding/complete/route.ts` - POST mark complete

**API Design:**
```
GET  /api/onboarding        → { step, formData }
PUT  /api/onboarding        → Update current step data
POST /api/onboarding/complete → Mark completed, return redirect URL
```

**Test Cases Covered:** FTP-PER-02, FTP-PER-03, FTP-CON-01

---

### Step 7: Update Dashboard Empty State

**Files to modify:**
- `src/app/(app)/dashboard/page.tsx` - Add onboarding-aware welcome

**Changes:**
- Show welcome message for new users who just completed onboarding
- CTA "Crear Primera Factura" is already present (mockInvoices.length === 0)
- Add optional "Complete your profile" banner if optional steps skipped

**Test Cases Covered:** FTP-HP-04, FTP-OPT-02

---

### Step 8: Error Handling and Edge Cases

**Scenarios to handle:**
1. Network failure during save → Show retry toast
2. Session expired → Redirect to login with resume
3. Invalid data → Show field-specific errors
4. Browser back button → Maintain step state
5. Double-click prevention → Disable buttons during submit

**Test Cases Covered:** FTP-ERR-01 to FTP-ERR-05, FTP-UX-01, FTP-UX-02

---

## File Structure

```
src/
├── app/
│   ├── (onboarding)/
│   │   ├── layout.tsx              # Standalone layout (no sidebar)
│   │   └── onboarding/
│   │       └── page.tsx            # Main onboarding page
│   ├── api/
│   │   └── onboarding/
│   │       ├── route.ts            # GET/PUT onboarding data
│   │       └── complete/
│   │           └── route.ts        # POST complete onboarding
│   └── auth/
│       └── callback/
│           └── route.ts            # Modified for onboarding check
├── components/
│   └── onboarding/
│       ├── onboarding-container.tsx
│       ├── progress-indicator.tsx
│       └── steps/
│           ├── business-name-step.tsx
│           ├── contact-info-step.tsx
│           ├── logo-step.tsx
│           ├── payment-methods-step.tsx
│           └── summary-step.tsx
└── hooks/
    └── use-onboarding.ts
```

---

## Dependencies

**No new dependencies required.** Using existing:
- React Hook Form + Zod (forms)
- shadcn/ui (components)
- Supabase (backend)
- Lucide (icons)

---

## Testing Checklist

Before marking complete, verify:

- [ ] FTP-HP-01: User redirected to onboarding after email verification
- [ ] FTP-HP-02: Success message or auto-redirect after verification
- [ ] FTP-HP-03: Complete all steps and click "Get Started"
- [ ] FTP-HP-04: Dashboard shows CTA for first invoice
- [ ] FTP-ONB-01: Progress indicator updates correctly
- [ ] FTP-ONB-02: Back/Next navigation works without data loss
- [ ] FTP-ONB-03: Tips/help text shown per step
- [ ] FTP-ONB-04: Success on completing required steps
- [ ] FTP-ONB-05: Can complete with only required steps
- [ ] FTP-ONB-06: Step order matches spec
- [ ] FTP-OPT-01: Skip button works on logo step
- [ ] FTP-OPT-02: Placeholder shown if no logo
- [ ] FTP-RES-01: Resume from last step after browser close
- [ ] FTP-RES-02: Consistent resume across steps
- [ ] FTP-RES-03: Redirect to dashboard if already completed
- [ ] FTP-VAL-01: Cannot advance without required fields
- [ ] FTP-VAL-02: Invalid formats show errors
- [ ] FTP-VAL-03: URL manipulation redirects to correct step
- [ ] FTP-VAL-04: Double-click prevention works

---

## Estimated Effort

| Step | Description | Complexity |
|------|-------------|------------|
| 1 | DB Migration | Low |
| 2 | Layout + Page Structure | Medium |
| 3 | Step Components | High |
| 4 | Navigation + State | Medium |
| 5 | Auth Flow Update | Medium |
| 6 | API Endpoints | Medium |
| 7 | Dashboard Update | Low |
| 8 | Error Handling | Medium |

**Total:** ~6-8 hours development

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Data loss on navigation | Save to DB on each step completion |
| Complex state management | Use single source of truth (useOnboarding hook) |
| Auth flow regression | Test existing login/signup after changes |
| Mobile responsiveness | Use responsive Tailwind classes from design system |

---

**Next:** Proceed with Step 1 (Database Migration)
