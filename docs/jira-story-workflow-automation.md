# Jira Story Workflow Automation (SQ)

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

## Suggested Jira Automation Rules

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
