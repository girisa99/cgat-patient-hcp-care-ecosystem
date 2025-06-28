
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, AlertTriangle, Lock, Zap, RefreshCw, Bug, Database, Code, Eye } from 'lucide-react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import { useUnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import ActiveIssuesTab from './tabs/ActiveIssuesTab';
import FixedIssuesTab from './tabs/FixedIssuesTab';
import OverallFixedTab from './tabs/OverallFixedTab';
import SecurityTab from './tabs/SecurityTab';
import UIUXTab from './tabs/UIUXTab';
import DatabaseTab from './tabs/DatabaseTab';
import CodeQualityTab from './tabs/CodeQualityTab';
import ImplementationTabContent from './tabs/ImplementationTabContent';
import OverviewTabContent from './tabs/OverviewTabContent';
import RecommendationsTabContent from './tabs/RecommendationsTabContent';

interface UnifiedVerificationTabsProps {
  verificationResult: AdminModuleVerificationResult;
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const UnifiedVerificationTabs: React.FC<UnifiedVerificationTabsProps> = ({
  verificationResult,
  onReRunVerification,
  isReRunning = false
}) => {
  const { metrics, updateMetrics, processedData } = useUnifiedMetrics(verificationResult.comprehensiveResults);

  const handleManualUpdate = () => {
    updateMetrics('manual');
    if (onReRunVerification) {
      onReRunVerification();
    }
  };

  const getStatusBadge = () => {
    if (verificationResult.isLockedForCurrentState) {
      return <Badge variant="default" className="bg-green-600"><Lock className="h-3 w-3 mr-1" />Production Ready</Badge>;
    } else if (verificationResult.isStable) {
      return <Badge variant="default" className="bg-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Stable</Badge>;
    } else {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Needs Improvement</Badge>;
    }
  };

  const syncData = {
    activeIssues: processedData.allIssues,
    fixedIssues: processedData.backendFixedIssues || [],
    totalActiveCount: metrics.totalActiveIssues,
    totalFixedCount: metrics.totalFixedIssues,
    criticalCount: metrics.criticalActive,
    highCount: metrics.highActive,
    mediumCount: metrics.mediumActive,
    securityIssuesCount: metrics.securityActive,
    backendFixedCount: metrics.backendFixedCount,
    realFixesApplied: metrics.realFixesApplied,
    lastUpdateTime: metrics.lastUpdateTime
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Unified Verification System
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Zap className="h-3 w-3 mr-1" />
                Real-time Sync
              </Badge>
            </CardTitle>
            <CardDescription>
              Synchronized metrics with programmatic and auto-detection capabilities
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Badge 
              variant={metrics.countsAligned ? "default" : "destructive"} 
              className={metrics.countsAligned ? "bg-green-100 text-green-800" : ""}
            >
              {metrics.countsAligned ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              {metrics.countsAligned ? "Aligned" : "Syncing"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Status Banner */}
        <div className={`mb-6 p-4 rounded-lg border ${
          metrics.isUpdating ? 'bg-blue-50 border-blue-200' : 
          metrics.countsAligned ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${metrics.isUpdating ? 'animate-spin text-blue-600' : 'text-green-600'}`} />
              <span className="text-sm font-medium">
                {metrics.isUpdating ? 'Updating metrics...' : 
                 metrics.countsAligned ? 'Metrics synchronized' : 'Alignment in progress'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Last update: {metrics.updateSource}</span>
              <span>•</span>
              <span>{metrics.lastUpdateTime.toLocaleTimeString()}</span>
              <button 
                onClick={handleManualUpdate}
                className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                disabled={metrics.isUpdating}
              >
                Manual Run
              </button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="active-vs-fixed" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="active-vs-fixed" className="flex items-center">
              <Bug className="h-3 w-3 mr-1" />
              Active vs Fixed
            </TabsTrigger>
            <TabsTrigger value="overall-fixed" className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Overall Fixed
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Security ({metrics.securityActive})
            </TabsTrigger>
            <TabsTrigger value="uiux" className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              UI/UX ({metrics.uiuxActive})
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center">
              <Database className="h-3 w-3 mr-1" />
              Database ({metrics.databaseActive})
            </TabsTrigger>
            <TabsTrigger value="code-quality" className="flex items-center">
              <Code className="h-3 w-3 mr-1" />
              Code Quality ({metrics.codeQualityActive})
            </TabsTrigger>
            <TabsTrigger value="implementation" className="flex items-center">
              Implementation
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center">
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active-vs-fixed" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActiveIssuesTab 
                metrics={metrics}
                processedData={processedData}
                onUpdate={() => updateMetrics('manual')}
              />
              <FixedIssuesTab 
                metrics={metrics}
                processedData={processedData}
              />
            </div>
          </TabsContent>

          <TabsContent value="overall-fixed" className="mt-6">
            <OverallFixedTab metrics={metrics} />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecurityTab 
              metrics={metrics}
              issues={processedData.issuesByTopic['Security Issues'] || []}
              onUpdate={() => updateMetrics('manual')}
            />
          </TabsContent>

          <TabsContent value="uiux" className="mt-6">
            <UIUXTab 
              metrics={metrics}
              issues={processedData.issuesByTopic['UI/UX Issues'] || []}
              onUpdate={() => updateMetrics('manual')}
            />
          </TabsContent>

          <TabsContent value="database" className="mt-6">
            <DatabaseTab 
              metrics={metrics}
              issues={processedData.issuesByTopic['Database Issues'] || []}
              onUpdate={() => updateMetrics('manual')}
            />
          </TabsContent>

          <TabsContent value="code-quality" className="mt-6">
            <CodeQualityTab 
              metrics={metrics}
              issues={processedData.issuesByTopic['Code Quality'] || []}
              onUpdate={() => updateMetrics('manual')}
            />
          </TabsContent>

          <TabsContent value="implementation" className="mt-6">
            <ImplementationTabContent syncData={syncData} />
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <OverviewTabContent
              verificationResult={verificationResult}
              fixedCount={metrics.totalFixedIssues}
              syncData={syncData}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <RecommendationsTabContent
              verificationResult={verificationResult}
              fixedCount={metrics.totalFixedIssues}
              syncData={syncData}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UnifiedVerificationTabs;
