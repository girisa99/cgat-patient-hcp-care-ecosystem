
/**
 * System Verification Dashboard
 * Manual-only verification system with no automatic syncing
 */

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Database, RefreshCw } from 'lucide-react';
import { useDatabaseIssues } from '@/hooks/useDatabaseIssues';
import { useStableHealthScore } from '@/hooks/useStableHealthScore';
import CleanIssuesTab from '@/components/security/CleanIssuesTab';

const AdminVerificationTest = () => {
  const [isManualRefreshRunning, setIsManualRefreshRunning] = useState(false);
  const { toast } = useToast();

  const {
    activeIssues,
    totalFixedCount,
    categorizedIssues,
    isLoading,
    error,
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

  // Recalculate health score when issues data changes
  useEffect(() => {
    if (activeIssues.length > 0 || totalFixedCount > 0) {
      console.log('🔄 Issues data changed, recalculating health score');
      recalculateHealth();
    }
  }, [activeIssues.length, totalFixedCount, recalculateHealth]);

  const handleManualRefresh = async () => {
    setIsManualRefreshRunning(true);
    console.log('🔄 Manual refresh requested - loading data from database only');

    try {
      toast({
        title: "🔄 Manual Refresh Started",
        description: "Loading current data from database...",
        variant: "default",
      });

      // Refresh database data first
      await refreshIssues();
      console.log('✅ Database data refreshed');
      
      // Give a moment for state to update, then recalculate health
      setTimeout(async () => {
        await recalculateHealth();
        console.log('✅ Health score recalculated');
        
        toast({
          title: "✅ Manual Refresh Complete",
          description: `Data refreshed from database. Health Score: ${healthScore}/100`,
          variant: "default",
        });
      }, 500);
      
      console.log('✅ Manual refresh completed successfully');
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      toast({
        title: "❌ Refresh Failed",
        description: error instanceof Error ? error.message : "Failed to refresh data from database",
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
        title="System Verification Dashboard"
        subtitle="Manual database verification monitoring - no automatic syncing"
      >
        <div className="space-y-6">
          {/* System Health Status */}
          <Card className={getHealthScoreBgColor()}>
            <CardHeader>
              <CardTitle className={`flex items-center justify-between ${getHealthScoreColor()}`}>
                <div className="flex items-center">
                  {isStable ? 
                    <CheckCircle className="h-5 w-5 mr-2" /> : 
                    <AlertTriangle className="h-5 w-5 mr-2" />
                  }
                  System Health: {healthScore}/100
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
                    {isManualRefreshRunning ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription className={isStable ? 'text-green-700' : 'text-red-700'}>
                Last calculated: {lastCalculated.toLocaleTimeString()}
                <br />
                Critical Issues: {criticalIssuesCount} | Total Active: {totalActiveIssues} | Fixed: {totalFixedIssues}
                <br />
                System is {isStable ? 'stable and performing well' : 'experiencing issues that need attention'}
                <br />
                <span className="text-xs font-medium">📊 Manual refresh only - no automatic syncing</span>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* System Metrics Display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-800">{totalFixedCount}</div>
                <div className="text-sm text-green-600">Total Fixed Issues</div>
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
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Issues Management */}
          <CleanIssuesTab 
            onReRunVerification={handleManualRefresh}
            isReRunning={isManualRefreshRunning}
          />
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default AdminVerificationTest;
