const base = process.env.ATLASSIAN_URL;
const email = process.env.ATLASSIAN_EMAIL;
const token = process.env.ATLASSIAN_API_TOKEN;

if (!base || !email || !token) {
  console.error("Missing ATLASSIAN_URL, ATLASSIAN_EMAIL, or ATLASSIAN_API_TOKEN");
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;

const comments = [
  {
    key: "SQ-54",
    text: [
      "Fase 11 update (2026-05-02)",
      "- Story status confirmed: QA Approved.",
      "- Stage 4 prioritization completed with Jira + Xray scheme.",
      "- Created Test Set: SQ-196.",
      "- Created and linked tests: SQ-197, SQ-198.",
      "- Candidate/Manual decision details documented in docs/qa/fase11-sq54-58-2026-05-02.md.",
    ].join("\n"),
  },
  {
    key: "SQ-56",
    text: [
      "Fase 11 update (2026-05-02)",
      "- Story status confirmed: QA Approved.",
      "- Stage 4 prioritization completed with Jira + Xray scheme.",
      "- Reused Test Set: SQ-196.",
      "- Created and linked tests: SQ-199, SQ-200.",
      "- Candidate/Manual decision details documented in docs/qa/fase11-sq54-58-2026-05-02.md.",
    ].join("\n"),
  },
  {
    key: "SQ-57",
    text: [
      "Fase 11 update (2026-05-02)",
      "- Story status confirmed: QA Approved.",
      "- Stage 4 prioritization completed with Jira + Xray scheme.",
      "- Reused Test Set: SQ-196.",
      "- Created and linked tests: SQ-201, SQ-202.",
      "- Candidate/Manual decision details documented in docs/qa/fase11-sq54-58-2026-05-02.md.",
    ].join("\n"),
  },
  {
    key: "SQ-58",
    text: [
      "Fase 11 update (2026-05-02)",
      "- Story status confirmed: QA Approved.",
      "- Stage 4 prioritization completed with Jira + Xray scheme.",
      "- Reused Test Set: SQ-196.",
      "- Created and linked tests: SQ-203, SQ-204, SQ-205.",
      "- Candidate/Manual decision details documented in docs/qa/fase11-sq54-58-2026-05-02.md.",
    ].join("\n"),
  },
  {
    key: "SQ-47",
    text: [
      "Retest Trifuerza update (2026-05-02)",
      "- Story remains In Test.",
      "- Reviewed pending focus from previous comments: empty-state validation with zero-invoice user.",
      "- Executed this pass:",
      "  - UI smoke: staging available, /invoices redirects to login.",
      "  - API smoke: unauth guard verified (401).",
      "  - DB connectivity: available for follow-up validations.",
      "- Result: PARTIAL (no authenticated exploratory session), keep In Test.",
      "- Full retest blocked pending QA credentials + deterministic user dataset.",
      "- Evidence/report: docs/qa/retest-trifuerza-sq47-49-53-2026-05-02.md.",
    ].join("\n"),
  },
  {
    key: "SQ-49",
    text: [
      "Retest Trifuerza update (2026-05-02)",
      "- Story remains In Test.",
      "- Reviewed pending focus from previous comments: pending total with sent/overdue dataset and post-payment decrease.",
      "- Executed this pass:",
      "  - UI smoke: staging available, auth required.",
      "  - API smoke: unauth guard verified (401).",
      "  - DB connectivity: available for follow-up validations.",
      "- Result: PARTIAL (no authenticated exploratory session), keep In Test.",
      "- Full retest blocked pending QA credentials + deterministic dataset.",
      "- Evidence/report: docs/qa/retest-trifuerza-sq47-49-53-2026-05-02.md.",
    ].join("\n"),
  },
  {
    key: "SQ-53",
    text: [
      "Retest Trifuerza update (2026-05-02)",
      "- Story remains In Test.",
      "- Reviewed pending focus from previous comments: mark-as-paid functional verification and data consistency.",
      "- Executed this pass:",
      "  - UI smoke: staging available, auth required.",
      "  - API smoke: unauth guard verified (401).",
      "  - DB connectivity: available for follow-up validations.",
      "- Result: PARTIAL (no authenticated exploratory session), keep In Test.",
      "- Full retest blocked pending QA credentials + deterministic invoice scenario.",
      "- Evidence/report: docs/qa/retest-trifuerza-sq47-49-53-2026-05-02.md.",
    ].join("\n"),
  },
];

function toAdf(text) {
  return {
    type: "doc",
    version: 1,
    content: text.split("\n").map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : [],
    })),
  };
}

const out = [];
for (const item of comments) {
  const response = await fetch(`${base}/rest/api/3/issue/${item.key}/comment`, {
    method: "POST",
    headers: {
      Authorization: auth,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body: toAdf(item.text) }),
  });

  const data = await response.json();
  out.push({ key: item.key, status: response.status, commentId: data.id, errors: data.errorMessages || data.errors });
}

console.log(JSON.stringify(out, null, 2));
