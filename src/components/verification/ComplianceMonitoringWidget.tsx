import React from 'react';
import { useComplianceMonitoring } from '@/hooks/useComplianceMonitoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';

export const ComplianceMonitoringWidget: React.FC = () => {
  const { 
    complianceScore, 
    violations, 
    isMonitoring,
    promptStats 
  } = useComplianceMonitoring();

  const getStatusIcon = () => {
    if (complianceScore >= 90) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (complianceScore >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = () => {
    if (complianceScore >= 90) return 'default';
    if (complianceScore >= 70) return 'secondary';
    return 'destructive';
  };

  const currentScore = complianceScore;
  const totalViolations = violations.length;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
        {getStatusIcon()}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">{currentScore}%</div>
          <Badge variant={getStatusColor()}>
            {totalViolations === 0 ? 'Compliant' : `${totalViolations} Issues`}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Monitoring: {isMonitoring ? 'Active' : 'Inactive'} • {promptStats.totalPrompts} prompts analyzed
        </p>
      </CardContent>
    </Card>
  );
};