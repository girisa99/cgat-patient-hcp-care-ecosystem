/**
 * UNIFIED AGENT USE CASE REGISTRY
 * Central registry connecting all agent systems: deployments, channels, branding, MCP, features
 * Supports any agent type: enrollment, order status, treatment center, manufacturing, etc.
 */
import { supabase } from '@/integrations/supabase/client';
import { UseCase, USE_CASE_TEMPLATES } from '@/types/unified-agent-builder';
import { DeploymentFeatureConfig, deploymentFeaturePersistence } from './deploymentFeaturePersistence';
import { EnrollmentMCPBridge } from './enrollmentMCPBridge';

// Extended use case templates for different industries
export const EXTENDED_USE_CASE_TEMPLATES: UseCase[] = [
  ...USE_CASE_TEMPLATES,
  {
    id: 'order_status',
    name: 'Order Status Agent',
    description: 'Track and provide order status updates to customers',
    category: 'customer-service',
    complexity: 'simple',
    recommended_journey: [
      { id: 'identify_order', title: 'Identify Order', type: 'information_gathering', components_involved: [] },
      { id: 'fetch_status', title: 'Fetch Order Status', type: 'action_required', components_involved: [] },
      { id: 'provide_update', title: 'Provide Update', type: 'completion', components_involved: [] }
    ],
    required_components: [
      { id: 'order_api', name: 'Order Management API', category: 'integration', dependencies: [], provides: ['order_data'] },
      { id: 'crm_connector', name: 'CRM Connector', category: 'integration', dependencies: [], provides: ['customer_data'] }
    ],
    optional_components: [
      { id: 'notification_service', name: 'Notification Service', category: 'enhancement', dependencies: [], provides: ['notifications'] }
    ],
    templates: {
      canvas_layout: { type: 'vertical', auto_layout: true },
      default_actions: [
        { name: 'lookup_order', type: 'api_call', config: { endpoint: '/orders/{orderId}' } },
        { name: 'send_notification', type: 'notification', config: {} }
      ],
      suggested_connectors: ['salesforce', 'shopify', 'woocommerce'],
      knowledge_sources: ['order_policies', 'shipping_info'],
      deployment_profile: { channels: ['web-chat', 'whatsapp', 'voice-call'] }
    }
  },
  {
    id: 'treatment_center_onboarding',
    name: 'Treatment Center Onboarding',
    description: 'Onboard treatment centers and clinics to the healthcare network',
    category: 'healthcare',
    complexity: 'complex',
    recommended_journey: [
      { id: 'facility_info', title: 'Facility Information', type: 'information_gathering', components_involved: [] },
      { id: 'license_verification', title: 'License Verification', type: 'action_required', components_involved: [] },
      { id: 'credentialing', title: 'Staff Credentialing', type: 'action_required', components_involved: [] },
      { id: 'contract_setup', title: 'Contract Setup', type: 'action_required', components_involved: [] },
      { id: 'integration_config', title: 'System Integration', type: 'action_required', components_involved: [] },
      { id: 'go_live', title: 'Go Live Validation', type: 'completion', components_involved: [] }
    ],
    required_components: [
      { id: 'npi_verification', name: 'NPI Verification', category: 'integration', dependencies: [], provides: ['npi_data'] },
      { id: 'license_api', name: 'License Verification API', category: 'integration', dependencies: [], provides: ['license_status'] },
      { id: 'contract_management', name: 'Contract Management', category: 'integration', dependencies: [], provides: ['contracts'] }
    ],
    optional_components: [
      { id: 'ehr_integration', name: 'EHR Integration', category: 'integration', dependencies: [], provides: ['medical_records'] }
    ],
    templates: {
      canvas_layout: { type: 'vertical', auto_layout: true },
      default_actions: [
        { name: 'verify_npi', type: 'api_call', config: {} },
        { name: 'check_license', type: 'api_call', config: {} },
        { name: 'generate_contract', type: 'document', config: {} }
      ],
      suggested_connectors: ['npi_registry', 'state_license_boards', 'docusign'],
      knowledge_sources: ['healthcare_regulations', 'credentialing_requirements'],
      deployment_profile: { channels: ['web-chat', 'email'], hipaa_compliant: true }
    }
  },
  {
    id: 'manufacturing_onboarding',
    name: 'Manufacturing Partner Onboarding',
    description: 'Onboard manufacturing partners and suppliers',
    category: 'automation',
    complexity: 'complex',
    recommended_journey: [
      { id: 'company_profile', title: 'Company Profile', type: 'information_gathering', components_involved: [] },
      { id: 'certification_check', title: 'Certification Verification', type: 'action_required', components_involved: [] },
      { id: 'quality_assessment', title: 'Quality Assessment', type: 'action_required', components_involved: [] },
      { id: 'supplier_agreement', title: 'Supplier Agreement', type: 'action_required', components_involved: [] },
      { id: 'system_integration', title: 'ERP Integration', type: 'action_required', components_involved: [] },
      { id: 'pilot_order', title: 'Pilot Order Setup', type: 'completion', components_involved: [] }
    ],
    required_components: [
      { id: 'erp_connector', name: 'ERP Connector', category: 'integration', dependencies: [], provides: ['erp_data'] },
      { id: 'quality_system', name: 'Quality Management', category: 'integration', dependencies: [], provides: ['quality_data'] }
    ],
    optional_components: [
      { id: 'supply_chain', name: 'Supply Chain Visibility', category: 'enhancement', dependencies: [], provides: ['tracking'] }
    ],
    templates: {
      canvas_layout: { type: 'vertical', auto_layout: true },
      default_actions: [
        { name: 'verify_certifications', type: 'api_call', config: {} },
        { name: 'create_supplier_profile', type: 'database', config: {} },
        { name: 'setup_integration', type: 'configuration', config: {} }
      ],
      suggested_connectors: ['sap', 'oracle_erp', 'netsuite'],
      knowledge_sources: ['quality_standards', 'compliance_requirements'],
      deployment_profile: { channels: ['web-chat', 'email'] }
    }
  }
];

