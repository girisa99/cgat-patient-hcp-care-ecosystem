
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { TrendingUp, Shield, Zap, Bell, Clock } from 'lucide-react';
import { ComprehensiveSecurityPerformanceSummary } from '@/utils/verification/EnhancedSecurityPerformanceOrchestrator';

interface SecurityStatusOverviewProps {
  comprehensiveSummary: ComprehensiveSecurityPerformanceSummary | null;
  lastScanTime: Date;
}

const SecurityStatusOverview: React.FC<SecurityStatusOverviewProps> = ({
  comprehensiveSummary,
  lastScanTime
}) => {
  return (
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-blue-500" />
          <div>
            <p className="text-2xl font-bold">{comprehensiveSummary?.overallHealthScore || 0}%</p>
            <p className="text-sm text-muted-foreground">System Health</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-green-500" />
          <div>
            <p className="text-2xl font-bold">{comprehensiveSummary?.securityScore || 0}%</p>
            <p className="text-sm text-muted-foreground">Security Score</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Zap className="h-8 w-8 text-yellow-500" />
          <div>
            <p className="text-2xl font-bold">{comprehensiveSummary?.performanceScore || 0}%</p>
            <p className="text-sm text-muted-foreground">Performance Score</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-red-500" />
          <div>
            <p className="text-2xl font-bold">{comprehensiveSummary?.alertingStatus.activeAlerts.length || 0}</p>
            <p className="text-sm text-muted-foreground">Active Alerts</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Clock className="h-8 w-8 text-purple-500" />
          <div>
            <p className="text-sm font-medium">Last Scan</p>
            <p className="text-xs text-muted-foreground">
              {lastScanTime.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  );
};

export default SecurityStatusOverview;
