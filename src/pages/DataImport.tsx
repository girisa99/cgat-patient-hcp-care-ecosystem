import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useDataImport } from '@/hooks/useDataImport';
import { Badge } from '@/components/ui/badge';

const DataImport: React.FC = () => {
  console.log('📥 Data Import page rendering');
  const { currentRole, hasAccess } = useRoleBasedNavigation();
  const { isLoading, importCSVData } = useDataImport();
  
  // Mock data for display
  const importHistory = [];
  const isImporting = isLoading;
  const importStatus = isLoading ? 'Processing imports...' : null;

  if (!hasAccess('/data-import')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Data Import.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Data Import">
      <div className="space-y-6">
        {/* Import Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{importHistory.length}</div>
              <div className="text-sm text-muted-foreground">Total Imports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {importHistory.filter((imp: any) => imp.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {importHistory.filter((imp: any) => imp.status === 'processing').length}
              </div>
              <div className="text-sm text-muted-foreground">Processing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {importHistory.filter((imp: any) => imp.status === 'failed').length}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Import Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Data Import & Migration
              <Badge variant={isImporting ? 'secondary' : 'outline'}>
                {isImporting ? 'Importing...' : 'Ready'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Manage data imports and migrations for users, patients, facilities, and system data.</p>
              
              {/* Import Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">User Data Import</h3>
                  <p className="text-sm text-muted-foreground">Import user profiles and role assignments</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">Patient Data Import</h3>
                  <p className="text-sm text-muted-foreground">Import patient records and medical data</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">Facility Data Import</h3>
                  <p className="text-sm text-muted-foreground">Import facility information and configurations</p>
                </div>
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">System Configuration</h3>
                  <p className="text-sm text-muted-foreground">Import system settings and module configurations</p>
                </div>
              </div>

              {/* Recent Import History */}
              {importHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Import History</h4>
                  {importHistory.slice(0, 5).map((importRecord: any) => (
                    <div key={importRecord.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{importRecord.type} Import</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(importRecord.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          importRecord.status === 'completed' ? 'default' : 
                          importRecord.status === 'processing' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {importRecord.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Current Status */}
              {importStatus && (
                <div className="p-4 bg-muted rounded">
                  <h4 className="font-medium">Current Import Status</h4>
                  <p className="text-sm text-muted-foreground">{importStatus}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DataImport;