/**
 * Update First Gateway
 * Single source of truth for all development decisions
 * Enforces "Update First" rule before any new code creation
 * NOW INCLUDES: Services, Classes, Methods, Mock Data Prevention, AND Database Schema Analysis
 */

import { ComponentRegistryScanner } from './ComponentRegistryScanner';
import { ServiceClassScanner } from './ServiceClassScanner';
import { MockDataDetector } from './MockDataDetector';
import { TypeScriptPatternScanner } from './TypeScriptPatternScanner';
import { DatabaseSchemaAnalyzer, SchemaChangeRequest } from './DatabaseSchemaAnalyzer';
import { moduleRegistry } from '@/utils/moduleRegistry';
import { supabase } from '@/integrations/supabase/client';

export interface DevelopmentRequest {
  type: 'hook' | 'component' | 'module' | 'template' | 'utility' | 'service' | 'class' | 'method' | 'table' | 'column' | 'constraint' | 'index';
  name: string;
  tableName?: string;
  functionality: string[];
  description?: string;
  requiredFields?: string[];
  schemaDetails?: any; // For database-related requests
}

export interface UpdateFirstAnalysis {
  shouldProceed: boolean;
  canProceed: boolean;
  blockingReasons: string[];
  existingAlternatives: string[];
  updateRecommendations: string[];
  reuseOpportunities: string[];
  preventDuplicateScore: number; // 0-100, higher = more likely to be duplicate
  mandatoryUpdates: string[];
  approvedForCreation: boolean;
  mockDataViolations: number;
  typeSafetyScore: number;
  schemaQualityScore: number; // NEW: Database schema quality
  schemaDuplicateRisk: number; // NEW: Schema duplicate risk
}

