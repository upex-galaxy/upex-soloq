#!/usr/bin/env bun

import { readFileSync } from 'node:fs';

type ADFText = { type: 'text'; text: string; marks?: Array<{ type: 'strong' | 'em' | 'code' }> };
type ADFNode = any;

const issueKey = process.argv[2];
const sourcePath = process.argv[3];

if (!issueKey || !sourcePath) {
  console.error('Usage: bun scripts/jira-comment-sync.ts <ISSUE_KEY> <markdown-file>');
  process.exit(1);
}

const baseUrl = (process.env.ATLASSIAN_URL || process.env.JIRA_URL || '').replace(/\/$/, '');
const email = process.env.ATLASSIAN_EMAIL || process.env.JIRA_USERNAME || process.env.JIRA_EMAIL;
const apiToken = process.env.ATLASSIAN_API_TOKEN || process.env.JIRA_API_TOKEN;

if (!baseUrl || !email || !apiToken) {
  console.error('Missing Jira env vars. Need ATLASSIAN_URL/JIRA_URL, ATLASSIAN_EMAIL/JIRA_USERNAME, ATLASSIAN_API_TOKEN/JIRA_API_TOKEN.');
  process.exit(1);
}

function textNodes(text: string): ADFText[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const nodes: ADFText[] = [];
  let buffer = '';
  let strong = false;
  let code = false;

  const flush = () => {
    if (!buffer) return;
    const marks = [] as Array<{ type: 'strong' | 'em' | 'code' }>;
    if (strong) marks.push({ type: 'strong' });
    if (code) marks.push({ type: 'code' });
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

function splitTableRow(row: string): string[] {
  return row.replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());
}

function isTableSeparator(row: string): boolean {
  return /^\s*\|?\s*:?[-]+:?(\s*\|\s*:?[-]+:?)+\s*\|?\s*$/.test(row.trim());
}

function parseLines(lines: string[], start = 0, indent = 0): { nodes: ADFNode[]; nextIndex: number } {
  const nodes: ADFNode[] = [];
  let i = start;

  while (i < lines.length) {
    const raw = lines[i].replace(/\s+$/, '');
    if (!raw.trim()) {
      i++;
      continue;
    }

    const currentIndent = raw.match(/^\s*/)?.[0].length ?? 0;
    if (currentIndent < indent) break;

    const line = raw.slice(currentIndent);

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      nodes.push({ type: 'heading', attrs: { level: heading[1].length }, content: textNodes(heading[2]) });
      i++;
      continue;
    }

    if (/^---+$/.test(line)) {
      nodes.push({ type: 'rule' });
      i++;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.slice(3).trim() || undefined;
      i++;
      const codeLines: string[] = [];
      while (i < lines.length) {
        const c = lines[i].replace(/\s+$/, '');
        if (/^```/.test(c.trim())) {
          i++;
          break;
        }
        codeLines.push(c);
        i++;
      }
      nodes.push({ type: 'codeBlock', attrs: language ? { language } : undefined, content: [{ type: 'text', text: codeLines.join('\n') }] });
      continue;
    }

    if (line.includes('|')) {
      const rows: string[] = [];
      let cursor = i;
      while (cursor < lines.length) {
        const rowRaw = lines[cursor].replace(/\s+$/, '');
        const rowIndent = rowRaw.match(/^\s*/)?.[0].length ?? 0;
        const rowLine = rowRaw.slice(rowIndent);
        if (rowIndent < indent || !rowLine.includes('|')) break;
        rows.push(rowLine);
        cursor++;
      }
      if (rows.length >= 2 && isTableSeparator(rows[1])) {
        const headers = splitTableRow(rows[0]);
        const bodyRows = rows.slice(2).map(splitTableRow);
        nodes.push({
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: headers.map((cell) => ({ type: 'tableHeader', content: [{ type: 'paragraph', content: textNodes(cell) }] })),
            },
            ...bodyRows.map((row) => ({
              type: 'tableRow',
              content: row.map((cell) => ({ type: 'tableCell', content: [{ type: 'paragraph', content: textNodes(cell) }] })),
            })),
          ],
        });
        i = cursor;
        continue;
      }
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length) {
        const qRaw = lines[i].replace(/\s+$/, '');
        const qIndent = qRaw.match(/^\s*/)?.[0].length ?? 0;
        const qLine = qRaw.slice(qIndent);
        if (qIndent < indent || !/^>\s?/.test(qLine)) break;
        quoteLines.push(qLine.replace(/^>\s?/, ''));
        i++;
      }
      const quote = parseLines(quoteLines, 0, 0);
      nodes.push({ type: 'blockquote', content: quote.nodes });
      continue;
    }

    const unordered = line.match(/^[-*+]\s+(.*)$/);
    if (unordered) {
      const items: ADFNode[] = [];
      while (i < lines.length) {
        const itemRaw = lines[i].replace(/\s+$/, '');
        const itemIndent = itemRaw.match(/^\s*/)?.[0].length ?? 0;
        const itemLine = itemRaw.slice(itemIndent);
        if (itemIndent < indent || !/^[-*+]\s+/.test(itemLine)) break;
        const text = itemLine.replace(/^[-*+]\s+/, '');
        const blocks: ADFNode[] = [{ type: 'paragraph', content: textNodes(text) }];
        i++;
        const nested = parseLines(lines, i, itemIndent + 2);
        if (nested.nodes.length > 0) {
          blocks.push(...nested.nodes);
          i = nested.nextIndex;
        }
        items.push({ type: 'listItem', content: blocks });
      }
      nodes.push({ type: 'bulletList', content: items });
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      const items: ADFNode[] = [];
      while (i < lines.length) {
        const itemRaw = lines[i].replace(/\s+$/, '');
        const itemIndent = itemRaw.match(/^\s*/)?.[0].length ?? 0;
        const itemLine = itemRaw.slice(itemIndent);
        if (itemIndent < indent || !/^\d+\.\s+/.test(itemLine)) break;
        const text = itemLine.replace(/^\d+\.\s+/, '');
        const blocks: ADFNode[] = [{ type: 'paragraph', content: textNodes(text) }];
        i++;
        const nested = parseLines(lines, i, itemIndent + 2);
        if (nested.nodes.length > 0) {
          blocks.push(...nested.nodes);
          i = nested.nextIndex;
        }
        items.push({ type: 'listItem', content: blocks });
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
      const pLine = pRaw.slice(pIndent);
      if (pIndent < indent || /^(#{1,6})\s+/.test(pLine) || /^---+$/.test(pLine) || /^```/.test(pLine) || /^>\s?/.test(pLine) || /^[-*+]\s+/.test(pLine) || /^\d+\.\s+/.test(pLine) || pLine.includes('|')) break;
      paragraph.push(pLine);
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

function extractFeatureTestPlanSection(content: string): string {
  const normalized = content.replace(/\r\n/g, '\n');
  const start = normalized.search(/^# Feature Test Plan/m);
  if (start < 0) return '';
  const tail = normalized.slice(start);
  const footer = tail.search(/\n---\n\n(?:[_*]Synced from Jira by jira-sync[_*]|_Synced from Jira by jira-sync_)/);
  return (footer >= 0 ? tail.slice(0, footer) : tail).trim();
}

function findExistingCommentId(comments: Array<{ id: string; body: any }>): string | null {
  const matches = comments.filter(c => JSON.stringify(c.body || '').includes('Feature Test Plan'));
  return matches.length ? matches[matches.length - 1].id : null;
}

async function fetchComments(issue: string, auth: string): Promise<Array<{ id: string; body: any }>> {
  const res = await fetch(`${baseUrl}/rest/api/3/issue/${issue}/comment?maxResults=100`, { headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' } });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json() as { comments: Array<{ id: string; body: any }>; total: number };
  return data.comments || [];
}

async function main(): Promise<void> {
  const source = readFileSync(sourcePath, 'utf8');
  const section = extractFeatureTestPlanSection(source);
  if (!section) throw new Error(`No FTP section found in ${sourcePath}`);

  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
  const existing = await fetchComments(issueKey, auth);
  const commentId = findExistingCommentId(existing);
  const body: ADFNode = { type: 'doc', version: 1, content: parseLines(section.replace(/^# Feature Test Plan.*$/m, '').trim().split('\n')).nodes };

  const endpoint = commentId ? `${baseUrl}/rest/api/3/issue/${issueKey}/comment/${commentId}` : `${baseUrl}/rest/api/3/issue/${issueKey}/comment`;
  const method = commentId ? 'PUT' : 'POST';

  let response = await fetch(endpoint, {
    method,
    headers: { Authorization: `Basic ${auth}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });

  if (!response.ok) {
    const error = await response.text();
    const fallback: ADFNode = { type: 'doc', version: 1, content: [{ type: 'codeBlock', attrs: { language: 'markdown' }, content: [{ type: 'text', text: section }] }] };
    response = await fetch(endpoint, {
      method,
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: fallback }),
    });
    if (!response.ok) throw new Error(`${error}\n${await response.text()}`);
  }

  const data = await response.json() as { id?: string };
  console.log(`${commentId ? 'Updated' : 'Posted'} comment ${commentId || ''} to ${issueKey}${data.id ? ` (id: ${data.id})` : ''}`.trim());
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
