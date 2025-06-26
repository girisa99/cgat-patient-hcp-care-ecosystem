/**
 * Database Schema Analyzer - Analyzes real database structure for API sync
 * Focused on core business tables only
 */

import { supabase } from '@/integrations/supabase/client';

export interface DatabaseTable {
  table_name: string;
  table_schema: string;
  columns: DatabaseColumn[];
  foreign_keys: ForeignKey[];
  rls_policies: RLSPolicy[];
}

export interface DatabaseColumn {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
  is_primary_key: boolean;
}

export interface ForeignKey {
  column_name: string;
  foreign_table_schema: string;
  foreign_table_name: string;
  foreign_column_name: string;
}

export interface RLSPolicy {
  policy_name: string;
  table_name: string;
  command: string;
  expression: string;
  with_check: string | null;
}

class DatabaseSchemaAnalyzerClass {
  /**
   * Get only core business tables that are relevant for external API consumers
   */
  async getAllTables(): Promise<DatabaseTable[]> {
    console.log('🔍 Analyzing CORE BUSINESS TABLES for external API...');

    try {
      // Only include core business tables that external APIs would need
      const coreBusinessTables = [
        'profiles',    // User profiles - core business entity
        'facilities',  // Healthcare facilities - core business entity  
        'modules',     // System modules - needed for access control
        'roles',       // User roles - needed for permissions
        'user_roles'   // Role assignments - needed for access control
      ];

      console.log(`📊 Processing ${coreBusinessTables.length} core business tables only`);

      const analyzedTables: DatabaseTable[] = [];

      // Analyze each core business table
      for (const tableName of coreBusinessTables) {
        const tableAnalysis = await this.analyzeTable(tableName);
        if (tableAnalysis) {
          analyzedTables.push(tableAnalysis);
        }
      }

      console.log(`✅ Analyzed ${analyzedTables.length} core business tables for external API`);
      return analyzedTables;

    } catch (error) {
      console.error('❌ Error in core business table analysis:', error);
      return this.getFallbackCoreTableStructure();
    }
  }

  /**
   * Analyze a specific core business table
   */
  private async analyzeTable(tableName: string): Promise<DatabaseTable | null> {
    try {
      console.log(`🔍 Analyzing core table: ${tableName}`);

      const columns = this.getCoreTableColumns(tableName);
      const foreignKeys = this.getCoreForeignKeys(tableName);
      const rlsPolicies = this.generateCoreRLSPolicies(tableName);

      // Verify table exists by attempting a simple query
      const { error: tableError } = await supabase
        .from(tableName as any)
        .select('*')
        .limit(1);

      if (tableError) {
        console.warn(`⚠️ Core table ${tableName} may not be accessible:`, tableError.message);
      }

      return {
        table_name: tableName,
        table_schema: 'public',
        columns,
        foreign_keys: foreignKeys,
        rls_policies: rlsPolicies
      };

    } catch (error) {
      console.error(`❌ Error analyzing core table ${tableName}:`, error);
      return null;
    }
  }

