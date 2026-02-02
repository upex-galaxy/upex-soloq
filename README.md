# SoloQ

**Invoicing platform for LATAM freelancers** - Create professional invoices, track payments, and automate reminders.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-green)](LICENSE)

---

## The Problem

Freelancers in Latin America face critical challenges managing their billing:

| Current Reality                 | Impact                           |
| ------------------------------- | -------------------------------- |
| Manual invoices in Word/Excel   | 15-30 min per invoice            |
| No payment tracking             | Don't know who owes them         |
| Embarrassment sending reminders | 30-45 day payment delays         |
| Expensive tools ($17-50/month)  | Prohibitive for local currencies |
| English-only software           | High learning curve              |

**Result:** Freelancers lose >10% of income to uncollected payments.

## The Solution

SoloQ provides:

- **Professional invoices in <2 minutes** - Clean templates with your branding
- **Client management** - Simple database with invoice history
- **Flexible payment methods** - Bank, PayPal, Mercado Pago, and more
- **One-click email sending** - PDF attachment included
- **Payment dashboard** - Track pending, paid, and overdue
- **Automatic reminders** (Pro) - No more awkward collection calls

---

## Tech Stack

| Layer             | Technology                   | Version |
| ----------------- | ---------------------------- | ------- |
| **Framework**     | Next.js (App Router)         | 16.1    |
| **Runtime**       | Bun                          | Latest  |
| **Language**      | TypeScript (strict)          | 5.9     |
| **Backend**       | Supabase (PostgreSQL + Auth) | -       |
| **Styling**       | Tailwind CSS + shadcn/ui     | 4.1     |
| **Forms**         | React Hook Form + Zod        | 7.71    |
| **UI Components** | Radix UI primitives          | -       |

## Project Structure

```
soloq/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, signup)
│   │   ├── (app)/              # Protected app pages
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── invoices/       # Invoice management
│   │   │   ├── clients/        # Client management
│   │   │   └── settings/       # Business settings
│   │   └── auth/callback/      # OAuth handler
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── layout/             # App layout components
│   │
│   ├── lib/
│   │   ├── supabase/           # Supabase clients (browser, server, admin)
│   │   ├── config.ts           # Environment config
│   │   └── utils.ts            # Utilities
│   │
│   ├── contexts/               # React contexts (auth)
│   ├── hooks/                  # Custom hooks
│   └── types/                  # TypeScript definitions
│
├── scripts/                    # Build & dev scripts
├── docs/                       # Documentation
├── .context/                   # AI context engineering
└── .prompts/                   # AI prompt templates
```

## Database Schema

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     profiles    │     │ business_profiles│    │     clients     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (user_id)    │────▶│ user_id         │────▶│ user_id         │
│ full_name       │     │ business_name   │     │ name            │
│ avatar_url      │     │ logo_url        │     │ email           │
│ created_at      │     │ tax_id          │     │ phone           │
└─────────────────┘     │ contact_email   │     │ company         │
                        │ payment_methods │     │ address         │
                        └─────────────────┘     └────────┬────────┘
                                                         │
┌─────────────────┐     ┌─────────────────┐              │
│    invoices     │     │  invoice_items  │              │
├─────────────────┤     ├─────────────────┤              │
│ id              │────▶│ invoice_id      │              │
│ user_id         │     │ description     │◀─────────────┘
│ client_id       │◀────│ quantity        │
│ invoice_number  │     │ unit_price      │
│ status          │     │ total           │
│ issue_date      │     └─────────────────┘
│ due_date        │
│ subtotal        │     ┌─────────────────┐
│ tax_amount      │     │    payments     │
│ total           │     ├─────────────────┤
└────────┬────────┘     │ invoice_id      │
         │              │ amount          │
         └─────────────▶│ payment_date    │
                        │ payment_method  │
                        └─────────────────┘
```

### Invoice Status Flow

```
draft ──▶ sent ──▶ paid
              │
              └──▶ overdue ──▶ paid
              │
              └──▶ cancelled
```

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Supabase](https://supabase.com/) account
- Node.js 18+ (for some tooling)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/soloq.git
cd soloq

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
```

### Environment Setup

