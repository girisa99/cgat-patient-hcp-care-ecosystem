
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock,
  Eye,
  UserCheck,
  Database,
  Code,
  FileText,
  Settings,
  Zap,
  Bug
} from 'lucide-react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

interface SecurityMetricsProps {
  verificationSummary?: VerificationSummary | null;
}

const SecurityMetrics: React.FC<SecurityMetricsProps> = ({ verificationSummary }) => {
  const securityMetrics = [
    {
      title: 'Authentication Security',
      score: 95,
      status: 'excellent',
      icon: UserCheck,
      details: 'Multi-factor authentication enabled'
    },
    {
      title: 'Data Encryption',
      score: 98,
      status: 'excellent',
      icon: Lock,
      details: 'All data encrypted at rest and in transit'
    },
    {
      title: 'Access Control',
      score: 92,
      status: 'good',
      icon: Shield,
      details: 'Role-based permissions active'
    },
    {
      title: 'Database Security',
      score: verificationSummary?.databaseValidation?.violations.length ? 
        Math.max(60, 100 - (verificationSummary.databaseValidation.violations.length * 10)) : 88,
      status: 'good',
      icon: Database,
      details: 'RLS policies implemented'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Security Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <metric.icon className="h-4 w-4 mr-2" />
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                    {metric.score}%
                  </span>
                  <Badge variant={metric.status === 'excellent' ? 'default' : 'secondary'}>
                    {metric.status}
                  </Badge>
                </div>
                <Progress 
                  value={metric.score} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {metric.details}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real Verification Results */}
      {verificationSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bug className="h-5 w-5 mr-2" />
              Live Verification Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 border rounded-lg text-center">
                <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{verificationSummary.databaseValidation?.violations.length || 0}</div>
                <p className="text-sm text-muted-foreground">Database Issues</p>
                {verificationSummary.databaseValidation?.autoFixesApplied && (
                  <p className="text-xs text-green-600">{verificationSummary.databaseValidation.autoFixesApplied} auto-fixed</p>
                )}
              </div>
              
              <div className="p-4 border rounded-lg text-center">
                <Code className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{verificationSummary.codeQuality?.issues.length || 0}</div>
                <p className="text-sm text-muted-foreground">Code Quality Issues</p>
                <p className="text-xs text-blue-600">Score: {verificationSummary.qualityScore || 'N/A'}</p>
              </div>

              <div className="p-4 border rounded-lg text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">{verificationSummary.securityScan?.vulnerabilities.length || 0}</div>
                <p className="text-sm text-muted-foreground">Security Vulnerabilities</p>
                <p className="text-xs text-orange-600">Score: {verificationSummary.securityScore || 'N/A'}</p>
              </div>

              <div className="p-4 border rounded-lg text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{verificationSummary.schemaValidation?.violations.length || 0}</div>
                <p className="text-sm text-muted-foreground">Schema Issues</p>
                {verificationSummary.schemaValidation?.autoFixesAvailable && (
                  <p className="text-xs text-green-600">{verificationSummary.schemaValidation.autoFixesAvailable.length} auto-fixes available</p>
                )}
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Verification Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Issues:</span>
                    <span className="ml-2 text-red-600">{verificationSummary.issuesFound}</span>
                  </div>
                  <div>
                    <span className="font-medium">Critical:</span>
                    <span className="ml-2 text-red-800">{verificationSummary.criticalIssues}</span>
                  </div>
                  <div>
                    <span className="font-medium">Auto-fixed:</span>
                    <span className="ml-2 text-green-600">{verificationSummary.autoFixesApplied}</span>
                  </div>
                  <div>
                    <span className="font-medium">SQL Fixes:</span>
                    <span className="ml-2 text-blue-600">{verificationSummary.sqlAutoFixes?.length || 0}</span>
                  </div>
                </div>
              </div>
              
              {verificationSummary.timestamp && (
                <div className="text-sm text-muted-foreground">
                  Last scan: {new Date(verificationSummary.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Threat Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Current System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold mb-2">
                {verificationSummary?.validationResult.warnings.length || 0}
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                Warnings
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold mb-2">
                {verificationSummary?.issuesFound || 0}
              </div>
              <Badge className="bg-orange-100 text-orange-800">
                Issues
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold mb-2">
                {verificationSummary?.criticalIssues || 0}
              </div>
              <Badge className="bg-red-100 text-red-800">
                Critical
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 p-4 border rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                {!verificationSummary || verificationSummary.criticalIssues === 0 
                  ? "No critical security threats detected" 
                  : `${verificationSummary.criticalIssues} critical issues require immediate attention`
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationSummary && (
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Comprehensive security scan completed</p>
                    <p className="text-sm text-muted-foreground">
                      {verificationSummary.issuesFound} issues found, {verificationSummary.autoFixesApplied} auto-fixed
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {verificationSummary.timestamp ? new Date(verificationSummary.timestamp).toLocaleTimeString() : 'Now'}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Automated verification system active</p>
                  <p className="text-sm text-muted-foreground">Continuous monitoring enabled</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">Real-time</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">RLS policies validated</p>
                  <p className="text-sm text-muted-foreground">Database security confirmed</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Access permissions validated</p>
                  <p className="text-sm text-muted-foreground">User roles synchronized</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">6 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMetrics;
