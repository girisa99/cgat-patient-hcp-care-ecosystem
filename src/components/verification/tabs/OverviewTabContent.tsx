
import React from 'react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';

interface OverviewTabContentProps {
  verificationResult: AdminModuleVerificationResult;
  fixedCount: number;
}

const OverviewTabContent: React.FC<OverviewTabContentProps> = ({
  verificationResult,
  fixedCount
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const activeIssues = Math.max(0, (verificationResult.criticalIssues.length + verificationResult.failedChecks.length) - fixedCount);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h4 className="font-semibold mb-2">Stability Report</h4>
        <div className="space-y-1 text-sm">
          {verificationResult.stabilityReport.map((line, index) => (
            <p key={index} className={line.startsWith('🎯') || line.startsWith('📈') || line.startsWith('🔒') ? 'font-medium' : ''}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Key Metrics</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Overall Score:</span>
            <span className={`font-bold ${getScoreColor(verificationResult.overallStabilityScore)}`}>
              {verificationResult.overallStabilityScore}/100
            </span>
          </div>
          <div className="flex justify-between">
            <span>UI/UX Score:</span>
            <span className="font-medium">{verificationResult.uiuxValidationResults?.overallScore || 'N/A'}/100</span>
          </div>
          <div className="flex justify-between">
            <span>Active Issues:</span>
            <span className={activeIssues > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
              {activeIssues}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Fixed Issues:</span>
            <span className="text-green-600 font-medium">{fixedCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={verificationResult.isStable ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {verificationResult.isStable ? 'Stable' : 'Unstable'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTabContent;
