# Bugfix & Improvements Roadmap - SoloQ

> **Documento actualizado**: 2026-03-28
> **Proposito:** Tracking de defects, bugs e improvements encontrados durante QA

---

## Instrucciones para Continuar (Contexto IA)

**Para trabajar en bugfixes:**

1. **Leer progreso:** `.context/FIX-SESSION-PROGRESS.md` (tracking local git-ignored)
2. **Ver el bug:** Revisar descripcion, pasos de reproduccion, y evidencia en Jira
3. **Ejecutar workflow:** `.prompts/fase-7-implementation/bug-fix-workflow.md`
4. **Crear rama:** `fix/SQ-XX/descripcion-corta`
5. **Implementar fix:** Seguir guidelines de `.context/guidelines/DEV/`
6. **PR a staging:** Crear PR con referencia al defect
7. **Actualizar:** Este archivo y `FIX-SESSION-PROGRESS.md`

**Para trabajar en improvements:**

1. **Ver el improvement:** Revisar descripcion y contexto en Jira
2. **Crear rama:** `feat/SQ-XX/descripcion-corta`
3. **Implementar:** Seguir guidelines de `.context/guidelines/DEV/`
4. **PR a staging:** Crear PR con referencia al improvement

**Comando sugerido para iniciar:**

```
Lee .context/FIX-SESSION-PROGRESS.md y continua con el siguiente bug de la cola.
Ejecuta .prompts/fase-7-implementation/bug-fix-workflow.md
```

---

## Criterios de Transicion de Defects

| Estado       | Significado            | PR Fix    | Accion              |
| ------------ | ---------------------- | --------- | ------------------- |
| OPEN         | Bug reportado, sin fix | NO existe | Priorizar y asignar |
| In Progress  | Fixing activamente     | OPEN      | Esperar merge       |
| In Review    | PR creado, en revision | OPEN      | Revisar y aprobar   |
| Ready For QA | Fixeado y desplegado   | MERGED    | Re-testear          |
| CLOSED       | Verificado y cerrado   | MERGED    | N/A                 |
| Enhancement  | Movido a mejora futura | N/A       | Backlog             |

---

## Resumen Ejecutivo

| Categoria                    | Cantidad |
| ---------------------------- | -------- |
| **Bugs/Defects OPEN**        | 8        |
| **Ready For QA**             | 6        |
| **CLOSED (Resueltos)**       | 15       |
| **Enhancement (Diferidos)**  | 5        |
| **REJECTED (Rechazados)**    | 2        |
| **Total Issues**             | 36       |

---

## Estado Actual de Defects

### OPEN - Requieren Fix (Prioridad)

| Key    | Tipo   | Summary                                                                   | Priority | Assignee      | Bloquea      |
| ------ | ------ | ------------------------------------------------------------------------- | -------- | ------------- | ------------ |
| SQ-74  | Defect | Logout no funciona despues de refresh                                     | Highest  | Ely           | Produccion   |
| SQ-137 | Bug    | Backend Endpoint Missing for Client Invoice History (404 Not Found)       | Highest  | Rodrigo Godoy | SQ-18        |
| SQ-139 | Bug    | [SQ-32] Formula de descuento porcentual inconsistente - totales en PDF    | High     | Ely           | QA de SQ-32  |
| SQ-138 | Bug    | [SQ-32] Payment methods ausentes del PDF - API no incluye payment_methods | High     | Ely           | QA de SQ-32  |
| SQ-155 | Bug    | Password Recovery: Rate-limit exposes specific error message              | High     | Maxe Aguilera | QA de SQ-4   |
| SQ-142 | Bug    | [SQ-32] Subtotal almacenado != suma de items - ghost subtotal             | Medium   | Ely           | QA de SQ-32  |
| SQ-141 | Bug    | [SQ-32] tax_amount = $0 cuando descuento supera subtotal                  | Medium   | Ely           | QA de SQ-32  |
| SQ-140 | Bug    | [SQ-32] PDF header vacio para usuarios sin business_profile (42 facturas) | Medium   | Ely           | QA de SQ-32  |

