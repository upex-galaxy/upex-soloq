# Frontend Architecture - SoloQ

## Resumen

SoloQ es una webapp de facturacion para freelancers LATAM construida con Next.js App Router y un design system basado en shadcn/ui.

**Stack actual:**

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- shadcn/ui (New York)
- Supabase Auth + DB (via @supabase/ssr)

> Nota: El SRS menciona Next.js 15 y Tailwind v3. El repo ya esta en Next.js 16 + Tailwind v4 y el design system esta construido sobre esa base.

---

## Estructura de carpetas

```
src/
  app/
    (auth)/        Rutas publicas de autenticacion
    (app)/         Rutas privadas con sidebar
    auth/           Callbacks de Supabase
  components/
    ui/             Design system (shadcn/ui)
    layout/         Layouts (header, sidebar, nav)
  contexts/         Providers (Auth)
  lib/              Helpers (config, supabase, types)
  types/            Tipos generados por Supabase
```

---

## Layouts y rutas

- `src/app/(auth)/layout.tsx`: layout simple con fondo y card centrada.
- `src/app/(app)/layout.tsx`: layout privado con sidebar + header con breadcrumbs.
- `src/app/layout.tsx`: root layout con AuthProvider y TooltipProvider.

Rutas clave:

- Publicas: `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/privacy`, `/terms`, `/contact`
- Privadas: `/dashboard`, `/invoices`, `/clients`, `/settings`

---

## Integracion con Supabase

Clientes:

- `src/lib/supabase/client.ts`: browser client
- `src/lib/supabase/server.ts`: server client (async cookies)
- `src/lib/supabase/admin.ts`: admin client (service role)

Auth:

- `src/contexts/auth-context.tsx`: login, signup, logout, perfiles y subscription
- `middleware.ts`: proteccion de rutas y refresh de sesion
- `src/app/auth/callback/route.ts`: intercambio de code por sesion

---

## Tipos compartidos

Los tipos de base de datos se generan desde Supabase y se exponen con helpers:

- `src/types/supabase.ts`: tipos generados
- `src/lib/types.ts`: helpers (`Tables`, `TablesInsert`, `Enums`) y tipos de dominio

Esto permite mock data type-safe y queries consistentes.

---

## Design System

- `src/components/ui/*`: componentes base (Button, Card, Input, etc.)
- `src/app/globals.css`: paleta, radios, variables y animaciones
- `components.json`: configuracion de shadcn/ui

Paleta actual: Azul profesional (oklch) con estilo Moderno/Bold y bordes redondeados.

---

## Convenciones de UI

- Usar componentes del design system (no botones custom).
- Aplicar `data-testid` en elementos interactivos segun `.context/guidelines/DEV/data-testid-standards.md`.
- Contenido en espanol LATAM, con vocabulario de facturacion (facturas, cobros, clientes).

---

## Pendientes de documentacion

- `.context/PRD/success-metrics.md` no existe en el repo.
- `.context/SRS/design-specs.md` no existe en el repo.

Si se generan en Fase 2, actualizar este documento con referencias.
