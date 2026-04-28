# Fase 10: Exploratory Testing

## Purpose

Execute manual exploratory testing to validate functionality and discover defects BEFORE investing in test automation. This fase consolidates two activities: **execution** (smoke + exploratory testing across UI/API/DB) and **reporting** (bug reports + test report).

**Why exploratory testing first:**

- Rapid feedback (minutes vs hours)
- Finds bugs that automated tests miss
- Validates features before automating
- Shift-left = feedback as early as possible

---

## The Triforce of Testing

This fase supports **complete feature validation** through three testing layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIFORCE TESTING                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │     UI      │  │     API     │  │     DB      │         │
│  │  Testing    │  │  Testing    │  │  Testing    │         │
│  │             │  │             │  │             │         │
│  │ Playwright  │  │  Postman/   │  │   DBHub     │         │
│  │    MCP      │  │ OpenAPI MCP │  │    MCP      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  exploratory-     exploratory-      exploratory-            │
│  test.md          api-test.md       db-test.md              │
└─────────────────────────────────────────────────────────────┘
```

**Choose based on feature type:**

| Feature Type         | Recommended Testing            |
| -------------------- | ------------------------------ |
| UI-focused feature   | UI → API → DB                  |
| API-first feature    | API → DB → UI (if applicable)  |
| Data-focused feature | DB → API → UI (if applicable)  |
| Full-stack feature   | All three (Complete Triforce)  |

---

## Prerequisites

- Feature deployed to staging
- User Story in "Ready For QA" status
- Test cases from Shift-Left Testing (Fase 5) or Acceptance Criteria
- MCPs configured for the testing layer(s) needed

---

## Entry / Exit Criteria

### Entry Criteria

- [ ] Feature deployed to staging environment
- [ ] User Story in "Ready For QA" status
- [ ] Test cases or Acceptance Criteria available (from Fase 5 or Jira)
- [ ] Required MCPs configured (Playwright, Postman, DBHub as needed)
- [ ] Staging URL accessible
- [ ] Evidence folder ready (`evidence/` for screenshots, traces, logs)

### Exit Criteria

- [ ] Smoke test PASSED (or blocker reported)
- [ ] Exploratory testing completed for relevant layers (UI/API/DB)
- [ ] All TCs have a final Test Status (PASSED or FAILED)
- [ ] Session notes documented with findings
- [ ] Bugs reported in Jira (if any found)
- [ ] ATR (Test Report) filled and marked Complete
- [ ] Summary comment added to User Story
- [ ] US transitioned to "QA Approved" / "Tested" (if PASSED) or "Failed" (if issues)

---

## Prompts in This Fase

| Order | Prompt                       | Purpose                                | MCP Required     |
| ----- | ---------------------------- | -------------------------------------- | ---------------- |
| 1     | `smoke-test.md`              | Quick validation that deployment works | playwright       |
| 2a    | `exploratory-test.md`        | Deep UI exploration                    | playwright       |
| 2b    | `exploratory-api-test.md`    | Deep API exploration                   | postman, openapi |
| 2c    | `exploratory-db-test.md`     | Deep database verification             | dbhub            |
| 3     | `bug-report.md`              | Report defects found (conditional)     | atlassian        |
| 4     | `test-report.md`             | Fill ATR, summarize results, finalize  | atlassian        |

**Note:** 2a, 2b, 2c can be executed in any order or combination based on feature needs.

---

## Execution Flow

```
US Status: Ready For QA
        ↓
[1] Smoke Test (5-10 min)
    └── FAILED? → Report blocker, STOP
        ↓
[2] Exploratory Testing (choose based on feature)
    │
    ├── [2a] UI Testing (exploratory-test.md)
    │   └── Uses Playwright MCP for UI exploration
    │   └── Validates user experience
    │
    ├── [2b] API Testing (exploratory-api-test.md)
    │   └── Uses Postman/OpenAPI MCP
    │   └── Validates backend contracts, auth, RLS
    │
    └── [2c] DB Testing (exploratory-db-test.md)
        └── Uses DBHub MCP for SQL verification
        └── Validates data integrity, constraints, triggers
        ↓
[3] Bug Report (if issues found)
    └── Use bug-report.md for each issue
    └── Report to Jira (with human confirmation)
        ↓
[4] Test Report (test-report.md)
    └── Fill ATR with all TC results
    └── Mark ATR Complete
    └── Add summary comment to US
        ↓
Decision: PASSED or FAILED?
    └── PASSED → Transition US to "QA Approved" / "Tested"
    └── FAILED → Wait for fixes, re-test
