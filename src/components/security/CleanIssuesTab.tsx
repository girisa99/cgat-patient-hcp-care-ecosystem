
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, CheckCircle, Shield, Database, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccurateIssuesProcessor } from './AccurateIssuesProcessor';
import EnhancedIssueTopicGroup from './EnhancedIssueTopicGroup';
import { CodeFix } from '@/utils/verification/ImprovedRealCodeFixHandler';
import { Issue } from '@/types/issuesTypes';
import { markIssueAsReallyFixed } from './IssuesDataProcessor';

interface CleanIssuesTabProps {
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const CleanIssuesTab: React.FC<CleanIssuesTabProps> = ({ 
  onReRunVerification,
  isReRunning = false 
}) => {
  const { toast } = useToast();
  const {
    activeIssues,
    totalFixedCount,
    isScanning,
    lastScanTime,
    performComprehensiveScan,
    getCategorizedIssues
  } = useAccurateIssuesProcessor();

  const categorizedIssues = getCategorizedIssues();

  const topicIcons = {
    'Security Scanner': Shield,
    'Database Scanner': Database,
    'Code Quality Scanner': Code,
    'UI/UX Scanner': Bug,
    'System Issues': Bug
  };

  // Handle manual fix application
  const handleRealIssueFixed = async (issue: Issue, fix: CodeFix) => {
    console.log('🔧 Manual fix applied:', { issue: issue.type, fix: fix.description });
    
    try {
      // Mark issue as really fixed in database
      await markIssueAsReallyFixed(issue);
      
      // Trigger fresh scan to update display
      await performComprehensiveScan();
      
      toast({
        title: "🛡️ Fix Applied Successfully",
        description: `${fix.description} - Issue resolved and database updated`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error applying fix:', error);
      toast({
        title: "❌ Fix Application Failed",
        description: "Failed to apply fix. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with System Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Comprehensive Issue Scanner</h3>
            </div>
            <p className="text-sm text-blue-700">
              Manual-only issue detection with database synchronization.
              {lastScanTime && ` Last scanned: ${lastScanTime.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats with Database Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-800">{categorizedIssues.critical.length}</div>
          <div className="text-sm text-red-600">Critical Issues</div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-800">{categorizedIssues.high.length}</div>
          <div className="text-sm text-orange-600">High Priority</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-800">{categorizedIssues.medium.length}</div>
          <div className="text-sm text-yellow-600">Medium Priority</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-800">
            {categorizedIssues.byTopic['Database Scanner']?.length || 0}
          </div>
          <div className="text-sm text-purple-600">Database Issues</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-800">{totalFixedCount}</div>
          <div className="text-sm text-green-600">Issues Fixed</div>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Active Issues ({categorizedIssues.total})
          </TabsTrigger>
          <TabsTrigger value="fixed" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Fixed Issues ({totalFixedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Issues by Topic */}
          {Object.entries(categorizedIssues.byTopic).map(([topic, issues]) => {
            if (issues.length === 0) return null;
            
            return (
              <EnhancedIssueTopicGroup
                key={topic}
                topic={topic}
                issues={issues}
                icon={topicIcons[topic as keyof typeof topicIcons] || Bug}
                onIssueFixed={handleRealIssueFixed}
              />
            );
          })}

          {/* No Issues State */}
          {categorizedIssues.total === 0 && !isScanning && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-medium text-green-900 mb-2">No Active Issues Found</h3>
              <p className="text-green-700">
                All identified issues have been resolved. Total fixes applied: {totalFixedCount}
              </p>
            </div>
          )}

          {/* Scanning State */}
          {isScanning && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <div className="animate-spin h-12 w-12 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">Comprehensive Scan in Progress</h3>
              <p className="text-blue-700">
                Analyzing all code issues and syncing with database...
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fixed" className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <div className="text-4xl font-bold text-green-600 mb-2">{totalFixedCount}</div>
              <p className="text-gray-600 mb-4">Total fixes successfully applied to the codebase</p>
              <div className="text-sm text-gray-500">
                {lastScanTime && `Last verified: ${lastScanTime.toLocaleString()}`}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CleanIssuesTab;
