
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Bell, Mail, Smartphone, MessageSquare, Shield, Settings, Package, Clock } from 'lucide-react';

const NotificationSettings = () => {
  const { notificationPreferences, updateNotifications, isUpdating } = useUserSettings();

  const handleToggle = (key: string, value: boolean) => {
    if (notificationPreferences) {
      updateNotifications({ [key]: value });
    }
  };

  const handleSelectChange = (key: string, value: string) => {
    if (notificationPreferences) {
      updateNotifications({ [key]: value });
    }
  };

  const handleTimeChange = (key: string, value: string) => {
    if (notificationPreferences) {
      updateNotifications({ [key]: value });
    }
  };

  if (!notificationPreferences) {
    return <div>Loading notification settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              checked={notificationPreferences.email_notifications}
              onCheckedChange={(checked) => handleToggle('email_notifications', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications on your device
                </p>
              </div>
            </div>
            <Switch
              checked={notificationPreferences.push_notifications}
              onCheckedChange={(checked) => handleToggle('push_notifications', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via text message
                </p>
              </div>
            </div>
            <Switch
              checked={notificationPreferences.sms_notifications}
              onCheckedChange={(checked) => handleToggle('sms_notifications', checked)}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Control which types of notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Security Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Important security-related notifications
                </p>
              </div>
            </div>
            <Switch
              checked={notificationPreferences.security_alerts}
              onCheckedChange={(checked) => handleToggle('security_alerts', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>System Updates</Label>
                <p className="text-sm text-muted-foreground">
                  System maintenance and update notifications
                </p>
              </div>
            </div>
            <Switch
              checked={notificationPreferences.system_updates}
              onCheckedChange={(checked) => handleToggle('system_updates', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Module Updates</Label>
                <p className="text-sm text-muted-foreground">
                  New features and module updates
                </p>
              </div>
            </div>
            <Switch
              checked={notificationPreferences.module_updates}
              onCheckedChange={(checked) => handleToggle('module_updates', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Product updates and promotional content
                </p>
              </div>
            </div>
            <Switch
              checked={notificationPreferences.marketing_emails}
              onCheckedChange={(checked) => handleToggle('marketing_emails', checked)}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Notification Timing
          </CardTitle>
          <CardDescription>
            Control when and how often you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Notification Frequency</Label>
            <Select
              value={notificationPreferences.notification_frequency}
              onValueChange={(value) => handleSelectChange('notification_frequency', value)}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="monthly">Monthly Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quiet Hours Start</Label>
              <Input
                type="time"
                value={notificationPreferences.quiet_hours_start || ''}
                onChange={(e) => handleTimeChange('quiet_hours_start', e.target.value)}
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label>Quiet Hours End</Label>
              <Input
                type="time"
                value={notificationPreferences.quiet_hours_end || ''}
                onChange={(e) => handleTimeChange('quiet_hours_end', e.target.value)}
                disabled={isUpdating}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            During quiet hours, only critical security alerts will be sent
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