### Ready For QA - Esperando Re-Test

| Key    | Tipo        | Summary                                                                  | Priority | Assignee              | Bloquea |
| ------ | ----------- | ------------------------------------------------------------------------ | -------- | --------------------- | ------- |
| SQ-82  | Defect      | Edit client: unicidad email case-insensitive y validaciones DB parciales | High     | Joel Ramirez          | SQ-16   |
| SQ-126 | Improvement | Refactorizacion completa del preview de factura PDF con vista split      | High     | Ely                   | -       |
| SQ-76  | Defect      | Business_profiles devuelve 406 en create invoice                         | Medium   | Ximena Quintana       | SQ-29   |
| SQ-124 | Bug         | No valida formato ni longitud de cuenta bancaria                         | Medium   | Arkaitz               | -       |
| SQ-122 | Bug         | Sin advertencia al navegar con cambios no guardados en borrador          | Medium   | Luis Eduardo Flores   | -       |
| SQ-87  | Improvement | [DB] Agregar constraint para impedir tasas de impuesto negativas         | Medium   | Gloria Galindez       | -       |

### Improvement OPEN

| Key    | Tipo        | Summary                              | Priority | Assignee         |
| ------ | ----------- | ------------------------------------ | -------- | ---------------- |
| SQ-127 | Improvement | Password visibility toggle en Signup | Low      | Samuel Amonzabel |

### CLOSED - Resueltos y Verificados

| Key    | Tipo   | Summary                                               | Priority | Assignee              | Cerrado    |
| ------ | ------ | ----------------------------------------------------- | -------- | --------------------- | ---------- |
| SQ-81  | Defect | Login inconsistencias DB/UI (last_login_at, 406)      | Highest  | Joel Ramirez          | 2026-03-28 |
| SQ-121 | Bug    | Vista previa no ejecuta accion en /invoices/{id}/edit  | High     | Luis Eduardo Flores   | 2026-03-28 |
| SQ-123 | Bug    | Dashboard skeleton permanente tras crash Vista previa  | High     | Luis Eduardo Flores   | 2026-03-28 |
| SQ-98  | Bug    | Signup: Password debil permite registro                | High     | Samuel Amonzabel      | 2026-03-28 |
| SQ-99  | Bug    | Signup: Email invalido no muestra error                | High     | Samuel Amonzabel      | 2026-03-28 |
| SQ-86  | Bug    | Password Reset: Suboptimal UI/UX for expired tokens    | High     | Maxe Aguilera         | 2026-03-28 |
| SQ-111 | Bug    | Autosave: Estado Guardado/Cambios alterna sin editar   | Medium   | GENESIS OJOSE         | 2026-03-28 |
| SQ-71  | Defect | Breadcrumb muestra user_ID en edicion cliente          | High     | Joel Ramirez          | 2026-03-02 |
| SQ-69  | Defect | Email duplicado case-sensitive permitido                | High     | Ely                   | 2026-02-10 |
| SQ-97  | Bug    | Discounts: Porcentaje >100 no bloquea                  | High     | GENESIS OJOSE         | 2026-03-06 |
| SQ-96  | Bug    | Discounts: Porcentaje 60% se convierte en 600%         | High     | GENESIS OJOSE         | 2026-03-06 |
| SQ-83  | Defect | Due date warning cuando se selecciona fecha de hoy     | Medium   | Yaneth Quintero       | 2026-03-08 |
| SQ-75  | Defect | Phone field acepta letras y permite guardar             | Medium   | Joel Ramirez          | 2026-03-01 |
| SQ-70  | Defect | Campos desalineados al validar email                   | Lowest   | Marianela Portas      | 2026-02-10 |

### Enhancement - Movidos a Mejoras Futuras

