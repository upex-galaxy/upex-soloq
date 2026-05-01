#!/usr/bin/env bun

type JiraComment = {
  id: string;
  body?: unknown;
  author?: {
    displayName?: string;
    emailAddress?: string;
    accountId?: string;
    name?: string;
  };
  updated?: string;
  created?: string;
};

type JiraCommentsResponse = {
  comments?: JiraComment[];
};

function getArgValue(args: string[], flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1) return null;
  const value = args[idx + 1];
  if (!value || value.startsWith("--")) return null;
  return value;
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function toAdfText(text: string): object {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const content = lines.map(line => ({
    type: "paragraph",
    content: line.length > 0 ? [{ type: "text", text: line }] : [],
  }));

  return {
    type: "doc",
    version: 1,
    content,
  };
}

async function jiraRequest<T>(
  url: string,
  init: RequestInit,
  authHeader: string,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader,
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Jira API ${response.status} ${response.statusText}: ${body}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

function pickLatestOwnComment(comments: JiraComment[], jiraUser: string): JiraComment | null {
  const normalized = jiraUser.trim().toLowerCase();

  const own = comments.filter(comment => {
    const author = comment.author;
    if (!author) return false;

    const candidates = [
      author.emailAddress,
      author.name,
      author.displayName,
      author.accountId,
    ]
      .filter(Boolean)
      .map(v => String(v).trim().toLowerCase());

    return candidates.includes(normalized);
  });

  if (own.length === 0) return null;

  own.sort((a, b) => {
    const aDate = new Date(a.updated || a.created || 0).getTime();
    const bDate = new Date(b.updated || b.created || 0).getTime();
    return bDate - aDate;
  });

  return own[0] || null;
}

async function main() {
  const args = process.argv.slice(2);
  const issueKey = args[0];

  if (!issueKey || issueKey.startsWith("--")) {
    throw new Error(
      "Usage: bun scripts/jira-comment-upsert.ts <ISSUE_KEY> (--body <text> | --file <path>) [--create-only]",
    );
  }

  const bodyArg = getArgValue(args, "--body");
  const fileArg = getArgValue(args, "--file");
  const createOnly = hasFlag(args, "--create-only");

  if (!bodyArg && !fileArg) {
    throw new Error("Provide --body or --file");
  }

  let bodyText = bodyArg || "";
  if (fileArg) {
    bodyText = await Bun.file(fileArg).text();
  }

  if (!bodyText.trim()) {
    throw new Error("Comment body is empty");
  }

  const jiraUrl = requireEnv("JIRA_URL").replace(/\/$/, "");
  const jiraUser = requireEnv("JIRA_USERNAME");
  const jiraToken = requireEnv("JIRA_API_TOKEN");
  const authHeader = `Basic ${Buffer.from(`${jiraUser}:${jiraToken}`).toString("base64")}`;

  const commentsUrl = `${jiraUrl}/rest/api/3/issue/${issueKey}/comment?maxResults=100`;

  const list = await jiraRequest<JiraCommentsResponse>(
    commentsUrl,
    { method: "GET" },
    authHeader,
  );

  const comments = list.comments || [];
  const ownLatest = createOnly ? null : pickLatestOwnComment(comments, jiraUser);
  const adf = toAdfText(bodyText);

  if (ownLatest) {
    const updateUrl = `${jiraUrl}/rest/api/3/issue/${issueKey}/comment/${ownLatest.id}`;
    await jiraRequest(updateUrl, {
      method: "PUT",
      body: JSON.stringify({ body: adf }),
    }, authHeader);
    console.log(`Updated comment ${ownLatest.id} on ${issueKey}`);
    return;
  }

  const created = await jiraRequest<{ id: string }>(
    `${jiraUrl}/rest/api/3/issue/${issueKey}/comment`,
    {
      method: "POST",
      body: JSON.stringify({ body: adf }),
    },
    authHeader,
  );

  console.log(`Created comment ${created.id} on ${issueKey}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
