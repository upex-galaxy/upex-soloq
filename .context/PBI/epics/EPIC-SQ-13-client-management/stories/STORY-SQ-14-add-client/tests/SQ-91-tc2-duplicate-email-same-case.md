# SQ-91: TC2: Validar warning de duplicado cuando email ya existe

**Jira:** [SQ-91](https://upexgalaxy65.atlassian.net/browse/SQ-91)
**Status:** CANDIDATE
**Type:** Functional
**Related Story:** SQ-14
**ROI Score:** 4.0

---

## Código de Implementación

| Archivo | Propósito |
|---------|-----------|
| src/app/api/clients/route.ts:171-181 | Validación de duplicado (ilike) |
| src/hooks/clients/use-create-client.ts | Hook que maneja error 409 |
| src/app/(app)/clients/create/page.tsx:20-22 | Toast de error en onError |

## Arquitectura

- **Data Fetching:** Client-side via API Route POST /api/clients
- **Validación duplicados:** API verifica con query ilike (case-insensitive)
- **Response:** HTTP 409 Conflict con mensaje "Ya existe un cliente con este email"

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
| {existing_email} | Email de cliente existente | SELECT email FROM clients WHERE user_id = {user_id} LIMIT 1 |
| {client_name} | Nombre para el nuevo cliente | Cualquier nombre válido (ej: "Duplicate Test") |

---

## Diseño del Test (Steps)

| Paso | Acción | Datos | Resultado Esperado |
|------|--------|-------|-------------------|
| 1 | Precondición: Crear cliente existente | {existing_email} (ej: "existente@ejemplo.com") | Cliente creado exitosamente en DB |
| 2 | Navegar a página de creación de cliente | URL: /clients/create | Formulario de cliente visible |
| 3 | Ingresar nombre válido | {client_name} (ej: "Nuevo Cliente") | Campo poblado |
| 4 | Ingresar MISMO email que cliente existente | {existing_email} (mismo case) | Campo poblado |
| 5 | Click en botón "Guardar cliente" | - | Loading state visible |
| 6 | Esperar respuesta del servidor | - | Toast de error visible |
| 7 | Verificar mensaje de error | - | Toast muestra "Ya existe un cliente con este email" |
| 8 | Verificar NO redirección | - | Usuario permanece en /clients/create |

## Precondiciones

- Usuario autenticado en la aplicación
- Usuario TIENE al menos un cliente existente con email conocido

## Expected Results

- **UI:** Toast de error "Ya existe un cliente con este email"
- **API:** Response HTTP 409 Conflict
- **Data:** NO se crea nuevo cliente en DB
- **Navegación:** Usuario permanece en formulario
