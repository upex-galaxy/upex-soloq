# EPIC: Business Profile Management

**Jira Key:** UPD-7
**Status:** To Do
**Priority:** HIGH
**Phase:** Phase 1: Foundation (Sprint 1-3)

---

## Epic Description

Esta épica se centra en permitir a los freelancers configurar la identidad de su negocio. Esta información es fundamental, ya que se reutilizará en todas las facturas generadas, asegurando una imagen de marca profesional y consistente.

Los usuarios podrán definir el nombre de su negocio, subir un logo, añadir datos de contacto y fiscales, y, crucialmente, configurar los métodos de pago que ofrecerán a sus clientes. Esta configuración centralizada ahorra tiempo al usuario, que no tendrá que introducir estos datos repetidamente en cada factura.

**Business Value:**
Un perfil de negocio completo y bien presentado aumenta la percepción de profesionalismo del freelancer, lo que puede mejorar la confianza del cliente y la disposición a pagar. Además, al centralizar los métodos de pago se simplifica y acelera el proceso de cobro, atacando uno de los pain points principales del target.

---

## User Stories

1. **UPD-8** - As a user, I want to set up my name or business name to appear on my invoices
2. **UPD-9** - As a user, I want to upload my logo to customize my invoices
3. **UPD-10** - As a user, I want to add my contact details (email, phone, address) so my clients can contact me
4. **UPD-11** - As a user, I want to configure my tax details (RFC/NIT/CUIT) to appear on my invoices
5. **UPD-12** - As a user, I want to configure my accepted payment methods (CLABE, PayPal, etc.) so my clients know how to pay me

---

## Scope

### In Scope

- Un formulario en la sección de "Configuración" para editar todos los datos del perfil de negocio.
- Funcionalidad para subir, previsualizar y eliminar un logo.
- Interfaz para añadir, editar y eliminar múltiples métodos de pago.
- Almacenamiento seguro de toda la información del perfil.

### Out of Scope (Future)

- Múltiples perfiles de negocio por cuenta.
- Validación avanzada de números de identificación fiscal (Tax ID) contra servicios gubernamentales.
- Creación de plantillas de facturas personalizadas más allá del logo y los datos.

---

## Acceptance Criteria (Epic Level)

1. ✅ Un usuario puede configurar todos los aspectos de su perfil de negocio desde una única sección de "Configuración".
2. ✅ La información guardada en el perfil de negocio se refleja automáticamente en todas las facturas nuevas que se creen.
3. ✅ El logo del usuario, si se sube, aparece correctamente en las previsualizaciones de facturas y en los PDFs generados.
4. ✅ Los métodos de pago configurados se muestran claramente en las facturas enviadas a los clientes.

---

## Related Functional Requirements

- **FR-007:** Crear/Actualizar Perfil de Negocio
- **FR-008:** Upload de Logo
- **FR-009:** Gestionar Métodos de Pago

See: `.context/SRS/functional-specs.md`

---

## Technical Considerations

### Backend

- El endpoint `PUT /api/profile/business` gestionará la actualización de los datos textuales del perfil.
- El endpoint `POST /api/profile/logo` manejará la subida de la imagen del logo a Supabase Storage.
- El endpoint `PUT /api/profile/payment-methods` se encargará de la gestión de los métodos de pago.
- Las políticas de RLS deben asegurar que un usuario solo pueda modificar su propio `business_profiles` y `payment_methods`.

### Database Schema

**Tables:**

- `public.business_profiles`: Almacena la información del negocio (name, contact_email, address, tax_id, logo_url).
- `public.payment_methods`: Almacena los métodos de pago del usuario (type, label, value).
- `storage.objects` (bucket `logos`): Almacenará los archivos de los logos.

---

## Dependencies

### External Dependencies

- **Supabase Storage:** Para el almacenamiento de los logos.

### Internal Dependencies

- **UPD-1 (User Authentication & Onboarding):** El usuario debe estar autenticado para acceder a la configuración de su perfil.

### Blocks

- **UPD-13 (Invoice Creation):** La creación de facturas depende de que exista un perfil de negocio para poblar los datos del emisor.
- **UPD-23 (PDF Generation):** La generación de PDFs necesita los datos del perfil para mostrar la información del freelancer.

---

## Success Metrics

### Functional Metrics

- Tasa de éxito de subida de logo > 99%.
- Tiempo de guardado del perfil < 500ms.
- La información del perfil se propaga a una nueva factura en < 100ms.

### Business Metrics

- Porcentaje de usuarios que suben un logo > 60%.
- Porcentaje de usuarios que configuran al menos un método de pago > 90%.

---

## Risks & Mitigations

| Risk                                     | Impact | Probability | Mitigation                                                                                                                                                                         |
| ---------------------------------------- | ------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Almacenamiento de logos costoso a escala | Medium | Medium      | Implementar una política de compresión de imágenes en el cliente o en el backend antes de subir a Supabase Storage. Limitar el tamaño de archivo a 2MB.                            |
| Formatos de Tax ID incorrectos           | Low    | High        | Implementar máscaras de entrada (input masks) en el frontend para guiar al usuario, aunque sin validación estricta en el backend para el MVP. Añadir texto de ayuda (helper text). |

---

## Testing Strategy

### Test Coverage Requirements

- **Unit Tests:** Componentes de formulario, validaciones de Zod.
- **Integration Tests:** Endpoints de la API de perfil (`/api/profile/*`) para asegurar que los datos se guardan y recuperan correctamente.
- **E2E Tests:** Flujo completo de edición de perfil: cambiar nombre, subir logo, añadir/eliminar método de pago y verificar que los cambios se reflejan en una nueva factura.

---

## Implementation Plan

### Recommended Story Order

1. **UPD-8:** Configurar nombre de negocio (base para la factura).
2. **UPD-10:** Añadir datos de contacto.
3. **UPD-12:** Configurar métodos de pago (crítico para cobrar).
4. **UPD-9:** Subir logo (mejora visual).
5. **UPD-11:** Configurar datos fiscales (necesario para facturas más formales).

### Estimated Effort

- **Development:** 1 Sprint
- **Testing:** 0.5 Sprints
- **Total:** 1.5 Sprints
