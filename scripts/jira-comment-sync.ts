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
  const trimmed = text.trim();
  if (!trimmed) { return []; }

  const nodes: AdfTextNode[] = [];
  let buffer = '';
  let strong = false;
  let code = false;

  const flush = (): void => {
    if (!buffer) { return; }
    const marks: AdfTextMark[] = [];
    if (strong) { marks.push({ type: 'strong' }); }
    if (code) { marks.push({ type: 'code' }); }
    nodes.push({ type: 'text', text: buffer, marks: marks.length ? marks : undefined });
    buffer = '';
  };

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    const next = trimmed[i + 1];

    if (!code && char === '*' && next === '*') {
      flush();
      strong = !strong;
      i++;
      continue;
    }

    if (char === '`') {
      flush();
      code = !code;
      continue;
    }

    buffer += char;
  }

  flush();
  return nodes;
}

function parseMarkdownLines(lines: string[], start = 0, indent = 0): { nodes: AdfBlock[]; nextIndex: number } {
  const nodes: AdfBlock[] = [];
  let i = start;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) {
      i++;
      continue;
    }

    const currentIndent = line.match(/^\s*/)?.[0].length ?? 0;
    if (currentIndent < indent) {
      break;
    }

    const trimmed = line.slice(currentIndent);

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      nodes.push({
        type: 'heading',
        attrs: { level: headingMatch[1].length },
        content: textNodes(headingMatch[2]),
      });
      i++;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      nodes.push({ type: 'rule' });
      i++;
      continue;
    }

    if (/^```/.test(trimmed)) {
      const language = trimmed.slice(3).trim() || undefined;
      i++;
      const codeLines: string[] = [];
      while (i < lines.length) {
        const codeLine = lines[i].replace(/\s+$/, '');
        if (/^```/.test(codeLine.trim())) {
          i++;
          break;
        }
        codeLines.push(codeLine);
        i++;
      }
      nodes.push({ type: 'codeBlock', attrs: language ? { language } : undefined, content: codeLines.length ? [{ type: 'text', text: codeLines.join('\n') }] : [] });
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (i < lines.length) {
        const quoteRaw = lines[i].replace(/\s+$/, '');
        const quoteIndent = quoteRaw.match(/^\s*/)?.[0].length ?? 0;
        const quoteTrimmed = quoteRaw.slice(quoteIndent);
        if (quoteIndent < indent || !/^>\s?/.test(quoteTrimmed)) {
          break;
        }
        quoteLines.push(quoteTrimmed.replace(/^>\s?/, ''));
        i++;
      }
      const quoteParsed = parseMarkdownLines(quoteLines, 0, 0);
      nodes.push({ type: 'blockquote', content: quoteParsed.nodes });
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      const items: Array<{ type: 'listItem'; content: AdfBlock[] }> = [];
      while (i < lines.length) {
        const itemRaw = lines[i].replace(/\s+$/, '');
        const itemIndent = itemRaw.match(/^\s*/)?.[0].length ?? 0;
        const itemTrimmed = itemRaw.slice(itemIndent);
        if (itemIndent < indent || !/^[-*+]\s+/.test(itemTrimmed)) {
          break;
        }

        const text = itemTrimmed.replace(/^[-*+]\s+/, '');
        const itemBlocks: AdfBlock[] = [{ type: 'paragraph', content: textNodes(text) }];
        i++;

        const nested = parseMarkdownLines(lines, i, itemIndent + 2);
        if (nested.nodes.length > 0) {
          itemBlocks.push(...nested.nodes);
          i = nested.nextIndex;
        }

        items.push({ type: 'listItem', content: itemBlocks });
      }
      nodes.push({ type: 'bulletList', content: items });
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      const items: Array<{ type: 'listItem'; content: AdfBlock[] }> = [];
      while (i < lines.length) {
        const itemRaw = lines[i].replace(/\s+$/, '');
        const itemIndent = itemRaw.match(/^\s*/)?.[0].length ?? 0;
        const itemTrimmed = itemRaw.slice(itemIndent);
        if (itemIndent < indent || !/^\d+\.\s+/.test(itemTrimmed)) {
          break;
        }

        const text = itemTrimmed.replace(/^\d+\.\s+/, '');
        const itemBlocks: AdfBlock[] = [{ type: 'paragraph', content: textNodes(text) }];
        i++;

        const nested = parseMarkdownLines(lines, i, itemIndent + 2);
        if (nested.nodes.length > 0) {
          itemBlocks.push(...nested.nodes);
          i = nested.nextIndex;
        }

        items.push({ type: 'listItem', content: itemBlocks });
      }
      nodes.push({ type: 'orderedList', content: items });
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length) {
      const pRaw = lines[i].replace(/\s+$/, '');
      if (!pRaw.trim()) {
        i++;
        break;
      }
      const pIndent = pRaw.match(/^\s*/)?.[0].length ?? 0;
      const pTrimmed = pRaw.slice(pIndent);
      if (
        pIndent < indent
        || /^(#{1,6})\s+/.test(pTrimmed)
        || /^---+$/.test(pTrimmed)
        || /^```/.test(pTrimmed)
        || /^>\s?/.test(pTrimmed)
        || /^[-*+]\s+/.test(pTrimmed)
        || /^\d+\.\s+/.test(pTrimmed)
      ) {
        break;
      }
      paragraph.push(pTrimmed);
      i++;
    }

    if (paragraph.length > 0) {
      nodes.push({ type: 'paragraph', content: textNodes(paragraph.join(' ')) });
      continue;
    }

    i++;
  }

  return { nodes, nextIndex: i };
}

function markdownToAdf(markdown: string): AdfNode {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const parsed = parseMarkdownLines(lines);
  return { type: 'doc', version: 1, content: parsed.nodes };
}

function markdownFallbackToAdf(markdown: string): AdfNode {
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'codeBlock',
        attrs: { language: 'markdown' },
        content: [{ type: 'text', text: markdown.replace(/\r\n/g, '\n') }],
      },
    ],
  };
}

function extractFeatureTestPlanSection(fileContent: string): string {
  const normalized = fileContent.replace(/\r\n/g, '\n');
  const startMatch = normalized.match(/^# Feature Test Plan(?::|-)/m);
  const start = startMatch?.index ?? -1;
  if (start < 0) {
    return '';
  }

  const footerRegex = /\n---\n\n(?:[_*]Synced from Jira by jira-sync[_*]|_Synced from Jira by jira-sync_)\n(?:[_*]Last sync: .*?[_*]\n)?/;
  const footerMatch = normalized.slice(start).match(footerRegex);
  const end = footerMatch ? start + (footerMatch.index ?? 0) : normalized.length;
  return normalized.slice(start, end).trim();
}

function adfContainsText(node: AdfNode | AdfTextNode | string | null | undefined, needle: string): boolean {
  if (!node) { return false; }
  if (typeof node === 'string') {
    return node.toLowerCase().includes(needle.toLowerCase());
  }
  if ('text' in node) {
    return node.text.toLowerCase().includes(needle.toLowerCase());
  }

  if ('content' in node && node.content) {
    return node.content.some(child => adfContainsText(child as AdfNode, needle));
  }

  return false;
}

async function fetchCommentPages(config: { baseUrl: string; auth: string }, issueKey: string): Promise<Array<{ id: string; body: AdfNode | string | null | undefined }>> {
  const comments: Array<{ id: string; body: AdfNode | string | null | undefined }> = [];
  const maxResults = 100;
  let startAt = 0;

  while (true) {
    const response = await fetch(`${config.baseUrl}/rest/api/3/issue/${issueKey}/comment?startAt=${startAt}&maxResults=${maxResults}`, {
      headers: {
        Authorization: `Basic ${config.auth}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch comments for ${issueKey}: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json() as { comments?: Array<{ id: string; body: AdfNode | string | null | undefined }>; total?: number; maxResults?: number; startAt?: number };
    comments.push(...(data.comments || []));

    const nextStartAt = (data.startAt ?? startAt) + (data.maxResults ?? maxResults);
    if (!data.total || comments.length >= data.total || (data.comments || []).length === 0) {
      break;
    }
    startAt = nextStartAt;
  }

  return comments;
}

async function findExistingCommentId(config: { baseUrl: string; auth: string }, issueKey: string, marker: string): Promise<string | null> {
  const comments = await fetchCommentPages(config, issueKey);
  const matching = comments.filter(comment => adfContainsText(comment.body, marker));
  return matching.length > 0 ? matching[matching.length - 1].id : null;
}

async function main(): Promise<void> {
  const fileContent = readFileSync(sourcePath, 'utf8');
  const section = extractFeatureTestPlanSection(fileContent);

  if (!section) {
    throw new Error(`No FTP section found in ${sourcePath}`);
  }

  const body = markdownToAdf(section);
  const fallbackBody = markdownFallbackToAdf(section);
  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
  const marker = 'Feature Test Plan';
  const resolvedCommentId = commentId || await findExistingCommentId({ baseUrl, auth }, issueKey, marker);
  const endpoint = resolvedCommentId
    ? `${baseUrl}/rest/api/3/issue/${issueKey}/comment/${resolvedCommentId}`
    : `${baseUrl}/rest/api/3/issue/${issueKey}/comment`;
  const requestBody = JSON.stringify({ body });
  const response = await fetch(endpoint, {
    method: resolvedCommentId ? 'PUT' : 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 400 && errorText.includes('INVALID_INPUT')) {
      const retryResponse = await fetch(endpoint, {
        method: resolvedCommentId ? 'PUT' : 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: fallbackBody }),
      });

      if (!retryResponse.ok) {
        const retryErrorText = await retryResponse.text();
        throw new Error(`Failed to post comment to ${issueKey}: ${retryResponse.status} ${retryResponse.statusText}\n${retryErrorText}`);
      }

      const retryData = await retryResponse.json() as { id?: string };
      console.log(`${resolvedCommentId ? 'Updated' : 'Posted'} comment ${resolvedCommentId ? resolvedCommentId : ''} to ${issueKey}${retryData.id ? ` (id: ${retryData.id})` : ''}`.trim());
      return;
    }

    throw new Error(`Failed to post comment to ${issueKey}: ${response.status} ${response.statusText}\n${errorText}`);
  }

  const data = await response.json() as { id?: string };
  console.log(`${resolvedCommentId ? 'Updated' : 'Posted'} comment ${resolvedCommentId ? resolvedCommentId : ''} to ${issueKey}${data.id ? ` (id: ${data.id})` : ''}`.trim());
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
