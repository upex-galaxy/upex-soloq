# Acceptance Test Plan: STORY-SQ-49 - Pending Total

**Fecha:** 2026-03-31
**QA Engineer:** AI-Generated
**Story Jira Key:** [SQ-49](https://upexgalaxy65.atlassian.net/browse/SQ-49)
**Epic:** [SQ-38](https://upexgalaxy65.atlassian.net/browse/SQ-38) - Invoice Dashboard & Tracking
**Status:** Draft - Pending PO/Dev Review

---

## Paso 1: Critical Analysis

### Business Context of This Story

**User Persona Affected:**

- **Primary:** Carlos (Disenador Organizado) - necesita ver de un vistazo cuanto le deben para priorizar seguimiento entre 5-8 clientes.
- **Secondary:** Valentina (Desarrolladora Internacional) - depende de monto pendiente para mejorar cash flow y planificar cobros.

**Business Value:**

- Reduce tiempo de analisis financiero: el freelancer ve su situacion en segundos.
- Aumenta frecuencia de uso del dashboard (impacta MAU) al ofrecer informacion accionable.

**Related User Journey:**

- Journey 2: Seguimiento y Cobro de Factura (paso de identificacion de montos pendientes).
- Journey 1 (parcial): Dashboard tras primera factura enviada para validar primer valor.

### Technical Context of This Story

**Frontend:**

- Summary card en dashboard mostrando pending total.
- Formato monetario USD `$X,XXX.XX`.
- Zero state con mensaje positivo.
- Refresh automatico al navegar de vuelta al dashboard.

**Backend:**

- `GET /api/invoices/dashboard` — campo de pending total (suma de `invoices.total` WHERE `status = 'sent'`).
- RLS por `user_id`.

**Database:**

- Agregacion: `SELECT SUM(total) FROM invoices WHERE user_id = $1 AND status = 'sent'`.
- Tabla `invoices` (columnas: `total`, `status`, `user_id`).

**Integration Points:**

- Summary card UI <-> `GET /api/invoices/dashboard`.
- Refresh tras pago: Payment flow -> dashboard recalculo.

### Story Complexity Analysis

**Overall Complexity:** Medium

- Business logic complexity: Low — suma directa de montos.
- Integration complexity: Medium — sincronizacion con payment flow y dashboard API.
- Data validation complexity: Low — formato monetario y zero state.
- UI complexity: Low — una card con un numero formateado.

**Estimated Test Effort:** Medium
**Rationale:** La logica es simple pero la integracion con pagos y el refresh requieren validacion cross-story.

### Epic-Level Context (from EPIC-SQ-38 FTP)

**Critical Risks Inherited:**

- Risk: Dashboard muestra montos errados y afecta decisiones de cobranza.
  - **Relevance to This Story:** Directa — el pending total ES el monto principal de decision.
- Risk: Inconsistencia entre `/invoices/dashboard` y `/invoices`.
  - **Relevance to This Story:** La tarjeta pending debe coincidir con la suma del listado filtrado por `sent`.

**Integration Points from Epic:**

- Frontend summary cards <-> `GET /api/invoices/dashboard`: **Applies:** ✅ Yes — esta story consume este endpoint.
- Dashboard <-> Payment flow refresh: **Applies:** ✅ Yes — el total debe actualizarse tras marcar pago.

**PO Decisions Already Confirmed (precedentes):**

- Formato monetario: USD `$X,XXX.XX` consistente en toda la app.
- Pending := `sent` unpaid (mapping documentado en FTP Improvement 1).
- Paginacion: 20 items por pagina, paginacion tradicional.

**Test Strategy from Epic:**

- Niveles: Unit + Integration + API + E2E.
- Tools: Playwright (E2E), Postman/Newman (API), Vitest (Unit).

---

## Paso 2: Story Quality Analysis

### Ambiguities Identified

**Ambiguity 1: Definicion exacta de "pending".**

- **Location in Story:** AC 2 dice "sum of all sent (unpaid) invoices".
- **Question for PO/Dev:** Pending incluye solo `status = 'sent'` o tambien `status = 'overdue'`?
- **Impact on Testing:** Cambia la query de agregacion y los datasets de prueba.
- **PO/Dev Decision (proposed):** Pending total = suma de facturas con `status IN ('sent', 'overdue')`, ya que ambas representan montos no cobrados. Esto se alinea con la narrativa de "cuanto me deben" y con el FTP que menciona "pending/overdue" como categorias de montos no pagados.

**Ambiguity 2: Frecuencia de actualizacion.**

- **Location in Story:** AC 4 dice "return to the dashboard" y scope dice "Real-time or refresh on navigation".
- **Question for Dev:** Es refresh al navegar (re-fetch en mount) o es real-time (websocket/polling)?
- **Impact on Testing:** Define si se necesitan tests de latencia de actualizacion.
- **PO/Dev Decision (proposed):** Refresh on navigation (re-fetch en cada mount del dashboard). Real-time via websockets esta fuera de scope de MVP. Consistente con patron de SQ-51 (search) y SQ-52 (monthly summary).

### Missing Information / Gaps

**Gap 1: Mensaje exacto del zero state.**

- **Type:** UI Copy
- **Why It's Critical:** AC 5 dice "positive messaging" pero no especifica copy.
- **Suggested Addition:** `$0.00 — All invoices are paid! Great job.`
- **PO/Dev Decision (proposed):** Copy: `$0.00` con subtexto "All invoices are paid!" — tono positivo y claro.

**Gap 2: Comportamiento cuando hay solo drafts.**

- **Type:** Business Rule
- **Why It's Critical:** Un usuario con 3 drafts y 0 sent ve $0.00 — es distinto de "sin facturas".
- **Suggested Addition:** Mostrar $0.00 con mismo mensaje positivo (drafts no cuentan como pending).
- **PO/Dev Decision (proposed):** Drafts no cuentan como pending. $0.00 muestra el mismo zero state positivo.

### Edge Cases NOT Covered in Original Story

**Edge Case 1: Monto con muchos decimales en DB.**

- **Scenario:** Invoice total es `1500.999` por error de calculo.
- **Expected Behavior:** Redondear a 2 decimales para display (`$1,501.00`).
- **Criticality:** Medium
- **Action Required:** Add to test cases.

**Edge Case 2: Monto extremadamente alto.**

- **Scenario:** Pending total > $999,999.99.
- **Expected Behavior:** Formato `$1,000,000.00` sin truncar.
- **Criticality:** Low
- **Action Required:** Add to test cases.

**Edge Case 3: Usuario con facturas de otro usuario (RLS).**

- **Scenario:** User A intenta acceder a pending total que incluye invoices de User B.
- **Expected Behavior:** RLS filtra; solo ve sus propias facturas.
- **Criticality:** High
- **Action Required:** Add as security test.

### Testability Validation

**Is this story testable as written?** ⚠️ Partially

**Recommendations:** Cerrar definicion de "pending" (sent only vs sent+overdue) y copy de zero state antes de implementar.

---

## Paso 3: Refined Acceptance Criteria

### Scenario 1: Pending total displayed on dashboard

**Type:** Positive
**Priority:** Critical

- **Given:** usuario autenticado con 3 facturas sent (totales: `$500.00`, `$1,000.00`, `$250.00`) y 1 overdue (`$300.00`).
- **When:** navega al dashboard.
- **Then:** la tarjeta de pending total muestra `$2,050.00` (suma de sent + overdue).
- **And:** el formato es USD `$X,XXX.XX` con separadores de miles.

### Scenario 2: Pending total updates after marking paid

**Type:** Positive
**Priority:** Critical

- **Given:** pending total muestra `$2,050.00` (4 facturas unpaid).
- **When:** usuario marca factura de `$500.00` como paid y vuelve al dashboard.
- **Then:** pending total muestra `$1,550.00`.

### Scenario 3: Zero state with positive messaging

**Type:** Positive
**Priority:** High

- **Given:** usuario con todas las facturas pagadas (0 sent, 0 overdue).
- **When:** ve el dashboard.
- **Then:** pending total muestra `$0.00` con mensaje "All invoices are paid!".

### Scenario 4: New user with no invoices

**Type:** Boundary
**Priority:** Medium

- **Given:** usuario recien registrado sin facturas.
- **When:** ve el dashboard.
- **Then:** pending total muestra `$0.00` con zero state apropiado.

### Scenario 5: Only draft invoices (no sent)

**Type:** Boundary
**Priority:** Medium

- **Given:** usuario con 3 facturas en status `draft`.
- **When:** ve el dashboard.
- **Then:** pending total muestra `$0.00` (drafts no cuentan como pending).

### Scenario 6: RLS — user cannot see other users' pending total

**Type:** Negative/Security
**Priority:** Critical

- **Given:** User A tiene `$1,000.00` pending; User B tiene `$5,000.00` pending.
- **When:** User A accede al dashboard.
- **Then:** pending total muestra solo `$1,000.00`, no incluye facturas de User B.

### Scenario 7: Currency formatting consistency

**Type:** Boundary
**Priority:** High

- **Given:** factura con total `1500`.
- **When:** se muestra en pending total.
- **Then:** se formatea como `$1,500.00` (normalizacion automatica a 2 decimales).

---

## Paso 4: Test Design

### Test Coverage Analysis

**Total Test Cases Needed:** 9

- Positive: 3
- Negative: 2
- Boundary: 2
- Integration: 1
- API: 1

**Rationale:** Logica simple de agregacion pero requiere validacion de formato, RLS y sincronizacion con payment flow.

### Parametrization Opportunities

**Parametrized Tests Recommended:** ✅ Yes

**Group 1: Pending total calculation**

| Invoices (sent) | Invoices (overdue) | Invoices (paid/draft) | Expected Total |
| --- | --- | --- | --- |
| `$500, $1000` | `$300` | `$200 paid, $100 draft` | `$1,800.00` |
| `$0` (none) | `$0` (none) | `$500 paid` | `$0.00` |
| `$10000` | `$5000` | none | `$15,000.00` |

**Group 2: Currency formatting**

| Raw Value | Expected Display |
| --- | --- |
| `1500` | `$1,500.00` |
| `1500.5` | `$1,500.50` |
| `0` | `$0.00` |
| `1000000` | `$1,000,000.00` |

### Test Outlines

#### Validar calculo correcto del pending total con facturas mixtas

- **Related Scenario:** Scenario 1
- **Type:** Positive
- **Priority:** Critical
- **Level:** API + UI
- **Parametrized:** ✅ Yes (Group 1)

**Preconditions:**

- Usuario autenticado con facturas en estados mixtos.

**Test Steps:**

1. Crear facturas con estados sent, overdue, paid, draft.
2. Llamar `GET /api/invoices/dashboard`.
3. Verificar que pending_total = suma de sent + overdue.
4. Verificar en UI que la tarjeta muestra el monto correcto.

**Expected Result:**

- **API:** `{ "pending_total": 2050.00 }` (o campo equivalente).
- **UI:** Tarjeta muestra `$2,050.00`.
- **Database:** Consistente con `SELECT SUM(total) FROM invoices WHERE status IN ('sent','overdue') AND user_id = $1`.

#### Validar actualizacion de pending total despues de registrar pago

- **Related Scenario:** Scenario 2
- **Type:** Integration
- **Priority:** Critical
- **Level:** E2E

**Preconditions:**

- Pending total visible con valor > 0.
- Al menos una factura en status `sent`.

**Test Steps:**

1. Anotar pending total actual.
2. Marcar una factura como paid.
3. Volver al dashboard.
4. Verificar que pending total disminuyo por el monto de la factura pagada.

**Expected Result:**

- **UI:** Pending total = valor anterior - monto de factura pagada.

#### Validar zero state con mensaje positivo cuando no hay pending

- **Related Scenario:** Scenario 3
- **Type:** Positive
- **Priority:** High
- **Level:** UI

**Preconditions:**

- Todas las facturas del usuario estan en status `paid` o `cancelled`.

**Test Steps:**

1. Navegar al dashboard.
2. Verificar tarjeta de pending total.

**Expected Result:**

- **UI:** Muestra `$0.00` con mensaje positivo.

#### Validar zero state para usuario nuevo sin facturas

- **Related Scenario:** Scenario 4
- **Type:** Boundary
- **Priority:** Medium
- **Level:** UI

**Preconditions:**

- Usuario recien registrado, sin facturas.

**Test Steps:**

1. Login como nuevo usuario.
2. Navegar al dashboard.

**Expected Result:**

- **UI:** Pending total muestra `$0.00`.

#### Validar que drafts no se incluyen en pending total

- **Related Scenario:** Scenario 5
- **Type:** Boundary
- **Priority:** Medium
- **Level:** API + UI

**Preconditions:**

- Usuario con 3 facturas draft y 0 sent/overdue.

**Test Steps:**

1. Llamar `GET /api/invoices/dashboard`.
2. Verificar pending_total = 0.

**Expected Result:**

- **API:** `pending_total: 0`.
- **UI:** `$0.00`.

#### Validar aislamiento RLS del pending total

- **Related Scenario:** Scenario 6
- **Type:** Negative/Security
- **Priority:** Critical
- **Level:** API

**Preconditions:**

- User A con facturas sent.
- User B con facturas sent.

**Test Steps:**

1. Llamar `GET /api/invoices/dashboard` con token de User A.
2. Verificar que pending total solo incluye facturas de User A.
3. Llamar con token de User B.
4. Verificar que pending total solo incluye facturas de User B.

**Expected Result:**

- **API:** Cada usuario ve solo sus propios montos. No hay leak de datos.

#### Validar formato monetario USD del pending total

- **Related Scenario:** Scenario 7
- **Type:** Positive
- **Priority:** High
- **Level:** UI
- **Parametrized:** ✅ Yes (Group 2)

**Preconditions:**

- Facturas con montos variados.

**Test Steps:**

1. Verificar que el pending total se muestra con formato `$X,XXX.XX`.

**Expected Result:**

- **UI:** Separador de miles, 2 decimales, simbolo `$`.

#### Validar respuesta API de dashboard con campos esperados

- **Type:** API Contract
- **Priority:** High
- **Level:** API

**Test Steps:**

1. `GET /api/invoices/dashboard` con token valido.
2. Verificar status 200.
3. Verificar que response incluye campo de pending total como number.

**Expected Result:**

- **Status:** 200 OK.
- **Response:** Incluye `pending_total` (number, >= 0).

#### Validar rechazo de acceso sin autenticacion

- **Type:** Negative
- **Priority:** Critical
- **Level:** API

**Test Steps:**

1. `GET /api/invoices/dashboard` sin token.
2. Verificar status 401.

**Expected Result:**

- **Status:** 401 Unauthorized.
- **Database:** No data leak.

---

## Integration Test Cases

### Integration 1: Payment flow -> Pending total refresh

- **Integration Point:** Payment API -> Dashboard API.
- **Flow:** Registrar pago via `POST /api/invoices/{id}/payments` -> verificar `GET /api/invoices/dashboard` refleja cambio.
- **Expected:** Pending total disminuye por monto de factura pagada inmediatamente.

### Integration 2: Summary card consistency with filtered list

- **Integration Point:** Dashboard summary cards <-> invoice list.
- **Flow:** Comparar pending total de summary card con suma del listado filtrado por `sent` + `overdue`.
- **Expected:** Montos coinciden.

---

## Edge Cases Summary

| Edge Case | Covered in Story | Added Here | Priority |
| --- | --- | --- | --- |
| Pending incluye sent + overdue | Partial (only "sent") | ✅ Yes (Scenario 1) | Critical |
| Zero state messaging | ✅ Yes | Refined copy | High |
| Drafts excluded | ❌ No | ✅ Yes (Scenario 5) | Medium |
| RLS isolation | ❌ No | ✅ Yes (Scenario 6) | Critical |
| High amount formatting | ❌ No | ✅ Yes (Group 2) | Low |
| Decimals normalization | ❌ No | ✅ Yes (Group 2) | Medium |

---

## Critical Questions for PO/Dev

1. **Pending incluye overdue?** Proposed: Si, `pending_total = SUM(total) WHERE status IN ('sent','overdue')`.
2. **Copy de zero state?** Proposed: `$0.00` con subtexto "All invoices are paid!".
3. **Refresh mechanism?** Proposed: Re-fetch on navigation (mount), no real-time.

---

## Next Steps

1. PO/Dev validan definicion de "pending" y copy de zero state.
2. Dev implementa con AC refinados.
3. QA ejecuta test cases y reporta cobertura.

---

_Archivo generado para Fase 5 (Shift-Left Testing)._
_Last sync mirror: 2026-03-31_
