
/**
 * PATIENT MUTATIONS HOOK - FIXED DATABASE INTEGRATION
 * Uses correct database field names and handles missing ID
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PatientFormState } from '@/types/formState';
import { useMasterToast } from '../useMasterToast';

export const usePatientMutations = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useMasterToast();

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: Partial<PatientFormState>) => {
      // Generate ID for new patient since it's required
      const patientId = crypto.randomUUID();
      
      // First, create the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: patientId,
          first_name: patientData.firstName || '',
          last_name: patientData.lastName || '',
          email: patientData.email || '',
          phone: patientData.phone || null,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Then, assign the patientCaregiver role
      // First get the role ID
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'patientCaregiver')
        .single();

      if (roleError) {
        console.warn('⚠️ Could not find patientCaregiver role:', roleError);
        // Continue without role assignment if role doesn't exist
        return profile;
      }

      // Assign the role to the user
      const { error: userRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: patientId,
          role_id: role.id
        });

      if (userRoleError) {
        console.warn('⚠️ Could not assign patient role:', userRoleError);
        // Continue even if role assignment fails
      }

      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['real-patients'] });
      queryClient.invalidateQueries({ queryKey: ['master-users'] });
      showSuccess('Patient Created', 'Patient has been successfully added to the system');
    },
    onError: (error) => {
      showError('Creation Failed', 'Failed to create patient. Please try again.');
      console.error('Create patient error:', error);
    }
  });

  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, ...patientData }: { id: string } & Partial<PatientFormState>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: patientData.firstName,
          last_name: patientData.lastName,
          email: patientData.email,
          phone: patientData.phone
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['real-patients'] });
      queryClient.invalidateQueries({ queryKey: ['master-users'] });
      showSuccess('Patient Updated', 'Patient information has been successfully updated');
    },
    onError: (error) => {
      showError('Update Failed', 'Failed to update patient information. Please try again.');
      console.error('Update patient error:', error);
    }
  });

  const deactivatePatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      // For now, we'll remove the patientCaregiver role to "deactivate"
      // In a real system, you might add an is_active field to profiles
      
      // Get the role ID first
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'patientCaregiver')
        .single();

      if (roleError) throw roleError;

      // Remove the patient role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', patientId)
        .eq('role_id', role.id);

      if (error) throw error;
      return { id: patientId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['real-patients'] });
      queryClient.invalidateQueries({ queryKey: ['master-users'] });
      showSuccess('Patient Deactivated', 'Patient has been successfully deactivated');
    },
    onError: (error) => {
      showError('Deactivation Failed', 'Failed to deactivate patient. Please try again.');
      console.error('Deactivate patient error:', error);
    }
  });

  return {
    createPatient: createPatientMutation.mutate,
    updatePatient: updatePatientMutation.mutate,
    deactivatePatient: deactivatePatientMutation.mutate,
    isCreating: createPatientMutation.isPending,
    isUpdating: updatePatientMutation.isPending,
    isDeactivating: deactivatePatientMutation.isPending
  };
};
