import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { Shield, Lock, Clock, Bell, Activity, Smartphone, AlertTriangle, Eye } from 'lucide-react';
import { format } from 'date-fns';

const SecuritySettings = () => {
  const { user } = useAuthContext();
  const { securitySettings, updateSecurity, isUpdating } = useUserSettings();
  const [newIpAddress, setNewIpAddress] = useState('');

  // Fetch security events
  const { data: securityEvents } = useQuery({
    queryKey: ['securityEvents', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch user activity logs
  const { data: activityLogs } = useQuery({
    queryKey: ['userActivityLogs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleToggle = (key: string, value: boolean) => {
    if (securitySettings) {
      updateSecurity({ [key]: value });
    }
  };

  const handleSessionTimeoutChange = (minutes: number) => {
    if (securitySettings) {
      updateSecurity({ session_timeout_minutes: minutes });
    }
  };

  const handleAddIpAddress = () => {
    if (newIpAddress && securitySettings) {
      const currentList = Array.isArray(securitySettings.ip_whitelist) 
        ? securitySettings.ip_whitelist as string[]
        : [];
      updateSecurity({ 
        ip_whitelist: [...currentList, newIpAddress] as any
      });
      setNewIpAddress('');
    }
  };

  const handleRemoveIpAddress = (ipToRemove: string) => {
    if (securitySettings && Array.isArray(securitySettings.ip_whitelist)) {
      const updatedList = (securitySettings.ip_whitelist as string[]).filter(ip => ip !== ipToRemove);
      updateSecurity({ ip_whitelist: updatedList as any });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (!securitySettings) {
    return <div>Loading security settings...</div>;
  }

  // Safely handle ip_whitelist as it could be various JSON types
  const ipWhitelist = Array.isArray(securitySettings.ip_whitelist) 
    ? securitySettings.ip_whitelist as string[]
    : [];

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require a verification code in addition to your password
              </p>
            </div>
            <Switch
              checked={securitySettings.two_factor_enabled}
              onCheckedChange={(checked) => handleToggle('two_factor_enabled', checked)}
              disabled={isUpdating}
            />
          </div>
          {securitySettings.two_factor_enabled && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">
                ✓ Two-factor authentication is enabled
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your account is protected with an additional security layer
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Control your session timeout and login preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Session Timeout</Label>
            <Select
              value={securitySettings.session_timeout_minutes.toString()}
              onValueChange={(value) => handleSessionTimeoutChange(parseInt(value))}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
                <SelectItem value="720">12 hours</SelectItem>
                <SelectItem value="1440">24 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              You'll be automatically logged out after this period of inactivity
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Login Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone logs into your account
              </p>
            </div>
            <Switch
              checked={securitySettings.login_notifications}
              onCheckedChange={(checked) => handleToggle('login_notifications', checked)}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitoring
          </CardTitle>
          <CardDescription>
            Configure security monitoring and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Suspicious Activity Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about unusual account activity
              </p>
            </div>
            <Switch
              checked={securitySettings.suspicious_activity_alerts}
              onCheckedChange={(checked) => handleToggle('suspicious_activity_alerts', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Device Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Track devices that access your account
              </p>
            </div>
            <Switch
              checked={securitySettings.device_tracking}
              onCheckedChange={(checked) => handleToggle('device_tracking', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>API Access Logging</Label>
              <p className="text-sm text-muted-foreground">
                Log all API access to your account
              </p>
            </div>
            <Switch
              checked={securitySettings.api_access_logging}
              onCheckedChange={(checked) => handleToggle('api_access_logging', checked)}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      {/* IP Whitelist */}
      <Card>
        <CardHeader>
          <CardTitle>IP Address Whitelist</CardTitle>
          <CardDescription>
            Restrict access to your account from specific IP addresses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              value={newIpAddress}
              onChange={(e) => setNewIpAddress(e.target.value)}
            />
            <Button onClick={handleAddIpAddress} disabled={!newIpAddress || isUpdating}>
              Add
            </Button>
          </div>
          
          {ipWhitelist.length > 0 && (
            <div className="space-y-2">
              <Label>Whitelisted IP Addresses</Label>
              <div className="flex flex-wrap gap-2">
                {ipWhitelist.map((ip, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2">
                    {ip}
                    <button
                      onClick={() => handleRemoveIpAddress(ip)}
                      className="ml-1 hover:text-destructive"
                      disabled={isUpdating}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>
            Monitor recent security-related activities on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securityEvents && securityEvents.length > 0 ? (
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{event.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.created_at), 'MMM dd, yyyy at HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getSeverityColor(event.severity) as any}>
                    {event.severity}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No security events recorded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Track your recent account activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activityLogs && activityLogs.length > 0 ? (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{log.activity_description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{format(new Date(log.created_at), 'MMM dd, yyyy at HH:mm')}</span>
                      {log.module_name && <span>Module: {log.module_name}</span>}
                      {log.ip_address && <span>IP: {log.ip_address.toString()}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity recorded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
