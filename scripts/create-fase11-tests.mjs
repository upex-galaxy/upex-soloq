const base = process.env.ATLASSIAN_URL;
const email = process.env.ATLASSIAN_EMAIL;
const token = process.env.ATLASSIAN_API_TOKEN;

if (!base || !email || !token) {
  console.error("Missing ATLASSIAN_URL, ATLASSIAN_EMAIL, or ATLASSIAN_API_TOKEN");
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;

const tests = [
  ["SQ-54: TC1: Validate configured payment methods are prioritized and persisted", "candidate", "SQ-54"],
  ["SQ-54: TC2: Validate payment method enum options and optional save path", "candidate", "SQ-54"],
  ["SQ-56: TC1: Validate notes persistence with multiline and special chars", "candidate", "SQ-56"],
  ["SQ-56: TC2: Validate 500-char boundary and validation at 501 chars", "candidate", "SQ-56"],
  ["SQ-57: TC1: Validate default payment date and persistence", "candidate", "SQ-57"],
  ["SQ-57: TC2: Validate future-date and required-date validation rules", "candidate", "SQ-57"],
  ["SQ-58: TC1: Validate revert payment status transition and soft delete", "candidate", "SQ-58"],
  ["SQ-58: TC2: Validate revert updates dashboard totals and audit events", "candidate", "SQ-58"],
  ["SQ-58: TC3: Validate cancel revert leaves data unchanged", "manual", "SQ-58"],
];

const created = [];

for (const [summary, track, story] of tests) {
  const payload = {
    fields: {
      project: { key: "SQ" },
      issuetype: { id: "10100" },
      summary,
      labels: ["fase-11", "sq-39", track, story.toLowerCase()],
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Stage 4 candidate generated from ${story}. Track: ${track}.`,
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Source artifact: docs/qa/fase11-sq54-58-2026-05-02.md",
              },
            ],
          },
        ],
      },
    },
  };

  const response = await fetch(`${base}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: auth,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  created.push({
    summary,
    status: response.status,
    key: data.key,
    id: data.id,
    errorMessages: data.errorMessages,
    errors: data.errors,
  });
}

console.log(JSON.stringify(created, null, 2));
