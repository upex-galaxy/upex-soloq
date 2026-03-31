# Acceptance Test Plan: STORY-SQ-52 - Monthly Summary

**Fecha:** 2026-03-31
**QA Engineer:** AI-Generated
**Story Jira Key:** [SQ-52](https://upexgalaxy65.atlassian.net/browse/SQ-52)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) - Invoice Dashboard & Tracking
**Status:** Draft - Pending PO/Dev Review

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Disenador Organizado) - necesita ver tendencia de ingresos para planificar mes a mes.
- **Secondary:** Valentina (Desarrolladora Internacional) - quiere comparar meses para evaluar su negocio.

**Business Value:**

- Permite al freelancer evaluar su progreso financiero sin herramientas externas.
- Aumenta retencion y frecuencia de uso del dashboard (impacta MAU).

**Related User Journey:**

- Journey 2: Seguimiento y Cobro de Factura (resumen financiero mensual).

### Technical Context of This Story

**Frontend:**

- Monthly income card con total del mes.
- Breakdown: paid vs pending amounts.
- Trend indicator: porcentaje up/down vs mes anterior.
- Chart de barras/lineas de ultimos 6 meses.
- Formato monetario USD `$X,XXX.XX`.

**Backend:**

- `GET /api/invoices/dashboard` — campos de monthly summary (income, breakdown, trend, chart data).
- Agregacion por `paid_at` (mes actual) para income paid.
- Agregacion por `created_at` o `issue_date` para pending del mes.

**Database:**

- `invoices`: `total`, `status`, `paid_at`, `issue_date`, `created_at`.
- Queries de agregacion mensual con timezone del usuario.

**Integration Points:**

- Summary card UI <-> `GET /api/invoices/dashboard` (monthly data).
- Refresh tras pago: Payment flow -> monthly summary recalculo.
- Dependencia con SQ-49 (pending total) y SQ-50 (overdue) para consistencia.

### Story Complexity Analysis

**Overall Complexity:** High

- Business logic complexity: High — definicion de "ingreso mensual", breakdown paid/pending, comparacion MoM.
- Integration complexity: Medium — sincronizacion con payment flow.
- Data validation complexity: High — calculos de periodo, timezone, porcentajes.
- UI complexity: Medium — chart + cards + trend indicator.

**Estimated Test Effort:** High
**Rationale:** Multiples calculos dependientes de definiciones de negocio, timezone y periodos mensuales.

### Epic-Level Context (from EPIC-SQ-38 FTP)

**Critical Risks Inherited:**

- Risk: "Monthly income" no define inclusion exacta por status/fecha (FTP Ambiguity 3).
  - **Relevance:** Directa — esta story debe definir que cuenta como "ingreso mensual".
- Risk: Dashboard muestra montos errados.
  - **Relevance:** Monthly summary agrega multiples metricas con potencial de error.

**PO Decisions Already Confirmed (precedentes):**

- Timezone: Usar timezone del usuario para periodos mensuales.
- Formato monetario: USD `$X,XXX.XX`.
- Pending := sent + overdue (propuesto en SQ-49).

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Definicion de "total income this month".**

- **Location in Story:** AC 1 dice "total income this month".
- **Question for PO:** Incluye solo `paid_at` del mes actual, o tambien `sent` del mes como proyeccion?
- **PO/Dev Decision (proposed):** "Total income this month" = suma de facturas con `paid_at` en el mes actual (solo pagos confirmados). No incluye proyecciones de sent. Razon: "income" implica dinero recibido, no proyectado.

**Ambiguity 2: Breakdown paid vs pending — que periodo cubre "pending"?**

- **Location in Story:** AC 2 dice "paid amount and pending amount separately".
- **Question for PO:** Pending del mes = facturas emitidas este mes que estan sent, o todas las sent del usuario?
- **PO/Dev Decision (proposed):** Breakdown muestra: (1) Paid this month = facturas con `paid_at` en el mes, (2) Pending this month = facturas con `issue_date` en el mes que estan en status sent/overdue. Esto da una vista del mes corriente como unidad.

