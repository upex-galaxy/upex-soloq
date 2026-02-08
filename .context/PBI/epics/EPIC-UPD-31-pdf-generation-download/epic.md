# EPIC: PDF Generation & Download

**Jira Key:** UPD-31
**Status:** To Do
**Priority:** CRITICAL
**Phase:** Phase 2: Core Invoicing (Sprint 4-6)

---

## Epic Description

Esta épica aborda la capacidad fundamental de generar facturas en un formato PDF profesional y permitir a los usuarios descargarlas. El PDF no es solo un documento, sino la representación final y oficial de la factura que se envía a los clientes.

Se enfocará en la creación de un PDF con un diseño limpio y profesional, que incorpore el logo del freelancer, sus datos de negocio, la información del cliente, los detalles de los ítems, y los métodos de pago configurados. La calidad y consistencia del PDF son cruciales para la imagen que el freelancer proyecta. Una feature "Pro" opcional permitirá elegir entre diferentes plantillas.

**Business Value:**
Un PDF profesional es esencial para la credibilidad y el profesionalismo del freelancer. Simplifica el proceso de envío y recepción de facturas, eliminando la necesidad de herramientas de terceros para este fin. La capacidad de descargar el PDF da control y flexibilidad al usuario para enviarlo por otros medios si lo desea.

---

## User Stories

1.  **UPD-32** - As a user, I want to generate a PDF of my invoice with a professional design to send to my client
2.  **UPD-33** - As a user, I want the PDF to include my logo and business data to project professionalism
3.  **UPD-34** - As a user, I want the PDF to include my configured payment methods so the client knows how to pay me
4.  **UPD-35** - As a user, I want to download the PDF to my device to save it or send it manually
5.  **UPD-36** - As a Pro user, I want to choose between different invoice templates to personalize my style

---

## Scope

### In Scope

- Generación de PDF en el servidor (`server-side rendering`).
- Un diseño predeterminado para la factura que es limpio y profesional.
- Inclusión del logo del usuario, información de negocio y métodos de pago.
- Descarga del PDF desde la interfaz de usuario.
- Una API para generar el PDF de una factura específica.

### Out of Scope (Future)

- Editor de plantillas de PDF visual en la aplicación.
- Soporte para diferentes idiomas o formatos de fecha/moneda dentro del PDF (MVP solo español LATAM y USD).
- Exportación a otros formatos (ej. XML, Word).

---

## Acceptance Criteria (Epic Level)

1. ✅ El PDF generado es visualmente idéntico a la previsualización de la factura en la aplicación.
2. ✅ Todos los datos relevantes de la factura (items, totales, fechas, etc.) se muestran correctamente en el PDF.
3. ✅ El logo y los datos del perfil de negocio del usuario, junto con los métodos de pago, aparecen correctamente en el PDF.
4. ✅ El proceso de generación de PDF es rápido, idealmente en menos de 3 segundos.

---

## Related Functional Requirements

- **FR-018:** Generar PDF de Factura

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Backend

- Se usará `@react-pdf/renderer` para generar el PDF, aprovechando que se puede renderizar en el servidor (en las API Routes de Next.js).
- Se creará un endpoint `GET /api/invoices/{invoiceId}/pdf` que devolverá el PDF como un `stream` o un `file buffer`.
- Es crucial que los datos se carguen de forma segura (RLS) para asegurarse de que solo el propietario de la factura pueda generar el PDF.

### Database Schema

**Tables:**

- `public.invoices`: Para obtener los datos de la factura.
- `public.clients`: Para obtener los datos del cliente.
- `public.business_profiles`: Para obtener los datos del freelancer.
- `public.payment_methods`: Para obtener los métodos de pago.

---

## Dependencies

### External Dependencies

- `@react-pdf/renderer`

### Internal Dependencies

- **UPD-20 (Invoice Creation Epic):** Necesita facturas creadas con todos sus datos.
- **UPD-7 (Business Profile Management Epic):** Necesita el logo y los datos del negocio del freelancer.
- **UPD-13 (Client Management Epic):** Necesita los datos del cliente.

### Blocks

- **EPIC-SOLOQ-006 (Invoice Sending):** Para enviar un email con el PDF adjunto.

---

## Success Metrics

### Functional Metrics

- Tasa de éxito de generación de PDF > 99%.
- Tiempo de generación de PDF < 3000ms (p95).

### Business Metrics

- Porcentaje de facturas que son enviadas como PDF.

---

## Risks & Mitigations

| Risk                                           | Impact | Probability | Mitigation                                                                                                                                            |
| ---------------------------------------------- | ------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diferencias entre previsualización y PDF final | High   | Medium      | Usar un mismo componente React para la previsualización HTML y para la generación de PDF (con `@react-pdf/renderer`) para asegurar la paridad visual. |
| Rendimiento lento en la generación de PDFs     | Medium | Medium      | Optimizar la consulta de datos para el PDF. Considerar caching del PDF en Supabase Storage si la factura no cambia.                                   |

---

## Testing Strategy

### Test Coverage Requirements

- **Unit Tests:** Componentes de `@react-pdf/renderer` para asegurar que los elementos se renderizan correctamente.
- **Integration Tests:** El endpoint `GET /api/invoices/{invoiceId}/pdf` para verificar que devuelve un PDF válido.
- **E2E Tests:** Flujo completo: crear una factura, previsualizarla, generar y descargar el PDF, y verificar visualmente su contenido.

---

## Implementation Plan

### Estimated Effort

- **Development:** 1.5 Sprints
- **Testing:** 0.5 Sprints
- **Total:** 2 Sprints
