
import { useState, useCallback } from 'react';
import { useMasterToast } from '../useMasterToast';
import type { PatientFormState } from '@/types/formState';

export const usePatientMutations = () => {
  const toast = useMasterToast();
  
  const [patientData, setPatientData] = useState<PatientFormState>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: ''
  });

  const [updateData, setUpdateData] = useState<PatientFormState>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: ''
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updatePatientField = useCallback((field: keyof PatientFormState, value: string) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const updatePatientUpdateField = useCallback((field: keyof PatientFormState, value: string) => {
    setUpdateData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handlePatientMutation = useCallback(async () => {
    setIsLoading(true);
    try {
      // Patient mutation logic here
      toast.showSuccess('Patient Update', 'Successfully updated patient data');
    } catch (error) {
      toast.showError('Patient Mutation Error', 'Failed to update patient data');
    } finally {
      setIsLoading(false);
    }
  }, [patientData, toast]);

  return {
    patientData,
    updateData,
    isLoading,
    updatePatientField,
    updatePatientUpdateField,
    handlePatientMutation,
    meta: {
      hookVersion: 'patient-mutations-v1.0.0',
      typeScriptAligned: true
    }
  };
};
