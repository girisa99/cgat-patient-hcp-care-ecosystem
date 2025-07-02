
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useEnhancedTestingBusinessLayer } from '@/hooks/useEnhancedTestingBusinessLayer';
import { useToast } from '@/hooks/use-toast';
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Shield,
  FileText,
  Zap
} from 'lucide-react';

export const ComprehensiveTestingTab: React.FC = () => {
  const { 
    enhancedMetrics,
    isLoadingMetrics,
    isExecuting,
    isGeneratingDocs,
    executeStandardTestSuite,
    executeSecurityTestSuite,
    generateFullDocumentationPackage,
    generateComplianceReport,
    buildTraceabilityMatrix
  } = useEnhancedTestingBusinessLayer();

  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExecuteStandardSuite = async () => {
    setActiveOperation('standard');
    try {
      await executeStandardTestSuite();
      toast({
        title: "✅ Standard Test Suite Completed",
        description: "Comprehensive testing completed successfully",
      });
    } catch (error) {
      toast({
        title: "❌ Test Suite Failed",
        description: "Failed to execute standard test suite",
        variant: "destructive",
      });
    } finally {
      setActiveOperation(null);
    }
  };

  const handleExecuteSecuritySuite = async () => {
    setActiveOperation('security');
    try {
      await executeSecurityTestSuite();
      toast({
        title: "🔒 Security Test Suite Completed",
        description: "Security validation completed successfully",
      });
    } catch (error) {
      toast({
        title: "❌ Security Tests Failed",
        description: "Failed to execute security test suite",
        variant: "destructive",
      });
    } finally {
      setActiveOperation(null);
    }
  };

  const handleGenerateDocumentation = async () => {
    setActiveOperation('docs');
    try {
      await generateFullDocumentationPackage();
      toast({
        title: "📋 Documentation Generated",
        description: "Comprehensive documentation package created",
      });
    } catch (error) {
      toast({
        title: "❌ Documentation Failed",
        description: "Failed to generate documentation",
        variant: "destructive",
      });
    } finally {
      setActiveOperation(null);
    }
  };

  const handleGenerateComplianceReport = async () => {
    setActiveOperation('compliance');
    try {
      const report = await generateComplianceReport('21CFR');
      if (report) {
        toast({
          title: "✅ Compliance Report Generated",
          description: `21 CFR Part 11 report created with ${report.overallScore}% compliance`,
        });
      }
    } catch (error) {
      toast({
        title: "❌ Compliance Report Failed",
        description: "Failed to generate compliance report",
        variant: "destructive",
      });
    } finally {
      setActiveOperation(null);
    }
  };

  const handleBuildTraceabilityMatrix = async () => {
    setActiveOperation('traceability');
    try {
      const matrix = await buildTraceabilityMatrix();
      if (matrix) {
        toast({
          title: "🔗 Traceability Matrix Built",
          description: `Coverage analysis completed: ${matrix.overallCoverage}%`,
        });
      }
    } catch (error) {
      toast({
        title: "❌ Traceability Matrix Failed",
        description: "Failed to build traceability matrix",
        variant: "destructive",
      });
    } finally {
      setActiveOperation(null);
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Business Layer Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="text-xl font-semibold text-purple-900">Enhanced Comprehensive Testing</h3>
              <p className="text-purple-700">Advanced testing capabilities with business intelligence</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Metrics Dashboard */}
      {enhancedMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TestTube className="h-4 w-4 text-blue-600" />
                Total Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{enhancedMetrics.totalTests}</div>
              <p className="text-xs text-muted-foreground">Test executions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getComplianceColor(enhancedMetrics.complianceScore)}`}>
                {enhancedMetrics.complianceScore}%
              </div>
              <p className="text-xs text-muted-foreground">21 CFR Part 11</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {enhancedMetrics.totalTests > 0 ? 
                  ((enhancedMetrics.executedTests / enhancedMetrics.totalTests) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Pass rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Risk Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {enhancedMetrics.riskAssessment.critical + enhancedMetrics.riskAssessment.high}
              </div>
              <p className="text-xs text-muted-foreground">Critical & High</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Test Execution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Enhanced Test Execution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EnhancedButton 
              onClick={handleExecuteStandardSuite}
              loading={isExecuting || activeOperation === 'standard'}
              loadingText="Executing Standard Suite..."
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Execute Standard Test Suite
            </EnhancedButton>

            <EnhancedButton 
              onClick={handleExecuteSecuritySuite}
              loading={isExecuting || activeOperation === 'security'}
              loadingText="Executing Security Suite..."
              className="w-full"
              variant="outline"
            >
              <Shield className="h-4 w-4 mr-2" />
              Execute Security Test Suite
            </EnhancedButton>

            {enhancedMetrics && (
              <div className="p-3 border rounded-lg bg-gray-50">
                <div className="text-sm font-medium mb-2">Last Execution Trends</div>
                <div className="space-y-1 text-xs">
                  <div>Week over Week: +{enhancedMetrics.trendsAnalysis.weekOverWeek}%</div>
                  <div>Month over Month: +{enhancedMetrics.trendsAnalysis.monthOverMonth}%</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Documentation & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentation & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EnhancedButton 
              onClick={handleGenerateDocumentation}
              loading={isGeneratingDocs || activeOperation === 'docs'}
              loadingText="Generating Documentation..."
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Documentation Package
            </EnhancedButton>

            <EnhancedButton 
              onClick={handleGenerateComplianceReport}
              loading={activeOperation === 'compliance'}
              loadingText="Generating Compliance Report..."
              className="w-full"
              variant="outline"
            >
              <Shield className="h-4 w-4 mr-2" />
              Generate 21 CFR Part 11 Report
            </EnhancedButton>

            <EnhancedButton 
              onClick={handleBuildTraceabilityMatrix}
              loading={activeOperation === 'traceability'}
              loadingText="Building Traceability Matrix..."
              className="w-full"
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Build Traceability Matrix
            </EnhancedButton>
          </CardContent>
        </Card>
      </div>

      {/* Module Breakdown */}
      {enhancedMetrics && Object.keys(enhancedMetrics.moduleBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Module Testing Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(enhancedMetrics.moduleBreakdown).map(([module, stats]) => (
                <div key={module} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{module}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{stats.testCount} tests</Badge>
                      <Badge variant={stats.passRate >= 80 ? 'default' : 'destructive'}>
                        {stats.passRate.toFixed(1)}% pass rate
                      </Badge>
                    </div>
                  </div>
                  <Progress value={stats.passRate} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    Compliance: {stats.complianceLevel}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Insights */}
      {enhancedMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Testing Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-700 mb-2">Recent Improvements</h4>
                <ul className="text-sm space-y-1">
                  {enhancedMetrics.trendsAnalysis.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-700 mb-2">Areas of Concern</h4>
                <ul className="text-sm space-y-1">
                  {enhancedMetrics.trendsAnalysis.concerns.map((concern, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-orange-600" />
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
