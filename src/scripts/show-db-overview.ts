#!/usr/bin/env ts-node
/// <reference types="node" />
import 'dotenv/config';
import { postgresAdapter } from '@/utils/db/PostgresAdapter';

(async function main() {
  try {
    console.log('📊 Generating database overview...');

    const tables = await postgresAdapter.getTableList();
    if (tables.length === 0) {
      console.warn('⚠️  No tables found in the public schema.');
      return;
    }

    for (const tableName of tables) {
      const [{ count }] = await postgresAdapter.query<{ count: string }>(
        `SELECT COUNT(*)::int AS count FROM ${tableName}`
      );
      const sampleRows = await postgresAdapter.query<any>(
        `SELECT * FROM ${tableName} LIMIT 5`
      );

      console.log(`\n──────── Table: ${tableName} (rows: ${count}) ────────`);
      if (sampleRows.length === 0) {
        console.log('   (no rows)');
      } else {
        console.table(sampleRows);
      }
    }

    console.log('\n✅ Database overview complete.');
  } catch (err) {
    console.error('❌ Failed to generate database overview:', err);
    process.exit(1);
  }
})();