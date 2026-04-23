# API Exploratory Session Notes - SQ-51

**Date:** 2026-04-12
**Story:** SQ-51 - Search invoices by client or number
**Environment:** Staging (`https://staging-upexsoloq.vercel.app`)
**Execution mode:** Manual collaborative (DevTools Network + Postman)

---

## Summary

- **Overall status:** PASSED
- **Endpoints tested:** `GET /api/invoices`, `POST /auth/v1/token?grant_type=password`
- **Auth flows tested:** valid token, missing token (unauthorized)
- **New API defects:** none

---

## Executed Scenarios

1. **Exact invoice search**
   - Request: `GET /api/invoices?search=INV-2026-20354&page=1&limit=20`
   - Result: `200`, total `1`, target invoice returned.
   - Status: PASS

2. **Partial invoice search**
   - Request: `GET /api/invoices?search=20354&page=1&limit=20`
   - Result: `200`, total `1`.
   - Status: PASS

3. **Client/email case-insensitive search**
   - Request: `GET /api/invoices?search=POSTMAN&page=1&limit=20`
   - Result: `200`, total `3`, expected client-linked invoices returned.
   - Status: PASS

4. **No-results search**
   - Request: `GET /api/invoices?search=zzzz-not-found&page=1&limit=20`
   - Result: `200`, `data: []`, total `0`.
   - Status: PASS

5. **Status filter + search + pagination precedence (retest)**
   - Request: `GET /api/invoices?status=draft&search=20354&page=1&limit=20`
   - Result: `200`, total `1`, consistent filtered result.
   - Status: PASS

6. **Query trim normalization (retest)**
   - Request A: `GET /api/invoices?search=%20%20INV-2026-20354%20%20&page=1&limit=20`
   - Request B: `GET /api/invoices?search=INV-2026-20354&page=1&limit=20`
   - Result: both `200`, both total `1`, same invoice returned.
   - Status: PASS

7. **Unauthorized request**
   - Request: `GET /api/invoices?...` without `Authorization` header
   - Result: `401` with `No autorizado`.
   - Status: PASS

---

## Notes

- The Supabase REST docs page in staging showed an invalid `apikey` for direct REST browsing during this session. This did not block Story API testing because story endpoints were validated through Next.js API (`/api/invoices`) with bearer token auth.
- Existing issue `SQ-169` remains a UI/copy state-separation defect (no-results vs empty-state), not an API defect.

---

## DB Layer Status

- **Exploratory DB:** pending due missing direct project access in Supabase SQL Editor/DBHub for current tester.
- **Impact:** API evidence is complete; DB verification is deferred until access is granted.

---

## Recommendation

- Keep `SQ-51` in `In Test` until `SQ-169` is fixed and UI retest confirms differentiated no-results state copy.
