import { useState, useEffect } from 'react';
import { useMasterAuth } from './useMasterAuth';
import { supabase } from '@/integrations/supabase/client';

// Define basic patient data structure
interface PatientData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export const useSecurePatientData = () => {
  const { user, userRoles, isAuthenticated } = useMasterAuth();
  const [patientData, setPatientData] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Determine access level based on user roles
  const hasPatientAccess = isAuthenticated && (
    userRoles.includes('superAdmin') ||
    userRoles.includes('patientCaregiver') ||
    userRoles.includes('onboardingTeam')
  );

  const accessLevel = userRoles.includes('superAdmin') ? 'FULL' :
                     userRoles.includes('patientCaregiver') ? 'LIMITED' :
                     userRoles.includes('onboardingTeam') ? 'ADMINISTRATIVE' :
                     'NONE';

  const canViewAll = userRoles.includes('superAdmin');
  const canEdit = userRoles.includes('superAdmin') || userRoles.includes('patientCaregiver');
  const canDelete = userRoles.includes('superAdmin');

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!hasPatientAccess) {
        setPatientData([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone, created_at');

        if (userRoles.includes('patientCaregiver')) {
          // A patient can only see their own profile
          query = query.eq('id', user?.id as string);
        }

        // If we want to restrict onboardingTeam to only active patients, add filters
        const { data, error } = await query;
        if (error) throw error;

        // Keep only profiles that include the patientCaregiver role
        const filtered = (data as any[]).filter((p) => {
          const roles = p.user_roles || [];
          return roles.some((r: any) => r.roles?.name === 'patientCaregiver');
        });
        setPatientData(filtered as PatientData[]);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPatientAccess, accessLevel, user?.id]);

  return {
    patientData,
    isLoading,
    error,
    hasPatientAccess,
    accessLevel,
    canViewAll,
    canEdit,
    canDelete,
  };
};
