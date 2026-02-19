
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
  'healthcareprovider': 'healthcareProvider',
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
// Role-based routing: 
//   - Internal/Admin → Production Hub (/genie-admin)
//   - Healthcare roles → Patient Dashboard (/patients)
//   - Genie Suite subscribers → Studio (/genie-studio)
export const getDefaultRouteForRoles = (roles: string[] = [], isInternal?: boolean): string => {
  const r = normalizeRoles(roles);

  // Internal admins go directly to Genie Cast (standalone production hub)
  if (isInternal) return '/genie-cast';

  // Priority: superAdmin/admin → Genie Cast (primary production interface)
  if (r.includes('superAdmin')) return '/genie-cast';
  if (r.includes('admin')) return '/genie-cast';
  if (r.includes('onboardingTeam')) return '/genie-cast';

  // Healthcare roles → Patient Management (NOT Genie Suite)
  if (r.includes('healthcareProvider')) return '/patients';
  if (r.includes('nurse')) return '/patients';
  if (r.includes('caseManager')) return '/patients';
  if (r.includes('patientCaregiver')) return '/dashboard';

  // Demo users
  if (r.includes('demoUser')) return '/demo-dashboard';

  // Default for Genie Suite subscribers
  return '/genie-studio';
};
