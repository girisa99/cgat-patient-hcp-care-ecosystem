
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Server,
  Lock,
  Eye,
  RefreshCw,
  TrendingUp,
  Bug,
  Cpu,
  MemoryStick,
  Network,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAutomatedVerification } from '@/hooks/useAutomatedVerification';
import { enhancedSecurityPerformanceOrchestrator, ComprehensiveSecurityPerformanceSummary } from '@/utils/verification/EnhancedSecurityPerformanceOrchestrator';
import SecurityMetrics from './SecurityMetrics';
import PerformanceMonitor from './PerformanceMonitor';
import ComplianceStatus from './ComplianceStatus';
import IssuesTab from './IssuesTab';

const SecurityDashboard: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(new Date());
  const [comprehensiveSummary, setComprehensiveSummary] = useState<ComprehensiveSecurityPerformanceSummary | null>(null);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const { toast } = useToast();
  const { runManualScan, lastSummary } = useAutomatedVerification();

  useEffect(() => {
    // Initialize comprehensive monitoring
    initializeComprehensiveMonitoring();
    
    // Set up periodic updates
    const interval = setInterval(updateComprehensiveSummary, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const initializeComprehensiveMonitoring = async () => {
    try {
      console.log('🚀 Initializing comprehensive monitoring...');
      await enhancedSecurityPerformanceOrchestrator.startComprehensiveMonitoring();
      setIsMonitoringActive(true);
      
      // Get initial summary
      const summary = await enhancedSecurityPerformanceOrchestrator.getComprehensiveSummary();
      setComprehensiveSummary(summary);
      
      toast({
        title: "🚀 Comprehensive Monitoring Active",
        description: "Real-time security and performance monitoring is now running",
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to initialize comprehensive monitoring:', error);
      toast({
        title: "⚠️ Monitoring Initialization Failed", 
        description: "Some monitoring features may not be available",
        variant: "destructive",
      });
    }
  };

  const updateComprehensiveSummary = async () => {
    try {
      const summary = await enhancedSecurityPerformanceOrchestrator.getComprehensiveSummary();
      setComprehensiveSummary(summary);
      
      // Check for critical issues and show alerts
      if (summary.criticalSecurityIssues > 0 || summary.criticalPerformanceIssues > 0) {
        toast({
          title: "🚨 Critical Issues Detected",
          description: `${summary.criticalSecurityIssues} security issues, ${summary.criticalPerformanceIssues} performance issues`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to update comprehensive summary:', error);
    }
  };

  const handleSecurityScan = async () => {
    setIsScanning(true);
    console.log('🔒 Starting comprehensive security verification scan...');
    
    try {
      toast({
        title: "🔍 Comprehensive Scan Started",
        description: "Running full security and performance analysis...",
        variant: "default",
      });

      // Run both traditional scan and comprehensive analysis
      await Promise.all([
        runManualScan(),
        updateComprehensiveSummary()
      ]);
      
      const currentTime = new Date();
      setLastScanTime(currentTime);
      
      setTimeout(() => {
        if (comprehensiveSummary) {
          const criticalTotal = comprehensiveSummary.criticalSecurityIssues + comprehensiveSummary.criticalPerformanceIssues;
          
          if (criticalTotal > 0) {
            toast({
              title: "🚨 Critical Issues Found",
              description: `Found ${criticalTotal} critical issues requiring immediate attention`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "✅ Comprehensive Scan Complete",
              description: `System health: ${comprehensiveSummary.overallHealthScore}% - Status: ${comprehensiveSummary.securityStatus}`,
              variant: "default",
            });
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Comprehensive scan failed:', error);
      toast({
        title: "❌ Comprehensive Scan Failed",
        description: "An error occurred during the comprehensive scan",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const executeAutomatedFixes = async () => {
    if (!comprehensiveSummary) return;
    
    const autoFixableIssues = comprehensiveSummary.automatedFixes
      .filter(fix => fix.canAutoFix && fix.riskLevel === 'low')
      .map(fix => fix.id);
    
    if (autoFixableIssues.length === 0) {
      toast({
        title: "ℹ️ No Auto-fixes Available",
        description: "No low-risk automated fixes are currently available",
        variant: "default",
      });
      return;
    }

    try {
      toast({
        title: "🔧 Executing Automated Fixes",
        description: `Applying ${autoFixableIssues.length} automated fixes...`,
        variant: "default",
      });

      const result = await enhancedSecurityPerformanceOrchestrator.executeAutomatedFixes(autoFixableIssues);
      
      toast({
        title: "✅ Automated Fixes Complete",
        description: `${result.success.length} fixes applied, ${result.failed.length} failed`,
        variant: result.failed.length === 0 ? "default" : "destructive",
      });

      // Refresh summary after fixes
      setTimeout(updateComprehensiveSummary, 2000);
    } catch (error) {
      toast({
        title: "❌ Automated Fixes Failed",
        description: "An error occurred while applying automated fixes",
        variant: "destructive",
      });
    }
  };

  const getOverallStatus = () => {
    if (!comprehensiveSummary) return { text: 'Initializing', color: 'secondary', icon: Shield };
    
    if (comprehensiveSummary.criticalSecurityIssues > 0) {
      return { text: 'Critical Security Issues', color: 'destructive', icon: AlertTriangle };
    }
    if (comprehensiveSummary.criticalPerformanceIssues > 0) {
      return { text: 'Critical Performance Issues', color: 'destructive', icon: AlertTriangle };
    }
    if (comprehensiveSummary.securityStatus === 'secure' && comprehensiveSummary.performanceStatus === 'excellent') {
      return { text: 'Excellent', color: 'default', icon: CheckCircle };
    }
    if (comprehensiveSummary.overallHealthScore >= 80) {
      return { text: 'Good', color: 'default', icon: CheckCircle };
    }
    return { text: 'Needs Attention', color: 'default', icon: AlertTriangle };
  };

  const status = getOverallStatus();

  return (
    <div className="space-y-6">
      {/* Enhanced Security Overview Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Comprehensive Security & Performance Center
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <status.icon className="h-4 w-4" />
                <Badge variant={status.color as any}>{status.text}</Badge>
              </div>
              {isMonitoringActive && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Monitoring
                </Badge>
              )}
              <Button 
                onClick={handleSecurityScan}
                disabled={isScanning}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning...' : 'Full System Scan'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{comprehensiveSummary?.overallHealthScore || 0}%</p>
                <p className="text-sm text-muted-foreground">System Health</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{comprehensiveSummary?.securityScore || 0}%</p>
                <p className="text-sm text-muted-foreground">Security Score</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{comprehensiveSummary?.performanceScore || 0}%</p>
                <p className="text-sm text-muted-foreground">Performance Score</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Bell className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{comprehensiveSummary?.alertingStatus.activeAlerts.length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Last Scan</p>
                <p className="text-xs text-muted-foreground">
                  {lastScanTime.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {comprehensiveSummary?.automatedFixes.filter(f => f.canAutoFix && f.riskLevel === 'low').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-green-500" />
              Automated Fixes Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {comprehensiveSummary.automatedFixes.filter(f => f.canAutoFix && f.riskLevel === 'low').length} automated fixes ready
                </p>
                <p className="text-sm text-muted-foreground">
                  Low-risk fixes that can be applied automatically
                </p>
              </div>
              <Button onClick={executeAutomatedFixes} className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Apply Automated Fixes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comprehensive Dashboard Tabs */}
      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Live Monitoring
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <SecurityMetrics verificationSummary={lastSummary} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceMonitor />
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <IssuesTab verificationSummary={lastSummary} />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {comprehensiveSummary && (
            <div className="space-y-6">
              {/* Real-time Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                      <Cpu className="h-4 w-4 mr-2" />
                      Memory Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((comprehensiveSummary.realUserMetrics.memoryUsage.heapUsed / comprehensiveSummary.realUserMetrics.memoryUsage.heapTotal) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {comprehensiveSummary.realUserMetrics.memoryUsage.memoryLeaks.length} leaks detected
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                      <Network className="h-4 w-4 mr-2" />
                      Core Web Vitals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {comprehensiveSummary.realUserMetrics.coreWebVitals.lcp}ms
                    </div>
                    <p className="text-xs text-muted-foreground">
                      LCP (Target: &lt;2500ms)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Active Threats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {comprehensiveSummary.runtimeSecurity.activeThreats.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {comprehensiveSummary.runtimeSecurity.activeThreats.filter(t => !t.mitigated).length} unmitigated
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Priority Actions */}
              {comprehensiveSummary.priorityActions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Priority Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {comprehensiveSummary.priorityActions.slice(0, 5).map((action, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <Badge variant={action.priority === 'critical' ? 'destructive' : 'default'}>
                            {action.priority}
                          </Badge>
                          <div className="flex-1">
                            <h4 className="font-medium">{action.title}</h4>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                            <p className="text-xs text-blue-600 mt-1">Timeline: {action.timeline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
