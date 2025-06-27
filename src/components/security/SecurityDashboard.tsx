
import React, { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAutomatedVerification } from '@/hooks/useAutomatedVerification';
import SecurityMetrics from './SecurityMetrics';
import PerformanceMonitor from './PerformanceMonitor';
import ComplianceStatus from './ComplianceStatus';

const SecurityDashboard: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(new Date());
  const { toast } = useToast();
  const { runManualScan, lastSummary, verificationHistory } = useAutomatedVerification();

  const handleSecurityScan = async () => {
    setIsScanning(true);
    console.log('🔒 Starting comprehensive security verification scan...');
    
    try {
      toast({
        title: "🔍 Security Scan Started",
        description: "Running comprehensive verification of the admin portal...",
        variant: "default",
      });

      // Run the automated verification system
      await runManualScan();
      
      const currentTime = new Date();
      setLastScanTime(currentTime);
      
      // Wait a moment for the verification results to be available
      setTimeout(() => {
        if (lastSummary) {
          if (lastSummary.criticalIssues > 0) {
            toast({
              title: "🚨 Critical Issues Found",
              description: `Found ${lastSummary.criticalIssues} critical security issues that need immediate attention.`,
              variant: "destructive",
            });
          } else if (lastSummary.issuesFound > 0) {
            toast({
              title: "⚠️ Security Scan Complete",
              description: `Scan completed with ${lastSummary.issuesFound} issues and ${lastSummary.validationResult.warnings.length || 0} warnings to review.`,
              variant: "default",
            });
          } else {
            toast({
              title: "✅ Security Scan Complete",
              description: "No security issues found. System is secure!",
              variant: "default",
            });
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Security scan failed:', error);
      toast({
        title: "❌ Security Scan Failed",
        description: "An error occurred during the security scan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getOverallStatus = () => {
    if (!lastSummary) return { text: 'Ready to Scan', color: 'secondary', icon: Shield };
    if (lastSummary.criticalIssues > 0) return { text: 'Critical Issues', color: 'destructive', icon: AlertTriangle };
    if (lastSummary.issuesFound > 0) return { text: 'Issues Found', color: 'default', icon: AlertTriangle };
    return { text: 'Secure', color: 'default', icon: CheckCircle };
  };

  const status = getOverallStatus();

  // Calculate security score based on real verification data
  const getSecurityScore = () => {
    if (!lastSummary) return 95;
    const totalChecks = 50; // Base number of checks
    const issues = lastSummary.issuesFound + (lastSummary.criticalIssues * 2); // Weight critical issues more
    const score = Math.max(0, Math.round(((totalChecks - issues) / totalChecks) * 100));
    return score;
  };

  const securityScore = getSecurityScore();

  return (
    <div className="space-y-6">
      {/* Security Overview Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Security & Performance Overview
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <status.icon className="h-4 w-4" />
                <Badge variant={status.color as any}>{status.text}</Badge>
              </div>
              <Button 
                onClick={handleSecurityScan}
                disabled={isScanning}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning...' : 'Run Security Scan'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{securityScore}%</p>
                <p className="text-sm text-muted-foreground">Security Score</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">98.5%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">1.2s</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
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

      {/* Real-time Scan Results Summary */}
      {lastSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Latest Verification Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg bg-blue-50">
                <div className="text-3xl font-bold text-blue-600 mb-2">{lastSummary.recommendations.length || 0}</div>
                <p className="text-sm text-blue-800">Recommendations</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-yellow-50">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{lastSummary.validationResult.warnings.length || 0}</div>
                <p className="text-sm text-yellow-800">Warnings</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-orange-50">
                <div className="text-3xl font-bold text-orange-600 mb-2">{lastSummary.issuesFound || 0}</div>
                <p className="text-sm text-orange-800">Issues Found</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-red-50">
                <div className="text-3xl font-bold text-red-600 mb-2">{lastSummary.criticalIssues || 0}</div>
                <p className="text-sm text-red-800">Critical Issues</p>
              </div>
            </div>
            
            {/* Verification Areas Tested */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Verification Areas Tested:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">Database Guidelines</div>
                <div className="p-2 bg-gray-50 rounded">TypeScript Alignment</div>
                <div className="p-2 bg-gray-50 rounded">Code Quality</div>
                <div className="p-2 bg-gray-50 rounded">Security Scan</div>
                <div className="p-2 bg-gray-50 rounded">Component Structure</div>
                <div className="p-2 bg-gray-50 rounded">Naming Conventions</div>
                <div className="p-2 bg-gray-50 rounded">Performance Analysis</div>
                <div className="p-2 bg-gray-50 rounded">Schema Validation</div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg bg-green-50">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {lastSummary.autoFixesApplied || 0}
                </div>
                <p className="text-sm text-green-800">Auto-fixes Applied</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-blue-50">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {lastSummary.databaseValidation?.violations.length || 0}
                </div>
                <p className="text-sm text-blue-800">Database Issues</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-purple-50">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {lastSummary.securityScan?.vulnerabilities.length || 0}
                </div>
                <p className="text-sm text-purple-800">Security Vulnerabilities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Performance
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

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
