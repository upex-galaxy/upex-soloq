### Functional Test Plan: Add Client Tax Information (SQ-17)

**1. Introducción**

Este documento detalla el plan de pruebas funcionales para la funcionalidad "Add Client Tax Information" (SQ-17), cuyo objetivo es permitir a los usuarios agregar y gestionar la información fiscal de los clientes (RFC/NIT/CUIT) para su inclusión en facturas. El plan cubre la verificación de los Criterios de Aceptación, la validación específica del `tax_id` por país, la persistencia de datos y su correcta propagación en procesos dependientes.

**2. Alcance**

El alcance de estas pruebas incluye:

*   Validación de los Criterios de Aceptación definidos en la historia de usuario SQ-17.
*   Validación de formatos, longitudes y tipos de `tax_id` (RFC, NIT, CUIT) según el país seleccionado.
*   Verificación de la persistencia y actualización correcta del `tax_id` en el perfil del cliente.
*   Comportamiento del sistema cuando el `tax_id` es opcional (campo vacío).
*   Correcta visualización del `tax_id` en las facturas.
*   Manejo de escenarios dinámicos, como el cambio de país después de la introducción de un `tax_id`.
*   Pruebas básicas de concurrencia, edición, actualización y manejo de interrupciones.
*   Pruebas de regresión para asegurar que los cambios se reflejen en facturación, descargas y reportes.
*   Claridad y accesibilidad de los mensajes de confirmación y error.

El alcance NO incluye pruebas de seguridad profunda ni pruebas de rendimiento extensivas.

**3. Entorno de Prueba**

*   **Ambiente:** Staging / Desarrollo (que refleje la configuración de producción).
*   **Datos:** Usuarios con roles de "Administrador" o "Editor de Clientes". Clientes existentes sin y con información fiscal.

**4. Datos de Prueba**

Se utilizarán los siguientes tipos de datos de prueba:

*   **`tax_id` válidos:**
    *   RFC (México): e.g., `XAXX010101000`, `ABCD800101ABC`
    *   NIT (Colombia): e.g., `900123456-1`, `800123456-NIT`
    *   CUIT (Argentina): e.g., `20123456789`, `27123456784`
    *   Otros formatos de `tax_id` relevantes para países soportados.
*   **`tax_id` inválidos:**
    *   Longitud incorrecta.
    *   Caracteres especiales no permitidos.
    *   Formato que no coincide con la lógica de validación del país.
    *   `tax_id` duplicados (si aplica alguna restricción).
*   **Datos de cliente:** Clientes nuevos y existentes, con y sin `tax_id` previo.
*   **Países:** Lista de países soportados con sus respectivas reglas de validación de `tax_id`.

**5. Casos de Prueba Detallados**

---

#### 5.1. Casos de Prueba de Criterios de Aceptación

**5.1.1. Escenario 1: Agregar ID fiscal del cliente (Ruta feliz y validación)**

*   **Test Case 1.1 - Happy Path: Agregar un `tax_id` válido:**
    *   **Pasos:** Como usuario, edito un cliente, ingreso un `tax_id` válido para el país seleccionado y guardo.
    *   **Resultado Esperado:** El `tax_id` se valida correctamente y se guarda en el perfil del cliente.

*   **Test Case 1.2 - Validación: `tax_id` no válido (formato):**
    *   **Pasos:** Como usuario, edito un cliente, ingreso un `tax_id` con formato incorrecto y guardo.
    *   **Resultado Esperado:** Se muestra un mensaje de error claro indicando que el formato del `tax_id` es inválido y el `tax_id` no se guarda.

*   **Test Case 1.3 - Validación: `tax_id` no válido (longitud):**
    *   **Pasos:** Como usuario, edito un cliente, ingreso un `tax_id` con una longitud incorrecta (demasiado corto/largo) y guardo.
    *   **Resultado Esperado:** Se muestra un mensaje de error claro indicando la longitud incorrecta y el `tax_id` no se guarda.

