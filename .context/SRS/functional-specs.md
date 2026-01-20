# Functional Specifications - SoloQ

> **Software Requirements Specification**
> Versión: 1.0 | Última actualización: 2026-01-20

---

## Overview

Este documento mapea las User Stories del PRD a Functional Requirements (FR) técnicos detallados.

---

## EPIC-SOLOQ-001: User Authentication & Onboarding

### FR-001: Registro de Usuario con Email

**Relacionado a:** EPIC-001, US 1.1

**Input:**
- `email` (string, formato RFC 5321, max 254 chars, requerido)
- `password` (string, min 8 chars, max 128 chars, requerido)
- `confirmPassword` (string, debe coincidir con password, requerido)

**Processing:**
1. Validar formato de email (regex RFC 5321)
2. Validar fortaleza de password (min 8 chars, al menos 1 mayúscula, 1 minúscula, 1 número)
3. Validar que password === confirmPassword
4. Verificar que email no existe en auth.users (Supabase)
5. Crear usuario en Supabase Auth
6. Crear registro en tabla `profiles` con id del usuario
7. Enviar email de verificación vía Supabase Auth

**Output:**
- Success: `{ success: true, message: "Verification email sent", userId: uuid }`
- Error 400: `{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }`
- Error 409: `{ success: false, error: { code: "EMAIL_EXISTS", message: "Email already registered" } }`

**Validations:**
- Email único en sistema
- Password cumple política de seguridad
- Passwords coinciden

---

### FR-002: Verificación de Email

**Relacionado a:** EPIC-001, US 1.1

**Input:**
- `token` (string, token de verificación de URL)

**Processing:**
1. Supabase Auth valida token automáticamente
2. Si válido, marca email como verificado
3. Actualiza `profiles.email_verified_at`
4. Redirige a onboarding

**Output:**
- Success: Redirect a `/onboarding`
- Error: Redirect a `/auth/verify-error` con mensaje

---

### FR-003: Login de Usuario

**Relacionado a:** EPIC-001, US 1.2

**Input:**
- `email` (string, requerido)
- `password` (string, requerido)

**Processing:**
1. Validar campos no vacíos
2. Autenticar con Supabase Auth
3. Verificar que email está verificado
4. Generar session tokens (Supabase maneja automáticamente)
5. Registrar último login en `profiles.last_login_at`

**Output:**
- Success: `{ success: true, user: UserObject, session: SessionObject }`
- Error 401: `{ success: false, error: { code: "INVALID_CREDENTIALS", message: "..." } }`
- Error 403: `{ success: false, error: { code: "EMAIL_NOT_VERIFIED", message: "..." } }`

---

### FR-004: Recuperación de Contraseña

**Relacionado a:** EPIC-001, US 1.3

**Input:**
- `email` (string, requerido)

**Processing:**
1. Verificar que email existe en sistema
2. Generar token de reset (Supabase Auth)
3. Enviar email con link de reset
4. Token expira en 1 hora

**Output:**
- Success: `{ success: true, message: "Reset email sent if account exists" }`
- Nota: Siempre retorna success para no revelar si email existe (seguridad)

---

### FR-005: Reset de Contraseña

**Relacionado a:** EPIC-001, US 1.3

**Input:**
- `token` (string, de URL)
- `newPassword` (string, min 8 chars)
- `confirmPassword` (string)

**Processing:**
1. Validar token (Supabase Auth)
2. Validar nueva contraseña cumple política
3. Actualizar contraseña
4. Invalidar todas las sesiones activas
5. Redirigir a login

**Output:**
- Success: Redirect a `/auth/login?reset=success`
- Error: Mostrar error en UI

---

### FR-006: Logout

**Relacionado a:** EPIC-001, US 1.4

**Input:** None (usa session actual)

**Processing:**
1. Invalidar session en Supabase Auth
2. Limpiar cookies/localStorage
3. Redirigir a landing o login

**Output:**
- Success: Redirect a `/`

---

## EPIC-SOLOQ-002: Business Profile Management

### FR-007: Crear/Actualizar Perfil de Negocio

**Relacionado a:** EPIC-002, US 2.1-2.5

