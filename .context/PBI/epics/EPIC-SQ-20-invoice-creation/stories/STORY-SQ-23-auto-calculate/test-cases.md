## Summary

Este Feature Test Plan valida el cálculo automático y preciso de importes financieros en el flujo de creación de facturas, asegurando consistencia matemática, correcta aplicación de descuentos e impuestos, y estabilidad ante cambios en tiempo real.

El plan cubre:

- Cálculo de **subtotal**, **descuentos**, **impuestos** y **total final**
- **Precisión decimal** y políticas de redondeo
- **Reactividad** ante cambios del usuario
- **Validaciones y edge cases financieros**
- Casos reales y escenarios críticos de negocio

Se han identificado varias **ambigüedades funcionales** que requieren confirmación del Product Owner antes de la implementación final, especialmente relacionadas con:

- Orden de aplicación de descuentos e impuestos
- Política oficial de redondeo
- Límites y validaciones financieras

Este documento sirve como referencia tanto para **QA manual**, **automatización** y **alineación funcional con producto y desarrollo**.

---

## Test Cases Overview (Highlights)

| Área funcional                 | Casos clave   | Prioridad dominante |
| ------------------------------ | ------------- | ------------------- |
| Cálculo de Subtotal            | TC-01 → TC-08 | Alta                |
| Descuentos (Porcentaje / Fijo) | TC-09 → TC-21 | Alta                |
| Impuestos                      | TC-22 → TC-30 | Crítica             |
| Cálculo de Total Final         | TC-31 → TC-36 | Crítica             |
| Actualización en tiempo real   | TC-37 → TC-44 | Alta                |
| Precisión decimal / Redondeo   | TC-45 → TC-48 | Alta                |
| Validaciones y Edge Cases      | TC-49 → TC-54 | Media               |
| Integración end-to-end         | TC-55 → TC-56 | Crítica             |

**Total de casos definidos:** 56
**Casos críticos:** TC-27, TC-28, TC-34, TC-35, TC-55, TC-56

---

## Jira References

