
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TabSyncData } from '@/hooks/useTabSynchronization';
import { Shield, Code, Settings, Activity, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

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
    security: { fixed: securityFixed, total: 5, color: 'red' },
    uiux: { fixed: uiuxFixed, total: 1, color: 'blue' },
    codeQuality: { fixed: codeQualityFixed, total: 1, color: 'purple' },
    totalFixed: securityFixed + uiuxFixed + codeQualityFixed,
    totalCategories: 7
  };

  return (
    <div className="space-y-6">
      {/* Unified Overview Metrics */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Activity className="h-5 w-5" />
            System Metrics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-red-600">{syncData.totalActiveCount}</div>
              <div className="text-sm text-gray-600">Active Issues</div>
              <Badge variant="destructive" className="mt-2 text-xs">
                {syncData.criticalCount} Critical
              </Badge>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-green-600">{syncData.totalFixedCount}</div>
              <div className="text-sm text-gray-600">Total Fixed</div>
              <Badge variant="default" className="mt-2 text-xs bg-green-600">
                Complete
              </Badge>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{syncData.realFixesApplied}</div>
              <div className="text-sm text-gray-600">Manual Fixes</div>
              <Badge variant="outline" className="mt-2 text-xs">
                User Applied
              </Badge>
            </div>

            <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{syncData.backendFixedCount}</div>
              <div className="text-sm text-gray-600">Auto-Detected</div>
              <Badge variant="outline" className="mt-2 text-xs bg-blue-50">
                Backend
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Category Progress ({categoryMetrics.totalFixed}/{categoryMetrics.totalCategories})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-900">Security Issues</span>
              </div>
              <div className="text-xl font-bold text-red-700">{categoryMetrics.security.fixed}/{categoryMetrics.security.total}</div>
              <Badge variant={categoryMetrics.security.fixed === categoryMetrics.security.total ? "default" : "destructive"} className="mt-2">
                {categoryMetrics.security.fixed === categoryMetrics.security.total ? "Complete" : 
                 `${categoryMetrics.security.total - categoryMetrics.security.fixed} Remaining`}
              </Badge>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">UI/UX Issues</span>
              </div>
              <div className="text-xl font-bold text-blue-700">{categoryMetrics.uiux.fixed}/{categoryMetrics.uiux.total}</div>
              <Badge variant={categoryMetrics.uiux.fixed === categoryMetrics.uiux.total ? "default" : "destructive"} className="mt-2">
                {categoryMetrics.uiux.fixed === categoryMetrics.uiux.total ? "Complete" : 
                 `${categoryMetrics.uiux.total - categoryMetrics.uiux.fixed} Remaining`}
              </Badge>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">Code Quality</span>
              </div>
              <div className="text-xl font-bold text-purple-700">{categoryMetrics.codeQuality.fixed}/{categoryMetrics.codeQuality.total}</div>
              <Badge variant={categoryMetrics.codeQuality.fixed === categoryMetrics.codeQuality.total ? "default" : "destructive"} className="mt-2">
                {categoryMetrics.codeQuality.fixed === categoryMetrics.codeQuality.total ? "Complete" : 
                 `${categoryMetrics.codeQuality.total - categoryMetrics.codeQuality.fixed} Remaining`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Implementation Status - Only show if requested */}
      {showDetailed && (
        <Card className="bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <CheckCircle className="h-4 w-4" />
              Implementation Status Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="text-center p-2 bg-white rounded border">
                <div className="text-lg font-bold text-green-600">
                  {localStorage.getItem('mfa_enforcement_implemented') === 'true' ? '✅' : '❌'}
                </div>
                <div className="text-xs text-gray-700">MFA Security</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="text-lg font-bold text-green-600">
                  {localStorage.getItem('rbac_implementation_active') === 'true' ? '✅' : '❌'}
                </div>
                <div className="text-xs text-gray-700">RBAC Access</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="text-lg font-bold text-green-600">
                  {localStorage.getItem('log_sanitization_active') === 'true' ? '✅' : '❌'}
                </div>
                <div className="text-xs text-gray-700">Log Security</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="text-lg font-bold text-green-600">
                  {localStorage.getItem('uiux_improvements_applied') === 'true' ? '✅' : '❌'}
                </div>
                <div className="text-xs text-gray-700">UI/UX</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidatedMetricsDisplay;
