/**
 * Demo Mode Hook
 * Manages demo mode state and provides demo-specific functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useMasterAuth } from './useMasterAuth';
import { demoDataService } from '@/services/demoDataService';
import { DemoConfig, DemoMode, DEMO_FEATURES, DemoFeatureKey } from '@/types/demoTypes';
import { useToast } from './use-toast';

const DEFAULT_DEMO_CONFIG: DemoConfig = {
  mode: 'full',
  allowDataEntry: false,
  showDemoIndicators: true,
  mockDataEnabled: true,
  guidedTourEnabled: true,
  restrictedFeatures: ['user_create', 'user_delete', 'data_export']
};

export const useDemoMode = () => {
  const { userRoles, user } = useMasterAuth();
  const { toast } = useToast();
  const [demoConfig, setDemoConfig] = useState<DemoConfig>(DEFAULT_DEMO_CONFIG);
  const [mockData, setMockData] = useState<any>(null);
  const [isLoadingMockData, setIsLoadingMockData] = useState(false);

  // Check if user has demo role
  const isDemoUser = userRoles.some(role => 
    ['demo_user', 'demo_admin', 'demo_superadmin'].includes(role)
  );

  // Check if demo mode is active
  const isDemoMode = isDemoUser || demoConfig.mode !== 'disabled';

  // Initialize demo mode
  useEffect(() => {
    if (isDemoUser) {
      const userRole = userRoles.find(role => role.startsWith('demo_'));
      
      // Configure demo mode based on user role
      const config: DemoConfig = {
        ...DEFAULT_DEMO_CONFIG,
        mode: userRole === 'demo_superadmin' ? 'full' : 'read-only',
        allowDataEntry: userRole === 'demo_admin' || userRole === 'demo_superadmin',
        guidedTourEnabled: userRole === 'demo_user'
      };
      
      setDemoConfig(config);
      loadMockData();
    }
  }, [isDemoUser, userRoles]);

  // Load mock data
  const loadMockData = useCallback(async () => {
    if (!isDemoMode) return;
    
    setIsLoadingMockData(true);
    try {
      // Simulate API delay for realistic demo experience
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const data = demoDataService.generateAllMockData();
      setMockData(data);
      
      console.log('🎭 Demo Mode: Mock data loaded', {
        totalRecords: data.metadata.total_records,
        categories: Object.keys(data).filter(key => key !== 'metadata').length
      });
      
    } catch (error) {
      console.error('Failed to load demo data:', error);
      toast({
        title: "Demo Mode Warning",
        description: "Failed to load demo data. Some features may not work correctly.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMockData(false);
    }
  }, [isDemoMode, toast]);

  // Check if a feature is enabled in demo mode
  const isFeatureEnabled = useCallback((featureKey: DemoFeatureKey, action?: string) => {
    if (!isDemoMode) return true;
    
    const feature = DEMO_FEATURES[featureKey];
    if (!feature.enabled) return false;
    
    if (action) {
      const actionKey = `can${action.charAt(0).toUpperCase()}${action.slice(1)}` as keyof typeof feature;
      return feature[actionKey] === true;
    }
    
    return true;
  }, [isDemoMode]);

  // Show demo restriction message
  const showDemoRestriction = useCallback((action: string) => {
    toast({
      title: "🎭 Demo Mode Restriction",
      description: `${action} is not available in demo mode. This protects our demo data.`,
      variant: "default",
    });
  }, [toast]);

  // Simulate API response for demo
  const simulateApiResponse = useCallback((endpoint: string, method: string = 'GET') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Demo API response for ${method} ${endpoint}`,
          data: { demo: true, timestamp: new Date().toISOString() },
          mock: true
        });
      }, faker.number.int({ min: 200, max: 1500 }));
    });
  }, []);

  // Get mock data by category
  const getMockData = useCallback((category: string) => {
    if (!mockData || !isDemoMode) return [];
    return mockData[category] || [];
  }, [mockData, isDemoMode]);

  // Demo-safe action wrapper
  const demoSafeAction = useCallback((
    action: () => void | Promise<void>,
    actionName: string,
    allowInDemo: boolean = false
  ) => {
    if (isDemoMode && !allowInDemo && !demoConfig.allowDataEntry) {
      showDemoRestriction(actionName);
      return Promise.resolve();
    }
    return action();
  }, [isDemoMode, demoConfig.allowDataEntry, showDemoRestriction]);

  // Reset demo data
  const resetDemoData = useCallback(() => {
    if (isDemoMode) {
      loadMockData();
      toast({
        title: "🎭 Demo Data Reset",
        description: "Demo data has been refreshed with new sample information.",
        variant: "default",
      });
    }
  }, [isDemoMode, loadMockData, toast]);

  return {
    // State
    isDemoMode,
    isDemoUser,
    demoConfig,
    mockData,
    isLoadingMockData,
    
    // Feature checks
    isFeatureEnabled,
    
    // Actions
    showDemoRestriction,
    simulateApiResponse,
    getMockData,
    demoSafeAction,
    resetDemoData,
    
    // Utilities
    demoIndicator: isDemoMode ? '🎭 DEMO' : null,
    
    // Meta
    meta: {
      hookName: 'useDemoMode',
      version: '1.0.0',
      demoModeActive: isDemoMode,
      userRole: userRoles.find(role => role.startsWith('demo_')) || 'none',
      totalMockRecords: mockData?.metadata?.total_records || 0
    }
  };
};

// Import faker for simulate API response
import { faker } from '@faker-js/faker';