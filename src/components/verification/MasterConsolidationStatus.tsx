
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  Database,
  Code2,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useMasterConsolidationValidator } from '@/hooks/useMasterConsolidationValidator';

export const MasterConsolidationStatus: React.FC = () => {
  const validator = useMasterConsolidationValidator();
  
  const report = validator.validateMasterConsolidation();
  const plan = validator.generateConsolidationPlan();

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBadge = (compliant: boolean) => {
    return compliant ? 'default' : 'destructive';
  };

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card className="border-2 border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            Master Consolidation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className={`text-4xl font-bold ${getComplianceColor(report.overallCompliance)}`}>
              {report.overallCompliance}%
            </div>
            <div className="text-sm text-muted-foreground">Overall Compliance</div>
          </div>
          <Progress value={report.overallCompliance} className="mb-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Single Source:</span>
              <Badge variant={getComplianceBadge(report.singleSourceCompliant)}>
                {report.singleSourceCompliant ? 'Compliant' : 'Issues'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>TypeScript:</span>
              <Badge variant={getComplianceBadge(report.typeScriptAligned)}>
                {report.typeScriptAligned ? 'Aligned' : 'Needs Work'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Master Hooks Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium">Master Hooks</div>
                <div className="text-lg font-bold">{report.masterHooksActive.length}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium">Single Source</div>
                <div className="text-lg font-bold">
                  {report.singleSourceCompliant ? '✅' : '⚠️'}
                </div>
                <div className="text-xs text-muted-foreground">Validation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm font-medium">TypeScript</div>
                <div className="text-lg font-bold">
                  {report.typeScriptAligned ? '✅' : '⚠️'}
                </div>
                <div className="text-xs text-muted-foreground">Alignment</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-sm font-medium">Validations</div>
                <div className="text-lg font-bold">{report.validationsPassed}</div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Master Hooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Active Master Hooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {report.masterHooksActive.map((hook, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">{hook}</span>
                <Badge variant="outline" className="ml-auto">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consolidation Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Consolidation Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Current Status:</span>
              <span className="text-blue-600">{plan.currentStatus}</span>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Next Steps:</h4>
              {plan.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
