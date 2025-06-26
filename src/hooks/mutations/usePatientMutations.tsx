
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createUserQueryKey } from '@/utils/userDataHelpers';

export const usePatientMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deactivatePatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      console.log('🔄 Deactivating patient with proper audit logging:', patientId);
      
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          action: 'PATIENT_DEACTIVATED',
          table_name: 'auth.users',
          record_id: patientId,
          new_values: { 
            status: 'deactivated',
            deactivated_at: new Date().toISOString(),
            reason: 'Manual deactivation via admin interface'
          }
        });

      if (error) {
        console.error('❌ Error logging patient deactivation:', error);
        throw new Error(`Failed to log patient deactivation: ${error.message}`);
      }

      console.log('✅ Patient deactivation logged successfully');
      return { success: true, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: createUserQueryKey('all') });
      
      toast({
        title: "Patient Deactivated",
        description: `Patient has been deactivated successfully.`,
      });
      
      console.log('✅ Patient deactivation completed:', data.patientId);
    },
    onError: (error: any) => {
      console.error('❌ Patient deactivation failed:', error);
      toast({
        title: "Deactivation Failed",
        description: error.message || "Failed to deactivate patient. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    deactivatePatient: deactivatePatientMutation.mutate,
    isDeactivating: deactivatePatientMutation.isPending
  };
};
