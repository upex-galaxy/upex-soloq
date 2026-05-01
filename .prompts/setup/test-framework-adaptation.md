# Test Framework Adaptation

> **Purpose**: Bridge between project Discovery and writing real feature tests. Connects the KATA architecture (`tests/`, `api/schemas/`, `config/`) of this boilerplate to the target project's stack already reverse-engineered by Discovery.
>
> **What this prompt modifies**: Only this repo (the testing repo). The product repo is read-only from here.
>
> **Result on success**: AuthApi + LoginPage + first `{Entity}Api`/`{Entity}Page` already speak to the real backend, smoke test passing, auth session reused across tests.
>
> **When to invoke**: Immediately after Discovery (`.prompts/discovery/`) and BEFORE writing any feature tests with `.prompts/fase-12-test-automation/`.
>
> **Output**: `.context/PBI/test-framework-adaptation-plan.md` (Phase 1) + Implementation (Phase 2, on approval).

## Scope

| USE this prompt to... | DO NOT use this prompt for... |
|---|---|
| Wire AuthApi + LoginPage against real endpoints | Regenerate `.context/` -> use `.prompts/discovery/` |
| Create the first `{Entity}Api` / `{Entity}Page` end-to-end | Write feature tests -> use `.prompts/fase-12-test-automation/` |
| Register fixtures + run first smoke test | Run regression suites -> use `.prompts/fase-12-test-automation/regression/` |
| Sync OpenAPI and create type facades in `@schemas/*` | Document TCs in TMS -> use `.prompts/fase-11-test-documentation/` |
| Configure `.agents/project.yaml` for AI variable resolution | Re-run Discovery from scratch -> use `.prompts/discovery/` |

## Core philosophy

- **One entity end-to-end first.** No mass scaffolding. Additional entities go to "follow-ups" in the plan.
- **Auth is the most fragile piece** — always against real staging, never mocks.
- **Golden KATA rule**: components import from `@schemas/*`, never from `@openapi`. Only facades touch `@openapi`.
- Every ATC carries `@atc('TICKET-ID')`. All imports use aliases (`@api/`, `@ui/`, `@schemas/`, `@utils/`).

## Hard prerequisites (BLOCKING)

Before starting Phase 1, verify ALL of these exist. If any is missing, STOP and direct the user to the appropriate predecessor prompt.

- [ ] `.context/PRD/` populated -> produced by `.prompts/fase-1-constitution`
- [ ] `.context/SRS/architecture.md` exists -> produced by `.prompts/fase-2-architecture`
- [ ] `.context/SRS/infrastructure.md` + `frontend.md` exist -> produced by `.prompts/fase-3-infrastructure`
- [ ] `.context/business-data-map.md` exists -> produced by `.prompts/fase-4-specification`
- [ ] An OpenAPI contract source is resolvable (one of):
  - `api/openapi-types.ts` already generated, OR
  - URL of the OpenAPI spec endpoint, OR
  - `.context/api-architecture.md` as fallback
- [ ] `.env.example` exists with the expected env-var keys

> **Note**: `.agents/project.yaml`, `.agents/jira-required.yaml`, `.agents/README.md` ship with the boilerplate and MUST exist. `.agents/jira.json` is generated in Phase 2 (Step 2.4). `.agents/project.yaml` is populated in Phase 2 (Step 2.3).

**If any pre-req is missing**: report which one(s), point at the producing prompt, and abort. Do NOT improvise.

---

## Overview

This prompt transforms the generic KATA boilerplate into a project-specific test automation framework. It operates in two phases:

1. **Phase 1: Analysis + Plan** — Generate an adaptation plan
2. **Phase 2: Implementation** — Execute the plan (requires user approval)

**Strict contract**: NEVER skip Phase 1. NEVER start Phase 2 without explicit user approval of the plan generated in Phase 1.

---

## PHASE 1: ANALYSIS + PLAN

### STEP 1.1: Read Project Context

**Read ALL files in these directories (MANDATORY):**

```
.context/
├── SRS/                    # ALL files (architecture, contracts, specs)
├── PRD/                    # ALL files (personas, features, journeys)
├── idea/                   # ALL files (business-model, domain-glossary)
├── api-architecture.md     # If exists
├── business-data-map.md    # If exists
└── project-test-guide.md   # If exists
```

**Purpose**: Understand the target project's:

- Business domain and terminology
- Technical architecture (API, frontend, database)
- Authentication system
- Main entities and flows
- Testing priorities

### STEP 1.2: Read KATA Guidelines

**Read these files (MANDATORY):**

```
.context/guidelines/TAE/
├── kata-ai-index.md                   # Entry point - concepts overview
├── kata-architecture.md               # 4-layer architecture
├── automation-standards.md            # ATC rules, naming conventions
├── playwright-automation-system.md    # DI, fixtures, session reuse
└── openapi-integration.md             # Type Facade Pattern, API type safety
```

**Purpose**: Understand how to properly implement KATA patterns, including type-safe API testing.

### STEP 1.3: Read Template Structure

**Run this command to see the full structure:**

```bash
tree tests/ api/ config/ cli/ -L 3
```

**Read these critical files:**

