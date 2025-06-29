import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useModules } from '@/hooks/useModules';
import { supabase } from '@/integrations/supabase/client';

interface UserPreferences {
  defaultModule?: string;
  lastActiveModule?: string;
  preferredDashboard?: 'unified' | 'module-specific';
  autoRoute?: boolean;
}

interface ModuleProgress {
  moduleId: string;
  lastPath: string;
  formData?: any;
  timestamp: string;
}

export const useIntelligentRouting = () => {
  const { user, userRoles, loading: authLoading } = useAuthContext();
  const { userModules, hasModuleAccess, isLoadingUserModules } = useModules();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({});
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [isRouting, setIsRouting] = useState(false);

  // Load user preferences and progress from localStorage/database
  useEffect(() => {
    if (user && !authLoading) {
      loadUserPreferences();
      loadModuleProgress();
    }
  }, [user, authLoading]);

  const loadUserPreferences = useCallback(async () => {
    if (!user) return;

    try {
      // First try to load from database (future enhancement)
      // For now, use localStorage
      const saved = localStorage.getItem(`user-preferences-${user.id}`);
      if (saved) {
        setUserPreferences(JSON.parse(saved));
      } else {
        // Set smart defaults based on user roles
        const defaultPrefs = getSmartDefaults();
        setUserPreferences(defaultPrefs);
        localStorage.setItem(`user-preferences-${user.id}`, JSON.stringify(defaultPrefs));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }, [user, userRoles]);

  const loadModuleProgress = useCallback(() => {
    if (!user) return;

    try {
      const saved = localStorage.getItem(`module-progress-${user.id}`);
      if (saved) {
        setModuleProgress(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading module progress:', error);
    }
  }, [user]);

  const getSmartDefaults = useCallback((): UserPreferences => {
    // Super admins get unified dashboard by default
    if (userRoles.includes('superAdmin')) {
      return {
        preferredDashboard: 'unified',
        autoRoute: true,
        defaultModule: 'dashboard'
      };
    }

    // Determine best default module based on role
    let defaultModule = 'dashboard';
    if (userRoles.includes('onboardingTeam')) {
      defaultModule = 'onboarding';
    } else if (userRoles.includes('healthcareProvider') || userRoles.includes('nurse')) {
      defaultModule = 'patients';
    } else if (userRoles.includes('caseManager')) {
      defaultModule = 'facilities';
    }

    return {
      preferredDashboard: 'module-specific',
      autoRoute: true,
      defaultModule
    };
  }, [userRoles]);

  // Save user preferences
  const updateUserPreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
    if (!user) return;

    const updated = { ...userPreferences, ...newPrefs };
    setUserPreferences(updated);
    
    try {
      localStorage.setItem(`user-preferences-${user.id}`, JSON.stringify(updated));
      // Future: Save to database
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }, [user, userPreferences]);

  // Track module progress
  const updateModuleProgress = useCallback((moduleId: string, path: string, formData?: any) => {
    if (!user) return;

    const progress: ModuleProgress = {
      moduleId,
      lastPath: path,
      formData,
      timestamp: new Date().toISOString()
    };

    const updated = moduleProgress.filter(p => p.moduleId !== moduleId);
    updated.push(progress);
    
    // Keep only the 10 most recent
    const sorted = updated.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);

    setModuleProgress(sorted);
    
    try {
      localStorage.setItem(`module-progress-${user.id}`, JSON.stringify(sorted));
    } catch (error) {
      console.error('Error saving module progress:', error);
    }
  }, [user, moduleProgress]);

  // Get the best route for user
  const getBestRoute = useCallback((): string => {
    if (!user || authLoading || isLoadingUserModules) return '/';

    // Super admins always go to unified dashboard unless they have a preference
    if (userRoles.includes('superAdmin')) {
      if (userPreferences.lastActiveModule && hasModuleAccess(userPreferences.lastActiveModule)) {
        return `/${userPreferences.lastActiveModule}`;
      }
      return '/dashboard';
    }

    // Check for last active module with progress
    if (userPreferences.lastActiveModule) {
      const progress = moduleProgress.find(p => p.moduleId === userPreferences.lastActiveModule);
      if (progress && hasModuleAccess(progress.moduleId)) {
        return progress.lastPath || `/${progress.moduleId}`;
      }
    }

    // Use default module if accessible
    if (userPreferences.defaultModule && hasModuleAccess(userPreferences.defaultModule)) {
      return `/${userPreferences.defaultModule}`;
    }

    // Fallback: Route to first accessible module
    const accessibleModules = userModules?.map(m => m.module_name.toLowerCase()) || [];
    if (accessibleModules.length > 0) {
      return `/${accessibleModules[0]}`;
    }

    // Final fallback
    return '/dashboard';
  }, [user, authLoading, isLoadingUserModules, userRoles, userPreferences, moduleProgress, userModules, hasModuleAccess]);

  // Perform intelligent routing
  const performIntelligentRouting = useCallback(async () => {
    if (!user || authLoading || isLoadingUserModules || !userPreferences.autoRoute) {
      return;
    }

    // Don't route if user is already on a specific page (not root)
    if (location.pathname !== '/' && location.pathname !== '/dashboard') {
      return;
    }

    setIsRouting(true);
    
    try {
      const bestRoute = getBestRoute();
      console.log('🧭 Intelligent routing to:', bestRoute);
      
      if (bestRoute !== location.pathname) {
        navigate(bestRoute, { replace: true });
      }
    } catch (error) {
      console.error('Error during intelligent routing:', error);
      navigate('/dashboard', { replace: true });
    } finally {
      setIsRouting(false);
    }
  }, [user, authLoading, isLoadingUserModules, userPreferences.autoRoute, location.pathname, getBestRoute, navigate]);

  // Auto-route on app load
  useEffect(() => {
    if (!authLoading && !isLoadingUserModules && user && userPreferences.autoRoute) {
      performIntelligentRouting();
    }
  }, [authLoading, isLoadingUserModules, user, userPreferences.autoRoute, performIntelligentRouting]);

  // Update last active module when navigating
  useEffect(() => {
    if (user && location.pathname !== '/') {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const currentModule = pathSegments[0];
        if (currentModule !== userPreferences.lastActiveModule) {
          updateUserPreferences({ lastActiveModule: currentModule });
        }
        updateModuleProgress(currentModule, location.pathname);
      }
    }
  }, [location.pathname, user, userPreferences.lastActiveModule, updateUserPreferences, updateModuleProgress]);

  return {
    userPreferences,
    moduleProgress,
    isRouting,
    updateUserPreferences,
    updateModuleProgress,
    performIntelligentRouting,
    getBestRoute,
    // Utility functions
    canAccessUnifiedDashboard: userRoles.includes('superAdmin'),
    hasMultipleModules: (userModules?.length || 0) > 1,
    getAccessibleModules: () => userModules?.map(m => m.module_name) || []
  };
};
