# EPIC: Invoice Creation

**Jira Key:** UPD-20
**Status:** To Do
**Priority:** CRITICAL
**Phase:** Phase 2: Core Invoicing (Sprint 4-6)

---

## Epic Description

Esta es la épica central de la aplicación, cubriendo toda la funcionalidad para la creación y gestión de una factura antes de ser enviada. Es el corazón del producto y la herramienta principal que los freelancers utilizarán a diario.

El flujo permite al usuario seleccionar un cliente, añadir múltiples líneas de servicio o producto con cantidad y precio, y ver cómo el sistema calcula automáticamente los totales. También se incluyen funcionalidades esenciales como la asignación de un número de factura, fechas de emisión y vencimiento, y la capacidad de añadir impuestos, descuentos y notas. Finalmente, se permite guardar la factura como un borrador para ser completada más tarde.

**Business Value:**
Esta épica aborda directamente el principal "pain point" del usuario: el tiempo y el esfuerzo perdidos en la creación manual de facturas. Al automatizar los cálculos y proporcionar una interfaz estructurada, SoloQ reduce el tiempo de creación de una factura de 15-30 minutos a menos de 2 minutos. Esto no solo ahorra tiempo, sino que también reduce errores y proyecta una imagen más profesional.

---

## User Stories

1.  **UPD-21** - As a user, I want to create a new invoice by selecting a client to start invoicing
2.  **UPD-22** - As a user, I want to add line items (description, quantity, unit price) to detail my services
3.  **UPD-23** - As a user, I want the system to automatically calculate subtotal and total to avoid calculation errors
4.  **UPD-24** - As a user, I want to add taxes (VAT/percentage) to comply with tax requirements
5.  **UPD-25** - As a user, I want to add discounts (percentage or fixed amount) to offer promotions to clients
6.  **UPD-26** - As a user, I want to preview the invoice before sending it to verify that everything is correct
7.  **UPD-27** - As a user, I want to assign a unique invoice number to keep track of my numbering
8.  **UPD-28** - As a user, I want to set a due date to define when I expect payment
9.  **UPD-29** - As a user, I want to add notes or terms and conditions to communicate additional information
10. **UPD-30** - As a user, I want to save an invoice as a draft to finish it later

---

## Scope

### In Scope

- Un formulario de creación/edición de facturas.
- Selección de cliente desde una lista existente.
- Adición dinámica de N líneas de items.
- Cálculo automático de subtotal, impuestos, descuentos y total.
- Campos para número de factura, fecha de emisión y fecha de vencimiento.
- Opción de guardar como borrador o proceder al envío.
- Previsualización en tiempo real de la factura.

### Out of Scope (Future)

- Creación de facturas recurrentes.
- Creación de presupuestos/cotizaciones y su conversión a facturas.
- Soporte para múltiples monedas con conversión de tasas de cambio.
- Items de inventario pre-guardados.

---

## Acceptance Criteria (Epic Level)

1. ✅ Un usuario puede crear una factura completa, desde la selección del cliente hasta la adición de items y el cálculo final, en menos de 2 minutos (para un usuario familiarizado).
2. ✅ Todos los cálculos matemáticos (subtotal, impuestos, descuentos, total) son siempre precisos.
3. ✅ Una factura no puede ser creada sin al menos un cliente y una línea de item.
4. ✅ El estado de la factura (`draft`, `sent`, etc.) se gestiona correctamente a lo largo de su ciclo de vida.

---

## Related Functional Requirements

- **FR-015:** Crear Factura
- **FR-016:** Actualizar Factura
- **FR-017:** Obtener Siguiente Número de Factura

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Backend

- Los endpoints `POST /api/invoices` y `PUT /api/invoices/{invoiceId}` serán los principales para esta épica.
- La lógica de cálculo de totales debe estar en el backend para ser la fuente de verdad, aunque también se puede replicar en el frontend para una UX fluida.
- La inserción de una factura y sus `invoice_items` debe ser transaccional para evitar datos corruptos.

### Database Schema

**Tables:**

- `public.invoices`: Contendrá la información principal de la factura.
- `public.invoice_items`: Almacenará las líneas de items, vinculadas a una `invoice_id`.
- `public.clients`: Se leerá para seleccionar el cliente.

---

## Dependencies

### External Dependencies

- Ninguna.

### Internal Dependencies

- **UPD-1 (Authentication):** Se necesita un usuario autenticado.
- **UPD-7 (Business Profile):** Se necesitan los datos del perfil del freelancer para poblar la factura.
- **UPD-13 (Client Management):** Se necesita la lista de clientes para seleccionar a quién facturar.

### Blocks

- **EPIC-SOLOQ-005 (PDF Generation):** Necesita una factura creada para generar el PDF.
- **EPIC-SOLOO-006 (Invoice Sending):** Necesita una factura creada para enviar por email.

---

## Success Metrics

### Functional Metrics

- Tiempo de respuesta de API para guardar factura < 800ms.
- Cero errores de cálculo reportados por los usuarios.

### Business Metrics

- Tiempo medio para crear una factura < 2 minutos.
- Alto volumen de facturas creadas.
- Tasa de abandono en el formulario de creación de facturas < 5%.

---

## Testing Strategy

### Test Coverage Requirements

- **Unit Tests:** Lógica de cálculo de totales, componentes de UI del formulario (especialmente la tabla de items dinámicos).
- **Integration Tests:** API para crear y actualizar facturas, asegurando que los items se guarden correctamente y los totales sean precisos.
- **E2E Tests:** Flujo completo de creación de una factura con múltiples items, impuestos y descuentos, guardarla como borrador, y luego editarla.

---

## Implementation Plan

### Estimated Effort

- **Development:** 2 Sprints
- **Testing:** 1 Sprint
- **Total:** 3 Sprints
