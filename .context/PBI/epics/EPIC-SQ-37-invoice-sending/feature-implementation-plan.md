# Feature Implementation Plan: EPIC-SQ-37 - Invoice Sending

## Overview

Esta feature completa el flujo de facturación permitiendo enviar facturas por email con PDF adjunto, datos de pago, personalización del mensaje y confirmación de envío.

**Alcance:**

- [SQ-42]: Send Invoice by Email with One Click
- [SQ-43]: Include PDF Attachment in Email ✅ (Implementado)
- [SQ-44]: Include Payment Data in Email
- [SQ-45]: Customize Email Subject and Message
- [SQ-46]: View Email Send Confirmation

**Stack técnico:**

- Frontend: Next.js 16 (App Router) + React
- Backend: Next.js API Routes + Supabase
- Database: PostgreSQL (Supabase)
- Email: Resend + React Email templates
- PDF: @react-pdf/renderer
- Testing: Playwright (E2E), Vitest (Unit)

---

## Technical Decisions

### Decision 1: Estructura de Payment Methods en Email

**Options considered:**

- A) Mostrar todos los payment methods del usuario
- B) Mostrar solo los marcados como `is_default`
- C) Mostrar máximo 3 métodos, priorizando defaults

**Chosen:** C) Mostrar máximo 3 métodos, priorizando defaults

**Reasoning:**

- ✅ Evita emails cluttered con muchos métodos de pago
- ✅ Prioriza los métodos que el usuario considera más importantes
- ✅ El cliente ve opciones claras sin overwhelm
- ❌ Trade-off: Usuarios con >3 métodos no verán todos

**Implementation notes:**

- Query: `ORDER BY is_default DESC, sort_order ASC LIMIT 3`
- Fallback: Si no hay defaults, usar los primeros 3 por sort_order
- Advertencia en UI si usuario no tiene payment methods configurados

---

### Decision 2: Formato de Payment Methods (Copy-Friendly)

**Options considered:**

- A) HTML con estilos fancy (colores, iconos)
- B) Texto plano monoespaciado
- C) Híbrido: Labels con estilo + valores monoespaciados

**Chosen:** C) Híbrido: Labels con estilo + valores monoespaciados

**Reasoning:**

- ✅ Balance entre visual atractivo y funcionalidad
- ✅ Valores de cuenta/CLABE fáciles de copiar
- ✅ Funcionará bien en clientes de email con plain text fallback
- ❌ Trade-off: Más código en templates

**Implementation notes:**

- Labels: `font-weight: bold; color: #374151;`
- Values: `font-family: monospace; background: #f3f4f6; padding: 2px 6px;`
- Estructura:
  ```
  📦 BBVA
  Cuenta: 1234567890
  CLABE: 012345678901234567
  ```

---

### Decision 3: Warning de Payment Methods Faltantes

**Options considered:**

- A) Bloquear envío si no hay payment methods
- B) Warning visual, pero permitir envío
- C) No mostrar warning, proceder silenciosamente

**Chosen:** B) Warning visual, pero permitir envío

**Reasoning:**

- ✅ No bloquea el flujo del usuario
- ✅ Informa de manera clara el impacto
- ✅ Respeta la autonomía del usuario
- ❌ Trade-off: Podría enviar email sin datos de pago

**Implementation notes:**

- Alert tipo warning en el modal de envío
- Copy: "No tienes métodos de pago configurados. El cliente no verá información de cómo pagarte."
- Link a Settings para configurar

---

### Decision 4: Integración con Email Service

**Options considered:**

- A) Extender `sendInvoiceEmail` con nuevo parámetro
- B) Crear función separada con payment methods
- C) Modificar interfaz existente para incluir payment methods

**Chosen:** A) Extender `sendInvoiceEmail` con nuevo parámetro

**Reasoning:**

- ✅ Mantiene una sola función de envío
- ✅ Backward compatible (paymentMethods opcional)
- ✅ Cambios mínimos en código existente
- ❌ Trade-off: Interfaz crece con más parámetros

**Implementation notes:**

- Agregar `paymentMethods?: PaymentMethod[]` a `SendInvoiceEmailParams`
- Si no hay paymentMethods, no renderizar la sección
- Sección se agrega después de "Fecha de vencimiento" y antes del footer

