# Architecture Specifications - SoloQ

> **Software Requirements Specification**
> Versión: 1.0 | Última actualización: 2026-01-20

---

## 1. System Architecture (C4 Model)

### 1.1 Context Diagram (Level 1)

```mermaid
C4Context
    title System Context Diagram - SoloQ

    Person(freelancer, "Freelancer", "Usuario que crea y envía facturas")
    Person(client, "Cliente", "Recibe facturas por email")

    System(soloq, "SoloQ", "Plataforma de facturación para freelancers")

    System_Ext(supabase, "Supabase", "Auth, Database, Storage")
    System_Ext(resend, "Resend", "Email delivery")
    System_Ext(stripe, "Stripe", "Suscripciones (Pro)")

    Rel(freelancer, soloq, "Usa", "HTTPS")
    Rel(soloq, supabase, "Almacena datos", "HTTPS")
    Rel(soloq, resend, "Envía emails", "HTTPS/API")
    Rel(soloq, stripe, "Procesa suscripciones", "HTTPS/API")
    Rel(soloq, client, "Envía facturas por email")
```

### 1.2 Container Diagram (Level 2)

```mermaid
C4Container
    title Container Diagram - SoloQ

    Person(freelancer, "Freelancer")

    Container_Boundary(vercel, "Vercel") {
        Container(nextjs, "Next.js App", "React, TypeScript", "Frontend + API Routes")
        Container(pdf_gen, "PDF Generator", "@react-pdf/renderer", "Genera facturas en PDF")
    }

    Container_Boundary(supabase_cloud, "Supabase Cloud") {
        ContainerDb(postgres, "PostgreSQL", "Database", "Datos de usuarios, facturas, clientes")
        Container(supabase_auth, "Supabase Auth", "Auth Service", "Autenticación y sesiones")
        Container(supabase_storage, "Supabase Storage", "Object Storage", "Logos, PDFs generados")
        Container(edge_functions, "Edge Functions", "Deno", "Jobs programados (reminders)")
    }

    System_Ext(resend, "Resend", "Email API")
    System_Ext(stripe, "Stripe", "Payments API")

    Rel(freelancer, nextjs, "Usa", "HTTPS")
    Rel(nextjs, supabase_auth, "Autentica", "HTTPS")
    Rel(nextjs, postgres, "Lee/Escribe", "HTTPS/Supabase Client")
    Rel(nextjs, supabase_storage, "Sube/Descarga", "HTTPS")
    Rel(nextjs, pdf_gen, "Genera PDF")
    Rel(nextjs, resend, "Envía emails", "HTTPS")
    Rel(nextjs, stripe, "Suscripciones", "HTTPS")
    Rel(edge_functions, postgres, "Lee datos")
    Rel(edge_functions, resend, "Envía recordatorios")
```

---

## 2. Database Design (ERD)

### 2.1 Entity-Relationship Diagram

