## Plan de Pruebas de Aceptacion - Generado 2026-02-09

**QA Engineer:** AI-Generated
**Status:** Borrador - Pendiente de revision PO/Dev

---

# Plan de Pruebas de Aceptacion: STORY-SQ-43 - Incluir PDF adjunto en email

**Fecha:** 2026-02-09
**QA Engineer:** AI-Generated
**Story Jira Key:** SQ-43
**Epic:** EPIC-SQ-37 - Invoice Sending
**Status:** Borrador

---

## Paso 1: Analisis Critico

### Contexto de Negocio de esta Story

**Persona de usuario afectada:**

- **Primaria:** Carlos - necesita facturas profesionales enviadas sin pasos manuales
- **Secundaria:** Valentina - requiere envio confiable para cobrar a tiempo

**Valor de negocio:**

- **Propuesta de valor:** El email incluye el PDF para que el cliente reciba la factura sin friccion
- **Impacto de negocio:** Soporta el KPI de facturas enviadas por email y reduce el tiempo a la primera factura

**Recorrido de usuario relacionado:**

- Recorrido: J1 Registro y Primera Factura
- Paso: Paso 13-14 (enviar factura y confirmar envio)

---

### Contexto Tecnico de esta Story

**Componentes de arquitectura:**

**Frontend:**

- Componentes: accion de envio en detalle de factura, envio rapido en lista, modal de preview del email
- Paginas/Rutas: /invoices, /invoices/[id]
- Gestion de estado: React state + server actions

**Backend:**

- Endpoints API: POST /api/invoices/{invoiceId}/send, GET /api/invoices/{invoiceId}/pdf
- Servicios: generador PDF (@react-pdf/renderer), envio de email (Resend)
- Base de datos: invoices, invoice_items, business_profiles, clients, payment_methods, email_logs, invoice_events

**Servicios externos:**

- Resend API (envio de email)
- Supabase Storage (cache de PDF opcional)

**Puntos de integracion:**

- Frontend a Backend API (envio de factura)
- Backend a generador PDF (crear adjunto)
- Backend a Resend (envio de email con adjunto)
- Backend a DB (email_logs, invoice_events, estado de factura)
- Backend a Storage (cache opcional)

---

### Analisis de complejidad de la Story

**Complejidad global:** Media

**Factores de complejidad:**

- Complejidad de logica de negocio: Media - reglas de adjunto, nombre, tamano
- Complejidad de integracion: Media - PDF generator + Resend + logging en DB
- Complejidad de validacion de datos: Media - limites de tamano, MIME type, naming
- Complejidad de UI: Baja - se apoya en flujo de envio existente

**Esfuerzo de testing estimado:** Medio
**Razon:** Multiples integraciones y restricciones de archivo

---

### Contexto a Nivel Epica (FTP en Jira)

**Riesgos criticos ya identificados a nivel epica:**

- Riesgo 1: fallo en generacion/adjunto de PDF
  - **Relevancia para esta Story:** Impacta directamente el adjunto y el exito de envio
- Riesgo 2: inconsistencias de estado por reintentos
  - **Relevancia para esta Story:** Un adjunto fallido no debe marcar la factura como enviada

**Puntos de integracion desde la epica:**

- Frontend a/desde Backend API (envio)
  - **Aplica a esta Story:** Si
  - **Si aplica:** El usuario dispara el envio y el backend adjunta el PDF
- Backend a/desde PDF Generator
  - **Aplica a esta Story:** Si
  - **Si aplica:** Se genera el buffer del adjunto antes de enviar
- Backend a/desde Resend API
  - **Aplica a esta Story:** Si
  - **Si aplica:** El adjunto se envia via Resend
- Backend a/desde Database (invoices, email_logs, invoice_events)
  - **Aplica a esta Story:** Si
  - **Si aplica:** Se registra intento y se actualiza estado de factura
- Webhooks Resend a/desde Backend (estado de delivery)
  - **Aplica a esta Story:** No

**Preguntas criticas ya hechas a nivel epica:**

