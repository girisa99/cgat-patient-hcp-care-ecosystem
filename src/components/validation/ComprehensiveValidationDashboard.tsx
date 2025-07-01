
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Database,
  Code,
  FileText,
  Settings,
  TrendingUp,
  Zap
} from 'lucide-react';
import { ComprehensiveSystemValidator, ComprehensiveValidationResult } from '@/utils/verification/ComprehensiveSystemValidator';
import { useToast } from '@/hooks/use-toast';

export const ComprehensiveValidationDashboard: React.FC = () => {
  const [validationResult, setValidationResult] = useState<ComprehensiveValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidated, setLastValidated] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    handleValidation();
  }, []);

  const handleValidation = async () => {
    setIsValidating(true);
    try {
      console.log('🚀 Starting comprehensive system validation...');
      
      const result = await ComprehensiveSystemValidator.runCompleteValidation();
      setValidationResult(result);
      setLastValidated(new Date().toLocaleString());
      
      toast({
        title: "✅ Comprehensive Validation Complete",
        description: `System Score: ${result.overallScore}/100 • Status: ${result.systemStatus}`,
        variant: result.systemStatus === 'EXCELLENT' || result.systemStatus === 'GOOD' ? "default" : "destructive",
      });
      
      console.log('✅ Comprehensive validation completed:', result);
    } catch (error) {
      console.error('❌ Comprehensive validation failed:', error);
      toast({
        title: "❌ Validation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'text-green-600 bg-green-50 border-green-200';
      case 'GOOD': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'NEEDS_IMPROVEMENT': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'GOOD': return <CheckCircle className="h-6 w-6 text-blue-600" />;
      case 'NEEDS_IMPROVEMENT': return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'CRITICAL': return <XCircle className="h-6 w-6 text-red-600" />;
      default: return <Settings className="h-6 w-6 text-gray-600" />;
    }
  };

  if (isValidating) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4">
            <RefreshCw className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Running Comprehensive Validation</h3>
          <p className="text-muted-foreground">
            Analyzing entire system for duplicates, dead code, mock data, and redundancies...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!validationResult) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Ready to run comprehensive system validation</p>
          <Button onClick={handleValidation}>
            <Zap className="h-4 w-4 mr-2" />
            Start Validation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status Header */}
      <Card className={`border-l-4 ${getStatusColor(validationResult.systemStatus)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(validationResult.systemStatus)}
              <div>
                <CardTitle className="text-xl">Comprehensive System Validation</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Last validated: {lastValidated} • Cleanup time: {validationResult.estimatedCleanupTime}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {validationResult.overallScore}/100
              </div>
              <Badge variant="outline" className={getStatusColor(validationResult.systemStatus)}>
                {validationResult.systemStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={validationResult.overallScore} className="h-2 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {validationResult.singleSourceCompliance.score}
              </div>
              <div className="text-sm text-muted-foreground">Source Compliance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {validationResult.codeQuality.mockData.score}
              </div>
              <div className="text-sm text-muted-foreground">Real Data Usage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {validationResult.codeQuality.namingConsistency.score}
              </div>
              <div className="text-sm text-muted-foreground">Naming Consistency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {validationResult.criticalIssues.length}
              </div>
              <div className="text-sm text-muted-foreground">Critical Issues</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {validationResult.criticalIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{validationResult.criticalIssues.length} Critical Issues Found:</strong>
            <ul className="mt-2 space-y-1">
              {validationResult.criticalIssues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Action Plan & Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validationResult.actionPlan.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-blue-800">{action}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detailed Analysis</CardTitle>
            <Button onClick={handleValidation} disabled={isValidating} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="codeQuality" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="codeQuality">Code Quality</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="typescript">TypeScript</TabsTrigger>
            </TabsList>

            <TabsContent value="codeQuality" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Duplicates Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Components:</span>
                        <Badge variant="outline">{validationResult.codeQuality.duplicates.components.length}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Hooks:</span>
                        <Badge variant="outline">{validationResult.codeQuality.duplicates.hooks.length}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Services:</span>
                        <Badge variant="outline">{validationResult.codeQuality.duplicates.services.length}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Utilities:</span>
                        <Badge variant="outline">{validationResult.codeQuality.duplicates.utilities.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Dead Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Unused Files:</span>
                        <Badge variant="outline">{validationResult.codeQuality.deadCode.unusedFiles.length}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Unused Functions:</span>
                        <Badge variant="outline">{validationResult.codeQuality.deadCode.unusedFunctions.length}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Unused Imports:</span>
                        <Badge variant="outline">{validationResult.codeQuality.deadCode.unusedImports.length}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Unused Components:</span>
                        <Badge variant="outline">{validationResult.codeQuality.deadCode.unusedComponents.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Mock Data Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Real Database Usage Score:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={validationResult.codeQuality.mockData.score} className="w-20 h-2" />
                        <span className="text-sm font-medium">{validationResult.codeQuality.mockData.score}/100</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      • Mock Data Violations: {validationResult.codeQuality.mockData.violations.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      • Clean Files: {validationResult.codeQuality.mockData.cleanFiles.length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Tables
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total:</span>
                        <Badge>{validationResult.database.tables.total}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Unused:</span>
                        <Badge variant="outline">{validationResult.database.tables.unused.length}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Redundant:</span>
                        <Badge variant="outline">{validationResult.database.tables.redundant.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Relationships</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total:</span>
                        <Badge>{validationResult.database.relationships.total}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Broken:</span>
                        <Badge variant="destructive">{validationResult.database.relationships.broken.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Schema Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Inconsistencies:</span>
                        <Badge variant="outline">{validationResult.database.schemas.inconsistencies.length}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Missing Constraints:</span>
                        <Badge variant="outline">{validationResult.database.schemas.missingConstraints.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="modules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Module Registry Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{validationResult.moduleRegistry.totalModules}</div>
                      <div className="text-sm text-muted-foreground">Total Modules</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{validationResult.moduleRegistry.duplicateModules.length}</div>
                      <div className="text-sm text-muted-foreground">Duplicates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{validationResult.moduleRegistry.orphanedComponents.length}</div>
                      <div className="text-sm text-muted-foreground">Orphaned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{validationResult.moduleRegistry.inconsistentNaming.length}</div>
                      <div className="text-sm text-muted-foreground">Naming Issues</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typescript" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    TypeScript Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{validationResult.typescript.duplicateTypes.length}</div>
                      <div className="text-sm text-muted-foreground">Duplicate Types</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{validationResult.typescript.unusedTypes.length}</div>
                      <div className="text-sm text-muted-foreground">Unused Types</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{validationResult.typescript.inconsistentInterfaces.length}</div>
                      <div className="text-sm text-muted-foreground">Inconsistent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{validationResult.typescript.missingTypes.length}</div>
                      <div className="text-sm text-muted-foreground">Missing Types</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Full Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Full System Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-50 p-4 rounded border overflow-auto max-h-96 whitespace-pre-wrap">
            {ComprehensiveSystemValidator.generateComprehensiveReport(validationResult)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
