
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Eye, CheckCircle } from 'lucide-react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

interface SystemHealthCardProps {
  verificationSummary?: VerificationSummary | null;
}

const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ verificationSummary }) => {
  const systemHealth = [
    { component: 'Web Server', status: 'Healthy', uptime: '99.9%' },
    { component: 'Database', status: 'Healthy', uptime: '99.8%' },
    { component: 'API Gateway', status: 'Healthy', uptime: '99.7%' },
    { component: 'Authentication', status: 'Healthy', uptime: '100%' }
  ];

  const warningsCount = verificationSummary?.validationResult?.warnings?.length || 0;
  const issuesFound = verificationSummary?.issuesFound || 0;
  const criticalIssues = verificationSummary?.criticalIssues || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemHealth.map((system) => (
              <div key={system.component} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{system.component}</p>
                    <p className="text-sm text-muted-foreground">{system.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{system.uptime}</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Current System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold mb-2">
                {warningsCount}
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                Warnings
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold mb-2">
                {issuesFound}
              </div>
              <Badge className="bg-orange-100 text-orange-800">
                Issues
              </Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold mb-2">
                {criticalIssues}
              </div>
              <Badge className="bg-red-100 text-red-800">
                Critical
              </Badge>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                {criticalIssues === 0 
                  ? "No critical security threats detected" 
                  : `${criticalIssues} critical issues require immediate attention`
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthCard;
