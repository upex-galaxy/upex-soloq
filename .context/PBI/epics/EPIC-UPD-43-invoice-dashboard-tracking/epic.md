# EPIC: Invoice Dashboard & Tracking

**Jira Key:** UPD-43
**Status:** To Do
**Priority:** HIGH
**Phase:** Phase 2: Core Invoicing (Sprint 4-6)

---

## Epic Description

Esta épica se enfoca en proporcionar al freelancer una vista centralizada y poderosa para gestionar todas sus facturas. El dashboard es el centro neurálgico de la aplicación, donde el usuario puede obtener una visión rápida de la salud financiera de su negocio independiente.

La funcionalidad principal incluye un listado completo de todas las facturas, con la capacidad de filtrar por estado (borrador, enviada, pagada, vencida) y buscar por cliente o número. Además, el dashboard presentará métricas clave como el monto total pendiente de cobro y destacará las facturas vencidas para que el usuario pueda tomar acción inmediata.

**Business Value:**
El dashboard ataca directamente el "pain point" de la falta de visibilidad financiera. Al centralizar toda la información y presentarla de forma clara, se empodera al freelancer para que sepa exactamente cuánto dinero se le debe, quién se lo debe y qué cobros están atrasados. Esto reduce la ansiedad financiera y permite un seguimiento proactivo de los pagos, lo que a su vez disminuye el tiempo promedio de cobro.

---

## User Stories

1.  **UPD-44** - As a user, I want to see a dashboard with all my invoices to get a general overview
2.  **UPD-45** - As a user, I want to filter invoices by status (draft, sent, paid, overdue) to find the ones I need
3.  **UPD-46** - As a user, I want to see the total amount pending collection to know my financial situation
4.  **UPD-47** - As a user, I want to see overdue invoices highlighted to prioritize follow-up
5.  **UPD-48** - As a user, I want to search for invoices by client or number to find a specific one
6.  **UPD-49** - As a user, I want to see a summary of income of the month to track my progress

---

## Scope

### In Scope

- Una página principal (`/dashboard` o `/invoices`) que lista todas las facturas.
- Widgets o KPIs en la parte superior que muestran métricas clave (total pendiente, total vencido, etc.).
- Controles de UI para filtrar la lista de facturas por su estado.
- Una barra de búsqueda para filtrar la lista por texto.
- Indicadores visuales (ej. colores o badges) para los diferentes estados de las facturas.

### Out of Scope (Future)

- Dashboards personalizables con widgets que el usuario puede añadir o quitar.
- Gráficos avanzados de ingresos vs. gastos.
- Proyecciones de flujo de caja (cash flow).
- Exportación de los datos del dashboard a CSV o Excel.

---

## Acceptance Criteria (Epic Level)

1. ✅ El dashboard principal proporciona un resumen financiero preciso y en tiempo real del estado de las facturas del usuario.
2. ✅ Un usuario puede encontrar cualquier factura rápidamente usando las herramientas de búsqueda y filtrado.
3. ✅ Las facturas vencidas son inmediatamente identificables en el dashboard.
4. ✅ La lista de facturas se actualiza automáticamente para reflejar cambios de estado (ej. al marcar una factura como pagada).

---

## Related Functional Requirements

- **FR-020:** Obtener Dashboard Summary
- **FR-021:** Listar Facturas con Filtros

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Backend

- Se creará un endpoint `GET /api/invoices/dashboard` para obtener las métricas agregadas del resumen.
- El endpoint `GET /api/invoices` se expandirá para soportar los parámetros de filtrado (`status`, `search`, etc.).
- Las consultas a la base de datos deben ser eficientes y estar bien indexadas, especialmente en la tabla `invoices`, para soportar los filtros y la búsqueda sin degradar el rendimiento.

### Database Schema

**Tables:**

- `public.invoices`: La tabla principal a consultar. Debe tener índices en `user_id`, `status`, `due_date`, y `client_id`.
- `public.clients`: Se necesitará un `JOIN` para buscar por nombre de cliente.

---

## Dependencies

### Internal Dependencies

- **UPD-20 (Invoice Creation Epic):** Necesita que existan facturas para poder mostrarlas y gestionarlas.
- **UPD-13 (Client Management Epic):** Necesita los datos de los clientes para la búsqueda.

### Blocks

- **EPIC-SOLOQ-008 (Payment Tracking):** La acción de "marcar como pagada" se realiza comúnmente desde este dashboard.
- **EPIC-SOLOQ-009 (Automatic Reminders):** El dashboard es el lugar donde el usuario identifica las facturas sobre las cuales se activarán los recordatorios.

---

## Testing Strategy

### Test Coverage Requirements

- **Unit Tests:** Componentes de UI del dashboard (filtros, lista de facturas).
- **Integration Tests:** Endpoints `/api/invoices/dashboard` y `/api/invoices` con todos sus parámetros de filtrado.
- **E2E Tests:** Flujos completos como: filtrar por "overdue", buscar un cliente específico, y verificar que la lista se actualiza correctamente. Verificar que los KPIs del resumen son precisos.

---

## Implementation Plan

### Estimated Effort

- **Development:** 1.5 Sprints
- **Testing:** 0.5 Sprints
- **Total:** 2 Sprints
