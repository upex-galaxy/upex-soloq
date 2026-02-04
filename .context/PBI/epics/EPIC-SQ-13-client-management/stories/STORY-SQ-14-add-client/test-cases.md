# Feature Test Plan (FTP) - SQ-14: Add New Client

**Jira Key:** [SQ-14](https://upexgalaxy64.atlassian.net/browse/SQ-14)
**Epic:** [SQ-13](https://upexgalaxy64.atlassian.net/browse/SQ-13) (Client Management)
**Autor:** QA Team
**Fecha:** 2026-01-27

---

## 1. Alcance del Testing

| Aspecto                       | Incluido     | Excluido |
| ----------------------------- | ------------ | -------- |
| Pruebas Funcionales           | Sí           | -        |
| Pruebas de Validación         | Sí           | -        |
| Pruebas de Concurrencia       | Sí           | -        |
| Pruebas de UX/Usabilidad      | Sí           | -        |
| Pruebas de Persistencia       | Sí           | -        |
| Pruebas de Accesibilidad      | Sí (básicas) | -        |
| Pruebas de Carga/Límites      | Sí           | -        |
| Pruebas de Penetración        | -            | Sí       |
| Pruebas de Seguridad Avanzada | -            | Sí       |

---

## 2. Pruebas Funcionales (Happy Path)

### 2.1 Flujo Principal - Crear Cliente Básico

| ID      | Caso de Prueba                                                                    | Resultado Esperado                                |
| ------- | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| FTP-001 | Crear cliente con solo name y email válidos                                       | Cliente creado, aparece en lista, toastr de éxito |
| FTP-002 | Crear cliente con todos los campos (name, email, company, phone, address, tax_id) | Cliente creado con toda la info visible           |
| FTP-003 | Verificar que el cliente creado aparece en la tabla sin refrescar página          | Lista se actualiza automáticamente                |
| FTP-004 | Crear múltiples clientes secuencialmente                                          | Todos aparecen en orden correcto                  |

### 2.2 Validación de Campos Requeridos

| ID      | Caso de Prueba              | Resultado Esperado                                   |
| ------- | --------------------------- | ---------------------------------------------------- |
| FTP-005 | Enviar formulario sin name  | Error de validación: "Name is required"              |
| FTP-006 | Enviar formulario sin email | Error de validación: "Email is required"             |
| FTP-007 | Enviar formulario vacío     | Errores de validación en todos los campos requeridos |

### 2.3 Validación de Email

| ID      | Caso de Prueba                                            | Resultado Esperado            |
| ------- | --------------------------------------------------------- | ----------------------------- |
| FTP-008 | Email sin @ (ej: "clientemail.com")                       | Error: "Invalid email format" |
| FTP-009 | Email sin dominio (ej: "cliente@")                        | Error: "Invalid email format" |
| FTP-010 | Email con espacios (ej: "cliente @email.com")             | Error: "Invalid email format" |
| FTP-011 | Email con caracteres especiales inválidos                 | Error: "Invalid email format" |
| FTP-012 | Email válido con subdominio (ej: "cliente@sub.email.com") | Cliente creado exitosamente   |
| FTP-013 | Email con + (ej: "cliente+tag@email.com")                 | Cliente creado exitosamente   |

### 2.4 Prevención de Duplicados

| ID      | Caso de Prueba                                              | Resultado Esperado                                       |
| ------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| FTP-014 | Crear cliente con email ya existente (mismo usuario)        | Warning: "A client with this email already exists"       |
| FTP-015 | Crear cliente con email existente en MAYÚSCULAS             | Warning de duplicado (case-insensitive)                  |
| FTP-016 | Crear cliente con mismo nombre pero diferente email         | Cliente creado exitosamente                              |
| FTP-017 | Verificar que duplicados de otros usuarios NO afectan (RLS) | Cliente creado (emails se pueden repetir entre usuarios) |

---

## 3. Pruebas de Integridad de Datos

### 3.1 No Solapamiento de Datos

| ID      | Caso de Prueba                                                    | Resultado Esperado                           |
| ------- | ----------------------------------------------------------------- | -------------------------------------------- |
| FTP-018 | Crear cliente User A, verificar que User B NO lo ve               | RLS funciona correctamente                   |
| FTP-019 | Verificar que IDs de clientes son únicos globalmente              | Sin colisiones de ID                         |
| FTP-020 | Crear clientes con nombres similares, verificar diferenciación    | Cada cliente tiene su registro independiente |
| FTP-021 | Verificar timestamps (created_at, updated_at) únicos por registro | Timestamps correctos y distintos             |

---

## 4. Pruebas de Concurrencia (Race Conditions)

### 4.1 Mismo Usuario, Múltiples Dispositivos

| ID      | Caso de Prueba                                                | Resultado Esperado                                  |
| ------- | ------------------------------------------------------------- | --------------------------------------------------- |
| FTP-022 | Crear mismo cliente desde 2 navegadores simultáneamente       | Solo uno se crea, el otro recibe error de duplicado |
| FTP-023 | Crear clientes diferentes desde 2 navegadores simultáneamente | Ambos se crean correctamente                        |
| FTP-024 | Verificar orden de creación en lista tras creación simultánea | Orden por timestamp correcto                        |
| FTP-025 | Verificar que no hay registros fantasma tras race condition   | DB consistente, sin datos corruptos                 |

### 4.2 Comportamiento Esperado en Race Condition

- **Estrategia recomendada:** First-write-wins con constraint de unicidad en DB
- **Mensaje al segundo request:** "This client was just created. Refreshing list..."
- **Acción:** Refrescar lista automáticamente para mostrar cliente ya creado

---

## 5. Pruebas de Límites y Capacidad

### 5.1 Límites de Clientes

| ID      | Caso de Prueba                                       | Resultado Esperado                        |
| ------- | ---------------------------------------------------- | ----------------------------------------- |
| FTP-026 | Crear cliente #1 hasta #100                          | Todos se crean sin problemas              |
| FTP-027 | Crear cliente #1000                                  | Sistema sigue respondiendo                |
| FTP-028 | Definir si hay límite máximo de clientes por usuario | Documentar límite o confirmar "ilimitado" |

### 5.2 Límites de Campos

| ID      | Caso de Prueba                                     | Resultado Esperado                        |
| ------- | -------------------------------------------------- | ----------------------------------------- |
| FTP-029 | Name con 1 caracter                                | Validación: mínimo 2 caracteres           |
| FTP-030 | Name con 255 caracteres                            | Aceptado (o error si hay límite menor)    |
| FTP-031 | Name con 500 caracteres                            | Error: "Name too long (max X characters)" |
| FTP-032 | Email con dominio muy largo (100+ chars)           | Comportamiento definido                   |
| FTP-033 | Phone con formato internacional (+54 11 1234-5678) | Aceptado                                  |
| FTP-034 | Address con múltiples líneas                       | Aceptado y mostrado correctamente         |

---

## 6. Pruebas de Persistencia de Datos (Form State)

### 6.1 Persistencia del Popup/Modal

| ID      | Caso de Prueba                                                | Resultado Esperado                            |
| ------- | ------------------------------------------------------------- | --------------------------------------------- |
| FTP-035 | Llenar formulario, cerrar popup, abrir de nuevo               | Datos persisten (localStorage/sessionStorage) |
| FTP-036 | Llenar formulario, refrescar página (F5), abrir popup         | Datos persisten                               |
| FTP-037 | Llenar formulario, navegar a otra página, volver, abrir popup | Datos persisten                               |
| FTP-038 | Llenar formulario, cerrar pestaña, abrir nueva pestaña        | Datos NO persisten (sesión nueva)             |
| FTP-039 | Crear cliente exitosamente, abrir popup de nuevo              | Formulario VACÍO (datos limpiados tras éxito) |
| FTP-040 | Error al crear, cerrar popup, abrir de nuevo                  | Datos persisten para reintentar               |

### 6.2 Escenarios de Recuperación

| ID      | Caso de Prueba                                   | Resultado Esperado                                  |
| ------- | ------------------------------------------------ | --------------------------------------------------- |
| FTP-041 | Pérdida de conexión mientras se llena formulario | Datos en local, warning de conexión                 |
| FTP-042 | Timeout de sesión mientras se llena formulario   | Redirect a login, datos guardados localmente        |
| FTP-043 | Click en "Confirmar" durante pérdida de conexión | Error friendly, datos NO perdidos, retry disponible |

---

## 7. Pruebas de Mensajes de Error (User & Developer Friendly)

### 7.1 Errores de Validación (Frontend)

| ID      | Error                 | Mensaje Usuario                      | Info Developer                      |
| ------- | --------------------- | ------------------------------------ | ----------------------------------- |
| FTP-044 | Email inválido        | "Please enter a valid email address" | field: email, rule: email_format    |
| FTP-045 | Campo requerido vacío | "This field is required"             | field: name, rule: required         |
| FTP-046 | Texto muy largo       | "Maximum 255 characters allowed"     | field: name, max: 255, current: 300 |

### 7.2 Errores de Backend/DB

| ID      | Error                | Mensaje Usuario                                                    | Info Developer                                                  |
| ------- | -------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| FTP-047 | Duplicado            | "A client with this email already exists. Check your client list." | error_code: DUPLICATE_CLIENT, field: email                      |
| FTP-048 | Error de conexión DB | "We couldn't save your client. Please try again in a moment."      | error_code: DB_CONNECTION, timestamp: ISO, request_id: uuid     |
| FTP-049 | Timeout              | "The request took too long. Please try again."                     | error_code: TIMEOUT, duration_ms: 30000, endpoint: /api/clients |
| FTP-050 | Error inesperado     | "Something went wrong. Please contact support with code: ABC123"   | error_code: UNKNOWN, stack_trace: ..., request_id: ABC123       |

### 7.3 Formato de Error Copiable

```
--------------------
Error Report - SoloQ
--------------------
Time: 2026-01-27 15:30:45 UTC
Code: DB_CONNECTION_FAILED
Request ID: req_abc123xyz
User Action: Creating new client

Details:
- Email: client@example.com
- Name: John Doe

Please send this to: support@soloq.com
--------------------
```

---

## 8. Pruebas de Accesibilidad (A11y)

| ID      | Caso de Prueba                                 | Resultado Esperado                    |
| ------- | ---------------------------------------------- | ------------------------------------- |
| FTP-051 | Navegación por teclado (Tab) en el formulario  | Orden lógico de campos, focus visible |
| FTP-052 | Labels asociados correctamente a inputs        | Screen readers leen labels            |
| FTP-053 | Mensajes de error anunciados por screen reader | aria-live o role="alert"              |
| FTP-054 | Contraste de colores en errores                | Ratio mínimo 4.5:1                    |
| FTP-055 | Botón "Add Client" accesible con Enter         | Funciona sin mouse                    |
| FTP-056 | Escape cierra el popup                         | Modal accesible por teclado           |

---

## 9. Pruebas de UI/UX

| ID      | Caso de Prueba                               | Resultado Esperado                         |
| ------- | -------------------------------------------- | ------------------------------------------ |
| FTP-057 | Toastr aparece al crear cliente exitosamente | Visible 3-5 segundos, posición consistente |
| FTP-058 | Spinner/Loading mientras se guarda           | Feedback visual de proceso                 |
| FTP-059 | Botón deshabilitado durante submit           | Previene doble-click                       |
| FTP-060 | Responsive: Popup en mobile                  | Usable en pantallas pequeñas               |
| FTP-061 | Placeholder text en campos                   | Guía al usuario sobre formato esperado     |

---

## 10. Matriz de Prioridades

| Prioridad         | Pruebas                                | Justificación                   |
| ----------------- | -------------------------------------- | ------------------------------- |
| **P0 - Blocker**  | FTP-001, FTP-005-007, FTP-014, FTP-022 | Sin esto no funciona la feature |
| **P1 - Critical** | FTP-008-013, FTP-035-040, FTP-047-050  | UX crítica y manejo de errores  |
| **P2 - Major**    | FTP-018-021, FTP-023-025, FTP-044-046  | Integridad y concurrencia       |
| **P3 - Minor**    | FTP-026-034, FTP-051-061               | Límites y accesibilidad         |

---

## 11. Notas Adicionales

### Campos Sugeridos para el Formulario

| Campo        | Tipo     | Requerido | Validación                            |
| ------------ | -------- | --------- | ------------------------------------- |
| name         | text     | Sí        | min: 2, max: 255                      |
| email        | email    | Sí        | formato email válido                  |
| tax_id       | text     | Sí\*      | formato según país (RIF/CUIT/NIF/EIN) |
| company_name | text     | No        | max: 255                              |
| phone        | tel      | No        | formato internacional                 |
| address      | textarea | No        | max: 500                              |

> \*Nota: Considerar hacer tax_id requerido para fines de facturación.

### Verificación de Email Real

- Considerar integrar servicio de validación de email (ej: ZeroBounce, Hunter.io)
- Alternativa: enviar email de verificación al cliente

---

## 12. Resultados de Testing Exploratorio

**Fecha:** 2026-02-03
**Tester:** Claude (AI)

### Resumen Ejecutivo

| Métrica          | Valor        |
| ---------------- | ------------ |
| Overall Status   | ISSUES FOUND |
| Scenarios Tested | 9            |
| Passed           | 7            |
| Failed           | 1            |
| Not Verifiable   | 1            |
| Bugs Confirmados | 1 (SQ-69)    |

### Resultados por Test Case

| ID          | Test Case                              | Status                                    |
| ----------- | -------------------------------------- | ----------------------------------------- |
| FTP-001     | Crear cliente con name + email válidos | ✅ PASSED                                 |
| FTP-003     | Lista se actualiza automáticamente     | ⚠️ NO VERIFICABLE (lista no implementada) |
| FTP-005     | Formulario sin name                    | ✅ PASSED                                 |
| FTP-006     | Formulario sin email                   | ✅ PASSED                                 |
| FTP-008     | Email sin @                            | ✅ PASSED                                 |
| FTP-014     | Email duplicado (mismo case)           | ✅ PASSED                                 |
| FTP-015     | Email duplicado (MAYÚSCULAS)           | ❌ FAILED                                 |
| FTP-057     | Toast al crear cliente                 | ✅ PASSED                                 |
| FTP-058/059 | Spinner/Botón disabled                 | ⚠️ NO VERIFICABLE (request muy rápido)    |

### Bug Encontrado

**SQ-69:** Case-Sensitive Duplicate Check

- **Severity:** High
- **Test ID:** FTP-015
- **Steps to Reproduce:**
  1. Crear cliente con email `cliente@example.com`
  2. Crear otro cliente con email `CLIENTE@EXAMPLE.COM`
- **Expected:** Warning "Ya existe un cliente con este email"
- **Actual:** Cliente creado exitosamente (201 en lugar de 409)
- **Bug Ticket:** [SQ-69](https://upexgalaxy64.atlassian.net/browse/SQ-69)

---

## 13. Referencias

- **User Story:** `.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-14-add-client/story.md`
- **Implementation Plan:** `.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-14-add-client/implementation-plan.md`
- **Epic:** `.context/PBI/epics/EPIC-SQ-13-client-management/epic.md`
- **Jira Issue:** [SQ-14](https://upexgalaxy64.atlassian.net/browse/SQ-14)