```
tests/
├── setup/
│   ├── global.setup.ts         # CRITICAL: Session preparation
│   ├── ui-auth.setup.ts        # CRITICAL: UI authentication flow
│   └── api-auth.setup.ts       # CRITICAL: API authentication flow
├── components/
│   ├── TestContext.ts          # Layer 1: Base utilities
│   ├── TestFixture.ts          # Layer 4: DI entry point
│   ├── ApiFixture.ts           # Layer 4: API DI container
│   ├── UiFixture.ts            # Layer 4: UI DI container
│   ├── api/
│   │   ├── ApiBase.ts          # Layer 2: HTTP helpers
│   │   └── AuthApi.ts          # Layer 3: Auth component
│   └── ui/
│       ├── UiBase.ts           # Layer 2: Playwright helpers
│       └── LoginPage.ts        # Layer 3: Login component
├── data/
│   ├── DataFactory.ts          # Test data generation
│   └── types.ts                # Shared types
└── utils/
    └── decorators.ts           # @atc decorator
```

**Also read:**

```
api/
├── schemas/
│   ├── auth.types.ts           # Auth domain type facade (has TODO migration)
│   ├── example.types.ts        # Reference template for new facades
│   └── index.ts                # Barrel re-export
├── openapi.json                # Downloaded spec (if synced)
└── openapi-types.ts            # Generated types (if synced)

config/
└── variables.ts                # Environment configuration (single source of truth)

cli/
└── sync-openapi.ts             # OpenAPI spec download + type generation

playwright.config.ts            # Playwright projects configuration
package.json                    # Dependencies and scripts
.env.example                    # Required environment variables
```

### STEP 1.4: Analyze Authentication Strategy

Based on project context, determine:

**For API Authentication:**

- Authentication method (Bearer token, API key, OAuth, JWT)
- Login endpoint
- Token format and expiration
- Refresh strategy (if any)

**For UI Authentication:**

- Login page URL
- Login form fields
- Success indicator (URL change, element visible)
- Session storage method

**Key Concept — Session Reuse:**

```
┌─────────────────────────────────────────────────────────────────┐
│ global-setup                                                    │
│ └─ Prepares environment, creates directories                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
┌───────────────────┐           ┌───────────────────┐
│ ui-setup          │           │ api-setup         │
│ • Login via UI    │           │ • Login via API   │
│ • Save storageState│          │ • Save token      │
│ → .auth/user.json │           │ → .auth/api-state.json │
└─────────┬─────────┘           └─────────┬─────────┘
          │                               │
          ▼                               ▼
┌───────────────────┐           ┌───────────────────┐
│ E2E tests         │           │ Integration tests │
│ • Use storageState│           │ • Use saved token │
│ • Already logged in│          │ • Auth header set │
└───────────────────┘           └───────────────────┘
```

### STEP 1.5: Identify OpenAPI Source

Determine where the project's OpenAPI/Swagger spec lives:

| Source | When to Use | Example |
|--------|-------------|---------|
| **URL** | Backend exposes OpenAPI at an endpoint | `http://localhost:3000/api/openapi` (Next.js) or `http://localhost:PORT/swagger/v1/swagger.json` (.NET/Spring) |
| **GitHub** | Spec is committed as a file in a repo | `owner/repo` + `docs/openapi.yaml` |
| **Local** | File already exists on disk | `../backend/docs/openapi.json` |
| **None** | No OpenAPI spec available | Use Custom Types in facades directly |

> **Nota:** Si el proyecto usa el prompt `openapi-setup.md` (Next.js + Zod), el endpoint es `/api/openapi` y sirve JSON generado desde Zod schemas en runtime. Para otros backends (.NET, Spring, FastAPI), la URL típica es `/swagger/v1/swagger.json` o `/docs/openapi.json`.

### STEP 1.6: Identify Components to Create

Based on project entities, determine which components are needed:

**API Components (tests/components/api/):**

- AuthApi.ts (always needed — adapt existing)
- {Entity}Api.ts for each main entity

**UI Components (tests/components/ui/):**

- LoginPage.ts (always needed — adapt existing)
- {Entity}Page.ts for each main page/feature

**Type Facades (api/schemas/):**

- auth.types.ts (always needed — update existing)
- {domain}.types.ts for each domain entity (use `example.types.ts` as reference)

**Flows (tests/components/flows/):**

- Setup flows for common preconditions (optional)

### STEP 1.7: Ask User Questions (If Needed)

If any critical information is missing from context, ask:

```markdown
To complete the adaptation plan, I need clarification:

1. **Authentication Endpoint**: What is the API endpoint for login?
   - Example: `/auth/login`, `/connect/token`, `/api/login`

2. **Test User Credentials**: Where are the test credentials stored?
   - Options: .env file, secrets manager, hardcoded in config

3. **First Priority Entity**: Which domain entity should we implement first?
   - Examples: Users, Products, Orders, Bookings

4. **Environment URLs**: What are the staging/dev URLs?
   - UI Base URL: ___
   - API Base URL: ___

5. **OpenAPI Spec**: Where is the OpenAPI/Swagger specification?
   - URL endpoint: ___
   - GitHub repo + path: ___
   - Local file path: ___
   - Not available (will use Custom Types)
```

### STEP 1.8: Generate Adaptation Plan

Create file: `.context/PBI/test-framework-adaptation-plan.md`

**Use this template:**

