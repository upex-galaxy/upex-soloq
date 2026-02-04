# System Prompt - SoloQ

> Generic AI Agent Instructions for SoloQ Project
> Compatible with: Google Gemini, AI Studio, and Gemini-based tools

---

## Project Overview

**SoloQ** is an invoicing platform for LATAM freelancers built with:

- **Framework:** Next.js 16.1 (App Router)
- **Backend:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Forms:** React Hook Form + Zod
- **Language:** TypeScript (strict mode)
- **Runtime:** Bun

**Description:** SoloQ enables freelancers to create professional invoices in under 2 minutes, manage clients, send invoices via email with PDF attachments, and track payments with automatic reminders (Pro feature).

---

## Project IDs

| Service  | ID / Key               | Usage                          |
| -------- | ---------------------- | ------------------------------ |
| Supabase | `czuusjchqpgvanvbdrnz` | Database, Auth, Storage        |
| Jira     | `SQ`                   | Project key for issues (SQ-XX) |

---

## Core Principles

### 1. Spec-Driven Development

- **Never** implement code without reading the specification first
- **User Stories** define WHAT to do
- **Acceptance Criteria** define WHEN it's done
- **Test Cases** define HOW to test
- **Implementation Plan** defines HOW to implement

### 2. Context Loading

- **Always** load relevant context before working
- Read the **guidelines** for your role
- Use **MCPs** for live data (schema, docs, issues)
- **Don't assume** - verify in documentation

### 3. Quality First

- Follow **code standards** from the first line
- Implement **error handling** correctly
- Add **data-testid** to interactive elements
- **Don't hardcode** values - use configuration

---

## Project Structure

```
soloq/
   src/
      app/                       # Next.js App Router
         (auth)/                # Auth pages (login, signup)
         (app)/                 # Protected app pages
            dashboard/         # Main dashboard
            invoices/          # Invoice management
            clients/           # Client management
            settings/          # Business settings
         auth/callback/         # OAuth callback

      components/
         ui/                    # shadcn/ui components
         layout/                # Layout components

      lib/
         supabase/              # Supabase clients
             client.ts          # Browser client
             server.ts          # Server client
             admin.ts           # Admin client

      contexts/                  # React contexts (auth)
      hooks/                     # Custom hooks
      types/
          supabase.ts            # Generated DB types

   scripts/                       # Build & dev scripts
   docs/                          # System documentation
   .context/                      # AI context engineering
      idea/                      # Phase 1: Constitution
      PRD/                       # Phase 2: Product Requirements
      SRS/                       # Phase 2: Software Requirements
      PBI/                       # Phases 4-6: Product Backlog
         epics/.../stories/...  # Stories with test cases
      guidelines/                # Reference material
          DEV/                   # Development guidelines
          QA/                    # Manual testing guidelines
          TAE/                   # Test automation guidelines
          MCP/                   # MCP guidelines

   .prompts/                      # Prompt templates
```

---

## Context Loading by Role

### Development (DEV)

Before coding, read:

- `.context/guidelines/DEV/code-standards.md`
- `.context/guidelines/DEV/error-handling.md`
- `.context/guidelines/DEV/data-testid-standards.md`
- `.context/PBI/epics/.../stories/.../story.md` (User story + AC)
- `.context/PBI/epics/.../stories/.../implementation-plan.md`

### QA (Manual Testing)

Before testing, read:

- `.context/guidelines/QA/spec-driven-testing.md`
- `.context/guidelines/QA/exploratory-testing.md`
- `.context/PBI/epics/.../stories/.../test-cases.md`
- `.prompts/fase-10-exploratory-testing/`

### TAE (Test Automation)

Before automating, read:

- `.context/guidelines/TAE/KATA-AI-GUIDE.md`
- `.context/guidelines/TAE/kata-architecture.md`
- `.context/guidelines/TAE/automation-standards.md`
- `.context/PBI/epics/.../stories/.../test-cases.md`

---

## Database Schema

### Main Entities

| Table               | Description                        |
| ------------------- | ---------------------------------- |
| `profiles`          | User profile data                  |
| `business_profiles` | Business info (name, logo, tax_id) |
| `clients`           | Client database                    |
| `invoices`          | Invoice records                    |
| `invoice_items`     | Line items per invoice             |
| `payments`          | Payment records                    |
| `payment_methods`   | User's configured payment methods  |
| `subscription`      | Free/Pro subscription status       |
| `reminder_settings` | Auto-reminder configuration (Pro)  |
| `invoice_events`    | Audit log for invoices             |

### Enums

- `invoice_status`: draft, sent, paid, overdue, cancelled
- `discount_type`: percentage, fixed
- `payment_method_type`: bank_transfer, paypal, mercado_pago, cash, other
- `subscription_plan`: free, pro
- `subscription_status`: active, canceled, past_due, incomplete
- `invoice_event_type`: created, updated, sent, reminder_sent, viewed, paid, cancelled

### Invoice Status Flow

```
draft -> sent -> paid
            |
            +-> overdue -> paid
            |
            +-> cancelled
```

---

## Available Commands

```bash
# Development
bun dev              # Start dev server (Turbopack)
bun build            # Production build
bun typecheck        # TypeScript check

# Code Quality
bun lint             # Run ESLint
bun lint:fix         # Auto-fix ESLint errors
bun format           # Format with Prettier
bun format:check     # Check formatting

# AI Tooling
bun ai {preset}      # Load MCPs by task
bun up               # Update prompt templates
bun kata:manifest    # Generate test automation manifest
bun api:sync         # Sync OpenAPI spec
```

---

## MCP Integration

| MCP        | When to Use                    |
| ---------- | ------------------------------ |
| Supabase   | Schema, data, RLS policies     |
| Context7   | Official library documentation |
| Playwright | E2E tests, UI interactions     |
| Atlassian  | Jira, Confluence               |
| GitHub     | Issues, PRs, code              |

### Testing Triforce (QA)

| Layer | MCPs                 |
| ----- | -------------------- |
| UI    | `playwright`         |
| API   | `postman`, `openapi` |
| DB    | `dbhub`              |

---

## Golden Rules

1. **Spec First**: Read the specification before acting
2. **Context Matters**: Load the correct context for your role
3. **Living Data**: Use MCPs for live data, not static docs
4. **Quality Built-In**: Apply standards from the start
5. **Traceability**: All code/tests map to a specification

---

## Key Files Reference

| File                         | Purpose                         |
| ---------------------------- | ------------------------------- |
| `src/types/supabase.ts`      | Database types (auto-generated) |
| `src/lib/supabase/client.ts` | Browser Supabase client         |
| `src/lib/supabase/server.ts` | Server Supabase client          |
| `middleware.ts`              | Auth middleware                 |
| `.env.example`               | Environment variables template  |

---

**Last updated:** 2026-02-03
**See also:** `.context/guidelines/` for detailed role-specific guidelines
