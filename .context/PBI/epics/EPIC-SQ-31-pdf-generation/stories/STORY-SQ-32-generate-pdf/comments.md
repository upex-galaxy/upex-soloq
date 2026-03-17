# Comments for SQ-32

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-32)

---

### Alfonso Hernandez - 1/30/2026, 3:20:47 PM

## 🧪 Shift-Left Test Cases - Generated 2026-01-30

***QA Engineer:*** Alfonso Hernandez
***Status:*** Draft - Pending PO/Dev Review

## 

## Test Cases Summary

| ***TC ID**** | ****Test Case**** | ****Type**** | ****Priority*** |
| --- | --- | --- | --- |
| TC-32-01 | Validar generación exitosa de PDF desde factura completa | Functional | P1 |
| TC-32-02 | Validar que PDF contiene todas las secciones requeridas | Functional | P1 |
| TC-32-03 | Validar que cálculos del PDF coinciden con editor de factura | Functional | P1 |
| TC-32-04 | Validar que PDF tiene dimensiones A4 y márgenes correctos | Visual | P2 |
| TC-32-05 | Validar generación de PDF con máximo de items (50+) | Performance | P2 |
| TC-32-06 | Validar tiempo de respuesta de generación < 3000ms | Performance | P1 |
| TC-32-07 | Validar calidad de impresión del PDF | Visual | P2 |
| TC-32-08 | Validar renderizado de caracteres especiales LATAM | Functional | P2 |
| TC-32-09 | Validar generación con datos mínimos requeridos | Boundary | P2 |
| TC-32-10 | Validar que usuario no autorizado no puede generar PDF de otro usuario | Security | P1 |

## 

## Critical Analysis Summary

### Ambiguities Identified

# **\"Professional layout\"** not specifically defined - need visual reference/mockup

# **Behavior with missing data** (no logo, no payment methods) not specified

# **Page size** A4 vs Letter selection criteria unclear

### Edge Cases Identified (Not in Original Story)

- 50+ line items - PDF pagination behavior
- Special characters (ñ, á, é) - LATAM user critical
- Minimum required data - layout adaptation
- Performance NFR - <3000ms not in AC

### Security Considerations

- RLS policy must enforce user isolation (TC-32-10)
- 404 response (not 403) to not reveal invoice existence

## 📢 Action Required

@@Alfonso Hernandez** (QA):**

- Test cases ready for review
- Awaiting PO/Dev clarifications before finalizing

**For Product Owner:**

- [ ] Define \"professional layout\" criteria (mockup?)
- [ ] Clarify behavior when logo is not configured
- [ ] Confirm A4 as default page size for MVP
- [ ] Maximum number of line items per invoice?

**For Dev Lead:**

- [ ] Will PDFs be cached or regenerated each request?
- [ ] Font loading strategy for PDF generation?
- [ ] Server-side fallback if client-side too slow?

## Testing Recommendations

**Pre-Implementation:**

- Review @react-pdf/renderer documentation for font support
- Define PDF layout mockup for visual testing baseline

**During Implementation:**

- Unit test calculations separately from rendering
- Integration test full data flow: Invoice → PDF → File

**Post-Implementation:**

- Performance testing with 10, 25, 50 items
- Cross-browser visual regression
- Security testing for authorization

***Documentation:*** Full test cases available at:
`.context/PBI/epics/EPIC-SQ-31-pdf-generation/stories/STORY-SQ-32-generate-pdf/test-cases.md`

## 

**Generated via Shift-Left QA Analysis**

---

### Alfonso Hernandez - 2/4/2026, 2:39:15 AM

@@Ely 
Es necesario una estructura para el PDF ya que la US no la incluye. Propongo esta:

## Especificaciones Técnicas del Diseño

Basado en los "Clarified Business Rules" y "Edge Cases":

1. ***Formato de Página:**** A4 (210mm x 297mm) - **Cumple MVP Business Rule*.
2. ***Márgenes:*** Moderados (ej. 20mm en todos los lados) para asegurar que la impresión no corte contenido.
3. ***Tipografía:*** Una fuente sans-serif limpia y moderna (ej. Helvetica Neue, Roboto, o Open Sans) para asegurar máxima legibilidad.
4. ***Manejo de Paginación:**** Si la tabla de ítems excede una página (**Edge Case 50+ items*), el encabezado de la tabla debe repetirse en cada página subsiguiente. Se debe incluir un indicador "Página X de Y" en el pie de página.
5. ***Diseño Adaptativo (Responsive en PDF):***

---

## Mockup Visual del Layout (Estructura)

A continuación, se presenta una representación visual de la estructura de la factura A4.

### [PÁGINA 1 - ENCABEZADO Y CUERPO PRINCIPAL]

```
Markdown
```

