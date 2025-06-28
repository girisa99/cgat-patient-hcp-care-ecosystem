
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  RefreshCw, 
  Shield,
  Database,
  Code,
  Palette
} from 'lucide-react';
import { UnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { ProcessedIssuesData } from '@/types/issuesTypes';
import EnhancedDailyProgressTab from './EnhancedDailyProgressTab';

interface ConsolidatedActiveVsFixedTabProps {
  metrics: UnifiedMetrics;
  processedData: ProcessedIssuesData;
  onUpdate: () => void;
}

const ConsolidatedActiveVsFixedTab: React.FC<ConsolidatedActiveVsFixedTabProps> = ({
  metrics,
  processedData,
  onUpdate
}) => {
  return (
    <div className="space-y-6">
      {/* Active vs Fixed Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Active Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-800 mb-4">
              {metrics.totalActiveIssues}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-700">Critical</span>
                <Badge className="bg-red-600">{metrics.criticalActive}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-700">High</span>
                <Badge className="bg-orange-600">{metrics.highActive}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-700">Medium</span>
                <Badge className="bg-yellow-600">{metrics.mediumActive}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              Fixed Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800 mb-4">
              {metrics.totalFixedIssues}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Backend Detected</span>
                <Badge className="bg-green-600">{metrics.backendFixedCount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Real Fixes Applied</span>
                <Badge className="bg-blue-600">{metrics.realFixesApplied}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Issues by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Security</span>
              </div>
              <div className="flex flex-col items-end">
                <Badge className="bg-red-600">{metrics.securityActive} active</Badge>
                <Badge className="bg-green-600 mt-1">{metrics.securityFixed} fixed</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Database</span>
              </div>
              <div className="flex flex-col items-end">
                <Badge className="bg-blue-600">{metrics.databaseActive} active</Badge>
                <Badge className="bg-green-600 mt-1">{metrics.databaseFixed} fixed</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Code Quality</span>
              </div>
              <div className="flex flex-col items-end">
                <Badge className="bg-purple-600">{metrics.codeQualityActive} active</Badge>
                <Badge className="bg-green-600 mt-1">{metrics.codeQualityFixed} fixed</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-900">UI/UX</span>
              </div>
              <div className="flex flex-col items-end">
                <Badge className="bg-orange-600">{metrics.uiuxActive} active</Badge>
                <Badge className="bg-green-600 mt-1">{metrics.uiuxFixed} fixed</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database-Powered Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Database-Powered Daily Progress
            </div>
            <Button onClick={onUpdate} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedDailyProgressTab />
        </CardContent>
      </Card>

      {/* Metrics Status */}
      <Card className={metrics.countsAligned ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${metrics.countsAligned ? 'text-green-900' : 'text-yellow-900'}`}>
            <RefreshCw className={`h-5 w-5 ${metrics.isUpdating ? 'animate-spin' : ''}`} />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${metrics.countsAligned ? 'text-green-700' : 'text-yellow-700'}`}>
                {metrics.countsAligned ? 
                  '✅ All metrics synchronized with database' : 
                  '🔄 Synchronizing metrics...'
                }
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Last updated: {metrics.lastUpdateTime.toLocaleTimeString()} | Source: {metrics.updateSource}
              </p>
            </div>
            <Button onClick={onUpdate} size="sm" disabled={metrics.isUpdating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${metrics.isUpdating ? 'animate-spin' : ''}`} />
              {metrics.isUpdating ? 'Updating...' : 'Refresh Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsolidatedActiveVsFixedTab;
