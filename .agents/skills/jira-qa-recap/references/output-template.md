# Output Template - jira-qa-recap

Use this structure for every execution.

## Executive recap

- Scope: `<project>`, assignee `<assignee>`, base `<base>`
- MCP health: `ATLASSIAN=<UP/DOWN>`, `GITHUB=<UP/DOWN>`, `GIT=<UP/DOWN>`
- Jira status counts: `QA Approved=<n>`, `In Test=<n>`, `BLOCKED=<n>`, `Ready For QA=<n>`, `Open=<n>`
- Decision counts: `RETEST_READY=<n>`, `WAIT_DEV=<n>`, `ACTION_REQUIRED=<n>`

## Ticket matrix

| Key    | Jira status  | Last comment (author/time) | Repo signal     | Decision     | Next action          |
| ------ | ------------ | -------------------------- | --------------- | ------------ | -------------------- |
| SQ-123 | Ready For QA | Ely / 2026-05-05 10:40     | FIX_SIGNAL_HIGH | RETEST_READY | Run retest TC bundle |

## Retest queue (ordered)

1. `<SQ-KEY>` - why first
2. `<SQ-KEY>` - why second

## Silent-reply watch list

- `<SQ-KEY>` - new comment by `<author>` after QA comment, no QA acknowledgment yet.

## Notes / limitations

- Explain degraded mode if any dependency failed.
- Flag uncertain matches (`FIX_SIGNAL_MEDIUM`) for manual QA confirmation.
