#!/usr/bin/env bun

interface Args {
  issueKey: string
  toStatus: string
  dryRun: boolean
}

interface JiraTransition {
  id: string
  name: string
  to: {
    name: string
  }
}

interface JiraTransitionsResponse {
  transitions: JiraTransition[]
}

function parseArgs(argv: string[]): Args {
  let issueKey = '';
  let toStatus = '';
  let dryRun = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--issue') {
      issueKey = argv[i + 1] || '';
      i++;
      continue;
    }
    if (arg === '--to') {
      toStatus = argv[i + 1] || '';
      i++;
      continue;
    }
    if (arg === '--dry-run') {
      dryRun = true;
    }
  }

  if (!issueKey || !toStatus) {
    throw new Error('Usage: bun jira-transition --issue SQ-51 --to "In Test" [--dry-run]');
  }

  return { issueKey, toStatus, dryRun };
}

function getConfig() {
  const baseUrl = process.env.ATLASSIAN_URL || process.env.JIRA_URL;
  const email = process.env.ATLASSIAN_EMAIL || process.env.JIRA_USERNAME || process.env.JIRA_EMAIL;
  const apiToken = process.env.ATLASSIAN_API_TOKEN || process.env.JIRA_API_TOKEN;

  if (!baseUrl || !email || !apiToken) {
    throw new Error('Missing Jira env vars. Required: ATLASSIAN_URL/JIRA_URL, ATLASSIAN_EMAIL/JIRA_USERNAME, ATLASSIAN_API_TOKEN/JIRA_API_TOKEN');
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    authHeader: `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
  };
}

async function jiraGet<T>(baseUrl: string, authHeader: string, path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status} ${response.statusText} - ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

async function jiraPost(baseUrl: string, authHeader: string, path: string, body: unknown): Promise<void> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`POST ${path} failed: ${response.status} ${response.statusText} - ${await response.text()}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { baseUrl, authHeader } = getConfig();

  const transitions = await jiraGet<JiraTransitionsResponse>(
    baseUrl,
    authHeader,
    `/rest/api/3/issue/${args.issueKey}/transitions`,
  );

  const target = transitions.transitions.find(
    t => t.to.name.toLowerCase() === args.toStatus.toLowerCase(),
  );

  if (!target) {
    const available = transitions.transitions.map(t => t.to.name).join(', ') || '(none)';
    throw new Error(`Transition to "${args.toStatus}" is not available for ${args.issueKey}. Available: ${available}`);
  }

  if (args.dryRun) {
    console.log(`[dry-run] ${args.issueKey}: ${target.id} -> ${target.to.name}`);
    return;
  }

  await jiraPost(baseUrl, authHeader, `/rest/api/3/issue/${args.issueKey}/transitions`, {
    transition: { id: target.id },
  });

  console.log(`${args.issueKey} transitioned to ${target.to.name} (id ${target.id})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
