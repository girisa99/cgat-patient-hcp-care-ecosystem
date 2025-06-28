
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TabSyncData } from '@/hooks/useTabSynchronization';
import { Shield, Code, Settings, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface ConsolidatedMetricsDisplayProps {
  syncData: TabSyncData;
  showDetailed?: boolean;
}

const ConsolidatedMetricsDisplay: React.FC<ConsolidatedMetricsDisplayProps> = ({
  syncData,
  showDetailed = false
}) => {
  // Calculate category-based metrics
  const securityFixed = [
    localStorage.getItem('mfa_enforcement_implemented') === 'true',
    localStorage.getItem('rbac_implementation_active') === 'true',
    localStorage.getItem('log_sanitization_active') === 'true',
    localStorage.getItem('debug_security_implemented') === 'true',
    localStorage.getItem('api_authorization_implemented') === 'true'
  ].filter(Boolean).length;

  const uiuxFixed = localStorage.getItem('uiux_improvements_applied') === 'true' ? 1 : 0;
  const codeQualityFixed = localStorage.getItem('code_quality_improved') === 'true' ? 1 : 0;

  const categoryMetrics = {
    security: { fixed: securityFixed, total: 5 },
    uiux: { fixed: uiuxFixed, total: 1 },
    codeQuality: { fixed: codeQualityFixed, total: 1 },
    totalFixed: securityFixed + uiuxFixed + codeQualityFixed,
    totalCategories: 7
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <TrendingUp className="h-5 w-5" />
          System Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-red-600">{syncData.totalActiveCount}</div>
            <div className="text-sm text-gray-600">Active Issues</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-green-600">{categoryMetrics.totalFixed}</div>
            <div className="text-sm text-gray-600">Fixed Issues</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{syncData.realFixesApplied}</div>
            <div className="text-sm text-gray-600">Manual Fixes</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{syncData.backendFixedCount}</div>
            <div className="text-sm text-gray-600">Auto-Fixed</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-900">Security</span>
            </div>
            <div className="text-xl font-bold text-red-700">{categoryMetrics.security.fixed}/{categoryMetrics.security.total}</div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">UI/UX</span>
            </div>
            <div className="text-xl font-bold text-blue-700">{categoryMetrics.uiux.fixed}/{categoryMetrics.uiux.total}</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-900">Code Quality</span>
            </div>
            <div className="text-xl font-bold text-purple-700">{categoryMetrics.codeQuality.fixed}/{categoryMetrics.codeQuality.total}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedMetricsDisplay;
