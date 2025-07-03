
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiConsumptionOrchestrator } from '@/utils/api/ApiConsumptionOrchestrator';
import type { ApiConsumptionConfig, ApiConsumptionResult } from '@/utils/api/ApiIntegrationTypes';

export const useApiConsumptionTrigger = () => {
  const [isLoading, setIsLoading] = useState(false);
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

  return {
    triggerConsumption,
    isLoading
  };
};
