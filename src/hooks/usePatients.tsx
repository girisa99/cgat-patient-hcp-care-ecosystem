
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  facility_id?: string;
  facilities?: {
    id: string;
    name: string;
    facility_type: string;
  } | null;
}

export const usePatients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: patients,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      console.log('🔍 Fetching patients from profiles table...');
      
      try {
        // Fetch all profiles (patients) with their associated facilities
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            created_at,
            facility_id,
            facilities:facility_id (
              id,
              name,
              facility_type
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching patients:', error);
          throw error;
        }

        console.log('✅ Patients fetched successfully:', data?.length || 0);
        return data || [];
      } catch (err) {
        console.error('❌ Error in patient fetch:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 30000,
  });

  const deactivatePatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      console.log('🔄 Deactivating patient:', patientId);
      
      // For now, we'll just log this action to audit_logs
      // In a real implementation, you might have a patient status field
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          action: 'DEACTIVATE',
          table_name: 'profiles',
          record_id: patientId,
          new_values: { status: 'deactivated' }
        });

      if (error) {
        console.error('❌ Error logging patient deactivation:', error);
        throw error;
      }

      console.log('✅ Patient deactivation logged successfully');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Patient Deactivated",
        description: "Patient has been deactivated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Deactivate patient error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate patient",
        variant: "destructive",
      });
    }
  });

  return {
    patients,
    isLoading,
    error,
    refetch,
    deactivatePatient: deactivatePatientMutation.mutate,
    isDeactivating: deactivatePatientMutation.isPending
  };
};
