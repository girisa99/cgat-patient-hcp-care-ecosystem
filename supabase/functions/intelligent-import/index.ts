import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { corsHeaders } from '../_shared/cors.ts';

interface IntelligentImportRequest {
  data: Record<string, any>[];
  source_name: string;
  user_preferences?: {
    auto_apply_safe_migrations?: boolean;
    generate_typescript?: boolean;
    enforce_naming_conventions?: boolean;
    require_manual_approval?: boolean;
  };
}

interface ImportDataPattern {
  potential_table_name: string;
  confidence_score: number;
  field_mappings: FieldMapping[];
  relationship_hints: RelationshipHint[];
  suggested_enhancements: string[];
}

interface FieldMapping {
  import_field: string;
  suggested_column: string;
  data_type: string;
  constraints: string[];
  is_potential_fk: boolean;
  fk_target?: {
    table: string;
    column: string;
    confidence: number;
  };
}

interface RelationshipHint {
  type: 'one_to_many' | 'many_to_one' | 'many_to_many';
  source_field: string;
  target_table: string;
  target_field: string;
  confidence: number;
}

interface SafetyCheck {
  type: 'dependency' | 'data_integrity' | 'performance' | 'security';
  passed: boolean;
  description: string;
  warning?: string;
  blocking: boolean;
}

