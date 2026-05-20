# Session Restart Summary

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

## Cambios recientes

- Sync de `SQ-39` con comentarios incluido; se genero `comments.md` de epic.
- Publicacion de ATPs de `SQ-51` y `SQ-55` en Jira.
- Publicacion de comentarios de "proposed defaults" para destrabar decisiones PO/Dev.
- Creacion de `feature-test-plan.md` local para `EPIC-SQ-39`.
- Limpieza de nomenclatura en documentacion interna hacia `acceptance-test-plan.md`.

## Regla de mantenimiento

- Este archivo guarda el estado vigente de la sesion actual.
- Actualizarlo en cada cierre/reinicio de sesion.
- No asumir memoria permanente entre sesiones.

## Ultima actualizacion

- 2026-03-29
