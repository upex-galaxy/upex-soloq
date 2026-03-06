Reporte de Pruebas de API (Exploratorio & Contract Testing)
Fecha: 03/03/2026
QA Engineer: Gloria Galindez
Feature: SQ-24 – Add Taxes to Invoice
Alcance: Backend Validation, Contract Testing & Error Handling
Entorno: Staging

---

1. Resumen Ejecutivo
   Se realizó una sesión de pruebas exploratorias sobre la capa de API (/invoices) para validar:
   •Robustez de la lógica de negocio
   •Validaciones de entrada
   •Manejo de errores
   •Consistencia del contrato de datos
   Las pruebas se enfocaron en creación de facturas con cálculo de impuestos, validando tanto flujos exitosos como escenarios negativos.
   MétricaResultado
   Flujo funcionalCorrecto
   Validaciones backendCorrectas
   Contrato de APIConsistente
   Riesgo residualBajo
   BloqueadoresNinguno
   Estado general:
   ✅ APROBADO

---

2. Alcance de Pruebas
   Dentro del alcance
   •Creación de facturas vía API (POST /invoices)
   •Validación de taxRate
   •Manejo de errores
   •Consistencia de contratos de datos
   •Persistencia y recuperación de facturas (GET /invoices/{id})
   Fuera del alcance
   •Flujos completos de autenticación
   •Expiración o renovación de sesiones
   •Validación de roles o permisos avanzados
   Nota: La autenticación se maneja como precondición general, pero se incluyó un sanity check mínimo de seguridad del endpoint.

---

3. Precondiciones
   Para la ejecución de las pruebas funcionales:
   •Usuario autenticado con cookie/session válida
   •clientId existente en el entorno de staging
   •Endpoint base accesible en entorno staging

---

4. Cobertura de Pruebas
   CategoríaCobertura
   Happy Path✅
   Negative Testing✅
   Validación de datos✅
   Boundary Testing⚠ Parcial
   Contract Testing✅
   AuthenticationVerificación mínima

---

5. Escenarios Validados
   🛡️ Seguridad y Validación de Datos (Negative Testing)
   Se ejecutaron pruebas de payloads malformados para verificar que el backend no dependa exclusivamente de validaciones del frontend.
   EscenarioPayloadResultado EsperadoResultado ObtenidoEstado
   Impuesto negativotaxRate: -10400 Bad Request400 Bad Request✅
   Tipo incorrectotaxRate: "16%"400 Bad Request400 Bad Request✅
   Campo faltantetaxRate: undefined400 Bad Request400 Bad Request✅
   Evidencia de respuesta
   {
   "error": "Datos inválidos",
   "details": {
   "fieldErrors": {
   "taxRate": [
   "La tasa de impuesto no puede ser negativa"
   ]
   }
   }
   }

🧮 Validación de Redondeo Financiero
Se validó el cálculo de impuestos utilizando valores sensibles a tercer y cuarto decimal para confirmar el correcto comportamiento de redondeo a 2 decimales.
Los escenarios ejecutados (10.55 × 21%, 10.55 × 19%, 100 × 10.535353%) retornaron 201 Created en POST /invoices y 200 OK en GET /invoices/{id}, manteniendo consistencia entre tax_rate, tax_amount y total.
✅ No se identificaron discrepancias en el cálculo ni en la persistencia de los valores.

Conclusión
La capa de validación implementada mediante Zod/Middleware previene correctamente la mayoría de entradas inválidas.
No obstante, se mantiene la recomendación de agregar constraints en la base de datos para garantizar integridad de datos a nivel de persistencia (defense in depth).

---

6. Flujo Exitoso (Happy Path)
   EscenarioPayloadResultado EsperadoResultado ObtenidoEstado
   Creación estándartaxRate: 16, subtotal: 100201 Created201 Created✅
   Validaciones adicionales realizadas:
   •invoice_number generado automáticamente
   •tax_rate persistido correctamente
   •tax_amount calculado correctamente
   •total consistente con el cálculo

---

7. Sanity Check de Seguridad del Endpoint
   Aunque la autenticación se considera precondición, se ejecutó una validación mínima para confirmar que el endpoint no esté expuesto.
   EscenarioEndpointResultado EsperadoResultado ObtenidoEstado
   Crear invoice sin sesiónPOST /invoices401 Unauthorized401 Unauthorized✅
   Conclusión
   El endpoint se encuentra correctamente protegido por el middleware de autenticación.

---

8. Hallazgos de Arquitectura y Mejora
   Durante la exploración se identificaron oportunidades de mejora técnica.

---

🔴 Mejora Crítica: Falta de Endpoint de Actualización
Hallazgo
El API solo expone:
POST /invoices
GET /invoices/{id}
No existe endpoint para actualizar facturas.
Impacto
•No permite editar facturas en estado draft
•Obliga a recrear recursos para modificar información
•Limita flujos de edición progresiva en la interfaz de usuario
Recomendación
Implementar endpoint REST estándar:
PATCH /invoices/{id}
para permitir actualizaciones parciales del recurso.

---

🟡 Mejora Media: Inconsistencia de Nomenclatura
CapaConvención
APIcamelCase
Base de datossnake_case
Ejemplo:
API → taxRate
DB → tax_rate
Impacto
•Aumenta complejidad de mapeo
•Riesgo de errores de transformación
Recomendación
Implementar transformadores automáticos o DTO mappers.

---

🔵 Mejora Baja: Endpoint de Validación (Dry Run)
Propuesta de endpoint:
POST /invoices/validate
Objetivo
Permitir validar cálculos en backend antes de persistir datos.
Casos de uso:
•Previsualización de factura
•Validación de impuestos
•Validación de descuentos
•Simulación de totales

---

9. Recomendaciones de Robustez
   Integridad de datos
   Agregar constraint en base de datos:
   ALTER TABLE invoices
   ADD CONSTRAINT check_tax_rate_positive
   CHECK (tax_rate >= 0);
   Esto garantiza integridad incluso ante acceso directo a la base de datos.

---

Pruebas adicionales sugeridas
Tipo de pruebaEscenario
Boundary testingtaxRate > 100
Authorizationacceso a invoices de otro usuario
Rounding validationverificación de redondeo decimal

---

10. Artefactos Generados
    Colección Postman
    SQ-24: Add Taxes to Invoice
    ID: 8fe91932...
    Workspace: SoloQ
    Incluye:
    •Happy path
    •Negative testing
    •Variables de entorno {{BASEURL}}

---

11. Conclusión
    La funcionalidad Add Taxes to Invoice presenta un comportamiento estable y seguro en la capa de API.
    Las validaciones backend implementadas protegen adecuadamente el sistema frente a entradas inválidas y garantizan consistencia en la creación de facturas.
    No se identificaron defectos bloqueantes.
    Las observaciones realizadas corresponden a mejoras arquitectónicas y de mantenibilidad, recomendadas para futuras iteraciones.

---

Estado final
✅ APROBADO PARA CONTINUAR CON EL DESPLIEGUE

---

QA Engineer
Gloria Galindez
