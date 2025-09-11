/**
 * REAL-TIME NPI VERIFICATION PROVIDER
 * Context provider for managing real-time NPI verification preferences and state
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeNPISettings {
  enabled: boolean;
  debounceMs: number;
  autoVerifyOnComplete: boolean;
  backgroundVerification: boolean;
}

interface RealTimeNPIContextType {
  settings: RealTimeNPISettings;
  updateSettings: (settings: Partial<RealTimeNPISettings>) => void;
  isEnabled: boolean;
}

const defaultSettings: RealTimeNPISettings = {
  enabled: false,
  debounceMs: 2000,
  autoVerifyOnComplete: true,
  backgroundVerification: true
};

const RealTimeNPIContext = createContext<RealTimeNPIContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  isEnabled: false
});

export const useRealTimeNPIVerification = () => {
  const context = useContext(RealTimeNPIContext);
  if (!context) {
    throw new Error('useRealTimeNPIVerification must be used within RealTimeNPIVerificationProvider');
  }
  return context;
};

interface RealTimeNPIVerificationProviderProps {
  children: React.ReactNode;
}

export const RealTimeNPIVerificationProvider: React.FC<RealTimeNPIVerificationProviderProps> = ({
  children
}) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<RealTimeNPISettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load user preferences on mount
  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Try to get from user_preferences table first
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('npi_verification_settings')
        .eq('user_id', user.id)
        .single();

      if (preferences?.npi_verification_settings) {
        setSettings({
          ...defaultSettings,
          ...preferences.npi_verification_settings
        });
      }

    } catch (error) {
      console.error('Failed to load NPI verification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<RealTimeNPISettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save to user_preferences table
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          npi_verification_settings: updatedSettings
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Settings Updated",
        description: "Real-time NPI verification preferences saved successfully.",
      });

    } catch (error) {
      console.error('Failed to save NPI verification preferences:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your preferences. Changes will be lost on page refresh.",
        variant: "destructive",
      });
    }
  };

  const value = {
    settings,
    updateSettings,
    isEnabled: settings.enabled
  };

  if (isLoading) {
    return null; // or loading spinner
  }

  return (
    <RealTimeNPIContext.Provider value={value}>
      {children}
    </RealTimeNPIContext.Provider>
  );
};