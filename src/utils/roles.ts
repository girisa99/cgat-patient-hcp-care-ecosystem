
/**
 * Role utilities: normalization and routing
 */

export const ROLE_ALIASES: Record<string, string> = {
  // Super admin variants
  'superadmin': 'superAdmin',
  'super_admin': 'superAdmin',
  'super-admin': 'superAdmin',

  // Onboarding team / customer onboarding variants
  'onboardingteam': 'onboardingTeam',
  'onboarding_team': 'onboardingTeam',
  'onboarding-team': 'onboardingTeam',
  'onboarding': 'onboardingTeam',
  'customer_onboarding': 'onboardingTeam',
  'customer-onboarding': 'onboardingTeam',
  'customeronboarding': 'onboardingTeam',

  // Healthcare roles
  'healthcare_provider': 'healthcareProvider',
  'healthcare-provider': 'healthcareProvider',
  'provider': 'healthcareProvider',
  'case_manager': 'caseManager',
  'case-manager': 'caseManager',

  // Demo user
  'demouser': 'demoUser',
  'demo_user': 'demoUser',
  'demo-user': 'demoUser',
};

export const normalizeRoleName = (role: string): string => {
  if (!role) return role;
  const key = role.replace(/\s+/g, '').toLowerCase();
  return ROLE_ALIASES[key] ?? role;
};

export const normalizeRoles = (roles: string[] = []): string[] => {
  const set = new Set<string>();
  roles.forEach((r) => set.add(normalizeRoleName(r)));
  return Array.from(set);
};

export const hasAnyRole = (userRoles: string[] = [], required: string[] = []): boolean => {
  if (!required || required.length === 0) return true;
  const u = normalizeRoles(userRoles);
  const req = required.map(normalizeRoleName);
  return req.some((r) => u.includes(r));
};

// Centralized default route resolver based on normalized roles
export const getDefaultRouteForRoles = (roles: string[] = []): string => {
  const r = normalizeRoles(roles);

  // Priority: superAdmin > onboardingTeam > demoUser > default
  if (r.includes('superAdmin')) return '/dashboard';
  if (r.includes('onboardingTeam')) return '/onboarding';
  if (r.includes('demoUser')) return '/demo-dashboard';

  return '/dashboard';
};
