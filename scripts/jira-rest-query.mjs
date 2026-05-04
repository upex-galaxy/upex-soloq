const jql = process.argv.slice(2).join(" ").trim();

if (!jql) {
  console.error("Usage: bun scripts/jira-rest-query.mjs <JQL>");
  process.exit(1);
}

const base = process.env.ATLASSIAN_URL;
const email = process.env.ATLASSIAN_EMAIL;
const token = process.env.ATLASSIAN_API_TOKEN;

if (!base || !email || !token) {
  console.error("Missing ATLASSIAN_URL, ATLASSIAN_EMAIL, or ATLASSIAN_API_TOKEN");
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;
const fields = "key,summary,status,assignee,updated,issuetype";
const url = `${base}/rest/api/3/search/jql?maxResults=100&fields=${encodeURIComponent(fields)}&jql=${encodeURIComponent(jql)}`;

const res = await fetch(url, {
  headers: { Authorization: auth, Accept: "application/json" },
});

const data = await res.json();
if (data.errorMessages) {
  console.log(JSON.stringify(data, null, 2));
  process.exit(2);
}

console.log(
  JSON.stringify(
    {
      total: data.total,
      issues: (data.issues || []).map((i) => ({
        key: i.key,
        type: i.fields?.issuetype?.name,
        summary: i.fields?.summary,
        status: i.fields?.status?.name,
        assignee: i.fields?.assignee?.displayName,
        updated: i.fields?.updated,
      })),
    },
    null,
    2
  )
);
