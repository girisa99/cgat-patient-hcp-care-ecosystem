/**
 * Intelligent Import Orchestrator - Main Business Logic Coordinator
 * Coordinates all components of the advanced import system
 * Ensures no mock data, validates real database usage, prevents duplicates
 * Integrates with comprehensive stability framework
 */

import { advancedSchemaAnalyzer } from './AdvancedSchemaAnalyzer';
import { MockDataDetector } from '@/utils/verification/MockDataDetector';
import { DuplicateDetector } from '@/utils/duplicate-prevention-bridge';
import { FrameworkValidator } from '../../../duplicate-prevention/core/validator.js';
import { ComponentRegistry } from '../../../duplicate-prevention/core/registry.js';
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
  framework_compliance?: {
    validated: boolean;
    no_duplicates: boolean;
    no_mock_data: boolean;
    real_database_usage: boolean;
    stability_monitoring: boolean;
    prompt_governance: boolean;
  };
}

export interface IntelligentImportConfig {
  max_data_analysis_records: number;
  confidence_threshold: number;
  auto_migration_risk_threshold: 'low' | 'medium' | 'high';
  naming_convention_enforcement: boolean;
  typescript_generation_enabled: boolean;
  safety_checks_enabled: boolean;
  
  // Framework compliance settings
  prevent_mock_data: boolean;
  prevent_duplicates: boolean;
  enforce_real_database_usage: boolean;
  stability_monitoring_enabled: boolean;
  prompt_governance_enabled: boolean;
}

export class IntelligentImportOrchestrator {
  private config: IntelligentImportConfig;
  
  // Framework protection components
  private frameworkValidator: FrameworkValidator;
  private componentRegistry: ComponentRegistry;
  private duplicateDetector: DuplicateDetector;
  private backgroundMonitoring: NodeJS.Timeout | null = null;
  
  constructor(config?: Partial<IntelligentImportConfig>) {
    this.config = {
      max_data_analysis_records: 100,
      confidence_threshold: 0.7,
      auto_migration_risk_threshold: 'low',
      naming_convention_enforcement: true,
      typescript_generation_enabled: true,
      safety_checks_enabled: true,
      
      // Framework compliance defaults
      prevent_mock_data: true,
      prevent_duplicates: true,
      enforce_real_database_usage: true,
      stability_monitoring_enabled: true,
      prompt_governance_enabled: true,
      
      ...config
    };
    
    // Initialize framework protection
    this.frameworkValidator = new FrameworkValidator({
      strictMode: true,
      preventMockData: this.config.prevent_mock_data,
      preventDuplicates: this.config.prevent_duplicates,
      enforceNamingConventions: this.config.naming_convention_enforcement,
      requireRealDatabaseUsage: this.config.enforce_real_database_usage
    });
    
    this.componentRegistry = new ComponentRegistry();
    this.duplicateDetector = new DuplicateDetector();
    
    // Start background monitoring if enabled
    if (this.config.stability_monitoring_enabled) {
      this.initializeBackgroundMonitoring();
    }
  }
  