```mermaid
erDiagram
    users ||--|| profiles : has
    users ||--|| business_profiles : has
    users ||--o{ payment_methods : has
    users ||--o{ clients : owns
    users ||--o{ invoices : creates
    users ||--|| subscription : has
    users ||--|| reminder_settings : has

    clients ||--o{ invoices : receives

    invoices ||--|{ invoice_items : contains
    invoices ||--o{ payments : has
    invoices ||--o{ invoice_events : logs

    users {
        uuid id PK
        string email UK
        timestamp created_at
        timestamp last_sign_in_at
    }

    profiles {
        uuid id PK
        uuid user_id FK
        timestamp email_verified_at
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
    }

    business_profiles {
        uuid id PK
        uuid user_id FK
        string business_name
        string contact_email
        string contact_phone
        text address
        string tax_id
        string logo_url
        timestamp created_at
        timestamp updated_at
    }

    payment_methods {
        uuid id PK
        uuid user_id FK
        string type
        string label
        string value
        boolean is_default
        int sort_order
        timestamp created_at
    }

    clients {
        uuid id PK
        uuid user_id FK
        string name
        string email
        string company
        string phone
        text address
        string tax_id
        text notes
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    invoices {
        uuid id PK
        uuid user_id FK
        uuid client_id FK
        string invoice_number UK
        date issue_date
        date due_date
        string status
        string currency
        decimal subtotal
        decimal discount_value
        string discount_type
        decimal tax_rate
        decimal tax_amount
        decimal total
        text notes
        int reminder_count
        timestamp sent_at
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    invoice_items {
        uuid id PK
        uuid invoice_id FK
        string description
        decimal quantity
        decimal unit_price
        decimal subtotal
        int sort_order
    }

    payments {
        uuid id PK
        uuid invoice_id FK
        string payment_method
        decimal amount_received
        date payment_date
        string reference
        text notes
        timestamp created_at
        timestamp deleted_at
    }

    invoice_events {
        uuid id PK
        uuid invoice_id FK
        string event_type
        jsonb metadata
        timestamp created_at
    }

    subscription {
        uuid id PK
        uuid user_id FK
        string plan
        string status
        string stripe_customer_id
        string stripe_subscription_id
        timestamp current_period_start
        timestamp current_period_end
        boolean cancel_at_period_end
        timestamp created_at
        timestamp updated_at
    }

    reminder_settings {
        uuid id PK
        uuid user_id FK
        boolean enabled
        int frequency_days
        int max_reminders
        string custom_subject
        text custom_message
        timestamp created_at
        timestamp updated_at
    }
```

### 2.2 Enums y Tipos

```sql
-- Status de factura
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- Tipo de descuento
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

-- Tipo de método de pago
CREATE TYPE payment_method_type AS ENUM ('bank_transfer', 'paypal', 'mercado_pago', 'cash', 'other');

-- Tipo de evento de factura
CREATE TYPE invoice_event_type AS ENUM ('created', 'updated', 'sent', 'reminder_sent', 'viewed', 'paid', 'cancelled');

-- Plan de suscripción
CREATE TYPE subscription_plan AS ENUM ('free', 'pro');

-- Status de suscripción
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'incomplete');
```

---

## 3. Tech Stack Justification

### 3.1 Frontend: Next.js 15 (App Router)

| Aspecto | Detalle |
|---------|---------|
| **Por qué elegido** | |
| ✅ Ventaja 1 | React Server Components reduce bundle size y mejora performance |
| ✅ Ventaja 2 | App Router con layouts, loading states, y error boundaries nativos |
| ✅ Ventaja 3 | API Routes integrados (no necesita backend separado) |
| ✅ Ventaja 4 | Excelente DX con fast refresh y TypeScript support |
| ❌ Trade-off | Curva de aprendizaje del App Router vs Pages Router |

### 3.2 Styling: TailwindCSS + shadcn/ui

| Aspecto | Detalle |
|---------|---------|
| **Por qué elegido** | |
| ✅ Ventaja 1 | Utility-first permite rapid prototyping |
| ✅ Ventaja 2 | shadcn/ui provee componentes accesibles y customizables |
| ✅ Ventaja 3 | Consistencia visual garantizada |
| ✅ Ventaja 4 | Bundle optimizado (PurgeCSS) |
| ❌ Trade-off | HTML puede verse "verbose" con muchas clases |

### 3.3 Backend: Supabase

| Aspecto | Detalle |
|---------|---------|
| **Por qué elegido** | |
| ✅ Ventaja 1 | PostgreSQL con RLS para seguridad a nivel de fila |
| ✅ Ventaja 2 | Auth integrado (email, OAuth, magic links) |
| ✅ Ventaja 3 | Storage para archivos (logos, PDFs) |
| ✅ Ventaja 4 | Edge Functions para background jobs |
| ✅ Ventaja 5 | Free tier generoso para MVP |
| ❌ Trade-off | Vendor lock-in (mitigable con standard PostgreSQL) |

### 3.4 Forms: React Hook Form + Zod

| Aspecto | Detalle |
|---------|---------|
| **Por qué elegido** | |
| ✅ Ventaja 1 | Performance (uncontrolled components) |
| ✅ Ventaja 2 | Zod genera tipos TypeScript automáticamente |
| ✅ Ventaja 3 | Validación compartida client/server |
| ❌ Trade-off | Más setup inicial que forms simples |

