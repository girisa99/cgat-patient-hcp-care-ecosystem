
/**
 * System Verification Dashboard
 * Manual-only verification system with health score based on original database state
 */

import React, { useState } from 'react';
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
      
      // Give a moment for state to update, then recalculate health from original database
      setTimeout(async () => {
        await recalculateHealth();
        console.log('✅ Health score recalculated from original database state');
        
        toast({
          title: "✅ Manual Refresh Complete",
          description: `Data refreshed. Health Score: ${healthScore}/100 (from original DB state)`,
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
        subtitle="Health score based on original database state - verification data shown separately"
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
                Health Score based on ORIGINAL database state assessment
                <br />
                Critical Issues: {criticalIssuesCount} | Total Active: {totalActiveIssues} | Fixed: {totalFixedIssues}
                <br />
                System is {isStable ? 'stable and performing well' : 'experiencing issues that need attention'}
                <br />
                <span className="text-xs font-medium">📊 Health from original DB • Verification data separate</span>
                <br />
                <span className="text-xs text-gray-600">
                  Real database health assessment (users, roles, permissions, data integrity)
                </span>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* System Metrics Display */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-800">{totalFixedCount}</div>
                <div className="text-sm text-green-600">Issues Fixed</div>
                <div className="text-xs text-green-500 mt-1">From Fix Tracking</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-800">{criticalIssuesCount}</div>
                <div className="text-sm text-red-600">Critical Issues</div>
                <div className="text-xs text-red-500 mt-1">From Original DB</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-800">{totalActiveIssues}</div>
                <div className="text-sm text-orange-600">Total Active</div>
                <div className="text-xs text-orange-500 mt-1">From Original DB</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-800">{categorizedIssues.total}</div>
                <div className="text-sm text-blue-600">Verification Issues</div>
                <div className="text-xs text-blue-500 mt-1">From Sync Table</div>
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

          {/* Verification Issues Management (separate from health score) */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Verification Issues Management</CardTitle>
              <CardDescription className="text-blue-700">
                These are issues identified during verification runs (separate from health score calculation)
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
