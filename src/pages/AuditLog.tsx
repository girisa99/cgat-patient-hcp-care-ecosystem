
import React, { useState } from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { AdminPageWrapper, AdminStatsGrid, StatCard } from '@/components/layout/AdminPageWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shield, Activity, Database, AlertTriangle } from 'lucide-react';
import { AuditLogList } from '@/components/audit/AuditLogList';
import { AuditLogFilters } from '@/components/audit/AuditLogFilters';
import { useAuditLogs, useAuditLogStats } from '@/hooks/useAuditLogs';

const AuditLog = () => {
  const [filters, setFilters] = useState({});
  
  // Use REAL audit logs data, not mock data
  const { data: auditLogsResponse, isLoading, error, refetch } = useAuditLogs(filters);
  const { data: stats } = useAuditLogStats();

  console.log('🔍 Audit Log Debug:', {
    auditLogsResponse,
    isLoading,
    error,
    stats,
    filters
  });

  const auditLogs = auditLogsResponse?.data || [];
  
  // Provide proper default values for metadata with correct typing
  const metadata = auditLogsResponse?.metadata || {
    total_logs: 0,
    today_logs: 0,
    filtered_count: 0
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleRefresh = () => {
    refetch();
  };

  // Calculate stats from real data with proper fallbacks
  const totalLogs = metadata.total_logs;
  const todayLogs = metadata.today_logs;
  const filteredCount = metadata.filtered_count || auditLogs.length;

  const statsContent = (
    <AdminStatsGrid columns={4}>
      <StatCard
        title="Total Audit Logs"
        value={totalLogs}
        icon={Database}
        description="All system audit entries"
      />
      <StatCard
        title="Today's Activity"
        value={todayLogs}
        icon={Activity}
        description="Logs created today"
      />
      <StatCard
        title="Filtered Results"
        value={filteredCount}
        icon={Shield}
        description="Current filter results"
      />
      <StatCard
        title="System Status"
        value={error ? "Error" : "Active"}
        icon={error ? AlertTriangle : Activity}
        description="Audit system status"
      />
    </AdminStatsGrid>
  );

  const headerActions = (
    <Button onClick={handleRefresh} disabled={isLoading}>
      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );

  return (
    <StandardizedDashboardLayout>
      <AdminPageWrapper
        title="Audit Log"
        subtitle="View system activity and security events with real-time data"
        headerActions={headerActions}
        showStats={true}
        statsContent={statsContent}
        variant="full-width"
        contentPadding="md"
      >
        <div className="space-y-6">
          {/* Filters */}
          <AuditLogFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />

          {/* Audit Logs List - NO MOCK DATA, REAL DATA ONLY */}
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <AuditLogList 
                auditLogs={auditLogs}
                isLoading={isLoading}
                error={error}
                filters={filters}
              />
            </CardContent>
          </Card>
        </div>
      </AdminPageWrapper>
    </StandardizedDashboardLayout>
  );
};

export default AuditLog;
