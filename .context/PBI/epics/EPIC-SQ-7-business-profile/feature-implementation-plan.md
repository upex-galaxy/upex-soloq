# Feature Implementation Plan: EPIC-SQ-7 - Business Profile Management

## Overview

Esta feature implementa la configuración completa del perfil de negocio del freelancer en SoloQ. Incluye nombre de negocio, logo, información de contacto, datos fiscales y métodos de pago. Todos estos datos aparecen en las facturas generadas.

**Alcance:**

- SQ-8: Configurar nombre de negocio (2 SP)
- SQ-10: Agregar información de contacto (3 SP - re-estimado por migración JSONB + country selector)
- SQ-9: Subir logo (5 SP - re-estimado por Supabase Storage + resize client-side)
- SQ-11: Configurar Tax ID RFC/NIT/CUIT (5 SP - re-estimado por validación country-specific)
- SQ-12: Configurar métodos de pago (8 SP - re-estimado por CRUD completo + JSON value)

**Stack técnico:**

- Frontend: Next.js 16 (App Router) + React 19
- Backend: Supabase (PostgreSQL 17 + Auth + Storage)
- Styling: Tailwind CSS 4.1 + shadcn/ui (New York)
- Forms: React Hook Form 7.71 + Zod
- Data Fetching: Supabase SDK + React Query (@tanstack/react-query)
- Language: TypeScript 5.9 (strict)

---

## Technical Decisions

### Decision 1: Settings Page Layout - Tabs

**Options considered:**

- A) Single scrollable page with sections
- B) Tabs para cada sección
- C) Sub-pages con routing (`/settings/profile`, `/settings/payments`, etc.)

**Chosen:** B) Tabs usando shadcn/ui `Tabs` component

**Reasoning:**

- ✅ shadcn/ui Tabs ya instalado en el proyecto
- ✅ Separa visualmente secciones complejas (payment methods tiene CRUD propio)
- ✅ Cada story agrega un tab incrementalmente sin afectar los demás
- ✅ Mejor UX que scroll largo para 5 secciones distintas
- ❌ Trade-off: Más complejidad que scroll simple, pero justificada por el volumen de contenido

**Implementation notes:**

- 4 Tabs: "Perfil" (SQ-8 + SQ-9), "Contacto" (SQ-10), "Datos Fiscales" (SQ-11), "Métodos de Pago" (SQ-12)
- SQ-8 crea la estructura base con el primer tab
- Stories posteriores agregan tabs al componente

---

### Decision 2: Address Storage - JSONB

**Options considered:**

- A) Mantener TEXT con string plano
- B) Migrar a JSONB con estructura `{street, city, state, postal_code, country}`
- C) Crear columnas separadas para cada campo de dirección

**Chosen:** B) JSONB

**Reasoning:**

- ✅ JSONB es nativo de PostgreSQL/Supabase, permite queries por campo individual
- ✅ El campo `country` dentro del JSONB es fuente de verdad para SQ-11 (tax ID) y SQ-12 (bank fields)
- ✅ No duplica datos (vs columna `country` separada)
- ✅ Flexible para agregar campos en el futuro sin migración
- ❌ Trade-off: Requiere migración de datos existentes (mitigado: address es nullable y probablemente vacío)

**Implementation notes:**

- Migration: `ALTER TABLE business_profiles ALTER COLUMN address TYPE jsonb USING CASE WHEN address IS NOT NULL AND address != '' THEN jsonb_build_object('street', address) ELSE NULL END;`
- TypeScript type: `BusinessAddress = { street?: string; city?: string; state?: string; postal_code?: string; country?: string }`
- Country codes: ISO 3166-1 alpha-2 ("MX", "CO", "AR", "CL", "PE", etc.)

---

### Decision 3: Payment Method Value - JSON en VARCHAR

**Chosen:** Almacenar JSON en el campo `value` VARCHAR existente

**Reasoning:**

- ✅ No requiere migración de schema (VARCHAR soporta JSON strings en PostgreSQL)
- ✅ Cada tipo tiene su propio schema JSON validado con Zod
- ✅ Parsing en API layer, no en DB
- ❌ Trade-off: Sin validación a nivel DB, pero Zod cubre la validación en application layer

