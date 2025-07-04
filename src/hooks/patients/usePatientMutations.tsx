
/**
 * PATIENT MUTATIONS HOOK - FIXED FIELD NAMES
 * Uses consistent PatientFormState interface
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
        .insert([{
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          phone: patientData.phone,
          dateOfBirth: patientData.dateOfBirth,
          medicalRecordNumber: patientData.medicalRecordNumber,
          role: 'patient',
          isActive: patientData.isActive ?? true
        }])
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
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          phone: patientData.phone,
          dateOfBirth: patientData.dateOfBirth,
          medicalRecordNumber: patientData.medicalRecordNumber,
          isActive: patientData.isActive
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
