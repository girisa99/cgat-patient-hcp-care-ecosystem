import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, 
  Activity, Zap, Eye, AlertCircle, TrendingUp
} from 'lucide-react';
import { useStability } from './StabilityProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export const StabilityDashboard: React.FC = () => {
  const { 
    state, 
    isStable, 
    getDuplicateHooks, 
    getLayoutShifts, 
    clearAlerts 
  } = useStability();

  const duplicateHooks = getDuplicateHooks();
  const layoutShifts = getLayoutShifts();
  const moduleCount = Object.keys(state.modules).length;
  const healthyModules = Object.values(state.modules).filter(m => m.healthStatus === 'healthy').length;

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'recovering': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'recovering': return <RefreshCw className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Stability Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor system health and protect against breaking changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isStable ? "default" : "destructive"}>
            {isStable ? 'Stable' : 'Unstable'}
          </Badge>
          <Button onClick={clearAlerts} variant="outline" size="sm">
            Clear Alerts
          </Button>
        </div>
      </div>

      {/* Global Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Global Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(state.globalHealth)}`}>
              {state.globalHealth.toUpperCase()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Healthy Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {healthyModules}/{moduleCount}
            </div>
            <Progress value={(healthyModules / Math.max(moduleCount, 1)) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Duplicate Hooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${duplicateHooks.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {duplicateHooks.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Layout Shifts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${layoutShifts.length > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {layoutShifts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {state.protectionAlerts.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <strong>Protection Alerts ({state.protectionAlerts.length}):</strong>
              {state.protectionAlerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="text-sm">• {alert}</div>
              ))}
              {state.protectionAlerts.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  +{state.protectionAlerts.length - 3} more alerts
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules">Module Health</TabsTrigger>
          <TabsTrigger value="hooks">Hook Tracking</TabsTrigger>
          <TabsTrigger value="layout">Layout Protection</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Module Health Tab */}
        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Module Health Status</CardTitle>
              <CardDescription>
                Real-time monitoring of all application modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(state.modules).map((module) => (
                  <div key={module.moduleId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={getHealthColor(module.healthStatus)}>
                        {getHealthIcon(module.healthStatus)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{module.moduleId}</h3>
                        <div className="text-sm text-muted-foreground flex gap-4">
                          <span>Renders: {module.renderCount}</span>
                          <span>Errors: {module.errorCount}</span>
                          <span>Load: {module.loadTime.toFixed(1)}ms</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={module.healthStatus === 'healthy' ? "default" : "secondary"}>
                        {module.healthStatus}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Score: {module.performanceScore.toFixed(0)}
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(state.modules).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No modules being monitored yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hook Tracking Tab */}
        <TabsContent value="hooks">
          <Card>
            <CardHeader>
              <CardTitle>Hook Usage Tracking</CardTitle>
              <CardDescription>
                Detect duplicate hooks and prevent redundant fetches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(state.hooks).map((hook) => (
                  <div key={hook.hookName} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={hook.isDuplicate ? 'text-red-600' : 'text-green-600'}>
                        {hook.isDuplicate ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">{hook.hookName}</h3>
                        <div className="text-sm text-muted-foreground">
                          Module: {hook.moduleId} • Used: {hook.usageCount} times
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hook.isDuplicate && (
                        <Badge variant="destructive">Duplicate</Badge>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(hook.lastUsed).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(state.hooks).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hooks tracked yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Protection Tab */}
        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle>Layout Shift Protection</CardTitle>
              <CardDescription>
                Monitor and prevent unexpected layout changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(state.layouts).map(([elementId, layout]) => (
                  <div key={elementId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={layout.hasLayoutShift ? 'text-yellow-600' : 'text-green-600'}>
                        {layout.hasLayoutShift ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">{elementId}</h3>
                        <div className="text-sm text-muted-foreground">
                          {layout.hasLayoutShift ? 
                            `Shift detected: ${layout.shiftAmount.toFixed(1)}px` : 
                            'Layout stable'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={layout.isProtected ? "default" : "secondary"}>
                        {layout.isProtected ? 'Protected' : 'Unprotected'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {Object.keys(state.layouts).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No layout monitoring active
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring</CardTitle>
              <CardDescription>
                Track module performance and optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(state.modules)
                  .sort((a, b) => a.performanceScore - b.performanceScore)
                  .map((module) => (
                  <div key={module.moduleId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{module.moduleId}</span>
                      <span className="text-sm text-muted-foreground">
                        {module.performanceScore.toFixed(0)}/100
                      </span>
                    </div>
                    <Progress value={module.performanceScore} />
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Load: {module.loadTime.toFixed(1)}ms</span>
                      <span>Renders: {module.renderCount}</span>
                      <span>Errors: {module.errorCount}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(state.modules).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No performance data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};