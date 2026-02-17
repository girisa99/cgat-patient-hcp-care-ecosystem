
/**
 * PATIENT MUTATIONS HOOK
 * Handles patient-related mutations
 */
import { useMasterToast } from '../useMasterToast';

export const usePatientMutations = () => {
  const { showSuccess, showError } = useMasterToast();

  const createPatient = async (patientData: any) => {
    console.log('🏥 Create patient requested:', patientData);
    showSuccess("Patient Creation", "This feature will be implemented soon");
  };

  const updatePatient = async (id: string, patientData: any) => {
    console.log('🏥 Update patient requested:', { id, patientData });
    showSuccess("Patient Update", "This feature will be implemented soon");
  };

  const deletePatient = async (id: string) => {
    console.log('🏥 Delete patient requested:', id);
    showSuccess("Patient Deletion", "This feature will be implemented soon");
  };

  return {
    createPatient,
    updatePatient,
    deletePatient,
    isCreating: false,
    isUpdating: false,
    isDeleting: false
  };
};