**Ambiguity 3: Comparacion month-over-month — base de calculo.**

- **Location in Story:** AC 3 dice "up/down percentage vs last month".
- **Question for PO:** La comparacion es de paid income (confirmed) o de total (paid + pending)?
- **PO/Dev Decision (proposed):** Comparacion basada en paid income (confirmed), ya que es la metrica mas confiable. Porcentaje: `((current_month_paid - last_month_paid) / last_month_paid) * 100`.

**Ambiguity 4: Chart de 6 meses — que dato grafica?**

- **Location in Story:** AC 4 dice "simple chart of recent months (last 6)".
- **Question for PO:** Grafica paid income, pending, o ambos?
- **PO/Dev Decision (proposed):** Chart grafica paid income por mes (barras). Simple y accionable. Pending se ve en el breakdown del mes actual.

### Missing Information / Gaps

**Gap 1: Comportamiento del chart con datos insuficientes.**

- **Suggested Addition:** Si hay menos de 6 meses de datos, mostrar solo los meses disponibles. Si hay 0 meses, mostrar chart vacio con mensaje "No data yet".
- **PO/Dev Decision (proposed):** Chart muestra solo meses con datos. 0 meses = "Start invoicing to see your income trend".

**Gap 2: Caso de division por cero en MoM comparison.**

- **Suggested Addition:** Si last_month_paid = 0 y current > 0, mostrar "+100%" o "New". Si ambos = 0, no mostrar indicador.
- **PO/Dev Decision (proposed):** last_month = 0 && current > 0 -> mostrar "New" badge. Ambos = 0 -> no mostrar trend indicator.

**Gap 3: Primer dia del mes — periodo exacto.**

- **Suggested Addition:** Mes = dia 1 00:00:00 al ultimo dia 23:59:59 en timezone del usuario.
- **PO/Dev Decision (proposed):** Si, mes calendario basado en timezone del usuario.

### Edge Cases NOT Covered in Original Story

**Edge Case 1: Pago registrado el ultimo dia del mes.**

- **Expected Behavior:** Se cuenta en el mes corriente.
- **Criticality:** High

**Edge Case 2: Primer mes del usuario (sin datos historicos).**

- **Expected Behavior:** Chart muestra 1 barra, MoM no muestra comparacion.
- **Criticality:** Medium

**Edge Case 3: Meses sin actividad en el medio de los 6.**

- **Expected Behavior:** Mes sin actividad muestra $0 en chart (no se salta).
- **Criticality:** Medium

### Testability Validation

**Is this story testable as written?** ⚠️ Partially

**Recommendations:** Cerrar definicion de "income" (paid_at only), periodo mensual y base de comparacion MoM.

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Monthly income card shows paid total

**Type:** Positive
**Priority:** Critical

- **Given:** usuario con 2 facturas pagadas en marzo 2026 (`paid_at` en marzo) por `$1,000` y `$500`.
- **When:** ve el dashboard en marzo 2026.
- **Then:** monthly income card muestra `$1,500.00`.

### Scenario 2: Breakdown shows paid vs pending separately

**Type:** Positive
**Priority:** Critical

- **Given:** en marzo 2026: 2 facturas paid ($1,500 total) y 1 factura sent emitida en marzo ($800).
- **When:** ve el breakdown.
- **Then:** muestra "Paid: $1,500.00" y "Pending: $800.00".

### Scenario 3: Month-over-month comparison

**Type:** Positive
**Priority:** High

- **Given:** Feb 2026 paid: $1,000. Mar 2026 paid: $1,500.
- **When:** ve el trend indicator en marzo.
- **Then:** muestra "+50%" con indicador de subida (arrow up, verde).

### Scenario 4: Chart of last 6 months

