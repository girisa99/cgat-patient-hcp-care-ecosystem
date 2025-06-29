
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

interface UserPreferences {
  id?: string;
  user_id?: string;
  auto_route: boolean;
  preferred_dashboard: 'unified' | 'module-specific';
  default_module?: string;
  theme_preference: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
}

interface NotificationPreferences {
  id?: string;
  user_id?: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  security_alerts: boolean;
  system_updates: boolean;
  module_updates: boolean;
  marketing_emails: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

interface SecuritySettings {
  id?: string;
  user_id?: string;
  two_factor_enabled: boolean;
  session_timeout_minutes: number;
  password_last_changed?: string;
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
  device_tracking: boolean;
  api_access_logging: boolean;
  ip_whitelist: string[];
  trusted_devices: any[];
}

export const useUserSettings = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Fetch user preferences
  const { data: userPreferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no preferences exist, create default ones
      if (!data) {
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_preferences')
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;
        return newPrefs;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch notification preferences
  const { data: notificationPreferences, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notificationPreferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no preferences exist, create default ones
      if (!data) {
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;
        return newPrefs;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch security settings
  const { data: securitySettings, isLoading: securityLoading } = useQuery({
    queryKey: ['securitySettings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no settings exist, create default ones
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('security_settings')
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;
        return newSettings;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  // Update user preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      toast.success('Preferences updated successfully');
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    },
  });

  // Update notification preferences mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Notification preferences updated successfully');
    },
    onError: (error) => {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
    },
  });

  // Update security settings mutation
  const updateSecurityMutation = useMutation({
    mutationFn: async (updates: Partial<SecuritySettings>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('security_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securitySettings'] });
      toast.success('Security settings updated successfully');
    },
    onError: (error) => {
      console.error('Error updating security settings:', error);
      toast.error('Failed to update security settings');
    },
  });

  return {
    userPreferences,
    notificationPreferences,
    securitySettings,
    isLoading: preferencesLoading || notificationsLoading || securityLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    updateNotifications: updateNotificationsMutation.mutate,
    updateSecurity: updateSecurityMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending || updateNotificationsMutation.isPending || updateSecurityMutation.isPending,
  };
};
