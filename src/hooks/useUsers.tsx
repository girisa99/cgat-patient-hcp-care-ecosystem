
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
    error,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('🔍 Fetching users list...');
      
      try {
        const { data, error } = await supabase.functions.invoke('manage-user-profiles', {
          body: { action: 'list' }
        });

        if (error) {
          console.error('❌ Edge function error:', error);
          throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
        }

        if (!data || !data.success) {
          console.error('❌ Invalid response from edge function:', data);
          throw new Error(data?.error || 'Invalid response from server');
        }

        console.log('✅ Users fetched successfully via edge function:', data.data);
        return data.data as UserWithRoles[];
      } catch (err) {
        console.error('❌ Network or parsing error:', err);
        
        // Fallback: try direct database queries if edge function fails
        console.log('🔄 Attempting direct database queries as fallback...');
        
        try {
          // First get all profiles with facilities
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select(`
              *,
              facilities (
                id,
                name,
                facility_type
              )
            `)
            .order('last_name');

          if (profilesError) {
            console.error('❌ Fallback profiles query failed:', profilesError);
            throw new Error(`Database error: ${profilesError.message}`);
          }

          console.log('✅ Fallback profiles query successful:', profiles);

          // Then get user roles for each profile
          const profilesWithRoles = await Promise.all(
            profiles.map(async (profile) => {
              const { data: userRoles, error: rolesError } = await supabase
                .from('user_roles')
                .select(`
                  id,
                  role_id,
                  roles!inner (
                    name,
                    description
                  )
                `)
                .eq('user_id', profile.id);

              if (rolesError) {
                console.error('❌ Error fetching roles for user:', profile.id, rolesError);
                // Continue without roles if there's an error
                return {
                  ...profile,
                  user_roles: []
                };
              }

              return {
                ...profile,
                user_roles: userRoles || []
              };
            })
          );

          console.log('✅ Fallback query with roles completed successfully:', profilesWithRoles);
          return profilesWithRoles as UserWithRoles[];
        } catch (fallbackError) {
          console.error('❌ Fallback queries also failed:', fallbackError);
          throw new Error(`Both edge function and direct database queries failed: ${fallbackError.message}`);
        }
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
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

        console.log('✅ User created successfully via edge function:', data);
        return data;
      } catch (err) {
        console.error('❌ Edge function failed, this operation requires the edge function to work properly');
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

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Assigning role:', roleName, 'to user:', userId);
      
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

        console.log('✅ Role assigned successfully via edge function:', data);
        return data;
      } catch (err) {
        console.error('❌ Edge function failed, this operation requires the edge function to work properly');
        throw new Error(`Role assignment failed: ${err.message}`);
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
        const { data, error } = await supabase.functions.invoke('user-facility-access', {
          body: {
            action: 'grant_access',
            user_id: userId,
            facility_id: facilityId,
            access_level: accessLevel
          }
        });

        if (error) {
          console.error('❌ Error assigning facility access via edge function:', error);
          throw error;
        }

        console.log('✅ Facility access assigned successfully via edge function:', data);
        return data;
      } catch (err) {
        console.error('❌ Edge function failed, this operation requires the edge function to work properly');
        throw new Error(`Facility assignment failed: ${err.message}`);
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
