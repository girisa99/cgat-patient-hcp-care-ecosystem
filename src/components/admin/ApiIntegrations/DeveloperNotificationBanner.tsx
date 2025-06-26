
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Globe, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeveloperNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: {
    api_id?: string;
    api_name?: string;
    category?: string;
    pricing_model?: string;
  };
  created_at: string;
  is_read: boolean;
}

const DeveloperNotificationBanner = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<DeveloperNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('developer-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'developer_notifications'
      }, (payload) => {
        console.log('New notification received:', payload);
        const newNotification = payload.new as DeveloperNotification;
        setNotifications(prev => [newNotification, ...prev]);
        
        // Show toast for new notifications
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('developer_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('developer_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const dismissAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('developer_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications([]);
    } catch (error) {
      console.error('Error dismissing all notifications:', error);
    }
  };

  if (isLoading || notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Developer Notifications</span>
          <Badge variant="secondary">{notifications.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={dismissAll}>
          Dismiss All
        </Button>
      </div>
      
      {notifications.map((notification) => (
        <Card key={notification.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {notification.type === 'new_api' && <Globe className="h-4 w-4 text-blue-500" />}
                  {notification.type === 'feature_update' && <Sparkles className="h-4 w-4 text-purple-500" />}
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  {notification.metadata.pricing_model === 'free' && (
                    <Badge variant="secondary" className="text-xs">FREE</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                  {notification.metadata.category && (
                    <>
                      <span>•</span>
                      <span>{notification.metadata.category}</span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(notification.id)}
                className="p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DeveloperNotificationBanner;
