/**
 * DEPLOYMENT FEATURE PERSISTENCE SERVICE
 * P3 Implementation: Persist feature configurations per genie deployment
 * Extended with versioning, rollback, and health monitoring.
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

export interface DeploymentVersion {
  id: string;
  name: string;
  version: number;
  changelog: string | null;
  configuration: DeploymentFeatureConfig | null;
  deployment_status: string | null;
  is_active: boolean | null;
  created_at: string | null;
  deployed_at: string | null;
  parent_deployment_id: string | null;
}

export interface DeploymentHealthStatus {
  deploymentId: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastChecked: string;
  uptime: number;
  metrics: {
    totalConversations: number;
    totalTokensUsed: number;
    avgConfidenceScore: number;
  };
}

class DeploymentFeaturePersistenceService {
  // ═══════════════════════════════════════════
  // FEATURE CONFIG CRUD (existing)
  // ═══════════════════════════════════════════

  async loadDeploymentFeatures(deploymentId: string): Promise<DeploymentFeatureConfig | null> {
    try {
      const { data, error } = await supabase
        .from('genie_deployments')
        .select('configuration')
        .eq('id', deploymentId)
        .single();
      if (error) { console.error('Error loading deployment features:', error); return null; }
      return data?.configuration as unknown as DeploymentFeatureConfig | null;
    } catch (error) { console.error('Failed to load deployment features:', error); return null; }
  }

  async saveDeploymentFeatures(
    deploymentId: string, config: Partial<DeploymentFeatureConfig>
  ): Promise<{ success: boolean; error?: string }> {
    try {
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
        .update({ configuration: updatedConfig as any, updated_at: new Date().toISOString() })
        .eq('id', deploymentId);
      if (error) { return { success: false, error: error.message }; }
      return { success: true };
    } catch (error) { return { success: false, error: String(error) }; }
  }

  async saveEnrollmentConfig(
    deploymentId: string, enrollmentConfig: EnrollmentAgentConfig
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

  async saveMCPConfig(
    deploymentId: string, mcpConfig: DeploymentFeatureConfig['mcp_config']
  ): Promise<{ success: boolean; error?: string }> {
    return this.saveDeploymentFeatures(deploymentId, { mcp_config: mcpConfig });
  }

  async getAllDeploymentsWithFeatures(): Promise<DeploymentWithFeatures[]> {
    try {
      const { data, error } = await supabase
        .from('genie_deployments')
        .select('id, name, description, configuration, deployment_status, is_active, agent_id')
        .order('created_at', { ascending: false });
      if (error) { console.error('Error fetching deployments:', error); return []; }
      return (data || []).map(d => ({
        ...d,
        configuration: d.configuration as unknown as DeploymentFeatureConfig | null,
      }));
    } catch (error) { console.error('Failed to fetch deployments:', error); return []; }
  }

  async createDeploymentWithFeatures(
    name: string, description: string, initialConfig: Partial<DeploymentFeatureConfig>, agentId?: string
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
          name, description, configuration: fullConfig as any, agent_id: agentId,
          user_id: userData?.user?.id, deployment_status: 'draft', is_active: false, version: 1,
        })
        .select('id')
        .single();
      if (error) { return { success: false, error: error.message }; }
      return { success: true, deploymentId: data.id };
    } catch (error) { return { success: false, error: String(error) }; }
  }

  async cloneDeployment(
    sourceDeploymentId: string, newName: string
  ): Promise<{ success: boolean; deploymentId?: string; error?: string }> {
    try {
      const sourceConfig = await this.loadDeploymentFeatures(sourceDeploymentId);
      if (!sourceConfig) { return { success: false, error: 'Source deployment not found' }; }
      return this.createDeploymentWithFeatures(newName, `Cloned from deployment ${sourceDeploymentId}`, sourceConfig);
    } catch (error) { return { success: false, error: String(error) }; }
  }

  // ═══════════════════════════════════════════
  // VERSIONING & ROLLBACK
  // ═══════════════════════════════════════════

  async createVersion(
    deploymentId: string, changelog: string
  ): Promise<{ success: boolean; newDeploymentId?: string; error?: string }> {
    try {
      const { data: current, error: fetchError } = await supabase
        .from('genie_deployments')
        .select('*')
        .eq('id', deploymentId)
        .single();
      if (fetchError || !current) { return { success: false, error: 'Deployment not found' }; }

      const newVersion = (current.version || 1) + 1;
      const { data: newDeploy, error: insertError } = await supabase
        .from('genie_deployments')
        .insert({
          name: current.name, description: current.description,
          configuration: current.configuration, agent_id: current.agent_id,
          user_id: current.user_id, deployment_status: 'draft',
          is_active: false, version: newVersion,
          parent_deployment_id: deploymentId, changelog,
          model_config: current.model_config,
          knowledge_base_snapshot: current.knowledge_base_snapshot,
          mcp_servers_snapshot: current.mcp_servers_snapshot,
        })
        .select('id')
        .single();
      if (insertError) { return { success: false, error: insertError.message }; }
      return { success: true, newDeploymentId: newDeploy.id };
    } catch (error) { return { success: false, error: String(error) }; }
  }

  async rollbackToVersion(
    deploymentId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: target, error: fetchError } = await supabase
        .from('genie_deployments')
        .select('*')
        .eq('id', deploymentId)
        .single();
      if (fetchError || !target) { return { success: false, error: 'Target version not found' }; }

      const rootId = target.parent_deployment_id || target.id;

      // Deactivate root and all children
      await supabase
        .from('genie_deployments')
        .update({ is_active: false, deployment_status: 'archived' })
        .eq('id', rootId);
      await supabase
        .from('genie_deployments')
        .update({ is_active: false, deployment_status: 'archived' })
        .eq('parent_deployment_id', rootId);

      // Activate target version
      const { error: activateError } = await supabase
        .from('genie_deployments')
        .update({ is_active: true, deployment_status: 'active', deployed_at: new Date().toISOString() })
        .eq('id', deploymentId);
      if (activateError) { return { success: false, error: activateError.message }; }
      return { success: true };
    } catch (error) { return { success: false, error: String(error) }; }
  }

  async getVersionHistory(deploymentId: string): Promise<DeploymentVersion[]> {
    try {
      const { data: current } = await supabase
        .from('genie_deployments')
        .select('id, parent_deployment_id')
        .eq('id', deploymentId)
        .single();
      if (!current) return [];

      const rootId = current.parent_deployment_id || current.id;
      const { data: versions, error } = await supabase
        .from('genie_deployments')
        .select('id, name, version, changelog, configuration, deployment_status, is_active, created_at, deployed_at, parent_deployment_id')
        .or(`id.eq.${rootId},parent_deployment_id.eq.${rootId}`)
        .order('version', { ascending: false });
      if (error) return [];
      return (versions || []).map(v => ({
        ...v,
        configuration: v.configuration as unknown as DeploymentFeatureConfig | null,
      }));
    } catch (error) { console.error('Failed to get version history:', error); return []; }
  }

  // ═══════════════════════════════════════════
  // HEALTH MONITORING
  // ═══════════════════════════════════════════

  async getDeploymentHealth(deploymentId: string): Promise<DeploymentHealthStatus | null> {
    try {
      const { data, error } = await supabase
        .from('genie_deployments')
        .select('id, is_active, deployment_status, total_conversations, total_tokens_used, avg_confidence_score, deployed_at, updated_at')
        .eq('id', deploymentId)
        .single();
      if (error || !data) return null;

      let status: DeploymentHealthStatus['status'] = 'unknown';
      if (data.deployment_status === 'active' && data.is_active) {
        status = (data.avg_confidence_score || 0) >= 0.7 ? 'healthy' : 'degraded';
      } else if (data.deployment_status === 'active') {
        status = 'degraded';
      } else if (data.deployment_status === 'error') {
        status = 'unhealthy';
      }

      const deployedAt = data.deployed_at ? new Date(data.deployed_at).getTime() : 0;
      const uptime = deployedAt > 0 ? (Date.now() - deployedAt) / 1000 : 0;

      return {
        deploymentId: data.id, status, lastChecked: new Date().toISOString(), uptime,
        metrics: {
          totalConversations: data.total_conversations || 0,
          totalTokensUsed: data.total_tokens_used || 0,
          avgConfidenceScore: data.avg_confidence_score || 0,
        },
      };
    } catch (error) { console.error('Failed to get deployment health:', error); return null; }
  }

  async getAllActiveDeploymentsHealth(): Promise<DeploymentHealthStatus[]> {
    try {
      const { data, error } = await supabase
        .from('genie_deployments')
        .select('id, is_active, deployment_status, total_conversations, total_tokens_used, avg_confidence_score, deployed_at, updated_at')
        .eq('is_active', true)
        .order('deployed_at', { ascending: false });
      if (error || !data) return [];

      return data.map(d => {
        let status: DeploymentHealthStatus['status'] = 'unknown';
        if (d.deployment_status === 'active') {
          status = (d.avg_confidence_score || 0) >= 0.7 ? 'healthy' : 'degraded';
        } else if (d.deployment_status === 'error') { status = 'unhealthy'; }
        const deployedAt = d.deployed_at ? new Date(d.deployed_at).getTime() : 0;
        const uptime = deployedAt > 0 ? (Date.now() - deployedAt) / 1000 : 0;
        return {
          deploymentId: d.id, status, lastChecked: new Date().toISOString(), uptime,
          metrics: {
            totalConversations: d.total_conversations || 0,
            totalTokensUsed: d.total_tokens_used || 0,
            avgConfidenceScore: d.avg_confidence_score || 0,
          },
        };
      });
    } catch (error) { console.error('Failed to get all deployments health:', error); return []; }
  }

  // ═══════════════════════════════════════════
  // REALTIME SUBSCRIPTIONS (existing)
  // ═══════════════════════════════════════════

  subscribeToDeploymentChanges(
    deploymentId: string, callback: (config: DeploymentFeatureConfig | null) => void
  ) {
    const channel = supabase
      .channel(`deployment-${deploymentId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'genie_deployments', filter: `id=eq.${deploymentId}`,
      }, (payload) => { callback(payload.new.configuration as DeploymentFeatureConfig | null); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }
}

export const deploymentFeaturePersistence = new DeploymentFeaturePersistenceService();
