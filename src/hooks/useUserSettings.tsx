import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMasterAuth } from '@/hooks/useMasterAuth';

interface UserSettings {
  id: string;
  notifications_enabled: boolean;
  theme_preference: string;
  language_preference: string;
  created_at: string;
  updated_at: string;
}

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load user settings from database
  const loadSettings = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user settings:', error);
        setError(error.message);
        return;
      }

      setSettings(data);
      setError(null);
    } catch (err: any) {
      console.error('Exception loading user settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update user settings
  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!settings || !user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        toast({
          title: "Error",
          description: "Failed to update settings",
          variant: "destructive",
        });
        return;
      }

      setSettings(data);
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (err: any) {
      console.error('Exception updating settings:', err);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  // Initialize settings for new user
  const createDefaultSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          notifications_enabled: true,
          theme_preference: 'light',
          language_preference: 'en'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default settings:', error);
        return;
      }

      setSettings(data);
    } catch (err: any) {
      console.error('Exception creating default settings:', err);
    }
  };

  const { user } = useMasterAuth();

  useEffect(() => {
    if (user?.id) {
      loadSettings(user.id);
    } else {
      setSettings(null);
      setLoading(false);
    }
  }, [user?.id]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    createDefaultSettings,
    refetch: () => user?.id && loadSettings(user.id)
  };
};
