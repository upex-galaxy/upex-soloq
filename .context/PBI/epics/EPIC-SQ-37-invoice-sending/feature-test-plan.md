## 📋 Feature Test Plan - Generated 2026-02-09

**QA Lead:** AI-Generated  
**Status:** Draft - Pending Team Review

---

# Feature Test Plan: EPIC-SQ-37 - Invoice Sending

**Fecha:** 2026-02-09  
**QA Lead:** AI-Generated  
**Epic Jira Key:** SQ-37  
**Status:** Draft

---

## 📋 Business Context Analysis

### Business Value

Esta épica completa el flujo principal de facturación: envío de facturas por email con PDF y datos de pago, reduciendo tiempo administrativo y aumentando la tasa de cobro. Impacta directamente la propuesta de valor de SoloQ para freelancers LATAM (profesionalismo y cobro a tiempo).

**Key Value Proposition:**

- Envío con un clic + PDF adjunto elimina el trabajo manual y reduce fricción.
- Datos de pago en el email aceleran el cobro y mejoran cash flow.

**Success Metrics (KPIs):**

- Facturas enviadas por email (target 1,500 en 3 meses).
- Reducción del tiempo promedio de cobro (más de 30% para Pro).
- Time to First Invoice menor a 10 min (flujo completo hasta envío).

**User Impact:**

- Carlos (diseñador): gana profesionalismo y ahorra tiempo en tareas administrativas.
- Valentina (dev): reduce la vergüenza de cobrar y mejora seguimiento.
- Andrés (consultor): obtiene un flujo simple y confiable para enviar facturas.

**Critical User Journeys:**

- J1: Registro y Primera Factura (pasos 13-14: enviar factura y confirmar envío).
- J2: Seguimiento y Cobro (reenviar factura/confirmación de envío).

---

## 🏗️ Technical Architecture Analysis

### Architecture Components Involved

**Frontend:**

- Acción "Enviar" en detalle de factura y en lista (quick send).
- Modal/preview para asunto y mensaje personalizado.
- Estados visuales (sent/failed) y confirmaciones.
- Vista de historial de envíos en detalle de factura.

**Backend:**

- POST `/api/invoices/{invoiceId}/send` (OpenAPI).
- GET `/api/invoices/{invoiceId}/email-status` (mencionado en epic, NO en OpenAPI).
- POST `/api/webhooks/resend` (mencionado en story SQ-46, NO en OpenAPI).
- GET `/api/invoices/{invoiceId}/pdf` para adjunto.
- Integración Resend + React Email templates.

**Database:**

- `invoices` (campos `sent_at`, `email_message_id`, `status`).
- `email_logs` (tabla nueva para tracking de envíos).
- `invoice_events` (evento `sent` y posibles reenvíos).
- `payment_methods`, `business_profiles`, `clients`.

**Queries críticos:**

- Fetch completo de factura + cliente + perfil negocio + métodos de pago.
- Insert de `email_logs` por intento de envío.
- Update de `invoices.status`, `invoices.sent_at`, `invoices.email_message_id`.
- Query histórico de `email_logs` por factura.

**External Services:**

- Resend (envío y webhooks de delivery).
- Supabase Storage (PDFs si se cachean).
- Vercel/Next.js API Routes.

### Integration Points (Critical for Testing)

**Internal Integration Points:**

- Frontend ↔ Backend API (send, email-status).
- Backend ↔ Database (invoices, email_logs, invoice_events).
- Backend ↔ PDF Generator.
- Backend ↔ Supabase Storage (PDF cache).

**External Integration Points:**

- Backend ↔ Resend API (send).
- Resend Webhooks ↔ Backend (delivery status).

**Data Flow:**

```
User → Frontend → /api/invoices/{id}/send → PDF Generator → Resend → Client Email
                             ↓
                           Database (invoices, email_logs, invoice_events)
                             ↓
                   /api/invoices/{id}/email-status (UI status)
```

---

## 🚨 Risk Analysis

### Technical Risks

#### Risk 1: Fallo en generación/adjunto de PDF

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend / Integration
- **Mitigation Strategy:**
  - Validar size menor a 5MB y MIME correcto
  - Tests de PDF con logos grandes y muchos items
