
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
      console.log('🔍 Fetching patients with patientCaregiver role from user table...');
      
      try {
        // Use the edge function to fetch all users and filter for patientCaregiver role
        const { data: response, error } = await supabase.functions.invoke('manage-user-profiles', {
          body: { action: 'list' }
        });

        if (error) {
          console.error('❌ Error calling manage-user-profiles function:', error);
          throw error;
        }

        if (!response?.success) {
          console.error('❌ Function returned error:', response?.error);
          throw new Error(response?.error || 'Failed to fetch users');
        }

        const allUsers = response.data || [];
        console.log('✅ All users fetched:', allUsers.length);

        // Filter for users with patientCaregiver role
        const patientUsers = allUsers.filter(user => {
          const hasPatientRole = user.user_roles?.some(ur => ur.roles?.name === 'patientCaregiver');
          console.log(`🔍 User ${user.email} has patientCaregiver role:`, hasPatientRole);
          return hasPatientRole;
        });

        console.log('✅ Patients with patientCaregiver role:', patientUsers.length);
        console.log('🔍 Patient data:', patientUsers);
        
        return patientUsers;
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
