# Upload Business Logo

**Jira Key:** [SQ-9](https://upexgalaxy64.atlassian.net/browse/SQ-9)
**Epic:** [SQ-7](https://upexgalaxy64.atlassian.net/browse/SQ-7) (Business Profile Management)
**Priority:** Medium
**Story Points:** 3
**Status:** Backlog
**Assignee:** Unassigned

---

## User Story

**As a** user
**I want to** upload my logo
**So that** I can personalize my invoices

---

## Description

Como freelancer, quiero poder subir el logo de mi negocio o marca personal para que aparezca en mis facturas. Esto proyecta profesionalismo y ayuda a mis clientes a identificar mis documentos rápidamente.

---

## Acceptance Criteria (Gherkin format)

### Scenario 1: Upload logo successfully

- **Given:** I am on the business profile settings page
- **When:** I upload a valid image (PNG/JPG, max 2MB)
- **Then:** The logo is saved and displayed as a preview

### Scenario 2: Reject invalid file format

- **Given:** I am uploading a logo
- **When:** I select a non-image file or unsupported format (PDF, GIF, etc.)
- **Then:** I see an error "Please upload a PNG or JPG image"

### Scenario 3: Reject oversized file

- **Given:** I am uploading a logo
- **When:** I select an image larger than 2MB
- **Then:** I see an error "Image must be smaller than 2MB"

### Scenario 4: Logo appears on invoice

- **Given:** I have uploaded a logo
- **When:** I generate an invoice PDF
- **Then:** My logo appears in the invoice header

### Scenario 5: Remove logo

- **Given:** I have a logo configured
- **When:** I click "Remove logo"
- **Then:** The logo is deleted and invoices show just the business name

### Scenario 6: Replace existing logo

- **Given:** I have a logo already uploaded
- **When:** I upload a new logo
- **Then:** The old logo is replaced and the new one is displayed

---

## Technical Notes

### Frontend

- Drag & drop zone or file input
- Image preview after selection
- Client-side resize to max 400x400px before upload
- Components: `LogoUploader`, `ImagePreview`
- Route: `/settings/profile` or `/onboarding` (step 3)

### Backend

- API: `POST /api/profile/logo` (multipart/form-data)
- API: `DELETE /api/profile/logo`
- Store in Supabase Storage bucket: `logos`
- Save URL in `business_profiles.logo_url`

### Storage

- Bucket: `logos`
- Path: `{user_id}/logo.{ext}`
- Max size: 2MB
- Allowed MIME types: `image/png`, `image/jpeg`
- RLS: User can only access their own folder

### Image Processing (Client-side)

```typescript
// Resize before upload
const resizeImage = async (file: File, maxSize: number = 400): Promise<Blob> => {
  // Use canvas to resize
  // Return resized blob
};
```

---

## Dependencies

### Blocked By

- SQ-8 (Configure Business Name) - profile must exist first
- Supabase Storage bucket setup

### Blocks

- EPIC 5 (PDF Generation) - needs logo for PDF header

### Related Stories

- SQ-6: Guided Onboarding (optional step 3)
- EPIC 5: PDF Generation (displays logo)

---

## UI/UX Considerations

- Drag & drop zone with dashed border
- Preview thumbnail after upload
- "Remove" button visible on hover
- Loading spinner during upload
- File size shown before upload
- Mobile: Tap to open camera/gallery

---

## Definition of Done

- [ ] Logo upload component implemented
- [ ] Drag & drop working
- [ ] File validation (type, size)
- [ ] Client-side resize working
- [ ] Supabase Storage integration
- [ ] Preview display working
- [ ] Remove functionality working
- [ ] Logo displays on invoice
- [ ] Unit tests > 80% coverage
- [ ] Integration tests for upload API
- [ ] E2E test for upload flow
- [ ] Code review approved (2 reviewers)
- [ ] Deployed to staging
- [ ] QA testing passed

---

## Testing Strategy

See: `test-cases.md` (Fase 5)

**Test Cases Expected:** 8+ detailed test cases covering:

- Successful upload (PNG and JPG)
- Invalid format rejection
- Oversized file rejection
- Remove logo
- Replace logo
- Display on invoice

---

## Implementation Plan

See: `implementation-plan.md` (Fase 6)

**Implementation Steps Expected:**

1. Create LogoUploader component
2. Implement drag & drop functionality
3. Add client-side validation (type, size)
4. Implement image resize utility
5. Create upload API route with Supabase Storage
6. Create delete API route
7. Update business_profiles.logo_url
8. Add preview component
9. Integrate with onboarding flow
10. Write tests

---

## Notes

- Consider adding image crop functionality in v2
- Logos should have transparent backgrounds (PNG) for best results
- Fallback to business name initials if no logo

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-7-business-profile/epic.md`
- **PRD:** `.context/PRD/mvp-scope.md`
- **SRS:** `.context/SRS/functional-specs.md` (FR-008)
