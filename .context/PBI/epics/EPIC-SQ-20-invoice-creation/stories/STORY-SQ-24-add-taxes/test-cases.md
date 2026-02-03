# 🧪 Shift-Left Test Cases: STORY-SQ-24 - Add Taxes to Invoice

**Fecha:** 2026-01-31
**QA Engineer:** Gemini AI
**Story Jira Key:** SQ-24
**Epic:** SQ-20 - Invoice Creation
**Status:** Draft | Pending Approval

---

## 📋 Paso 1: Critical Analysis

### Business Context

El cálculo de impuestos no es solo una funcionalidad "matemática", es un **requisito legal** obligatorio para la facturación en LATAM.

- **Riesgo de Negocio:** Un cálculo incorrecto (incluso por centavos debido a mal redondeo) invalida la factura ante entidades fiscales (SAT, DIAN, AFIP), causando multas o rechazo de pagos al freelancer.
- **User Persona:** Freelancer que necesita profesionalismo y cumplimiento legal sin ser contador.

### Technical Context & Logic Validation

Basado en **SRS FR-015** y el esquema de base de datos (`invoices` table):

1.  **Fórmula Maestra:**
    - Incorrecto: `Total = Subtotal * (1 + Tasa)`
    - **Correcto (SRS):** `Base Imponible = Subtotal - Descuento` -> `Impuesto = Base Imponible * (Tasa / 100)` -> `Total = Base Imponible + Impuesto`.
    - _Impacto:_ El orden de factores **sí** altera el producto. Las pruebas deben validar esto estrictamente.
2.  **Tipos de Datos:**
    - `tax_rate`: `DECIMAL(5,2)` (Permite ej. 16.00, 10.50, 0.00).
    - `tax_amount`: `DECIMAL(10,2)` (Moneda con 2 decimales).
3.  **Persistencia:** Se guardan ambos valores. Si se edita la factura, ambos deben recalcularse y guardarse.

---

## 🚨 Paso 2: Story Quality & Gaps

### Ambiguities Identified

1.  **Redondeo:** La US no especifica el método de redondeo.
    - _Resolución:_ Asumiremos **"Round Half Up"** (estándar comercial) a 2 decimales para coincidir con la DB.
2.  **Impuestos Compuestos vs. Simples:**
    - _Resolución:_ El esquema DB tiene una sola columna `tax_rate`, por lo que el MVP soporta **un solo impuesto** por factura.

### Edge Cases NOT in Original Story

- **Tasa Decimal:** Países con tasas no enteras (ej. Costa Rica 13%, pero algunos productos al 10.5%). El campo debe aceptar decimales.
- **Edición Post-Cálculo:** Usuario cambia el precio de un ítem _después_ de haber configurado el impuesto. El impuesto debe recalcularse solo.
- **Pegado de Texto:** Usuario pega "16 %" (con símbolo y espacio). El sistema debe sanitizarlo.

---

## ✅ Paso 3: Refined Acceptance Criteria (Gherkin)

### Scenario 1: Standard VAT Calculation (Happy Path)

**Type:** Positive | **Priority:** Critical

- **Given:** I am creating an invoice with:
  - Item 1: $500.00
  - Item 2: $500.00
  - **Subtotal:** $1,000.00
  - **Discount:** $0.00
- **When:** I enter **"16"** in the "Tax Rate" field.
- **Then:**
  - The **Tax Amount** is calculated as **$160.00**.
  - The **Total** updates to **$1,160.00**.
  - The input field displays "16%".

### Scenario 2: Tax Calculation with Discount (Order of Operations)

**Type:** Positive | **Priority:** Critical

- **Given:** I am creating an invoice with:
  - **Subtotal:** $1,000.00
  - **Discount:** $100.00 (Fixed)
  - _Taxable Base:_ $900.00
- **When:** I enter **"10"** in the "Tax Rate" field.
- **Then:**
  - The **Tax Amount** is calculated as **$90.00** (10% of 900).
  - _Constraint:_ It must NOT be $100.00 (10% of 1000).
  - The **Total** updates to **$990.00** ($900 + $90).

### Scenario 3: Decimal Tax Rate Handling

**Type:** Boundary | **Priority:** High

- **Given:** I am creating an invoice with **Subtotal: $100.00**.
- **When:** I enter **"10.5"** in the "Tax Rate" field.
- **Then:**
  - The input accepts the decimal point.
  - The **Tax Amount** is calculated as **$10.50**.
  - The **Total** updates to **$110.50**.

### Scenario 4: Zero Tax / Exempt

**Type:** Edge Case | **Priority:** Medium

- **Given:** I have an invoice with items.
- **When:** I enter **"0"** or clear the tax field.
- **Then:**
  - The **Tax Amount** is **$0.00**.
  - The **Total** is equal to the **Taxable Base**.

---

## 🧪 Paso 4: Test Design (Test Outlines)

### A. Input Validations

1.  **Validar [bloqueo de negativos] [al ingresar "-16"]**
    - _Input:_ "-16"
    - _Expected:_ El input ignora el signo negativo o lo convierte a positivo absoluto (16). No se permiten impuestos negativos (retenciones) en este campo en el MVP.

2.  **Validar [sanitización] [al pegar texto formateado]**
    - _Input:_ Paste "16%" o "IVA 16"
    - _Expected:_ El sistema extrae "16" y realiza el cálculo correctamente. No muestra `NaN`.

3.  **Validar [límite de rango] [al ingresar "> 100%"]**
    - _Input:_ "120"
    - _Expected:_ Mostrar warning visual "¿La tasa de impuesto es correcta?" o bloqueo suave (Soft limit), ya que técnicamente es posible pero improbable.

### B. Logic & Rounding

4.  **Validar [redondeo Half-Up] [en tercer decimal = 5]**
    - _Data:_ Base $10.55 \* 19% = $2.0045
    - _Expected:_ Tax Amount = **$2.00** (Round down/nearest).
    - _Data:_ Base $10.55 \* 21% = $2.2155
    - _Expected:_ Tax Amount = **$2.22** (Round up).

### C. Integration & Reactivity

5.  **Validar [re-cálculo reactivo] [al cambiar ítems]**
    - _Pre:_ Factura con Items=$100, Tax=10% (Total=$110).
    - _Action:_ Cambiar precio del Item a $200.
    - _Expected:_ Tax Amount sube automáticamente a $20 (sin tocar el campo de tax). Total sube a $220.

6.  **Validar [re-cálculo reactivo] [al cambiar descuento]**
    - _Pre:_ Factura $100, Tax 10%, Desc $0 (Tax=$10).
    - _Action:_ Agregar Descuento $50.
    - _Expected:_ Tax Amount baja automáticamente a $5 (10% de $50).

---

## 📢 Critical Questions for PO/Dev

1.  **¿Retenciones?** En algunos países (MX, AR) existen "Retenciones de IVA/ISR" que _restan_ al total. Esta historia solo dice "Add Taxes". ¿Confirmamos que retenciones están **Out of Scope** para esta US?
    - _Recomendación QA:_ Marcar como Out of Scope para MVP y crear nueva US si se requiere.
2.  **¿Impuestos por Ítem?** ¿Confirmamos que el impuesto es **Global** para toda la factura y no por línea? (El esquema de BD lo sugiere, pero es una duda frecuente).
