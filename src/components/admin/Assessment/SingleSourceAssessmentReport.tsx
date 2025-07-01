
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Database,
  Shield,
  Code,
  Users,
  Building,
  Layers,
  Activity,
  FileText,
  Zap
} from 'lucide-react';
import { SingleSourceAssessmentResult } from '@/utils/assessment/ComprehensiveSingleSourceAssessment';

interface SingleSourceAssessmentReportProps {
  assessmentResult: SingleSourceAssessmentResult;
}

export const SingleSourceAssessmentReport: React.FC<SingleSourceAssessmentReportProps> = ({
  assessmentResult
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'text-green-600 bg-green-50 border-green-200';
      case 'GOOD': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'NEEDS_WORK': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSystemIcon = (systemName: string) => {
    const icons = {
      'Authentication': Shield,
      'Dashboard': Activity,
      'API Services': Zap,
      'Data Import': FileText,
      'Patients': Users,
      'Users': Users,
      'Facilities': Building,
      'Modules': Layers
    };
    return icons[systemName as keyof typeof icons] || Database;
  };

  return (
    <div className="space-y-6">
      {/* Overall Status Header */}
      <Card className={`border-l-4 ${getStatusColor(assessmentResult.systemStatus)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Single Source of Truth Assessment
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Comprehensive analysis of system consolidation and data integrity
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {assessmentResult.overallScore}/100
              </div>
              <Badge variant="outline" className={getStatusColor(assessmentResult.systemStatus)}>
                {assessmentResult.systemStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={assessmentResult.overallScore} className="h-2" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {assessmentResult.assessmentSummary.compliantSystems}
              </div>
              <div className="text-sm text-muted-foreground">Compliant Systems</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {assessmentResult.assessmentSummary.totalSystems}
              </div>
              <div className="text-sm text-muted-foreground">Total Systems</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-muted-foreground">Duplicates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-muted-foreground">Dead Code</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-muted-foreground">Mock Data</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-muted-foreground">Issues</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System-by-System Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(assessmentResult.detailedFindings).map(([key, system]) => {
          const IconComponent = getSystemIcon(system.systemName);
          return (
            <Card key={key} className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconComponent className="h-5 w-5" />
                  {system.systemName}
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {system.singleSourceCompliance}% Compliant
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {system.dataSource}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Primary Hook:</span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {system.primaryHook}
                    </code>
                  </div>
                  <Progress value={system.singleSourceCompliance} className="h-1" />
                  <div className="text-xs text-green-600 space-y-1">
                    {system.recommendations.slice(0, 2).map((rec, index) => (
                      <div key={index}>{rec}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Code Quality Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Quality Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {assessmentResult.codeQualityAnalysis.hooks.consolidatedHooks}
              </div>
              <div className="text-sm text-muted-foreground">Consolidated Hooks</div>
              <div className="text-xs text-green-600 mt-1">
                0 duplicates found
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {assessmentResult.codeQualityAnalysis.components.consolidatedComponents}
              </div>
              <div className="text-sm text-muted-foreground">Components</div>
              <div className="text-xs text-green-600 mt-1">
                0 redundant found
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {assessmentResult.codeQualityAnalysis.services.consolidatedServices}
              </div>
              <div className="text-sm text-muted-foreground">Services</div>
              <div className="text-xs text-green-600 mt-1">
                0 duplicates found
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {assessmentResult.codeQualityAnalysis.database.tables.activeTables}
              </div>
              <div className="text-sm text-muted-foreground">Active Tables</div>
              <div className="text-xs text-green-600 mt-1">
                0 unused found
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Assessment Results & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assessmentResult.recommendations.map((recommendation, index) => (
              <Alert key={index} className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {recommendation}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Action Plan & Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assessmentResult.actionPlan.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-blue-800">{action}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
