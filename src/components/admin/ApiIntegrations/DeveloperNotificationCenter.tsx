
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellRing, 
  Settings, 
  Mail, 
  Smartphone,
  AlertTriangle,
  Info,
  Zap,
  Globe
} from 'lucide-react';
import { useDeveloperNotifications } from '@/hooks/useDeveloperNotifications';

const DeveloperNotificationCenter = () => {
  const {
    notifications,
    preferences,
    unreadCount,
    isLoading,
    markAsRead,
    updatePreferences
  } = useDeveloperNotifications();

  const [activeTab, setActiveTab] = useState('notifications');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_api':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'beta_launch':
        return <Zap className="h-4 w-4 text-purple-500" />;
      case 'breaking_change':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'feature_update':
        return <Info className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'breaking_change':
        return 'destructive';
      case 'beta_launch':
        return 'default';
      case 'new_api':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading notifications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          <h3 className="text-lg font-medium">Developer Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="notifications">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className={!notification.is_read ? 'border-blue-200' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{notification.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={getNotificationBadgeVariant(notification.type)}>
                              {notification.type.replace('_', ' ')}
                            </Badge>
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        {notification.metadata.api_name && (
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              API: {notification.metadata.api_name}
                            </Badge>
                            {notification.metadata.affected_modules?.map((module) => (
                              <Badge key={module} variant="outline" className="text-xs">
                                Module: {module}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="new-apis">New APIs</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new APIs become available
                      </p>
                    </div>
                    <Switch
                      id="new-apis"
                      checked={preferences?.new_apis}
                      onCheckedChange={(checked) => 
                        updatePreferences({ new_apis: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="beta-launches">Beta Launches</Label>
                      <p className="text-sm text-muted-foreground">
                        Early access to beta features and APIs
                      </p>
                    </div>
                    <Switch
                      id="beta-launches"
                      checked={preferences?.beta_launches}
                      onCheckedChange={(checked) => 
                        updatePreferences({ beta_launches: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="breaking-changes">Breaking Changes</Label>
                      <p className="text-sm text-muted-foreground">
                        Critical updates that may affect your integrations
                      </p>
                    </div>
                    <Switch
                      id="breaking-changes"
                      checked={preferences?.breaking_changes}
                      onCheckedChange={(checked) => 
                        updatePreferences({ breaking_changes: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="documentation-updates">Documentation Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Changes to API documentation and guides
                      </p>
                    </div>
                    <Switch
                      id="documentation-updates"
                      checked={preferences?.documentation_updates}
                      onCheckedChange={(checked) => 
                        updatePreferences({ documentation_updates: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <div>
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={preferences?.email_notifications}
                      onCheckedChange={(checked) => 
                        updatePreferences({ email_notifications: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <div>
                        <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications in the developer portal
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="in-app-notifications"
                      checked={preferences?.in_app_notifications}
                      onCheckedChange={(checked) => 
                        updatePreferences({ in_app_notifications: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperNotificationCenter;
