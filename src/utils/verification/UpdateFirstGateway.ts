
/**
 * Update First Gateway
 * Single source of truth for all development decisions
 * Enforces "Update First" rule before any new code creation
 */

import { ComponentRegistryScanner } from './ComponentRegistryScanner';
import { moduleRegistry } from '@/utils/moduleRegistry';
import { supabase } from '@/integrations/supabase/client';

export interface DevelopmentRequest {
  type: 'hook' | 'component' | 'module' | 'template' | 'utility';
  name: string;
  tableName?: string;
  functionality: string[];
  description?: string;
  requiredFields?: string[];
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
}

export class UpdateFirstGateway {
  /**
   * MANDATORY PRE-CREATION CHECK
   * Every new development request MUST go through this gateway
   */
  static async enforceUpdateFirst(request: DevelopmentRequest): Promise<UpdateFirstAnalysis> {
    console.log('🚨 UPDATE FIRST GATEWAY ACTIVATED for:', request);
    console.log('🔍 Performing comprehensive duplicate detection...');

    const analysis: UpdateFirstAnalysis = {
      shouldProceed: false,
      canProceed: false,
      blockingReasons: [],
      existingAlternatives: [],
      updateRecommendations: [],
      reuseOpportunities: [],
      preventDuplicateScore: 0,
      mandatoryUpdates: [],
      approvedForCreation: false
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

      // Step 3: Check module registry for existing modules
      const existingModules = await this.checkModuleRegistry(request);
      if (existingModules.length > 0) {
        analysis.existingAlternatives.push(...existingModules);
        analysis.preventDuplicateScore += 20;
      }

      // Step 4: Scan component registry for reuse opportunities
      const reuseOpportunities = await ComponentRegistryScanner.findReuseOpportunities({
        tableName: request.tableName,
        functionality: request.functionality,
        componentType: request.type === 'module' ? 'component' : request.type as 'hook' | 'component' | 'template'
      });
      analysis.reuseOpportunities.push(...reuseOpportunities);

      // Step 5: Check database for existing implementations
      const databaseAlternatives = await this.checkDatabaseForAlternatives(request);
      analysis.existingAlternatives.push(...databaseAlternatives);

      // Step 6: Generate update recommendations
      analysis.updateRecommendations = await this.generateUpdateRecommendations(request, analysis);

      // Step 7: Determine if creation should proceed
      analysis.canProceed = analysis.blockingReasons.length === 0;
      analysis.shouldProceed = analysis.canProceed && analysis.preventDuplicateScore < 70;
      analysis.approvedForCreation = analysis.shouldProceed && analysis.updateRecommendations.length === 0;

      // Step 8: Log the decision
      await this.logUpdateFirstDecision(request, analysis);

      console.log('📊 UPDATE FIRST ANALYSIS COMPLETE:', {
        canProceed: analysis.canProceed,
        shouldProceed: analysis.shouldProceed,
        preventDuplicateScore: analysis.preventDuplicateScore,
        blockingReasons: analysis.blockingReasons.length,
        alternatives: analysis.existingAlternatives.length
      });

      return analysis;

    } catch (error) {
      console.error('❌ UPDATE FIRST GATEWAY ERROR:', error);
      analysis.blockingReasons.push(`System error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return analysis;
    }
  }

  /**
   * Find exact name duplicates
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

    return duplicates;
  }

  /**
   * Find functional duplicates (same purpose, different name)
   */
  private static async findFunctionalDuplicates(request: DevelopmentRequest): Promise<string[]> {
    const duplicates: string[] = [];
    const inventory = await ComponentRegistryScanner.scanAllComponents();

    // Check for same table + same type combinations
    if (request.tableName) {
      const sameTableHooks = inventory.hooks.filter(hook => 
        hook.tableName === request.tableName && 
        request.type === 'hook'
      );
      duplicates.push(...sameTableHooks.map(h => `Table Hook: ${h.name} (${h.tableName})`));
    }

    // Check for overlapping functionality
    const functionalOverlap = inventory.hooks.filter(hook => 
      hook.functionality.some(func => 
        request.functionality.some(reqFunc => 
          func.toLowerCase().includes(reqFunc.toLowerCase()) ||
          reqFunc.toLowerCase().includes(func.toLowerCase())
        )
      )
    );
    duplicates.push(...functionalOverlap.map(h => `Functional Overlap: ${h.name}`));

    return duplicates;
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
   */
  private static async checkDatabaseForAlternatives(request: DevelopmentRequest): Promise<string[]> {
    const alternatives: string[] = [];

    try {
      // Check if table exists in database by querying information_schema
      if (request.tableName) {
        const { data: tableInfo } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', request.tableName)
          .maybeSingle();

        if (tableInfo) {
          alternatives.push(`Database Table: ${request.tableName} already exists`);
        }
      }
    } catch (error) {
      console.log('Database check skipped:', error);
    }

    return alternatives;
  }

  /**
   * Generate specific update recommendations
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

    return recommendations;
  }

  /**
   * Log the update first decision for audit trail
   */
  private static async logUpdateFirstDecision(
    request: DevelopmentRequest, 
    analysis: UpdateFirstAnalysis
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Convert the objects to a JSON-compatible format
        const metadata = {
          request: {
            type: request.type,
            name: request.name,
            tableName: request.tableName || null,
            functionality: request.functionality,
            description: request.description || null,
            requiredFields: request.requiredFields || []
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
            approvedForCreation: analysis.approvedForCreation
          },
          decision: analysis.approvedForCreation ? 'APPROVED' : 'BLOCKED',
          preventDuplicateScore: analysis.preventDuplicateScore
        };

        await supabase
          .from('issue_fixes')
          .insert({
            user_id: user.id,
            issue_type: 'UPDATE_FIRST_GATEWAY',
            issue_message: `Development request: ${request.type} "${request.name}" - ${analysis.approvedForCreation ? 'APPROVED' : 'BLOCKED'}`,
            issue_source: 'Update First Gateway',
            issue_severity: analysis.blockingReasons.length > 0 ? 'high' : 'low',
            category: 'Development',
            fix_method: 'automated_prevention',
            metadata: metadata
          });
      }
    } catch (error) {
      console.error('Failed to log update first decision:', error);
    }
  }

  /**
   * Quick validation for development workflows
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
}