export class UpdateFirstGateway {
  /**
   * COMPREHENSIVE MANDATORY PRE-CREATION CHECK
   * Every new development request MUST go through this gateway
   * NOW COVERS: Components, Hooks, Services, Classes, Methods, Mock Data Prevention, AND Database Schema
   */
  static async enforceUpdateFirst(request: DevelopmentRequest): Promise<UpdateFirstAnalysis> {
    console.log('🚨 COMPREHENSIVE UPDATE FIRST GATEWAY ACTIVATED (Including Database Schema) for:', request);
    console.log('🔍 Performing comprehensive duplicate detection with services, classes, mock data prevention, and database schema analysis...');

    const analysis: UpdateFirstAnalysis = {
      shouldProceed: false,
      canProceed: false,
      blockingReasons: [],
      existingAlternatives: [],
      updateRecommendations: [],
      reuseOpportunities: [],
      preventDuplicateScore: 0,
      mandatoryUpdates: [],
      approvedForCreation: false,
      mockDataViolations: 0,
      typeSafetyScore: 0,
      schemaQualityScore: 0,
      schemaDuplicateRisk: 0
    };

    try {
      // Step 1: Check for exact duplicates (BLOCKING)
      const exactDuplicates = await this.findExactDuplicates(request);
      if (exactDuplicates.length > 0) {
        analysis.blockingReasons.push(`❌ EXACT DUPLICATE FOUND: ${exactDuplicates.join(', ')}`);
        analysis.preventDuplicateScore += 50;
      }

      // Step 2: Check for functional duplicates (BLOCKING)
      const functionalDuplicates = await this.findFunctionalDuplicates(request);
      if (functionalDuplicates.length > 0) {
        analysis.blockingReasons.push(`❌ FUNCTIONAL DUPLICATE FOUND: ${functionalDuplicates.join(', ')}`);
        analysis.preventDuplicateScore += 30;
      }

      // Step 3: Check services and classes
      const serviceClassDuplicates = await this.checkServiceClassDuplicates(request);
      if (serviceClassDuplicates.length > 0) {
        analysis.blockingReasons.push(`❌ SERVICE/CLASS DUPLICATE FOUND: ${serviceClassDuplicates.join(', ')}`);
        analysis.preventDuplicateScore += 40;
      }

      // Step 4: Check for mock data prevention
      const mockDataCheck = await this.checkMockDataPrevention(request);
      analysis.mockDataViolations = mockDataCheck.violations;
      if (mockDataCheck.violations > 0) {
        analysis.blockingReasons.push(`❌ MOCK DATA USAGE DETECTED: ${mockDataCheck.violations} violations found`);
        analysis.preventDuplicateScore += 20;
      }

      // Step 5: TypeScript pattern analysis
      const typeScriptAnalysis = await this.analyzeTypeScriptPatterns(request);
      analysis.typeSafetyScore = typeScriptAnalysis.typeSafetyScore;
      if (typeScriptAnalysis.typeSafetyScore < 70) {
        analysis.updateRecommendations.push(`⚠️ LOW TYPE SAFETY SCORE: ${typeScriptAnalysis.typeSafetyScore}/100`);
      }

      // Step 6: NEW - Database Schema Analysis
      const schemaAnalysis = await this.analyzeDatabaseSchema(request);
      analysis.schemaQualityScore = schemaAnalysis.schemaQualityScore;
      analysis.schemaDuplicateRisk = schemaAnalysis.schemaDuplicateRisk;
      
      if (schemaAnalysis.conflicts.length > 0) {
        analysis.blockingReasons.push(`❌ SCHEMA CONFLICTS: ${schemaAnalysis.conflicts.join(', ')}`);
        analysis.preventDuplicateScore += schemaAnalysis.schemaDuplicateRisk;
      }

      if (schemaAnalysis.schemaQualityScore < 70) {
        analysis.updateRecommendations.push(`⚠️ LOW SCHEMA QUALITY SCORE: ${schemaAnalysis.schemaQualityScore}/100`);
      }

      // Step 7: Check module registry for existing modules
      const existingModules = await this.checkModuleRegistry(request);
      if (existingModules.length > 0) {
        analysis.existingAlternatives.push(...existingModules);
        analysis.preventDuplicateScore += 20;
      }

      // Step 8: Scan component registry for reuse opportunities
      const reuseOpportunities = await ComponentRegistryScanner.findReuseOpportunities({
        tableName: request.tableName,
        functionality: request.functionality,
        componentType: request.type === 'module' ? 'component' : request.type as 'hook' | 'component' | 'template'
      });
      analysis.reuseOpportunities.push(...reuseOpportunities);

      // Step 9: Check database for existing implementations
      const databaseAlternatives = await this.checkDatabaseForAlternatives(request);
      analysis.existingAlternatives.push(...databaseAlternatives);

      // Step 10: Generate update recommendations
      analysis.updateRecommendations.push(...await this.generateUpdateRecommendations(request, analysis));

      // Step 11: Determine if creation should proceed
      analysis.canProceed = analysis.blockingReasons.length === 0;
      analysis.shouldProceed = analysis.canProceed && analysis.preventDuplicateScore < 70;
      analysis.approvedForCreation = analysis.shouldProceed && 
                                   analysis.updateRecommendations.length === 0 &&
                                   analysis.mockDataViolations === 0 &&
                                   analysis.typeSafetyScore >= 70 &&
                                   analysis.schemaQualityScore >= 70 &&
                                   analysis.schemaDuplicateRisk < 50;

      // Step 12: Log the decision
      await this.logUpdateFirstDecision(request, analysis);

      console.log('📊 COMPREHENSIVE UPDATE FIRST ANALYSIS COMPLETE (Including Database Schema):', {
        canProceed: analysis.canProceed,
        shouldProceed: analysis.shouldProceed,
        preventDuplicateScore: analysis.preventDuplicateScore,
        blockingReasons: analysis.blockingReasons.length,
        alternatives: analysis.existingAlternatives.length,
        mockDataViolations: analysis.mockDataViolations,
        typeSafetyScore: analysis.typeSafetyScore,
        schemaQualityScore: analysis.schemaQualityScore,
        schemaDuplicateRisk: analysis.schemaDuplicateRisk
      });

      return analysis;

    } catch (error) {
      console.error('❌ COMPREHENSIVE UPDATE FIRST GATEWAY ERROR:', error);
      analysis.blockingReasons.push(`System error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return analysis;
    }
  }

  /**
   * Find exact name duplicates (ENHANCED)
   */
  private static async findExactDuplicates(request: DevelopmentRequest): Promise<string[]> {
    const duplicates: string[] = [];

    // Check component registry
    const inventory = await ComponentRegistryScanner.scanAllComponents();
    
    // Check hooks
    const duplicateHooks = inventory.hooks.filter(hook => 
      hook.name.toLowerCase() === request.name.toLowerCase()
    );
    duplicates.push(...duplicateHooks.map(h => `Hook: ${h.name}`));

    // Check components
    const duplicateComponents = inventory.components.filter(comp => 
      comp.name.toLowerCase() === request.name.toLowerCase()
    );
    duplicates.push(...duplicateComponents.map(c => `Component: ${c.name}`));

    // Check templates
    const duplicateTemplates = inventory.templates.filter(template => 
      template.name.toLowerCase() === request.name.toLowerCase()
    );
    duplicates.push(...duplicateTemplates.map(t => `Template: ${t.name}`));

    // NEW: Check services and classes
    const serviceClassInventory = await ServiceClassScanner.scanAllServicesAndClasses();
    
    // Check services
    const duplicateServices = serviceClassInventory.services.filter(service =>
      service.name.toLowerCase() === request.name.toLowerCase()
    );
    duplicates.push(...duplicateServices.map(s => `Service: ${s.name}`));

    // Check classes
    const duplicateClasses = serviceClassInventory.classes.filter(cls =>
      cls.name.toLowerCase() === request.name.toLowerCase()
    );
    duplicates.push(...duplicateClasses.map(c => `Class: ${c.name}`));

    // Check methods
    if (request.type === 'method') {
      const duplicateMethods = serviceClassInventory.methods.filter(method =>
        method.name.toLowerCase() === request.name.toLowerCase()
      );
      duplicates.push(...duplicateMethods.map(m => `Method: ${m.name} in ${m.filePath}`));
    }

    return duplicates;
  }

  /**
   * Find functional duplicates (ENHANCED)
   */
  private static async findFunctionalDuplicates(request: DevelopmentRequest): Promise<string[]> {
    const duplicates: string[] = [];
    const inventory = await ComponentRegistryScanner.scanAllComponents();
    const serviceClassInventory = await ServiceClassScanner.scanAllServicesAndClasses();

    // Check for same table + same type combinations
    if (request.tableName) {
      const sameTableHooks = inventory.hooks.filter(hook => 
        hook.tableName === request.tableName && 
        request.type === 'hook'
      );
      duplicates.push(...sameTableHooks.map(h => `Table Hook: ${h.name} (${h.tableName})`));
    }

    // Check for overlapping functionality in hooks
    const functionalOverlap = inventory.hooks.filter(hook => 
      hook.functionality.some(func => 
        request.functionality.some(reqFunc => 
          func.toLowerCase().includes(reqFunc.toLowerCase()) ||
          reqFunc.toLowerCase().includes(func.toLowerCase())
        )
      )
    );
    duplicates.push(...functionalOverlap.map(h => `Functional Overlap: ${h.name}`));

    // NEW: Check for overlapping functionality in services
    const serviceFunctionalOverlap = serviceClassInventory.services.filter(service =>
      request.functionality.some(reqFunc =>
        service.methods.some(method =>
          method.toLowerCase().includes(reqFunc.toLowerCase()) ||
          reqFunc.toLowerCase().includes(method.toLowerCase())
        )
      )
    );
    duplicates.push(...serviceFunctionalOverlap.map(s => `Service Functional Overlap: ${s.name}`));

    return duplicates;
  }

  /**
   * Check for service and class duplicates (NEW!)
   */
  private static async checkServiceClassDuplicates(request: DevelopmentRequest): Promise<string[]> {
    const duplicates: string[] = [];
    
    try {
      const { services, classes, methods, utilities } = await ServiceClassScanner.scanAllServicesAndClasses();

      // Check for service duplicates
      if (request.type === 'service' || request.type === 'class') {
        const existingServices = services.filter(service =>
          service.name.toLowerCase().includes(request.name.toLowerCase()) ||
          request.name.toLowerCase().includes(service.name.toLowerCase())
        );
        duplicates.push(...existingServices.map(s => `Similar Service: ${s.name} (${s.filePath})`));

        const existingClasses = classes.filter(cls =>
          cls.name.toLowerCase().includes(request.name.toLowerCase()) ||
          request.name.toLowerCase().includes(cls.name.toLowerCase())
        );
        duplicates.push(...existingClasses.map(c => `Similar Class: ${c.name} (${c.filePath})`));
      }

      // Check for method duplicates
      if (request.type === 'method') {
        const existingMethods = methods.filter(method =>
          method.name.toLowerCase() === request.name.toLowerCase()
        );
        duplicates.push(...existingMethods.map(m => `Method Exists: ${m.name} in ${m.filePath}`));
      }

      // Check for utility duplicates
      const existingUtilities = utilities.filter(utility =>
        utility.name.toLowerCase().includes(request.name.toLowerCase()) ||
        request.name.toLowerCase().includes(utility.name.toLowerCase())
      );
      duplicates.push(...existingUtilities.map(u => `Similar Utility: ${u.name} (${u.filePath})`));

    } catch (error) {
      console.warn('Service/Class duplicate check failed:', error);
    }

    return duplicates;
  }

  /**
   * Check for mock data prevention (NEW!)
   */
  private static async checkMockDataPrevention(request: DevelopmentRequest): Promise<{
    violations: number;
    issues: string[];
  }> {
    try {
      const mockDataAnalysis = await MockDataDetector.analyzeMockDataUsage();
      
      // Check if the request involves creating mock data
      const mockDataKeywords = ['mock', 'dummy', 'fake', 'test', 'sample', 'placeholder'];
      const requestContainsMockData = mockDataKeywords.some(keyword =>
        request.name.toLowerCase().includes(keyword) ||
        request.description?.toLowerCase().includes(keyword) ||
        request.functionality.some(func => func.toLowerCase().includes(keyword))
      );

      if (requestContainsMockData) {
        return {
          violations: mockDataAnalysis.violations.length + 1, // +1 for the new request
          issues: ['Request appears to involve mock data creation']
        };
      }

      return {
        violations: mockDataAnalysis.violations.filter(v => v.severity === 'high').length,
        issues: mockDataAnalysis.violations.map(v => v.suggestion)
      };

    } catch (error) {
      console.warn('Mock data prevention check failed:', error);
      return { violations: 0, issues: [] };
    }
  }

  /**
   * Analyze TypeScript patterns (NEW!)
   */
  private static async analyzeTypeScriptPatterns(request: DevelopmentRequest): Promise<{
    typeSafetyScore: number;
    patternConsistencyScore: number;
    recommendations: string[];
  }> {
    try {
      const tsAnalysis = await TypeScriptPatternScanner.analyzeTypeScriptPatterns();
      
      const recommendations: string[] = [];
      
      if (tsAnalysis.typeSafetyScore < 70) {
        recommendations.push('Improve type safety before adding new code');
      }
      
      if (tsAnalysis.patternConsistencyScore < 70) {
        recommendations.push('Improve pattern consistency before adding new patterns');
      }
      
      if (tsAnalysis.codeQualityMetrics.anyUsage > 10) {
        recommendations.push('Reduce "any" type usage before adding new types');
      }

      return {
        typeSafetyScore: tsAnalysis.typeSafetyScore,
        patternConsistencyScore: tsAnalysis.patternConsistencyScore,
        recommendations
      };

    } catch (error) {
      console.warn('TypeScript pattern analysis failed:', error);
      return {
        typeSafetyScore: 0,
        patternConsistencyScore: 0,
        recommendations: ['TypeScript analysis failed - proceed with caution']
      };
    }
  }

  /**
   * NEW: Analyze database schema for duplicate risks and quality issues
   */
  private static async analyzeDatabaseSchema(request: DevelopmentRequest): Promise<{
    schemaQualityScore: number;
    schemaDuplicateRisk: number;
    conflicts: string[];
    recommendations: string[];
  }> {
    const result = {
      schemaQualityScore: 100,
      schemaDuplicateRisk: 0,
      conflicts: [],
      recommendations: []
    };

    try {
      // Only analyze schema for database-related requests
      if (!['table', 'column', 'constraint', 'index'].includes(request.type)) {
        return result;
      }

      // Get overall schema quality
      const schemaAnalysis = await DatabaseSchemaAnalyzer.analyzeCompleteSchema();
      result.schemaQualityScore = schemaAnalysis.schemaQualityScore;

      // Validate specific schema change request
      if (request.schemaDetails && request.tableName) {
        const schemaChangeRequest: SchemaChangeRequest = {
          type: this.mapRequestTypeToSchemaType(request.type),
          tableName: request.tableName,
          details: request.schemaDetails,
          reason: request.description || 'Development request'
        };

        const validation = await DatabaseSchemaAnalyzer.validateSchemaChangeRequest(schemaChangeRequest);
        
        result.schemaDuplicateRisk = validation.duplicateRisk;
        result.conflicts = validation.conflicts;
        result.recommendations = validation.recommendations;
      }

    } catch (error) {
      console.warn('Database schema analysis failed:', error);
      result.recommendations.push('Failed to analyze database schema - proceed with caution');
    }

    return result;
  }

  private static mapRequestTypeToSchemaType(requestType: string): any {
    const mapping: Record<string, string> = {
      'column': 'add_column',
      'table': 'add_table',
      'constraint': 'add_constraint',
      'index': 'add_index'
    };
    return mapping[requestType] || 'add_column';
  }

  /**
   * Check module registry for existing modules
   */
  private static async checkModuleRegistry(request: DevelopmentRequest): Promise<string[]> {
    const alternatives: string[] = [];
    
    if (request.tableName) {
      const registeredModules = moduleRegistry.getAll();
      const tableModules = registeredModules.filter(module => 
        module.tableName === request.tableName
      );
      alternatives.push(...tableModules.map(m => `Registered Module: ${m.moduleName} (${m.tableName})`));
    }

    return alternatives;
  }

  /**
   * Check database for existing implementations
   * Simplified approach to avoid complex type issues
   */
  private static async checkDatabaseForAlternatives(request: DevelopmentRequest): Promise<string[]> {
    const alternatives: string[] = [];

    try {
      // Instead of querying information_schema, check if we can select from the table
      // This is a simpler approach that works within Supabase's constraints
      if (request.tableName) {
        // Try to query the table - if it exists, this will succeed; if not, it will fail
        const { error } = await supabase
          .from(request.tableName as any)
          .select('*')
          .limit(1);

        // If no error, the table exists
        if (!error) {
          alternatives.push(`Database Table: ${request.tableName} already exists`);
        }
      }
    } catch (error) {
      // Table doesn't exist or we don't have permission - that's fine
      console.log('Database check skipped:', error);
    }

    return alternatives;
  }

  /**
   * Generate specific update recommendations (ENHANCED with Schema)
   */
  private static async generateUpdateRecommendations(
    request: DevelopmentRequest, 
    analysis: UpdateFirstAnalysis
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (analysis.existingAlternatives.length > 0) {
      recommendations.push('🔄 UPDATE EXISTING: Extend existing components instead of creating new ones');
      recommendations.push('📝 REFACTOR: Consider refactoring existing code to support new requirements');
    }

    if (analysis.reuseOpportunities.length > 0) {
      recommendations.push('♻️ REUSE: Leverage existing templates and patterns');
      recommendations.push('🧩 COMPOSE: Build by composing existing components');
    }

    if (request.type === 'hook' && request.tableName) {
      recommendations.push('🎯 TEMPLATE: Use useTypeSafeModuleTemplate for consistent database operations');
    }

    if (request.type === 'component') {
      recommendations.push('🏗️ TEMPLATE: Use ExtensibleModuleTemplate for consistent UI patterns');
    }

    // Service and class recommendations
    if (request.type === 'service') {
      recommendations.push('🔧 SERVICE PATTERN: Follow existing service patterns and naming conventions');
      recommendations.push('🏭 DEPENDENCY INJECTION: Consider using existing service orchestrators');
    }

    if (request.type === 'class') {
      recommendations.push('📋 CLASS PATTERN: Follow established class hierarchies and interfaces');
      recommendations.push('🎭 ABSTRACT: Consider using abstract base classes for common functionality');
    }

    // Mock data prevention recommendations
    if (analysis.mockDataViolations > 0) {
      recommendations.push('🚫 NO MOCK DATA: Use real database queries instead of mock/dummy data');
      recommendations.push('📊 REAL DATA: Implement proper Supabase queries for data fetching');
    }

    // TypeScript quality recommendations
    if (analysis.typeSafetyScore < 70) {
      recommendations.push('🔷 TYPE SAFETY: Improve TypeScript type definitions before proceeding');
      recommendations.push('📝 INTERFACES: Define proper interfaces and types for new functionality');
    }

    // NEW: Database schema recommendations
    if (['table', 'column', 'constraint', 'index'].includes(request.type)) {
      recommendations.push('🗄️ SCHEMA REVIEW: Review existing database schema before adding new elements');
      
      if (analysis.schemaQualityScore < 70) {
        recommendations.push('📊 SCHEMA QUALITY: Improve overall schema quality before adding new elements');
      }
      
      if (analysis.schemaDuplicateRisk > 50) {
        recommendations.push('⚠️ SCHEMA DUPLICATE RISK: High risk of creating duplicate schema elements');
        recommendations.push('🔍 SCHEMA ANALYSIS: Review existing columns, constraints, and relationships');
      }
      
      recommendations.push('🔒 RLS POLICIES: Ensure proper Row Level Security policies are in place');
      recommendations.push('📑 INDEXING: Consider indexing strategy for new columns');
    }

    return recommendations;
  }

  /**
   * Log the update first decision for audit trail (ENHANCED with Schema)
   */
  private static async logUpdateFirstDecision(
    request: DevelopmentRequest, 
    analysis: UpdateFirstAnalysis
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const metadata = {
          request: {
            type: request.type,
            name: request.name,
            tableName: request.tableName || null,
            functionality: request.functionality,
            description: request.description || null,
            requiredFields: request.requiredFields || [],
            schemaDetails: request.schemaDetails || null
          },
          analysis: {
            shouldProceed: analysis.shouldProceed,
            canProceed: analysis.canProceed,
            blockingReasons: analysis.blockingReasons,
            existingAlternatives: analysis.existingAlternatives,
            updateRecommendations: analysis.updateRecommendations,
            reuseOpportunities: analysis.reuseOpportunities,
            preventDuplicateScore: analysis.preventDuplicateScore,
            mandatoryUpdates: analysis.mandatoryUpdates,
            approvedForCreation: analysis.approvedForCreation,
            mockDataViolations: analysis.mockDataViolations,
            typeSafetyScore: analysis.typeSafetyScore,
            schemaQualityScore: analysis.schemaQualityScore,
            schemaDuplicateRisk: analysis.schemaDuplicateRisk
          },
          decision: analysis.approvedForCreation ? 'APPROVED' : 'BLOCKED',
          preventDuplicateScore: analysis.preventDuplicateScore,
          comprehensiveAnalysis: true,
          includeDatabaseSchema: true // NEW: Flag indicating database schema analysis
        };

        await supabase
          .from('issue_fixes')
          .insert({
            user_id: user.id,
            issue_type: 'COMPREHENSIVE_UPDATE_FIRST_GATEWAY_WITH_SCHEMA',
            issue_message: `Development request: ${request.type} "${request.name}" - ${analysis.approvedForCreation ? 'APPROVED' : 'BLOCKED'} (Mock Data: ${analysis.mockDataViolations}, Type Safety: ${analysis.typeSafetyScore}/100, Schema Quality: ${analysis.schemaQualityScore}/100, Schema Risk: ${analysis.schemaDuplicateRisk}/100)`,
            issue_source: 'Comprehensive Update First Gateway with Database Schema',
            issue_severity: analysis.blockingReasons.length > 0 ? 'high' : 'low',
            category: 'Development',
            fix_method: 'automated_prevention',
            metadata: metadata
          });
      }
    } catch (error) {
      console.error('Failed to log comprehensive update first decision with schema:', error);
    }
  }

  /**
   * Quick validation for development workflows (ENHANCED)
   */
  static async quickValidation(componentName: string, componentType: string): Promise<boolean> {
    const request: DevelopmentRequest = {
      type: componentType as any,
      name: componentName,
      functionality: ['basic functionality'],
      description: 'Quick validation check'
    };

    const analysis = await this.enforceUpdateFirst(request);
    return analysis.approvedForCreation;
  }

  /**
   * Comprehensive system health check (ENHANCED with Database Schema)
   */
  static async performSystemHealthCheck(): Promise<{
    overallScore: number;
    mockDataScore: number;
    typeSafetyScore: number;
    duplicatePreventionScore: number;
    schemaQualityScore: number; // NEW
    recommendations: string[];
    systemStatus: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  }> {
    console.log('🏥 Performing comprehensive system health check with database schema...');

    try {
      // Get all analyses
      const mockDataAnalysis = await MockDataDetector.analyzeMockDataUsage();
      const typeScriptAnalysis = await TypeScriptPatternScanner.analyzeTypeScriptPatterns();
      const schemaAnalysis = await DatabaseSchemaAnalyzer.analyzeCompleteSchema();

      const mockDataScore = mockDataAnalysis.databaseUsageScore;
      const typeSafetyScore = typeScriptAnalysis.typeSafetyScore;
      const schemaQualityScore = schemaAnalysis.schemaQualityScore;
      const duplicatePreventionScore = 100 - Math.min(mockDataAnalysis.violations.length * 10, 100);

      const overallScore = Math.round(
        (mockDataScore + typeSafetyScore + schemaQualityScore + duplicatePreventionScore) / 4
      );

      const recommendations: string[] = [];

      if (mockDataScore < 70) {
        recommendations.push('🚫 Eliminate mock data usage in production code');
      }
      if (typeSafetyScore < 70) {
        recommendations.push('🔷 Improve TypeScript type safety');
      }
      if (schemaQualityScore < 70) {
        recommendations.push('🗄️ Improve database schema quality and eliminate duplicate risks');
      }
      if (duplicatePreventionScore < 70) {
        recommendations.push('♻️ Reduce code duplication and improve reuse patterns');
      }

      let systemStatus: 'excellent' | 'good' | 'needs_improvement' | 'critical';
      if (overallScore >= 90) systemStatus = 'excellent';
      else if (overallScore >= 75) systemStatus = 'good';
      else if (overallScore >= 60) systemStatus = 'needs_improvement';
      else systemStatus = 'critical';

      console.log(`🏥 System Health Check Complete:
        - Overall Score: ${overallScore}/100
        - Mock Data Score: ${mockDataScore}/100
        - Type Safety Score: ${typeSafetyScore}/100
        - Schema Quality Score: ${schemaQualityScore}/100
        - Duplicate Prevention Score: ${duplicatePreventionScore}/100
        - System Status: ${systemStatus.toUpperCase()}`);

      return {
        overallScore,
        mockDataScore,
        typeSafetyScore,
        duplicatePreventionScore,
        schemaQualityScore,
        recommendations,
        systemStatus
      };

    } catch (error) {
      console.error('❌ System health check failed:', error);
      return {
        overallScore: 0,
        mockDataScore: 0,
        typeSafetyScore: 0,
        duplicatePreventionScore: 0,
        schemaQualityScore: 0,
        recommendations: ['System health check failed - manual review required'],
        systemStatus: 'critical'
      };
    }
  }
}
