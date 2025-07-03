import { Pool } from 'pg';
import { DatabaseAdapter, TableInfo, ColumnInfo } from './DatabaseAdapter';
import { DatabaseError } from './DatabaseError';

/**
 * PostgresAdapter
 * 
 * Uses the `pg` driver to fetch schema metadata and data from a live PostgreSQL
 * (or Supabase) database. Connection details are taken from the standard
 * DATABASE_URL environment variable or individual PG* env vars.
 */
export class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool;
  readonly ErrorClass = DatabaseError;

  constructor() {
    // Prefer DATABASE_URL for simplicity; fallback to individual vars.
    const connectionString = process.env.DATABASE_URL;

    this.pool = new Pool(
      connectionString
        ? { connectionString }
        : {
            host: process.env.PGHOST || 'localhost',
            port: Number(process.env.PGPORT || 5432),
            user: process.env.PGUSER || 'postgres',
            password: process.env.PGPASSWORD || '',
            database: process.env.PGDATABASE || 'postgres'
          }
    );
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(sql, params);
      return rows as T[];
    } catch (err: any) {
      throw new DatabaseError(err.message, err);
    } finally {
      client.release();
    }
  }

  async getTableList(): Promise<string[]> {
    const rows = await this.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    return rows.map((r) => r.table_name);
  }

  async getTableInfo(table: string): Promise<TableInfo | null> {
    const columns = await this.query<ColumnInfo>(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
      [table]
    );

    // Fetch triggers
    const triggers = await this.query(
      `SELECT tgname as trigger_name
       FROM pg_trigger t
       JOIN pg_class c ON t.tgrelid = c.oid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public' AND c.relname = $1 AND NOT t.tgisinternal`,
      [table]
    );

    // Fetch foreign keys
    const foreignKeys = await this.query(
      `SELECT
         tc.constraint_name,
         kcu.column_name,
         ccu.table_name AS foreign_table_name,
         ccu.column_name AS foreign_column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
       JOIN information_schema.constraint_column_usage ccu
         ON ccu.constraint_name = tc.constraint_name
       WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name = $1`,
      [table]
    );

    // RLS policies (simplified — returns policy names)
    const rlsPolicies = await this.query(
      `SELECT polname FROM pg_policies WHERE schemaname = 'public' AND tablename = $1`,
      [table]
    );

    return {
      columns,
      triggers,
      foreign_keys: foreignKeys,
      rls_policies: rlsPolicies
    };
  }

  async getTableRowCount(table: string): Promise<number> {
    const rows = await this.query<{ count: string }>(`SELECT COUNT(*) AS count FROM ${table}`);
    return parseInt(rows[0]?.count || '0', 10);
  }
}

// Singleton instance
export const postgresAdapter = new PostgresAdapter();