```markdown
# Test Framework Adaptation Plan

> **Generated**: {DATE}
> **Project**: {PROJECT_NAME}
> **Status**: PENDING APPROVAL

---

## 0. Hard prerequisites check

- [x] `.context/PRD/` populated
- [x] `.context/SRS/architecture.md` exists
- [x] `.context/infrastructure/{backend,frontend}.md` exist
- [x] `.context/business-data-map.md` exists
- [x] OpenAPI source resolvable: {URL / file / fallback}
- [x] `.env.example` exists

(Mark each as done during analysis. If any is missing, the prompt aborts.)

---

## 1. Project Summary

| Aspect | Value |
|--------|-------|
| Target Application | {name} |
| Stack | {frontend} + {backend} + {database} |
| Auth System | {OAuth/JWT/Session/etc} |
| Main Entities | {list of entities} |
| OpenAPI Source | {URL / GitHub / Local / None} |

---

## 2. Authentication Strategy

### 2.1 Global Setup

**Current file**: `tests/setup/global.setup.ts`
**Changes needed**: {minimal/none - creates directories}

### 2.2 API Authentication

**Current file**: `tests/setup/api-auth.setup.ts`
**Auth method**: {Bearer token / API key / OAuth}
**Token endpoint**: {endpoint}
**Changes needed**:
- Update endpoint in AuthApi
- Modify token extraction if different format
- Update credentials source

**Implementation**:
```typescript
// Example: What the modified authenticateSuccessfully should look like
```

### 2.3 UI Authentication

**Current file**: `tests/setup/ui-auth.setup.ts`
**Login URL**: {url}
**Form fields**: {email, password / username, password}
**Changes needed**:
- Update locators in LoginPage
- Modify success assertion
- Update token interception endpoint

**Implementation**:
```typescript
// Example: What the modified loginSuccessfully should look like
```

### 2.4 .agents/ Variable Configuration

Values to populate in `.agents/project.yaml` (table from Step 2.3 with concrete values from Discovery, e.g.):

| Key | Value |
|---|---|
| `project.project_name` | MyProject |
| `project.project_key` | MYP |
| ... | ... |

Validation: `bun run lint:agents` must pass.

---

## 3. OpenAPI & Type Strategy

### 3.1 OpenAPI Sync

**Source**: {URL / GitHub / Local / None}
**Command**: `bun run api:sync --url {endpoint} -t` (or appropriate flags)

### 3.2 Type Facades to Create/Update

| Facade File | Domain | Schema Names | Priority |
|-------------|--------|-------------|----------|
| `api/schemas/auth.types.ts` | Auth | Update existing TODOs | Critical |
| `api/schemas/{domain}.types.ts` | {Domain} | {SchemaName}, {ListModel} | High |

### 3.3 Facade Migration Notes

- `auth.types.ts`: Uncomment `@openapi` imports, replace Custom Types with OpenAPI types
- New facades: Use `api/schemas/example.types.ts` as reference template, replace placeholder names
- Update `api/schemas/index.ts` barrel to include new facades

---

## 4. Components to Create

### 4.1 API Components

| Component | File | Endpoints | Types From | Priority |
|-----------|------|-----------|-----------|----------|
| AuthApi | Modify existing | /auth/login | @schemas/auth.types | Critical |
| {Entity}Api | Create new | /{entities}/* | @schemas/{domain}.types | High |

### 4.2 UI Components

| Component | File | Pages | Priority |
|-----------|------|-------|----------|
| LoginPage | Modify existing | /login | Critical |
| {Entity}Page | Create new | /{entities}/* | High |

---

## 5. Files to Modify

| File | Section | Changes |
|------|---------|---------|
| `config/variables.ts` | urls, auth | Update envDataMap URLs, login endpoint |
| `.env` | credentials | Add test user credentials |
| `api/schemas/auth.types.ts` | types | Uncomment OpenAPI imports or update Custom Types |
| `api/schemas/index.ts` | exports | Add new domain facade re-exports |
| `tests/components/api/AuthApi.ts` | endpoints, ATCs | Match project's auth API |
| `tests/components/ui/LoginPage.ts` | locators, ATCs | Match project's login form |
| `tests/components/ApiFixture.ts` | components | Add new API components |
| `tests/components/UiFixture.ts` | components | Add new UI components |
| `playwright.config.ts` | baseURL | Update to project URL (if needed) |

---

## 6. Environment Variables

```env
# Application URLs
BASE_URL={staging_url}
API_URL={api_url}

# Test User Credentials
TEST_USER_EMAIL={email}
TEST_USER_PASSWORD={password}

