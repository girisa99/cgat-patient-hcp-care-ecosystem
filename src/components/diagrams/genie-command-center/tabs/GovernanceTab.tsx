/**
 * Governance Tab - Data Governance & Continuous Update System
 * Provides visibility into data consistency, audit trails, and update workflows
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  FileText, 
  History, 
  Shield, 
  GitBranch,
  Clock,
  Database,
  Code,
  TrendingUp,
  Eye,
  Zap
} from 'lucide-react';
import { useGovernanceValidation } from '@/hooks/useGovernanceValidation';

export const GovernanceTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isValidating, setIsValidating] = useState(false);
  
  const {
    state,
    metrics,
    metadata,
    runValidation,
    getUpdateChecklist,
    getAuditLog,
    getPhaseData,
    completedPhases,
    pendingPhases,
    totalScenarios,
    implementedScenarios,
    completionPercentage,
  } = useGovernanceValidation();

  // Run validation on mount
  useEffect(() => {
    runValidation();
  }, [runValidation]);

  const handleValidate = async () => {
    setIsValidating(true);
    await new Promise(r => setTimeout(r, 1000)); // Simulate validation
    runValidation();
    setIsValidating(false);
  };

  const updateChecklist = getUpdateChecklist();
  const auditLog = getAuditLog();

  return (
    <div className="space-y-6">
      {/* Header with Validation Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Governance Dashboard</h2>
          <p className="text-muted-foreground">
            Single source of truth management for Genie Command Center
          </p>
        </div>
        <Button 
          onClick={handleValidate} 
          disabled={isValidating}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
          {isValidating ? 'Validating...' : 'Run Validation'}
        </Button>
      </div>

      {/* Validation Status Alert */}
      {state.validationResult && (
        <Alert variant={state.isValid ? 'default' : 'destructive'}>
          {state.isValid ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {state.isValid ? 'All Data Consistent' : 'Validation Issues Found'}
          </AlertTitle>
          <AlertDescription>
            {state.isValid 
              ? `Last validated: ${new Date(state.lastValidated!).toLocaleString()}`
              : `${state.validationResult.errors.length} errors, ${state.validationResult.warnings.length} warnings`
            }
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <Eye className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="sync-status" className="gap-2">
            <Database className="h-4 w-4" /> Sync Status
          </TabsTrigger>
          <TabsTrigger value="update-guide" className="gap-2">
            <FileText className="h-4 w-4" /> Update Guide
          </TabsTrigger>
          <TabsTrigger value="audit-log" className="gap-2">
            <History className="h-4 w-4" /> Audit Log
          </TabsTrigger>
          <TabsTrigger value="validation" className="gap-2">
            <Shield className="h-4 w-4" /> Validation
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics from Single Source */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalScenarios}</div>
                <p className="text-xs text-muted-foreground">Across P0-P5 phases</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Implemented</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{implementedScenarios}</div>
                <Progress value={completionPercentage} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completionPercentage}%</div>
                <p className="text-xs text-muted-foreground">
                  {completedPhases.length} phases complete
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Data Version</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">v{metadata.version}</div>
                <p className="text-xs text-muted-foreground">
                  Updated: {new Date(metadata.lastUpdated).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Phase Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Phase Implementation Status
              </CardTitle>
              <CardDescription>
                Real-time status derived from governance-data.ts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phase</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scenarios</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Completion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {['P0', 'P1', 'P2', 'P3', 'P4', 'P5'].map((phase) => {
                    const phaseData = getPhaseData(phase);
                    const data = phaseData || { total: 0, implemented: 0, status: 'planned' as const, percentage: 0 };
                    const pct = data.percentage;
                    return (
                      <TableRow key={phase}>
                        <TableCell className="font-medium">{phase}</TableCell>
                        <TableCell>
                          <Badge variant={data.status === 'completed' ? 'default' : 'secondary'}>
                            {data.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{data.implemented}/{data.total}</TableCell>
                        <TableCell className="w-40">
                          <Progress value={pct} />
                        </TableCell>
                        <TableCell>
                          <span className={pct === 100 ? 'text-green-600 font-bold' : ''}>
                            {pct}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Infrastructure Counts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Infrastructure Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{metrics.infrastructure.edgeFunctions}+</div>
                  <div className="text-xs text-muted-foreground">Edge Functions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{metrics.infrastructure.customHooks}+</div>
                  <div className="text-xs text-muted-foreground">Custom Hooks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{metrics.infrastructure.databaseTables}+</div>
                  <div className="text-xs text-muted-foreground">DB Tables</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{metrics.infrastructure.mobileComponents}</div>
                  <div className="text-xs text-muted-foreground">Mobile Components</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{metrics.infrastructure.aiAgents}+</div>
                  <div className="text-xs text-muted-foreground">AI Agents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{metrics.infrastructure.products}</div>
                  <div className="text-xs text-muted-foreground">Products</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SYNC STATUS TAB */}
        <TabsContent value="sync-status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Synchronization Status</CardTitle>
              <CardDescription>
                Shows which tabs/components consume governance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tab/Component</TableHead>
                    <TableHead>Data Source</TableHead>
                    <TableHead>Sync Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { tab: 'OverviewTab', source: 'governance-data.ts', method: 'Hook Import', status: 'synced' },
                    { tab: 'RoadmapTab', source: 'implementation-data.ts', method: 'Direct Import', status: 'synced' },
                    { tab: 'TechnicalDocsTab', source: 'implementation-data.ts', method: 'Direct Import', status: 'synced' },
                    { tab: 'InvestorDashboardTab', source: 'governance-data.ts + financial-data.ts', method: 'Hook Import', status: 'synced' },
                    { tab: 'ProductSuiteTab', source: 'implementation-data.ts', method: 'Direct Import', status: 'synced' },
                    { tab: 'MarketAnalysisTab', source: 'market-data.ts', method: 'Direct Import', status: 'synced' },
                    { tab: 'GenieCommandCenter Header', source: 'governance-data.ts', method: 'Hook Import', status: 'synced' },
                  ].map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.tab}</TableCell>
                      <TableCell><code className="text-xs bg-muted px-1 rounded">{item.source}</code></TableCell>
                      <TableCell>{item.method}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>How Sync Works</AlertTitle>
            <AlertDescription>
              All tabs import from centralized data files in <code>data/</code> folder. 
              When you update <code>governance-data.ts</code> or <code>implementation-data.ts</code>, 
              all consuming components automatically reflect the changes on next render.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* UPDATE GUIDE TAB */}
        <TabsContent value="update-guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Checklist</CardTitle>
              <CardDescription>
                Follow this checklist when updating scenarios or implementation status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Priority</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updateChecklist.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Badge variant={item.priority === 1 ? 'destructive' : item.priority === 2 ? 'default' : 'secondary'}>
                          P{item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 rounded">{item.file}</code>
                      </TableCell>
                      <TableCell>{item.section}</TableCell>
                      <TableCell className="text-muted-foreground">{item.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Update Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-3 text-sm">
                <li>
                  <strong>Update Source of Truth:</strong> Edit <code>governance-data.ts</code> → <code>masterScenarioCounts.phases</code>
                </li>
                <li>
                  <strong>Update Categories (if new):</strong> Edit <code>implementation-data.ts</code> → <code>scenarioCategories</code>
                </li>
                <li>
                  <strong>Run Validation:</strong> Click "Run Validation" button to check consistency
                </li>
                <li>
                  <strong>Verify Tabs:</strong> Check Overview, Roadmap, Technical, Investor tabs show correct numbers
                </li>
                <li>
                  <strong>Update Docs:</strong> Sync changes to <code>docs/GENIE_STUDIO_SCENARIO_MAP.md</code>
                </li>
                <li>
                  <strong>Log Audit Entry:</strong> Add entry to <code>recentAuditLog</code> in governance-data.ts
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT LOG TAB */}
        <TabsContent value="audit-log" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Audit Log
              </CardTitle>
              <CardDescription>
                Track all changes to governance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>By</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLog.map((entry, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs">
                          {new Date(entry.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            entry.action === 'UPDATE' ? 'default' : 
                            entry.action === 'VERIFY' ? 'secondary' :
                            entry.action === 'AUDIT' ? 'outline' : 'default'
                          }>
                            {entry.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{entry.area}</TableCell>
                        <TableCell>
                          {entry.previousValue && entry.newValue ? (
                            <span className="text-sm">
                              <span className="text-red-500 line-through">{entry.previousValue}</span>
                              {' → '}
                              <span className="text-green-600 font-medium">{entry.newValue}</span>
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell>{entry.performedBy}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {entry.notes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metadata.changeLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{log.date}</span>
                    </div>
                    <span>{log.change}</span>
                    <Badge variant="outline" className="ml-auto">{log.by}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VALIDATION TAB */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Validation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.validationResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {state.isValid ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                    <div>
                      <div className="font-bold text-lg">
                        {state.isValid ? 'All Checks Passed' : 'Issues Detected'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last checked: {new Date(state.validationResult.lastChecked).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {state.validationResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600">Errors ({state.validationResult.errors.length})</h4>
                      {state.validationResult.errors.map((err, i) => (
                        <Alert key={i} variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>{err}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  {state.validationResult.warnings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-yellow-600">Warnings ({state.validationResult.warnings.length})</h4>
                      {state.validationResult.warnings.map((warn, i) => (
                        <Alert key={i}>
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription>{warn}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  {state.isValid && state.validationResult.warnings.length === 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle>Perfect Consistency</AlertTitle>
                      <AlertDescription>
                        All scenario counts, phase statuses, and financial metrics are consistent across the system.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Run Validation" to check data consistency</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Phase totals are dynamically calculated (currently {metrics.scenarios.total})</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Implemented count cannot exceed total for any phase</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Completed phases must have 100% implementation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>LTV:CAC ratio must be ≥ 3x (healthy SaaS)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovernanceTab;
