# Workflow - jira-qa-recap

## Goal

Generate a QA operational recap that cross-checks Jira Live activity with repository evidence to decide whether each ticket is ready for retest.

## Inputs

- `project` (default `SQ`)
- `assignee` (default `Fernando Javier Masci`)
- `base` (default `origin/staging`)
- Optional `jql` override

## Execution steps

1. Run Stage 0 health checks.
2. Build Jira scope:

- Default JQL recommendation:
  - `project = SQ AND assignee = "Fernando Javier Masci" AND issuetype in (Story, Bug) ORDER BY updated DESC`
- Pull issue metadata and recent comments.

3. Build repo scope:

- Fetch remotes.
- List commits ahead of `origin/staging`.
- Match issue keys from commit messages and PR titles when available.

4. Detect silent replies:

- Find latest QA-authored comment timestamp.
- Check if newer non-QA comments exist.

5. Infer fix signal per issue (high/medium/low).
6. Compute final decision using precedence rules.
7. Emit standardized output template.

## Heuristics for QA author matching

Treat as QA identity by default:

- `Fernando Javier Masci`
- `elcuis@gmail.com`

If identity cannot be resolved, mark silent-reply detection as partial.

## Failure handling

- If Atlassian fails: alert user to turn it on or output repo-only recap with explicit warning.
- If GitHub fails but git works: use local git evidence only.
- If both fail: output diagnostic checklist and stop before decision matrix.

## Practical notes

- Prefer direct issue-key matching (`SQ-123`) over fuzzy title matching.
- Avoid changing Jira state in this skill; this is read/analysis only.
- Keep output concise and action-oriented for QA daily handoff.
