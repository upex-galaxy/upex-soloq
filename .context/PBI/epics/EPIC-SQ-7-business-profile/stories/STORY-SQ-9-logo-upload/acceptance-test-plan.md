# Acceptance Test Plan: STORY-SQ-9 - Logo Upload

**Fecha:** 2026-03-11
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-9
**Epic:** EPIC-SQ-7 - Business Profile Management
**Status:** Draft

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Designer, México) - Como diseñador, su logo ES su marca. Es el elemento visual más importante de su factura
- **Secondary:** Valentina (Developer, Colombia) - Logo da profesionalismo ante clientes internacionales (startups US/EU)

**Business Value:**

- **Value Proposition:** Logo personaliza la factura y diferencia al freelancer de competencia. Facturas con logo generan 30% más confianza (industry benchmark)
- **Business Impact:** Engagement indicator - uso de logo correlaciona con retention y upgrade a Pro

**Related User Journey:**

- Journey 1 (Registration & First Invoice): Onboarding paso 3 - logo upload
- Journey 4 (Invoice Editing): Logo en header del PDF

### Technical Context of This Story

**Frontend:**

- Components: Drag & drop zone, file input fallback, image preview, Remove/Replace buttons
- Client-side: Image resize to max 400x400px, format validation, size validation
- Pages/Routes: `/settings` (logo section), `/onboarding` (step 3)

**Backend:**

- API: `POST /api/profile/logo` - upload to Supabase Storage
- Storage: Supabase Storage bucket `logos`, path: `{user_id}/logo.{ext}`
- Database: `business_profiles.logo_url` (TEXT) - stores public URL

**External Services:**

- Supabase Storage: Upload, serve, delete files with RLS

**Integration Points:**

- Frontend File Input → Client Resize → Supabase Storage API
- Supabase Storage → logo_url → business_profiles table
- logo_url → Invoice PDF header (image rendering via @react-pdf/renderer)

### Story Complexity Analysis

**Overall Complexity:** Medium-High

**Complexity Factors:**

- Business logic: Low - upload/delete/replace
- Integration: High - Supabase Storage + client-side processing + PDF rendering
- Data validation: Medium - file type, size, dimensions
- UI: Medium - drag & drop, preview, loading states

**Estimated Test Effort:** Medium-High

---

### Epic-Level Context (From Feature Test Plan)

**Critical Risks Relevant:**

- Risk 2 (Client-Side Image Processing): Resize to 400x400px across browsers
- Risk 3 (Profile → PDF): Logo must render in @react-pdf/renderer

**Integration Points:**

- Frontend ↔ Supabase Storage: ✅ Critical for this story
- Profile Data ↔ Invoice PDF: ✅ Logo in PDF header

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1:** Resize behavior for non-square images

- **Location:** Technical Notes - "Resize to max 400x400px"
- **Question for Dev:** ¿Se recorta (crop) o se escala proporcionalmente? Si es 800x400, ¿resultado es 400x200 o 400x400 con crop?
- **Impact on Testing:** Affects visual quality validation
- **Suggested Clarification:** "Scale proportionally to fit within 400x400px, maintaining aspect ratio"

**Ambiguity 2:** Storage path and naming convention

- **Location:** Technical Notes - "Supabase Storage bucket: logos"
- **Question for Dev:** ¿El path es `{user_id}/logo.png`? ¿Se mantiene extensión original? ¿Se sobreescribe al reemplazar?
- **Impact on Testing:** Affects cleanup and replace testing

### Missing Information / Gaps

**Gap 1:** No AC for upload progress/loading state

- **Type:** UX
- **Why Critical:** 2MB files over slow connections need progress indicator
- **Suggested Addition:** AC: "While uploading, a progress indicator is shown"

**Gap 2:** No AC for network error during upload

- **Type:** Error Handling
- **Why Critical:** Upload can fail due to network timeout, storage error
- **Suggested Addition:** AC: "If upload fails, error message shown and user can retry"