- **Test Coverage Required:** PDF generation, attachment size, error handling

#### Risk 2: Inconsistencias de estado por reintentos

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Backend / Database
- **Mitigation Strategy:**
  - Idempotencia por `message_id`
  - Tests de reintento y envío duplicado
- **Test Coverage Required:** Estado `sent`, logs por intento, idempotencia

#### Risk 3: Webhooks de Resend sin validación

- **Impact:** High
- **Likelihood:** Medium
- **Area Affected:** Integration / Security
- **Mitigation Strategy:**
  - Validación de firma de webhook
  - Tests de eventos duplicados y fuera de orden
- **Test Coverage Required:** Webhook auth, mapping de estados

---

### Business Risks

#### Risk 1: Email no llega o queda sin confirmación clara

- **Impact on Business:** Reduce KPI de facturas enviadas y confianza del usuario
- **Impact on Users:** Carlos/Valentina dudan si el envío fue exitoso
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Confirmación visible + historial de envíos
  - Tests de fallos y reintentos
- **Acceptance Criteria Validation:** SQ-46 (confirmation/failure/resend)

#### Risk 2: Datos de pago incorrectos o ilegibles

- **Impact on Business:** Disminuye tasa de cobro
- **Impact on Users:** Clientes no pueden pagar correctamente
- **Likelihood:** Medium
- **Mitigation Strategy:**
  - Formato claro y copy-friendly
  - Tests con distintos métodos de pago
- **Acceptance Criteria Validation:** SQ-44

---

### Integration Risks

#### Integration Risk 1: Resend API ↔ Email Status

- **Integration Point:** Backend ↔ Resend Webhooks
- **What Could Go Wrong:** Webhook no llega, llega duplicado, estado incorrecto
- **Impact:** High
- **Mitigation:**
  - Integration tests con eventos mock
  - Idempotencia por `message_id`
  - Retry policy

---

## ⚠️ Critical Analysis & Questions for PO/Dev

### Ambiguities Identified

**Ambiguity 1:** Límites de asunto/mensaje inconsistentes (Story vs SRS)

- **Found in:** STORY-SQ-45 vs FR-019 (SRS)
- **Question for PO:** ¿Cuál es el límite final de caracteres para subject/message?
- **Impact if not clarified:** Validaciones erróneas y UX inconsistente

**Ambiguity 2:** Quick send vs personalización

- **Found in:** STORY-SQ-42 & STORY-SQ-45
- **Question for PO:** ¿El “quick send” usa defaults o el último mensaje guardado?
- **Impact if not clarified:** Comportamiento inesperado en UI

**Ambiguity 3:** Semántica de “Sent” vs “Delivered”

- **Found in:** STORY-SQ-46
- **Question for PO/Dev:** ¿Qué estado se muestra al usuario y cuándo?
- **Impact if not clarified:** Confusión en confirmación de envío

**Ambiguity 4:** Endpoints faltantes en OpenAPI

- **Found in:** EPIC-SQ-37 / STORY-SQ-46
- **Question for Dev:** ¿Se agregarán `/api/invoices/{id}/email-status` y `/api/webhooks/resend` al contrato?
- **Impact if not clarified:** Testing API incompleto y riesgo de contrato roto

**Ambiguity 5:** Estructura de datos de pago

- **Found in:** STORY-SQ-44
- **Question for Dev:** `payment_methods` solo tiene `label/value`; ¿cómo se representarán “bank name/CLABE”?
- **Impact if not clarified:** Datos de pago incompletos en email

---

### Missing Information

**Missing 1:** Política de reintentos y backoff

- **Needed for:** Test de resiliencia y error handling
- **Suggestion:** Definir número de reintentos y tiempo entre intentos

**Missing 2:** Texto base del email y variables soportadas

- **Needed for:** Validar contenido y reemplazo de variables
- **Suggestion:** Documentar template default y variables

**Missing 3:** Configuración de Resend en staging

- **Needed for:** Pruebas end-to-end reales
- **Suggestion:** Proveer API key sandbox y webhook secret

---

