# Bug Triage Workflow

> AI-guided bug fixing with Jira management and educational feedback for testers.

---

## Purpose

Systematic workflow for triaging, fixing, and documenting bugs reported in Jira. This prompt helps the AI:

1. **Analyze** the bug report thoroughly (all custom fields, comments, links)
2. **Reproduce** the bug using Playwright MCP
3. **Triage** to determine if it's a real bug, enhancement, or duplicate
4. **Fix** the bug with minimal, targeted changes
5. **Document** the fix in Jira with technical details
6. **Educate** the tester with constructive feedback

**Prerequisites:**

- Access to Atlassian MCP tools (`mcp__atlassian__*`)
- Access to Playwright MCP tools for UI testing
- Access to Supabase MCP for database verification
- Git access to staging branch

**Reference:** `.prompts/fase-10-exploratory-testing/bug-report.md` contains the template testers use for reporting bugs, including custom field IDs.

---

## Workflow General para Cada Bug

### 1. OBTENER CONTEXTO DEL BUG

```
└─ Leer issue de Jira (TODOS los custom fields, no solo description)
└─ Leer TODOS los comentarios
└─ Verificar si hay bugs duplicados
└─ Identificar issues relacionadas (links)
└─ Verificar que esté linkeado a la User Story correspondiente
```

**Tool:** `mcp__atlassian__jira_get_issue` con `fields: "*all"` y `expand: "changelog"`

### 2. REPRODUCIR EL BUG

```
└─ Seguir steps to reproduce exactos
└─ Documentar resultado de reproducción
└─ Capturar evidencia si es necesario
```

**Tools:** `playwright-cli`, Supabase MCP para verificar datos

### 3. TRIAGE

```
└─ ¿Es realmente un bug o una mejora?
└─ ¿Está alineado con los AC de la User Story relacionada?
└─ Determinar estado destino:
   - Bug real → In Progress → Fix → Ready for QA
   - Duplicado → Duplicated
   - Mejora → Enhancement (notificar al usuario)
   - No es bug → Deferred/Rejected
   - No se reproduce → CNR (Cannot Reproduce)
```

### 4. TRANSITAR A IN PROGRESS (si es bug real)

```
└─ Usar mcp__atlassian__jira_transition_issue
└─ Transition ID típicos:
   - 121: "start fixing" (OPEN → In Progress)
   - 5: "Hard pushed" (In Progress → Ready For QA)
   - 141: "is not a Bug" (OPEN → Enhancement)
   - 71: "is duplicated" (OPEN → Duplicated)
   - 8: "is CNR" (OPEN → Cannot Reproduce)
```

### 5. IMPLEMENTAR FIX

```
└─ Identificar causa raíz
└─ Aplicar cambios mínimos necesarios
└─ Seguir buenas prácticas (no romper funcionalidad existente)
└─ NO over-engineer - solo arreglar el bug reportado
```

### 6. VERIFICAR FIX

```
└─ Correr typecheck: bun run typecheck
└─ Correr lint: bun run lint
└─ Correr build: bun run build
└─ Re-test con playwright-cli
```

### 7. COMMIT Y PUSH

```
└─ Commit con issue key: "fix(SQ-XX): descripción breve"
└─ Push directo a staging
└─ Formato de commit:
   fix(SQ-XX): brief description of the fix

   Root cause explanation if needed.

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
```

### 8. TRANSITAR A READY FOR QA

```
└─ Usar mcp__atlassian__jira_transition_issue
└─ Asignar al tester original (si se identifica en changelogs)
```

### 9. DOCUMENTAR EN JIRA

Agregar comentario explicando:

```markdown
## Fix Aplicado

**Commit:** `[hash]` - fix(SQ-XX): descripción
**Branch:** staging (push directo)
**Archivo(s) modificado(s):** `path/to/file.ts`

---

### Causa Raíz Identificada

[Explicación técnica del problema]

---

### Cómo Verificar el Fix

1. [Step 1]
2. [Step 2]
3. [Verificar que...]

---

@[Tester Name] - Listo para re-test.
```

### 10. FEEDBACK EDUCACIONAL AL TESTER

Evaluar calidad del bug report vs mejores prácticas:

```
└─ Verificar custom fields requeridos:
   - customfield_10109 (🐞 Actual Result)
   - customfield_10110 (✅ Expected Result)
   - customfield_10112 (Error Type)
   - customfield_10116 (SEVERITY)
   - customfield_12210 (Test Environment)
   - customfield_10701 (Root Cause🐞)
└─ Verificar link a User Story relacionada
└─ Agregar comentario con feedback constructivo
```

---

## Feedback Educacional - Template

Después de cada fix, agregar un comentario separado con feedback para el tester:

