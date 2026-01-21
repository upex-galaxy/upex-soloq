# EPIC: Business Profile Management

**Jira Key:** [SQ-7](https://upexgalaxy64.atlassian.net/browse/SQ-7)
**Priority:** CRITICAL
**Phase:** Foundation (Sprint 1-2)
**Total Story Points:** 15

---

## Description

Configuración del perfil de negocio del freelancer que aparecerá en las facturas. Incluye nombre de negocio, logo, datos de contacto, datos fiscales y métodos de pago.

## Business Value

El perfil de negocio es fundamental para la credibilidad profesional del freelancer. Una factura con logo, datos fiscales correctos y métodos de pago claros aumenta la confianza del cliente y facilita el cobro.

---

## Acceptance Criteria

- Usuario puede configurar nombre de negocio
- Usuario puede subir logo (formatos: PNG, JPG, max 2MB)
- Usuario puede agregar información de contacto (email, teléfono, dirección)
- Usuario puede configurar datos fiscales (RFC/NIT/CUIT según país)
- Usuario puede configurar métodos de pago aceptados
- Todos los datos aparecen correctamente en las facturas generadas

---

## User Stories (5)

| Key                                                      | Story                           | Points | Priority |
| -------------------------------------------------------- | ------------------------------- | ------ | -------- |
| [SQ-8](https://upexgalaxy64.atlassian.net/browse/SQ-8)   | Configure Business Name         | 2      | High     |
| [SQ-9](https://upexgalaxy64.atlassian.net/browse/SQ-9)   | Upload Business Logo            | 3      | Medium   |
| [SQ-10](https://upexgalaxy64.atlassian.net/browse/SQ-10) | Add Contact Information         | 2      | High     |
| [SQ-11](https://upexgalaxy64.atlassian.net/browse/SQ-11) | Configure Tax ID (RFC/NIT/CUIT) | 3      | High     |
| [SQ-12](https://upexgalaxy64.atlassian.net/browse/SQ-12) | Configure Payment Methods       | 5      | Highest  |

---

## Technical Considerations

### Database Tables

```sql
-- business_profiles table
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name VARCHAR(100) NOT NULL,
  logo_url TEXT,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  address_street TEXT,
  address_city VARCHAR(100),
  address_state VARCHAR(100),
  address_postal_code VARCHAR(20),
  address_country VARCHAR(2) DEFAULT 'MX',
  tax_id VARCHAR(20),
  tax_id_type VARCHAR(10), -- RFC, NIT, CUIT, RUT, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- payment_methods table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- bank_transfer, paypal, mercadopago, other
  name VARCHAR(100) NOT NULL,
  details JSONB NOT NULL, -- Flexible storage for different payment types
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Storage

- Supabase Storage bucket: `logos`
- Max file size: 2MB
- Allowed formats: PNG, JPG
- Auto-resize to 400x400px on client before upload

### RLS Policies

```sql
-- business_profiles RLS
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON business_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- payment_methods RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own payment methods"
  ON payment_methods FOR ALL
  USING (auth.uid() = user_id);
```

### API Endpoints

| Method | Endpoint                   | Description             |
| ------ | -------------------------- | ----------------------- |
| GET    | `/api/profile`             | Get business profile    |
| PUT    | `/api/profile`             | Update business profile |
| POST   | `/api/profile/logo`        | Upload logo             |
| DELETE | `/api/profile/logo`        | Remove logo             |
| GET    | `/api/payment-methods`     | List payment methods    |
| POST   | `/api/payment-methods`     | Add payment method      |
| PUT    | `/api/payment-methods/:id` | Update payment method   |
| DELETE | `/api/payment-methods/:id` | Delete payment method   |

---

## Dependencies

### Blocked By

- SQ-1 (Epic: User Auth & Onboarding) - needs authenticated users
- SQ-6 (Guided Onboarding) - integrates with onboarding flow

### Blocks

- EPIC 4 (Invoice Creation) - needs business profile data for invoices
- EPIC 5 (PDF Generation) - needs logo and business data for PDF

---

## Related Documentation

- **PRD:** `.context/PRD/mvp-scope.md` (EPIC 2)
- **SRS:** `.context/SRS/functional-specs.md` (FR-007 to FR-011)
- **SRS:** `.context/SRS/api-contracts.yaml` (Profile endpoints)

---

_Documento parte del PBI de SoloQ_
_Última actualización: 2026-01-20_
