
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, CheckCircle, Shield, Database, Code, Zap, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { useFixedIssuesTracker } from '@/hooks/useFixedIssuesTracker';
import { CodeFix } from '@/utils/verification/ImprovedRealCodeFixHandler';
import EnhancedIssueTopicGroup from './EnhancedIssueTopicGroup';
import FixedIssuesTracker from './FixedIssuesTracker';
import IssuesTabHeader from './IssuesTabHeader';
import IssuesSummaryCard from './IssuesSummaryCard';
import ScanInformationCard from './ScanInformationCard';
import NoIssuesState from './NoIssuesState';
import NoVerificationDataState from './NoVerificationDataState';
import ConsolidatedMetricsDisplay from '@/components/verification/ConsolidatedMetricsDisplay';
import { useIssuesDataProcessor, markIssueAsReallyFixed } from './IssuesDataProcessor';
import { Issue } from '@/types/issuesTypes';

interface IssuesTabProps {
  verificationSummary?: VerificationSummary | null;
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const IssuesTab: React.FC<IssuesTabProps> = ({ 
  verificationSummary, 
  onReRunVerification,
  isReRunning = false 
}) => {
  const { toast } = useToast();
  const { 
    fixedIssues, 
    activeIssues, 
    moveToFixed, 
    updateActiveIssues, 
    getTotalFixedCount 
  } = useFixedIssuesTracker();

  const [realFixedIssues, setRealFixedIssues] = React.useState<Array<{
    issue: Issue;
    fix: CodeFix;
    timestamp: string;
  }>>([]);
  
  const [lastScanTime, setLastScanTime] = React.useState(new Date());

  // Enhanced processing with manual trigger only
  const {
    allIssues: displayIssues,
    criticalIssues,
    highIssues,
    mediumIssues,
    issuesByTopic,
    newIssues,
    resolvedIssues,
    reappearedIssues,
    backendFixedIssues,
    totalRealFixesApplied,
    autoDetectedBackendFixes
  } = useIssuesDataProcessor(verificationSummary, fixedIssues);

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
    backendFixedCount: 0, // Disabled automatic backend detection
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

  // Manual fix application only
  const handleRealIssueFixed = (issue: Issue, fix: CodeFix) => {
    console.log('🔧 Manual fix applied:', { 
      issue: issue.type, 
      fix: fix.description 
    });
    
    // Add to real fixed issues
    setRealFixedIssues(prev => [...prev, {
      issue,
      fix,
      timestamp: new Date().toISOString()
    }]);

    // Move to fixed tracker
    moveToFixed([issue], 'manual');
    
    // Mark as really fixed using the utility function
    markIssueAsReallyFixed(issue);
    
    // Trigger metrics update
    setLastScanTime(new Date());
    
    toast({
      title: "🛡️ Manual Fix Applied",
      description: `${fix.description} - Fix recorded successfully`,
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <IssuesTabHeader onReRunVerification={onReRunVerification} isReRunning={isReRunning} />

      {/* Consolidated Metrics Display */}
      <ConsolidatedMetricsDisplay syncData={syncData} />

      {/* Issue Change Tracking */}
      {(newIssues.length > 0 || resolvedIssues.length > 0 || reappearedIssues.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {newIssues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-red-600" />
                <h3 className="font-medium text-red-900">New Issues</h3>
              </div>
              <p className="text-2xl font-bold text-red-800">{newIssues.length}</p>
            </div>
          )}
          
          {resolvedIssues.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-900">Resolved</h3>
              </div>
              <p className="text-2xl font-bold text-green-800">{resolvedIssues.length}</p>
            </div>
          )}
          
          {reappearedIssues.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-900">Reappeared</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-800">{reappearedIssues.length}</p>
            </div>
          )}
        </div>
      )}

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
                onIssueFixed={handleRealIssueFixed}
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

          {/* Show detailed implementation status in Fixed tab */}
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
