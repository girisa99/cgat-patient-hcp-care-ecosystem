
import React, { useState } from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { AuditLogStats } from '@/components/audit/AuditLogStats';
import { AuditLogFilters } from '@/components/audit/AuditLogFilters';
import { AuditLogList } from '@/components/audit/AuditLogList';

const AuditLog = () => {
  const [filters, setFilters] = useState<{
    action_type?: string;
    table_name?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }>({
    limit: 100
  });

  const handleFiltersChange = (newFilters: any) => {
    console.log('🔄 Updating audit log filters:', newFilters);
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    console.log('🧹 Clearing audit log filters');
    setFilters({ limit: 100 });
  };

  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">
            System activity and security audit trail
          </p>
        </div>

        <AuditLogStats />

        <AuditLogFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        <AuditLogList filters={filters} />
      </div>
    </StandardizedDashboardLayout>
  );
};

export default AuditLog;
