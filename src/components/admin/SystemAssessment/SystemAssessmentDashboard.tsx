
/**
 * System Assessment Dashboard
 * Main dashboard component using focused sub-components
 */

import React from 'react';
import { useSystemAssessment } from '@/hooks/useSystemAssessment';
import { SystemAssessmentOverview } from './tabs/SystemAssessmentOverview';
import { SystemAssessmentTabs } from './SystemAssessmentTabs';
import { SystemAssessmentLoadingState } from './SystemAssessmentLoadingState';
import { SystemAssessmentErrorState } from './SystemAssessmentErrorState';
import { SystemAssessmentEmptyState } from './SystemAssessmentEmptyState';

const SystemAssessmentDashboard = () => {
  const {
    assessmentReport,
    isLoadingAssessment,
    assessmentError,
    refetchAssessment,
    hasCriticalFindings,
    totalTablesReviewed,
    unnecessaryTablesCount,
    emptyTablesCount
  } = useSystemAssessment();

  if (isLoadingAssessment) {
    return <SystemAssessmentLoadingState />;
  }

  if (assessmentError) {
    return <SystemAssessmentErrorState onRetry={() => refetchAssessment()} />;
  }

  if (!assessmentReport) {
    return <SystemAssessmentEmptyState onRunAssessment={() => refetchAssessment()} />;
  }

  return (
    <div className="space-y-6">
      <SystemAssessmentOverview
        assessmentReport={assessmentReport}
        totalTablesReviewed={totalTablesReviewed}
        unnecessaryTablesCount={unnecessaryTablesCount}
        emptyTablesCount={emptyTablesCount}
        hasCriticalFindings={hasCriticalFindings}
      />
      
      <SystemAssessmentTabs assessmentReport={assessmentReport} />
    </div>
  );
};

export default SystemAssessmentDashboard;
