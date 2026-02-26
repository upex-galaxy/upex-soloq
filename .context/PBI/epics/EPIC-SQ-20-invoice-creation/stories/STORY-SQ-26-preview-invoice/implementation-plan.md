# Implementation Plan: SQ-26 - Preview Invoice Before Sending

**Jira:** [SQ-26](https://upexgalaxy65.atlassian.net/browse/SQ-26)
**Epic:** EPIC-SQ-20 - Invoice Creation
**Branch:** `feat/SQ-26/preview-invoice`
**Fecha:** 2026-02-25

---

## Objetivo

Permitir al usuario ver una preview de la factura antes de enviarla, con acciones para editar, enviar o descargar el PDF directamente desde el preview.

---

## Analisis Tecnico

### Componentes Existentes a Reutilizar

| Componente | Ubicacion | Proposito |
|------------|-----------|-----------|
| `InvoiceDocument` | `src/app/(app)/invoices/[id]/components/invoice-document.tsx` | Template PDF con @react-pdf/renderer |
| `InvoicePreview` | `src/app/(app)/invoices/[id]/components/invoice-preview.tsx` | BlobProvider + iframe preview + download |
| `useBusinessProfile` | `src/hooks/business-profile/use-business-profile.ts` | Obtiene datos del negocio |
| `InvoiceWithDetails` | `src/hooks/invoices/use-invoice.ts` | Type para datos del preview |

### Nuevo Codigo a Crear

| Componente | Ubicacion | Proposito |
|------------|-----------|-----------|
| `InvoicePreviewDialog` | `src/components/invoices/invoice-preview-dialog.tsx` | Modal con preview + acciones |
| `buildPreviewData` | `src/lib/utils/invoice-preview.ts` | Transforma form values → InvoiceWithDetails |
| `useSendInvoice` | `src/hooks/invoices/use-send-invoice.ts` | Mutation para enviar factura |

### API Existente

- `PATCH /api/invoices/[id]` - Ya soporta cambio de status
- Solo necesita agregar logica para crear evento `sent` en `invoice_events`

---

## Steps de Implementacion

### Step 1: Crear utility buildPreviewData

**Archivo:** `src/lib/utils/invoice-preview.ts`

**Proposito:** Transforma datos del formulario React Hook Form al tipo `InvoiceWithDetails` que espera el componente `InvoiceDocument`.

**Inputs:**
- Form values (camelCase)
- Client seleccionado
- Business profile

**Output:** `InvoiceWithDetails`

**Calculos:**
- subtotal (desde items)
- discount_amount
- tax_amount
- total

**Test Cases cubiertos:** TC-002, TC-011, TC-012

---

### Step 2: Crear hook useSendInvoice

**Archivo:** `src/hooks/invoices/use-send-invoice.ts`

**Proposito:** Mutation para cambiar status de factura a "sent" y registrar evento.

**API Call:**
```typescript
PATCH /api/invoices/[id]
Body: { status: 'sent' }
```

**Post-acciones:**
- Invalidar cache de invoices
- Toast de exito

**Test Cases cubiertos:** TC-004, TC-005

---

### Step 3: Modificar API para registrar evento sent

**Archivo:** `src/app/api/invoices/[id]/route.ts`

**Cambio:** Al hacer PATCH con status='sent':
1. Actualizar invoice.status = 'sent'
2. Actualizar invoice.sent_at = now()
3. INSERT en invoice_events con event_type='sent'

**Test Cases cubiertos:** TC-010, TC-011, TC-013

---

### Step 4: Crear InvoicePreviewDialog

**Archivo:** `src/components/invoices/invoice-preview-dialog.tsx`

**Props:**
```typescript
interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewData: InvoiceWithDetails;
  invoiceId?: string; // Si existe, permite enviar
  onSendSuccess?: () => void;
}
```

**Estructura:**
```
Dialog
├── DialogContent (max-w-4xl)
│   ├── DialogHeader
│   │   └── Title: "Vista previa de factura"
│   ├── Preview Area
│   │   └── InvoicePreview (reutilizado)
│   └── DialogFooter
│       ├── Button "Editar" (cierra dialog)
│       ├── Button "Descargar PDF"
│       └── Button "Enviar" (solo si invoiceId)
```

**data-testid requeridos:**
- `preview-modal`
- `preview-edit-button`
- `preview-send-button`
- `preview-download-button`

**Test Cases cubiertos:** TC-001, TC-003, TC-004, TC-005

---

### Step 5: Integrar en pagina Create

**Archivo:** `src/app/(app)/invoices/create/page.tsx`

**Cambios:**
1. Agregar estado `isPreviewOpen`
2. Agregar boton "Preview" junto a "Guardar como borrador"
3. Boton deshabilitado si:
   - No hay cliente seleccionado
   - No hay items validos
   - Invoice number invalido
4. Al click: construir previewData y abrir dialog
5. En preview de create, NO mostrar boton Send (no hay ID aun)

**data-testid:**
- `btn-preview` o `preview-button`

**Test Cases cubiertos:** TC-001, TC-006, TC-008

---

### Step 6: Integrar en pagina Edit

**Archivo:** `src/app/(app)/invoices/[id]/edit/page.tsx`

**Cambios:**
1. Agregar estado `isPreviewOpen`
2. Agregar boton "Preview" en actions
3. Mismas condiciones de deshabilitado que create
4. Preview incluye boton Send (tiene invoiceId)
5. Al enviar exitosamente: redirect a /invoices o /invoices/[id]

**Test Cases cubiertos:** TC-001, TC-003, TC-004, TC-005, TC-006

---

### Step 7: Tests manuales y verificacion

**Verificar cada test case del Acceptance Test Plan (Jira):**

| TC | Descripcion | Verificacion |
|----|-------------|--------------|
| TC-001 | Open preview from invoice form | Boton visible, click abre modal |
| TC-002 | Preview shows all data | Business, client, items, totals visibles |
| TC-003 | Return to edit from preview | Click Edit cierra modal, datos intactos |
| TC-004 | Send invoice from preview | Status cambia a sent, toast exito |
| TC-005 | Download PDF from preview | Archivo descarga correctamente |
| TC-006 | Preview incomplete invoice | Boton deshabilitado + tooltip |
| TC-007 | Preview without permission | RLS impide acceso (ya cubierto) |
| TC-008 | Preview with missing business profile | Funciona con fallbacks |
| TC-009 | Preview with 50 items | Performance OK |
| TC-010 | Preview with long text | Layout correcto |
| TC-011 | Preview renders client data | Datos correctos |
| TC-012 | Preview renders payment methods | Metodos visibles |

---

## Dependencias

- `@react-pdf/renderer` (ya instalado)
- `sonner` para toasts (ya instalado)
- shadcn/ui Dialog (ya instalado)

---

## Estimacion

| Step | Complejidad | Tiempo estimado |
|------|-------------|-----------------|
| 1 | Baja | 15 min |
| 2 | Baja | 15 min |
| 3 | Baja | 20 min |
| 4 | Media | 45 min |
| 5 | Media | 30 min |
| 6 | Media | 30 min |
| 7 | - | 30 min |
| **Total** | | **~3 horas** |

---

## Definition of Done

- [ ] Preview modal implementado con InvoiceDocument
- [ ] Todos los datos de factura visibles en preview
- [ ] Navegacion Edit funciona (cierra modal)
- [ ] Send desde preview funciona (cambia status)
- [ ] Download desde preview funciona
- [ ] Boton Preview deshabilitado si factura incompleta
- [ ] Linting y build pasan
- [ ] Todos los test cases verificados

---

_Plan creado: 2026-02-25_
_Autor: Claude Code_
