#!/usr/bin/env bun

import { readFileSync } from 'node:fs';

type AdfTextMark = { type: 'strong' | 'em' | 'code' };

type AdfTextNode = {
  type: 'text';
  text: string;
  marks?: AdfTextMark[];
};

type AdfNode =
  | { type: 'doc'; version: 1; content: AdfBlock[] }
  | AdfBlock;

type AdfBlock =
  | { type: 'paragraph'; content?: AdfTextNode[] }
  | { type: 'heading'; attrs: { level: number }; content?: AdfTextNode[] }
  | { type: 'bulletList'; content: Array<{ type: 'listItem'; content: AdfBlock[] }> }
  | { type: 'orderedList'; content: Array<{ type: 'listItem'; content: AdfBlock[] }> }
  | { type: 'blockquote'; content?: AdfBlock[] }
  | { type: 'rule' }
  | { type: 'codeBlock'; attrs?: { language?: string }; content?: AdfTextNode[] };

const issueKey = process.argv[2];
const sourcePath = process.argv[3];
const commentId = process.argv[4];

if (!issueKey || !sourcePath) {
  console.error('Usage: bun scripts/jira-comment-sync.ts <ISSUE_KEY> <markdown-file> [comment-id]');
  process.exit(1);
}

const baseUrl = (process.env.ATLASSIAN_URL || process.env.JIRA_URL || '').replace(/\/$/, '');
const email = process.env.ATLASSIAN_EMAIL || process.env.JIRA_USERNAME || process.env.JIRA_EMAIL;
const apiToken = process.env.ATLASSIAN_API_TOKEN || process.env.JIRA_API_TOKEN;

if (!baseUrl || !email || !apiToken) {
  console.error('Missing Jira env vars. Need ATLASSIAN_URL/JIRA_URL, ATLASSIAN_EMAIL/JIRA_USERNAME, ATLASSIAN_API_TOKEN/JIRA_API_TOKEN.');
  process.exit(1);
}

function textNodes(text: string): AdfTextNode[] {
  return text.trim().length ? [{ type: 'text', text }] : [];
}

function markdownToAdf(markdown: string): AdfNode {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const content: AdfBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      content.push({
        type: 'heading',
        attrs: { level: headingMatch[1].length },
        content: textNodes(headingMatch[2]),
      });
      i++;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      content.push({ type: 'rule' });
      i++;
      continue;
    }

    const bulletMatch = line.match(/^\s*[-*+]\s+(.*)$/);
    if (bulletMatch) {
      const items: Array<{ type: 'listItem'; content: AdfBlock[] }> = [];

      while (i < lines.length) {
        const current = lines[i];
        const currentMatch = current.match(/^(\s*)[-*+]\s+(.*)$/);
        if (!currentMatch) { break; }

        const [, indent, text] = currentMatch;
        if (indent.length > 0) {
          break;
        }

        items.push({
          type: 'listItem',
          content: [{ type: 'paragraph', content: textNodes(text) }],
        });
        i++;
      }

      if (items.length > 0) {
        content.push({ type: 'bulletList', content: items });
        continue;
      }
    }

    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const current = lines[i];
      const isBoundary = !current.trim()
        || /^(#{1,6})\s+/.test(current)
        || /^---+$/.test(current.trim())
        || /^\s*[-*+]\s+/.test(current);
      if (isBoundary) { break; }
      paragraphLines.push(current.trim());
      i++;
    }

    if (paragraphLines.length > 0) {
      content.push({ type: 'paragraph', content: textNodes(paragraphLines.join(' ')) });
      continue;
    }

    i++;
  }

  return { type: 'doc', version: 1, content };
}

function extractFeatureTestPlanSection(fileContent: string): string {
  const normalized = fileContent.replace(/\r\n/g, '\n');
  const dashStart = normalized.indexOf('# Feature Test Plan - ');
  const colonStart = normalized.indexOf('# Feature Test Plan: ');
  const start = dashStart >= 0 && colonStart >= 0
    ? Math.min(dashStart, colonStart)
    : Math.max(dashStart, colonStart);
  if (start < 0) {
    return '';
  }

  const footerMarker = normalized.indexOf('\n---\n\n_Synced from Jira by jira-sync_', start);
  const end = footerMarker >= 0 ? footerMarker : normalized.length;
  return normalized.slice(start, end).trim();
}

async function main(): Promise<void> {
  const fileContent = readFileSync(sourcePath, 'utf8');
  const section = extractFeatureTestPlanSection(fileContent);

  if (!section) {
    throw new Error(`No FTP section found in ${sourcePath}`);
  }

  const body = markdownToAdf(section);
  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
  const endpoint = commentId
    ? `${baseUrl}/rest/api/3/issue/${issueKey}/comment/${commentId}`
    : `${baseUrl}/rest/api/3/issue/${issueKey}/comment`;
  const response = await fetch(endpoint, {
    method: commentId ? 'PUT' : 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to post comment to ${issueKey}: ${response.status} ${response.statusText}\n${errorText}`);
  }

  const data = await response.json() as { id?: string };
  console.log(`${commentId ? 'Updated' : 'Posted'} comment ${commentId ? commentId : ''} to ${issueKey}${data.id ? ` (id: ${data.id})` : ''}`.trim());
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
