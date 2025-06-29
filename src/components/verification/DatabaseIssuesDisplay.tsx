
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';
import { ComprehensiveVerificationResult } from '@/utils/verification/ComprehensiveSystemVerifier';

interface DatabaseIssuesDisplayProps {
  verificationResult: ComprehensiveVerificationResult;
}

const DatabaseIssuesDisplay: React.FC<DatabaseIssuesDisplayProps> = ({
  verificationResult
}) => {
  if (!verificationResult.systemHealth.databaseHealth.issues.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          Database Issues Found
        </CardTitle>
        <CardDescription>
          Issues detected from live database validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {verificationResult.systemHealth.databaseHealth.issues.map((issue, index) => (
            <div key={issue.id || index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={issue.severity === 'critical' ? 'destructive' : 'outline'}
                    className={
                      issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }
                  >
                    {issue.severity.toUpperCase()}
                  </Badge>
                  <span className="font-medium text-sm">{issue.type.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-1">{issue.description}</p>
              <p className="text-xs text-gray-500">Table: {issue.table}</p>
              <p className="text-xs text-blue-600 mt-1">💡 {issue.recommendation}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseIssuesDisplay;
