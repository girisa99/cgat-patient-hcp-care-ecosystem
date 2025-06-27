
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, AlertTriangle, Lock, Bug } from 'lucide-react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import { useFixedIssuesTracker } from '@/hooks/useFixedIssuesTracker';
import EnhancedImplementationTracker from './EnhancedImplementationTracker';
import IssuesTab from '@/components/security/IssuesTab';
import FixedIssuesTracker from '@/components/security/FixedIssuesTracker';

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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
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
              Verification Results
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of the admin module
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
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="checks">Checks</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="issues">
            <IssuesTab 
              verificationSummary={verificationResult.comprehensiveResults}
              onReRunVerification={onReRunVerification}
              isReRunning={isReRunning}
            />
          </TabsContent>

          <TabsContent value="fixed">
            <FixedIssuesTracker 
              fixedIssues={fixedIssues} 
              totalFixesApplied={fixedCount}
            />
          </TabsContent>

          <TabsContent value="implementation">
            <EnhancedImplementationTracker />
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Stability Report</h4>
                <div className="space-y-1 text-sm">
                  {verificationResult.stabilityReport.map((line, index) => (
                    <p key={index} className={line.startsWith('🎯') || line.startsWith('📈') || line.startsWith('🔒') ? 'font-medium' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Key Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Overall Score:</span>
                    <span className={`font-bold ${getScoreColor(verificationResult.overallStabilityScore)}`}>
                      {verificationResult.overallStabilityScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>UI/UX Score:</span>
                    <span className="font-medium">{verificationResult.uiuxValidationResults?.overallScore || 'N/A'}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Issues:</span>
                    <span className={activeIssues > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      {activeIssues}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fixed Issues:</span>
                    <span className="text-green-600 font-medium">{fixedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={verificationResult.isStable ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {verificationResult.isStable ? 'Stable' : 'Unstable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="checks">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2 text-green-600">✅ Passed Checks</h4>
                <div className="space-y-1">
                  {verificationResult.passedChecks.map((check, index) => (
                    <p key={index} className="text-sm">{check}</p>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-red-600">❌ Failed Checks</h4>
                <div className="space-y-1">
                  {verificationResult.failedChecks.map((check, index) => (
                    <p key={index} className="text-sm">{check}</p>
                  ))}
                </div>
                {fixedCount > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      {fixedCount} issues have been automatically resolved
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="space-y-2">
              {verificationResult.recommendations.map((rec, index) => (
                <p key={index} className={rec.startsWith('🔧') || rec.startsWith('📋') || rec.startsWith('🎨') || rec.startsWith('👥') ? 'font-semibold text-blue-600' : 'text-sm pl-4'}>
                  {rec}
                </p>
              ))}
              {fixedCount > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                  <h5 className="font-semibold text-green-800 mb-2">✅ Completed Actions</h5>
                  <p className="text-sm text-green-700">
                    {fixedCount} issues were automatically fixed and removed from the active issues list. 
                    View the "Fixed" tab to see details of all resolved issues.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VerificationResultsTabs;
