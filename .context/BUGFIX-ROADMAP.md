# Bugfix & Improvements Roadmap - SoloQ

> **Documento actualizado**: 2026-03-09
> **Propósito:** Tracking de defects, bugs e improvements encontrados durante QA

---

## Instrucciones para Continuar (Contexto IA)

**Para trabajar en bugfixes:**

1. **Ver el bug:** Revisar descripción, pasos de reproducción, y evidencia en Jira
2. **Crear rama:** `fix/SQ-XX/descripcion-corta`
3. **Implementar fix:** Seguir guidelines de `.context/guidelines/DEV/`
4. **PR a staging:** Crear PR con referencia al defect

**Para trabajar en improvements:**

1. **Ver el improvement:** Revisar descripción y contexto en Jira
2. **Crear rama:** `feat/SQ-XX/descripcion-corta`
3. **Implementar:** Seguir guidelines de `.context/guidelines/DEV/`
4. **PR a staging:** Crear PR con referencia al improvement

**Comando sugerido para iniciar:**

```
Continúa con el BUGFIX-ROADMAP.md - trabaja en SQ-XX
```

---

## Criterios de Transición de Defects

| Estado       | Significado            | PR Fix    | Acción              |
| ------------ | ---------------------- | --------- | ------------------- |
| OPEN         | Bug reportado, sin fix | NO existe | Priorizar y asignar |
| In Progress  | Fixing activamente     | OPEN      | Esperar merge       |
| In Review    | PR creado, en revisión | OPEN      | Revisar y aprobar   |
| Ready For QA | Fixeado y desplegado   | MERGED    | Re-testear          |
| CLOSED       | Verificado y cerrado   | MERGED    | N/A                 |
| Enhancement  | Movido a mejora futura | N/A       | Backlog             |

---

## Resumen Ejecutivo

| Categoría                    | Cantidad |
| ---------------------------- | -------- |
| **Bugs/Defects OPEN**        | 6        |
| **Ready For QA**             | 6        |
| **CLOSED (Resueltos)**       | 8        |
| **Enhancement (Diferidos)**  | 7        |
| **Total Issues**             | 27       |

---

## Estado Actual de Defects

### 🔴 OPEN - Requieren Fix (Prioridad)

| Key    | Tipo   | Summary                                                            | Priority | Assignee                     | Bloquea     |
| ------ | ------ | ------------------------------------------------------------------ | -------- | ---------------------------- | ----------- |
| SQ-74  | Defect | Logout no funciona después de refresh                              | Highest  | Ely                          | SQ-3        |
| SQ-121 | Bug    | Vista previa no ejecuta ninguna acción en /invoices/{id}/edit      | High     | Luis Eduardo Flores          | SQ-30       |
| SQ-123 | Bug    | Dashboard: Skeleton permanente tras crash de Vista previa          | High     | Luis Eduardo Flores          | SQ-121      |
| SQ-122 | Bug    | Draft Edit: Sin advertencia al navegar con cambios no guardados    | Medium   | Luis Eduardo Flores          | -           |
| SQ-111 | Bug    | Autosave: Estado Guardado/Cambios sin guardar alterna sin editar   | Medium   | Ely                          | -           |

### 🟡 Ready For QA - Esperando Re-Test

| Key   | Tipo   | Summary                                                                   | Priority | Assignee              | Bloquea |
| ----- | ------ | ------------------------------------------------------------------------- | -------- | --------------------- | ------- |
| SQ-81 | Defect | Login inconsistencias DB/UI: last_login_at, business_profiles 406         | Highest  | Joel Ramirez          | SQ-3    |
| SQ-82 | Defect | Edit client: unicidad email case-insensitive y validaciones DB parciales  | High     | Joel Ramirez          | SQ-16   |
| SQ-99 | Bug    | Signup: Email inválido no muestra error                                   | High     | Samuel Amonzabel      | SQ-2    |
| SQ-98 | Bug    | Signup: Password débil permite registro                                   | High     | Samuel Amonzabel      | SQ-2    |
| SQ-86 | Bug    | Password Reset: Suboptimal UI/UX for expired/used tokens                  | High     | Maxe Aguilera         | SQ-4    |
| SQ-76 | Defect | Business_profiles devuelve 406 en create invoice                          | Medium   | Ximena Quintana       | SQ-29   |

### ✅ CLOSED - Resueltos y Verificados