interface MigrationOperation {
  id: string;
  type: 'create_table' | 'alter_table' | 'add_column' | 'add_constraint' | 'add_index' | 'add_rls_policy';
  priority: number;
  sql: string;
  rollback_sql: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  dependencies: string[];
  validation_checks: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: requestData, source_name, user_preferences }: IntelligentImportRequest = await req.json();

    console.log(`🚀 Processing intelligent import for: ${source_name}`);
    console.log(`📊 Data records: ${requestData.length}`);

    // Step 1: Get complete schema analysis
    const { data: schemaData, error: schemaError } = await supabase.rpc('get_complete_schema_info');
    
    if (schemaError) {
      throw new Error(`Schema analysis failed: ${schemaError.message}`);
    }

    // Step 2: Analyze import data patterns
    const patterns = await analyzeImportDataPatterns(requestData, schemaData || []);
    
    // Step 3: Generate migration plan
    const migrationPlan = await generateMigrationPlan(patterns, requestData);
    
    // Step 4: Perform safety checks
    const safetyChecks = await performSafetyChecks(migrationPlan, schemaData || []);
    
    // Step 5: Generate recommendations
    const recommendations = generateRecommendations(patterns, migrationPlan, safetyChecks);
    
    // Step 6: Determine status and next steps
    const { status, nextSteps } = determineStatusAndNextSteps(
      patterns, 
      migrationPlan, 
      safetyChecks, 
      user_preferences
    );

    // Step 7: Create import session record
    const sessionId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { error: sessionError } = await supabase
      .from('data_import_sessions')
      .insert({
        id: sessionId,
        import_type: 'intelligent',
        source_name,
        status: 'analyzed',
        schema_detected: {
          patterns,
          migration_plan: migrationPlan,
          safety_checks: safetyChecks,
          analysis_timestamp: new Date().toISOString()
        },
        records_total: requestData.length,
        import_config: {
          user_preferences,
          intelligent_analysis: true,
          auto_migration_enabled: user_preferences?.auto_apply_safe_migrations || false
        }
      });

    if (sessionError) {
      console.error('Failed to create import session:', sessionError);
    }

    const result = {
      import_session_id: sessionId,
      patterns,
      migration_plan: migrationPlan,
      safety_checks: safetyChecks,
      recommendations,
      status,
      next_steps: nextSteps,
      analysis_summary: {
        total_records: requestData.length,
        patterns_found: patterns.length,
        high_confidence_patterns: patterns.filter(p => p.confidence_score > 0.8).length,
        migration_operations: migrationPlan.operations.length,
        safety_checks_passed: safetyChecks.filter(c => c.passed).length,
        total_safety_checks: safetyChecks.length
      }
    };

    console.log(`✅ Intelligent import analysis complete. Status: ${status}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Intelligent import analysis failed:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Intelligent import analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper functions

async function analyzeImportDataPatterns(
  importData: Record<string, any>[],
  existingTables: any[]
): Promise<ImportDataPattern[]> {
  const patterns: ImportDataPattern[] = [];
  
  if (importData.length === 0) return patterns;

  const sampleRecord = importData[0];
  const fieldNames = Object.keys(sampleRecord);

  console.log(`🔍 Analyzing ${fieldNames.length} fields against ${existingTables.length} existing tables`);

  // Try to match against existing tables
  for (const table of existingTables) {
    const matchScore = calculateTableMatchScore(fieldNames, table);
    
    if (matchScore > 0.5) {
      const pattern: ImportDataPattern = {
        potential_table_name: table.table_name,
        confidence_score: matchScore,
        field_mappings: generateFieldMappings(fieldNames, table, importData),
        relationship_hints: detectRelationshipHints(importData, existingTables),
        suggested_enhancements: []
      };
      
      patterns.push(pattern);
    }
  }

  // If no good matches, suggest new table creation
  if (patterns.length === 0) {
    patterns.push(suggestNewTablePattern(importData, fieldNames));
  }

  return patterns.sort((a, b) => b.confidence_score - a.confidence_score);
}

function calculateTableMatchScore(fieldNames: string[], table: any): number {
  if (!table.columns || !Array.isArray(table.columns)) return 0;
  
  const tableColumns = table.columns.map((col: any) => col.column_name);
  const matches = fieldNames.filter(field => 
    tableColumns.some((col: string) => 
      col.toLowerCase() === field.toLowerCase() ||
      col.toLowerCase().includes(field.toLowerCase()) ||
      field.toLowerCase().includes(col.toLowerCase())
    )
  );
  
  return matches.length / Math.max(fieldNames.length, tableColumns.length);
}

function generateFieldMappings(
  fieldNames: string[],
  table: any,
  importData: Record<string, any>[]
): FieldMapping[] {
  const mappings: FieldMapping[] = [];
  
  for (const fieldName of fieldNames) {
    const sampleValue = importData[0][fieldName];
    const suggestedColumn = findBestColumnMatch(fieldName, table);
    
    mappings.push({
      import_field: fieldName,
      suggested_column: suggestedColumn || fieldName,
      data_type: inferDataType(sampleValue),
      constraints: [],
      is_potential_fk: isPotentialForeignKey(fieldName, sampleValue),
      fk_target: suggestForeignKeyTarget(fieldName, sampleValue)
    });
  }
  
  return mappings;
}

function findBestColumnMatch(fieldName: string, table: any): string | null {
  if (!table.columns) return null;
  
  const exactMatch = table.columns.find((col: any) => 
    col.column_name.toLowerCase() === fieldName.toLowerCase()
  );
  
  if (exactMatch) return exactMatch.column_name;
  
  const partialMatch = table.columns.find((col: any) =>
    col.column_name.toLowerCase().includes(fieldName.toLowerCase()) ||
    fieldName.toLowerCase().includes(col.column_name.toLowerCase())
  );
  
  return partialMatch?.column_name || null;
}

function inferDataType(value: any): string {
  if (value === null || value === undefined) return 'text';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'numeric';
  }
  if (typeof value === 'string') {
    if (value.match(/^\d{4}-\d{2}-\d{2}/)) return 'date';
    if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'text';
    if (value.length > 255) return 'text';
    return 'varchar';
  }
  if (typeof value === 'object') return 'jsonb';
  return 'text';
}

function isPotentialForeignKey(fieldName: string, value: any): boolean {
  const fkPatterns = ['_id', 'id', '_ref', '_key'];
  return fkPatterns.some(pattern => 
    fieldName.toLowerCase().includes(pattern)
  ) && (typeof value === 'string' || typeof value === 'number');
}

function suggestForeignKeyTarget(fieldName: string, value: any): { table: string; column: string; confidence: number } | undefined {
  if (fieldName.toLowerCase().includes('user')) {
    return { table: 'profiles', column: 'id', confidence: 0.8 };
  }
  
  if (fieldName.toLowerCase().includes('facility')) {
    return { table: 'facilities', column: 'id', confidence: 0.8 };
  }
  
  return undefined;
}

function detectRelationshipHints(importData: Record<string, any>[], existingTables: any[]): RelationshipHint[] {
  // Simplified implementation for relationship detection
  return [];
}

function suggestNewTablePattern(importData: Record<string, any>[], fieldNames: string[]): ImportDataPattern {
  return {
    potential_table_name: 'imported_data_table',
    confidence_score: 1.0,
    field_mappings: fieldNames.map(fieldName => ({
      import_field: fieldName,
      suggested_column: fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      data_type: inferDataType(importData[0][fieldName]),
      constraints: [],
      is_potential_fk: isPotentialForeignKey(fieldName, importData[0][fieldName]),
      fk_target: suggestForeignKeyTarget(fieldName, importData[0][fieldName])
    })),
    relationship_hints: [],
    suggested_enhancements: [
      'Add RLS policies for data security',
      'Create appropriate indexes for performance',
      'Consider relationships with existing tables'
    ]
  };
}

async function generateMigrationPlan(patterns: ImportDataPattern[], importData: Record<string, any>[]): Promise<{
  id: string;
  title: string;
  description: string;
  operations: MigrationOperation[];
  estimated_duration: string;
  backup_required: boolean;
}> {
  const operations: MigrationOperation[] = [];
  const migrationId = `import_migration_${Date.now()}`;
  
  for (const pattern of patterns) {
    if (pattern.confidence_score >= 1.0) {
      // Create new table
      const tableName = sanitizeTableName(pattern.potential_table_name);
      const columns = pattern.field_mappings.map(mapping => 
        generateColumnDefinition(mapping)
      ).join(',\n  ');
      
      const sql = `
        CREATE TABLE public.${tableName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          ${columns},
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage their own ${tableName}" 
        ON public.${tableName}
        FOR ALL 
        USING (auth.uid() = user_id);
      `;
      
      operations.push({
        id: `create_table_${tableName}`,
        type: 'create_table',
        priority: 1,
        sql: sql.trim(),
        rollback_sql: `DROP TABLE IF EXISTS public.${tableName};`,
        description: `Create new table '${tableName}' for imported data`,
        risk_level: 'low',
        dependencies: [],
        validation_checks: [
          `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${tableName}');`
        ]
      });
    }
  }
  
  return {
    id: migrationId,
    title: `Import Data Migration - ${new Date().toISOString()}`,
    description: `Migration to import ${importData.length} records with schema enhancements`,
    operations,
    estimated_duration: estimateDuration(operations),
    backup_required: operations.length > 3
  };
}