### Edge Cases NOT Covered

**Edge Case 1:** HEIC/WEBP format (modern phone cameras)

- **Scenario:** User uploads .heic or .webp image from iPhone
- **Expected Behavior:** Clear error message - only PNG/JPG supported
- **Criticality:** Medium (common on mobile)
- **Action Required:** Add to test cases

**Edge Case 2:** Very large dimensions (e.g., 10000x10000px) but under 2MB

- **Scenario:** Highly compressed large image under 2MB
- **Expected Behavior:** Client resize handles it, final image is 400x400
- **Criticality:** Medium
- **Action Required:** Add to test cases

**Edge Case 3:** Transparent PNG logo

- **Scenario:** User uploads PNG with transparency
- **Expected Behavior:** Transparency preserved in preview and PDF
- **Criticality:** High (designers commonly use transparent logos)
- **Action Required:** Add to test cases

### Testability Validation

**Is this story testeable as written?** ⚠️ Partially - Missing error handling ACs and resize behavior specification

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Upload valid PNG logo successfully

**Type:** Positive
**Priority:** Critical

- **Given:** User on business profile settings, no logo configured
- **When:** User uploads a valid PNG file (500x500px, 800KB) via file input or drag & drop
- **Then:**
  - Image is resized client-side to max 400x400px
  - File is uploaded to Supabase Storage bucket `logos`
  - `business_profiles.logo_url` is updated with storage URL
  - Logo preview displays in settings page
  - Success message confirms upload

### Scenario 2: Upload valid JPG logo successfully

**Type:** Positive
**Priority:** Critical

- **Given:** User on business profile settings
- **When:** User uploads valid JPG (1.9MB, 800x600px)
- **Then:** Same as Scenario 1 - resized, stored, preview shown

### Scenario 3: Reject non-image file

**Type:** Negative
**Priority:** High

- **Given:** User on business profile settings
- **When:** User selects a PDF, GIF, SVG, or .doc file
- **Then:**
  - Error message: "Please upload a PNG or JPG image"
  - File is NOT uploaded
  - No changes to storage or DB

### Scenario 4: Reject oversized file (>2MB)

**Type:** Negative
**Priority:** High

- **Given:** User on business profile settings
- **When:** User selects a PNG/JPG larger than 2MB
- **Then:**
  - Error message: "Image must be smaller than 2MB"
  - File is NOT uploaded

### Scenario 5: Logo appears on invoice PDF

**Type:** Integration
**Priority:** Critical

- **Given:** User has uploaded a logo
- **When:** User generates invoice PDF
- **Then:** Logo appears in invoice header, properly sized and positioned

### Scenario 6: Remove existing logo

**Type:** Positive
**Priority:** High

- **Given:** User has a logo configured
- **When:** User clicks "Remove logo"
- **Then:**
  - Logo is deleted from Supabase Storage
  - `business_profiles.logo_url` is set to null
  - Preview shows placeholder or business name only
  - Invoices generated after removal show no logo

### Scenario 7: Replace existing logo with new one

**Type:** Positive
**Priority:** High

- **Given:** User has logo "old-logo.png" configured
- **When:** User uploads "new-logo.jpg"
- **Then:**
  - Old logo is deleted from Storage
  - New logo is saved
  - Preview shows new logo
  - `logo_url` updated to new file

### Scenario 8: Transparent PNG preserved

**Type:** Edge Case
**Priority:** Medium

- **Given:** User on business profile settings
- **When:** User uploads PNG with transparency (alpha channel)
- **Then:**
  - Transparency is preserved in preview
  - Transparency renders correctly on invoice PDF (or with white background)

### Scenario 9: Reject HEIC/WEBP format with clear error

**Type:** Negative
**Priority:** Medium

- **Given:** User on business profile settings (mobile or desktop)
- **When:** User selects .heic or .webp file
- **Then:** Error: "Please upload a PNG or JPG image"

### Scenario 10: Handle very large dimension image (under 2MB)

