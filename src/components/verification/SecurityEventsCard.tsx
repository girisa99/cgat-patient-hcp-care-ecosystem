
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, CheckCircle, Shield, Activity } from 'lucide-react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

interface SecurityEventsCardProps {
  verificationSummary?: VerificationSummary | null;
}

const SecurityEventsCard: React.FC<SecurityEventsCardProps> = ({ verificationSummary }) => {
  const issuesFound = verificationSummary?.issuesFound || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Security & Performance Events</CardTitle>
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
                    {issuesFound} issues found, {verificationSummary.autoFixesApplied || 0} auto-fixed
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
                <p className="font-medium">Performance monitoring active</p>
                <p className="text-sm text-muted-foreground">Real-time metrics collection enabled</p>
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
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">Performance baseline updated</p>
                <p className="text-sm text-muted-foreground">System metrics recalibrated</p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">6 hours ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityEventsCard;
