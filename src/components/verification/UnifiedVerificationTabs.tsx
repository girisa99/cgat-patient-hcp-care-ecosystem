import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Database,
  Code, 
  Shield, 
  FileText,
  Layers,
  GitBranch,
  Target,
  Zap
} from 'lucide-react';
import { AdminModuleVerificationResult } from '@/utils/verification/AdminModuleVerificationRunner';
import { DatabaseSchemaAnalyzer, DatabaseSchemaAnalysis } from '@/utils/verification/DatabaseSchemaAnalyzer';

interface UnifiedVerificationTabsProps {
  verificationResult: AdminModuleVerificationResult;
}

const UnifiedVerificationTabs: React.FC<UnifiedVerificationTabsProps> = ({
  verificationResult
}) => {
  const [schemaAnalysis, setSchemaAnalysis] = useState<DatabaseSchemaAnalysis | null>(null);
  const [isAnalyzingSchema, setIsAnalyzingSchema] = useState(false);

  useEffect(() => {
    loadSchemaAnalysis();
  }, []);

  const loadSchemaAnalysis = async () => {
    setIsAnalyzingSchema(true);
    try {
      const analysis = await DatabaseSchemaAnalyzer.analyzeCompleteSchema();
      setSchemaAnalysis(analysis);
    } catch (error) {
      console.error('Failed to load schema analysis:', error);
    } finally {
      setIsAnalyzingSchema(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'error':
        return 'destructive';
      case 'medium':
      case 'warning':
        return 'default';
      case 'low':
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
      case 'warning':
        return <Info className="h-4 w-4" />;
      case 'low':
      case 'info':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Overall System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            System Health Overview
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of code quality, security, and database integrity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mock Data Prevention</span>
                <span className="text-sm text-muted-foreground">
                  {verificationResult.mockDataAnalysis?.databaseUsageScore || 0}/100
                </span>
              </div>
              <Progress value={verificationResult.mockDataAnalysis?.databaseUsageScore || 0} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type Safety</span>
                <span className="text-sm text-muted-foreground">
                  {verificationResult.typeScriptAnalysis?.typeSafetyScore || 0}/100
                </span>
              </div>
              <Progress value={verificationResult.typeScriptAnalysis?.typeSafetyScore || 0} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Schema Quality</span>
                <span className="text-sm text-muted-foreground">
                  {schemaAnalysis?.schemaQualityScore || 0}/100
                </span>
              </div>
              <Progress value={schemaAnalysis?.schemaQualityScore || 0} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Component Registry</span>
                <span className="text-sm text-muted-foreground">
                  {verificationResult.componentInventory?.totalComponents || 0} components
                </span>
              </div>
              <Progress value={Math.min((verificationResult.componentInventory?.totalComponents || 0) * 10, 100)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="database-schema" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="database-schema" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Schema
          </TabsTrigger>
          <TabsTrigger value="mock-data" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Mock Data
          </TabsTrigger>
          <TabsTrigger value="typescript" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            TypeScript
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Components
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Actions
          </TabsTrigger>
        </TabsList>

        {/* Database Schema Analysis */}
        <TabsContent value="database-schema" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Schema Analysis
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of database structure, relationships, and integrity
                </CardDescription>
              </div>
              <Button 
                onClick={loadSchemaAnalysis} 
                disabled={isAnalyzingSchema}
                variant="outline"
                size="sm"
              >
                {isAnalyzingSchema ? 'Analyzing...' : 'Refresh Analysis'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {schemaAnalysis ? (
                <>
                  {/* Schema Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{schemaAnalysis.tables.length}</div>
                      <div className="text-sm text-muted-foreground">Tables</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{schemaAnalysis.foreignKeys.length}</div>
                      <div className="text-sm text-muted-foreground">Foreign Keys</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{schemaAnalysis.constraints.length}</div>
                      <div className="text-sm text-muted-foreground">Constraints</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{schemaAnalysis.indexes.length}</div>
                      <div className="text-sm text-muted-foreground">Indexes</div>
                    </div>
                  </div>

                  {/* Duplicate Risks */}
                  {schemaAnalysis.duplicateRisks.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Schema Duplicate Risks ({schemaAnalysis.duplicateRisks.length})
                      </h4>
                      <div className="space-y-2">
                        {schemaAnalysis.duplicateRisks.map((risk, index) => (
                          <Alert key={index} className="border-l-4 border-l-yellow-500">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {getSeverityIcon(risk.severity)}
                                  <span className="font-medium">{risk.description}</span>
                                  <Badge variant={getSeverityColor(risk.severity) as any}>
                                    {risk.severity}
                                  </Badge>
                                </div>
                                <AlertDescription>
                                  <strong>Recommendation:</strong> {risk.recommendation}
                                </AlertDescription>
                                <div className="text-sm text-muted-foreground">
                                  <strong>Affected:</strong> {risk.affectedObjects.join(', ')}
                                </div>
                              </div>
                            </div>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schema Quality Recommendations */}
                  {schemaAnalysis.recommendations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">Schema Recommendations</h4>
                      <div className="space-y-2">
                        {schemaAnalysis.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                            <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tables Overview */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Tables Overview</h4>
                    <div className="grid gap-4">
                      {schemaAnalysis.tables.map((table, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{table.tableName}</h5>
                            <div className="flex items-center gap-2">
                              {table.hasRLS && (
                                <Badge variant="default" className="text-xs">RLS</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {table.columns.length} columns
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {table.rowCount} rows
                              </Badge>
                            </div>
                          </div>
                          {table.relationships.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              <strong>Relationships:</strong> {table.relationships.join(', ')}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isAnalyzingSchema ? 'Analyzing database schema...' : 'Click "Refresh Analysis" to analyze database schema'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mock Data Prevention */}
        <TabsContent value="mock-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Mock Data Prevention Analysis
              </CardTitle>
              <CardDescription>
                Ensuring production code uses real database data instead of mock/dummy data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationResult.mockDataAnalysis ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="font-medium">Database Usage Score</span>
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {verificationResult.mockDataAnalysis.databaseUsageScore}/100
                    </Badge>
                  </div>
                  
                  {verificationResult.mockDataAnalysis.violations.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg text-red-600">
                        Mock Data Violations ({verificationResult.mockDataAnalysis.violations.length})
                      </h4>
                      <div className="space-y-2">
                        {verificationResult.mockDataAnalysis.violations.map((violation, index) => (
                          <Alert key={index} className="border-l-4 border-l-red-500">
                            <AlertTriangle className="h-4 w-4" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{violation.filePath}:{violation.lineNumber}</span>
                                <Badge variant={getSeverityColor(violation.severity) as any}>
                                  {violation.severity}
                                </Badge>
                              </div>
                              <AlertDescription>
                                <div className="text-sm">{violation.content}</div>
                                <div className="text-sm text-blue-600 mt-1">
                                  <strong>Fix:</strong> {violation.suggestion}
                                </div>
                              </AlertDescription>
                            </div>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Alert className="border-l-4 border-l-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        ✅ No mock data violations found! All code is using real database data.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Mock data analysis not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TypeScript Analysis */}
        <TabsContent value="typescript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                TypeScript Quality Analysis
              </CardTitle>
              <CardDescription>
                Code quality, type safety, and pattern consistency analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationResult.typeScriptAnalysis ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {verificationResult.typeScriptAnalysis.typeSafetyScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Type Safety Score</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {verificationResult.typeScriptAnalysis.patternConsistencyScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Pattern Consistency</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {verificationResult.typeScriptAnalysis.patterns.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Patterns Found</div>
                    </div>
                  </div>

                  {verificationResult.typeScriptAnalysis.qualityIssues.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">Quality Issues</h4>
                      <div className="space-y-2">
                        {verificationResult.typeScriptAnalysis.qualityIssues.slice(0, 10).map((issue, index) => (
                          <Alert key={index}>
                            {getSeverityIcon(issue.severity)}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{issue.filePath}:{issue.lineNumber}</span>
                                <Badge variant={getSeverityColor(issue.severity) as any}>
                                  {issue.severity}
                                </Badge>
                                <Badge variant="outline">{issue.category}</Badge>
                              </div>
                              <AlertDescription>
                                <div className="text-sm">{issue.issue}</div>
                                <div className="text-sm text-blue-600 mt-1">
                                  <strong>Suggestion:</strong> {issue.suggestion}
                                </div>
                              </AlertDescription>
                            </div>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">TypeScript analysis not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Component Registry */}
        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Component Registry Analysis
              </CardTitle>
              <CardDescription>
                Inventory of all components, hooks, and templates in the codebase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationResult.componentInventory ? (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {verificationResult.componentInventory.components.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Components</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {verificationResult.componentInventory.hooks.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Hooks</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {verificationResult.componentInventory.templates.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Templates</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Recent Components</h4>
                    <div className="space-y-2">
                      {verificationResult.componentInventory.components.slice(0, 5).map((component, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{component.name}</span>
                            <div className="text-sm text-muted-foreground">
                              {component.filePath}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{component.type}</Badge>
                            {component.isReusable && (
                              <Badge variant="default">Reusable</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Component analysis not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Analysis */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Services & Classes Analysis
              </CardTitle>
              <CardDescription>
                Analysis of services, classes, methods, and utilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationResult.serviceClassInventory ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {verificationResult.serviceClassInventory.services.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Services</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {verificationResult.serviceClassInventory.classes.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Classes</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {verificationResult.serviceClassInventory.methods.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Methods</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {verificationResult.serviceClassInventory.utilities.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Utilities</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Services Overview</h4>
                    <div className="space-y-2">
                      {verificationResult.serviceClassInventory.services.slice(0, 5).map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{service.name}</span>
                            <div className="text-sm text-muted-foreground">
                              {service.methods.length} methods • {service.filePath}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={service.complexity === 'high' ? 'destructive' : service.complexity === 'medium' ? 'default' : 'secondary'}>
                              {service.complexity}
                            </Badge>
                            {service.isReusable && (
                              <Badge variant="default">Reusable</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Service analysis not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Actionable Recommendations
              </CardTitle>
              <CardDescription>
                Priority actions to improve code quality and prevent duplicates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-red-600">High Priority Actions</h4>
                <div className="space-y-2">
                  {verificationResult.mockDataAnalysis?.violations.filter(v => v.severity === 'high').slice(0, 3).map((violation, index) => (
                    <Alert key={index} className="border-l-4 border-l-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Mock Data:</strong> {violation.suggestion}
                      </AlertDescription>
                    </Alert>
                  ))}
                  
                  {schemaAnalysis?.duplicateRisks.filter(r => r.severity === 'high').slice(0, 2).map((risk, index) => (
                    <Alert key={index} className="border-l-4 border-l-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Schema:</strong> {risk.recommendation}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-blue-600">Improvement Opportunities</h4>
                <div className="space-y-2">
                  {schemaAnalysis?.recommendations.slice(0, 5).map((rec, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedVerificationTabs;