**Implementation notes:**

- `bank_transfer`: `{"bank_name": "BBVA", "account_number": "0123", "clabe": "012345678901234567"}` (MX) o `{"bank_name": "Nación", "cbu": "01234567890123456789AB"}` (AR)
- `paypal`: `{"email": "user@example.com"}`
- `mercado_pago`: `{"alias": "val.dev"}` o `{"cvu": "000..."}`
- `other`: `{"name": "Wise", "instructions": "Transfer to..."}`
- `cash`: `{"instructions": "Pago en efectivo al entregar..."}`

---

### Decision 4: Logo Resize Strategy

**Chosen:** Proportional scale client-side con Canvas API, fit within 400x400px

**Reasoning:**

- ✅ Preserva aspect ratio (800x400 → 400x200, no crop)
- ✅ Reduce tamaño antes de upload (mejor performance)
- ✅ Canvas API disponible en todos los browsers modernos
- ❌ Trade-off: No funciona en Server Components (pero upload es client-side por naturaleza)

---

### Decision 5: Mutation Pattern - React Query useMutation + Supabase

**Chosen:** Hooks con `useMutation` + `queryClient.invalidateQueries` para cache update

**Reasoning:**

- ✅ Consistente con hooks existentes (useCreateClient, useUpdateInvoice, etc.)
- ✅ Optimistic updates posibles para UX responsiva
- ✅ Cache invalidation automática del queryKey `['business-profile']`
- ✅ Error handling integrado con toast notifications

---

## Types & Type Safety

**Tipos existentes en `lib/types.ts`:**

- `BusinessProfile` = `Tables<'business_profiles'>` (Row type)
- `BusinessProfileUpdate` = `TablesUpdate<'business_profiles'>` (Update type)
- `PaymentMethod` = `Tables<'payment_methods'>` (Row type)
- `PaymentMethodInsert` = `TablesInsert<'payment_methods'>` (Insert type)
- `PaymentMethodUpdate` = `TablesUpdate<'payment_methods'>` (Update type)
- `PaymentMethodType` = Enum (`bank_transfer | paypal | mercado_pago | cash | other`)

**Tipos nuevos a agregar en `lib/types.ts` (post-migraciones):**

```typescript
// Address structure (JSONB)
export interface BusinessAddress {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string; // ISO 3166-1 alpha-2: "MX", "CO", "AR", etc.
}

// Payment method value schemas (JSON in VARCHAR)
export interface BankTransferValue {
  bank_name: string;
  account_number?: string;
  clabe?: string; // Mexico - 18 digits
  cbu?: string;   // Argentina - 22 digits
}

export interface PaypalValue {
  email: string;
}

export interface MercadoPagoValue {
  alias?: string;
  cvu?: string;
}

export interface OtherPaymentValue {
  name: string;
  instructions?: string;
}

export interface CashPaymentValue {
  instructions?: string;
}

export type PaymentMethodValue =
  | BankTransferValue
  | PaypalValue
  | MercadoPagoValue
  | OtherPaymentValue
  | CashPaymentValue;

// Tax ID types
export type TaxIdType = 'RFC' | 'NIT' | 'CUIT' | 'RUT' | 'RUC' | 'Tax ID';

// Country options for LATAM
export const LATAM_COUNTRIES = [
  { code: 'MX', name: 'México', taxIdLabel: 'RFC' },
  { code: 'CO', name: 'Colombia', taxIdLabel: 'NIT' },
  { code: 'AR', name: 'Argentina', taxIdLabel: 'CUIT' },
  { code: 'CL', name: 'Chile', taxIdLabel: 'RUT' },
  { code: 'PE', name: 'Perú', taxIdLabel: 'RUC' },
  { code: 'UY', name: 'Uruguay', taxIdLabel: 'RUT' },
  { code: 'EC', name: 'Ecuador', taxIdLabel: 'RUC' },
  { code: 'OTHER', name: 'Otro', taxIdLabel: 'Tax ID' },
] as const;
```

**Directiva para todas las stories:**

- ✅ Importar tipos desde `@/lib/types`
- ✅ Props de componentes tipadas con tipos del backend
- ✅ Zod schemas para validación de formularios
- ✅ `z.infer<>` para derivar tipos de formulario desde schemas
- ✅ Regenerar `types/supabase.ts` después de cada migración DB

