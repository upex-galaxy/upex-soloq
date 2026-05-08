const base = process.env.ATLASSIAN_URL;
const email = process.env.ATLASSIAN_EMAIL;
const token = process.env.ATLASSIAN_API_TOKEN;

if (!base || !email || !token) {
  console.error('Missing ATLASSIAN_URL, ATLASSIAN_EMAIL, or ATLASSIAN_API_TOKEN');
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;

async function addComment(issueKey, text) {
  const body = {
    body: {
      type: 'doc',
      version: 1,
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    },
  };

  const res = await fetch(`${base}/rest/api/3/issue/${issueKey}/comment`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  console.log(issueKey, 'comment', res.status);
  if (!res.ok) {
    console.log(await res.text());
  }
}

async function transition(issueKey, transitionId) {
  const res = await fetch(`${base}/rest/api/3/issue/${issueKey}/transitions`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transition: { id: transitionId } }),
  });

  console.log(issueKey, 'transition', transitionId, res.status);
  if (!res.ok) {
    console.log(await res.text());
  }
}

async function closeAsRetestPassed(issueKey, comment) {
  await addComment(issueKey, comment);
  await transition(issueKey, '121'); // Open -> In Progress
  await transition(issueKey, '5'); // In Progress -> Ready For QA
  await transition(issueKey, '41'); // Ready For QA -> Closed (ReTest Passed)
}

await closeAsRetestPassed(
  'SQ-173',
  'Re-retest result (2026-05-04): PASS. Using seed invoice QRT250504-S174, the Register Payment modal exposes payment method control with accessible name "Método de Pago" and correct interactive focus/selection behavior. The a11y label association issue reported in SQ-173 is no longer reproducible.'
);

await closeAsRetestPassed(
  'SQ-174',
  'Re-retest result (2026-05-04): PASS. Payment was registered from invoice QRT250504-S174. Verification after submit: invoice status changed to paid, invoices.paid_at was populated, a payment record was created in payments, and invoice_events contains event_type=paid with payment metadata. Original defect condition is no longer reproducible.'
);

await closeAsRetestPassed(
  'SQ-175',
  'Re-retest result (2026-05-04): PASS. With deterministic seeded payments across months (QRT250504-M3P, QRT250504-M1P, QRT250504-M0P plus QRT250504-S174), dashboard monthly metrics are now consistent with payment_date aggregation. Current month paid value shown in UI is $150.00, matching DB aggregation for current month. No semantic mismatch observed in this retest.'
);

await addComment(
  'SQ-176',
  'Re-retest result (2026-05-04): FAIL. With seeded dataset (sent: QRT250504-S49S=111.11; overdue: QRT250504-S49O=222.22 and QRT250504-OVDX=80.00), dashboard still shows Facturas Vencidas=0 while DB and invoice list show overdue_count=2. This remains inconsistent with overdue aggregation expectations. Defect stays Open for dev fix.'
);
