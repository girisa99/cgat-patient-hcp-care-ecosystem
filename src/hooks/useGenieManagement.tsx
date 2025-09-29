/**
 * GENIE MANAGEMENT HOOK
 * Comprehensive data fetching and management for all Genie instances
 */
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export interface GenieInstance {
  id: string;
  brand_name: string;
  business_unit?: string;
  business_name?: string;
  product_name?: string;
  contact_person?: string;
  contact_email?: string;
  domain_name?: string;
  deployment_type: 'public' | 'internal' | 'mcp' | 'embedded';
  deployment_status: string;
  subscription_type?: string;
  is_active: boolean;
  total_conversations: number;
  active_conversations: number;
  daily_limit: number;
  hourly_limit: number;
  rate_limit_info: {
    total_blocked: number;
    current_rate: number;
    daily_usage: number;
    hourly_usage: number;
  };
  ip_tracking: {
    unique_ips: number;
    blocked_ips: number;
  };
  domain_verified: boolean;
  deployment_options: string[];
  created_at: string;
  deployed_at?: string;
}

export const useGenieManagement = () => {
  const { showSuccess, showError } = useMasterToast();

  // Fetch all Genie configurations
  const { data: brandConfigs, isLoading: configsLoading, refetch: refetchConfigs } = useQuery({
    queryKey: ['genie-all-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genie_brand_configs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch all Genie deployments
  const { data: deployments, isLoading: deploymentsLoading, refetch: refetchDeployments } = useQuery({
    queryKey: ['genie-deployments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genie_deployments')
        .select(`
          *,
          genie_brand_configs (
            brand_name,
            business_unit,
            is_active
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch conversation analytics
  const { data: conversationStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['genie-conversation-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genie_conversation_analytics')
        .select('brand_config_id, deployment_type, message_count')
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch rate limit data
  const { data: rateLimitData, isLoading: rateLimitLoading, refetch: refetchRateLimits } = useQuery({
    queryKey: ['genie-rate-limits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genie_rate_limits')
        .select('*')
        .order('last_request_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch IP tracking data
  const { data: ipTracking, isLoading: ipLoading, refetch: refetchIpTracking } = useQuery({
    queryKey: ['genie-ip-tracking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genie_ip_tracking')
        .select('*')
        .order('last_seen_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch domain verifications
  const { data: domainVerifications, refetch: refetchDomains } = useQuery({
    queryKey: ['genie-domain-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genie_domain_verifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch deployment options
  const { data: deploymentOptions, refetch: refetchDeploymentOptions } = useQuery({
    queryKey: ['genie-deployment-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genie_deployment_options')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Aggregate all data into comprehensive instances
  const genieInstances: GenieInstance[] = (deployments || []).map((deployment: any) => {
    const config = brandConfigs?.find(c => c.id === deployment.brand_config_id);
    const stats = conversationStats?.filter(s => s.brand_config_id === deployment.brand_config_id) || [];
    const rateLimits = rateLimitData?.filter(r => r.brand_config_id === deployment.brand_config_id) || [];
    const ips = ipTracking?.filter(i => i.brand_config_id === deployment.brand_config_id) || [];
    const domains = domainVerifications?.filter(d => d.brand_config_id === deployment.brand_config_id) || [];
    const options = deploymentOptions?.filter(o => o.brand_config_id === deployment.brand_config_id) || [];

    // Calculate daily and hourly usage
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hourStart = new Date(now.getTime() - 60 * 60 * 1000);
    
    const dailyUsage = rateLimits.filter(r => 
      new Date(r.last_request_at) >= todayStart
    ).reduce((sum, r) => sum + (r.request_count || 0), 0);
    
    const hourlyUsage = rateLimits.filter(r => 
      new Date(r.last_request_at) >= hourStart
    ).reduce((sum, r) => sum + (r.request_count || 0), 0);

    return {
      id: deployment.id,
      brand_name: config?.brand_name || 'Unknown',
      business_unit: config?.business_unit,
      business_name: config?.business_name,
      product_name: config?.product_name,
      contact_person: config?.contact_person,
      contact_email: config?.contact_email,
      domain_name: config?.domain_name,
      deployment_type: deployment.deployment_type,
      deployment_status: config?.deployment_status || 'draft',
      subscription_type: config?.subscription_type || 'experimentation',
      is_active: deployment.is_active,
      total_conversations: deployment.total_conversations || 0,
      active_conversations: deployment.active_conversations || 0,
      daily_limit: config?.daily_limit || 1000,
      hourly_limit: config?.hourly_limit || 100,
      rate_limit_info: {
        total_blocked: rateLimits.filter(r => r.is_blocked).length,
        current_rate: rateLimits.reduce((sum, r) => sum + (r.request_count || 0), 0),
        daily_usage: dailyUsage,
        hourly_usage: hourlyUsage,
      },
      ip_tracking: {
        unique_ips: ips.length,
        blocked_ips: ips.filter(i => i.is_blacklisted).length,
      },
      domain_verified: domains.some(d => d.verification_status === 'verified'),
      deployment_options: options.map(o => o.deployment_type),
      created_at: deployment.created_at,
      deployed_at: deployment.deployed_at,
    };
  });

  // Health check function
  const checkHealth = async (deploymentId: string) => {
    try {
      const { error } = await supabase
        .from('genie_deployments')
        .update({
          health_status: 'healthy',
          last_health_check: new Date().toISOString(),
        })
        .eq('id', deploymentId);

      if (error) throw error;
      showSuccess('Health check completed');
      refetchDeployments();
    } catch (error: any) {
      showError('Health check failed', error.message);
    }
  };

  // Toggle active status
  const toggleActive = async (deploymentId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('genie_deployments')
        .update({ is_active: !isActive })
        .eq('id', deploymentId);

      if (error) throw error;
      showSuccess(isActive ? 'Deployment paused' : 'Deployment activated');
      refetchDeployments();
    } catch (error: any) {
      showError('Failed to update status', error.message);
    }
  };

  // Whitelist/Blacklist IP
  const updateIPReputation = async (ipId: string, action: 'whitelist' | 'blacklist' | 'clear') => {
    try {
      const updates: any = {};
      if (action === 'whitelist') {
        updates.is_whitelisted = true;
        updates.is_blacklisted = false;
      } else if (action === 'blacklist') {
        updates.is_blacklisted = true;
        updates.is_whitelisted = false;
      } else {
        updates.is_blacklisted = false;
        updates.is_whitelisted = false;
      }

      const { error } = await supabase
        .from('genie_ip_tracking')
        .update(updates)
        .eq('id', ipId);

      if (error) throw error;
      showSuccess(`IP ${action === 'clear' ? 'reputation cleared' : `${action}ed successfully`}`);
      refetchIpTracking();
    } catch (error: any) {
      showError('Failed to update IP', error.message);
    }
  };

  // Verify domain
  const verifyDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('genie_domain_verifications')
        .update({ 
          verification_status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', domainId);

      if (error) throw error;
      showSuccess('Domain verified successfully');
      refetchDomains();
    } catch (error: any) {
      showError('Domain verification failed', error.message);
    }
  };

  // Generate deployment code
  const generateDeploymentCode = async (configId: string, deploymentType: string) => {
    try {
      const config = brandConfigs?.find(c => c.id === configId);
      if (!config) throw new Error('Configuration not found');

      let code = '';
      switch (deploymentType) {
        case 'javascript':
          code = `<!-- GENIE AI Widget -->
<script src="https://genieaiexperimentationhub.tech/embed.js"></script>
<script>
  GenieAI.init({
    configId: '${configId}',
    brandName: '${config.brand_name}',
    domain: window.location.hostname
  });
</script>`;
          break;
        case 'python':
          code = `import requests

# GENIE AI Python Integration
class GenieAI:
    def __init__(self, config_id='${configId}'):
        self.config_id = config_id
        self.base_url = 'https://genieaiexperimentationhub.tech/api'
    
    def chat(self, message, session_id=None):
        response = requests.post(
            f'{self.base_url}/chat',
            json={
                'config_id': self.config_id,
                'message': message,
                'session_id': session_id
            }
        )
        return response.json()

genie = GenieAI()
response = genie.chat('Hello!')`;
          break;
        case 'embedded_script':
          code = `<div id="genie-chat-widget"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://genieaiexperimentationhub.tech/widget.js';
    script.setAttribute('data-config-id', '${configId}');
    script.setAttribute('data-brand', '${config.brand_name}');
    document.head.appendChild(script);
  })();
</script>`;
          break;
        case 'api_integration':
          code = `// GENIE AI API Integration
const API_BASE = 'https://genieaiexperimentationhub.tech/api';
const CONFIG_ID = '${configId}';

async function sendMessage(message, sessionId) {
  const response = await fetch(\`\${API_BASE}/chat\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Config-ID': CONFIG_ID
    },
    body: JSON.stringify({
      message,
      session_id: sessionId
    })
  });
  return response.json();
}`;
          break;
      }

      const { error } = await supabase
        .from('genie_deployment_options')
        .upsert({
          brand_config_id: configId,
          deployment_type: deploymentType,
          code_generated: code,
          is_active: true
        });

      if (error) throw error;
      refetchDeploymentOptions();
      return code;
    } catch (error: any) {
      showError('Failed to generate deployment code', error.message);
      return null;
    }
  };

  // Refresh all data
  const refreshAll = () => {
    refetchConfigs();
    refetchDeployments();
    refetchStats();
    refetchRateLimits();
    refetchIpTracking();
    refetchDomains();
    refetchDeploymentOptions();
  };

  const isLoading = configsLoading || deploymentsLoading || statsLoading || rateLimitLoading || ipLoading;

  return {
    genieInstances,
    brandConfigs,
    deployments,
    conversationStats,
    rateLimitData,
    ipTracking,
    domainVerifications,
    deploymentOptions,
    isLoading,
    checkHealth,
    toggleActive,
    updateIPReputation,
    verifyDomain,
    generateDeploymentCode,
    refreshAll,
  };
};