
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Database, RefreshCw, Download, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { ComprehensiveVerificationResult } from '@/utils/verification/ComprehensiveSystemVerifier';

interface ComprehensiveVerificationHeaderProps {
  verificationResult: ComprehensiveVerificationResult | null;
  isVerifying: boolean;
  onRunVerification: () => void;
  onDownloadReport: () => void;
  getStatusColor: (status: string) => string;
  getSyncStatusColor: (status: string) => string;
}

const ComprehensiveVerificationHeader: React.FC<ComprehensiveVerificationHeaderProps> = ({
  verificationResult,
  isVerifying,
  onRunVerification,
  onDownloadReport,
  getStatusColor,
  getSyncStatusColor
}) => {
  return (
    <Card className={verificationResult ? getStatusColor(verificationResult.overallStatus) : "bg-blue-50 border-blue-200"}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Comprehensive System Status
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={onRunVerification} 
              disabled={isVerifying}
              variant="outline"
              size="sm"
            >
              {isVerifying ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              {isVerifying ? 'Running Verification...' : 'Run Complete Verification'}
            </Button>
            <Button 
              onClick={onDownloadReport} 
              disabled={!verificationResult}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {verificationResult ? (
            <>
              <strong>🏥 COMPREHENSIVE VERIFICATION RESULTS</strong>
              <br />
              Overall Status: <Badge className={getStatusColor(verificationResult.overallStatus)}>
                {verificationResult.overallStatus.toUpperCase()}
              </Badge>
              <br />
              Sync Status: <Badge className={getSyncStatusColor(verificationResult.syncStatus)}>
                {verificationResult.syncStatus.replace('_', ' ').toUpperCase()}
              </Badge>
              <br />
              Health Score: {verificationResult.systemHealth.overallHealthScore}/100 | 
              Critical Issues: {verificationResult.criticalIssuesFound} | 
              Total Issues: {verificationResult.totalActiveIssues}
              <br />
              Last Verified: {new Date(verificationResult.verificationTimestamp).toLocaleString()}
            </>
          ) : (
            <>
              <strong>🔍 COMPREHENSIVE VERIFICATION READY</strong>
              <br />
              Click "Run Complete Verification" to perform:
              <br />
              • Real database health validation
              <br />
              • Database sync integrity checks
              <br />
              • Complete system status assessment
            </>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default ComprehensiveVerificationHeader;
