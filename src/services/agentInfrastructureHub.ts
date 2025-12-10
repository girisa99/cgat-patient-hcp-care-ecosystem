/**
 * UNIFIED AGENT INFRASTRUCTURE HUB
 * Central integration layer connecting:
 * - P0: Genie Feature Selection
 * - P1: Enrollment Agent Config
 * - P2: MCP SDK Bridge
 * - P3: Feature Persistence
 * - Stepwise Enrollment Agents
 * - Channel Deployments
 * - Agent Use Case Registry
 */
import { supabase } from '@/integrations/supabase/client';
import { agentUseCaseRegistry, AgentRegistration, EXTENDED_USE_CASE_TEMPLATES } from './agentUseCaseRegistry';
import { deploymentFeaturePersistence, DeploymentFeatureConfig } from './deploymentFeaturePersistence';
import { EnrollmentMCPBridge, MCPBridgeConfig } from './enrollmentMCPBridge';
import { EnrollmentAgentConfig } from '@/hooks/useEnrollmentAgentConfig';
import { GENIE_FEATURE_CATALOG, GenieFeature } from '@/types/genie-features';

// Infrastructure connection status
export interface InfrastructureStatus {
  featureSelector: 'connected' | 'disconnected' | 'error';
  mcpBridge: 'connected' | 'disconnected' | 'error';
  deploymentPersistence: 'connected' | 'disconnected' | 'error';
  channelDeployments: 'connected' | 'disconnected' | 'error';
  agentRegistry: 'connected' | 'disconnected' | 'error';
  database: 'connected' | 'disconnected' | 'error';
}

// Extended MCP config for the hub (superset of MCPBridgeConfig)
export interface HubMCPConfig {
  enableNPIVerification?: boolean;
  enableCredentialing?: boolean;
  enableInsuranceVerification?: boolean;
  enableSmartRouting?: boolean;
  enableAnalytics?: boolean;
  enableDBSync?: boolean;
  enableCRMSync?: boolean;
  crmType?: 'salesforce' | 'veeva' | 'hubspot' | 'none';
  crmIntegrations?: string[];
}

// Unified agent configuration combining all systems
export interface UnifiedAgentConfig {
  // Core identity
  agentId: string;
  deploymentId: string;
  name: string;
  useCaseId: string;
  
  // P0: Feature selection
  enabledFeatures: string[];
  featureCatalog: GenieFeature[];
  
  // P1: Enrollment-specific config
  enrollmentConfig?: EnrollmentAgentConfig;
  
  // P2: MCP SDK configuration
  mcpConfig: HubMCPConfig;
  mcpBridge?: EnrollmentMCPBridge;
  
  // P3: Deployment features
  deploymentFeatures: DeploymentFeatureConfig | null;
  
  // Channels
  channels: {
    channelId: string;
    channelType: string;
    status: string;
    config: Record<string, any>;
  }[];
  
  // Branding
  branding: {
    brandName: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
  
  // Rate limits
  rateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
    tokensPerRequest: number;
  };
}

class UnifiedAgentInfrastructureHub {
  private mcpBridges: Map<string, EnrollmentMCPBridge> = new Map();
  
  /**
   * Check infrastructure health status
   */
  async checkInfrastructureHealth(): Promise<InfrastructureStatus> {
    const status: InfrastructureStatus = {
      featureSelector: 'disconnected',
      mcpBridge: 'disconnected',
      deploymentPersistence: 'disconnected',
      channelDeployments: 'disconnected',
      agentRegistry: 'disconnected',
      database: 'disconnected',
    };

    try {
      // Check database connection
      const { error: dbError } = await supabase.from('agents').select('id').limit(1);
      status.database = dbError ? 'error' : 'connected';

      // Check feature catalog
      status.featureSelector = GENIE_FEATURE_CATALOG.length > 0 ? 'connected' : 'disconnected';

      // Check deployment persistence
      const deployments = await deploymentFeaturePersistence.getAllDeploymentsWithFeatures();
      status.deploymentPersistence = deployments !== null ? 'connected' : 'error';

      // Check agent registry
      const agents = await agentUseCaseRegistry.getAllRegisteredAgents();
      status.agentRegistry = agents !== null ? 'connected' : 'error';

      // Check channel deployments
      const { error: channelError } = await supabase
        .from('agent_channel_deployments')
        .select('id')
        .limit(1);
      status.channelDeployments = channelError ? 'error' : 'connected';

      // MCP bridge is always available as a class
      status.mcpBridge = 'connected';

    } catch (error) {
      console.error('Infrastructure health check failed:', error);
    }

    return status;
  }

