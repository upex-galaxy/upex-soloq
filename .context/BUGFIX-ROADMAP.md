# Bugfix & Improvements Roadmap - SoloQ

> **Documento provisional** - Generado: 2026-02-09
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

---

## Estado Actual de Defects

### Defects Resueltos (Ready For QA)

| Key   | Summary                                       | Priority | Status       | Assignee         | Bloquea | PR Fix |
| ----- | --------------------------------------------- | -------- | ------------ | ---------------- | ------- | ------ |
| SQ-74 | Logout no funciona después de refresh         | Highest  | Ready For QA | Joel Ramirez     | SQ-3    | #41    |
| SQ-71 | Breadcrumb muestra user_ID en edición cliente | High     | Ready For QA | Joel Ramirez     | SQ-16   | #41    |
| SQ-69 | Email duplicado case-sensitive permitido      | High     | Ready For QA | Ely              | SQ-14   | #41    |
| SQ-70 | Campos desalineados al validar email          | Lowest   | Ready For QA | Marianela Portas | -       | #41    |

### Defects En Revisión (PR Abierto)

| Key   | Summary                                          | Priority | Status    | Assignee | Bloquea | PR Fix |
| ----- | ------------------------------------------------ | -------- | --------- | -------- | ------- | ------ |
| SQ-75 | Phone field acepta letras y permite guardar      | Medium   | In Review | Ely      | -       | #44    |
| SQ-76 | Business_profiles devuelve 406 en create invoice | Medium   | In Review | Ely      | SQ-29   | #45    |

### Improvements Resueltos

| Key   | Summary                | Priority | Status | Assignee     | Relacionado | PR Impl |
| ----- | ---------------------- | -------- | ------ | ------------ | ----------- | ------- |
| SQ-73 | "Remember me" en Login | Medium   | CLOSED | Joel Ramirez | SQ-3        | #42     |

### Issues Externos (No son del código)

| Key   | Summary                          | Razón                      | Status | Acción          |
| ----- | -------------------------------- | -------------------------- | ------ | --------------- |
| SQ-72 | Jira API bloquea update de Epics | Bug de Jira, no del código | OPEN   | Escalar a Admin |
| SQ-77 | Flujo incompleto en staging      | No es bug, falta feature   | CLOSED | N/A             |

---

## User Stories Afectadas por Defects

### Anteriormente Bloqueadas (RESUELTAS)

| Story | Summary          | Defect | Estado Defect | Estado US   | PR Fix |
| ----- | ---------------- | ------ | ------------- | ----------- | ------ |
| SQ-3  | User Login       | SQ-74  | Ready For QA  | **In Test** | #41    |
| SQ-16 | Edit Client Data | SQ-71  | Ready For QA  | **In Test** | #41    |

**Nota:** Los fixes ya están mergeados. Las US fueron movidas a In Test para re-testing por QA.

### Con Defects Relacionados (No Bloqueantes)

| Story | Summary             | Defect | Estado Defect | Impacto                     |
| ----- | ------------------- | ------ | ------------- | --------------------------- |
| SQ-14 | Add New Client      | SQ-69  | Ready For QA  | Email duplicado (corregido) |
| SQ-29 | Add Notes and Terms | SQ-76  | OPEN          | Business_profiles 406       |

---

## Orden de Prioridad para Fixes

### Prioridad 1 - Bloqueantes (RESUELTOS ✅)

