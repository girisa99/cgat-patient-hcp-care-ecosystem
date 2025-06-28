
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  Shield,
  Database,
  Code,
  Palette,
  Bug
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
  // Properly categorize issues based on their actual content
  const categorizeIssues = (issues: any[]) => {
    const categories = {
      security: 0,
      database: 0,
      codeQuality: 0,
      uiux: 0,
      performance: 0
    };

    issues.forEach(issue => {
      const type = issue.type?.toLowerCase() || '';
      const message = issue.message?.toLowerCase() || '';
      const source = issue.source?.toLowerCase() || '';

      if (type.includes('security') || message.includes('security') || 
          message.includes('authentication') || message.includes('authorization') ||
          message.includes('mfa') || message.includes('rbac') || 
          message.includes('sanitiz') || message.includes('debug')) {
        categories.security++;
      } else if (type.includes('database') || message.includes('database') ||
                 message.includes('query') || message.includes('validation')) {
        categories.database++;
      } else if (type.includes('code quality') || message.includes('code') ||
                 message.includes('typescript') || message.includes('error handling')) {
        categories.codeQuality++;
      } else if (type.includes('ui/ux') || message.includes('ui') || 
                 message.includes('accessibility') || message.includes('interface')) {
        categories.uiux++;
      } else if (type.includes('performance') || message.includes('performance') ||
                 message.includes('caching') || message.includes('optimization')) {
        categories.performance++;
      }
    });

    return categories;
  };

  const activeCategories = categorizeIssues(processedData.allIssues || []);
  const fixedCategories = categorizeIssues(processedData.backendFixedIssues || []);

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
              {processedData.allIssues?.length || 0}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-700">Critical</span>
                <Badge className="bg-red-600">{processedData.criticalIssues?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-700">High</span>
                <Badge className="bg-orange-600">{processedData.highIssues?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-700">Medium</span>
                <Badge className="bg-yellow-600">{processedData.mediumIssues?.length || 0}</Badge>
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
              {processedData.totalRealFixesApplied || 0}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Backend Detected</span>
                <Badge className="bg-green-600">{processedData.autoDetectedBackendFixes || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Real Fixes Applied</span>
                <Badge className="bg-blue-600">{processedData.totalRealFixesApplied || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Issues by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Security</span>
              </div>
              <div className="flex flex-col items-end">
                <Badge className="bg-red-600">{activeCategories.security} active</Badge>
                <Badge className="bg-green-600 mt-1">{fixedCategories.security} fixed</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Database</span>
              </div>
              <div className="flex flex-col items-end">
                <Badge className="bg-blue-600">{activeCategories.database} active</Badge>
                <Badge className="bg-green-600 mt-1">{fixedCategories.database} fixed</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Code Quality</span>
              </div>
              <div className="flex flex-col items-end">
                <Badge className="bg-purple-600">{activeCategories.codeQuality} active</Badge>
                <Badge className="bg-green-600 mt-1">{fixedCategories.codeQuality} fixed</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-900">UI/UX</span>
              </div>
              <div className="flex flex-col items-end">
                <Badge className="bg-orange-600">{activeCategories.uiux} active</Badge>
                <Badge className="bg-green-600 mt-1">{fixedCategories.uiux} fixed</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Performance</span>
              </div>
              <div className="flex flex-col items-end">
                <Badge className="bg-gray-600">{activeCategories.performance} active</Badge>
                <Badge className="bg-green-600 mt-1">{fixedCategories.performance} fixed</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Progress */}
      <EnhancedDailyProgressTab />
    </div>
  );
};

export default ConsolidatedActiveVsFixedTab;
