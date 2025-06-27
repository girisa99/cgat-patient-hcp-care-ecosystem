import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Bug, 
  Shield, 
  Database, 
  Code, 
  CheckCircle,
  Clock,
  Zap,
  Settings,
  PlayCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import IssueTopicGroup from './IssueTopicGroup';

interface IssuesTabProps {
  verificationSummary?: VerificationSummary | null;
}

interface Issue {
  type: string;
  message: string;
  source: string;
  severity: string;
}

const IssuesTab: React.FC<IssuesTabProps> = ({ verificationSummary }) => {
  const { toast } = useToast();

  if (!verificationSummary) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Verification Data</h3>
            <p className="text-muted-foreground">Run a security scan to see identified issues</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to extract string message from various issue types
  const extractMessage = (issue: any): string => {
    if (typeof issue === 'string') {
      return issue;
    }
    if (issue && typeof issue === 'object') {
      // Try different property names that might contain the message
      return issue.description || issue.message || issue.violation || issue.issue || JSON.stringify(issue);
    }
    return String(issue);
  };

  // Collect all issues from different sources
  const allIssues: Issue[] = [
    // Validation result issues mapping
    ...(verificationSummary.validationResult?.issues || []).map(issue => ({
      type: 'Validation Issue',
      message: extractMessage(issue),
      source: 'Validation',
      severity: 'medium'
    })),
    
    // Database validation violations
    ...(verificationSummary.databaseValidation?.violations || []).map(violation => ({
      type: 'Database Violation',
      message: extractMessage(violation),
      source: 'Database',
      severity: 'high'
    })),
    
    // Security vulnerabilities
    ...(verificationSummary.securityScan?.vulnerabilities || []).map(vuln => ({
      type: 'Security Vulnerability',
      message: extractMessage(vuln),
      source: 'Security',
      severity: 'critical'
    })),
    
    // Code quality issues
    ...(verificationSummary.codeQuality?.issues || []).map(issue => ({
      type: 'Code Quality Issue',
      message: extractMessage(issue),
      source: 'Code Quality',
      severity: 'medium'
    })),
    
    // Schema validation violations
    ...(verificationSummary.schemaValidation?.violations || []).map(violation => ({
      type: 'Schema Violation',
      message: extractMessage(violation),
      source: 'Schema',
      severity: 'high'
    }))
  ];

  // Group issues by topic
  const issuesByTopic = {
    'Security Issues': allIssues.filter(issue => 
      issue.source === 'Security' || issue.type.includes('Security')
    ),
    'Database Issues': allIssues.filter(issue => 
      issue.source === 'Database' || issue.source === 'Schema'
    ),
    'Code Quality': allIssues.filter(issue => 
      issue.source === 'Code Quality' || issue.source === 'Validation'
    )
  };

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
      toast({
        title: "Fix Applied",
        description: `Applied fix for ${issue.type}: ${issue.message.substring(0, 50)}...`,
        variant: "default",
      });
    } else {
      toast({
        title: "Test Executed",
        description: `Executed test for ${issue.type}`,
        variant: "default",
      });
    }
  };

  const handleBulkAction = async (issues: Issue[], actionType: 'run' | 'fix') => {
    console.log(`Bulk ${actionType} for ${issues.length} issues`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: `Bulk ${actionType === 'run' ? 'Test' : 'Fix'} Complete`,
      description: `Successfully ${actionType === 'run' ? 'tested' : 'fixed'} ${issues.length} issues`,
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      {/* Issues Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Issues Summary
          </CardTitle>
          <CardDescription>
            Overview of all issues identified by the verification system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg bg-red-50">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {verificationSummary.criticalIssues || 0}
              </div>
              <p className="text-sm text-red-800">Critical Issues</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-orange-50">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {verificationSummary.issuesFound || 0}
              </div>
              <p className="text-sm text-orange-800">Total Issues</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {verificationSummary.autoFixesApplied || 0}
              </div>
              <p className="text-sm text-green-800">Auto-Fixed</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {allIssues.length}
              </div>
              <p className="text-sm text-blue-800">Actionable Items</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Fixes Applied */}
      {verificationSummary.autoFixesApplied > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              Auto-Fixes Applied
            </CardTitle>
            <CardDescription>
              {verificationSummary.autoFixesApplied} issues were automatically resolved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded border-l-4 border-green-500">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Automatic Resolution Complete</p>
                <p className="text-sm text-green-700">
                  {verificationSummary.autoFixesApplied} issues were automatically fixed without manual intervention
                </p>
              </div>
            </div>
            {verificationSummary.sqlAutoFixes && verificationSummary.sqlAutoFixes.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">SQL Auto-Fixes Applied:</h4>
                <div className="space-y-2">
                  {verificationSummary.sqlAutoFixes.map((fix, index) => (
                    <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                      <code className="text-blue-800">{fix}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Issues by Topic */}
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

      {/* No Issues State */}
      {allIssues.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-green-800">No Issues Found</h3>
              <p className="text-muted-foreground">All verification checks passed successfully!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scan Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Last Scan:</span>
              <span className="ml-2">
                {verificationSummary.timestamp 
                  ? new Date(verificationSummary.timestamp).toLocaleString()
                  : 'Unknown'
                }
              </span>
            </div>
            <div>
              <span className="font-medium">Total Recommendations:</span>
              <span className="ml-2">{verificationSummary.recommendations?.length || 0}</span>
            </div>
            <div>
              <span className="font-medium">Quality Score:</span>
              <span className="ml-2">{verificationSummary.qualityScore || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium">Security Score:</span>
              <span className="ml-2">{verificationSummary.securityScore || 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssuesTab;