# TMS (Optional)
XRAY_CLIENT_ID=
XRAY_CLIENT_SECRET=
```

---

## 7. Implementation Steps

### Phase A: Configuration (Critical)

1. [ ] Update `config/variables.ts` with project URLs
2. [ ] Create `.env` from `.env.example` with credentials
3. [ ] Populate `.agents/project.yaml` from Discovery (Step 2.3)
4. [ ] Configure Jira manifest if applicable (Step 2.4): set Atlassian creds in `.env`, run `bun run jira:sync-fields` and `bun run jira:check`

### Phase B: Auth + OpenAPI (Critical)

5. [ ] Sync OpenAPI spec: `bun run api:sync -t` (if available)
6. [ ] Update `api/schemas/auth.types.ts` (uncomment OpenAPI types or update Custom Types)
7. [ ] Update `tests/components/api/AuthApi.ts` with correct endpoint and types
8. [ ] Update `tests/components/ui/LoginPage.ts` with correct locators
9. [ ] Verify: `bun run test --project=api-setup`
10. [ ] Verify: `bun run test --project=ui-setup`

### Phase C: First Domain Entity (High)

11. [ ] Create `api/schemas/{domain}.types.ts` facade (based on example.types.ts pattern)
12. [ ] Update `api/schemas/index.ts` barrel
13. [ ] Create `{Entity}Api.ts` component (import from @schemas)
14. [ ] Create `{Entity}Page.ts` component
15. [ ] Add components to ApiFixture.ts and UiFixture.ts
16. [ ] Write first domain test

### Phase D: 8 Exit Gates (strict order)

17. [ ] Gate 1 — `bun run type-check`
18. [ ] Gate 2 — `bun run lint`
19. [ ] Gate 3 — `bun run lint:agents` (0 errors, 0 warnings)
20. [ ] Gate 4 — `bun run jira:check` (if Jira project)
21. [ ] Gate 5 — `bun run test --project=api-setup`
22. [ ] Gate 6 — `bun run test --project=ui-setup`
23. [ ] Gate 7 — `bun run test:smoke` (first run)
24. [ ] Gate 8 — `bun run test:smoke` (second run, session reuse — NO re-login)

### Phase E: Cleanup placeholders

25. [ ] Remove `tests/components/api/ExampleApi.ts`, `tests/components/ui/ExamplePage.ts`, `tests/components/steps/ExampleSteps.ts`, `api/schemas/example.types.ts`
26. [ ] Drop `example.types` re-export from `api/schemas/index.ts`
27. [ ] Drop any `Example*` references from `tests/components/ApiFixture.ts` and `tests/components/UiFixture.ts`
28. [ ] Re-run gates 1-3 to confirm nothing broke

---

## 8. AI Implementation Guidelines

### KATA Rules to Follow

- **ATCs are complete flows**: Each ATC = one test case with expected output
- **Locators inline**: Extract to constructor only if used in 2+ ATCs
- **ATCs don't call ATCs**: Use Flows module for chains
- **Use @atc decorator**: All ATCs must be decorated
- **Import aliases mandatory**: Use @utils/, @api/, @ui/, @schemas/, @variables
- **Type Facade Pattern**: Components import from @schemas/{domain}.types, NEVER from @openapi

---

## 9. Questions Answered

{Include any questions asked and user responses}

---

## 10. Approval Checklist

Before proceeding to implementation, confirm:

- [ ] Authentication strategy is correct
- [ ] Environment URLs are accurate
- [ ] OpenAPI source is identified (or confirmed unavailable)
- [ ] Type facades to create are listed
- [ ] Components to create are appropriate
- [ ] Test user credentials are available
- [ ] Ready to proceed with implementation

---

## 11. Discovery Gaps

Any gaps in Discovery that surfaced during adaptation (and could not be resolved here):

- [ ] Gap: {description}, blocks {what}
- [ ] ...

(Surface to the user; do NOT improvise. May require running specific Discovery phases again.)

---

**Next Step**: Review this plan and confirm approval to proceed with Phase 2 implementation.
```

---

## PHASE 2: IMPLEMENTATION

> **Trigger**: User approves the plan generated in Phase 1

### STEP 2.1: Read Approved Plan

Read `.context/PBI/test-framework-adaptation-plan.md` to understand:

- Exact changes needed for each file
- Order of implementation
- Authentication specifics
- OpenAPI source and type strategy

### STEP 2.2: Update Configuration

**File**: `config/variables.ts`

Update:

- `envDataMap` with project URLs (baseUrl, apiUrl per environment)
- `auth` section with correct endpoints (loginEndpoint, tokenEndpoint, meEndpoint)
- Verify `testUser` reads credentials correctly per environment

**File**: `.env`

```bash
# Copy example to .env
cp .env.example .env

# Edit with project values
```

```env
# Application URLs
BASE_URL=https://staging.yourproject.com
API_URL=https://api.staging.yourproject.com

# Test User Credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword

# Environment
TEST_ENV=staging
```

### STEP 2.3: Configure `.agents/project.yaml`

**Goal**: populate `.agents/project.yaml` so AI agents can resolve `{{...}}` references in every other prompt of the repo (orchestrators, stage prompts, guidelines).

This is the AI-context companion to `config/variables.ts`:

| File | Consumed by | When |
|---|---|---|
| `config/variables.ts` | Playwright runtime (TS code) | Test execution |
| `.agents/project.yaml` | AI agents (prompts) | Prompt load time |

Both must be configured. Most values overlap and come from Discovery.

**1. Open `.agents/project.yaml`**. It ships with all values as `null` + `# TODO:` comments.

**2. Fill each key from the Discovery context**:

| YAML key | Source |
|---|---|
| `project.project_name` | `.context/PRD/` (project name) |
| `project.project_key` | Issue tracker key (e.g. Jira project key) |
| `project.webapp_domain` | `.context/SRS/architecture.md` |
| `backend.backend_repo` | `.context/SRS/infrastructure.md` (relative path) |
| `backend.backend_stack` | `.context/SRS/architecture.md` |
| `backend.backend_entry` | `.context/SRS/infrastructure.md` |
| `frontend.frontend_repo` | `.context/SRS/infrastructure.md` |
| `frontend.frontend_stack` | idem |
| `frontend.frontend_entry` | idem |
| `database.db_type` | `.context/SRS/architecture.md` |
| `issue_tracker.issue_tracker` | Project context (Jira / GitHub / Linear) |
| `issue_tracker.issue_tracker_cli` | `acli` (Jira) / `gh issue` (GitHub) / etc. |
| `issue_tracker.jira_url` | If Jira: instance URL |
| `testing.default_env` | Default to `staging` unless project specifies otherwise |
| `testing.tms_cli` | `bun xray` if using Xray, else null |
| `environments.local.web_url` | Local dev frontend URL |
| `environments.local.api_url` | Local dev API URL |
| `environments.local.db_mcp` | MCP server name for local DB |
| `environments.local.api_mcp` | MCP server name for local API |
| `environments.staging.*` | Staging URLs and MCP names |

