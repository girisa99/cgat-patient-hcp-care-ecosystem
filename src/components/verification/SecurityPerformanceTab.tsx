
import React from 'react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import SecurityMetricsCard from './SecurityMetricsCard';
import PerformanceMetricsCard from './PerformanceMetricsCard';
import SystemHealthCard from './SystemHealthCard';
import PerformanceTrendsCard from './PerformanceTrendsCard';
import SecurityEventsCard from './SecurityEventsCard';

interface SecurityPerformanceTabProps {
  verificationSummary?: VerificationSummary | null;
}

const SecurityPerformanceTab: React.FC<SecurityPerformanceTabProps> = ({ verificationSummary }) => {
  return (
    <div className="space-y-6">
      <SecurityMetricsCard verificationSummary={verificationSummary} />
      <PerformanceMetricsCard />
      <SystemHealthCard verificationSummary={verificationSummary} />
      <PerformanceTrendsCard />
      <SecurityEventsCard verificationSummary={verificationSummary} />
    </div>
  );
};

export default SecurityPerformanceTab;
