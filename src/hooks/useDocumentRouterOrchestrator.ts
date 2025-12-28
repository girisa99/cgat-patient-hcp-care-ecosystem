/**
 * Document Router Orchestrator Hook
 * Top-level orchestrator that classifies incoming documents and routes to domain pipelines
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from '@/hooks/useMasterToast';
import { useInsurancePipeline } from './useInsurancePipeline';
import { useMedicalCoding } from './useMedicalCoding';
import { useAdherenceOrchestrator } from './useAdherenceOrchestrator';
import {
  DomainType,
  SharedContext,
  PipelineStatus,
  HierarchicalMessage
} from '@/types/hierarchical-agent-types';

// Document classification types
export type DocumentType = 
  | 'patient_enrollment'
  | 'prescription_refill'
  | 'prior_auth_request'
  | 'prior_auth_appeal'
  | 'benefits_reverification'
  | 'adverse_event_report'
  | 'provider_referral'
  | 'copay_assistance_application'
  | 'patient_assistance_application'
  | 'medication_change'
  | 'insurance_change'
  | 'unknown';

export interface DocumentClassification {
  documentType: DocumentType;
  confidence: number;
  requiredDomains: DomainType[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  extractedData: ExtractedDocumentData;
  reasoning: string;
}

export interface ExtractedDocumentData {
  patientId?: string;
  patientName?: string;
  dateOfBirth?: string;
  insuranceInfo?: {
    payerId?: string;
    memberId?: string;
    groupNumber?: string;
  };
  medicationInfo?: {
    drugName?: string;
    ndc?: string;
    strength?: string;
    quantity?: number;
  };
  providerInfo?: {
    name?: string;
    npi?: string;
    phone?: string;
  };
  diagnosisCodes?: string[];
  urgencyIndicators?: string[];
}

export interface DocumentRoutingState {
  documentId: string;
  sourceType: 'upload' | 'fax' | 'email' | 'portal' | 'api';
  classification?: DocumentClassification;
  activePipelines: ActivePipeline[];
  status: PipelineStatus;
  startedAt: string;
  completedAt?: string;
  auditLog: RoutingAuditEntry[];
}

export interface ActivePipeline {
  domain: DomainType;
  status: PipelineStatus;
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export interface RoutingAuditEntry {
  timestamp: string;
  action: string;
  domain?: DomainType;
  details: string;
  agentId?: string;
}

// Document type to domain mapping
const DOCUMENT_DOMAIN_MAP: Record<DocumentType, DomainType[]> = {
  patient_enrollment: ['insurance', 'medication', 'patient'],
  prescription_refill: ['insurance', 'medication', 'adherence'],
  prior_auth_request: ['insurance', 'medication'],
  prior_auth_appeal: ['insurance', 'medication'],
  benefits_reverification: ['insurance'],
  adverse_event_report: ['medication', 'patient'],
  provider_referral: ['patient'],
  copay_assistance_application: ['insurance'],
  patient_assistance_application: ['insurance'],
  medication_change: ['insurance', 'medication', 'adherence'],
  insurance_change: ['insurance'],
  unknown: []
};

// Priority classification rules
const PRIORITY_KEYWORDS: Record<string, 'urgent' | 'high'> = {
  'urgent': 'urgent',
  'stat': 'urgent',
  'emergency': 'urgent',
  'time-sensitive': 'high',
  'expedite': 'high',
  'appeal deadline': 'high',
  'coverage ending': 'high'
};

export const useDocumentRouterOrchestrator = (orchestratorId?: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError, showInfo } = useMasterToast();
  
  const [routingState, setRoutingState] = useState<DocumentRoutingState | null>(null);
  
  // Domain orchestrators
  const insurancePipeline = useInsurancePipeline(orchestratorId);
  const medicalCoding = useMedicalCoding(orchestratorId);
  const adherenceOrchestrator = useAdherenceOrchestrator(orchestratorId);

  // Add audit log entry
  const addAuditEntry = useCallback((action: string, details: string, domain?: DomainType) => {
    setRoutingState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        auditLog: [
          ...prev.auditLog,
          {
            timestamp: new Date().toISOString(),
            action,
            domain,
            details,
            agentId: orchestratorId
          }
        ]
      };
    });
  }, [orchestratorId]);

  // Classify document using AI
  const classifyDocumentMutation = useMutation({
    mutationFn: async ({ 
      documentContent, 
      documentMetadata 
    }: { 
      documentContent: string; 
      documentMetadata?: Record<string, any>;
    }): Promise<DocumentClassification> => {
      const startTime = Date.now();
      
      // Simulate AI classification (in production, call LLM)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Extract key indicators from content
      const contentLower = documentContent.toLowerCase();
      
      // Determine document type based on keywords
      let documentType: DocumentType = 'unknown';
      let confidence = 0.5;

      if (contentLower.includes('enrollment') || contentLower.includes('new patient')) {
        documentType = 'patient_enrollment';
        confidence = 0.92;
      } else if (contentLower.includes('refill') || contentLower.includes('renewal')) {
        documentType = 'prescription_refill';
        confidence = 0.88;
      } else if (contentLower.includes('prior authorization') || contentLower.includes('pa request')) {
        documentType = 'prior_auth_request';
        confidence = 0.95;
      } else if (contentLower.includes('appeal') || contentLower.includes('reconsideration')) {
        documentType = 'prior_auth_appeal';
        confidence = 0.90;
      } else if (contentLower.includes('reverification') || contentLower.includes('eligibility check')) {
        documentType = 'benefits_reverification';
        confidence = 0.85;
      } else if (contentLower.includes('adverse') || contentLower.includes('side effect')) {
        documentType = 'adverse_event_report';
        confidence = 0.87;
      } else if (contentLower.includes('copay card') || contentLower.includes('copay assistance')) {
        documentType = 'copay_assistance_application';
        confidence = 0.89;
      } else if (contentLower.includes('patient assistance') || contentLower.includes('pap')) {
        documentType = 'patient_assistance_application';
        confidence = 0.86;
      }

      // Determine priority
      let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';
      for (const [keyword, level] of Object.entries(PRIORITY_KEYWORDS)) {
        if (contentLower.includes(keyword)) {
          priority = level;
          break;
        }
      }

      // Extract data (simplified - production would use NER/LLM)
      const extractedData: ExtractedDocumentData = {
        urgencyIndicators: Object.keys(PRIORITY_KEYWORDS).filter(k => contentLower.includes(k))
      };

      // Match drug names from content (simplified)
      const drugPatterns = ['humira', 'keytruda', 'humalog', 'enbrel', 'remicade'];
      for (const drug of drugPatterns) {
        if (contentLower.includes(drug)) {
          extractedData.medicationInfo = { drugName: drug.charAt(0).toUpperCase() + drug.slice(1) };
          break;
        }
      }

      const classification: DocumentClassification = {
        documentType,
        confidence,
        requiredDomains: DOCUMENT_DOMAIN_MAP[documentType],
        priority,
        extractedData,
        reasoning: `Classified as ${documentType} based on content analysis. Confidence: ${(confidence * 100).toFixed(0)}%`
      };

      // Log classification
      if (orchestratorId) {
        await supabase.from('agent_performance_metrics').insert({
          agent_id: orchestratorId,
          metric_type: 'document_classification',
          metric_value: Date.now() - startTime,
          metric_unit: 'ms',
          execution_context: { 
            documentType, 
            confidence, 
            priority,
            domains: classification.requiredDomains
          }
        });
      }

      return classification;
    },
    onSuccess: (classification) => {
      showInfo('Document Classified', `Type: ${classification.documentType.replace(/_/g, ' ')} (${(classification.confidence * 100).toFixed(0)}% confidence)`);
      addAuditEntry('classification_complete', `Document classified as ${classification.documentType}`);
    },
    onError: (error: any) => {
      showError('Classification Failed', error.message);
    }
  });

  // Route document to appropriate pipelines
  const routeDocumentMutation = useMutation({
    mutationFn: async ({
      documentId,
      sourceType,
      documentContent,
      metadata
    }: {
      documentId: string;
      sourceType: DocumentRoutingState['sourceType'];
      documentContent: string;
      metadata?: Record<string, any>;
    }): Promise<DocumentRoutingState> => {
      // Initialize routing state
      const initialState: DocumentRoutingState = {
        documentId,
        sourceType,
        activePipelines: [],
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        auditLog: [{
          timestamp: new Date().toISOString(),
          action: 'routing_started',
          details: `Document ${documentId} received from ${sourceType}`
        }]
      };
      setRoutingState(initialState);

      // Step 1: Classify document
      const classification = await classifyDocumentMutation.mutateAsync({ 
        documentContent, 
        documentMetadata: metadata 
      });

      setRoutingState(prev => prev ? { ...prev, classification } : null);

      // Step 2: Initialize pipelines for required domains
      const activePipelines: ActivePipeline[] = classification.requiredDomains.map(domain => ({
        domain,
        status: 'pending' as PipelineStatus
      }));

      setRoutingState(prev => prev ? { ...prev, activePipelines } : null);

      // Step 3: Execute pipelines (can be parallel or sequential based on dependencies)
      const pipelineResults = await Promise.allSettled(
        classification.requiredDomains.map(async (domain) => {
          // Update pipeline status to in_progress
          setRoutingState(prev => {
            if (!prev) return null;
            return {
              ...prev,
              activePipelines: prev.activePipelines.map(p => 
                p.domain === domain ? { ...p, status: 'in_progress', startedAt: new Date().toISOString() } : p
              )
            };
          });

          addAuditEntry('pipeline_started', `Starting ${domain} pipeline`, domain);

          try {
            let result: any;

            switch (domain) {
              case 'insurance':
                // Execute insurance pipeline
                if (classification.extractedData.insuranceInfo?.payerId) {
                  result = await new Promise((resolve) => {
                    setTimeout(() => {
                      resolve({ 
                        domain: 'insurance', 
                        status: 'completed',
                        message: 'Insurance pipeline executed'
                      });
                    }, 2000);
                  });
                } else {
                  result = { domain: 'insurance', status: 'pending_info', message: 'Awaiting insurance information' };
                }
                break;

              case 'medication':
                // Execute coding suggestions
                if (classification.extractedData.medicationInfo?.drugName) {
                  medicalCoding.generateSuggestions({
                    medicationId: documentId,
                    medicationName: classification.extractedData.medicationInfo.drugName,
                    indication: classification.extractedData.diagnosisCodes?.[0]
                  });
                  result = { domain: 'medication', status: 'suggestions_generated' };
                } else {
                  result = { domain: 'medication', status: 'pending_info', message: 'Awaiting medication details' };
                }
                break;

              case 'adherence':
                // Start adherence monitoring if patient exists
                if (classification.extractedData.patientId) {
                  adherenceOrchestrator.executeMonitoring({
                    patientId: classification.extractedData.patientId,
                    medicationId: documentId
                  });
                  result = { domain: 'adherence', status: 'monitoring_started' };
                } else {
                  result = { domain: 'adherence', status: 'deferred', message: 'Will activate after enrollment' };
                }
                break;

              default:
                result = { domain, status: 'not_implemented' };
            }

            // Update pipeline status
            setRoutingState(prev => {
              if (!prev) return null;
              return {
                ...prev,
                activePipelines: prev.activePipelines.map(p => 
                  p.domain === domain 
                    ? { ...p, status: 'completed', completedAt: new Date().toISOString(), result } 
                    : p
                )
              };
            });

            addAuditEntry('pipeline_completed', `${domain} pipeline completed`, domain);
            return result;

          } catch (error: any) {
            setRoutingState(prev => {
              if (!prev) return null;
              return {
                ...prev,
                activePipelines: prev.activePipelines.map(p => 
                  p.domain === domain 
                    ? { ...p, status: 'failed', completedAt: new Date().toISOString(), error: error.message } 
                    : p
                )
              };
            });

            addAuditEntry('pipeline_failed', `${domain} pipeline failed: ${error.message}`, domain);
            throw error;
          }
        })
      );

      // Finalize routing state
      const finalState = {
        ...initialState,
        classification,
        activePipelines: routingState?.activePipelines || activePipelines,
        status: 'completed' as PipelineStatus,
        completedAt: new Date().toISOString()
      };

      setRoutingState(finalState);

      // Log routing completion
      await supabase.from('agent_communications').insert({
        from_agent_id: orchestratorId || 'document_router',
        message_type: 'notification',
        message_payload: {
          type: 'routing_complete',
          documentId,
          documentType: classification.documentType,
          domains: classification.requiredDomains,
          results: pipelineResults
        } as any,
        status: 'processed',
        metadata: { isRoutingResult: true } as any
      });

      return finalState;
    },
    onSuccess: (state) => {
      const successCount = state.activePipelines.filter(p => p.status === 'completed').length;
      showSuccess('Document Routed', `${successCount}/${state.activePipelines.length} pipelines completed`);
    },
    onError: (error: any) => {
      setRoutingState(prev => prev ? { ...prev, status: 'failed' } : null);
      showError('Routing Failed', error.message);
    }
  });

  // Get pipeline status for a specific domain
  const getPipelineStatus = useCallback((domain: DomainType): ActivePipeline | undefined => {
    return routingState?.activePipelines.find(p => p.domain === domain);
  }, [routingState]);

  // Retry a failed pipeline
  const retryPipelineMutation = useMutation({
    mutationFn: async (domain: DomainType) => {
      if (!routingState?.classification) {
        throw new Error('No classification available');
      }

      setRoutingState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          activePipelines: prev.activePipelines.map(p => 
            p.domain === domain ? { ...p, status: 'pending', error: undefined } : p
          )
        };
      });

      addAuditEntry('pipeline_retry', `Retrying ${domain} pipeline`, domain);
      
      // Re-execute the specific pipeline
      // (Implementation would mirror the switch statement in routeDocumentMutation)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRoutingState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          activePipelines: prev.activePipelines.map(p => 
            p.domain === domain 
              ? { ...p, status: 'completed', completedAt: new Date().toISOString() } 
              : p
          )
        };
      });

      return { domain, status: 'completed' };
    },
    onSuccess: ({ domain }) => {
      showSuccess('Retry Successful', `${domain} pipeline completed`);
    }
  });

  // Manual override for document classification
  const overrideClassificationMutation = useMutation({
    mutationFn: async ({ 
      documentType, 
      reason 
    }: { 
      documentType: DocumentType; 
      reason: string;
    }) => {
      if (!routingState) throw new Error('No active routing');

      const newClassification: DocumentClassification = {
        ...routingState.classification!,
        documentType,
        requiredDomains: DOCUMENT_DOMAIN_MAP[documentType],
        confidence: 1.0,
        reasoning: `Manual override: ${reason}`
      };

      setRoutingState(prev => prev ? { ...prev, classification: newClassification } : null);
      addAuditEntry('classification_override', `Manually changed to ${documentType}: ${reason}`);

      return newClassification;
    },
    onSuccess: (classification) => {
      showInfo('Classification Updated', `Changed to ${classification.documentType}`);
    }
  });

  return {
    // State
    routingState,
    classification: routingState?.classification,
    activePipelines: routingState?.activePipelines || [],
    auditLog: routingState?.auditLog || [],
    
    // Actions
    classifyDocument: classifyDocumentMutation.mutate,
    routeDocument: routeDocumentMutation.mutate,
    retryPipeline: retryPipelineMutation.mutate,
    overrideClassification: overrideClassificationMutation.mutate,
    
    // Loading states
    isClassifying: classifyDocumentMutation.isPending,
    isRouting: routeDocumentMutation.isPending,
    isRetrying: retryPipelineMutation.isPending,
    
    // Helpers
    getPipelineStatus,
    
    // Domain orchestrators (exposed for direct access if needed)
    insurancePipeline,
    medicalCoding,
    adherenceOrchestrator
  };
};
