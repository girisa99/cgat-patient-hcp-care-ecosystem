import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent } from '@/components/ui/enhanced-tabs';
import { Shield, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import EnhancedImplementationTracker from './EnhancedImplementationTracker';

interface VerificationResultsTabsProps {
  verificationResult: AdminModuleVerificationResult;
}

const VerificationResultsTabs: React.FC<VerificationResultsTabsProps> = ({
  verificationResult
}) => {
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
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <EnhancedTabs defaultValue="implementation" className="w-full">
          <EnhancedTabsList>
            <EnhancedTabsTrigger value="implementation">Implementation</EnhancedTabsTrigger>
            <EnhancedTabsTrigger value="overview">Overview</EnhancedTabsTrigger>
            <EnhancedTabsTrigger value="checks">Checks</EnhancedTabsTrigger>
            <EnhancedTabsTrigger value="recommendations">Recommendations</EnhancedTabsTrigger>
            <EnhancedTabsTrigger value="issues">Issues</EnhancedTabsTrigger>
            <EnhancedTabsTrigger value="plan">Plan</EnhancedTabsTrigger>
          </EnhancedTabsList>

          <EnhancedTabsContent value="implementation">
            <EnhancedImplementationTracker />
          </EnhancedTabsContent>

          <EnhancedTabsContent value="overview">
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
                    <span>Status:</span>
                    <span className={verificationResult.isStable ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {verificationResult.isStable ? 'Stable' : 'Unstable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </EnhancedTabsContent>

          <EnhancedTabsContent value="checks">
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
              </div>
            </div>
          </EnhancedTabsContent>

          <EnhancedTabsContent value="recommendations">
            <div className="space-y-2">
              {verificationResult.recommendations.map((rec, index) => (
                <p key={index} className={rec.startsWith('🔧') || rec.startsWith('📋') || rec.startsWith('🎨') || rec.startsWith('👥') ? 'font-semibold text-blue-600' : 'text-sm pl-4'}>
                  {rec}
                </p>
              ))}
            </div>
          </EnhancedTabsContent>

          <EnhancedTabsContent value="issues">
            {verificationResult.criticalIssues.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600">🚨 Critical Issues</h4>
                {verificationResult.criticalIssues.map((issue, index) => (
                  <p key={index} className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-500">
                    {issue}
                  </p>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h4 className="font-semibold text-green-600">No Critical Issues Detected</h4>
                <p className="text-muted-foreground">The admin module is free of critical issues.</p>
              </div>
            )}
          </EnhancedTabsContent>

          <EnhancedTabsContent value="plan">
            <div className="space-y-2">
              {verificationResult.improvementPlan.map((item, index) => (
                <p key={index} className={item.startsWith('📋') || item.startsWith('🚨') || item.startsWith('⚡') || item.startsWith('🔧') ? 'font-semibold text-blue-600' : 'text-sm pl-4'}>
                  {item}
                </p>
              ))}
            </div>
          </EnhancedTabsContent>
        </EnhancedTabs>
      </CardContent>
    </Card>
  );
};

export default VerificationResultsTabs;
