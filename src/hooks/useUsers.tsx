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
      console.log('🔍 Fetching users with separate queries approach...');
      
      try {
        // Debug: Check current user and auth state
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('🔍 Current authenticated user:', user?.id, authError);
        
        // Debug: Check if there are users in auth.users that don't have profiles
        const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
        console.log('🔍 Auth users count:', authUsers?.users?.length, 'Auth error:', authUsersError);
        
        if (authUsers?.users) {
          console.log('🔍 Auth users emails:', authUsers.users.map(u => ({ id: u.id, email: u.email })));
        }
        
        // Debug: Try to get profile count first
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        console.log('🔍 Total profiles count:', count, 'Count error:', countError);
        
        // Debug: Try without RLS first to see if data exists
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, created_at')
          .limit(20);
        
        console.log('🔍 All profiles (limited query):', allProfiles?.length, 'Error:', allProfilesError);
        console.log('🔍 Profile data sample:', allProfiles?.slice(0, 3));

        // First, get all profiles with facilities - ORDER BY EMAIL instead of last_name
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
          .order('email', { nullsLast: true });

        if (profilesError) {
          console.error('❌ Error fetching profiles:', profilesError);
          throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
        }

        if (!profiles || profiles.length === 0) {
          console.log('ℹ️ No profiles found in main query');
          console.log('🔍 This suggests either no profiles exist or RLS is blocking access');
          
          // If auth users exist but no profiles, suggest profile creation issue
          if (authUsers?.users && authUsers.users.length > 0) {
            console.log('⚠️ Found auth users but no profiles - profile creation trigger may have failed');
            console.log('🔍 Missing profiles for users:', authUsers.users.map(u => u.email));
          }
          
          return [];
        }

        console.log('✅ Profiles fetched:', profiles.length);
        console.log('🔍 Profile IDs:', profiles.map(p => ({ id: p.id, email: p.email })));

        // Then, get all user roles with role details
        const { data: userRoles, error: userRolesError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            roles (
              name,
              description
            )
          `);

        if (userRolesError) {
          console.warn('⚠️ Error fetching user roles:', userRolesError);
          // Continue without roles if there's an error
        }

        console.log('✅ User roles fetched:', userRoles?.length || 0);
        console.log('🔍 User roles data:', userRoles?.map(ur => ({ user_id: ur.user_id, role: ur.roles?.name })));

        // Combine the data
        const usersWithRoles: UserWithRoles[] = profiles.map(profile => {
          const userRolesForProfile = userRoles?.filter(ur => ur.user_id === profile.id) || [];
          
          return {
            ...profile,
            user_roles: userRolesForProfile.map(ur => ({
              roles: {
                name: ur.roles?.name || 'patientCaregiver' as UserRole,
                description: ur.roles?.description || null
              }
            }))
          };
        });

        console.log('✅ Users with roles prepared:', usersWithRoles.length);
        console.log('🔍 Final user data:', usersWithRoles.map(u => ({ 
          id: u.id, 
          email: u.email, 
          name: `${u.first_name || 'No First Name'} ${u.last_name || 'No Last Name'}`,
          roles: u.user_roles.map(ur => ur.roles.name)
        })));
        
        return usersWithRoles;
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

  // For role assignment, use direct database operations for reliability
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName }: { userId: string; roleName: UserRole }) => {
      console.log('🔄 Assigning role:', roleName, 'to user:', userId);
      
      try {
        // First get the role ID
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', roleName)
          .single();

        if (roleError || !role) {
          throw new Error('Role not found');
        }

        // Check if user already has this role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .eq('role_id', role.id)
          .single();

        if (existingRole) {
          throw new Error('User already has this role');
        }

        // Assign the role
        const { error: assignError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: role.id
          });

        if (assignError) {
          throw assignError;
        }

        console.log('✅ Role assigned successfully');
        return { success: true };
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
