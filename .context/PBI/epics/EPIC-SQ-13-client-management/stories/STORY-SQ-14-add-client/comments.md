# Comments for SQ-14

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-14)

---

### Ely - 1/27/2026, 9:18:58 PM

# Shift-Left Test Plan

### Scenario 1: Add client with basic info

- ***Given:*** I am on the clients page
- ***When:*** I click "Add Client" and enter name and email
- ***Then:*** The client is saved and appears in my list

### Scenario 2: Validate email format

- ***Given:*** I am adding a new client
- ***When:*** I enter an invalid email format
- ***Then:*** I see a validation error

### Scenario 3: Prevent duplicate clients

- ***Given:*** I have a client with email "[client@email.com](mailto:client@email.com)"
- ***When:*** I try to add another client with the same email
- ***Then:*** I see a warning that a client with that email already exists

### Scenario 4: Add client with optional fields

- ***Given:*** I am adding a new client
- ***When:*** I fill in optional fields (company name, phone, address)
- ***Then:*** All information is saved

---

# Feature Test Plan (FTP) - [https://upexgalaxy65.atlassian.net/browse/SQ-14#icft=SQ-14](https://upexgalaxy65.atlassian.net/browse/SQ-14#icft=SQ-14): Add New Client

***Jira Key:**** [SQ-14](https://upexgalaxy65.atlassian.net/browse/SQ-14) ****Epic:**** [SQ-13](https://upexgalaxy65.atlassian.net/browse/SQ-13) (Client Management) ****Autor:**** QA Team ****Fecha:*** 2026-01-27

---

## 1. Alcance del Testing

| ***Aspecto**** | ****Incluido**** | ****Excluido*** |
| --- | --- | --- |
| Pruebas Funcionales | Si | - |
| Pruebas de Validacion | Si | - |
| Pruebas de Concurrencia | Si | - |
| Pruebas de UX/Usabilidad | Si | - |
| Pruebas de Persistencia | Si | - |
| Pruebas de Accesibilidad | Si (basicas) | - |
| Pruebas de Carga/Limites | Si | - |
| Pruebas de Penetracion | - | Si |
| Pruebas de Seguridad Avanzada | - | Si |

---

## 2. Pruebas Funcionales (Happy Path)

### 2.1 Flujo Principal - Crear Cliente Basico

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado*** |
| --- | --- | --- |
| FTP-001 | Crear cliente con solo name y email validos | Cliente creado, aparece en lista, toastr de exito |
| FTP-002 | Crear cliente con todos los campos (name, email, company, phone, address, tax_id) | Cliente creado con toda la info visible |
| FTP-003 | Verificar que el cliente creado aparece en la tabla sin refrescar pagina | Lista se actualiza automaticamente |
| FTP-004 | Crear multiples clientes secuencialmente | Todos aparecen en orden correcto |

### 2.2 Validacion de Campos Requeridos

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado*** |
| --- | --- | --- |
| FTP-005 | Enviar formulario sin name | Error de validacion: "Name is required" |
| FTP-006 | Enviar formulario sin email | Error de validacion: "Email is required" |
| FTP-007 | Enviar formulario vacio | Errores de validacion en todos los campos requeridos |

### 2.3 Validacion de Email

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado*** |
| --- | --- | --- |
| FTP-008 | Email sin @ (ej: "[clientemail.com](http://clientemail.com)") | Error: "Invalid email format" |
| FTP-009 | Email sin dominio (ej: "cliente@") | Error: "Invalid email format" |
| FTP-010 | Email con espacios (ej: "cliente @email.com") | Error: "Invalid email format" |
| FTP-011 | Email con caracteres especiales invalidos | Error: "Invalid email format" |
| FTP-012 | Email valido con subdominio (ej: "[cliente@sub.email.com](mailto:cliente@sub.email.com)") | Cliente creado exitosamente |
| FTP-013 | Email con + (ej: "[cliente+tag@email.com](mailto:cliente+tag@email.com)") | Cliente creado exitosamente |

### 2.4 Prevencion de Duplicados

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado*** |
| --- | --- | --- |
| FTP-014 | Crear cliente con email ya existente (mismo usuario) | Warning: "A client with this email already exists" |
| FTP-015 | Crear cliente con email existente en MAYUSCULAS | Warning de duplicado (case-insensitive) |
| FTP-016 | Crear cliente con mismo nombre pero diferente email | Cliente creado exitosamente |
| FTP-017 | Verificar que duplicados de otros usuarios NO afectan (RLS) | Cliente creado (emails se pueden repetir entre usuarios) |

---

## 3. Pruebas de Integridad de Datos

### 3.1 No Solapamiento de Datos

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado*** |
| --- | --- | --- |
| FTP-018 | Crear cliente User A, verificar que User B NO lo ve | RLS funciona correctamente |
| FTP-019 | Verificar que IDs de clientes son unicos globalmente | Sin colisiones de ID |
| FTP-020 | Crear clientes con nombres similares, verificar diferenciacion | Cada cliente tiene su registro independiente |
| FTP-021 | Verificar timestamps (created*at, updated*at) unicos por registro | Timestamps correctos y distintos |

---

## 4. Pruebas de Concurrencia (Race Conditions)

### 4.1 Mismo Usuario, Multiples Dispositivos

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado*** |
| --- | --- | --- |
| FTP-022 | Crear mismo cliente desde 2 navegadores simultaneamente | Solo uno se crea, el otro recibe error de duplicado |
| FTP-023 | Crear clientes diferentes desde 2 navegadores simultaneamente | Ambos se crean correctamente |
| FTP-024 | Verificar orden de creacion en lista tras creacion simultanea | Orden por timestamp correcto |
| FTP-025 | Verificar que no hay registros fantasma tras race condition | DB consistente, sin datos corruptos |

### 4.2 Comportamiento Esperado en Race Condition

- ***Estrategia recomendada***: First-write-wins con constraint de unicidad en DB
- ***Mensaje al segundo request***: "This client was just created. Refreshing list..."
- ***Accion***: Refrescar lista automaticamente para mostrar cliente ya creado

---

## 5. Pruebas de Limites y Capacidad

### 5.1 Limites de Clientes

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado*** |
| --- | --- | --- |
| FTP-026 | Crear cliente #1 hasta #100 | Todos se crean sin problemas |
| FTP-027 | Crear cliente #1000 | Sistema sigue respondiendo |
| FTP-028 | Definir si hay limite maximo de clientes por usuario | Documentar limite o confirmar "ilimitado" |

### 5.2 Limites de Campos

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado*** |
| --- | --- | --- |
| FTP-029 | Name con 1 caracter | Validacion: minimo 2 caracteres |
| FTP-030 | Name con 255 caracteres | Aceptado (o error si hay limite menor) |
| FTP-031 | Name con 500 caracteres | Error: "Name too long (max X characters)" |
| FTP-032 | Email con dominio muy largo (100+ chars) | Comportamiento definido |
| FTP-033 | Phone con formato internacional (+54 11 1234-5678) | Aceptado |
| FTP-034 | Address con multiples lineas | Aceptado y mostrado correctamente |

---

## 6. Pruebas de Persistencia de Datos (Form State)

### 6.1 Persistencia del Popup/Modal

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado*** |
| --- | --- | --- |
| FTP-035 | Llenar formulario, cerrar popup, abrir de nuevo | Datos persisten (localStorage/sessionStorage) |
| FTP-036 | Llenar formulario, refrescar pagina (F5), abrir popup | Datos persisten |
| FTP-037 | Llenar formulario, navegar a otra pagina, volver, abrir popup | Datos persisten |
| FTP-038 | Llenar formulario, cerrar pestana, abrir nueva pestana | Datos NO persisten (sesion nueva) |
| FTP-039 | Crear cliente exitosamente, abrir popup de nuevo | Formulario VACIO (datos limpiados tras exito) |
| FTP-040 | Error al crear, cerrar popup, abrir de nuevo | Datos persisten para reintentar |

### 6.2 Escenarios de Recuperacion

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado*** |
| --- | --- | --- |
| FTP-041 | Perdida de conexion mientras se llena formulario | Datos en local, warning de conexion |
| FTP-042 | Timeout de sesion mientras se llena formulario | Redirect a login, datos guardados localmente |
| FTP-043 | Click en "Confirmar" durante perdida de conexion | Error friendly, datos NO perdidos, retry disponible |

---

## 7. Pruebas de Mensajes de Error (User & Developer Friendly)

### 7.1 Errores de Validacion (Frontend)

| ***ID**** | ****Error**** | ****Mensaje Usuario**** | ****Info Developer*** |
| --- | --- | --- | --- |
| FTP-044 | Email invalido | "Please enter a valid email address" | field: email, rule: email_format |
| FTP-045 | Campo requerido vacio | "This field is required" | field: name, rule: required |
| FTP-046 | Texto muy largo | "Maximum 255 characters allowed" | field: name, max: 255, current: 300 |

### 7.2 Errores de Backend/DB

| ***ID**** | ****Error**** | ****Mensaje Usuario**** | ****Info Developer*** |
| --- | --- | --- | --- |
| FTP-047 | Duplicado | "A client with this email already exists. Check your client list." | error*code: DUPLICATE*CLIENT, field: email, value: "[x@y.com](mailto:x@y.com)" |
| FTP-048 | Error de conexion DB | "We couldn't save your client. Please try again in a moment." | error*code: DB*CONNECTION, timestamp: ISO, request_id: uuid |
| FTP-049 | Timeout | "The request took too long. Please try again." | error*code: TIMEOUT, duration*ms: 30000, endpoint: /api/clients |
| FTP-050 | Error inesperado | "Something went wrong. Please contact support with code: ABC123" | error*code: UNKNOWN, stack*trace: ..., request_id: ABC123 |

### 7.3 Formato de Error Copiable

```
--------------------
Error Report - SoloQ
--------------------
Time: 2026-01-27 15:30:45 UTC
Code: DB*CONNECTION*FAILED
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

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado*** |
| --- | --- | --- |
| FTP-051 | Navegacion por teclado (Tab) en el formulario | Orden logico de campos, focus visible |
| FTP-052 | Labels asociados correctamente a inputs | Screen readers leen labels |
| FTP-053 | Mensajes de error anunciados por screen reader | aria-live o role="alert" |
| FTP-054 | Contraste de colores en errores | Ratio minimo 4.5:1 |
| FTP-055 | Boton "Add Client" accesible con Enter | Funciona sin mouse |
| FTP-056 | Escape cierra el popup | Modal accesible por teclado |

---

## 9. Pruebas de UI/UX

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado*** |
| --- | --- | --- |
| FTP-057 | Toastr aparece al crear cliente exitosamente | Visible 3-5 segundos, posicion consistente |
| FTP-058 | Spinner/Loading mientras se guarda | Feedback visual de proceso |
| FTP-059 | Boton deshabilitado durante submit | Previene doble-click |
| FTP-060 | Responsive: Popup en mobile | Usable en pantallas pequenas |
| FTP-061 | Placeholder text en campos | Guia al usuario sobre formato esperado |

---

## 10. Matriz de Prioridades

| ***Prioridad**** | ****Pruebas**** | ****Justificacion*** |
| --- | --- | --- |
| ***P0 - Blocker*** | FTP-001, FTP-005-007, FTP-014, FTP-022 | Sin esto no funciona la feature |
| ***P1 - Critical*** | FTP-008-013, FTP-035-040, FTP-047-050 | UX critica y manejo de errores |
| ***P2 - Major*** | FTP-018-021, FTP-023-025, FTP-044-046 | Integridad y concurrencia |
| ***P3 - Minor*** | FTP-026-034, FTP-051-061 | Limites y accesibilidad |

---

## 11. Notas Adicionales

### Campos Sugeridos para el Formulario

| ***Campo**** | ****Tipo**** | ****Requerido**** | ****Validacion*** |
| --- | --- | --- | --- |
| name | text | Si | min: 2, max: 255 |
| email | email | Si | formato email valido |
| tax_id | text | Si* | formato segun pais (RIF/CUIT/NIF/EIN) |
| company_name | text | No | max: 255 |
| phone | tel | No | formato internacional |
| address | textarea | No | max: 500 |

> *Nota: Considerar hacer tax_id requerido para fines de facturacion.

### Verificacion de Email Real

- Considerar integrar servicio de validacion de email (ej: ZeroBounce, [http://Hunter.io](http://Hunter.io) )
- Alternativa: enviar email de verificacion al cliente

---

## 12. Referencias

- ***User Story:*** `.context/PBI/epics/EPIC-SQ-13-client-management/stories/STORY-SQ-14-add-client/story.md`
- ***Epic:*** `.context/PBI/epics/EPIC-SQ-13-client-management/epic.md`
- ***Jira Issue:*** [SQ-14](https://upexgalaxy65.atlassian.net/browse/SQ-14)

---

### Ely - 2/3/2026, 8:57:55 PM

Feature implementada y mergeada a staging. PR #21 completado.\n\nCambios:\n- Formulario de creación de cliente con validación\n- API POST /api/clients con prevención de duplicados\n- React Query para manejo de estado\n- Toast notifications para feedback\n\nListo para testing en staging.

---

### Ely - 2/3/2026, 9:32:53 PM

ESTO LO HICE MANUALMENTE:

Durante el Testing Exploratorio de la US presente, encontré un Defecto corriendo el test 
2.4 Prevencion de Duplicados

| ***ID**** | ****Caso de Prueba**** | ****Resultado Esperado**** | ****STATUS ACTUAL*** |
| --- | --- | --- | --- |
| FTP-014 | Crear cliente con email ya existente (mismo usuario) | Warning: "A client with this email already exists" | :check_mark: |
| FTP-015 | Crear cliente con email existente en MAYUSCULAS | Warning de duplicado (case-insensitive) | :cross_mark: |
| FTP-016 | Crear cliente con mismo nombre pero diferente email | Cliente creado exitosamente | :check_mark: |
| FTP-017 | Verificar que duplicados de otros usuarios NO afectan (RLS) | Cliente creado (emails se pueden repetir entre usuarios) | :check_mark: |

Tenemos un Bug que cree aquí: 

---

### Ely - 2/3/2026, 10:28:22 PM

# Exploratory Testing Session Notes

**Date:** 2026-02-03
**Feature:** [https://upexgalaxy65.atlassian.net/browse/SQ-14#icft=SQ-14](https://upexgalaxy65.atlassian.net/browse/SQ-14#icft=SQ-14) - Add New Client
**Staging URL:** [https://staging-upexsoloq.vercel.app/](https://staging-upexsoloq.vercel.app/)
**Tester:** Claude (AI)

## 

## Executive Summary

- ***Overall Status:*** ISSUES FOUND
- ***Scenarios Tested:*** 9
- ***Passed:*** 7
- ***Failed:*** 1
- ***Not Verifiable:*** 1
- ***Bugs Confirmados:*** 1 ([https://upexgalaxy65.atlassian.net/browse/SQ-69#icft=SQ-69](https://upexgalaxy65.atlassian.net/browse/SQ-69#icft=SQ-69))

## Scenarios Tested

| ***ID**** | ****Test Case**** | ****Status*** |
| --- | --- | --- |
| FTP-001 | Crear cliente con name + email válidos | :check_mark: PASSED |
| FTP-003 | Lista se actualiza automáticamente | :warning: NO VERIFICABLE (lista no implementada) |
| FTP-005 | Formulario sin name | :check_mark: PASSED |
| FTP-006 | Formulario sin email | :check_mark: PASSED |
| FTP-008 | Email sin @ | :check_mark: PASSED |
| FTP-014 | Email duplicado (mismo case) | :check_mark: PASSED |
| FTP-015 | Email duplicado (MAYÚSCULAS) | :cross_mark: FAILED |
| FTP-057 | Toast al crear cliente | :check_mark: PASSED |
| FTP-058/059 | Spinner/Botón disabled | :warning: NO VERIFICABLE (request muy rápido) |

## 

## Issues Found

### Issue 1: Bug [https://upexgalaxy65.atlassian.net/browse/SQ-69#icft=SQ-69](https://upexgalaxy65.atlassian.net/browse/SQ-69#icft=SQ-69) Confirmado - Case-Sensitive Duplicate Check

- ***Severity:*** High
- ***Test ID:*** FTP-015
- ***Steps to Reproduce:***
- ***Expected:*** Warning "Ya existe un cliente con este email"
- ***Actual:*** Cliente creado exitosamente (201 en lugar de 409)
- ***Bug Ticket:*** [SQ-69](https://upexgalaxy65.atlassian.net/browse/SQ-69)

## Observations & Recommendations

### Positive Findings:

- Validaciones de frontend funcionan correctamente (required fields, email format)
- Detección de duplicados funciona para mismo case
- Toast notifications funcionan correctamente
- Redirección post-submit funciona
- data-testid implementados correctamente

### Areas of Concern:

- ***Lista de clientes NO implementada*** - muestra placeholder "Próximamente"
- Bug [https://upexgalaxy65.atlassian.net/browse/SQ-69#icft=SQ-69](https://upexgalaxy65.atlassian.net/browse/SQ-69#icft=SQ-69) sigue abierto (case-insensitive)

### Recommendations for Automation:

# **P0:** FTP-001, FTP-005, FTP-006, FTP-014 (happy path + validaciones críticas)

# **P1:** FTP-008, FTP-015 (validación email + regression para bug fix)

# **P2:** FTP-057 (toast verification)

## 

## Next Steps

- [SQ-69](https://upexgalaxy65.atlassian.net/browse/SQ-69) ya reportado - verificar cuando se corrija
- Esperar implementación de lista de clientes para FTP-003
- Implementar throttling para tests FTP-058/059

---

### Ely - 2/10/2026, 9:48:03 PM

# Database + E2E Testing Report - [https://upexgalaxy65.atlassian.net/browse/SQ-14#icft=SQ-14](https://upexgalaxy65.atlassian.net/browse/SQ-14#icft=SQ-14): Add New Client

**Fecha:** 2026-02-11
**Tester:** Claude (AI)
**Environment:** Staging ([https://staging-upexsoloq.vercel.app/](https://staging-upexsoloq.vercel.app/))
**Viewport:** Mobile (390x844)

## 

## Executive Summary

| ***Métrica**** | ****Valor*** |
| --- | --- |
| **Overall Status** | :check_mark: **PASSED** |
| **Test Cases Executed** | 15 |
| **Passed** | 15 |
| **Failed** | 0 |
| **Bug SQ-69** | :check_mark: **FIXED** |

## 

## Test Results by Category

### 1. Functional Tests (Happy Path)

| ***ID**** | ****Test Case**** | ****Status**** | ****DB Verified*** |
| --- | --- | --- | --- |
| FTP-001 | Crear cliente con name + email válidos | :check*mark: PASSED | :check*mark: UUID único generado |
| FTP-003 | Lista se actualiza automáticamente | :check_mark: PASSED | N/A |

### 2. Required Field Validations

| ***ID**** | ****Test Case**** | ****Status**** | ****Error Message*** |
| --- | --- | --- | --- |
| FTP-005 | Formulario sin name | :check_mark: PASSED | "El nombre debe tener al menos 2 caracteres" |
| FTP-006 | Formulario sin email | :check_mark: PASSED | "Ingresa un email válido" |
| FTP-007 | Formulario vacío | :check_mark: PASSED | Ambos errores mostrados |

### 3. Email Format Validations

| ***ID**** | ****Test Case**** | ****Input**** | ****Status*** |
| --- | --- | --- | --- |
| FTP-008 | Email sin @ | `clientemail.com` | :check_mark: PASSED (error) |
| FTP-009 | Email sin dominio | `cliente@` | :check_mark: PASSED (error) |
| FTP-012 | Email con subdominio | `cliente@sub.email.com` | :check_mark: PASSED (aceptado) |
| FTP-013 | Email con + | `cliente+tag@email.com` | :check_mark: PASSED (aceptado) |

### 4. Duplicate Prevention (Bug [https://upexgalaxy65.atlassian.net/browse/SQ-69#icft=SQ-69](https://upexgalaxy65.atlassian.net/browse/SQ-69#icft=SQ-69) Verification)

| ***ID**** | ****Test Case**** | ****Status**** | ****Notes*** |
| --- | --- | --- | --- |
| FTP-014 | Email duplicado exacto | :check_mark: PASSED | Toast: "Ya existe un cliente con este email" |
| FTP-015 | Email duplicado MAYÚSCULAS | :check_mark: **PASSED** | **SQ-69 FIXED** - Detección case-insensitive funcionando |

### 5. Data Integrity (Database Layer)

| ***ID**** | ****Test Case**** | ****Status**** | ****Evidence*** |
| --- | --- | --- | --- |
| FTP-018 | RLS - Usuario solo ve sus clientes | :check*mark: PASSED | UI: 7 clientes = DB: 7 para user*id actual |
| FTP-019 | IDs únicos globalmente | :check_mark: PASSED | 26 clientes = 26 UUIDs únicos |
| FTP-020 | Nombres similares diferenciados | :check_mark: PASSED | 4 "Goku" con IDs independientes |
| FTP-021 | Timestamps correctos | :check*mark: PASSED | Todos: created*at <= updated_at |

## 

## Database Schema Analysis

```java
Constraints:
├── clients_pkey (PRIMARY KEY on id)
├── clients*user*id_fkey (FOREIGN KEY → auth.users)
└── clients*user*id*email*key (UNIQUE on user_id, email)

Indexes:
├── idx*clients*email (btree)
├── idx*clients*user_id (btree)
├── idx*clients*deleted*at (partial, WHERE deleted*at IS NULL)
└── idx*clients*user_deleted (composite for RLS + soft delete)
```

## 

## :warning: Observation & Recommendation

**Hallazgo:** El constraint `clients*user*id*email*key` NO es case-insensitive a nivel DB.

- ***Actual:*** `UNIQUE(user_id, email)` - solo previene duplicados exactos
- ***Fix SQ-69:*** Implementado a nivel API/backend, no a nivel DB constraint
- ***Riesgo:*** INSERT directo a DB podría crear duplicados con diferente case

**Recomendación:** Agregar índice case-insensitive:

```sql
CREATE UNIQUE INDEX idx*clients*user*email*lower 
ON clients (user_id, LOWER(email)) 
WHERE deleted_at IS NULL;
```

## 

## Mobile Responsive Testing (FTP-060)

| ***Aspecto**** | ****Status*** |
| --- | --- |
| Formulario usable en 390x844 | :check_mark: PASSED |
| Tabla adapta columnas (oculta Empresa, Creado) | :check_mark: PASSED |
| Sidebar se colapsa correctamente | :check_mark: PASSED |
| Botones accesibles | :check_mark: PASSED |

## 

## Conclusion

Todos los test cases ejecutados pasaron exitosamente. El bug [https://upexgalaxy65.atlassian.net/browse/SQ-69#icft=SQ-69](https://upexgalaxy65.atlassian.net/browse/SQ-69#icft=SQ-69) ha sido verificado como **FIXED** - la detección de duplicados ahora funciona correctamente con case-insensitive.

La feature [https://upexgalaxy65.atlassian.net/browse/SQ-14#icft=SQ-14](https://upexgalaxy65.atlassian.net/browse/SQ-14#icft=SQ-14) está lista para pasar a **Done**.

---

### Ely - 2/10/2026, 9:48:24 PM

QA Sign-Off: 15 test cases ejecutados, todos pasaron. Bug [https://upexgalaxy65.atlassian.net/browse/SQ-69#icft=SQ-69](https://upexgalaxy65.atlassian.net/browse/SQ-69#icft=SQ-69) verificado como fixed. Feature lista para producción.

---

### Ely - 2/24/2026, 9:50:09 PM

## Test Documentation Complete

***Fecha:*** 2026-02-24
***Fase:*** 11 - Test Documentation

## 

### Tests Documentados (Candidates para Automatización)

| ***Test ID **** | ****Nombre **** | ****ROI **** | ****Status *** |
| --- | --- | --- | --- |
| [SQ-90](https://upexgalaxy65.atlassian.net/browse/SQ-90)  | TC1: Validar creación de cliente con name y email válidos  | 7.0  | Candidate  |
| [SQ-91](https://upexgalaxy65.atlassian.net/browse/SQ-91)  | TC2: Validar warning de duplicado cuando email ya existe  | 4.0  | Candidate  |
| [SQ-92](https://upexgalaxy65.atlassian.net/browse/SQ-92)  | TC3: Validar warning de duplicado cuando email difiere en case  | 3.75  | Candidate  |

## 

### Regresión de Bug Cubierta

- ***SQ-69*** (duplicados case-insensitive) cubierto por TC3 ([https://upexgalaxy65.atlassian.net/browse/SQ-92#icft=SQ-92](https://upexgalaxy65.atlassian.net/browse/SQ-92#icft=SQ-92))

### Próximos Pasos

Los 3 tests están listos para ***Fase 12: Test Automation (KATA Framework)***

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:44.359Z_
