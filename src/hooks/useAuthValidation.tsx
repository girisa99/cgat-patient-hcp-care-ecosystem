
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
 * Hook to validate authentication state and RLS policy functionality
 * Uses the new test_rls_policies function to verify the fix works
 */
export const useAuthValidation = () => {
  const [validationResult, setValidationResult] = useState<AuthValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateAuth = async () => {
    try {
      setIsValidating(true);
      console.log('🔍 Validating authentication and RLS policies...');

      // Test the new RLS policies using the database function
      const { data, error } = await supabase.rpc('test_rls_policies');

      if (error) {
        console.error('❌ Auth validation failed:', error);
        throw error;
      }

      // Cast the response data to our expected type
      const testResult = data as RLSTestResult;

      if (testResult?.error) {
        console.log('ℹ️ No authenticated user for validation');
        setValidationResult({
          isValid: false,
          userRolesCount: 0,
          canAccessProfiles: false,
          isAdminSafe: false
        });
        return;
      }

      console.log('✅ Auth validation successful:', testResult);
      
      const result: AuthValidationResult = {
        isValid: true,
        userRolesCount: testResult.user_roles_count || 0,
        canAccessProfiles: testResult.can_access_profiles || false,
        isAdminSafe: testResult.is_admin_safe || false,
        userId: testResult.user_id,
        timestamp: testResult.timestamp
      };

      setValidationResult(result);

      // Show success message if all checks pass
      if (result.canAccessProfiles && result.userRolesCount > 0) {
        toast({
          title: "Authentication Verified",
          description: `User authenticated with ${result.userRolesCount} role(s). RLS policies working correctly.`,
        });
      }

    } catch (error: any) {
      console.error('💥 Auth validation exception:', error);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate authentication",
        variant: "destructive",
      });
      
      setValidationResult({
        isValid: false,
        userRolesCount: 0,
        canAccessProfiles: false,
        isAdminSafe: false
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-validate on mount
  useEffect(() => {
    validateAuth();
  }, []);

  return {
    validationResult,
    isValidating,
    validateAuth,
    
    // Helper getters
    isAuthenticated: validationResult?.isValid || false,
    hasRoles: (validationResult?.userRolesCount || 0) > 0,
    canAccessProfiles: validationResult?.canAccessProfiles || false,
    isAdmin: validationResult?.isAdminSafe || false
  };
};
