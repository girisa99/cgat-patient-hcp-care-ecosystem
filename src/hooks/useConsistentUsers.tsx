
/**
 * Consistent Users Hook
 * 
 * This hook replaces the existing useUsers hook and ensures
 * all user data operations use the unified data source.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedUserData } from './useUnifiedUserData';
import { createUserQueryKey, USER_ERROR_MESSAGES } from '@/utils/userDataHelpers';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export const useConsistentUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { allUsers: users, isLoading, error, refetch, meta } = useUnifiedUserData();

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
        throw new Error(`${USER_ERROR_MESSAGES.EDGE_FUNCTION_ERROR}: ${err.message}`);
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating users cache after creation...');
      queryClient.invalidateQueries({ queryKey: createUserQueryKey('all') });
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
      console.log('🔄 Assigning role via database operations:', roleName, 'to user:', userId);
      
      try {
        // Get the role ID from the roles table
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', roleName)
          .single();

        if (roleError || !role) {
          console.error('❌ Role not found:', roleName, roleError);
          throw new Error(`Role '${roleName}' not found`);
        }

        // Check if user already has this role
        const { data: existingRole, error: checkError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .eq('role_id', role.id)
          .maybeSingle();

        if (checkError) {
          console.error('❌ Error checking existing role:', checkError);
          throw new Error('Error checking existing role assignment');
        }

        if (existingRole) {
          console.log('ℹ️ User already has this role assigned');
          return { success: true };
        }

        // Assign the role to the user
        const { data: insertData, error: assignError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: role.id
          })
          .select();

        if (assignError) {
          console.error('❌ Error assigning role:', assignError);
          throw new Error(assignError.message);
        }

        console.log('✅ Role assignment successful! Insert result:', insertData);
        return { success: true };
      } catch (err) {
        console.error('💥 Exception in role assignment:', err);
        throw err;
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating users cache after role assignment...');
      queryClient.invalidateQueries({ queryKey: createUserQueryKey('all') });
      toast({
        title: "Role Assigned",
        description: "User role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Assign role error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    }
  });

  const assignFacilityMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      facilityId, 
      accessLevel = 'read' 
    }: { 
      userId: string; 
      facilityId: string; 
      accessLevel?: 'read' | 'write' | 'admin';
    }) => {
      console.log('🔄 Assigning facility access:', { userId, facilityId, accessLevel });
      
      try {
        // Check if user already has access to this facility
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

        // Also update the user's primary facility if needed
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ facility_id: facilityId })
          .eq('id', userId);

        if (profileUpdateError) {
          console.warn('⚠️ Could not update primary facility:', profileUpdateError);
        }

        console.log('✅ Facility access assigned successfully');
        return { success: true };
      } catch (err) {
        console.error('❌ Facility assignment failed:', err);
        throw err;
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating users cache after facility assignment...');
      queryClient.invalidateQueries({ queryKey: createUserQueryKey('all') });
      toast({
        title: "Facility Access Granted",
        description: "User has been granted facility access successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Assign facility error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign facility access",
        variant: "destructive",
      });
    }
  });

  return {
    users,
    isLoading,
    error,
    refetch,
    createUser: createUserMutation.mutate,
    assignRole: assignRoleMutation.mutate,
    assignFacility: assignFacilityMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    isAssigningFacility: assignFacilityMutation.isPending,
    meta
  };
};
