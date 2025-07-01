
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ApiIntegrationStatus {
  internalApisWorking: boolean;
  externalApisWorking: boolean;
  publishedApisWorking: boolean;
  totalIntegrations: number;
  activeIntegrations: number;
  lastChecked: string;
}

export const useApiIntegrationStatus = () => {
  const [status, setStatus] = useState<ApiIntegrationStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkApiStatus = async (): Promise<ApiIntegrationStatus> => {
    console.log('🔍 Checking API integration status...');
    
    try {
      // Check API Integration Registry
      const { data: integrations, error } = await supabase
        .from('api_integration_registry')
        .select('*');

      if (error) {
        throw new Error(`API registry check failed: ${error.message}`);
      }

      const totalIntegrations = integrations?.length || 0;
      const activeIntegrations = integrations?.filter(api => api.status === 'active').length || 0;

      // Check different types of APIs
      const internalApis = integrations?.filter(api => api.direction === 'inbound' || api.type === 'internal') || [];
      const externalApis = integrations?.filter(api => api.direction === 'outbound' || api.type === 'external') || [];
      const publishedApis = integrations?.filter(api => api.direction === 'outbound' && api.status === 'published') || [];

      return {
        internalApisWorking: internalApis.length > 0,
        externalApisWorking: externalApis.length > 0,
        publishedApisWorking: publishedApis.length > 0,
        totalIntegrations,
        activeIntegrations,
        lastChecked: new Date().toISOString()
      };

    } catch (error) {
      console.error('API status check failed:', error);
      return {
        internalApisWorking: false,
        externalApisWorking: false,
        publishedApisWorking: false,
        totalIntegrations: 0,
        activeIntegrations: 0,
        lastChecked: new Date().toISOString()
      };
    }
  };

  const recheckStatus = async () => {
    setIsChecking(true);
    try {
      const apiStatus = await checkApiStatus();
      setStatus(apiStatus);
    } catch (error) {
      console.error('Failed to check API status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    recheckStatus();
  }, []);

  return {
    status,
    isChecking,
    recheckStatus
  };
};
