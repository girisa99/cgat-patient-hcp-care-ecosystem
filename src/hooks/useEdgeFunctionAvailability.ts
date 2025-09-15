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
      
      // Try a lightweight health check function or any simple function
      // Using a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const functionCall = supabase.functions.invoke('health-check', {
        body: { test: true }
      });
      
      await Promise.race([functionCall, timeoutPromise]);
      
      setAvailability({
        isAvailable: true,
        isChecking: false,
        lastChecked: new Date(),
        error: null
      });
      
      return true;
    } catch (error: any) {
      console.warn('Edge functions unavailable:', error);
      
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