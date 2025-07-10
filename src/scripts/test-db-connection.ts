#!/usr/bin/env ts-node
import 'dotenv/config';
import { postgresAdapter } from '@/utils/db/PostgresAdapter';

async function main() {
  console.log('🔌 Verifying database connection...');
  try {
    const rows = await postgresAdapter.query<{ result: number }>('SELECT 1 AS result');
    if (rows[0]?.result === 1) {
      console.log('✅ Database connection successful!');
    } else {
      console.error('❌ Unexpected result:', rows);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('❌ Unable to connect to database:', err);
    process.exitCode = 1;
  }
}

main();