
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export const useUserMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
      department?: string;
      role: UserRole;
      facility_id?: string;
    }) => {
      console.log('🔄 Creating new user:', userData);
      
      try {
        const { data, error } = await supabase.functions.invoke('onboarding-workflow', {
          body: {
            action: 'complete_user_setup',
            user_data: userData
          }
        });

        if (error) {
          console.error('❌ Error creating user via edge function:', error);
          throw error;
        }

        console.log('✅ User created successfully:', data);
        return data;
      } catch (err) {
        console.error('❌ User creation failed:', err);
        throw new Error(`User creation failed: ${err.message}`);
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating users cache after creation...');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['unified-users'] });
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Create user error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Assigning role:', roleName, 'to user:', userId);
      
      const { data, error } = await supabase.functions.invoke('onboarding-workflow', {
        body: {
          action: 'assign_role',
          user_id: userId,
          role_name: roleName
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['unified-users'] });
      toast({
        title: "Role Assigned",
        description: "Role has been assigned successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    }
  });

  const assignFacilityMutation = useMutation({
    mutationFn: async ({ userId, facilityId }: { userId: string; facilityId: string }) => {
      console.log('🔄 Assigning facility:', facilityId, 'to user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ facility_id: facilityId })
        .eq('id', userId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['unified-users'] });
      toast({
        title: "Facility Assigned",
        description: "Facility has been assigned successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign facility",
        variant: "destructive",
      });
    }
  });

  return {
    createUser: createUserMutation.mutate,
    assignRole: assignRoleMutation.mutate,
    assignFacility: assignFacilityMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    isAssigningFacility: assignFacilityMutation.isPending
  };
};