---

## UI/UX Design Strategy

### Componentes del Design System a usar:

- ✅ `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`: Layout principal de settings
- ✅ `Card` / `CardHeader` / `CardContent`: Contenedor de cada sección
- ✅ `Form` / `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage`: Todos los formularios
- ✅ `Input`: Campos de texto (business name, email, phone, tax ID, bank details)
- ✅ `Select` / `SelectTrigger` / `SelectContent` / `SelectItem`: Country selector, payment type
- ✅ `Button`: Save, Add, Delete, Toggle actions
- ✅ `Badge`: Status indicators (active/inactive payment methods)
- ✅ `Dialog`: Confirmación de eliminación, formulario de payment method
- ✅ `Switch`: Toggle active/inactive payment methods
- ✅ `Separator`: Dividir secciones dentro de tabs
- ✅ `Skeleton`: Loading states
- ✅ `Alert`: Mensajes de error/warning

### Componentes custom de la feature:

- 🆕 `BusinessNameForm` → `components/settings/business-name-form.tsx` (SQ-8)
- 🆕 `LogoUpload` → `components/settings/logo-upload.tsx` (SQ-9)
- 🆕 `ContactInfoForm` → `components/settings/contact-info-form.tsx` (SQ-10)
- 🆕 `TaxIdForm` → `components/settings/tax-id-form.tsx` (SQ-11)
- 🆕 `PaymentMethodsSection` → `components/settings/payment-methods-section.tsx` (SQ-12)
- 🆕 `PaymentMethodCard` → `components/settings/payment-method-card.tsx` (SQ-12)
- 🆕 `PaymentMethodFormDialog` → `components/settings/payment-method-form-dialog.tsx` (SQ-12)

### Personalidad UI/UX: Minimalista Profesional

Consistente con el design system de SoloQ:

- Espacios generosos (`p-6`, `space-y-6`)
- Tipografía limpia y jerárquica
- Sombras sutiles (`shadow-sm` en Cards)
- Bordes suaves (`rounded-lg` en Cards, `rounded-md` en inputs)
- Colores profesionales: azul primary, slate backgrounds
- Toast notifications para feedback de save/error

### Wireframe del Settings Page:

```
┌──────────────────────────────────────────────────┐
│ Configuración                                     │
│ Personaliza tu perfil de negocio y preferencias.  │
├──────────────────────────────────────────────────┤
│ [Perfil] [Contacto] [Datos Fiscales] [Pagos]     │
├──────────────────────────────────────────────────┤
│ Tab Content:                                      │
│ ┌──────────────────────────────────┐              │
│ │ Card: Nombre del negocio        │              │
│ │ [Input: business name] [26/100] │              │
│ │ [Guardar]                       │              │
│ ├──────────────────────────────────┤              │
│ │ Card: Logo                      │              │
│ │ [Preview] [Upload/Remove]       │              │
│ └──────────────────────────────────┘              │
└──────────────────────────────────────────────────┘
```

### Estados globales:

- **Loading:** Skeleton loaders en cada tab
- **Empty:** Formularios vacíos con placeholders contextuales
- **Error:** Toast notification + inline error messages
- **Success:** Toast "Cambios guardados" + cache invalidation

---

## Content Writing Strategy

**Idioma:** Español (LATAM) - consistente con toda la app

**Vocabulario del dominio SoloQ:**

- "Nombre del negocio" (no "Company name")
- "Datos fiscales" (no "Tax information")
- "Métodos de pago" (no "Payment settings")
- "Factura" / "Facturas" (no "Invoice" - UI en español)
- "Configuración" (no "Settings")
- "Guardar cambios" (no "Save")

**Tono:** Profesional pero accesible - freelancers LATAM

**Ejemplos contextuales:**

- ✅ "Este nombre aparecerá en el encabezado de tus facturas"
- ✅ "Agrega los datos con los que tus clientes pueden contactarte"
- ✅ "Tu logo personaliza tus facturas y les da un aspecto profesional"
- ✅ "Configura tu identificación fiscal según tu país"
- ✅ "Define cómo tus clientes pueden pagarte"
- ❌ "Bienvenido a la configuración de tu perfil"
- ❌ "Gestiona tu información de negocio"

