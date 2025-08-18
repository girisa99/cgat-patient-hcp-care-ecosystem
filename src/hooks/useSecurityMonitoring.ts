import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  alert_type: 'suspicious_access' | 'failed_auth' | 'data_breach' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  resource_accessed?: string;
  alert_details: any;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  created_at: string;
  updated_at: string;
}

interface SecurityMetrics {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  alertsByType: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  recentActivity: SecurityAlert[];
}

interface UseSecurityMonitoringReturn {
  // Data
  alerts: SecurityAlert[];
  metrics: SecurityMetrics | null;
  
  // Loading states
  loading: boolean;
  analyzing: boolean;
  
  // Actions
  fetchAlerts: () => Promise<void>;
  analyzePatterns: () => Promise<void>;
  createAlert: (alertData: Partial<SecurityAlert>) => Promise<void>;
  resolveAlert: (alertId: string, status: 'resolved' | 'false_positive') => Promise<void>;
  checkSuspiciousAccess: (accessData: any) => Promise<{ suspicious: boolean; score: number; reasons: string[] }>;
  
  // Real-time
  subscribeToAlerts: () => void;
  unsubscribeFromAlerts: () => void;
}

export const useSecurityMonitoring = (): UseSecurityMonitoringReturn => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const calculateMetrics = useCallback((alertsData: SecurityAlert[]): SecurityMetrics => {
    const totalAlerts = alertsData.length;
    const activeAlerts = alertsData.filter(a => a.status === 'active').length;
    const criticalAlerts = alertsData.filter(a => a.severity === 'critical').length;
    const resolvedAlerts = alertsData.filter(a => a.status === 'resolved').length;
    
    const alertsByType = alertsData.reduce((acc, alert) => {
      acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const alertsBySeverity = alertsData.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get recent activity (last 10 alerts)
    const recentActivity = alertsData
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    return {
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      resolvedAlerts,
      alertsByType,
      alertsBySeverity,
      recentActivity
    };
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: {
          action: 'get_alerts',
          data: { limit: 500 }
        }
      });

      if (error) {
        console.error('Error fetching alerts:', error);
        throw error;
      }
      
      if (data?.success) {
        setAlerts(data.alerts);
        setMetrics(calculateMetrics(data.alerts));
      } else {
        throw new Error('Failed to fetch security alerts');
      }
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch security alerts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [calculateMetrics]);

  const analyzePatterns = useCallback(async () => {
    try {
      setAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: {
          action: 'analyze_patterns'
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: 'Pattern Analysis Complete',
          description: `Generated ${data.alerts_generated} new alerts from analyzing ${data.patterns_analyzed} user patterns`
        });
        
        // Refresh alerts after analysis
        await fetchAlerts();
        
        return data;
      } else {
        throw new Error('Pattern analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze security patterns',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setAnalyzing(false);
    }
  }, [fetchAlerts]);

  const createAlert = useCallback(async (alertData: Partial<SecurityAlert>) => {
    try {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: {
          action: 'create_alert',
          data: alertData
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: 'Security Alert Created',
          description: `${alertData.alert_type} alert has been created`
        });
        
        // Refresh alerts
        await fetchAlerts();
        
        return data.alert;
      } else {
        throw new Error('Failed to create alert');
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to create security alert',
        variant: 'destructive'
      });
      throw error;
    }
  }, [fetchAlerts]);

  const resolveAlert = useCallback(async (alertId: string, status: 'resolved' | 'false_positive') => {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({ 
          status,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);

      if (error) throw error;
      
      toast({
        title: 'Alert Updated',
        description: `Alert marked as ${status.replace('_', ' ')}`
      });
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status, updated_at: new Date().toISOString() }
          : alert
      ));
      
      // Recalculate metrics
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status, updated_at: new Date().toISOString() }
          : alert
      );
      setMetrics(calculateMetrics(updatedAlerts));
      
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alert',
        variant: 'destructive'
      });
      throw error;
    }
  }, [alerts, calculateMetrics]);

  const checkSuspiciousAccess = useCallback(async (accessData: {
    user_id: string;
    ip_address?: string;
    resource: string;
    user_agent?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: {
          action: 'check_suspicious_access',
          data: accessData
        }
      });

      if (error) throw error;
      
      return {
        suspicious: data.suspicious || false,
        score: data.score || 0,
        reasons: data.reasons || []
      };
    } catch (error) {
      console.error('Error checking suspicious access:', error);
      return { suspicious: false, score: 0, reasons: [] };
    }
  }, []);

  const subscribeToAlerts = useCallback(() => {
    const subscription = supabase
      .channel('security-alerts-monitoring')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'security_alerts'
      }, (payload) => {
        console.log('Security alert change:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newAlert = payload.new as SecurityAlert;
          setAlerts(prev => [newAlert, ...prev]);
          
          // Show notification for high severity alerts
          if (newAlert.severity === 'high' || newAlert.severity === 'critical') {
            toast({
              title: `${newAlert.severity.toUpperCase()} Security Alert`,
              description: `${newAlert.alert_type.replace('_', ' ')} detected`,
              variant: 'destructive'
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedAlert = payload.new as SecurityAlert;
          setAlerts(prev => prev.map(alert => 
            alert.id === updatedAlert.id ? updatedAlert : alert
          ));
        } else if (payload.eventType === 'DELETE') {
          setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
        }
        
        // Recalculate metrics after any change
        setAlerts(currentAlerts => {
          setMetrics(calculateMetrics(currentAlerts));
          return currentAlerts;
        });
      })
      .subscribe();

    return subscription;
  }, [calculateMetrics]);

  const unsubscribeFromAlerts = useCallback(() => {
    supabase.removeAllChannels();
  }, []);

  // Initialize on mount
  useEffect(() => {
    fetchAlerts();
    const subscription = subscribeToAlerts();
    
    // Set up periodic pattern analysis (every 5 minutes)
    const intervalId = setInterval(() => {
      if (!analyzing) {
        analyzePatterns().catch(console.error);
      }
    }, 5 * 60 * 1000);

    return () => {
      unsubscribeFromAlerts();
      clearInterval(intervalId);
      subscription?.unsubscribe();
    };
  }, []);

  return {
    // Data
    alerts,
    metrics,
    
    // Loading states
    loading,
    analyzing,
    
    // Actions
    fetchAlerts,
    analyzePatterns,
    createAlert,
    resolveAlert,
    checkSuspiciousAccess,
    
    // Real-time
    subscribeToAlerts,
    unsubscribeFromAlerts
  };
};