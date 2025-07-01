
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, CheckCircle, Shield, Database, Code } from 'lucide-react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { useFixedIssuesTracker } from '@/hooks/useFixedIssuesTracker';
import { Issue } from '@/types/issuesTypes';
import EnhancedIssueTopicGroup from './EnhancedIssueTopicGroup';
import FixedIssuesTracker from './FixedIssuesTracker';
import IssuesTabHeader from './IssuesTabHeader';
import IssuesSummaryCard from './IssuesSummaryCard';
import ScanInformationCard from './ScanInformationCard';
import NoIssuesState from './NoIssuesState';
import NoVerificationDataState from './NoVerificationDataState';
import { useIssuesDataProcessor } from './IssuesDataProcessor';
import EnhancedIssuesTabHeader from './EnhancedIssuesTab/EnhancedIssuesTabHeader';
import RealFixesSection from './EnhancedIssuesTab/RealFixesSection';
import { useRealFixedIssues } from './EnhancedIssuesTab/useRealFixedIssues';

interface EnhancedIssuesTabProps {
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

const EnhancedIssuesTab: React.FC<EnhancedIssuesTabProps> = ({ 
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

  const { realFixedIssues, handleRealIssueFixed, realFixedCount } = useRealFixedIssues();

  // Process issues data using the custom hook with converted fixed issues
  const convertedFixedIssues = convertFixedIssuesToIssues(fixedIssues);
  const {
    allIssues: displayIssues,
    criticalIssues,
    highIssues,
    mediumIssues,
    issuesByTopic
  } = useIssuesDataProcessor(verificationSummary, convertedFixedIssues);

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
    'System Issues': Bug
  };

  // Enhanced fix handler that also uses the fixed issues tracker
  const enhancedFixHandler = (issue: Issue, fix: any) => {
    handleRealIssueFixed(issue, fix);
    moveToFixed([issue], 'automatic');
  };

  if (!verificationSummary) {
    return <NoVerificationDataState onReRunVerification={onReRunVerification} isReRunning={isReRunning} />;
  }

  const totalFixedCount = getTotalFixedCount();
  const totalActiveIssues = displayIssues.length - totalFixedCount;

  return (
    <div className="space-y-6">
      <IssuesTabHeader onReRunVerification={onReRunVerification} isReRunning={isReRunning} />
      
      <EnhancedIssuesTabHeader realFixedCount={realFixedCount} />

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Active Issues ({totalActiveIssues})
          </TabsTrigger>
          <TabsTrigger value="fixed" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Fixed Issues ({totalFixedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <IssuesSummaryCard
            criticalCount={criticalIssues.length}
            highCount={highIssues.length}
            mediumCount={mediumIssues.length}
            fixedCount={totalFixedCount}
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

          {totalActiveIssues === 0 && (
            <NoIssuesState
              fixedCount={totalFixedCount}
              onReRunVerification={onReRunVerification}
              isReRunning={isReRunning}
            />
          )}
        </TabsContent>

        <TabsContent value="fixed" className="space-y-6">
          <FixedIssuesTracker 
            fixedIssues={fixedIssues} 
            totalFixesApplied={totalFixedCount}
          />
          <RealFixesSection realFixedIssues={realFixedIssues} />
        </TabsContent>
      </Tabs>

      <ScanInformationCard
        verificationSummary={verificationSummary}
        displayIssuesCount={totalActiveIssues}
        fixedCount={totalFixedCount}
      />
    </div>
  );
};

export default EnhancedIssuesTab;
