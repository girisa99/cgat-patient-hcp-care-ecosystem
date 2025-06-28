
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Shield, CheckCircle, AlertTriangle, Lock, Zap } from 'lucide-react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import { useTabSynchronization } from '@/hooks/useTabSynchronization';
import SynchronizedTabHeader from './SynchronizedTabHeader';
import OverviewTabContent from './tabs/OverviewTabContent';
import RecommendationsTabContent from './tabs/RecommendationsTabContent';
import FixedTabContent from './tabs/FixedTabContent';
import EnhancedIssuesTabContent from './tabs/EnhancedIssuesTabContent';
import SecurityPerformanceTabContent from './tabs/SecurityPerformanceTabContent';
import ImplementationTabContent from './tabs/ImplementationTabContent';

interface VerificationResultsTabsProps {
  verificationResult: AdminModuleVerificationResult;
  onReRunVerification?: () => void;
  isReRunning?: boolean;
}

const VerificationResultsTabs: React.FC<VerificationResultsTabsProps> = ({
  verificationResult,
  onReRunVerification,
  isReRunning = false
}) => {
  const { syncData, triggerSync, processedData } = useTabSynchronization(verificationResult.comprehensiveResults);

  const getStatusBadge = () => {
    if (verificationResult.isLockedForCurrentState) {
      return <Badge variant="default" className="bg-green-600"><Lock className="h-3 w-3 mr-1" />Production Ready</Badge>;
    } else if (verificationResult.isStable) {
      return <Badge variant="default" className="bg-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Stable</Badge>;
    } else {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Needs Improvement</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Module Verification Results
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Zap className="h-3 w-3 mr-1" />
                Synchronized Tab System
              </Badge>
            </CardTitle>
            <CardDescription>
              Real-time synchronized tabs with enhanced fix tracking and backend detection
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {syncData.totalFixedCount > 0 && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                {syncData.totalFixedCount} Total Fixes
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="issues" className="w-full">
          <SynchronizedTabHeader 
            syncData={syncData}
            onRefresh={triggerSync}
            isRefreshing={isReRunning}
          />

          <TabsContent value="issues" className="mt-6">
            <EnhancedIssuesTabContent 
              verificationSummary={verificationResult.comprehensiveResults}
              processedData={processedData}
              syncData={syncData}
              onReRunVerification={onReRunVerification}
              isReRunning={isReRunning}
            />
          </TabsContent>

          <TabsContent value="fixed" className="mt-6">
            <FixedTabContent 
              fixedIssues={syncData.fixedIssues}
              totalFixesApplied={syncData.totalFixedCount}
              backendFixedCount={syncData.backendFixedCount}
              realFixesApplied={syncData.realFixesApplied}
            />
          </TabsContent>

          <TabsContent value="security-performance" className="mt-6">
            <SecurityPerformanceTabContent 
              verificationSummary={verificationResult.comprehensiveResults}
              syncData={syncData}
            />
          </TabsContent>

          <TabsContent value="implementation" className="mt-6">
            <ImplementationTabContent 
              syncData={syncData}
            />
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <OverviewTabContent
              verificationResult={verificationResult}
              fixedCount={syncData.totalFixedCount}
              syncData={syncData}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <RecommendationsTabContent
              verificationResult={verificationResult}
              fixedCount={syncData.totalFixedCount}
              syncData={syncData}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VerificationResultsTabs;
