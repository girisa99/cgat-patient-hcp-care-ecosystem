
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import FacilitiesList from '@/components/facilities/FacilitiesList';

const Facilities = () => {
  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
          <p className="text-muted-foreground">
            Manage healthcare facilities and their information
          </p>
        </div>
        
        <FacilitiesList />
      </div>
    </StandardizedDashboardLayout>
  );
};

export default Facilities;
