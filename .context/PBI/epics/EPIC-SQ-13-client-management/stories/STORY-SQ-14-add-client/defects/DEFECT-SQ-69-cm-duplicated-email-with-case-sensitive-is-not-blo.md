# DEFECT: CM | Duplicated email with case-sensitive is not bloking the client creation (getting 201 instead 409)

**Jira Key:** [SQ-69](https://upexgalaxy65.atlassian.net/browse/SQ-69)
**Related Story:** [SQ-14](https://upexgalaxy65.atlassian.net/browse/SQ-14) - Add New Client
**Priority:** High
**Status:** CLOSED
**Components:** None
**Severity:** Moderada
**Error Type:** Functional
**Test Environment:** QA
**Fix Type:** Bugfix

---

## Description

Preconditions:

- Create a client with name “B” and email “A” (variable)

Steps:

- Go to 'Clients' Page
- Open Create Client page
- Enter Email Z (as required) and Email “A” (same as existing email in database for same user_id)
- Confirm Client creation clicking on Save Client.

---

## 🐞 Actual Result

- Client creation is executed without blocking the user when the entered email is existing in database (including case-sensitive), and it’s getting 201.

---

## ✅ Expected Result

- Should block user to create the client with given email (existing in database), no matter what case-sensitive it is.

---

## 🚩 Workaround

The only way to block the user to create the client is to enter existing EXACT email from the database.

---

## Related Issues

- blocks: [SQ-14](https://upexgalaxy65.atlassian.net/browse/SQ-14) - Add New Client

---

## Metadata

- **Created:** 2/3/2026
- **Updated:** 2/10/2026
- **Reporter:** Ely
- **Assignee:** Ely
- **Labels:** Email

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:24.159Z_
