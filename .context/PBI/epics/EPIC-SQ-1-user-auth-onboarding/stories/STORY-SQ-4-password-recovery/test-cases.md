# Feature Test Plan: SQ-4 Password Recovery (v1.1)

**Story:** [SQ-4](https://upexgalaxy64.atlassian.net/browse/SQ-4) - Password Recovery via Email
**Phase:** 5 - Shift-Left Testing
**Author:** Gemini AI Assistant
**Last Updated:** 2026-02-02

---

## 1. Coverage Analysis and Suggested Improvements

Based on the `story.md` and the ticket comments, this test plan incorporates the following key improvements to increase coverage and quality:

- **Improved UX for Invalid Tokens:** The flow for expired or already-used tokens has been redesigned. Instead of a simple error, an interactive modal is proposed to guide the user in requesting a new link.
- **Real-Time Password Validation:** Explicit validation checks are added to give the user instant feedback on password requirements as they type.
- **Closing Security Gaps:** Specific test cases are introduced for critical scenarios:
    - **Token Reuse:** Verifies that an already-used token cannot be leveraged again.
    - **User Enumeration Attacks:** Ensures the API does not reveal whether an email is registered or not.
    - **Rate Limiting (Dual Layer):** The mechanism for limiting requests by both IP and email is explicitly tested.
- **Session Invalidation:** An E2E test procedure is detailed to ensure all active user sessions are terminated after a successful password change.

---

## 2. Story Point Estimation Update

The original estimate was 3 Story Points. The improvements and new test scenarios imply an increase in complexity.

- **New UI Components:** Creation of a modal for expired tokens and the real-time password feedback logic.
- **Additional Backend Logic:** Implementation of a dual-layer rate-limiting strategy and more robust post-use token invalidation.
- **Increased Testing Load:** The new security and UI scenarios require a more detailed testing effort.

**Recommended Estimate: 5 Story Points.**

**Justification:** The 2-point increase reflects the transition from a basic functionality to a robust, secure, and superior user experience solution, aligned with industry standards.

---

## 3. Test Strategy (Test Pyramid)

| Test Level      | Scope & Tools                                                                                                                             |       
| :-------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |       
| **Unit Tests**      | **Focus:** Business logic and components in isolation. <br/> **Tools:** `Vitest`, `React Testing Library`.                                 |  
| **Integration** | **Focus:** API endpoints and their interaction with the database (Supabase). <br/> **Tools:** `Vitest`, `Supertest`, `msw`. |
| **End-to-End**    | **Focus:** Complete user flows in a real environment. <br/> **Tools:** `Playwright`.                                                        |   

---

## 4. Detailed Test Cases

### 4.1. Recovery Request Flow

| ID           | Description                                                                                              | Type        | Priority |
| :----------- | :------------------------------------------------------------------------------------------------------- | :---------- | :------- |
| `FT-SQ4-01`  | **Happy Path:** Request a reset with a valid and registered email.                                         | E2E, Integ. | Critical |
| `FT-SQ4-02`  | **Security:** Request a reset with a valid but **unregistered** email.                                     | E2E, Integ. | Critical |
| `FT-SQ4-03`  | **Validation:** Attempt to request a reset with an invalid email format (e.g., "test@test").             | E2E, Unit   | High     |
| `FT-SQ4-04`  | **Security:** Verify that the response (content and timing) for `FT-SQ4-01` and `FT-SQ4-02` is identical.   | Integ.      | Critical |
| `FT-SQ4-05a` | **Security (Rate Limit):** Exceed the request limit per **IP** (e.g., >20 req/min).                        | Integ.      | Critical |
| `FT-SQ4-05b` | **Security (Rate Limit):** Exceed the request limit per **email** (e.g., >3 req/hour).                     | Integ.      | Critical |
| `FT-SQ4-17`  | **UX/UI:** Verify the confirmation page displays the user's masked email (e.g., j***@test.com).          | E2E         | Medium   |
| `FT-SQ4-18`  | **UX/UI:** Verify a "Back to Login" link exists on the request page and works correctly.                   | E2E         | Low      |

### 4.2. Password Reset Flow

| ID          | Description                                                                                                   | Type        | Priority |
| :---------- | :------------------------------------------------------------------------------------------------------------ | :---------- | :------- |
| `FT-SQ4-06` | **Happy Path:** Successfully reset the password with a valid token and a strong password.                       | E2E, Integ. | Critical |
| `FT-SQ4-07` | **Validation:** Attempt to reset with a password that doesn't meet requirements (real-time feedback).         | E2E, Unit   | Critical |
| `FT-SQ4-08` | **Validation:** Attempt to reset with passwords that do not match in the confirmation field.                  | E2E, Unit   | Critical |
| `FT-SQ4-09` | **Security:** Attempt to access the reset link after the token has expired (>1 hour).                           | E2E, Integ. | Critical |
| `FT-SQ4-10` | **Security:** Attempt to reset the password using a token that has **already been used** in a successful reset. | E2E, Integ. | Critical |
| `FT-SQ4-11` | **Security:** Attempt to access the link with an invalid or tampered token.                                     | E2E, Integ. | Critical |
| `FT-SQ4-12` | **UX/UI:** Verify that in the expired token flow (`FT-SQ4-09`), the form is disabled and the modal is shown.   | E2E         | High     |
| `FT-SQ4-13` | **UX:** From the expired token modal, request a new email and successfully complete the flow.                   | E2E         | High     |
| `FT-SQ4-19` | **UX/UI:** Verify that the password requirements are always visible on the reset page.                        | E2E         | Medium   |

### 4.3. Post-Reset Flow

| ID          | Description                                                                                                | Type   | Priority |
| :---------- | :--------------------------------------------------------------------------------------------------------- | :----- | :------- |
| `FT-SQ4-14` | **Security:** Verify the token is immediately invalidated after a successful reset (`FT-SQ4-06`).            | Integ. | Critical |
| `FT-SQ4-15` | **Security:** Verify that all sessions are globally invalidated after a successful reset.                      | E2E    | Critical |
| `FT-SQ4-16` | **Happy Path:** Verify the user is redirected to the login page with a success message after the reset.      | E2E    | High     |

---

## 5. Technical Decisions and Clarifications

This section documents the decisions made from the initial technical questions.

1.  **Session Invalidation Mechanism:**
    -   **Question:** Will `supabase.auth.signOut({ scope: 'global' })` be used to invalidate all sessions?
    -   **Decision:** **Yes.** Use of this function is confirmed. This allows for a more reliable integration test (`FT-SQ4-15`) by directly verifying that previous sessions are no longer valid.

2.  **Rate Limiting Strategy:**
    -   **Question:** Will the limit be applied per email, per IP, or a combination?
    -   **Decision:** A **dual-layer strategy** has been agreed upon for maximum security and efficiency:
        -   **Layer 1 (By IP):** A generous, short-term limit (e.g., 20 req/min) managed at the middleware level to block volumetric attacks early.
        -   **Layer 2 (By Email):** A strict, long-term limit (3 req/hour) managed in the API logic to prevent harassment of specific accounts.
    -   **Testing Implication:** Test cases `FT-SQ4-05a` and `FT-SQ4-05b` have been created to validate both layers independently.