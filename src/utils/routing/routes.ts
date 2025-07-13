import { RouteRegistry, autoRegisterModule } from './RouteRegistry';

// Import all page components
import Index from '@/pages/Index';
import Users from '@/pages/Users';
import Patients from '@/pages/Patients';
import Facilities from '@/pages/Facilities';
import Onboarding from '@/pages/Onboarding';
import Modules from '@/pages/Modules';
import ApiServices from '@/pages/ApiServices';
import NgrokIntegration from '@/pages/NgrokIntegration';
import Security from '@/pages/Security';
import Reports from '@/pages/Reports';
import Testing from '@/pages/Testing';
import RoleManagement from '@/pages/RoleManagement';
import Login from '@/pages/Login';

/**
 * Initialize all application routes with role-based access control
 * NEW PAGES/MODULES AUTOMATICALLY GET REGISTERED HERE
 */
export const initializeRoutes = () => {
  console.log('🚀 Initializing route registry with role-based access...');

  // PUBLIC ROUTES
  RouteRegistry.register({
    path: '/login',
    component: Login,
    title: 'Login',
    description: 'User authentication',
    requiresAuth: false,
    isPublic: true,
    category: 'system',
    icon: 'LogIn',
  });

  // DASHBOARD (MAIN)
  RouteRegistry.register({
    path: '/',
    component: Index,
    title: 'Dashboard',
    description: 'Main application dashboard',
    requiresAuth: true,
    allowedRoles: ['superAdmin', 'onboardingTeam', 'staff', 'technicalServices', 'patientCaregiver'],
    category: 'management',
    icon: 'LayoutDashboard',
  });

  // USER MANAGEMENT - Multi-tenant aware
  RouteRegistry.register({
    path: '/users',
    component: Users,
    title: 'User Management',
    description: 'Manage system users and roles',
    requiresAuth: true,
    allowedRoles: ['superAdmin', 'onboardingTeam'],
    category: 'management',
    icon: 'Users',
    crossTenant: true, // Can manage users across facilities
  });

  // PATIENT MANAGEMENT - Tenant-scoped
  RouteRegistry.register({
    path: '/patients',
    component: Patients,
    title: 'Patient Management',
    description: 'Manage patient information',
    requiresAuth: true,
    allowedRoles: ['superAdmin', 'onboardingTeam', 'staff'],
    category: 'management',
    icon: 'Heart',
    tenantScoped: true,           // Requires facility context
    facilityPermission: 'read',   // Minimum facility permission
    facilityTypes: ['treatmentFacility'], // Only treatment facilities
    requireFacilityContext: true,
  });

  // FACILITY MANAGEMENT - Cross-tenant for admins
  RouteRegistry.register({
    path: '/facilities',
    component: Facilities,
    title: 'Facility Management',
    description: 'Manage healthcare facilities',
    requiresAuth: true,
    allowedRoles: ['superAdmin', 'onboardingTeam'],
    category: 'management',
    icon: 'Building',
    crossTenant: true, // Can manage all facilities
  });

  // ONBOARDING
  RouteRegistry.register({
    path: '/onboarding',
    component: Onboarding,
    title: 'Onboarding',
    description: 'Treatment center onboarding workflows',
    requiresAuth: true,
    allowedRoles: ['superAdmin', 'onboardingTeam'],
    category: 'management',
    icon: 'UserPlus',
  });

  // SYSTEM MODULES
  RouteRegistry.register({
    path: '/modules',
    component: Modules,
    title: 'Modules',
    description: 'System module management',
    requiresAuth: true,
    allowedRoles: ['superAdmin'],
    category: 'admin',
    icon: 'Package',
  });

  // API SERVICES
  RouteRegistry.register({
    path: '/api-services',
    component: ApiServices,
    title: 'API Services',
    description: 'API integration management',
    requiresAuth: true,
    allowedRoles: ['superAdmin', 'technicalServices'],
    category: 'admin',
    icon: 'Zap',
  });

  // NGROK INTEGRATION
  RouteRegistry.register({
    path: '/ngrok',
    component: NgrokIntegration,
    title: 'Ngrok Integration',
    description: 'Development tunnel management',
    requiresAuth: true,
    allowedRoles: ['superAdmin', 'technicalServices'],
    category: 'admin',
    icon: 'Network',
  });

  // SECURITY
  RouteRegistry.register({
    path: '/security',
    component: Security,
    title: 'Security',
    description: 'Security settings and monitoring',
    requiresAuth: true,
    allowedRoles: ['superAdmin'],
    category: 'admin',
    icon: 'Shield',
  });

  // REPORTS
  RouteRegistry.register({
    path: '/reports',
    component: Reports,
    title: 'Reports',
    description: 'System reports and analytics',
    requiresAuth: true,
    allowedRoles: ['superAdmin', 'onboardingTeam', 'staff'],
    category: 'reporting',
    icon: 'BarChart3',
  });

  // TESTING
  RouteRegistry.register({
    path: '/testing',
    component: Testing,
    title: 'Testing',
    description: 'System testing and validation',
    requiresAuth: true,
    allowedRoles: ['superAdmin', 'technicalServices'],
    category: 'admin',
    icon: 'TestTube',
  });

  // ROLE MANAGEMENT
  RouteRegistry.register({
    path: '/role-management',
    component: RoleManagement,
    title: 'Role Management',
    description: 'Advanced role and permission management',
    requiresAuth: true,
    allowedRoles: ['superAdmin'],
    category: 'admin',
    icon: 'UserCog',
  });

  console.log('✅ All routes registered successfully');
  console.log('📊 Route Stats:', RouteRegistry.getStats());
};

/**
 * AUTO-REGISTER NEW MODULES
 * Add new pages/modules here and they'll automatically get:
 * - Role-based access control
 * - Error boundaries
 * - Loading states
 * - Navigation integration
 */

// Example: Auto-register a new billing module
// import BillingPage from '@/pages/BillingPage';
// autoRegisterModule('Billing', BillingPage, {
//   path: '/billing',
//   allowedRoles: ['superAdmin', 'staff'],
//   category: 'management',
//   icon: 'CreditCard',
//   description: 'Billing and payment management'
// });

export { RouteRegistry };