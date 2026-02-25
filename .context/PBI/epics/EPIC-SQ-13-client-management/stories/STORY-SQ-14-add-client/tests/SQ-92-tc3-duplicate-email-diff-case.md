# SQ-92: TC3: Validar warning de duplicado cuando email difiere en case

**Jira:** [SQ-92](https://upexgalaxy65.atlassian.net/browse/SQ-92)
**Status:** CANDIDATE
**Type:** Functional
**Related Story:** SQ-14
**ROI Score:** 3.75

---

## Bugs Cubiertos (Regresión)

| Bug ID | Descripción | Fix |
|--------|-------------|-----|
| **SQ-69** | Duplicated email case-sensitive not blocking (201 instead 409) | API normaliza email a lowercase y usa ilike para comparación case-insensitive |

---

## Código de Implementación (Fix SQ-69)

| Archivo | Línea | Propósito |
|---------|-------|-----------|
| src/app/api/clients/route.ts | 168 | Normaliza email: `const normalizedEmail = email.toLowerCase()` |
| src/app/api/clients/route.ts | 175 | Query case-insensitive: `.ilike('email', normalizedEmail)` |
| src/app/api/clients/route.ts | 180 | Return 409: "Ya existe un cliente con este email" |

## Arquitectura

- **Data Fetching:** Client-side via API Route POST /api/clients
- **Normalización:** Email se convierte a lowercase antes de insertar (línea 168)
- **Validación:** Query usa ilike para comparación case-insensitive (línea 175)
- **Response:** HTTP 409 Conflict si duplicado detectado

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
| {existing_email} | Email existente en lowercase | Crear con "test" + timestamp + "@ejemplo.com" |
| {email_diff_case} | Mismo email con case diferente | Transformar {existing_email} a UPPERCASE o MixedCase |
| {client_name} | Nombre para el nuevo cliente | Cualquier nombre válido |

---

## Diseño del Test (Steps)

| Paso | Acción | Datos | Resultado Esperado |
|------|--------|-------|-------------------|
| 1 | Precondición: Crear cliente existente | {existing_email} en lowercase (ej: "test@ejemplo.com") | Cliente creado en DB |
| 2 | Navegar a página de creación de cliente | URL: /clients/create | Formulario visible |
| 3 | Ingresar nombre válido | {client_name} | Campo poblado |
| 4 | Ingresar email con DIFERENTE case | {email_diff_case} (ej: "TEST@ejemplo.com" o "Test@Ejemplo.COM") | Campo poblado |
| 5 | Click en botón "Guardar cliente" | - | Loading state visible |
| 6 | Esperar respuesta del servidor | - | Toast de error visible |
| 7 | Verificar mensaje de error | - | Toast muestra "Ya existe un cliente con este email" |
| 8 | Verificar NO redirección | - | Usuario permanece en /clients/create |

## Precondiciones

- Usuario autenticado en la aplicación
- Usuario tiene cliente con email en lowercase conocido

## Expected Results

- **UI:** Toast de error "Ya existe un cliente con este email"
- **API:** Response HTTP 409 Conflict (NO 201 como antes del fix)
- **Data:** NO se crea nuevo cliente en DB
- **Navegación:** Usuario permanece en formulario

---

## Notas de Regresión

> **CRÍTICO:** Este test es obligatorio para prevenir regresión del bug SQ-69.
>
> El fix normaliza emails a lowercase tanto para almacenamiento como para validación.
> Cualquier cambio en `src/app/api/clients/route.ts` debe pasar este test.
