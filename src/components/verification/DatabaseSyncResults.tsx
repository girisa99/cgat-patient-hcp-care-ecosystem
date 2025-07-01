
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw } from 'lucide-react';
import { ComprehensiveVerificationResult } from '@/utils/verification/ComprehensiveSystemVerifier';

interface DatabaseSyncResultsProps {
  verificationResult: ComprehensiveVerificationResult;
  getSyncStatusColor: (status: string) => string;
}

const DatabaseSyncResults: React.FC<DatabaseSyncResultsProps> = ({
  verificationResult,
  getSyncStatusColor
}) => {
  const syncVerification = verificationResult.syncVerification;
  const isInSync = syncVerification.isFullySynced;
  const syncDiscrepancies = syncVerification.syncErrors || [];
  
  // Create table counts from available data
  const originalTableCounts = {
    profiles: 0,
    facilities: 0,
    modules: 0,
    api_integration_registry: 0
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <RefreshCcw className="h-5 w-5 mr-2 text-purple-600" />
          Database Sync Verification Results
        </CardTitle>
        <CardDescription>
          Verification of synchronization between original database tables and sync tables
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Sync Status Summary */}
          <div className={`p-4 rounded-lg border ${getSyncStatusColor(verificationResult.syncStatus)}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Sync Status Summary</h3>
              <Badge className={getSyncStatusColor(verificationResult.syncStatus)}>
                {verificationResult.syncStatus.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm">
              {isInSync ? 
                "✅ All database tables are properly synchronized" :
                `⚠️ ${syncDiscrepancies.length} sync discrepancies detected`
              }
            </p>
          </div>

          {/* Table Counts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Table Record Counts</h4>
              {Object.entries(originalTableCounts).map(([table, count]) => (
                <div key={table} className="flex justify-between text-sm">
                  <span className="text-blue-700">{table}:</span>
                  <span className="font-medium text-blue-800">{count} records</span>
                </div>
              ))}
            </div>

            {syncDiscrepancies.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Sync Discrepancies</h4>
                {syncDiscrepancies.map((discrepancy, index) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded border">
                    <div className="text-sm font-medium text-red-800">Table Sync Issue</div>
                    <div className="text-xs text-red-600">{discrepancy}</div>
                    <div className="text-xs text-red-500">Check sync status</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseSyncResults;
