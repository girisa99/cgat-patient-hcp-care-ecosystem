/**
 * Framework Initialization
 * Sets up the stability framework when the app starts
 */

import { FrameworkOrchestrator } from '@/utils/verification/analyzers/FrameworkOrchestrator';

// Global framework instance
let frameworkInstance: FrameworkOrchestrator | null = null;

/**
 * Initialize the stability framework
 */
export const initializeStabilityFramework = async (): Promise<FrameworkOrchestrator> => {
  if (frameworkInstance) {
    return frameworkInstance;
  }

  console.log('🚀 Initializing Stability Framework...');
  
  frameworkInstance = new FrameworkOrchestrator();
  
  // Register your existing components with the framework
  await registerExistingComponents(frameworkInstance);
  
  // Set up role-based features
  await setupRoleBasedFeatures(frameworkInstance);
  
  // Perform initial health check
  const healthCheck = await frameworkInstance.performHealthCheck();
  console.log('🏥 Framework Health Check:', healthCheck.overall);
  
  if (healthCheck.overall === 'critical') {
    console.warn('⚠️ Framework has critical issues:', healthCheck.recommendations);
  }
  
  console.log('✅ Stability Framework initialized successfully');
  return frameworkInstance;
};

/**
 * Register existing components with the framework
 */
const registerExistingComponents = async (framework: FrameworkOrchestrator): Promise<void> => {
  const componentManager = framework.getComponentManager();
  
  // Register your existing shadcn/ui components
  const existingComponents = [
    {
      name: 'Button',
      version: '1.0.0',
      category: 'ui',
      functionality: 'clickable button with various styles and sizes',
      props: {
        children: { type: 'React.ReactNode', required: true },
        onClick: { type: 'function', required: false },
        variant: { type: 'string', required: false, default: 'default' },
        size: { type: 'string', required: false, default: 'default' },
        disabled: { type: 'boolean', required: false, default: false }
      },
      backwardsCompatible: true
    },
    {
      name: 'Input',
      version: '1.0.0',
      category: 'ui',
      functionality: 'text input field with validation and styling',
      props: {
        value: { type: 'string', required: false },
        onChange: { type: 'function', required: false },
        placeholder: { type: 'string', required: false },
        type: { type: 'string', required: false, default: 'text' },
        disabled: { type: 'boolean', required: false, default: false }
      },
      backwardsCompatible: true
    },
    {
      name: 'Card',
      version: '1.0.0',
      category: 'ui',
      functionality: 'container component with optional header, content, and footer',
      props: {
        children: { type: 'React.ReactNode', required: true },
        className: { type: 'string', required: false }
      },
      backwardsCompatible: true
    },
    {
      name: 'Dialog',
      version: '1.0.0',
      category: 'ui',
      functionality: 'modal dialog for displaying content above main page',
      props: {
        open: { type: 'boolean', required: false },
        onOpenChange: { type: 'function', required: false },
        children: { type: 'React.ReactNode', required: true }
      },
      backwardsCompatible: true
    }
  ];

  for (const component of existingComponents) {
    try {
      componentManager.registerComponent(component.name, component);
      console.log(`✅ Registered component: ${component.name}`);
    } catch (error) {
      console.warn(`⚠️ Failed to register component ${component.name}:`, error);
    }
  }
};

/**
 * Set up role-based features
 */
const setupRoleBasedFeatures = async (framework: FrameworkOrchestrator): Promise<void> => {
  const roleManager = framework.getRoleManager();
  
  // Register existing features with role-based access
  const features = [
    {
      name: 'user-management',
      requiredRoles: ['superAdmin', 'onboardingTeam'],
      enabledByDefault: true,
      rolloutPercentage: 100,
      routes: [
        { path: '/users', fallbackRoute: '/dashboard' },
        { path: '/roles', fallbackRoute: '/dashboard' }
      ]
    },
    {
      name: 'patient-management',
      requiredRoles: ['superAdmin', 'onboardingTeam', 'practitioner', 'staff'],
      enabledByDefault: true,
      rolloutPercentage: 100,
      routes: [
        { path: '/patients', fallbackRoute: '/dashboard' }
      ]
    },
    {
      name: 'facility-management',
      requiredRoles: ['superAdmin', 'onboardingTeam'],
      enabledByDefault: true,
      rolloutPercentage: 100,
      routes: [
        { path: '/facilities', fallbackRoute: '/dashboard' }
      ]
    },
    {
      name: 'onboarding-workflow',
      requiredRoles: ['superAdmin', 'onboardingTeam'],
      enabledByDefault: true,
      rolloutPercentage: 100,
      routes: [
        { path: '/onboarding', fallbackRoute: '/dashboard' }
      ]
    },
    {
      name: 'api-management',
      requiredRoles: ['superAdmin'],
      enabledByDefault: true,
      rolloutPercentage: 100,
      routes: [
        { path: '/api', fallbackRoute: '/dashboard' }
      ]
    }
  ];

  for (const feature of features) {
    try {
      roleManager.registerFeature(feature.name, feature);
      console.log(`✅ Registered feature: ${feature.name} for roles: ${feature.requiredRoles.join(', ')}`);
    } catch (error) {
      console.warn(`⚠️ Failed to register feature ${feature.name}:`, error);
    }
  }
};

/**
 * Get the framework instance (must be initialized first)
 */
export const getStabilityFramework = (): FrameworkOrchestrator => {
  if (!frameworkInstance) {
    throw new Error('Stability Framework not initialized. Call initializeStabilityFramework() first.');
  }
  return frameworkInstance;
};

/**
 * Development helper functions
 */
export const frameworkHelpers = {
  /**
   * Validate a development change before implementation
   */
  validateChange: async (request: {
    type: 'component' | 'service' | 'hook' | 'api' | 'route';
    name: string;
    description: string;
    metadata?: any;
    userRoles?: string[];
  }) => {
    const framework = getStabilityFramework();
    return await framework.validateDevelopmentChange(request);
  },

  /**
   * Create a new role-based feature safely
   */
  createFeature: async (config: {
    name: string;
    requiredRoles: string[];
    enabledByDefault: boolean;
    rolloutPercentage?: number;
  }) => {
    const framework = getStabilityFramework();
    return await framework.createSafeFeature(config);
  },

  /**
   * Enhance an existing component safely
   */
  enhanceComponent: async (request: {
    componentName: string;
    newProps?: Record<string, any>;
    newFeatures?: string[];
    version?: string;
  }) => {
    const framework = getStabilityFramework();
    return await framework.enhanceComponentSafely(request);
  },

  /**
   * Generate safe code with validation
   */
  generateCode: async (request: {
    codeType: 'component' | 'service' | 'hook' | 'type';
    requirements: string;
    targetRoles?: string[];
    rolloutStrategy?: 'immediate' | 'gradual';
  }) => {
    const framework = getStabilityFramework();
    return await framework.generateSafeCode(request);
  },

  /**
   * Get framework status
   */
  getStatus: () => {
    const framework = getStabilityFramework();
    return framework.getFrameworkStatus();
  },

  /**
   * Perform health check
   */
  healthCheck: async () => {
    const framework = getStabilityFramework();
    return await framework.performHealthCheck();
  },

  /**
   * Get development recommendations
   */
  getRecommendations: () => {
    const framework = getStabilityFramework();
    return framework.getDevelopmentRecommendations();
  }
};

// Development mode helpers (only available in development)
if (process.env.NODE_ENV === 'development') {
  // Make framework helpers available globally for debugging
  (window as any).stabilityFramework = frameworkHelpers;
  
  console.log('🔧 Development mode: Stability framework helpers available at window.stabilityFramework');
}