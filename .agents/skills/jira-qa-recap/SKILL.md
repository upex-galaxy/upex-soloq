---

## name: jira-qa-recap
description: 'Creates a QA recap by contrasting Jira Live status/comments with repository signals from origin/staging. Default scope is assignee Fernando Javier Masci. Detects silent replies (responses without @mentions), identifies likely fix signals in commits/PRs, and outputs retest-ready decisions. Includes MCP health checks for Atlassian and GitHub before execution.'
license: MIT
compatibility: [claude-code, copilot, cursor, codex, opencode]

# Jira QA Recap - Live vs Repo Contrast

Produce a repeatable QA recap that answers three questions per ticket:

1. What changed in Jira Live (status, comments, ownership)?
2. What changed in the repository since `origin/staging` (commits, PR references, branch activity)?
3. Does QA have enough signal to retest now?

---

## Default scope

- **Assignee default:** `Fernando Javier Masci`
- **Project default:** `SQ`
- **Base branch for contrast:** `origin/staging`

Allow optional override only when explicitly requested by the user:

- `assignee=<display-name>`
- `jql=<custom-jql>`
- `base=<remote-branch>`

---

## Stage 0 - MCP and tool health checks (mandatory)

Before reading data, verify required integrations and report readiness:

1. **Atlassian MCP check**

- Run a minimal Jira query for `project = SQ`.
- If unavailable, mark `ATLASSIAN=DOWN` and alert user to turn it on or continue with repo-only evidence.

2. **GitHub access check**

- Verify GitHub CLI auth and repo visibility.
- If unavailable, mark `GITHUB=DOWN` and alert user to turn it on or continue with local git-only evidence.

3. **Git baseline check**

- Confirm `origin/staging` exists locally.
- Fetch latest remotes when possible.

If any dependency is down, alert user to turn it on or continue in degraded mode and state limitations in output.

---

## Stage 1 - Jira Live snapshot

Collect Jira issues in scope (Stories + Bugs by default):

- Keys, summary, status, assignee, updated.
- Latest comments with timestamps and authors.
- Existing QA-thread context (last QA comment if present).

### Silent reply detection

For each ticket, detect if another user replied after the last QA comment without mentioning QA.

Mark as:

- `NEW_COMMENT_NO_QA_ACK` when there is a newer non-QA comment and no QA follow-up.

---

## Stage 2 - Repo contrast snapshot

Contrast branch/repo signals against `origin/staging`:

- Commits ahead of base mentioning `SQ-<id>`.
- Changed files linked to feature/story/bug scope.
- Open/updated PR signals when available.

Per ticket, infer fix signal level:

- `FIX_SIGNAL_HIGH` - direct issue key in commit/PR plus relevant file changes.
- `FIX_SIGNAL_MEDIUM` - likely related code changes but weak issue-key traceability.
- `FIX_SIGNAL_LOW` - no clear repo movement tied to the ticket.

---

## Stage 3 - Decision matrix

Assign one decision per ticket:

- `FIX_DETECTED -> RETEST_READY`
- `NO_FIX_SIGNAL -> WAIT_DEV`
- `NEW_COMMENT_NO_QA_ACK -> ACTION_REQUIRED`

Decision precedence:

1. `ACTION_REQUIRED` if silent-reply condition is present.
2. `RETEST_READY` if fix signal is high and Jira status is QA-eligible (`Ready For QA`, `In Test`, `BLOCKED` after fix comment).
3. `WAIT_DEV` otherwise.

---

## Output contract

Always return:

1. **Executive recap** (counts by status + counts by decision).
2. **Ticket table** with:

- key
- Jira status
- last comment author/time
- repo signal
- decision
- recommended next action

3. **Retest queue** ordered by priority (`RETEST_READY` first).
4. **Watch list** for silent replies.
5. **Degraded mode notes** if MCP/tool checks failed.

Use the formatting contract in `references/output-template.md`.

---

## References

- `references/workflow.md`
- `references/output-template.md`