---

## Shared Dependencies

**Todas las stories requieren:**

1. **React Hook Form + Zod**: Validación de formularios (ya instalados)
2. **@tanstack/react-query**: Cache y mutations (ya instalado)
3. **Supabase Client** (`@/lib/supabase/client`): Operaciones DB client-side
4. **shadcn/ui components**: Ya instalados (Tabs, Card, Form, Input, Select, Button, etc.)
5. **lucide-react**: Iconos (ya instalado)
6. **sonner**: Toast notifications (ya instalado - verificar)
7. **Auth Context** (`@/contexts/auth-context`): User ID para queries
8. **useBusinessProfile hook**: Fetch del perfil (ya existe)

**Environment variables:** Ninguna nueva requerida (Supabase keys ya configurados)

**External services:**
- Supabase Database: Almacenamiento de perfil y payment methods
- Supabase Storage: Bucket `logos` para upload de logos (SQ-9)

---

## Architecture Notes

### Folder Structure

```
src/
├── app/(app)/settings/
│   └── page.tsx                              # Settings page con Tabs
│
├── components/settings/
│   ├── business-name-form.tsx                # SQ-8
│   ├── logo-upload.tsx                       # SQ-9
│   ├── contact-info-form.tsx                 # SQ-10
│   ├── tax-id-form.tsx                       # SQ-11
│   ├── payment-methods-section.tsx           # SQ-12 (lista + actions)
│   ├── payment-method-card.tsx               # SQ-12 (card individual)
│   └── payment-method-form-dialog.tsx        # SQ-12 (add/edit dialog)
│
├── hooks/business-profile/
│   ├── use-business-profile.ts               # Ya existe (fetch)
│   ├── use-update-business-profile.ts        # SQ-8 (mutation)
│   └── index.ts                              # Re-exports
│
├── hooks/payment-methods/
│   ├── use-payment-methods.ts                # SQ-12 (fetch list)
│   ├── use-create-payment-method.ts          # SQ-12 (create mutation)
│   ├── use-update-payment-method.ts          # SQ-12 (update mutation)
│   ├── use-delete-payment-method.ts          # SQ-12 (delete mutation)
│   └── index.ts                              # Re-exports
│
├── lib/
│   ├── types.ts                              # Tipos existentes + nuevos
│   ├── validations/
│   │   ├── business-profile.ts               # Zod schemas para business profile
│   │   ├── tax-id.ts                         # Tax ID validation (RFC/NIT/CUIT regex)
│   │   └── payment-method.ts                 # Payment method Zod schemas por tipo
│   └── utils/
│       └── image-resize.ts                   # SQ-9: Canvas resize utility
```

### Design Patterns

1. **Form Pattern**: RHF + Zod → Component → useMutation → Supabase → invalidateQueries
2. **Hook Pattern**: useQuery para reads, useMutation para writes (consistente con hooks/clients/, hooks/invoices/)
3. **Validation Pattern**: Zod schemas en `lib/validations/` importados por componentes y hooks
4. **Component Pattern**: Componentes domain-specific en `components/settings/`, UI base de shadcn/ui

---

## Implementation Order

**Recomendado (con dependencias):**

1. **SQ-8: Business Name Configuration** (base para todo)
   - Razón: Establece la estructura del settings page (Tabs layout), crea el hook de mutation, y es la story más simple. Foundation sobre la cual se construyen las demás.

2. **SQ-10: Contact Information** (habilita SQ-11 y SQ-12)
   - Razón: La migración de address TEXT→JSONB introduce el country selector, que es la fuente de verdad para la validación de tax ID (SQ-11) y los campos bancarios country-specific (SQ-12). BLOCKER para SQ-11 y SQ-12.

3. **SQ-9: Logo Upload** (independiente)
   - Razón: Independiente de SQ-10. Puede implementarse en paralelo con SQ-11 si hay capacidad. Requiere Supabase Storage setup.

4. **SQ-11: Tax ID Configuration** (depende de SQ-10)
   - Razón: Lee el country de `address->>'country'` (JSONB de SQ-10) para determinar label dinámico y regex de validación. Si no hay country, fallback a "Tax ID" genérico.

