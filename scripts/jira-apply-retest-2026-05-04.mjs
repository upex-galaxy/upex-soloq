const base = process.env.ATLASSIAN_URL;
const email = process.env.ATLASSIAN_EMAIL;
const token = process.env.ATLASSIAN_API_TOKEN;

if (!base || !email || !token) {
  console.error('Missing ATLASSIAN_URL, ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN');
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
const elyAccountId = '61179bdd01072b0069c94a26';

async function addComment(issue, text) {
  const body = {
    body: {
      type: 'doc',
      version: 1,
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    },
  };

  const res = await fetch(`${base}/rest/api/3/issue/${issue}/comment`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  console.log(issue, 'comment', res.status);
  if (!res.ok) {
    console.log(await res.text());
  }
}

async function transition(issue, transitionId) {
  const res = await fetch(`${base}/rest/api/3/issue/${issue}/transitions`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transition: { id: transitionId } }),
  });

  console.log(issue, 'transition', transitionId, res.status);
  if (!res.ok) {
    console.log(await res.text());
  }
}

async function assign(issue, accountId) {
  const res = await fetch(`${base}/rest/api/3/issue/${issue}/assignee`, {
    method: 'PUT',
    headers: {
      Authorization: auth,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accountId }),
  });

  console.log(issue, 'assign', res.status);
  if (!res.ok) {
    console.log(await res.text());
  }
}

await addComment(
  'SQ-169',
  'Retest result (2026-05-04): FAIL. On /invoices, the UI still shows mixed state ("0 facturas encontradas" together with "No tienes facturas aún") under no-results conditions, indicating the empty-state differentiation is not consistently resolved. Re-opening for development review.'
);
await transition('SQ-169', '4');
await assign('SQ-169', elyAccountId);

await addComment(
  'SQ-177',
  'Retest result (2026-05-04): PASS. Status filter is persisted in URL (status query param present) and remains selected after reload. Transitioning defect with ReTest Passed.'
);
await transition('SQ-177', '41');

for (const issue of ['SQ-173', 'SQ-174', 'SQ-175', 'SQ-176']) {
  await addComment(
    issue,
    'Retest attempt (2026-05-04): FAIL/BLOCKED for closure criteria due missing deterministic business preconditions in current QA dataset (no payable/overdue scenarios available for full trifuerza validation against original defect conditions). Re-opening to request dev-supported seed path or reproducible fixture, then QA will re-run closure retest.'
  );
  await transition(issue, '4');
  await assign(issue, elyAccountId);
}
