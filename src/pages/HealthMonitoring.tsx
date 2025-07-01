
import React from 'react';
import HealthDashboard from '@/components/monitoring/HealthDashboard';
import EnhancedSystemStatusDisplay from '@/components/verification/EnhancedSystemStatusDisplay';

const HealthMonitoring: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Health Monitoring</h1>
        <p className="text-muted-foreground mt-2">
          Monitor system health, performance, and error metrics
        </p>
      </div>
      
      <EnhancedSystemStatusDisplay />
      <HealthDashboard />
    </div>
  );
};

export default HealthMonitoring;
