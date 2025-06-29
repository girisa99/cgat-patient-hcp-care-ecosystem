
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Activity, Bug, Eye, Lock } from 'lucide-react';
import { VerificationSummary } from '@/utils/verification/AutomatedVerificationOrchestrator';
import { ComprehensiveSecurityPerformanceSummary } from '@/utils/verification/EnhancedSecurityPerformanceOrchestrator';
import SecurityMetrics from './SecurityMetrics';
import PerformanceMonitor from './PerformanceMonitor';
import ComplianceStatus from './ComplianceStatus';
import IssuesTab from './IssuesTab';
import SecurityLiveMonitoring from './SecurityLiveMonitoring';

interface SecurityDashboardTabsProps {
  lastSummary: VerificationSummary | null;
  comprehensiveSummary: ComprehensiveSecurityPerformanceSummary | null;
}

const SecurityDashboardTabs: React.FC<SecurityDashboardTabsProps> = React.memo(({
  lastSummary,
  comprehensiveSummary
}) => {
  return (
    <Tabs defaultValue="security" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance
        </TabsTrigger>
        <TabsTrigger value="issues" className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Issues
        </TabsTrigger>
        <TabsTrigger value="monitoring" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Live Monitoring
        </TabsTrigger>
        <TabsTrigger value="compliance" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Compliance
        </TabsTrigger>
      </TabsList>

      <TabsContent value="security" className="space-y-6 mt-6">
        <SecurityMetrics verificationSummary={lastSummary} />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6 mt-6">
        <PerformanceMonitor />
      </TabsContent>

      <TabsContent value="issues" className="space-y-6 mt-6">
        <IssuesTab verificationSummary={lastSummary} />
      </TabsContent>

      <TabsContent value="monitoring" className="space-y-6 mt-6">
        <SecurityLiveMonitoring comprehensiveSummary={comprehensiveSummary} />
      </TabsContent>

      <TabsContent value="compliance" className="space-y-6 mt-6">
        <ComplianceStatus />
      </TabsContent>
    </Tabs>
  );
});

SecurityDashboardTabs.displayName = 'SecurityDashboardTabs';

export default SecurityDashboardTabs;
