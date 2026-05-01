#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function getExecutions(report) {
  if (Array.isArray(report?.run?.executions)) return report.run.executions;
  if (Array.isArray(report?.executions)) return report.executions;
  return [];
}

function statusFromExecution(execution) {
  const assertions = execution?.assertions || [];
  if (assertions.length === 0) return 'unknown';
  const hasFail = assertions.some(a => !!a.error);
  return hasFail ? 'fail' : 'pass';
}

function inferStoryLabel(name) {
  const upper = (name || '').toUpperCase();
  if (upper.includes('SQ-48')) return 'SQ-48';
  if (upper.includes('SQ-50')) return 'SQ-50';
  if (upper.includes('SQ-51')) return 'SQ-51';
  if (upper.includes('SQ-52')) return 'SQ-52';
  return 'OTHER';
}

function collect(report) {
  const executions = getExecutions(report);
  const byStory = new Map();

  for (const execution of executions) {
    const itemName = execution?.item?.name || 'Unnamed request';
    const folderName = execution?.item?.parent?.name || execution?.cursor?.ref || '';
    const story = inferStoryLabel(folderName || itemName);
    const status = statusFromExecution(execution);

    if (!byStory.has(story)) {
      byStory.set(story, { pass: 0, fail: 0, unknown: 0, requests: [] });
    }

    const bucket = byStory.get(story);
    bucket[status] += 1;
    bucket.requests.push({ name: itemName, status });
  }

  return byStory;
}

function printSummary(byStory, sourceFile) {
  console.log(`Postman run summary: ${path.basename(sourceFile)}`);
  for (const [story, data] of byStory.entries()) {
    const overall = data.fail > 0 ? 'FAIL' : data.pass > 0 ? 'PASS' : 'UNKNOWN';
    console.log(`\n${story}: ${overall} (pass=${data.pass}, fail=${data.fail}, unknown=${data.unknown})`);
    for (const req of data.requests) {
      const marker = req.status === 'pass' ? 'PASS' : req.status === 'fail' ? 'FAIL' : 'UNKN';
      console.log(`- [${marker}] ${req.name}`);
    }
  }
}

function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node qa/api/postman-run-summary.mjs <postman-run-report.json>');
    process.exit(1);
  }

  const report = readJson(input);
  const byStory = collect(report);
  if (byStory.size === 0) {
    console.error('No executions found in report.');
    process.exit(2);
  }

  printSummary(byStory, input);
}

main();
