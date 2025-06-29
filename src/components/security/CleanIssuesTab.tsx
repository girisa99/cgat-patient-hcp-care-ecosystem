
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, CheckCircle, Shield, Database, Code, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDatabaseIssues } from '@/hooks/useDatabaseIssues';
import EnhancedIssueTopicGroup from './EnhancedIssueTopicGroup';
import { CodeFix } from '@/utils/verification/ImprovedRealCodeFixHandler';
import { Issue } from '@/types/issuesTypes';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    lastScanTime,
    categorizedIssues,
    isLoading,
    error,
    refreshIssues
  } = useDatabaseIssues();

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
      // Record the fix in the database
      const { error: insertError } = await supabase
        .from('issue_fixes')
        .insert({
          issue_type: issue.type,
          issue_message: issue.message,
          issue_source: issue.source,
          issue_severity: issue.severity || 'medium',
          category: issue.source?.includes('Security') ? 'Security' : 
                   issue.source?.includes('Database') ? 'Database' :
                   issue.source?.includes('Code') ? 'Code Quality' : 'System',
          fix_method: 'manual',
          user_id: (await supabase.auth.getUser()).data.user?.id,
          metadata: { fix_description: fix.description }
        });

      if (insertError) throw insertError;

      // Remove from active issues
      if (issue.issueId) {
        const { error: deleteError } = await supabase
          .from('active_issues')
          .delete()
          .eq('id', issue.issueId);

        if (deleteError) throw deleteError;
      }

      // Refresh the data
      await refreshIssues();
      
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-red-900">Database Error</h3>
          </div>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <Button onClick={refreshIssues} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Database-First Issues Management</h3>
            </div>
            <p className="text-sm text-blue-700">
              All data sourced directly from database tables.
              {lastScanTime && ` Last updated: ${lastScanTime.toLocaleTimeString()}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshIssues} variant="outline" size="sm" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
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
          {categorizedIssues.total === 0 && !isLoading && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-medium text-green-900 mb-2">No Active Issues Found</h3>
              <p className="text-green-700">
                All identified issues have been resolved. Total fixes applied: {totalFixedCount}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-blue-700">Loading issues from database...</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fixed" className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <div className="text-4xl font-bold text-green-600 mb-2">{totalFixedCount}</div>
              <p className="text-gray-600 mb-4">Total fixes successfully applied to the system</p>
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
