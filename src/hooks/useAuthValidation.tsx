
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthValidationResult {
  isValid: boolean;
  userRolesCount: number;
  canAccessProfiles: boolean;
  isAdminSafe: boolean;
  userId?: string;
  timestamp?: string;
  // Enhanced validation properties
  hasActiveModules: boolean;
  facilitiesAccessible: number;
  effectivePermissions: string[];
  securityLevel: 'low' | 'medium' | 'high';
  lastSecurityCheck?: string;
}

interface RLSTestResult {
  user_id?: string;
  user_roles_count?: number;
  can_access_profiles?: boolean;
  is_admin_safe?: boolean;
  timestamp?: string;
  error?: string;
}

/**
 * Enhanced hook to validate authentication state and comprehensive user access
 * Validates RLS policies, module access, facility permissions, and security compliance
 */
export const useAuthValidation = () => {
  const [validationResult, setValidationResult] = useState<AuthValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState<string[]>([]);
  const { toast } = useToast();

  const validateComprehensiveAccess = async () => {
    try {
      setIsValidating(true);
      console.log('🔍 Starting comprehensive access validation...');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setValidationResult({
          isValid: false,
          userRolesCount: 0,
          canAccessProfiles: false,
          isAdminSafe: false,
          hasActiveModules: false,
          facilitiesAccessible: 0,
          effectivePermissions: [],
          securityLevel: 'low'
        });
        return;
      }

      // Test RLS policies
      const { data: rlsData, error: rlsError } = await supabase.rpc('test_rls_policies');
      if (rlsError) {
        console.error('❌ RLS validation failed:', rlsError);
        throw rlsError;
      }

      const testResult = rlsData as RLSTestResult;

      // Validate user modules access
      const { data: userModules, error: modulesError } = await supabase
        .rpc('get_user_effective_modules', { check_user_id: user.id });
      
      const hasActiveModules = !modulesError && (userModules?.length || 0) > 0;

      // Check accessible facilities
      const { data: facilities, error: facilitiesError } = await supabase
        .rpc('get_user_accessible_facilities', { user_id: user.id });
      
      const facilitiesAccessible = !facilitiesError ? (facilities?.length || 0) : 0;

      // Get effective permissions
      const { data: permissions, error: permissionsError } = await supabase
        .rpc('get_user_effective_permissions', { check_user_id: user.id });
      
      const effectivePermissions = !permissionsError ? 
        (permissions?.map((p: any) => p.permission_name) || []) : [];

      // Determine security level
      const securityLevel = calculateSecurityLevel({
        userRolesCount: testResult.user_roles_count || 0,
        hasActiveModules,
        facilitiesAccessible,
        effectivePermissions: effectivePermissions.length,
        isAdmin: testResult.is_admin_safe || false
      });

      // Check for security alerts
      const alerts = [];
      if ((testResult.user_roles_count || 0) === 0) {
        alerts.push('User has no assigned roles');
      }
      if (!hasActiveModules) {
        alerts.push('User has no active module assignments');
      }
      if (facilitiesAccessible === 0) {
        alerts.push('User has no facility access');
      }
      if (effectivePermissions.length === 0) {
        alerts.push('User has no effective permissions');
      }

      setSecurityAlerts(alerts);

      const result: AuthValidationResult = {
        isValid: true,
        userRolesCount: testResult.user_roles_count || 0,
        canAccessProfiles: testResult.can_access_profiles || false,
        isAdminSafe: testResult.is_admin_safe || false,
        userId: testResult.user_id,
        timestamp: testResult.timestamp,
        hasActiveModules,
        facilitiesAccessible,
        effectivePermissions,
        securityLevel,
        lastSecurityCheck: new Date().toISOString()
      };

      setValidationResult(result);

      // Show comprehensive validation results
      if (alerts.length === 0) {
        toast({
          title: `Access Validation Complete - ${securityLevel.toUpperCase()} Security`,
          description: `✅ User authenticated with ${result.userRolesCount} role(s), ${effectivePermissions.length} permissions, ${facilitiesAccessible} facility access(es)`,
        });
      } else {
        toast({
          title: "Access Validation Warnings",
          description: `⚠️ ${alerts.length} security alert(s) detected`,
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('💥 Comprehensive access validation failed:', error);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate user access",
        variant: "destructive",
      });
      
      setValidationResult({
        isValid: false,
        userRolesCount: 0,
        canAccessProfiles: false,
        isAdminSafe: false,
        hasActiveModules: false,
        facilitiesAccessible: 0,
        effectivePermissions: [],
        securityLevel: 'low'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const calculateSecurityLevel = (metrics: {
    userRolesCount: number;
    hasActiveModules: boolean;
    facilitiesAccessible: number;
    effectivePermissions: number;
    isAdmin: boolean;
  }): 'low' | 'medium' | 'high' => {
    let score = 0;
    
    if (metrics.userRolesCount > 0) score += 2;
    if (metrics.hasActiveModules) score += 2;
    if (metrics.facilitiesAccessible > 0) score += 1;
    if (metrics.effectivePermissions > 0) score += 2;
    if (metrics.isAdmin) score += 1;

    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  };

  // Auto-validate on mount and periodically
  useEffect(() => {
    validateComprehensiveAccess();
    
    // Set up periodic validation every 5 minutes
    const interval = setInterval(() => {
      validateComprehensiveAccess();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    validationResult,
    isValidating,
    securityAlerts,
    validateAuth: validateComprehensiveAccess,
    
    // Enhanced helper getters
    isAuthenticated: validationResult?.isValid || false,
    hasRoles: (validationResult?.userRolesCount || 0) > 0,
    canAccessProfiles: validationResult?.canAccessProfiles || false,
    isAdmin: validationResult?.isAdminSafe || false,
    hasModuleAccess: validationResult?.hasActiveModules || false,
    hasFacilityAccess: (validationResult?.facilitiesAccessible || 0) > 0,
    hasPermissions: (validationResult?.effectivePermissions?.length || 0) > 0,
    securityLevel: validationResult?.securityLevel || 'low',
    isSecure: validationResult?.securityLevel === 'high',
    hasSecurityAlerts: securityAlerts.length > 0
  };
};
