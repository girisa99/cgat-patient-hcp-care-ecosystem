
/**
 * System Assessment Tabs Component
 * Container for all assessment tabs with navigation
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CriticalFindingsTab } from './tabs/CriticalFindingsTab';
import { DatabaseAnalysisTab } from './tabs/DatabaseAnalysisTab';
import { RealTimeSyncTab } from './tabs/RealTimeSyncTab';
import { RecommendationsTab } from './tabs/RecommendationsTab';
import { AssessmentReport } from '@/utils/assessment/types/AssessmentTypes';

interface SystemAssessmentTabsProps {
  assessmentReport: AssessmentReport;
}

export const SystemAssessmentTabs: React.FC<SystemAssessmentTabsProps> = ({
  assessmentReport
}) => {
  return (
    <Tabs defaultValue="critical" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="critical">Critical Findings</TabsTrigger>
        <TabsTrigger value="database">Database</TabsTrigger>
        <TabsTrigger value="sync">Real-time Sync</TabsTrigger>
        <TabsTrigger value="recommendations">Actions</TabsTrigger>
      </TabsList>

      <TabsContent value="critical" className="space-y-4">
        <CriticalFindingsTab criticalFindings={assessmentReport.criticalFindings} />
      </TabsContent>

      <TabsContent value="database" className="space-y-4">
        <DatabaseAnalysisTab tableUtilization={assessmentReport.detailedFindings.tableUtilization} />
      </TabsContent>

      <TabsContent value="sync" className="space-y-4">
        <RealTimeSyncTab realTimeSyncStatus={assessmentReport.detailedFindings.realTimeSyncStatus} />
      </TabsContent>

      <TabsContent value="recommendations" className="space-y-4">
        <RecommendationsTab actionableRecommendations={assessmentReport.actionableRecommendations} />
      </TabsContent>
    </Tabs>
  );
};
