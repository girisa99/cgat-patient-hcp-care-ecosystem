import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useTwilioNotifications } from '@/hooks/useTwilioNotifications';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { Bell, Mail, Smartphone, MessageSquare, Shield, Settings, Package, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

const NotificationSettings = () => {
  const { notificationPreferences, updateNotifications, isUpdating } = useUserSettings();
  const { sendSMS, sendWhatsApp, sendVoiceCall, sendEmail, isLoading } = useTwilioNotifications();
  const { profile } = useAuthContext();
  
  const [testPhone, setTestPhone] = useState('');
  const [testEmail, setTestEmail] = useState(profile?.email || '');

  // Update test email when profile changes
  useEffect(() => {
    if (profile?.email) {
      setTestEmail(profile.email);
    }
  }, [profile?.email]);

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

  const handleTestNotification = async (type: 'sms' | 'whatsapp' | 'voice' | 'email') => {
    const message = `This is a test ${type.toUpperCase()} notification from your Healthcare Portal. If you received this, your ${type} notifications are working correctly!`;
    
    try {
      switch (type) {
        case 'sms':
          if (!testPhone) {
            toast.error('Please enter a phone number');
            return;
          }
          await sendSMS(testPhone, message);
          break;
        case 'whatsapp':
          if (!testPhone) {
            toast.error('Please enter a phone number');
            return;
          }
          await sendWhatsApp(testPhone, message);
          break;
        case 'voice':
          if (!testPhone) {
            toast.error('Please enter a phone number');
            return;
          }
          await sendVoiceCall(testPhone, message);
          break;
        case 'email':
          if (!testEmail) {
            toast.error('Please enter an email address');
            return;
          }
          await sendEmail(testEmail, message, 'Test Email Notification');
          break;
      }
    } catch (error) {
      console.error(`Error sending ${type} notification:`, error);
      toast.error(`Failed to send ${type} notification`);
    }
  };

  if (!notificationPreferences) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading notification settings...</p>
        </div>
      </div>
    );
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
            Choose how you want to receive notifications via Twilio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email through SendGrid
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
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text messages via Twilio SMS
                </p>
              </div>
            </div>
            <Switch
              checked={notificationPreferences.sms_notifications}
              onCheckedChange={(checked) => handleToggle('sms_notifications', checked)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>WhatsApp Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive messages via WhatsApp Business API
                </p>
              </div>
            </div>
            <Switch
              checked={notificationPreferences.push_notifications}
              onCheckedChange={(checked) => handleToggle('push_notifications', checked)}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Notifications
          </CardTitle>
          <CardDescription>
            Test your notification channels to ensure they're working correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testPhone">Phone Number (with country code)</Label>
              <Input
                id="testPhone"
                placeholder="+1234567890"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testEmail">Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestNotification('email')}
              disabled={isLoading || !testEmail}
            >
              {isLoading ? 'Sending...' : 'Test Email'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestNotification('sms')}
              disabled={isLoading || !testPhone}
            >
              {isLoading ? 'Sending...' : 'Test SMS'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestNotification('whatsapp')}
              disabled={isLoading || !testPhone}
            >
              {isLoading ? 'Sending...' : 'Test WhatsApp'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestNotification('voice')}
              disabled={isLoading || !testPhone}
            >
              {isLoading ? 'Sending...' : 'Test Voice Call'}
            </Button>
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
                <Label>Marketing Communications</Label>
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

      {/* Notification Timing */}
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
