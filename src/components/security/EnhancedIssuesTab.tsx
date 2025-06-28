import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, CheckCircle, Shield, Database, Code, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { useFixedIssuesTracker } from '@/hooks/useFixedIssuesTracker';
import { CodeFix } from '@/utils/verification/ImprovedRealCodeFixHandler';
import { Issue } from '@/types/issuesTypes';
import EnhancedIssueTopicGroup from './EnhancedIssueTopicGroup';
import FixedIssuesTracker from './FixedIssuesTracker';
import IssuesTabHeader from './IssuesTabHeader';
import IssuesSummaryCard from './IssuesSummaryCard';
import ScanInformationCard from './ScanInformationCard';
import NoIssuesState from './NoIssuesState';
import NoVerificationDataState from './NoVerificationDataState';
import { useIssuesDataProcessor } from './IssuesDataProcessor';

interface EnhancedIssuesTabProps {
  verificationSummary?: VerificationSummary | null;
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const EnhancedIssuesTab: React.FC<EnhancedIssuesTabProps> = ({ 
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

  // Track real fixes separately
  const [realFixedIssues, setRealFixedIssues] = React.useState<Array<{
    issue: Issue;
    fix: CodeFix;
    timestamp: string;
  }>>([]);

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
    'Code Quality': Code,
    'System Issues': Bug
  };

  // Handle real fix application
  const handleRealIssueFixed = (issue: Issue, fix: CodeFix) => {
    console.log('🔧 Real fix applied:', { issue: issue.type, fix: fix.description });
    
    // Add to real fixed issues
    setRealFixedIssues(prev => [...prev, {
      issue,
      fix,
      timestamp: new Date().toISOString()
    }]);

    // Also move to the general fixed issues tracker
    moveToFixed([issue], 'automatic');
    
    toast({
      title: "🎯 Real Fix Applied",
      description: `${fix.description} - This should resolve the issue permanently`,
      variant: "default",
    });
  };

  if (!verificationSummary) {
    return <NoVerificationDataState onReRunVerification={onReRunVerification} isReRunning={isReRunning} />;
  }

  const totalFixedCount = getTotalFixedCount();
  const realFixedCount = realFixedIssues.length;
  const totalActiveIssues = displayIssues.length - totalFixedCount;

  return (
    <div className="space-y-6">
      <IssuesTabHeader onReRunVerification={onReRunVerification} isReRunning={isReRunning} />

      {/* Enhanced Status Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-900">Enhanced Real Fix System Active</h3>
        </div>
        <p className="text-sm text-blue-700">
          This system applies real code and database fixes. When you click "Fix", actual changes are made to resolve issues permanently.
        </p>
        {realFixedCount > 0 && (
          <p className="text-sm text-blue-700 font-medium mt-1">
            ✅ {realFixedCount} real fixes have been applied to your codebase
          </p>
        )}
      </div>

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

          {/* Enhanced Issues by Topic with Real Fix Buttons */}
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

          {/* No Active Issues State */}
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

          {/* Real Fixes Section */}
          {realFixedCount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Real Code Fixes Applied ({realFixedCount})
              </h3>
              <div className="space-y-2">
                {realFixedIssues.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium text-sm">{item.issue.type}</span>
                      <p className="text-xs text-gray-600">{item.fix.description}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
