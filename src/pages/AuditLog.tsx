
import React, { useState } from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { AuditLogList } from '@/components/audit/AuditLogList';
import { AuditLogStats } from '@/components/audit/AuditLogStats';

const AuditLog = () => {
  const [filters, setFilters] = useState({});

  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground">
            View system activity and security events
          </p>
        </div>
        
        <AuditLogStats />
        <AuditLogList filters={filters} />
      </div>
    </StandardizedDashboardLayout>
  );
};

export default AuditLog;