**Preguntas para PO:**

- Limites de subject/message
  - **Estado:** No relevante para esta Story
  - **Impacto:** Ninguno
- Quick send vs personalizacion
  - **Estado:** No relevante para esta Story
  - **Impacto:** Ninguno
- Semantica de sent vs delivered
  - **Estado:** No relevante para esta Story
  - **Impacto:** Ninguno

**Preguntas para Dev:**

- Endpoints faltantes en OpenAPI (/email-status, /webhooks/resend)
  - **Estado:** No relevante para esta Story
  - **Impacto:** Ninguno
- Estructura de payment_methods
  - **Estado:** No relevante para esta Story
  - **Impacto:** Ninguno

**Estrategia de pruebas desde la epica:**

- Niveles de prueba: Unit, Integration, E2E, API
- Herramientas: Playwright, Postman/Newman, Vitest/Jest
- **Como se alinea esta Story:** Requiere integracion (PDF generator + Resend) y validacion E2E del envio

**Actualizaciones y aclaraciones del refinement de la epica:**

- No hay actualizaciones posteriores al FTP inicial

**Resumen: Como encaja esta Story en la epica:**

- **Rol de la Story en la epica:** Agrega el requisito de adjuntar el PDF en el envio
- **Riesgos heredados:** fallos en generacion/adjunto y consistencia de estado
- **Consideraciones unicas:** nombre del adjunto y limite de tamano

---

## Paso 2: Analisis de Calidad de la Story

### Ambiguedades identificadas

**Ambiguedad 1:** Formato del nombre del adjunto

- **Ubicacion en la Story:** Escenario 2 (Attachment name)
- **Pregunta para PO/Dev:** El nombre debe ser `Invoice-{invoiceNumber}.pdf` o `{invoiceNumber}.pdf` segun el ejemplo de FR-018?
- **Impacto en testing:** No se puede afirmar el nombre exacto sin aclarar
- **Sugerencia de aclaracion:** Alinear la story con FR-018 o actualizar el ejemplo

**Ambiguedad 2:** Definicion del limite de tamano y enforcement

- **Ubicacion en la Story:** Escenario 3 (tamano del adjunto bajo 5MB)
- **Pregunta para PO/Dev:** El limite aplica al PDF raw o al payload base64, y que pasa al excederlo?
- **Impacto en testing:** No se puede validar el comportamiento de error sin respuesta
- **Sugerencia de aclaracion:** Definir umbral y respuesta de error (code + UI copy)

**Ambiguedad 3:** Donde se genera el PDF (server vs client)

- **Ubicacion en la Story:** Notas tecnicas
- **Pregunta para Dev:** El PDF se genera siempre server-side para envio, o puede ser client-side?
- **Impacto en testing:** Afecta como validar generacion y manejo de errores
- **Sugerencia de aclaracion:** Preferir server-side para consistencia

---

### Informacion faltante / Gaps

**Gap 1:** Manejo de error cuando falla la generacion de PDF

- **Tipo:** Acceptance Criteria / Detalles tecnicos
- **Por que es critico:** Se necesita status code, mensaje UI y updates en DB
- **Sugerencia:** Definir error response y mensaje en UI
- **Impacto si no se agrega:** UX inconsistente y asserts ambiguos

**Gap 2:** Manejo de error cuando el PDF supera el limite

- **Tipo:** Acceptance Criteria / Regla de negocio
- **Por que es critico:** Debe definirse si se bloquea envio o se reintenta
- **Sugerencia:** Definir comportamiento y error code al exceder 5MB
- **Impacto si no se agrega:** Riesgo de fallos silenciosos o estados incorrectos

---

### Edge cases no cubiertos en la Story original

**Edge Case 1:** Logo grande + muchos items generan PDF mayor a 5MB

- **Escenario:** Factura con logo de alta resolucion y 100+ items
- **Comportamiento esperado:** Se bloquea el envio, error claro, factura queda en draft
- **Criticidad:** Alta
- **Accion requerida:** Agregar a story y test cases