export interface AgentRegistration {
  id: string;
  name: string;
  description: string;
  use_case_id: string;
  use_case: UseCase;
  deployment_id?: string;
  agent_id?: string;
  status: 'draft' | 'configured' | 'deployed' | 'active' | 'paused';
  branding: {
    brand_name: string;
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
    tagline?: string;
  };
  channels: {
    channel_id: string;
    channel_type: string;
    status: 'pending' | 'active' | 'paused';
    config?: Record<string, any>;
  }[];
  feature_config: DeploymentFeatureConfig | null;
  mcp_config: {
    enabled_tools: string[];
    crm_integrations: string[];
    db_sync_enabled: boolean;
  };
  rate_limits: {
    requests_per_minute: number;
    requests_per_day: number;
    tokens_per_request: number;
  };
  metrics: {
    total_conversations: number;
    active_sessions: number;
    avg_response_time_ms: number;
    success_rate: number;
  };
  created_at: string;
  updated_at: string;
}

class UnifiedAgentUseCaseRegistry {
  /**
   * Get all available use case templates
   */
  getUseCaseTemplates(): UseCase[] {
    return EXTENDED_USE_CASE_TEMPLATES;
  }

  /**
   * Get use case by ID
   */
  getUseCaseById(useCaseId: string): UseCase | undefined {
    return EXTENDED_USE_CASE_TEMPLATES.find(uc => uc.id === useCaseId);
  }

