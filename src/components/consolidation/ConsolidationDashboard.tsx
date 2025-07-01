
/**
 * Consolidation Dashboard - Real-time view of codebase consolidation status
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Code, 
  Database,
  Users,
  Building,
  Package,
  Heart,
  Download,
  Settings
} from 'lucide-react';
import { useConsolidationAnalysis } from '@/hooks/useConsolidationAnalysis';

const ConsolidationDashboard: React.FC = () => {
  const { 
    report, 
    isAnalyzing, 
    error, 
    runAnalysis, 
    getConsolidationStatus, 
    getStatusColor,
    isConsolidated,
    hasViolations,
    hasDuplicates
  } = useConsolidationAnalysis();

  const systemIcons = {
    'Users': Users,
    'Facilities': Building,
    'Modules': Package,
    'Patients': Heart,
    'API Services': Database,
    'Data Import': Download,
    'Dashboard': Settings
  };

  const getStatusIcon = () => {
    const status = getConsolidationStatus();
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'fair': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'needs-work': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Code className="h-5 w-5 text-gray-600" />;
    }
  };

  const getProgressValue = () => {
    if (!report) return 0;
    const total = 7; // Total systems
    const compliant = report.summary.compliantSystems;
    return Math.round((compliant / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Codebase Consolidation Status</h2>
          <p className="text-gray-600">Real-time analysis of single source of truth architecture</p>
        </div>
        <Button 
          onClick={runAnalysis} 
          disabled={isAnalyzing}
          variant="outline"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-analyze
            </>
          )}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">Analysis Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="text-sm text-gray-600">Overall Status</p>
                <p className={`font-medium ${getStatusColor()}`}>
                  {getConsolidationStatus().replace('-', ' ').toUpperCase()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Compliant Systems</p>
                <p className="text-2xl font-bold text-green-600">
                  {report?.summary.compliantSystems || 0}/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Violations</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {report?.summary.totalViolations || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Duplicates</p>
                <p className="text-2xl font-bold text-red-600">
                  {report?.summary.duplicatesFound || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Consolidation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Single Source Compliance</span>
              <span>{getProgressValue()}%</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report?.singleSourceValidation.compliantSystems.map((system) => {
              const IconComponent = systemIcons[system as keyof typeof systemIcons] || Code;
              return (
                <div key={system} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <IconComponent className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{system}</p>
                    <p className="text-sm text-green-700">✅ Consolidated</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle>System Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.singleSourceValidation.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={isConsolidated ? "default" : "secondary"}>
          {isConsolidated ? "✅ Fully Consolidated" : "⚠️ Needs Consolidation"}
        </Badge>
        <Badge variant={hasViolations ? "destructive" : "default"}>
          {hasViolations ? "❌ Has Violations" : "✅ No Violations"}
        </Badge>
        <Badge variant={hasDuplicates ? "destructive" : "default"}>
          {hasDuplicates ? "🔄 Has Duplicates" : "✅ No Duplicates"}
        </Badge>
        <Badge variant="outline">
          Last Updated: {report?.timestamp ? new Date(report.timestamp).toLocaleString() : 'Never'}
        </Badge>
      </div>
    </div>
  );
};

export default ConsolidationDashboard;
