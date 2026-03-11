# EPIC: Business Profile Management

**Jira Key:** [SQ-7](https://upexgalaxy65.atlassian.net/browse/SQ-7)
**Priority:** Medium
**Status:** Backlog
**Total Story Points:** 15

---

## Description

## Description

Configuración del perfil de negocio del freelancer que aparecerá en las facturas. Incluye nombre de negocio, logo, datos de contacto, datos fiscales y métodos de pago.

## Business Value

El perfil de negocio es fundamental para la credibilidad profesional del freelancer. Una factura con logo, datos fiscales correctos y métodos de pago claros aumenta la confianza del cliente y facilita el cobro.

## Acceptance Criteria

- Usuario puede configurar nombre de negocio
- Usuario puede subir logo (formatos: PNG, JPG, max 2MB)
- Usuario puede agregar información de contacto (email, teléfono, dirección)
- Usuario puede configurar datos fiscales (RFC/NIT/CUIT según país)
- Usuario puede configurar métodos de pago aceptados
- Todos los datos aparecen correctamente en las facturas generadas

## Technical Considerations

- Storage: Supabase Storage para logos
- Validación de formatos fiscales por país (LATAM)
- Resize/compress de imágenes en cliente
- RLS policies para datos de perfil

## Priority

CRITICAL

## Phase

Foundation (Sprint 1-2)

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [SQ-8](https://upexgalaxy65.atlassian.net/browse/SQ-8) | As a user, I want to configure my business name so that it appears on my invoices | 2 | Medium | Backlog |
| [SQ-9](https://upexgalaxy65.atlassian.net/browse/SQ-9) | As a user, I want to upload my logo so that I can personalize my invoices | 3 | Medium | Backlog |
| [SQ-10](https://upexgalaxy65.atlassian.net/browse/SQ-10) | As a user, I want to add my contact information so that my clients can contact me | 2 | Medium | Backlog |
| [SQ-11](https://upexgalaxy65.atlassian.net/browse/SQ-11) | As a user, I want to configure my tax ID (RFC/NIT/CUIT) so that it appears on my invoices | 3 | Medium | Backlog |
| [SQ-12](https://upexgalaxy65.atlassian.net/browse/SQ-12) | As a user, I want to configure my accepted payment methods so that my clients know how to pay me | 5 | Medium | Backlog |

---

## Metadata

- **Created:** 1/20/2026
- **Updated:** 1/20/2026
- **Reporter:** Ely
- **Assignee:** Unassigned

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:40.553Z_
