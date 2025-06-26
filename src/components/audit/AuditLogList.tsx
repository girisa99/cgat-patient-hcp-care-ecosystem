
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw, Download } from 'lucide-react';
import { AuditLogEntry } from './AuditLogEntry';
import { useAuditLogs } from '@/hooks/useAuditLogs';

interface AuditLogListProps {
  filters: any;
}

export const AuditLogList = ({ filters }: AuditLogListProps) => {
  const { data, isLoading, error, refetch } = useAuditLogs(filters);

  const handleExport = async () => {
    console.log('🔄 Exporting audit logs...');
    // TODO: Implement export functionality
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-destructive">Error loading audit logs: {error.message}</p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Activity
            {data?.metadata && (
              <span className="text-sm font-normal text-muted-foreground">
                ({data.metadata.filtered_count} of {data.metadata.total_logs})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <div className="space-y-4">
            {data.data.map((log) => (
              <AuditLogEntry key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No audit logs found with current filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