**3. Validate**:

```bash
bun run lint:agents
```

Must report **0 errors, 0 warnings**. If it errors, the prompts reference variables that are still null OR not declared in `.agents/project.yaml`. Fix before proceeding.

> **Reference**: `.agents/README.md` documents the four reference syntaxes (`{{...}}` for project values, `{{environments.X.Y}}` for explicit env refs, `{{jira.<slug>}}` for Jira fields, `<<...>>` for session vars).

### STEP 2.4: Configure Jira manifest (CONDITIONAL)

> **Skip this step if the project does NOT use Jira.** The `{{jira.<slug>}}` references in prompts will simply not resolve, which is acceptable for non-Jira projects.

If `.agents/project.yaml` has `issue_tracker.issue_tracker: Jira`:

**1. Set Atlassian credentials in `.env`** (if not already there):

```env
ATLASSIAN_URL=https://your-instance.atlassian.net
ATLASSIAN_EMAIL=your-email@example.com
ATLASSIAN_API_TOKEN=ATATT3x...
```

Get the API token at: <https://id.atlassian.com/manage-profile/security/api-tokens>

**2. Sync the workspace catalog**:

```bash
bun run jira:sync-fields
```

This generates `.agents/jira.json` with all custom fields from the workspace.

**3. Validate the manifest matches the workspace**:

```bash
bun run jira:check
```

Must report `0 missing, 0 mismatched`. If a required slug is missing, create the field in Jira admin -> re-run sync-fields -> re-check.

> **Reference**: `.agents/jira-required.yaml` declares the methodology's required custom fields. `.agents/README.md` § 5.1 documents the full setup flow.

### STEP 2.5: Sync OpenAPI Specification & Generate Types

**Objetivo:** Descargar la especificación OpenAPI/Swagger del backend y generar tipos TypeScript para testing type-safe.

> **Prerequisito:** Necesitas saber dónde está la spec OpenAPI del proyecto (identificado en Step 1.5).
> **Si no hay OpenAPI disponible:** Saltar este paso — usar Custom Types en las facades directamente.

**El script soporta 3 fuentes:**

| Fuente | Cuándo usar | Ejemplo |
|--------|-------------|---------|
| **URL** | El backend expone OpenAPI en un endpoint | `http://localhost:3000/api/openapi` (Next.js) o `http://localhost:PORT/swagger/v1/swagger.json` (.NET/Spring) |
| **GitHub** | La spec está commiteada como archivo en un repo | `owner/repo` + `docs/openapi.yaml` |
| **Local** | Ya tienes el archivo en tu máquina | `../backend/docs/openapi.json` |

**1. Ejecutar sync + generar tipos (recomendado):**

Siempre pasar `-t` (`--generate-types`) para obtener los tipos junto con la spec:

```bash
# Modo interactivo (primera vez) — te pregunta qué fuente usar
bun run api:sync -t

# O directamente con URL (sin prompts)
bun run api:sync --url http://localhost:3000/api/openapi -t

# O directamente desde archivo local
bun run api:sync --file ../backend/docs/openapi.yaml -t
```

En **modo interactivo**, el script pregunta:

```
📋 OpenAPI Sync Configuration

  1) URL     — Download from an HTTP endpoint (Swagger, localhost, etc.)
  2) GitHub  — Download from a GitHub repository
  3) Local   — Copy from a file on your machine

Select source [1/2/3]:
```

**2. Resultado esperado:**

```
api/
├── openapi.json          ← Spec descargada (o openapi.yaml según la fuente)
├── openapi-types.ts      ← Tipos TypeScript generados (con -t)
└── .openapi-config.json  ← Config guardada (para futuros syncs con -c)
```

**3. Verificar la generación:**

```bash
# Confirmar que los archivos se crearon
ls api/openapi.json api/openapi-types.ts

# Verificar que los tipos se generaron correctamente
head -50 api/openapi-types.ts
```

**4. Para futuras sincronizaciones (sin prompts):**

```bash
bun run api:sync -c -t
```

> **Referencia:** Ver `.context/guidelines/TAE/openapi-integration.md` para detalles completos.

### STEP 2.6: Create/Update Type Facades

**Objetivo:** Actualizar las facades de tipos para que re-exporten los tipos OpenAPI con nombres legibles. Los componentes NUNCA importan directamente de `@openapi` — siempre usan facades.

```
api/openapi-types.ts          ← Auto-generado (NUNCA editar manualmente)
        ↓ import type
api/schemas/{domain}.types.ts  ← Facades escritas a mano (aliases legibles)
        ↓ import type
tests/components/api/*.ts      ← Componentes consumen facades
```

**1. Actualizar facade de autenticación:** `api/schemas/auth.types.ts`

El archivo ya existe con TODOs de migración. Según la disponibilidad de OpenAPI:

**Si OpenAPI está disponible (después de Step 2.5):**

- Descomentar las líneas `import type { components, paths } from '@openapi'`
- Descomentar los tipos de Schema/Endpoint
- Eliminar los Custom Types que fueron reemplazados
- Actualizar los nombres de schemas/paths para que coincidan con los del proyecto

