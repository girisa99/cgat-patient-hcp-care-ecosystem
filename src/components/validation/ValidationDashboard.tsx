
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Shield, 
  RefreshCw,
  FileText,
  Database,
  Users
} from 'lucide-react';
import { SingleSourceValidator, ValidationResult } from '@/utils/validation/SingleSourceValidator';

export const ValidationDashboard: React.FC = () => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidated, setLastValidated] = useState<string>('');

  useEffect(() => {
    // Run initial validation
    handleValidation();
  }, []);

  const handleValidation = async () => {
    setIsValidating(true);
    try {
      console.log('🔍 Starting single source validation...');
      const result = await SingleSourceValidator.validateCompleteSystem();
      setValidationResult(result);
      setLastValidated(new Date().toLocaleString());
      console.log('✅ Validation completed:', result);
    } catch (error) {
      console.error('❌ Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 85) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 70) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getComplianceIcon = (score: number) => {
    if (score >= 95) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 85) return <Shield className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'secondary';
    }
  };

  if (!validationResult) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Running single source validation...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Validation Controls */}
      <Card className={`border-2 ${getComplianceColor(validationResult.summary.complianceScore)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getComplianceIcon(validationResult.summary.complianceScore)}
              <div>
                <CardTitle className="text-xl">Single Source of Truth Validation</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Last validated: {lastValidated}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleValidation} 
              disabled={isValidating}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
              {isValidating ? 'Validating...' : 'Re-validate'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {validationResult.summary.complianceScore}
              </div>
              <div className="text-sm text-muted-foreground">Compliance Score</div>
              <Progress 
                value={validationResult.summary.complianceScore} 
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {validationResult.summary.systemsVerified.length}
              </div>
              <div className="text-sm text-muted-foreground">Systems Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {validationResult.summary.dataSourcesValidated.length}
              </div>
              <div className="text-sm text-muted-foreground">Data Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {validationResult.summary.totalViolations}
              </div>
              <div className="text-sm text-muted-foreground">Total Violations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Systems Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Verified Systems
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validationResult.summary.systemsVerified.map((system, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{system}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Data Sources Validated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {validationResult.summary.dataSourcesValidated.map((source, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{source}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Violations */}
      {validationResult.violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Violations Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationResult.violations.map((violation, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{violation.component}</h4>
                    <Badge variant={getSeverityColor(violation.severity)}>
                      {violation.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {violation.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <p><strong>Location:</strong> {violation.location}</p>
                    <p><strong>Fix:</strong> {violation.suggestedFix}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {validationResult.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full Report */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Compliance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-50 p-4 rounded border overflow-auto max-h-96">
            {SingleSourceValidator.generateComplianceReport(validationResult)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
