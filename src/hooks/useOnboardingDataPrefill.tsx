/**
 * Hook for prepopulating enrollment forms with existing onboarding data
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';

export interface PrefillData {
  treatmentCenters: Array<{
    id: string;
    name: string;
    npi?: string;
    phone?: string;
    email?: string;
    address?: string;
  }>;
  providers: Array<{
    id: string;
    name: string;
    email?: string;
  }>;
  patients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  }>;
}

export const useOnboardingDataPrefill = () => {
  const { user } = useMasterAuth();

  const { data: treatmentCenters = [], isLoading: loadingTreatmentCenters } = useQuery({
    queryKey: ['prefill-treatment-centers'],
    queryFn: async () => {
      // Try primary source: facilities (approved treatment centers)
      const { data: facilities, error: facilitiesError } = await supabase
        .from('facilities')
        .select('id, name, npi_number, email')
        .order('name', { ascending: true })
        .limit(50);

      if (!facilitiesError && facilities && facilities.length > 0) {
        return facilities.map((f: any) => ({
          id: f.id,
          name: f.name || `Facility ${String(f.id).slice(0,8)}`,
          npi: f.npi_number || '',
          phone: '',
          email: f.email || '',
          address: ''
        }));
      }

      // Fallback: treatment_center_onboarding (approved)
      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .select('id, legal_business_name, npi_number, email')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('No treatment center data found:', error);
        return [];
      }

      return (data || []).map((center: any) => ({
        id: center.id,
        name: center.legal_business_name || `Treatment Center ${String(center.id).slice(0,8)}`,
        npi: center.npi_number || '',
        phone: '',
        email: center.email || '',
        address: ''
      }));
    },
    enabled: !!user
  });

  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ['prefill-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .order('first_name')
        .limit(10);

      if (error) {
        console.warn('No provider data found:', error);
        return [];
      }

      return (data || []).map(provider => ({
        id: provider.id,
        name: `${provider.first_name || ''} ${provider.last_name || ''}`.trim(),
        email: provider.email || ''
      }));
    },
    enabled: !!user
  });

  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ['prefill-patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .order('first_name')
        .limit(10);

      if (error) {
        console.warn('No patient data found:', error);
        return [];
      }

      return (data || []).map(patient => ({
        id: patient.id,
        firstName: patient.first_name || '',
        lastName: patient.last_name || '',
        email: patient.email || ''
      }));
    },
    enabled: !!user
  });

  const getUserProfileData = async (userId?: string) => {
    if (!userId && !user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', userId || user.id)
        .single();

      if (error) return null;

      return {
        id: data.id,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        email: data.email || '',
        phone: '',
        roles: []
      };
    } catch (error) {
      return null;
    }
  };

  return {
    prefillData: {
      treatmentCenters,
      providers,
      patients
    },
    isLoading: loadingTreatmentCenters || loadingProviders || loadingPatients,
    getUserProfileData
  };
};