```typescript
import type { components, paths } from '@openapi';

// ============================================================================
// Schema Types (from components.schemas)
// ============================================================================
export type TokenResponse = components['schemas']['TokenResponse'];    // UPDATE schema name
export type UserInfo = components['schemas']['UserInfoModel'];         // UPDATE schema name

// ============================================================================
// Endpoint Types - POST /api/auth/login (UPDATE endpoint path)
// ============================================================================
type LoginPath = paths['/api/auth/login']['post'];                     // UPDATE path
export type LoginPayload = LoginPath['requestBody']['content']['application/json'];
export type LoginSuccessResponse = LoginPath['responses']['200']['content']['application/json'];

// ============================================================================
// Custom Types (not in OpenAPI spec)
// ============================================================================
export interface LoginCredentials {
  email: string
  password: string
}
```

**Si OpenAPI NO está disponible:**

- Mantener los Custom Types existentes
- Actualizar las interfaces para que coincidan con la forma real del API del proyecto
- Los campos, nombres y estructura deben reflejar el contrato real

> **Cómo encontrar los nombres correctos:** Abrir `api/openapi-types.ts` y buscar los schemas y paths reales del proyecto. Los nombres deben coincidir exactamente con lo que generó `openapi-typescript`.

**2. Crear facade del primer dominio:** `api/schemas/{domain}.types.ts`

Copiar `api/schemas/example.types.ts` como plantilla y reemplazar los nombres ficticios:

```typescript
import type { components, paths } from '@openapi';

// ============================================================================
// Schema Types
// ============================================================================
export type {Entity} = components['schemas']['{EntityModel}'];         // UPDATE

// ============================================================================
// Endpoint Types - GET /api/{entities}
// ============================================================================
type Get{Entities}Path = paths['/api/{entities}']['get'];              // UPDATE
export type {Entity}ListResponse = Get{Entities}Path['responses']['200']['content']['application/json'];

// ============================================================================
// Endpoint Types - POST /api/{entities}
// ============================================================================
type Create{Entity}Path = paths['/api/{entities}']['post'];            // UPDATE
export type Create{Entity}Request = Create{Entity}Path['requestBody']['content']['application/json'];
export type Create{Entity}Response = Create{Entity}Path['responses']['201']['content']['application/json'];
```

**3. Actualizar barrel de re-export:** `api/schemas/index.ts`

```typescript
export type * from './auth.types';
export type * from './{domain}.types';  // Agregar cada dominio
```

**4. Verificar que los path aliases estén configurados en `tsconfig.json`:**

```bash
# Verificar que existan los aliases @openapi y @schemas
grep -A 2 '@openapi\|@schemas' tsconfig.json
```

Los aliases ya deben existir en el boilerplate:

```json
{
  "compilerOptions": {
    "paths": {
      "@openapi": ["./api/openapi-types"],
      "@schemas/*": ["./api/schemas/*"],
      "@schemas": ["./api/schemas/index"]
    }
  }
}
```

> **Regla clave del Type Facade Pattern:** Solo los archivos en `api/schemas/` importan de `@openapi`. Los componentes importan de `@schemas/{domain}.types`.
> **Referencia:** Ver `.context/guidelines/TAE/openapi-integration.md` → Type Facade Pattern.

### STEP 2.7: Adapt Auth Components

**File**: `tests/components/api/AuthApi.ts`

Update the authentication endpoint and request format, **using types from the facade**:

```typescript
import type { LoginPayload, TokenResponse, LoginCredentials } from '@schemas/auth.types';

// Update endpoint
private readonly endpoints = {
  login: '/auth/login',  // UPDATE to your project's endpoint
  me: '/auth/me',        // UPDATE
};

// Update request body format using facade types
@atc('PROJ-101')
async authenticateSuccessfully(credentials: LoginCredentials): Promise<[APIResponse, TokenResponse, LoginPayload]> {
  const payload: LoginPayload = {
    email: credentials.email,      // UPDATE field names to match API
    password: credentials.password,
  };
  const [response, body, sentPayload] = await this.apiPOST<TokenResponse, LoginPayload>(
    this.endpoints.login,
    payload,
  );
  expect(response.status()).toBe(200);
  return [response, body, sentPayload];
}
```

**File**: `tests/components/ui/LoginPage.ts`

Update locators to match your login form:

```typescript
// Update locators to match your project's test IDs
readonly emailInput = () => this.page.getByTestId('email');        // UPDATE
readonly passwordInput = () => this.page.getByTestId('password');  // UPDATE
readonly submitButton = () => this.page.getByRole('button', { name: 'Login' });  // UPDATE

// Update success assertion
@atc('PROJ-101')
async loginSuccessfully(email: string, password: string) {
  await this.goto();
  await this.emailInput().fill(email);
  await this.passwordInput().fill(password);
  await this.submitButton().click();
  await expect(this.page).toHaveURL(/dashboard/);  // UPDATE to your success URL
}
```

### STEP 2.8: Verify Auth Setup Files

**File**: `tests/setup/api-auth.setup.ts`

- Should work with updated AuthApi
- Test by running: `bun run test --project=api-setup`

**File**: `tests/setup/ui-auth.setup.ts`

- Should work with updated LoginPage
- Test by running: `bun run test --project=ui-setup`

### STEP 2.9: Create First Domain Component

Based on project entities, create the first component **using types from the facade**:

**API Component:** `tests/components/api/{Entity}Api.ts`

