#!/usr/bin/env ts-node
import 'dotenv/config';
import { postgresAdapter } from '../utils/db/PostgresAdapter';

(async () => {
  console.log('🔌 Verifying database connection...');
  try {
    const [{ result }] =
      await postgresAdapter.query<{ result: number }>('SELECT 1 AS result');
    console.log(result === 1
      ? '✅ Database connection successful!'
      : `❌ Unexpected result: ${result}`);
  } catch (err) {
    console.error('❌ Unable to connect:', err);
    process.exit(1);
  }
})();