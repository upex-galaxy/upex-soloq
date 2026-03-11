# Feature Test Plan: SQ-27 - Assign Unique Invoice Number

**Story:** [SQ-27](https://upexgalaxy64.atlassian.net/browse/SQ-27)
**Epic:** SQ-20 - Invoice Creation
**Autor:** Froylan Rodriguez
**Fecha:** 2026-02-02

---

## Scenario 1: Auto-generate Invoice Number

| ID     | Test Case                                     | Resultado Esperado               |
| ------ | --------------------------------------------- | -------------------------------- |
| TC-1.1 | Crear invoice nuevo (primer invoice del user) | Genera `INV-0001`                |
| TC-1.2 | Crear invoice cuando último fue `INV-0005`    | Genera `INV-0006`                |
| TC-1.3 | Eliminar invoice `INV-0003` y crear nuevo     | Genera `INV-0006` (no reutiliza) |
| TC-1.4 | Cancelar invoice y crear nuevo                | Secuencia continúa (+1)          |
| TC-1.5 | Verificar formato con padding                 | `INV-0001` no `INV-1`            |

**Mejoras sugeridas:**

- Definir si se usa draft → preview → save (recomendado)
- Especificar formato exacto: `PREFIX-XXXX` o `EST-PTO-SEQ`

---

## Scenario 2: Custom Invoice Number

| ID     | Test Case                                 | Resultado Esperado             |
| ------ | ----------------------------------------- | ------------------------------ |
| TC-2.1 | Editar número antes de guardar            | Acepta número custom           |
| TC-2.2 | Usar caracteres especiales `INV/2026/001` | Validar si permitido           |
| TC-2.3 | Usar número más largo que el límite       | Error: "Máx X caracteres"      |
| TC-2.4 | Dejar campo vacío                         | Error: "Número requerido"      |
| TC-2.5 | Editar invoice existente (draft)          | Número se mantiene o versiona? |

**Mejoras sugeridas:**

- Definir scope: ¿por user o por business_profile?
- Clarificar: ¿editar invoice genera nueva versión del número?

---

## Scenario 3: Prevent Duplicates

| ID     | Test Case                          | Resultado Esperado                    |
| ------ | ---------------------------------- | ------------------------------------- |
| TC-3.1 | Usar número existente `INV-0001`   | Error inline: "Este número ya existe" |
| TC-3.2 | Validación en tiempo real (onBlur) | Muestra error antes de submit         |
| TC-3.3 | Intentar guardar con duplicado     | Bloquea guardado + error visible      |
| TC-3.4 | User A y User B usan mismo número  | ✅ Permitido (unique por user_id)     |

### Tests de Concurrencia

| ID     | Test Case                            | Resultado Esperado               |
| ------ | ------------------------------------ | -------------------------------- |
| TC-3.5 | 2 tabs mismo user guardan simultáneo | Solo 1 éxito, otro error         |
| TC-3.6 | Race condition en auto-generate      | DB constraint previene duplicado |

**Mejoras sugeridas:**

- Mensaje error: "El número INV-XXXX ya está en uso. Usa otro número."
- Usar constraint DB `UNIQUE(user_id, invoice_number)` + retry logic

---

## Scenario 4: Sequential Numbering

| ID     | Test Case                              | Resultado Esperado               |
| ------ | -------------------------------------- | -------------------------------- |
| TC-4.1 | Último `INV-001` → nuevo invoice       | Sugiere `INV-002`                |
| TC-4.2 | Gap en secuencia (001, 003) → nuevo    | Sugiere `INV-004` (no llena gap) |
| TC-4.3 | Número custom `CUSTOM-999` → siguiente | Vuelve a secuencia o continúa?   |

---

## Scenario 5: Number Format

| ID     | Test Case                              | Resultado Esperado       |
| ------ | -------------------------------------- | ------------------------ |
| TC-5.1 | Config prefix "FACT"                   | Genera `FACT-0001`       |
| TC-5.2 | Config con año "2026-"                 | Genera `2026-0001`       |
| TC-5.3 | Sin configuración                      | Usa default `INV-XXXX`   |
| TC-5.4 | Cambiar prefix con invoices existentes | Nuevos usan nuevo prefix |

---

## Edge Cases

| ID    | Test Case                                         | Resultado Esperado          |
| ----- | ------------------------------------------------- | --------------------------- |
| TC-E1 | Invoice en status `draft` editado múltiples veces | Mismo número (no versiona)  |
| TC-E2 | Invoice `sent` → ¿editable?                       | Número inmutable post-envío |
| TC-E3 | Máximo secuencial alcanzado (9999)                | Error claro o rollover?     |
| TC-E4 | Número solo con espacios                          | Error validación            |

---

## Preguntas Abiertas para PO

1. ¿Formato exacto? → `INV-XXXX` vs `EST-PTO-SEQ`
2. ¿Draft obligatorio antes de guardar?
3. ¿Número editable post-creación? ¿Hasta qué status?
4. ¿Qué pasa al alcanzar límite secuencial?
5. ¿Custom number afecta la secuencia automática?

---

## Resumen de Cobertura

| Scenario         | Happy Path | Edge Cases | Concurrencia |
| ---------------- | ---------- | ---------- | ------------ |
| 1. Auto-generate | ✅         | ✅         | -            |
| 2. Custom Number | ✅         | ✅         | -            |
| 3. Duplicates    | ✅         | ✅         | ✅           |
| 4. Sequential    | ✅         | ✅         | -            |
| 5. Format        | ✅         | ✅         | -            |

**Total Test Cases:** 24
