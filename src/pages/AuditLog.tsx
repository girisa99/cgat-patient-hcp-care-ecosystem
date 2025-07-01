
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shield, Activity, Database, AlertTriangle } from 'lucide-react';
import { AuditLogList } from '@/components/audit/AuditLogList';
import { AuditLogFilters } from '@/components/audit/AuditLogFilters';
import { useAuditLogs } from '@/hooks/useAuditLogs';

const AuditLog = () => {
  const [filters, setFilters] = useState({});
  
  // Use consolidated audit logs hook with proper destructuring
  const { auditLogs, isLoading, error, refetch, getAuditStats } = useAuditLogs();
  const stats = getAuditStats();

  console.log('🔍 Audit Log Debug:', {
    auditLogs,
    isLoading,
    error,
    stats,
    filters
  });

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refetch();
  };

  // Calculate stats from real data with proper fallbacks
  const totalLogs = stats.total;
  const todayLogs = stats.today;
  const filteredCount = auditLogs.length;

  const headerActions = (
    <Button onClick={handleRefresh} disabled={isLoading}>
      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );

  return (
    <MainLayout>
      <PageContainer
        title="Audit Log"
        subtitle="View system activity and security events with real-time data"
        headerActions={headerActions}
      >
        <div className="space-y-6">
          {/* Stats Grid */}
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

          {/* Filters */}
          <AuditLogFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />

          {/* Audit Logs List with Real-time Updates */}
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <AuditLogList 
                auditLogs={auditLogs}
                isLoading={isLoading}
                error={error}
                filters={filters}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default AuditLog;