```typescript
import type { {Entity}, {Entity}ListResponse, Create{Entity}Request, Create{Entity}Response } from '@schemas/{domain}.types';
import type { APIResponse } from '@playwright/test';
import { ApiBase } from '@api/ApiBase';
import { expect } from '@playwright/test';
import { atc } from '@utils/decorators';

export class {Entity}Api extends ApiBase {
  private readonly endpoints = {
    list: '/api/{entities}',
    get: (id: string) => `/api/{entities}/${id}`,
    create: '/api/{entities}',
  };

  @atc('PROJ-101')
  async get{Entity}Successfully(id: string): Promise<[APIResponse, {Entity}]> {
    const [response, body] = await this.apiGET<{Entity}>(this.endpoints.get(id));
    expect(response.status()).toBe(200);
    return [response, body];
  }

  @atc('PROJ-102')
  async create{Entity}Successfully(payload: Create{Entity}Request): Promise<[APIResponse, Create{Entity}Response, Create{Entity}Request]> {
    const [response, body, sentPayload] = await this.apiPOST<Create{Entity}Response, Create{Entity}Request>(
      this.endpoints.create,
      payload,
    );
    expect(response.status()).toBe(201);
    return [response, body, sentPayload];
  }
}
```

**UI Component:** `tests/components/ui/{Entity}Page.ts`

```typescript
import { UiBase } from '@ui/UiBase';
import { atc } from '@utils/decorators';

export class {Entity}Page extends UiBase {
  async goto() {
    await this.page.goto('/{entities}');
  }

  @atc('PROJ-101')
  async view{Entity}ListSuccessfully() {
    await this.goto();
    await expect(this.page.getByTestId('{entity}-list')).toBeVisible();
  }
}
```

### STEP 2.10: Update Fixtures

**File**: `tests/components/ApiFixture.ts`

```typescript
import { {Entity}Api } from '@api/{Entity}Api';

// Add to class
{entity}: {Entity}Api;

// Add to constructor
this.{entity} = new {Entity}Api(options);

// Add to setAuthToken()
this.{entity}.setAuthToken(token);

// Add to clearAuthToken()
this.{entity}.clearAuthToken();
```

**File**: `tests/components/UiFixture.ts`

```typescript
import { {Entity}Page } from '@ui/{Entity}Page';

// Add to class
{entity}Page: {Entity}Page;

// Add to constructor
this.{entity}Page = new {Entity}Page(options);
```

### STEP 2.11: Create First Test

Create a smoke test that verifies:

- Authentication works
- Basic navigation works
- At least one domain operation works

**Location**: `tests/e2e/{feature}/smoke.test.ts`

### STEP 2.12: Run the 8 exit gates (fail-fast, in strict order)

Each gate must pass before the next runs. If a gate fails, STOP and fix before continuing.

| # | Gate | Command | Expected |
|---|---|---|---|
| 1 | TypeScript | `bun run type-check` | Exit 0 |
| 2 | Lint | `bun run lint` | Exit 0 |
| 3 | Agents lint | `bun run lint:agents` | 0 errors, 0 warnings |
| 4 | Jira manifest (if Jira project) | `bun run jira:check` | 0 missing, 0 mismatched |
| 5 | API auth setup | `bun run test --project=api-setup` | Generates `.auth/api-state.json` |
| 6 | UI auth setup | `bun run test --project=ui-setup` | Generates `.auth/user.json` |
| 7 | Smoke test #1 | `bun run test:smoke` | Passes against staging |
| 8 | Smoke test #2 (session reuse) | `bun run test:smoke` again | Reuses `.auth/*` — NO re-login |

**Gate 8 is the tightest detector of broken session reuse** — the most common bug after auth adaptation. If gate 8 logs in again instead of reusing the saved state, session reuse is broken. STOP and debug.

### STEP 2.13: Cleanup boilerplate placeholders

Once the real entity is in place and the 8 exit gates pass, remove the example placeholders that ship with the boilerplate:

- [ ] `tests/components/api/ExampleApi.ts`
- [ ] `tests/components/ui/ExamplePage.ts`
- [ ] `tests/components/steps/ExampleSteps.ts` (if exists)
- [ ] `api/schemas/example.types.ts`
- [ ] Update `api/schemas/index.ts` barrel — remove the `example.types` re-export
- [ ] Remove any `Example*` references from `tests/components/ApiFixture.ts` and `tests/components/UiFixture.ts`

After cleanup, re-run gates 1-3 (`type-check`, `lint`, `lint:agents`) to confirm nothing broke.

This keeps the test repo clean — no orphan placeholders pretending to be real components.

### STEP 2.14: Report completion

Update artifacts:

- `.context/PBI/test-framework-adaptation-plan.md` — mark `Status: COMPLETED` and append a "Results" block with:
  - Auth strategy resolved (token / cookie / hybrid)
  - First entity adapted: `{Entity}`
  - Discovery Gaps surfaced (anything Discovery did not cover that came up during adaptation)
  - Open follow-ups (additional entities to adapt later in `.prompts/fase-12-test-automation/`)
- `CLAUDE.md` — fill in the "Project Identity" section with project name, stack, target repo (DOES NOT touch the variable system, which lives in `.agents/`).

Report to user:
- What was adapted (auth, OpenAPI, first entity)
- All 8 gates status (with link to outputs)
- Discovery Gaps (anything blocking the next step)
- **Recommended next step**: invoke `.prompts/fase-12-test-automation/` to write feature test #1.

