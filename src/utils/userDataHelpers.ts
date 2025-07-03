
import type { UserWithRoles } from '@/types/userManagement';

/**
 * Helper functions for filtering users by type
 */

export const getPatientUsers = (users: UserWithRoles[]): UserWithRoles[] => {
  return users.filter((user: UserWithRoles) => 
    user.user_roles?.some((userRole: any) => userRole.roles?.name === 'patientCaregiver')
  );
};

export const getHealthcareStaff = (users: UserWithRoles[]): UserWithRoles[] => {
  const staffRoles = ['nurse', 'provider', 'caseManager', 'socialWorker'];
  return users.filter((user: UserWithRoles) => 
    user.user_roles?.some((userRole: any) => 
      staffRoles.includes(userRole.roles?.name)
    )
  );
};

export const getAdminUsers = (users: UserWithRoles[]): UserWithRoles[] => {
  const adminRoles = ['superAdmin', 'onboardingTeam', 'moderator'];
  return users.filter((user: UserWithRoles) => 
    user.user_roles?.some((userRole: any) => 
      adminRoles.includes(userRole.roles?.name)
    )
  );
};

export const getRegularUsers = (users: UserWithRoles[]): UserWithRoles[] => {
  return users.filter((user: UserWithRoles) => 
    user.user_roles?.some((userRole: any) => userRole.roles?.name === 'user')
  );
};

/**
 * Create consistent query keys for user-related data
 */
export const createUserQueryKey = (type: string, ...params: any[]) => {
  return ['users', type, ...params];
};