**Type:** Boundary
**Priority:** Medium

- **Given:** User on business profile settings
- **When:** User uploads 5000x5000px PNG (1.5MB, highly compressed)
- **Then:** Client-side resize handles it correctly, final image is ≤400x400px

### Scenario 11: Reject 0-byte/corrupt file

**Type:** Negative
**Priority:** Medium

- **Given:** User on business profile settings
- **When:** User uploads a 0-byte file or corrupt image
- **Then:** Error message displayed, file not uploaded

### Scenario 12: File exactly 2MB is accepted

**Type:** Boundary
**Priority:** Medium

- **Given:** User on business profile settings
- **When:** User uploads PNG that is exactly 2,097,152 bytes (2MB)
- **Then:** File is accepted and processed normally

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 12

- Positive: 4 (upload PNG, upload JPG, remove, replace)
- Negative: 4 (invalid format, oversized, HEIC/WEBP, corrupt file)
- Boundary: 2 (exactly 2MB, large dimensions)
- Integration: 1 (logo on PDF)
- Edge: 1 (transparent PNG)

---

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Parametrized Test Group 1:** File format validation

| File Extension | MIME Type | Size | Expected Result |
|---------------|-----------|------|-----------------|
| .png | image/png | 500KB | ✅ Accepted |
| .jpg | image/jpeg | 1MB | ✅ Accepted |
| .jpeg | image/jpeg | 800KB | ✅ Accepted |
| .gif | image/gif | 200KB | ❌ Rejected - "Upload PNG or JPG" |
| .svg | image/svg+xml | 50KB | ❌ Rejected |
| .pdf | application/pdf | 1MB | ❌ Rejected |
| .heic | image/heic | 1.5MB | ❌ Rejected |
| .webp | image/webp | 300KB | ❌ Rejected |

**Total Tests from Parametrization:** 8 (but some overlap with individual TCs)

---

### Test Outlines

#### **Should upload PNG logo successfully and display preview**

**Related Scenario:** Scenario 1
**Type:** Positive
**Priority:** Critical
**Test Level:** E2E

**Preconditions:**

- User authenticated, on `/settings` page
- No logo currently configured

**Test Steps:**

1. Locate logo upload section
2. Upload valid PNG file (500x500px, 800KB)
   - **Data:** test-logo.png
3. Wait for upload to complete
4. **Verify:** Preview displays, success message shown

**Expected Result:**

- **UI:** Logo preview visible, success toast
- **Database:** `business_profiles.logo_url` contains Supabase Storage URL
- **Storage:** File exists in `logos` bucket

---

#### **Should reject non-image file formats**

**Related Scenario:** Scenario 3
**Type:** Negative
**Priority:** High
**Test Level:** UI
**Parametrized:** ✅ Yes (Group 1)

**Test Steps:**

1. Attempt to upload file with unsupported format (PDF, GIF, SVG, HEIC, WEBP)
2. **Verify:** Error message displayed

**Expected Result:**

- **UI:** Error: "Please upload a PNG or JPG image"
- **Storage:** NO file uploaded
- **Database:** NO changes to logo_url

---

#### **Should reject files exceeding 2MB**

**Related Scenario:** Scenario 4
**Type:** Negative
**Priority:** High
**Test Level:** UI

**Test Steps:**

1. Upload PNG/JPG file that is 3MB
2. **Verify:** Error message displayed

**Expected Result:**

- **UI:** Error: "Image must be smaller than 2MB"

---

#### **Should accept file exactly 2MB (boundary)**

**Related Scenario:** Scenario 12
**Type:** Boundary
**Priority:** Medium
**Test Level:** UI

**Test Steps:**

1. Upload PNG file that is exactly 2,097,152 bytes
2. **Verify:** File accepted and processed

---

#### **Should remove existing logo and clean up storage**

**Related Scenario:** Scenario 6
**Type:** Positive
**Priority:** High
**Test Level:** E2E

**Preconditions:**

