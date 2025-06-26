
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeveloperNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_api' | 'beta_launch' | 'documentation_update' | 'breaking_change' | 'feature_update';
  metadata: {
    api_name?: string;
    version?: string;
    affected_modules?: string[];
    beta_access_link?: string;
  };
  is_read: boolean;
  created_at: string;
  user_id: string;
}

interface NotificationPreferences {
  new_apis: boolean;
  beta_launches: boolean;
  documentation_updates: boolean;
  breaking_changes: boolean;
  feature_updates: boolean;
  email_notifications: boolean;
  in_app_notifications: boolean;
}

export const useDeveloperNotifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get notifications for current user
  const {
    data: notifications,
    isLoading: notificationsLoading
  } = useQuery({
    queryKey: ['developer-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developer_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as DeveloperNotification[];
    }
  });

  // Get notification preferences
  const {
    data: preferences,
    isLoading: preferencesLoading
  } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developer_notification_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as NotificationPreferences) || {
        new_apis: true,
        beta_launches: true,
        documentation_updates: false,
        breaking_changes: true,
        feature_updates: true,
        email_notifications: true,
        in_app_notifications: true
      };
    }
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('developer_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-notifications'] });
    }
  });

  // Update notification preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('developer_notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    }
  });

  // Get unread count
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return {
    notifications: notifications || [],
    preferences,
    unreadCount,
    isLoading: notificationsLoading || preferencesLoading,
    markAsRead: markAsReadMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate
  };
};