### 3.5 PDF: @react-pdf/renderer

| Aspecto | Detalle |
|---------|---------|
| **Por qué elegido** | |
| ✅ Ventaja 1 | Render server-side (no carga cliente) |
| ✅ Ventaja 2 | Sintaxis React familiar |
| ✅ Ventaja 3 | Control total del layout |
| ❌ Trade-off | Limitaciones de CSS (no es HTML/CSS real) |

### 3.6 Email: Resend + React Email

| Aspecto | Detalle |
|---------|---------|
| **Por qué elegido** | |
| ✅ Ventaja 1 | React Email permite templates type-safe |
| ✅ Ventaja 2 | Preview en desarrollo |
| ✅ Ventaja 3 | API moderna y bien documentada |
| ✅ Ventaja 4 | Free tier: 3,000 emails/mes |
| ❌ Trade-off | Menos features que SendGrid/Mailgun |

---

## 4. Data Flow

### 4.1 User Registration Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Next.js Frontend
    participant API as Next.js API Route
    participant Auth as Supabase Auth
    participant DB as PostgreSQL
    participant Email as Resend

    User->>Frontend: Completa formulario de registro
    Frontend->>Frontend: Validación client-side (Zod)
    Frontend->>API: POST /api/auth/register
    API->>API: Validación server-side (Zod)
    API->>Auth: supabase.auth.signUp()
    Auth->>DB: INSERT into auth.users
    Auth->>Email: Envía verification email
    Auth-->>API: { user, session: null }
    API-->>Frontend: { success: true, message: "Check email" }
    Frontend-->>User: Muestra "Revisa tu email"

    Note over User,Email: Usuario recibe email

    User->>Frontend: Click en link de verificación
    Frontend->>Auth: Token en URL
    Auth->>DB: UPDATE auth.users (email_verified)
    Auth-->>Frontend: Redirect con session
    Frontend->>API: POST /api/auth/callback
    API->>DB: INSERT into profiles
    API-->>Frontend: Redirect a /onboarding
```

### 4.2 Create and Send Invoice Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Next.js Frontend
    participant API as Next.js API Route
    participant DB as PostgreSQL
    participant PDF as PDF Generator
    participant Storage as Supabase Storage
    participant Email as Resend

    User->>Frontend: Crea factura (selecciona cliente, items)
    Frontend->>Frontend: Calcula totales en tiempo real
    User->>Frontend: Click "Guardar y Enviar"
    Frontend->>API: POST /api/invoices
    API->>DB: INSERT into invoices
    API->>DB: INSERT into invoice_items
    DB-->>API: Invoice created

    API->>PDF: Genera PDF
    PDF-->>API: PDF Buffer

    API->>Storage: Upload PDF (opcional cache)
    Storage-->>API: PDF URL

    API->>DB: SELECT payment_methods, business_profile
    DB-->>API: User data

    API->>Email: Send email con PDF adjunto
    Email-->>API: { id: "email_id" }

    API->>DB: UPDATE invoice status = 'sent'
    API->>DB: INSERT into invoice_events (type: 'sent')

    API-->>Frontend: { success: true, invoice }
    Frontend-->>User: Muestra confirmación
```

### 4.3 Mark Invoice as Paid Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Next.js Frontend
    participant API as Next.js API Route
    participant DB as PostgreSQL

    User->>Frontend: Click "Marcar como pagada"
    Frontend->>Frontend: Muestra modal de pago
    User->>Frontend: Ingresa método, monto, fecha, notas
    Frontend->>API: POST /api/invoices/:id/payments

    API->>DB: Verify invoice belongs to user (RLS)
    API->>DB: Verify invoice status != 'paid'
    API->>DB: INSERT into payments
    API->>DB: UPDATE invoices SET status='paid', paid_at=now()
    API->>DB: INSERT into invoice_events (type: 'paid')

    DB-->>API: Updated invoice
    API-->>Frontend: { success: true, invoice, payment }
    Frontend-->>User: Actualiza UI, muestra confirmación