Edit `.env` with your Supabase credentials:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Find these values in [Supabase Dashboard](https://supabase.com/dashboard) > Settings > API

### Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Available Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `bun dev`          | Start development server (Turbopack) |
| `bun build`        | Build for production                 |
| `bun start`        | Start production server              |
| `bun typecheck`    | Run TypeScript check                 |
| `bun lint`         | Run ESLint                           |
| `bun lint:fix`     | Fix ESLint errors                    |
| `bun format`       | Format with Prettier                 |
| `bun format:check` | Check formatting                     |

### AI Tooling Scripts

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `bun ai`            | MCP builder for AI tools          |
| `bun up`            | Update prompt templates           |
| `bun kata:manifest` | Generate test automation manifest |
| `bun api:sync`      | Sync OpenAPI spec                 |

---

## Architecture

### Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐
│ Browser │────▶│ Middleware  │────▶│ Supabase Auth│
└─────────┘     └─────────────┘     └──────────────┘
     │                │                     │
     │    Protected   │    JWT Token        │
     │    Routes      │    Validation       │
     │                │                     │
     ▼                ▼                     ▼
┌─────────────────────────────────────────────────┐
│              Auth Context (React)               │
├─────────────────────────────────────────────────┤
│ • user: User profile                            │
│ • business: Business profile                    │
│ • subscription: Free/Pro status                 │
│ • isLoading: Auth state                         │
└─────────────────────────────────────────────────┘
```

### Security

- **Row Level Security (RLS):** Users can only access their own data
- **JWT Authentication:** Supabase Auth with httpOnly cookies
- **Password Policy:** Min 8 chars, mixed case, numbers
- **Rate Limiting:** 5 attempts, 15 min lockout

### Route Groups

| Group    | Path                            | Description         |
| -------- | ------------------------------- | ------------------- |
| `(auth)` | `/login`, `/signup`             | Public auth pages   |
| `(app)`  | `/dashboard`, `/invoices`, etc. | Protected app pages |

---

## Development

### Code Quality

Pre-commit hooks automatically run:

1. **ESLint** with auto-fix
2. **Prettier** formatting

```bash
# Manual checks
bun lint
bun format:check
bun typecheck
```

### Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/):

```bash
bunx shadcn@latest add button
bunx shadcn@latest add card
```

### Type Generation

Database types are in `src/types/supabase.ts`. Regenerate after schema changes:

```bash
bunx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

---

## AI-Driven Development

This project uses **Context Engineering** for AI-assisted development.

### Structure

| Directory   | Purpose                                          |
| ----------- | ------------------------------------------------ |
| `.context/` | Documentation AI reads to understand the project |
| `.prompts/` | Templates for generating documentation           |
| `docs/`     | System blueprints and guides                     |

### Workflow (14 Phases)

1. **Constitution** - Business model definition
2. **Architecture** - PRD + SRS specs
3. **Infrastructure** - Backend + Frontend setup
4. **Specification** - Product backlog (Jira-First)
5. **Shift-Left Testing** - Test planning
6. **Planning** - Implementation plans
7. **Implementation** - Code + unit tests
8. **Code Review** - Static analysis
9. **Staging Deployment** - CI/CD to staging
10. **Exploratory Testing** - Manual QA
11. **Test Documentation** - Jira test cases
12. **Test Automation** - KATA framework
13. **Production Deployment** - Release
14. **Shift-Right Testing** - Monitoring

See [Context Engineering Guide](.context/context-engineering.md) for details.

### MCP Integration

Configure AI tools (Claude Code, Gemini CLI, etc.) with MCPs:

```bash
# Load MCPs for backend work
bun ai backend

# Load MCPs for frontend work
bun ai frontend

# Load MCPs for testing
bun ai testing
```

---

## Business Model

### Pricing Tiers

| Feature            | Free      | Pro ($9.99/mo) |
| ------------------ | --------- | -------------- |
| Create invoices    | Unlimited | Unlimited      |
| Client management  | Unlimited | Unlimited      |
| PDF generation     | Yes       | Yes            |
| Email sending      | Yes       | Yes            |
| Payment methods    | Flexible  | Flexible       |
| Invoice templates  | 1         | 5+             |
| **Auto reminders** | No        | **Yes**        |
| Reports/Analytics  | Basic     | Advanced       |
| Read receipts      | No        | Yes            |
| CSV Export         | No        | Yes            |

### Target Market

- **Who:** Freelancers in LATAM (designers, developers, consultants)
- **Where:** Mexico, Colombia, Argentina, Chile, Peru
- **Income:** $500-5,000 USD/month
- **Clients:** 3-15 simultaneous

---

## Roadmap

### Phase 1: Foundation (Current)

- [x] User authentication
- [x] Dashboard layout
- [ ] Business profile setup
- [ ] Onboarding flow

### Phase 2: Core Features

- [ ] Client CRUD
- [ ] Invoice creation
- [ ] PDF generation
- [ ] Email sending

### Phase 3: Tracking

- [ ] Payment tracking
- [ ] Status dashboard
- [ ] Search & filters

### Phase 4: Pro Features

- [ ] Automatic reminders
- [ ] Stripe subscriptions
- [ ] Advanced analytics

---

## Contributing

1. Read the [Context Engineering Guide](.context/context-engineering.md)
2. Follow the [Code Standards](.context/guidelines/DEV/code-standards.md)
3. Use conventional commits
4. Create PR against `develop` branch

---

## License

ISC License - See [LICENSE](LICENSE) for details.

---

## Links

- [Context Engineering Guide](.context/context-engineering.md)
- [AI Blueprint](docs/ai-driven-software-project-blueprint.md)
- [KATA Test Architecture](docs/kata-test-architecture.md)
- [MCP Configuration](docs/mcp-config-general.md)
