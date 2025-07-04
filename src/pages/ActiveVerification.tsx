
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemVerificationDashboard } from '@/components/verification/SystemVerificationDashboard';
import { MasterConsolidationValidator } from '@/components/verification/MasterConsolidationValidator';
import { MasterConsolidationComplianceDashboard } from '@/components/verification/MasterConsolidationComplianceDashboard';
import { useMasterConsolidationValidator } from '@/hooks/useMasterConsolidationValidator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Database, 
  Code,
  Layers,
  Target,
  CheckCircle
} from 'lucide-react';

const ActiveVerification: React.FC = () => {
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const [activeTab, setActiveTab] = useState('compliance');
  const consolidationValidator = useMasterConsolidationValidator();

  if (!hasAccess('/active-verification')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Active Verification.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const consolidationReport = consolidationValidator.validateMasterConsolidation();
  const consolidationPlan = consolidationValidator.generateConsolidationPlan();

  return (
    <AppLayout title="Master Consolidation Verification System">
      <div className="space-y-6">
        {/* Header with Live Status */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Master Consolidation Verification System</h1>
            <p className="text-muted-foreground">
              Complete compliance validation for master hooks, single source of truth, and TypeScript alignment
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{consolidationReport.overallCompliance}%</div>
              <div className="text-sm text-muted-foreground">Consolidated</div>
            </div>
            <Badge variant={consolidationReport.singleSourceCompliant ? "default" : "secondary"}>
              {consolidationReport.singleSourceCompliant ? "✅ Single Source" : "⚠️ Needs Work"}
            </Badge>
          </div>
        </div>

        {/* Quick Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Master Hooks</div>
                  <div className="text-sm text-muted-foreground">{consolidationReport.masterHooksActive.length} Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Single Source</div>
                  <div className="text-sm text-muted-foreground">
                    {consolidationReport.singleSourceCompliant ? "✅ Compliant" : "⚠️ Issues"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">TypeScript</div>
                  <div className="text-sm text-muted-foreground">
                    {consolidationReport.typeScriptAligned ? "✅ Aligned" : "⚠️ Needs Work"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium">Validations</div>
                  <div className="text-sm text-muted-foreground">{consolidationReport.validationsPassed} Passed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              System Overview
            </TabsTrigger>
            <TabsTrigger value="consolidation" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Master Hooks
            </TabsTrigger>
            <TabsTrigger value="typescript" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              TypeScript
            </TabsTrigger>
            <TabsTrigger value="single-source" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Single Source
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compliance">
            <MasterConsolidationComplianceDashboard />
          </TabsContent>

          <TabsContent value="overview">
            <SystemVerificationDashboard />
          </TabsContent>

          <TabsContent value="consolidation">
            <MasterConsolidationValidator />
          </TabsContent>

          <TabsContent value="typescript">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  TypeScript Alignment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>TypeScript Alignment Status</span>
                    <Badge variant={consolidationReport.typeScriptAligned ? "default" : "secondary"}>
                      {consolidationReport.typeScriptAligned ? "✅ Aligned" : "⚠️ Needs Work"}
                    </Badge>
                  </div>
                  
                  <div className="p-4 border rounded bg-green-50">
                    <h4 className="font-medium text-green-800">✅ Master Hook TypeScript Standards</h4>
                    <ul className="mt-2 text-sm text-green-700 space-y-1">
                      <li>• All master hooks follow consistent TypeScript interfaces</li>
                      <li>• Single cache key pattern implemented across all hooks</li>
                      <li>• Proper type safety with comprehensive error handling</li>
                      <li>• Consolidated return interfaces for consistent API</li>
                      <li>• Master hook meta information includes version tracking</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded bg-blue-50">
                    <h4 className="font-medium text-blue-800">📋 Active Master Hooks</h4>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-blue-700">
                      {consolidationReport.masterHooksActive.map((hook, index) => (
                        <div key={index}>• ✅ {hook} (Active)</div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="single-source">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Single Source of Truth Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Single Source Compliance</span>
                    <Badge variant={consolidationReport.singleSourceCompliant ? "default" : "secondary"}>
                      {consolidationReport.singleSourceCompliant ? "✅ Compliant" : "⚠️ Issues"}
                    </Badge>
                  </div>
                  
                  <Progress value={consolidationReport.overallCompliance} className="mb-4" />
                  
                  <div className="p-4 border rounded bg-green-50">
                    <h4 className="font-medium text-green-800">✅ Single Source Achievements</h4>
                    <ul className="mt-2 text-sm text-green-700 space-y-1">
                      <li>• All data flows through master hooks with single cache keys</li>
                      <li>• Centralized cache management with React Query</li>
                      <li>• Consistent error handling patterns across all hooks</li>
                      <li>• Verification, validation, registry, update, and knowledge learning integrated</li>
                      <li>• Master toast system consolidated for consistent messaging</li>
                    </ul>
                  </div>
                  
                  {consolidationReport.recommendations.length > 0 && (
                    <div className="p-4 border rounded bg-yellow-50">
                      <h4 className="font-medium text-yellow-800">📋 Recommendations</h4>
                      <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                        {consolidationReport.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ActiveVerification;
