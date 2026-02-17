/**
 * DUPLICATE ANALYSIS REPORT COMPONENT
 * Displays comprehensive analysis of duplicates in presentation and agents
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Code2, 
  Zap,
  BarChart3,
  ClipboardList
} from 'lucide-react';
import { generateComprehensiveDuplicateReport } from '@/utils/analysis/duplicate-analysis-report';

export const DuplicateAnalysisReport: React.FC = () => {
  const report = generateComprehensiveDuplicateReport();

  const getSeverityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityText = (score: number) => {
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Critical';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Duplicate Analysis Report</h1>
          <p className="text-muted-foreground">Comprehensive analysis of presentation and agent components</p>
        </div>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Overall Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getSeverityColor(report.overallHealth.severityScore)} text-white font-bold text-lg`}>
                {report.overallHealth.severityScore}%
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold">{getSeverityText(report.overallHealth.severityScore)}</p>
              <p className="text-sm text-muted-foreground">
                {report.overallHealth.criticalIssues.length} critical issues found
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            Critical Issues ({report.overallHealth.criticalIssues.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.overallHealth.criticalIssues.map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <p className="text-sm">{issue}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Quick Wins ({report.overallHealth.quickWins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.overallHealth.quickWins.map((win, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <p className="text-sm">{win}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Presentation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Presentation Components Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Components Found:</h4>
            <div className="space-y-2">
              {report.presentationAnalysis.components.map((component, index) => (
                <Badge key={index} variant="outline" className="block w-fit">
                  {component}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-red-600">Duplicate Files:</h4>
            <div className="space-y-2">
              {report.presentationAnalysis.duplicateFiles.map((duplicate, index) => (
                <div key={index} className="p-2 bg-red-50 rounded border-l-4 border-red-500">
                  <p className="text-sm">{duplicate}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Recommendations:</h4>
            <ul className="space-y-1 text-sm">
              {report.presentationAnalysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Agent Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Agent Components Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Components Found:</h4>
            <div className="space-y-2">
              {report.agentAnalysis.components.map((component, index) => (
                <Badge key={index} variant="outline" className="block w-fit">
                  {component}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Hooks:</h4>
            <div className="space-y-2">
              {report.agentAnalysis.hooks.map((hook, index) => (
                <Badge 
                  key={index} 
                  variant={hook.includes('MISSING') ? 'destructive' : 'secondary'}
                  className="block w-fit"
                >
                  {hook}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-yellow-600">Issues Found:</h4>
            <div className="space-y-2">
              {report.agentAnalysis.duplicatePatterns.map((pattern, index) => (
                <div key={index} className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-500">
                  <p className="text-sm">{pattern}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Recommendations:</h4>
            <ul className="space-y-1 text-sm">
              {report.agentAnalysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Hook Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Hook Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{report.hookAnalysis.totalHooks}</p>
              <p className="text-sm text-blue-700">Total Hooks</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{report.hookAnalysis.duplicateHooks.length}</p>
              <p className="text-sm text-red-700">Duplicate/Issues</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{report.hookAnalysis.performanceIssues.length}</p>
              <p className="text-sm text-yellow-700">Performance Issues</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Performance Issues:</h4>
            <div className="space-y-2">
              {report.hookAnalysis.performanceIssues.map((issue, index) => (
                <div key={index} className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-500">
                  <p className="text-sm">{issue}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={() => {
            console.log('📊 Detailed Analysis:', report);
            navigator.clipboard.writeText(JSON.stringify(report, null, 2));
          }}
          variant="outline"
        >
          Copy Report to Clipboard
        </Button>
        <Button 
          onClick={() => window.print()}
          variant="outline"
        >
          Print Report
        </Button>
      </div>
    </div>
  );
};