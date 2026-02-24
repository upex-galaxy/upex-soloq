# 🛡️ Reporte de Pruebas de Base de Datos & E2E (Final)

**Fecha:** 21-02-2026
**QA Engineer:** Gloria Galindez
**Feature:** SQ-24: Add Taxes to Invoice
**Ambiente:** Staging & Database (PostgreSQL)

---

## 1. Resumen Ejecutivo

Se completó el ciclo de pruebas de integración **End-to-End (UI → API → DB)** para validar la funcionalidad de impuestos.

- **Integridad de Datos:** ✅ **VERIFICADO** (Precisión decimal y persistencia correcta).
- **Flujo E2E:** ✅ **PASÓ** (Creación desde UI y validación en DB).
- **Seguridad de Datos:** ⚠️ **OBSERVACIÓN** (Falta constraint en BD para impedir negativos).

---

## 2. Validación de Persistencia (Happy Path)

Se creó una factura desde la UI y se verificó su representación exacta en la base de datos.

**Datos de Prueba (UI):**

- **Subtotal:** $100.00
- **Impuesto:** 16%
- **Total Esperado:** $116.00

**Evidencia en Base de Datos (Query SQL):**

```sql
SELECT id, subtotal, tax_rate, tax_amount, total FROM invoices WHERE invoice_number = 'INV-2026-0001';
```

**Resultado:**
| Campo | Valor UI | Valor DB | Estado |
| :--- | :--- | :--- | :--- |
| `subtotal` | 100.00 | `100.00` | ✅ Exacto |
| `tax_rate` | 16% | `16.00` | ✅ Exacto |
| `tax_amount` | $16.00 | `16.00` | ✅ Exacto |
| `total` | $116.00 | `116.00` | ✅ Exacto |

**Conclusión:** La lógica de cálculo y persistencia funciona correctamente. No hay pérdida de precisión decimal.

---

## 3. Pruebas de Constraints (Integridad)

Se evaluó la robustez de la base de datos ante datos inválidos (Impuestos Negativos).

**Prueba:** Intento de actualización directa vía SQL con tasa negativa.

```sql
UPDATE invoices SET tax_rate = -10 WHERE id = '...';
```

**Resultado:** ❌ **El UPDATE fue permitido.**
La base de datos aceptó un `tax_rate` de `-10.00`.

**Impacto:**
Actualmente dependemos 100% de la validación del Frontend/API. Si esa capa falla (o se accede directo a la DB), se podrían generar facturas con impuestos negativos, afectando los reportes financieros.

---

## 4. Recomendaciones Finales

1.  **Aprobación:** La funcionalidad está lista para despliegue (Go Live), ya que el flujo principal y los cálculos son correctos.
2.  **Mejora Técnica (Deuda):** Agregar un **Check Constraint** en la base de datos en el próximo sprint de mantenimiento:
    ```sql
    ALTER TABLE invoices ADD CONSTRAINT check_tax_rate_positive CHECK (tax_rate >= 0);
    ```

---

**Estado del Ticket:** QA Verified (Ready for Release)
