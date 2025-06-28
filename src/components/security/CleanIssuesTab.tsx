
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, CheckCircle, Shield, Database, Code, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const handleRefreshScan = async () => {
    toast({
      title: "🔍 Refreshing Scan",
      description: "Performing comprehensive issue scan...",
      variant: "default",
    });
    
    await performComprehensiveScan();
    
    toast({
      title: "✅ Scan Complete",
      description: `Found ${categorizedIssues.total} active issues, ${totalFixedCount} fixes applied`,
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Accurate Status */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Shield className="h-5 w-5" />
                Comprehensive Issue Scanner
              </CardTitle>
              <p className="text-sm text-blue-700 mt-1">
                Accurate, real-time issue detection with database synchronization.
                {lastScanTime && ` Last scanned: ${lastScanTime.toLocaleTimeString()}`}
              </p>
            </div>
            <Button 
              onClick={handleRefreshScan}
              disabled={isScanning}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Refresh Scan'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Accurate Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-800">{categorizedIssues.critical.length}</div>
            <div className="text-sm text-red-600">Critical Issues</div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-800">{categorizedIssues.high.length}</div>
            <div className="text-sm text-orange-600">High Priority</div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-800">{categorizedIssues.medium.length}</div>
            <div className="text-sm text-yellow-600">Medium Priority</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-800">{totalFixedCount}</div>
            <div className="text-sm text-green-600">Issues Fixed</div>
          </CardContent>
        </Card>
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
            <Card className="bg-green-50 border-green-200">
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-medium text-green-900 mb-2">No Active Issues Found</h3>
                <p className="text-green-700 mb-4">
                  All identified issues have been resolved. Total fixes applied: {totalFixedCount}
                </p>
                <Button onClick={handleRefreshScan} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Scan Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Scanning State */}
          {isScanning && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="text-center py-8">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
                <h3 className="text-lg font-medium text-blue-900 mb-2">Comprehensive Scan in Progress</h3>
                <p className="text-blue-700">
                  Analyzing all code issues and syncing with database...
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fixed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Successfully Fixed Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-4xl font-bold text-green-600 mb-2">{totalFixedCount}</div>
                <p className="text-gray-600">Total fixes successfully applied to the codebase</p>
                <div className="mt-4 text-sm text-gray-500">
                  {lastScanTime && `Last verified: ${lastScanTime.toLocaleString()}`}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CleanIssuesTab;
