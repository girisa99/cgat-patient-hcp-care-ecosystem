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
      const { data, error } = await supabase
        .from('treatment_center_onboarding')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('No treatment center data found:', error);
        return [];
      }

      return (data || []).map(center => ({
        id: center.id,
        name: `Treatment Center ${center.id.substring(0, 8)}`,
        npi: '',
        phone: '',
        email: '',
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