/**
 * Medical Coding Hook
 * Implements Auto-Suggest pattern with human-in-the-loop for ICD/HCPCS/NDC codes
 * Uses AI-assisted suggestions with clinician confirmation for compliance.
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import {
  MedicalCodingState,
  CodingSuggestion,
  CodingValidationResult,
  ConfirmedCode,
  ICDCode,
  HCPCSCode,
  NDCCode,
  CodingError,
  CodingWarning,
  CodingAuditEntry,
  PipelineStatus
} from '@/types/hierarchical-agent-types';

// Mock code databases (in production, these would be API calls)
const ICD_CODES: ICDCode[] = [
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine', version: 'ICD-10-CM', specificity: 'billable' },
  { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia', category: 'Endocrine', version: 'ICD-10-CM', specificity: 'billable' },
  { code: 'I10', description: 'Essential (primary) hypertension', category: 'Circulatory', version: 'ICD-10-CM', specificity: 'billable' },
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory', version: 'ICD-10-CM', specificity: 'billable' },
  { code: 'M54.5', description: 'Low back pain', category: 'Musculoskeletal', version: 'ICD-10-CM', specificity: 'billable' },
  { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', category: 'Mental', version: 'ICD-10-CM', specificity: 'billable' },
  { code: 'K21.0', description: 'Gastro-esophageal reflux disease with esophagitis', category: 'Digestive', version: 'ICD-10-CM', specificity: 'billable' },
  { code: 'N39.0', description: 'Urinary tract infection, site not specified', category: 'Genitourinary', version: 'ICD-10-CM', specificity: 'billable' }
];

const HCPCS_CODES: HCPCSCode[] = [
  { code: 'J0129', shortDescription: 'Abatacept injection', longDescription: 'Injection, abatacept, 10 mg', category: 'Level II' },
  { code: 'J0178', shortDescription: 'Aflibercept injection', longDescription: 'Injection, aflibercept, 1 mg', category: 'Level II' },
  { code: 'J1745', shortDescription: 'Infliximab injection', longDescription: 'Injection, infliximab, excludes biosimilar, 10 mg', category: 'Level II' },
  { code: 'J2350', shortDescription: 'Octreotide injection', longDescription: 'Injection, octreotide, depot form, 1 mg', category: 'Level II' },
  { code: 'J3489', shortDescription: 'Zoledronic acid injection', longDescription: 'Injection, zoledronic acid, 1 mg', category: 'Level II' },
  { code: 'J9310', shortDescription: 'Rituximab injection', longDescription: 'Injection, rituximab, 100 mg', category: 'Level II' }
];

const NDC_CODES: NDCCode[] = [
  { 
    ndc: '00002-7510-01', ndc10: '0002751001', ndc11: '00002751001',
    productName: 'Humalog', labelerName: 'Eli Lilly',
    activeIngredients: [{ name: 'Insulin Lispro', strength: '100', unit: 'unit/mL' }],
    dosageForm: 'Injectable', route: 'Subcutaneous', strengthNumber: '100', strengthUnit: 'unit/mL',
    packageDescription: '10 mL vial', marketingStatus: 'Active'
  },
  {
    ndc: '00074-3799-02', ndc10: '0074379902', ndc11: '00074379902',
    productName: 'Humira', labelerName: 'AbbVie',
    activeIngredients: [{ name: 'Adalimumab', strength: '40', unit: 'mg/0.8mL' }],
    dosageForm: 'Injectable', route: 'Subcutaneous', strengthNumber: '40', strengthUnit: 'mg',
    packageDescription: '2 syringes', marketingStatus: 'Active'
  },
  {
    ndc: '50242-0040-62', ndc10: '5024204062', ndc11: '50242004062',
    productName: 'Keytruda', labelerName: 'Merck',
    activeIngredients: [{ name: 'Pembrolizumab', strength: '100', unit: 'mg/4mL' }],
    dosageForm: 'Injectable', route: 'Intravenous', strengthNumber: '100', strengthUnit: 'mg',
    packageDescription: '4 mL vial', marketingStatus: 'Active'
  }
];

interface MedicalCodingConfig {
  medicationId: string;
  medicationName: string;
  indication?: string;
  prescriberId?: string;
  autoConfirmHighConfidence?: boolean;
  confidenceThreshold?: number;
}

export const useMedicalCoding = (agentId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError, showInfo } = useMasterToast();
  
  const [codingState, setCodingState] = useState<MedicalCodingState | null>(null);
  const [auditTrail, setAuditTrail] = useState<CodingAuditEntry[]>([]);

  // Initialize coding state
  const initializeCoding = useCallback((medicationId: string): MedicalCodingState => {
    const state: MedicalCodingState = {
      medicationId,
      status: 'pending',
      suggestions: [],
      confirmedCodes: [],
      requiresHumanReview: true
    };
    setCodingState(state);
    return state;
  }, []);

  // Add audit entry
  const addAuditEntry = useCallback((entry: Omit<CodingAuditEntry, 'timestamp'>) => {
    const fullEntry: CodingAuditEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    setAuditTrail(prev => [...prev, fullEntry]);
    return fullEntry;
  }, []);

  // Search ICD codes
  const searchICDMutation = useMutation({
    mutationFn: async (query: string): Promise<ICDCode[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const lowerQuery = query.toLowerCase();
      return ICD_CODES.filter(code => 
        code.code.toLowerCase().includes(lowerQuery) ||
        code.description.toLowerCase().includes(lowerQuery) ||
        code.category.toLowerCase().includes(lowerQuery)
      );
    }
  });

  // Search HCPCS codes
  const searchHCPCSMutation = useMutation({
    mutationFn: async (query: string): Promise<HCPCSCode[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const lowerQuery = query.toLowerCase();
      return HCPCS_CODES.filter(code => 
        code.code.toLowerCase().includes(lowerQuery) ||
        code.shortDescription.toLowerCase().includes(lowerQuery) ||
        code.longDescription.toLowerCase().includes(lowerQuery)
      );
    }
  });

  // Search NDC codes
  const searchNDCMutation = useMutation({
    mutationFn: async (query: string): Promise<NDCCode[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const lowerQuery = query.toLowerCase();
      return NDC_CODES.filter(code => 
        code.ndc.includes(lowerQuery) ||
        code.productName.toLowerCase().includes(lowerQuery) ||
        code.labelerName.toLowerCase().includes(lowerQuery)
      );
    }
  });

  // Generate AI-powered code suggestions
  const generateSuggestionsMutation = useMutation({
    mutationFn: async (config: MedicalCodingConfig): Promise<CodingSuggestion[]> => {
      initializeCoding(config.medicationId);
      setCodingState(prev => prev ? { ...prev, status: 'in_progress' } : null);

      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const suggestions: CodingSuggestion[] = [];

      // Generate NDC suggestion based on medication name
      const ndcMatches = NDC_CODES.filter(ndc => 
        ndc.productName.toLowerCase().includes(config.medicationName.toLowerCase())
      );
      
      if (ndcMatches.length > 0) {
        suggestions.push({
          id: `sug_ndc_${Date.now()}`,
          type: 'NDC',
          code: ndcMatches[0].ndc,
          description: `${ndcMatches[0].productName} - ${ndcMatches[0].packageDescription}`,
          confidence: 0.92,
          reasoning: `Matched medication name "${config.medicationName}" to NDC database`,
          alternatives: ndcMatches.slice(1, 4).map(ndc => ({
            code: ndc.ndc,
            description: `${ndc.productName} - ${ndc.packageDescription}`,
            confidence: 0.75,
            reason: 'Alternative package size/form'
          })),
          requiresConfirmation: true
        });

        addAuditEntry({
          action: 'suggested',
          code: ndcMatches[0].ndc,
          codeType: 'NDC',
          agentId,
          reason: 'AI-generated from medication name match'
        });
      }

      // Generate HCPCS suggestion for injectables
      const hcpcsMatches = HCPCS_CODES.filter(hcpcs =>
        hcpcs.shortDescription.toLowerCase().includes(config.medicationName.toLowerCase().split(' ')[0])
      );

      if (hcpcsMatches.length > 0) {
        suggestions.push({
          id: `sug_hcpcs_${Date.now()}`,
          type: 'HCPCS',
          code: hcpcsMatches[0].code,
          description: hcpcsMatches[0].longDescription,
          confidence: 0.88,
          reasoning: 'Matched to HCPCS J-code database for injectable medications',
          alternatives: hcpcsMatches.slice(1, 3).map(hcpcs => ({
            code: hcpcs.code,
            description: hcpcs.longDescription,
            confidence: 0.7,
            reason: 'Similar drug class'
          })),
          requiresConfirmation: true
        });

        addAuditEntry({
          action: 'suggested',
          code: hcpcsMatches[0].code,
          codeType: 'HCPCS',
          agentId,
          reason: 'AI-generated from drug name match'
        });
      }

      // Generate ICD suggestion based on indication
      if (config.indication) {
        const icdMatches = ICD_CODES.filter(icd =>
          icd.description.toLowerCase().includes(config.indication!.toLowerCase()) ||
          icd.category.toLowerCase().includes(config.indication!.toLowerCase())
        );

        if (icdMatches.length > 0) {
          suggestions.push({
            id: `sug_icd_${Date.now()}`,
            type: 'ICD',
            code: icdMatches[0].code,
            description: icdMatches[0].description,
            confidence: 0.85,
            reasoning: `Matched indication "${config.indication}" to ICD-10 diagnosis codes`,
            alternatives: icdMatches.slice(1, 4).map(icd => ({
              code: icd.code,
              description: icd.description,
              confidence: 0.65,
              reason: 'Related diagnosis'
            })),
            requiresConfirmation: true
          });

          addAuditEntry({
            action: 'suggested',
            code: icdMatches[0].code,
            codeType: 'ICD',
            agentId,
            reason: 'AI-generated from indication match'
          });
        }
      }

      // Determine if human review is required based on confidence
      const threshold = config.confidenceThreshold || 0.9;
      const requiresReview = suggestions.some(s => s.confidence < threshold);

      setCodingState(prev => prev ? {
        ...prev,
        suggestions,
        requiresHumanReview: requiresReview,
        status: requiresReview ? 'awaiting_input' : 'in_progress'
      } : null);

      // Auto-confirm high confidence codes if enabled
      if (config.autoConfirmHighConfidence) {
        const highConfidence = suggestions.filter(s => s.confidence >= threshold);
        for (const suggestion of highConfidence) {
          await confirmCodeMutation.mutateAsync({ suggestion, confirmedBy: 'agent' });
        }
      }

      // Log to database
      if (agentId) {
        await supabase.from('agent_performance_metrics').insert({
          agent_id: agentId,
          metric_type: 'coding_suggestions_generated',
          metric_value: suggestions.length,
          metric_unit: 'codes',
          execution_context: { 
            medicationId: config.medicationId,
            medicationName: config.medicationName
          }
        });
      }

      return suggestions;
    },
    onSuccess: (suggestions) => {
      showInfo('Coding Suggestions Ready', `${suggestions.length} codes suggested for review`);
    },
    onError: (error: any) => {
      setCodingState(prev => prev ? { ...prev, status: 'failed' } : null);
      showError('Suggestion Failed', error.message);
    }
  });

  // Confirm a code suggestion
  const confirmCodeMutation = useMutation({
    mutationFn: async ({ 
      suggestion, 
      confirmedBy, 
      userId 
    }: { 
      suggestion: CodingSuggestion; 
      confirmedBy: 'agent' | 'human';
      userId?: string;
    }): Promise<ConfirmedCode> => {
      const confirmed: ConfirmedCode = {
        type: suggestion.type,
        code: suggestion.code,
        description: suggestion.description,
        confirmedAt: new Date().toISOString(),
        confirmedBy,
        userId
      };

      setCodingState(prev => {
        if (!prev) return null;
        
        const updatedSuggestions = prev.suggestions.map(s =>
          s.id === suggestion.id ? { ...s, requiresConfirmation: false } : s
        );
        
        const allConfirmed = updatedSuggestions.every(s => !s.requiresConfirmation);
        
        return {
          ...prev,
          suggestions: updatedSuggestions,
          confirmedCodes: [...prev.confirmedCodes, confirmed],
          status: allConfirmed ? 'completed' : prev.status,
          reviewedAt: confirmedBy === 'human' ? new Date().toISOString() : prev.reviewedAt,
          reviewedBy: userId
        };
      });

      addAuditEntry({
        action: 'confirmed',
        code: suggestion.code,
        codeType: suggestion.type,
        userId,
        agentId: confirmedBy === 'agent' ? agentId : undefined,
        reason: `Confirmed by ${confirmedBy}`
      });

      return confirmed;
    },
    onSuccess: (confirmed) => {
      showSuccess('Code Confirmed', `${confirmed.type}: ${confirmed.code}`);
      queryClient.invalidateQueries({ queryKey: ['medical-coding'] });
    }
  });

  // Reject a code suggestion
  const rejectCodeMutation = useMutation({
    mutationFn: async ({ 
      suggestionId, 
      reason,
      userId 
    }: { 
      suggestionId: string; 
      reason: string;
      userId?: string;
    }) => {
      setCodingState(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          suggestions: prev.suggestions.filter(s => s.id !== suggestionId)
        };
      });

      const suggestion = codingState?.suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        addAuditEntry({
          action: 'rejected',
          code: suggestion.code,
          codeType: suggestion.type,
          userId,
          reason
        });
      }

      return { suggestionId, reason };
    },
    onSuccess: () => {
      showInfo('Code Rejected', 'Suggestion removed');
    }
  });

  // Override with a different code
  const overrideCodeMutation = useMutation({
    mutationFn: async ({
      originalSuggestionId,
      newCode,
      codeType,
      description,
      reason,
      userId
    }: {
      originalSuggestionId: string;
      newCode: string;
      codeType: 'ICD' | 'HCPCS' | 'NDC';
      description: string;
      reason: string;
      userId: string;
    }): Promise<ConfirmedCode> => {
      const original = codingState?.suggestions.find(s => s.id === originalSuggestionId);
      
      const confirmed: ConfirmedCode = {
        type: codeType,
        code: newCode,
        description,
        confirmedAt: new Date().toISOString(),
        confirmedBy: 'human',
        userId
      };

      setCodingState(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          suggestions: prev.suggestions.filter(s => s.id !== originalSuggestionId),
          confirmedCodes: [...prev.confirmedCodes, confirmed],
          reviewedAt: new Date().toISOString(),
          reviewedBy: userId
        };
      });

      // Log override
      if (original) {
        addAuditEntry({
          action: 'overridden',
          code: original.code,
          codeType: original.type,
          userId,
          reason: `Overridden with ${newCode}: ${reason}`
        });
      }

      addAuditEntry({
        action: 'confirmed',
        code: newCode,
        codeType,
        userId,
        reason: `Manual override: ${reason}`
      });

      return confirmed;
    },
    onSuccess: (confirmed) => {
      showSuccess('Code Overridden', `${confirmed.type}: ${confirmed.code}`);
    }
  });

  // Validate all confirmed codes
  const validateCodesMutation = useMutation({
    mutationFn: async (): Promise<CodingValidationResult> => {
      if (!codingState) throw new Error('No coding state');

      await new Promise(resolve => setTimeout(resolve, 1000));

      const errors: CodingError[] = [];
      const warnings: CodingWarning[] = [];
      const suggestions: CodingSuggestion[] = [];

      // Validate each confirmed code
      for (const code of codingState.confirmedCodes) {
        // Check for missing required codes
        if (code.type === 'NDC' && !codingState.confirmedCodes.some(c => c.type === 'ICD')) {
          errors.push({
            code: 'MISSING_DIAGNOSIS',
            field: 'ICD',
            message: 'NDC code requires accompanying ICD-10 diagnosis code',
            severity: 'error'
          });
        }

        // Check for specificity
        if (code.type === 'ICD' && code.code.length < 4) {
          warnings.push({
            code: 'LOW_SPECIFICITY',
            field: 'ICD',
            message: `ICD code ${code.code} may require more specificity for billing`,
            recommendation: 'Consider using a more specific diagnosis code'
          });
        }

        addAuditEntry({
          action: 'validated',
          code: code.code,
          codeType: code.type,
          agentId,
          reason: 'Automated validation check'
        });
      }

      const result: CodingValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions,
        auditTrail
      };

      setCodingState(prev => prev ? {
        ...prev,
        validationResult: result,
        status: result.isValid ? 'completed' : 'awaiting_input'
      } : null);

      return result;
    },
    onSuccess: (result) => {
      if (result.isValid) {
        showSuccess('Validation Passed', 'All codes validated successfully');
      } else {
        showError('Validation Issues', `${result.errors.length} errors, ${result.warnings.length} warnings`);
      }
    }
  });

  // Quick lookup functions
  const lookupICD = useCallback(async (code: string): Promise<ICDCode | undefined> => {
    return ICD_CODES.find(c => c.code === code);
  }, []);

  const lookupHCPCS = useCallback(async (code: string): Promise<HCPCSCode | undefined> => {
    return HCPCS_CODES.find(c => c.code === code);
  }, []);

  const lookupNDC = useCallback(async (ndc: string): Promise<NDCCode | undefined> => {
    return NDC_CODES.find(c => c.ndc === ndc || c.ndc10 === ndc || c.ndc11 === ndc);
  }, []);

  return {
    // State
    codingState,
    suggestions: codingState?.suggestions || [],
    confirmedCodes: codingState?.confirmedCodes || [],
    validationResult: codingState?.validationResult,
    requiresHumanReview: codingState?.requiresHumanReview || false,
    auditTrail,

    // Initialization
    initializeCoding,

    // AI Suggestions
    generateSuggestions: generateSuggestionsMutation.mutate,
    isGeneratingSuggestions: generateSuggestionsMutation.isPending,

    // Code Management
    confirmCode: confirmCodeMutation.mutate,
    rejectCode: rejectCodeMutation.mutate,
    overrideCode: overrideCodeMutation.mutate,
    isConfirming: confirmCodeMutation.isPending,

    // Validation
    validateCodes: validateCodesMutation.mutate,
    isValidating: validateCodesMutation.isPending,

    // Search
    searchICD: searchICDMutation.mutate,
    searchHCPCS: searchHCPCSMutation.mutate,
    searchNDC: searchNDCMutation.mutate,
    isSearching: searchICDMutation.isPending || searchHCPCSMutation.isPending || searchNDCMutation.isPending,

    // Quick Lookup
    lookupICD,
    lookupHCPCS,
    lookupNDC
  };
};
