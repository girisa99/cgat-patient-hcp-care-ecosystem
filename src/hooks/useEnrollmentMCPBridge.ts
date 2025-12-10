/**
 * React hook for Enrollment MCP Bridge integration
 * Provides MCP tool access within enrollment agent components
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  getEnrollmentMCPBridge, 
  MCPBridgeConfig, 
  MCPToolResult,
  EnrollmentMCPBridge 
} from '@/services/enrollmentMCPBridge';
import { EnrollmentMCPContext } from '@/integrations/mcp/enrollment-server';

interface UseEnrollmentMCPBridgeOptions {
  config?: MCPBridgeConfig;
  autoInitialize?: boolean;
  context?: EnrollmentMCPContext;
}

interface UseEnrollmentMCPBridgeReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  executionHistory: MCPToolResult[];
  
  // Actions
  initialize: () => Promise<void>;
  setContext: (context: EnrollmentMCPContext) => void;
  
  // Tools
  verifyNPI: (npi: string) => Promise<MCPToolResult>;
  validateInsurance: (data: {
    member_id: string;
    payer_name: string;
    group_number?: string;
    subscriber_dob?: string;
  }) => Promise<MCPToolResult>;
  checkCredentialing: (data: {
    provider_npi: string;
    specialty?: string;
    state?: string;
  }) => Promise<MCPToolResult>;
  getSmartRouting: (data: {
    current_section: string;
    completed_fields?: string[];
    patient_type?: 'new' | 'returning' | 'transfer';
  }) => Promise<MCPToolResult>;
  generateConsentForm: (data: {
    consent_type: 'hipaa' | 'treatment' | 'billing' | 'research' | 'telehealth';
    patient_name: string;
    facility_id?: string;
    language?: 'en' | 'es' | 'fr' | 'zh';
  }) => Promise<MCPToolResult>;
  trackAnalytics: (data: {
    session_id: string;
    event_type: 'step_started' | 'step_completed' | 'validation_error' | 'dropout' | 'completion';
    metadata?: any;
  }) => Promise<MCPToolResult>;
  executeTool: (toolName: string, args: any) => Promise<MCPToolResult>;
  
  // Info
  getAvailableTools: () => string[];
  getServerInfo: () => any;
  getPrompts: () => any[];
  getResources: () => any[];
  clearHistory: () => void;
}

export const useEnrollmentMCPBridge = (
  options: UseEnrollmentMCPBridgeOptions = {}
): UseEnrollmentMCPBridgeReturn => {
  const { config, autoInitialize = true, context } = options;
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionHistory, setExecutionHistory] = useState<MCPToolResult[]>([]);
  
  const bridgeRef = useRef<EnrollmentMCPBridge | null>(null);

  // Get or create bridge instance
  const getBridge = useCallback((): EnrollmentMCPBridge => {
    if (!bridgeRef.current) {
      bridgeRef.current = getEnrollmentMCPBridge(config);
    }
    return bridgeRef.current;
  }, [config]);

  // Initialize bridge
  const initialize = useCallback(async () => {
    if (isInitialized) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const bridge = getBridge();
      await bridge.initialize();
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize MCP bridge');
    } finally {
      setIsLoading(false);
    }
  }, [getBridge, isInitialized]);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  }, [autoInitialize, initialize]);

  // Update context when it changes
  useEffect(() => {
    if (context && isInitialized) {
      getBridge().setContext(context);
    }
  }, [context, isInitialized, getBridge]);

  // Set context
  const setContext = useCallback((ctx: EnrollmentMCPContext) => {
    if (isInitialized) {
      getBridge().setContext(ctx);
    }
  }, [getBridge, isInitialized]);

  // Helper to update history after tool execution
  const executeAndTrack = useCallback(async (
    executor: () => Promise<MCPToolResult>
  ): Promise<MCPToolResult> => {
    setIsLoading(true);
    try {
      const result = await executor();
      setExecutionHistory(getBridge().getExecutionHistory());
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [getBridge]);

  // Tool methods
  const verifyNPI = useCallback((npi: string) => {
    return executeAndTrack(() => getBridge().verifyNPI(npi));
  }, [executeAndTrack, getBridge]);

  const validateInsurance = useCallback((data: {
    member_id: string;
    payer_name: string;
    group_number?: string;
    subscriber_dob?: string;
  }) => {
    return executeAndTrack(() => getBridge().validateInsurance(data));
  }, [executeAndTrack, getBridge]);

  const checkCredentialing = useCallback((data: {
    provider_npi: string;
    specialty?: string;
    state?: string;
  }) => {
    return executeAndTrack(() => getBridge().checkCredentialing(data));
  }, [executeAndTrack, getBridge]);

  const getSmartRouting = useCallback((data: {
    current_section: string;
    completed_fields?: string[];
    patient_type?: 'new' | 'returning' | 'transfer';
  }) => {
    return executeAndTrack(() => getBridge().getSmartRouting(data));
  }, [executeAndTrack, getBridge]);

  const generateConsentForm = useCallback((data: {
    consent_type: 'hipaa' | 'treatment' | 'billing' | 'research' | 'telehealth';
    patient_name: string;
    facility_id?: string;
    language?: 'en' | 'es' | 'fr' | 'zh';
  }) => {
    return executeAndTrack(() => getBridge().generateConsentForm(data));
  }, [executeAndTrack, getBridge]);

  const trackAnalytics = useCallback((data: {
    session_id: string;
    event_type: 'step_started' | 'step_completed' | 'validation_error' | 'dropout' | 'completion';
    metadata?: any;
  }) => {
    return executeAndTrack(() => getBridge().trackAnalytics(data));
  }, [executeAndTrack, getBridge]);

  const executeTool = useCallback((toolName: string, args: any) => {
    return executeAndTrack(() => getBridge().executeTool(toolName, args));
  }, [executeAndTrack, getBridge]);

  // Info methods
  const getAvailableTools = useCallback(() => {
    return getBridge().getAvailableTools();
  }, [getBridge]);

  const getServerInfo = useCallback(() => {
    return getBridge().getServerInfo();
  }, [getBridge]);

  const getPrompts = useCallback(() => {
    return getBridge().getPrompts();
  }, [getBridge]);

  const getResources = useCallback(() => {
    return getBridge().getResources();
  }, [getBridge]);

  const clearHistory = useCallback(() => {
    getBridge().clearHistory();
    setExecutionHistory([]);
  }, [getBridge]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    executionHistory,
    
    // Actions
    initialize,
    setContext,
    
    // Tools
    verifyNPI,
    validateInsurance,
    checkCredentialing,
    getSmartRouting,
    generateConsentForm,
    trackAnalytics,
    executeTool,
    
    // Info
    getAvailableTools,
    getServerInfo,
    getPrompts,
    getResources,
    clearHistory
  };
};

export default useEnrollmentMCPBridge;