```

---

## TCs as Guides

If Test Cases exist from Fase 5 (Shift-Left Testing), use them as a guide but explore freely:

- Update TC **Test Status** (PASSED/FAILED) as you validate
- Discovering new scenarios **beyond** the TCs is expected and encouraged
- New scenarios can become candidate TCs in Fase 11 (Test Documentation)

---

## Triage Decisions

After execution, every TC must have a final Test Status:

| TC Outcome     | Action                                                             |
| -------------- | ------------------------------------------------------------------ |
| **PASSED**     | TC behaved as expected — proceed to Fase 11                        |
| **FAILED**     | Bug found — create bug via `bug-report.md`, link to TC             |
| **BLOCKED**    | Cannot execute due to environment/dependency — escalate, document  |
| **NEW SCENARIO** | Discovered during exploration — note for Fase 11 documentation   |

---

## Workflow Status Impact

This fase does NOT directly transition TC Workflow Status (Draft → Candidate → Manual/Automated).

TC **Test Status** (PASSED/FAILED) is updated here. The next fase (**Fase 11: Test Documentation**) is responsible for transitioning TC **Workflow Status** to Candidate or Manual based on automation viability.

---

## Tools Required

| MCP             | Purpose                                   | Prompt(s)              |
| --------------- | ----------------------------------------- | ---------------------- |
| `playwright`    | UI exploration, screenshots, interactions | smoke, exploratory     |
| `postman`       | API collections, authenticated flows      | exploratory-api-test   |
| `openapi` (api) | API endpoint exploration                  | exploratory-api-test   |
| `dbhub` (sql)   | SQL queries, data verification            | exploratory-db-test    |
| `atlassian`     | Bug creation, story transitions, ATR      | bug-report, test-report |

---

## Output / Artifacts Updated

| Artifact          | Location                                                              | Description                       |
| ----------------- | --------------------------------------------------------------------- | --------------------------------- |
| ATR (TMS)         | Test Results in TMS                                                   | Test Report filled, marked Complete |
| Bug (TMS)         | Backlog in TMS                                                        | Bug reports (if any)              |
| US Comment        | User Story in TMS                                                     | Summary of QA results             |
| `test-report.md`  | `.context/PBI/{module-name}/TK-{number}-{brief-title}/`               | Local mirror of ATR               |
| Smoke notes       | `.context/PBI/.../STORY-.../smoke-test.md`                            | Smoke test results                |
| Exploratory notes | `.context/PBI/.../STORY-.../exploratory-notes.md`                     | Session findings                  |
| Evidence          | `.context/PBI/.../STORY-.../evidence/`                                | Screenshots, traces, logs         |

---

## When to Use Each Testing Layer

### UI Testing (`exploratory-test.md`)

- User-facing features
- Form validations visible to user
- Navigation and workflows
- Visual/UX issues

### API Testing (`exploratory-api-test.md`)

- Endpoints without UI yet
- Authentication/authorization logic
- RLS policy verification
- API contracts and error handling
- Backend business logic

### DB Testing (`exploratory-db-test.md`)

- Data created by API/UI operations
- Trigger and constraint verification
- Complex calculations
- Data migrations
- Bulk operations

---

## Recommended Combinations

### Full-Stack Feature (Complete Triforce)

```
1. API Testing → Verify backend works
2. DB Testing → Verify data is correct
3. UI Testing → Verify user experience
```

### Backend-Only Feature

```
1. API Testing → Verify endpoints
2. DB Testing → Verify data integrity
(No UI testing needed)
```

### Data Migration/Report Feature

```
1. DB Testing → Verify data transformation
2. API Testing → Verify reporting endpoints
(UI testing if report has UI)
```

---

## Key Concepts

### Smoke Test vs Exploratory Testing

| Aspect       | Smoke Test         | Exploratory Testing    |
| ------------ | ------------------ | ---------------------- |
| **Duration** | 5-10 minutes       | 60-90 minutes          |
| **Scope**    | Happy path only    | Full coverage          |
| **Goal**     | Go/No-Go decision  | Find bugs, edge cases  |
| **Depth**    | Surface validation | Deep investigation     |

### Bug Severity Guidelines

| Severity     | Criteria                              |
| ------------ | ------------------------------------- |
| **Critical** | Core functionality blocked, data loss |
| **High**     | Major feature broken                  |
| **Medium**   | Feature issue with workaround         |
| **Low**      | Cosmetic, doesn't affect function     |

---

## When to Re-run

| Situation                    | Action                          |
| ---------------------------- | ------------------------------- |
| Smoke test failed            | Wait for fix, re-run smoke      |
| Bug fixed and redeployed     | Re-run affected exploratory     |
| New stories added            | Run smoke + exploratory for new |
| Regression detected          | Full exploratory re-run         |

---

## Output Files Location

```
.context/PBI/epics/
└── EPIC-{KEY}-{NUM}-{name}/
    └── stories/
        └── STORY-{KEY}-{NUM}-{name}/
            ├── smoke-test.md           # Smoke test results
            ├── exploratory-notes.md    # Session findings
            ├── test-report.md          # Local mirror of ATR
            └── evidence/               # Screenshots, traces, logs
```

---

## Next Fase

If exploratory testing **PASSED** (and ATR Complete):

- Proceed to **Fase 11: Test Documentation**
- Document test cases in TMS (Jira/Xray)
- Identify automation candidates (transition TCs to Candidate / Manual)

If **FAILED**:

- Wait for bug fixes
- Re-test failed TCs
- Update ATR after re-test
- Repeat until all pass

---

## Related Documentation

- **QA Workflow:** `.prompts/us-qa-workflow.md`
- **KATA Guidelines:** `.context/guidelines/TAE/`
- **Fase 5 (Shift-Left):** `.prompts/fase-5-shift-left-testing/README.md`
- **Fase 11 (Documentation):** `.prompts/fase-11-test-documentation/README.md`
- **Fase 12 (Automation):** `.prompts/fase-12-test-automation/README.md`
