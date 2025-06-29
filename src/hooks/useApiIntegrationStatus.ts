
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ApiIntegrationStatus {
  internalApisWorking: boolean;
  externalApisWorking: boolean;
  publishedApisWorking: boolean;
  apiRegistryConnected: boolean;
  usageTrackingActive: boolean;
  changeTrackingActive: boolean;
  totalIssues: number;
  workingComponents: string[];
  brokenComponents: string[];
  recommendations: string[];
}

export const useApiIntegrationStatus = () => {
  const [status, setStatus] = useState<ApiIntegrationStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkApiIntegrationStatus = async () => {
    setIsChecking(true);

    try {
      console.log('🔍 Checking API Integration System Status...');
      
      const workingComponents: string[] = [];
      const brokenComponents: string[] = [];
      const recommendations: string[] = [];
      let totalIssues = 0;

      // Check API Integration Registry
      try {
        const { data: registryData, error: registryError } = await supabase
          .from('api_integration_registry')
          .select('count', { count: 'exact', head: true });

        if (!registryError) {
          workingComponents.push('API Integration Registry');
        } else {
          brokenComponents.push('API Integration Registry');
          totalIssues++;
        }
      } catch (error) {
        brokenComponents.push('API Integration Registry Connection');
        totalIssues++;
      }

      // Check External API Registry
      try {
        const { data: externalData, error: externalError } = await supabase
          .from('external_api_registry')
          .select('count', { count: 'exact', head: true });

        if (!externalError) {
          workingComponents.push('External API Registry');
        } else {
          brokenComponents.push('External API Registry');
          totalIssues++;
        }
      } catch (error) {
        brokenComponents.push('External API Registry Connection');
        totalIssues++;
      }

      // Check API Usage Analytics
      try {
        const { data: usageData, error: usageError } = await supabase
          .from('api_usage_analytics')
          .select('count', { count: 'exact', head: true });

        if (!usageError) {
          workingComponents.push('API Usage Analytics');
        } else {
          brokenComponents.push('API Usage Analytics');
          totalIssues++;
        }
      } catch (error) {
        brokenComponents.push('API Usage Analytics Connection');
        totalIssues++;
      }

      // Check API Lifecycle Events
      try {
        const { data: lifecycleData, error: lifecycleError } = await supabase
          .from('api_lifecycle_events')
          .select('count', { count: 'exact', head: true });

        if (!lifecycleError) {
          workingComponents.push('API Lifecycle Events');
        } else {
          brokenComponents.push('API Lifecycle Events');
          totalIssues++;
        }
      } catch (error) {
        brokenComponents.push('API Lifecycle Events Connection');
        totalIssues++;
      }

      // Generate recommendations
      if (brokenComponents.length > 0) {
        recommendations.push('🔧 Fix database connectivity issues for broken components');
      }

      if (totalIssues > 2) {
        recommendations.push('🚨 Multiple API integration issues detected - review system configuration');
      }

      if (workingComponents.length < 3) {
        recommendations.push('📊 Consider implementing additional API monitoring components');
      }

      recommendations.push('✅ Integrate API status checks into comprehensive verification system');
      recommendations.push('🔄 Set up automated API health monitoring');

      const apiStatus: ApiIntegrationStatus = {
        internalApisWorking: workingComponents.includes('API Integration Registry'),
        externalApisWorking: workingComponents.includes('External API Registry'),
        publishedApisWorking: workingComponents.includes('External API Registry'),
        apiRegistryConnected: workingComponents.includes('API Integration Registry'),
        usageTrackingActive: workingComponents.includes('API Usage Analytics'),
        changeTrackingActive: workingComponents.includes('API Lifecycle Events'),
        totalIssues,
        workingComponents,
        brokenComponents,
        recommendations
      };

      setStatus(apiStatus);
      console.log('✅ API Integration Status Check Complete');

    } catch (error) {
      console.error('❌ API Integration status check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkApiIntegrationStatus();
  }, []);

  return {
    status,
    isChecking,
    recheckStatus: checkApiIntegrationStatus
  };
};
