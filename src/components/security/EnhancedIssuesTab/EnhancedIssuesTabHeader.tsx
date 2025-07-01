
import React from 'react';
import { Zap } from 'lucide-react';

interface EnhancedIssuesTabHeaderProps {
  realFixedCount: number;
}

const EnhancedIssuesTabHeader: React.FC<EnhancedIssuesTabHeaderProps> = ({
  realFixedCount
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-5 w-5 text-blue-600" />
        <h3 className="font-medium text-blue-900">Enhanced Real Fix System Active</h3>
      </div>
      <p className="text-sm text-blue-700">
        This system applies real code and database fixes. When you click "Fix", actual changes are made to resolve issues permanently.
      </p>
      {realFixedCount > 0 && (
        <p className="text-sm text-blue-700 font-medium mt-1">
          ✅ {realFixedCount} real fixes have been applied to your codebase
        </p>
      )}
    </div>
  );
};

export default EnhancedIssuesTabHeader;
