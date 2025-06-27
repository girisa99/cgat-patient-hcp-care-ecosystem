
/**
 * Automated Orchestration Hook
 * Coordinates refactoring, API consumption, and developer portal management
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RefactoringOrchestrator, RefactoringResult } from '@/utils/verification/RefactoringOrchestrator';
import { ApiConsumptionOrchestrator, ApiConsumptionConfig, ApiConsumptionResult } from '@/utils/verification/ApiConsumptionOrchestrator';
import { DeveloperPortalOrchestrator, SearchableSandboxResult } from '@/utils/verification/DeveloperPortalOrchestrator';

export const useAutomatedOrchestration = () => {
  const { toast } = useToast();
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [isGeneratingPortal, setIsGeneratingPortal] = useState(false);
  const [lastRefactoringResult, setLastRefactoringResult] = useState<RefactoringResult | null>(null);
  const [lastOrchestrationResult, setLastOrchestrationResult] = useState<ApiConsumptionResult | null>(null);
  const [lastPortalResult, setLastPortalResult] = useState<SearchableSandboxResult | null>(null);

  /**
   * Automatically refactor components while preserving functionality
   */
  const performAutomatedRefactoring = useCallback(async (
    componentPath: string,
    targetStructure: 'split' | 'merge' | 'optimize'
  ) => {
    setIsRefactoring(true);
    
    try {
      console.log(`🔄 Starting automated refactoring: ${componentPath} -> ${targetStructure}`);
      
      const result = await RefactoringOrchestrator.refactorComponent(componentPath, targetStructure);
      setLastRefactoringResult(result);
      
      if (result.success) {
        toast({
          title: "🎉 Refactoring Complete",
          description: `Successfully refactored ${componentPath}. ${result.filesModified.length} files modified, ${result.importsUpdated} imports updated, functionality preserved: ${result.functionalityPreserved}`,
        });
      } else {
        toast({
          title: "⚠️ Refactoring Issues",
          description: `Refactoring completed with ${result.errors.length} errors and ${result.warnings.length} warnings. Functionality preserved: ${result.functionalityPreserved}`,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ Automated refactoring failed:', error);
      toast({
        title: "❌ Refactoring Failed",
        description: error.message || "Failed to complete automated refactoring",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsRefactoring(false);
    }
  }, [toast]);

  /**
   * Refactor entire module with comprehensive orchestration
   */
  const performModuleRefactoring = useCallback(async (
    moduleName: string,
    refactoringType: 'split' | 'consolidate' | 'modernize'
  ) => {
    setIsRefactoring(true);
    
    try {
      console.log(`🏗️ Starting module refactoring: ${moduleName} -> ${refactoringType}`);
      
      const result = await RefactoringOrchestrator.refactorModule(moduleName, refactoringType);
      setLastRefactoringResult(result);
      
      if (result.success) {
        toast({
          title: "🎉 Module Refactoring Complete",
          description: `Successfully refactored ${moduleName} module. ${result.filesModified.length} files modified, ${result.importsUpdated} imports updated.`,
        });
      } else {
        toast({
          title: "⚠️ Module Refactoring Issues",
          description: `Module refactoring completed with issues. Check logs for details.`,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ Module refactoring failed:', error);
      toast({
        title: "❌ Module Refactoring Failed",
        description: error.message || "Failed to complete module refactoring",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsRefactoring(false);
    }
  }, [toast]);

  /**
   * Orchestrate API consumption with full automation
   */
  const orchestrateApiConsumption = useCallback(async (config: ApiConsumptionConfig) => {
    setIsOrchestrating(true);
    
    try {
      console.log(`🚀 Starting API consumption orchestration: ${config.apiId}`);
      
      const result = await ApiConsumptionOrchestrator.orchestrateApiConsumption(config);
      setLastOrchestrationResult(result);
      
      if (result.success) {
        toast({
          title: "🎉 API Integration Complete",
          description: `Successfully integrated ${config.apiId}. Generated ${result.schemasGenerated.length} schemas, ${result.tablesCreated.length} tables, ${result.rlsPoliciesGenerated.length} RLS policies, and ${result.internalApiEndpoints.length} endpoints.`,
        });
      } else {
        toast({
          title: "⚠️ API Integration Issues",
          description: `API integration completed with ${result.errors.length} errors and ${result.warnings.length} warnings.`,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ API consumption orchestration failed:', error);
      toast({
        title: "❌ API Integration Failed",
        description: error.message || "Failed to complete API integration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsOrchestrating(false);
    }
  }, [toast]);

  /**
   * Generate comprehensive developer portal with searchable sandbox
   */
  const generateDeveloperPortal = useCallback(async (apiIntegrations: any[]) => {
    setIsGeneratingPortal(true);
    
    try {
      console.log('🌐 Generating comprehensive developer portal...');
      
      const result = await DeveloperPortalOrchestrator.createDeveloperPortal(apiIntegrations);
      setLastPortalResult(result);
      
      if (result.success) {
        toast({
          title: "🎉 Developer Portal Generated",
          description: `Successfully created developer portal with ${result.searchableEndpoints.length} searchable endpoints, ${result.categories.length} categories, and ${result.fieldMappings.length} field mappings.`,
        });
      } else {
        toast({
          title: "⚠️ Portal Generation Issues",
          description: "Developer portal generation completed with some issues.",
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ Developer portal generation failed:', error);
      toast({
        title: "❌ Portal Generation Failed",
        description: error.message || "Failed to generate developer portal",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGeneratingPortal(false);
    }
  }, [toast]);

  /**
   * Complete end-to-end orchestration workflow
   */
  const performCompleteOrchestration = useCallback(async (
    componentPath: string,
    apiConfig: ApiConsumptionConfig,
    apiIntegrations: any[]
  ) => {
    try {
      console.log('🎯 Starting complete end-to-end orchestration...');
      
      // Step 1: Refactor component if needed
      const refactoringResult = await performAutomatedRefactoring(componentPath, 'optimize');
      
      // Step 2: Orchestrate API consumption
      const orchestrationResult = await orchestrateApiConsumption(apiConfig);
      
      // Step 3: Generate developer portal
      const portalResult = await generateDeveloperPortal([...apiIntegrations, orchestrationResult]);
      
      toast({
        title: "🎉 Complete Orchestration Success",
        description: `End-to-end orchestration completed successfully. Component refactored, API integrated, and developer portal generated.`,
      });
      
      return {
        refactoringResult,
        orchestrationResult,
        portalResult,
        success: refactoringResult.success && orchestrationResult.success && portalResult.success
      };
      
    } catch (error: any) {
      console.error('❌ Complete orchestration failed:', error);
      toast({
        title: "❌ Complete Orchestration Failed",
        description: error.message || "Failed to complete end-to-end orchestration",
        variant: "destructive",
      });
      throw error;
    }
  }, [performAutomatedRefactoring, orchestrateApiConsumption, generateDeveloperPortal, toast]);

  return {
    // Actions
    performAutomatedRefactoring,
    performModuleRefactoring,
    orchestrateApiConsumption,
    generateDeveloperPortal,
    performCompleteOrchestration,
    
    // Status
    isRefactoring,
    isOrchestrating,
    isGeneratingPortal,
    isAnyActionPending: isRefactoring || isOrchestrating || isGeneratingPortal,
    
    // Results
    lastRefactoringResult,
    lastOrchestrationResult,
    lastPortalResult,
    
    // Helper functions
    getOrchestrationSummary: () => ({
      totalRefactorings: lastRefactoringResult ? 1 : 0,
      totalOrchestrations: lastOrchestrationResult ? 1 : 0,
      totalPortalsGenerated: lastPortalResult ? 1 : 0,
      lastActivity: Math.max(
        lastRefactoringResult ? Date.now() : 0,
        lastOrchestrationResult ? Date.now() : 0,
        lastPortalResult ? Date.now() : 0
      )
    })
  };
};
