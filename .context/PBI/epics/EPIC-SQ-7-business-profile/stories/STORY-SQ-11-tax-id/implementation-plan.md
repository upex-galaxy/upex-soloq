# Implementation Plan: STORY-SQ-11 - Configure Tax ID (RFC/NIT/CUIT)

## Overview

Implementar la funcionalidad para que el usuario pueda configurar su identificación fiscal (Tax ID) según su país. El label, validación y formato cambian dinámicamente: RFC (México), NIT (Colombia), CUIT (Argentina). Es un campo opcional. Si no se configura, se omite del PDF de la factura.

**Depende de SQ-10:** Lee `address->>'country'` para determinar el tipo de tax ID.

**Acceptance Criteria a cumplir:**

- AC1: Configure RFC for Mexico (12 or 13 alphanumeric chars)
- AC2: Configure NIT for Colombia (9 digits + verification digit)
- AC3: Configure CUIT for Argentina (11 digits, format XX-XXXXXXXX-X)
- AC4: Tax ID appears on invoice with correct label
- AC5: Skip tax ID - optional field, invoices work without it

---

## Technical Approach

**Chosen approach:** DB migration para `tax_id_type` VARCHAR nullable + TaxIdForm que lee country de `businessProfile.address.country` + validación dinámica con regex per country + label dinámico + input mask para CUIT.

**Alternatives considered:**

- Validación solo frontend sin tax_id_type en DB: Pierde contexto del tipo al renderizar PDF
- Selector manual de tipo de tax ID: Redundante si ya tenemos country

**Why this approach:**

- ✅ Country de address JSONB (SQ-10) determina automáticamente el tipo
- ✅ `tax_id_type` en DB permite renderizar label correcto en PDF sin re-derivar de country
- ✅ Regex validation específico por país para los 3 principales (MX, CO, AR)
- ✅ Países no soportados: free text con label genérico "Tax ID"
- ❌ Trade-off: Depende de SQ-10 para el country

---

## UI/UX Design

### Componentes del Design System a usar:

- ✅ `Card` / `CardHeader` / `CardContent`
- ✅ `Form` / `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage` / `FormDescription`
- ✅ `Input`: Tax ID value
- ✅ `Badge`: Indicador de país detectado
- ✅ `Button`: Guardar cambios
- ✅ `Alert`: Mensaje si no hay country configurado

### Componentes custom:

- 🆕 `TaxIdForm` → `src/components/settings/tax-id-form.tsx`
  - **Propósito:** Form para tax ID con validación dinámica por país
  - **Props:** `businessProfile: BusinessProfile | null`, `onSuccess?: () => void`

### Wireframe (Tab "Datos Fiscales"):

```
┌──────────────────────────────────────────────────────┐
│ [Perfil] [Contacto] [Datos Fiscales ✓] [Pagos]       │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐  │
│ │ Datos fiscales                                   │  │
│ │ Tu identificación fiscal aparecerá en tus        │  │
│ │ facturas. Este campo es opcional.                │  │
│ │                                                  │  │
│ │ País detectado: [MX México]  (badge)             │  │
│ │                                                  │  │
│ │ RFC (opcional)                                   │  │
│ │ ┌──────────────────────────────────┐             │  │
│ │ │ XAXX010101000                    │             │  │
│ │ └──────────────────────────────────┘             │  │
│ │ 13 caracteres para persona física,              │  │
│ │ 12 para persona moral.                          │  │
│ │                                                  │  │
│ │                        [Guardar cambios]         │  │
│ └──────────────────────────────────────────────────┘  │
│                                                       │
│ ⓘ Sin country:                                       │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Configura tu país en la pestaña "Contacto" para  │  │
│ │ obtener validación específica de tu Tax ID.      │  │
│ └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Dynamic UI per Country:

| Country | Label | Placeholder | Validation | Description |
|---------|-------|-------------|------------|-------------|
| MX | RFC | XAXX010101000 | `^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$` | 13 chars persona física, 12 persona moral |
| CO | NIT | 900123456-7 | `^\d{9}-?\d$` | 9 dígitos + dígito de verificación |
| AR | CUIT | 20-12345678-9 | `^\d{2}-?\d{8}-?\d$` | Formato XX-XXXXXXXX-X |
| CL | RUT | Free text | None (alphanumeric) | Identificación tributaria |
| PE | RUC | Free text | None (alphanumeric) | Registro Único de Contribuyentes |
| Other/None | Tax ID | Free text | None (alphanumeric) | Identificación fiscal genérica |

### Estados de UI:

- **No country:** Alert info "Configura tu país en Contacto..."
- **Country set, no tax ID:** Form con campo vacío, label dinámico
- **Tax ID filled:** Form con valor + label correcto
- **Invalid format:** FormMessage con error de validación
- **Saving:** Button disabled
- **Success:** Toast

---

## Types & Type Safety

**Tipo nuevo en `lib/types.ts`:**

```typescript
export type TaxIdType = 'RFC' | 'NIT' | 'CUIT' | 'RUT' | 'RUC' | 'Tax ID';
```

**Validation utility en `lib/validations/tax-id.ts`:**

```typescript
export function getTaxIdConfig(countryCode?: string): {
  label: string;
  type: TaxIdType;
  placeholder: string;
  description: string;
  regex?: RegExp;
}

