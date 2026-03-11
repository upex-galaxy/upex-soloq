# SQ-90: TC1: Validar creación de cliente con name y email válidos

**Jira:** [SQ-90](https://upexgalaxy65.atlassian.net/browse/SQ-90)
**Status:** CANDIDATE
**Type:** Functional
**Related Story:** SQ-14
**ROI Score:** 7.0

---

## Código de Implementación

| Archivo | Propósito |
|---------|-----------|
| src/app/(app)/clients/create/page.tsx | Página de creación (Client-side) |
| src/components/clients/client-form.tsx | Componente del formulario |
| src/app/api/clients/route.ts | API Route POST /api/clients |
| src/lib/validations/client.ts | Schema Zod de validación |

## Arquitectura

- **Data Fetching:** Client-side via API Route POST /api/clients
- **Componente principal:** ClientForm
- **Validación:** Zod schema (client-side) + API (server-side)

## Test IDs Disponibles

```
data-testid="clientForm"
data-testid="client-name-input"
data-testid="client-email-input"
data-testid="client-form-submit"
```

---

## Variables del Test Case

| Variable | Descripción | Cómo obtenerla |
|----------|-------------|----------------|
| {client_name} | Nombre único para el cliente | Generar nombre aleatorio (ej: "Test Client " + timestamp) |
| {client_email} | Email único y válido | Generar email aleatorio (ej: "test" + timestamp + "@ejemplo.com") |

---

## Diseño del Test (Steps)

| Paso | Acción | Datos | Resultado Esperado |
|------|--------|-------|-------------------|
| 1 | Navegar a página de creación de cliente | URL: /clients/create | Formulario de cliente visible con campos name y email |
| 2 | Ingresar nombre válido en campo name | {client_name} (ej: "Juan Pérez") | Campo poblado sin errores de validación |
| 3 | Ingresar email válido en campo email | {client_email} (ej: "juan@ejemplo.com") | Campo poblado sin errores de validación |
| 4 | Click en botón "Guardar cliente" | - | Loading state visible en botón |
| 5 | Esperar respuesta del servidor | - | Toast "Cliente guardado correctamente" visible |
| 6 | Verificar redirección | - | Usuario redirigido a /clients |

## Precondiciones

- Usuario autenticado en la aplicación
- Usuario NO tiene un cliente con el email de prueba

## Expected Results

- **UI:** Toast de éxito "Cliente guardado correctamente"
- **Data:** Cliente creado en base de datos con user_id del usuario autenticado
- **Navegación:** Redirección a /clients
