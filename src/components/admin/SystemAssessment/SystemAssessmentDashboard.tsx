
/**
 * System Assessment Dashboard
 * Comprehensive view of system health, cleanup recommendations, and current state
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Database, Code, Zap, FileText, Download, RefreshCw } from 'lucide-react';
import { useSystemAssessment } from '@/hooks/useSystemAssessment';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SystemAssessmentDashboard = () => {
  const {
    assessmentReport,
    isLoadingAssessment,
    assessmentError,
    refetchAssessment,
    generateCleanupScript,
    generateMigrationPlan,
    hasCriticalFindings,
    mockDataSeverity,
    totalTablesReviewed,
    unnecessaryTablesCount,
    emptyTablesCount
  } = useSystemAssessment();

  if (isLoadingAssessment) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Running comprehensive system assessment...</span>
      </div>
    );
  }

  if (assessmentError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Assessment Failed</AlertTitle>
        <AlertDescription>
          Failed to run system assessment. Please try again.
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchAssessment()}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!assessmentReport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Assessment</CardTitle>
          <CardDescription>Run assessment to analyze system health</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetchAssessment()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Assessment Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of system health, performance, and optimization opportunities
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={generateCleanupScript}>
                <Download className="h-4 w-4 mr-2" />
                Download Cleanup Script
              </Button>
              <Button variant="outline" onClick={generateMigrationPlan}>
                <FileText className="h-4 w-4 mr-2" />
                Migration Plan
              </Button>
              <Button onClick={() => refetchAssessment()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span className="text-sm font-medium">Mock Data</span>
                </div>
                <div className="mt-2">
                  <Badge variant={getSeverityColor(mockDataSeverity || 'low')}>
                    {(mockDataSeverity || 'unknown').toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Tables Reviewed</span>
                </div>
                <div className="mt-2 text-2xl font-bold">{totalTablesReviewed}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Unnecessary Tables</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-orange-600">{unnecessaryTablesCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Empty Tables</span>
                </div>
                <div className="mt-2 text-2xl font-bold">{emptyTablesCount}</div>
              </CardContent>
            </Card>
          </div>

          {hasCriticalFindings && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical Findings Detected</AlertTitle>
              <AlertDescription>
                {assessmentReport.criticalFindings.length} critical issues require immediate attention.
              </AlertDescription>
            </Alert>
          )}

          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
              {assessmentReport.executiveSummary}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Assessment Tabs */}
      <Tabs defaultValue="critical" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="critical">Critical Findings</TabsTrigger>
          <TabsTrigger value="mock-data">Mock Data</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="sync">Real-time Sync</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Critical Findings
              </CardTitle>
              <CardDescription>Issues that require immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assessmentReport.criticalFindings.map((finding, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertDescription>{finding}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mock-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mock Data Assessment</CardTitle>
              <CardDescription>Analysis of mock data usage across the codebase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Files with Mock Data:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {assessmentReport.detailedFindings.mockDataAssessment.filesWithMockData.map((file, index) => (
                      <li key={index}>{file}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Cleanup Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {assessmentReport.detailedFindings.mockDataAssessment.cleanupRecommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Table Analysis</CardTitle>
              <CardDescription>Review of table utilization and optimization opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Essential Tables ({assessmentReport.detailedFindings.tableUtilization.essentialTables.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {assessmentReport.detailedFindings.tableUtilization.essentialTables.map((table, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{table.name}</h5>
                            <p className="text-sm text-muted-foreground">{table.purpose}</p>
                          </div>
                          <Badge variant={table.isActive ? 'default' : 'secondary'}>
                            {table.recordCount} records
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Tables for Review ({assessmentReport.detailedFindings.tableUtilization.unnecessaryTables.length})</h4>
                  <div className="space-y-3">
                    {assessmentReport.detailedFindings.tableUtilization.unnecessaryTables.map((table, index) => (
                      <Alert key={index}>
                        <Database className="h-4 w-4" />
                        <AlertTitle>{table.name} ({table.recordCount} records)</AlertTitle>
                        <AlertDescription>
                          {table.reason}
                          {table.canDelete && (
                            <Badge variant="destructive" className="ml-2">Can be removed</Badge>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Real-time Sync Status
              </CardTitle>
              <CardDescription>Analysis of real-time synchronization across system modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(assessmentReport.detailedFindings.realTimeSyncStatus).map(([module, status]: [string, any]) => (
                  <Card key={module} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium capitalize">{module.replace(/([A-Z])/g, ' $1').trim()}</h5>
                      <Badge variant={status.realTimeUpdates ? 'default' : 'secondary'}>
                        {status.syncStatus || (status.hasRealTimeSync ? 'Active' : 'Inactive')}
                      </Badge>
                    </div>
                    {status.issues && status.issues.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">Issues:</p>
                        <ul className="list-disc list-inside">
                          {status.issues.map((issue: string, idx: number) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Immediate Actions</CardTitle>
                <CardDescription>High priority - implement now</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {assessmentReport.actionableRecommendations.immediate.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Short-term Actions</CardTitle>
                <CardDescription>Medium priority - plan for next sprint</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {assessmentReport.actionableRecommendations.shortTerm.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Long-term Actions</CardTitle>
                <CardDescription>Low priority - future roadmap</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {assessmentReport.actionableRecommendations.longTerm.map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemAssessmentDashboard;
