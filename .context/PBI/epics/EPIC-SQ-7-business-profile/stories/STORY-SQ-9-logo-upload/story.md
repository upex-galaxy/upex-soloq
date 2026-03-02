# As a user, I want to upload my logo so that I can personalize my invoices

**Jira Key:** [SQ-9](https://upexgalaxy65.atlassian.net/browse/SQ-9)
**Epic:** [SQ-7](https://upexgalaxy65.atlassian.net/browse/SQ-7) (Business Profile Management)
**Priority:** Medium
**Story Points:** 3
**Status:** Backlog

---

## User Story

## User Story

***As a*** user
***I want to*** upload my logo
***So that*** I can personalize my invoices

## Acceptance Criteria

### Scenario 1: Upload logo successfully

- ***Given:*** I am on the business profile settings page
- ***When:*** I upload a valid image (PNG/JPG, max 2MB)
- ***Then:*** The logo is saved and displayed as a preview

### Scenario 2: Reject invalid file format

- ***Given:*** I am uploading a logo
- ***When:*** I select a non-image file or unsupported format
- ***Then:*** I see an error "Please upload a PNG or JPG image"

### Scenario 3: Reject oversized file

- ***Given:*** I am uploading a logo
- ***When:*** I select an image larger than 2MB
- ***Then:*** I see an error "Image must be smaller than 2MB"

### Scenario 4: Logo appears on invoice

- ***Given:*** I have uploaded a logo
- ***When:*** I generate an invoice PDF
- ***Then:*** My logo appears in the invoice header

### Scenario 5: Remove logo

- ***Given:*** I have a logo configured
- ***When:*** I click "Remove logo"
- ***Then:*** The logo is deleted and invoices show a placeholder or just business name

## Technical Notes

- Supabase Storage bucket: `logos`
- Resize to max 400x400px on client
- Store path in `business*profiles.logo*url`
- RLS on storage bucket

## Story Points

3

---

## Acceptance Criteria

1. 

- ****Given:**** I am on the business profile settings page
- ****When:**** I upload a valid image (PNG/JPG, max 2MB)
- ****Then:**** The logo is saved and displayed as a preview

1. 

- ****Given:**** I am uploading a logo
- ****When:**** I select a non-image file or unsupported format (PDF, GIF, etc.)
- ****Then:**** I see an error "Please upload a PNG or JPG image"

1. 

- ****Given:**** I am uploading a logo
- ****When:**** I select an image larger than 2MB
- ****Then:**** I see an error "Image must be smaller than 2MB"

1. 

- ****Given:**** I have uploaded a logo
- ****When:**** I generate an invoice PDF
- ****Then:**** My logo appears in the invoice header

1. 

- ****Given:**** I have a logo configured
- ****When:**** I click "Remove logo"
- ****Then:**** The logo is deleted and invoices show just the business name

1. 

- ****Given:**** I have a logo already uploaded
- ****When:**** I upload a new logo
- ****Then:**** The old logo is replaced and the new one is displayed

---

## Scope

1. 

- Drag & drop zone or file input for logo upload
- Image preview after selection
- Client-side resize to max 400x400px before upload
- File validation (type: PNG/JPG, size: max 2MB)
- Supabase Storage integration (bucket: logos)
- Remove logo functionality
- Replace existing logo
- Display logo on invoice PDF header

1. 

- Image cropping functionality
- Multiple logos/variants
- Logo templates or auto-generation
- SVG support
- Animated GIFs

---

## Definition of Done

- [ ] Implementation complete
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Documentation updated

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 3/2/2026
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:41.270Z_
