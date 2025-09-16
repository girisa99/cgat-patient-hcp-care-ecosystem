/**
 * System Integration Dashboard - Real-time monitoring and management
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, Database, Zap, CheckCircle, AlertTriangle, 
  RefreshCw, Trash2, FileText, TestTube, Monitor,
  Users, Globe, Bot, Settings
} from 'lucide-react';
import { useSystemIntegration } from '@/hooks/useSystemIntegration';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';

export const SystemIntegrationDashboard: React.FC = () => {
  const {
    systemStatus,
    migrationIntegrity,
    statusLoading,
    migrationLoading,
    isUpdating,
    isCleaning,
    isUpdatingAPIs,
    isUpdatingTests,
    runComprehensiveUpdate,
    runCleanup,
    updateAPIDocumentation,
    updateTestingSuite,
    refetchStatus,
    isHealthy,
    isMultiTenrantReady,
    isRealTimeCapable,
    totalAgents,
    totalAPIs,
    totalTests,
  } = useSystemIntegration();

  const getHealthBadge = () => {
    if (!systemStatus) return <Badge variant="secondary">Unknown</Badge>;
    
    switch (systemStatus.system_health) {
      case 'optimal':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Optimal</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (statusLoading || migrationLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading system status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Health Overview
              </CardTitle>
              <CardDescription>
                Real-time monitoring of all system components and integrations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getHealthBadge()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchStatus()}
                disabled={statusLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${statusLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* System Capabilities */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">System Capabilities</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Multi-Tenant Ready</span>
                  {isMultiTenrantReady ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Real-time Updates</span>
                  {isRealTimeCapable ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">JSONB Migration</span>
                  {migrationIntegrity?.migration_status === 'verified' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Component Statistics */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Component Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">AI Agents</span>
                  </div>
                  <Badge variant="secondary">{totalAgents}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-600" />
                    <span className="text-sm">API Services</span>
                  </div>
                  <Badge variant="secondary">{totalAPIs}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TestTube className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Test Cases</span>
                  </div>
                  <Badge variant="secondary">{totalTests}</Badge>
                </div>
              </div>
            </div>

            {/* Database Health */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Database Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Size</span>
                  <Badge variant="outline">
                    {systemStatus?.database_stats?.total_db_size || 'N/A'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Tables</span>
                  <Badge variant="outline">
                    {systemStatus?.database_stats?.total_tables || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Largest Table</span>
                  <Badge variant="outline">
                    {systemStatus?.database_stats?.largest_table_size || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Management Tabs */}
      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring">Performance Monitor</TabsTrigger>
          <TabsTrigger value="maintenance">System Maintenance</TabsTrigger>
          <TabsTrigger value="integration">Integration Status</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Performance Monitoring</CardTitle>
              <CardDescription>
                Live database performance metrics and system health indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceMonitor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Comprehensive System Update
                </CardTitle>
                <CardDescription>
                  Run complete system cleanup, API documentation updates, and testing suite maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => runComprehensiveUpdate()}
                  disabled={isUpdating}
                  className="w-full"
                  size="lg"
                >
                  {isUpdating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Run Comprehensive Update
                </Button>
                <p className="text-xs text-muted-foreground">
                  This will clean up old data, update API documentation, and optimize the testing suite
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Database Cleanup
                </CardTitle>
                <CardDescription>
                  Remove old sessions, duplicates, and unused data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => runCleanup()}
                  disabled={isCleaning}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {isCleaning ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Run Database Cleanup
                </Button>
                <p className="text-xs text-muted-foreground">
                  Removes sessions older than 7 days and duplicate test cases
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  API Documentation
                </CardTitle>
                <CardDescription>
                  Update and enhance API service documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => updateAPIDocumentation()}
                  disabled={isUpdatingAPIs}
                  variant="outline"
                  className="w-full"
                >
                  {isUpdatingAPIs ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Update API Docs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Testing Suite
                </CardTitle>
                <CardDescription>
                  Optimize and clean up testing suite
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => updateTestingSuite()}
                  disabled={isUpdatingTests}
                  variant="outline"
                  className="w-full"
                >
                  {isUpdatingTests ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Update Testing Suite
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agent System Status */}
            <Card>
              <CardHeader>
                <CardTitle>AI Agent System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Agents</span>
                    <Badge>{systemStatus?.agent_system_stats?.total_agents || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Agents</span>
                    <Badge className="bg-green-100 text-green-800">
                      {systemStatus?.agent_system_stats?.active_agents || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Draft Agents</span>
                    <Badge variant="secondary">
                      {systemStatus?.agent_system_stats?.draft_agents || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Services Status */}
            <Card>
              <CardHeader>
                <CardTitle>API Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total APIs</span>
                    <Badge>{systemStatus?.api_services_stats?.total_apis || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active APIs</span>
                    <Badge className="bg-green-100 text-green-800">
                      {systemStatus?.api_services_stats?.active_apis || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Internal APIs</span>
                    <Badge variant="outline">
                      {systemStatus?.api_services_stats?.internal_apis || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Documentation Status</CardTitle>
              <CardDescription>
                Overview of documentation coverage and updates across all system components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">JSONB Migration Documentation</h4>
                    <p className="text-sm text-muted-foreground">
                      Database schema migration from JSONB to structured columns
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">API Integration Guide</h4>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive API documentation and integration examples
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Enhanced</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Testing Suite Documentation</h4>
                    <p className="text-sm text-muted-foreground">
                      Test cases, scenarios, and automated testing procedures
                    </p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Updated</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};