| Key    | Tipo | Summary                                         | Priority | Assignee         | Razon                      |
| ------ | ---- | ----------------------------------------------- | -------- | ---------------- | -------------------------- |
| SQ-109 | Bug  | Schema: Faltan Foreign Key constraints criticas  | High     | Arkaitz          | Mejora de arquitectura DB  |
| SQ-84  | Bug  | Forgot Password: No indica rate limit exceeded   | Medium   | Maxe Aguilera    | UX improvement             |
| SQ-72  | Bug  | Jira bloquea actualizacion de Epics (externo)    | Medium   | yxsinell acosta  | Bug de Jira, no del codigo |
| SQ-101 | Bug  | Signup: No hay icono para ver contrasena         | Low      | Samuel Amonzabel | UX improvement             |
| SQ-85  | Bug  | Password Reset: No real-time password strength   | Low      | Maxe Aguilera    | UX improvement             |

### REJECTED

| Key    | Tipo | Summary                                     | Priority | Assignee         | Razon                          |
| ------ | ---- | ------------------------------------------- | -------- | ---------------- | ------------------------------ |
| SQ-102 | Bug  | Signup: Validaciones solo frontend sin BE    | Medium   | Samuel Amonzabel | Mejora de seguridad            |
| SQ-100 | Bug  | Signup: Email 254 chars sin feedback         | Medium   | Samuel Amonzabel | Edge case, baja frecuencia     |

---

## User Stories Afectadas por Defects

### Bloqueadas por Bugs OPEN

| Story | Summary                     | Defect(s)                                | Estado Defect | Impacto                        |
| ----- | --------------------------- | ---------------------------------------- | ------------- | ------------------------------ |
| SQ-18 | View Client Invoice History | SQ-137                                   | OPEN          | Endpoint 404, no puede testear |
| SQ-32 | Generate PDF Invoice        | SQ-138, SQ-139, SQ-140, SQ-141, SQ-142  | OPEN          | 5 bugs de PDF bloquean QA      |
| SQ-4  | Password Recovery           | SQ-155                                   | OPEN          | Rate-limit bug de seguridad    |

### Con Defects en Ready For QA

| Story | Summary             | Defect | Estado Defect | Accion Requerida           |
| ----- | ------------------- | ------ | ------------- | -------------------------- |
| SQ-16 | Edit Client Data    | SQ-82  | Ready For QA  | Re-testear unicidad email  |
| SQ-29 | Add Notes and Terms | SQ-76  | Ready For QA  | Re-testear business_profiles |

### Desbloqueadas (Bugs Cerrados)

| Story | Summary            | Defect(s)        | Cerrado    |
| ----- | ------------------ | ---------------- | ---------- |
| SQ-3  | User Login         | SQ-81 ✅         | 2026-03-28 |
| SQ-30 | Save Invoice Draft | SQ-121, SQ-123 ✅| 2026-03-28 |
| SQ-2  | User Signup        | SQ-98, SQ-99 ✅  | 2026-03-28 |

---

## Orden de Prioridad para Fixes

### Prioridad 1 - Bloqueantes Criticos (OPEN)

1. **SQ-74** (Highest) - Logout critico - Defect de Produccion
   - **Problema:** Despues de refrescar la pagina varias veces, el username cambia a "Usuario" y el logout no funciona
   - **Impacto:** Funcionalidad critica de autenticacion
   - **Assignee:** Ely
   - **Estado:** OPEN

2. **SQ-137** (Highest) - Backend endpoint 404
   - **Problema:** GET /api/clients/[id]/invoices retorna 404 Not Found
   - **Impacto:** Bloquea SQ-18 (View Client Invoice History) que esta Ready For QA
   - **Assignee:** Rodrigo Godoy
   - **Estado:** OPEN

3. **SQ-139** (High) - Formula descuento PDF inconsistente
   - **Problema:** Totales incorrectos cuando hay descuento porcentual en PDF
   - **Impacto:** Bloquea QA de SQ-32 (PDF Generation)
   - **Assignee:** Ely
   - **Estado:** OPEN

4. **SQ-138** (High) - Payment methods ausentes del PDF
   - **Problema:** API no incluye payment_methods en el response del PDF
   - **Impacto:** Bloquea QA de SQ-32
   - **Assignee:** Ely
   - **Estado:** OPEN

