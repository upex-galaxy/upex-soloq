# Fase 3: Infrastructure - Setup Técnico Base

## 🎯 ¿Qué es esta fase?

La **Fase 3: Infrastructure** implementa la base técnica del proyecto ANTES de comenzar el desarrollo iterativo de features.

**Esta fase se ejecuta UNA SOLA VEZ** por proyecto, después de tener las especificaciones técnicas (Fase 2: Architecture).

**Esta fase se enfoca en:**

- ✅ Configurar servicios cloud (Supabase, Vercel, Railway, etc.)
- ✅ Crear database schemas y API backend base
- ✅ Generar tipos TypeScript desde el backend
- ✅ Configurar proyecto frontend con Design System
- ✅ Integrar tipos del backend en el frontend

**Esta fase NO incluye:**

- ❌ Implementar features específicas de negocio (eso es Fase 7: Implementation)
- ❌ Definir user stories o épicas (eso es Fase 4: Specification)
- ❌ Crear tests automatizados E2E (eso es Fase 11: Test Automation)

---

## 📋 Prompts de esta Fase

| #   | Archivo                | Descripción                                                 | Duración   | MCP Requerido         |
| --- | ---------------------- | ----------------------------------------------------------- | ---------- | --------------------- |
| 1   | `backend-setup.md`     | Crear DB schemas, Auth, API layer, seed data                | 45-90 min  | ✅ Supabase, Context7 |
| 2   | `frontend-setup.md`    | Design System, Layout, páginas demo, integrar tipos backend | 60-120 min | ✅ Context7           |
| 3   | `project-doc-setup.md` | README profesional + System Prompt para AI coding agents    | 15-30 min  | ❌ Ninguno            |

**Total estimado:** 2-4 horas (depende de complejidad del proyecto)

---

## ⚙️ Orden de Ejecución

### **⚠️ ORDEN CRÍTICO - NO ALTERAR**

```
1. backend-setup.md        (PRIMERO - Schemas + API + Tipos)
                           ↓
2. frontend-setup.md       (SEGUNDO - UI + Integración de tipos)
                           ↓
3. project-doc-setup.md    (TERCERO - README + System Prompt para AI)
```

### **Por qué este orden:**

**🔹 Backend antes que Frontend:**

- Backend define schemas de DB → Genera tipos TypeScript automáticamente
- Frontend importa esos tipos → Zero type mismatches
- Ejemplo: `profiles` table → `Profile` type → `UserCard` component

**Flujo natural de datos:**

```
DB Schema → TypeScript Types → Frontend Components
   (Backend)                      (Frontend)
```

**❌ Si haces Frontend primero:**

- Tipos manuales → Propensos a errores
- Cambios en backend → Rompen frontend
- Type mismatches en producción

**✅ Si haces Backend primero:**

- Tipos auto-generados → Siempre sincronizados
- Cambios en backend → TypeScript te avisa
- Zero bugs por type mismatches

---

## 📦 MCP Tools Requeridos

Esta fase requiere los siguientes MCP tools configurados:

| MCP Tool         | Fase que lo usa                     | ¿Obligatorio? | Propósito                                           |
| ---------------- | ----------------------------------- | ------------- | --------------------------------------------------- |
| **Supabase MCP** | backend-setup.md                    | ✅ CRÍTICO    | Crear tablas, RLS policies, gestionar DB            |
| **Context7 MCP** | backend-setup.md, frontend-setup.md | ✅ CRÍTICO    | Consultar docs oficiales antes de instalar paquetes |

**Verificar MCP disponibles:**

```bash
# El AI verificará automáticamente durante ejecución
# Si falta Supabase MCP, backend-setup se detendrá
```

**Configurar MCP Supabase:**