**Edge Case 2:** Generador de PDF retorna archivo vacio

- **Escenario:** Error en template o render
- **Comportamiento esperado:** Envio falla, no se envia email
- **Criticidad:** Media
- **Accion requerida:** Agregar a test cases

**Edge Case 3:** Numero de factura con caracteres especiales

- **Escenario:** Numero con espacios o barras
- **Comportamiento esperado:** Se sanitiza el nombre del archivo
- **Criticidad:** Baja
- **Accion requerida:** Confirmar con PO/Dev

---

### Validacion de testabilidad

**La story es testeable como esta?** Parcialmente

**Problemas de testabilidad:**

- Resultados esperados no especificos
- Faltan escenarios de error
- Faltan criterios de performance (limite de tamano)
- No se puede testear en aislamiento (depende de PDF generator y Resend)

**Recomendaciones para mejorar la testabilidad:**

- Definir patron exacto del nombre del adjunto y responses de error
- Definir comportamiento de enforcement del limite y UI copy
- Confirmar generacion de PDF server-side

---

## Paso 3: Acceptance Criteria refinados

### Escenario 1: PDF adjunto incluido al enviar

**Tipo:** Positivo
**Prioridad:** Critica

- **Dado:**
  - Usuario autenticado con perfil de negocio y al menos un metodo de pago
  - Factura en estado `draft` con numero `INV-2026-0042` y 3 items
  - Cliente con email valido

- **Cuando:**
  - El usuario envia la factura via accion de envio (UI o API)

- **Entonces:**
  - El email se envia con un adjunto PDF
  - MIME type del adjunto es `application/pdf`
  - El estado de la factura cambia a `sent`
  - `invoice_events` incluye un evento `sent`
  - `email_logs` registra el intento de envio

---

### Escenario 2: Nombre del adjunto usa el numero de factura

**Tipo:** Positivo
**Prioridad:** Alta

- **Dado:** El cliente recibe el email de la factura `INV-2026-0042`
- **Cuando:** Visualiza el adjunto
- **Entonces:** El nombre del archivo coincide con `Invoice-INV-2026-0042.pdf` (requiere confirmacion)

---

### Escenario 3: Tamano del adjunto dentro del limite

**Tipo:** Limite
**Prioridad:** Alta

- **Dado:** Factura con logo y muchos items
- **Cuando:** Se genera y adjunta el PDF
- **Entonces:** El PDF tiene tamano como maximo 5MB y el envio es exitoso

---

### Escenario 4: El adjunto abre correctamente con todos los datos

**Tipo:** Positivo
**Prioridad:** Alta

- **Dado:** El cliente descarga el adjunto
- **Cuando:** Abre el PDF
- **Entonces:** El PDF muestra numero de factura, nombre del cliente, total y fecha de vencimiento

---

### Escenario 5: Falla la generacion de PDF

**Tipo:** Negativo
**Prioridad:** Alta

- **Dado:** El generador de PDF falla (template o data error)
- **Cuando:** El usuario intenta enviar la factura
- **Entonces:**
  - El envio falla con error
  - No se envia email
  - La factura queda en `draft`
  - Se muestra error al usuario (copy por definir)

---

### Escenario 6: El PDF supera el limite de tamano

**Tipo:** Negativo
**Prioridad:** Alta

- **Dado:** El PDF generado supera 5MB
- **Cuando:** El usuario intenta enviar la factura
- **Entonces:**
  - Se bloquea el envio con error claro
  - No se envia email
  - La factura queda en `draft`

---

## Paso 4: Diseno de Pruebas

### Analisis de cobertura

**Total de casos necesarios:** 10

**Desglose:**

- Positivos: 3
- Negativos: 3
- Limite: 2
- Integracion: 1
- API: 1

**Razon del numero:**

Se valida contenido, nombre, tamano y fallos del adjunto en multiples integraciones.

---

### Oportunidades de parametrizacion

**Se recomienda parametrizar:** Si

**Grupo parametrizado 1:** Tamano del PDF y variabilidad de contenido

