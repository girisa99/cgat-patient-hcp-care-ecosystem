export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: 'YES' | 'NO';
  column_default: string | null;
}

export interface TableInfo {
  columns: ColumnInfo[];
  rls_policies: any[];
  triggers: any[];
  foreign_keys: any[];
}

export interface DatabaseAdapter {
  /** Returns list of table names in public schema */
  getTableList(): Promise<string[]>;

  /** Returns detailed information about a table */
  getTableInfo(table: string): Promise<TableInfo | null>;

  /** Returns number of rows */
  getTableRowCount(table: string): Promise<number>;

  /** Execute arbitrary SQL and return rows */
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
}