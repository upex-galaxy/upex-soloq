# API Documentation - SoloQ

## Resumen

SoloQ utiliza Supabase como backend, lo que proporciona:

- **REST API** auto-generada basada en el schema PostgreSQL
- **Realtime subscriptions** para datos en vivo
- **Auth API** para autenticación
- **Storage API** para archivos (no implementado aún)

**Base URL:** `https://tvppujtcvvfrbhyjgeyn.supabase.co`

---

## Autenticación

### Headers Requeridos

```http
apikey: <SUPABASE_ANON_KEY>
Authorization: Bearer <USER_JWT_TOKEN>
Content-Type: application/json
```

### Endpoints de Auth

| Método | Endpoint                             | Descripción              |
| ------ | ------------------------------------ | ------------------------ |
| POST   | `/auth/v1/signup`                    | Registro de usuario      |
| POST   | `/auth/v1/token?grant_type=password` | Login con email/password |
| POST   | `/auth/v1/logout`                    | Cerrar sesión            |
| GET    | `/auth/v1/user`                      | Obtener usuario actual   |
| POST   | `/auth/v1/recover`                   | Recuperar contraseña     |

---

## Uso Recomendado: Supabase Client

**En lugar de hacer fetch directo a la REST API, usa los clientes de Supabase:**

### Browser (Client Components)

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Queries
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .order('created_at', { ascending: false });

// Insert
const { data, error } = await supabase
  .from('clients')
  .insert({ name: 'Nuevo Cliente', email: 'email@test.com' })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('clients')
  .update({ name: 'Nombre Actualizado' })
  .eq('id', clientId)
  .select()
  .single();

// Delete (soft delete)
const { error } = await supabase
  .from('clients')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', clientId);
```

### Server (Server Components / Route Handlers)

```typescript
import { createServer } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createServer()

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(*),
      items:invoice_items(*)
    `)
    .eq('status', 'sent')
    .order('due_date', { ascending: true })

  return <InvoiceList invoices={invoices} />
}
```

---

## Endpoints REST (Referencia)

### Profiles

```http
GET    /rest/v1/profiles?user_id=eq.<uuid>
PATCH  /rest/v1/profiles?user_id=eq.<uuid>
```

### Business Profiles

```http
GET    /rest/v1/business_profiles?user_id=eq.<uuid>
POST   /rest/v1/business_profiles
PATCH  /rest/v1/business_profiles?user_id=eq.<uuid>
```

### Clients

```http
GET    /rest/v1/clients?user_id=eq.<uuid>&deleted_at=is.null
POST   /rest/v1/clients
PATCH  /rest/v1/clients?id=eq.<uuid>
DELETE /rest/v1/clients?id=eq.<uuid>
```

### Invoices

```http
GET    /rest/v1/invoices?user_id=eq.<uuid>&select=*,client:clients(*),items:invoice_items(*)
POST   /rest/v1/invoices
PATCH  /rest/v1/invoices?id=eq.<uuid>
```

### Invoice Items

```http
GET    /rest/v1/invoice_items?invoice_id=eq.<uuid>
POST   /rest/v1/invoice_items
PATCH  /rest/v1/invoice_items?id=eq.<uuid>
DELETE /rest/v1/invoice_items?id=eq.<uuid>
```

### Payments

```http
GET    /rest/v1/payments?invoice_id=eq.<uuid>
POST   /rest/v1/payments
```

### Payment Methods

```http
GET    /rest/v1/payment_methods?user_id=eq.<uuid>
POST   /rest/v1/payment_methods
PATCH  /rest/v1/payment_methods?id=eq.<uuid>
DELETE /rest/v1/payment_methods?id=eq.<uuid>
```

---

## Queries Comunes

### Dashboard - Resumen de Facturas

```typescript
const supabase = await createServer();

// Facturas por estado
const { data: summary } = await supabase
  .from('invoices')
  .select('status, total')
  .is('deleted_at', null);

const stats = {
  draft: summary?.filter(i => i.status === 'draft').length ?? 0,
  sent: summary?.filter(i => i.status === 'sent').length ?? 0,
  paid: summary?.filter(i => i.status === 'paid').length ?? 0,
  overdue: summary?.filter(i => i.status === 'overdue').length ?? 0,
  totalRevenue:
    summary?.filter(i => i.status === 'paid').reduce((acc, i) => acc + (i.total ?? 0), 0) ?? 0,
};
```