- User has logo uploaded

**Test Steps:**

1. Click "Remove logo" button
2. Confirm removal (if confirmation dialog exists)
3. **Verify:** Preview removed, placeholder shown

**Expected Result:**

- **UI:** Placeholder or business name shown
- **Database:** `logo_url` = null
- **Storage:** File deleted from bucket

---

#### **Should replace existing logo with new one**

**Related Scenario:** Scenario 7
**Type:** Positive
**Priority:** High
**Test Level:** E2E

**Preconditions:**

- User has existing logo

**Test Steps:**

1. Upload new image file
2. **Verify:** New logo replaces old one

**Expected Result:**

- **UI:** New logo displayed in preview
- **Storage:** Old file deleted, new file stored
- **Database:** `logo_url` updated to new URL

---

#### **Should display logo correctly on invoice PDF**

**Related Scenario:** Scenario 5
**Type:** Integration
**Priority:** Critical
**Test Level:** E2E

**Preconditions:**

- User has logo configured
- User has complete profile and at least one client

**Test Steps:**

1. Create new invoice
2. Generate/preview PDF
3. **Verify:** Logo appears in header

**Expected Result:**

- **PDF:** Logo visible in header, properly sized, good quality

---

#### **Should preserve transparency in PNG logos**

**Related Scenario:** Scenario 8
**Type:** Edge Case
**Priority:** Medium
**Test Level:** E2E

**Test Steps:**

1. Upload PNG with alpha channel (transparent background)
2. **Verify:** Preview shows transparency
3. Generate invoice PDF
4. **Verify:** Logo renders appropriately on PDF

---

#### **Should handle very large dimension images under 2MB**

**Related Scenario:** Scenario 10
**Type:** Boundary
**Priority:** Medium
**Test Level:** UI

**Test Steps:**

1. Upload 5000x5000px PNG (1.5MB, highly compressed)
2. **Verify:** Image is resized to ≤400x400px and uploaded successfully

---

#### **Should reject corrupt/empty files**

**Related Scenario:** Scenario 11
**Type:** Negative
**Priority:** Medium
**Test Level:** UI

**Test Steps:**

1. Upload 0-byte file renamed to .png
2. **Verify:** Error message displayed, no upload

---

## Edge Cases Summary

| Edge Case | Covered in Original Story? | Added to Refined AC? | Priority |
|-----------|---------------------------|---------------------|----------|
| Transparent PNG | ❌ No | ✅ Yes (Scenario 8) | Medium |
| HEIC/WEBP formats | ❌ No | ✅ Yes (Scenario 9) | Medium |
| Very large dimensions | ❌ No | ✅ Yes (Scenario 10) | Medium |
| Corrupt/empty file | ❌ No | ✅ Yes (Scenario 11) | Medium |
| Network error during upload | ❌ No | ⚠️ Needs PO confirmation | Medium |

---

## Test Data Summary

| Data Type | Count | Purpose | Examples |
|-----------|-------|---------|----------|
| Valid images | 3 | Positive tests | PNG 500x500 (800KB), JPG 800x600 (1.9MB), PNG transparent |
| Invalid files | 5 | Negative tests | PDF, GIF, SVG, HEIC, 0-byte file |
| Boundary images | 2 | Boundary tests | Exactly 2MB, 5000x5000px (1.5MB) |
| Oversized | 1 | Negative test | 3MB PNG |

---

## Definition of Done (QA Perspective)

- [ ] All 12 test cases executed
- [ ] Upload, remove, replace flows working
- [ ] Invalid formats properly rejected with clear error messages
- [ ] Logo renders on invoice PDF
- [ ] Supabase Storage cleanup verified (no orphaned files)
- [ ] Cross-browser: Chrome, Firefox, Safari

---

## Related Documentation

- **Story:** `.context/PBI/epics/EPIC-SQ-7-business-profile/stories/STORY-SQ-9-logo-upload/story.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-7-business-profile/feature-test-plan.md`