### Suggested Improvements (Before Implementation)

**Improvement 1:** Actualizar OpenAPI y SRS con endpoints faltantes

- **Story Affected:** STORY-SQ-46
- **Current State:** Endpoints mencionados pero no documentados
- **Suggested Change:** Agregar rutas y schemas
- **Benefit:** Evita drift y asegura tests contractuales

**Improvement 2:** Definir mapping de estados de email

- **Story Affected:** STORY-SQ-46
- **Current State:** Estados definidos pero sin reglas de transición
- **Suggested Change:** Especificar reglas y UI copy
- **Benefit:** Menos confusión para usuarios y QA

**Improvement 3:** Alinear límites de subject/message

- **Story Affected:** STORY-SQ-45
- **Current State:** 100/1000 (story) vs 200/2000 (SRS)
- **Suggested Change:** Unificar límites y actualizar AC
- **Benefit:** Validaciones consistentes

---

## 🎯 Test Strategy

### Test Scope

**In Scope:**

- Envío de factura por email con un clic
- Adjuntos PDF y nombre correcto
- Datos de pago en email
- Personalización de asunto/mensaje y variables
- Confirmación de envío, historial y reintentos
- Integración Resend (send + webhooks)
- Validación de errores y estados
- API contract validation para endpoints involucrados

**Out of Scope (For This Epic):**

- Recordatorios automáticos (EPIC-SQ-09)
- Gestión de suscripciones/Stripe
- Integración WhatsApp
- App móvil nativa
- Analítica avanzada de campañas email

---

### Test Levels

#### Unit Testing

- **Coverage Goal:** mayor a 80%
- **Focus Areas:**
  - Construcción de payload para Resend
  - Formateo de datos de pago
  - Reemplazo de variables
- **Responsibility:** Dev team (QA valida evidencia)

#### Integration Testing

- **Coverage Goal:** Todos los integration points
- **Focus Areas:**
  - Backend ↔ Resend API
  - Backend ↔ DB (email_logs)
  - Backend ↔ PDF generator
- **Responsibility:** QA + Dev

#### End-to-End (E2E) Testing

- **Coverage Goal:** Journeys críticos
- **Tool:** Playwright
- **Focus Areas:**
  - Envío desde detalle
  - Quick send desde lista
  - Confirmación y error/resend
- **Responsibility:** QA team

#### API Testing

- **Coverage Goal:** 100% endpoints de esta épica
- **Tool:** Postman/Newman o Playwright API
- **Focus Areas:**
  - Contract validation
  - Status codes correctos
  - Auth/Authorization
- **Responsibility:** QA team

---

### Test Types per Story

**Positive Test Cases:**

- Happy path
- Variaciones válidas de datos

**Negative Test Cases:**

- Input inválido
- Falta de campos requeridos
- Errores de servicio externo

**Boundary Test Cases:**

- Límites de longitud
- Casos con muchos items/archivo grande

**Exploratory Testing:**

- Render de emails en clientes distintos (Gmail/Outlook)
- Claridad de copia para datos de pago
- Manejo de delays en webhooks

---

## 📊 Test Cases Summary by Story

### STORY-SQ-42: Send Invoice by Email with One Click

**Complexity:** Medium  
**Estimated Test Cases:** 12

- Positive: 4
- Negative: 4
- Boundary: 2
- Integration: 1
- API: 1

**Rationale for estimate:** Flujos desde detalle y lista + estados + errores.
**Parametrized Tests Recommended:** Yes (estados de factura + permisos)

---

### STORY-SQ-43: Include Attached PDF in Email

**Complexity:** Medium  
**Estimated Test Cases:** 10

- Positive: 3
- Negative: 3
- Boundary: 2
- Integration: 1
- API: 1

**Rationale for estimate:** Validar adjunto, tamaño y contenido.
**Parametrized Tests Recommended:** Yes (tamaños/plantillas)

---

### STORY-SQ-44: Include Payment Data in Email

**Complexity:** Low-Medium  
**Estimated Test Cases:** 8

- Positive: 3
- Negative: 2
- Boundary: 2
- Integration: 1
- API: 0

