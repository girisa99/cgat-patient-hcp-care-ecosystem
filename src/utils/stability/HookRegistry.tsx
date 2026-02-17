/**
 * HOOK REGISTRY & DUPLICATION PREVENTION SYSTEM
 * Ensures only approved hooks are used and prevents duplicates
 */
import { useEffect, useRef } from 'react';
import { useMasterToast } from '@/hooks/useMasterToast';

// Approved master hooks registry
const APPROVED_HOOKS = new Set([
  'useMasterAuth',
  'useMasterData', 
  'useMasterToast',
  'useMasterUserManagement',
  'useMasterFacilities',
  'useSingleMasterModules',
  'useRoleBasedNavigation',
  'useTenantContext',
  'useFacilityScope',
  'useComplianceMonitoring',
  'useStability',
  'useModuleStability',
  'useHookProtection',
  'useLayoutProtection',
  'usePerformanceMonitoring',
  'useStateIsolation',
  'useEventIsolation'
]);

// Hook usage tracking
const hookUsageRegistry = new Map<string, {
  count: number;
  modules: Set<string>;
  lastUsed: Date;
}>();

/**
 * Register hook usage and detect duplicates
 */
export const useHookRegistry = (hookName: string, moduleId: string) => {
  const { showError } = useMasterToast();
  const isRegistered = useRef(false);

  useEffect(() => {
    if (isRegistered.current) return;
    isRegistered.current = true;

    // Check if hook is approved
    if (!APPROVED_HOOKS.has(hookName)) {
      console.warn(`⚠️ Unapproved hook detected: ${hookName} in ${moduleId}`);
      showError(`Unapproved hook: ${hookName}. Please use master hooks only.`);
      return;
    }

    // Track usage
    const current = hookUsageRegistry.get(hookName) || {
      count: 0,
      modules: new Set(),
      lastUsed: new Date()
    };

    current.count += 1;
    current.modules.add(moduleId);
    current.lastUsed = new Date();
    hookUsageRegistry.set(hookName, current);

    // Detect potential duplicates (same hook in multiple modules)
    if (current.modules.size > 1) {
      console.warn(`🔍 Hook ${hookName} used in multiple modules:`, Array.from(current.modules));
    }

    // Cleanup on unmount
    return () => {
      const registry = hookUsageRegistry.get(hookName);
      if (registry) {
        registry.count -= 1;
        if (registry.count <= 0) {
          registry.modules.delete(moduleId);
          if (registry.modules.size === 0) {
            hookUsageRegistry.delete(hookName);
          }
        }
      }
      isRegistered.current = false;
    };
  }, [hookName, moduleId, showError]);

  return {
    isApproved: APPROVED_HOOKS.has(hookName),
    usageCount: hookUsageRegistry.get(hookName)?.count || 0,
    modules: Array.from(hookUsageRegistry.get(hookName)?.modules || [])
  };
};

/**
 * Get hook usage statistics
 */
export const getHookStats = () => {
  const stats = {
    totalHooks: hookUsageRegistry.size,
    totalUsage: 0,
    byHook: {} as Record<string, { count: number; modules: string[] }>
  };

  hookUsageRegistry.forEach((data, hookName) => {
    stats.totalUsage += data.count;
    stats.byHook[hookName] = {
      count: data.count,
      modules: Array.from(data.modules)
    };
  });

  return stats;
};

/**
 * Detect hook duplicates across the application
 */
export const detectHookDuplicates = () => {
  const duplicates: Array<{ hookName: string; modules: string[]; severity: 'warning' | 'error' }> = [];

  hookUsageRegistry.forEach((data, hookName) => {
    if (data.modules.size > 1) {
      duplicates.push({
        hookName,
        modules: Array.from(data.modules),
        severity: APPROVED_HOOKS.has(hookName) ? 'warning' : 'error'
      });
    }
  });

  return duplicates;
};

/**
 * Validate hook usage compliance
 */
export const validateHookCompliance = () => {
  const compliance = {
    isCompliant: true,
    violations: [] as string[],
    warnings: [] as string[],
    score: 100
  };

  hookUsageRegistry.forEach((data, hookName) => {
    if (!APPROVED_HOOKS.has(hookName)) {
      compliance.isCompliant = false;
      compliance.violations.push(`Unapproved hook: ${hookName}`);
      compliance.score -= 10;
    }

    if (data.modules.size > 3) {
      compliance.warnings.push(`Hook ${hookName} used in ${data.modules.size} modules - consider optimization`);
      compliance.score -= 2;
    }
  });

  return compliance;
};

/**
 * Auto-fix hook compliance issues
 */
export const suggestHookFixes = () => {
  const suggestions: Array<{
    issue: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  const duplicates = detectHookDuplicates();
  const compliance = validateHookCompliance();

  // Suggest fixes for violations
  compliance.violations.forEach(violation => {
    if (violation.includes('Unapproved hook')) {
      suggestions.push({
        issue: violation,
        suggestion: 'Replace with approved master hooks (useMasterAuth, useMasterData, useMasterToast)',
        priority: 'high'
      });
    }
  });

  // Suggest optimizations for duplicates
  duplicates.forEach(({ hookName, modules }) => {
    suggestions.push({
      issue: `Hook ${hookName} duplicated across ${modules.length} modules`,
      suggestion: `Consider consolidating ${hookName} usage or creating a shared context`,
      priority: modules.length > 5 ? 'high' : 'medium'
    });
  });

  return suggestions;
};

export default useHookRegistry;