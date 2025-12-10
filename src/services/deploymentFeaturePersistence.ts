/**
 * DEPLOYMENT FEATURE PERSISTENCE SERVICE
 * P3 Implementation: Persist feature configurations per genie deployment
 */
import { supabase } from '@/integrations/supabase/client';
import { EnrollmentAgentConfig } from '@/hooks/useEnrollmentAgentConfig';

export interface DeploymentFeatureConfig {
  enabled_features: string[];
  personality_mode: string;
  ai_provider: string;
  mcp_config?: {
    enabled_tools: string[];
    crm_integrations: string[];
    db_sync_enabled: boolean;
  };
  enrollment_config?: {
    npi_verification: boolean;
    credentialing_workflow: boolean;
    consent_management: boolean;
    insurance_verification: boolean;
    clinical_assessment: boolean;
    smart_field_routing: boolean;
    real_time_validation: boolean;
    voice_enrollment: boolean;
    document_generation: boolean;
  };
  updated_at: string;
}

export interface DeploymentWithFeatures {
  id: string;
  name: string;
  description?: string;
  configuration: DeploymentFeatureConfig | null;
  deployment_status: string;
  is_active: boolean;
  agent_id?: string;
}

class DeploymentFeaturePersistenceService {
  /**
   * Load feature configuration for a deployment
   */
  async loadDeploymentFeatures(deploymentId: string): Promise<DeploymentFeatureConfig | null> {
    try {
      const { data, error } = await supabase
        .from('genie_deployments')
        .select('configuration')
        .eq('id', deploymentId)
        .single();

      if (error) {
        console.error('Error loading deployment features:', error);
        return null;
      }

      return data?.configuration as unknown as DeploymentFeatureConfig | null;
    } catch (error) {
      console.error('Failed to load deployment features:', error);
      return null;
    }
  }

  /**
   * Save feature configuration for a deployment
   */
  async saveDeploymentFeatures(
    deploymentId: string, 
    config: Partial<DeploymentFeatureConfig>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First get existing config to merge
      const existing = await this.loadDeploymentFeatures(deploymentId);
      
      const updatedConfig: DeploymentFeatureConfig = {
        enabled_features: config.enabled_features || existing?.enabled_features || [],
        personality_mode: config.personality_mode || existing?.personality_mode || 'professional',
        ai_provider: config.ai_provider || existing?.ai_provider || 'gemini',
        mcp_config: config.mcp_config || existing?.mcp_config,
        enrollment_config: config.enrollment_config || existing?.enrollment_config,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('genie_deployments')
        .update({ 
          configuration: updatedConfig as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', deploymentId);

      if (error) {
        console.error('Error saving deployment features:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to save deployment features:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Save enrollment-specific config from EnrollmentAgentConfig
   */
  async saveEnrollmentConfig(
    deploymentId: string,
    enrollmentConfig: EnrollmentAgentConfig
  ): Promise<{ success: boolean; error?: string }> {
    const config: Partial<DeploymentFeatureConfig> = {
      enabled_features: enrollmentConfig.enabledFeatures,
      personality_mode: enrollmentConfig.personalityMode,
      ai_provider: enrollmentConfig.aiProvider,
      enrollment_config: {
        npi_verification: enrollmentConfig.npiVerification,
        credentialing_workflow: enrollmentConfig.credentialingWorkflow,
        consent_management: enrollmentConfig.consentManagement,
        insurance_verification: enrollmentConfig.insuranceVerification,
        clinical_assessment: enrollmentConfig.clinicalAssessment,
        smart_field_routing: enrollmentConfig.smartFieldRouting,
        real_time_validation: enrollmentConfig.realTimeValidation,
        voice_enrollment: enrollmentConfig.voiceEnrollment,
        document_generation: enrollmentConfig.documentGeneration,
      },
    };

    return this.saveDeploymentFeatures(deploymentId, config);
  }

  /**
   * Save MCP configuration for a deployment
   */
  async saveMCPConfig(
    deploymentId: string,
    mcpConfig: DeploymentFeatureConfig['mcp_config']
  ): Promise<{ success: boolean; error?: string }> {
    return this.saveDeploymentFeatures(deploymentId, { mcp_config: mcpConfig });
  }

  /**
   * Get all deployments with their feature configurations
   */
  async getAllDeploymentsWithFeatures(): Promise<DeploymentWithFeatures[]> {
    try {
      const { data, error } = await supabase
        .from('genie_deployments')
        .select('id, name, description, configuration, deployment_status, is_active, agent_id')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching deployments:', error);
        return [];
      }

      return (data || []).map(d => ({
        ...d,
        configuration: d.configuration as unknown as DeploymentFeatureConfig | null,
      }));
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
      return [];
    }
  }

  /**
   * Create a new deployment with initial feature configuration
   */
  async createDeploymentWithFeatures(
    name: string,
    description: string,
    initialConfig: Partial<DeploymentFeatureConfig>,
    agentId?: string
  ): Promise<{ success: boolean; deploymentId?: string; error?: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const fullConfig: DeploymentFeatureConfig = {
        enabled_features: initialConfig.enabled_features || [],
        personality_mode: initialConfig.personality_mode || 'professional',
        ai_provider: initialConfig.ai_provider || 'gemini',
        mcp_config: initialConfig.mcp_config,
        enrollment_config: initialConfig.enrollment_config,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('genie_deployments')
        .insert({
          name,
          description,
          configuration: fullConfig as any,
          agent_id: agentId,
          user_id: userData?.user?.id,
          deployment_status: 'draft',
          is_active: false,
          version: 1,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating deployment:', error);
        return { success: false, error: error.message };
      }

      return { success: true, deploymentId: data.id };
    } catch (error) {
      console.error('Failed to create deployment:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Clone a deployment with its feature configuration
   */
  async cloneDeployment(
    sourceDeploymentId: string,
    newName: string
  ): Promise<{ success: boolean; deploymentId?: string; error?: string }> {
    try {
      const sourceConfig = await this.loadDeploymentFeatures(sourceDeploymentId);
      
      if (!sourceConfig) {
        return { success: false, error: 'Source deployment not found' };
      }

      return this.createDeploymentWithFeatures(
        newName,
        `Cloned from deployment ${sourceDeploymentId}`,
        sourceConfig
      );
    } catch (error) {
      console.error('Failed to clone deployment:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Subscribe to deployment configuration changes
   */
  subscribeToDeploymentChanges(
    deploymentId: string,
    callback: (config: DeploymentFeatureConfig | null) => void
  ) {
    const channel = supabase
      .channel(`deployment-${deploymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'genie_deployments',
          filter: `id=eq.${deploymentId}`,
        },
        (payload) => {
          callback(payload.new.configuration as DeploymentFeatureConfig | null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const deploymentFeaturePersistence = new DeploymentFeaturePersistenceService();
