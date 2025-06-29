
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserDeactivation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deactivateUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      console.log('🔄 Deactivating user via edge function:', userId, 'Reason:', reason);
      
      try {
        // Use the manage-user-profiles edge function to handle deactivation
        const { data, error } = await supabase.functions.invoke('manage-user-profiles', {
          body: {
            action: 'deactivate',
            user_id: userId,
            deactivation_reason: reason
          }
        });

        if (error) {
          console.error('❌ Error from deactivation edge function:', error);
          throw new Error(`Deactivation failed: ${error.message}`);
        }

        if (!data.success) {
          console.error('❌ Deactivation failed:', data.error);
          throw new Error(data.error || 'Deactivation failed');
        }

        console.log('✅ User deactivated successfully via edge function');
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
