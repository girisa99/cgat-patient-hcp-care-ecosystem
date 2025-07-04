
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useMasterConsolidationValidator } from '@/hooks/useMasterConsolidationValidator';

export const MasterConsolidationComplianceDashboard: React.FC = () => {
  const consolidationValidator = useMasterConsolidationValidator();
  
  const report = consolidationValidator.validateConsolidation();
  const plan = consolidationValidator.createConsolidationPlan();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Master Consolidation Compliance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {report.score}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
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
            <h4 className="font-medium mb-3">Registry Entries</h4>
            <div className="space-y-2">
              {report.registryEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{entry.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{entry.type}</Badge>
                    <Badge variant="default">{entry.status}</Badge>
                  </div>
                </div>
              ))}
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
                <span>Timeline:</span>
                <span className="text-sm text-muted-foreground">{plan.timeline}</span>
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
