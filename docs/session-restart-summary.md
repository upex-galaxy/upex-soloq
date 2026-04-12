# Session Restart Summary

## Reinicio rapido (2026-04-12)

### Estado operativo actual

- Story activa: `SQ-51` en Jira sigue en `In Test`.
- Trifuerza Fase 10 para `SQ-51` quedo ejecutada en esta sesion:
  - UI exploratory: **PASSED** (Playwright script)
  - API exploratory: **PASSED** (manual colaborativo DevTools + Postman)
  - DB exploratory: **PASSED** (queries SQL read-only con credenciales de `dbhub.toml`)
- Hallazgo funcional vigente: `SQ-169` (**Defect**) por copy/estado no-results vs empty-state en UI.
- `SQ-169` ya fue normalizado segun `bug-report.md` (tipo Defect + campos QA).

### Evidencia generada en la sesion

- UI exploratory notes:
  - `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/stories/STORY-SQ-51-search-invoices/exploratory-ui-session-notes-2026-04-12.md`
- API exploratory notes:
  - `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/stories/STORY-SQ-51-search-invoices/exploratory-api-session-notes-2026-04-12.md`
- DB exploratory notes:
  - `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/stories/STORY-SQ-51-search-invoices/exploratory-db-session-notes-2026-04-12.md`
- Screenshot UI evidence:
  - `qa/artifacts/sq51-ui-exploratory-2026-04-12.png`

### Hallazgos tecnicos de tooling

- MCP profile activo debe usar alias `sql` (no `dbhub`) al invocar `bun ai`.
  - Comando valido: `bun ai playwright,postman,openapi,sql,atlassian,tavily`
- Se identifico conflicto de Atlassian MCP al comentar (`public` + `visibility`).
  - Fallback aplicado/documentado: usar `jira_update_issue` con `update.comment.add` (ver tabla de troubleshooting en `.prompts/fase-10-exploratory-testing/bug-report.md`).

### Cambios locales de soporte creados

- `qa/scripts/sq51-ui-exploratory.mjs` (ejecucion UI exploratory automatizada en staging)
- `scripts/db-query.ts` (ejecucion de queries SQL read-only para validacion DB)
- `scripts/dbhub-mcp-call.cjs` (helper MCP local; no esencial para continuar)

### Proximo paso recomendado al retomar

1. Mantener `SQ-51` en `In Test` hasta fix de `SQ-169`.
2. Ejecutar retest UI de Scenario 5 (no-results vs empty-state) tras fix.
3. Si retest pasa, preparar transicion de story a `QA Approved`.

## Reinicio rapido (2026-04-11)

### Estado operativo actual

- `SQ-55` ya tiene evidencia consolidada en contexto local y Jira.
- Story `SQ-55` en Jira: `BLOCKED` (flujo de defectos activo).
- Defectos asociados a `SQ-55`:
  - `SQ-173` (A11y label/for mismatch) -> **Defect**
  - `SQ-174` (data consistency: `paid_at` null y falta evento `paid`) -> **Defect**
- Se cerro PR incorrecto `#118` (no merge), y se elimino su rama local/remota.
- Se creo PR correcto de evidencia para SQ-55 (solo artefactos de historia):
  - PR `#119` -> `test/SQ-55/exploratory-evidence` -> `staging` (**OPEN**, pendiente de aprobacion)

### Ramas/worktrees vigentes

