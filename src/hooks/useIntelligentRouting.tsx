
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { supabase } from '@/integrations/supabase/client';

type UserRole = Database['public']['Enums']['user_role'];

interface ModuleProgress {
  moduleId: string;
  lastPath: string;
  timestamp: string;
}

export const useIntelligentRouting = () => {
  const navigate = useNavigate();
  const { user, userRoles, loading, profile } = useAuthContext();
  const [hasAutoRoute, setHasAutoRoute] = useState(false);
  const [preferredDashboard, setPreferredDashboard] = useState<'unified' | 'module-specific'>('unified');
  const [defaultModule, setDefaultModule] = useState<string | null>(null);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [userPreferences, setUserPreferences] = useState<any>(null);

  useEffect(() => {
    if (!loading && user) {
      // Fetch user preferences from the 'user_preferences' table
      const fetchPreferences = async () => {
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('auto_route, preferred_dashboard, default_module')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user preferences:', error);
            return;
          }

          if (data) {
            setHasAutoRoute(data.auto_route || false);
            // Ensure we only set valid dashboard preferences
            const dashboardPref = data.preferred_dashboard === 'module-specific' ? 'module-specific' : 'unified';
            setPreferredDashboard(dashboardPref);
            setDefaultModule(data.default_module || null);
            setUserPreferences(data);
          }
        } catch (error) {
          console.error('Unexpected error fetching user preferences:', error);
        }
      };

      fetchPreferences();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user && hasAutoRoute) {
      // Determine the route based on user roles and preferences
      let route = '/dashboard';

      if (preferredDashboard === 'module-specific' && defaultModule) {
        route = `/modules/${defaultModule}`;
      } else if (userRoles.includes('superAdmin')) {
        route = '/admin';
      } else if (userRoles.includes('healthcareProvider')) {
        route = '/healthcare-provider';
      } else if (userRoles.includes('nurse')) {
        route = '/nurse';
      } else if (userRoles.includes('caseManager')) {
        route = '/case-manager';
      } else if (userRoles.includes('onboardingTeam')) {
        route = '/onboarding';
      } else if (userRoles.includes('patientCaregiver')) {
        route = '/patient-caregiver';
      }

      console.log(`➡️ Auto-routing user to: ${route}`);
      navigate(route, { replace: true });
    }
  }, [user, userRoles, loading, navigate, hasAutoRoute, preferredDashboard, defaultModule]);

  const updateUserPreferences = async (updates: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setUserPreferences(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  };

  const getAccessibleModules = () => {
    // Mock data for now - replace with actual module access logic
    return [
      { id: '1', moduleName: 'Users', module_id: '1', module_name: 'Users' },
      { id: '2', moduleName: 'Facilities', module_id: '2', module_name: 'Facilities' },
      { id: '3', moduleName: 'Modules', module_id: '3', module_name: 'Modules' }
    ];
  };

  return {
    userPreferences,
    updateUserPreferences,
    canAccessUnifiedDashboard: true,
    hasMultipleModules: true,
    getAccessibleModules,
    moduleProgress
  };
};
