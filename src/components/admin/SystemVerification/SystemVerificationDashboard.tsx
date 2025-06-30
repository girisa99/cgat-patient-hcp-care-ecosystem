import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Users,
  Building2,
  Settings,
  Shield,
  Database,
  Server,
  RefreshCw,
  Activity,
  GitBranch,
  Layers
} from 'lucide-react';
import { EnhancedIntegratedSystemVerifier } from '@/utils/verification/EnhancedIntegratedSystemVerifier';

interface VerificationResult {
  component: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string[];
  lastChecked: string;
  metrics?: Record<string, any>;
}

interface BackgroundVerificationData {
  results: VerificationResult[];
  overallStatus: 'healthy' | 'warning' | 'critical';
  healthScore: number;
  lastUpdate: string;
  updateFirstResults?: {
    updateFirstCompliance: {
      isCompliant: boolean;
      duplicateRisk: number;
      preventedDuplicates: number;
      recommendedUpdates: number;
    };
    componentInventory: {
      totalComponents: number;
      reuseOpportunities: number;
      consolidationNeeded: number;
    };
    developmentGateway: {
      isActive: boolean;
      recentBlocks: number;
      recentApprovals: number;
    };
  };
}

export const SystemVerificationDashboard: React.FC = () => {
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);
  const [backgroundData, setBackgroundData] = useState<BackgroundVerificationData | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Load background automation results
  const loadBackgroundResults = () => {
    try {
      const stored = localStorage.getItem('latest_automation_results');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.systemVerification) {
          setBackgroundData({
            results: data.systemVerification.results,
            overallStatus: data.systemVerification.overallStatus,
            healthScore: data.systemVerification.healthScore,
            lastUpdate: data.timestamp,
            updateFirstResults: data.systemVerification.updateFirstResults
          });
          setVerificationResults(data.systemVerification.results);
          setLastFullCheck(new Date(data.timestamp));
        }
      }
    } catch (error) {
      console.error('Failed to load background results:', error);
    }
  };

  // Enhanced manual verification with Update First enforcement
  const runManualVerification = async () => {
    setIsRunningTests(true);
    setIsLiveMode(false);
    
    try {
      console.log('🔍 Running enhanced manual system verification with Update First...');
      const enhancedResults = await EnhancedIntegratedSystemVerifier.runEnhancedSystemVerification();
      
      setVerificationResults(enhancedResults.results);
      setLastFullCheck(new Date());
      setBackgroundData({
        results: enhancedResults.results,
        overallStatus: enhancedResults.overallStatus,
        healthScore: enhancedResults.healthScore,
        lastUpdate: new Date().toISOString(),
        updateFirstResults: enhancedResults.updateFirstResults
      });
      
      console.log('✅ Enhanced manual verification completed with Update First enforcement');
    } catch (error) {
      console.error('❌ Enhanced manual verification failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Listen for background automation updates
  useEffect(() => {
    // Load initial data
    loadBackgroundResults();

    // Listen for automation updates
    const handleAutomationUpdate = (event: CustomEvent) => {
      console.log('🔄 Received automation update:', event.detail);
      loadBackgroundResults();
      setIsLiveMode(true);
    };

    window.addEventListener('automation-cycle-complete', handleAutomationUpdate as EventListener);

    // Refresh every 30 seconds to sync with background automation
    const interval = setInterval(() => {
      if (isLiveMode) {
        loadBackgroundResults();
      }
    }, 30000);

    return () => {
      window.removeEventListener('automation-cycle-complete', handleAutomationUpdate as EventListener);
      clearInterval(interval);
    };
  }, [isLiveMode]);

  const getStatusIcon = (status: VerificationResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'loading': return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: VerificationResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800 border-green-300',
      error: 'bg-red-100 text-red-800 border-red-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      loading: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const successCount = verificationResults.filter(r => r.status === 'success').length;
  const errorCount = verificationResults.filter(r => r.status === 'error').length;
  const warningCount = verificationResults.filter(r => r.status === 'warning').length;
  const loadingCount = verificationResults.filter(r => r.status === 'loading').length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Enhanced System Verification with Update First
          </h1>
          <p className="text-muted-foreground">
            {isLiveMode ? '🔄 Live data with Update First enforcement from 30-minute automation' : '📋 Manual verification with Update First results'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsLiveMode(!isLiveMode)}
            variant="outline"
            size="sm"
          >
            {isLiveMode ? (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Live Mode
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Manual Mode
              </>
            )}
          </Button>
          <Button 
            onClick={runManualVerification}
            disabled={isRunningTests}
            variant="outline"
            size="sm"
          >
            {isRunningTests ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            {isRunningTests ? 'Running Enhanced Check...' : 'Enhanced Manual Check'}
          </Button>
        </div>
      </div>

      {/* Enhanced Background Status with Update First */}
      {backgroundData && (
        <Card className={
          backgroundData.overallStatus === 'healthy' ? 'border-green-200 bg-green-50' :
          backgroundData.overallStatus === 'warning' ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        }>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className={
                  backgroundData.overallStatus === 'healthy' ? 'h-6 w-6 text-green-600' :
                  backgroundData.overallStatus === 'warning' ? 'h-6 w-6 text-yellow-600' :
                  'h-6 w-6 text-red-600'
                } />
                <div>
                  <h3 className="font-medium">Enhanced System Health Score: {backgroundData.healthScore}/100</h3>
                  <p className="text-sm text-muted-foreground">
                    Overall Status: {backgroundData.overallStatus.toUpperCase()} | 
                    Update First: {backgroundData.updateFirstResults?.updateFirstCompliance.isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
                    <br />
                    Last Updated: {new Date(backgroundData.lastUpdate).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Badge className={
                  backgroundData.overallStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                  backgroundData.overallStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {backgroundData.overallStatus.toUpperCase()}
                </Badge>
                {backgroundData.updateFirstResults && (
                  <Badge className={
                    backgroundData.updateFirstResults.updateFirstCompliance.isCompliant ? 
                    'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }>
                    UPDATE FIRST: {backgroundData.updateFirstResults.updateFirstCompliance.isCompliant ? 'ON' : 'OFF'}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update First Status Cards */}
      {backgroundData?.updateFirstResults && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{backgroundData.updateFirstResults.updateFirstCompliance.preventedDuplicates}</p>
                  <p className="text-sm text-muted-foreground">Duplicates Prevented</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Layers className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{backgroundData.updateFirstResults.componentInventory.totalComponents}</p>
                  <p className="text-sm text-muted-foreground">Total Components</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{backgroundData.updateFirstResults.componentInventory.reuseOpportunities}</p>
                  <p className="text-sm text-muted-foreground">Reuse Opportunities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{successCount}</p>
                <p className="text-sm text-muted-foreground">Passing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{errorCount}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{warningCount}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{loadingCount}</p>
                <p className="text-sm text-muted-foreground">Loading</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Enhanced System Component Status with Update First
            {isLiveMode && <Badge variant="outline">Live</Badge>}
          </CardTitle>
          {lastFullCheck && (
            <p className="text-sm text-muted-foreground">
              Last checked: {lastFullCheck.toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h3 className="font-medium">{result.component}</h3>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                
                {result.details && result.details.length > 0 && (
                  <div className="mt-3 pl-8">
                    <div className="space-y-1">
                      {result.details.map((detail, idx) => (
                        <p key={idx} className="text-sm font-mono bg-muted p-2 rounded">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.lastChecked && (
                  <div className="mt-2 pl-8">
                    <p className="text-xs text-muted-foreground">
                      Checked: {new Date(result.lastChecked).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Integration Status with Update First</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Background Automation</p>
                <p className="text-sm text-blue-700">Runs every 30 minutes with Update First</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Enhanced Verification</p>
                <p className="text-sm text-green-700">Combined with Update First enforcement</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <GitBranch className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Update First Gateway</p>
                <p className="text-sm text-purple-700">Prevents duplicate development</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
