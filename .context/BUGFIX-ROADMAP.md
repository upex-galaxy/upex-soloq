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

## Estado Actual de Defects

### Defects Activos en Código

| Key   | Summary                                       | Priority | Status      | Bloquea | Sprint         | PR Fix                                                   |
| ----- | --------------------------------------------- | -------- | ----------- | ------- | -------------- | -------------------------------------------------------- |
| SQ-74 | Logout no funciona después de refresh         | Highest  | IN PROGRESS | SQ-3    | SoloQ Sprint 1 | [#41](https://github.com/upex-galaxy/upex-soloq/pull/41) |
| SQ-71 | Breadcrumb muestra user_ID en edición cliente | High     | IN PROGRESS | SQ-16   | SoloQ Sprint 1 | [#41](https://github.com/upex-galaxy/upex-soloq/pull/41) |
| SQ-69 | Email duplicado case-sensitive permitido      | High     | IN PROGRESS | SQ-14   | SoloQ Sprint 1 | [#41](https://github.com/upex-galaxy/upex-soloq/pull/41) |
| SQ-70 | Campos desalineados al validar email          | Lowest   | IN PROGRESS | -       | SoloQ Sprint 1 | [#41](https://github.com/upex-galaxy/upex-soloq/pull/41) |

### Improvements (Mejoras a Funcionalidades Existentes)

> **Nota para QA:** Usar issue type "Improvement" cuando se detecte una funcionalidad faltante que NO es un bug (no rompe nada existente, simplemente no está implementado).

| Key   | Summary                | Priority | Status      | Relacionado | Sprint         | PR Impl                                                  |
| ----- | ---------------------- | -------- | ----------- | ----------- | -------------- | -------------------------------------------------------- |
| SQ-73 | "Remember me" en Login | Medium   | IN PROGRESS | SQ-3        | SoloQ Sprint 1 | [#42](https://github.com/upex-galaxy/upex-soloq/pull/42) |

### Issues Externos (No son del código)

| Key   | Summary                          | Razón                      | Acción          |
| ----- | -------------------------------- | -------------------------- | --------------- |
| SQ-72 | Jira API bloquea update de Epics | Bug de Jira, no del código | Escalar a Admin |

---

## User Stories Bloqueadas por Defects

| Story | Summary          | Bloqueada por | Status Anterior | Status Actual |
| ----- | ---------------- | ------------- | --------------- | ------------- |
| SQ-3  | User Login       | SQ-74         | Ready For QA    | BLOCKED       |
| SQ-16 | Edit Client Data | SQ-71         | In Test         | BLOCKED       |

**Nota:** SQ-14 (Add New Client) tiene SQ-69 relacionado pero sigue en "In Test".

---

## Orden de Prioridad para Fixes

### Prioridad 1 - Bloqueantes

1. **SQ-74** (Highest) - Logout crítico
   - **Problema:** Después de refrescar la página varias veces, el username cambia a "Usuario" y el logout no funciona
   - **Impacto:** Funcionalidad crítica de autenticación
   - **Desbloquea:** SQ-3 (User Login)

2. **SQ-71** (High) - Breadcrumb UX
   - **Problema:** Al editar un cliente, el breadcrumb muestra el UUID en lugar del nombre
   - **Impacto:** Información técnica expuesta al usuario
   - **Desbloquea:** SQ-16 (Edit Client Data)

### Prioridad 2 - No Bloqueantes

3. **SQ-69** (High) - Validación email duplicado
   - **Problema:** Se permite crear clientes con emails duplicados si difieren en mayúsculas/minúsculas
   - **Impacto:** Datos inconsistentes en la base de datos

4. **SQ-70** (Lowest) - Visual menor
   - **Problema:** Campos name/email se desalinean al mostrar mensaje de validación
   - **Impacto:** Visual, bajo impacto funcional

---

## Tracking de Fixes

### SQ-74 - Logout no funciona después de refresh

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Causa: getSession() retorna datos cacheados sin validar     |
| 2    | Completado | Fix: Cambiar getSession() por getUser() en auth-context     |
| 3    | Completado | PR [#41](https://github.com/upex-galaxy/upex-soloq/pull/41) |
| 4    | Pendiente  | Esperando review/merge                                      |

---

### SQ-71 - Breadcrumb muestra user_ID

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Causa: Layout solo usa pathname, no tiene acceso a datos    |
| 2    | Completado | Fix: BreadcrumbContext + DynamicBreadcrumb component        |
| 3    | Completado | PR [#41](https://github.com/upex-galaxy/upex-soloq/pull/41) |
| 4    | Pendiente  | Esperando review/merge                                      |

---

### SQ-69 - Email duplicado case-sensitive

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Causa: .eq() es case-sensitive en Supabase                  |
| 2    | Completado | Fix: Normalizar a lowercase + usar .ilike()                 |
| 3    | Completado | Migración SQL aplicada para normalizar emails existentes    |
| 4    | Completado | PR [#41](https://github.com/upex-galaxy/upex-soloq/pull/41) |
| 5    | Pendiente  | Esperando review/merge                                      |

---

### SQ-70 - Campos desalineados

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Causa: FormMessage retorna null cuando no hay error         |
| 2    | Completado | Fix: Siempre renderizar con min-height, usar invisible      |
| 3    | Completado | PR [#41](https://github.com/upex-galaxy/upex-soloq/pull/41) |
| 4    | Pendiente  | Esperando review/merge                                      |

---

## Tracking de Improvements

### SQ-73 - "Remember me" en Login

| Paso | Estado     | Notas                                                       |
| ---- | ---------- | ----------------------------------------------------------- |
| 1    | Completado | Revisado flujo de autenticación con Supabase SSR            |
| 2    | Completado | Checkbox "Recordarme" agregado al login form                |
| 3    | N/A        | Supabase SSR usa cookies persistentes por defecto           |
| 4    | Completado | PR [#42](https://github.com/upex-galaxy/upex-soloq/pull/42) |
| 5    | Pendiente  | Esperando review/merge                                      |

---

## Métricas

- **Total Defects activos:** 4
- **Defects bloqueantes:** 2 (SQ-74, SQ-71)
- **User Stories bloqueadas:** 2 (SQ-3, SQ-16)
- **PRs de Bugfix:** 1 ([#41](https://github.com/upex-galaxy/upex-soloq/pull/41))
- **Defects en PR:** 4 (SQ-74, SQ-71, SQ-69, SQ-70)
- **Defects resueltos:** 0 (pendiente merge)
- **Total Improvements:** 1 (SQ-73)
- **PRs de Improvements:** 1 ([#42](https://github.com/upex-galaxy/upex-soloq/pull/42))

---

## Referencias

- [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md) - Roadmap de features
- [Jira Board](https://upexgalaxy64.atlassian.net/browse/SQ) - Tablero del proyecto

---

_Actualizado por Claude Code - 2026-02-09 (implementados SQ-74, SQ-71, SQ-69, SQ-70 en PR #41; SQ-73 en PR #42)_