### Facturas Vencidas

```typescript
const { data: overdueInvoices } = await supabase
  .from('invoices')
  .select('*, client:clients(name, email)')
  .eq('status', 'overdue')
  .lt('due_date', new Date().toISOString())
  .is('deleted_at', null)
  .order('due_date', { ascending: true });
```

### Factura con Detalles Completos

```typescript
const { data: invoice } = await supabase
  .from('invoices')
  .select(
    `
    *,
    client:clients(*),
    items:invoice_items(*),
    payments:payments(*),
    events:invoice_events(*)
  `
  )
  .eq('id', invoiceId)
  .single();
```

### Crear Factura con Items

```typescript
// 1. Crear factura
const { data: invoice, error: invoiceError } = await supabase
  .from('invoices')
  .insert({
    user_id: userId,
    client_id: clientId,
    invoice_number: 'INV-2026-001',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: dueDate,
    status: 'draft',
    currency: 'MXN',
  })
  .select()
  .single();

if (invoiceError) throw invoiceError;

// 2. Crear items
const { error: itemsError } = await supabase.from('invoice_items').insert(
  items.map((item, index) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    subtotal: item.quantity * item.unitPrice,
    sort_order: index,
  }))
);

// 3. Actualizar totales
const subtotal = items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
const taxAmount = subtotal * (taxRate / 100);
const total = subtotal + taxAmount;

await supabase
  .from('invoices')
  .update({ subtotal, tax_amount: taxAmount, total })
  .eq('id', invoice.id);

// 4. Registrar evento
await supabase.from('invoice_events').insert({
  invoice_id: invoice.id,
  event_type: 'created',
  metadata: { source: 'web' },
});
```

---

## Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Las políticas aseguran:

1. **Usuarios solo ven sus propios datos** - Queries filtran automáticamente por `user_id`
2. **No se puede acceder a datos de otros usuarios** - Incluso con el ID correcto
3. **Service Role bypasea RLS** - Solo usar en server-side para operaciones admin

### Verificar RLS en Desarrollo

```typescript
// Esto debería retornar SOLO los clientes del usuario autenticado
const { data } = await supabase.from('clients').select('*');

// Si intentas acceder a datos de otro usuario, retorna vacío (no error)
const { data: otherUser } = await supabase.from('clients').select('*').eq('user_id', 'otro-uuid'); // Retorna [] aunque existan
```

---

## Manejo de Errores

```typescript
const { data, error } = await supabase.from('clients').select('*');

if (error) {
  // Tipos comunes de error:
  // - PGRST116: No rows found (single() sin resultados)
  // - 42501: RLS violation
  // - 23505: Unique constraint violation
  // - 23503: Foreign key violation

  console.error('Supabase error:', {
    message: error.message,
    code: error.code,
    details: error.details,
  });

  throw new Error(`Database error: ${error.message}`);
}
```

---

## Testing con Postman/Insomnia

### Configuración

1. **Base URL:** `https://tvppujtcvvfrbhyjgeyn.supabase.co/rest/v1`

2. **Headers globales:**

   ```
   apikey: <ANON_KEY>
   Authorization: Bearer <JWT_TOKEN>
   Content-Type: application/json
   Prefer: return=representation
   ```

3. **Obtener JWT Token:**

   ```http
    POST https://tvppujtcvvfrbhyjgeyn.supabase.co/auth/v1/token?grant_type=password
   Content-Type: application/json
   apikey: <ANON_KEY>

   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

   Respuesta incluye `access_token` para usar como Bearer token.

### Ejemplo: Listar Clientes

```http
GET https://tvppujtcvvfrbhyjgeyn.supabase.co/rest/v1/clients?deleted_at=is.null&order=created_at.desc
apikey: <ANON_KEY>
Authorization: Bearer <JWT_TOKEN>
```

---

## Realtime (Opcional)

Para escuchar cambios en tiempo real:

```typescript
'use client';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

function useRealtimeInvoices(userId: string) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          console.log('Invoice changed:', payload);
          // Refetch o actualizar estado local
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
```

---

## Recursos

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgREST Operators](https://postgrest.org/en/stable/api.html#operators)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
