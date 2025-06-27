
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';

interface VerificationStatusOverviewProps {
  verificationResult: AdminModuleVerificationResult;
}

const VerificationStatusOverview: React.FC<VerificationStatusOverviewProps> = ({
  verificationResult
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className={`h-8 w-8 ${getScoreColor(verificationResult.overallStabilityScore)}`} />
            <div>
              <p className={`text-2xl font-bold ${getScoreColor(verificationResult.overallStabilityScore)}`}>
                {verificationResult.overallStabilityScore}
              </p>
              <p className="text-xs text-muted-foreground">Stability Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center p-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{verificationResult.passedChecks.length}</p>
              <p className="text-xs text-muted-foreground">Passed Checks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center p-6">
          <div className="flex items-center space-x-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{verificationResult.failedChecks.length}</p>
              <p className="text-xs text-muted-foreground">Failed Checks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center p-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{verificationResult.criticalIssues.length}</p>
              <p className="text-xs text-muted-foreground">Critical Issues</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationStatusOverview;
