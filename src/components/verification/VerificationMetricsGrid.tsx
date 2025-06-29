
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, Activity, RefreshCcw } from 'lucide-react';
import { ComprehensiveVerificationResult } from '@/utils/verification/ComprehensiveSystemVerifier';

interface VerificationMetricsGridProps {
  verificationResult: ComprehensiveVerificationResult;
  getSyncStatusColor: (status: string) => string;
}

const VerificationMetricsGrid: React.FC<VerificationMetricsGridProps> = ({
  verificationResult,
  getSyncStatusColor
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-800 flex items-center text-sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Critical Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-red-800">{verificationResult.criticalIssuesFound}</div>
          <div className="text-xs text-red-600">Immediate attention required</div>
        </CardContent>
      </Card>
      
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-orange-800 flex items-center text-sm">
            <Shield className="h-4 w-4 mr-2" />
            Total Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-orange-800">{verificationResult.totalActiveIssues}</div>
          <div className="text-xs text-orange-600">All active issues</div>
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 flex items-center text-sm">
            <Activity className="h-4 w-4 mr-2" />
            Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-blue-800">{verificationResult.systemHealth.overallHealthScore}%</div>
          <div className="text-xs text-blue-600">System health rating</div>
        </CardContent>
      </Card>
      
      <Card className={getSyncStatusColor(verificationResult.syncStatus)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold">{verificationResult.syncVerification.syncDiscrepancies.length}</div>
          <div className="text-xs">Sync discrepancies found</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationMetricsGrid;
