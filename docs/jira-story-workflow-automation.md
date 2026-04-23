# Jira Story Workflow (SQ)

> Note: this document is split in two scopes:
>
> 1. what any QA contributor can do with existing permissions,
> 2. optional automation proposals that require Jira Admin/Board Owner permissions.

## Live Workflow Discovery (Story)

From Jira API (`project/SQ/statuses`), Story statuses currently include:

- `Backlog`
- `Estimation`
- `Ready For Dev`
- `In Progress`
- `In Review`
- `Shift-Left QA`
- `Ready For QA`
- `In Test`
- `BLOCKED`
- `QA Approved`
- `Ready For Release`
- `Deployed to Production`
- `ABORTED`

## Verified Transition Paths (current user permissions)

- From `Ready For QA`:
  - `In Test` (transition id observed: `9`)
- From `In Test`:
  - `QA Approved` (id `10`)
  - `Ready For QA` (id `12`)
  - `BLOCKED` (id `13`)

Notes:

- Transition IDs may vary by workflow/project config, so transition by status name is safer.
- Some statuses may expose no transitions depending on permissions or workflow guards.

## Current Applied Statuses

- `SQ-51`: transitioned to `In Test` (active QA execution).
- `SQ-55`: transitioned to `In Test` then `BLOCKED` (precondition unresolved in staging).

## Automation With Existing Workflow

This repo now includes `jira-transition` helper:

```bash
bun jira-transition --issue SQ-51 --to "In Test"
bun jira-transition --issue SQ-51 --to "QA Approved"
bun jira-transition --issue SQ-55 --to "BLOCKED"
```

Dry run:

```bash
bun jira-transition --issue SQ-51 --to "In Test" --dry-run
```

## Recommended State Policy

- `Ready For QA` -> `In Test` when smoke starts.
- `In Test` -> `BLOCKED` when a hard precondition/environment blocker is confirmed.
- `In Test` -> `QA Approved` when smoke + exploratory pass and no blocking defects remain.
- `In Test` -> `Ready For QA` when retest is required after fix.

## Optional Jira Automation Rules (Admin/Board Owner)

1. **QA Start Rule**
   - Trigger: label `qa-in-progress` added
   - Condition: status = `Ready For QA`
   - Action: transition to `In Test`

2. **QA Block Rule**
   - Trigger: label `qa-blocked` added
   - Condition: status = `In Test`
   - Action: transition to `BLOCKED`

3. **QA Approve Rule**
   - Trigger: label `qa-approved` added
   - Condition: status = `In Test`
   - Action: transition to `QA Approved`

4. **Retest Rule**
   - Trigger: linked bug transitions to done + label `ready-for-retest`
   - Condition: status in (`BLOCKED`, `In Test`)
   - Action: transition to `Ready For QA`

---

## Exact Rules (copy-ready, Admin/Board Owner only)

These 3 rules use existing Story statuses (`Ready For QA`, `In Test`, `BLOCKED`, `QA Approved`) and are intended for a Jira Admin/Board Owner to configure.

### Rule 1 - Start QA (label -> In Test)

**Rule name:** `Story QA Start - label qa-in-progress`

1. **Trigger:** `Issue updated`
2. **Conditions (ALL):**
   - `Issue fields condition`:
     - `Issue Type` = `Story`
   - `Issue fields condition`:
     - `Status` = `Ready For QA`
   - `Advanced compare condition`:
     - First value: `{{issue.labels.contains("qa-in-progress")}}`
     - Condition: `equals`
     - Second value: `true`
3. **Action:** `Transition issue`
   - Destination status: `In Test`
4. **Action:** `Add comment`
   - Text:
     - `Auto-transition: label qa-in-progress detected. Story moved to In Test.`

### Rule 2 - Block QA (label -> BLOCKED)

**Rule name:** `Story QA Block - label qa-blocked`

1. **Trigger:** `Issue updated`
2. **Conditions (ALL):**
   - `Issue fields condition`:
     - `Issue Type` = `Story`
   - `Issue fields condition`:
     - `Status` = `In Test`
   - `Advanced compare condition`:
     - First value: `{{issue.labels.contains("qa-blocked")}}`
     - Condition: `equals`
     - Second value: `true`
3. **Action:** `Transition issue`
   - Destination status: `BLOCKED`
4. **Action:** `Add comment`
   - Text:
     - `Auto-transition: label qa-blocked detected. Story moved to BLOCKED.`

### Rule 3 - Approve QA (label -> QA Approved)

**Rule name:** `Story QA Approve - label qa-approved`

1. **Trigger:** `Issue updated`
2. **Conditions (ALL):**
   - `Issue fields condition`:
     - `Issue Type` = `Story`
   - `Issue fields condition`:
     - `Status` = `In Test`
   - `Advanced compare condition`:
     - First value: `{{issue.labels.contains("qa-approved")}}`
     - Condition: `equals`
     - Second value: `true`
3. **Action:** `Transition issue`
   - Destination status: `QA Approved`
4. **Action:** `Add comment`
   - Text:
     - `Auto-transition: label qa-approved detected. Story moved to QA Approved.`

---

## Safety Recommendations

- Add one extra condition to each rule to avoid loops:
  - `Advanced compare`: `{{initiator.displayName}}` `does not contain` `Automation for Jira`
- Keep labels as workflow intents only:
  - `qa-in-progress`, `qa-blocked`, `qa-approved`
- If a label is removed, do not auto-revert status (avoid accidental rollbacks).

---

## If You Are Not Jira Admin

- Use direct status transitions with existing workflow (manual or helper script).
- Escalate automation setup to TL/Board Owner using the exact rules above.
- Keep QA execution unblocked with current transitions:
  - `Ready For QA` -> `In Test`
  - `In Test` -> `BLOCKED` / `QA Approved` / `Ready For QA`
