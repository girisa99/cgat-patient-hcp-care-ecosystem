#!/usr/bin/env ts-node
import 'dotenv/config';
import { postgresAdapter } from '@/utils/db/PostgresAdapter';

(async () => {
  console.log('🔌 Verifying database connection...');
  try {
    const [{ result }] = await postgresAdapter.query<{ result: number }>('SELECT 1 AS result');
    if (result === 1) {
      console.log('✅ Database connection successful!');
    } else {
      console.error(`❌ Unexpected result: ${result}`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('❌ Unable to connect:', err);
    process.exitCode = 1;
  }
})();