
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { ComprehensiveSecurityPerformanceSummary } from '@/utils/verification/EnhancedSecurityPerformanceOrchestrator';

interface SecurityDashboardHeaderProps {
  comprehensiveSummary: ComprehensiveSecurityPerformanceSummary | null;
  isMonitoringActive: boolean;
  isScanning: boolean;
  onSecurityScan: () => void;
}

const SecurityDashboardHeader: React.FC<SecurityDashboardHeaderProps> = ({
  comprehensiveSummary,
  isMonitoringActive,
  isScanning
}) => {
  const getOverallStatus = () => {
    if (!comprehensiveSummary) return { text: 'Initializing', color: 'secondary', icon: Shield };
    
    if (comprehensiveSummary.criticalSecurityIssues > 0) {
      return { text: 'Critical Security Issues', color: 'destructive', icon: AlertTriangle };
    }
    if (comprehensiveSummary.criticalPerformanceIssues > 0) {
      return { text: 'Critical Performance Issues', color: 'destructive', icon: AlertTriangle };
    }
    if (comprehensiveSummary.securityStatus === 'secure' && comprehensiveSummary.performanceStatus === 'excellent') {
      return { text: 'Excellent', color: 'default', icon: CheckCircle };
    }
    if (comprehensiveSummary.overallHealthScore >= 80) {
      return { text: 'Good', color: 'default', icon: CheckCircle };
    }
    return { text: 'Needs Attention', color: 'default', icon: AlertTriangle };
  };

  const status = getOverallStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-6 w-6 mr-2 text-blue-600" />
            Comprehensive Security & Performance Center
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <status.icon className="h-4 w-4" />
              <Badge variant={status.color as any}>{status.text}</Badge>
            </div>
            {isMonitoringActive && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Activity className="h-3 w-3 mr-1" />
                Manual Mode
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default SecurityDashboardHeader;