5. **SQ-12: Payment Methods Configuration** (depende de SQ-10, la más compleja)
   - Razón: Tabla separada con CRUD completo, campos country-dependent (CLABE/CBU), toggle active/inactive, restricción min 1 activo. Historia más compleja del epic. Se beneficia de tener el country selector ya implementado.

**Diagrama de dependencias:**

```
SQ-8 (foundation) ──► SQ-10 (country) ──► SQ-11 (tax ID)
                   │                   └──► SQ-12 (payments)
                   └──► SQ-9 (logo, independent)
```

---

## DB Migrations Required

Las siguientes migraciones se ejecutan como parte de las stories, no como tarea previa:

| # | Migración | Story | Tipo | Detalle |
|---|-----------|-------|------|---------|
| 1 | CHECK constraint business_name | SQ-8 | ADD CONSTRAINT | `length(business_name) <= 100` |
| 2 | address TEXT → JSONB | SQ-10 | ALTER COLUMN | Structured address con country |
| 3 | Add tax_id_type | SQ-11 | ADD COLUMN | VARCHAR nullable |
| 4 | Add is_active | SQ-12 | ADD COLUMN | BOOLEAN DEFAULT true |

**Post-migración:** Regenerar `types/supabase.ts` con `mcp__supabase__generate_typescript_types`

---

## Risks & Mitigations

### Risk 1: Address Migration Breaks Existing Data

**Impact:** Medium
**Likelihood:** Low (address is nullable and likely empty/null for most users)
**Mitigation:**

- Migration con `USING CASE WHEN address IS NOT NULL THEN jsonb_build_object('street', address) ELSE NULL END`
- Convierte datos existentes a JSONB preservando el valor original como `street`
- Test migration en staging antes de production

### Risk 2: Supabase Storage RLS para Logos

**Impact:** High (security)
**Likelihood:** Medium
**Mitigation:**

- Verificar/crear bucket `logos` con RLS policies
- Policy: `auth.uid()::text = (storage.foldername(name))[1]` (user can only access their own folder)
- Naming convention: `{user_id}/{timestamp}.{ext}`

### Risk 3: Client-Side Image Resize Cross-Browser

**Impact:** Medium
**Likelihood:** Low
**Mitigation:**

- Canvas API es estándar en todos los browsers modernos
- Fallback: upload sin resize si canvas falla (server validará tamaño)
- Test con formatos PNG, JPG en Chrome, Firefox, Safari

### Risk 4: Payment Method Value JSON Parsing

**Impact:** Medium
**Likelihood:** Medium
**Mitigation:**

- Zod schemas estrictos por tipo de payment method
- try/catch en JSON.parse con fallback graceful
- Validación both en frontend (form) y backend (API/hook)

---

## Success Criteria

**Esta feature estará completa cuando:**

- [ ] Todas las 5 stories implementadas y deployed a staging
- [ ] **DB Migrations aplicadas:**
  - [ ] CHECK constraint en business_name
  - [ ] address TEXT → JSONB
  - [ ] tax_id_type column agregada
  - [ ] is_active column agregada en payment_methods
- [ ] **Tipos actualizados:**
  - [ ] `types/supabase.ts` regenerado post-migraciones
  - [ ] Nuevos tipos (BusinessAddress, PaymentMethodValue, TaxIdType) en `lib/types.ts`
  - [ ] Zero type errors
- [ ] **UI/UX consistente:**
  - [ ] Settings page con 4 Tabs funcionales
  - [ ] Estilo minimalista profesional consistente
  - [ ] Responsive (mobile/tablet/desktop)
  - [ ] Loading/empty/error states en cada tab
- [ ] **Content Writing contextual:**
  - [ ] Español LATAM, vocabulario del dominio SoloQ
  - [ ] Sin frases placeholder
- [ ] **61 test cases cubiertos** (según feature test plan)
- [ ] **Build y linting pasando:**
  - [ ] `bun run build` exitoso
  - [ ] `bun run lint` sin errores
  - [ ] Zero TypeScript errors
- [ ] **Profile data renderiza correctamente en invoice PDF** (integración verificada)

---

_Generado: 2026-03-11_
_Autor: Claude Code (Dev)_