  /**
   * Convert HubMCPConfig to MCPBridgeConfig
   */
  private toMCPBridgeConfig(hubConfig: HubMCPConfig): MCPBridgeConfig {
    return {
      enableNPIVerification: hubConfig.enableNPIVerification,
      enableCredentialing: hubConfig.enableCredentialing,
      enableInsuranceVerification: hubConfig.enableInsuranceVerification,
      enableSmartRouting: hubConfig.enableSmartRouting,
      enableAnalytics: hubConfig.enableAnalytics,
      enableDBSync: hubConfig.enableDBSync,
      enableCRMSync: hubConfig.enableCRMSync,
      crmType: hubConfig.crmType,
    };
  }

  /**
   * Initialize unified agent with all infrastructure connected
   */
  async initializeAgent(params: {
    name: string;
    useCaseId: string;
    branding: UnifiedAgentConfig['branding'];
    enabledFeatures?: string[];
    channels?: string[];
    mcpConfig?: Partial<HubMCPConfig>;
  }): Promise<{ success: boolean; config?: UnifiedAgentConfig; error?: string }> {
    try {
      const mcpTools = this.hubConfigToTools(params.mcpConfig || {});
      
      // 1. Register agent in registry (creates agent + deployment)
      const registrationResult = await agentUseCaseRegistry.registerAgent({
        name: params.name,
        description: `${params.useCaseId} agent`,
        useCaseId: params.useCaseId,
        branding: { brand_name: params.branding.brandName, ...params.branding },
        channels: params.channels,
        featureConfig: {
          enabled_features: params.enabledFeatures || this.getDefaultFeaturesForUseCase(params.useCaseId),
          personality_mode: 'professional',
          ai_provider: 'gemini',
          mcp_config: {
            enabled_tools: mcpTools,
            crm_integrations: params.mcpConfig?.crmIntegrations || [],
            db_sync_enabled: params.mcpConfig?.enableDBSync ?? true,
          },
        },
      });

      if (!registrationResult.success) {
        return { success: false, error: registrationResult.error };
      }

      // 2. Load full configuration
      const fullConfig = await this.loadUnifiedConfig(
        registrationResult.agentId!,
        registrationResult.deploymentId
      );

      if (!fullConfig) {
        return { success: false, error: 'Failed to load configuration' };
      }

      // 3. Initialize MCP bridge for this agent
      const bridgeConfig = this.toMCPBridgeConfig({
        enableNPIVerification: params.mcpConfig?.enableNPIVerification ?? true,
        enableInsuranceVerification: params.mcpConfig?.enableInsuranceVerification ?? true,
        enableSmartRouting: params.mcpConfig?.enableSmartRouting ?? true,
        enableCredentialing: params.mcpConfig?.enableCredentialing ?? true,
        enableDBSync: params.mcpConfig?.enableDBSync ?? true,
        enableCRMSync: params.mcpConfig?.enableCRMSync ?? false,
        crmType: params.mcpConfig?.crmType || 'none',
      });
      
      const mcpBridge = new EnrollmentMCPBridge(bridgeConfig);
      this.mcpBridges.set(registrationResult.agentId!, mcpBridge);
      fullConfig.mcpBridge = mcpBridge;

      return { success: true, config: fullConfig };
    } catch (error) {
      console.error('Failed to initialize agent:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Load unified configuration for an existing agent
   */
  async loadUnifiedConfig(agentId: string, deploymentId?: string): Promise<UnifiedAgentConfig | null> {
    try {
      // Load agent from registry
      const agents = await agentUseCaseRegistry.getAllRegisteredAgents();
      const agent = agents.find(a => a.id === agentId);
      
      if (!agent) {
        console.error('Agent not found:', agentId);
        return null;
      }

      // Load deployment features if we have a deployment ID
      let deploymentFeatures: DeploymentFeatureConfig | null = null;
      const actualDeploymentId = deploymentId || agent.deployment_id;
      
      if (actualDeploymentId) {
        deploymentFeatures = await deploymentFeaturePersistence.loadDeploymentFeatures(actualDeploymentId);
      }

      // Build MCP config from agent data
      const mcpConfig: HubMCPConfig = {
        enableNPIVerification: agent.mcp_config.enabled_tools.includes('verify-npi'),
        enableInsuranceVerification: agent.mcp_config.enabled_tools.includes('validate-insurance'),
        enableSmartRouting: agent.mcp_config.enabled_tools.includes('smart-field-routing'),
        enableCredentialing: agent.mcp_config.enabled_tools.includes('credentialing-check'),
        enableDBSync: agent.mcp_config.db_sync_enabled,
        enableCRMSync: agent.mcp_config.crm_integrations.length > 0,
        crmIntegrations: agent.mcp_config.crm_integrations,
      };

      // Get or create MCP bridge
      let mcpBridge = this.mcpBridges.get(agentId);
      if (!mcpBridge) {
        mcpBridge = new EnrollmentMCPBridge(this.toMCPBridgeConfig(mcpConfig));
        this.mcpBridges.set(agentId, mcpBridge);
      }

      // Build enrollment config if this is an enrollment use case
      let enrollmentConfig: EnrollmentAgentConfig | undefined;
      if (['patient_intake', 'treatment_center_onboarding', 'manufacturing_onboarding'].includes(agent.use_case_id)) {
        const enabledFeatures = deploymentFeatures?.enabled_features || agent.feature_config?.enabled_features || [];
        enrollmentConfig = {
          enabledFeatures,
          npiVerification: enabledFeatures.includes('npi_verification'),
          credentialingWorkflow: enabledFeatures.includes('credentialing_workflow'),
          consentManagement: enabledFeatures.includes('consent_management'),
          insuranceVerification: enabledFeatures.includes('insurance_verification'),
          clinicalAssessment: enabledFeatures.includes('clinical_assessment'),
          smartFieldRouting: enabledFeatures.includes('smart_field_routing'),
          realTimeValidation: enabledFeatures.includes('real_time_validation'),
          whatsappIntegration: enabledFeatures.includes('whatsapp_integration'),
          voiceEnrollment: enabledFeatures.includes('voice_enrollment'),
          documentGeneration: enabledFeatures.includes('document_generation'),
          personalityMode: (deploymentFeatures?.personality_mode as any) || 'professional',
          aiProvider: (deploymentFeatures?.ai_provider as any) || 'gemini',
        };
      }

      // Map channels to correct format
      const channels = agent.channels.map(ch => ({
        channelId: ch.channel_id,
        channelType: ch.channel_type,
        status: ch.status,
        config: ch.config || {},
      }));

      return {
        agentId: agent.id,
        deploymentId: actualDeploymentId || '',
        name: agent.name,
        useCaseId: agent.use_case_id,
        enabledFeatures: deploymentFeatures?.enabled_features || [],
        featureCatalog: GENIE_FEATURE_CATALOG,
        enrollmentConfig,
        mcpConfig,
        mcpBridge,
        deploymentFeatures,
        channels,
        branding: {
          brandName: agent.branding.brand_name,
          primaryColor: agent.branding.primary_color,
          secondaryColor: agent.branding.secondary_color,
          logoUrl: agent.branding.logo_url,
        },
        rateLimits: {
          requestsPerMinute: agent.rate_limits.requests_per_minute,
          requestsPerDay: agent.rate_limits.requests_per_day,
          tokensPerRequest: agent.rate_limits.tokens_per_request,
        },
      };
    } catch (error) {
      console.error('Failed to load unified config:', error);
      return null;
    }
  }

  /**
   * Update agent configuration (syncs across all systems)
   */
  async updateAgentConfig(
    agentId: string,
    updates: Partial<{
      enabledFeatures: string[];
      mcpConfig: Partial<HubMCPConfig>;
      branding: Partial<UnifiedAgentConfig['branding']>;
      rateLimits: Partial<UnifiedAgentConfig['rateLimits']>;
      channels: { channelType: string; config?: Record<string, any> }[];
    }>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const currentConfig = await this.loadUnifiedConfig(agentId);
      if (!currentConfig) {
        return { success: false, error: 'Agent not found' };
      }

      // Update deployment features (P3)
      if (updates.enabledFeatures || updates.mcpConfig) {
        await deploymentFeaturePersistence.saveDeploymentFeatures(currentConfig.deploymentId, {
          enabled_features: updates.enabledFeatures || currentConfig.enabledFeatures,
          mcp_config: updates.mcpConfig ? {
            enabled_tools: this.hubConfigToTools(updates.mcpConfig),
            crm_integrations: updates.mcpConfig.crmIntegrations || currentConfig.mcpConfig.crmIntegrations || [],
            db_sync_enabled: updates.mcpConfig.enableDBSync ?? currentConfig.mcpConfig.enableDBSync ?? true,
          } : undefined,
        });
      }

      // Update agent in registry
      await agentUseCaseRegistry.updateAgentConfig(agentId, {
        branding: updates.branding ? {
          brand_name: updates.branding.brandName || currentConfig.branding.brandName,
          ...updates.branding,
        } : undefined,
        rateLimits: updates.rateLimits ? {
          requests_per_minute: updates.rateLimits.requestsPerMinute || currentConfig.rateLimits.requestsPerMinute,
          requests_per_day: updates.rateLimits.requestsPerDay || currentConfig.rateLimits.requestsPerDay,
          tokens_per_request: updates.rateLimits.tokensPerRequest || currentConfig.rateLimits.tokensPerRequest,
        } : undefined,
      });

      // Deploy to new channels
      if (updates.channels && updates.channels.length > 0) {
        await agentUseCaseRegistry.deployToChannels(agentId, updates.channels);
      }

      // Update MCP bridge if config changed
      if (updates.mcpConfig) {
        const newMcpBridge = new EnrollmentMCPBridge(this.toMCPBridgeConfig({
          ...currentConfig.mcpConfig,
          ...updates.mcpConfig,
        }));
        this.mcpBridges.set(agentId, newMcpBridge);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to update agent config:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get MCP bridge for an agent
   */
  getMCPBridge(agentId: string): EnrollmentMCPBridge | undefined {
    return this.mcpBridges.get(agentId);
  }

  /**
   * Execute MCP tool through the hub
   */
  async executeMCPTool(
    agentId: string,
    toolName: string,
    params: Record<string, any>,
    context?: { enrollmentId?: string; sectionName?: string }
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const bridge = this.getMCPBridge(agentId);
    if (!bridge) {
      return { success: false, error: 'MCP bridge not initialized for this agent' };
    }

    try {
      let result: any;
      
      switch (toolName) {
        case 'verify-npi':
          result = await bridge.verifyNPI(params.npiNumber);
          break;
        case 'validate-insurance':
          result = await bridge.validateInsurance({
            member_id: params.member_id || params.memberId,
            payer_name: params.payer_name || params.payerName,
            group_number: params.group_number || params.groupNumber,
          });
          break;
        case 'smart-field-routing':
          result = await bridge.getSmartRouting({
            current_section: params.current_section || params.fieldName,
            completed_fields: params.completed_fields || [],
          });
          break;
        case 'credentialing-check':
          result = await bridge.checkCredentialing({
            provider_npi: params.provider_npi || params.providerNpi,
            specialty: params.specialty,
          });
          break;
        case 'sync-to-database':
          if (!context?.enrollmentId || !context?.sectionName) {
            return { success: false, error: 'Missing enrollment context' };
          }
          result = await bridge.syncSectionToDatabase(context.enrollmentId, context.sectionName, params);
          break;
        case 'sync-to-salesforce':
          if (!context?.enrollmentId) {
            return { success: false, error: 'Missing enrollment ID' };
          }
          result = await bridge.syncToSalesforce(
            context.enrollmentId,
            params.objectType || 'Contact',
            params.data || params,
            params.operation || 'upsert'
          );
          break;
        case 'sync-to-veeva':
          if (!context?.enrollmentId) {
            return { success: false, error: 'Missing enrollment ID' };
          }
          result = await bridge.syncToVeeva(
            context.enrollmentId,
            params.objectType || 'Account',
            params.data || params,
            params.operation || 'upsert'
          );
          break;
        default:
          // Use generic tool execution
          result = await bridge.executeTool(toolName, params);
      }

      return { success: true, result };
    } catch (error) {
      console.error(`MCP tool execution failed: ${toolName}`, error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get default features for a use case
   */
  private getDefaultFeaturesForUseCase(useCaseId: string): string[] {
    const baseFeatures = [
      'multi_model_intelligence',
      'streaming_responses',
      'conversation_management',
    ];

    switch (useCaseId) {
      case 'patient_intake':
        return [
          ...baseFeatures,
          'patient_onboarding',
          'npi_verification',
          'consent_management',
          'clinical_assessment',
          'hipaa_compliance',
          'smart_field_routing',
        ];
      case 'treatment_center_onboarding':
        return [
          ...baseFeatures,
          'npi_verification',
          'credentialing_workflow',
          'consent_management',
          'hipaa_compliance',
          'document_generation',
          'smart_field_routing',
        ];
      case 'manufacturing_onboarding':
        return [
          ...baseFeatures,
          'credentialing_workflow',
          'document_generation',
          'smart_field_routing',
          'real_time_validation',
        ];
      case 'order_status':
        return [
          ...baseFeatures,
          'analytics',
          'rate_limiting',
        ];
      default:
        return baseFeatures;
    }
  }

  /**
   * Convert HubMCPConfig to tool names
   */
  private hubConfigToTools(config: Partial<HubMCPConfig>): string[] {
    const tools: string[] = [];
    if (config.enableNPIVerification) tools.push('verify-npi');
    if (config.enableInsuranceVerification) tools.push('validate-insurance');
    if (config.enableSmartRouting) tools.push('smart-field-routing');
    if (config.enableCredentialing) tools.push('credentialing-check');
    if (config.enableAnalytics) tools.push('enrollment-analytics');
    if (config.enableDBSync) tools.push('sync-section-to-db', 'sync-field-to-db');
    if (config.enableCRMSync || (config.crmIntegrations && config.crmIntegrations.length > 0)) {
      const crms = config.crmIntegrations || [];
      if (crms.includes('salesforce') || config.crmType === 'salesforce') tools.push('sync-to-salesforce');
      if (crms.includes('veeva') || config.crmType === 'veeva') tools.push('sync-to-veeva');
      if (crms.includes('hubspot') || config.crmType === 'hubspot') tools.push('sync-to-hubspot');
    }
    return tools;
  }

  /**
   * Get all agents with their full unified configuration
   */
  async getAllUnifiedConfigs(): Promise<UnifiedAgentConfig[]> {
    const agents = await agentUseCaseRegistry.getAllRegisteredAgents();
    const configs: UnifiedAgentConfig[] = [];

    for (const agent of agents) {
      const config = await this.loadUnifiedConfig(agent.id, agent.deployment_id);
      if (config) {
        configs.push(config);
      }
    }

    return configs;
  }

  /**
   * Get infrastructure statistics
   */
  async getInfrastructureStats(): Promise<{
    totalAgents: number;
    activeAgents: number;
    totalChannels: number;
    mcpToolsEnabled: number;
    featuresConfigured: number;
    crmIntegrations: string[];
  }> {
    const configs = await this.getAllUnifiedConfigs();
    
    const allCrmIntegrations = new Set<string>();
    let totalChannels = 0;
    let mcpToolsEnabled = 0;
    let featuresConfigured = 0;

    configs.forEach(config => {
      totalChannels += config.channels.length;
      mcpToolsEnabled += this.hubConfigToTools(config.mcpConfig).length;
      featuresConfigured += config.enabledFeatures.length;
      config.mcpConfig.crmIntegrations?.forEach(crm => allCrmIntegrations.add(crm));
    });

    return {
      totalAgents: configs.length,
      activeAgents: configs.filter(c => c.channels.some(ch => ch.status === 'active')).length,
      totalChannels,
      mcpToolsEnabled,
      featuresConfigured,
      crmIntegrations: Array.from(allCrmIntegrations),
    };
  }
}

export const agentInfrastructureHub = new UnifiedAgentInfrastructureHub();