  /**
   * Get core business table column structures only
   */
  private getCoreTableColumns(tableName: string): DatabaseColumn[] {
    const coreColumnMappings: Record<string, DatabaseColumn[]> = {
      profiles: [
        { column_name: 'id', data_type: 'uuid', is_nullable: false, column_default: null, is_primary_key: true },
        { column_name: 'first_name', data_type: 'character varying', is_nullable: true, column_default: null, is_primary_key: false },
        { column_name: 'last_name', data_type: 'character varying', is_nullable: true, column_default: null, is_primary_key: false },
        { column_name: 'email', data_type: 'character varying', is_nullable: true, column_default: null, is_primary_key: false },
        { column_name: 'phone', data_type: 'character varying', is_nullable: true, column_default: null, is_primary_key: false },
        { column_name: 'facility_id', data_type: 'uuid', is_nullable: true, column_default: null, is_primary_key: false },
        { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: true, column_default: 'now()', is_primary_key: false },
        { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: true, column_default: 'now()', is_primary_key: false }
      ],
      facilities: [
        { column_name: 'id', data_type: 'uuid', is_nullable: false, column_default: 'gen_random_uuid()', is_primary_key: true },
        { column_name: 'name', data_type: 'character varying', is_nullable: false, column_default: null, is_primary_key: false },
        { column_name: 'facility_type', data_type: 'USER-DEFINED', is_nullable: false, column_default: null, is_primary_key: false },
        { column_name: 'address', data_type: 'text', is_nullable: true, column_default: null, is_primary_key: false },
        { column_name: 'phone', data_type: 'character varying', is_nullable: true, column_default: null, is_primary_key: false },
        { column_name: 'email', data_type: 'character varying', is_nullable: true, column_default: null, is_primary_key: false },
        { column_name: 'is_active', data_type: 'boolean', is_nullable: true, column_default: 'true', is_primary_key: false }
      ],
      modules: [
        { column_name: 'id', data_type: 'uuid', is_nullable: false, column_default: 'gen_random_uuid()', is_primary_key: true },
        { column_name: 'name', data_type: 'character varying', is_nullable: false, column_default: null, is_primary_key: false },
        { column_name: 'description', data_type: 'text', is_nullable: true, column_default: null, is_primary_key: false },
        { column_name: 'is_active', data_type: 'boolean', is_nullable: true, column_default: 'true', is_primary_key: false }
      ],
      roles: [
        { column_name: 'id', data_type: 'uuid', is_nullable: false, column_default: 'gen_random_uuid()', is_primary_key: true },
        { column_name: 'name', data_type: 'USER-DEFINED', is_nullable: false, column_default: null, is_primary_key: false },
        { column_name: 'description', data_type: 'text', is_nullable: true, column_default: null, is_primary_key: false }
      ],
      user_roles: [
        { column_name: 'id', data_type: 'uuid', is_nullable: false, column_default: 'gen_random_uuid()', is_primary_key: true },
        { column_name: 'user_id', data_type: 'uuid', is_nullable: true, column_default: null, is_primary_key: false },
        { column_name: 'role_id', data_type: 'uuid', is_nullable: true, column_default: null, is_primary_key: false },
        { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: true, column_default: 'now()', is_primary_key: false }
      ]
    };

    return coreColumnMappings[tableName] || [];
  }

  /**
   * Get core business table foreign key relationships only
   */
  private getCoreForeignKeys(tableName: string): ForeignKey[] {
    const coreForeignKeyMappings: Record<string, ForeignKey[]> = {
      profiles: [
        { column_name: 'facility_id', foreign_table_schema: 'public', foreign_table_name: 'facilities', foreign_column_name: 'id' }
      ],
      user_roles: [
        { column_name: 'role_id', foreign_table_schema: 'public', foreign_table_name: 'roles', foreign_column_name: 'id' }
      ]
    };

    return coreForeignKeyMappings[tableName] || [];
  }

  /**
   * Generate core business RLS policies only (relevant for external API access)
   */
  private generateCoreRLSPolicies(tableName: string): RLSPolicy[] {
    // Only generate essential RLS policies for core business operations
    const coreRlsPolicies: Record<string, RLSPolicy[]> = {
      profiles: [
        {
          policy_name: 'profiles_authenticated_read',
          table_name: 'profiles',
          command: 'SELECT',
          expression: 'auth.role() = \'authenticated\'',
          with_check: null
        }
      ],
      facilities: [
        {
          policy_name: 'facilities_authenticated_read',
          table_name: 'facilities',
          command: 'SELECT',
          expression: 'auth.role() = \'authenticated\' AND is_active = true',
          with_check: null
        }
      ],
      roles: [
        {
          policy_name: 'roles_authenticated_read',
          table_name: 'roles',
          command: 'SELECT',
          expression: 'auth.role() = \'authenticated\'',
          with_check: null
        }
      ],
      user_roles: [
        {
          policy_name: 'user_roles_own_data',
          table_name: 'user_roles',
          command: 'SELECT',
          expression: 'auth.uid() = user_id',
          with_check: null
        }
      ],
      modules: [
        {
          policy_name: 'modules_authenticated_read',
          table_name: 'modules',
          command: 'SELECT',
          expression: 'auth.role() = \'authenticated\' AND is_active = true',
          with_check: null
        }
      ]
    };

    return coreRlsPolicies[tableName] || [];
  }

  /**
   * Fallback core table structure if analysis fails
   */
  private getFallbackCoreTableStructure(): DatabaseTable[] {
    const coreTableNames = ['profiles', 'facilities', 'modules', 'roles', 'user_roles'];

    return coreTableNames.map(tableName => ({
      table_name: tableName,
      table_schema: 'public',
      columns: this.getCoreTableColumns(tableName),
      foreign_keys: this.getCoreForeignKeys(tableName),
      rls_policies: this.generateCoreRLSPolicies(tableName)
    }));
  }

  /**
   * Generate endpoints from core business tables only
   */
  generateEndpointsFromTables(tables: DatabaseTable[]): any[] {
    const endpoints: any[] = [];

    for (const table of tables) {
      // Generate CRUD endpoints for core business tables only
      const tableEndpoints = this.generateCoreBusinessEndpoints(table);
      endpoints.push(...tableEndpoints);
    }

    console.log(`📊 Generated ${endpoints.length} core business endpoints from ${tables.length} tables`);
    return endpoints;
  }

