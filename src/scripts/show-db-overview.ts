#!/usr/bin/env ts-node
import 'dotenv/config';
import { postgresAdapter } from '../utils/db/PostgresAdapter';

(async () => {
  console.log('📊 Generating database overview...');
  const tables = await postgresAdapter.getTableList();
  if (!tables.length) {
    console.warn('⚠️  No tables found in the public schema.');
    return;
  }
  for (const t of tables) {
    const [{ count }] =
      await postgresAdapter.query<{ count: string }>(`SELECT COUNT(*)::int AS count FROM ${t}`);
    const sample =
      await postgresAdapter.query<Record<string, unknown>>(`SELECT * FROM ${t} LIMIT 5`);
    console.log(`\n──────── Table: ${t} (rows: ${count}) ────────`);
    console.table(sample);
  }
  console.log('\n✅ Database overview complete.');
})();