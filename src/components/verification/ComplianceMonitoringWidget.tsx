import React from 'react';
import { useComplianceMonitoring } from '@/hooks/api/useComplianceMonitoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';

export const ComplianceMonitoringWidget: React.FC = () => {
  const { data: compliance, isLoading } = useComplianceMonitoring();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-8 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    if (!compliance || compliance.length === 0) return <Clock className="h-4 w-4" />;
    
    const latest = compliance[0];
    if (latest.compliance_score >= 90) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (latest.compliance_score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = () => {
    if (!compliance || compliance.length === 0) return 'secondary';
    
    const latest = compliance[0];
    if (latest.compliance_score >= 90) return 'default';
    if (latest.compliance_score >= 70) return 'secondary';
    return 'destructive';
  };

  const currentScore = compliance?.[0]?.compliance_score ?? 0;
  const totalViolations = compliance?.[0]?.total_violations ?? 0;

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
          Last updated: {compliance?.[0]?.generated_at ? 
            new Date(compliance[0].generated_at).toLocaleDateString() : 'Never'}
        </p>
      </CardContent>
    </Card>
  );
};