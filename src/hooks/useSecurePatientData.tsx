
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';

interface PatientData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  department: string | null;
  facility_id: string | null;
  avatar_url: string | null;
  is_email_verified: boolean | null;
  has_mfa_enabled: boolean | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export const useSecurePatientData = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, userRoles } = useAuthContext();

  const fetchPatients = async () => {
    if (!user) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if user has appropriate role
      const canAccessPatients = userRoles.some(role => 
        ['superAdmin', 'healthcareProvider', 'nurse', 'caseManager'].includes(role)
      );

      if (!canAccessPatients) {
        setError('Insufficient permissions to access patient data');
        setLoading(false);
        return;
      }

      console.log('🔒 Fetching secure patient data for user:', user.id);
      
      // Query profiles table instead of patient_profiles
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Error fetching patient data:', fetchError);
        setError(fetchError.message);
        toast({
          title: "Error",
          description: "Failed to fetch patient data",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Successfully fetched patient data:', data?.length || 0, 'patients');
      setPatients(data || []);
      
    } catch (err: any) {
      console.error('❌ Exception fetching patients:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching patient data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user, userRoles]);

  const refetch = () => {
    fetchPatients();
  };

  return {
    patients,
    loading,
    error,
    refetch
  };
};
