import { useMasterAuth } from './useMasterAuth';
import { useTenant } from './useTenant';

/**
 * useRBAC
 * Simple helper for Role-Based Access Control. Works together with the tenant
 * context so we can ask questions like "does the current user have role X in
 * the current tenant?".
 */
export const useRBAC = () => {
  const { userRoles, isAuthenticated } = useMasterAuth();
  const { tenant } = useTenant();

  /**
   * Check if the logged-in user owns at least one of the provided roles.
   *   hasRole('superAdmin')
   *   hasRole(['facilityAdmin', 'onboardingTeam'])
   */
  const hasRole = (role: string | string[]) => {
    if (!isAuthenticated) return false;
    const rolesToCheck = Array.isArray(role) ? role : [role];
    return userRoles.some((r) => rolesToCheck.includes(r));
  };

  /**
   * Quick helper for "admin rights" – we treat superAdmin as global and
   * tenantAdmin as tenant-scoped.
   */
  const isAdmin = () => hasRole(['superAdmin', 'tenantAdmin']);

  return {
    tenant,
    hasRole,
    isAdmin,
  };
};