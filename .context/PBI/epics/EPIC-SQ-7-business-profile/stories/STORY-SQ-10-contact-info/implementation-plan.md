# Implementation Plan: STORY-SQ-10 - Add Contact Information

## Overview

Implementar la funcionalidad para que el usuario pueda agregar y editar su información de contacto (email, teléfono, dirección con country selector) desde Settings. El country selector es la fuente de verdad para SQ-11 (Tax ID) y SQ-12 (Payment Methods).

**Esta story incluye la migración crítica de `address` TEXT → JSONB y establece el country selector que habilita SQ-11 y SQ-12.**

**Acceptance Criteria a cumplir:**

- AC1: Add contact email (required, valid format)
- AC2: Add phone number (optional, E.164 format with country code)
- AC3: Add business address (optional, structured fields: street, city, state, postal_code, country)
- AC4: Contact info appears on invoice

---

## Technical Approach

**Chosen approach:** Migración address→JSONB + ContactInfoForm con campos estructurados + country dropdown (LATAM countries) + validación E.164 para teléfono + pre-fill de email desde account.

**Alternatives considered:**

- Columnas separadas para address fields: Más rígido, requiere más columnas, menos flexible
- Country como columna separada: Duplica datos con address.country

**Why this approach:**

- ✅ JSONB permite queries por campo y es flexible para extensiones futuras
- ✅ Country dentro de address evita duplicación
- ✅ Pre-fill de contact_email desde auth email (decisión PO del Shift-Left)
- ❌ Trade-off: Migración de datos existentes necesaria (bajo riesgo - address mayormente null)

---

## UI/UX Design

### Componentes del Design System a usar:

- ✅ `Card` / `CardHeader` / `CardContent`: Contenedor del form
- ✅ `Form` / `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage` / `FormDescription`
- ✅ `Input`: Email, phone, street, city, state, postal code
- ✅ `Select`: Country dropdown
- ✅ `Button`: Guardar cambios
- ✅ `Separator`: Entre sección de contacto y dirección

### Componentes custom:

- 🆕 `ContactInfoForm` → `src/components/settings/contact-info-form.tsx`
  - **Propósito:** Form para email, phone, address (con country)
  - **Props:** `businessProfile: BusinessProfile | null`, `userEmail?: string`, `onSuccess?: () => void`

### Wireframe (Tab "Contacto"):

```
┌──────────────────────────────────────────────────────┐
│ [Perfil] [Contacto ✓] [Datos Fiscales] [Pagos]       │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐  │
│ │ Información de contacto                          │  │
│ │ Datos con los que tus clientes pueden            │  │
│ │ contactarte. Aparecerán en tus facturas.         │  │
│ │                                                  │  │
│ │ Email de contacto *                              │  │
│ │ ┌──────────────────────────────────┐             │  │
│ │ │ carlos@estudio.mx                │             │  │
│ │ └──────────────────────────────────┘             │  │
│ │ Puede ser diferente a tu email de cuenta.        │  │
│ │                                                  │  │
│ │ Teléfono (opcional)                              │  │
│ │ ┌──────────────────────────────────┐             │  │
│ │ │ +52 55 1234 5678                 │             │  │
│ │ └──────────────────────────────────┘             │  │
│ │ Formato internacional con código de país.        │  │
│ │                                                  │  │
│ │ ──────── Dirección (opcional) ──────────         │  │
│ │                                                  │  │
│ │ País                                             │  │
│ │ ┌──────────────────────────────────┐             │  │
│ │ │ México ▼                         │             │  │
│ │ └──────────────────────────────────┘             │  │
│ │                                                  │  │
│ │ Calle                                            │  │
│ │ ┌──────────────────────────────────┐             │  │
│ │ │ Av. Reforma 123, Col. Centro     │             │  │
│ │ └──────────────────────────────────┘             │  │
│ │                                                  │  │
│ │ Ciudad              Estado                       │  │
│ │ ┌──────────────┐   ┌──────────────┐             │  │
│ │ │ CDMX         │   │ CDMX         │             │  │
│ │ └──────────────┘   └──────────────┘             │  │
│ │                                                  │  │
│ │ Código postal                                    │  │
│ │ ┌──────────────┐                                 │  │
│ │ │ 06600        │                                 │  │
│ │ └──────────────┘                                 │  │
│ │                                                  │  │
│ │                        [Guardar cambios]         │  │
│ └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Estados de UI:

- **Loading:** Skeleton en campos
- **First time:** Email pre-filled desde account email, resto vacío
- **Filled:** Campos con valores guardados
- **Saving:** Button disabled "Guardando..."
- **Success:** Toast "Información de contacto actualizada"

### Validaciones:

- **Email:** Required, formato válido → "Ingresa un email válido"
- **Phone:** Optional, si se ingresa debe ser E.164 (`+` seguido de dígitos) → "Formato: +52 55 1234 5678"
- **Address fields:** Todos opcionales, sin validación específica
- **Country:** Optional, pero recomendado (afecta SQ-11 y SQ-12)

---

## Types & Type Safety

**Tipos nuevos a agregar en `lib/types.ts`:**

```typescript
export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string; // ISO 3166-1 alpha-2
}