function generateColumnDefinition(mapping: FieldMapping): string {
  let definition = `${mapping.suggested_column} ${mapping.data_type.toUpperCase()}`;
  
  if (mapping.constraints.includes('NOT NULL')) {
    definition += ' NOT NULL';
  }
  
  if (mapping.is_potential_fk && mapping.fk_target) {
    definition += ` REFERENCES public.${mapping.fk_target.table}(${mapping.fk_target.column})`;
  }
  
  return definition;
}

function sanitizeTableName(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^[0-9]/, 't$&')
    .substring(0, 63);
}

function estimateDuration(operations: MigrationOperation[]): string {
  const baseTime = 30;
  const operationTime = operations.length * 15;
  const totalSeconds = baseTime + operationTime;
  
  if (totalSeconds < 60) return `${totalSeconds} seconds`;
  if (totalSeconds < 3600) return `${Math.ceil(totalSeconds / 60)} minutes`;
  return `${Math.ceil(totalSeconds / 3600)} hours`;
}

async function performSafetyChecks(migrationPlan: any, existingTables: any[]): Promise<SafetyCheck[]> {
  const checks: SafetyCheck[] = [];
  
  // Check for high-risk operations
  const hasHighRisk = migrationPlan.operations.some((op: any) => op.risk_level === 'high');
  checks.push({
    type: 'data_integrity',
    passed: !hasHighRisk,
    description: 'Assess data integrity impact',
    warning: hasHighRisk ? 'Some operations have high risk impact' : undefined,
    blocking: hasHighRisk
  });
  
  // Check performance impact
  const tableCount = existingTables.length;
  const newOperations = migrationPlan.operations.length;
  const impactScore = tableCount > 0 ? (newOperations / tableCount) * 100 : 0;
  
  checks.push({
    type: 'performance',
    passed: impactScore < 50,
    description: 'Evaluate performance impact of migration',
    warning: impactScore >= 50 ? 'Migration may impact database performance' : undefined,
    blocking: false
  });
  
  // Check security
  const hasRLSOperations = migrationPlan.operations.some((op: any) => op.type === 'add_rls_policy');
  checks.push({
    type: 'security',
    passed: hasRLSOperations,
    description: 'Verify security policies are in place',
    warning: !hasRLSOperations ? 'Consider adding RLS policies for new tables' : undefined,
    blocking: false
  });
  
  return checks;
}

