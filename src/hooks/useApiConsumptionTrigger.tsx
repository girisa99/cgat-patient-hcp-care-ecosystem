
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiConsumptionOrchestrator } from '@/utils/api/ApiConsumptionOrchestrator';
import type { ApiConsumptionConfig, ApiConsumptionResult } from '@/utils/api/ApiIntegrationTypes';

export interface OrchestrationResult {
  success: boolean;
  generatedSchemas: string[];
  generatedRLSPolicies: string[];
  generatedDataMappings: string[];
  registeredModules: string[];
  generatedTypeScriptTypes: string[];
  generatedDocumentation: boolean;
  timestamp: string;
}

export const useApiConsumptionTrigger = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [isManualTriggering, setIsManualTriggering] = useState(false);
  const [orchestrationResults, setOrchestrationResults] = useState<OrchestrationResult[]>([]);
  const { toast } = useToast();

  const triggerConsumption = useCallback(async (
    integrationId: string,
    config: ApiConsumptionConfig
  ): Promise<ApiConsumptionResult> => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Triggering API consumption for:', integrationId);
      
      // Simulate API consumption
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 1000));
      const responseTime = Date.now() - startTime;
      
      // Record metrics
      apiConsumptionOrchestrator.recordRequest(integrationId, true, responseTime);
      
      const result: ApiConsumptionResult = {
        success: true,
        data: { message: 'API consumption triggered successfully' },
        timestamp: new Date().toISOString()
      };
      
      toast({
        title: "API Consumption Triggered",
        description: "Successfully triggered API consumption workflow.",
      });
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Consumption Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
      
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const triggerManualOrchestration = useCallback(async (config: ApiConsumptionConfig) => {
    setIsManualTriggering(true);
    setIsOrchestrating(true);

    try {
      console.log('🎯 Triggering manual orchestration:', config);
      
      // Simulate orchestration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result: OrchestrationResult = {
        success: true,
        generatedSchemas: ['user_profiles', 'api_integrations', 'audit_logs'],
        generatedRLSPolicies: ['user_access_policy', 'admin_access_policy'],
        generatedDataMappings: ['user_mapping', 'facility_mapping'],
        registeredModules: ['UserManagement', 'FacilityManagement'],
        generatedTypeScriptTypes: ['ApiTypes', 'UserTypes', 'FacilityTypes'],
        generatedDocumentation: true,
        timestamp: new Date().toISOString()
      };

      setOrchestrationResults(prev => [...prev, result]);

      toast({
        title: "Manual Orchestration Complete",
        description: "Successfully orchestrated API integration setup.",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Orchestration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsManualTriggering(false);
      setIsOrchestrating(false);
    }
  }, [toast]);

  return {
    triggerConsumption,
    triggerManualOrchestration,
    isLoading,
    isOrchestrating,
    isManualTriggering,
    orchestrationResults
  };
};
