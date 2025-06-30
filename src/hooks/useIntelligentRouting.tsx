
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useUserSettings } from '@/hooks/useUserSettings';

interface ModuleProgress {
  moduleId: string;
  visitCount: number;
  lastPath: string;
  timestamp: string;
}

export const useIntelligentRouting = () => {
  const navigate = useNavigate();
  const { userRoles, profile, user } = useAuthContext();
  const { userPreferences, updatePreferences } = useUserSettings();
  const [isRouting, setIsRouting] = useState(false);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);

  const getAccessibleModules = useCallback(() => {
    const modules = [
      { id: 'dashboard', path: '/dashboard', requiredRoles: [] },
      { id: 'users', path: '/users', requiredRoles: ['superAdmin'] },
      { id: 'patients', path: '/patients', requiredRoles: ['superAdmin', 'healthcareProvider', 'nurse'] },
      { id: 'facilities', path: '/facilities', requiredRoles: ['superAdmin', 'healthcareProvider'] },
      { id: 'modules', path: '/modules', requiredRoles: ['superAdmin'] },
      { id: 'onboarding', path: '/onboarding', requiredRoles: ['onboardingTeam', 'superAdmin'] },
      { id: 'settings', path: '/settings', requiredRoles: [] },
    ];

    return modules.filter(module => 
      module.requiredRoles.length === 0 || 
      module.requiredRoles.some(role => userRoles.includes(role as any))
    );
  }, [userRoles]);

  const canAccessUnifiedDashboard = userRoles.includes('superAdmin');
  const hasMultipleModules = getAccessibleModules().length > 1;

  const updateUserPreferences = (updates: any) => {
    updatePreferences(updates);
  };

  const performIntelligentRouting = useCallback(async () => {
    setIsRouting(true);
    
    try {
      console.log('🚀 Performing intelligent routing...');
      console.log('User roles:', userRoles);
      console.log('User email:', user?.email);
      console.log('User preferences:', userPreferences);

      // Get accessible modules
      const accessibleModules = getAccessibleModules();
      console.log('Accessible modules:', accessibleModules.map(m => m.id));

      // Check user preferences first
      if (userPreferences?.auto_route && userPreferences?.default_module) {
        const preferredModule = accessibleModules.find(
          module => module.id === userPreferences.default_module
        );
        
        if (preferredModule) {
          console.log('✅ Routing to preferred module:', preferredModule.path);
          navigate(preferredModule.path, { replace: true });
          return;
        }
      }

      // Role-based routing logic with proper onboarding team handling
      if (userRoles.includes('superAdmin')) {
        console.log('✅ Super admin detected, routing to dashboard');
        navigate('/dashboard', { replace: true });
      } else if (userRoles.includes('onboardingTeam')) {
        console.log('✅ Onboarding team detected, routing to onboarding');
        navigate('/onboarding', { replace: true });
      } else if (userRoles.includes('healthcareProvider') || userRoles.includes('nurse')) {
        console.log('✅ Healthcare provider/nurse detected, routing to patients');
        navigate('/patients', { replace: true });
      } else if (userRoles.includes('caseManager')) {
        console.log('✅ Case manager detected, routing to patients');
        navigate('/patients', { replace: true });
      } else {
        console.log('✅ Default routing to dashboard');
        navigate('/dashboard', { replace: true });
      }

    } catch (error) {
      console.error('❌ Error in intelligent routing:', error);
      // Always fallback to dashboard on error
      navigate('/dashboard', { replace: true });
    } finally {
      setIsRouting(false);
    }
  }, [navigate, userRoles, userPreferences, getAccessibleModules, user]);

  return {
    performIntelligentRouting,
    isRouting,
    moduleProgress,
    getAccessibleModules,
    userPreferences,
    updateUserPreferences,
    canAccessUnifiedDashboard,
    hasMultipleModules,
  };
};
