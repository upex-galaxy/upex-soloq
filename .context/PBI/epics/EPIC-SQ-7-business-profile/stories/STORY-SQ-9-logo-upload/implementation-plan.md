# Implementation Plan: STORY-SQ-9 - Upload Logo

## Overview

Implementar la funcionalidad para que el usuario pueda subir, previsualizar, reemplazar y eliminar su logo desde Settings. El logo se almacena en Supabase Storage y se redimensiona client-side a max 400x400px (proportional scale). Aparece en el encabezado de las facturas.

**Acceptance Criteria a cumplir:**

- AC1: Upload valid image (PNG/JPG, max 2MB) → saved and displayed as preview
- AC2: Reject invalid file format → error "Please upload a PNG or JPG image"
- AC3: Reject oversized file (>2MB) → error "Image must be smaller than 2MB"
- AC4: Logo appears on invoice PDF header
- AC5: Remove logo → deleted, invoices show placeholder/business name only

---

## Technical Approach

**Chosen approach:** Client-side resize con Canvas API (proportional scale to fit 400x400px) → upload a Supabase Storage bucket `logos` → guardar public URL en `business_profiles.logo_url` → preview con Image component.

**Alternatives considered:**

- Server-side resize con Sharp: Requiere API route adicional, más complejidad
- Upload sin resize: Archivos grandes afectan performance del PDF

**Why this approach:**

- ✅ Canvas API estándar en todos browsers modernos
- ✅ Reduce tamaño antes de upload (mejor performance)
- ✅ Proportional scale preserva aspect ratio (decisión Shift-Left: no crop)
- ✅ Supabase Storage con RLS protege archivos por usuario
- ❌ Trade-off: Canvas no disponible en Server Components (OK - upload es client-side)

---

## UI/UX Design

### Componentes del Design System a usar:

- ✅ `Card` / `CardHeader` / `CardContent`
- ✅ `Button`: Upload, Remove
- ✅ `Input` (type="file"): File selector (hidden, triggered by button/drop zone)
- ✅ `Avatar`: Preview circular del logo
- ✅ `Skeleton`: Loading state

### Componentes custom:

- 🆕 `LogoUpload` → `src/components/settings/logo-upload.tsx`
  - **Propósito:** Upload, preview, replace, remove logo
  - **Props:** `businessProfile: BusinessProfile | null`, `onSuccess?: () => void`

### Wireframe (dentro de Tab "Perfil", debajo de Business Name):

```
┌──────────────────────────────────────────────────────┐
│ Logo de tu negocio                                    │
│ Personaliza tus facturas con tu logo. PNG o JPG,      │
│ máximo 2MB.                                           │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │     ┌──────────┐                                │  │
│  │     │  LOGO    │  [Subir logo]  [Eliminar]      │  │
│  │     │ (preview)│                                │  │
│  │     └──────────┘                                │  │
│  │                                                 │  │
│  │  ─── o arrastra una imagen aquí ───             │  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  Formatos: PNG, JPG. Tamaño máximo: 2MB.              │
│  Se redimensionará a un máximo de 400×400px.          │
└──────────────────────────────────────────────────────┘
```

### Estados de UI:

- **No logo:** Drop zone con dashed border + icono de upload + texto "Sube tu logo"
- **Uploading:** Progress indicator / spinner overlay
- **Has logo:** Preview del logo + botones "Cambiar" y "Eliminar"
- **Error:** Toast con mensaje específico (formato, tamaño, red)
- **Removing:** Spinner en botón "Eliminar"

### Validaciones:

- **Formato:** Solo PNG, JPG (MIME type check + extension check)
- **Tamaño:** Max 2MB antes de resize
- **Dimensiones:** Sin mínimo, max resize a 400x400px proportional
- **Reject:** HEIC, WEBP, GIF, SVG, PDF, archivos corruptos/vacíos

---

## Types & Type Safety

**Tipos existentes:**

```typescript
import type { BusinessProfile } from '@/lib/types';
// logo_url: string | null en BusinessProfile
```

**Utility function type:**

```typescript
// lib/utils/image-resize.ts
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<Blob>;
```

---

## Content Writing

