
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
  Zap
} from 'lucide-react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

interface IssuesTabProps {
  verificationSummary?: VerificationSummary | null;
}

const IssuesTab: React.FC<IssuesTabProps> = ({ verificationSummary }) => {
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

  const getSeverityColor = (type: string) => {
    if (type.includes('critical') || type.includes('Critical')) return 'destructive';
    if (type.includes('security') || type.includes('Security')) return 'destructive';
    if (type.includes('database') || type.includes('Database')) return 'default';
    return 'secondary';
  };

  const getSeverityIcon = (type: string) => {
    if (type.includes('critical') || type.includes('Critical')) return AlertTriangle;
    if (type.includes('security') || type.includes('Security')) return Shield;
    if (type.includes('database') || type.includes('Database')) return Database;
    if (type.includes('code') || type.includes('Code')) return Code;
    return Bug;
  };

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
  const allIssues = [
    // Validation result issues
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
              <p className="text-sm text-blue-800">Detailed Items</p>
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

      {/* Detailed Issues List */}
      {allIssues.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Detailed Issues
            </CardTitle>
            <CardDescription>
              All issues identified during the last verification scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allIssues.map((issue, index) => {
                const Icon = getSeverityIcon(issue.type);
                return (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(issue.type) as any}>
                          {issue.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {issue.source}
                        </Badge>
                      </div>
                      <p className="text-sm">{issue.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
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
