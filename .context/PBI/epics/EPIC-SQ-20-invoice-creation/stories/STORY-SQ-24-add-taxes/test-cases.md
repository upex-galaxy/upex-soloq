# 🧪 Shift-Left Test Cases: Add Taxes to Invoice (SQ-24)

**Analysis Date:** 2026-01-31
**Context:** EPIC-SQ-20 (Invoice Creation) | SRS FR-015
**Status:** Ready for Review

---

## 📋 1. Critical Analysis & Clarifications

### Business Logic Validation (from SRS FR-015)

Se ha validado la fórmula de cálculo contra las especificaciones funcionales:

- **Fórmula Correcta:** `Total = (Subtotal - Descuento) + Impuesto`
- **Base Imponible:** El impuesto se aplica **DESPUÉS** del descuento.
- **Restricción Técnica:** Base de datos soporta `DECIMAL(5,2)` para la tasa (max 999.99, min -999.99), pero funcionalmente restringiremos a positivos y < 100% (soft limit).

### Ambiguities Resolved

- **Redondeo:** Se asume "Standard Rounding (Half-Up)" a 2 decimales para coincidir con `DECIMAL(10,2)` en `tax_amount`.
- **Multi-tasa:** MVP soporta una única tasa de impuesto por factura (según DB Schema `invoices.tax_rate`).

---

## ✅ 2. Refined Acceptance Criteria

### Scenario 1: Standard Tax Calculation (Happy Path)

**Type:** Positive | **Priority:** Critical

- **Given:** Estoy creando una factura con Subtotal = **$1,000.00** y Descuento = **$0.00**.
- **When:** Ingreso **"16"** en el campo de impuesto.
- **Then:**
  - El `tax_amount` se calcula como **$160.00**.
  - El `total` final es **$1,160.00**.
  - El input muestra formato correcto ("16%").

### Scenario 2: Tax on Discounted Amount (Order of Operations)

**Type:** Positive | **Priority:** Critical

- **Given:** Factura con Subtotal = **$100.00** y un Descuento de **$20.00** (Base imponible = $80.00).
- **When:** Aplico un impuesto del **10%**.
- **Then:**
  - El `tax_amount` es **$8.00** (10% de $80, NO de $100).
  - El `total` es **$88.00**.

### Scenario 3: Zero Tax / Exempt

**Type:** Edge Case | **Priority:** High

- **Given:** Factura activa.
- **When:** Ingreso **"0"** o dejo el campo vacío.
- **Then:**
  - `tax_amount` es **$0.00**.
  - El indicador de impuestos muestra "0%" o "Exento".

### Scenario 4: Real-time Reactive Updates

**Type:** Integration | **Priority:** High

- **Given:** Factura con impuesto del **15%** ya aplicado.
- **When:** Modifico un ítem de línea aumentando su precio.
- **Then:**
  - El `subtotal` cambia.
  - El `tax_amount` se recalcula **automáticamente** sin tener que volver a tocar el campo de impuestos.

---

## 🧪 3. Detailed Test Design (Test Outlines)

### A. Input Validations & Constraints

1.  **Validar [rechazo de negativos] [al ingresar "-5"]**
    - _Step:_ Intentar escribir "-5" o presionar flecha abajo desde 0.
    - _Expected:_ El input impide el negativo o toma el valor absoluto (5%). El sistema fiscal no maneja tasas negativas en este contexto.

2.  **Validar [precisión decimal] [al ingresar "10.555"]**
    - _Step:_ Ingresar 3 decimales.
    - _Expected:_ El sistema redondea a 2 decimales (10.56%) o trunca (10.55%) según configuración global, pero no rompe la UI.

3.  **Validar [sanitización de texto] [al pegar "IVA 16%"]**
    - _Step:_ Pegar texto alfanumérico en el input numérico.
    - _Expected:_ Se extrae solo el valor numérico ("16") o se ignora la entrada no válida.

### B. Functional Logic & Rounding

4.  **Validar [redondeo monetario] [en borde de centavo]**
    - _Context:_ Subtotal $10.55, Tax 19%. (Math: 2.0045) -> Tax: $2.00
    - _Context:_ Subtotal $10.55, Tax 21%. (Math: 2.2155) -> Tax: $2.22 (Round Half-Up check).

### C. UX & Accessibility

5.  **Validar [presets rápidos] [vía teclado]**
    - _Step:_ Hacer foco en impuestos, usar `Tab` o `Flechas` para navegar a los presets (0%, 16%, etc.) y seleccionar con `Enter`.
    - _Expected:_ El valor se aplica sin necesidad de ratón.

6.  **Validar [lectura de pantalla] [al actualizar total]**
    - _Step:_ Cambiar impuesto con Screen Reader activo.
    - _Expected:_ El nuevo Total Calculado debe ser anunciado (usando `aria-live` o similar) para que el usuario no visual sepa que el monto cambió.

### D. Data Integrity

7.  **Validar [persistencia de tasa] [al guardar borrador]**
    - _Step:_ Crear factura, poner impuesto 15%, guardar como Draft (`SQ-30`), recargar página.
    - _Expected:_ El campo de impuesto mantiene "15%" y los cálculos son consistentes.

---

## 📢 Action Required

**@Dev Team:**

1.  Confirmar que la librería de manejo de moneda (ej. `currency.js` o `Intl`) esté configurada para **Round Half-Up**.
2.  Asegurar que el evento `onChange` de los ítems de línea propague el recalculo hacia el componente de totales (State Lifting o Context).

**@PO:**
¿Necesitamos un tope máximo para la tasa (Hard Limit)? (Sugerencia: Bloquear > 100% para evitar errores de dedo como "1600%").