- Card title: "Logo de tu negocio"
- Card description: "Personaliza tus facturas con tu logo. PNG o JPG, máximo 2MB."
- Drop zone text: "Sube tu logo o arrástralo aquí"
- Drop zone hint: "PNG o JPG, máximo 2MB"
- Upload button: "Subir logo"
- Change button: "Cambiar"
- Remove button: "Eliminar"
- Upload success toast: "Logo actualizado"
- Remove success toast: "Logo eliminado"
- Format error: "Formato no soportado. Usa PNG o JPG."
- Size error: "La imagen debe ser menor a 2MB."
- Network error: "Error al subir. Intenta de nuevo."
- Resize note: "Se redimensionará a un máximo de 400×400px."

---

## Implementation Steps

### **Step 1: Verify/Create Supabase Storage bucket**

**Task:** Asegurar que el bucket `logos` existe con las RLS policies correctas

**Details:**

- Verificar con Supabase MCP si bucket `logos` existe
- Si no existe, crear bucket público con RLS:
  - Policy: users can upload to their own folder (`{user_id}/`)
  - Policy: users can delete their own files
  - Policy: public read (logos aparecen en PDFs compartidos)
- Naming convention: `{user_id}/{timestamp}.{ext}`

**Testing:**

- Upload a bucket funciona con auth
- No se puede acceder a archivos de otro usuario (write)
- Read público funciona

**Estimated time:** 20 min

---

### **Step 2: Create image resize utility**

**Task:** Utility function para resize proporcional con Canvas API

**File:** `src/lib/utils/image-resize.ts`

**Details:**

- `resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob>`
- Calcula dimensiones proportionales (fit within maxWidth x maxHeight)
- Usa Canvas API para resize
- Preserva formato original (PNG→PNG, JPG→JPEG)
- Preserva transparencia en PNG
- Returns Blob listo para upload

**Edge cases handled:**

- Imagen más pequeña que 400x400: No resize, return original
- Imagen no cuadrada: Proportional scale (800x400 → 400x200)
- Very large dimensions (5000x5000): Scale down correctamente
- Transparent PNG: Alpha channel preservado

**Testing:**

- 800x400 → 400x200 (proportional)
- 200x200 → 200x200 (no resize)
- 5000x5000 → 400x400 (scale down)
- PNG transparency preserved

**Estimated time:** 30 min

---

### **Step 3: Create LogoUpload component**

**Task:** Componente completo para upload, preview, replace, remove

**File:** `src/components/settings/logo-upload.tsx`

**Details:**

- Drop zone con dashed border + click to upload
- Hidden file input con `accept="image/png,image/jpeg"`
- File validation: type check (PNG/JPG only), size check (<=2MB)
- On valid file: resize → upload to Supabase Storage → save URL to business_profiles
- Preview: Mostrar logo actual con `next/image` o `<img>` con Supabase URL
- Replace: Same flow as upload, delete old file first
- Remove: Delete from Storage + set `logo_url = null` in DB
- Loading states: spinner durante upload/remove
- Error handling: Toast para cada tipo de error
- Drag and drop support con `onDragOver`, `onDrop` events
- data-testid: `logo-preview`, `logo-upload-input`, `logo-upload-button`, `logo-remove-button`, `logo-dropzone`

**Upload flow:**

1. User selects/drops file
2. Validate format (PNG/JPG) and size (<=2MB)
3. Resize with `resizeImage()` (max 400x400)
4. Upload to Supabase Storage: `logos/{user_id}/{timestamp}.png`
5. Get public URL
6. Update `business_profiles.logo_url` with public URL
7. Invalidate cache
8. Show preview + success toast

**Remove flow:**

1. User clicks "Eliminar"
2. Confirmation (optional - simple enough to skip)
3. Delete file from Supabase Storage
4. Set `logo_url = null` in business_profiles
5. Invalidate cache
6. Show empty drop zone + success toast

**Edge cases handled:**

- HEIC/WEBP files: Rejected with clear error message
- Corrupt/0-byte files: Canvas will fail → catch and show error
- Network error during upload: Toast "Error al subir. Intenta de nuevo."
- Replace existing logo: Delete old → upload new (atomic as possible)

**Testing:**

- Upload PNG successfully → preview shows
- Upload JPG successfully → preview shows
- Reject PDF, GIF, SVG with error message
- Reject >2MB with size error
- Remove logo → drop zone shows
- Replace logo → new preview shows
- Drag and drop works