**Input:**
- `businessName` (string, max 100 chars, requerido)
- `contactEmail` (string, formato email, requerido)
- `contactPhone` (string, max 20 chars, opcional)
- `address` (string, max 500 chars, opcional)
- `taxId` (string, max 50 chars, opcional) - RFC/NIT/CUIT
- `logoUrl` (string, URL de Supabase Storage, opcional)

**Processing:**
1. Validar que usuario está autenticado
2. Validar todos los campos
3. Si hay logo nuevo, subir a Supabase Storage
4. Upsert en tabla `business_profiles`
5. Retornar perfil actualizado

**Output:**
- Success: `{ success: true, profile: BusinessProfileObject }`
- Error 400: `{ success: false, error: { code: "VALIDATION_ERROR", ... } }`

**Validations:**
- businessName no vacío
- contactEmail formato válido
- Si taxId provisto, validar formato según país (básico)

---

### FR-008: Upload de Logo

**Relacionado a:** EPIC-002, US 2.2

**Input:**
- `file` (File, imagen PNG/JPG/WEBP, max 2MB)

**Processing:**
1. Validar tipo de archivo (image/png, image/jpeg, image/webp)
2. Validar tamaño (< 2MB)
3. Generar nombre único con UUID
4. Subir a Supabase Storage bucket `logos`
5. Retornar URL pública

**Output:**
- Success: `{ success: true, url: "https://..." }`
- Error 400: `{ success: false, error: { code: "INVALID_FILE", message: "..." } }`

---

### FR-009: Gestionar Métodos de Pago

**Relacionado a:** EPIC-002, US 2.5

**Input:**
- `paymentMethods` (array de objetos):
  - `type` (enum: "bank_transfer", "paypal", "mercado_pago", "other")
  - `label` (string, max 50 chars, ej: "Transferencia BBVA")
  - `value` (string, max 200 chars, ej: CLABE, link, instrucciones)
  - `isDefault` (boolean)

**Processing:**
1. Validar que al menos un método tenga isDefault = true
2. Eliminar métodos existentes del usuario
3. Insertar nuevos métodos en `payment_methods`
4. Retornar lista actualizada

**Output:**
- Success: `{ success: true, paymentMethods: PaymentMethodObject[] }`

---

## EPIC-SOLOQ-003: Client Management

### FR-010: Crear Cliente

**Relacionado a:** EPIC-003, US 3.1

**Input:**
- `name` (string, max 100 chars, requerido)
- `email` (string, formato email, requerido)
- `company` (string, max 100 chars, opcional)
- `phone` (string, max 20 chars, opcional)
- `address` (string, max 500 chars, opcional)
- `taxId` (string, max 50 chars, opcional)
- `notes` (string, max 1000 chars, opcional)

**Processing:**
1. Validar campos requeridos
2. Verificar que no existe cliente con mismo email para este usuario
3. Insertar en tabla `clients` con `user_id` del usuario autenticado
4. Retornar cliente creado

**Output:**
- Success: `{ success: true, client: ClientObject }`
- Error 409: `{ success: false, error: { code: "CLIENT_EXISTS", message: "..." } }`

---

### FR-011: Listar Clientes

**Relacionado a:** EPIC-003, US 3.2

**Input:**
- `search` (string, opcional) - búsqueda por nombre o email
- `page` (number, default 1)
- `limit` (number, default 20, max 100)
- `sortBy` (enum: "name", "created_at", "last_invoice_date", default "name")
- `sortOrder` (enum: "asc", "desc", default "asc")

**Processing:**
1. Query a `clients` donde `user_id` = usuario autenticado
2. Aplicar filtro de búsqueda si provisto
3. Aplicar paginación
4. Incluir conteo de facturas por cliente

**Output:**
- Success: `{ success: true, clients: ClientObject[], total: number, page: number, totalPages: number }`

---

### FR-012: Actualizar Cliente

**Relacionado a:** EPIC-003, US 3.3

**Input:**
- `clientId` (uuid, requerido)
- Campos opcionales: `name`, `email`, `company`, `phone`, `address`, `taxId`, `notes`

**Processing:**
1. Verificar que cliente pertenece al usuario (RLS)
2. Validar campos modificados
3. Update en `clients`
4. Retornar cliente actualizado