  /**
   * Register a new agent with a specific use case
   */
  async registerAgent(params: {
    name: string;
    description: string;
    useCaseId: string;
    branding: AgentRegistration['branding'];
    channels?: string[];
    featureConfig?: Partial<DeploymentFeatureConfig>;
  }): Promise<{ success: boolean; agentId?: string; deploymentId?: string; error?: string }> {
    try {
      const useCase = this.getUseCaseById(params.useCaseId);
      if (!useCase) {
        return { success: false, error: 'Invalid use case ID' };
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      // 1. Create the agent record
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .insert({
          name: params.name,
          description: params.description,
          use_case: params.useCaseId,
          brand: params.branding.brand_name,
          status: 'draft',
          created_by: userId,
          configuration: {
            use_case: useCase,
            branding: params.branding,
          } as any,
        })
        .select('id')
        .single();

      if (agentError) throw agentError;

      // 2. Create deployment with feature config
      const deploymentResult = await deploymentFeaturePersistence.createDeploymentWithFeatures(
        params.name,
        params.description,
        {
          enabled_features: params.featureConfig?.enabled_features || [],
          personality_mode: params.featureConfig?.personality_mode || 'professional',
          ai_provider: params.featureConfig?.ai_provider || 'gemini',
          mcp_config: params.featureConfig?.mcp_config,
        },
        agentData.id
      );

      if (!deploymentResult.success) {
        throw new Error(deploymentResult.error);
      }

      // 3. Create channel deployments if specified
      if (params.channels && params.channels.length > 0) {
        const channelDeployments = params.channels.map(channelType => ({
          agent_id: agentData.id,
          channel_id: `${channelType}-${Date.now()}`,
          channel_type: channelType,
          deployment_status: 'pending',
          deployment_config: {},
          priority: 1,
        }));

        await supabase
          .from('agent_channel_deployments')
          .insert(channelDeployments);
      }

      return {
        success: true,
        agentId: agentData.id,
        deploymentId: deploymentResult.deploymentId,
      };
    } catch (error) {
      console.error('Failed to register agent:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get all registered agents with their configurations
   */
  async getAllRegisteredAgents(): Promise<AgentRegistration[]> {
    try {
      // Fetch agents with deployments
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select(`
          *,
          agent_channel_deployments (
            id,
            channel_id,
            channel_type,
            deployment_status,
            deployment_config,
            performance_metrics
          )
        `)
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;

      // Fetch deployments
      const { data: deployments } = await supabase
        .from('genie_deployments')
        .select('*');

      // Map to AgentRegistration format
      return (agents || []).map(agent => {
        const deployment = deployments?.find(d => d.agent_id === agent.id);
        const useCase = this.getUseCaseById(agent.use_case) || EXTENDED_USE_CASE_TEMPLATES[0];
        const config = agent.configuration as Record<string, any> || {};

        const configJson = deployment?.configuration as unknown as DeploymentFeatureConfig | null;

        return {
          id: agent.id,
          name: agent.name,
          description: agent.description || '',
          use_case_id: agent.use_case || 'custom',
          use_case: useCase,
          deployment_id: deployment?.id,
          agent_id: agent.id,
          status: agent.status as AgentRegistration['status'],
          branding: {
            brand_name: agent.brand || agent.name,
            primary_color: config.branding?.primary_color,
            secondary_color: config.branding?.secondary_color,
            logo_url: config.branding?.logo_url,
            tagline: config.branding?.tagline,
          },
          channels: (agent.agent_channel_deployments || []).map((ch: any) => ({
            channel_id: ch.channel_id,
            channel_type: ch.channel_type,
            status: ch.deployment_status,
            config: ch.deployment_config,
          })),
          feature_config: configJson,
          mcp_config: {
            enabled_tools: configJson?.mcp_config?.enabled_tools || [],
            crm_integrations: configJson?.mcp_config?.crm_integrations || [],
            db_sync_enabled: configJson?.mcp_config?.db_sync_enabled || false,
          },
          rate_limits: {
            requests_per_minute: agent.api_rate_limit || 60,
            requests_per_day: 10000,
            tokens_per_request: agent.max_tokens || 4096,
          },
          metrics: {
            total_conversations: deployment?.total_conversations || 0,
            active_sessions: 0,
            avg_response_time_ms: 0,
            success_rate: deployment?.avg_confidence_score || 0,
          },
          created_at: agent.created_at,
          updated_at: agent.updated_at,
        };
      });
    } catch (error) {
      console.error('Failed to fetch registered agents:', error);
      return [];
    }
  }

  /**
   * Update agent configuration
   */
  async updateAgentConfig(
    agentId: string,
    updates: Partial<{
      name: string;
      description: string;
      branding: AgentRegistration['branding'];
      featureConfig: Partial<DeploymentFeatureConfig>;
      rateLimits: AgentRegistration['rate_limits'];
      status: AgentRegistration['status'];
    }>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const agentUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name) agentUpdates.name = updates.name;
      if (updates.description) agentUpdates.description = updates.description;
      if (updates.status) agentUpdates.status = updates.status;
      if (updates.branding) {
        agentUpdates.brand = updates.branding.brand_name;
      }
      if (updates.rateLimits) {
        agentUpdates.api_rate_limit = updates.rateLimits.requests_per_minute;
        agentUpdates.max_tokens = updates.rateLimits.tokens_per_request;
      }

      const { error } = await supabase
        .from('agents')
        .update(agentUpdates)
        .eq('id', agentId);

      if (error) throw error;

      // Update deployment feature config if provided
      if (updates.featureConfig) {
        const { data: deployment } = await supabase
          .from('genie_deployments')
          .select('id')
          .eq('agent_id', agentId)
          .single();

        if (deployment) {
          await deploymentFeaturePersistence.saveDeploymentFeatures(deployment.id, updates.featureConfig);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to update agent config:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Deploy agent to channels
   */
  async deployToChannels(
    agentId: string,
    channels: { channelType: string; config?: Record<string, any> }[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const deployments = channels.map(ch => ({
        agent_id: agentId,
        channel_id: `${ch.channelType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        channel_type: ch.channelType,
        deployment_status: 'pending',
        deployment_config: ch.config || {},
        priority: 1,
      }));

      const { error } = await supabase
        .from('agent_channel_deployments')
        .insert(deployments);

      if (error) throw error;

      // Update agent status
      await supabase
        .from('agents')
        .update({ status: 'deployed' })
        .eq('id', agentId);

      return { success: true };
    } catch (error) {
      console.error('Failed to deploy to channels:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Activate/Pause agent deployment
   */
  async toggleAgentStatus(agentId: string, activate: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const newStatus = activate ? 'active' : 'paused';
      
      const { error: agentError } = await supabase
        .from('agents')
        .update({ status: newStatus })
        .eq('id', agentId);

      if (agentError) throw agentError;

      // Update channel deployments
      const { error: deploymentError } = await supabase
        .from('agent_channel_deployments')
        .update({ deployment_status: activate ? 'active' : 'paused' })
        .eq('agent_id', agentId);

      if (deploymentError) throw deploymentError;

      return { success: true };
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Generate deployment snippet code for an agent
   */
  generateSnippetCode(agent: AgentRegistration, format: 'javascript' | 'react' | 'python' | 'curl'): string {
    const baseUrl = 'https://ai.gateway.lovable.dev';
    
    switch (format) {
      case 'javascript':
        return `// ${agent.name} - JavaScript Integration
const AGENT_ID = '${agent.id}';
const API_BASE = '${baseUrl}';

async function chat(message, sessionId) {
  const response = await fetch(\`\${API_BASE}/v1/chat/completions\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Agent-ID': AGENT_ID,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: message }],
      stream: true,
    }),
  });
  return response;
}`;

      case 'react':
        return `// ${agent.name} - React Integration
import { useState } from 'react';

const AGENT_ID = '${agent.id}';

export function use${agent.name.replace(/\s+/g, '')}Agent() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content }]);
    
    // Call your edge function here
    const response = await supabase.functions.invoke('agent-chat', {
      body: { agentId: AGENT_ID, message: content }
    });
    
    setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
    setIsLoading(false);
  };

  return { messages, sendMessage, isLoading };
}`;

      case 'python':
        return `# ${agent.name} - Python Integration
import requests

AGENT_ID = '${agent.id}'
API_BASE = '${baseUrl}'

def chat(message, session_id=None):
    response = requests.post(
        f'{API_BASE}/v1/chat/completions',
        headers={
            'Content-Type': 'application/json',
            'X-Agent-ID': AGENT_ID,
        },
        json={
            'model': 'google/gemini-2.5-flash',
            'messages': [{'role': 'user', 'content': message}],
        }
    )
    return response.json()`;

      case 'curl':
        return `# ${agent.name} - cURL Integration
curl -X POST '${baseUrl}/v1/chat/completions' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Agent-ID: ${agent.id}' \\
  -d '{
    "model": "google/gemini-2.5-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`;

      default:
        return '';
    }
  }
}

export const agentUseCaseRegistry = new UnifiedAgentUseCaseRegistry();
