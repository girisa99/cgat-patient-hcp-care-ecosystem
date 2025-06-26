
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw, Download, Calendar } from 'lucide-react';
import { AuditLogEntry } from './AuditLogEntry';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useQueryClient } from '@tanstack/react-query';

interface AuditLogListProps {
  filters: any;
}

export const AuditLogList = ({ filters }: AuditLogListProps) => {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch, isFetching } = useAuditLogs(filters);

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    // Invalidate and refetch the query
    await queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    refetch();
  };

  const handleExport = async () => {
    console.log('🔄 Exporting audit logs...');
    // TODO: Implement export functionality
  };

  const getTodayCount = () => {
    if (!data?.data) return 0;
    const today = new Date().toDateString();
    return data.data.filter(log => {
      const logDate = new Date(log.created_at).toDateString();
      return logDate === today;
    }).length;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-destructive">Error loading audit logs: {error.message}</p>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="mt-4"
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
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
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Today: {getTodayCount()}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isFetching) ? 'animate-spin' : ''}`} />
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
            {data.data.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No audit logs found for today.</p>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="mt-4"
                  disabled={isFetching}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                  Check Again
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No audit logs found with current filters.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or refresh to see recent activity.
            </p>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="mt-4"
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