```
+-----------------------------------------------------------------------------------+
| [MARGEN SUPERIOR 20mm]                                                            |
|                                                                                   |
|  +------------------------------------------+  +--------------------------------+ |
|  | SECCIÓN A1: LOGO / MARCA                 |  | SECCIÓN A2: INFO EMPRESA       | |
|  | [LOGO DE SOLOQ AQUÍ]                     |  | SoloQ Solutions S.A. de C.V.   | |
|  | (Si no hay logo, texto grande: ***SoloQ***) |  | Av. Tecnología 123, Piso 4     | |
|  |                                          |  | Ciudad de México, CP 11520     | |
|  |                                          |  | RFC/NIF: SOL230101Q1A          | |
|  |                                          |  | contacto@soloq.com             | |
|  +------------------------------------------+  +--------------------------------+ |
|                                                                                   |
|  [ESPACIO SEPARADOR 15mm]                                                         |
|                                                                                   |
|  +------------------------------------------+  +--------------------------------+ |
|  | SECCIÓN B1: FACTURAR A (CLIENTE)         |  | SECCIÓN B2: META FACTURA       | |
|  | ***FACTURAR A:**** |  | ****FACTURA N.º: INV-2026-001*** | |
|  | Nombre del Cliente S.A.                  |  |                                | |
|  | RFC/NIF del Cliente                      |  | Fecha de Emisión: 30/01/2026   | |
|  | Calle Principal 456                      |  | Fecha de Vencim.: 15/02/2026   | |
|  | Colonia Centro, Ciudad, País             |  |                                | |
|  +------------------------------------------+  +--------------------------------+ |
|                                                                                   |
|  [ESPACIO SEPARADOR 10mm]                                                         |
|                                                                                   |
|  SECCIÓN C: TABLA DE ÍTEMS (Debe repetir header si pasa de página)                |
|  +------------------------------------------------------------------------------+ |
|  | DESCRIPCIÓN                         | CANT. | PRECIO UNIT. | DESC. | IMPORTE | |
|  +-------------------------------------+-------+--------------+-------+---------+ |
|  | Servicio de Desarrollo de Software  | 40.00 | $ 1,000.00   | 0%    | $40,000 | |
|  | (Hrs) - Proyecto Alpha              |       |              |       |         | |
|  +-------------------------------------+-------+--------------+-------+---------+ |
|  | Consultoría Técnica QA (Sesión)     |  2.00 | $2,500.00   | 10%   |$ 4,500 | |
|  +-------------------------------------+-------+--------------+-------+---------+ |
|  | Licencia Anual Software "Q-Tool"    |  1.00 | $10,000.00   | 0%    | $10,000 | |
|  +-------------------------------------+-------+--------------+-------+---------+ |
|  | ... (Más ítems aquí)                | ...   | ...          | ...   | ...     | |
|  +------------------------------------------------------------------------------+ |
|                                                                                   |
|                                                 [ESPACIO ENTRE TABLA Y TOTALES]   |
|                                                                                   |
|                                                +--------------------------------+ |
|                                                | SECCIÓN D: TOTALES             | |
|                                                | (Alineado a la derecha)        | |
|                                                |                                | |
|                                                | Subtotal:          $ 54,500.00 | |
|                                                | Descuento Total: - $   500.00  | |
|                                                | IVA (16%):         $  8,640.00 | |
|                                                |                                | |
|                                                | ***TOTAL:           $ 62,640.00***| |
|                                                +--------------------------------+ |
|                                                                                   |
|  [MARGEN INFERIOR (Variable según contenido)]                                     |
+-----------------------------------------------------------------------------------+
```

### [PIE DE PÁGINA - ESTRUCTURA FINAL]

Esta sección va al final de la última página (o al final de cada página si se prefiere, excepto los totales que solo van al final).

```
Markdown
```

```
+-----------------------------------------------------------------------------------+
|  [SEPARADOR ANTES DEL FOOTER]                                                     |
|                                                                                   |
|  +------------------------------------------+  +--------------------------------+ |
|  | SECCIÓN E1: NOTAS / TÉRMINOS             |  | SECCIÓN E2: MÉTODOS PAGO       | |
|  | ***Notas:**** |  | ****Información de Pago:*** | |
|  | Gracias por su preferencia.              |  | Banco: Banco Nacional          | |
|  | Términos de pago a 15 días.              |  | CLABE: 000000000000000000      | |
|  |                                          |  | Ref: INV-2026-001              | |
|  |                                          |  | (Se oculta si no hay datos)    | |
|  +------------------------------------------+  +--------------------------------+ |
|                                                                                   |
|  [LINEA DIVISORIA FINA]                                                           |
|                                                                                   |
|  GENERADO POR SOLOQ PLATFORM | ID: abc-123 | PÁGINA 1 DE 1 [Bottom Right Corner]  |
| [MARGEN INFERIOR 20mm]                                                            |
+-----------------------------------------------------------------------------------+
```

***Y la referencia visual:***



---

### Alfonso Hernandez - 2/4/2026, 2:44:45 AM

@@Ely La US esta lista para trabajar.

---

### Automation for Jira - 2/8/2026, 7:51:35 PM

🔎 Pull Request created. Task is pending to ANALYZE and REVIEW by the team. Waiting for PR Approval.

---

### Ely - 2/8/2026, 7:51:51 PM

PR created and ready for review: [https://github.com/upex-galaxy/upex-soloq/pull/35](https://github.com/upex-galaxy/upex-soloq/pull/35)

***Changes implemented:***

- Client-side PDF generation using @react-pdf/renderer
- Professional PDF template with header, client info, items table, totals, notes/terms
- Invoice preview component with 1500ms debouncing and download functionality
- useInvoice hook and API endpoint for fetching invoice data
- Memory cleanup for blob URLs

***Technical decisions:***

- Using Helvetica font (built-in) to avoid font loading issues
- Text sanitization to remove emojis (not supported by PDF renderer)
- Dynamic imports for code splitting and SSR avoidance
- RLS security on API endpoint

---

### Automation for Jira - 2/9/2026, 12:42:46 AM

✅ Pull Request is successfully MERGED. Task is Done.

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:55.464Z_
