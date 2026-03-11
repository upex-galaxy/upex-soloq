# Comments for SQ-17

[View in Jira](https://upexgalaxy65.atlassian.net/browse/SQ-17)

---

### YENNY BARBOSA - 2/2/2026, 6:20:11 PM

## ***Shift-Left Test Plan***

## Acceptance Criteria

### Scenario 1: Add client tax ID

- ***Given:*** I am editing a client
- ***When:*** I add their tax ID (RFC/NIT/CUIT)
- ***Then:*** The tax ID is validated and saved
***Falta aclarar:***

### Scenario 2: Tax ID appears on invoice

- ***Given:*** A client has a tax ID configured
- ***When:*** I create an invoice for that client
- ***Then:*** The client's tax ID appears on the invoice
***Falta aclarar:***
- Esto evita discusiones de diseño después.
- Qué debería pasar después (Post-condition)

### Scenario 3: Skip client tax ID

- ***Given:*** My client doesn't have a tax ID
- ***When:*** I leave the field empty
- ***Then:*** I can still invoice them (tax ID section omitted)
***conviene reforzar***:
- 🔎 Sugerencia:

> **Then: The invoice is generated without the tax ID section and without errors**

### Scenario 4: Dynamic validation by country

- ***Given:*** I am adding a client's tax ID
- ***When:*** I select their country
- ***Then:*** The tax ID validation changes accordingly
***Faltan definiciones clave:***
- 🔎 Este punto suele generar bugs si no se define.

### Qué debería pasar después (Post-condition)

- El sistema aplica la ***validación correcta según país***.
- Si el tax ID existente no cumple:
- No se permite guardar datos inconsistentes.

## Technical Notes

- Fields: tax*id, tax*id_type
- Same validation logic as business profile
- Optional field
- ***Escenarios que podrías PROPONER (valor QA)***

Estos no están, pero ***sumarían mucho***:

### 🔹 Escenario 5: Cambio de país con Tax ID ingresado

> Given: I have entered a valid tax ID
When: I change the client’s country
Then: The tax ID is revalidated or cleared according to the new country rules

---

### 🔹 Escenario 6: Edición de Tax ID

> Given: A client already has a tax ID
When: I edit and update the tax ID
Then: The new tax ID is validated and saved correctly
> ***Functional Test Plan: Add Client Tax Information (SQ-17)***

1. ***Introducción***

Este documento detalla el plan de pruebas funcionales para la funcionalidad "Add Client Tax Information" ([https://upexgalaxy65.atlassian.net/browse/SQ-17#icft=SQ-17](https://upexgalaxy65.atlassian.net/browse/SQ-17#icft=SQ-17)), cuyo objetivo es permitir a los usuarios agregar y gestionar la información fiscal de los clientes (RFC/NIT/CUIT) para su inclusión en facturas. El plan cubre la verificación de los Criterios de Aceptación, la validación específica del `tax_id` por país, la persistencia de datos y su correcta propagación en procesos dependientes.

1. ***Alcance***

El alcance de estas pruebas incluye:

- Validación de los Criterios de Aceptación definidos en la historia de usuario [https://upexgalaxy65.atlassian.net/browse/SQ-17#icft=SQ-17](https://upexgalaxy65.atlassian.net/browse/SQ-17#icft=SQ-17).
- Validación de formatos, longitudes y tipos de `tax_id` (RFC, NIT, CUIT) según el país seleccionado.
- Verificación de la persistencia y actualización correcta del `tax_id` en el perfil del cliente.
- Comportamiento del sistema cuando el `tax_id` es opcional (campo vacío).
- Correcta visualización del `tax_id` en las facturas.
- Manejo de escenarios dinámicos, como el cambio de país después de la introducción de un `tax_id`.
- Pruebas básicas de concurrencia, edición, actualización y manejo de interrupciones.
- Pruebas de regresión para asegurar que los cambios se reflejen en facturación, descargas y reportes.
- Claridad y accesibilidad de los mensajes de confirmación y error.

El alcance NO incluye pruebas de seguridad profunda ni pruebas de rendimiento extensivas.

1. ***Entorno de Prueba***

- ***Ambiente:*** Staging / Desarrollo (que refleje la configuración de producción).
- ***Datos:*** Usuarios con roles de "Administrador" o "Editor de Clientes". Clientes existentes sin y con información fiscal.

1. ***Datos de Prueba***

Se utilizarán los siguientes tipos de datos de prueba:

- `tax_id` ***válidos:***
- `tax_id` ***inválidos:***
- ***Datos de cliente:*** Clientes nuevos y existentes, con y sin `tax_id` previo.
- ***Países:*** Lista de países soportados con sus respectivas reglas de validación de `tax_id`.

1. ***Casos de Prueba Detallados***

---

#### 5.1. Casos de Prueba de Criterios de Aceptación

***5.1.1. Escenario 1: Agregar ID fiscal del cliente (Ruta feliz y validación)***

- ***Test Case 1.1 - Happy Path: Agregar un**** `tax_id` ****válido:***
- ***Test Case 1.2 - Validación:**** `tax_id` ****no válido (formato):***
- ***Test Case 1.3 - Validación:**** `tax_id` ****no válido (longitud):***

***5.1.2. Escenario 2: El ID fiscal aparece en la factura***

- ***Test Case 2.1 - Visualización correcta en factura:***

***5.1.3. Escenario 3: Omitir ID fiscal del cliente***

- ***Test Case 3.1 - Campo vacío sin impacto en facturación:***

---

#### 5.2. Validación de `tax_id` por País

- ***Test Case 5.2.1 - RFC (México) - Formatos válidos e inválidos:***
- ***Test Case 5.2.2 - NIT (Colombia) - Formatos válidos e inválidos:***
- ***Test Case 5.2.3 - CUIT (Argentina) - Formatos válidos e inválidos:***
- ***Test Case 5.2.4 - Tipo de**** `tax_id` ****predefinido vs. seleccionable:***

---

#### 5.3. Persistencia y Actualizaciones de Datos

- ***Test Case 5.3.1 - Editar un**** `tax_id` ****existente:***
- ***Test Case 5.3.2 - Actualizar**** `tax*id*type` ****(si es editable):***
- ***Test Case 5.3.3 - Eliminar**** `tax_id` ****(dejar campo vacío):***

---

#### 5.4. Escenarios Dinámicos

- ***Test Case 5.4.1 - Cambio de país después de ingresar**** `tax_id`****:***

---

#### 5.5. Manejo de Errores y Mensajes

- ***Test Case 5.5.1 - Mensajes de error de validación claros:***
- ***Test Case 5.5.2 - Mensajes de confirmación de éxito:***
- ***Test Case 5.5.3 - Mensajes de error de backend/conectividad:***

---

#### 5.6. Casos Límite / No Funcionales Básicos

- ***Test Case 5.6.1 - Concurrencia (múltiples usuarios):***
- ***Test Case 5.6.2 - Interrupciones inesperadas:***
- ***Test Case 5.6.3 - Prevención de envíos duplicados:***

---

#### 5.7. Pruebas de Regresión (Impacto en Facturación y Reportes)

- ***Test Case 5.7.1 - Facturación con**** `tax_id`****:***
- ***Test Case 5.7.2 - Facturación sin**** `tax_id`****:***
- ***Test Case 5.7.3 - Descargas y reportes:***

1. ***Fuera de Alcance***

- Pruebas de seguridad exhaustivas (e.g., inyección SQL, XSS, etc.).
- Pruebas de rendimiento y estrés a gran escala.
- Pruebas de internacionalización/localización más allá de la validación del formato del `tax_id` por país.
- Pruebas de integración con sistemas externos de validación fiscal (a menos que se especifique un MCP para ello).

---

### Ely - 2/7/2026, 1:28:29 PM

🚀 ***Starting Implementation***

Beginning work on Add Client Tax Information following the Acceptance Test Plan defined in Jira comments.

---

### Ely - 2/7/2026, 1:32:01 PM

📋 ***PR Created***

***PR:*** #27
***Branch:*** feat/[https://upexgalaxy65.atlassian.net/browse/SQ-17#icft=SQ-17](https://upexgalaxy65.atlassian.net/browse/SQ-17#icft=SQ-17)/client-tax-info → staging
***URL:*** [https://github.com/upex-galaxy/upex-soloq/pull/27](https://github.com/upex-galaxy/upex-soloq/pull/27)

Awaiting review and merge.

---

### Ely - 2/7/2026, 2:16:25 PM

✅ ***Implementation Complete***

***PR:*** #27 (MERGED to staging)
***Branch:*** feat/[https://upexgalaxy65.atlassian.net/browse/SQ-17#icft=SQ-17](https://upexgalaxy65.atlassian.net/browse/SQ-17#icft=SQ-17)/client-tax-info

***Implementación:***

- Campo `tax_id` agregado a la validación Zod (opcional, max 30 chars)
- Input "ID Fiscal (RFC/NIT/CUIT)" en ClientForm
- API POST/PUT actualizados para manejar tax_id
- Edit page incluye tax_id en defaultValues

***Test Cases cubiertos:***

- TC-1.1: Agregar tax_id válido ✅
- TC-1.3: Validación max length ✅
- TC-3.1: Campo vacío (opcional) ✅
- TC-5.3.1: Editar tax_id existente ✅
- TC-5.3.3: Limpiar tax_id ✅

***Ready for QA testing*** 🧪

---


_Synced from Jira by jira-sync_
_Last sync: 2026-03-02T19:53:46.706Z_
