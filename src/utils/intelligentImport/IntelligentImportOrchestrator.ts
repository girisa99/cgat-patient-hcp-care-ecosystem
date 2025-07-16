/**
 * Intelligent Import Orchestrator - Main Business Logic Coordinator
 * Coordinates all components of the advanced import system
 */

import { advancedSchemaAnalyzer } from './AdvancedSchemaAnalyzer';
import { migrationGenerator } from './MigrationGenerator';
import { typeScriptGenerator } from './TypeScriptGenerator';
import type { 
  SchemaAnalysisResult, 
  ImportDataPattern
} from './AdvancedSchemaAnalyzer';
import type { MigrationPlan, SafetyCheck } from './MigrationGenerator';
import type { TypeGenerationResult } from './TypeScriptGenerator';

export interface IntelligentImportRequest {
  data: Record<string, any>[];
  source_name: string;
  user_preferences?: {
    auto_apply_safe_migrations?: boolean;
    generate_typescript?: boolean;
    enforce_naming_conventions?: boolean;
    require_manual_approval?: boolean;
  };
}

export interface IntelligentImportResult {
  import_session_id: string;
  analysis: SchemaAnalysisResult;
  patterns: ImportDataPattern[];
  migration_plan?: MigrationPlan;
  safety_checks: SafetyCheck[];
  typescript_generation?: TypeGenerationResult;
  recommendations: string[];
  status: 'success' | 'warning' | 'requires_approval' | 'error';
  next_steps: string[];
}

export interface IntelligentImportConfig {
  max_data_analysis_records: number;
  confidence_threshold: number;
  auto_migration_risk_threshold: 'low' | 'medium' | 'high';
  naming_convention_enforcement: boolean;
  typescript_generation_enabled: boolean;
  safety_checks_enabled: boolean;
}

export class IntelligentImportOrchestrator {
  private config: IntelligentImportConfig;
  
  constructor(config?: Partial<IntelligentImportConfig>) {
    this.config = {
      max_data_analysis_records: 100,
      confidence_threshold: 0.7,
      auto_migration_risk_threshold: 'low',
      naming_convention_enforcement: true,
      typescript_generation_enabled: true,
      safety_checks_enabled: true,
      ...config
    };
  }
  