---

## Implementation Notes

### Common Adaptation Points

| Area | Template Value | Adapt To |
|------|----------------|----------|
| Login endpoint | `/auth/login` | Project's auth endpoint |
| Login locators | `[data-testid="login-email-input"]` | Project's form selectors |
| Token format | `access_token` | Project's token field |
| Success URL | `/dashboard` | Project's post-login URL |
| API prefix | `/api` | Project's API prefix |
| OpenAPI source | None configured | Project's Swagger URL or spec file |
| Type facades | Template placeholders | Real schema names from `openapi-types.ts` |

### Troubleshooting

**Auth fails in setup**:

- Check endpoint URL in AuthApi
- Verify credentials in `.env`
- Check token response format

**UI login fails**:

- Check locators match actual form
- Verify success assertion
- Check token interception URL

**Type errors**:

```bash
bun run type-check
# Check import aliases in tsconfig.json
# Verify all imports use @utils/, @api/, @ui/, @schemas/, etc.
```

**OpenAPI sync fails**:

```bash
# Si usa URL: verificar que el backend esté corriendo y el endpoint responda
curl -s http://localhost:3000/api/openapi | head -5        # Next.js (openapi-setup)
curl -s http://localhost:PORT/swagger/v1/swagger.json | head -5  # .NET/Spring

# Si usa GitHub repo: verificar acceso
gh auth status
gh repo view owner/backend-repo

# Re-ejecutar sin config guardada
bun run api:sync -t
```

**Type facades import errors**:

```bash
# Verificar que los path aliases existan en tsconfig.json
grep -A 5 '@openapi\|@schemas' tsconfig.json

# Verificar que openapi-types.ts se generó correctamente
head -20 api/openapi-types.ts

# Verificar nombres de schemas (deben coincidir con openapi-types.ts)
grep "schemas" api/openapi-types.ts | head -20
```

---

## Files Reference

### Files to Read (Understanding)

| File | Purpose |
|------|---------|
| `.context/guidelines/TAE/kata-ai-index.md` | KATA concepts overview |
| `.context/guidelines/TAE/kata-architecture.md` | 4-layer architecture |
| `.context/guidelines/TAE/automation-standards.md` | ATC rules, naming conventions |
| `.context/guidelines/TAE/playwright-automation-system.md` | DI, fixtures, session reuse |
| `.context/guidelines/TAE/openapi-integration.md` | Type Facade Pattern, API type safety |

### Files to Modify (Always)

| File | Purpose |
|------|---------|
| `config/variables.ts` | Environment URLs, auth endpoints, credentials |
| `.env` | Test credentials and URLs |
| `api/schemas/auth.types.ts` | Auth domain types (uncomment OpenAPI or update Custom) |
| `api/schemas/index.ts` | Barrel re-export (add new domain facades) |
| `tests/components/api/AuthApi.ts` | Auth API component (endpoints, request format) |
| `tests/components/ui/LoginPage.ts` | Login UI component (locators, assertions) |
| `tests/components/ApiFixture.ts` | API DI container (add new components) |
| `tests/components/UiFixture.ts` | UI DI container (add new components) |
| `playwright.config.ts` | Base URL (if needed) |

### Files to Create (Per Project)

| File | Purpose |
|------|---------|
| `api/schemas/{domain}.types.ts` | Domain type facades (based on `example.types.ts` pattern) |
| `tests/components/api/{Entity}Api.ts` | Domain API components (import from `@schemas`) |
| `tests/components/ui/{Entity}Page.ts` | Domain UI components |
| `tests/e2e/{feature}/*.test.ts` | E2E test files |
| `tests/integration/{feature}/*.test.ts` | Integration test files |

### Files Generated (By Tools)

| File | Generated By | Purpose |
|------|-------------|---------|
| `api/openapi.json` | `bun run api:sync` | Downloaded OpenAPI spec |
| `api/openapi-types.ts` | `bun run api:sync -t` | Auto-generated TypeScript types |
| `api/.openapi-config.json` | `bun run api:sync` | Saved config for future syncs |

---

## Checklist

- [ ] Phase 1: Context read completely
- [ ] Phase 1: Guidelines understood (including openapi-integration.md)
- [ ] Phase 1: Template structure analyzed
- [ ] Phase 1: Auth strategy determined
- [ ] Phase 1: OpenAPI source identified (or confirmed unavailable)
- [ ] Phase 1: Components and type facades identified
- [ ] Phase 1: Plan generated
- [ ] Phase 1: User approved plan
- [ ] Phase 2: Configuration updated (`config/variables.ts` + `.env`)
- [ ] Phase 2: OpenAPI spec synced (if available)
- [ ] Phase 2: Types generated (if available)
- [ ] Phase 2: `auth.types.ts` updated (OpenAPI or Custom Types)
- [ ] Phase 2: Domain type facades created
- [ ] Phase 2: Barrel re-export updated (`api/schemas/index.ts`)
- [ ] Phase 2: Auth components adapted (AuthApi + LoginPage)
- [ ] Phase 2: Auth setup tests passing (api-setup + ui-setup)
- [ ] Phase 2: Domain components created
- [ ] Phase 2: Fixtures updated
- [ ] Phase 2: First test created
- [ ] Phase 2: Type-check passing
- [ ] Phase 2: Lint passing
- [ ] Phase 2: Smoke test passing

---

**Version**: 3.0
**Last Updated**: 2026-04-28
