/**
 * COMPREHENSIVE FRAMEWORK DASHBOARD
 * Real-time monitoring and management of complete framework compliance
 * Unified interface for all framework validation and enhancement features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useComprehensiveFramework } from '@/hooks/useComprehensiveFramework';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  Shield, 
  Cog, 
  TrendingUp,
  RefreshCw,
  Sparkles,
  BookOpen
} from 'lucide-react';

const ComprehensiveFrameworkDashboard: React.FC = () => {
  const {
    frameworkStatus,
    isValidating,
    validationResults,
    runFrameworkValidation,
    applyAutoFixes,
    enhancePrompt,
    getFrameworkMetrics,
    isFrameworkCompliant,
    hasBlockingIssues,
    needsAttention,
    meta
  } = useComprehensiveFramework();

  const [testPrompt, setTestPrompt] = useState('');
  const [enhancedPromptResult, setEnhancedPromptResult] = useState<any>(null);
  const [metrics, setMetrics] = useState(getFrameworkMetrics());

  useEffect(() => {
    setMetrics(getFrameworkMetrics());
  }, [validationResults, getFrameworkMetrics]);

  const handlePromptEnhancement = async () => {
    if (!testPrompt.trim()) return;
    
    const result = await enhancePrompt(testPrompt);
    setEnhancedPromptResult(result);
  };

  const getStatusColor = () => {
    if (hasBlockingIssues) return 'destructive';
    if (needsAttention) return 'secondary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (isFrameworkCompliant) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (hasBlockingIssues) return <XCircle className="h-5 w-5 text-red-600" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <div>
                <CardTitle>Comprehensive Framework Status</CardTitle>
                <CardDescription>
                  Real-time compliance monitoring and enhancement system
                </CardDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              <Badge variant={getStatusColor()}>
                {frameworkStatus.complianceScore}% Compliant
              </Badge>
              <Button 
                onClick={runFrameworkValidation} 
                disabled={isValidating}
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
                {isValidating ? 'Validating...' : 'Validate'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.totalValidations}</div>
              <div className="text-sm text-muted-foreground">Total Validations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.autoFixesApplied}</div>
              <div className="text-sm text-muted-foreground">Auto-Fixes Applied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.promptsEnhanced}</div>
              <div className="text-sm text-muted-foreground">Prompts Enhanced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.averageComplianceScore}%</div>
              <div className="text-sm text-muted-foreground">Avg Compliance</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Framework Compliance</span>
              <span>{frameworkStatus.complianceScore}%</span>
            </div>
            <Progress value={frameworkStatus.complianceScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="enhancement">Enhancement</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Framework Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Overall Compliance</span>
                    <Badge variant={getStatusColor()}>
                      {isFrameworkCompliant ? 'Compliant' : 'Needs Work'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Violations</span>
                    <span className="font-mono">{frameworkStatus.violations.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Critical Issues</span>
                    <span className="font-mono text-red-600">{frameworkStatus.violations.critical}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Validation</span>
                    <span className="text-sm text-muted-foreground">
                      {meta.lastValidation ? new Date(meta.lastValidation).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auto-Fix Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Auto-Fix Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Auto-Fix Available</span>
                    <Badge variant={frameworkStatus.autoFixAvailable ? 'default' : 'secondary'}>
                      {frameworkStatus.autoFixAvailable ? 'Available' : 'None'}
                    </Badge>
                  </div>
                  <Button 
                    onClick={applyAutoFixes}
                    disabled={!frameworkStatus.autoFixAvailable || isValidating}
                    className="w-full"
                  >
                    <Cog className="h-4 w-4 mr-2" />
                    Apply Auto-Fixes
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Automatically resolve duplicate components and governance violations
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Framework Violations</CardTitle>
              <CardDescription>Detailed breakdown of compliance issues</CardDescription>
            </CardHeader>
            <CardContent>
              {validationResults ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded">
                      <div className="text-lg font-bold text-red-600">{validationResults.violations.duplicates}</div>
                      <div className="text-sm">Duplicates</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-lg font-bold text-orange-600">{validationResults.violations.mockData}</div>
                      <div className="text-sm">Mock Data</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-lg font-bold text-yellow-600">{validationResults.violations.singleSource}</div>
                      <div className="text-sm">Single Source</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-lg font-bold text-blue-600">{validationResults.violations.governance}</div>
                      <div className="text-sm">Governance</div>
                    </div>
                  </div>

                  {validationResults.blockingIssues.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Blocking Issues:</h4>
                      <ul className="space-y-1">
                        {validationResults.blockingIssues.map((issue, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <XCircle className="h-4 w-4 text-red-600 mr-2" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResults.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Recommendations:</h4>
                      <ul className="space-y-1">
                        {validationResults.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Run validation to see detailed violations</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhancement Tab */}
        <TabsContent value="enhancement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Prompt Enhancement Engine
              </CardTitle>
              <CardDescription>
                Test prompt enhancement with compliance context injection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Test Prompt:</label>
                  <textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Enter a prompt to test enhancement (e.g., 'Create a new user management component')"
                    className="w-full p-3 border rounded mt-1 min-h-[100px]"
                  />
                </div>
                <Button onClick={handlePromptEnhancement} disabled={!testPrompt.trim()}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enhance Prompt
                </Button>

                {enhancedPromptResult && (
                  <div className="border rounded p-4 bg-muted">
                    <h4 className="font-semibold mb-2">Enhanced Prompt:</h4>
                    <pre className="whitespace-pre-wrap text-sm bg-background p-3 rounded border">
                      {enhancedPromptResult.enhancedPrompt}
                    </pre>
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <span>Compliance Score: <strong>{enhancedPromptResult.complianceScore}%</strong></span>
                      <span>Enhancements: <strong>{enhancedPromptResult.frameworkGuidance.length}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Framework Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Framework Version</span>
                    <span className="font-mono">{meta.frameworkVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validation Count</span>
                    <span className="font-mono">{meta.validationCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enhancement Count</span>
                    <span className="font-mono">{meta.enhancementCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance Trend</span>
                    <span className="font-mono">
                      {metrics.trendsData.scores.length > 1 && 
                        (metrics.trendsData.scores[metrics.trendsData.scores.length - 1] > 
                         metrics.trendsData.scores[metrics.trendsData.scores.length - 2] ? '↗️' : '↘️')
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Framework Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    No duplicate components/services
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Real database data only
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Single source of truth
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Prompt enhancement active
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Auto-fix capabilities
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveFrameworkDashboard;