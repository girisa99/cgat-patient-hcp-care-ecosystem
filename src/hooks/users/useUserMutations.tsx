
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  department?: string;
  role: UserRole;
  facility_id?: string;
}

interface AssignRoleData {
  userId: string;
  roleName: UserRole;
}

interface AssignFacilityData {
  userId: string;
  facilityId: string;
  accessLevel?: 'read' | 'write' | 'admin';
}

/**
 * Focused hook for user mutation operations
 */
export const useUserMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      console.log('🔄 Creating new user:', userData);
      
      const { data, error } = await supabase.functions.invoke('onboarding-workflow', {
        body: {
          action: 'complete_user_setup',
          user_data: userData
        }
      });

      if (error) {
        console.error('❌ Error creating user:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: AssignRoleData) => {
      console.log('🔄 Assigning role:', roleName, 'to user:', userId);
      
      // Get role ID
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (roleError || !role) {
        throw new Error(`Role '${roleName}' not found`);
      }

      // Check if user already has this role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', role.id)
        .maybeSingle();

      if (existingRole) {
        return { success: true };
      }

      // Assign the role
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: role.id
        });

      if (assignError) {
        throw new Error(assignError.message);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Role Assigned",
        description: "User role has been updated successfully.",
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
    mutationFn: async ({ userId, facilityId, accessLevel = 'read' }: AssignFacilityData) => {
      console.log('🔄 Assigning facility access:', { userId, facilityId, accessLevel });
      
      // Check existing access
      const { data: existingAccess } = await supabase
        .from('user_facility_access')
        .select('id')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .eq('is_active', true)
        .single();

      if (existingAccess) {
        // Update existing access
        const { error: updateError } = await supabase
          .from('user_facility_access')
          .update({ access_level: accessLevel })
          .eq('id', existingAccess.id);

        if (updateError) throw updateError;
      } else {
        // Create new access
        const { error: insertError } = await supabase
          .from('user_facility_access')
          .insert({
            user_id: userId,
            facility_id: facilityId,
            access_level: accessLevel,
            is_active: true
          });

        if (insertError) throw insertError;
      }

      // Update primary facility
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ facility_id: facilityId })
        .eq('id', userId);

      if (profileUpdateError) {
        console.warn('⚠️ Could not update primary facility:', profileUpdateError);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Facility Access Granted",
        description: "User has been granted facility access successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign facility access",
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
