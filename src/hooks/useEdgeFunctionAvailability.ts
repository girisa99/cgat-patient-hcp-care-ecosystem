import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EdgeFunctionAvailability {
  isAvailable: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export const useEdgeFunctionAvailability = () => {
  const [availability, setAvailability] = useState<EdgeFunctionAvailability>({
    isAvailable: false,
    isChecking: true,
    lastChecked: null,
    error: null
  });

  const checkAvailability = async (): Promise<boolean> => {
    try {
      setAvailability(prev => ({ ...prev, isChecking: true, error: null }));
      
      // Try a lightweight health check function
      const { data, error } = await supabase.functions.invoke('health-check', {
        body: { test: true }
      });
      
      console.log('🏥 Edge function health check result:', { data, error });
      
      if (error) {
        throw new Error(`Health check failed: ${error.message}`);
      }
      
      setAvailability({
        isAvailable: true,
        isChecking: false,
        lastChecked: new Date(),
        error: null
      });
      
      return true;
    } catch (error: any) {
      console.error('❌ Edge functions unavailable:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        context: error.context
      });
      
      setAvailability({
        isAvailable: false,
        isChecking: false,
        lastChecked: new Date(),
        error: error.message || 'Edge functions unavailable'
      });
      
      return false;
    }
  };

  useEffect(() => {
    // Initial check
    checkAvailability();
    
    // Recheck every 30 seconds if unavailable
    const interval = setInterval(() => {
      if (!availability.isAvailable) {
        checkAvailability();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [availability.isAvailable]);

  return {
    ...availability,
    recheckAvailability: checkAvailability
  };
};