**Estimated time:** 60 min

---

### **Step 4: Integrate with Settings page**

**Task:** Agregar LogoUpload al tab "Perfil" debajo del BusinessNameForm

**File:** `src/app/(app)/settings/page.tsx`

**Details:**

- Import LogoUpload component
- Render debajo del BusinessNameForm en TabsContent "perfil"
- Pasar businessProfile como prop
- Separator visual entre business name form y logo upload

**Testing:**

- Tab "Perfil" muestra both BusinessNameForm y LogoUpload
- Both function independently

**Estimated time:** 10 min

---

### **Step 5: Integration & Verification**

**Task:** Verificar integración completa

**Details:**

1. Upload PNG → preview → verificar en Supabase Storage
2. Upload JPG → preview → verificar URL en business_profiles
3. Reject HEIC/GIF/SVG → error message
4. Reject >2MB → size error
5. Remove logo → null en DB, file deleted from Storage
6. Replace logo → old file deleted, new file uploaded
7. Logo en invoice PDF (verificación visual si existe)
8. `bun run lint && bun run build`

**Estimated time:** 20 min

---

## Test Cases Mapping

| TC# | Test Case | Step |
|-----|-----------|------|
| TC-1 | Upload PNG successfully + preview | Step 3 |
| TC-2 | Upload JPG successfully | Step 3 |
| TC-3 | Reject non-image (PDF, GIF, SVG, HEIC, WEBP) | Step 3 |
| TC-4 | Reject >2MB | Step 3 |
| TC-5 | Accept exactly 2MB - boundary | Step 3 |
| TC-6 | Remove existing logo | Step 3 |
| TC-7 | Replace existing logo | Step 3 |
| TC-8 | Logo on invoice PDF | Step 5 |
| TC-9 | Preserve PNG transparency | Step 2 |
| TC-10 | Handle large dimensions under 2MB | Step 2 |
| TC-11 | Reject corrupt/empty files | Step 3 |
| TC-12 | Reject HEIC/WEBP with clear error | Step 3 |

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] SQ-8 implementado (settings page structure with Tabs + "Perfil" tab)
- [x] `useBusinessProfile` hook existe
- [x] `useUpdateBusinessProfile` hook existe (de SQ-8)
- [ ] Supabase Storage bucket `logos` configurado (Step 1)

---

## Risks & Mitigations

**Risk 1:** Supabase Storage RLS misconfiguration

- **Impact:** High (security - users could access other users' logos for write)
- **Mitigation:** Verify RLS policies, test cross-user access

**Risk 2:** Canvas resize fails on corrupt images

- **Impact:** Low
- **Mitigation:** try/catch around canvas operations, show user-friendly error

**Risk 3:** Old logo file not deleted on replace

- **Impact:** Low (orphan files in storage)
- **Mitigation:** Delete old file before uploading new one, log errors silently

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. Storage bucket setup | 20 min |
| 2. Image resize utility | 30 min |
| 3. LogoUpload component | 60 min |
| 4. Integration Settings | 10 min |
| 5. Verification | 20 min |
| **Total** | **~2h 20min** |

**Story points:** 5 (re-estimado desde 3 por Storage + resize + 3 flujos)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los ACs pasando (AC1-AC5)
- [ ] **Supabase Storage** bucket `logos` con RLS
- [ ] **Image resize** proportional scale to 400x400px (no crop)
- [ ] **3 flujos:** Upload, Replace, Remove funcionales
- [ ] **UI/UX minimalista profesional**
  - [ ] Drop zone con drag & drop
  - [ ] Preview del logo
  - [ ] Loading states durante upload/remove
  - [ ] Toast notifications
- [ ] **Content Writing contextual:** Español LATAM
- [ ] **data-testid** en elementos interactivos
  - [ ] `logo-preview`, `logo-upload-input`, `logo-upload-button`
  - [ ] `logo-remove-button`, `logo-dropzone`
- [ ] **Test cases cubiertos:** TC-1 a TC-12
- [ ] `bun run lint && bun run build` sin errores

---

_Generado: 2026-03-11_
_Autor: Claude Code (Dev)_
