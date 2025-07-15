/**
 * Enhanced Lovable Configuration with Stability Framework Integration
 * Integrates with your existing TypeScript stability framework components
 */

import { FrameworkOrchestrator } from './src/utils/verification/analyzers/FrameworkOrchestrator';

// Initialize the framework orchestrator
const frameworkOrchestrator = new FrameworkOrchestrator();

// Define your existing codebase inventory (scan and populate based on your actual codebase)
const existingCodebase = {
  components: {
    'Button': {
      category: 'ui',
      functionality: 'clickable button with various styles and sizes',
      props: ['children', 'onClick', 'variant', 'size', 'disabled'],
      filePath: 'src/components/ui/button.tsx'
    },
    'Input': {
      category: 'ui', 
      functionality: 'text input field with validation and styling',
      props: ['value', 'onChange', 'placeholder', 'error', 'type'],
      filePath: 'src/components/ui/input.tsx'
    },
    'Card': {
      category: 'ui',
      functionality: 'container component with optional header, content, and footer',
      props: ['children', 'title', 'description', 'className'],
      filePath: 'src/components/ui/card.tsx'
    },
    'Dialog': {
      category: 'ui',
      functionality: 'modal dialog for displaying content above main page',
      props: ['open', 'onOpenChange', 'children'],
      filePath: 'src/components/ui/dialog.tsx'
    },
    'Badge': {
      category: 'ui',
      functionality: 'small status or label indicator',
      props: ['children', 'variant', 'className'],
      filePath: 'src/components/ui/badge.tsx'
    }
  },
  services: {
    'SupabaseService': {
      methods: ['getClient', 'auth', 'from'],
      dependencies: [],
      filePath: 'src/integrations/supabase/client.ts'
    },
    'AuthService': {
      methods: ['signIn', 'signUp', 'signOut', 'getUser'],
      dependencies: ['SupabaseService'],
      filePath: 'src/services/authService.ts'
    }
  },
  types: {
    'User': {
      id: 'string',
      email: 'string',
      roles: 'string[]',
      created_at: 'string',
      updated_at: 'string'
    },
    'Database': {
      public: 'object',
      auth: 'object'
    }
  }
};

// Register existing codebase with the framework
const roleManager = frameworkOrchestrator.getRoleManager();
const componentManager = frameworkOrchestrator.getComponentManager();

// Register existing components
for (const [name, component] of Object.entries(existingCodebase.components)) {
  componentManager.registerComponent(name, {
    name,
    version: '1.0.0',
    props: component.props?.reduce((acc, prop) => {
      acc[prop] = { type: 'any', required: false };
      return acc;
    }, {} as Record<string, any>),
    category: component.category,
    functionality: component.functionality,
    backwardsCompatible: true
  });
}

