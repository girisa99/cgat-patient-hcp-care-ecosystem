
import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

const Patients: React.FC = () => {
  // Mock patient data
  const patients: Patient[] = [];

  return (
    <UnifiedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-gray-600">Manage patient information and records</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          {patients.length > 0 ? (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="border-b pb-4">
                  <h3 className="font-medium">{patient.first_name} {patient.last_name}</h3>
                  <p className="text-sm text-gray-600">{patient.email}</p>
                  {patient.phone && <p className="text-sm text-gray-600">{patient.phone}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No patients found</p>
            </div>
          )}
        </div>
      </div>
    </UnifiedDashboardLayout>
  );
};

export default Patients;
