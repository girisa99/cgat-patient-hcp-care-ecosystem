
/**
 * Update First Workflow Hook
 * Integrates with development workflows to enforce "Update First" rule
 */

import { useState, useCallback } from 'react';
import { UpdateFirstGateway, DevelopmentRequest, UpdateFirstAnalysis } from '@/utils/verification/UpdateFirstGateway';
import { useToast } from './use-toast';

export const useUpdateFirstWorkflow = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<UpdateFirstAnalysis | null>(null);
  const { toast } = useToast();

  /**
   * Validate a development request through the Update First Gateway
   */
  const validateDevelopmentRequest = useCallback(async (request: DevelopmentRequest): Promise<boolean> => {
    setIsAnalyzing(true);
    
    try {
      console.log('🚨 UPDATE FIRST VALIDATION for:', request);
      
      const analysis = await UpdateFirstGateway.enforceUpdateFirst(request);
      setCurrentAnalysis(analysis);

      // Show appropriate toast based on analysis
      if (analysis.blockingReasons.length > 0) {
        toast({
          title: "🚫 Creation Blocked - Update First Rule",
          description: `Found ${analysis.blockingReasons.length} blocking issues. Check existing alternatives.`,
          variant: "destructive",
        });
        return false;
      }

      if (analysis.updateRecommendations.length > 0) {
        toast({
          title: "⚠️ Update Recommended",
          description: `Consider updating existing components instead of creating new ones.`,
          variant: "default",
        });
      }

      if (analysis.approvedForCreation) {
        toast({
          title: "✅ Creation Approved",
          description: "No duplicates found. Proceed with development.",
          variant: "default",
        });
        return true;
      }

      return analysis.shouldProceed;

    } catch (error) {
      console.error('❌ Update First validation failed:', error);
      toast({
        title: "❌ Validation Error",
        description: "Failed to validate request. Please try again.",
        variant: "destructive",
      });
      return false;

    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  /**
   * Quick validation for component names
   */
  const quickValidateComponent = useCallback(async (name: string, type: string): Promise<boolean> => {
    return await UpdateFirstGateway.quickValidation(name, type);
  }, []);

  /**
   * Get recommendations for updating existing components
   */
  const getUpdateRecommendations = useCallback((analysis: UpdateFirstAnalysis) => {
    return {
      existingAlternatives: analysis.existingAlternatives,
      updateRecommendations: analysis.updateRecommendations,
      reuseOpportunities: analysis.reuseOpportunities,
      shouldUpdate: analysis.updateRecommendations.length > 0,
      preventDuplicateScore: analysis.preventDuplicateScore
    };
  }, []);

  return {
    // State
    isAnalyzing,
    currentAnalysis,

    // Actions
    validateDevelopmentRequest,
    quickValidateComponent,
    getUpdateRecommendations,

    // Computed values
    hasBlockingIssues: currentAnalysis?.blockingReasons.length || 0 > 0,
    hasRecommendations: currentAnalysis?.updateRecommendations.length || 0 > 0,
    duplicateRisk: currentAnalysis?.preventDuplicateScore || 0,
    isApproved: currentAnalysis?.approvedForCreation || false
  };
};
