/**
 * Insurance Pipeline Hook
 * Implements sequential sub-agent pipeline: Verification → Benefits → PA → Copay → Alt Funding
 * Each stage passes context to the next in a pipeline pattern.
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import {
  InsurancePipelineState,
  InsurancePipelineStage,
  InsurancePipelineStageStatus,
  SharedContext,
  VerificationResult,
  BenefitsInvestigationResult,
  PriorAuthorizationResult,
  CopayAssistanceResult,
  AlternativeFundingResult,
  PipelineStatus,
  HierarchicalMessage,
  SubAgentRole
} from '@/types/hierarchical-agent-types';

// Pipeline stage configuration
const PIPELINE_STAGES: InsurancePipelineStage[] = [
  'verification',
  'benefits',
  'prior_auth',
  'copay',
  'alt_funding'
];

const STAGE_ROLES: Record<InsurancePipelineStage, SubAgentRole> = {
  verification: 'verification',
  benefits: 'benefits_investigation',
  prior_auth: 'prior_authorization',
  copay: 'copay_assistance',
  alt_funding: 'alternative_funding'
};

interface InsurancePipelineConfig {
  enrollmentId: string;
  insuranceInfo: {
    payerId: string;
    planId: string;
    memberId: string;
    groupNumber?: string;
  };
  medicationInfo?: {
    drugName: string;
    ndc: string;
  };
  skipStages?: InsurancePipelineStage[];
  parallelCopayAndAltFunding?: boolean;
}

export const useInsurancePipeline = (orchestratorId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError, showInfo } = useMasterToast();
  
  const [pipelineState, setPipelineState] = useState<InsurancePipelineState | null>(null);
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);

  // Initialize pipeline
  const initializePipeline = useCallback((config: InsurancePipelineConfig): InsurancePipelineState => {
    const stages: InsurancePipelineStageStatus[] = PIPELINE_STAGES.map((stage, index) => ({
      stage,
      status: config.skipStages?.includes(stage) ? 'skipped' : 'pending',
      agentId: `${orchestratorId || 'insurance'}_${stage}_${Date.now()}`
    }));

    const state: InsurancePipelineState = {
      enrollmentId: config.enrollmentId,
      currentStage: 'verification',
      stages,
      context: {
        enrollmentId: config.enrollmentId,
        insuranceInfo: {
          payerId: config.insuranceInfo.payerId,
          planId: config.insuranceInfo.planId,
          memberId: config.insuranceInfo.memberId,
          groupNumber: config.insuranceInfo.groupNumber,
          effectiveDate: new Date().toISOString(),
          coverageType: 'commercial'
        },
        medicationInfo: config.medicationInfo ? {
          drugName: config.medicationInfo.drugName,
          ndc: config.medicationInfo.ndc,
          strength: '',
          dosageForm: ''
        } : undefined,
        history: [],
        metadata: {}
      },
      startedAt: new Date().toISOString()
    };

    setPipelineState(state);
    return state;
  }, [orchestratorId]);

  // Update stage status
  const updateStageStatus = useCallback((
    stage: InsurancePipelineStage,
    status: PipelineStatus,
    result?: any,
    error?: string
  ) => {
    setPipelineState(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        stages: prev.stages.map(s => 
          s.stage === stage 
            ? { 
                ...s, 
                status, 
                result, 
                error,
                completedAt: ['completed', 'failed', 'skipped'].includes(status) 
                  ? new Date().toISOString() 
                  : s.completedAt
              } 
            : s
        )
      };
    });
  }, []);

  // Add to context history
  const addToHistory = useCallback((
    agentId: string,
    agentRole: SubAgentRole,
    action: string,
    input: any,
    output: any,
    duration: number
  ) => {
    setPipelineState(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        context: {
          ...prev.context,
          history: [
            ...prev.context.history,
            {
              agentId,
              agentRole,
              timestamp: new Date().toISOString(),
              action,
              input,
              output,
              duration
            }
          ]
        }
      };
    });
  }, []);

  // Send A2A message between pipeline agents
  const sendPipelineMessage = useCallback(async (message: Omit<HierarchicalMessage, 'id' | 'timestamp'>) => {
    const fullMessage: HierarchicalMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    await supabase
      .from('agent_communications')
      .insert({
        from_agent_id: message.fromAgent.id,
        to_agent_id: message.toAgent.id,
        message_type: message.type,
        message_payload: fullMessage as any,
        conversation_id: pipelineState?.enrollmentId,
        status: 'sent',
        metadata: {
          domain: 'insurance',
          correlationId: message.correlationId,
          priority: message.priority
        } as any
      });

    return fullMessage;
  }, [pipelineState?.enrollmentId]);

  // Execute Verification Stage
  const executeVerificationMutation = useMutation({
    mutationFn: async (context: SharedContext): Promise<VerificationResult> => {
      const startTime = Date.now();
      const agentId = pipelineState?.stages.find(s => s.stage === 'verification')?.agentId || 'verification_agent';
      
      setCurrentAgentId(agentId);
      updateStageStatus('verification', 'in_progress');

      // Simulate insurance verification API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result: VerificationResult = {
        isActive: true,
        eligibilityStatus: 'eligible',
        coverageDetails: {
          inNetwork: true,
          deductible: 1500,
          deductibleMet: 750,
          outOfPocketMax: 6000,
          outOfPocketMet: 1200,
          coinsurance: 20,
          copay: 30,
          priorAuthRequired: true,
          stepTherapyRequired: false,
          quantityLimits: [
            { type: 'days_supply', value: 30, period: 'per_fill' }
          ]
        },
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const duration = Date.now() - startTime;
      addToHistory(agentId, 'verification', 'verify_eligibility', context.insuranceInfo, result, duration);
      updateStageStatus('verification', 'completed', result);

      // Log to database
      await supabase.from('agent_performance_metrics').insert({
        agent_id: orchestratorId || agentId,
        metric_type: 'verification_execution',
        metric_value: duration,
        metric_unit: 'ms',
        execution_context: { stage: 'verification', enrollmentId: context.enrollmentId }
      });

      return result;
    },
    onSuccess: (result) => {
      showSuccess('Verification Complete', `Status: ${result.eligibilityStatus}`);
    },
    onError: (error: any) => {
      updateStageStatus('verification', 'failed', undefined, error.message);
      showError('Verification Failed', error.message);
    }
  });

  // Execute Benefits Investigation Stage
  const executeBenefitsMutation = useMutation({
    mutationFn: async (verificationResult: VerificationResult): Promise<BenefitsInvestigationResult> => {
      const startTime = Date.now();
      const agentId = pipelineState?.stages.find(s => s.stage === 'benefits')?.agentId || 'benefits_agent';
      
      setCurrentAgentId(agentId);
      updateStageStatus('benefits', 'in_progress');

      // Send handoff message from verification to benefits
      await sendPipelineMessage({
        type: 'handoff_request',
        fromAgent: { id: 'verification_agent', domain: 'insurance', role: 'verification', tier: 'sub_agent' },
        toAgent: { id: agentId, domain: 'insurance', role: 'benefits_investigation', tier: 'sub_agent' },
        payload: { verificationResult, context: pipelineState?.context },
        correlationId: pipelineState?.enrollmentId || '',
        priority: 'normal'
      });

      // Simulate benefits investigation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result: BenefitsInvestigationResult = {
        benefitId: `BEN_${Date.now()}`,
        drugCoverage: 'covered_with_restrictions',
        tier: 3,
        priorAuthStatus: verificationResult.coverageDetails.priorAuthRequired ? 'required' : 'not_required',
        stepTherapyStatus: 'not_required',
        patientResponsibility: {
          estimatedCopay: verificationResult.coverageDetails.copay,
          estimatedCoinsurance: 150,
          estimatedDeductible: Math.max(0, verificationResult.coverageDetails.deductible - verificationResult.coverageDetails.deductibleMet),
          totalEstimated: verificationResult.coverageDetails.copay + 150 + Math.max(0, verificationResult.coverageDetails.deductible - verificationResult.coverageDetails.deductibleMet)
        },
        alternativeTherapies: [
          {
            drugName: 'Generic Alternative',
            ndc: '12345678901',
            tier: 1,
            estimatedCost: 15,
            reason: 'Preferred formulary option'
          }
        ],
        investigatedAt: new Date().toISOString()
      };

      const duration = Date.now() - startTime;
      addToHistory(agentId, 'benefits_investigation', 'investigate_benefits', verificationResult, result, duration);
      updateStageStatus('benefits', 'completed', result);

      return result;
    },
    onSuccess: (result) => {
      showSuccess('Benefits Investigation Complete', `Coverage: ${result.drugCoverage}`);
    },
    onError: (error: any) => {
      updateStageStatus('benefits', 'failed', undefined, error.message);
      showError('Benefits Investigation Failed', error.message);
    }
  });

  // Execute Prior Authorization Stage
  const executePriorAuthMutation = useMutation({
    mutationFn: async (benefitsResult: BenefitsInvestigationResult): Promise<PriorAuthorizationResult> => {
      const startTime = Date.now();
      const agentId = pipelineState?.stages.find(s => s.stage === 'prior_auth')?.agentId || 'pa_agent';
      
      setCurrentAgentId(agentId);
      updateStageStatus('prior_auth', 'in_progress');

      if (benefitsResult.priorAuthStatus === 'not_required') {
        const result: PriorAuthorizationResult = {
          paId: 'N/A',
          status: 'approved',
          submittedAt: new Date().toISOString(),
          requiredDocuments: [],
          clinicalCriteria: []
        };
        updateStageStatus('prior_auth', 'skipped', result);
        return result;
      }

      // Simulate PA submission
      await new Promise(resolve => setTimeout(resolve, 2500));

      const result: PriorAuthorizationResult = {
        paId: `PA_${Date.now()}`,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        requiredDocuments: [
          { type: 'diagnosis_code', description: 'Primary diagnosis ICD-10 code', required: true, submitted: true },
          { type: 'prescription', description: 'Current prescription', required: true, submitted: true },
          { type: 'clinical_notes', description: 'Recent clinical notes', required: false, submitted: false }
        ],
        clinicalCriteria: [
          { criterion: 'Diagnosis confirmed', met: true, evidence: 'ICD-10 code documented' },
          { criterion: 'Trial of first-line therapy', met: true, evidence: 'Step therapy completed' },
          { criterion: 'No contraindications', met: true }
        ]
      };

      const duration = Date.now() - startTime;
      addToHistory(agentId, 'prior_authorization', 'submit_pa', benefitsResult, result, duration);
      updateStageStatus('prior_auth', 'completed', result);

      return result;
    },
    onSuccess: (result) => {
      showSuccess('Prior Auth Submitted', `Status: ${result.status}`);
    },
    onError: (error: any) => {
      updateStageStatus('prior_auth', 'failed', undefined, error.message);
      showError('Prior Auth Failed', error.message);
    }
  });

  // Execute Copay Assistance Stage
  const executeCopayMutation = useMutation({
    mutationFn: async (benefitsResult: BenefitsInvestigationResult): Promise<CopayAssistanceResult> => {
      const startTime = Date.now();
      const agentId = pipelineState?.stages.find(s => s.stage === 'copay')?.agentId || 'copay_agent';
      
      setCurrentAgentId(agentId);
      updateStageStatus('copay', 'in_progress');

      // Simulate copay program lookup
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result: CopayAssistanceResult = {
        programId: `COPAY_${Date.now()}`,
        programName: 'Manufacturer Copay Card',
        status: 'eligible',
        maxBenefit: 15000,
        usedBenefit: 0,
        remainingBenefit: 15000,
        cardNumber: '1234567890',
        bin: '610524',
        pcn: 'ASPROD1',
        groupId: 'COPAY01',
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const duration = Date.now() - startTime;
      addToHistory(agentId, 'copay_assistance', 'find_copay_program', benefitsResult.patientResponsibility, result, duration);
      updateStageStatus('copay', 'completed', result);

      return result;
    },
    onSuccess: (result) => {
      showInfo('Copay Assistance Found', `Program: ${result.programName}`);
    },
    onError: (error: any) => {
      updateStageStatus('copay', 'failed', undefined, error.message);
      showError('Copay Search Failed', error.message);
    }
  });

  // Execute Alternative Funding Stage
  const executeAltFundingMutation = useMutation({
    mutationFn: async (context: { benefitsResult: BenefitsInvestigationResult; copayResult?: CopayAssistanceResult }): Promise<AlternativeFundingResult[]> => {
      const startTime = Date.now();
      const agentId = pipelineState?.stages.find(s => s.stage === 'alt_funding')?.agentId || 'alt_funding_agent';
      
      setCurrentAgentId(agentId);
      updateStageStatus('alt_funding', 'in_progress');

      // Simulate foundation/assistance program search
      await new Promise(resolve => setTimeout(resolve, 2000));

      const results: AlternativeFundingResult[] = [
        {
          fundingId: `FUND_${Date.now()}_1`,
          fundingType: 'foundation',
          programName: 'Patient Assistance Foundation',
          status: 'available',
          maxAssistance: 25000,
          incomeRequirement: '< 500% FPL',
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          applicationUrl: 'https://foundation.example.com/apply',
          contactInfo: {
            phone: '1-800-123-4567',
            email: 'help@foundation.example.com'
          }
        },
        {
          fundingId: `FUND_${Date.now()}_2`,
          fundingType: 'manufacturer',
          programName: 'Free Drug Program',
          status: 'available',
          maxAssistance: 50000,
          incomeRequirement: '< 400% FPL',
          contactInfo: {
            phone: '1-800-765-4321'
          }
        }
      ];

      const duration = Date.now() - startTime;
      addToHistory(agentId, 'alternative_funding', 'search_funding', context, results, duration);
      updateStageStatus('alt_funding', 'completed', results);

      return results;
    },
    onSuccess: (results) => {
      showSuccess('Alternative Funding Found', `${results.length} programs available`);
    },
    onError: (error: any) => {
      updateStageStatus('alt_funding', 'failed', undefined, error.message);
      showError('Funding Search Failed', error.message);
    }
  });

  // Execute full pipeline
  const executePipelineMutation = useMutation({
    mutationFn: async (config: InsurancePipelineConfig) => {
      const state = initializePipeline(config);
      
      // Stage 1: Verification
      const verificationResult = await executeVerificationMutation.mutateAsync(state.context);
      
      // Stage 2: Benefits Investigation
      const benefitsResult = await executeBenefitsMutation.mutateAsync(verificationResult);
      
      // Stage 3: Prior Authorization (if required)
      const paResult = await executePriorAuthMutation.mutateAsync(benefitsResult);
      
      // Stage 4 & 5: Copay and Alt Funding (can run in parallel if configured)
      if (config.parallelCopayAndAltFunding) {
        const [copayResult, altFundingResult] = await Promise.all([
          executeCopayMutation.mutateAsync(benefitsResult),
          executeAltFundingMutation.mutateAsync({ benefitsResult })
        ]);
        
        return {
          verification: verificationResult,
          benefits: benefitsResult,
          priorAuth: paResult,
          copay: copayResult,
          altFunding: altFundingResult
        };
      } else {
        const copayResult = await executeCopayMutation.mutateAsync(benefitsResult);
        const altFundingResult = await executeAltFundingMutation.mutateAsync({ benefitsResult, copayResult });
        
        return {
          verification: verificationResult,
          benefits: benefitsResult,
          priorAuth: paResult,
          copay: copayResult,
          altFunding: altFundingResult
        };
      }
    },
    onSuccess: () => {
      setPipelineState(prev => prev ? { ...prev, completedAt: new Date().toISOString() } : null);
      showSuccess('Insurance Pipeline Complete', 'All stages processed successfully');
      queryClient.invalidateQueries({ queryKey: ['insurance-pipeline'] });
    },
    onError: (error: any) => {
      showError('Pipeline Failed', error.message);
    }
  });

  // Get current stage result
  const getStageResult = useCallback(<T>(stage: InsurancePipelineStage): T | undefined => {
    return pipelineState?.stages.find(s => s.stage === stage)?.result as T | undefined;
  }, [pipelineState]);

  // Resume pipeline from a specific stage
  const resumePipelineFromStage = useCallback(async (stage: InsurancePipelineStage) => {
    if (!pipelineState) {
      showError('No Pipeline', 'Initialize pipeline first');
      return;
    }

    const stageIndex = PIPELINE_STAGES.indexOf(stage);
    const previousStage = stageIndex > 0 ? PIPELINE_STAGES[stageIndex - 1] : null;
    const previousResult = previousStage ? getStageResult(previousStage) : null;

    switch (stage) {
      case 'verification':
        await executeVerificationMutation.mutateAsync(pipelineState.context);
        break;
      case 'benefits':
        if (previousResult) await executeBenefitsMutation.mutateAsync(previousResult as VerificationResult);
        break;
      case 'prior_auth':
        if (previousResult) await executePriorAuthMutation.mutateAsync(previousResult as BenefitsInvestigationResult);
        break;
      case 'copay':
        if (previousResult) await executeCopayMutation.mutateAsync(previousResult as BenefitsInvestigationResult);
        break;
      case 'alt_funding':
        await executeAltFundingMutation.mutateAsync({ 
          benefitsResult: getStageResult<BenefitsInvestigationResult>('benefits')!,
          copayResult: getStageResult<CopayAssistanceResult>('copay')
        });
        break;
    }
  }, [pipelineState, getStageResult, executeVerificationMutation, executeBenefitsMutation, executePriorAuthMutation, executeCopayMutation, executeAltFundingMutation, showError]);

  return {
    // State
    pipelineState,
    currentAgentId,
    currentStage: pipelineState?.currentStage,
    stages: pipelineState?.stages || [],
    context: pipelineState?.context,

    // Pipeline control
    initializePipeline,
    executePipeline: executePipelineMutation.mutate,
    resumeFromStage: resumePipelineFromStage,
    isPipelineRunning: executePipelineMutation.isPending,

    // Individual stage execution
    executeVerification: executeVerificationMutation.mutate,
    executeBenefits: executeBenefitsMutation.mutate,
    executePriorAuth: executePriorAuthMutation.mutate,
    executeCopay: executeCopayMutation.mutate,
    executeAltFunding: executeAltFundingMutation.mutate,

    // Stage loading states
    isVerifying: executeVerificationMutation.isPending,
    isInvestigatingBenefits: executeBenefitsMutation.isPending,
    isSubmittingPA: executePriorAuthMutation.isPending,
    isSearchingCopay: executeCopayMutation.isPending,
    isSearchingFunding: executeAltFundingMutation.isPending,

    // Results
    getStageResult,
    verificationResult: getStageResult<VerificationResult>('verification'),
    benefitsResult: getStageResult<BenefitsInvestigationResult>('benefits'),
    paResult: getStageResult<PriorAuthorizationResult>('prior_auth'),
    copayResult: getStageResult<CopayAssistanceResult>('copay'),
    altFundingResult: getStageResult<AlternativeFundingResult[]>('alt_funding')
  };
};
