# Backend Setup - SoloQ

## Resumen

Este documento describe la configuración del backend de SoloQ, una plataforma de facturación para freelancers en Latinoamérica.

**Fecha de configuración:** 2026-01-20
**Stack:** Next.js 16 + Supabase + TypeScript

---

## Infraestructura

### Supabase Project

| Propiedad  | Valor                                      |
| ---------- | ------------------------------------------ |
| Project ID | `tvppujtcvvfrbhyjgeyn`                     |
| URL        | `https://tvppujtcvvfrbhyjgeyn.supabase.co` |
| Region     | `eu-north-1`                               |
| Database   | PostgreSQL 17.6.1.063                      |

### Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tvppujtcvvfrbhyjgeyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<tu_service_role_key>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Database Schema

### Tablas (10 total)

| Tabla               | Propósito                           | RLS |
| ------------------- | ----------------------------------- | --- |
| `profiles`          | Datos de perfil de usuario          | ✅  |
| `business_profiles` | Información de negocio (freelancer) | ✅  |
| `payment_methods`   | Métodos de pago aceptados           | ✅  |
| `clients`           | Base de datos de clientes           | ✅  |
| `invoices`          | Facturas                            | ✅  |
| `invoice_items`     | Líneas de factura                   | ✅  |
| `payments`          | Pagos recibidos                     | ✅  |
| `invoice_events`    | Audit trail de facturas             | ✅  |
| `subscription`      | Suscripciones (Free/Pro)            | ✅  |
| `reminder_settings` | Configuración de recordatorios      | ✅  |

### ENUMs

```sql
-- payment_method_type
'bank_transfer', 'paypal', 'mercado_pago', 'cash', 'other'

-- invoice_status
'draft', 'sent', 'paid', 'overdue', 'cancelled'

-- discount_type
'percentage', 'fixed'

-- invoice_event_type
'created', 'updated', 'sent', 'reminder_sent', 'viewed', 'paid', 'cancelled'

-- subscription_plan
'free', 'pro'

-- subscription_status
'active', 'canceled', 'past_due', 'incomplete'
```

### Relaciones

```
auth.users (1) ─── (1) profiles
auth.users (1) ─── (1) business_profiles
auth.users (1) ─── (N) payment_methods
auth.users (1) ─── (N) clients
auth.users (1) ─── (N) invoices
auth.users (1) ─── (1) subscription
auth.users (1) ─── (1) reminder_settings

clients (1) ─── (N) invoices
invoices (1) ─── (N) invoice_items
invoices (1) ─── (N) payments
invoices (1) ─── (N) invoice_events
```

### Trigger: Auto-crear perfil en signup

Cuando un usuario se registra, automáticamente se crean:

- `profiles` - Perfil de usuario
- `subscription` - Plan Free por defecto
- `reminder_settings` - Recordatorios deshabilitados

---

## Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas que aseguran que los usuarios solo pueden acceder a sus propios datos.

### Patrón para tablas con `user_id`

```sql
-- SELECT: Solo datos propios
CREATE POLICY "table_select_own" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Solo autenticados, para sí mismos
CREATE POLICY "table_insert_own" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Solo datos propios
CREATE POLICY "table_update_own" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: Solo datos propios
CREATE POLICY "table_delete_own" ON table_name
  FOR DELETE USING (auth.uid() = user_id);
```

### Patrón para tablas relacionadas (invoice_items, payments, invoice_events)

```sql
-- Verificar ownership via invoice.user_id
CREATE POLICY "table_select_own" ON table_name
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = table_name.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );
```

---

## API Layer

### Archivos de Configuración

| Archivo                      | Propósito                               |
| ---------------------------- | --------------------------------------- |
| `src/lib/config.ts`          | Variables de entorno centralizadas      |
| `src/lib/supabase/client.ts` | Cliente para browser/client components  |
| `src/lib/supabase/server.ts` | Cliente para server components          |
| `src/lib/supabase/admin.ts`  | Cliente admin (bypass RLS)              |
| `middleware.ts`              | Protección de rutas + refresh de sesión |
| `src/types/supabase.ts`      | Tipos auto-generados                    |

### Uso de Clientes

**Browser Client (Client Components):**

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data } = await supabase.from('clients').select('*');
```

**Server Client (Server Components/Route Handlers):**

```typescript
import { createServer } from '@/lib/supabase/server';

const supabase = await createServer();
const { data } = await supabase.from('invoices').select('*');
```

**Admin Client (Server-side only, bypass RLS):**

```typescript
import { createAdmin } from '@/lib/supabase/admin';

const supabase = createAdmin();
// ⚠️ Usar con cuidado - bypasses RLS
```

---

## Rutas Protegidas

Configuradas en `middleware.ts`:

**Rutas que requieren autenticación:**

- `/dashboard`
- `/invoices`
- `/clients`
- `/settings`
- `/onboarding`

**Rutas de auth (redirige a dashboard si está autenticado):**

- `/login`
- `/signup`
- `/auth`

---

## Comandos Útiles

```bash
# Desarrollo
bun run dev

# Build de producción
bun run build

# Type check
bun run typecheck

# Regenerar tipos de Supabase
 bunx supabase gen types typescript --project-id tvppujtcvvfrbhyjgeyn > src/types/supabase.ts
```

---

## Próximos Pasos

1. **Implementar páginas de Auth** (`/login`, `/signup`)
2. **Crear onboarding flow** (business profile setup)
3. **Implementar CRUD de clientes**
4. **Implementar creación de facturas**
5. **Generar PDFs de facturas**
6. **Configurar envío de emails**

---

## Troubleshooting

### Error: "Missing NEXT_PUBLIC_SUPABASE_URL"

- Verificar que `.env` existe y tiene las variables
- Reiniciar el servidor de desarrollo: `rm -rf .next && bun run dev`

### Error: "cookies() expects to be called within a request scope"

- Asegurarse de usar `await cookies()` (Next.js 15+)
- Solo usar el server client en Server Components o Route Handlers

### Error de RLS: "new row violates row-level security policy"

- Verificar que el usuario está autenticado
- Verificar que `user_id` coincide con `auth.uid()`
- Para operaciones admin, usar `createAdmin()`