export default {
  // Enhanced AI Configuration with Stability Framework
  ai: {
    systemInstructions: `
You are an expert TypeScript/React developer working with a comprehensive stability framework.

CRITICAL DEVELOPMENT RULES:
1. 🚫 NEVER make breaking changes to existing functionality
2. 🔍 ALWAYS check for existing similar components before creating new ones
3. 🚀 ALWAYS use role-based feature flags for new functionality  
4. 📦 ALWAYS version new features and provide backwards compatibility
5. 🔄 ALWAYS provide migration paths for changes
6. 🛡️ ALWAYS use the FrameworkOrchestrator for validation

EXISTING CODEBASE INVENTORY:
Components: ${Object.keys(existingCodebase.components).join(', ')}
Services: ${Object.keys(existingCodebase.services).join(', ')}
Types: ${Object.keys(existingCodebase.types).join(', ')}

ROLE HIERARCHY (from Supabase enum):
- superAdmin (level 5): Full system access
- onboardingTeam (level 4): Onboarding and user management
- practitioner (level 3): Clinical functionality
- staff (level 2): Standard staff features
- patientCaregiver (level 1): Patient-related features
- guest (level 0): Public/limited access

MANDATORY VALIDATION PROCESS:
1. Use FrameworkOrchestrator.validateDevelopmentChange() before any implementation
2. Check for duplicates using existing component/service registry
3. Implement role-based access using RoleBasedFeatureManager
4. Use SafeComponentManager for component enhancements
5. Ensure Supabase RLS policies align with role requirements

TYPESCRIPT REQUIREMENTS:
- All new code must use TypeScript with proper interfaces
- Leverage existing Database types from src/integrations/supabase/types.ts
- Create proper type definitions for new components/services
- Use generic types where appropriate for reusability

SUPABASE INTEGRATION:
- All new features must consider RLS policies
- Use existing auth.users table structure via profiles table
- Implement proper error handling for database operations
- Consider edge functions for complex business logic

COMPONENT ARCHITECTURE:
- Use shadcn/ui patterns and extend existing components
- Implement proper accessibility (ARIA attributes)
- Follow mobile-first responsive design
- Use Tailwind CSS semantic tokens from design system
- Never use direct colors - always use design system tokens

BEFORE ANY IMPLEMENTATION, YOU MUST:
1. Validate with FrameworkOrchestrator.validateDevelopmentChange()
2. Check component registry for similar functionality
3. Plan role-based access controls
4. Design migration strategy for existing users
5. Consider Supabase RLS policy implications
`,

    promptTemplates: {
      createComponent: `
COMPONENT CREATION WITH STABILITY FRAMEWORK
==========================================

Existing Components: ${Object.keys(existingCodebase.components).join(', ')}

MANDATORY VALIDATION STEPS:
1. ✅ Use FrameworkOrchestrator.validateDevelopmentChange()
2. ✅ Check SafeComponentManager for similar components
3. ✅ Plan role-based access with RoleBasedFeatureManager
4. ✅ Design with shadcn/ui patterns
5. ✅ Use TypeScript interfaces
6. ✅ Implement responsive design with Tailwind semantic tokens

Request: {description}
Target Roles: {roles}

IMPLEMENTATION CHECKLIST:
- [ ] Component extends existing shadcn/ui patterns
- [ ] TypeScript interface defined with proper props
- [ ] Role-based rendering implemented if needed
- [ ] Responsive design with semantic color tokens
- [ ] Accessibility attributes included
- [ ] Error boundaries considered
- [ ] Loading states handled
- [ ] Dark mode compatibility ensured
`,

      enhanceExisting: `
SAFE COMPONENT ENHANCEMENT
=========================

ENHANCEMENT PROTOCOL:
1. ✅ Use SafeComponentManager.validatePropAddition()
2. ✅ Create new component version maintaining backwards compatibility
3. ✅ Implement feature flags for gradual rollout
4. ✅ Update TypeScript interfaces appropriately
5. ✅ Test with existing usage patterns

Target Component: {target}
Enhancement: {description}

SAFETY REQUIREMENTS:
- [ ] Backwards compatibility maintained
- [ ] New props have sensible defaults
- [ ] TypeScript types updated appropriately
- [ ] Feature flag implemented for new functionality
- [ ] Migration documentation provided
- [ ] Rollback strategy planned
`,

      createFeature: `
ROLE-BASED FEATURE IMPLEMENTATION
================================

FEATURE CREATION PROTOCOL:
1. ✅ Use RoleBasedFeatureManager.registerFeature()
2. ✅ Define target roles from Supabase enum
3. ✅ Plan gradual rollout strategy
4. ✅ Implement Supabase RLS policies
5. ✅ Create fallback behavior for unauthorized users

Request: {description}
Target Roles: {roles}
Rollout Strategy: {rollout}

IMPLEMENTATION REQUIREMENTS:
- [ ] Feature registered with RoleBasedFeatureManager
- [ ] Supabase RLS policies created/updated
- [ ] Role-based component rendering
- [ ] Graceful degradation for unauthorized access
- [ ] Edge functions for backend logic if needed
- [ ] Analytics/monitoring for feature usage
- [ ] Documentation for feature access patterns
`,

      databaseChanges: `
DATABASE MODIFICATION WITH RLS
==============================

SUPABASE CHANGE PROTOCOL:
1. ✅ Use lov-supabase-migration for all DB changes
2. ✅ Design RLS policies for role-based access
3. ✅ Consider impact on existing data
4. ✅ Plan migration for existing users
5. ✅ Update TypeScript types accordingly

Request: {description}
Affected Roles: {roles}

RLS POLICY REQUIREMENTS:
- [ ] Policies aligned with role hierarchy
- [ ] Secure defaults implemented
- [ ] Performance considerations addressed
- [ ] Existing data migration planned
- [ ] TypeScript types will be auto-updated
- [ ] Edge functions updated if needed
`
    }
  },

  // Framework Integration Settings
  stability: {
    // Core framework settings
    framework: {
      orchestrator: frameworkOrchestrator,
      enableValidation: true,
      strictMode: true,
      autoRegisterComponents: true
    },

    // Breaking change prevention
    preventBreakingChanges: true,
    requireBackwardsCompatibility: true,
    enforceVersioning: true,

    // Role-based development aligned with Supabase
    enableRoleBasedFeatures: true,
    defaultRoles: ['guest', 'patientCaregiver', 'staff', 'practitioner', 'onboardingTeam', 'superAdmin'],
    roleHierarchy: {
      'guest': 0,
      'patientCaregiver': 1,
      'staff': 2,
      'practitioner': 3,
      'onboardingTeam': 4,
      'superAdmin': 5
    },

    // Feature flag configuration
    featureFlags: {
      enableGradualRollout: true,
      defaultRolloutPercentage: 10,
      allowInstantRollback: true,
      requireApprovalForRollout: true
    },

    // Supabase integration
    supabase: {
      enforceRLS: true,
      autoCreatePolicies: true,
      requireAuth: true,
      defaultPolicyPattern: 'user_owns_record'
    },

    // Component management
    componentManagement: {
      enforceTypeScript: true,
      requireAccessibility: true,
      enforceResponsive: true,
      useDesignTokens: true
    }
  },

  // Enhanced Development Workflow
  workflow: {
    // Pre-development validation
    preDevelopment: [
      "Validate with FrameworkOrchestrator",
      "Check for component duplicates", 
      "Plan role-based access",
      "Design Supabase RLS policies",
      "Plan TypeScript interfaces"
    ],

    // Code review requirements
    codeReview: [
      "Verify framework compliance",
      "Check backwards compatibility",
      "Validate role-based access",
      "Review RLS policy security",
      "Ensure TypeScript type safety"
    ],

    // Deployment pipeline
    deployment: [
      "Run framework health check",
      "Test role-based access",
      "Deploy with feature flags",
      "Monitor rollout metrics",
      "Validate RLS policies"
    ]
  },

  // TypeScript File Templates
  templates: {
    component: {
      path: "src/components/{category}/{name}.tsx",
      template: `import React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export interface {name}Props {
  className?: string;
  children?: React.ReactNode;
  // Add specific props here
}

export const {name} = React.forwardRef<HTMLDivElement, {name}Props>(
  ({ className, children, ...props }, ref) => {
    const { user } = useAuth();
    
    // Role-based feature access if needed
    // const hasFeature = useFeatureFlag('{name.toLowerCase()}-enhanced', user);
    
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles using design system tokens
          "/* Add base classes here */",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

{name}.displayName = "{name}";

export default {name};`
    },

    service: {
      path: "src/services/{name}.ts",
      template: `import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface {name}Interface {
  // Define service methods here
}

export class {name} implements {name}Interface {
  constructor(private client = supabase) {}

  // Implement service methods with proper error handling
  // Include RLS-aware queries
  // Add role-based authorization checks
  
  private async handleError(error: any, method: string): Promise<never> {
    console.error(\`Error in {name}.\${method}:\`, error);
    throw new Error(\`{name} operation failed: \${error.message}\`);
  }
}

export const {name.toLowerCase()} = new {name}();
export default {name.toLowerCase()};`
    },

    hook: {
      path: "src/hooks/use{name}.ts",
      template: `import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Use{name}Options {
  enabled?: boolean;
  // Add specific options
}

export const use{name} = (options: Use{name}Options = {}) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!options.enabled || !user) return;
    
    // Implement hook logic with Supabase integration
    // Include role-based data access
    // Handle real-time subscriptions if needed
    
  }, [user, options.enabled]);

  return {
    data,
    loading,
    error,
    // Add specific return values
  };
};

export default use{name};`
    },

    edgeFunction: {
      path: "supabase/functions/{name}/index.ts",
      template: `import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: user } = await supabaseClient.auth.getUser(token);

    if (!user.user) {
      throw new Error('Unauthorized');
    }

    // Implement edge function logic with role-based access
    // Include proper error handling
    // Return appropriate responses

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});`
    }
  },

  // Framework Configuration
  framework: {
    // Component categories aligned with your project
    componentCategories: {
      'ui': {
        description: 'shadcn/ui components and variants',
        examples: ['Button', 'Input', 'Card', 'Dialog'],
        path: 'src/components/ui/'
      },
      'features': {
        description: 'Feature-specific components',
        examples: ['UserProfile', 'PatientCard', 'OnboardingFlow'],
        path: 'src/components/features/'
      },
      'layout': {
        description: 'Layout and navigation components',
        examples: ['Header', 'Sidebar', 'Navigation'],
        path: 'src/components/layout/'
      }
    },

    // Similarity thresholds for duplicate detection
    similarity: {
      component: {
        functionality: 0.8,
        props: 0.7,
        category: 1.0
      },
      service: {
        methods: 0.7,
        dependencies: 0.6
      }
    },

    // Code quality requirements
    quality: {
      enforceTypeScript: true,
      requireTests: false, // Set to true when you add testing
      requireDocumentation: true,
      enforceAccessibility: true
    }
  }
};`