
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, AlertTriangle, Lock, Bug, Activity } from 'lucide-react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import { useFixedIssuesTracker } from '@/hooks/useFixedIssuesTracker';
import OverviewTabContent from './tabs/OverviewTabContent';
import RecommendationsTabContent from './tabs/RecommendationsTabContent';
import FixedTabContent from './tabs/FixedTabContent';
import IssuesTabContent from './tabs/IssuesTabContent';
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
  const { 
    fixedIssues, 
    getTotalFixedCount 
  } = useFixedIssuesTracker();

  const getStatusBadge = () => {
    if (verificationResult.isLockedForCurrentState) {
      return <Badge variant="default" className="bg-green-600"><Lock className="h-3 w-3 mr-1" />Production Ready</Badge>;
    } else if (verificationResult.isStable) {
      return <Badge variant="default" className="bg-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Stable</Badge>;
    } else {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Needs Improvement</Badge>;
    }
  };

  // Calculate active issues (excluding fixed ones)
  const totalIssues = verificationResult.criticalIssues.length + verificationResult.failedChecks.length;
  const activeIssues = Math.max(0, totalIssues - getTotalFixedCount());
  const fixedCount = getTotalFixedCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Module Verification Results
            </CardTitle>
            <CardDescription>
              Comprehensive analysis including security, performance, and system health
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {fixedCount > 0 && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                {fixedCount} Fixed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="issues" className="flex items-center">
              <Bug className="h-4 w-4 mr-1" />
              Issues ({activeIssues})
            </TabsTrigger>
            <TabsTrigger value="fixed" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Fixed ({fixedCount})
            </TabsTrigger>
            <TabsTrigger value="security-performance" className="flex items-center">
              <Activity className="h-4 w-4 mr-1" />
              Security & Performance
            </TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="issues">
            <IssuesTabContent 
              verificationSummary={verificationResult.comprehensiveResults}
              onReRunVerification={onReRunVerification}
              isReRunning={isReRunning}
            />
          </TabsContent>

          <TabsContent value="fixed">
            <FixedTabContent 
              fixedIssues={fixedIssues} 
              totalFixesApplied={fixedCount}
            />
          </TabsContent>

          <TabsContent value="security-performance">
            <SecurityPerformanceTabContent 
              verificationSummary={verificationResult.comprehensiveResults}
            />
          </TabsContent>

          <TabsContent value="implementation">
            <ImplementationTabContent />
          </TabsContent>

          <TabsContent value="overview">
            <OverviewTabContent
              verificationResult={verificationResult}
              fixedCount={fixedCount}
            />
          </TabsContent>

          <TabsContent value="recommendations">
            <RecommendationsTabContent
              verificationResult={verificationResult}
              fixedCount={fixedCount}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VerificationResultsTabs;
