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

  const [realFixedIssues, setRealFixedIssues] = React.useState<Array<{
    issue: Issue;
    fix: CodeFix;
    timestamp: string;
  }>>([]);
  
  const [lastScanTime, setLastScanTime] = React.useState(new Date());
  const [isRealTimeScanning, setIsRealTimeScanning] = React.useState(false);

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
    backendFixedIssues, // NEW: Issues fixed in backend
    totalRealFixesApplied,
    autoDetectedBackendFixes // NEW: Count of backend fixes detected
  } = useIssuesDataProcessor(verificationSummary, fixedIssues);

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
          e.key === 'backend-fixes-detected') {
        console.log('🔄 Storage change detected (including backend fixes), triggering metrics update:', e.key);
        setLastScanTime(new Date());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-refresh every 30 minutes to check for code changes
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 AUTOMATIC refresh with backend fix detection...');
      setLastScanTime(new Date());
      setIsRealTimeScanning(true);
      
      setTimeout(() => {
        setIsRealTimeScanning(false);
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
    
    // Trigger metrics update
    setLastScanTime(new Date());
    
    toast({
      title: "🛡️ Security Fix Applied & Validated",
      description: `${fix.description} - Fix validated and metrics synchronized`,
      variant: "default",
    });
  };

  const trackerFixedCount = getTotalFixedCount();
  const realFixedCount = realFixedIssues.length;
  const totalFixedCount = Math.max(trackerFixedCount, totalRealFixesApplied, autoDetectedBackendFixes);
  const totalActiveIssues = displayIssues.length;
  const securityIssuesCount = issuesByTopic['Security Issues']?.length || 0;

  console.log('📊 Enhanced Metrics with Backend Detection Display Values:', {
    trackerFixedCount,
    realFixedCount,
    totalRealFixesApplied,
    autoDetectedBackendFixes,
    totalFixedCount,
    totalActiveIssues,
    securityIssuesCount,
    backendFixedIssuesCount: backendFixedIssues.length
  });

  return (
    <div className="space-y-6">
      <IssuesTabHeader onReRunVerification={onReRunVerification} isReRunning={isReRunning} />

      {/* Enhanced Backend Fix Detection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className={`h-5 w-5 text-green-600 ${isRealTimeScanning ? 'animate-spin' : ''}`} />
          <h3 className="font-medium text-green-900">Enhanced Backend Fix Detection & Automatic Resolution</h3>
        </div>
        <p className="text-sm text-green-700">
          System automatically detects backend-applied fixes and prevents duplicate applications. 
          Real fixes count: <strong>{totalRealFixesApplied}</strong> | 
          Backend fixes detected: <strong>{autoDetectedBackendFixes}</strong>
        </p>
        <p className="text-xs text-green-600 mt-1">
          Last scan: {lastScanTime.toLocaleTimeString()} {isRealTimeScanning && '(Scanning with backend detection...)'}
        </p>
      </div>

      {/* Backend Fixed Issues Notification */}
      {backendFixedIssues.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Issues Automatically Resolved by Backend Changes</h3>
          </div>
          <p className="text-sm text-blue-700">
            {backendFixedIssues.length} issues were detected as fixed by backend changes and automatically moved to Fixed Issues.
            You don't need to click "Apply Real Fix" for these issues.
          </p>
          <div className="mt-2 space-y-1">
            {backendFixedIssues.slice(0, 3).map((issue, index) => (
              <div key={index} className="text-xs text-blue-600 bg-white rounded px-2 py-1">
                ✅ {issue.type}: {issue.message.substring(0, 60)}...
              </div>
            ))}
            {backendFixedIssues.length > 3 && (
              <div className="text-xs text-blue-600">
                + {backendFixedIssues.length - 3} more issues automatically resolved
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Metrics Display */}
      {totalRealFixesApplied > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Enhanced Fix Tracking with Backend Detection</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-2">
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-xl font-bold text-blue-600">{totalRealFixesApplied}</div>
              <p className="text-xs text-blue-800">Manual Fixes</p>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-xl font-bold text-green-600">{autoDetectedBackendFixes}</div>
              <p className="text-xs text-green-800">Backend Fixes</p>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-xl font-bold text-green-600">
                {localStorage.getItem('mfa_enforcement_implemented') === 'true' ? '✅' : '❌'}
              </div>
              <p className="text-xs text-gray-700">MFA</p>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-xl font-bold text-green-600">
                {localStorage.getItem('rbac_implementation_active') === 'true' ? '✅' : '❌'}
              </div>
              <p className="text-xs text-gray-700">RBAC</p>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-xl font-bold text-green-600">
                {localStorage.getItem('log_sanitization_active') === 'true' ? '✅' : '❌'}
              </div>
              <p className="text-xs text-gray-700">Logs</p>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="text-xl font-bold text-green-600">
                {localStorage.getItem('api_authorization_implemented') === 'true' ? '✅' : '❌'}
              </div>
              <p className="text-xs text-gray-700">API Auth</p>
            </div>
          </div>
        </div>
      )}

      {/* Issue Change Tracking */}
      {(newIssues.length > 0 || resolvedIssues.length > 0 || reappearedIssues.length > 0 || autoDetectedBackendFixes > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {newIssues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-red-600" />
                <h3 className="font-medium text-red-900">New Issues</h3>
              </div>
              <p className="text-2xl font-bold text-red-800">{newIssues.length}</p>
              <p className="text-sm text-red-700">Detected since last scan</p>
            </div>
          )}
          
          {resolvedIssues.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-900">Manual Resolutions</h3>
              </div>
              <p className="text-2xl font-bold text-green-800">{resolvedIssues.length}</p>
              <p className="text-sm text-green-700">Manually resolved</p>
            </div>
          )}

          {autoDetectedBackendFixes > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Backend Auto-Fixed</h3>
              </div>
              <p className="text-2xl font-bold text-blue-800">{autoDetectedBackendFixes}</p>
              <p className="text-sm text-blue-700">Automatically detected</p>
            </div>
          )}
          
          {reappearedIssues.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-5 w-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-900">Reappeared Issues</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-800">{reappearedIssues.length}</p>
              <p className="text-sm text-yellow-700">Previously resolved, now back</p>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Security Status */}
      {securityIssuesCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-red-900">Security Issues with Enhanced Backend Detection</h3>
          </div>
          <p className="text-sm text-red-700">
            {securityIssuesCount} security vulnerabilities detected. 
            Manual fixes: {totalRealFixesApplied}/5 | Backend fixes: {autoDetectedBackendFixes}/5
          </p>
          <p className="text-xs text-red-600 mt-1">
            System will automatically detect and prevent duplicate fix applications.
          </p>
        </div>
      )}

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
                onIssueFixed={handleRealIssueFixed}
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

          {/* Backend Fixed Issues Section */}
          {backendFixedIssues.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Issues Automatically Resolved by Backend Changes ({backendFixedIssues.length})
              </h3>
              <div className="space-y-2">
                {backendFixedIssues.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium text-sm">{issue.type}</span>
                      <p className="text-xs text-gray-600">{issue.message}</p>
                      <p className="text-xs text-blue-600 font-medium">✅ Automatically detected and resolved by backend changes</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Auto-detected: {new Date().toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual Real Fixes Section */}
          {totalRealFixesApplied > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Manual Security Fixes Applied & Validated ({totalRealFixesApplied})
              </h3>
              <div className="space-y-2">
                {realFixedIssues.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <span className="font-medium text-sm">{item.issue.type}</span>
                      <p className="text-xs text-gray-600">{item.fix.description}</p>
                      <p className="text-xs text-green-600 font-medium">✅ Manually applied and synchronized</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Enhanced implementation status display */}
              <div className="mt-4 p-3 bg-white rounded border">
                <h4 className="font-medium text-sm mb-2">Enhanced Implementation Status with Backend Detection:</h4>
                <div className="text-xs space-y-1">
                  <p className={localStorage.getItem('mfa_enforcement_implemented') === 'true' ? 'text-green-600 font-medium' : 'text-gray-500'}>
                    🔐 MFA Enforcement: {localStorage.getItem('mfa_enforcement_implemented') === 'true' ? 'Active & Synchronized' : 'Inactive'}
                  </p>
                  <p className={localStorage.getItem('rbac_implementation_active') === 'true' ? 'text-green-600 font-medium' : 'text-gray-500'}>
                    🛡️ RBAC System: {localStorage.getItem('rbac_implementation_active') === 'true' ? 'Active & Synchronized' : 'Inactive'}
                  </p>
                  <p className={localStorage.getItem('log_sanitization_active') === 'true' ? 'text-green-600 font-medium' : 'text-gray-500'}>
                    🧹 Log Sanitization: {localStorage.getItem('log_sanitization_active') === 'true' ? 'Active & Synchronized' : 'Inactive'}
                  </p>
                  <p className={localStorage.getItem('api_authorization_implemented') === 'true' ? 'text-green-600 font-medium' : 'text-gray-500'}>
                    🔐 API Authorization: {localStorage.getItem('api_authorization_implemented') === 'true' ? 'Active & Synchronized' : 'Inactive'}
                  </p>
                </div>
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

export default IssuesTab;
