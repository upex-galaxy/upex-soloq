# EPIC: Client Management

**Jira Key:** UPD-13
**Status:** To Do
**Priority:** HIGH
**Phase:** Phase 1: Foundation (Sprint 1-3)

---

## Epic Description

Esta épica establece la base para la gestión de clientes, una entidad central en cualquier sistema de facturación. Permite a los freelancers crear y mantener una base de datos de las personas o empresas a las que facturan, eliminando la necesidad de introducir sus datos repetidamente.

El alcance incluye la creación, visualización, edición y eliminación de clientes. Además, introduce la capacidad de ver un historial de facturas por cliente, proporcionando un contexto valioso para el freelancer en su relación comercial. Esta funcionalidad es un pilar fundamental para el flujo de creación de facturas.

**Business Value:**
Centralizar la gestión de clientes ahorra una cantidad significativa de tiempo y reduce los errores de entrada de datos. Permite a los freelancers tener una visión organizada de con quién trabajan y facilita el seguimiento. Ver el historial de facturación por cliente ayuda a tomar decisiones comerciales, como ofrecer descuentos a clientes recurrentes o identificar a los más rentables.

---

## User Stories

1. **UPD-14** - As a user, I want to add a new client with name and email to be able to invoice them
2. **UPD-15** - As a user, I want to see the list of all my clients to quickly find who I need to invoice
3. **UPD-16** - As a user, I want to edit a client's data to keep the information updated
4. **UPD-17** - As a user, I want to add the client's tax data (RFC/NIT) to include it in the invoice
5. **UPD-18** - As a user, I want to see a client's invoice history to have context of our relationship
6. **UPD-19** - As a user, I want to delete a client I no longer use to keep my list clean

---

## Scope

### In Scope

- Un CRUD completo para la entidad `clients`.
- Una vista de lista paginada con búsqueda para todos los clientes.
- Una vista de detalle para cada cliente que incluye su historial de facturas.
- Los clientes están vinculados a un `user_id` y protegidos por RLS.
- Soft-delete para clientes para no perder la integridad de facturas históricas.

### Out of Scope (Future)

- Importar/Exportar lista de clientes (CSV, Excel).
- Portal para que los clientes vean sus propias facturas.
- Campos personalizados para la entidad de cliente.
- Agrupación de clientes por etiquetas o categorías.

---

## Acceptance Criteria (Epic Level)

1. ✅ Un usuario puede gestionar todo el ciclo de vida de un cliente (crear, leer, actualizar, eliminar).
2. ✅ Al crear una factura, el usuario debe poder seleccionar un cliente de su lista existente.
3. ✅ La eliminación de un cliente no está permitida si este tiene facturas asociadas, para mantener la integridad de los datos. Se debe usar un soft-delete.
4. ✅ La información de un cliente (nombre, email, etc.) se autocompleta al seleccionarlo para una nueva factura.

---

## Related Functional Requirements

- **FR-010:** Crear Cliente
- **FR-011:** Listar Clientes
- **FR-012:** Actualizar Cliente
- **FR-013:** Eliminar Cliente
- **FR-014:** Ver Historial de Facturas de Cliente

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Backend

- Se crearán API Routes para el CRUD de clientes: `GET, POST /api/clients`, `GET, PUT, DELETE /api/clients/{clientId}`.
- La lógica de negocio debe impedir el borrado físico de clientes con facturas. En su lugar, se actualizará un campo `deleted_at`.
- La RLS en la tabla `clients` es crítica para asegurar que un usuario solo pueda acceder a sus propios clientes.

### Database Schema

**Tables:**

- `public.clients`: Almacenará toda la información del cliente, vinculada al `user_id`. Campos principales: `name`, `email`, `company`, `address`, `tax_id`, `deleted_at`.

---

## Dependencies

### External Dependencies

- Ninguna.

### Internal Dependencies

- **UPD-1 (User Authentication):** Se necesita un usuario autenticado para gestionar clientes.

### Blocks

- **UPD-13 (Invoice Creation):** Es un prerrequisito fundamental para la creación de facturas.

---

## Success Metrics

### Functional Metrics

- Tiempo de respuesta de la API de listado de clientes < 500ms (p95) con 1000 clientes.
- Tasa de error en operaciones CRUD de clientes < 0.1%.

### Business Metrics

- Número promedio de clientes por usuario.
- Frecuencia de adición de nuevos clientes.

---

## Risks & Mitigations

| Risk                                                    | Impact | Probability | Mitigation                                                                                                                                                      |
| ------------------------------------------------------- | ------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendimiento lento en la lista de clientes a gran escala | Medium | Medium      | Implementar paginación y búsqueda del lado del servidor desde el principio. Asegurar que la columna `user_id` en la tabla `clients` esté indexada.              |
| Duplicación de clientes                                 | Medium | High        | Al crear un nuevo cliente, realizar una comprobación en el backend para ver si ya existe un cliente con el mismo email para ese usuario y advertir al frontend. |

---

## Testing Strategy

### Test Coverage Requirements

- **Unit Tests:** Componentes de UI de la lista y el formulario de cliente.
- **Integration Tests:** Todos los endpoints de la API de clientes (`/api/clients/*`), incluyendo casos de soft-delete.
- **E2E Tests:** Flujo completo: crear un cliente, verificar que aparece en la lista, editarlo, seleccionarlo para una factura, y finalmente (intentar) eliminarlo.

---

## Implementation Plan

### Recommended Story Order

1. **UPD-14 & UPD-15:** Crear y Listar clientes (van de la mano).
2. **UPD-16:** Editar cliente.
3. **UPD-17:** Añadir datos fiscales del cliente.
4. **UPD-18:** Ver historial de facturas (depende de la épica de facturas).
5. **UPD-19:** Eliminar cliente (menor prioridad).

### Estimated Effort

- **Development:** 1.5 Sprints
- **Testing:** 0.5 Sprints
- **Total:** 2 Sprints
