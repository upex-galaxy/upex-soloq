const base = process.env.ATLASSIAN_URL;
const email = process.env.ATLASSIAN_EMAIL;
const token = process.env.ATLASSIAN_API_TOKEN;

if (!base || !email || !token) {
  console.error("Missing ATLASSIAN_URL, ATLASSIAN_EMAIL, or ATLASSIAN_API_TOKEN");
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;

const links = [
  ["SQ-197", "SQ-54"],
  ["SQ-198", "SQ-54"],
  ["SQ-199", "SQ-56"],
  ["SQ-200", "SQ-56"],
  ["SQ-201", "SQ-57"],
  ["SQ-202", "SQ-57"],
  ["SQ-203", "SQ-58"],
  ["SQ-204", "SQ-58"],
  ["SQ-205", "SQ-58"],
];

const out = [];

for (const [testKey, storyKey] of links) {
  const payload = {
    type: { name: "Relates" },
    inwardIssue: { key: testKey },
    outwardIssue: { key: storyKey },
  };

  const response = await fetch(`${base}/rest/api/3/issueLink`, {
    method: "POST",
    headers: {
      Authorization: auth,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  out.push({ testKey, storyKey, status: response.status });
}

console.log(JSON.stringify(out, null, 2));
