import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useConsolidatedDataImport } from '@/hooks/useConsolidatedDataImport';
import { History, Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const ImportHistory: React.FC = () => {
  const { importHistory, getImportStats } = useConsolidatedDataImport();
  const stats = getImportStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'processing':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const downloadReport = (importIndex: number) => {
    const importRecord = importHistory[importIndex];
    if (!importRecord) return;

    const report = {
      index: importIndex,
      timestamp: new Date().toISOString(),
      data: importRecord.data,
      successful: importRecord.success,
      error: importRecord.error
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-report-${importIndex}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Import Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalImports}</div>
              <div className="text-sm text-muted-foreground">Total Imports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.successfulImports}</div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failedImports}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalImports > 0 
                  ? Math.round((stats.successfulImports / stats.totalImports) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
        </CardHeader>
        <CardContent>
          {importHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No import history available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Errors</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importHistory.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.success ? 'completed' : 'failed')}
                        <Badge 
                          variant="outline" 
                          className={`border-${getStatusColor(record.success ? 'completed' : 'failed')}-200 text-${getStatusColor(record.success ? 'completed' : 'failed')}-700`}
                        >
                          {record.success ? 'completed' : 'failed'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Import</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date().toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {Array.isArray(record.data) ? record.data.length.toLocaleString() : 0}
                    </TableCell>
                    <TableCell>
                      {record.error ? 1 : 0}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(index)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};