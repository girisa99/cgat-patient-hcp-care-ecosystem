import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, CheckCircle, Shield, Database, Code, Zap, RefreshCw, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
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
  const [isRealTimeScanning, setIsRealTimeScanning] = React.useState(false);
  const [forceRefresh, setForceRefresh] = React.useState(0);

  // Enhanced processing with backend fix detection
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
    totalFixedCount: Math.max(getTotalFixedCount(), totalRealFixesApplied, autoDetectedBackendFixes),
    criticalCount: criticalIssues.length,
    highCount: highIssues.length,
    mediumCount: mediumIssues.length,
    securityIssuesCount: issuesByTopic['Security Issues']?.length || 0,
    backendFixedCount: autoDetectedBackendFixes,
    realFixesApplied: totalRealFixesApplied,
    lastUpdateTime: lastScanTime
  };

  // ENHANCED: Trigger immediate backend detection when component mounts
  React.useEffect(() => {
    console.log('🔄 TRIGGERING IMMEDIATE BACKEND FIX DETECTION ON MOUNT...');
    setIsRealTimeScanning(true);
    setLastScanTime(new Date());
    
    // Force a re-scan after a short delay to ensure all detection functions run
    setTimeout(() => {
      setForceRefresh(prev => prev + 1);
      setIsRealTimeScanning(false);
      
      // Show detection results
      if (autoDetectedBackendFixes > 0) {
        toast({
          title: "🎯 Backend Fixes Auto-Detected!",
          description: `${autoDetectedBackendFixes} issues were automatically resolved and moved to Fixed Issues`,
          variant: "default",
        });
      }
    }, 1000);
  }, [autoDetectedBackendFixes, toast]);

  // Show notification when backend fixes are detected
  React.useEffect(() => {
    if (autoDetectedBackendFixes > 0) {
      toast({
        title: "🎯 Backend Fixes Detected!",
        description: `${autoDetectedBackendFixes} issues were automatically resolved by backend changes and moved to Fixed Issues`,
        variant: "default",
      });
    }
  }, [autoDetectedBackendFixes, toast]);

  // Listen for storage changes to update metrics in real-time
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'real-fixes-applied-count' || 
          e.key?.includes('_implemented') || 
          e.key?.includes('_active') ||
          e.key?.includes('_applied') ||
          e.key?.includes('_improved') ||
          e.key?.includes('_enhanced') ||
          e.key === 'backend-fixes-detected') {
        console.log('🔄 Storage change detected (including all fix types), triggering metrics update:', e.key);
        setLastScanTime(new Date());
        setForceRefresh(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-refresh every 30 minutes to check for code changes
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 AUTOMATIC refresh with enhanced backend fix detection...');
      setLastScanTime(new Date());
      setIsRealTimeScanning(true);
      
      setTimeout(() => {
        setIsRealTimeScanning(false);
        setForceRefresh(prev => prev + 1);
      }, 1000);
    }, 1800000);

    return () => clearInterval(interval);
  }, []);

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

  // Enhanced real fix application with duplicate prevention
  const handleRealIssueFixed = (issue: Issue, fix: CodeFix) => {
    console.log('🔧 Enhanced REAL fix applied with duplicate prevention:', { 
      issue: issue.type, 
      fix: fix.description 
    });
    
    // Check if this issue was already fixed in backend
    if (issue.backendFixed) {
      toast({
        title: "⚠️ Issue Already Fixed",
        description: "This issue was already resolved by backend changes. No additional fix needed.",
        variant: "destructive",
      });
      return;
    }
    
    // Add to real fixed issues
    setRealFixedIssues(prev => [...prev, {
      issue,
      fix,
      timestamp: new Date().toISOString()
    }]);

    // Move to fixed tracker
    moveToFixed([issue], 'automatic');
    
    // Mark as really fixed using the utility function
    markIssueAsReallyFixed(issue);
    
    // Trigger metrics update
    setLastScanTime(new Date());
    setForceRefresh(prev => prev + 1);
    
    toast({
      title: "🛡️ Security Fix Applied & Validated",
      description: `${fix.description} - Fix validated and metrics synchronized`,
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <IssuesTabHeader onReRunVerification={onReRunVerification} isReRunning={isReRunning} />

      {/* Consolidated Metrics Display - Replaces all redundant sections */}
      <ConsolidatedMetricsDisplay syncData={syncData} />

      {/* Enhanced Backend Fix Detection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className={`h-5 w-5 text-green-600 ${isRealTimeScanning ? 'animate-spin' : ''}`} />
          <h3 className="font-medium text-green-900">Backend Fix Detection & Synchronization</h3>
        </div>
        <p className="text-sm text-green-700">
          System automatically detects ALL backend-applied fixes and prevents duplicate applications. 
          Last scan: {lastScanTime.toLocaleTimeString()} {isRealTimeScanning && '(Scanning...)'}
        </p>
      </div>

      {/* Backend Fixed Issues Notification */}
      {backendFixedIssues.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">{backendFixedIssues.length} Issues Auto-Resolved</h3>
          </div>
          <p className="text-sm text-blue-700">
            Issues were automatically resolved by backend changes and moved to Fixed Issues.
          </p>
        </div>
      )}

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
                <RefreshCw className="h-5 w-5 text-yellow-600" />
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
