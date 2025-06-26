
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  user_metadata?: any;
  app_metadata?: any;
}

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
    error,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('🔍 Fetching users - using manage-user-profiles edge function...');
      
      try {
        // Use the manage-user-profiles edge function to get all users with roles
        const { data: response, error: functionError } = await supabase.functions.invoke('manage-user-profiles', {
          body: {
            action: 'list'
          }
        });

        if (functionError) {
          console.error('❌ Error from edge function:', functionError);
          throw new Error(`Edge function error: ${functionError.message}`);
        }

        if (!response.success || !response.data) {
          console.log('⚠️ No users data returned from edge function');
          return [];
        }

        const allUsersData = response.data;
        console.log('📊 All users fetched successfully:', allUsersData.length);
        
        return allUsersData;
        
      } catch (err) {
        console.error('❌ Error fetching users:', err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
    gcTime: 300000,
  });

  // For user creation, we still use edge functions as they handle complex business logic
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

  // FIXED: Use edge function for role assignment to ensure proper permissions
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Assigning role via edge function:', roleName, 'to user:', userId);
      
      try {
        const { data, error } = await supabase.functions.invoke('manage-user-roles', {
          body: {
            user_id: userId,
            role_name: roleName,
            action: 'assign'
          }
        });

        if (error) {
          console.error('❌ Error assigning role via edge function:', error);
          throw error;
        }

        if (!data.success) {
          throw new Error('Role assignment failed');
        }

        console.log('✅ Role assigned successfully via edge function');
        return data;
      } catch (err) {
        console.error('❌ Role assignment failed:', err);
        throw err;
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating users cache after role assignment...');
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

  // For facility assignment, use direct database operations
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
    refetch,
    createUser: createUserMutation.mutate,
    assignRole: assignRoleMutation.mutate,
    assignFacility: assignFacilityMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    isAssigningFacility: assignFacilityMutation.isPending
  };
};