- **Escenario base:** Tamano dentro del limite
- **Parametros a variar:** Tamano de logo, cantidad de items, template
- **Conjuntos de datos:**

| Tamano Logo | Cantidad Items | Template | Resultado esperado      |
| ----------- | -------------- | -------- | ----------------------- |
| 200KB       | 5              | basic    | Adjunto como maximo 1MB |
| 1.5MB       | 25             | basic    | Adjunto como maximo 5MB |
| 3MB         | 60             | basic    | Adjunto como maximo 5MB |
| 4.5MB       | 80             | basic    | Adjunto como maximo 5MB |

**Total de tests por parametrizacion:** 4
**Beneficio:** Cobertura de umbrales sin duplicar setup

---

### Guia de pruebas

#### **Validar adjunto PDF al enviar factura**

**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Critica
**Nivel de prueba:** E2E
**Parametrizado:** No

**Precondiciones:**

- Usuario con perfil de negocio y metodos de pago existe
- Cliente con email `client@example.com` existe
- Factura `INV-2026-0042` existe en estado `draft` con 3 items

**Pasos de prueba:**

1. Abrir detalle de factura `INV-2026-0042`
2. Click en `Enviar factura`
3. Confirmar envio
4. Abrir el email enviado en sandbox de Resend o inbox de prueba
   - **Verificar:** Adjunto presente

**Resultado esperado:**

- **UI:** Se muestra confirmacion de exito
- **Respuesta API:** 200 OK
- **Base de datos:**
  - `invoices.status` = `sent`
  - `invoice_events` incluye `sent`
  - `email_logs` tiene un nuevo registro

**Datos de prueba:**

```json
{
  "invoiceNumber": "INV-2026-0042",
  "clientEmail": "client@example.com",
  "items": 3
}
```

**Post-condiciones:**

- La factura queda en estado sent
- Existe registro en email_logs

---

#### **Validar nombre del adjunto con numero de factura**

**Escenario relacionado:** Escenario 2
**Tipo:** Positivo
**Prioridad:** Alta
**Nivel de prueba:** E2E
**Parametrizado:** No

**Precondiciones:**

- Email enviado para factura `INV-2026-0042`

**Pasos de prueba:**

1. Abrir el email enviado
2. Inspeccionar el nombre del adjunto

**Resultado esperado:**

- **UI:** El nombre coincide con `Invoice-INV-2026-0042.pdf` (pendiente de confirmacion)

**Datos de prueba:**

```json
{
  "expectedFilename": "Invoice-INV-2026-0042.pdf"
}
```

**Post-condiciones:**

- Ninguna

---

#### **Validar apertura del PDF con datos correctos**

**Escenario relacionado:** Escenario 4
**Tipo:** Positivo
**Prioridad:** Alta
**Nivel de prueba:** E2E
**Parametrizado:** No

**Precondiciones:**

- Email enviado con PDF adjunto para factura `INV-2026-0042`

**Pasos de prueba:**

1. Descargar el adjunto PDF
2. Abrir el PDF
3. Verificar numero de factura, nombre del cliente, total y fecha de vencimiento

**Resultado esperado:**

- **UI:** El PDF renderiza correctamente y muestra todos los datos requeridos

**Datos de prueba:**

```json
{
  "invoiceNumber": "INV-2026-0042",
  "clientName": "Ana Gomez",
  "total": "USD 1200.00",
  "dueDate": "2026-02-28"
}
```

**Post-condiciones:**

- Ninguna

---

#### **Validar MIME type correcto del adjunto**

**Escenario relacionado:** Escenario 1
**Tipo:** Positivo
**Prioridad:** Alta
**Nivel de prueba:** Integracion
**Parametrizado:** No

**Precondiciones:**

- Resend sandbox configurado en staging
- Factura existe en `draft`

**Pasos de prueba:**

1. Enviar factura via POST /api/invoices/{invoiceId}/send
2. Revisar metadata del adjunto en logs de Resend

**Resultado esperado:**