```

### 4.4 Automatic Reminder Flow (Background Job)

```mermaid
sequenceDiagram
    participant Cron as Cron Trigger (daily)
    participant Edge as Edge Function
    participant DB as PostgreSQL
    participant Email as Resend

    Cron->>Edge: Trigger daily at 9:00 AM UTC

    Edge->>DB: SELECT overdue invoices<br/>WHERE user.plan = 'pro'<br/>AND reminder_settings.enabled = true<br/>AND reminder_count < max_reminders<br/>AND last_reminder > frequency_days ago

    DB-->>Edge: List of invoices to remind

    loop For each invoice
        Edge->>DB: SELECT client, business_profile, payment_methods
        DB-->>Edge: Invoice data

        Edge->>Email: Send reminder email
        Email-->>Edge: { success: true }

        Edge->>DB: UPDATE invoice SET reminder_count += 1
        Edge->>DB: INSERT invoice_event (type: 'reminder_sent')
    end

    Edge->>DB: Log job execution
```

### 4.5 Subscription Upgrade Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Next.js Frontend
    participant API as Next.js API Route
    participant Stripe as Stripe API
    participant DB as PostgreSQL

    User->>Frontend: Click "Upgrade a Pro"
    Frontend->>API: POST /api/subscription/checkout

    API->>Stripe: Create Checkout Session
    Stripe-->>API: { session_id, url }

    API-->>Frontend: { checkoutUrl }
    Frontend->>Stripe: Redirect a Stripe Checkout

    User->>Stripe: Completa pago
    Stripe->>API: Webhook: checkout.session.completed

    API->>DB: UPDATE subscription SET plan='pro', status='active'
    API->>DB: INSERT subscription_events

    Stripe-->>Frontend: Redirect a /settings?upgrade=success
    Frontend-->>User: Muestra mensaje de éxito
```

---

## 5. Security Architecture

### 5.1 Authentication Flow

```mermaid
flowchart TD
    A[Usuario] --> B{¿Tiene sesión?}
    B -->|No| C[Redirect a /login]
    B -->|Sí| D{¿Token válido?}
    D -->|No| E[Refresh token]
    E -->|Éxito| F[Continuar]
    E -->|Falla| C
    D -->|Sí| F
    F --> G[Acceso a ruta protegida]

    subgraph Supabase Auth
        H[JWT Access Token]
        I[Refresh Token]
        J[Session Cookie]
    end
```

### 5.2 Row Level Security (RLS) Implementation

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;

-- Política ejemplo: clients
CREATE POLICY "Users can CRUD their own clients"
ON clients
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política ejemplo: invoices
CREATE POLICY "Users can CRUD their own invoices"
ON invoices
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política ejemplo: invoice_items (via invoice)
CREATE POLICY "Users can CRUD items of their invoices"
ON invoice_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM invoices
    WHERE invoices.id = invoice_items.invoice_id
    AND invoices.user_id = auth.uid()
  )
);
```

### 5.3 Data Protection

```mermaid
flowchart LR
    subgraph Client
        A[Browser]
    end

    subgraph Vercel
        B[Next.js]
    end

    subgraph Supabase
        C[(PostgreSQL)]
        D[Storage]
    end

    A <-->|HTTPS/TLS 1.3| B
    B <-->|HTTPS| C
    B <-->|HTTPS| D

    C -->|AES-256 at rest| C
    D -->|AES-256 at rest| D
```

---

## 6. Deployment Architecture

```mermaid
flowchart TB
    subgraph GitHub
        A[Repository]
    end

    subgraph Vercel
        B[Preview Deployments]
        C[Production]
    end

    subgraph Supabase
        D[Development Project]
        E[Production Project]
    end

    A -->|PR| B
    A -->|Merge to main| C
    B --> D
    C --> E
```

### 6.1 Environments

| Environment | Vercel URL | Supabase Project | Purpose |
|-------------|------------|------------------|---------|
| Development | localhost:3000 | soloq-dev | Local development |
| Preview | *.vercel.app | soloq-dev | PR previews |
| Staging | staging.soloq.app | soloq-staging | Pre-production testing |
| Production | soloq.app | soloq-prod | Live users |

### 6.2 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

*Documento parte del SRS de SoloQ - Fase 2 Architecture*