export const LATAM_COUNTRIES = [
  { code: 'MX', name: 'México', taxIdLabel: 'RFC', phonePre: '+52' },
  { code: 'CO', name: 'Colombia', taxIdLabel: 'NIT', phonePre: '+57' },
  { code: 'AR', name: 'Argentina', taxIdLabel: 'CUIT', phonePre: '+54' },
  { code: 'CL', name: 'Chile', taxIdLabel: 'RUT', phonePre: '+56' },
  { code: 'PE', name: 'Perú', taxIdLabel: 'RUC', phonePre: '+51' },
  { code: 'UY', name: 'Uruguay', taxIdLabel: 'RUT', phonePre: '+598' },
  { code: 'EC', name: 'Ecuador', taxIdLabel: 'RUC', phonePre: '+593' },
] as const;
```

**Zod schema:**

```typescript
// lib/validations/business-profile.ts (extend)
const contactInfoSchema = z.object({
  contactEmail: z.string().email('Ingresa un email válido'),
  contactPhone: z.string()
    .refine(val => !val || /^\+[1-9]\d{6,14}$/.test(val.replace(/\s/g, '')),
      'Formato internacional: +52 55 1234 5678')
    .optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    postal_code: z.string().optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
  }).optional(),
});
```

---

## Content Writing

- Card title: "Información de contacto"
- Card description: "Datos con los que tus clientes pueden contactarte. Aparecerán en tus facturas."
- Email label: "Email de contacto"
- Email description: "Puede ser diferente a tu email de cuenta."
- Phone label: "Teléfono (opcional)"
- Phone description: "Formato internacional con código de país."
- Address section: "Dirección (opcional)"
- Country label: "País"
- Country placeholder: "Selecciona tu país"
- Street label: "Calle y número"
- City label: "Ciudad"
- State label: "Estado / Provincia"
- Postal code label: "Código postal"
- Success toast: "Información de contacto actualizada"

---

## Implementation Steps

### **Step 1: DB Migration - address TEXT → JSONB**

**Task:** Migrar la columna `address` de TEXT a JSONB

**Details:**

- Usar Supabase MCP `apply_migration`:
  ```sql
  ALTER TABLE business_profiles
  ALTER COLUMN address TYPE jsonb
  USING CASE
    WHEN address IS NOT NULL AND address != ''
    THEN jsonb_build_object('street', address)
    ELSE NULL
  END;

  COMMENT ON COLUMN business_profiles.address IS
  'Structured address as JSONB: {street, city, state, postal_code, country}';
  ```
- Regenerar `types/supabase.ts`
- Actualizar `BusinessAddress` type en `lib/types.ts`

**Testing:**

- Datos existentes preservados como `{"street": "valor_anterior"}`
- NULL permanece NULL
- Insert/update con JSONB funciona

**Estimated time:** 20 min

---

### **Step 2: Add types and validation schemas**

**Task:** Agregar BusinessAddress type y contactInfoSchema

**Files:**
- `src/lib/types.ts` - Add BusinessAddress interface + LATAM_COUNTRIES
- `src/lib/validations/business-profile.ts` - Add contactInfoSchema

**Details:**

- BusinessAddress interface con campos opcionales
- LATAM_COUNTRIES array con code, name, taxIdLabel, phonePre
- Zod schema: email required, phone optional E.164, address optional structured

**Testing:**

- Schema valida email correcto, rechaza inválido
- Schema acepta phone vacío y E.164 válido
- Schema acepta address parcial

**Estimated time:** 15 min

---

### **Step 3: Extend useUpdateBusinessProfile hook**

**Task:** Asegurar que el hook de mutation soporta contact_email, contact_phone, y address (JSONB)

**File:** `src/hooks/business-profile/use-update-business-profile.ts`

**Details:**

- Si ya existe de SQ-8, solo verificar que soporta los nuevos campos
- Si no, crear con soporte para todos los campos de business_profiles
- Serializar address como JSON antes de enviar a Supabase
- Invalidar cache en onSuccess

**Testing:**

- Mutation guarda email, phone, y address JSONB correctamente

**Estimated time:** 10 min

---

### **Step 4: Create ContactInfoForm component**

**Task:** Componente de formulario para información de contacto

**File:** `src/components/settings/contact-info-form.tsx`

**Details:**

- React Hook Form con contactInfoSchema
- Pre-fill `contactEmail` con `userEmail` prop (email de auth) si es primera vez
- Pre-fill con datos existentes del `businessProfile` si ya tiene
- Country dropdown con LATAM_COUNTRIES
- Phone input con placeholder dinámico según country ("+52 55 1234 5678" para MX)
- Address fields en grid (2 cols para city/state, 1 col para street y postal_code)
- Separator visual entre contacto y dirección
- Button "Guardar cambios" al final
- data-testid en todos los campos interactivos

**Edge cases handled:**

- Email igual al de cuenta: Permitido, sin error
- Phone sin country code: Mostrar hint con +XX del país seleccionado
- Address parcial (solo city): Permitido, todos los campos son opcionales
- Country sin dirección: Permitido, country se guarda y propaga a SQ-11/SQ-12

**Testing:**

- Form renderiza con pre-fill
- Email validation funciona
- Phone E.164 validation funciona
- Country selector cambia placeholder de phone
- Address JSONB se guarda correctamente

**Estimated time:** 50 min

---

### **Step 5: Integrate with Settings page**

**Task:** Agregar ContactInfoForm al tab "Contacto" del settings page

**File:** `src/app/(app)/settings/page.tsx`

**Details:**

- Reemplazar placeholder del tab "Contacto" con ContactInfoForm
- Pasar `businessProfile` y `user.email` como props
- Asegurar que loading state muestra skeleton

**Testing:**

- Tab "Contacto" muestra el form
- Datos se cargan y guardan correctamente

**Estimated time:** 15 min

---

### **Step 6: Integration & Verification**

**Task:** Verificar integración completa y todos los test cases

**Details:**

1. Guardar email de contacto → verificar en DB
2. Guardar phone E.164 → verificar formato en DB
3. Seleccionar country + llenar address → verificar JSONB en DB
4. Pre-fill de email en primera visita → verificar
5. Editar contacto existente → verificar update
6. Verificar que invoice PDF muestra contact info (si invoice rendering existe)
7. `bun run lint && bun run build` pasan

**Estimated time:** 20 min

---

## Test Cases Mapping

| TC# | Test Case | Step |
|-----|-----------|------|
| TC-1 | Save valid contact email | Step 4 + 6 |
| TC-2 | Reject invalid email format | Step 2 + 4 |
| TC-3 | Save phone with E.164 | Step 4 + 6 |
| TC-4 | Reject invalid phone | Step 2 + 4 |
| TC-5 | Save complete address | Step 4 + 6 |
| TC-6 | Accept partial address | Step 4 (optional fields) |
| TC-7 | Contact info on invoice PDF | Step 6 |
| TC-8 | Update existing contact info | Step 4 + 6 |
| TC-9 | Pre-fill email from account | Step 4 |
| TC-10 | Allow different contact email | Step 4 |

---

## Dependencies

**Pre-requisitos técnicos:**

- [x] SQ-8 implementado (settings page structure with Tabs)
- [x] `useBusinessProfile` hook existe
- [x] `useUpdateBusinessProfile` hook existe (de SQ-8)
- [ ] Migration address TEXT → JSONB (Step 1 de esta story)

---

## Risks & Mitigations

**Risk 1:** Migration address TEXT→JSONB en datos existentes

- **Impact:** Medium
- **Mitigation:** USING clause preserva datos existentes como `{"street": "valor"}`

**Risk 2:** Country selector impacta SQ-11 y SQ-12

- **Impact:** High (blocker si no funciona)
- **Mitigation:** Country se guarda en address JSONB, test que SQ-11/SQ-12 pueden leer `address->>'country'`

---

## Estimated Effort

| Step | Time |
|------|------|
| 1. DB Migration | 20 min |
| 2. Types & Schemas | 15 min |
| 3. Extend Hook | 10 min |
| 4. ContactInfoForm | 50 min |
| 5. Integration Settings | 15 min |
| 6. Verification | 20 min |
| **Total** | **~2h 10min** |

**Story points:** 3 (re-estimado desde 2 por migración + country selector)

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Todos los ACs pasando (AC1-AC4)
- [ ] **DB Migration aplicada:** address TEXT → JSONB
- [ ] **Types actualizados:** BusinessAddress, LATAM_COUNTRIES en lib/types.ts
- [ ] **Tipos regenerados:** types/supabase.ts actualizado
- [ ] **UI/UX minimalista profesional**
  - [ ] Country dropdown funcional
  - [ ] Pre-fill de email
  - [ ] Grid layout responsive para address fields
- [ ] **Content Writing contextual:** Español LATAM
- [ ] **data-testid** en elementos interactivos
  - [ ] `contact-email-input`, `contact-phone-input`
  - [ ] `country-select`, `street-input`, `city-input`, `state-input`, `postal-code-input`
  - [ ] `save-contact-info-button`
- [ ] **Test cases cubiertos:** TC-1 a TC-10
- [ ] `bun run lint && bun run build` sin errores

---

_Generado: 2026-03-11_
_Autor: Claude Code (Dev)_