- Documentación: [Supabase MCP Setup](https://github.com/supabase-community/supabase-mcp)

**Configurar MCP Context7:**

- Documentación: [Context7 Integration](https://context7.ai/docs)

---

## 📥 Pre-requisitos

### Antes de ejecutar esta fase, debes tener:

**✅ Fase 2 (Architecture) completada:**

- `.context/SRS/architecture-specs.md` - Tech stack decidido, ERD de DB
- `.context/SRS/design-specs.md` - Paleta de colores, wireframes
- `.context/SRS/functional-specs.md` - Features principales
- `.context/PRD/` - PRD completo

**✅ Herramientas locales instaladas:**

- Node.js (v18+)
- Package manager (npm/pnpm/yarn/bun)
- Git
- Supabase CLI (se instalará durante backend-setup si falta)

**✅ Cuentas en servicios cloud:**

- Cuenta Supabase (o el DB provider elegido en SRS)
- Cuenta Vercel/Railway/Netlify (o el hosting provider elegido en SRS)

**✅ Decisiones tomadas:**

- Database provider (Supabase, Firebase, PostgreSQL, etc.)
- Hosting provider (Vercel, Railway, Netlify, etc.)
- Auth strategy (Supabase Auth, Auth0, etc.)

---

## 📤 Output Esperado

Al finalizar esta fase tendrás:

### **1. Infraestructura Cloud Configurada:**

- ✅ Proyecto Supabase creado y configurado
- ✅ Proyecto Vercel desplegado (o equivalente)
- ✅ URLs de servicios documentadas
- ✅ Credenciales configuradas en `.env`
- ✅ `.context/infrastructure-setup.md` documentado

### **2. Backend Funcional:**

- ✅ Database schemas creados (tablas fundacionales)
- ✅ Row Level Security (RLS) configurado
- ✅ Auth integration (Supabase Auth o similar)
- ✅ Seed data realista insertado
- ✅ API clients configurados (`lib/supabase/client.ts`, `server.ts`)
- ✅ **Tipos TypeScript generados:** `src/types/supabase.ts`
- ✅ `.context/backend-setup.md` documentado

### **3. Frontend con Design System:**

- ✅ Proyecto frontend configurado (Next.js, React, etc.)
- ✅ Design System completo:
  - Paleta de colores aplicada
  - Componentes UI reutilizables (Button, Card, Input, etc.)
  - Layout components (Navbar, Sidebar, Footer)
- ✅ **Tipos del backend integrados:** `lib/types.ts` importa desde `supabase.ts`
- ✅ 2-3 páginas demo funcionales
- ✅ `.context/design-system.md` documentado

### **4. Integración Backend ↔ Frontend:**

- ✅ Frontend importa tipos del backend
- ✅ Zero type errors en build
- ✅ AuthContext conectado a Supabase Auth
- ✅ Middleware protegiendo rutas
- ✅ 1-2 páginas consumiendo datos reales de DB

---

## 🔄 Escenarios de Uso

### **Escenario 1: Proyecto Greenfield (nuevo proyecto desde cero)**

**Situación:** Estás empezando un proyecto completamente nuevo.

**Pre-requisito:** Configura manualmente tu proyecto en Supabase/Vercel antes de comenzar.

**Flujo:**

1. Ejecuta `backend-setup.md` → Crea DB schemas, auth, seed data, genera tipos
2. Ejecuta `frontend-setup.md` → Crea proyecto frontend, integra tipos del backend
3. Ejecuta `project-doc-setup.md` → Genera README profesional y System Prompt

**Duración:** 2-4 horas

**Output:** Stack completo funcional + documentación lista, listo para implementar features en Fase 7.

---

### **Escenario 2: Proyecto Brownfield (frontend ya existe, falta backend)**

**Situación:** Ya tienes un frontend con mock data, necesitas conectar backend real.

**Flujo:**

1. Ejecuta `backend-setup.md` → Crea DB, genera tipos, conecta frontend
2. **Salta `frontend-setup.md`** o úsalo solo como referencia para:
   - Importar tipos generados (`src/types/supabase.ts`)
   - Crear `lib/types.ts` helper
   - Reemplazar mock data con queries reales
3. Ejecuta `project-doc-setup.md` → Documenta el proyecto

**Duración:** 1-2 horas (sin frontend-setup)

**Nota:** El prompt `backend-setup.md` ya incluye integración con frontend existente.

---

### **Escenario 3: Stack diferente a Supabase + Vercel**

**Situación:** Decidiste usar PostgreSQL + Railway, o Firebase + Netlify.

**Flujo:**

1. Ejecuta `backend-setup.md` → **Adapta para tu stack**
   - Si no usas Supabase, adapta queries al ORM que uses (Prisma, Drizzle, etc.)
   - Genera tipos según tu stack
2. Ejecuta `frontend-setup.md` → **Integra tipos de tu backend**
3. Ejecuta `project-doc-setup.md` → **Documenta tu stack específico**

**Duración:** 3-5 horas (requiere más adaptación manual)

---

## 💡 Conceptos Clave

### **1. Backend-First Philosophy**

**Problema que resuelve:**

- Type mismatches entre frontend y backend
- Cambios en DB rompen frontend sin avisar
- Duplicación de tipos (uno en frontend, otro en backend)

**Solución:**

```
Backend define schema → Genera tipos automáticamente → Frontend importa tipos
```

**Ejemplo:**

```typescript
// Backend: Database schema (Supabase)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

// TypeScript types generados automáticamente
export type Profile = {
  id: string;
  name: string;
  email: string;
}

// Frontend: Componente usa tipos reales
import { Profile } from '@/lib/types';

const UserCard = ({ profile }: { profile: Profile }) => {
  return <div>{profile.name}</div>  // ✅ TypeScript valida que 'name' existe
}
```

---

### **2. Infrastructure as Foundation**

**Esta fase crea la fundación reutilizable:**

```
Fase 3: Infrastructure
   ↓
   DB schemas fundacionales
   Auth configurado
   Design System base
   ↓
Fase 7: Implementation (Sprints iterativos)
   ↓
   Feature 1: usa DB, Auth, Design System
   Feature 2: usa DB, Auth, Design System
   Feature N: usa DB, Auth, Design System
```

**NO duplicas trabajo:**

- Schemas fundacionales (users, profiles) → Creados UNA vez
- Design System (Button, Card) → Creado UNA vez
- Auth flow (login, signup) → Configurado UNA vez

**Después solo implementas features específicas:**

- Story 1: "Como user, quiero ver [lista de recursos]"
- Story 2: "Como user, quiero crear [item de negocio]"

---

### **3. Tablas Fundacionales vs Tablas de Features**

**Tablas fundacionales (Fase 3):**

- users, profiles, roles
- Tablas que TODAS las features necesitan
- Creadas en `backend-setup.md`

**Tablas de features (Fase 7):**

- {entity_name}, {bookings}, {reviews}, {payments}
- Tablas específicas de cada story
- Creadas durante Implementation según el PBI

**Ejemplo:**

```
Fase 3 (backend-setup.md):
  ✅ users
  ✅ profiles
  ✅ roles

Fase 7 (implementando story "Ver [recursos de negocio]"):
  ✅ {entity_name}
  ✅ {entity_name}_attributes
  ✅ {entity_name}_metadata
```

---

## 🔍 Validaciones Post-Ejecución

### **Checklist de Validación:**

**Después de `backend-setup.md`:**

- [ ] Tablas fundacionales visibles en Supabase Dashboard
- [ ] RLS policies configuradas (verificar en Supabase)
- [ ] Seed data insertado (verificar en Supabase)
- [ ] Archivo `src/types/supabase.ts` generado
- [ ] `npm run build` pasa sin errores TypeScript
- [ ] Signup/Login funciona

**Después de `frontend-setup.md`:**

- [ ] Design System visualmente coherente
- [ ] Páginas demo funcionan en `localhost`
- [ ] Archivo `lib/types.ts` importa desde `src/types/supabase.ts`
- [ ] `npm run build` pasa sin errores
- [ ] No hay type errors en editor

**Después de `project-doc-setup.md`:**

- [ ] README.md generado en el root del proyecto
- [ ] System Prompt (CLAUDE.md/GEMINI.md/AGENTS.md) creado
- [ ] Badges y links verificados
- [ ] No hay información sensible expuesta

---

## 🚨 Problemas Comunes y Soluciones

### **Problema 1: MCP Supabase no disponible**

**Error:**

```
❌ MCP de Supabase NO disponible
```

**Solución:**

1. Configura Supabase MCP según [docs](https://github.com/supabase-community/supabase-mcp)
2. Reinicia la sesión del AI
3. Re-ejecuta `backend-setup.md`

---

### **Problema 2: Tipos del backend no se encuentran**

**Error:**

```
Cannot find module '@/types/supabase'
```

**Solución:**

1. Verifica que `backend-setup.md` se ejecutó completamente
2. Busca archivo: `ls src/types/supabase.ts` o `ls lib/database.types.ts`
3. Si no existe, regenera: `npx supabase gen types typescript --project-id XXX > src/types/supabase.ts`

---

### **Problema 3: Build falla con errores de tipos**

**Error:**

```
Type 'User' is not assignable to type 'UserInsert'
```

**Solución:**

1. Revisa que estás usando el tipo correcto:
   - `Row` para leer de DB
   - `Insert` para insertar
   - `Update` para actualizar
2. Ejemplo correcto:
   ```typescript
   import { Database } from '@/types/supabase';
   type User = Database['public']['Tables']['users']['Row'];
   type UserInsert = Database['public']['Tables']['users']['Insert'];
   ```

---

### **Problema 4: Auth redirects no funcionan**

**Error:** Después de login, no redirige a dashboard.

**Solución:**

1. Verifica URLs en Supabase Dashboard → Authentication → URL Configuration
2. Debe incluir: `http://localhost:3000/**`
3. En producción: `https://tu-dominio.com/**`
4. Reinicia dev server después de cambiar `.env`

---

## 🎓 Mejores Prácticas

### **1. Ejecuta en orden estricto**

- ❌ NO saltes de `backend-setup` a `project-doc-setup`
- ✅ Sigue: backend → frontend → project-docs

### **2. Documenta todo**

- Los 3 prompts crean archivos en `.context/`
- Esta documentación es crítica para el equipo

### **3. Valida después de cada prompt**

- No asumas que funcionó
- Verifica en dashboards (Supabase, Vercel)
- Prueba localmente (`npm run dev`)

### **4. Commitea después de cada prompt**

```bash
# Después de backend-setup.md
git add . && git commit -m "feat: backend schemas + auth + types"

# Después de frontend-setup.md
git add . && git commit -m "feat: design system + frontend integration"

# Después de project-doc-setup.md
git add . && git commit -m "docs: project README + AI system prompt"
```

### **5. No implementes features todavía**

- Esta fase es SOLO base técnica
- Features específicas van en Fase 7 (Implementation)

---

## 🔧 Features Adicionales (Opcionales)

Además de los prompts principales, esta fase incluye **prompts modulares** en la subcarpeta `features/` para complementar la infraestructura base:

| Prompt                    | Descripción                            | Cuándo Usar                       |
| ------------------------- | -------------------------------------- | --------------------------------- |
| `supabase-types-setup.md` | Tipado auto-generado desde Supabase DB | Siempre (mejora type-safety)      |
| `env-url-setup.md`        | Sistema de URLs multi-ambiente         | Si tienes staging + production    |
| `openapi-setup.md`        | OpenAPI + Zod + UI Redoc               | Si necesitas documentación de API |
| `api-routes-setup.md`     | Estructura de custom API endpoints     | Si necesitas endpoints custom     |

**Orden de ejecución recomendado:**

```
1. supabase-types-setup.md  → Tipado base
2. env-url-setup.md         → URLs multi-ambiente
3. openapi-setup.md         → Sistema de documentación
4. api-routes-setup.md      → Endpoints custom
```

**Nota:** Estos prompts son **opcionales** y se pueden ejecutar después de los prompts principales o cuando los necesites.

Ver `.prompts/fase-3-infrastructure/features/README.md` para documentación detallada.

---

## 🔄 Próximos Pasos

**Después de completar Fase 3:**

1. **Fase 4: Specification** → Crear product backlog (épicas, stories, tasks)
2. **Fase 5: Shift-Left Testing** → Planear tests antes de implementar
3. **Fase 6: Planning** → Estimar stories y crear implementation plans
4. **Fase 7: Implementation** → Implementar features reutilizando base de Fase 3

**La base técnica de Fase 3 será reutilizada en TODAS las stories:**

- DB schemas fundacionales ya existen
- Auth ya está configurado
- Design System ya está creado
- Solo implementas lógica de negocio específica

---

## 📚 Referencias

- Validated prompts pattern: `.prompts/fase-2-architecture/prd-executive-summary.md`
- Git Flow strategy: `.prompts/git-flow.md`
- Architecture decisions: `.context/SRS/architecture-specs.md`

---

**✅ Fase 3 completada = Fundación técnica lista para desarrollo iterativo**