---

### Decision 5: Email Template - Sección Información de Pago

**Chosen:** Sección dedicada con título claro y formato estructurado

**Implementation notes:**

```html
<!-- Sección Información de Pago -->
<div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
  <h2 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px;">💳 Información de Pago</h2>

  <!-- Por cada método de pago -->
  <div style="margin-bottom: 12px;">
    <p style="font-weight: bold; color: #374151; margin: 0;">BBVA</p>
    <p style="font-family: monospace; margin: 4px 0;">Cuenta: 1234567890</p>
    <p style="font-family: monospace; margin: 4px 0;">CLABE: 012345678901234567</p>
  </div>
</div>
```

---

## Types & Type Safety

**Tipos disponibles:**

- `lib/types.ts` - Contiene `PaymentMethod`, `Invoice`, `Client`, etc.
- `lib/services/email-service.ts` - `SendInvoiceEmailParams`, `SendInvoiceEmailResult`

**Estrategia de tipos a nivel feature:**

1. **Entidades principales:**
   - `PaymentMethod`: type, label, value, is_default
   - `Invoice`: invoice_number, status, total, etc.
   - `Client`: name, email
   - `BusinessProfile`: business_name

2. **Tipo extendido para email:**

```typescript
// lib/services/email-service.ts
export interface PaymentMethodForEmail {
  type: 'bank_transfer' | 'paypal' | 'mercado_pago' | 'cash' | 'other';
  label: string;
  value: string;
}

export interface SendInvoiceEmailParams {
  // ... existing params ...
  paymentMethods?: PaymentMethodForEmail[];
}
```

3. **Directiva:**
   - ✅ Todas las stories importan tipos desde `@/lib/types`
   - ✅ PaymentMethod tipado consistentemente
   - ✅ Zero type errors en toda la feature

---

## UI/UX Design Strategy

**Esta feature es principalmente backend/email**, pero tiene impacto en UI para:

### Modal de Envío (afecta SQ-44, SQ-45)

**Warning de Payment Methods:**

```tsx
<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Sin métodos de pago</AlertTitle>
  <AlertDescription>
    El cliente no verá cómo pagarte.
    <Link href="/settings/payment-methods" className="underline">Configurar</Link>
  </AlertDescription>
</Alert>
```

### Email Template (afecta SQ-44)

**Sección Información de Pago:**

- Fondo: `bg-blue-50` (azul claro)
- Borde: `border-blue-200`
- Título: `text-blue-800`, emoji 💳
- Labels: `font-bold text-gray-700`
- Valores: `font-mono bg-gray-100` (copy-friendly)

### Consistencia visual:

- Usar colores semánticos del design system
- Azul para información de pago (trust)
- Amarillo para warnings/vencimiento

---

## Content Writing Strategy

**Vocabulario del dominio (SoloQ):**

- "factura" (no "invoice" en UI)
- "métodos de pago" (no "payment methods" en UI)
- "datos de pago" / "información de pago"
- "CLABE" (término bancario mexicano)
- "transferencia" (no "bank transfer")

**Copy en email:**

```
💳 Información de Pago

Puedes realizar el pago mediante cualquiera de los siguientes métodos:

BBVA
Cuenta: 1234567890
CLABE: 012345678901234567

PayPal
correo@ejemplo.com
```

**Warning copy:**

- ❌ Genérico: "Missing payment information"
- ✅ Contextual: "El cliente no verá cómo pagarte"

---

## Shared Dependencies

**Todas las stories de esta feature requieren:**

1. **Resend API**
   - `RESEND_API_KEY` configurado
   - Free tier: 3,000 emails/mes
   - Sandbox disponible en staging

2. **Supabase Tables:**
   - `payment_methods` (user_id, type, label, value, is_default, sort_order)
   - `invoices` (user_id, client_id, status, sent_at)
   - `email_logs` (invoice_id, status, resend_message_id)
   - `invoice_events` (invoice_id, event_type, metadata)

3. **Environment variables:**
   - `RESEND_API_KEY`: API key de Resend
   - `NEXT_PUBLIC_APP_URL`: URL de la app (para links en emails)

---

## Architecture Notes

### Folder Structure

