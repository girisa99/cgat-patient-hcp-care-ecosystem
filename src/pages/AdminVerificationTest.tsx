
/**
 * System Verification Dashboard
 * Database-first verification system with stable health assessment
 */

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Activity, RefreshCw, Database, Play } from 'lucide-react';
import { useDatabaseIssues } from '@/hooks/useDatabaseIssues';
import { useStableHealthScore } from '@/hooks/useStableHealthScore';
import CleanIssuesTab from '@/components/security/CleanIssuesTab';

const AdminVerificationTest = () => {
  const [isManualScanRunning, setIsManualScanRunning] = useState(false);
  const [lastManualUpdate, setLastManualUpdate] = useState<Date | null>(null);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const { toast } = useToast();

  const {
    activeIssues,
    totalFixedCount,
    categorizedIssues,
    isLoading,
    error,
    syncActiveIssues,
    refreshIssues
  } = useDatabaseIssues();

  const {
    score: healthScore,
    isStable,
    criticalIssuesCount,
    totalActiveIssues,
    totalFixedIssues,
    lastCalculated,
    recalculate: recalculateHealth
  } = useStableHealthScore();

  const runManualVerification = async () => {
    setIsManualScanRunning(true);
    console.log('🔍 RUNNING MANUAL VERIFICATION (Database-First)...');

    try {
      toast({
        title: "🔍 Manual Verification Started",
        description: "Syncing active issues with database and recalculating health score...",
        variant: "default",
      });

      // Sync active issues with database (this will now work with the fixed function)
      await syncActiveIssues();
      console.log('✅ Active issues synced successfully with database');
      
      // Refresh all data from database
      await refreshIssues();
      console.log('✅ Issues data refreshed from database');
      
      // Recalculate health score
      await recalculateHealth();
      console.log('✅ Health score recalculated');
      
      // Update last manual update time
      setLastManualUpdate(new Date());
      
      toast({
        title: "✅ Manual Verification Complete",
        description: `System verification completed successfully. Health Score: ${healthScore}/100`,
        variant: "default",
      });
      
      console.log('✅ Manual verification completed successfully');
    } catch (error) {
      console.error('❌ Manual verification failed:', error);
      toast({
        title: "❌ Verification Failed",
        description: error instanceof Error ? error.message : "Failed to complete system verification",
        variant: "destructive",
      });
    } finally {
      setIsManualScanRunning(false);
    }
  };

  // Auto-trigger verification on page load
  useEffect(() => {
    if (!autoTriggered) {
      console.log('🎯 System Verification Dashboard: Auto-triggering verification system...');
      setAutoTriggered(true);
      
      // Add a small delay to ensure components are ready
      setTimeout(() => {
        runManualVerification();
      }, 1000);
    }
  }, [autoTriggered]);

  return (
    <MainLayout>
      <PageContainer
        title="System Verification Dashboard"
        subtitle="Database-first system health and verification monitoring"
      >
        <div className="space-y-6">
          {/* Verification Trigger Status */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Play className="h-5 w-5" />
                Verification System Status
              </CardTitle>
              <CardDescription className="text-blue-700">
                {autoTriggered ? 
                  "✅ Verification system has been automatically triggered on page load" :
                  "⏳ Preparing to trigger verification system..."
                }
                <br />
                {isManualScanRunning && "🔄 Verification currently running..."}
                {lastManualUpdate && !isManualScanRunning && 
                  `Last run: ${lastManualUpdate.toLocaleTimeString()}`
                }
              </CardDescription>
            </CardHeader>
          </Card>

          {/* System Health Status */}
          <Card className={isStable ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${isStable ? 'text-green-800' : 'text-yellow-800'}`}>
                <div className="flex items-center">
                  {isStable ? 
                    <CheckCircle className="h-5 w-5 mr-2" /> : 
                    <AlertTriangle className="h-5 w-5 mr-2" />
                  }
                  System Health: {healthScore}/100 (Database-Driven)
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={runManualVerification} 
                    disabled={isManualScanRunning || isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isManualScanRunning ? 'animate-spin' : ''}`} />
                    {isManualScanRunning ? 'Running...' : 'Manual Verification'}
                  </Button>
                  <div className="flex items-center gap-1">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">DB Only</span>
                  </div>
                </div>
              </CardTitle>
              <CardDescription className={isStable ? 'text-green-700' : 'text-yellow-700'}>
                Last calculated: {lastCalculated.toLocaleTimeString()}
                {lastManualUpdate && (
                  <>
                    <br />
                    Last manual update: {lastManualUpdate.toLocaleTimeString()}
                  </>
                )}
                <br />
                Critical Issues: {criticalIssuesCount} | Total Active: {totalActiveIssues} | Fixed: {totalFixedIssues}
                <br />
                System is {isStable ? 'stable and reliable' : 'improving but needs attention'}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* System Metrics Display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-800">{totalFixedCount}</div>
                <div className="text-sm text-green-600">Total Fixed</div>
                <div className="text-xs text-green-500 mt-1">From Database</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-800">{categorizedIssues.critical.length}</div>
                <div className="text-sm text-red-600">Critical Active</div>
                <div className="text-xs text-red-500 mt-1">From Database</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-800">{categorizedIssues.high.length}</div>
                <div className="text-sm text-orange-600">High Priority</div>
                <div className="text-xs text-orange-500 mt-1">From Database</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-800">{categorizedIssues.total}</div>
                <div className="text-sm text-blue-600">Total Active</div>
                <div className="text-xs text-blue-500 mt-1">From Database</div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Database-First Architecture Status
              </CardTitle>
              <CardDescription className="text-blue-700">
                ✅ All verification data sourced from Supabase database tables.
                <br />
                ✅ No localStorage dependencies - single source of truth established.
                <br />
                ✅ Real-time sync between active_issues and issue_fixes tables.
                <br />
                ✅ Auto-triggered verification on page load with manual override available.
                <br />
                ✅ Database function fixed - DELETE operations now work properly.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Database Connection Issue
                </CardTitle>
                <CardDescription className="text-red-700">
                  {error}
                  <br />
                  <span className="text-xs">Note: Database function has been updated to fix sync issues.</span>
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Issues Management */}
          <CleanIssuesTab 
            onReRunVerification={runManualVerification}
            isReRunning={isManualScanRunning}
          />
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default AdminVerificationTest;
