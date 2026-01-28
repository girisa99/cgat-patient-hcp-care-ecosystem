/**
 * Anomaly Detection Alerts Component
 * P4-ANA-31: Anomaly Detection Alerts
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessAnalyticsService, AnomalyAlert } from '@/services/analytics/businessAnalyticsService';
import { AlertTriangle, CheckCircle, Eye, Bell, BellOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const AnomalyDetectionAlerts: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['analytics', 'anomaly-alerts'],
    queryFn: () => businessAnalyticsService.getAnomalyAlerts(),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60000, // Auto-refresh every minute
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) => businessAnalyticsService.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'anomaly-alerts'] });
      toast.success('Alert acknowledged');
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) => businessAnalyticsService.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'anomaly-alerts'] });
      toast.success('Alert resolved');
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Bell className="h-4 w-4 text-red-500 animate-pulse" />;
      case 'acknowledged': return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const activeCount = alerts?.filter(a => a.status === 'active').length || 0;

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-28 bg-muted/50 rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Anomaly Detection
            {activeCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {activeCount} Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Real-time detection of unusual patterns</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {alerts?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BellOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No anomalies detected</p>
                <p className="text-sm">All systems operating normally</p>
              </div>
            ) : (
              alerts?.map((alert) => (
                <div
                  key={alert.alertId}
                  className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(alert.status)}
                      <div>
                        <h4 className="font-medium">{alert.metricName}</h4>
                        <p className="text-xs text-muted-foreground">
                          Detected: {new Date(alert.detectedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {alert.severity}
                    </Badge>
                  </div>

                  {/* Deviation Display */}
                  <div className="bg-background/50 rounded p-3 mb-3">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Detected</p>
                        <p className="font-bold text-lg">{alert.detectedValue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expected Range</p>
                        <p className="font-medium">
                          {alert.expectedRange.min} - {alert.expectedRange.max}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Deviation</p>
                        <p className={`font-bold text-lg ${
                          alert.deviation > 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {alert.deviation > 0 ? '+' : ''}{alert.deviation}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Possible Causes */}
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Possible Causes:</p>
                    <div className="flex flex-wrap gap-1">
                      {alert.possibleCauses.map((cause, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {cause}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Actions */}
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Suggested Actions:</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {alert.suggestedActions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  {alert.status !== 'resolved' && (
                    <div className="flex gap-2 pt-2 border-t">
                      {alert.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeMutation.mutate(alert.alertId)}
                          disabled={acknowledgeMutation.isPending}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveMutation.mutate(alert.alertId)}
                        disabled={resolveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AnomalyDetectionAlerts;
