
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

interface UserWithRoles extends Profile {
  user_roles: {
    roles: {
      name: UserRole;
      description: string | null;
    };
  }[];
  facilities?: {
    id: string;
    name: string;
    facility_type: string;
  } | null;
}

export const useUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    error
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('🔍 Fetching users list...');
      
      const { data, error } = await supabase.functions.invoke('manage-user-profiles', {
        body: { action: 'list' }
      });

      if (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
      }

      console.log('✅ Users fetched successfully:', data);
      return data.data as UserWithRoles[];
    }
  });

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

      console.log('✅ User created successfully:', data);
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
      
      const { data, error } = await supabase.functions.invoke('manage-user-roles', {
        body: {
          user_id: userId,
          role_name: roleName,
          action: 'assign'
        }
      });

      if (error) {
        console.error('❌ Error assigning role:', error);
        throw error;
      }

      console.log('✅ Role assigned successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      
      const { data, error } = await supabase.functions.invoke('user-facility-access', {
        body: {
          action: 'grant_access',
          user_id: userId,
          facility_id: facilityId,
          access_level: accessLevel
        }
      });

      if (error) {
        console.error('❌ Error assigning facility access:', error);
        throw error;
      }

      console.log('✅ Facility access assigned successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
    createUser: createUserMutation.mutate,
    assignRole: assignRoleMutation.mutate,
    assignFacility: assignFacilityMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    isAssigningFacility: assignFacilityMutation.isPending
  };
};