**Output:**
- Success: `{ success: true, client: ClientObject }`
- Error 404: `{ success: false, error: { code: "CLIENT_NOT_FOUND", ... } }`

---

### FR-013: Eliminar Cliente

**Relacionado a:** EPIC-003, US 3.6

**Input:**
- `clientId` (uuid, requerido)

**Processing:**
1. Verificar que cliente pertenece al usuario
2. Verificar que cliente no tiene facturas asociadas (o soft delete)
3. Soft delete: `deleted_at = now()`

**Output:**
- Success: `{ success: true }`
- Error 400: `{ success: false, error: { code: "CLIENT_HAS_INVOICES", ... } }`

---

### FR-014: Ver Historial de Facturas de Cliente

**Relacionado a:** EPIC-003, US 3.5

**Input:**
- `clientId` (uuid, requerido)

**Processing:**
1. Query `invoices` donde `client_id` = clientId y `user_id` = usuario
2. Ordenar por `created_at` desc
3. Incluir totales por estado

**Output:**
- Success: `{ success: true, invoices: InvoiceObject[], summary: { total: number, paid: number, pending: number, overdue: number } }`

---

## EPIC-SOLOQ-004: Invoice Creation

### FR-015: Crear Factura

**Relacionado a:** EPIC-004, US 4.1-4.10

**Input:**
- `clientId` (uuid, requerido)
- `invoiceNumber` (string, opcional - auto-genera si no provisto)
- `issueDate` (date, default today)
- `dueDate` (date, requerido)
- `items` (array, min 1):
  - `description` (string, max 500 chars, requerido)
  - `quantity` (number, > 0, requerido)
  - `unitPrice` (number, >= 0, requerido)
- `taxRate` (number, 0-100, default 0)
- `discountType` (enum: "percentage", "fixed", opcional)
- `discountValue` (number, opcional)
- `notes` (string, max 2000 chars, opcional)
- `status` (enum: "draft", "sent", default "draft")
- `currency` (string, default "USD")

**Processing:**
1. Validar cliente existe y pertenece al usuario
2. Generar invoiceNumber si no provisto (formato: INV-YYYY-NNNN)
3. Validar que invoiceNumber es único para el usuario
4. Calcular subtotal, descuento, impuestos, total
5. Insertar en `invoices`
6. Insertar items en `invoice_items`
7. Retornar factura completa

**Calculations:**
```
subtotal = SUM(items.quantity * items.unitPrice)
discount = discountType === "percentage" ? subtotal * (discountValue / 100) : discountValue
taxableAmount = subtotal - discount
tax = taxableAmount * (taxRate / 100)
total = taxableAmount + tax
```

**Output:**
- Success: `{ success: true, invoice: InvoiceObject }`

---

### FR-016: Actualizar Factura

**Relacionado a:** EPIC-004, US 4.1-4.10

**Input:**
- `invoiceId` (uuid, requerido)
- Campos opcionales: todos los de FR-015 excepto `invoiceNumber`

**Processing:**
1. Verificar factura pertenece al usuario
2. Verificar estado permite edición (draft o sent, no paid)
3. Recalcular totales si items cambian
4. Update `invoices` e `invoice_items`

**Output:**
- Success: `{ success: true, invoice: InvoiceObject }`
- Error 400: `{ success: false, error: { code: "INVOICE_NOT_EDITABLE", ... } }`

---

### FR-017: Obtener Siguiente Número de Factura

**Relacionado a:** EPIC-004, US 4.7

**Input:** None

**Processing:**
1. Query última factura del usuario ordenada por invoiceNumber
2. Incrementar número
3. Formato: INV-{YYYY}-{NNNN} donde NNNN es secuencial

**Output:**
- Success: `{ success: true, nextNumber: "INV-2026-0042" }`

---

## EPIC-SOLOQ-005: PDF Generation

### FR-018: Generar PDF de Factura

**Relacionado a:** EPIC-005, US 5.1-5.4

**Input:**
- `invoiceId` (uuid, requerido)
- `templateId` (string, opcional, default "basic") - Pro feature

