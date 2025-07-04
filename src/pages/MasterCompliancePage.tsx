
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { ComplianceAlignedUserTable } from '@/components/users/ComplianceAlignedUserTable';
import { useMasterComplianceValidator } from '@/hooks/useMasterComplianceValidator';

export const MasterCompliancePage: React.FC = () => {
  const complianceValidator = useMasterComplianceValidator();
  const [report, setReport] = useState(complianceValidator.validateCompliance());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshCompliance = async () => {
    setIsRefreshing(true);
    try {
      await complianceValidator.ensureFullCompliance();
      const newReport = complianceValidator.runComplianceValidation();
      setReport(newReport);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial compliance check
    const initialReport = complianceValidator.runComplianceValidation();
    setReport(initialReport);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'needs_improvement':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'needs_improvement':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Compliance Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Single source of truth for master consolidation, TypeScript alignment, and system validation
          </p>
        </div>
        <Button 
          onClick={refreshCompliance} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Compliance
        </Button>
      </div>

      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(report.complianceStatus)}
            Overall Compliance: {report.overallCompliance}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge className={getStatusColor(report.complianceStatus)}>
              {report.complianceStatus.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-600">
              {report.validationResults.passedValidations} of {report.validationResults.totalValidations} validations passed
            </span>
          </div>
          
          {/* System Health Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {Object.entries(report.systemHealth).map(([system, score]) => (
              <div key={system} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{score}%</div>
                <div className="text-xs text-gray-600 capitalize">
                  {system.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {report.validationResults.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1">
                {report.validationResults.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600">{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Critical Issues */}
          {report.validationResults.criticalIssues.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-semibold text-red-800">Critical Issues:</h4>
              <ul className="list-disc list-inside space-y-1">
                {report.validationResults.criticalIssues.map((issue, index) => (
                  <li key={index} className="text-sm text-red-600">{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management Table - Compliance Aligned */}
      <ComplianceAlignedUserTable />

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Architecture Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Master Consolidation Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Single source of truth implementation</li>
                <li>Master hook consolidation pattern</li>
                <li>TypeScript alignment validation</li>
                <li>Automated verification systems</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Validation Systems:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Registry system monitoring</li>
                <li>Knowledge learning integration</li>
                <li>Real-time compliance checking</li>
                <li>Automated issue detection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
