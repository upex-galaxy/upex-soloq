# Jira Sync Automation

This repository includes an automated Jira sync workflow:

- Workflow file: `.github/workflows/jira-sync-smart.yml`
- Modes:
  - Event-driven (recommended): `repository_dispatch`
  - Manual: `workflow_dispatch`
  - Periodic fallback: every 6 hours (cron)
- Output: automatic PR to `staging` with `.context/PBI/**` changes

## Required GitHub Secrets

Use either ATLASSIAN names or JIRA aliases:

- `ATLASSIAN_URL` (or `JIRA_URL`)
- `ATLASSIAN_EMAIL` (or `JIRA_USERNAME`)
- `ATLASSIAN_API_TOKEN` (or `JIRA_API_TOKEN`)

## Jira Automation (Event-Driven)

Create a Jira Automation rule in project `SQ` (examples):

- Trigger: Issue updated / Comment added / Issue transitioned
- Condition: issue key starts with `SQ-`
- Action: Send web request to GitHub `repository_dispatch`

Endpoint:

```text
POST https://api.github.com/repos/upex-galaxy/upex-soloq/dispatches
```

Headers:

```text
Authorization: Bearer <GITHUB_PAT_WITH_REPO_SCOPE>
Accept: application/vnd.github+json
Content-Type: application/json
```

Body:

```json
{
  "event_type": "jira_issue_changed",
  "client_payload": {
    "issue_key": "{{issue.key}}",
    "issue_type": "{{issue.issueType.name}}"
  }
}
```

## Manual Trigger

From GitHub Actions, run `Jira Sync Smart` and optionally provide:

- `issue_key` (e.g. `SQ-55`)
- `issue_type` (e.g. `Story`, `Epic`)

If `issue_key` is omitted, the workflow runs a full sync.
