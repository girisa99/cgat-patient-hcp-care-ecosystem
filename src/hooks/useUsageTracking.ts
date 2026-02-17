/**
 * Usage Tracking Hook - P1 #74
 * 
 * Tracks API calls, module usage, and feature consumption per user.
 * Integrates with user_module_usage table for persistent tracking.
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface UsageRecord {
  id: string;
  user_id: string;
  module_id: string;
  usage_count: number;
  last_used_at: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface UsageEvent {
  moduleId: string;
  action: string;
  metadata?: Record<string, any>;
  creditsConsumed?: number;
}

export interface ModuleUsageStats {
  moduleId: string;
  moduleName: string;
  usageCount: number;
  limit: number;
  percentUsed: number;
  lastUsed: string | null;
  isOverLimit: boolean;
}

export interface UsageTrackingState {
  isTracking: boolean;
  totalUsageToday: number;
  moduleStats: ModuleUsageStats[];
  recentEvents: UsageEvent[];
}

// ============================================================================
// HOOK
// ============================================================================

export const useUsageTracking = () => {
  const { user } = useMasterAuth();
  const queryClient = useQueryClient();
  const [recentEvents, setRecentEvents] = useState<UsageEvent[]>([]);

  // Fetch user's module usage from database
  const { data: usageData, isLoading, error, refetch } = useQuery({
    queryKey: ['user-module-usage', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_module_usage')
        .select(`
          *,
          module:module_registry(*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch module registry for limits
  const { data: moduleRegistry } = useQuery({
    queryKey: ['module-registry-for-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_registry')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Track usage mutation
  const trackUsageMutation = useMutation({
    mutationFn: async (event: UsageEvent) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get current period (monthly)
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      // Check if usage record exists for this period
      const { data: existingUsage, error: fetchError } = await supabase
        .from('user_module_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', event.moduleId)
        .gte('period_start', periodStart)
        .lte('period_end', periodEnd)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingUsage) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_module_usage')
          .update({
            usage_count: existingUsage.usage_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq('id', existingUsage.id);

        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('user_module_usage')
          .insert({
            user_id: user.id,
            module_id: event.moduleId,
            usage_count: 1,
            last_used_at: new Date().toISOString(),
            period_start: periodStart,
            period_end: periodEnd,
          });

        if (insertError) throw insertError;
      }

      // If credits consumed, log transaction
      if (event.creditsConsumed && event.creditsConsumed > 0) {
        // This would integrate with ai_credit_transactions
        console.log(`Credits consumed: ${event.creditsConsumed} for ${event.action}`);
      }

      return { success: true, event };
    },
    onSuccess: (result) => {
      // Add to recent events
      setRecentEvents(prev => [result.event, ...prev.slice(0, 49)]);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['user-module-usage'] });
    },
    onError: (error) => {
      console.error('Usage tracking error:', error);
    },
  });

  // Track a usage event
  const trackUsage = useCallback((event: UsageEvent) => {
    trackUsageMutation.mutate(event);
  }, [trackUsageMutation]);

  // Quick track helpers
  const trackModuleAccess = useCallback((moduleId: string, moduleName: string) => {
    trackUsage({
      moduleId,
      action: 'module_access',
      metadata: { moduleName },
    });
  }, [trackUsage]);

  const trackAIRequest = useCallback((moduleId: string, modelProvider: string, tokensUsed?: number) => {
    trackUsage({
      moduleId,
      action: 'ai_request',
      metadata: { modelProvider, tokensUsed },
      creditsConsumed: tokensUsed ? Math.ceil(tokensUsed / 1000) : 1,
    });
  }, [trackUsage]);

  const trackFeatureUse = useCallback((moduleId: string, featureName: string) => {
    trackUsage({
      moduleId,
      action: 'feature_use',
      metadata: { featureName },
    });
  }, [trackUsage]);

  // Calculate module stats
  const moduleStats: ModuleUsageStats[] = (moduleRegistry || []).map(module => {
    const usageRecord = usageData?.find(u => u.module_id === module.id);
    const usageCount = usageRecord?.usage_count || 0;
    const limit = module.usage_limit_pro || 999999;
    
    return {
      moduleId: module.id,
      moduleName: module.name,
      usageCount,
      limit,
      percentUsed: Math.min((usageCount / limit) * 100, 100),
      lastUsed: usageRecord?.updated_at || null,
      isOverLimit: usageCount >= limit,
    };
  });

  // Check if user is over limit for a module
  const isOverLimit = useCallback((moduleId: string): boolean => {
    const stat = moduleStats.find(s => s.moduleId === moduleId);
    return stat?.isOverLimit || false;
  }, [moduleStats]);

  // Get remaining usage for a module
  const getRemainingUsage = useCallback((moduleId: string): number => {
    const stat = moduleStats.find(s => s.moduleId === moduleId);
    if (!stat) return 999999;
    return Math.max(0, stat.limit - stat.usageCount);
  }, [moduleStats]);

  // Total usage today (simplified)
  const totalUsageToday = recentEvents.length + (usageData?.reduce((sum, u) => sum + u.usage_count, 0) || 0);

  return {
    // State
    isLoading,
    error,
    isTracking: trackUsageMutation.isPending,
    totalUsageToday,
    moduleStats,
    recentEvents,
    
    // Actions
    trackUsage,
    trackModuleAccess,
    trackAIRequest,
    trackFeatureUse,
    refetch,
    
    // Helpers
    isOverLimit,
    getRemainingUsage,
  };
};

export default useUsageTracking;
