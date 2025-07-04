
/**
 * CONSOLIDATED PATIENTS HOOK - FIXED TYPE ALIGNMENT
 * Version: consolidated-patients-v2.0.0 - Fixed property alignment
 */
import { useMasterUserManagement, type MasterUser } from '../useMasterUserManagement';

export const useConsolidatedPatients = () => {
  const masterUserManagement = useMasterUserManagement();
  
  console.log('🔧 Consolidated Patients - Fixed Type Alignment v2.0');

  const patients = masterUserManagement.users.filter(user => 
    user.role.toLowerCase().includes('patient')
  );

  const convertToPatientFormat = (user: MasterUser) => ({
    ...user,
    patientId: user.id,
    patientEmail: user.email,
    patientName: `${user.firstName} ${user.lastName}`,
    isActive: user.isActive, // FIXED - Use correct property name
    dateOfBirth: user.phone, // Mock mapping
    medicalRecordNumber: `MRN-${user.id.slice(0, 6)}`
  });

  const consolidatedPatients = patients.map(convertToPatientFormat);

  return {
    patients: consolidatedPatients,
    totalPatients: consolidatedPatients.length,
    activePatients: consolidatedPatients.filter(p => p.isActive).length,
    isLoading: masterUserManagement.isLoading,
    error: masterUserManagement.error,
    refetch: masterUserManagement.refetch,
    
    // Patient-specific actions
    searchPatients: (term: string) => 
      consolidatedPatients.filter(patient =>
        patient.patientName.toLowerCase().includes(term.toLowerCase()) ||
        patient.patientEmail.toLowerCase().includes(term.toLowerCase())
      ),
    
    getPatientById: (id: string) => 
      consolidatedPatients.find(p => p.id === id),
    
    meta: {
      dataSource: 'master-user-management',
      patientConversion: 'consolidated',
      hookVersion: 'consolidated-patients-v2.0.0',
      typeAlignmentFixed: true
    }
  };
};
