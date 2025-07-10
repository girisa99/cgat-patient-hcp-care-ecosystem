#!/usr/bin/env ts-node
import 'dotenv/config';

import { postgresAdapter } from '@/utils/db/PostgresAdapter';

async function main() {
  console.log('🔌 Verifying database connection...');
  try {
    // Simple query to validate connectivity
    const result = await postgresAdapter.query<{ result: number }>('SELECT 1 AS result');

    if (result[0]?.result === 1) {
      console.log('✅ Database connection successful!');
    } else {
      console.error('❌ Unexpected result from database:', result);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('❌ Unable to connect to database:', err);
    process.exitCode = 1;
  }
}

main();