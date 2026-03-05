# 🔌 Reporte de Pruebas de API (Exploratorio y de Contrato)

**Fecha:** 03/03/2026
**QA Engineer:** Gloria Galindez
**Historia:** SQ-24 – Agregar Impuestos a la Factura
**Alcance:** Validación de Backend, Pruebas de Contrato y Manejo de Errores
**Entorno:** Staging

---

## 1. Resumen Ejecutivo

Se realizó una sesión de pruebas exploratorias sobre la capa de API (/invoices) para validar la robustez de la lógica de negocio, validaciones de entrada, manejo de errores y consistencia del contrato de datos.

Las pruebas se enfocaron en la creación de facturas con cálculo de impuestos, validando tanto flujos exitosos como escenarios negativos.

| Métrica                 | Resultado   |
| :---------------------- | :---------- |
| Flujo funcional         | Correcto    |
| Validaciones de backend | Correctas   |
| Contrato de API         | Consistente |
| Riesgo residual         | Bajo        |
| Bloqueadores            | Ninguno     |

**Estado general:** ✅ **APROBADO**

---

## 2. Alcance de Pruebas

**Dentro del alcance:**
• Creación de facturas vía API (POST /invoices)
• Validación de tasa de impuestos (taxRate)
• Manejo de errores y códigos de estado
• Consistencia de contratos de datos
• Persistencia y recuperación de facturas (GET /invoices/{id})

**Fuera del alcance:**
• Flujos completos de autenticación
• Expiración o renovación de sesiones
• Validación de roles o permisos avanzados

---

## 3. Precondiciones

• Usuario autenticado con sesión válida
• ID de cliente (clientId) existente en el entorno de staging
• Endpoint base accesible en el entorno de staging

---

## 4. Cobertura de Pruebas

• Flujo Feliz (Happy Path): ✅
• Pruebas Negativas: ✅
• Validación de datos: ✅
• Pruebas de Límites (Boundary): ⚠ Parcial
• Pruebas de Contrato: ✅
• Autenticación: Verificación mínima de seguridad

---

## 5. Escenarios Validados

### 🛡️ Seguridad y Validación de Datos (Pruebas Negativas)

| Escenario         | Carga (Payload)    | Resultado Esperado | Resultado Obtenido | Estado |
| :---------------- | :----------------- | :----------------- | :----------------- | :----- |
| Impuesto negativo | taxRate: -10       | 400 Bad Request    | 400 Bad Request    | ✅     |
| Tipo incorrecto   | taxRate: "16%"     | 400 Bad Request    | 400 Bad Request    | ✅     |
| Campo faltante    | taxRate: undefined | 400 Bad Request    | 400 Bad Request    | ✅     |

**Evidencia de respuesta del servidor:**

```json
{
  "error": "Datos inválidos",
  "details": {
    "fieldErrors": {
      "taxRate": ["La tasa de impuesto no puede ser negativa"]
    }
  }
}
```

---

## 6. Flujo Exitoso (Happy Path)

| Escenario         | Carga (Payload)            | Resultado Esperado | Resultado Obtenido | Estado |
| :---------------- | :------------------------- | :----------------- | :----------------- | :----- |
| Creación estándar | taxRate: 16, subtotal: 100 | 201 Created        | 201 Created        | ✅     |

**Validaciones adicionales realizadas:**
• El número de factura (invoice_number) se generó automáticamente.
• La tasa de impuesto se persistió correctamente.
• El monto del impuesto (tax_amount) se calculó correctamente.
• El total de la factura es consistente con el cálculo matemático.

---

## 7. Verificación de Seguridad del Endpoint

| Escenario                | Endpoint       | Resultado Esperado | Resultado Obtenido | Estado |
| :----------------------- | :------------- | :----------------- | :----------------- | :----- |
| Crear factura sin sesión | POST /invoices | 401 Unauthorized   | 401 Unauthorized   | ✅     |

---

## 8. Hallazgos de Arquitectura y Mejora

🔴 **Mejora Crítica: Falta de Endpoint de Actualización**
• Hallazgo: La API solo expone métodos de creación y lectura.
• Impacto: No permite editar borradores de facturas, obligando a recrear el recurso para cualquier modificación.
• Recomendación: Implementar el método `PATCH /invoices/{id}` para actualizaciones parciales.

🟡 **Mejora Media: Inconsistencia de Nomenclatura**
• Capa API: utiliza camelCase (taxRate) | Capa de Base de Datos: utiliza snake_case (tax_rate).
• Recomendación: Implementar transformadores automáticos o mappers de DTO para estandarizar.

---

## 9. Recomendaciones de Robustez

• Agregar una restricción (constraint) en la base de datos para garantizar la integridad incluso en accesos directos:
`ALTER TABLE invoices ADD CONSTRAINT check_tax_rate_positive CHECK (tax_rate >= 0);`

---

## 10. Artefactos Generados

• Colección de Postman: `SQ-24: Add Taxes to Invoice (Final)`
• Workspace: SoloQ

---

## 11. Conclusión

La funcionalidad presenta un comportamiento estable y seguro en la capa de API. Las validaciones protegen adecuadamente el sistema contra entradas inválidas. No se identificaron defectos que bloqueen el despliegue.

**Estado final:** ✅ **APROBADO PARA CONTINUAR CON EL DESPLIEGUE**