  /**
   * Generate CRUD endpoints for core business tables
   */
  private generateCoreBusinessEndpoints(table: DatabaseTable): any[] {
    const tableName = table.table_name;
    const endpoints = [];

    // GET collection endpoint
    endpoints.push({
      external_path: `/api/v1/${tableName}`,
      method: 'GET',
      summary: `Get ${tableName} list`,
      description: `Retrieve paginated list of ${tableName} records`,
      request_schema: this.generateListRequestSchema(),
      response_schema: this.generateListResponseSchema(table),
      requires_authentication: true
    });

    // GET single item endpoint
    endpoints.push({
      external_path: `/api/v1/${tableName}/{id}`,
      method: 'GET',
      summary: `Get ${tableName} by ID`,
      description: `Retrieve a single ${tableName} record by ID`,
      request_schema: this.generateGetByIdRequestSchema(),
      response_schema: this.generateSingleResponseSchema(table),
      requires_authentication: true
    });

    // POST create endpoint (only for appropriate tables)
    if (['profiles', 'facilities', 'user_roles'].includes(tableName)) {
      endpoints.push({
        external_path: `/api/v1/${tableName}`,
        method: 'POST',
        summary: `Create ${tableName}`,
        description: `Create a new ${tableName} record`,
        request_schema: this.generateCreateRequestSchema(table),
        response_schema: this.generateSingleResponseSchema(table),
        requires_authentication: true
      });
    }

    // PUT update endpoint (only for appropriate tables)
    if (['profiles', 'facilities'].includes(tableName)) {
      endpoints.push({
        external_path: `/api/v1/${tableName}/{id}`,
        method: 'PUT',
        summary: `Update ${tableName}`,
        description: `Update an existing ${tableName} record`,
        request_schema: this.generateUpdateRequestSchema(table),
        response_schema: this.generateSingleResponseSchema(table),
        requires_authentication: true
      });
    }

    return endpoints;
  }

  private generateListRequestSchema(): any {
    return {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        search: { type: 'string', description: 'Search query' },
        sort: { type: 'string', description: 'Sort field' },
        order: { type: 'string', enum: ['asc', 'desc'], default: 'asc' }
      }
    };
  }

  private generateListResponseSchema(table: DatabaseTable): any {
    return {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: this.generateTableSchema(table)
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            pages: { type: 'integer' }
          }
        }
      }
    };
  }

  private generateTableSchema(table: DatabaseTable): any {
    const properties: any = {};

    for (const column of table.columns) {
      properties[column.column_name] = {
        type: this.mapDataTypeToJsonSchema(column.data_type),
        description: `${column.column_name} field`,
        ...(column.is_nullable ? {} : { required: true })
      };
    }

    return {
      type: 'object',
      properties
    };
  }

  private mapDataTypeToJsonSchema(sqlType: string): string {
    const typeMap: Record<string, string> = {
      'uuid': 'string',
      'character varying': 'string',
      'text': 'string',
      'integer': 'integer',
      'boolean': 'boolean',
      'timestamp with time zone': 'string',
      'jsonb': 'object',
      'ARRAY': 'array',
      'USER-DEFINED': 'string'
    };

    return typeMap[sqlType] || 'string';
  }

  private generateGetByIdRequestSchema(): any {
    return {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Record ID' }
      },
      required: ['id']
    };
  }

  private generateSingleResponseSchema(table: DatabaseTable): any {
    return {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: this.generateTableSchema(table)
      }
    };
  }

  private generateCreateRequestSchema(table: DatabaseTable): any {
    const properties: any = {};
    const required: string[] = [];

    for (const column of table.columns) {
      // Skip auto-generated fields
      if (column.column_name === 'id' || 
          column.column_name === 'created_at' || 
          column.column_name === 'updated_at') {
        continue;
      }

      properties[column.column_name] = {
        type: this.mapDataTypeToJsonSchema(column.data_type),
        description: `${column.column_name} field`
      };

      if (!column.is_nullable && !column.column_default) {
        required.push(column.column_name);
      }
    }

    return {
      type: 'object',
      properties,
      required
    };
  }

  private generateUpdateRequestSchema(table: DatabaseTable): any {
    const createSchema = this.generateCreateRequestSchema(table);
    return {
      ...createSchema,
      required: [] // Updates don't require all fields
    };
  }
}

export const databaseSchemaAnalyzer = new DatabaseSchemaAnalyzerClass();