function generateRecommendations(
  patterns: ImportDataPattern[],
  migrationPlan: any,
  safetyChecks: SafetyCheck[]
): string[] {
  const recommendations: string[] = [];
  
  const highConfidencePatterns = patterns.filter(p => p.confidence_score > 0.8);
  if (highConfidencePatterns.length > 0) {
    recommendations.push(`${highConfidencePatterns.length} high-confidence table matches found - safe to proceed`);
  }
  
  const failedChecks = safetyChecks.filter(check => !check.passed);
  if (failedChecks.length > 0) {
    recommendations.push(`${failedChecks.length} safety concerns detected - review before proceeding`);
  }
  
  if (patterns.some(p => p.suggested_enhancements.length > 0)) {
    recommendations.push('Schema enhancements suggested for optimal performance and security');
  }
  
  return recommendations;
}

function determineStatusAndNextSteps(
  patterns: ImportDataPattern[],
  migrationPlan: any,
  safetyChecks: SafetyCheck[],
  userPreferences?: any
): { status: string; nextSteps: string[] } {
  const nextSteps: string[] = [];
  
  const blockingIssues = safetyChecks.filter(check => !check.passed && check.blocking);
  if (blockingIssues.length > 0) {
    return {
      status: 'error',
      nextSteps: [
        'Resolve blocking safety issues before proceeding',
        ...blockingIssues.map(issue => `Fix: ${issue.description}`)
      ]
    };
  }
  
  const requiresApproval = userPreferences?.require_manual_approval || 
                         migrationPlan.operations.some((op: any) => op.risk_level === 'high') ||
                         patterns.some(p => p.confidence_score < 0.7);
  
  if (requiresApproval) {
    nextSteps.push(
      'Review migration plan and safety checks',
      'Approve or modify planned operations',
      'Execute migration with monitoring'
    );
    return { status: 'requires_approval', nextSteps };
  }
  
  const warnings = safetyChecks.filter(check => !check.passed && !check.blocking);
  if (warnings.length > 0) {
    nextSteps.push(
      'Review warning conditions',
      'Consider applying suggested fixes',
      'Proceed with caution if acceptable'
    );
    return { status: 'warning', nextSteps };
  }
  
  nextSteps.push(
    'Review and approve migration plan',
    'Execute approved operations',
    'Import data into updated schema'
  );
  
  return { status: 'success', nextSteps };
}