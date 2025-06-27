
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import PatientsList from '@/components/admin/PatientManagement/PatientsList';

const Patients = () => {
  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage patient records and healthcare information
          </p>
        </div>
        
        <PatientsList />
      </div>
    </StandardizedDashboardLayout>
  );
};

export default Patients;