**Type:** Positive
**Priority:** High

- **Given:** usuario con datos de paid income de Oct 2025 a Mar 2026.
- **When:** ve el chart.
- **Then:** muestra 6 barras con montos correctos por mes.

### Scenario 5: Zero income month

**Type:** Boundary
**Priority:** High

- **Given:** en marzo 2026 no hay facturas pagadas.
- **When:** ve el monthly income.
- **Then:** muestra `$0.00` con breakdown "Paid: $0.00" y pending si hay.

### Scenario 6: First month — no comparison available

**Type:** Boundary
**Priority:** Medium

- **Given:** usuario nuevo, primer mes con 1 pago.
- **When:** ve el trend indicator.
- **Then:** muestra badge "New" (no porcentaje), chart muestra 1 barra.

### Scenario 7: Division by zero — last month = 0, current > 0

**Type:** Boundary
**Priority:** Medium

- **Given:** Feb paid = $0, Mar paid = $500.
- **When:** ve el trend indicator.
- **Then:** muestra "New" badge en vez de porcentaje infinito.

### Scenario 8: Chart with insufficient months

**Type:** Boundary
**Priority:** Medium

- **Given:** usuario con solo 3 meses de datos.
- **When:** ve el chart.
- **Then:** muestra 3 barras (no 6 vacias), con los meses disponibles.

### Scenario 9: Summary updates after receiving payment

**Type:** Integration
**Priority:** Critical

- **Given:** monthly income muestra `$1,000.00`.
- **When:** registra pago de `$500` en una factura.
- **Then:** al volver al dashboard, monthly income muestra `$1,500.00`.

### Scenario 10: RLS — monthly summary isolated per user

**Type:** Negative/Security
**Priority:** Critical

- **Given:** User A paid $1,000 en marzo; User B paid $5,000 en marzo.
- **When:** User A ve monthly income.
- **Then:** muestra `$1,000.00`, no $6,000.

### Scenario 11: Currency formatting

**Type:** Positive
**Priority:** High

- **Given:** monthly income = 12500.
- **When:** se muestra en card.
- **Then:** formateado como `$12,500.00`.

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 14

- Positive: 5
- Negative: 2
- Boundary: 4
- Integration: 2
- API: 1

**Rationale:** Alta complejidad por multiples calculos (income, breakdown, MoM, chart), cada uno con edge cases.

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Group 1: Month-over-month calculation**

| Last Month Paid | Current Month Paid | Expected Trend |
| --- | --- | --- |
| $1,000 | $1,500 | +50% (up) |
| $1,500 | $1,000 | -33% (down) |
| $1,000 | $1,000 | 0% (flat) |
| $0 | $500 | "New" badge |
| $0 | $0 | No indicator |

**Group 2: Chart data points**

| Months with data | Expected chart bars |
| --- | --- |
| 6 | 6 bars |
| 3 | 3 bars |
| 1 | 1 bar |
| 0 | Empty chart with message |

### Test Outlines

#### Validar calculo de monthly income basado en paid_at

- **Type:** Positive | **Priority:** Critical | **Level:** API + UI
- **Expected:** Monthly income = SUM(total) WHERE paid_at in current month.

#### Validar breakdown paid vs pending del mes

- **Type:** Positive | **Priority:** Critical | **Level:** API + UI
- **Expected:** Paid = facturas con paid_at en mes. Pending = facturas emitidas en mes con status sent/overdue.

#### Validar comparacion month-over-month con porcentaje correcto

- **Type:** Positive | **Priority:** High | **Level:** API + UI
- **Parametrized:** ✅ Yes (Group 1)
- **Expected:** Porcentaje y direccion correctos.

#### Validar chart de 6 meses con datos completos

- **Type:** Positive | **Priority:** High | **Level:** UI
- **Expected:** 6 barras con valores correctos.

#### Validar chart con meses insuficientes

