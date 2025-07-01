
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useSimpleRouting } from './useSimpleRouting';
import { useModules } from './useModules';
import { useUserSettings } from './useUserSettings';
import { useMemo } from 'react';

export const useIntelligentRouting = () => {
  const { userRoles, isAuthenticated, isLoading } = useAuthContext();
  const { performRouting, getDefaultRoute } = useSimpleRouting({ 
    userRoles, 
    isAuthenticated 
  });
  const { userModules } = useModules();
  const { userPreferences, updatePreferences } = useUserSettings();

  // Mock module progress data
  const moduleProgress = useMemo(() => [
    {
      moduleId: 'users',
      lastPath: '/users',
      timestamp: new Date().toISOString(),
      visitCount: 5
    },
    {
      moduleId: 'patients',
      lastPath: '/patients',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      visitCount: 3
    },
    {
      moduleId: 'facilities',
      lastPath: '/facilities',
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      visitCount: 2
    }
  ], []);

  const getAccessibleModules = useMemo(() => {
    return () => {
      return userModules || [];
    };
  }, [userModules]);

  const canAccessUnifiedDashboard = useMemo(() => {
    return userRoles.includes('superAdmin') || userRoles.includes('onboardingTeam');
  }, [userRoles]);

  const hasMultipleModules = useMemo(() => {
    return (userModules?.length || 0) > 1;
  }, [userModules]);

  const updateUserPreferences = (preferences: any) => {
    updatePreferences(preferences);
  };

  return {
    performRouting,
    getDefaultRoute,
    isLoading,
    userPreferences,
    updateUserPreferences,
    canAccessUnifiedDashboard,
    hasMultipleModules,
    getAccessibleModules,
    moduleProgress
  };
};