- **User Story:**
  [SQ-23 – Automatic Subtotal and Total Calculation](https://upexgalaxy64.atlassian.net/browse/SQ-23)

- **Epic:**
  [SQ-20 – Invoice Creation](https://upexgalaxy64.atlassian.net/browse/SQ-20)

- **Related Stories / Docs:**
  - SQ-25 – Discount rules and capping logic
  - EPIC-SQ-31 – PDF generation (out of scope)
  - EPIC-SQ-37 – Invoice delivery (out of scope)

---

# Test Plan - SQ-23: Automatic Subtotal and Total Calculation

**User Story:** [SQ-23](https://upexgalaxy64.atlassian.net/browse/SQ-23)
**Epic:** [SQ-20](https://upexgalaxy64.atlassian.net/browse/SQ-20) - Invoice Creation
**Fecha:** 2026-01-29
**Versión:** 1.0

---

## 1. Objetivo del Test Plan

Verificar que el sistema calcula automáticamente y de forma precisa:

- **Subtotal** (suma de line items)
- **Descuentos** (porcentaje o fijo)
- **Impuestos** (sobre subtotal o subtotal-descuento)
- **Total final**
- **Precisión decimal** (2 decimales)
- **Actualizaciones en tiempo real**

---

## 2. Alcance

### 2.1 In Scope

- Cálculo de subtotal con múltiples line items
- Cálculo de descuentos (porcentaje y fijo)
- Cálculo de impuestos según configuración
- Cálculo de total final
- Redondeo a 2 decimales
- Actualizaciones reactivas (real-time)
- Validaciones de límites (descuentos no negativos, etc.)

### 2.2 Out of Scope

- UI/UX de formularios (otra US)
- Persistencia en base de datos (otra US)
- Generación de PDF (EPIC-SQ-31)
- Envío de facturas (EPIC-SQ-37)

---

## 3. Fórmulas de Cálculo

### 3.1 Fórmula Principal

```
subtotal = Σ(quantity × unit_price) para todos los line items
discount_amount = calcular según discount_type
tax_base = subtotal - discount_amount (si tax_on_discounted = true)
tax_base = subtotal (si tax_on_discounted = false)
tax_amount = tax_base × (tax_rate / 100)
total = subtotal - discount_amount + tax_amount
```

### 3.2 Cálculo de Descuento

```
Si discount_type = 'percentage':
  discount_amount = subtotal × (discount_value / 100)
  discount_amount = MIN(discount_amount, subtotal)

Si discount_type = 'fixed':
  discount_amount = discount_value
  discount_amount = MIN(discount_amount, subtotal)

Si discount_type = null o discount_value = 0:
  discount_amount = 0
```

### 3.3 Redondeo

- Todos los valores monetarios: **2 decimales** (banker's rounding)
- Redondeo en cada paso intermedio vs. redondeo solo al final: **ACLARACIÓN NECESARIA**

---

## 4. Información Adicional Requerida

### ⚠️ Ambigüedades que necesitan aclaración:

1. **Orden de aplicación de descuento e impuesto:**
   - ¿El impuesto se calcula sobre el subtotal original o sobre el subtotal después de aplicar el descuento?
   - **Respuesta necesaria:** Confirmar si `tax_base = subtotal - discount` o `tax_base = subtotal`
   - **Nota técnica:** Según `epic.md` línea 56, dice "Tax calculated on: subtotal (before discount) OR subtotal - discount (configurable)" - **¿Es configurable por el usuario o es una decisión de negocio única?**

2. **Política de redondeo:**
   - ¿Redondear en cada paso (line_total, discount, tax) o solo al final?
   - ¿Usar "banker's rounding" (IEEE 754) o "half-up"?
   - **Recomendación:** Redondear cada line_total a 2 decimales, luego sumar para subtotal, luego redondear cada cálculo intermedio.

3. **Límite de descuentos:**
   - ¿El descuento puede ser mayor que el subtotal? (Asumimos que NO, pero debe estar validado)
   - ¿Descuentos negativos permitidos? (Asumimos NO)

4. **Impuestos múltiples:**
   - ¿Solo un tax_rate por factura o múltiples? (Asumimos uno solo)

5. **Precisión interna vs. display:**
   - ¿Los cálculos internos usan mayor precisión (e.g., 4 decimales) y solo se redondean para display?
   - **Recomendación:** Usar precisión completa (float64) internamente, redondear a 2 decimales solo para DB y UI.

6. **Valores mínimos:**
   - ¿Cantidad mínima de line items? (Asumimos 1)
   - ¿Precio unitario puede ser 0? (Asumimos SÍ, para items gratuitos)
   - ¿Cantidad puede ser decimal (e.g., 2.5 horas)? (Según DB schema: `DECIMAL(10,2)`, entonces SÍ)

---

## 5. Casos de Prueba

### 5.1 Cálculo de Subtotal

#### TC-01: Subtotal con un solo line item

- **Entrada:**
  - 1 item: quantity=1, unit_price=100.00
- **Esperado:**
  - subtotal = 100.00
- **Prioridad:** Alta

#### TC-02: Subtotal con múltiples line items (valores enteros)

- **Entrada:**
  - Item 1: quantity=2, unit_price=50.00 → line_total=100.00
  - Item 2: quantity=3, unit_price=30.00 → line_total=90.00
- **Esperado:**
  - subtotal = 190.00
- **Prioridad:** Alta

#### TC-03: Subtotal con decimales en precio unitario

- **Entrada:**
  - Item 1: quantity=1, unit_price=99.99
  - Item 2: quantity=1, unit_price=0.01
- **Esperado:**
  - subtotal = 100.00
- **Prioridad:** Alta

#### TC-04: Subtotal con cantidades decimales

- **Entrada:**
  - Item 1: quantity=2.5, unit_price=40.00 → line_total=100.00
  - Item 2: quantity=1.33, unit_price=10.00 → line_total=13.30
- **Esperado:**
  - subtotal = 113.30
- **Prioridad:** Alta
- **Nota:** Verificar redondeo de 1.33 × 10.00 = 13.30 (no 13.3)

#### TC-05: Subtotal con muchos decimales (test de redondeo)

- **Entrada:**
  - Item 1: quantity=1, unit_price=10.555
  - Item 2: quantity=1, unit_price=10.554
- **Esperado:**
  - line_total_1 = 10.56 (o 10.55 según política de redondeo)
  - line_total_2 = 10.55
  - **Requiere aclaración de política de redondeo**
- **Prioridad:** Media

#### TC-06: Subtotal con valores grandes

- **Entrada:**
  - Item 1: quantity=1000, unit_price=9999.99
- **Esperado:**
  - subtotal = 9,999,990.00
  - **Verificar límites del tipo DECIMAL(10,2) en DB** (max = 99,999,999.99)
- **Prioridad:** Media

#### TC-07: Subtotal con precio cero

- **Entrada:**
  - Item 1: quantity=1, unit_price=0.00
  - Item 2: quantity=5, unit_price=20.00
- **Esperado:**
  - subtotal = 100.00
- **Prioridad:** Baja

#### TC-08: Subtotal con un solo centavo

- **Entrada:**
  - Item 1: quantity=1, unit_price=0.01
- **Esperado:**
  - subtotal = 0.01
- **Prioridad:** Baja

---

### 5.2 Cálculo de Descuento (Porcentaje)

#### TC-09: Descuento porcentual estándar (10%)

- **Entrada:**
  - subtotal = 100.00
  - discount_type = 'percentage'
  - discount_value = 10
- **Esperado:**
  - discount_amount = 10.00
- **Prioridad:** Alta

#### TC-10: Descuento porcentual con decimales

- **Entrada:**
  - subtotal = 99.99
  - discount_type = 'percentage'
  - discount_value = 10
- **Esperado:**
  - discount_amount = 10.00 (redondeo de 9.999)
  - **O 9.99 según política - REQUIERE ACLARACIÓN**
- **Prioridad:** Alta

#### TC-11: Descuento del 100%

- **Entrada:**
  - subtotal = 100.00
  - discount_type = 'percentage'
  - discount_value = 100
- **Esperado:**
  - discount_amount = 100.00
- **Prioridad:** Alta
- **Validación:** ¿Esto es un caso válido? ¿Factura de $0?

#### TC-12: Descuento mayor al 100%

- **Entrada:**
  - subtotal = 100.00
  - discount_type = 'percentage'
  - discount_value = 150
- **Esperado:**
  - Error de validación O discount_amount = subtotal (100.00)
  - **REQUIERE ACLARACIÓN: ¿Se permite? ¿Se capea?**
- **Prioridad:** Alta

#### TC-13: Descuento porcentual con decimales en el porcentaje

- **Entrada:**
  - subtotal = 100.00
  - discount_type = 'percentage'
  - discount_value = 10.5
- **Esperado:**
  - discount_amount = 10.50
- **Prioridad:** Media
- **Validación:** ¿Se permite 10.5%?

#### TC-14: Descuento de 0%

- **Entrada:**
  - subtotal = 100.00
  - discount_type = 'percentage'
  - discount_value = 0
- **Esperado:**
  - discount_amount = 0.00
- **Prioridad:** Media

#### TC-15: Descuento porcentual negativo

- **Entrada:**
  - subtotal = 100.00
  - discount_type = 'percentage'
  - discount_value = -10
- **Esperado:**
  - Error de validación
- **Prioridad:** Media

---

### 5.3 Cálculo de Descuento (Fijo)

#### TC-16: Descuento fijo estándar

- **Entrada:**
  - subtotal = 100.00
  - discount_type = 'fixed'
  - discount_value = 25.00
- **Esperado:**
  - discount_amount = 25.00
- **Prioridad:** Alta

#### TC-17: Descuento fijo con decimales

- **Entrada:**
  - subtotal = 100.00
  - discount_type = 'fixed'
  - discount_value = 33.33
- **Esperado:**
  - discount_amount = 33.33
- **Prioridad:** Alta

#### TC-18: Descuento fijo igual al subtotal

- **Entrada:**
  - subtotal = 100.00
  - discount_type = 'fixed'
  - discount_value = 100.00
- **Esperado:**
  - discount_amount = 100.00
- **Prioridad:** Alta

#### TC-19: Descuento fijo mayor al subtotal

- **Entrada:**
  - subtotal = 100.00
  - discount_type = 'fixed'
  - discount_value = 150.00
- **Esperado:**
  - discount_amount = 100.00 (capeado) O Error de validación
  - **REQUIERE ACLARACIÓN: según story.md SQ-25, "discount is capped"**
- **Prioridad:** Alta

#### TC-20: Descuento fijo de 0

- **Entrada:**
  - subtotal = 100.00
  - discount_type = 'fixed'
  - discount_value = 0.00
- **Esperado:**
  - discount_amount = 0.00
- **Prioridad:** Media

#### TC-21: Descuento fijo negativo

- **Entrada:**
  - subtotal = 100.00
  - discount_type = 'fixed'
  - discount_value = -50.00
- **Esperado:**
  - Error de validación
- **Prioridad:** Media

---

### 5.4 Cálculo de Impuestos (Sin Descuento)

#### TC-22: Impuesto estándar (16%)

- **Entrada:**
  - subtotal = 100.00
  - discount_amount = 0.00
  - tax_rate = 16
- **Esperado:**
  - tax_amount = 16.00
- **Prioridad:** Alta

#### TC-23: Impuesto 0%

- **Entrada:**
  - subtotal = 100.00
  - discount_amount = 0.00
  - tax_rate = 0
- **Esperado:**
  - tax_amount = 0.00
- **Prioridad:** Alta

#### TC-24: Impuesto con decimales en la tasa

- **Entrada:**
  - subtotal = 100.00
  - discount_amount = 0.00
  - tax_rate = 16.5
- **Esperado:**
  - tax_amount = 16.50
- **Prioridad:** Media

#### TC-25: Impuesto con redondeo complejo

- **Entrada:**
  - subtotal = 99.99
  - discount_amount = 0.00
  - tax_rate = 16
- **Esperado:**
  - tax_amount = 16.00 (redondeo de 15.9984)
  - **O 15.99 según política - REQUIERE ACLARACIÓN**
- **Prioridad:** Alta

#### TC-26: Impuestos comunes LATAM

- **Casos:**
  - México: tax_rate = 16, subtotal = 1000.00 → tax_amount = 160.00
  - Colombia: tax_rate = 19, subtotal = 1000.00 → tax_amount = 190.00
  - Argentina: tax_rate = 21, subtotal = 1000.00 → tax_amount = 210.00
- **Prioridad:** Media

---

### 5.5 Cálculo de Impuestos (Con Descuento)

**⚠️ IMPORTANTE:** Estos casos requieren aclaración sobre si el impuesto se aplica sobre el subtotal original o sobre el subtotal después del descuento.

#### TC-27: Impuesto sobre subtotal descontado (si configurable = true)

- **Entrada:**
  - subtotal = 100.00
  - discount_amount = 10.00 (10%)
  - tax_rate = 16
  - tax_on_discounted = true
- **Esperado:**
  - tax_base = 90.00
  - tax_amount = 14.40
- **Prioridad:** Crítica
- **Nota:** Requiere confirmar configuración

#### TC-28: Impuesto sobre subtotal original (si configurable = false)

- **Entrada:**
  - subtotal = 100.00
  - discount_amount = 10.00 (10%)
  - tax_rate = 16
  - tax_on_discounted = false
- **Esperado:**
  - tax_base = 100.00
  - tax_amount = 16.00
- **Prioridad:** Crítica
- **Nota:** Requiere confirmar configuración

#### TC-29: Descuento fijo con impuesto (caso real)

- **Entrada:**
  - subtotal = 150.50
  - discount_type = 'fixed'
  - discount_value = 20.00
  - tax_rate = 16
  - **Asumir:** tax_on_discounted = true
- **Esperado:**
  - discount_amount = 20.00
  - tax_base = 130.50
  - tax_amount = 20.88
  - total = 131.38
- **Prioridad:** Alta

#### TC-30: Descuento del 100% con impuesto

- **Entrada:**
  - subtotal = 100.00
  - discount_amount = 100.00
  - tax_rate = 16
  - **Asumir:** tax_on_discounted = true
- **Esperado:**
  - tax_base = 0.00
  - tax_amount = 0.00
  - total = 0.00
- **Prioridad:** Media

---

### 5.6 Cálculo de Total Final

#### TC-31: Total sin descuento ni impuesto

- **Entrada:**
  - subtotal = 100.00
  - discount_amount = 0.00
  - tax_amount = 0.00
- **Esperado:**
  - total = 100.00
- **Prioridad:** Alta

#### TC-32: Total con solo impuesto

- **Entrada:**
  - subtotal = 100.00
  - discount_amount = 0.00
  - tax_amount = 16.00
- **Esperado:**
  - total = 116.00
- **Prioridad:** Alta

#### TC-33: Total con solo descuento

- **Entrada:**
  - subtotal = 100.00
  - discount_amount = 10.00
  - tax_amount = 0.00
- **Esperado:**
  - total = 90.00
- **Prioridad:** Alta

#### TC-34: Total con descuento e impuesto (completo)

- **Entrada:**
  - subtotal = 100.00
  - discount_amount = 10.00
  - tax_amount = 14.40 (16% sobre 90)
- **Esperado:**
  - total = 104.40
- **Prioridad:** Crítica

#### TC-35: Caso real complejo

- **Entrada:**
  - Item 1: quantity=2.5, unit_price=42.50 → line_total=106.25
  - Item 2: quantity=3, unit_price=33.33 → line_total=99.99
  - subtotal = 206.24
  - discount_type = 'percentage', discount_value = 10 → discount_amount = 20.62
  - tax_rate = 16 (sobre subtotal-descuento) → tax_amount = 29.70
- **Esperado:**
  - total = 215.32
- **Prioridad:** Crítica
- **Nota:** Verificar paso a paso con redondeos intermedios

#### TC-36: Total con valores negativos (edge case)

- **Entrada:**
  - subtotal = 100.00
  - discount_amount = 100.00
  - tax_amount = 0.00
- **Esperado:**
  - total = 0.00 (no negativo)
- **Prioridad:** Media

---

### 5.7 Actualización en Tiempo Real (Reactividad)

#### TC-37: Actualización al modificar cantidad de item

- **Acción:**
  - Estado inicial: Item 1 quantity=2, unit_price=50 → subtotal=100
  - Cambiar quantity a 3
- **Esperado:**
  - line_total actualiza a 150
  - subtotal actualiza a 150
  - Todos los demás cálculos se recalculan automáticamente
- **Prioridad:** Alta

#### TC-38: Actualización al modificar precio unitario

- **Acción:**
  - Estado inicial: Item 1 quantity=2, unit_price=50 → subtotal=100
  - Cambiar unit_price a 60
- **Esperado:**
  - line_total actualiza a 120
  - subtotal actualiza a 120
  - Recalcular descuento y total
- **Prioridad:** Alta

#### TC-39: Actualización al agregar nuevo item

- **Acción:**
  - Estado inicial: 1 item, subtotal=100
  - Agregar Item 2: quantity=1, unit_price=50
- **Esperado:**
  - subtotal actualiza a 150
  - Recalcular todo
- **Prioridad:** Alta

#### TC-40: Actualización al eliminar item

- **Acción:**
  - Estado inicial: 2 items, subtotal=150
  - Eliminar Item 2
- **Esperado:**
  - subtotal actualiza a 100
  - Recalcular descuento (porcentaje) y total
- **Prioridad:** Alta

#### TC-41: Actualización al cambiar tasa de impuesto

- **Acción:**
  - Estado inicial: subtotal=100, tax_rate=16, total=116
  - Cambiar tax_rate a 21
- **Esperado:**
  - tax_amount actualiza a 21
  - total actualiza a 121
- **Prioridad:** Alta

#### TC-42: Actualización al cambiar tipo de descuento

- **Acción:**
  - Estado inicial: subtotal=100, discount_type='percentage', discount_value=10, discount_amount=10
  - Cambiar a discount_type='fixed', discount_value=10
- **Esperado:**
  - discount_amount sigue siendo 10 (coincidencia)
  - Pero al cambiar discount_value a 20 → discount_amount=20 (no 20% sino $20)
- **Prioridad:** Media

#### TC-43: Actualización al cambiar valor de descuento

- **Acción:**
  - Estado inicial: subtotal=100, discount_type='percentage', discount_value=10
  - Cambiar discount_value a 20
- **Esperado:**
  - discount_amount actualiza de 10 a 20
  - Recalcular tax (si aplica sobre descontado) y total
- **Prioridad:** Alta

#### TC-44: Múltiples cambios rápidos (debouncing)

- **Acción:**
  - Cambiar quantity de 1 → 2 → 3 → 4 rápidamente
- **Esperado:**
  - Cálculos se actualizan sin lag
  - Estado final consistente
  - **Verificar performance:** < 100ms por cálculo
- **Prioridad:** Media

---

### 5.8 Precisión Decimal

#### TC-45: Redondeo acumulativo (múltiples items)

- **Entrada:**
  - 10 items con unit_price = 10.555, quantity = 1
- **Esperado:**
  - Cada line_total: 10.56 (o 10.55 según política)
  - subtotal = 105.60 (o 105.50)
  - **Verificar que no hay pérdida de precisión acumulativa**
- **Prioridad:** Alta

#### TC-46: División con resultado infinito

- **Entrada:**
  - Item 1: quantity=3, unit_price=10.00 → line_total=30.00
  - discount_type='percentage', discount_value=33.33
- **Esperado:**
  - discount_amount = 10.00 (redondeo de 9.999)
  - **Verificar consistencia del redondeo**
- **Prioridad:** Media

#### TC-47: Valores muy pequeños (centavos)

- **Entrada:**
  - Item 1: quantity=1, unit_price=0.01
  - tax_rate = 16
- **Esperado:**
  - subtotal = 0.01
  - tax_amount = 0.00 (redondeo de 0.0016)
  - total = 0.01
- **Prioridad:** Media

#### TC-48: Suma de muchos valores pequeños

- **Entrada:**
  - 100 items con unit_price = 0.01, quantity = 1
- **Esperado:**
  - subtotal = 1.00 (sin error de precisión flotante)
- **Prioridad:** Media

---

### 5.9 Validaciones y Edge Cases

#### TC-49: Sin items (subtotal vacío)

- **Entrada:**
  - 0 items
- **Esperado:**
  - subtotal = 0.00
  - discount_amount = 0.00
  - tax_amount = 0.00
  - total = 0.00
  - **O mostrar mensaje de advertencia**
- **Prioridad:** Media

#### TC-50: Cantidad negativa

- **Entrada:**
  - Item 1: quantity=-1, unit_price=100
- **Esperado:**
  - Error de validación (no permitir guardar)
- **Prioridad:** Media

#### TC-51: Precio negativo

- **Entrada:**
  - Item 1: quantity=1, unit_price=-100
- **Esperado:**
  - Error de validación (no permitir guardar)
  - **O permitir para "créditos"? - REQUIERE ACLARACIÓN**
- **Prioridad:** Media

#### TC-52: Tasa de impuesto negativa

- **Entrada:**
  - tax_rate = -10
- **Esperado:**
  - Error de validación
- **Prioridad:** Baja

#### TC-53: Tasa de impuesto > 100%

- **Entrada:**
  - tax_rate = 150
- **Esperado:**
  - ¿Permitido? (algunos países tienen múltiples impuestos que suman >100%)
  - **REQUIERE ACLARACIÓN**
- **Prioridad:** Baja

#### TC-54: Valores nulos o undefined

- **Entrada:**
  - discount_type = null
  - discount_value = null
  - tax_rate = null
- **Esperado:**
  - Tratar como 0 (no error)
- **Prioridad:** Media

---

### 5.10 Integración entre Componentes

#### TC-55: Cambio de configuración de impuesto (tax_on_discounted)

- **Entrada:**
  - subtotal = 100.00
  - discount_amount = 10.00
  - tax_rate = 16
  - **Cambiar:** tax_on_discounted de true a false
- **Esperado:**
  - tax_amount cambia de 14.40 a 16.00
  - total cambia de 104.40 a 106.00
- **Prioridad:** Alta
- **Nota:** Solo si la configuración es accesible al usuario

#### TC-56: Factura completa de inicio a fin

- **Flujo:**
  1. Agregar Item 1: quantity=2, unit_price=50 → subtotal=100
  2. Agregar Item 2: quantity=1, unit_price=25 → subtotal=125
  3. Aplicar descuento: type='percentage', value=10 → discount_amount=12.50
  4. Aplicar impuesto: tax_rate=16 (sobre descontado) → tax_amount=18.00
  5. Total final = 130.50
- **Esperado:**
  - Cada paso actualiza correctamente
  - Total final correcto
- **Prioridad:** Crítica

---

## 6. Estrategia de Testing

### 6.1 Testing Unitario (Unit Tests)

- **Framework:** Jest / Vitest
- **Archivos:** `calculateInvoiceTotals.test.ts`
- **Cobertura objetivo:** > 80%
- **Foco:** Funciones puras de cálculo
  - `calculateLineTotal(quantity, unitPrice)`
  - `calculateDiscount(subtotal, discountType, discountValue)`
  - `calculateTax(taxBase, taxRate)`
  - `calculateInvoiceTotal(subtotal, discount, tax)`

### 6.2 Testing de Integración

- **Framework:** React Testing Library / Playwright Component Testing
- **Foco:** Interacción entre componentes
  - Actualización reactiva
  - Propagación de cambios

### 6.3 Testing E2E

- **Framework:** Playwright / Cypress
- **Foco:** Flujo completo de creación de factura
  - TC-56 (flujo completo)
  - Persistencia y recarga de datos

### 6.4 Testing de Precisión Numérica

- **Herramienta:** Property-based testing (fast-check)
- **Foco:** Casos aleatorios para detectar problemas de redondeo

---

## 7. Criterios de Aceptación (Checklist)

- [ ] **AC1:** Subtotal se calcula como suma de line totals
- [ ] **AC2:** Total se calcula según fórmula: `total = subtotal - discount + tax`
- [ ] **AC3:** Descuento porcentual funciona correctamente
- [ ] **AC4:** Descuento fijo funciona correctamente
- [ ] **AC5:** Descuento no excede el subtotal (capeado)
- [ ] **AC6:** Impuesto se calcula según configuración (sobre subtotal o descontado)
- [ ] **AC7:** Todos los valores se redondean a 2 decimales
- [ ] **AC8:** Actualizaciones en tiempo real funcionan (< 100ms)
- [ ] **AC9:** No hay errores de precisión acumulativa
- [ ] **AC10:** Validaciones de entrada funcionan (no negativos, etc.)
- [ ] **AC11:** Tests unitarios > 80% cobertura
- [ ] **AC12:** Tests E2E cubren flujo completo

---

## 8. Riesgos y Consideraciones

### 8.1 Riesgos Técnicos

| Riesgo                                  | Probabilidad | Impacto | Mitigación                                              |
| --------------------------------------- | ------------ | ------- | ------------------------------------------------------- |
| Errores de redondeo acumulativo         | Media        | Alto    | Usar biblioteca de precisión decimal (e.g., decimal.js) |
| Performance en tiempo real              | Baja         | Medio   | Optimizar con useMemo/useCallback                       |
| Inconsistencia entre frontend y backend | Alta         | Alto    | **Compartir lógica de cálculo** (utilities comunes)     |
| Configuración de impuesto ambigua       | Alta         | Alto    | **Clarificar con PO antes de implementar**              |

### 8.2 Consideraciones de Negocio

- **Legislación fiscal:** Diferentes países tienen reglas diferentes para cálculo de impuestos
- **Auditoría:** Los cálculos deben ser reproducibles y auditables
- **Transparencia:** El usuario debe poder ver cada paso del cálculo

---

## 9. Datos de Prueba Recomendados

### 9.1 Dataset Básico

```json
{
  "items": [
    { "quantity": 2, "unit_price": 50.0 },
    { "quantity": 3, "unit_price": 30.0 }
  ],
  "discount_type": "percentage",
  "discount_value": 10,
  "tax_rate": 16,
  "expected": {
    "subtotal": 190.0,
    "discount_amount": 19.0,
    "tax_amount": 27.36,
    "total": 198.36
  }
}
```

### 9.2 Dataset con Decimales Complejos

```json
{
  "items": [
    { "quantity": 2.5, "unit_price": 42.5 },
    { "quantity": 1.33, "unit_price": 33.33 }
  ],
  "discount_type": "fixed",
  "discount_value": 20.62,
  "tax_rate": 16,
  "expected": {
    "subtotal": 150.59,
    "discount_amount": 20.62,
    "tax_amount": 20.8,
    "total": 150.77
  }
}
```

### 9.3 Dataset de Edge Cases

```json
{
  "items": [{ "quantity": 1, "unit_price": 0.01 }],
  "discount_type": "percentage",
  "discount_value": 0,
  "tax_rate": 0,
  "expected": {
    "subtotal": 0.01,
    "discount_amount": 0.0,
    "tax_amount": 0.0,
    "total": 0.01
  }
}
```

---

## 10. Próximos Pasos

### 10.1 Antes de Implementar

1. **Clarificar ambigüedades** listadas en la Sección 4 con el Product Owner
2. **Definir política de redondeo** oficial
3. **Decidir sobre configuración de tax_on_discounted** (¿user-configurable o fijo?)
4. **Establecer límites de validación** (max discount, max tax rate, etc.)

### 10.2 Durante Implementación

1. Crear funciones de cálculo puras (sin efectos secundarios)
2. Escribir tests unitarios para cada función
3. Implementar reactividad con React hooks (useMemo para cálculos)
4. Agregar tests de integración

### 10.3 Antes de Release

1. Revisión de código enfocada en precisión numérica
2. Testing manual con casos extremos
3. Validación con usuario real (beta testing)
4. Documentación de fórmulas y decisiones tomadas

---

## 11. Apéndice: Preguntas para el Product Owner

1. **Orden de aplicación:** ¿El impuesto se aplica sobre el subtotal original o sobre el subtotal después del descuento?
   - [ ] Sobre subtotal original
   - [ ] Sobre subtotal - descuento
   - [ ] Configurable por el usuario

2. **Política de redondeo:** ¿Qué tipo de redondeo usar?
   - [ ] Banker's rounding (IEEE 754)
   - [ ] Half-up (redondeo tradicional)
   - [ ] Especificar otro

3. **Límite de descuentos:** ¿Qué hacer si el descuento excede el subtotal?
   - [ ] Capear al subtotal (discount_amount = subtotal)
   - [ ] Mostrar error de validación
   - [ ] Permitir (factura negativa)

4. **Factura de $0:** ¿Es válida una factura con total = 0.00?
   - [ ] Sí, permitido
   - [ ] No, mostrar advertencia

5. **Cantidades y precios negativos:** ¿Permitir valores negativos (para créditos/reembolsos)?
   - [ ] Sí
   - [ ] No

6. **Máximo de impuesto:** ¿Existe un límite para tax_rate?
   - [ ] Sí, máximo: **\_**%
   - [ ] No, sin límite

7. **Precisión de cálculos:** ¿Redondear en cada paso o solo al final?
   - [ ] Cada paso intermedio
   - [ ] Solo el total final

8. **Impuestos múltiples:** ¿Se planea soportar múltiples tasas de impuesto en el futuro?
   - [ ] Sí
   - [ ] No

---

**Elaborado por:** Warp Agent
**Revisado por:** [Pending]
**Aprobado por:** [Pending]
**Última actualización:** 2026-01-29
