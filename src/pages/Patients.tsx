
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { PatientsList } from '@/components/admin/PatientManagement/PatientsList';
import { PatientEditDialog } from '@/components/admin/PatientManagement/PatientEditDialog';
import { PatientViewDialog } from '@/components/admin/PatientManagement/PatientViewDialog';
import { usePatients } from '@/hooks/usePatients';

const Patients = () => {
  const { patients, isLoading } = usePatients();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleView = (patientId: string) => {
    setSelectedPatientId(patientId);
    setViewDialogOpen(true);
  };

  const handleEdit = (patientId: string) => {
    setSelectedPatientId(patientId);
    setEditDialogOpen(true);
  };

  const handleDeactivate = async (patientId: string, patientName: string) => {
    setIsDeactivating(true);
    console.log('Deactivating patient:', patientId, patientName);
    // TODO: Implement deactivation logic
    setIsDeactivating(false);
  };

  const selectedPatient = selectedPatientId 
    ? patients?.find(p => p.id === selectedPatientId) 
    : null;

  return (
    <MainLayout>
      <PageContainer
        title="Patients"
        subtitle="Manage patient records and healthcare information"
      >
        <PatientsList 
          patients={patients || []}
          onView={handleView}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          isDeactivating={isDeactivating}
          isLoading={isLoading}
          searchTerm=""
        />

        {selectedPatient && (
          <>
            <PatientEditDialog
              open={editDialogOpen}
              onClose={() => setEditDialogOpen(false)}
              patient={selectedPatient}
            />
            <PatientViewDialog
              open={viewDialogOpen}
              onClose={() => setViewDialogOpen(false)}
              patient={selectedPatient}
            />
          </>
        )}
      </PageContainer>
    </MainLayout>
  );
};

export default Patients;