export function validateTaxId(value: string, countryCode?: string): boolean;
```

---

## Content Writing

- Card title: "Datos fiscales"
- Card description: "Tu identificación fiscal aparecerá en tus facturas. Este campo es opcional."
- Label (MX): "RFC (opcional)"
- Label (CO): "NIT (opcional)"
- Label (AR): "CUIT (opcional)"
- Label (generic): "Tax ID (opcional)"
- Description (MX): "13 caracteres para persona física, 12 para persona moral."
- Description (CO): "9 dígitos seguidos del dígito de verificación."
- Description (AR): "Formato: XX-XXXXXXXX-X (11 dígitos)."
- Description (generic): "Ingresa tu identificación fiscal."
- No country alert: "Configura tu país en la pestaña \"Contacto\" para obtener validación específica."
- Success toast: "Datos fiscales actualizados"
- Validation error (MX): "El RFC debe tener 12 o 13 caracteres alfanuméricos."
- Validation error (CO): "El NIT debe tener 9 dígitos más el dígito de verificación."
- Validation error (AR): "El CUIT debe tener 11 dígitos (formato XX-XXXXXXXX-X)."

---

## Implementation Steps

### **Step 1: DB Migration - Add tax_id_type column**

**Task:** Agregar columna `tax_id_type` a `business_profiles`

**Details:**

- Usar Supabase MCP `apply_migration`:
  ```sql
  ALTER TABLE business_profiles
  ADD COLUMN tax_id_type varchar(10) NULL;

  COMMENT ON COLUMN business_profiles.tax_id_type IS
  'Tax ID type: RFC (MX), NIT (CO), CUIT (AR), RUT (CL), RUC (PE), Tax ID (generic)';
  ```
- Regenerar `types/supabase.ts`
- Agregar `TaxIdType` a `lib/types.ts`

**Testing:**

- Column created successfully, nullable
- Can INSERT/UPDATE with valid values

**Estimated time:** 15 min

---

### **Step 2: Create tax ID validation utility**

**Task:** Funciones de validación por país

**File:** `src/lib/validations/tax-id.ts`

**Details:**

- `getTaxIdConfig(countryCode?: string)`: Returns label, type, placeholder, description, regex
- `validateTaxId(value: string, countryCode?: string)`: Boolean validation
- Regex patterns:
  - MX (RFC): `/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i` (accepts 12 or 13)
  - CO (NIT): `/^\d{9}-?\d$/` (9 digits + optional dash + verification digit)
  - AR (CUIT): `/^\d{2}-?\d{8}-?\d$/` (11 digits with optional dashes)
  - Others: No regex, accept alphanumeric free text
- Auto-uppercase for MX RFC
- Strip dashes for validation, preserve for display

**Edge cases handled:**

- Lowercase input → uppercase for RFC
- CUIT with/without dashes → both accepted
- Empty string → valid (field is optional)
- Unsupported country → no format validation

**Testing:**

- Valid RFC 13 chars → true
- Valid RFC 12 chars → true
- Invalid RFC → false
- Valid NIT → true
- Valid CUIT with dashes → true
- Valid CUIT without dashes → true
- Empty string → true (optional)

**Estimated time:** 25 min

---

### **Step 3: Create TaxIdForm component**

**Task:** Formulario de Tax ID con validación dinámica

**File:** `src/components/settings/tax-id-form.tsx`

**Details:**

- Read country from `businessProfile.address?.country` (JSONB parsed)
- Call `getTaxIdConfig(country)` para obtener label, placeholder, description, regex
- React Hook Form con Zod schema dinámico (superRefine con validateTaxId)
- Pre-fill con `businessProfile.tax_id` y `businessProfile.tax_id_type`
- On country change (profile reload): update label/validation dinamicamente
- Save both `tax_id` and `tax_id_type` to business_profiles
- If no country set: show Alert info con link/sugerencia a tab Contacto
- Auto-uppercase para RFC (MX)
- Badge mostrando país detectado
- data-testid: `tax-id-input`, `tax-id-type-badge`, `save-tax-id-button`, `no-country-alert`

**Edge cases handled:**

- No country configured → generic "Tax ID" label, no validation
- Country changes (via SQ-10) → clear tax_id, update label on next visit
- Lowercase input for RFC → auto uppercase
- Empty submit → valid (optional field), clears tax_id and tax_id_type

**Testing:**

- Label changes when country changes
- RFC validation works for 12 and 13 chars
- NIT validation with verification digit
- CUIT with/without dashes
- No country → generic label
- Clear tax ID → saves null

**Estimated time:** 45 min

---

### **Step 4: Integrate with Settings page**

**Task:** Agregar TaxIdForm al tab "Datos Fiscales"

**File:** `src/app/(app)/settings/page.tsx`

**Details:**

- Reemplazar placeholder del tab "Datos Fiscales" con TaxIdForm
- Pasar businessProfile como prop

**Estimated time:** 10 min

---

### **Step 5: Integration & Verification**

**Task:** Verificar todos los flujos y test cases

**Details:**

1. Country=MX → label "RFC" → validar formato → save
2. Country=CO → label "NIT" → validar formato → save
3. Country=AR → label "CUIT" → validar formato → save
4. Country=CL → label "RUT" → no validation → save free text
5. No country → label "Tax ID" → no validation → save
6. Skip (leave empty) → save null → invoice sin tax ID
7. Tax ID en invoice PDF (verificación si rendering existe)
8. `bun run lint && bun run build`

**Estimated time:** 20 min

---

## Test Cases Mapping

| TC# | Test Case | Step |
|-----|-----------|------|
| TC-1 | Validate/save RFC persona física (13) | Step 2 + 3 |
| TC-2 | Validate/save RFC persona moral (12) | Step 2 + 3 |
| TC-3 | Validate/save NIT (9+1 digits) | Step 2 + 3 |
| TC-4 | Validate/save CUIT (11 digits XX-XX-X) | Step 2 + 3 |
| TC-5 | Reject invalid RFC | Step 2 + 3 |
| TC-6 | Reject invalid NIT | Step 2 + 3 |
| TC-7 | Reject invalid CUIT | Step 2 + 3 |
| TC-8 | Tax ID on invoice with label | Step 5 |
| TC-9 | Skip tax ID (optional) | Step 3 |
| TC-10 | Dynamic label on country change | Step 3 |
| TC-11 | Clear tax ID when country changes | Step 3 |
| TC-12 | Lowercase → uppercase for RFC | Step 2 + 3 |
| TC-13 | Unsupported country → generic | Step 2 + 3 |
| TC-14 | Input mask formatting CUIT | Step 3 |

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] SQ-8 implementado (settings page structure)
- [x] SQ-10 implementado (address JSONB con country) - **BLOCKER**
- [x] `useUpdateBusinessProfile` hook existe
- [ ] Migration tax_id_type column (Step 1)

---

## Risks & Mitigations

**Risk 1:** Country no configurado por usuario

- **Impact:** Medium
- **Mitigation:** Fallback a "Tax ID" genérico sin validación, Alert sugiriendo configurar country

**Risk 2:** RFC regex demasiado estricto/permisivo

- **Impact:** Medium
- **Mitigation:** Regex acepta ambos largos (12 y 13), case-insensitive, decidido en Shift-Left

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. DB Migration | 15 min |
| 2. Validation Utility | 25 min |
| 3. TaxIdForm | 45 min |
| 4. Integration | 10 min |
| 5. Verification | 20 min |
| **Total** | **~1h 55min** |

**Story points:** 5 (re-estimado desde 3 por country-dependent validation + dynamic UI)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los ACs pasando (AC1-AC5)
- [ ] **DB Migration:** tax_id_type column added
- [ ] **Types:** TaxIdType en lib/types.ts, supabase.ts regenerado
- [ ] **Validación dinámica:** RFC (MX), NIT (CO), CUIT (AR), generic (otros)
- [ ] **UI dinámica:** Label, placeholder, description cambian por country
- [ ] **Content Writing contextual:** Español LATAM
- [ ] **data-testid:**
  - [ ] `tax-id-input`, `tax-id-type-badge`
  - [ ] `save-tax-id-button`, `no-country-alert`
- [ ] **Test cases cubiertos:** TC-1 a TC-14
- [ ] `bun run lint && bun run build` sin errores

---

_Generado: 2026-03-11_
_Autor: Claude Code (Dev)_