**Rationale for estimate:** Variantes de métodos de pago y formato.
**Parametrized Tests Recommended:** Yes (tipos de pago)

---

### STORY-SQ-45: Customize Email Subject and Message

**Complexity:** Medium  
**Estimated Test Cases:** 10

- Positive: 4
- Negative: 3
- Boundary: 2
- Integration: 0
- API: 1

**Rationale for estimate:** Reemplazo de variables + límites.
**Parametrized Tests Recommended:** Yes (variables, longitudes)

---

### STORY-SQ-46: See Email Delivery Confirmation

**Complexity:** High  
**Estimated Test Cases:** 14

- Positive: 4
- Negative: 4
- Boundary: 2
- Integration: 3
- API: 1

**Rationale for estimate:** Webhooks, historial y reintentos.
**Parametrized Tests Recommended:** Yes (estados delivered/bounced/failed)

---

### Total Estimated Test Cases for Epic

**Total:** 54  
**Breakdown:**

- Positive: 18
- Negative: 16
- Boundary: 10
- Integration: 6
- API: 4

---

## 🗂️ Test Data Requirements

### Test Data Strategy

**Valid Data Sets:**

- Usuarios tipo Carlos/Valentina/Andrés con perfil de negocio completo
- Clientes con emails válidos y nombres reales
- Facturas con 1-10 items, impuestos y descuentos
- Métodos de pago: banco, PayPal, Mercado Pago

**Invalid Data Sets:**

- Email de cliente inválido o vacío
- Subject/message excediendo límite
- Métodos de pago incompletos

**Boundary Data Sets:**

- Subject en límite exacto
- Message en límite exacto
- PDF cercano a 5MB
- Items con descripciones largas

**Test Data Management:**

- ✅ Faker.js para datos realistas
- ✅ Factories para clientes/facturas/métodos de pago
- ❌ No hardcodear datos
- ✅ Cleanup post-test

---

### Test Environments

**Staging Environment:**

- URL: https://staging.soloq.app
- Database: soloq-staging
- External Services: Resend sandbox / webhooks simulados
- **Purpose:** Entorno principal de testing

**Production Environment:**

- URL: https://soloq.app
- **Purpose:** Smoke tests post-deploy
- **Restrictions:** Sin datos de prueba destructivos

---

## ✅ Entry/Exit Criteria

### Entry Criteria (Per Story)

- [ ] Story implementada y desplegada en staging
- [ ] Code review aprobado (2+ reviewers)
- [ ] Unit tests existentes y passing (mayor a 80% coverage)
- [ ] Smoke testing básico por Dev
- [ ] Test data preparado
- [ ] API docs actualizadas si cambian endpoints

### Exit Criteria (Per Story)

- [ ] Todos los test cases ejecutados
- [ ] Critical/High: 100% passing
- [ ] Medium/Low: 95% o más passing
- [ ] Bugs críticos/high resueltos
- [ ] Regression aplicada cuando corresponda
- [ ] NFRs validados

### Epic Exit Criteria

- [ ] Todas las stories cumplen exit criteria
- [ ] Integración completa validada
- [ ] E2E de journeys críticos passing
- [ ] API contract testing completo
- [ ] Exploratory testing documentado
- [ ] No critical/high bugs abiertos

---

## 📝 Non-Functional Requirements Validation

### Performance Requirements

**NFR-P-EMAIL-SEND:** Email sending p95 máximo 2000 ms

- **Test Approach:** Medición de tiempos en staging con logs + pruebas API
- **Tools:** Postman/Newman, logs Vercel/Supabase

**NFR-P-PDF-GEN:** PDF generation p95 máximo 3000 ms

- **Test Approach:** Medir tiempo de `/api/invoices/{id}/pdf`
- **Tools:** Postman/Newman

### Security Requirements

**NFR-S-RLS:** RLS en invoices/email_logs

- **Test Approach:** Intentos de acceso cruzado entre usuarios
- **Tools:** API tests con tokens distintos

**NFR-S-INPUT:** Validación server-side

- **Test Approach:** Fuzz inputs de subject/message
- **Tools:** Playwright API

### Usability Requirements

