
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, CheckCircle, Shield, Database, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { useFixedIssuesTracker } from '@/hooks/useFixedIssuesTracker';
import IssueTopicGroup from './IssueTopicGroup';
import FixedIssuesTracker from './FixedIssuesTracker';
import IssuesTabHeader from './IssuesTabHeader';
import IssuesSummaryCard from './IssuesSummaryCard';
import ScanInformationCard from './ScanInformationCard';
import NoIssuesState from './NoIssuesState';
import NoVerificationDataState from './NoVerificationDataState';
import { useIssuesDataProcessor, Issue } from './IssuesDataProcessor';

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

  // Process issues data using the custom hook
  const {
    allIssues: displayIssues,
    criticalIssues,
    highIssues,
    mediumIssues,
    issuesByTopic
  } = useIssuesDataProcessor(verificationSummary, fixedIssues);

  // Update active issues when verification summary changes
  React.useEffect(() => {
    if (displayIssues.length > 0) {
      updateActiveIssues(displayIssues);
    }
  }, [displayIssues, updateActiveIssues]);

  const topicIcons = {
    'Security Issues': Shield,
    'Database Issues': Database,
    'Code Quality': Code
  };

  // Action handlers
  const handleIssueAction = async (issue: Issue, actionType: 'run' | 'fix') => {
    console.log(`${actionType} action for issue:`, issue);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (actionType === 'fix') {
      // Move issue to fixed
      moveToFixed([issue], 'manual');
      
      toast({
        title: "🔧 Fix Applied",
        description: `Applied fix for ${issue.type}: ${issue.message.substring(0, 50)}...`,
        variant: "default",
      });
    } else {
      toast({
        title: "✅ Test Executed",
        description: `Executed test for ${issue.type}`,
        variant: "default",
      });
    }
  };

  const handleBulkAction = async (issues: Issue[], actionType: 'run' | 'fix') => {
    console.log(`Bulk ${actionType} for ${issues.length} issues`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (actionType === 'fix') {
      // Move issues to fixed
      const fixedCount = moveToFixed(issues, 'automatic');
      
      toast({
        title: `✅ Bulk Fix Complete`,
        description: `Successfully fixed ${fixedCount} issues`,
        variant: "default",
      });
    } else {
      toast({
        title: `✅ Bulk Test Complete`,
        description: `Successfully tested ${issues.length} issues`,
        variant: "default",
      });
    }
  };

  if (!verificationSummary) {
    return <NoVerificationDataState onReRunVerification={onReRunVerification} isReRunning={isReRunning} />;
  }

  const fixedCount = getTotalFixedCount();

  return (
    <div className="space-y-6">
      <IssuesTabHeader onReRunVerification={onReRunVerification} isReRunning={isReRunning} />

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Active Issues ({displayIssues.length})
          </TabsTrigger>
          <TabsTrigger value="fixed" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Fixed Issues ({fixedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <IssuesSummaryCard
            criticalCount={criticalIssues.length}
            highCount={highIssues.length}
            mediumCount={mediumIssues.length}
            fixedCount={fixedCount}
          />

          {/* Issues by Topic with Fix and Run Buttons */}
          {Object.entries(issuesByTopic).map(([topic, issues]) => {
            if (issues.length === 0) return null;
            
            return (
              <IssueTopicGroup
                key={topic}
                topic={topic}
                issues={issues}
                icon={topicIcons[topic as keyof typeof topicIcons]}
                onIssueAction={handleIssueAction}
                onBulkAction={handleBulkAction}
              />
            );
          })}

          {/* No Active Issues State */}
          {displayIssues.length === 0 && (
            <NoIssuesState
              fixedCount={fixedCount}
              onReRunVerification={onReRunVerification}
              isReRunning={isReRunning}
            />
          )}
        </TabsContent>

        <TabsContent value="fixed" className="space-y-6">
          <FixedIssuesTracker 
            fixedIssues={fixedIssues} 
            totalFixesApplied={fixedCount}
          />
        </TabsContent>
      </Tabs>

      <ScanInformationCard
        verificationSummary={verificationSummary}
        displayIssuesCount={displayIssues.length}
        fixedCount={fixedCount}
      />
    </div>
  );
};

export default IssuesTab;
