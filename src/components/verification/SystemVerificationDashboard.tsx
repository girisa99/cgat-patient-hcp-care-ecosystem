
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Database, Code } from 'lucide-react';
import { useMasterConsolidationValidator } from '@/hooks/useMasterConsolidationValidator';

export const SystemVerificationDashboard: React.FC = () => {
  const consolidationValidator = useMasterConsolidationValidator();
  
  const report = consolidationValidator.validateConsolidation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            System Verification Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {report.overallCompliance}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Compliance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {report.masterHookCompliance.score}%
              </div>
              <div className="text-sm text-muted-foreground">Hook Compliance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {report.masterHookCompliance.activatedHooks.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Hooks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {report.validationsPassed}
              </div>
              <div className="text-sm text-muted-foreground">Validations</div>
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
                <Badge variant={report.masterHookCompliance.isCompliant ? "default" : "destructive"}>
                  {report.masterHookCompliance.isCompliant ? 'Compliant' : 'Issues Found'}
                </Badge>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="font-medium mb-2">Activated Hooks:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {report.masterHookCompliance.activatedHooks.map((hook, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{hook}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">System Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-blue-600" />
                <span>TypeScript Aligned:</span>
                <Badge variant={report.typeScriptAligned ? "default" : "secondary"}>
                  {report.typeScriptAligned ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-600" />
                <span>Single Source Compliant:</span>
                <Badge variant={report.singleSourceCompliant ? "default" : "secondary"}>
                  {report.singleSourceCompliant ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
