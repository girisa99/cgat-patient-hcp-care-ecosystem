
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Code, Database } from 'lucide-react';
import { useMasterConsolidationValidator } from '@/hooks/useMasterConsolidationValidator';

export const MasterConsolidationStatus: React.FC = () => {
  const consolidationValidator = useMasterConsolidationValidator();
  
  // Use correct method names from the validator
  const report = consolidationValidator.validateConsolidation();
  const plan = consolidationValidator.createConsolidationPlan();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            Master Consolidation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {report.overallCompliance}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Compliance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {report.consolidatedHooks}
              </div>
              <div className="text-sm text-muted-foreground">Consolidated Hooks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {report.validationsPassed}
              </div>
              <div className="text-sm text-muted-foreground">Validations Passed</div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Master Hook Compliance</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Compliance Score:</span>
                <Badge variant={report.masterHookCompliance.isCompliant ? "default" : "secondary"}>
                  {report.masterHookCompliance.score}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={report.singleSourceCompliant ? "default" : "destructive"}>
                  {report.singleSourceCompliant ? 'Compliant' : 'Issues Found'}
                </Badge>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="font-medium mb-2">Activated Hooks:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {report.masterHooksActive.map((hook, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{hook}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Consolidation Plan</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Current Status:</span>
                <Badge variant="default">{plan.currentStatus}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Priority:</span>
                <Badge variant={plan.priority === 'high' ? 'destructive' : 'secondary'}>
                  {plan.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Architecture Type:</span>
                <span className="text-sm text-muted-foreground">{plan.architectureType}</span>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="font-medium mb-2">Next Steps:</h5>
              <ul className="space-y-1">
                {plan.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
