
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug } from 'lucide-react';

interface IssuesSummaryCardProps {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  fixedCount: number;
}

const IssuesSummaryCard: React.FC<IssuesSummaryCardProps> = ({
  criticalCount,
  highCount,
  mediumCount,
  fixedCount
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Active Issues Summary
        </CardTitle>
        <CardDescription>
          Overview of active issues by severity - fixed issues are tracked separately
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg bg-red-50">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {criticalCount}
            </div>
            <p className="text-sm text-red-800">Critical Issues</p>
          </div>
          <div className="text-center p-4 border rounded-lg bg-orange-50">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {highCount}
            </div>
            <p className="text-sm text-orange-800">High Priority</p>
          </div>
          <div className="text-center p-4 border rounded-lg bg-yellow-50">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {mediumCount}
            </div>
            <p className="text-sm text-yellow-800">Medium Priority</p>
          </div>
          <div className="text-center p-4 border rounded-lg bg-green-50">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {fixedCount}
            </div>
            <p className="text-sm text-green-800">Total Fixed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssuesSummaryCard;
