# Implementation Plan: STORY-SQ-43 - Include PDF Attachment in Email

## Overview

Implementar el envio real de facturas por email con PDF adjunto usando Resend como proveedor de email.

**Acceptance Criteria a cumplir:**

- AC1: El email incluye el PDF de la factura como adjunto
- AC2: El nombre del archivo es `Invoice-{invoiceNumber}.pdf`
- AC3: El tamano del adjunto es menor a 5MB
- AC4: El PDF abre correctamente con todos los datos
- AC5: Error handling para PDF vacio o mayor a 5MB
- AC6: Registro de intentos de envio en `email_logs`

---

## Technical Approach

**Chosen approach:** Server-side PDF generation + Resend API

**Flow:**
```
User clicks "Send" → API validates invoice → Generate PDF server-side
→ Validate size (<5MB) → Send via Resend with attachment
→ Update invoice status → Create email_logs entry → Return response
```

**Alternatives considered:**

- **Client-side PDF + upload:** Requires extra roundtrip and storage
- **Nodemailer + SMTP:** More complex setup, less reliable

**Why Resend:**

- Simple API with native attachment support
- Built-in email tracking (delivery status)
- React Email integration (future enhancement)
- Already configured by user with verified domain

---

## Test Cases Mapping (from Acceptance Test Plan)

| Test Case | Scenario | Implementation Step |
|-----------|----------|-------------------|
| TC-01 | PDF adjunto incluido al enviar | Step 4, 5 |
| TC-02 | Nombre del adjunto usa numero de factura | Step 4 |
| TC-03 | Tamano bajo limite con logos grandes | Step 4 |
| TC-04 | El adjunto abre correctamente | Step 3 |
| TC-05 | MIME type correcto (application/pdf) | Step 4 |
| TC-06 | Tamano al limite (max 5MB) | Step 4 |
| TC-07 | Bloqueo cuando PDF supera limite | Step 4 |
| TC-08 | Fallo cuando PDF esta vacio | Step 4 |
| TC-09 | Headers correctos en endpoint PDF | Step 3 |
| TC-10 | Integracion Backend to Resend | Step 4, 5 |

---

## Implementation Steps

### **Step 1: Install Resend package**

**Task:** Agregar dependencia de Resend

**Command:**
```bash
bun add resend
```

**Details:**
- Resend SDK para Node.js
- API Key ya configurada en `.env` como `RESEND_API_KEY`

**Testing:**
- Verificar que el paquete se instala correctamente
- Verificar que build pasa

**Estimated time:** 5 min

---

### **Step 2: Create email_logs table**

**Task:** Crear tabla para tracking de envios de email

**Migration name:** `create_email_logs_table`

**Schema:**
```sql
create table email_logs (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  status text not null default 'pending', -- pending, sent, delivered, bounced, failed
  resend_message_id text,
  attachment_name text,
  attachment_size_bytes integer,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS
alter table email_logs enable row level security;

-- RLS Policy: Users can only see their own email logs
create policy "Users can view own email logs"
  on email_logs for select
  using (user_id = auth.uid());

create policy "Users can insert own email logs"
  on email_logs for insert
  with check (user_id = auth.uid());

-- Index for performance
create index email_logs_invoice_id_idx on email_logs(invoice_id);
create index email_logs_user_id_idx on email_logs(user_id);
```

**Testing:**
- Verificar tabla creada en Supabase
- Verificar RLS policies activas

**Estimated time:** 15 min

---

### **Step 3: Create PDF API endpoint (server-side generation)**

**Task:** Crear API para generar PDF server-side

**File:** `src/app/api/invoices/[id]/pdf/route.ts`

**Details:**
- GET endpoint que retorna PDF como stream
- Usa `@react-pdf/renderer` con `renderToBuffer()`
- Headers: `Content-Type: application/pdf`, `Content-Disposition`
- Valida que invoice existe y pertenece al usuario
- Reutiliza `InvoiceDocument` existente

**Response Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Invoice-{number}.pdf"
```

**Edge cases handled:**
- Invoice not found → 404
- User not authorized → 404 (no leak existence)
- PDF generation fails → 500

**Testing:**
- TC-09: Verificar headers correctos
- TC-04: Verificar que PDF abre correctamente

**Estimated time:** 45 min

---

### **Step 4: Create email service with Resend**

**Task:** Crear servicio para envio de emails con adjuntos

**File:** `src/lib/services/email-service.ts`

**Interface:**
```typescript
interface SendInvoiceEmailParams {
  to: string;
  invoiceNumber: string;
  clientName: string;
  total: string;
  dueDate: string;
  pdfBuffer: Buffer;
  businessName: string;
}

