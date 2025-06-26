
import React, { useState } from 'react';
import { PatientManagementHeader } from '@/components/admin/PatientManagement/PatientManagementHeader';
import { PatientSearch } from '@/components/admin/PatientManagement/PatientSearch';
import { PatientsList } from '@/components/admin/PatientManagement/PatientsList';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { useConsistentPatients } from '@/hooks/useConsistentPatients';
import { useToast } from '@/hooks/use-toast';

const Patients = () => {
  const { patients, isLoading, error, deactivatePatient, isDeactivating, meta } = useConsistentPatients();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients?.filter(patient =>
    patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  ) || [];

  const handleViewPatient = (patientId: string) => {
    toast({
      title: "View Patient",
      description: "Patient details view would open here.",
    });
    console.log('View patient:', patientId);
  };

  const handleEditPatient = (patientId: string) => {
    toast({
      title: "Edit Patient",
      description: "Patient edit form would open here.",
    });
    console.log('Edit patient:', patientId);
  };

  const handleDeactivatePatient = (patientId: string, patientName: string) => {
    if (window.confirm(`Are you sure you want to deactivate ${patientName}?`)) {
      deactivatePatient(patientId);
    }
  };

  if (isLoading) {
    return (
      <LoadingState
        title="Patient Management"
        description="Loading patient records..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Patient Management"
        error={error}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PatientManagementHeader meta={meta} />
      <PatientSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <PatientsList
        patients={filteredPatients}
        onView={handleViewPatient}
        onEdit={handleEditPatient}
        onDeactivate={handleDeactivatePatient}
        isDeactivating={isDeactivating}
        isLoading={isLoading}
        searchTerm={searchTerm}
      />
    </div>
  );
};

export default Patients;
