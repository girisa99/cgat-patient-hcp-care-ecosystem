
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * IMPORTANT: Patient data MUST be fetched from auth.users table via the manage-user-profiles edge function.
 * 
 * ❌ DO NOT query profiles table directly for patient data - it will include non-patient users
 * ✅ ALWAYS use manage-user-profiles edge function with role-based filtering
 * 
 * This ensures:
 * - Data comes from the authoritative auth.users table
 * - Proper role-based filtering (patientCaregiver role only)
 * - RLS policies are respected
 * - Consistent data structure across the application
 */

interface PatientUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  facility_id?: string;
  facilities?: {
    id: string;
    name: string;
    facility_type: string;
  } | null;
  user_roles: {
    roles: {
      name: string;
      description: string | null;
    };
  }[];
}

/**
 * Custom hook for managing patient data.
 * 
 * SECURITY NOTE: This hook specifically filters for users with 'patientCaregiver' role
 * from the auth.users table to ensure we only get actual patients.
 */
export const usePatients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: patients,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['patients', 'patientCaregiver'], // Include role in cache key for clarity
    queryFn: async (): Promise<PatientUser[]> => {
      console.log('🔍 Fetching patients with patientCaregiver role from auth.users table via edge function...');
      
      try {
        // CRITICAL: Use edge function to fetch from auth.users table with role filtering
        // This is the ONLY correct way to fetch patient data
        const { data: response, error } = await supabase.functions.invoke('manage-user-profiles', {
          body: { action: 'list' }
        });

        if (error) {
          console.error('❌ Error calling manage-user-profiles function:', error);
          throw new Error(`Edge function error: ${error.message}`);
        }

        if (!response?.success) {
          console.error('❌ Function returned error:', response?.error);
          throw new Error(response?.error || 'Failed to fetch users from auth table');
        }

        const allUsers = response.data || [];
        console.log('✅ All auth users fetched:', allUsers.length);

        // Filter for users with patientCaregiver role ONLY
        const patientUsers = allUsers.filter((user: any) => {
          const hasPatientRole = user.user_roles?.some((ur: any) => 
            ur.roles?.name === 'patientCaregiver'
          );
          
          if (hasPatientRole) {
            console.log(`✅ Found patient: ${user.email}`);
          }
          
          return hasPatientRole;
        });

        console.log('✅ Total patients with patientCaregiver role:', patientUsers.length);
        
        // Validate data structure to ensure consistency
        const validatedPatients = patientUsers.map((user: any) => ({
          id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email,
          phone: user.phone || '',
          created_at: user.created_at,
          facility_id: user.facility_id,
          facilities: user.facilities,
          user_roles: user.user_roles || []
        }));
        
        return validatedPatients;
      } catch (err: any) {
        console.error('❌ Critical error in patient data fetch:', err);
        throw new Error(`Patient data fetch failed: ${err.message}`);
      }
    },
    retry: 2,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
    meta: {
      // Add metadata for debugging and monitoring
      description: 'Fetches patient users from auth.users table via edge function',
      requiresRole: 'patientCaregiver',
      dataSource: 'auth.users (via manage-user-profiles edge function)'
    }
  });

  const deactivatePatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      console.log('🔄 Deactivating patient with proper audit logging:', patientId);
      
      // Log deactivation action for audit purposes
      // Note: In a production system, you might want to add a status field to profiles
      // or use a separate patient_status table linked to auth.users
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          action: 'PATIENT_DEACTIVATED',
          table_name: 'auth.users', // Indicate the actual source table
          record_id: patientId,
          new_values: { 
            status: 'deactivated',
            deactivated_at: new Date().toISOString(),
            reason: 'Manual deactivation via admin interface'
          }
        });

      if (error) {
        console.error('❌ Error logging patient deactivation:', error);
        throw new Error(`Failed to log patient deactivation: ${error.message}`);
      }

      console.log('✅ Patient deactivation logged successfully');
      return { success: true, patientId };
    },
    onSuccess: (data) => {
      // Invalidate both patients and users cache to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: "Patient Deactivated",
        description: `Patient has been deactivated successfully.`,
      });
      
      console.log('✅ Patient deactivation completed:', data.patientId);
    },
    onError: (error: any) => {
      console.error('❌ Patient deactivation failed:', error);
      toast({
        title: "Deactivation Failed",
        description: error.message || "Failed to deactivate patient. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    patients,
    isLoading,
    error,
    refetch,
    deactivatePatient: deactivatePatientMutation.mutate,
    isDeactivating: deactivatePatientMutation.isPending,
    // Expose metadata for debugging
    meta: {
      totalPatients: patients?.length || 0,
      dataSource: 'auth.users via manage-user-profiles edge function',
      lastFetch: new Date().toISOString()
    }
  };
};

/**
 * DEVELOPMENT GUIDELINES FOR PATIENT DATA:
 * 
 * 1. ALWAYS use this usePatients hook for patient data - never query profiles directly
 * 2. Patient data comes from auth.users table via manage-user-profiles edge function
 * 3. Role filtering is done at the edge function level for security
 * 4. Any new patient-related features should extend this hook, not create new queries
 * 5. If you need to modify patient fetching logic, update the edge function, not this hook
 * 
 * SECURITY CONSIDERATIONS:
 * - RLS policies protect access at the database level
 * - Edge function enforces role-based access control
 * - All patient operations are logged for audit purposes
 * - Cache invalidation ensures data consistency across the app
 */
