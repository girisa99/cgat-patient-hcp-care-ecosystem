import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Shield, Database, Code, Eye, Bug, Filter, Calendar, Search } from 'lucide-react';
import { UnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import { ProcessedIssuesData } from '@/types/issuesTypes';

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
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedSeverity, setSelectedSeverity] = React.useState('all');

  // Calculate accurate active issues (excluding already fixed ones)
  const getActiveIssuesExcludingFixed = () => {
    const fixedSecurityCount = [
      localStorage.getItem('mfa_enforcement_implemented') === 'true',
      localStorage.getItem('rbac_implementation_active') === 'true',
      localStorage.getItem('log_sanitization_active') === 'true',
      localStorage.getItem('debug_security_implemented') === 'true',
      localStorage.getItem('api_authorization_implemented') === 'true'
    ].filter(Boolean).length;

    const fixedUIUXCount = localStorage.getItem('uiux_improvements_applied') === 'true' ? 1 : 0;
    const fixedCodeQualityCount = localStorage.getItem('code_quality_improved') === 'true' ? 1 : 0;

    return {
      security: Math.max(0, (processedData.issuesByTopic['Security Issues']?.length || 0) - fixedSecurityCount),
      uiux: Math.max(0, (processedData.issuesByTopic['UI/UX Issues']?.length || 0) - fixedUIUXCount),
      database: processedData.issuesByTopic['Database Issues']?.length || 0,
      codeQuality: Math.max(0, (processedData.issuesByTopic['Code Quality']?.length || 0) - fixedCodeQualityCount),
      total: function() {
        return this.security + this.uiux + this.database + this.codeQuality;
      }
    };
  };

  const activeIssues = getActiveIssuesExcludingFixed();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{activeIssues.total()}</div>
            <div className="text-sm text-red-700">Total Active Issues</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.totalFixedIssues}</div>
            <div className="text-sm text-green-700">Total Fixed Issues</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.criticalActive}</div>
            <div className="text-sm text-blue-700">Critical Priority</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.realFixesApplied}</div>
            <div className="text-sm text-purple-700">Manual Fixes Applied</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search issues..."
                className="flex-1 p-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="p-2 border rounded"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="security">Security</option>
              <option value="uiux">UI/UX</option>
              <option value="database">Database</option>
              <option value="codeQuality">Code Quality</option>
            </select>
            <select
              className="p-2 border rounded"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Subtabs - Default to "by-category-severity" */}
      <Tabs defaultValue="by-category-severity" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="by-category-severity">By Category & Severity</TabsTrigger>
          <TabsTrigger value="by-severity">By Severity Only</TabsTrigger>
        </TabsList>

        <TabsContent value="by-category-severity" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Issues by Category with Descriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Active Issues by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(processedData.issuesByTopic).map(([category, issues]) => {
                    if (issues.length === 0) return null;
                    
                    return (
                      <div key={category} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{category}</span>
                            <Badge variant="destructive">{issues.length}</Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {issues.slice(0, 3).map((issue, idx) => (
                            <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="text-xs" variant={
                                  issue.severity === 'critical' ? 'destructive' :
                                  issue.severity === 'high' ? 'default' : 'outline'
                                }>
                                  {issue.severity || 'medium'}
                                </Badge>
                                <span className="font-medium">{issue.type}</span>
                              </div>
                              <p>{issue.message}</p>
                            </div>
                          ))}
                          {issues.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{issues.length - 3} more issues...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Fixed Issues by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Fixed Issues by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Security</span>
                    </div>
                    <Badge className="bg-green-600">{metrics.securityFixed}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">UI/UX</span>
                    </div>
                    <Badge className="bg-green-600">{metrics.uiuxFixed}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Database</span>
                    </div>
                    <Badge className="bg-green-600">{metrics.databaseFixed}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Code Quality</span>
                    </div>
                    <Badge className="bg-green-600">{metrics.codeQualityFixed}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-severity" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Issues by Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Active Issues by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded border">
                    <span className="text-sm font-medium">Critical</span>
                    <Badge variant="destructive">{metrics.criticalActive}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded border">
                    <span className="text-sm font-medium">High</span>
                    <Badge className="bg-orange-600">{metrics.highActive}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded border">
                    <span className="text-sm font-medium">Medium</span>
                    <Badge className="bg-yellow-600">{metrics.mediumActive}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <span className="text-sm font-medium">Low</span>
                    <Badge variant="outline">{metrics.lowActive}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fixed Issues by Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Fixed Issues by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <span className="text-sm font-medium">Critical</span>
                    <Badge className="bg-green-600">{metrics.criticalFixed}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <span className="text-sm font-medium">High</span>
                    <Badge className="bg-green-600">{metrics.highFixed}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <span className="text-sm font-medium">Medium</span>
                    <Badge className="bg-green-600">{metrics.mediumFixed}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <span className="text-sm font-medium">Low</span>
                    <Badge className="bg-green-600">{metrics.lowFixed}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsolidatedActiveVsFixedTab;
