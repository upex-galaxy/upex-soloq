# EPIC: Automatic Reminders

**Jira Key:** UPD-57
**Status:** To Do
**Priority:** MEDIUM
**Phase:** Phase 3: Monetization & Pro Features (Sprint 7-8)

---

## Epic Description

Esta épica implementa una de las características clave de la suscripción "Pro": el sistema de recordatorios automáticos para facturas vencidas. Elimina la vergüenza y el tiempo administrativo que los freelancers dedican a perseguir pagos.

La funcionalidad principal es la capacidad de configurar recordatorios de pago automáticos que se envían a los clientes cuando una factura ha vencido. El usuario "Pro" podrá configurar la frecuencia de estos recordatorios, personalizar el mensaje para mantener su tono de comunicación, y pausar los recordatorios para facturas específicas si hay acuerdos especiales con un cliente. También se proporcionará un historial de recordatorios enviados para cada factura.

**Business Value:**
Esta es una característica de monetización clave que ofrece un valor significativo a los usuarios. Los recordatorios automáticos mejoran drásticamente el flujo de caja del freelancer al reducir el tiempo promedio de cobro, eliminan la fricción personal de tener que "pedir dinero" y aumentan la eficiencia. Es un "must-have" para el plan Pro y un diferenciador del producto.

---

## User Stories

1.  **UPD-58** - As a Pro user, I want the system to send automatic reminders for overdue invoices so I don't have to do it manually
2.  **UPD-59** - As a Pro user, I want to configure the frequency of reminders (every X days) to adjust to my needs
3.  **UPD-60** - As a Pro user, I want to customize the reminder message to maintain my tone of communication
4.  **UPD-61** - As a Pro user, I want to pause reminders for a specific invoice for clients with special agreements
5.  **UPD-62** - As a Pro user, I want to see the history of reminders sent to know how many times I have contacted the client

---

## Scope

### In Scope

- Un "cron job" o función Edge que se ejecuta diariamente para identificar facturas vencidas.
- Envío de emails de recordatorio a través de Resend.
- Configuración global de recordatorios (activar/desactivar, frecuencia, límite de recordatorios).
- Personalización del asunto y cuerpo del email de recordatorio.
- Opción de pausar recordatorios en una factura específica.
- Registro de eventos de recordatorio en `invoice_events`.

### Out of Scope (Future)

- Recordatorios por SMS o WhatsApp.
- Diferentes plantillas de recordatorio para diferentes clientes.
- Recordatorios que escalan en tono o frecuencia con el tiempo de vencimiento.

---

## Acceptance Criteria (Epic Level)

1. ✅ Un usuario Pro puede activar y configurar recordatorios automáticos para sus facturas vencidas.
2. ✅ Los recordatorios se envían automáticamente según la configuración, pero se detienen una vez que la factura es pagada o se alcanzan los recordatorios máximos.
3. ✅ El usuario Pro tiene control sobre el contenido y la frecuencia de los recordatorios.
4. ✅ Los usuarios Free son informados de que esta es una función Pro.

---

## Related Functional Requirements

- **FR-024:** Configurar Recordatorios Automáticos
- **FR-025:** Ejecutar Recordatorio Automático (Background Job)
- **FR-026:** Ver Historial de Recordatorios

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Backend

- Se implementará una Supabase Edge Function (o un cron job externo en Vercel) que se ejecuta diariamente.
- Esta función consultará la base de datos para identificar facturas vencidas de usuarios Pro que tienen los recordatorios activados y aún no han alcanzado el límite de recordatorios.
- Utilizará Resend para enviar los emails de recordatorio, posiblemente con plantillas de React Email.
- Deberá actualizar el contador `reminder_count` en la factura y registrar un evento `reminder_sent` en `invoice_events`.

### Database Schema

**Tables:**

- `public.reminder_settings`: Nueva tabla para las configuraciones de recordatorio por usuario.
- `public.invoices`: Se actualizará `reminder_count`.
- `public.invoice_events`: Se insertarán eventos de `reminder_sent`.
- `public.subscription`: Se consultará para verificar el plan del usuario (Pro vs Free).

---

## Dependencies

### External Dependencies

- **Resend:** Para el envío de emails.
- **Supabase Edge Functions / Vercel Cron Jobs:** Para la ejecución programada.

### Internal Dependencies

- **UPD-50 (Payment Tracking Epic):** Los recordatorios se detienen una vez que la factura se marca como pagada.
- **EPIC-SOLOQ-010 (Subscription Management):** Esta épica debe asegurar que el usuario sea "Pro" para acceder a esta funcionalidad.

### Blocks

- Es una de las principales características para impulsar la conversión al plan Pro.

---

## Success Metrics

### Functional Metrics

- Tasa de éxito de envío de recordatorios > 98%.
- Ejecución diaria del cron job sin fallos > 99%.

### Business Metrics

- Conversión de usuarios Free a Pro impulsada por esta funcionalidad.
- Reducción del tiempo promedio de cobro para usuarios Pro.

---

## Risks & Mitigations

| Risk                                                 | Impact | Probability | Mitigation                                                                                                                                                 |
| ---------------------------------------------------- | ------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recordatorios enviados a facturas ya pagadas         | High   | Medium      | Asegurar que la query de la función Edge excluya explícitamente las facturas con `status = 'paid'`. Implementar un "doble check" antes de enviar el email. |
| Spamming a los clientes por errores de configuración | High   | Low         | Limitar el número máximo de recordatorios por factura (`max_reminders`). Permiso para pausar recordatorios por factura.                                    |

---

## Testing Strategy

### Test Coverage Requirements

- **Unit Tests:** Lógica de cálculo de la próxima fecha de recordatorio.
- **Integration Tests:** Función Edge para verificar que las consultas a DB son correctas y que Resend es llamado con el payload adecuado.
- **E2E Tests:** Flujo completo: crear una factura, dejarla vencer, activar recordatorios (como usuario Pro), esperar la ejecución del cron, verificar que se envía el email y se registra el evento. Luego, pagar la factura y verificar que los recordatorios cesan.

---

## Implementation Plan

### Estimated Effort

- **Development:** 2 Sprints
- **Testing:** 1 Sprint
- **Total:** 3 Sprints
