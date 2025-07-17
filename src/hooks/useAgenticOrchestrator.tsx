import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useHealthcareAI } from './useHealthcareAI';

export interface AgenticContext {
  treatmentModality: 'cell-therapy' | 'gene-therapy' | 'personalized-medicine' | 'radioland-treatment';
  patientId?: string;
  facilityId?: string;
  protocol?: string;
  assessmentData?: Record<string, any>;
  previousTreatments?: string[];
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  healthcareSpecific: boolean;
}

export interface AgenticAgent {
  id: string;
  name: string;
  type: string;
  capabilities: AgentCapability[];
  configuration: Record<string, any>;
  active: boolean;
  healthcareContext: AgenticContext;
}

export interface AgenticWorkflow {
  id: string;
  name: string;
  agents: string[];
  connections: Array<{
    from: string;
    to: string;
    condition: string;
    dataMapping: Record<string, string>;
  }>;
  triggerConditions: string[];
  completionCriteria: string[];
}

export const useAgenticOrchestrator = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeWorkflows, setActiveWorkflows] = useState<AgenticWorkflow[]>([]);
  const [agents, setAgents] = useState<AgenticAgent[]>([]);
  const { executeMCPRequest } = useHealthcareAI();

  const createAgenticAgent = useCallback(async (agentConfig: Partial<AgenticAgent>): Promise<AgenticAgent> => {
    try {
      const agent: AgenticAgent = {
        id: crypto.randomUUID(),
        name: agentConfig.name || 'Healthcare Agent',
        type: agentConfig.type || 'general',
        capabilities: agentConfig.capabilities || [],
        configuration: agentConfig.configuration || {},
        active: true,
        healthcareContext: agentConfig.healthcareContext || {
          treatmentModality: 'personalized-medicine'
        }
      };

      // Store agent in database
      const { error } = await supabase
        .from('api_integration_registry')
        .insert({
          name: agent.name,
          type: 'agentic',
          direction: 'bidirectional',
          category: 'healthcare-ai',
          purpose: `Agentic ${agent.healthcareContext.treatmentModality} assistant`,
          status: 'active',
          lifecycle_stage: 'production',
          version: '1.0.0',
          description: `AI agent specialized in ${agent.healthcareContext.treatmentModality}`,
          // Store agent metadata in webhook_config for now
          webhook_config: {
            agent_id: agent.id,
            agent_type: agent.type,
            capabilities: agent.capabilities.map(cap => ({
              name: cap.name,
              description: cap.description,
              healthcare_specific: cap.healthcareSpecific
            })),
            healthcare_context: {
              treatment_modality: agent.healthcareContext.treatmentModality,
              patient_id: agent.healthcareContext.patientId,
              facility_id: agent.healthcareContext.facilityId,
              protocol: agent.healthcareContext.protocol
            }
          }
        });

      if (error) throw error;

      setAgents(prev => [...prev, agent]);
      toast.success(`Agent "${agent.name}" created successfully`);
      
      return agent;
    } catch (error: any) {
      toast.error('Failed to create agentic agent: ' + error.message);
      throw error;
    }
  }, []);

  const executeAgenticWorkflow = useCallback(async (
    workflowId: string, 
    context: AgenticContext,
    userInput?: string
  ): Promise<any> => {
    setIsExecuting(true);
    
    try {
      const workflow = activeWorkflows.find(w => w.id === workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      // Execute workflow through MCP protocol
      const result = await executeMCPRequest({
        method: 'healthcare.agentic.workflow.execute',
        params: {
          workflow_id: workflowId,
          context: context,
          user_input: userInput,
          agents: workflow.agents,
          connections: workflow.connections
        }
      });

      toast.success('Agentic workflow executed successfully');
      return result;

    } catch (error: any) {
      toast.error('Agentic workflow execution failed: ' + error.message);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [activeWorkflows, executeMCPRequest]);

  const createHealthcareAgenticAPI = useCallback(async (
    agentId: string,
    configuration: {
      endpoints: Array<{
        path: string;
        method: string;
        description: string;
        treatmentSpecific: boolean;
      }>;
      authentication: 'api-key' | 'oauth' | 'none';
      rateLimit: number;
      healthcareCompliance: boolean;
    }
  ) => {
    try {
      // Create external API endpoint for the agent
      const { data, error } = await supabase
        .from('external_api_registry')
        .insert({
          external_name: `Healthcare Agent API - ${agentId}`,
          internal_api_id: agentId,
          status: 'draft',
          visibility: 'private',
          pricing_model: 'subscription',
          version: '1.0.0',
          category: 'healthcare-ai',
          supported_formats: ['json'],
          authentication_methods: [configuration.authentication],
          rate_limits: {
            requests_per_minute: configuration.rateLimit,
            burst_limit: configuration.rateLimit * 2
          },
          marketplace_config: {
            healthcare_compliance: configuration.healthcareCompliance,
            treatment_modalities: ['cell-therapy', 'gene-therapy', 'personalized-medicine', 'radioland-treatment'],
            certification_level: 'clinical-grade'
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Create API endpoints
      for (const endpoint of configuration.endpoints) {
        await supabase
          .from('external_api_endpoints')
          .insert({
            external_api_id: data.id,
            external_path: endpoint.path,
            method: endpoint.method,
            summary: endpoint.description,
            description: `Healthcare agentic endpoint for ${endpoint.description}`,
            requires_authentication: configuration.authentication !== 'none',
            is_public: false,
            request_schema: {
              type: 'object',
              properties: {
                context: {
                  type: 'object',
                  description: 'Healthcare treatment context'
                },
                input: {
                  type: 'string',
                  description: 'User input or query'
                }
              }
            },
            response_schema: {
              type: 'object',
              properties: {
                response: {
                  type: 'string',
                  description: 'Agent response'
                },
                confidence: {
                  type: 'number',
                  description: 'Response confidence score'
                },
                recommendations: {
                  type: 'array',
                  description: 'Clinical recommendations'
                }
              }
            }
          });
      }

      toast.success('Healthcare Agentic API created successfully');
      return data;

    } catch (error: any) {
      toast.error('Failed to create agentic API: ' + error.message);
      throw error;
    }
  }, []);

  const orchestrateMultiModalTreatment = useCallback(async (
    patientContext: {
      patientId: string;
      medicalHistory: any;
      currentCondition: string;
      treatmentGoals: string[];
    },
    modalities: Array<'cell-therapy' | 'gene-therapy' | 'personalized-medicine' | 'radioland-treatment'>
  ) => {
    try {
      setIsExecuting(true);

      // Create multi-modal treatment workflow
      const workflow: AgenticWorkflow = {
        id: crypto.randomUUID(),
        name: `Multi-Modal Treatment for Patient ${patientContext.patientId}`,
        agents: modalities.map(modality => `${modality}-agent`),
        connections: [
          {
            from: 'assessment-shared',
            to: 'personalized-medicine-agent',
            condition: 'initial_assessment_complete',
            dataMapping: { assessment: 'patient_profile' }
          },
          ...modalities.map(modality => ({
            from: 'personalized-medicine-agent',
            to: `${modality}-agent`,
            condition: `${modality}_recommended`,
            dataMapping: { patient_profile: 'treatment_context' }
          }))
        ],
        triggerConditions: ['new_patient_assessment'],
        completionCriteria: ['all_modalities_evaluated', 'treatment_plan_finalized']
      };

      // Execute shared assessment first
      const assessmentResult = await executeMCPRequest({
        method: 'healthcare.assessment.shared_evaluation',
        params: {
          patient_context: patientContext,
          modalities: modalities,
          assessment_type: 'comprehensive'
        }
      });

      // Execute each modality-specific agent
      const modalityResults = await Promise.all(
        modalities.map(async (modality) => {
          return await executeMCPRequest({
            method: `healthcare.${modality.replace('-', '_')}.evaluate`,
            params: {
              patient_context: patientContext,
              shared_assessment: assessmentResult.result,
              treatment_goals: patientContext.treatmentGoals
            }
          });
        })
      );

      // Combine results into unified treatment recommendation
      const unifiedRecommendation = await executeMCPRequest({
        method: 'healthcare.treatment.synthesize_recommendations',
        params: {
          patient_context: patientContext,
          modality_evaluations: modalityResults,
          shared_assessment: assessmentResult.result
        }
      });

      setActiveWorkflows(prev => [...prev, workflow]);
      
      toast.success('Multi-modal treatment orchestration completed');
      return {
        workflow,
        assessment: assessmentResult,
        modalityEvaluations: modalityResults,
        unifiedRecommendation
      };

    } catch (error: any) {
      toast.error('Multi-modal orchestration failed: ' + error.message);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [executeMCPRequest]);

  return {
    // Agent Management
    createAgenticAgent,
    agents,
    setAgents,

    // Workflow Execution
    executeAgenticWorkflow,
    orchestrateMultiModalTreatment,
    activeWorkflows,
    setActiveWorkflows,

    // API Publishing
    createHealthcareAgenticAPI,

    // State
    isExecuting
  };
};