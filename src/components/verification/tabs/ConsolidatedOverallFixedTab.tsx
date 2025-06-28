import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, TrendingUp, Calendar, BarChart3, Shield, Eye, Database, Code } from 'lucide-react';
import { UnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { ProcessedIssuesData } from '@/types/issuesTypes';
import DailyProgressTab from './DailyProgressTab';

interface ConsolidatedOverallFixedTabProps {
  metrics: UnifiedMetrics;
  processedData: ProcessedIssuesData;
}

const ConsolidatedOverallFixedTab: React.FC<ConsolidatedOverallFixedTabProps> = ({
  metrics,
  processedData
}) => {
  const implementationProgress = [
    { name: 'Multi-Factor Authentication', key: 'mfa_enforcement_implemented', category: 'Security' },
    { name: 'Role-Based Access Control', key: 'rbac_implementation_active', category: 'Security' },
    { name: 'Log Sanitization', key: 'log_sanitization_active', category: 'Security' },
    { name: 'Debug Security', key: 'debug_security_implemented', category: 'Security' },
    { name: 'API Authorization', key: 'api_authorization_implemented', category: 'Security' },
    { name: 'UI/UX Improvements', key: 'uiux_improvements_applied', category: 'UI/UX' },
    { name: 'Code Quality Improvements', key: 'code_quality_improved', category: 'Code Quality' },
  ].map(item => ({
    ...item,
    implemented: localStorage.getItem(item.key) === 'true'
  }));

  const categoryProgress = {
    Security: implementationProgress.filter(item => item.category === 'Security'),
    'UI/UX': implementationProgress.filter(item => item.category === 'UI/UX'),
    'Code Quality': implementationProgress.filter(item => item.category === 'Code Quality'),
    Database: [] // Placeholder for future database fixes
  };

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{metrics.totalFixedIssues}</div>
            <div className="text-lg font-medium text-green-800">Total Fixed</div>
            <div className="text-sm text-gray-600 mt-1">All categories combined</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{metrics.realFixesApplied}</div>
            <div className="text-sm font-medium text-blue-800">Manual Fixes</div>
            <div className="text-xs text-gray-600 mt-1">Applied by user</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{metrics.backendFixedCount}</div>
            <div className="text-sm font-medium text-purple-800">Auto-Detected</div>
            <div className="text-xs text-gray-600 mt-1">Backend fixes</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {Math.round((metrics.totalFixedIssues / (metrics.totalActiveIssues + metrics.totalFixedIssues)) * 100)}%
            </div>
            <div className="text-sm font-medium text-yellow-800">Completion Rate</div>
            <div className="text-xs text-gray-600 mt-1">Overall progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Subtabs */}
      <Tabs defaultValue="by-category" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="by-category">By Category</TabsTrigger>
          <TabsTrigger value="by-severity">By Severity</TabsTrigger>
          <TabsTrigger value="implementation-status">Implementation Status</TabsTrigger>
          <TabsTrigger value="daily-progress">Daily Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="by-category" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Fixed Issues by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">{metrics.securityFixed}</Badge>
                      <span className="text-xs text-gray-500">/ 5 total</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">UI/UX</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">{metrics.uiuxFixed}</Badge>
                      <span className="text-xs text-gray-500">/ 1 total</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Database</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">{metrics.databaseFixed}</Badge>
                      <span className="text-xs text-gray-500">/ 0 total</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Code Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">{metrics.codeQualityFixed}</Badge>
                      <span className="text-xs text-gray-500">/ 1 total</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Progress by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(categoryProgress).map(([category, items]) => (
                    <div key={category} className="p-3 bg-blue-50 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{category}</span>
                        <span className="text-xs text-gray-600">
                          {items.filter(item => item.implemented).length} / {items.length || 'TBD'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: items.length > 0 ? `${(items.filter(item => item.implemented).length / items.length) * 100}%` : '0%' 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-severity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fixed Issues by Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg border">
                  <div className="text-2xl font-bold text-red-600 mb-2">{metrics.criticalFixed}</div>
                  <div className="text-sm font-medium text-red-800">Critical Fixed</div>
                  <Badge variant="destructive" className="mt-2 text-xs">Highest Priority</Badge>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600 mb-2">{metrics.highFixed}</div>
                  <div className="text-sm font-medium text-orange-800">High Fixed</div>
                  <Badge className="bg-orange-600 mt-2 text-xs">High Impact</Badge>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">{metrics.mediumFixed}</div>
                  <div className="text-sm font-medium text-yellow-800">Medium Fixed</div>
                  <Badge className="bg-yellow-600 mt-2 text-xs">Medium Impact</Badge>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border">
                  <div className="text-2xl font-bold text-gray-600 mb-2">{metrics.lowFixed}</div>
                  <div className="text-sm font-medium text-gray-800">Low Fixed</div>
                  <Badge variant="outline" className="mt-2 text-xs">Low Impact</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation-status" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Detailed Implementation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {implementationProgress.map((item) => (
                  <div key={item.key} className={`p-3 rounded border ${
                    item.implemented ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.implemented ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span className="font-medium text-sm">{item.name}</span>
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      </div>
                      <Badge variant={item.implemented ? "default" : "outline"} 
                             className={item.implemented ? "bg-green-600" : ""}>
                        {item.implemented ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Implemented
                          </>
                        ) : (
                          'Pending'
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-progress" className="mt-6">
          <DailyProgressTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsolidatedOverallFixedTab;
