# Implementation Plan: STORY-SQ-44 - Include Payment Data in Email

## Overview

Implementar la inclusión de datos de pago del usuario en el email de factura, para que el cliente pueda pagar fácilmente.

**Acceptance Criteria a cumplir:**

1. Payment methods visibles en sección "Información de Pago" del email
2. Bank transfer: Label + Cuenta + CLABE formateados correctamente
3. PayPal: Email de PayPal visible
4. Formato copy-friendly (monoespaciado) para valores numéricos
5. Warning cuando no hay métodos de pago configurados

**Test Cases mapeados (del Acceptance Test Plan):**

| TC | Escenario | Step de Implementación |
|----|-----------|------------------------|
| TC-01 | Validar inclusión de datos de transferencia bancaria | Step 2 |
| TC-02 | Validar inclusión de datos de PayPal | Step 2 |
| TC-03 | Validar formato fácil de copiar | Step 2 |
| TC-04 | Validar advertencia cuando no hay métodos configurados | Step 3 (UI) |

---

## Technical Approach

**Chosen approach:** Extender `sendInvoiceEmail` con parámetro `paymentMethods` opcional

**Archivos a modificar:**

1. `src/app/api/invoices/[id]/send/route.ts` - Fetch payment methods
2. `src/lib/services/email-service.ts` - Agregar sección al template

**Alternatives considered:**

- **Crear función separada**: Descartado - duplicaría lógica de envío
- **Fetch en email-service**: Descartado - rompe separación de responsabilidades

**Why this approach:**

- ✅ Cambios mínimos en código existente
- ✅ Backward compatible (paymentMethods opcional)
- ✅ Mantiene arquitectura limpia (API route fetcha datos, service envía)
- ❌ Trade-off: Interface de email-service crece

---

## Types & Type Safety

**Tipos existentes a usar:**

```typescript
// src/lib/types.ts
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

// Tipo para email (subconjunto)
export interface PaymentMethodForEmail {
  type: 'bank_transfer' | 'paypal' | 'mercado_pago' | 'cash' | 'other';
  label: string;
  value: string;
}
```

**Actualización de interface:**

```typescript
// src/lib/services/email-service.ts
export interface SendInvoiceEmailParams {
  to: string;
  invoiceNumber: string;
  clientName: string;
  total: string;
  dueDate: string;
  pdfBuffer: Buffer;
  businessName: string;
  paymentMethods?: PaymentMethodForEmail[]; // 🆕 Nuevo parámetro
}
```

---

## Implementation Steps

### **Step 1: Fetch Payment Methods en API Route**

**Task:** Agregar query de payment_methods en el endpoint de send

**File:** `src/app/api/invoices/[id]/send/route.ts`

**Details:**

1. Después de obtener `businessProfile`, agregar query:
   ```typescript
   const { data: paymentMethods } = await supabase
     .from('payment_methods')
     .select('type, label, value, is_default')
     .eq('user_id', user.id)
     .order('is_default', { ascending: false })
     .order('sort_order', { ascending: true })
     .limit(3);
   ```

2. Pasar `paymentMethods` al llamado de `sendInvoiceEmail()`

**Edge cases handled:**

- Sin payment methods: `paymentMethods` será array vacío `[]`
- Más de 3 métodos: LIMIT 3 asegura máximo
- Sin defaults: ORDER BY is_default DESC prioriza defaults

**Testing:**

- Unit test: Verificar query se ejecuta correctamente
- Integration test: Verificar paymentMethods llega al email service

**Estimated time:** 30 min

---

### **Step 2: Agregar Sección de Pago al Email Template**

**Task:** Modificar templates HTML y texto plano para incluir datos de pago

**File:** `src/lib/services/email-service.ts`

**Details:**

1. Actualizar `SendInvoiceEmailParams` interface con `paymentMethods?`

2. Agregar función helper para formatear payment methods:
   ```typescript
   function formatPaymentMethodHtml(method: PaymentMethodForEmail): string {
     return `
       <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
         <p style="font-weight: bold; color: #374151; margin: 0 0 4px 0;">${method.label}</p>
         <p style="font-family: 'Courier New', monospace; background: #f3f4f6; padding: 4px 8px; margin: 0; border-radius: 4px; color: #111827;">${method.value}</p>
       </div>
     `;
   }
   ```

3. Agregar sección en `generateInvoiceEmailHtml()` después de fecha vencimiento:
   ```html
   <!-- Información de Pago -->
   <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
     <h2 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">💳 Información de Pago</h2>
     ${paymentMethods.map(formatPaymentMethodHtml).join('')}
   </div>
   ```

4. Agregar sección equivalente en `generateInvoiceEmailText()`:
   ```
   ---
   INFORMACIÓN DE PAGO

   BBVA
   Cuenta: 1234567890
   CLABE: 012345678901234567

   PayPal
   correo@ejemplo.com
   ---
   ```

**Edge cases handled:**

- Sin payment methods: No renderizar sección (condicional)
- Valores largos: CSS word-break para evitar overflow
- Caracteres especiales: HTML escape en label y value

**Testing:**

- Unit test: Verificar HTML generado con diferentes métodos de pago
- Unit test: Verificar plain text generado
- Manual: Probar email en Gmail, Outlook