- **Type:** Boundary | **Priority:** Medium | **Level:** UI
- **Parametrized:** ✅ Yes (Group 2)
- **Expected:** Solo barras para meses con datos.

#### Validar zero income month

- **Type:** Boundary | **Priority:** High | **Level:** UI
- **Expected:** `$0.00` con breakdown y trend correcto.

#### Validar primer mes sin comparacion disponible

- **Type:** Boundary | **Priority:** Medium | **Level:** UI
- **Expected:** "New" badge, sin porcentaje.

#### Validar division por cero en MoM

- **Type:** Boundary | **Priority:** Medium | **Level:** API
- **Expected:** "New" badge cuando last month = 0 y current > 0.

#### Validar actualizacion de summary tras pago

- **Type:** Integration | **Priority:** Critical | **Level:** E2E
- **Expected:** Monthly income y breakdown se actualizan correctamente.

#### Validar refresh de chart tras pago

- **Type:** Integration | **Priority:** High | **Level:** E2E
- **Expected:** Barra del mes actual se actualiza con nuevo monto.

#### Validar aislamiento RLS del monthly summary

- **Type:** Negative/Security | **Priority:** Critical | **Level:** API
- **Expected:** Cada usuario ve solo sus propios montos.

#### Validar formato monetario en cards y chart

- **Type:** Positive | **Priority:** High | **Level:** UI
- **Expected:** `$X,XXX.XX` consistente.

#### Validar API de dashboard retorna campos de monthly summary

- **Type:** API Contract | **Priority:** High | **Level:** API
- **Expected:** Response incluye `monthly_income`, `monthly_paid`, `monthly_pending`, `trend_percentage`, `chart_data`.

#### Validar acceso no autenticado rechazado

- **Type:** Negative | **Priority:** Critical | **Level:** API
- **Expected:** 401 Unauthorized sin data leak.

---

## Integration Test Cases

### Integration 1: Payment flow -> monthly summary refresh

- **Integration Point:** Payment API -> Dashboard monthly data.
- **Expected:** Tras pago, monthly income y chart se actualizan inmediatamente.

### Integration 2: Monthly summary consistency with pending total (SQ-49)

- **Integration Point:** Monthly pending <-> pending total card.
- **Expected:** Monthly pending es subset del pending total global (facturas del mes actual solamente).

---

## Edge Cases Summary

| Edge Case | Covered in Story | Added Here | Priority |
| --- | --- | --- | --- |
| "Income" = paid_at only | Ambiguous | ✅ Yes (Scenario 1) | Critical |
| Division by zero MoM | ❌ No | ✅ Yes (Scenario 7) | Medium |
| First month no comparison | ❌ No | ✅ Yes (Scenario 6) | Medium |
| Chart with < 6 months | ❌ No | ✅ Yes (Scenario 8) | Medium |
| Zero income month | ❌ No | ✅ Yes (Scenario 5) | High |
| RLS isolation | ❌ No | ✅ Yes (Scenario 10) | Critical |
| Payment at end of month | ❌ No | Noted | High |

---

## Critical Questions for PO/Dev

1. **"Income this month" = paid_at only?** Proposed: Si, solo pagos confirmados.
2. **Breakdown pending = emitidas este mes con status sent/overdue?** Proposed: Si.
3. **MoM comparison base = paid income?** Proposed: Si.
4. **Chart grafica paid income por mes?** Proposed: Si, barras simples.
5. **Chart con < 6 meses?** Proposed: Mostrar solo meses con datos.
6. **MoM cuando last month = 0?** Proposed: "New" badge.

---

## Next Steps

1. PO/Dev validan definiciones de income, breakdown y MoM.
2. Dev implementa con reglas de periodo y timezone.
3. QA ejecuta test cases con enfasis en calculos y boundaries.

---

_Archivo generado para Fase 5 (Shift-Left Testing)._
_Last sync mirror: 2026-03-31_
