# 🛡️ Reporte de Pruebas Integral: SQ-24 Add Taxes

**Fecha:** 03/03/2026
**QA Engineer:** Gloria Galindez
**Environment:** Staging & Database (PostgreSQL) & API
**Branch:** `test/SQ-24/add-taxes-to-invoice`

---

## 1. Pruebas Exploratorias (UI/UX - Playwright)

**Estado:** ✅ APROBADO (con observaciones)

Se ejecutaron pruebas E2E manuales/guiadas sobre la URL: `https://staging-upexsoloq.vercel.app/invoices/create`.

### Escenarios Validados

| ID  | Escenario          | Resultado      | Notas                                                                                        |
| --- | ------------------ | -------------- | -------------------------------------------------------------------------------------------- |
| 01  | **Happy Path**     | ✅ PASSED      | Cálculo correcto: $100 + 16% = $116.                                                         |
| 02  | **Impuesto 0%**    | ✅ PASSED      | Total igual a Subtotal.                                                                      |
| 03  | **Decimales**      | ✅ PASSED      | Soporta "10.5%" correctamente ($110.50).                                                     |
| 04  | **Reactividad**    | ✅ PASSED      | Recálculo automático al cambiar precio de ítems.                                             |
| 05  | **Input Negativo** | ⚠️ OBSERVATION | Permite escribir "-5", el sistema lo convierte a positivo "05". No rompe, pero es mejorable. |

---

## 2. Análisis de Base de Datos (Integridad - DBHub)

**Estado:** ✅ APROBADO (con recomendaciones)

### Verificación de Datos

| Verificación     | Resultado | Detalle                                                  |
| ---------------- | --------- | -------------------------------------------------------- |
| **Persistencia** | ✅ PASSED | Datos guardados con precisión decimal exacta (`16.00`).  |
| **Relaciones**   | ✅ PASSED | `invoice_items` vinculados correctamente.                |
| **Constraints**  | ⚠️ FAILED | La BD acepta tasas negativas (falta `CHECK` constraint). |

**Nota:** Aunque la BD es vulnerable, la API (ver sección 3) mitiga este riesgo.

---

## 3. Pruebas de API (Backend - Postman/OpenAPI)

**Estado:** ✅ APROBADO

Se validó la robustez del endpoint `POST /invoices`.

### Escenarios Críticos

| Prueba        | Payload          | Resultado         | Análisis                                    |
| ------------- | ---------------- | ----------------- | ------------------------------------------- |
| **Negativos** | `taxRate: -10`   | `400 Bad Request` | ✅ **Seguro.** El backend valida y rechaza. |
| **Tipos**     | `taxRate: "IVA"` | `400 Bad Request` | ✅ Validación de tipos correcta (Zod).      |

### Hallazgos de Arquitectura

1.  🔴 **Falta PATCH:** No existe endpoint para editar facturas (`PATCH /invoices/{id}`), obligando a recrearlas.
2.  🟡 **Nomenclatura:** Inconsistencia entre API (`camelCase`) y BD (`snake_case`).

---

## 4. Entregables Generados

- **Colección Postman:** `SQ-24: Add Taxes to Invoice` (Workspace de Equipo).
- **Reporte Jira:** Publicado en comentarios de SQ-24.
- **Ticket Mejora:** SQ-87 (DB Constraint).

---

**Conclusión Final:** La historia **SQ-24** está lista para despliegue. La lógica de negocio está asegurada por la validación del Backend, aunque se recomienda abordar la deuda técnica (Constraint DB y Endpoint PATCH) en futuros sprints.
