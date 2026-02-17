/**
 * NOTIFICATIONS PANEL UI (P4-COLLAB-10)
 * 
 * Displays user notifications with @mentions support.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  AtSign, 
  Reply, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Share2, 
  AlertCircle,
  Settings,
  X,
  Check
} from 'lucide-react';
import { 
  mentionsNotificationsService, 
  Notification, 
  NotificationType, 
  NotificationPreferences 
} from '@/services/collaboration/mentionsNotificationsService';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface NotificationsPanelProps {
  userId?: string;
}

const iconMap: Record<NotificationType, React.ReactNode> = {
  mention: <AtSign className="h-4 w-4" />,
  reply: <Reply className="h-4 w-4" />,
  comment: <MessageSquare className="h-4 w-4" />,
  approval_request: <Clock className="h-4 w-4" />,
  approval_decision: <CheckCircle className="h-4 w-4" />,
  content_shared: <Share2 className="h-4 w-4" />,
  deadline_reminder: <Bell className="h-4 w-4" />,
  system_alert: <AlertCircle className="h-4 w-4" />,
};

const colorMap: Record<NotificationType, string> = {
  mention: 'text-blue-500 bg-blue-100',
  reply: 'text-purple-500 bg-purple-100',
  comment: 'text-orange-500 bg-orange-100',
  approval_request: 'text-yellow-500 bg-yellow-100',
  approval_decision: 'text-green-500 bg-green-100',
  content_shared: 'text-blue-500 bg-blue-100',
  deadline_reminder: 'text-red-500 bg-red-100',
  system_alert: 'text-gray-500 bg-gray-100',
};

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [userId]);

  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = mentionsNotificationsService.subscribe(currentUserId, (notifs) => {
      setNotifications(notifs);
      setIsLoading(false);
    });

    loadPreferences();

    // Generate demo notifications
    generateDemoNotifications();

    return unsubscribe;
  }, [currentUserId]);

  const loadUser = async () => {
    if (userId) {
      setCurrentUserId(userId);
      return;
    }
    const { data: session } = await supabase.auth.getSession();
    setCurrentUserId(session?.session?.user?.id || 'demo-user');
  };

  const loadPreferences = async () => {
    if (!currentUserId) return;
    const prefs = await mentionsNotificationsService.getPreferences(currentUserId);
    setPreferences(prefs);
  };

  const generateDemoNotifications = async () => {
    if (!currentUserId) return;
    
    // Only generate if empty
    const existing = await mentionsNotificationsService.getNotifications(currentUserId, { limit: 1 });
    if (existing.length > 0) return;

    await mentionsNotificationsService.createNotification({
      userId: currentUserId,
      type: 'mention',
      title: 'Alex mentioned you',
      message: 'You were mentioned in "Q1 Marketing Video"',
      priority: 'high',
      sourceUserName: 'Alex Chen',
    });

    await mentionsNotificationsService.createNotification({
      userId: currentUserId,
      type: 'approval_request',
      title: 'Review requested',
      message: 'Sarah requested your review on "Brand Guidelines"',
      priority: 'normal',
      sourceUserName: 'Sarah Johnson',
    });

    await mentionsNotificationsService.createNotification({
      userId: currentUserId,
      type: 'content_shared',
      title: 'Content shared with you',
      message: 'Mike shared "Product Demo" with you',
      priority: 'low',
      sourceUserName: 'Mike Williams',
    });
  };

  const handleMarkAsRead = async (id: string) => {
    if (!currentUserId) return;
    await mentionsNotificationsService.markAsRead(id, currentUserId);
  };

  const handleMarkAllRead = async () => {
    if (!currentUserId) return;
    await mentionsNotificationsService.markAllAsRead(currentUserId);
  };

  const handleDismiss = async (id: string) => {
    if (!currentUserId) return;
    await mentionsNotificationsService.dismissNotification(id, currentUserId);
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!currentUserId || !preferences) return;
    const updated = await mentionsNotificationsService.updatePreferences(currentUserId, { [key]: value });
    setPreferences(updated);
  };

  const unreadCount = notifications.filter(n => !n.is_read && !n.is_dismissed).length;
  const visibleNotifications = notifications.filter(n => !n.is_dismissed);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {isLoading && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Loading notifications...
                  </p>
                )}

                {!isLoading && visibleNotifications.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      You're all caught up!
                    </p>
                  </div>
                )}

                {visibleNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={() => handleMarkAsRead(notification.id)}
                    onDismiss={() => handleDismiss(notification.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings">
            {preferences && (
              <PreferencesForm
                preferences={preferences}
                onUpdate={handlePreferenceChange}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: () => void;
  onDismiss: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onDismiss,
}) => {
  const colorClass = colorMap[notification.type] || 'text-gray-500 bg-gray-100';
  const icon = iconMap[notification.type] || <Bell className="h-4 w-4" />;

  return (
    <div
      className={`flex gap-3 p-3 rounded-lg transition-colors ${
        notification.is_read ? 'opacity-75' : 'bg-muted/50'
      }`}
    >
      {/* Icon */}
      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{notification.title}</p>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
          </div>
          {notification.priority === 'high' && (
            <Badge variant="destructive" className="text-xs shrink-0">
              Urgent
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
          {!notification.is_read && (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onMarkRead}>
              <Check className="h-3 w-3 mr-1" />
              Mark read
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onDismiss}>
            <X className="h-3 w-3 mr-1" />
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
};

interface PreferencesFormProps {
  preferences: NotificationPreferences;
  onUpdate: (key: keyof NotificationPreferences, value: boolean) => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ preferences, onUpdate }) => {
  const toggleItems: { key: keyof NotificationPreferences; label: string; description: string }[] = [
    { key: 'mentions', label: '@Mentions', description: 'When someone mentions you' },
    { key: 'replies', label: 'Replies', description: 'Replies to your comments' },
    { key: 'comments', label: 'Comments', description: 'New comments on your content' },
    { key: 'approvals', label: 'Approvals', description: 'Approval requests and decisions' },
    { key: 'shares', label: 'Shares', description: 'When content is shared with you' },
    { key: 'deadlines', label: 'Deadlines', description: 'Deadline reminders' },
    { key: 'systemAlerts', label: 'System Alerts', description: 'System notifications' },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {toggleItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={item.key}>{item.label}</Label>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              id={item.key}
              checked={preferences[item.key] as boolean}
              onCheckedChange={(checked) => onUpdate(item.key, checked)}
            />
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push Notifications</Label>
            <p className="text-xs text-muted-foreground">Enable browser push notifications</p>
          </div>
          <Switch
            checked={preferences.pushEnabled}
            onCheckedChange={(checked) => onUpdate('pushEnabled', checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
