# SoloQ - Frontend Setup

Guia rapida para levantar el proyecto en local.

## Requisitos

- Node.js 18+ (o Bun instalado)
- Credenciales de Supabase (Project URL, anon key, service role key)

## Instalacion

```bash
bun install
```

## Variables de entorno

1. Copia el template:

```bash
cp .env.example .env
```

2. Completa estas variables en `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Nota: `src/lib/config.ts` valida estas variables al iniciar.

## Desarrollo

```bash
bun run dev
```

Visita `http://localhost:3000`.

## Build y typecheck

```bash
bun run typecheck
bun run build
```

## Regenerar tipos de Supabase

```bash
bunx supabase gen types typescript --project-id <PROJECT_ID> > src/types/supabase.ts
```

## Notas de UI

- Design system: `src/components/ui`
- Layouts: `src/components/layout`
- Tema y paleta: `src/app/globals.css`
- Configuracion shadcn/ui: `components.json`