  /**
   * Main entry point for intelligent import processing
   */
  async processIntelligentImport(request: IntelligentImportRequest): Promise<IntelligentImportResult> {
    console.log('🚀 Starting intelligent import process...');
    
    const sessionId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Step 1: Analyze existing schema
      console.log('📊 Analyzing existing database schema...');
      const existingSchema = await advancedSchemaAnalyzer.analyzeCompleteSchema();
      
      // Step 2: Analyze import data patterns
      console.log('🔍 Analyzing import data patterns...');
      const analysisData = request.data.slice(0, this.config.max_data_analysis_records);
      const importPatterns = await advancedSchemaAnalyzer.analyzeImportDataPatterns(analysisData, existingSchema);
      
      // Filter patterns by confidence threshold
      const validPatterns = importPatterns.filter(pattern => 
        pattern.confidence_score >= this.config.confidence_threshold
      );
      
      // Step 3: Generate migration plan
      console.log('🔧 Generating migration plan...');
      const migrationPlan = await migrationGenerator.generateMigrationPlan(
        validPatterns,
        existingSchema,
        request.data
      );
      
      // Step 4: Perform safety checks
      console.log('🛡️ Performing safety checks...');
      const safetyChecks = this.config.safety_checks_enabled 
        ? await migrationGenerator.performSafetyChecks(migrationPlan, existingSchema)
        : [];
      
      // Step 5: Generate TypeScript definitions if enabled
      let typescriptGeneration: TypeGenerationResult | undefined;
      if (this.config.typescript_generation_enabled && request.user_preferences?.generate_typescript !== false) {
        console.log('📝 Generating TypeScript definitions...');
        typescriptGeneration = await typeScriptGenerator.generateTypeDefinitions(existingSchema, migrationPlan);
      }
      
      // Step 6: Generate recommendations and determine next steps
      const recommendations = this.generateRecommendations(
        existingSchema,
        validPatterns,
        migrationPlan,
        safetyChecks
      );
      
      const { status, nextSteps } = this.determineStatusAndNextSteps(
        validPatterns,
        migrationPlan,
        safetyChecks,
        request.user_preferences
      );
      
      console.log(`✅ Intelligent import analysis complete. Status: ${status}`);
      
      return {
        import_session_id: sessionId,
        analysis: existingSchema,
        patterns: validPatterns,
        migration_plan: migrationPlan,
        safety_checks: safetyChecks,
        typescript_generation: typescriptGeneration,
        recommendations,
        status,
        next_steps: nextSteps
      };
      
    } catch (error) {
      console.error('❌ Intelligent import process failed:', error);
      
      return {
        import_session_id: sessionId,
        analysis: { tables: [], relationships: {}, dependencyGraph: [], namingConventions: { consistent_snake_case: false, consistent_table_naming: false, consistent_column_naming: false, typescript_compatible: false, issues: [], suggestions: [] }, potentialIssues: [], enhancement_suggestions: [] },
        patterns: [],
        safety_checks: [],
        recommendations: [`Import process failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        status: 'error',
        next_steps: ['Review error details and try again with corrected data']
      };
    }
  }
  
  /**
   * Execute approved migration plan
   */
  async executeMigrationPlan(
    migrationPlan: MigrationPlan,
    sessionId: string,
    dryRun: boolean = false
  ): Promise<{
    success: boolean;
    executed_operations: string[];
    failed_operations: string[];
    rollback_instructions: string[];
    error?: string;
  }> {
    console.log(`${dryRun ? '🧪 Dry run:' : '⚡'} Executing migration plan...`);
    
    const executedOperations: string[] = [];
    const failedOperations: string[] = [];
    const rollbackInstructions: string[] = [];
    
    if (dryRun) {
      // In dry run mode, just validate operations
      for (const operation of migrationPlan.operations) {
        try {
          const sqlValidation = migrationGenerator.generateSafeSQL(operation);
          executedOperations.push(`DRY RUN: ${operation.description}`);
          rollbackInstructions.push(sqlValidation.rollback_sql);
        } catch (error) {
          failedOperations.push(`DRY RUN FAILED: ${operation.description} - ${error}`);
        }
      }
    } else {
      // TODO: Actual execution would go here
      // This would require careful transaction management and error handling
      console.log('🚧 Actual migration execution not implemented yet - safety measure');
      return {
        success: false,
        executed_operations: [],
        failed_operations: ['Actual migration execution not implemented - use migration plan to execute manually'],
        rollback_instructions: [],
        error: 'Actual execution requires additional safety measures and testing'
      };
    }
    
    return {
      success: failedOperations.length === 0,
      executed_operations: executedOperations,
      failed_operations: failedOperations,
      rollback_instructions: rollbackInstructions.reverse()
    };
  }
  
  /**
   * Generate import summary and statistics
   */
  async generateImportSummary(
    result: IntelligentImportResult,
    recordCount: number
  ): Promise<{
    overview: string;
    table_changes: string[];
    relationship_changes: string[];
    security_considerations: string[];
    performance_impact: string;
    typescript_updates: string[];
  }> {
    const overview = `
Intelligent Import Analysis Summary:
- ${recordCount} records analyzed
- ${result.patterns.length} table patterns identified
- ${result.migration_plan?.operations.length || 0} migration operations planned
- ${result.safety_checks.filter(c => c.passed).length}/${result.safety_checks.length} safety checks passed
    `.trim();
    
    const tableChanges = result.migration_plan?.operations
      .filter(op => op.type === 'create_table' || op.type === 'alter_table')
      .map(op => op.description) || [];
    
    const relationshipChanges = result.migration_plan?.operations
      .filter(op => op.type === 'add_constraint')
      .map(op => op.description) || [];
    
    const securityConsiderations = [
      ...result.safety_checks
        .filter(check => check.type === 'security' && !check.passed)
        .map(check => check.description),
      ...result.migration_plan?.operations
        .filter(op => op.type === 'add_rls_policy')
        .map(op => op.description) || []
    ];
    
    const performanceImpact = result.migration_plan?.estimated_duration || 'No changes required';
    
    const typescriptUpdates = result.typescript_generation?.updated_files || [];
    
    return {
      overview,
      table_changes: tableChanges,
      relationship_changes: relationshipChanges,
      security_considerations: securityConsiderations,
      performance_impact: performanceImpact,
      typescript_updates: typescriptUpdates
    };
  }
  
  /**
   * Private helper methods
   */
  private generateRecommendations(
    existingSchema: SchemaAnalysisResult,
    patterns: ImportDataPattern[],
    migrationPlan: MigrationPlan,
    safetyChecks: SafetyCheck[]
  ): string[] {
    const recommendations: string[] = [];
    
    // High-confidence patterns
    const highConfidencePatterns = patterns.filter(p => p.confidence_score > 0.8);
    if (highConfidencePatterns.length > 0) {
      recommendations.push(`${highConfidencePatterns.length} high-confidence table matches found - safe to proceed`);
    }
    
    // Low-confidence patterns
    const lowConfidencePatterns = patterns.filter(p => p.confidence_score < 0.6);
    if (lowConfidencePatterns.length > 0) {
      recommendations.push(`${lowConfidencePatterns.length} low-confidence matches require manual review`);
    }
    
    // Safety check warnings
    const failedChecks = safetyChecks.filter(check => !check.passed);
    if (failedChecks.length > 0) {
      recommendations.push(`${failedChecks.length} safety concerns detected - review before proceeding`);
    }
    
    // Schema enhancement suggestions
    if (existingSchema.enhancement_suggestions.length > 0) {
      recommendations.push(`${existingSchema.enhancement_suggestions.length} schema enhancements available`);
    }
    
    // Naming convention issues
    if (!existingSchema.namingConventions.consistent_snake_case) {
      recommendations.push('Consider standardizing to snake_case naming convention');
    }
    
    // Performance recommendations
    const indexSuggestions = existingSchema.enhancement_suggestions.filter(s => s.type === 'add_index');
    if (indexSuggestions.length > 0) {
      recommendations.push(`${indexSuggestions.length} performance-improving indexes suggested`);
    }
    
    return recommendations;
  }
  
  private determineStatusAndNextSteps(
    patterns: ImportDataPattern[],
    migrationPlan: MigrationPlan,
    safetyChecks: SafetyCheck[],
    userPreferences?: IntelligentImportRequest['user_preferences']
  ): { status: IntelligentImportResult['status']; nextSteps: string[] } {
    const nextSteps: string[] = [];
    
    // Check for blocking safety issues
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
    
    // Check if manual approval is required
    const requiresApproval = userPreferences?.require_manual_approval || 
                           migrationPlan.operations.some(op => op.risk_level === 'high') ||
                           patterns.some(p => p.confidence_score < 0.7);
    
    if (requiresApproval) {
      nextSteps.push(
        'Review migration plan and safety checks',
        'Approve or modify planned operations',
        'Execute migration with monitoring'
      );
      return { status: 'requires_approval', nextSteps };
    }
    
    // Check for warnings
    const warnings = safetyChecks.filter(check => !check.passed && !check.blocking);
    if (warnings.length > 0) {
      nextSteps.push(
        'Review warning conditions',
        'Consider applying suggested fixes',
        'Proceed with caution if acceptable'
      );
      return { status: 'warning', nextSteps };
    }
    
    // All good - can proceed automatically if configured
    if (userPreferences?.auto_apply_safe_migrations && 
        migrationPlan.operations.every(op => op.risk_level === 'low')) {
      nextSteps.push(
        'Auto-applying safe migrations',
        'Monitoring execution progress',
        'Import data after schema updates'
      );
    } else {
      nextSteps.push(
        'Review and approve migration plan',
        'Execute approved operations',
        'Import data into updated schema'
      );
    }
    
    return { status: 'success', nextSteps };
  }
}

export const intelligentImportOrchestrator = new IntelligentImportOrchestrator();