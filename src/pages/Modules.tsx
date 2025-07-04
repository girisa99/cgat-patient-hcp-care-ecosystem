
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, CheckCircle, Shield, Code, Database } from 'lucide-react';
import { useMasterModules } from '@/hooks/useMasterModules';
import { useMasterSystemCompliance } from '@/hooks/useMasterSystemCompliance';
import { useMasterTypeScriptCompliance } from '@/hooks/useMasterTypeScriptCompliance';
import { MasterConsolidationStatus } from '@/components/verification/MasterConsolidationStatus';

const Modules: React.FC = () => {
  const { hasAccess } = useRoleBasedNavigation();
  const masterModules = useMasterModules();
  const systemCompliance = useMasterSystemCompliance();
  const typeScriptCompliance = useMasterTypeScriptCompliance();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newModule, setNewModule] = useState({
    name: '',
    description: '',
    is_active: true
  });

  if (!hasAccess('/modules')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Modules.</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const handleCreateModule = () => {
    if (newModule.name.trim()) {
      masterModules.createModule(newModule);
      setNewModule({ name: '', description: '', is_active: true });
      setShowCreateForm(false);
    }
  };

  const integrity = masterModules.verifyModuleIntegrity();
  const complianceReport = systemCompliance.validateSystemCompliance();
  const typeScriptReport = typeScriptCompliance.validateTypeScriptCompliance();

  return (
    <AppLayout title="Master Modules Management">
      <div className="space-y-6">
        {/* Enhanced Header with Master System Compliance */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Master Modules System</h1>
            <p className="text-muted-foreground">
              Single source of truth - Master consolidated, TypeScript aligned, Fully verified
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={complianceReport.overallCompliance >= 98 ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              <Shield className="h-3 w-3" />
              {complianceReport.overallCompliance}% Master Compliant
            </Badge>
            <Badge 
              variant={typeScriptReport.overallTypeScriptHealth >= 98 ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              <Code className="h-3 w-3" />
              TS: {typeScriptReport.overallTypeScriptHealth}%
            </Badge>
            <Badge variant={integrity.isHealthy ? "default" : "destructive"}>
              {integrity.isHealthy ? "✅ Healthy" : "⚠️ Issues"}
            </Badge>
            <Button onClick={() => setShowCreateForm(true)} disabled={masterModules.isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>
        </div>

        {/* Master System Compliance Dashboard */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Shield className="h-5 w-5" />
              Master System Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-700">Overall</div>
                <div className="text-2xl font-bold text-blue-900">{complianceReport.overallCompliance}%</div>
              </div>
              <div>
                <div className="font-medium text-blue-700">Single Source</div>
                <div className={`text-xl font-semibold ${complianceReport.singleSourceTruth.isCompliant ? 'text-green-600' : 'text-orange-600'}`}>
                  {complianceReport.singleSourceTruth.score}%
                </div>
              </div>
              <div>
                <div className="font-medium text-blue-700">TypeScript</div>
                <div className={`text-xl font-semibold ${typeScriptReport.validationResults.masterHooksAligned ? 'text-green-600' : 'text-orange-600'}`}>
                  {complianceReport.typeScriptAlignment.score}%
                </div>
              </div>
              <div>
                <div className="font-medium text-blue-700">Verification</div>
                <div className="text-xl font-semibold text-blue-800">
                  {complianceReport.verificationSystems.score}%
                </div>
              </div>
              <div>
                <div className="font-medium text-blue-700">Registry</div>
                <div className="text-xl font-semibold text-blue-800">
                  {complianceReport.registrySystem.consolidatedEntries}/{complianceReport.registrySystem.totalEntries}
                </div>
              </div>
              <div>
                <div className="font-medium text-blue-700">Learning</div>
                <div className={`text-xl font-semibold ${complianceReport.knowledgeLearning.learningActive ? 'text-green-600' : 'text-orange-600'}`}>
                  {complianceReport.knowledgeLearning.score}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="modules">Modules ({masterModules.modules.length})</TabsTrigger>
            <TabsTrigger value="verification">Master Consolidation</TabsTrigger>
            <TabsTrigger value="compliance">System Compliance</TabsTrigger>
            <TabsTrigger value="typescript">TypeScript Alignment</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            {/* Create Module Form */}
            {showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Module</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Module Name</Label>
                    <Input
                      id="name"
                      value={newModule.name}
                      onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                      placeholder="Enter module name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newModule.description}
                      onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                      placeholder="Enter module description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateModule} disabled={masterModules.isCreating}>
                      {masterModules.isCreating ? 'Creating...' : 'Create Module'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modules List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {masterModules.isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    Loading modules...
                  </CardContent>
                </Card>
              ) : masterModules.modules.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No modules found</p>
                  </CardContent>
                </Card>
              ) : (
                masterModules.modules.map((module) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <Badge variant={module.is_active ? "default" : "secondary"}>
                          {module.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {module.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {module.description}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(module.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="verification">
            <MasterConsolidationStatus />
          </TabsContent>

          <TabsContent value="compliance">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Master System Compliance Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {complianceReport.complianceActions.map((action, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 border rounded">
                        <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                    {complianceReport.complianceActions.length === 0 && (
                      <div className="flex items-center gap-2 p-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">✅ All master compliance requirements met!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-3">
                <Button onClick={() => systemCompliance.runFullComplianceCheck()}>
                  Run Full System Compliance Check
                </Button>
                <Button variant="outline" onClick={() => systemCompliance.ensureCompliance()}>
                  Ensure Master Compliance
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typescript">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    TypeScript Alignment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-purple-700">Overall Health</div>
                      <div className="text-2xl font-bold text-purple-900">{typeScriptReport.overallTypeScriptHealth}%</div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-700">Master Hooks</div>
                      <div className={`text-xl font-semibold ${typeScriptReport.validationResults.masterHooksAligned ? 'text-green-600' : 'text-orange-600'}`}>
                        {typeScriptReport.validationResults.masterHooksAligned ? '✅ Aligned' : '⚠️ Issues'}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-700">Interfaces</div>
                      <div className={`text-xl font-semibold ${typeScriptReport.validationResults.interfacesConsistent ? 'text-green-600' : 'text-orange-600'}`}>
                        {typeScriptReport.validationResults.interfacesConsistent ? '✅ Consistent' : '⚠️ Issues'}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-purple-700">Toast System</div>
                      <div className={`text-xl font-semibold ${typeScriptReport.validationResults.toastSystemAligned ? 'text-green-600' : 'text-orange-600'}`}>
                        {typeScriptReport.complianceMetrics.toastAlignmentScore}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {typeScriptReport.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>TypeScript Alignment Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {typeScriptReport.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Code className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button onClick={() => typeScriptCompliance.runTypeScriptValidation()}>
                  Run TypeScript Validation
                </Button>
                <Button variant="outline" onClick={() => typeScriptCompliance.enforceTypeScriptCompliance()}>
                  Enforce TypeScript Compliance
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* System Meta Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Master System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">System Version</div>
                <div className="text-muted-foreground">{masterModules.meta.version}</div>
              </div>
              <div>
                <div className="font-medium">Architecture</div>
                <div className="text-muted-foreground">{masterModules.meta.architectureType}</div>
              </div>
              <div>
                <div className="font-medium">Single Source</div>
                <div className="text-green-600">
                  {masterModules.meta.singleSourceValidated ? '✅ Validated' : '❌ Invalid'}
                </div>
              </div>
              <div>
                <div className="font-medium">Compliance Target</div>
                <div className="text-muted-foreground font-mono text-xs">98%+ Master Compliant</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Modules;