```
/src
├── /app/api/invoices/[id]
│   └── /send
│       └── route.ts          # POST /api/invoices/{id}/send
│
├── /lib/services
│   └── email-service.ts      # sendInvoiceEmail() + templates
│
├── /components
│   └── /invoices
│       └── send-invoice-modal.tsx  # Modal con warning
│
└── /lib
    └── types.ts              # PaymentMethod type
```

### Data Flow (Send Invoice with Payment Methods)

```
1. User clicks "Enviar" on invoice
2. Frontend → POST /api/invoices/{id}/send
3. API Route:
   a. Fetch invoice + client + items
   b. Fetch business_profile
   c. ⭐ Fetch payment_methods (NEW)
   d. Generate PDF
   e. Build email with payment section (NEW)
   f. Send via Resend
   g. Update invoice.status = 'sent'
   h. Create invoice_event
   i. Create email_log
4. Return success response
```

### Third-party Libraries

- **Resend** (latest) - Email sending
- **@react-pdf/renderer** (^4.x) - PDF generation

---

## Implementation Order

**Recomendado:**

1. **STORY-SQ-42: Send Invoice by Email** ✅ (Base implementada)
   - Razón: Endpoint `/api/invoices/{id}/send` ya existe

2. **STORY-SQ-43: Include PDF Attachment** ✅ (Implementado)
   - Razón: PDF ya se genera y adjunta

3. **STORY-SQ-44: Include Payment Data in Email** 🔜 (Siguiente)
   - Razón: Extiende el email existente con datos de pago
   - Depende de: SQ-42, SQ-43

4. **STORY-SQ-45: Customize Email Subject and Message** (Puede ir en paralelo)
   - Razón: Modifica templates pero no depende de SQ-44

5. **STORY-SQ-46: View Email Send Confirmation** (Último)
   - Razón: Requiere que envío funcione para mostrar confirmación/historial

---

## Risks & Mitigations

### Risk 1: Payment Methods vacíos

**Impact:** Medium (email sin datos de pago)
**Likelihood:** Medium (users nuevos)
**Mitigation:**

- Warning visual en modal de envío
- Link directo a configuración de payment methods
- Email funciona aunque sección esté vacía

### Risk 2: Formato de payment values inconsistente

**Impact:** Medium (datos difíciles de copiar)
**Likelihood:** Low
**Mitigation:**

- Validación en onboarding para campos estructurados
- Monospace font asegura alineación consistente
- Plain text fallback siempre disponible

### Risk 3: Email clients no renderizan HTML correctamente

**Impact:** Medium (experiencia degradada)
**Likelihood:** Low
**Mitigation:**

- Inline styles (no CSS externo)
- Plain text version siempre incluida
- Testar en Gmail, Outlook, Apple Mail

---

## Success Criteria

**Esta feature estará completa cuando:**

- [ ] Todas las stories implementadas y deployed
- [ ] **Tipos del backend aplicados consistentemente**
  - [ ] PaymentMethod type usado en todas las stories
  - [ ] Zero type errors en toda la feature
- [ ] **Email incluye datos de pago correctamente**
  - [ ] Sección "Información de Pago" visible
  - [ ] Formato copy-friendly (monospace)
  - [ ] Máximo 3 métodos mostrados
- [ ] **Warning funciona correctamente**
  - [ ] Aparece cuando no hay payment methods
  - [ ] Link a Settings funciona
- [ ] **Plain text fallback incluye payment methods**
- [ ] 100% de test cases críticos pasando
- [ ] Performance: Email send < 2s (p95)
- [ ] **Build y linting pasando**
  - [ ] `bun run build` exitoso
  - [ ] Zero TypeScript errors
  - [ ] Linting passes

---

## Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-37-invoice-sending/epic.md`
- **Feature Test Plan:** `.context/PBI/epics/EPIC-SQ-37-invoice-sending/feature-test-plan.md`
- **Email Service:** `src/lib/services/email-service.ts`
- **Send Endpoint:** `src/app/api/invoices/[id]/send/route.ts`
- **Design System:** `.context/design-system.md`
- **SRS - Functional:** `.context/SRS/functional-specs.md` (FR-019)

---

_Generado: 2026-03-10_
_Por: Claude Code_
