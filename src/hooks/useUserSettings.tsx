
import { useState, useEffect } from 'react';
import { useMasterAuth } from './useMasterAuth';

interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserSettings = () => {
  const { user } = useMasterAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for now since user_settings table doesn't exist in schema
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setSettings({
          id: crypto.randomUUID(),
          user_id: user.id,
          theme: 'system',
          language: 'en',
          timezone: 'UTC',
          email_notifications: true,
          push_notifications: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsLoading(false);
      }, 100);
    }
  }, [user]);

  const updateSettings = async (updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!settings) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSettings(prev => prev ? {
        ...prev,
        ...updates,
        updated_at: new Date().toISOString()
      } : null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    updateSettings,
    isLoading,
    error,
  };
};
