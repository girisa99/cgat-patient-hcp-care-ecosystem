
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, AlertTriangle, Lock, Bug } from 'lucide-react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import { useUnifiedMetrics } from '@/hooks/useUnifiedMetrics';
import ConsolidatedActiveVsFixedTab from './tabs/ConsolidatedActiveVsFixedTab';
import ConsolidatedOverallFixedTab from './tabs/ConsolidatedOverallFixedTab';
import IssuesTabContent from './tabs/IssuesTabContent';

interface UnifiedVerificationTabsProps {
  verificationResult: AdminModuleVerificationResult;
}

const UnifiedVerificationTabs: React.FC<UnifiedVerificationTabsProps> = ({
  verificationResult
}) => {
  const { metrics, updateMetrics, processedData } = useUnifiedMetrics(verificationResult.comprehensiveResults);

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
              System Verification Dashboard
            </CardTitle>
            <CardDescription>
              Current system metrics with automated monitoring
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="issues" className="flex items-center">
              <Bug className="h-4 w-4 mr-2" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="active-vs-fixed" className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Active vs Fixed
            </TabsTrigger>
            <TabsTrigger value="overall-fixed" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Overall Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="mt-6">
            <IssuesTabContent 
              verificationSummary={verificationResult.comprehensiveResults}
            />
          </TabsContent>

          <TabsContent value="active-vs-fixed" className="mt-6">
            <ConsolidatedActiveVsFixedTab 
              metrics={metrics}
              processedData={processedData}
              onUpdate={() => updateMetrics('manual')}
            />
          </TabsContent>

          <TabsContent value="overall-fixed" className="mt-6">
            <ConsolidatedOverallFixedTab 
              metrics={metrics}
              processedData={processedData}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UnifiedVerificationTabs;
