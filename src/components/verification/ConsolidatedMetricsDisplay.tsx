
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Shield, Bug, Zap, RefreshCw } from 'lucide-react';
import { TabSyncData } from '@/hooks/useTabSynchronization';

interface ConsolidatedMetricsDisplayProps {
  syncData: TabSyncData;
  showDetailed?: boolean;
}

const ConsolidatedMetricsDisplay: React.FC<ConsolidatedMetricsDisplayProps> = ({
  syncData,
  showDetailed = false
}) => {
  const totalIssues = syncData.totalActiveCount;
  const fixedIssues = syncData.totalFixedCount;
  const criticalIssues = syncData.criticalCount;
  const securityIssues = syncData.securityIssuesCount;

  return (
    <div className="space-y-4">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Bug className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-800">{totalIssues}</div>
            <div className="text-sm text-red-600">Active Issues</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-800">{fixedIssues}</div>
            <div className="text-sm text-green-600">Fixed Issues</div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-800">{criticalIssues}</div>
            <div className="text-sm text-orange-600">Critical</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-800">{securityIssues}</div>
            <div className="text-sm text-purple-600">Security</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <RefreshCw className="h-5 w-5" />
            Real-time Issue Detection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Badge variant="default" className="bg-blue-600 mb-2">
                <Zap className="h-3 w-3 mr-1" />
                Live Scanning
              </Badge>
              <div className="text-sm text-blue-700">
                Real-time backend issue detection active
              </div>
            </div>
            
            <div className="text-center">
              <Badge variant="outline" className="border-green-500 text-green-700 mb-2">
                Backend Sync
              </Badge>
              <div className="text-sm text-gray-600">
                Auto-detecting fixes: {syncData.backendFixedCount}
              </div>
            </div>
            
            <div className="text-center">
              <Badge variant="outline" className="border-purple-500 text-purple-700 mb-2">
                Last Update
              </Badge>
              <div className="text-sm text-gray-600">
                {syncData.lastUpdateTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown (if requested) */}
      {showDetailed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800">Issue Breakdown by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-red-800 font-medium">Critical Issues</span>
                <Badge variant="destructive">{criticalIssues}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="text-orange-800 font-medium">High Priority</span>
                <Badge variant="outline" className="border-orange-500 text-orange-700">
                  {syncData.highCount}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <span className="text-yellow-800 font-medium">Medium Priority</span>
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                  {syncData.mediumCount}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                <span className="text-purple-800 font-medium">Security Issues</span>
                <Badge variant="outline" className="border-purple-500 text-purple-700">
                  {securityIssues}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Issues Alert */}
      {totalIssues > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-800">
                  {totalIssues} Active Issues Detected
                </div>
                <div className="text-sm text-yellow-700">
                  Real-time backend scanning found issues that need attention. 
                  {criticalIssues > 0 && ` ${criticalIssues} are critical priority.`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidatedMetricsDisplay;