- **Respuesta API:** 200 OK
- **Integracion:** Content type del adjunto es `application/pdf`

**Datos de prueba:**

```json
{
  "invoiceId": "uuid-of-invoice"
}
```

**Post-condiciones:**

- Existe registro en email_logs

---

#### **Validar tamano del adjunto bajo limite con logos grandes**

**Escenario relacionado:** Escenario 3
**Tipo:** Limite
**Prioridad:** Alta
**Nivel de prueba:** Integracion
**Parametrizado:** Si (Grupo 1)

**Precondiciones:**

- Factura con logo grande y muchos items existe

**Pasos de prueba:**

1. Enviar factura via UI o API
2. Revisar tamano del adjunto en logs de Resend

**Resultado esperado:**

- **Integracion:** Tamano del adjunto como maximo 5MB
- **Estado del sistema:** Factura marcada como sent

**Datos de prueba:**

```json
{
  "logoSizeKb": 1500,
  "itemCount": 25
}
```

**Post-condiciones:**

- La factura permanece en sent

---

#### **Validar tamano al limite (como maximo 5MB)**

**Escenario relacionado:** Escenario 3
**Tipo:** Limite
**Prioridad:** Media
**Nivel de prueba:** Integracion
**Parametrizado:** Si (Grupo 1)

**Precondiciones:**

- Factura con PDF cerca del limite

**Pasos de prueba:**

1. Enviar factura
2. Verificar tamano del adjunto justo bajo el limite

**Resultado esperado:**

- **Integracion:** Tamano del adjunto como maximo 5MB
- **UI:** Confirmacion de exito

**Datos de prueba:**

```json
{
  "logoSizeKb": 4500,
  "itemCount": 80
}
```

**Post-condiciones:**

- La factura permanece en sent

---

#### **Validar bloqueo cuando el PDF supera el limite**

**Escenario relacionado:** Escenario 6
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** Integracion
**Parametrizado:** No

**Precondiciones:**

- Factura genera PDF mayor a 5MB

**Pasos de prueba:**

1. Intentar enviar la factura
2. Observar respuesta de API y mensaje UI

**Resultado esperado:**

- **Respuesta API:** 400 o 413 con error code `PDF_TOO_LARGE` (por definir)
- **UI:** Mensaje de error
- **Base de datos:** Sin evento `sent`, factura queda en `draft`

**Datos de prueba:**

```json
{
  "logoSizeKb": 6000,
  "itemCount": 120
}
```

**Post-condiciones:**

- No hay registro en email_logs

---

#### **Validar fallo cuando el PDF esta vacio**

**Escenario relacionado:** Escenario 5
**Tipo:** Negativo
**Prioridad:** Alta
**Nivel de prueba:** Integracion
**Parametrizado:** No

**Precondiciones:**

- El generador de PDF retorna buffer vacio (mock o error forzado)

**Pasos de prueba:**

1. Intentar enviar la factura
2. Observar respuesta de API y mensaje UI

**Resultado esperado:**

- **Respuesta API:** 500 con error code `PDF_GENERATION_FAILED` (por definir)
- **UI:** Mensaje de error
- **Base de datos:** Sin evento `sent`, factura queda en `draft`

**Datos de prueba:**

```json
{
  "invoiceId": "uuid-of-invoice"
}
```

**Post-condiciones:**

- No hay registro en email_logs

---

#### **Validar headers correctos en endpoint PDF**

**Escenario relacionado:** Escenario 2
**Tipo:** API
**Prioridad:** Media
**Nivel de prueba:** API
**Parametrizado:** No

**Precondiciones:**

- Factura existe y pertenece al usuario

**Pasos de prueba:**

1. Llamar GET /api/invoices/{invoiceId}/pdf
2. Inspeccionar headers y nombre de archivo

**Resultado esperado:**

- **Respuesta API:** 200 OK
- **Headers:**
  - `Content-Type: application/pdf`
  - `Content-Disposition` incluye el nombre con numero de factura

**Datos de prueba:**

```json
{
  "invoiceId": "uuid-of-invoice"
}
```

