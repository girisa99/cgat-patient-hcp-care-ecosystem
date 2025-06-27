
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
    <StandardizedDashboardLayout
      showPageHeader={true}
      pageTitle="Audit Log"
      pageSubtitle="System activity and security audit trail"
    >
      <AuditLogStats />

      <AuditLogFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      <AuditLogList filters={filters} />
    </StandardizedDashboardLayout>
  );
};

export default AuditLog;
