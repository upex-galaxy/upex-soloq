# SQ-38 Postman Execution Guide

Coleccion preparada para retest de historias activas:

- SQ-48 (Filter by status)
- SQ-50 (Overdue highlight)
- SQ-51 (Search invoices)
- SQ-52 (Monthly summary)

## Archivos

- `qa/api/postman-sq38-dashboard-tracking.collection.json`
- `qa/api/postman-soloq-staging.environment.json`

## Setup rapido

1. Importar ambos archivos en Postman (Collection + Environment).
2. Seleccionar environment `SoloQ Staging (SQ-38)`.
3. Completar variables obligatorias:
   - `sb_auth_cookie` (cookie de sesion valida del usuario QA)
   - `qa_invoice_id_sent` (UUID factura `sent`/`overdue` para test de pago)
   - `qa_invoice_id_foreign` (UUID factura de otro usuario para validar RLS=404)
4. Ajustar `search_invoice_partial` y `search_client_query` al dataset real.

## Cobertura por story

- **SQ-48**: filtros por status, no-results, auth 401.
- **SQ-50**: dashboard summary (overdue counters), listado overdue, auth 401.
- **SQ-51**: busqueda por numero, cliente, trim, no-results.
- **SQ-52**: summary mensual, registrar pago, invalid-id 400, RLS 404, auth 401.

## Ejecucion recomendada

1. Ejecutar folder `SQ-48 Filter by status`.
2. Ejecutar folder `SQ-50 Overdue highlight`.
3. Ejecutar folder `SQ-51 Search invoices`.
4. Ejecutar folder `SQ-52 Monthly summary` al final (incluye mutacion de datos por pago).

## Nota de datos

- El request `Integration - POST payment for sent/overdue invoice` cambia estado de una factura a `paid`.
- Ejecutarlo solo con dataset preparado para retest.

## Reporte sugerido (plantilla)

```text
Run date: YYYY-MM-DD
Environment: staging

SQ-48: PASS/FAIL
- Filtros status: PASS/FAIL
- No-results: PASS/FAIL
- Auth 401: PASS/FAIL

SQ-50: PASS/FAIL
- Dashboard summary fields: PASS/FAIL
- Overdue list: PASS/FAIL
- Auth 401: PASS/FAIL

SQ-51: PASS/FAIL
- Search invoice number: PASS/FAIL
- Search by client: PASS/FAIL
- Trim boundary: PASS/FAIL
- No-results: PASS/FAIL

SQ-52: PASS/FAIL
- Monthly summary shape: PASS/FAIL
- Register payment (201): PASS/FAIL
- Invalid UUID (400): PASS/FAIL
- RLS isolation (404): PASS/FAIL
- Auth 401: PASS/FAIL

Observations:
- ...
```
