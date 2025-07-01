
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, CheckCircle, Shield, Database, Code } from 'lucide-react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { useFixedIssuesTracker } from '@/hooks/useFixedIssuesTracker';
import EnhancedIssueTopicGroup from './EnhancedIssueTopicGroup';
import FixedIssuesTracker from './FixedIssuesTracker';
import IssuesTabHeader from './IssuesTabHeader';
import IssuesSummaryCard from './IssuesSummaryCard';
import ScanInformationCard from './ScanInformationCard';
import NoIssuesState from './NoIssuesState';
import ConsolidatedMetricsDisplay from '@/components/verification/ConsolidatedMetricsDisplay';
import { useIssuesDataProcessor } from './IssuesDataProcessor';
import { Issue } from '@/types/issuesTypes';
import IssueChangeTracking from './IssuesTab/IssueChangeTracking';
import { useIssuesTabLogic } from './IssuesTab/useIssuesTabLogic';

interface IssuesTabProps {
  verificationSummary?: VerificationSummary | null;
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

// Helper function to convert FixedIssue to Issue  
const convertFixedIssuesToIssues = (fixedIssues: any[]): Issue[] => {
  return fixedIssues.map(fixedIssue => ({
    type: fixedIssue.type,
    message: fixedIssue.message,
    source: fixedIssue.source,
    severity: ['critical', 'high', 'medium', 'low'].includes(fixedIssue.severity) 
      ? fixedIssue.severity as 'critical' | 'high' | 'medium' | 'low'
      : 'medium' as const,
    issueId: fixedIssue.issueId,
    lastSeen: fixedIssue.lastSeen,
    firstDetected: fixedIssue.firstDetected,
    status: fixedIssue.status || 'resolved' as const,
    details: fixedIssue.details,
    backendFixed: fixedIssue.backendFixed,
    autoDetectedFix: fixedIssue.autoDetectedFix
  }));
};

const IssuesTab: React.FC<IssuesTabProps> = ({ 
  verificationSummary, 
  onReRunVerification,
  isReRunning = false 
}) => {
  const { 
    fixedIssues, 
    moveToFixed, 
    updateActiveIssues, 
    getTotalFixedCount 
  } = useFixedIssuesTracker();

  const { realFixedIssues, lastScanTime, handleRealIssueFixed } = useIssuesTabLogic();

  // Enhanced processing with manual trigger only - use converted fixed issues
  const convertedFixedIssues = convertFixedIssuesToIssues(fixedIssues);
  const {
    allIssues: displayIssues,
    criticalIssues,
    highIssues,
    mediumIssues,
    issuesByTopic,
    newIssues,
    resolvedIssues,
    reappearedIssues,
    totalRealFixesApplied
  } = useIssuesDataProcessor(verificationSummary, convertedFixedIssues);

  // Create sync data for consolidated metrics
  const syncData = {
    activeIssues: displayIssues,
    fixedIssues: fixedIssues,
    totalActiveCount: displayIssues.length,
    totalFixedCount: Math.max(getTotalFixedCount(), totalRealFixesApplied),
    criticalCount: criticalIssues.length,
    highCount: highIssues.length,
    mediumCount: mediumIssues.length,
    securityIssuesCount: issuesByTopic['Security Issues']?.length || 0,
    backendFixedCount: 0,
    realFixesApplied: totalRealFixesApplied,
    lastUpdateTime: lastScanTime
  };

  // Update active issues when verification summary changes
  React.useEffect(() => {
    if (displayIssues.length > 0) {
      updateActiveIssues(displayIssues);
    }
  }, [displayIssues, updateActiveIssues]);

  const topicIcons = {
    'Security Issues': Shield,
    'Database Issues': Database,
    'Code Quality': Code,
    'UI/UX Issues': Bug,
    'System Issues': Bug
  };

  // Enhanced fix handler
  const enhancedFixHandler = (issue: Issue, fix: any) => {
    handleRealIssueFixed(issue, fix);
    moveToFixed([issue], 'manual');
  };

  return (
    <div className="space-y-6">
      <IssuesTabHeader onReRunVerification={onReRunVerification} isReRunning={isReRunning} />

      <ConsolidatedMetricsDisplay syncData={syncData} />

      <IssueChangeTracking 
        newIssues={newIssues}
        resolvedIssues={resolvedIssues}
        reappearedIssues={reappearedIssues}
      />

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Active Issues ({syncData.totalActiveCount})
          </TabsTrigger>
          <TabsTrigger value="fixed" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Fixed Issues ({syncData.totalFixedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <IssuesSummaryCard
            criticalCount={criticalIssues.length}
            highCount={highIssues.length}
            mediumCount={mediumIssues.length}
            fixedCount={syncData.totalFixedCount}
          />

          {Object.entries(issuesByTopic).map(([topic, issues]) => {
            if (issues.length === 0) return null;
            
            return (
              <EnhancedIssueTopicGroup
                key={topic}
                topic={topic}
                issues={issues}
                icon={topicIcons[topic as keyof typeof topicIcons]}
                onIssueFixed={enhancedFixHandler}
              />
            );
          })}

          {syncData.totalActiveCount === 0 && (
            <NoIssuesState
              fixedCount={syncData.totalFixedCount}
              onReRunVerification={onReRunVerification}
              isReRunning={isReRunning}
            />
          )}
        </TabsContent>

        <TabsContent value="fixed" className="space-y-6">
          <FixedIssuesTracker 
            fixedIssues={fixedIssues} 
            totalFixesApplied={syncData.totalFixedCount}
          />
          <ConsolidatedMetricsDisplay syncData={syncData} showDetailed={true} />
        </TabsContent>
      </Tabs>

      <ScanInformationCard
        verificationSummary={verificationSummary}
        displayIssuesCount={syncData.totalActiveCount}
        fixedCount={syncData.totalFixedCount}
      />
    </div>
  );
};

export default IssuesTab;