  /**
   * Main entry point for intelligent import processing
   */
  async processIntelligentImport(request: IntelligentImportRequest): Promise<IntelligentImportResult> {
    console.log('🚀 Starting intelligent import process...');
    
    const sessionId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Pre-import framework compliance validation
      await this.validateFrameworkCompliance(request);
      console.log('✅ Framework compliance validated');
      
      // Check for duplicates before proceeding
      await this.validateNoDuplicates(request.source_name);
      console.log('✅ No duplicates detected');
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

  /**
   * Validate framework compliance before processing import
   */
  private async validateFrameworkCompliance(request: IntelligentImportRequest): Promise<void> {
    console.log('🔍 Validating framework compliance...');
    
    if (!this.config.prevent_mock_data && !this.config.prevent_duplicates) {
      return; // Skip if compliance checks are disabled
    }
    
    // 1. Check for mock data patterns in the import data
    if (this.config.prevent_mock_data) {
      for (const record of request.data.slice(0, 10)) { // Sample first 10 records
        const recordStr = JSON.stringify(record);
        
        // Check for mock data indicators
        const mockPatterns = [
          /test@|mock@|dummy@|sample@/i,
          /john|jane|test|sample|mock/i,
          /lorem\s+ipsum/i,
          /placeholder/i,
          /\b(test|mock|dummy|fake|sample)[\s_-]?(user|data|value|name|email)\b/i
        ];
        
        for (const pattern of mockPatterns) {
          if (pattern.test(recordStr)) {
            throw new Error(`Framework violation: Mock/test data detected in import data. Use only real data from database sources.`);
          }
        }
      }
    }
    
    // 2. Validate source name doesn't indicate test data
    if (this.config.prevent_mock_data) {
      const forbiddenNames = ['test', 'mock', 'dummy', 'sample', 'placeholder', 'seed'];
      if (forbiddenNames.some(name => request.source_name.toLowerCase().includes(name))) {
        throw new Error(`Framework violation: Source name "${request.source_name}" suggests test/mock data. Use meaningful names for real data sources.`);
      }
    }
    
    // 3. Run comprehensive framework validation
    const validationResult = await this.frameworkValidator.validateProject();
    
    if (!validationResult.isValid && validationResult.violations.some(v => v.severity === 'critical')) {
      const criticalViolations = validationResult.violations
        .filter(v => v.severity === 'critical')
        .map(v => v.message)
        .join('; ');
      throw new Error(`Framework validation failed: ${criticalViolations}`);
    }
    
    console.log('✅ Framework compliance validated successfully');
  }

  /**
   * Check for duplicate tables/schemas before import
   */
  private async validateNoDuplicates(sourceName: string): Promise<void> {
    if (!this.config.prevent_duplicates) {
      return; // Skip if duplicate prevention is disabled
    }
    
    console.log('🔍 Checking for duplicate tables/schemas...');
    
    // Check component registry for similar functionality
    const similar = this.componentRegistry.findSimilar('service', `Import service for ${sourceName} data`);
    
    if (similar.length > 0 && similar[0].similarity > 0.8) {
      throw new Error(
        `Duplicate prevention: Similar import functionality already exists: ${similar[0].name} ` +
        `(${Math.round(similar[0].similarity * 100)}% similar). ` +
        `Consider extending existing implementation or choose different approach.`
      );
    }
    
    console.log('✅ No duplicates detected');
  }

  /**
   * Register import component in the component registry
   */
  private async registerImportComponent(sourceName: string, schema: any): Promise<void> {
    const componentName = `${sourceName}ImportService`;
    
    try {
      this.componentRegistry.registerService(componentName, {
        filePath: `src/utils/intelligentImport/${componentName}.ts`,
        functionality: `Import service for ${sourceName} data processing and analysis`,
        category: 'data-import',
        methods: ['processImport', 'validateData', 'transformData', 'generateSchema'],
        sourceName,
        schema,
        generatedBy: 'IntelligentImportOrchestrator',
        timestamp: new Date().toISOString(),
        frameworkCompliant: true
      });
      
      console.log(`📝 Registered import component: ${componentName}`);
    } catch (error) {
      console.warn(`⚠️ Failed to register component: ${error.message}`);
      // Don't fail the import process, just log the warning
    }
  }

  /**
   * Initialize background monitoring for framework compliance
   */
  private initializeBackgroundMonitoring(): void {
    console.log('🔄 Starting background framework monitoring...');
    
    // Run monitoring every 30 seconds
    this.backgroundMonitoring = setInterval(async () => {
      try {
        await this.performBackgroundCheck();
      } catch (error) {
        console.error('Background monitoring error:', error);
      }
    }, 30000);
  }

  /**
   * Perform periodic background compliance checks
   */
  private async performBackgroundCheck(): Promise<void> {
    if (!this.config.stability_monitoring_enabled) {
      return;
    }
    
    try {
      // 1. Check for new mock data violations
      if (this.config.prevent_mock_data) {
        const mockDataAnalysis = await MockDataDetector.analyzeMockDataUsage();
        if (mockDataAnalysis.violations.length > 0) {
          console.warn(`⚠️ Background check: ${mockDataAnalysis.violations.length} mock data violations detected`);
        }
      }
      
      // 2. Check for new duplicates
      if (this.config.prevent_duplicates) {
        const duplicateStats = this.duplicateDetector.getDuplicateStats();
        if (duplicateStats.totalDuplicates > 0) {
          console.warn(`⚠️ Background check: ${duplicateStats.totalDuplicates} duplicates detected`);
        }
      }
      
      // 3. Validate overall framework compliance
      const validationResult = await this.frameworkValidator.validateProject();
      if (!validationResult.isValid) {
        console.warn(`⚠️ Background check: Framework compliance issues detected (${validationResult.violations.length} violations)`);
      }
      
    } catch (error) {
      console.error('Background check failed:', error);
    }
  }

  /**
   * Stop background monitoring
   */
  public stopBackgroundMonitoring(): void {
    if (this.backgroundMonitoring) {
      clearInterval(this.backgroundMonitoring);
      this.backgroundMonitoring = null;
      console.log('🛑 Background monitoring stopped');
    }
  }

  /**
   * Get current framework compliance status
   */
  public async getFrameworkComplianceStatus(): Promise<{
    overall_compliant: boolean;
    mock_data_score: number;
    duplicate_count: number;
    validation_summary: any;
    monitoring_active: boolean;
  }> {
    const mockDataAnalysis = await MockDataDetector.analyzeMockDataUsage();
    const duplicateStats = this.duplicateDetector.getDuplicateStats();
    const validationResult = await this.frameworkValidator.validateProject();
    
    return {
      overall_compliant: validationResult.isValid && mockDataAnalysis.violations.length === 0 && duplicateStats.totalDuplicates === 0,
      mock_data_score: mockDataAnalysis.databaseUsageScore,
      duplicate_count: duplicateStats.totalDuplicates,
      validation_summary: {
        violations: validationResult.violations.length,
        warnings: validationResult.warnings.length,
        recommendations: validationResult.recommendations.length
      },
      monitoring_active: this.backgroundMonitoring !== null
    };
  }
}

export const intelligentImportOrchestrator = new IntelligentImportOrchestrator();