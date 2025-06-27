
import React, { useState } from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
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
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage patient records and healthcare information
          </p>
        </div>
        
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
      </div>
    </StandardizedDashboardLayout>
  );
};

export default Patients;