**5.1.2. Escenario 2: El ID fiscal aparece en la factura**

*   **Test Case 2.1 - Visualización correcta en factura:**
    *   **Pasos:** Configuro un cliente con un `tax_id` válido. Creo una factura para este cliente. Visualizo la factura.
    *   **Resultado Esperado:** El `tax_id` del cliente aparece en la sección fiscal correspondiente de la factura, con el formato adecuado y, si aplica, indicando el tipo de identificador fiscal.

**5.1.3. Escenario 3: Omitir ID fiscal del cliente**

*   **Test Case 3.1 - Campo vacío sin impacto en facturación:**
    *   **Pasos:** Edito un cliente y dejo el campo `tax_id` vacío. Guardo los cambios. Creo una factura para este cliente.
    *   **Resultado Esperado:** La ausencia del `tax_id` no genera advertencias ni errores. El flujo de facturación continúa sin interrupciones y la factura no muestra espacios vacíos inesperados donde debería ir el `tax_id`.

---

#### 5.2. Validación de `tax_id` por País

*   **Test Case 5.2.1 - RFC (México) - Formatos válidos e inválidos:**
    *   **Pasos:** Seleccionar "México" como país. Ingresar RFC de persona física/moral válido. Ingresar RFC inválido (e.g., caracteres incorrectos, longitud).
    *   **Resultado Esperado:** Validación correcta para RFC. Mensajes de error específicos para formatos incorrectos.

*   **Test Case 5.2.2 - NIT (Colombia) - Formatos válidos e inválidos:**
    *   **Pasos:** Seleccionar "Colombia" como país. Ingresar NIT válido. Ingresar NIT inválido.
    *   **Resultado Esperado:** Validación correcta para NIT. Mensajes de error específicos.

*   **Test Case 5.2.3 - CUIT (Argentina) - Formatos válidos e inválidos:**
    *   **Pasos:** Seleccionar "Argentina" como país. Ingresar CUIT válido. Ingresar CUIT inválido.
    *   **Resultado Esperado:** Validación correcta para CUIT. Mensajes de error específicos.

*   **Test Case 5.2.4 - Tipo de `tax_id` predefinido vs. seleccionable:**
    *   **Pasos:** Verificar si el `tax_id_type` se infiere automáticamente por el país o si es un campo seleccionable por el usuario.
    *   **Resultado Esperado:** El comportamiento es consistente con la especificación (e.g., si es predefinido, no debe ser editable; si es seleccionable, debe influir en la validación).

---

#### 5.3. Persistencia y Actualizaciones de Datos

*   **Test Case 5.3.1 - Editar un `tax_id` existente:**
    *   **Pasos:** Agrego un `tax_id` a un cliente. Luego edito el cliente y modifico el `tax_id` por otro válido. Guardo.
    *   **Resultado Esperado:** El `tax_id` se actualiza correctamente en el perfil del cliente y persiste tras recargas de página.

*   **Test Case 5.3.2 - Actualizar `tax_id_type` (si es editable):**
    *   **Pasos:** Si `tax_id_type` es editable, modifico el tipo de un `tax_id` existente y guardo.
    *   **Resultado Esperado:** El `tax_id_type` se actualiza y persiste.

*   **Test Case 5.3.3 - Eliminar `tax_id` (dejar campo vacío):**
    *   **Pasos:** Edito un cliente con `tax_id` existente, borro el contenido del campo `tax_id` y guardo.
    *   **Resultado Esperado:** El `tax_id` se elimina del perfil del cliente, y el campo aparece vacío.

---

#### 5.4. Escenarios Dinámicos

*   **Test Case 5.4.1 - Cambio de país después de ingresar `tax_id`:**
    *   **Pasos:** Ingreso un `tax_id` válido para el País A. Luego cambio el país a País B.
    *   **Resultado Esperado:** El sistema debe revalidar el `tax_id` según las reglas del País B. Idealmente, limpia el campo o solicita la corrección si el formato es incompatible. No debe permitir guardar un `tax_id` inválido para el nuevo país.

