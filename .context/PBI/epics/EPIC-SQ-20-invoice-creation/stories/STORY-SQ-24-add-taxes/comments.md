# Comments for SQ-24

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-24)

---

### Gloria Jesely Galindez Suárez - 1/31/2026, 3:28:05 PM

1. 🧪 Shift-Left Test Cases: Add Taxes to Invoice ([https://upexgalaxy65.atlassian.net/browse/SQ-24#icft=SQ-24](https://upexgalaxy65.atlassian.net/browse/SQ-24#icft=SQ-24))

****Analysis Date:**** 2026-01-31
****Context:**** EPIC-SQ-20 (Invoice Creation) | SRS FR-015
****Status:**** Ready for Review

—

1. 

1. 

-   ****Fórmula Correcta:**** `Total = (Subtotal - Descuento) + Impuesto`
-   ****Base Imponible:***** El impuesto se aplica *****DESPUÉS**** del descuento.
-   ****Restricción Técnica:**** Base de datos soporta `DECIMAL(5,2)` para la tasa (max 999.99, min -999.99), pero funcionalmente restringiremos a positivos y < 100% (soft limit).

1. 

-   ****Redondeo:**** Se asume "Standard Rounding (Half-Up)" a 2 decimales para coincidir con `DECIMAL(10,2)` en `tax_amount`.
-   ****Multi-tasa:**** MVP soporta una única tasa de impuesto por factura (según DB Schema `invoices.tax_rate`).

—

1. 

1. 

-   ****Given:***** Estoy creando una factura con Subtotal = *****$1,000.00***** y Descuento = *****$0.00****.
-   ****When:***** Ingreso *****"16"**** en el campo de impuesto.
-   ****Then:****
-   El `tax_amount` se calcula como ****$160.00****.
-   El `total` final es ****$1,160.00****.
-   El input muestra formato correcto ("16%").

1. 

-   ****Given:***** Factura con Subtotal = *****$100.00***** y un Descuento de *****$20.00**** (Base imponible = $80.00).
-   ****When:***** Aplico un impuesto del *****10%****.
-   ****Then:****
-   El `tax_amount` es ****$8.00**** (10% de $80, NO de $100).
-   El `total` es ****$88.00****.

1. 

-   ****Given:**** Factura activa.
-   ****When:***** Ingreso *****"0"**** o dejo el campo vacío.
-   ****Then:****
-   `tax_amount` es ****$0.00****.
-   El indicador de impuestos muestra "0%" o "Exento".

1. 

-   ****Given:***** Factura con impuesto del *****15%**** ya aplicado.
-   ****When:**** Modifico un ítem de línea aumentando su precio.
-   ****Then:****
-   El `subtotal` cambia.
-   El `tax_amount` se recalcula ****automáticamente**** sin tener que volver a tocar el campo de impuestos.

—

1. 

1. 

1.  ****Validar [rechazo de negativos] [al ingresar "-5"]****

-   ***Step:*** Intentar escribir "-5" o presionar flecha abajo desde 0.
-   ***Expected:*** El input impide el negativo o toma el valor absoluto (5%). El sistema fiscal no maneja tasas negativas en este contexto.

2.  ****Validar [precisión decimal] [al ingresar "10.555"]****

-   ***Step:*** Ingresar 3 decimales.
-   ***Expected:*** El sistema redondea a 2 decimales (10.56%) o trunca (10.55%) según configuración global, pero no rompe la UI.

3.  ****Validar [sanitización de texto] [al pegar "IVA 16%"]****

-   ***Step:*** Pegar texto alfanumérico en el input numérico.
-   ***Expected:*** Se extrae solo el valor numérico ("16") o se ignora la entrada no válida.

1. 

4.  ****Validar [redondeo monetario] [en borde de centavo]****

-   ***Context:*** Subtotal $10.55, Tax 19%. (Math: 2.0045) -> Tax: $2.00
-   ***Context:*** Subtotal $10.55, Tax 21%. (Math: 2.2155) -> Tax: $2.22 (Round Half-Up check).

1. 

5.  ****Validar [presets rápidos] [vía teclado]****

-   ***Step:*** Hacer foco en impuestos, usar `Tab` o `Flechas` para navegar a los presets (0%, 16%, etc.) y seleccionar con `Enter`.
-   ***Expected:*** El valor se aplica sin necesidad de ratón.

6.  ****Validar [lectura de pantalla] [al actualizar total]****

-   ***Step:*** Cambiar impuesto con Screen Reader activo.
-   ***Expected:*** El nuevo Total Calculado debe ser anunciado (usando `aria-live` o similar) para que el usuario no visual sepa que el monto cambió.

1. 

7.  ****Validar [persistencia de tasa] [al guardar borrador]****

-   ***Step:*** Crear factura, poner impuesto 15%, guardar como Draft (`SQ-30`), recargar página.
-   ***Expected:*** El campo de impuesto mantiene "15%" y los cálculos son consistentes.

—

1. 

****@Dev Team:****
1.  Confirmar que la librería de manejo de moneda (ej. `currency.js` o `Intl`) esté configurada para ****Round Half-Up****.
2.  Asegurar que el evento `onChange` de los ítems de línea propague el recalculo hacia el componente de totales (State Lifting o Context).

****@PO:****
¿Necesitamos un tope máximo para la tasa (Hard Limit)? (Sugerencia: Bloquear > 100% para evitar errores de dedo como "1600%").

---

### Gloria Jesely Galindez Suárez - 2/2/2026, 4:59:39 PM

1. 🧪 Shift-Left Test Cases: STORY-SQ-24 - Add Taxes to Invoice

****Fecha:**** 2026-01-31
****QA Engineer:**** Gemini AI
****Story Jira Key:**** [https://upexgalaxy65.atlassian.net/browse/SQ-24#icft=SQ-24](https://upexgalaxy65.atlassian.net/browse/SQ-24#icft=SQ-24)
****Epic:**** [https://upexgalaxy65.atlassian.net/browse/SQ-20#icft=SQ-20](https://upexgalaxy65.atlassian.net/browse/SQ-20#icft=SQ-20) - Invoice Creation
****Status:**** Draft | Pending Approval

—

1. 

1. 

-   ****Riesgo de Negocio:**** Un cálculo incorrecto (incluso por centavos debido a mal redondeo) invalida la factura ante entidades fiscales (SAT, DIAN, AFIP), causando multas o rechazo de pagos al freelancer.
-   ****User Persona:**** Freelancer que necesita profesionalismo y cumplimiento legal sin ser contador.

1. 

-   Incorrecto: `Total = Subtotal * (1 + Tasa)`
-   ****Correcto (SRS):***** `Base Imponible = Subtotal - Descuento` -> `Impuesto = Base Imponible ** (Tasa / 100)` -> `Total = Base Imponible + Impuesto`.
-   ***Impacto:**** El orden de factores *****sí**** altera el producto. Las pruebas deben validar esto estrictamente.
2.  ****Tipos de Datos:****
-   `tax_rate`: `DECIMAL(5,2)` (Permite ej. 16.00, 10.50, 0.00).
-   `tax_amount`: `DECIMAL(10,2)` (Moneda con 2 decimales).
3.  ****Persistencia:**** Se guardan ambos valores. Si se edita la factura, ambos deben recalcularse y guardarse.

—

1. 

1. 

-   ***Resolución:**** Asumiremos *****"Round Half Up"**** (estándar comercial) a 2 decimales para coincidir con la DB.
2.  ****Impuestos Compuestos vs. Simples:****
-   ***Resolución:**** El esquema DB tiene una sola columna `tax_rate`, por lo que el MVP soporta *****un solo impuesto**** por factura.

1. 

-   ****Tasa Decimal:**** Países con tasas no enteras (ej. Costa Rica 13%, pero algunos productos al 10.5%). El campo debe aceptar decimales.
-   ****Edición Post-Cálculo:***** Usuario cambia el precio de un ítem ****después*** de haber configurado el impuesto. El impuesto debe recalcularse solo.
-   ****Pegado de Texto:**** Usuario pega "16 %" (con símbolo y espacio). El sistema debe sanitizarlo.

—

1. 

1. 

-   ****Given:**** I am creating an invoice with:
-   Item 1: $500.00
-   Item 2: $500.00
-   ****Subtotal:**** $1,000.00
-   ****Discount:**** $0.00
-   ****When:***** I enter *****"16"**** in the "Tax Rate" field.
-   ****Then:****
-   The ****Tax Amount***** is calculated as *****$160.00****.
-   The ****Total***** updates to *****$1,160.00****.
-   The input field displays "16%".

1. 

-   ****Given:**** I am creating an invoice with:
-   ****Subtotal:**** $1,000.00
-   ****Discount:**** $100.00 (Fixed)
-   ***Taxable Base:*** $900.00
-   ****When:***** I enter *****"10"**** in the "Tax Rate" field.
-   ****Then:****
-   The ****Tax Amount***** is calculated as *****$90.00**** (10% of 900).
-   ***Constraint:*** It must NOT be $100.00 (10% of 1000).
-   The ****Total***** updates to *****$990.00**** ($900 + $90).

1. 

-   ****Given:***** I am creating an invoice with *****Subtotal: $100.00****.
-   ****When:***** I enter *****"10.5"**** in the "Tax Rate" field.
-   ****Then:****
-   The input accepts the decimal point.
-   The ****Tax Amount***** is calculated as *****$10.50****.
-   The ****Total***** updates to *****$110.50****.

1. 

-   ****Given:**** I have an invoice with items.
-   ****When:***** I enter *****"0"**** or clear the tax field.
-   ****Then:****
-   The ****Tax Amount***** is *****$0.00****.
-   The ****Total***** is equal to the *****Taxable Base****.

—

1. 

1. 

1.  ****Validar [bloqueo de negativos] [al ingresar "-16"]****

-   ***Input:*** "-16"
-   ***Expected:*** El input ignora el signo negativo o lo convierte a positivo absoluto (16). No se permiten impuestos negativos (retenciones) en este campo en el MVP.

2.  ****Validar [sanitización] [al pegar texto formateado]****

-   ***Input:*** Paste "16%" o "IVA 16"
-   ***Expected:*** El sistema extrae "16" y realiza el cálculo correctamente. No muestra `NaN`.

3.  ****Validar [límite de rango] [al ingresar "> 100%"]****

-   ***Input:*** "120"
-   ***Expected:*** Mostrar warning visual "¿La tasa de impuesto es correcta?" o bloqueo suave (Soft limit), ya que técnicamente es posible pero improbable.

1. 

4.  ****Validar [redondeo Half-Up] [en tercer decimal = 5]****

-   ***Data:**** Base $10.55 ** 19% = $2.0045
-   ***Expected:**** Tax Amount = *****$2.00**** (Round down/nearest).
-   ***Data:**** Base $10.55 ** 21% = $2.2155
-   ***Expected:**** Tax Amount = *****$2.22**** (Round up).

1. 

5.  ****Validar [re-cálculo reactivo] [al cambiar ítems]****

-   ***Pre:*** Factura con Items=$100, Tax=10% (Total=$110).
-   ***Action:*** Cambiar precio del Item a $200.
-   ***Expected:*** Tax Amount sube automáticamente a $20 (sin tocar el campo de tax). Total sube a $220.

6.  ****Validar [re-cálculo reactivo] [al cambiar descuento]****

-   ***Pre:*** Factura $100, Tax 10%, Desc $0 (Tax=$10).
-   ***Action:*** Agregar Descuento $50.
-   ***Expected:*** Tax Amount baja automáticamente a $5 (10% de $50).

—

1. 

1.  ****¿Retenciones?***** En algunos países (MX, AR) existen "Retenciones de IVA/ISR" que ****restan**** al total. Esta historia solo dice "Add Taxes". ¿Confirmamos que retenciones están *****Out of Scope**** para esta US?

-   ***Recomendación QA:*** Marcar como Out of Scope para MVP y crear nueva US si se requiere.
2.  ****¿Impuestos por Ítem?***** ¿Confirmamos que el impuesto es *****Global**** para toda la factura y no por línea? (El esquema de BD lo sugiere, pero es una duda frecuente).

---

### Ely - 2/8/2026, 12:07:17 AM

Feature implementada y desplegada en staging.

***PR:*** [#32](https://github.com/upex-galaxy/upex-soloq/pull/32) (MERGED)
***Branch:*** feat/[https://upexgalaxy65.atlassian.net/browse/SQ-24#icft=SQ-24](https://upexgalaxy65.atlassian.net/browse/SQ-24#icft=SQ-24)/add-taxes-invoice

## Cambios implementados:

- Input de tasa de impuesto con presets LATAM (0%, 8%, 16%, 19%, 21%)
- Utilidades de cálculo con redondeo correcto (Round Half-Up)
- Resumen de factura mostrando subtotal, impuesto y total
- API acepta y calcula montos de impuesto server-side

## Test Cases cubiertos:

| ***TC **** | ****Descripción **** | ****Estado *** |
| --- | --- | --- |
| TC-01  | Cálculo estándar de impuesto (16% sobre $1000 = $160)  | Cubierto  |
| TC-02  | Impuesto sobre monto descontado (impuesto después de descuento)  | Cubierto  |
| TC-03  | Manejo de tasa decimal (10.5%)  | Cubierto  |
| TC-04  | Sin impuesto / Exento (0% = sin impuesto)  | Cubierto  |
| TC-05  | Validaciones de input (no negativos, máx 100)  | Cubierto  |
| TC-07  | Persistencia (guardar y recuperar tasa)  | Cubierto  |

@@Gloria Jesely Galindez Suárez La funcionalidad está lista para pruebas en el ambiente de staging.

---

### Gloria Jesely Galindez Suárez - 2/21/2026, 8:38:27 PM

# 🧪 Reporte de Pruebas Exploratorias

***Fecha:*** 21-02-2026
***Funcionalidad:*** SQ-24: Agregar Impuestos a la Factura
***Ambiente:*** Staging
***QA Engineer:*** Gloria Galindez

---

## Resumen Ejecutivo

- ***Estado General:**** ✅ ****APROBADO*** (con 1 Observación Menor)
- ***Escenarios Probados:*** 5 de 5
- ***Problemas Encontrados:*** 1 (UX Menor)

La funcionalidad de cálculo de impuestos, manejo de decimales y la reactividad ante cambios en los ítems funcionan correctamente según las especificaciones.

---

## Escenarios Probados

### 1. Happy Path (Impuesto Estándar) - ✅ APROBADO
- ***Acción:*** Se agregó un ítem ($100) y se seleccionó el preset "16%".
- ***Resultado:***
  - Subtotal: $100.00
  - Impuesto: $16.00 (Calculado correctamente)
  - Total: $116.00
  - UI: El resumen muestra "IVA 16%".

### 2. Impuesto Cero (0%) - ✅ APROBADO
- ***Acción:*** Se seleccionó el preset "0%".
- ***Resultado:***
  - Impuesto: $0.00
  - Total: $100.00 (Igual al subtotal).

### 3. Tasas de Impuesto Decimales - ✅ APROBADO
- ***Acción:*** Se ingresó manualmente "10.5%".
- ***Resultado:***
  - Impuesto: $10.50 (10.5% de $100).
  - Total: $110.50.
  - El sistema maneja correctamente las tasas con decimales.

### 4. Reactividad (Actualización de Estado) - ✅ APROBADO
- ***Acción:*** Con un impuesto del 5% aplicado ($5.00), se cambió el precio del ítem de $100 a $200.
- ***Resultado:***
  - El impuesto se recalculó automáticamente a $10.00 (5% de $200).
  - El total se actualizó a $210.00.
  - No fue necesario volver a ingresar el campo de impuestos.

### 5. Validación de Entrada (Números Negativos) - ⚠️ OBSERVACIÓN
- ***Acción:*** Se intentó escribir "-5" en el campo de impuesto.
- ***Esperado:*** Bloquear el signo negativo o ignorar la entrada.
- ***Actual:*** El sistema eliminó el signo negativo pero aceptó el número, resultando en "05" (5% positivo).
- ***Impacto:*** Bajo. No rompe el cálculo (usa valor absoluto), pero podría confundir a usuarios que esperen impuestos negativos (retenciones).

---

## Recomendaciones

1.  ***Automatización:**** Es seguro proceder con la automatización de los escenarios ****Happy Path**** y ****Reactividad***, ya que el comportamiento es estable.
2.  ***Mejora de UX:*** Refinar la validación de entrada para prevenir estrictamente el ingreso de caracteres negativos en una futura iteración de pulido.

---

***Estado Final:*** SQ-24 cumple con los criterios de aceptación funcionales críticos y está lista para aceptación formal o despliegue.

---

### Gloria Jesely Galindez Suárez - 2/21/2026, 8:52:14 PM

# 🗄️ Análisis de Necesidad de Pruebas de Base de Datos

***Fecha:*** 21-02-2026
***QA Engineer:*** Gloria Galindez
***Contexto:*** Validación de Integridad de Datos para SQ-24

---

## ⚖️ Veredicto: RECOMENDADO (Nivel Medio)

Aunque la funcionalidad visual en el frontend es correcta, ***se recomienda realizar validaciones ligeras a nivel de base de datos***.

No es bloqueante para el despliegue inmediato si se asume riesgo bajo, pero existen ***3 razones técnicas de peso*** para verificar la integridad de los datos financieros:

1.  ***Precisión Decimal:*** Asegurar que valores como `$10.50` se guarden como `DECIMAL` exacto y no sufran truncamiento o problemas de punto flotante (`10.49999`) al persistirse.
2.  ***Persistencia Dual:*** Confirmar que se están guardando tanto `tax*rate` como `tax*amount`. Si falta el `tax_rate`, futuras ediciones o generaciones de PDF podrían fallar.
3.  ***Restricciones (Constraints):*** Verificar si la base de datos protege contra impuestos negativos (que el frontend permitió parcialmente en la exploración).

---

## 📋 Plan de Pruebas de DB Sugerido

Se sugiere ejecutar las siguientes consultas de verificación (SQL) para certificar la calidad de los datos:

### 1. Verificación de Guardado Exacto
Confirmar que los montos mostrados en pantalla coinciden bit a bit con lo almacenado.

```sql
SELECT subtotal, tax*rate, tax*amount, total
FROM invoices
ORDER BY created_at DESC
LIMIT 1;
```

### 2. Prueba de Integridad Matemática
Detectar si existen registros donde la suma no cuadre (corrupción lógica).

```sql
SELECT id, invoice*number, subtotal, tax*amount, total
FROM invoices
WHERE ROUND(subtotal + tax_amount, 2) != total;
-- Debería retornar 0 filas
```

### 3. Verificación de Nulos
Asegurar que no se guarden valores `NULL` en `tax_rate` (debería ser `0` por defecto).

```sql
SELECT count(*) 
FROM invoices 
WHERE tax_rate IS NULL;
```

---

***Recomendación Final:**** Ejecutar al menos la ****Verificación 1*** antes del cierre definitivo de la historia para garantizar la integridad financiera de los datos.

---

### Gloria Jesely Galindez Suárez - 2/23/2026, 9:13:11 PM

# 🛡️ Reporte de Pruebas de Base de Datos & E2E (Final)

***Fecha:*** 21-02-2026
***QA Engineer:*** Gloria Galindez
***Feature:*** SQ-24: Add Taxes to Invoice
***Ambiente:*** Staging & Database (PostgreSQL)

---

## 1. Resumen Ejecutivo

Se completó el ciclo de pruebas de integración ***End-to-End (UI → API → DB)*** para validar la funcionalidad de impuestos.

- ***Integridad de Datos:**** ✅ ****VERIFICADO*** (Precisión decimal y persistencia correcta).
- ***Flujo E2E:**** ✅ ****PASÓ*** (Creación desde UI y validación en DB).
- ***Seguridad de Datos:**** ⚠️ ****OBSERVACIÓN*** (Falta constraint en BD para impedir negativos).

---

## 2. Validación de Persistencia (Happy Path)

Se creó una factura desde la UI y se verificó su representación exacta en la base de datos.

***Datos de Prueba (UI):***
- ***Subtotal:*** $100.00
- ***Impuesto:*** 16%
- ***Total Esperado:*** $116.00

***Evidencia en Base de Datos (Query SQL):***
```sql
SELECT id, subtotal, tax*rate, tax*amount, total FROM invoices WHERE invoice_number = 'INV-2026-0001';
```

***Resultado:***
| Campo | Valor UI | Valor DB | Estado |
| :--- | :--- | :--- | :--- |
| `subtotal` | 100.00 | `100.00` | ✅ Exacto |
| `tax_rate` | 16% | `16.00` | ✅ Exacto |
| `tax_amount` | $16.00 | `16.00` | ✅ Exacto |
| `total` | $116.00 | `116.00` | ✅ Exacto |

***Conclusión:*** La lógica de cálculo y persistencia funciona correctamente. No hay pérdida de precisión decimal.

---

## 3. Pruebas de Constraints (Integridad)

Se evaluó la robustez de la base de datos ante datos inválidos (Impuestos Negativos).

***Prueba:*** Intento de actualización directa vía SQL con tasa negativa.
```sql
UPDATE invoices SET tax_rate = -10 WHERE id = '...';
```

***Resultado:**** ❌ ****El UPDATE fue permitido.***
La base de datos aceptó un `tax_rate` de `-10.00`.

***Impacto:***
Actualmente dependemos 100% de la validación del Frontend/API. Si esa capa falla (o se accede directo a la DB), se podrían generar facturas con impuestos negativos, afectando los reportes financieros.

---

## 4. Recomendaciones Finales

1.  ***Aprobación:*** La funcionalidad está lista para despliegue (Go Live), ya que el flujo principal y los cálculos son correctos.
2.  ***Mejora Técnica (Deuda):**** Agregar un ****Check Constraint*** en la base de datos en el próximo sprint de mantenimiento:
    ```sql
    ALTER TABLE invoices ADD CONSTRAINT check*tax*rate*positive CHECK (tax*rate >= 0);
    ```

---

***Estado del Ticket:*** QA Verified (Ready for Release)

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:51.236Z_
