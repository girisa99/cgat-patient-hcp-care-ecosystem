
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, FileText } from 'lucide-react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import SystemAssessmentDashboard from '@/components/admin/SystemAssessment/SystemAssessmentDashboard';
import { useSystemAssessment } from '@/hooks/useSystemAssessment';

const SystemAssessment = () => {
  const { 
    refetchAssessment, 
    generateCleanupScript, 
    generateMigrationPlan,
    isLoadingAssessment 
  } = useSystemAssessment();

  const headerActions = (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={generateCleanupScript}
        disabled={isLoadingAssessment}
      >
        <Download className="h-4 w-4 mr-2" />
        Download Cleanup Script
      </Button>
      <Button 
        variant="outline" 
        onClick={generateMigrationPlan}
        disabled={isLoadingAssessment}
      >
        <FileText className="h-4 w-4 mr-2" />
        Migration Plan
      </Button>
      <Button 
        onClick={() => refetchAssessment()}
        disabled={isLoadingAssessment}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );

  return (
    <StandardizedDashboardLayout
      pageTitle="System Assessment"
      pageSubtitle="Comprehensive analysis of system health, performance, and optimization opportunities"
      headerActions={headerActions}
      containerSize="full"
    >
      <SystemAssessmentDashboard />
    </StandardizedDashboardLayout>
  );
};

export default SystemAssessment;