interface SendInvoiceEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
```

**Implementation:**
- Usa Resend SDK
- Attachment con nombre `Invoice-{invoiceNumber}.pdf`
- Valida tamano < 5MB antes de enviar
- Retorna messageId para tracking

**Constants:**
```typescript
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB
const FROM_EMAIL = 'facturas@soloq.upexgalaxy.com';
```

**Error codes:**
- `PDF_TOO_LARGE`: Attachment exceeds 5MB
- `PDF_EMPTY`: Empty PDF buffer
- `EMAIL_SEND_FAILED`: Resend API error

**Testing:**
- TC-05, TC-06: Tamano bajo limite
- TC-07: Bloqueo cuando supera limite
- TC-08: Fallo cuando PDF vacio
- TC-10: Integracion con Resend

**Estimated time:** 30 min

---

### **Step 5: Update send API to use email service**

**Task:** Modificar API de envio para enviar email real

**File:** `src/app/api/invoices/[id]/send/route.ts`

**Changes:**
1. Import email service y PDF generator
2. Fetch invoice con relaciones (client, business_profile, items)
3. Generate PDF buffer server-side
4. Validate PDF size
5. Send email via Resend with attachment
6. Create email_logs entry
7. Update invoice status to 'sent'

**Flow:**
```
1. Validate auth + invoice ownership
2. Check invoice is draft
3. Fetch full invoice data (client, items, business)
4. Generate PDF buffer
5. Validate PDF (not empty, < 5MB)
6. Send email via Resend
7. Create email_logs record
8. Update invoice.status = 'sent', invoice.sent_at = now()
9. Create invoice_event (type: 'sent')
10. Return success response
```

**Error handling:**
- PDF too large → 413 with error message
- PDF empty → 500 with error message
- Email send fails → 500, rollback status change

**Testing:**
- TC-01: PDF adjunto incluido
- TC-02: Nombre correcto del adjunto

**Estimated time:** 45 min

---

### **Step 6: Update types**

**Task:** Regenerar tipos de Supabase con nueva tabla

**Command:**
```bash
bunx supabase gen types typescript --project-id czuusjchqpgvanvbdrnz > src/types/supabase.ts
```

**Details:**
- Incluye tipos para `email_logs`
- Exportar tipo `EmailLog` en `src/lib/types.ts`

**Estimated time:** 10 min

---

### **Step 7: Integration testing**

**Task:** Verificar flujo completo

**Tests:**
1. Crear factura draft con items
2. Enviar factura
3. Verificar email recibido con PDF adjunto
4. Verificar invoice status = 'sent'
5. Verificar email_logs tiene registro

**Edge cases:**
- Enviar factura ya enviada (debe fallar)
- Enviar factura sin cliente (debe fallar)
- Enviar factura sin items (debe fallar)

**Estimated time:** 30 min

---

## Technical Decisions

### Decision 1: PDF Generation Location

**Chosen:** Server-side using `renderToBuffer()`

**Reasoning:**
- Consistencia entre preview y email attachment
- No requiere upload de archivos
- Seguridad: cliente no puede manipular PDF

### Decision 2: Email Provider

**Chosen:** Resend

**Reasoning:**
- Simple API
- Native attachment support
- Domain already configured by user
- Good deliverability

### Decision 3: Attachment Size Limit

**Chosen:** 5MB hard limit

**Reasoning:**
- Resend limit is 40MB but email providers may reject large attachments
- 5MB is safe for most email providers
- Covers 99% of invoice PDFs

---

## Dependencies

**Pre-requisitos tecnicos:**

- [x] Resend API Key configurada
- [x] Dominio verificado en Resend (soloq.upexgalaxy.com)
- [x] `@react-pdf/renderer` instalado
- [x] `InvoiceDocument` component existente

---

## Risks & Mitigations

**Risk 1:** PDF generation fails server-side

- **Impact:** High
- **Mitigation:** Wrap in try-catch, return clear error, don't send email

**Risk 2:** Email delivery issues

- **Impact:** Medium
- **Mitigation:** Log attempts in email_logs, show clear status to user

**Risk 3:** Large logos cause PDF > 5MB

- **Impact:** Low
- **Mitigation:** Clear error message, suggest image optimization

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. Install Resend | 5 min |
| 2. Create email_logs table | 15 min |
| 3. Create PDF API endpoint | 45 min |
| 4. Create email service | 30 min |
| 5. Update send API | 45 min |
| 6. Update types | 10 min |
| 7. Integration testing | 30 min |
| **Total** | **~3 hours** |

**Story points:** 2

---

## Definition of Done Checklist

- [ ] Resend package installed
- [ ] `email_logs` table created with RLS
- [ ] GET `/api/invoices/[id]/pdf` endpoint working
- [ ] Email service created with attachment support
- [ ] POST `/api/invoices/[id]/send` sends real email
- [ ] PDF attachment has correct name (Invoice-{number}.pdf)
- [ ] PDF attachment has correct MIME type
- [ ] Size validation (< 5MB) working
- [ ] Error handling for empty/large PDFs
- [ ] email_logs records created
- [ ] invoice_events includes 'sent' event
- [ ] Types regenerated
- [ ] Linting passes
- [ ] Build passes
- [ ] Manual test in staging with real email

---

**Output:** implementation-plan.md
**Created:** 2026-02-28
**Author:** Claude Code
