import { SQL } from 'bun';

const query = process.argv.slice(2).join(' ').trim();

if (!query) {
  console.error('Usage: bun scripts/db-query.ts "select 1 as ok"');
  process.exit(1);
}

const dsn = 'postgresql://qa_team.czuusjchqpgvanvbdrnz:QA_SoloQ_2024_Secure!@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require';
const db = new SQL(dsn);

try {
  const rows = await db.unsafe(query);
  console.log(JSON.stringify(rows, null, 2));
} catch (error) {
  console.error('DB query failed:', error);
  process.exitCode = 1;
} finally {
  await db.close();
}