| Key   | Tipo   | Summary                                               | Priority | Assignee         | Cerrado    |
| ----- | ------ | ----------------------------------------------------- | -------- | ---------------- | ---------- |
| SQ-71 | Defect | Breadcrumb muestra user_ID en edición cliente         | High     | Joel Ramirez     | 2026-03-02 |
| SQ-69 | Defect | Email duplicado case-sensitive permitido              | High     | Ely              | 2026-02-10 |
| SQ-97 | Bug    | Discounts: Porcentaje >100 no bloquea                 | High     | GENESIS OJOSE    | 2026-03-06 |
| SQ-96 | Bug    | Discounts: Porcentaje 60% se convierte en 600%        | High     | GENESIS OJOSE    | 2026-03-06 |
| SQ-83 | Defect | Due date warning cuando se selecciona fecha de hoy    | Medium   | Yaneth Quintero  | 2026-03-08 |
| SQ-75 | Defect | Phone field acepta letras y permite guardar           | Medium   | Joel Ramirez     | 2026-03-01 |
| SQ-70 | Defect | Campos desalineados al validar email                  | Lowest   | Marianela Portas | 2026-02-10 |

### 📦 Enhancement - Movidos a Mejoras Futuras

| Key    | Tipo | Summary                                            | Priority | Assignee         | Razón                          |
| ------ | ---- | -------------------------------------------------- | -------- | ---------------- | ------------------------------ |
| SQ-109 | Bug  | Schema: Faltan Foreign Key constraints críticas    | High     | Arkaitz          | Mejora de arquitectura DB      |
| SQ-102 | Bug  | Signup: Validaciones solo frontend sin backend     | Medium   | Samuel Amonzabel | Mejora de seguridad            |
| SQ-100 | Bug  | Signup: Email 254 chars sin feedback               | Medium   | Samuel Amonzabel | Edge case, baja frecuencia     |
| SQ-84  | Bug  | Forgot Password: No indica rate limit exceeded     | Medium   | Maxe Aguilera    | UX improvement                 |
| SQ-72  | Bug  | Jira bloquea actualización de Epics (externo)      | Medium   | yxsinell acosta  | Bug de Jira, no del código     |
| SQ-101 | Bug  | Signup: No hay icono para ver contraseña           | Low      | Samuel Amonzabel | UX improvement                 |
| SQ-85  | Bug  | Password Reset: No real-time password strength     | Low      | Maxe Aguilera    | UX improvement                 |

---

## User Stories Afectadas por Defects

### Bloqueadas Activamente

| Story | Summary            | Defect        | Estado Defect | Impacto                       |
| ----- | ------------------ | ------------- | ------------- | ----------------------------- |
| SQ-3  | User Login         | SQ-74, SQ-81  | OPEN/Ready    | Logout no funciona + DB gaps  |
| SQ-30 | Save Invoice Draft | SQ-121, SQ-123| OPEN          | Vista previa crashea          |

### Con Defects en Ready For QA

| Story | Summary             | Defect | Estado Defect | Acción Requerida           |
| ----- | ------------------- | ------ | ------------- | -------------------------- |
| SQ-2  | User Signup         | SQ-98, SQ-99 | Ready For QA | Re-testear validaciones |
| SQ-4  | Password Recovery   | SQ-86  | Ready For QA  | Re-testear expired tokens  |
| SQ-16 | Edit Client Data    | SQ-82  | Ready For QA  | Re-testear unicidad email  |
| SQ-29 | Add Notes and Terms | SQ-76  | Ready For QA  | Re-testear business_profiles |

---

## Orden de Prioridad para Fixes

### Prioridad 1 - Bloqueantes Críticos (OPEN)

1. **SQ-74** (Highest) - Logout crítico 🔴
   - **Problema:** Después de refrescar la página varias veces, el username cambia a "Usuario" y el logout no funciona
   - **Impacto:** Funcionalidad crítica de autenticación
   - **Desbloquea:** SQ-3 (User Login)
   - **Assignee:** Ely
   - **Estado:** OPEN

2. **SQ-121** (High) - Vista previa no funciona 🔴
   - **Problema:** El botón "Vista previa" en /invoices/{id}/edit no ejecuta ninguna acción
   - **Impacto:** Bloquea flujo Draft → Vista previa → Enviar
   - **Desbloquea:** SQ-30 (Save Invoice as Draft)
   - **Assignee:** Luis Eduardo Flores
   - **Estado:** OPEN

3. **SQ-123** (High) - Dashboard skeleton permanente 🔴
   - **Problema:** Tras el crash de Vista previa, el Dashboard muestra skeleton indefinidamente
   - **Impacto:** Dashboard inutilizable sin recargar
   - **Bloqueado por:** SQ-121
   - **Assignee:** Luis Eduardo Flores
   - **Estado:** OPEN

### Prioridad 2 - Ready For QA (Requieren Re-Test)

4. **SQ-81** (Highest) - Login inconsistencias DB/UI 🟡
   - **Problema:** last_login_at no actualiza, business_profiles 406, gap onboarding
   - **Impacto:** Trazabilidad de login incompleta
   - **Assignee:** Joel Ramirez
   - **Estado:** Ready For QA

5. **SQ-82** (High) - Edit client unicidad email 🟡
   - **Problema:** Email duplicado case-insensitive permitido en edición
   - **Impacto:** Datos inconsistentes
   - **Assignee:** Joel Ramirez
   - **Estado:** Ready For QA