- Worktree principal: `C:/upex-soloq` en `chore/SQ-51/qa-stage2-workflow` (se mantiene para continuar con SQ-51).
- Worktree de PR activo: `C:/upex-soloq-sq55-evidence` en `test/SQ-55/exploratory-evidence` (mantener hasta merge/cierre del PR #119).
- Worktree `qa/sq55-exploratory` fue cerrado y removido.
- Backup local generado antes de cierre de worktree:
  - `C:/upex-soloq-backups/openapi-sq55-exploratory-2026-04-11.json`

### Higiene de ramas ya aplicada

- Ramas mergeadas eliminadas (local + remoto):
  - `chore/block-c-context`
  - `chore/local-sync-pr85-86-87`
  - `chore/qa-config-sync`
  - `chore/sq51-sq55-story-clean`

### Estado funcional de SQ-51 (proxima historia activa)

- Story `SQ-51` en Jira: `In Test`.
- Smoke y exploratory UI ejecutados (partial pass).
- Hallazgo principal sigue abierto:
  - `SQ-169` (no-results vs empty-state copy) -> **OPEN**.

### Proximo paso recomendado al retomar

1. Continuar Fase 10 para `SQ-51` en orden (`smoke -> exploratory UI -> exploratory API -> exploratory DB -> bug-report`).
2. Ejecutar API exploratory en modo colaborativo manual (usuario provee resultados) y consolidar evidencia.
3. Revisar `SQ-169` tras retest para decidir: mantener, enriquecer detalle, traducir copy, y/o reclasificar tipo si aplica al flujo actual.

## Estado actual

- Se completo Fase 5 (Shift-Left) a nivel de artefactos para `SQ-51` y `SQ-55`.
- Se creo mirror local del FTP de `SQ-39` desde comentario reciente de Jira:
  - `.context/PBI/epics/EPIC-SQ-39-payment-tracking/feature-test-plan.md`
- Se crearon ATPs locales:
  - `.context/PBI/epics/EPIC-SQ-38-dashboard-tracking/stories/STORY-SQ-51-search-invoices/acceptance-test-plan.md`
  - `.context/PBI/epics/EPIC-SQ-39-payment-tracking/stories/STORY-SQ-55-payment-amount/acceptance-test-plan.md`
- En Jira (`SQ-51` y `SQ-55`) se agregaron:
  - comentario con ATP completo (mirror local),
  - comentario con propuesta de defaults para preguntas abiertas,
  - labels: `shift-left-reviewed`, `test-plan-ready`.
- El sync local confirma labels en story metadata:
  - `STORY-SQ-51-search-invoices/story.md` (labels presentes)
  - `STORY-SQ-55-payment-amount/story.md` (labels presentes)
- Se corrigieron referencias legacy de prompt:
  - `story-test-cases.md` -> `acceptance-test-plan.md` en docs internos detectados.

## Variables/decisiones pendientes

- Bloqueante funcional: faltan respuestas PO/Dev en Jira para cerrar ambiguedades y pasar ATP de Draft a Approved.
- `SQ-51` pendientes de confirmacion:
  - trigger de busqueda (live debounced vs submit),
  - precedencia con filtros/paginacion,
  - normalizacion de query (`trim`),
  - comportamiento final no-results vs empty-state.
- `SQ-55` pendientes de confirmacion:
  - warning parcial/sobrepago (informativo vs bloqueante),
  - regla oficial de decimales/rounding,
  - normalizacion de inputs (`0`, `0.00`, `01000`, espacios),
  - regla de prefill y formato monetario final (locale/currency).

## Verificacion al reiniciar

- Abrir OpenCode y revisar `/mcp`.
- Confirmar MCPs esperados conectados (`openapi`, `sql`, `tavily`, `atlassian`).
- Si falla Jira sync por variables:
  - usar `JIRA_USERNAME` + `JIRA_API_TOKEN`,
  - mapear aliases si script exige `ATLASSIAN_EMAIL`/`ATLASSIAN_API_TOKEN`.
- Verificar que stories mantengan labels tras sync:
  - `shift-left-reviewed`, `test-plan-ready` en `SQ-51` y `SQ-55`.
- Si se actualizan comentarios en Jira, correr:
  - `bun jira-sync pull --story SQ-51 --include-comments`
  - `bun jira-sync pull --story SQ-55 --include-comments`
- Resultado de verificacion en este reinicio (2026-04-02):
  - Local OK: existen ATPs y labels en `SQ-51`/`SQ-55`.
  - Jira sync OK usando `ATLASSIAN_URL=https://upexgalaxy65.atlassian.net` (alias compatible con `JIRA_URL`).
  - Pull con comentarios ejecutado para `SQ-51` y `SQ-55`.

## Cambios recientes

- Sync de `SQ-39` con comentarios incluido; se genero `comments.md` de epic.
- Publicacion de ATPs de `SQ-51` y `SQ-55` en Jira.
- Publicacion de comentarios de "proposed defaults" para destrabar decisiones PO/Dev.
- Creacion de `feature-test-plan.md` local para `EPIC-SQ-39`.
- Limpieza de nomenclatura en documentacion interna hacia `acceptance-test-plan.md`.
- Sync 2026-04-02 confirma transicion de estado en Jira:
  - `SQ-51` -> `Ready For QA`
  - `SQ-55` -> `Ready For QA`
- Se detecta ruido de formato en `comments.md` de `SQ-55` tras pull (`@@Ely` embebido en una linea).
- Se configuro automatizacion de Jira Sync con PR automatico a `staging`:
  - Workflow: `.github/workflows/jira-sync-smart.yml`
  - Modos: `repository_dispatch` (event-driven), `workflow_dispatch`, `schedule` (cada 6h)
  - Documentacion: `docs/jira-sync-automation.md`
- Exploratory manual en staging (`https://staging-upexsoloq.vercel.app/`) detecta bloqueo de `SQ-55`:
  - no se logra ruta alcanzable `draft -> sent` en el flujo observado,
  - sin `sent/overdue` no aparece accion de pago (precondicion no cumplida).
- Comentarios Jira publicados:
  - `SQ-90` (fail smoke create->search): comment id `53286`
  - `SQ-12` (solo un metodo preferido): comment id `53287`
  - `SQ-55` (blocked por precondicion en staging): comment id `53289`
  - `SQ-55` (hallazgos manuales detallados de validacion de monto): comment id `53292`
  - `SQ-39` (impacto epic-level): comment id `53290`
  - `SQ-51` (stream QA activo no bloqueado): comment id `53291`
  - `SQ-51` (resultado smoke + finding no-results vs empty-state): comment id `53293`
  - `SQ-51` (resultado exploratorio parcial + bug candidate): comment id `53294`
  - `SQ-51` (reconciliacion reporte manual vs MCP): comment id `53295`
  - `SQ-51` (referencia de bug creado `SQ-169`): comment id `53296`
  - `SQ-51` (transicion de estado a `In Test`): comment id `53297`
  - `SQ-55` (transicion de estado a `BLOCKED`): comment id `53298`
- Se creo worktree limpio para QA desde `origin/staging`:
  - `C:/upex-soloq-qa` en branch `qa/sq55-exploratory`
- Se promovio `SQ-51` como stream activo no bloqueado:
  - smoke checklist: `STORY-SQ-51-search-invoices/smoke-test.md`
  - decision matrix: `STORY-SQ-51-search-invoices/exploratory-decision-matrix.md`
  - tablero de ejecucion: `docs/qa-live-execution-board.md`
- Smoke manual ejecutado con MCP en staging:
  - `SQ-51`: PASSED (go/no-go), con hallazgo funcional en no-results vs empty-state.
  - `SQ-55`: sigue BLOCKED por precondicion (`sent/overdue` no alcanzable para QA user).
- Exploratory SQ-51 ejecutado con MCP:
  - PASS en trigger de busqueda, precedencia filtro/paginacion y normalizacion de query.
  - BUG candidate en separacion de no-results vs empty-state (`0 resultados` + heading de cuenta vacia).
  - Bug Jira creado y vinculado: `SQ-169` (Relates -> `SQ-51`).
- Workflow Jira verificado via API y aplicado:
  - `SQ-51`: `Ready For QA` -> `In Test`
  - `SQ-55`: `Ready For QA` -> `In Test` -> `BLOCKED`
  - Desde `In Test` se confirmaron transiciones disponibles: `QA Approved`, `Ready For QA`, `BLOCKED`.
- `SQ-47` actualizado para ejecucion activa de QA:
  - transicion a `In Test` aplicada,
  - smoke en staging: **PASSED**,
  - exploratorio: parcial automatizable; empty-state pendiente por data setup (usuario sin facturas),
  - comentario Jira: `53300`.
- Estandar permanente de PR agregado al repo:
  - Template: `.github/pull_request_template.md`
  - Guardrails CI: `.github/workflows/pr-guardrails.yml`
  - Helper transiciones Jira: `scripts/jira-transition.ts` + script `bun jira-transition`
  - Guia de estados/automatizacion: `docs/jira-story-workflow-automation.md`
- Deuda tecnica registrada: limpieza de ramas/worktrees diferida hasta cierre del hilo QA actual.

## Regla de mantenimiento

- Este archivo guarda el estado vigente de la sesion actual.
- Actualizarlo en cada cierre/reinicio de sesion.
- No asumir memoria permanente entre sesiones.

## Reinicio rapido (2026-04-03)

- Se hizo doble chequeo de historias asignadas `SQ-47..SQ-58` y contraste contra imagen de referencia (baseline anterior en `Ready For QA`).
- Se sincronizo Jira en vivo para `SQ-38` y `SQ-39` con comentarios:
  - `bun jira-sync pull --epic SQ-38 --include-comments`
  - `bun jira-sync pull --epic SQ-39 --include-comments`
- Estado actual clave en Jira:
  - `SQ-47`, `SQ-48`, `SQ-49`, `SQ-51` -> `In Test`
  - `SQ-55` -> `BLOCKED` (assignee actual: `Ely`)
  - `SQ-50`, `SQ-52`, `SQ-53`, `SQ-54`, `SQ-56`, `SQ-57`, `SQ-58` -> `Ready For QA`
- Artefactos de testing completados hoy:
  - `STORY-SQ-49-pending-total/smoke-test.md`
  - `STORY-SQ-49-pending-total/exploratory-decision-matrix.md`
  - `STORY-SQ-50-overdue-highlight/smoke-test.md`
  - `STORY-SQ-50-overdue-highlight/exploratory-decision-matrix.md`
  - `STORY-SQ-52-monthly-summary/smoke-test.md`
  - `STORY-SQ-52-monthly-summary/exploratory-decision-matrix.md`
- Tablero y auditoria actualizados:
  - `docs/qa-live-execution-board.md`
  - `docs/qa-assigned-stories-audit-2026-04-03.md`
- Cumplimiento Fase 10:
  - Ejecutado: `smoke-test.md`, `exploratory-test.md` (UI), `bug-report.md` (cuando aplica, ej. `SQ-169`).
  - API exploratory: se ejecuto version ligera por observacion de red en `docs/fase-10-exploratory-api-light.md`.
  - DB exploratory: pendiente por falta de acceso DBHub en esta sesion (`docs/fase-10-exploratory-db-status.md`).

## Proximo paso recomendado al retomar

1. Completar Trifuerza para `SQ-47..SQ-52`: API formal (Postman/OpenAPI) + DB (DBHub).
2. Sembrar dataset de QA (`sent/paid/overdue`, historial 6 meses) para cerrar ACs bloqueados de `SQ-50`, `SQ-52` y destrabar `SQ-53..SQ-58`.
3. Con datos listos, rerun smoke+exploratory de pagos y decidir transiciones (`In Test` / `QA Approved` / `BLOCKED`) por story.

## Ultima actualizacion

- 2026-04-12