1. **SQ-74** (Highest) - Logout crítico ✅
   - **Problema:** Después de refrescar la página varias veces, el username cambia a "Usuario" y el logout no funciona
   - **Impacto:** Funcionalidad crítica de autenticación
   - **Desbloquea:** SQ-3 (User Login)
   - **Estado:** Ready For QA (PR #41 MERGED)

2. **SQ-71** (High) - Breadcrumb UX ✅
   - **Problema:** Al editar un cliente, el breadcrumb muestra el UUID en lugar del nombre
   - **Impacto:** Información técnica expuesta al usuario
   - **Desbloquea:** SQ-16 (Edit Client Data)
   - **Estado:** Ready For QA (PR #41 MERGED)

### Prioridad 2 - Resueltos Sin Bloqueo

3. **SQ-69** (High) - Validación email duplicado ✅
   - **Problema:** Se permite crear clientes con emails duplicados si difieren en mayúsculas/minúsculas
   - **Impacto:** Datos inconsistentes en la base de datos
   - **Estado:** Ready For QA (PR #41 MERGED)

4. **SQ-70** (Lowest) - Visual menor ✅
   - **Problema:** Campos name/email se desalinean al mostrar mensaje de validación
   - **Impacto:** Visual, bajo impacto funcional
   - **Estado:** Ready For QA (PR #41 MERGED)

### Prioridad 3 - Nuevos Defects (En Revisión)

5. **SQ-75** (Medium) - Phone acepta letras 🟡 EN REVISIÓN
   - **Problema:** El campo "Phone" acepta letras y permite guardar sin errores
   - **Impacto:** Datos inválidos en la base de datos
   - **Fix:** Regex validation en Zod schema
   - **PR:** [#44](https://github.com/upex-galaxy/upex-soloq/pull/44)

6. **SQ-76** (Medium) - Business_profiles 406 🟡 EN REVISIÓN
   - **Problema:** Business_profiles devuelve 406 en create invoice e impide validar prefill de términos
   - **Impacto:** Afecta validación de SQ-29
   - **Fix:** Cambiar .single() por .maybeSingle()
   - **PR:** [#45](https://github.com/upex-galaxy/upex-soloq/pull/45)

---

## Tracking de Fixes

### SQ-74 - Logout no funciona después de refresh ✅ RESUELTO

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Causa: getSession() retorna datos cacheados sin validar     |
| 2    | Completado | Fix: Cambiar getSession() por getUser() en auth-context     |
| 3    | Completado | PR [#41](https://github.com/upex-galaxy/upex-soloq/pull/41) |
| 4    | Completado | **PR MERGED - 2026-02-10**                                  |
| 5    | Completado | Transicionado a Ready For QA                                |

---

### SQ-71 - Breadcrumb muestra user_ID ✅ RESUELTO

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Causa: Layout solo usa pathname, no tiene acceso a datos    |
| 2    | Completado | Fix: BreadcrumbContext + DynamicBreadcrumb component        |
| 3    | Completado | PR [#41](https://github.com/upex-galaxy/upex-soloq/pull/41) |
| 4    | Completado | **PR MERGED - 2026-02-10**                                  |
| 5    | Completado | Transicionado a Ready For QA                                |

---

### SQ-69 - Email duplicado case-sensitive ✅ RESUELTO

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Causa: .eq() es case-sensitive en Supabase                  |
| 2    | Completado | Fix: Normalizar a lowercase + usar .ilike()                 |
| 3    | Completado | Migración SQL aplicada para normalizar emails existentes    |
| 4    | Completado | PR [#41](https://github.com/upex-galaxy/upex-soloq/pull/41) |
| 5    | Completado | **PR MERGED - 2026-02-10**                                  |
| 6    | Completado | Transicionado a Ready For QA                                |

---

### SQ-70 - Campos desalineados ✅ RESUELTO

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Causa: FormMessage retorna null cuando no hay error         |
| 2    | Completado | Fix: Siempre renderizar con min-height, usar invisible      |
| 3    | Completado | PR [#41](https://github.com/upex-galaxy/upex-soloq/pull/41) |
| 4    | Completado | **PR MERGED - 2026-02-10**                                  |
| 5    | Completado | Transicionado a Ready For QA                                |

---

### SQ-75 - Phone acepta letras 🟡 EN REVISIÓN

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Causa: Zod schema solo valida max length, no formato        |
| 2    | Completado | Fix: Regex `/^[0-9+\-\s()]*$/` para validar formato         |
| 3    | Completado | PR [#44](https://github.com/upex-galaxy/upex-soloq/pull/44) |
| 4    | Pendiente  | **Esperando code review y merge**                           |

---

### SQ-76 - Business_profiles 406 🟡 EN REVISIÓN

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Causa: `.single()` retorna 406 cuando hay 0 filas           |
| 2    | Completado | Fix: Cambiar a `.maybeSingle()` que retorna null            |
| 3    | Completado | PR [#45](https://github.com/upex-galaxy/upex-soloq/pull/45) |
| 4    | Pendiente  | **Esperando code review y merge**                           |

---

## Tracking de Improvements

### SQ-73 - "Remember me" en Login ✅ CERRADO

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Revisado flujo de autenticación con Supabase SSR            |
| 2    | Completado | Checkbox "Recordarme" agregado al login form                |
| 3    | N/A        | Supabase SSR usa cookies persistentes por defecto           |
| 4    | Completado | PR [#42](https://github.com/upex-galaxy/upex-soloq/pull/42) |
| 5    | Completado | **PR MERGED - 2026-02-10**                                  |
| 6    | Completado | Issue CLOSED                                                |

---

## Métricas

- **Total Defects en revisión:** 2 (SQ-75 PR#44, SQ-76 PR#45)
- **Defects resueltos (Ready For QA):** 4 (SQ-74, SQ-71, SQ-69, SQ-70)
- **Defects bloqueantes resueltos:** 2 (SQ-74, SQ-71)
- **User Stories desbloqueadas:** 2 (SQ-3 → In Test, SQ-16 → In Test)
- **Total Improvements:** 1 (SQ-73)
- **Improvements cerrados:** 1 (SQ-73 - CLOSED)
- **PRs de Bugfix mergeados:** 1 ([#41](https://github.com/upex-galaxy/upex-soloq/pull/41))
- **PRs de Bugfix abiertos:** 2 ([#44](https://github.com/upex-galaxy/upex-soloq/pull/44), [#45](https://github.com/upex-galaxy/upex-soloq/pull/45))
- **PRs de Improvements mergeados:** 1 ([#42](https://github.com/upex-galaxy/upex-soloq/pull/42))

---

## Próximos Pasos

1. **Code Review pendiente:**
   - PR #44 (SQ-75 - phone validation)
   - PR #45 (SQ-76 - business_profiles 406)

2. **QA debe re-testear (cuando PRs se mergeen):**
   - SQ-74 (logout fix) ✅ Ready For QA
   - SQ-71 (breadcrumb fix) ✅ Ready For QA
   - SQ-69 (email duplicado fix) ✅ Ready For QA
   - SQ-70 (campos desalineados fix) ✅ Ready For QA
   - SQ-75 (phone validation) ⏳ Esperando merge
   - SQ-76 (business_profiles 406) ⏳ Esperando merge

3. **Una vez QA valide los fixes:**
   - SQ-3 puede pasar a QA Sign-Off
   - SQ-16 puede pasar a QA Sign-Off

---

## Referencias

- [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md) - Roadmap de features
- [Jira Board](https://upexgalaxy64.atlassian.net/browse/SQ) - Tablero del proyecto

---

_Actualizado por Claude Code - 2026-02-11 (SQ-75 PR#44, SQ-76 PR#45 creados y en revisión)_
