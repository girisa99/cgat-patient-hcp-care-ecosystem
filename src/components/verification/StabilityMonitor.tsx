import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface StabilityEvent {
  id: string;
  event_type: string;
  severity: string;
  event_data: Record<string, any>;
  created_at: string;
  file_path: string | null;
  rule_name: string | null;
}

export const StabilityMonitor: React.FC = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['stability-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stability_monitoring')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as StabilityEvent[];
    },
    refetchInterval: 30000, // 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Stability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentEvents = events?.slice(0, 5) || [];
  const criticalCount = events?.filter(e => e.severity === 'critical').length || 0;
  const warningCount = events?.filter(e => e.severity === 'warning').length || 0;

  const getEventIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Stability
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive">{criticalCount} Critical</Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary">{warningCount} Warnings</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentEvents.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>System running smoothly</span>
          </div>
        ) : (
          recentEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
              {getEventIcon(event.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{event.event_type}</span>
                  <Badge variant={getSeverityVariant(event.severity)} className="text-xs">
                    {event.severity}
                  </Badge>
                </div>
                {event.file_path && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {event.file_path}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
        
        {events && events.length > 5 && (
          <div className="text-center pt-2">
            <Badge variant="outline" className="cursor-pointer">
              <TrendingUp className="h-3 w-3 mr-1" />
              {events.length - 5} more events
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};