**Post-condiciones:**

- Ninguna

---

## Casos de Integracion (si aplica)

### Caso de Integracion 1: Backend a PDF Generator

**Punto de integracion:** API a PDF Generator
**Tipo:** Integracion
**Prioridad:** Alta

**Precondiciones:**

- Servicio de PDF generator disponible
- Data de factura incluye perfil de negocio, cliente e items

**Flujo de prueba:**

1. Disparar generacion de PDF durante envio
2. Verificar que el buffer no es vacio

**Resultado esperado:**

- Buffer PDF generado con tamano y MIME type valido

---

### Caso de Integracion 2: Backend a Resend (Adjunto)

**Punto de integracion:** Backend a Resend API
**Tipo:** Integracion
**Prioridad:** Alta

**Estrategia de mock:**

- Mock de Resend para tests automatizados
- Validar envio real en staging con sandbox

**Flujo de prueba:**

1. Enviar email con PDF adjunto
2. Confirmar que Resend acepta el payload

**Resultado esperado:**

- Resend responde success y el adjunto se ve en logs

---

## Resumen de Edge Cases

| Edge Case                       | Cubierto en Story original? | Agregado a AC refinado? | Test Case                                      | Prioridad |
| ------------------------------- | --------------------------- | ----------------------- | ---------------------------------------------- | --------- |
| PDF mayor a 5MB                 | No                          | Si (Escenario 6)        | Validar bloqueo cuando el PDF supera el limite | Alta      |
| PDF vacio                       | No                          | Si (Escenario 5)        | Validar fallo cuando el PDF esta vacio         | Media     |
| Caracteres especiales en numero | No                          | No (needs PO/Dev)       | TBD                                            | Baja      |

---

## Resumen de Datos de Prueba

### Categorias de datos

| Tipo de dato    | Cantidad | Proposito         | Ejemplos                                    |
| --------------- | -------- | ----------------- | ------------------------------------------- |
| Datos validos   | 3        | Pruebas positivas | Factura draft con 1-3 items, email valido   |
| Datos invalidos | 2        | Pruebas negativas | PDF mayor a 5MB, buffer vacio               |
| Valores limite  | 2        | Pruebas limite    | PDF cerca de 4.5-5MB, muchos items          |
| Datos edge      | 1        | Edge tests        | Numero de factura con caracteres especiales |

### Estrategia de generacion de datos

**Datos estaticos:**

- Numero de factura: `INV-2026-0042`
- Email del cliente: `client@example.com`

**Datos dinamicos (Faker.js):**

- User data: faker.internet.email(), faker.person.firstName()
- Numeros: faker.number.int({ min: 1, max: 120 })
- Fechas: faker.date.soon()

**Cleanup de datos:**

- Todos los datos de prueba se limpian despues de la ejecucion
- Los tests son idempotentes y no dependen del orden

---

## Seguimiento de Ejecucion

**Fecha de ejecucion:** TBD
**Entorno:** Staging
**Ejecutado por:** TBD

**Resultados:**

- Total de tests: 10
- Pasados: TBD
- Fallados: TBD
- Bloqueados: TBD

**Bugs encontrados:**

- TBD

**Sign-off:** TBD

---

## Accion requerida

**PO:**

- Revisar y responder preguntas criticas (patron de nombre, limite de tamano)
- Validar mejoras sugeridas a la story

**Lider Dev:**

- Confirmar generacion de PDF server-side
- Definir error codes y response para fallos de tamano/generacion

**Equipo QA:**

- Revisar casos para completitud
- Validar estrategia de parametrizacion y data setup

---

**Siguientes pasos:**

1. El equipo discute preguntas criticas y ambiguedades
2. PO/Dev responden y aclaran
3. QA actualiza test cases con feedback
4. Dev inicia implementacion con AC claros

---

**Documentacion:** Test cases completos en:
`.context/PBI/epics/EPIC-SQ-37-invoice-sending/stories/STORY-SQ-43-email-attached-pdf/acceptance-test-plan.md`