5. **SQ-155** (High) - Rate-limit expone error message
   - **Problema:** El flow de forgot-password expone mensaje de error especifico en rate-limit
   - **Impacto:** Bug de seguridad, bloquea QA de SQ-4
   - **Assignee:** Maxe Aguilera
   - **Estado:** OPEN

### Prioridad 2 - Bugs Medium de PDF (OPEN)

6. **SQ-142** (Medium) - Ghost subtotal
   - **Problema:** Subtotal almacenado no coincide con suma de items
   - **Assignee:** Ely
   - **Estado:** OPEN

7. **SQ-141** (Medium) - tax_amount $0 con descuento
   - **Problema:** tax_amount se pone a $0 cuando descuento supera subtotal pese a tax_rate > 0%
   - **Assignee:** Ely
   - **Estado:** OPEN

8. **SQ-140** (Medium) - PDF header vacio
   - **Problema:** PDF header vacio para usuarios sin business_profile (42 facturas afectadas)
   - **Assignee:** Ely
   - **Estado:** OPEN

---

## Tracking de Fixes Activos

### SQ-74 - Logout no funciona despues de refresh - OPEN

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Pendiente  | Investigar causa: getSession() vs getUser() en auth-context |
| 2    | Pendiente  | Implementar fix                                             |
| 3    | Pendiente  | Crear PR                                                    |
| 4    | Pendiente  | Merge y deploy                                              |
| 5    | Pendiente  | Transicionar a Ready For QA                                 |

---

### SQ-137 - Backend Endpoint Missing (404) - OPEN

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Pendiente  | Verificar si endpoint existe en /api/clients/[id]/invoices  |
| 2    | Pendiente  | Implementar fix o crear endpoint                            |
| 3    | Pendiente  | Crear PR                                                    |
| 4    | Pendiente  | Merge y deploy                                              |

---

### SQ-139 - Formula descuento PDF - OPEN

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Pendiente  | Investigar invoice-calculations.ts y PDF generation         |
| 2    | Pendiente  | Implementar fix                                             |
| 3    | Pendiente  | Crear PR                                                    |

---

## Metricas

- **Total Bugs/Defects/Improvements:** 36
- **OPEN (requieren fix):** 8 bugs + 1 improvement = 9
- **Ready For QA (re-test):** 4 bugs + 2 improvements = 6
- **CLOSED (verificados):** 15 (7 nuevos desde 2026-03-09)
- **Enhancement (diferidos):** 5
- **REJECTED:** 2
- **Bloqueantes criticos OPEN:** 2 (SQ-74 Highest, SQ-137 Highest)
- **User Stories bloqueadas por bugs:** 3 (SQ-18, SQ-32, SQ-4)

---

## Proximos Pasos

1. **Prioridad Inmediata - Fixes OPEN:**
   - [ ] SQ-74: Logout critico (Highest, Defect Produccion)
   - [ ] SQ-137: Backend endpoint 404 (Highest)
   - [ ] SQ-139: Formula descuento PDF (High)
   - [ ] SQ-138: Payment methods PDF (High)
   - [ ] SQ-155: Rate-limit error (High, Seguridad)
   - [ ] SQ-142: Ghost subtotal (Medium)
   - [ ] SQ-141: tax_amount $0 (Medium)
   - [ ] SQ-140: PDF header vacio (Medium)

2. **QA debe re-testear:**
   - [ ] SQ-82 (email unicidad)
   - [ ] SQ-76 (business_profiles 406)
   - [ ] SQ-124 (cuenta bancaria validacion)
   - [ ] SQ-122 (unsaved changes warning)
   - [ ] SQ-126 (preview PDF refactor)
   - [ ] SQ-87 (tax rate constraint)

---

## Referencias

- [FIX-SESSION-PROGRESS.md](./FIX-SESSION-PROGRESS.md) - Progreso de sesiones (local, git-ignored)
- [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md) - Roadmap de features
- [Jira Board](https://upexgalaxy64.atlassian.net/browse/SQ) - Tablero del proyecto

---

_Actualizado por Claude Code - 2026-03-28 (Sincronizado con Jira via MCP Atlassian)_
