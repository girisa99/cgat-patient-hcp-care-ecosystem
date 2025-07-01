
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createUserQueryKey } from '@/utils/userDataHelpers';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export const useRoleMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Assigning role via database operations:', roleName, 'to user:', userId);
      
      try {
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', roleName)
          .single();

        if (roleError || !role) {
          console.error('❌ Role not found:', roleName, roleError);
          throw new Error(`Role '${roleName}' not found`);
        }

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
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['unified-user-management'] });
      toast({
        title: "Role Assigned",
        description: "User role has been assigned successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Role assignment failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    }
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Removing role via database operations:', roleName, 'from user:', userId);
      
      try {
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', roleName)
          .single();

        if (roleError || !role) {
          console.error('❌ Role not found:', roleName, roleError);
          throw new Error(`Role '${roleName}' not found`);
        }

        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role_id', role.id);

        if (deleteError) {
          console.error('❌ Error removing role:', deleteError);
          throw new Error(deleteError.message);
        }

        console.log('✅ Role removal successful!');
        return { success: true };
      } catch (err) {
        console.error('💥 Exception in role removal:', err);
        throw err;
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating users cache after role removal...');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['unified-user-management'] });
      toast({
        title: "Role Removed",
        description: "User role has been removed successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Role removal failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    }
  });

  return {
    assignRole: assignRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    isAssigningRole: assignRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
  };
};
