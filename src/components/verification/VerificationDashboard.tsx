
/**
 * Verification Dashboard Component
 * 
 * Provides UI to monitor and control the automated verification system
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Play, 
  Square, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Clock,
  Bug,
  Zap
} from 'lucide-react';
import { useAutomatedVerification } from '@/hooks/useAutomatedVerification';

const VerificationDashboard: React.FC = () => {
  const {
    isRunning,
    config,
    lastSummary,
    hasIssues,
    hasCriticalIssues,
    startVerification,
    stopVerification,
    updateConfig,
    runManualScan
  } = useAutomatedVerification();

  const getStatusIcon = () => {
    if (!isRunning) return <Square className="h-4 w-4 text-gray-500" />;
    if (hasCriticalIssues) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (hasIssues) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!isRunning) return 'Stopped';
    if (hasCriticalIssues) return 'Critical Issues';
    if (hasIssues) return 'Issues Found';
    return 'All Clear';
  };

  const getStatusColor = () => {
    if (!isRunning) return 'secondary';
    if (hasCriticalIssues) return 'destructive';
    if (hasIssues) return 'default';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Automated Verification System
          </h2>
          <p className="text-muted-foreground">
            Monitor and control real-time code verification
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge variant={getStatusColor() as any}>
            {getStatusText()}
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Control
          </CardTitle>
          <CardDescription>
            Start, stop, and configure the automated verification system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={isRunning ? stopVerification : startVerification}
              variant={isRunning ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop System
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start System
                </>
              )}
            </Button>

            <Button
              onClick={runManualScan}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Run Manual Scan
            </Button>
          </div>

          {config && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Switch
                  id="real-time"
                  checked={config.enableRealTimeChecks}
                  onCheckedChange={(checked) => 
                    updateConfig({ enableRealTimeChecks: checked })
                  }
                />
                <Label htmlFor="real-time">Real-time Checks</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="periodic"
                  checked={config.enablePeriodicScans}
                  onCheckedChange={(checked) => 
                    updateConfig({ enablePeriodicScans: checked })
                  }
                />
                <Label htmlFor="periodic">Periodic Scans</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-fix"
                  checked={config.autoFixSimpleIssues}
                  onCheckedChange={(checked) => 
                    updateConfig({ autoFixSimpleIssues: checked })
                  }
                />
                <Label htmlFor="auto-fix">Auto-fix Issues</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="block-critical"
                  checked={config.blockOnCriticalIssues}
                  onCheckedChange={(checked) => 
                    updateConfig({ blockOnCriticalIssues: checked })
                  }
                />
                <Label htmlFor="block-critical">Block on Critical</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Overview */}
      {lastSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <Bug className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{lastSummary.issuesFound}</p>
                  <p className="text-xs text-muted-foreground">Issues Found</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{lastSummary.criticalIssues}</p>
                  <p className="text-xs text-muted-foreground">Critical Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{lastSummary.autoFixesApplied}</p>
                  <p className="text-xs text-muted-foreground">Auto-fixes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-bold">
                    {new Date(lastSummary.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Last Scan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Issues */}
      {lastSummary && lastSummary.issuesFound > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Issues
            </CardTitle>
            <CardDescription>
              Issues found in the last verification scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lastSummary.validationResult.issues.map((issue, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{issue}</span>
                </div>
              ))}
              
              {lastSummary.auditResults.flatMap(audit => 
                audit.issues.map((issue, index) => (
                  <div key={`audit-${index}`} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                    <Bug className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{audit.componentName}: {issue}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {lastSummary && lastSummary.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recommendations
            </CardTitle>
            <CardDescription>
              Suggested improvements from the verification system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lastSummary.recommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VerificationDashboard;