**Estimated time:** 1.5 hours

---

### **Step 3: Warning en UI (Opcional - Si hay tiempo)**

**Task:** Mostrar advertencia en modal de envío si no hay payment methods

**File:** `src/app/(app)/invoices/[id]/components/send-invoice-dialog.tsx` (o similar)

**Note:** Esta es una mejora de UX pero NO bloquea el envío. La implementación principal está en Steps 1-2.

**Details:**

1. Agregar query para obtener payment methods del usuario actual
2. Mostrar Alert si array está vacío:
   ```tsx
   {paymentMethods.length === 0 && (
     <Alert variant="warning" className="mb-4">
       <AlertTriangle className="h-4 w-4" />
       <AlertTitle>Sin métodos de pago</AlertTitle>
       <AlertDescription>
         El cliente no verá cómo pagarte.{' '}
         <Link href="/settings" className="underline">Configurar</Link>
       </AlertDescription>
     </Alert>
   )}
   ```

**Testing:**

- E2E: Verificar warning aparece cuando no hay métodos
- E2E: Verificar warning NO aparece cuando hay métodos

**Estimated time:** 45 min (si se implementa)

---

### **Step 4: Testing y Validación**

**Task:** Probar todos los escenarios del Acceptance Test Plan

**Test Cases a verificar:**

| TC | Escenario | Cómo probar |
|----|-----------|-------------|
| TC-01 | Bank transfer visible | Crear usuario con bank_transfer, enviar invoice, verificar email |
| TC-02 | PayPal visible | Crear usuario con paypal, enviar invoice, verificar email |
| TC-03 | Formato copy-friendly | Verificar monospace en HTML, seleccionar y copiar valores |
| TC-04 | Warning sin métodos | Crear usuario sin métodos, abrir modal de envío |

**Testing:**

- Unit tests para email-service.ts (nuevas funciones)
- Integration test para /api/invoices/[id]/send
- E2E test para flujo completo

**Estimated time:** 1 hour

---

## Technical Decisions (Story-specific)

### Decision 1: No bloquear envío sin payment methods

**Chosen:** Warning visual, permitir envío

**Reasoning:**

- ✅ Usuario decide si procede sin datos de pago
- ✅ No rompe flujo en casos de emergencia
- ❌ Trade-off: Email puede llegar sin datos de pago

### Decision 2: Límite de 3 payment methods

**Chosen:** Máximo 3, priorizando is_default

**Reasoning:**

- ✅ Email no queda cluttered
- ✅ Prioriza métodos preferidos del usuario
- ❌ Trade-off: Usuarios con >3 no ven todos

### Decision 3: Monospace para valores numéricos

**Chosen:** font-family: 'Courier New', monospace

**Reasoning:**

- ✅ Fácil seleccionar y copiar (CLABE, cuentas)
- ✅ Se ve limpio y profesional
- ✅ Funciona en todos los email clients

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] Tabla `payment_methods` existe en DB ✅
- [x] Endpoint `/api/invoices/[id]/send` funciona ✅
- [x] Email service con Resend configurado ✅

**No hay blockers.**

---

## Risks & Mitigations

**Risk 1:** Email clients renderizan diferente

- **Impact:** Medium
- **Mitigation:** Usar inline styles, probar en Gmail/Outlook/Apple Mail

**Risk 2:** Valores con caracteres especiales rompen HTML

- **Impact:** Low
- **Mitigation:** HTML escape en label y value antes de renderizar

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. Fetch payment methods en API | 30 min |
| 2. Agregar sección al email template | 1.5 hours |
| 3. Warning en UI (opcional) | 45 min |
| 4. Testing y validación | 1 hour |
| **Total** | **~4 hours** |

**Story points:** 2 (match con estimación en story.md)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los Acceptance Criteria pasando
  - [ ] AC1: Payment methods visibles en sección "Información de Pago"
  - [ ] AC2: Bank transfer con Label + Cuenta + CLABE formateados
  - [ ] AC3: PayPal email visible
  - [ ] AC4: Formato copy-friendly (monospace)
- [ ] **Test Cases del Acceptance Test Plan:**
  - [ ] TC-01: Validar inclusión de datos de transferencia bancaria
  - [ ] TC-02: Validar inclusión de datos de PayPal
  - [ ] TC-03: Validar formato fácil de copiar
  - [ ] TC-04: Validar advertencia cuando no hay métodos configurados
- [ ] **Tipos del backend usados correctamente**
  - [ ] PaymentMethodForEmail type definido
  - [ ] Props tipadas en email service
  - [ ] Zero type errors
- [ ] Sin errores de linting/TypeScript
  - [ ] `bun run lint` passes
  - [ ] `bun run build` passes
- [ ] Code review aprobado
- [ ] Deployed to staging
- [ ] Manual smoke test en staging
  - [ ] Email llega con datos de pago
  - [ ] Formato se ve bien en Gmail
  - [ ] Plain text fallback funciona

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/api/invoices/[id]/send/route.ts` | + Query payment_methods, + Pasar a sendInvoiceEmail |
| `src/lib/services/email-service.ts` | + PaymentMethodForEmail type, + formatPaymentMethodHtml, + Sección en templates |

---

_Generado: 2026-03-10_
_Branch: feat/SQ-44/email-payment-data_
