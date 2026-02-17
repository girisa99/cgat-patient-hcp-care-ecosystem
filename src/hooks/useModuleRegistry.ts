/**
 * useModuleRegistry - Hook for accessing module registry and usage tracking
 * 
 * Provides:
 * - Module definitions from database
 * - Module access checks based on tier
 * - Usage tracking and limit enforcement
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';
import { toast } from 'sonner';

export interface ModuleDefinition {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  product: string;
  category: string;
  icon: string | null;
  is_active: boolean;
  requires_subscription: boolean;
  min_tier: string;
  allowed_tiers: string[];
  usage_limit_free: number;
  usage_limit_starter: number;
  usage_limit_business: number;
  usage_limit_pro: number;
  credit_cost: number;
  feature_flags: Record<string, any>;
  dependencies: string[];
  sort_order: number;
}

export interface ModuleUsage {
  module_id: string;
  usage_count: number;
  period_start: string;
  period_end: string;
}

interface UseModuleRegistryReturn {
  modules: ModuleDefinition[];
  usage: Record<string, ModuleUsage>;
  isLoading: boolean;
  error: Error | null;
  
  // Access checks
  hasModuleAccess: (moduleId: string) => boolean;
  getModuleLimit: (moduleId: string) => number;
  getRemainingUsage: (moduleId: string) => number;
  
  // Usage tracking
  trackUsage: (moduleId: string, count?: number) => Promise<boolean>;
  canUseModule: (moduleId: string) => { allowed: boolean; reason?: string };
  
  // Module queries
  getModule: (moduleId: string) => ModuleDefinition | undefined;
  getModulesByProduct: (product: string) => ModuleDefinition[];
  getModulesByCategory: (category: string) => ModuleDefinition[];
  
  // Refresh
  refreshModules: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

export const useModuleRegistry = (): UseModuleRegistryReturn => {
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [usage, setUsage] = useState<Record<string, ModuleUsage>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { subscription } = useSubscription();

  // Fetch all modules
  const fetchModules = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('module_registry')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (fetchError) throw fetchError;
      
      setModules((data || []) as ModuleDefinition[]);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err as Error);
    }
  }, []);

  // Fetch user's usage
  const fetchUsage = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data, error: fetchError } = await supabase
        .from('user_module_usage')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_start', periodStart.toISOString());

      if (fetchError) throw fetchError;

      const usageMap: Record<string, ModuleUsage> = {};
      (data || []).forEach((u: any) => {
        usageMap[u.module_id] = u;
      });
      setUsage(usageMap);
    } catch (err) {
      console.error('Error fetching usage:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchModules(), fetchUsage()]);
      setIsLoading(false);
    };
    load();
  }, [fetchModules, fetchUsage]);

  // Check if user has access to module based on tier
  const hasModuleAccess = useCallback((moduleId: string): boolean => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return false;
    
    // Beta users have access to everything
    if (subscription.tier === 'beta') return true;
    
    // Check if tier is in allowed tiers
    if (module.allowed_tiers.includes(subscription.tier)) return true;
    
    // Check tier hierarchy
    const tierOrder: SubscriptionTier[] = ['free', 'starter', 'business', 'pro', 'enterprise', 'beta'];
    const userTierIndex = tierOrder.indexOf(subscription.tier);
    const minTierIndex = tierOrder.indexOf(module.min_tier as SubscriptionTier);
    
    return userTierIndex >= minTierIndex;
  }, [modules, subscription.tier]);

  // Get usage limit for module based on tier
  const getModuleLimit = useCallback((moduleId: string): number => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return 0;
    
    if (subscription.tier === 'beta' || subscription.tier === 'enterprise') return -1; // Unlimited
    
    switch (subscription.tier) {
      case 'free': return module.usage_limit_free;
      case 'starter': return module.usage_limit_starter;
      case 'business': return module.usage_limit_business;
      case 'pro': return module.usage_limit_pro;
      default: return module.usage_limit_free;
    }
  }, [modules, subscription.tier]);

  // Get remaining usage for module
  const getRemainingUsage = useCallback((moduleId: string): number => {
    const limit = getModuleLimit(moduleId);
    if (limit === -1) return -1; // Unlimited
    
    const currentUsage = usage[moduleId]?.usage_count || 0;
    return Math.max(0, limit - currentUsage);
  }, [getModuleLimit, usage]);

  // Check if user can use module
  const canUseModule = useCallback((moduleId: string): { allowed: boolean; reason?: string } => {
    if (!hasModuleAccess(moduleId)) {
      const module = modules.find(m => m.id === moduleId);
      return { 
        allowed: false, 
        reason: `Requires ${module?.min_tier || 'subscription'} tier or higher` 
      };
    }
    
    const remaining = getRemainingUsage(moduleId);
    if (remaining === 0) {
      return { 
        allowed: false, 
        reason: 'Monthly usage limit reached' 
      };
    }
    
    return { allowed: true };
  }, [hasModuleAccess, getRemainingUsage, modules]);

  // Track module usage
  const trackUsage = useCallback(async (moduleId: string, count = 1): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const canUse = canUseModule(moduleId);
      if (!canUse.allowed) {
        toast.error(canUse.reason || 'Cannot use this module');
        return false;
      }

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const { error: upsertError } = await supabase
        .from('user_module_usage')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          usage_count: (usage[moduleId]?.usage_count || 0) + count,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id,period_start'
        });

      if (upsertError) throw upsertError;

      // Refresh usage
      await fetchUsage();
      return true;
    } catch (err) {
      console.error('Error tracking usage:', err);
      return false;
    }
  }, [canUseModule, usage, fetchUsage]);

  // Get module by ID
  const getModule = useCallback((moduleId: string) => {
    return modules.find(m => m.id === moduleId);
  }, [modules]);

  // Get modules by product
  const getModulesByProduct = useCallback((product: string) => {
    return modules.filter(m => m.product === product);
  }, [modules]);

  // Get modules by category
  const getModulesByCategory = useCallback((category: string) => {
    return modules.filter(m => m.category === category);
  }, [modules]);

  return {
    modules,
    usage,
    isLoading,
    error,
    hasModuleAccess,
    getModuleLimit,
    getRemainingUsage,
    trackUsage,
    canUseModule,
    getModule,
    getModulesByProduct,
    getModulesByCategory,
    refreshModules: fetchModules,
    refreshUsage: fetchUsage
  };
};

export default useModuleRegistry;