---

#### 5.5. Manejo de Errores y Mensajes

*   **Test Case 5.5.1 - Mensajes de error de validación claros:**
    *   **Pasos:** Intento guardar un `tax_id` con diferentes tipos de errores de validación (formato, longitud, caracteres).
    *   **Resultado Esperado:** Los mensajes de error son específicos, informativos, visibles al usuario y no ambiguos. Diferencian claramente errores de formato vs. longitud, etc.

*   **Test Case 5.5.2 - Mensajes de confirmación de éxito:**
    *   **Pasos:** Agrego/Edito un `tax_id` exitosamente.
    *   **Resultado Esperado:** Se muestra un mensaje de confirmación claro (e.g., "Información fiscal guardada con éxito").

*   **Test Case 5.5.3 - Mensajes de error de backend/conectividad:**
    *   **Pasos:** (Simulación, si es posible) Provoco un error de backend o de conectividad al intentar guardar el `tax_id`.
    *   **Resultado Esperado:** Mensajes de error que diferencien problemas de validación de problemas de sistema o red.

---

#### 5.6. Casos Límite / No Funcionales Básicos

*   **Test Case 5.6.1 - Concurrencia (múltiples usuarios):**
    *   **Pasos:** Dos usuarios intentan actualizar el `tax_id` del mismo cliente simultáneamente.
    *   **Resultado Esperado:** El sistema maneja la concurrencia de forma segura, evitando pérdidas de datos (e.g., usando mecanismos de bloqueo o la última actualización prevalece).

*   **Test Case 5.6.2 - Interrupciones inesperadas:**
    *   **Pasos:** Ingreso un `tax_id` y, antes de guardar, recargo la página o simulo una pérdida de conexión.
    *   **Resultado Esperado:** Los datos no guardados se pierden o el sistema informa sobre la interrupción. No debe corromperse el estado.

*   **Test Case 5.6.3 - Prevención de envíos duplicados:**
    *   **Pasos:** Hago clic repetidamente en el botón "Guardar" después de ingresar un `tax_id`.
    *   **Resultado Esperado:** El sistema previene el envío duplicado de datos (e.g., deshabilitando el botón después del primer clic, mostrando un spinner de carga).

---

#### 5.7. Pruebas de Regresión (Impacto en Facturación y Reportes)

*   **Test Case 5.7.1 - Facturación con `tax_id`:**
    *   **Pasos:** Creo facturas para clientes con `tax_id` configurado y verifico su correcta generación y contenido.
    *   **Resultado Esperado:** Las facturas se generan correctamente, incluyendo el `tax_id` en el lugar adecuado.

*   **Test Case 5.7.2 - Facturación sin `tax_id`:**
    *   **Pasos:** Creo facturas para clientes sin `tax_id` configurado y verifico su correcta generación y contenido.
    *   **Resultado Esperado:** Las facturas se generan correctamente, sin mostrar el campo `tax_id` o mostrando un campo vacío sin errores visuales.

*   **Test Case 5.7.3 - Descargas y reportes:**
    *   **Pasos:** Descargo una factura o genero un reporte que deba incluir la información fiscal del cliente, verificando la presencia y el formato del `tax_id`.
    *   **Resultado Esperado:** El `tax_id` se incluye correctamente en los documentos descargados/reportes.

**6. Fuera de Alcance**

*   Pruebas de seguridad exhaustivas (e.g., inyección SQL, XSS, etc.).
*   Pruebas de rendimiento y estrés a gran escala.
*   Pruebas de internacionalización/localización más allá de la validación del formato del `tax_id` por país.
*   Pruebas de integración con sistemas externos de validación fiscal (a menos que se especifique un MCP para ello).
