/**
 * React Hook for Model Routing and Management
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  UserModelPreferences, 
  ModelConfig, 
  ModelRoutingRule,
  ModelMetrics,
  ALL_MODELS 
} from '@/types/ModelTypes';
import { ModelRoutingService, ModelRequest, ModelResponse } from '@/services/ModelRoutingService';
import { supabase } from '@/integrations/supabase/client';

export interface UseModelRoutingReturn {
  // State
  preferences: UserModelPreferences | null;
  routingRules: ModelRoutingRule[];
  modelMetrics: ModelMetrics[];
  isLoading: boolean;
  
  // Actions
  selectModel: (request: ModelRequest) => Promise<ModelResponse>;
  updatePreferences: (preferences: UserModelPreferences) => Promise<void>;
  addRoutingRule: (rule: Omit<ModelRoutingRule, 'id'>) => Promise<void>;
  updateRoutingRule: (id: string, updates: Partial<ModelRoutingRule>) => Promise<void>;
  deleteRoutingRule: (id: string) => Promise<void>;
  recordModelUsage: (modelId: string, success: boolean, latency: number, tokenCount: number, userRating?: number) => Promise<void>;
  
  // Utilities
  getAvailableModels: () => ModelConfig[];
  getModelsByCapability: (capability: string) => ModelConfig[];
  testModelRouting: (request: ModelRequest) => ModelResponse;
}

export const useModelRouting = (): UseModelRoutingReturn => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserModelPreferences | null>(null);
  const [routingRules, setRoutingRules] = useState<ModelRoutingRule[]>([]);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routingService, setRoutingService] = useState<ModelRoutingService | null>(null);

  // Initialize routing service when dependencies change
  useEffect(() => {
    if (preferences) {
      const service = new ModelRoutingService(preferences, routingRules, modelMetrics);
      setRoutingService(service);
    }
  }, [preferences, routingRules, modelMetrics]);

  // Load initial data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // For now, use localStorage until database tables are created
      const savedPrefs = localStorage.getItem('model-preferences');
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      } else {
        // Create default preferences
        const defaultPrefs: UserModelPreferences = {
          userId: 'current-user',
          preferredModels: {
            chat: 'phi-3-mini',
            code: 'phi-3-mini',
            medical: 'gpt-4o-mini',
            embeddings: 'distilbert-base',
            classification: 'distilbert-base'
          },
          fallbackStrategy: 'local-first',
          maxCostPerRequest: 0.01,
          allowLocalModels: true,
          performancePreference: 'speed',
          autoDownloadModels: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setPreferences(defaultPrefs);
        localStorage.setItem('model-preferences', JSON.stringify(defaultPrefs));
      }

      // Load routing rules from localStorage
      const savedRules = localStorage.getItem('model-routing-rules');
      if (savedRules) {
        setRoutingRules(JSON.parse(savedRules));
      }

      // Load model metrics from localStorage
      const savedMetrics = localStorage.getItem('model-metrics');
      if (savedMetrics) {
        setModelMetrics(JSON.parse(savedMetrics));
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load model preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectModel = useCallback(async (request: ModelRequest): Promise<ModelResponse> => {
    if (!routingService) {
      throw new Error('Routing service not initialized');
    }
    
    try {
      const response = routingService.selectModel(request);
      
      // Log the model selection for analytics
      console.log('Model selected:', {
        request,
        selectedModel: response.selectedModel.name,
        reasoning: response.reasoning
      });
      
      return response;
    } catch (error) {
      console.error('Error selecting model:', error);
      toast({
        title: "Model Selection Error", 
        description: "Failed to select appropriate model",
        variant: "destructive",
      });
      throw error;
    }
  }, [routingService, toast]);

  const updatePreferences = useCallback(async (newPreferences: UserModelPreferences) => {
    try {
      // Save to localStorage for now
      localStorage.setItem('model-preferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
      
      toast({
        title: "Preferences Updated",
        description: "Your model preferences have been saved",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    }
  }, [toast]);

  const addRoutingRule = useCallback(async (rule: Omit<ModelRoutingRule, 'id'>) => {
    try {
      const newRule = {
        ...rule,
        id: crypto.randomUUID()
      };
      
      // Save to localStorage for now
      const updatedRules = [...routingRules, newRule];
      localStorage.setItem('model-routing-rules', JSON.stringify(updatedRules));
      setRoutingRules(updatedRules);
      
      toast({
        title: "Routing Rule Added",
        description: `Rule "${rule.name}" has been created`,
      });
    } catch (error) {
      console.error('Error adding routing rule:', error);
      toast({
        title: "Error",
        description: "Failed to add routing rule",
        variant: "destructive",
      });
    }
  }, [routingRules, toast]);

  const updateRoutingRule = useCallback(async (id: string, updates: Partial<ModelRoutingRule>) => {
    try {
      const updatedRules = routingRules.map(rule => 
        rule.id === id ? { ...rule, ...updates } : rule
      );
      localStorage.setItem('model-routing-rules', JSON.stringify(updatedRules));
      setRoutingRules(updatedRules);
      
      toast({
        title: "Routing Rule Updated",
        description: "Rule has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating routing rule:', error);
      toast({
        title: "Error",
        description: "Failed to update routing rule",
        variant: "destructive",
      });
    }
  }, [routingRules, toast]);

  const deleteRoutingRule = useCallback(async (id: string) => {
    try {
      const updatedRules = routingRules.filter(rule => rule.id !== id);
      localStorage.setItem('model-routing-rules', JSON.stringify(updatedRules));
      setRoutingRules(updatedRules);
      
      toast({
        title: "Routing Rule Deleted",
        description: "Rule has been removed",
      });
    } catch (error) {
      console.error('Error deleting routing rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete routing rule",
        variant: "destructive",
      });
    }
  }, [routingRules, toast]);

  const recordModelUsage = useCallback(async (
    modelId: string, 
    success: boolean, 
    latency: number, 
    tokenCount: number,
    userRating?: number
  ) => {
    try {
      // Update local routing service
      if (routingService) {
        routingService.updateModelMetrics(modelId, success, latency, tokenCount, userRating);
      }
      
      // Save to localStorage for now
      const existingMetric = modelMetrics.find(m => m.modelId === modelId);
      
      if (existingMetric) {
        const totalRequests = existingMetric.totalRequests + 1;
        const successRate = success 
          ? (existingMetric.successRate * existingMetric.totalRequests + 100) / totalRequests
          : (existingMetric.successRate * existingMetric.totalRequests) / totalRequests;
        
        const updatedMetrics = {
          ...existingMetric,
          totalRequests,
          successRate,
          averageLatency: (existingMetric.averageLatency * existingMetric.totalRequests + latency) / totalRequests,
          averageTokensPerRequest: (existingMetric.averageTokensPerRequest * existingMetric.totalRequests + tokenCount) / totalRequests,
          lastUsed: new Date().toISOString(),
          errorCount: success ? existingMetric.errorCount : existingMetric.errorCount + 1,
          userSatisfactionScore: userRating ? 
            (existingMetric.userSatisfactionScore + userRating) / 2 : 
            existingMetric.userSatisfactionScore
        };
        
        const updatedMetricsList = modelMetrics.map(m => m.modelId === modelId ? updatedMetrics : m);
        localStorage.setItem('model-metrics', JSON.stringify(updatedMetricsList));
        setModelMetrics(updatedMetricsList);
      } else {
        const newMetrics: ModelMetrics = {
          modelId,
          totalRequests: 1,
          successRate: success ? 100 : 0,
          averageLatency: latency,
          averageTokensPerRequest: tokenCount,
          totalCost: 0,
          lastUsed: new Date().toISOString(),
          errorCount: success ? 0 : 1,
          userSatisfactionScore: userRating || 5
        };
        
        const updatedMetricsList = [...modelMetrics, newMetrics];
        localStorage.setItem('model-metrics', JSON.stringify(updatedMetricsList));
        setModelMetrics(updatedMetricsList);
      }
    } catch (error) {
      console.error('Error recording model usage:', error);
    }
  }, [routingService, modelMetrics]);

  const getAvailableModels = useCallback(() => {
    return ALL_MODELS;
  }, []);

  const getModelsByCapability = useCallback((capability: string) => {
    return ALL_MODELS.filter(model => model.capabilities.includes(capability as any));
  }, []);

  const testModelRouting = useCallback((request: ModelRequest): ModelResponse => {
    if (!routingService) {
      throw new Error('Routing service not initialized');
    }
    return routingService.selectModel(request);
  }, [routingService]);

  return {
    preferences,
    routingRules,
    modelMetrics,
    isLoading,
    selectModel,
    updatePreferences,
    addRoutingRule,
    updateRoutingRule,
    deleteRoutingRule,
    recordModelUsage,
    getAvailableModels,
    getModelsByCapability,
    testModelRouting
  };
};