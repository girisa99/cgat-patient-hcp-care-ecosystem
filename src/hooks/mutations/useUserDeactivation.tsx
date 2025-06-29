
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserDeactivation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deactivateUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      console.log('🔄 Deactivating user:', userId, 'Reason:', reason);
      
      try {
        // First, delete the user from auth.users (this cascades to related tables)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
        
        if (deleteError) {
          console.error('❌ Error deleting user from auth:', deleteError);
          throw new Error(`Failed to deactivate user: ${deleteError.message}`);
        }

        // Log the deactivation action to audit_logs
        const { error: auditError } = await supabase
          .from('audit_logs')
          .insert({
            user_id: userId,
            action: 'PATIENT_DEACTIVATED',
            table_name: 'auth.users',
            record_id: userId,
            old_values: null,
            new_values: {
              deactivation_reason: reason,
              deactivated_at: new Date().toISOString(),
              deactivated_by: (await supabase.auth.getUser()).data.user?.id
            }
          });

        if (auditError) {
          console.warn('⚠️ Audit log insertion failed, but user was deactivated:', auditError);
          // Don't throw error here as the main action succeeded
        }

        console.log('✅ User deactivated successfully');
        return { success: true };
        
      } catch (error: any) {
        console.error('❌ User deactivation failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating users cache after deactivation...');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User Deactivated",
        description: "User account has been deactivated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Deactivate user error:', error);
      toast({
        title: "Deactivation Failed",
        description: error.message || "Failed to deactivate user account",
        variant: "destructive",
      });
    }
  });

  return {
    deactivateUser: deactivateUserMutation.mutate,
    isDeactivating: deactivateUserMutation.isPending
  };
};
