const base = process.env.ATLASSIAN_URL;
const email = process.env.ATLASSIAN_EMAIL;
const token = process.env.ATLASSIAN_API_TOKEN;

if (!base || !email || !token) {
  console.error('Missing ATLASSIAN_URL, ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN');
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;

const text = `## QA coordination update (2026-05-04)

Story remains **In Test** intentionally.

### Current blocker map
- Linked defect **SQ-206** is still **Open** (assigned to **Ely**) and continues to block QA closure for pending/overdue dashboard consistency.
- Additional consistency signal remains in **SQ-176** (**Open**, assigned to **Ely**) after dataset-assisted re-retest.

### Latest retest context
- Dataset \`QRT250504-*\` was seeded for deterministic validation under QA user \`fernando.j.masci@gmail.com\`.
- Defects closed after re-retest: **SQ-173**, **SQ-174**, **SQ-175**.
- Defects still requiring dev fix before final SQ-49 closure: **SQ-206** (primary), **SQ-176** (related consistency path).

### Next QA action
Once dev confirms fix deployment for SQ-206 (and related SQ-176 path if impacted), QA will execute trifuerza revalidation and decide transition to **QA Approved**.`;

const body = {
  body: {
    type: 'doc',
    version: 1,
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  },
};

const res = await fetch(`${base}/rest/api/3/issue/SQ-49/comment`, {
  method: 'POST',
  headers: {
    Authorization: auth,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

console.log('status', res.status);
if (!res.ok) {
  console.log(await res.text());
}
