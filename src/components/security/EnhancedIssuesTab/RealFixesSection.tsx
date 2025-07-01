
import React from 'react';
import { Zap } from 'lucide-react';
import { Issue } from '@/types/issuesTypes';
import { CodeFix } from '@/utils/verification/ImprovedRealCodeFixHandler';

interface RealFixesSectionProps {
  realFixedIssues: Array<{
    issue: Issue;
    fix: CodeFix;
    timestamp: string;
  }>;
}

const RealFixesSection: React.FC<RealFixesSectionProps> = ({
  realFixedIssues
}) => {
  if (realFixedIssues.length === 0) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4" />
        Real Code Fixes Applied ({realFixedIssues.length})
      </h3>
      <div className="space-y-2">
        {realFixedIssues.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
            <div>
              <span className="font-medium text-sm">{item.issue.type}</span>
              <p className="text-xs text-gray-600">{item.fix.description}</p>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealFixesSection;