```markdown
## 📚 Feedback sobre el Bug Report

### ✅ Lo que estuvo bien
- [Aspectos positivos del reporte]

### 🔧 Oportunidades de mejora

**Custom Fields:**

| Campo | Estado | Comentario |
|-------|--------|------------|
| 🐞 Actual Result | ✅/⚠️/❌ | [Comentario] |
| ✅ Expected Result | ✅/⚠️/❌ | [Comentario] |
| Error Type | ✅/⚠️/❌ | [Comentario] |
| SEVERITY | ✅/⚠️/❌ | [Comentario] |
| Test Environment | ✅/⚠️/❌ | [Comentario] |
| Root Cause🐞 | ✅/⚠️/❌ | [Comentario] |

**Estructura del Reporte:**
- [ ] Steps to reproduce claros y numerados
- [ ] Evidencia adjunta (screenshot/video)
- [ ] Link a User Story relacionada
- [ ] Título sigue nomenclatura: `<EPICNAME>: <COMPONENT>: <ISSUE_SUMMARY>`

**Nota sobre Issue Type:**
[Si aplica, explicar diferencia entre Bug vs Defect]
- **Defect:** Error encontrado durante testing de una US que aún no ha sido aprobada
- **Bug:** Error en funcionalidad ya desplegada/aprobada en producción

### 💡 Tips para futuros reportes
- [Sugerencias específicas]

---

*Referencia: `.prompts/fase-10-exploratory-testing/bug-report.md`*
```

---

## Reporte Final de Sesión - Template

Al finalizar la sesión de bug triage, generar un reporte con este formato:

```markdown
# Reporte Final de Sesión - Bug Triage [ISSUE_KEYS]

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Bugs analizados | [N] |
| Bugs arreglados | [N] |
| Bugs rechazados | [N] |
| Commits | [N] |
| Testers notificados | [Names] |

---

## Bugs Procesados

### [SQ-XX] - [Summary] [✅/❌]

| Aspecto | Detalle |
|---------|---------|
| Issue Key | [SQ-XX] |
| Reporter | [Name] |
| Estado Inicial | [OPEN/etc] |
| Estado Final | [Ready For QA/Enhancement/etc] |
| Root Cause | [Code Error/Enhancement/CNR/etc] |
| Commit | `[hash]` (si aplica) |
| URL | https://upexgalaxy65.atlassian.net/browse/[SQ-XX] |

**Análisis/Causa raíz:**
[Breve explicación]

---

## Feedback Educacional Entregado

Puntos clave comunicados:
1. [Punto 1]
2. [Punto 2]
3. [Punto 3]

---

## Cambios en Código (si aplica)

| Archivo | Cambio |
|---------|--------|
| `path/to/file.ts` | [Descripción breve] |

---
```

---

## Lista de Bugs - Template

Si se realizó seguimiento con JQL, incluir la lista actualizada:

```markdown
## Lista de Bugs Actualizada

| # | Key | Summary | Priority | Status |
|---|-----|---------|----------|--------|
| 1 | SQ-XX | [Summary] | Highest/High/Medium/Low | ✅ Ready For QA / ❌ Rejected / OPEN |
| ... | ... | ... | ... | ... |

---

## Próximos Bugs a Atender

| # | Key | Summary | Priority |
|---|-----|---------|----------|
| 1 | SQ-XX | [Summary] | [Priority] |
| ... | ... | ... | ... |
```

**JQL para obtener bugs pendientes:**

```
project = SQ AND issuetype in (Bug, Defect) AND status = OPEN ORDER BY priority DESC, created ASC
```

---

## Session Continuation Template

Para continuar una sesión anterior, pegar este bloque con los datos actualizados:

```markdown
-----
Resumen del progreso anterior (puedes usar como referencia del reporte final de la sesión):

[PEGAR AQUÍ EL REPORTE FINAL DE LA SESIÓN ANTERIOR]

-----
Próximos bugs a atender:

| # | Key | Summary | Priority |
|---|-----|---------|----------|
| 1 | SQ-XX | [Summary] | [Priority] |
| ... | ... | ... | ... |
```

---

## Quick Reference

### Jira Transitions (típicos para Bugs/Defects)

| ID | Transition | From → To |
|----|------------|-----------|
| 121 | start fixing | OPEN → In Progress |
| 5 | Hard pushed | In Progress → Ready For QA |
| 141 | is not a Bug | OPEN → Enhancement |
| 71 | is duplicated | OPEN → Duplicated |
| 8 | is CNR | OPEN → Cannot Reproduce |
| 111 | is WAD | OPEN → Working As Designed |
| 51 | defer | OPEN → Deferred |

### Custom Fields (UPEX Galaxy Workspace)

| Field ID | Name | Type |
|----------|------|------|
| customfield_10109 | 🐞 Actual Result | Textarea |
| customfield_10110 | ✅ Expected Result | Textarea |
| customfield_10112 | Error Type | Dropdown |
| customfield_10116 | SEVERITY | Dropdown |
| customfield_12210 | Test Environment | Dropdown |
| customfield_10701 | Root Cause🐞 | Dropdown |
| customfield_10049 | Root Cause Text | Textarea |

### Git Commit Format

```
fix(SQ-XX): brief description

[Optional: longer explanation]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Output

Al finalizar cada bug:

- Issue transicionado al estado correcto en Jira
- Comentario técnico con detalles del fix (si aplica)
- Comentario educacional para el tester
- Commit y push a staging (si se arregló)
- Reporte de progreso actualizado