**Processing:**
1. Obtener factura completa con cliente, items, perfil de negocio
2. Obtener métodos de pago del usuario
3. Renderizar template con @react-pdf/renderer
4. Generar buffer PDF
5. Opcionalmente guardar en Supabase Storage
6. Retornar PDF

**Output:**
- Success: PDF file stream o URL de descarga
- Headers: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="INV-2026-0042.pdf"`

**PDF Content:**
- Header: Logo, nombre de negocio, datos de contacto
- Factura: Número, fecha emisión, fecha vencimiento
- Cliente: Nombre, empresa, email, datos fiscales
- Items: Tabla con descripción, cantidad, precio, subtotal
- Totales: Subtotal, descuento, impuestos, total
- Métodos de pago: Lista de opciones configuradas
- Footer: Notas/términos

---

## EPIC-SOLOQ-006: Invoice Sending

### FR-019: Enviar Factura por Email

**Relacionado a:** EPIC-006, US 6.1-6.5

**Input:**
- `invoiceId` (uuid, requerido)
- `subject` (string, max 200 chars, opcional - default template)
- `message` (string, max 2000 chars, opcional - default template)
- `ccEmail` (string, opcional) - copia al usuario

**Processing:**
1. Obtener factura y verificar pertenece al usuario
2. Generar PDF (FR-018)
3. Construir email con React Email template
4. Enviar via Resend con PDF adjunto
5. Actualizar estado factura a "sent" si era "draft"
6. Registrar en `invoice_events` (tipo: "sent")

**Output:**
- Success: `{ success: true, emailId: "resend_id" }`
- Error 500: `{ success: false, error: { code: "EMAIL_FAILED", ... } }`

**Email Template Variables:**
- `{businessName}` - Nombre del negocio
- `{clientName}` - Nombre del cliente
- `{invoiceNumber}` - Número de factura
- `{total}` - Total formateado
- `{dueDate}` - Fecha de vencimiento
- `{paymentMethods}` - Lista de métodos de pago

---

## EPIC-SOLOQ-007: Dashboard & Tracking

### FR-020: Obtener Dashboard Summary

**Relacionado a:** EPIC-007, US 7.1, 7.3

**Input:** None

**Processing:**
1. Query facturas del usuario con agregaciones
2. Calcular totales por estado
3. Identificar facturas vencidas

**Output:**
```json
{
  "success": true,
  "summary": {
    "totalPending": 5000.00,
    "totalOverdue": 1500.00,
    "totalPaidThisMonth": 8000.00,
    "counts": {
      "draft": 2,
      "sent": 5,
      "paid": 12,
      "overdue": 3
    }
  }
}
```

---

### FR-021: Listar Facturas con Filtros

**Relacionado a:** EPIC-007, US 7.2, 7.5

**Input:**
- `status` (enum: "all", "draft", "sent", "paid", "overdue", default "all")
- `clientId` (uuid, opcional)
- `search` (string, opcional) - busca en número, cliente
- `dateFrom` (date, opcional)
- `dateTo` (date, opcional)
- `page` (number, default 1)
- `limit` (number, default 20)
- `sortBy` (enum: "created_at", "due_date", "total", default "created_at")
- `sortOrder` (enum: "asc", "desc", default "desc")

**Processing:**
1. Query `invoices` con filtros
2. Join con `clients` para nombre
3. Calcular campo `isOverdue` dinámicamente
4. Aplicar paginación

**Output:**
- Success: `{ success: true, invoices: InvoiceListObject[], total: number, page: number, totalPages: number }`

---

## EPIC-SOLOQ-008: Payment Tracking

### FR-022: Registrar Pago de Factura

**Relacionado a:** EPIC-008, US 8.1-8.5

**Input:**
- `invoiceId` (uuid, requerido)
- `paymentMethod` (string, max 50 chars, requerido) - "bank_transfer", "paypal", etc.
- `amountReceived` (number, > 0, requerido)
- `paymentDate` (date, default today)
- `notes` (string, max 500 chars, opcional)
- `reference` (string, max 100 chars, opcional) - número de transferencia

**Processing:**
1. Verificar factura existe y pertenece al usuario
2. Verificar factura no está ya pagada
3. Insertar en `payments`
4. Actualizar `invoices.status` a "paid"
5. Actualizar `invoices.paid_at`
6. Registrar en `invoice_events`

**Output:**
- Success: `{ success: true, payment: PaymentObject, invoice: InvoiceObject }`

---

### FR-023: Revertir Pago

**Relacionado a:** EPIC-008, US 8.6

**Input:**
- `invoiceId` (uuid, requerido)

**Processing:**
1. Verificar factura está en estado "paid"
2. Soft delete del payment
3. Actualizar estado a "sent" (o "overdue" si aplica)
4. Registrar en `invoice_events`

**Output:**
- Success: `{ success: true, invoice: InvoiceObject }`

---

## EPIC-SOLOQ-009: Automatic Reminders (Pro)

### FR-024: Configurar Recordatorios Automáticos

**Relacionado a:** EPIC-009, US 9.1-9.3

**Input:**
- `enabled` (boolean, requerido)
- `frequency` (number, días entre recordatorios, 1-30, default 7)
- `maxReminders` (number, 1-10, default 3)
- `customSubject` (string, max 200 chars, opcional)
- `customMessage` (string, max 2000 chars, opcional)

**Processing:**
1. Verificar usuario tiene suscripción Pro
2. Upsert en `reminder_settings`
3. Si enabled, programar jobs para facturas vencidas existentes

**Output:**
- Success: `{ success: true, settings: ReminderSettingsObject }`
- Error 403: `{ success: false, error: { code: "PRO_REQUIRED", ... } }`

---

### FR-025: Ejecutar Recordatorio Automático (Background Job)

**Relacionado a:** EPIC-009, US 9.1

**Trigger:** Cron job diario o Supabase Edge Function

**Processing:**
1. Query facturas vencidas de usuarios Pro con reminders enabled
2. Filtrar las que no han alcanzado maxReminders
3. Filtrar las que cumplen frecuencia (último reminder > frequency días)
4. Por cada factura:
   - Generar email de recordatorio
   - Enviar via Resend
   - Registrar en `invoice_events` (tipo: "reminder_sent")
   - Incrementar `invoices.reminder_count`

**Output:** Log de ejecución

---

### FR-026: Ver Historial de Recordatorios

**Relacionado a:** EPIC-009, US 9.5

**Input:**
- `invoiceId` (uuid, requerido)

**Processing:**
1. Query `invoice_events` donde `type` = "reminder_sent"
2. Ordenar por fecha desc

**Output:**
- Success: `{ success: true, reminders: ReminderEventObject[] }`

---

## EPIC-SOLOQ-010: Subscription Management

### FR-027: Obtener Estado de Suscripción

**Relacionado a:** EPIC-010, US 10.1, 10.3

**Input:** None

**Processing:**
1. Query `subscriptions` donde `user_id` = usuario
2. Verificar estado con Stripe (opcional sync)

**Output:**
```json
{
  "success": true,
  "subscription": {
    "plan": "free" | "pro",
    "status": "active" | "canceled" | "past_due",
    "currentPeriodEnd": "2026-02-20",
    "cancelAtPeriodEnd": false
  }
}
```

---

### FR-028: Crear Checkout Session (Upgrade a Pro)

**Relacionado a:** EPIC-010, US 10.2

**Input:**
- `successUrl` (string, URL de redirect después de pago exitoso)
- `cancelUrl` (string, URL de redirect si cancela)

**Processing:**
1. Crear Stripe Checkout Session para precio Pro
2. Guardar session ID en `subscriptions`
3. Retornar URL de checkout

**Output:**
- Success: `{ success: true, checkoutUrl: "https://checkout.stripe.com/..." }`

---

### FR-029: Webhook de Stripe (Background)

**Relacionado a:** EPIC-010, US 10.2-10.4

**Trigger:** Stripe Webhook

**Events manejados:**
- `checkout.session.completed`: Activar suscripción Pro
- `invoice.paid`: Registrar pago de suscripción
- `customer.subscription.deleted`: Marcar como cancelada
- `customer.subscription.updated`: Actualizar estado

**Processing:** Según evento, actualizar `subscriptions`

---

*Documento parte del SRS de SoloQ - Fase 2 Architecture*
