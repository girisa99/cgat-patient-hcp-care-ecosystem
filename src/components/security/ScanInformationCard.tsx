
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';

interface ScanInformationCardProps {
  verificationSummary?: VerificationSummary | null;
  displayIssuesCount: number;
  fixedCount: number;
}

const ScanInformationCard: React.FC<ScanInformationCardProps> = ({
  verificationSummary,
  displayIssuesCount,
  fixedCount
}) => {
  return (
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
              {verificationSummary?.timestamp 
                ? new Date(verificationSummary.timestamp).toLocaleString()
                : 'Unknown'
              }
            </span>
          </div>
          <div>
            <span className="font-medium">Active Issues:</span>
            <span className="ml-2">{displayIssuesCount}</span>
          </div>
          <div>
            <span className="font-medium">Fixed Issues:</span>
            <span className="ml-2 text-green-600 font-medium">{fixedCount}</span>
          </div>
          <div>
            <span className="font-medium">Security Score:</span>
            <span className="ml-2">{verificationSummary?.securityScore || 'N/A'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScanInformationCard;
