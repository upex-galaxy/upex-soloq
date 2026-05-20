# Guidelines - Reference Material

> **Purpose**: Guidelines that the AI must read before working
> **Principle**: Each folder corresponds to a specific ROLE

---

## Structure

```
guidelines/
├── README.md               # This file (index)
├── code-standards.md       # DRY, KISS, naming, TypeScript
├── tms-architecture.md     # TMS entity model, traceability, linking order
├── tms-conventions.md      # TMS rules, states, formats, automation criteria
├── tms-workflow.md         # 5-stage In-Sprint Testing workflow (IQL-aligned)
│
├── DEV/                    # Development Guidelines
│   ├── README.md               # DEV index
│   ├── code-standards.md       # DRY, KISS, naming, TypeScript
│   ├── error-handling.md       # Custom errors, retry, logging
│   ├── data-testid-standards.md # How to CREATE data-testid
│   └── spec-driven-development.md # SDD principle
│
├── QA/                     # Quality Engineering Guidelines
│   ├── README.md               # QA index
│   ├── spec-driven-testing.md  # Spec-driven testing principle
│   ├── test-spec-standards.md  # Test specification standards
│   ├── test-hierarchy.md       # Test hierarchy reference
│   ├── exploratory-testing.md  # Manual exploratory testing
│   ├── atc-definition-strategy.md # ATC definition strategy
│   ├── data-testid-usage.md    # How to USE data-testid in tests
│   └── jira-test-management.md # Test case documentation in Jira
│
└── TAE/                    # Test Automation Engineering
    ├── README.md               # TAE index
    ├── kata-ai-index.md        # AI entry point (START HERE)
    ├── kata-architecture.md    # KATA layer architecture
    ├── automation-standards.md # ATC rules and patterns
    ├── atc-tracing-system.md   # ATC tracing & result system
    ├── test-design-principles.md # Test design principles
    ├── api-testing-patterns.md # API test patterns
    ├── test-data-management.md # Faker and test data
    ├── tms-integration.md      # Jira/Xray TMS sync
    └── ci-cd-integration.md    # GitHub Actions CI/CD
```

---

## Usage by Role

### Developer (DEV)

```
Read BEFORE implementing:
├── DEV/code-standards.md
├── DEV/error-handling.md
├── DEV/data-testid-standards.md
└── DEV/spec-driven-development.md
```

### QA Engineer (Manual Testing)

```
Read BEFORE testing:
├── QA/spec-driven-testing.md
├── QA/test-spec-standards.md
├── QA/test-hierarchy.md
├── QA/exploratory-testing.md
├── QA/data-testid-usage.md
└── QA/jira-test-management.md
```

### QA Automation Engineer (TAE)

```
Read BEFORE writing tests:
1. TAE/kata-ai-index.md      <- Start here (AI entry point)
2. TAE/kata-architecture.md  <- Understand layers
3. TAE/automation-standards.md <- ATC rules
4. code-standards.md         <- General coding standards
```

**Note**: The QA folder is maintained as reference material. The primary focus of this repository is test automation (TAE).

---

## Key Concepts

### 1. Guidelines by Role

Each folder contains role-specific guidelines:

- **DEV**: How to write quality code
- **QA**: How to do effective manual testing
- **TAE**: How to automate tests

### 2. Shared Principles

Although each role has its own guidelines, they share principles:

- **Spec-Driven**: Everything comes from specifications
- **Quality First**: Quality from the start
- **Traceability**: Tests map to requirements via `@atc` decorator

### 3. MCP Tools

See `CLAUDE.md` MCPs Available section for usage patterns and decision rules.

| MCP         | Purpose                          |
| ----------- | -------------------------------- |
| Atlassian   | Jira/Confluence integration      |
| DBHub       | Database queries and validation  |
| OpenAPI     | API endpoint discovery           |
| Playwright  | Browser automation               |
| Postman     | API testing                      |
| Context7    | Documentation lookup             |
| Tavily      | Web research                     |

---

## Workflows

Guidelines are **constant principles**. For step-by-step workflows, see:

- `.prompts/us-dev-workflow.md` - Development workflow
- `.prompts/us-qa-workflow.md` - QA workflow
- `.prompts/fase-12-test-automation/` - TAE workflow

---

## See Also

- `CLAUDE.md` (project root) - Project memory and quick start
- `TAE/kata-ai-index.md` - AI implementation guide
- `.prompts/` - Prompts for each phase

---

**Last Updated**: 2026-04-13
