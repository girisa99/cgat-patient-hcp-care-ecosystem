import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, AlertTriangle, AlertCircle, CheckCircle, 
  Clock, Filter, RefreshCw, Eye, UserX, Database,
  TrendingUp, Activity, Lock, Globe
} from 'lucide-react';
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

export const SecurityMonitoringDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    type: 'all'
  });

  useEffect(() => {
    fetchAlerts();
    // Set up real-time subscription for new alerts
    const subscription = supabase
      .channel('security-alerts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'security_alerts'
      }, (payload) => {
        console.log('Security alert update:', payload);
        fetchAlerts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alerts, filters]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: {
          action: 'get_alerts',
          data: {
            limit: 500
          }
        }
      });

      if (error) throw error;
      
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch security alerts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzePatterns = async () => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('security-monitor', {
        body: {
          action: 'analyze_patterns'
        }
      });

      if (error) throw error;
      
      if (data.success) {
        toast({
          title: 'Analysis Complete',
          description: `Generated ${data.alerts_generated} new alerts from ${data.patterns_analyzed} patterns`
        });
        fetchAlerts();
      }
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze security patterns',
        variant: 'destructive'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const resolveAlert = async (alertId: string, status: 'resolved' | 'false_positive') => {
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
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alert',
        variant: 'destructive'
      });
    }
  };

  const applyFilters = () => {
    let filtered = alerts;

    if (filters.severity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filters.severity);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(alert => alert.status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(alert => alert.alert_type === filters.type);
    }

    setFilteredAlerts(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <Eye className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suspicious_access': return <Shield className="h-4 w-4" />;
      case 'failed_auth': return <UserX className="h-4 w-4" />;
      case 'data_breach': return <Database className="h-4 w-4" />;
      case 'unusual_pattern': return <TrendingUp className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatAlertType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAlertStats = () => {
    const active = alerts.filter(a => a.status === 'active').length;
    const critical = alerts.filter(a => a.severity === 'critical').length;
    const high = alerts.filter(a => a.severity === 'high').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;

    return { active, critical, high, resolved };
  };

  const stats = getAlertStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Monitoring</h2>
          <p className="text-muted-foreground">Real-time security alerts and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchAlerts}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={analyzePatterns}
            disabled={analyzing}
          >
            <Shield className="h-4 w-4 mr-2" />
            {analyzing ? 'Analyzing...' : 'Analyze Patterns'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.high}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select 
              value={filters.severity} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="false_positive">False Positive</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.type} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Alert Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="suspicious_access">Suspicious Access</SelectItem>
                <SelectItem value="failed_auth">Failed Auth</SelectItem>
                <SelectItem value="data_breach">Data Breach</SelectItem>
                <SelectItem value="unusual_pattern">Unusual Pattern</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Security Alerts ({filteredAlerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No security alerts found matching the current filters.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(alert.alert_type)}
                          <span className="font-medium">{formatAlertType(alert.alert_type)}</span>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {getSeverityIcon(alert.severity)}
                            <span className="ml-1">{alert.severity.toUpperCase()}</span>
                          </Badge>
                          <Badge variant="outline">{alert.status}</Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {alert.ip_address && (
                            <span className="flex items-center gap-1 mr-4">
                              <Globe className="h-3 w-3" />
                              {alert.ip_address}
                            </span>
                          )}
                          {alert.resource_accessed && (
                            <span className="flex items-center gap-1">
                              <Database className="h-3 w-3" />
                              {alert.resource_accessed}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(alert.created_at).toLocaleString()}
                        </div>

                        {alert.alert_details && (
                          <div className="text-sm bg-muted p-2 rounded">
                            <pre className="whitespace-pre-wrap text-xs">
                              {JSON.stringify(alert.alert_details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>

                      {alert.status === 'active' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id, 'resolved')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id, 'false_positive')}
                          >
                            False Positive
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};