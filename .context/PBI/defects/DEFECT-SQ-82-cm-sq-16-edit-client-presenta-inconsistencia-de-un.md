# DEFECT: CM | SQ-16 edit client presenta inconsistencia de unicidad email (case-insensitive) y validaciones DB parciales

**Jira Key:** [SQ-82](https://upexgalaxy65.atlassian.net/browse/SQ-82)
**Priority:** High
**Status:** Ready For QA
**Components:** None
**Severity:** Mayor
**Error Type:** Integration
**Test Environment:** Staging
**Fix Type:** Bugfix

---

## Description

Contexto:
Defecto consolidado detectado en exploratory testing de DB para la US [https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16) (Edit Client Data), alineado con test cases y comentarios de ejecución UI.

Story afectada:

- [https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16](https://upexgalaxy65.atlassian.net/browse/SQ-16#icft=SQ-16) - Edit Client Data

Hallazgos incluidos (consolidados):

1) Unicidad de email por usuario es case-sensitive en DB

- Se permite coexistencia de emails equivalentes por case para el mismo user_id (ej: email@x.com vs EMAIL@X.COM).
- Se detectaron grupos duplicados al normalizar con lower(email).

2) Validaciones DB no cubren completamente reglas esperadas de negocio

- DB permite email inválido si se salta API/UI.
- DB permite name vacío ('') aunque NOT NULL esté presente.
- DB permite address > 500 y notes > 1000.

3) Verificaciones que sí funcionan (referencia de alcance)

- Trigger updated_at en clients funciona.
- Duplicado exacto (mismo case) user_id+email sí falla por UNIQUE.
- Límites de name (100), phone (20), email (255) sí se aplican.

Resultado esperado:

- No debe permitirse duplicado case-insensitive de email para el mismo user_id.
- Validaciones críticas deben quedar protegidas en DB o claramente acotadas a API/UI con contrato consistente.

Resultado actual:

- Duplicado case-insensitive permitido.
- DB permite ciertos valores inválidos fuera de API/UI.

Impacto:

- Riesgo de duplicidad funcional de clientes para un mismo usuario.
- Riesgo de inconsistencias de datos cuando haya inserciones/updates fuera del flujo UI/API principal.

Repro Steps (consolidado):

1. Tomar dos clientes activos del mismo user_id.
2. Intentar actualizar el email del cliente B con el email del cliente A en distinto casing.
3. Observar que la actualización se permite.
4. Validar grupos duplicados por user_id + lower(email).

Evidencia clave:

- Se identificaron duplicados por user_id al normalizar lower(email).
- Prueba transaccional confirmó coexistencia de emails equivalentes por case para mismo user_id.

---

## 🐞 Actual Result

Se permite duplicado de email para el mismo user_id cuando solo cambia el casing (case-sensitive uniqueness). Además, DB permite email inválido, name vacío y longitudes > esperado en address/notes si se omite capa API/UI.

---

## ✅ Expected Result

Debe bloquearse duplicado case-insensitive por user_id (ej. unique sobre lower(email)). Debe existir alineación de validaciones entre DB y API/UI para evitar persistencia de datos inválidos.

---

## 🔍 Root Cause

**Category:** Integration Error

---

## Metadata

- **Created:** 2/11/2026
- **Updated:** 2/17/2026
- **Reporter:** Joel Armando Ramírez Rodríguez
- **Assignee:** Joel Armando Ramírez Rodríguez
- **Labels:** client-management, db-testing, exploratory-testing, sq-16, staging

---

_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T21:26:24.164Z_
