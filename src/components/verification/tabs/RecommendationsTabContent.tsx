
import React from 'react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';

interface RecommendationsTabContentProps {
  verificationResult: AdminModuleVerificationResult;
  fixedCount: number;
}

const RecommendationsTabContent: React.FC<RecommendationsTabContentProps> = ({
  verificationResult,
  fixedCount
}) => {
  return (
    <div className="space-y-2">
      {verificationResult.recommendations.map((rec, index) => (
        <p key={index} className={rec.startsWith('🔧') || rec.startsWith('📋') || rec.startsWith('🎨') || rec.startsWith('👥') ? 'font-semibold text-blue-600' : 'text-sm pl-4'}>
          {rec}
        </p>
      ))}
      {fixedCount > 0 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <h5 className="font-semibold text-green-800 mb-2">✅ Completed Actions</h5>
          <p className="text-sm text-green-700">
            {fixedCount} issues were automatically fixed and removed from the active issues list. 
            View the "Fixed" tab to see details of all resolved issues.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsTabContent;
