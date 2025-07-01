
import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Issue } from '@/types/issuesTypes';

interface IssueChangeTrackingProps {
  newIssues: Issue[];
  resolvedIssues: Issue[];
  reappearedIssues: Issue[];
}

const IssueChangeTracking: React.FC<IssueChangeTrackingProps> = ({
  newIssues,
  resolvedIssues,
  reappearedIssues
}) => {
  const hasChanges = newIssues.length > 0 || resolvedIssues.length > 0 || reappearedIssues.length > 0;
  
  if (!hasChanges) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {newIssues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-red-900">New Issues</h3>
          </div>
          <p className="text-2xl font-bold text-red-800">{newIssues.length}</p>
        </div>
      )}
      
      {resolvedIssues.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-green-900">Resolved</h3>
          </div>
          <p className="text-2xl font-bold text-green-800">{resolvedIssues.length}</p>
        </div>
      )}
      
      {reappearedIssues.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-900">Reappeared</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-800">{reappearedIssues.length}</p>
        </div>
      )}
    </div>
  );
};

export default IssueChangeTracking;
