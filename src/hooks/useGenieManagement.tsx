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
  deployment_type: 'public' | 'internal' | 'mcp' | 'embedded';
  deployment_status: string;
  is_active: boolean;
  total_conversations: number;
  active_conversations: number;
  rate_limit_info: {
    total_blocked: number;
    current_rate: number;
  };
  ip_tracking: {
    unique_ips: number;
    blocked_ips: number;
  };
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

  // Aggregate all data into comprehensive instances
  const genieInstances: GenieInstance[] = (deployments || []).map((deployment: any) => {
    const config = brandConfigs?.find(c => c.id === deployment.brand_config_id);
    const stats = conversationStats?.filter(s => s.brand_config_id === deployment.brand_config_id) || [];
    const rateLimits = rateLimitData?.filter(r => r.brand_config_id === deployment.brand_config_id) || [];
    const ips = ipTracking?.filter(i => i.brand_config_id === deployment.brand_config_id) || [];

    return {
      id: deployment.id,
      brand_name: config?.brand_name || 'Unknown',
      business_unit: config?.business_unit,
      deployment_type: deployment.deployment_type,
      deployment_status: deployment.deployment_status,
      is_active: deployment.is_active,
      total_conversations: deployment.total_conversations || 0,
      active_conversations: deployment.active_conversations || 0,
      rate_limit_info: {
        total_blocked: rateLimits.filter(r => r.is_blocked).length,
        current_rate: rateLimits.reduce((sum, r) => sum + (r.request_count || 0), 0),
      },
      ip_tracking: {
        unique_ips: ips.length,
        blocked_ips: ips.filter(i => i.is_blacklisted).length,
      },
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

  // Refresh all data
  const refreshAll = () => {
    refetchConfigs();
    refetchDeployments();
    refetchStats();
    refetchRateLimits();
    refetchIpTracking();
  };

  const isLoading = configsLoading || deploymentsLoading || statsLoading || rateLimitLoading || ipLoading;

  return {
    genieInstances,
    brandConfigs,
    deployments,
    conversationStats,
    rateLimitData,
    ipTracking,
    isLoading,
    checkHealth,
    toggleActive,
    updateIPReputation,
    refreshAll,
  };
};