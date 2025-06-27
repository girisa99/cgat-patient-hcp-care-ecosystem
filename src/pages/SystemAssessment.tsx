
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import SystemAssessmentDashboard from '@/components/admin/SystemAssessment/SystemAssessmentDashboard';

const SystemAssessment = () => {
  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Assessment</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of system health and performance
          </p>
        </div>
        
        <SystemAssessmentDashboard />
      </div>
    </StandardizedDashboardLayout>
  );
};

export default SystemAssessment;
