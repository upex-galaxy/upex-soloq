# EPIC: Invoice Sending

**Jira Key:** UPD-37
**Status:** To Do
**Priority:** CRITICAL
**Phase:** Phase 2: Core Invoicing (Sprint 4-6)

---

## Epic Description

Esta épica se encarga de una de las acciones más importantes del ciclo de vida de una factura: el envío al cliente. El objetivo es que este proceso sea lo más simple y rápido posible, idealmente con un solo clic.

La funcionalidad permitirá al usuario enviar la factura generada como un PDF adjunto directamente al correo electrónico del cliente. El cuerpo del email incluirá información clave y los datos de pago para facilitar el cobro. Además, se dará al usuario la opción de personalizar el mensaje para mantener su tono de comunicación y la capacidad de verificar que el envío fue exitoso.

**Business Value:**
Simplificar el envío de facturas reduce la fricción y el tiempo administrativo, permitiendo a los freelancers cobrar más rápido. Un email profesional con un PDF adjunto mejora la percepción del cliente y proporciona toda la información necesaria en un solo lugar, disminuyendo las idas y venidas de comunicación y las excusas para no pagar a tiempo.

---

## User Stories

1.  **UPD-38** - As a user, I want to send the invoice by email to the client with one click to save time
2.  **UPD-39** - As a user, I want the email to include the PDF attached so the client has the invoice
3.  **UPD-40** - As a user, I want the email to include my payment details to facilitate the cobro
4.  **UPD-41** - As a user, I want to customize the subject and message of the email to better communicate with my client
5.  **UPD-42** - As a user, I want to see if the email was sent successfully to have certainty that it arrived

---

## Scope

### In Scope

- Un botón "Enviar por Email" en la página de la factura.
- Un modal de confirmación que muestra el destinatario, asunto y cuerpo del email.
- Capacidad de editar el asunto y cuerpo del email antes de enviar.
- El backend se encarga de generar el PDF y adjuntarlo al email.
- El email se envía utilizando un servicio de email transaccional (Resend).
- El estado de la factura se actualiza a "sent" después de un envío exitoso.

### Out of Scope (Future)

- Programar el envío de facturas para una fecha futura.
- Enviar facturas a través de otros canales como WhatsApp.
- Tracking de apertura de emails o clics en enlaces.
- Reenviar automáticamente facturas que rebotaron (bounce).

---

## Acceptance Criteria (Epic Level)

1. ✅ Un usuario puede enviar una factura completa a un cliente por email con no más de dos clics.
2. ✅ El cliente recibe un email profesional que contiene la factura en formato PDF adjunto.
3. ✅ El estado de la factura se actualiza correctamente en la base de datos y en la UI después del envío.
4. ✅ El sistema maneja correctamente los fallos en el envío de email y notifica al usuario.

---

## Related Functional Requirements

- **FR-019:** Enviar Factura por Email

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Backend

- Se creará un endpoint `POST /api/invoices/{invoiceId}/send`.
- Este endpoint primero generará el PDF de la factura (reutilizando la lógica de la épica anterior).
- Luego, usará la librería de Resend para construir y enviar el email con el PDF como adjunto.
- Se utilizarán plantillas de email creadas con React Email para un desarrollo tipado y seguro.
- Tras un envío exitoso, se actualizará `invoices.status` a 'sent' y se registrará un evento en `invoice_events`.

### External Services

- **Resend:** para el envío de emails.

---

## Dependencies

### Internal Dependencies

- **UPD-31 (PDF Generation Epic):** Es un prerrequisito indispensable, ya que el PDF debe ser generado antes de poder ser adjuntado.
- **UPD-20 (Invoice Creation Epic):** Se necesita una factura completa para enviar.

### Blocks

- **EPIC-SOLOQ-008 (Payment Tracking):** El seguimiento de pagos comienza una vez que la factura ha sido enviada.
- **EPIC-SOLOQ-009 (Automatic Reminders):** Los recordatorios se programan sobre facturas ya enviadas.

---

## Testing Strategy

### Test Coverage Requirements

- **Unit Tests:** Componentes de React Email para las plantillas.
- **Integration Tests:** El endpoint `POST /api/invoices/{invoiceId}/send` para verificar que interactúa correctamente con Resend y actualiza la base de datos.
- **E2E Tests:** Flujo completo de crear una factura, hacer clic en "enviar", personalizar el mensaje y confirmar el envío. (Se usará un servicio de email de prueba como MailHog o similar para interceptar y verificar el email enviado).

---

## Implementation Plan

### Estimated Effort

- **Development:** 1 Sprint
- **Testing:** 0.5 Sprints
- **Total:** 1.5 Sprints
