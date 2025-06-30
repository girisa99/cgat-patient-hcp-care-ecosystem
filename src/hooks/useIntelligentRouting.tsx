import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';

type UserRole = Database['public']['Enums']['user_role'];

export const useIntelligentRouting = () => {
  const navigate = useNavigate();
  const { user, userRoles, loading, profile } = useAuthContext();
  const [hasAutoRoute, setHasAutoRoute] = useState(false);
  const [preferredDashboard, setPreferredDashboard] = useState<'unified' | 'module-specific'>('unified');
  const [defaultModule, setDefaultModule] = useState<string | null>(null);

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
            setPreferredDashboard(data.preferred_dashboard || 'unified');
            setDefaultModule(data.default_module || null);
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

  return {};
};
