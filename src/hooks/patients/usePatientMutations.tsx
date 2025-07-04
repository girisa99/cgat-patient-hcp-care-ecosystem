
/**
 * PATIENT MUTATIONS HOOK - FIXED FIELD NAMES
 * Uses correct database field names for profiles table
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
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          first_name: patientData.firstName,
          last_name: patientData.lastName,
          email: patientData.email,
          phone: patientData.phone,
          // Note: profiles table doesn't have dateOfBirth or medicalRecordNumber
          // These would need to be added to the schema or stored in a separate patients table
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      showSuccess('Patient created successfully');
    },
    onError: (error) => {
      showError('Failed to create patient');
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
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      showSuccess('Patient updated successfully');
    },
    onError: (error) => {
      showError('Failed to update patient');
      console.error('Update patient error:', error);
    }
  });

  return {
    createPatient: createPatientMutation.mutate,
    updatePatient: updatePatientMutation.mutate,
    isCreating: createPatientMutation.isPending,
    isUpdating: updatePatientMutation.isPending
  };
};
