# EPIC: Payment Tracking

**Jira Key:** UPD-50
**Status:** To Do
**Priority:** HIGH
**Phase:** Phase 2: Core Invoicing (Sprint 4-6)

---

## Epic Description

Esta épica es crucial para cerrar el ciclo de facturación. Se enfoca en permitir a los freelancers registrar los pagos que reciben, actualizando el estado de las facturas correspondientes. Esto proporciona claridad sobre qué facturas han sido pagadas y cuáles no.

La funcionalidad permitirá al usuario marcar una factura como "Pagada" y registrar detalles importantes del pago, como el método utilizado, el monto recibido, la fecha del pago y notas de referencia. También se incluye la capacidad de revertir un pago en caso de error, devolviendo la factura a su estado anterior.

**Business Value:**
El seguimiento de pagos es fundamental para una gestión financiera precisa. Permite a los freelancers tener un registro claro de sus ingresos, reduce la confusión sobre qué facturas están pendientes y actualiza las métricas clave del dashboard, como el "Total Pendiente" y el "Ingreso Mensual". Esto es vital para la toma de decisiones y la planificación financiera.

---

## User Stories

1.  **UPD-51** - As a user, I want to mark an invoice as paid to update its status
2.  **UPD-52** - As a user, I want to register the payment method used (transfer, PayPal, etc.) to have a record
3.  **UPD-53** - As a user, I want to register the amount received to verify against the invoiced total
4.  **UPD-54** - As a user, I want to add notes to the payment (transfer reference, etc.) to have context
5.  **UPD-55** - As a user, I want to register the payment date for an accurate history
6.  **UPD-56** - As a user, I want to be able to revert an invoice from "paid" to "pending" to correct errors

---

## Scope

### In Scope

- Una acción para "Marcar como Pagada" en las facturas con estado "Sent" u "Overdue".
- Un formulario (modal) para registrar los detalles del pago.
- Al registrar un pago, el estado de la factura cambia a "Pagada".
- La capacidad de registrar pagos parciales (si el monto recibido es menor al total de la factura). En este caso, la factura permanecerá en estado "Sent" o "Overdue". _(Nota: Se simplificará en las stories para el MVP, registrando el pago completo)_.
- Una acción para revertir el último pago de una factura, cambiando su estado de nuevo a "Sent" u "Overdue".

### Out of Scope (Future)

- Registro de múltiples pagos parciales para una sola factura.
- Conciliación bancaria automática.
- Integración con pasarelas de pago para detectar pagos automáticamente.

---

## Acceptance Criteria (Epic Level)

1. ✅ Un usuario puede registrar exitosamente un pago para una factura enviada, y el estado de la factura se actualiza a "Pagada".
2. ✅ Los detalles del pago (método, monto, fecha) se guardan de forma precisa.
3. ✅ Las métricas del dashboard (Total Pendiente, Ingreso Mensual) se actualizan correctamente después de registrar o revertir un pago.
4. ✅ Es posible corregir un error revirtiendo un pago.

---

## Related Functional Requirements

- **FR-022:** Registrar Pago de Factura
- **FR-023:** Revertir Pago

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Backend

- Se creará un endpoint `POST /api/invoices/{invoiceId}/payments` para registrar un nuevo pago.
- Se creará un endpoint `DELETE /api/invoices/{invoiceId}/payments` (o similar) para revertir el pago.
- La lógica de negocio debe ser transaccional: al registrar un pago, se debe insertar en la tabla `payments` y actualizar el estado en la tabla `invoices` en la misma operación.
- Se debe registrar un evento 'paid' en la tabla `invoice_events`.

### Database Schema

**Tables:**

- `public.payments`: Almacenará los detalles de cada pago, vinculado a una `invoice_id`.
- `public.invoices`: El campo `status` y `paid_at` serán actualizados.
- `public.invoice_events`: Se registrará el evento de pago.

---

## Dependencies

### Internal Dependencies

- **UPD-43 (Invoice Dashboard Epic):** El dashboard es el lugar principal desde donde los usuarios iniciarán la acción de registrar un pago.
- **UPD-37 (Invoice Sending Epic):** Una factura debe haber sido enviada para poder ser pagada.

### Blocks

- Proporciona los datos para las métricas de ingresos y el seguimiento del rendimiento del negocio del freelancer.

---

## Testing Strategy

### Test Coverage Requirements

- **Unit Tests:** Lógica del formulario de registro de pago.
- **Integration Tests:** Endpoints de la API de pagos, asegurando que la lógica transaccional (inserción en `payments` y actualización de `invoices`) funciona correctamente.
- **E2E Tests:** Flujo completo: encontrar una factura "Sent", marcarla como pagada, verificar que su estado cambia a "Paid" y que los KPIs del dashboard se actualizan. Probar también el flujo de reversión.

---

## Implementation Plan

### Estimated Effort

- **Development:** 1 Sprint
- **Testing:** 0.5 Sprints
- **Total:** 1.5 Sprints
