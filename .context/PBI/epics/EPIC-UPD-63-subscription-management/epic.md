# EPIC: Subscription Management

**Jira Key:** UPD-63
**Status:** To Do
**Priority:** MEDIUM
**Phase:** Phase 3: Monetization & Pro Features (Sprint 7-8)

---

## Epic Description

Esta épica introduce la lógica de monetización en la aplicación, gestionando las diferencias entre los planes "Free" y "Pro". Es fundamental para el modelo de negocio freemium de SoloQ.

La funcionalidad permitirá a los usuarios gratuitos ver las ventajas de la suscripción Pro y les proporcionará un flujo claro para actualizar su plan. Para los usuarios Pro, se ofrecerán herramientas para gestionar su suscripción, como ver el estado, la fecha de renovación y cancelarla. Esto se logrará a través de una integración con Stripe para el procesamiento de pagos y la gestión de suscripciones.

**Business Value:**
Esta épica es la base del modelo de ingresos de SoloQ. Un flujo de actualización claro y la correcta gestión de las suscripciones son esenciales para convertir usuarios gratuitos en clientes de pago y para retener a esos clientes proporcionando una experiencia de gestión transparente.

---

## User Stories

1.  **UPD-64** - As a Free user, I want to see which features are limited to Pro to understand the value of upgrading
2.  **UPD-65** - As a Free user, I want to be able to easily upgrade to Pro to access automatic reminders
3.  **UPD-66** - As a Pro user, I want to manage my subscription (see renewal date, cancel) to have control
4.  **UPD-67** - As a Pro user, I want to see my subscription payment history for my records

---

## Scope

### In Scope

- Integración con Stripe para gestionar suscripciones.
- Una página de precios o "upgrade" que muestre las diferencias entre los planes.
- Un flujo de checkout manejado por Stripe para que los usuarios puedan introducir sus datos de pago de forma segura.
- Una sección en la configuración del usuario para ver el estado de la suscripción, la fecha de renovación y un portal para cancelarla o actualizar el método de pago (Stripe Customer Portal).
- Webhooks de Stripe para mantener el estado de la suscripción sincronizado con la base de datos de SoloQ.
- Lógica en la aplicación (gating) para restringir el acceso a las funciones Pro.

### Out of Scope (Future)

- Múltiples niveles de planes Pro (ej. Pro, Business).
- Planes anuales con descuento.
- Pruebas gratuitas (free trials) del plan Pro.
- Cupones o códigos de descuento.

---

## Acceptance Criteria (Epic Level)

1. ✅ Un usuario gratuito puede actualizar a Pro a través de un flujo de pago seguro gestionado por Stripe.
2. ✅ Una vez que un usuario se suscribe a Pro, obtiene acceso inmediato a las funciones Pro (como los recordatorios automáticos).
3. ✅ Un usuario Pro puede ver el estado de su suscripción y cancelarla en cualquier momento.
4. ✅ El estado de la suscripción en la aplicación se mantiene sincronizado con el estado real en Stripe.

---

## Related Functional Requirements

- **FR-027:** Obtener Estado de Suscripción
- **FR-028:** Crear Checkout Session (Upgrade a Pro)
- **FR-029:** Webhook de Stripe (Background)

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Backend

- Se crearán endpoints para interactuar con Stripe: `POST /api/subscription/checkout` para crear una sesión de pago y `POST /api/webhooks/stripe` para recibir eventos de Stripe.
- El webhook es crítico y debe ser seguro, verificando la firma de la solicitud de Stripe.
- El webhook manejará eventos como `checkout.session.completed`, `customer.subscription.updated`, y `customer.subscription.deleted` para actualizar la tabla `subscription` en la base de datos.
- Se necesita una lógica de "feature flagging" o "gating" basada en el estado de la suscripción del usuario.

### Database Schema

**Tables:**

- `public.subscription`: Nueva tabla para almacenar el estado de la suscripción de cada usuario, incluyendo `plan`, `status`, `stripe_customer_id`, `stripe_subscription_id`, `current_period_end`.

### External Services

- **Stripe:** Para todo el procesamiento de pagos y la gestión de suscripciones.

---

## Dependencies

### Internal Dependencies

- **UPD-1 (Authentication Epic):** Se necesita un usuario para poder tener una suscripción.
- **EPIC-SOLOQ-009 (Automatic Reminders):** Es la principal característica Pro que se desbloquea con esta épica.

### Blocks

- Es la única fuente de ingresos para el producto en el MVP.

---

## Success Metrics

### Business Metrics

- Tasa de conversión de Free a Pro.
- MRR (Monthly Recurring Revenue).
- Churn Rate (tasa de cancelación de suscripciones).

---

## Testing Strategy

### Test Coverage Requirements

- **Unit Tests:** Lógica de gating de features.
- **Integration Tests:** Endpoints de checkout y, especialmente, el webhook de Stripe. Se debe usar el CLI de Stripe para simular eventos de webhook y verificar que la base de datos se actualiza correctamente.
- **E2E Tests:** Flujo completo: como usuario Free, hacer clic en "Upgrade", completar un checkout de prueba de Stripe, ser redirigido de vuelta a la app y verificar que ahora se tiene acceso a las funciones Pro. Probar también el flujo de cancelación a través del portal de cliente de Stripe.

---

## Implementation Plan

### Estimated Effort

- **Development:** 2 Sprints
- **Testing:** 1 Sprint
- **Total:** 3 Sprints