**NFR-U-UX:** Confirmación clara de envío

- **Test Approach:** Verificar copy, estados y feedback
- **Tools:** QA manual + heurística

---

## 🔄 Regression Testing Strategy

**Regression Scope:**

- [ ] Invoice creation: cambios en status y envío
- [ ] PDF generation: adjuntos correctos
- [ ] Payment methods: render en email
- [ ] Client management: email correcto
- [ ] Dashboard: estados “sent/failed”

**Regression Test Execution:**

- Suite automática antes y después de la épica
- Enfoque en puntos de integración

---

## 📅 Testing Timeline Estimate

**Estimated Duration:** 1 sprint (2 semanas)

**Breakdown:**

- Test case design: 3 días
- Test data preparation: 2 días
- Test execution: 1 día por story (5 días)
- Regression testing: 2 días
- Bug fixing buffer: 2 días
- Exploratory testing: 1 día

**Dependencies:**

- Depends on: EPIC-SQ-31 (PDF Generation), EPIC-SQ-13 (Client Management)
- Blocks: EPIC-7 (Dashboard & Tracking)

---

## 🛠️ Tools & Infrastructure

**Testing Tools:**

- E2E: Playwright
- API: Postman/Newman o Playwright API
- Unit: Vitest (frontend), Jest (backend)
- Performance: Lighthouse, logs de Vercel/Supabase
- Security: OWASP ZAP (si aplica)
- Test Data: Faker.js

**CI/CD Integration:**

- [ ] Tests en PR
- [ ] Tests en merge a staging
- [ ] Tests en deploy a staging
- [ ] Smoke tests en producción

**Test Management:**

- Jira/Xray
- Reports por story y por épica

---

## 📊 Metrics & Reporting

**Test Metrics to Track:**

- Ejecutados vs total
- Pass rate
- Bug detection rate
- Coverage de unit tests
- Tiempo de test por story

**Reporting Cadence:**

- Diario: status de ejecución
- Por story: reporte de cierre
- Por épica: QA sign-off

---

## 📢 Action Required

**@PO:**

- [ ] Revisar ambigüedades y missing info
- [ ] Responder preguntas críticas
- [ ] Validar riesgos y scope

**@DevLead:**

- [ ] Validar integración y riesgos técnicos
- [ ] Confirmar endpoints/contratos
- [ ] Responder preguntas técnicas

**@QATeam:**

- [ ] Validar estrategia y estimaciones
- [ ] Confirmar data requirements
- [ ] Preparar entornos/herramientas

---

**Next Steps:**

1. Refinement para resolver preguntas críticas
2. PO/Dev entregan clarificaciones
3. QA diseña casos por story (acceptance-test-plan.md)
4. Validar entry/exit criteria antes del sprint
5. Implementación SOLO después de resolver preguntas críticas

---

**Documentation:** Full test plan también disponible en:
`.context/PBI/epics/EPIC-SQ-37-invoice-sending/feature-test-plan.md`

---

## 🎓 Notes & Assumptions

**Assumptions:**

- Resend sandbox disponible en staging
- Webhooks firmados y verificables
- PDF se genera server-side

**Constraints:**

- Dependencia de EPIC-SQ-31 y EPIC-SQ-13
- Tiempo de sprint limitado

**Known Limitations:**

- Entrega real en inbox del cliente depende de proveedor
- Testing en múltiples clientes de email será parcial

**Exploratory Testing Sessions:**

- Recommended: 2 sesiones antes de implementación
  - Session 1: validación de template con mockups
  - Session 2: edge cases (largos/muchos items, fallos de webhook)

---

## 📎 Related Documentation

- **Epic:** `.context/PBI/epics/EPIC-SQ-37-invoice-sending/epic.md`
- **Stories:** `.context/PBI/epics/EPIC-SQ-37-invoice-sending/stories/STORY-*/story.md`
- **Business Model:** `.context/idea/business-model.md`
- **PRD:** `.context/PRD/`
- **SRS:** `.context/SRS/`
- **Architecture:** `.context/SRS/architecture-specs.md`
- **API Contracts:** `.context/SRS/api-contracts.yaml`