6. **SQ-98** (High) - Password débil permite registro 🟡
   - **Problema:** Signup acepta contraseña sin mayúscula
   - **Impacto:** Seguridad debilitada
   - **Assignee:** Samuel Amonzabel
   - **Estado:** Ready For QA

7. **SQ-99** (High) - Email inválido sin error 🟡
   - **Problema:** Signup no muestra error con email inválido
   - **Impacto:** UX confusa
   - **Assignee:** Samuel Amonzabel
   - **Estado:** Ready For QA

8. **SQ-86** (High) - Password Reset UX 🟡
   - **Problema:** Suboptimal UI/UX para tokens expirados
   - **Impacto:** UX confusa en recuperación
   - **Assignee:** Maxe Aguilera
   - **Estado:** Ready For QA

### Prioridad 3 - Medios (OPEN)

9. **SQ-122** (Medium) - Sin advertencia de cambios no guardados 🔴
   - **Problema:** Al navegar desde edit draft, no hay diálogo de confirmación
   - **Impacto:** Pérdida de datos potencial
   - **Assignee:** Luis Eduardo Flores
   - **Estado:** OPEN

10. **SQ-111** (Medium) - Autosave estado alternante 🔴
    - **Problema:** Estado Guardado/Cambios sin guardar alterna sin editar
    - **Impacto:** UX confuso
    - **Assignee:** Ely
    - **Estado:** OPEN

11. **SQ-76** (Medium) - Business_profiles 406 🟡
    - **Problema:** API retorna 406 al consultar business_profiles
    - **Impacto:** Afecta prefill de términos
    - **Assignee:** Ximena Quintana
    - **Estado:** Ready For QA

---

## Tracking de Fixes Activos

### SQ-74 - Logout no funciona después de refresh 🔴 OPEN

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Pendiente  | Investigar causa: getSession() vs getUser() en auth-context |
| 2    | Pendiente  | Implementar fix                                             |
| 3    | Pendiente  | Crear PR                                                    |
| 4    | Pendiente  | Merge y deploy                                              |
| 5    | Pendiente  | Transicionar a Ready For QA                                 |

---

### SQ-121 - Vista previa no ejecuta ninguna acción 🔴 OPEN

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Pendiente  | Investigar InvoicePreview / InvoiceEditForm                 |
| 2    | Pendiente  | El bug mutó: anteriormente crasheaba, ahora no hace nada    |
| 3    | Pendiente  | Crear PR con fix                                            |
| 4    | Pendiente  | Merge y deploy                                              |

---

### SQ-123 - Dashboard skeleton permanente 🔴 OPEN

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Pendiente  | Bloqueado por SQ-121 - verificar si persiste tras fix       |
| 2    | Pendiente  | Posible fix: Error Boundary en InvoicePreview               |
| 3    | Pendiente  | Crear PR si necesario                                       |

---

### SQ-81 - Login inconsistencias DB/UI 🟡 Ready For QA

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Diagnóstico: last_login_at NULL, business_profiles 406      |
| 2    | Completado | Fix implementado                                            |
| 3    | Completado | PR merged                                                   |
| 4    | Pendiente  | **Esperando re-test de QA**                                 |

---

### SQ-82 - Edit client unicidad email 🟡 Ready For QA

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Diagnóstico: case-sensitive en unique constraint            |
| 2    | Completado | Fix implementado                                            |
| 3    | Completado | PR merged                                                   |
| 4    | Pendiente  | **Esperando re-test de QA**                                 |

---

## Métricas

- **Total Bugs/Defects:** 27
- **OPEN (requieren fix):** 5
- **Ready For QA (re-test):** 6
- **CLOSED (verificados):** 8
- **Enhancement (diferidos):** 7
- **Bloqueantes críticos OPEN:** 3 (SQ-74, SQ-121, SQ-123)
- **User Stories bloqueadas:** 2 (SQ-3, SQ-30)

---

## Próximos Pasos

1. **Prioridad Inmediata - Fixes OPEN:**
   - [ ] SQ-74: Logout crítico - Ely
   - [ ] SQ-121: Vista previa - Luis Eduardo
   - [ ] SQ-123: Dashboard skeleton - Luis Eduardo (después de SQ-121)

2. **QA debe re-testear:**
   - [ ] SQ-81 (login DB gaps)
   - [ ] SQ-82 (email unicidad)
   - [ ] SQ-98 (password débil)
   - [ ] SQ-99 (email inválido)
   - [ ] SQ-86 (password reset UX)
   - [ ] SQ-76 (business_profiles 406)

3. **Bugs Medium pendientes:**
   - [ ] SQ-122 (unsaved changes warning)
   - [ ] SQ-111 (autosave estado)

---

## Referencias

- [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md) - Roadmap de features
- [Jira Board](https://upexgalaxy64.atlassian.net/browse/SQ) - Tablero del proyecto

---

_Actualizado por Claude Code - 2026-03-09 (Sincronizado con Jira via MCP Atlassian)_
