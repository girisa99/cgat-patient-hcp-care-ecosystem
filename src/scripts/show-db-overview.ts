#!/usr/bin/env ts-node
/// <reference types="node" />
import 'dotenv/config';
import { postgresAdapter } from '../utils/db/PostgresAdapter';

(async () => {
  console.log('📊 Generating database overview...');
  const tables = await postgresAdapter.getTableList();
  if (tables.length === 0) {
    console.warn('⚠️  No tables found in the public schema.');
    return;
  }

  for (const table of tables) {
    const [{ count }] = await postgresAdapter.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM ${table}`
    );
    const sampleRows = await postgresAdapter.query<Record<string, unknown>>(
      `SELECT * FROM ${table} LIMIT 5`
    );

    console.log(`\n──────── Table: ${table} (rows: ${count}) ────────`);
    console.table(sampleRows);
  }

  console.log('\n✅ Database overview complete.');
})();