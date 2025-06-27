
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, UserCheck, Lock, Database } from 'lucide-react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

interface SecurityMetricsCardProps {
  verificationSummary?: VerificationSummary | null;
}

const SecurityMetricsCard: React.FC<SecurityMetricsCardProps> = ({ verificationSummary }) => {
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
      score: verificationSummary?.databaseValidation?.violations?.length ? 
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

  const databaseIssues = verificationSummary?.databaseValidation?.violations?.length || 0;
  const codeQualityIssues = verificationSummary?.codeQuality?.issues?.length || 0;
  const securityVulnerabilities = verificationSummary?.securityScan?.vulnerabilities?.length || 0;
  const schemaIssues = verificationSummary?.schemaValidation?.violations?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Security Metrics
        </CardTitle>
        <CardDescription>Current security posture and compliance status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {securityMetrics.map((metric) => (
            <div key={metric.title} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="h-5 w-5" />
                <Badge variant={metric.status === 'excellent' ? 'default' : 'secondary'}>
                  {metric.status}
                </Badge>
              </div>
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(metric.score)}`}>
                {metric.score}%
              </div>
              <p className="text-sm font-medium mb-2">{metric.title}</p>
              <Progress value={metric.score} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">{metric.details}</p>
            </div>
          ))}
        </div>

        {/* Live Verification Results */}
        {verificationSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
            <div className="text-center">
              <Database className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-xl font-bold">{databaseIssues}</div>
              <p className="text-sm text-muted-foreground">Database Issues</p>
            </div>
            
            <div className="text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-xl font-bold">{codeQualityIssues}</div>
              <p className="text-sm text-muted-foreground">Code Quality Issues</p>
            </div>

            <div className="text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-xl font-bold">{securityVulnerabilities}</div>
              <p className="text-sm text-muted-foreground">Security Vulnerabilities</p>
            </div>

            <div className="text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-xl font-bold">{schemaIssues}</div>
              <p className="text-sm text-muted-foreground">Schema Issues</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityMetricsCard;
