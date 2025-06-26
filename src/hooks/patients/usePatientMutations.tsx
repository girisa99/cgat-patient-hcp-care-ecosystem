
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Focused hook for patient mutation operations
 */
export const usePatientMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deactivatePatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      console.log('🔄 Deactivating patient with audit logging:', patientId);
      
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
        throw new Error(`Failed to log patient deactivation: ${error.message}`);
      }

      return { success: true, patientId };
    },
    onSuccess: (data) => {
      // Invalidate both patients and users cache
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: "Patient Deactivated",
        description: "Patient has been deactivated successfully.",
      });
    },
    onError: (error: any) => {
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
