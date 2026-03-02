# Comments for SQ-4

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-4)

---

### Maxe Aguilera - 2/3/2026, 12:08:35 AM

## ***SHIFT-LEFT TESTING*** 

##### [https://upexgalaxy65.atlassian.net/browse/SQ-4#icft=SQ-4](https://upexgalaxy65.atlassian.net/browse/SQ-4#icft=SQ-4) 

## ***Password Recovery (v1.1)***

***Story:**** [****SQ-4***](https://upexgalaxy65.atlassian.net/browse/SQ-4) 

- Password Recovery via Email

***Phase: 5 - Shift-Left Testing***
***Author: Gemini AI Assistant***
***Last Updated: 2026-02-02***

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful password reset request

- ***Given:*** I am on the forgot password page
- ***When:*** I enter my registered email and submit
- ***Then:*** I see a message "If an account exists, we sent a reset link" and receive the email within 2 minutes

***Note***: A suggestion for this scenario, I would rewrite it as:

- ***Given***: I am on the forgot password page
- ***When***: I enter my registered email and submit
- ***Then***: I see a generic confirmation message "If an account exists, we sent a reset link"
- ***And***: If the account exists, a reset email is sent within 2 minutes

### Scenario 2: Password reset with non-existent email

- ***Given:*** I am on the forgot password page
- ***When:*** I enter an email that is not registered
- ***Then:*** I see the same generic message (to prevent email enumeration)

***Note***: As a suggestion, I would validate that no visual, textual, or behavioral indicator reveals whether the email exists (to prevent email enumeration)

Scenario 3: Successful password reset with valid token

- ***Given:*** I clicked the reset link from my email (token valid)
- ***When:*** I enter a new password that meets security requirements and confirm it
- ***Then:*** My password is updated, all sessions are invalidated, and I'm redirected to login with a success message

***Note:*** As a suggestion, the reset token should be invalidated immediately after the password is successfully updated

### Scenario 4: Password reset fails with expired token

- ***Given:*** I clicked a reset link that is older than 1 hour
- ***When:*** I try to submit a new password
- ***Then:*** I see an error "This link has expired" with option to request a new one

Note: As a suggestion:

- The user should be informed that the reset token has expired when accessing the reset password link, to prevent wasting time on a flow that cannot be completed.
- When the user clicks on an expired reset link:

- The Reset Password form must be displayed in a disabled state, and the user must not be able to submit a new password.

- A modal (pop-up) should be displayed in the center of the screen informing the user that the reset link has expired and that a new one must be requested. The modal should include:

- Title
- A brief explanation of the situation
- An email field (pre-filled and read-only)
- A Resend button

- Once the user clicks on Resend, the modal should be automatically dismissed, and a new reset email should be sent.

### Scenario 5: Password reset fails with weak password

- ***Given:*** I am on the reset password page with a valid token
- ***When:*** I enter a password that doesn't meet security requirements
- ***Then:*** I see validation errors indicating what's missing

***Note:***

-  For ***Scenarios 3 - 5****, the password requirements should be visible ****before and during*** password input (tooltip, helper text, or inline message), and should update in real time as the user types.
- The password cannot be updated if these security requirements are not met. This last should be a test step as well

 

***SUGGESTION of new scenarios to consider***

***Scenario 6: Used Token***

- ***Given***: I click on a password reset link that has already been used
- ***When***: The Forgot Password Page is loaded
- ***Then***: I see a message indicating the link is no longer valid
- ***And***: I am prompted to request a new password reset link
- ***And***: The reset password form is disabled

#### ***Security Notes***

- Reused tokens must result in the same user-facing behavior as expired tokens to prevent token enumeration.

 

***Scenario 7: Password reset request is blocked due to rate limiting***

- ***Given***: I am on the Forgot Password page
- ***And***: I have submitted multiple password reset requests in a short period (TBD how many tries will be supported)
- ***When***: I submit another password reset request
- ***Then***: I see a generic message indicating the request cannot be processed at this time
- ***And***: No information is revealed about whether the email exists

#### ***Security Notes***

- The same generic message must be shown for both existing and non-existing emails to prevent enumeration.

# Feature Test Plan: 

## 1. Coverage Analysis and Suggested Improvements

Based on the `story.md` and the ticket comments, this test plan incorporates the following key improvements to increase coverage and quality:

- ***Improved UX for Invalid Tokens:*** The flow for expired or already-used tokens has been redesigned. Instead of a simple error, an interactive modal is proposed to guide the user in requesting a new link.
- ***Real-Time Password Validation:*** Explicit validation checks are added to give the user instant feedback on password requirements as they type.
- ***Closing Security Gaps:*** Specific test cases are introduced for critical scenarios:

- 
- ***Session Invalidation:*** An E2E test procedure is detailed to ensure all active user sessions are terminated after a successful password change.

## 2. Story Point Estimation Update

The original estimate was 3 Story Points. The improvements and new test scenarios imply an increase in complexity.

- ***New UI Components:*** Creation of a modal for expired tokens and the real-time password feedback logic.
- ***Additional Backend Logic:*** Implementation of a dual-layer rate-limiting strategy and more robust post-use token invalidation.
- ***Increased Testing Load:*** The new security and UI scenarios require a more detailed testing effort.

***Recommended Estimate: 5 Story Points.***

***Justification:*** The 2-point increase reflects the transition from a basic functionality to a robust, secure, and superior user experience solution, aligned with industry standards.

## 

## 3. Test Strategy (Test Pyramid)

| Test Level | Scope & Tools |
| --- | --- |
| ***Unit Tests**** | ****Focus:**** Business logic and components in isolation. [br/] ****Tools:*** `Vitest`, `React Testing Library`. |
| ***Integration**** | ****Focus:**** API endpoints and their interaction with the database (Supabase). [br/] ****Tools:*** `Vitest`, `Supertest`, `msw`. |
| ***End-to-End**** | ****Focus:**** Complete user flows in a real environment. [br/] ****Tools:*** `Playwright`. |

## 

## 4. Detailed Test Cases

### 4.1. Recovery Request Flow

| ID | Description | Type | Priority |
| --- | --- | --- | --- |
| `FT-SQ4-01` | ***Happy Path:*** Request a reset with a valid and registered email. | E2E, Integ. | Critical |
| `FT-SQ4-02` | ***Security:**** Request a reset with a valid but ****unregistered*** email. | E2E, Integ. | Critical |
| `FT-SQ4-03` | ***Validation:*** Attempt to request a reset with an invalid email format (e.g., "test@test"). | E2E, Unit | High |
| `FT-SQ4-04` | ***Security:*** Verify that the response (content and timing) for `FT-SQ4-01` and `FT-SQ4-02` is identical. | Integ. | Critical |
| `FT-SQ4-05a` | ***Security (Rate Limit):**** Exceed the request limit per ****IP*** (e.g., >20 req/min). | Integ. | Critical |
| `FT-SQ4-05b` | ***Security (Rate Limit):**** Exceed the request limit per ****email*** (e.g., >3 req/hour). | Integ. | Critical |
| `FT-SQ4-17` | ***UX/UI:**** Verify the confirmation page displays the user's masked email (e.g., j__**@test.com). | E2E | Medium |
| `FT-SQ4-18` | ***UX/UI:*** Verify a "Back to Login" link exists on the request page and works correctly. | E2E | Low |

### 4.2. Password Reset Flow

| ID | Description | Type | Priority |
| --- | --- | --- | --- |
| `FT-SQ4-06` | ***Happy Path:*** Successfully reset the password with a valid token and a strong password. | E2E, Integ. | Critical |
| `FT-SQ4-07` | ***Validation:*** Attempt to reset with a password that doesn't meet requirements (real-time feedback). | E2E, Unit | Critical |
| `FT-SQ4-08` | ***Validation:*** Attempt to reset with passwords that do not match in the confirmation field. | E2E, Unit | Critical |
| `FT-SQ4-09` | ***Security:*** Attempt to access the reset link after the token has expired (>1 hour). | E2E, Integ. | Critical |
| `FT-SQ4-10` | ***Security:**** Attempt to reset the password using a token that has ****already been used*** in a successful reset. | E2E, Integ. | Critical |
| `FT-SQ4-11` | ***Security:*** Attempt to access the link with an invalid or tampered token. | E2E, Integ. | Critical |
| `FT-SQ4-12` | ***UX/UI:*** Verify that in the expired token flow (`FT-SQ4-09`), the form is disabled and the modal is shown. | E2E | High |
| `FT-SQ4-13` | ***UX:*** From the expired token modal, request a new email and successfully complete the flow. | E2E | High |
| `FT-SQ4-19` | ***UX/UI:*** Verify that the password requirements are always visible on the reset page. | E2E | Medium |

### 4.3. Post-Reset Flow

| ID | Description | Type | Priority |
| --- | --- | --- | --- |
| `FT-SQ4-14` | ***Security:*** Verify the token is immediately invalidated after a successful reset (`FT-SQ4-06`). | Integ. | Critical |
| `FT-SQ4-15` | ***Security:*** Verify that all sessions are globally invalidated after a successful reset. | E2E | Critical |
| `FT-SQ4-16` | ***Happy Path:*** Verify the user is redirected to the login page with a success message after the reset. | E2E | High |

## 

## 5. Technical Decisions and Clarifications

This section documents the decisions made from the initial technical questions.

1.  ***Session Invalidation Mechanism:***

- 

1.  ***Rate Limiting Strategy:***

- 

- 

---

### Automation for Jira - 2/12/2026, 1:51:06 PM

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Automation for Jira - 2/12/2026, 1:52:19 PM

✅ Pull Request is successfully MERGED. Task is Done.

---

### Ely - 2/12/2026, 1:52:47 PM

***Implementación Completada - PR #50 MERGED***

Todos los 19 test cases (FT-SQ4-01 a FT-SQ4-19) implementados:

***Archivos creados:***

- `/forgot-password/page.tsx` - Formulario de solicitud
- `/api/auth/forgot-password/route.ts` - API con rate limiting dual
- `/reset-password/page.tsx` - Formulario de nueva contraseña
- `PasswordStrengthIndicator` - Validación en tiempo real

***Features implementadas:***

- Rate limiting por IP (20/min) y por email (3/hora)
- Respuesta genérica anti-enumeración
- Modal para tokens expirados con opción de reenvío
- Validación de contraseña en tiempo real
- Invalidación global de sesiones post-reset
- Mensaje de éxito en login

Listo para QA testing.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:38.690Z_
