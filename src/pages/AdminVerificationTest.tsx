
/**
 * System Verification Dashboard
 * Separates original DB health from sync table verification data
 */

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Database, RefreshCw, Activity, Archive } from 'lucide-react';
import { useDatabaseIssues } from '@/hooks/useDatabaseIssues';
import { useStableHealthScore } from '@/hooks/useStableHealthScore';
import CleanIssuesTab from '@/components/security/CleanIssuesTab';

const AdminVerificationTest = () => {
  const [isManualRefreshRunning, setIsManualRefreshRunning] = useState(false);
  const { toast } = useToast();

  // Original database health (real system health)
  const {
    score: healthScore,
    isStable,
    criticalIssuesCount,
    totalActiveIssues,
    totalFixedIssues,
    lastCalculated,
    recalculate: recalculateHealth
  } = useStableHealthScore();

  // Sync table verification data (separate from health)
  const {
    activeIssues,
    totalFixedCount,
    categorizedIssues,
    isLoading,
    error,
    refreshIssues
  } = useDatabaseIssues();

  const handleManualRefresh = async () => {
    setIsManualRefreshRunning(true);
    console.log('🔄 Manual refresh requested - refreshing both original DB health and sync data');

    try {
      toast({
        title: "🔄 Manual Refresh Started",
        description: "Refreshing original database health and sync table data...",
        variant: "default",
      });

      // Refresh both original database health and sync table data
      await Promise.all([
        recalculateHealth(),
        refreshIssues()
      ]);
      
      toast({
        title: "✅ Manual Refresh Complete",
        description: `Health Score: ${healthScore}/100 • Verification Issues: ${categorizedIssues.total}`,
        variant: "default",
      });
      
      console.log('✅ Manual refresh completed successfully');
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      toast({
        title: "❌ Refresh Failed",
        description: error instanceof Error ? error.message : "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setIsManualRefreshRunning(false);
    }
  };

  const getHealthScoreColor = () => {
    if (healthScore >= 80) return "text-green-800";
    if (healthScore >= 60) return "text-yellow-800";
    return "text-red-800";
  };

  const getHealthScoreBgColor = () => {
    if (healthScore >= 80) return "bg-green-50 border-green-200";
    if (healthScore >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <MainLayout>
      <PageContainer
        title="System Health & Verification Dashboard"
        subtitle="Original database health assessment with separate verification issue tracking"
      >
        <div className="space-y-6">
          {/* Original Database Health Status */}
          <Card className={getHealthScoreBgColor()}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${getHealthScoreColor()}`}>
                <div className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Original Database Health: {healthScore}/100
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleManualRefresh} 
                    disabled={isManualRefreshRunning || isLoading}
                    variant="outline"
                    size="sm"
                  >
                    {isManualRefreshRunning ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4 mr-2" />
                    )}
                    {isManualRefreshRunning ? 'Refreshing...' : 'Refresh All Data'}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription className={isStable ? 'text-green-700' : 'text-red-700'}>
                <strong>Real System Health Assessment</strong>
                <br />
                Last calculated: {lastCalculated.toLocaleTimeString()}
                <br />
                Critical Issues: {criticalIssuesCount} | Active Issues: {totalActiveIssues} | Fixes Applied: {totalFixedIssues}
                <br />
                Status: {isStable ? '✅ System is stable and secure' : '⚠️ System requires attention'}
                <br />
                <span className="text-xs font-medium">📊 Based on: User roles, permissions, data integrity, security policies</span>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Comparison View: Original DB vs Sync Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Database Metrics */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Original Database Status
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Real system health from actual database state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-800">{criticalIssuesCount}</div>
                    <div className="text-sm text-red-600">Critical Issues</div>
                    <div className="text-xs text-red-500">Security & Data</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-800">{totalActiveIssues}</div>
                    <div className="text-sm text-orange-600">Active Issues</div>
                    <div className="text-xs text-orange-500">Total Problems</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">{totalFixedIssues}</div>
                    <div className="text-sm text-green-600">Fixed Issues</div>
                    <div className="text-xs text-green-500">From Fixes Table</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-800">{healthScore}%</div>
                    <div className="text-sm text-blue-600">Health Score</div>
                    <div className="text-xs text-blue-500">Overall Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sync Table Verification Data */}
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center">
                  <Archive className="h-5 w-5 mr-2" />
                  Sync Table Verification
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Tracked verification issues from sync processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-800">{categorizedIssues.critical.length}</div>
                    <div className="text-sm text-red-600">Critical</div>
                    <div className="text-xs text-red-500">From Sync Table</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-800">{categorizedIssues.high.length}</div>
                    <div className="text-sm text-orange-600">High Priority</div>
                    <div className="text-xs text-orange-500">From Sync Table</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-800">{categorizedIssues.medium.length}</div>
                    <div className="text-sm text-yellow-600">Medium</div>
                    <div className="text-xs text-yellow-500">From Sync Table</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-800">{categorizedIssues.total}</div>
                    <div className="text-sm text-purple-600">Total Issues</div>
                    <div className="text-xs text-purple-500">Verification Sync</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Sync Table Connection Issue
                </CardTitle>
                <CardDescription className="text-red-700">
                  {error}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Verification Issues Management (from sync table only) */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-800">Sync Table Verification Issues</CardTitle>
              <CardDescription className="text-gray-700">
                Issues tracked in the verification sync table (separate from real database health above)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CleanIssuesTab 
                onReRunVerification={handleManualRefresh}
                isReRunning={isManualRefreshRunning}
              />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default AdminVerificationTest;
