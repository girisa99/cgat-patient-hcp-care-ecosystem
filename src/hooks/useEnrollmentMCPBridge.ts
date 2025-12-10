/**
 * React hook for Enrollment MCP Bridge integration
 * Provides MCP tool access including real-time DB sync and CRM integration
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  getEnrollmentMCPBridge, 
  MCPBridgeConfig, 
  MCPToolResult,
  EnrollmentMCPBridge 
} from '@/services/enrollmentMCPBridge';
import { EnrollmentMCPContext, DBSyncResult, CRMSyncResult } from '@/integrations/mcp/enrollment-server';

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
  
  // Core Tools
  verifyNPI: (npi: string) => Promise<MCPToolResult>;
  validateInsurance: (data: { member_id: string; payer_name: string; group_number?: string }) => Promise<MCPToolResult>;
  checkCredentialing: (data: { provider_npi: string; specialty?: string }) => Promise<MCPToolResult>;
  getSmartRouting: (data: { current_section: string; completed_fields?: string[] }) => Promise<MCPToolResult>;
  trackAnalytics: (data: { session_id: string; event_type: string; metadata?: any }) => Promise<MCPToolResult>;
  executeTool: (toolName: string, args: any) => Promise<MCPToolResult>;
  
  // Real-time DB Sync
  syncSectionToDatabase: (enrollmentId: string, section: string, data: Record<string, any>) => Promise<DBSyncResult>;
  syncFieldToDatabase: (enrollmentId: string, section: string, fieldName: string, fieldValue: any) => Promise<DBSyncResult>;
  updateEnrollmentProgress: (enrollmentId: string, currentSection: string, progressPercentage: number, additionalData?: Record<string, any>) => Promise<DBSyncResult>;
  
  // CRM Integration
  syncToSalesforce: (enrollmentId: string, objectType: string, data: Record<string, any>) => Promise<CRMSyncResult>;
  syncToVeeva: (enrollmentId: string, objectType: string, data: Record<string, any>, territory?: string) => Promise<CRMSyncResult>;
  syncToHubSpot: (enrollmentId: string, objectType: string, data: Record<string, any>) => Promise<CRMSyncResult>;
  syncToConfiguredCRM: (enrollmentId: string, data: Record<string, any>, objectType?: string) => Promise<CRMSyncResult | null>;
  
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

  const getBridge = useCallback((): EnrollmentMCPBridge => {
    if (!bridgeRef.current) {
      bridgeRef.current = getEnrollmentMCPBridge(config);
    }
    return bridgeRef.current;
  }, [config]);

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

  useEffect(() => {
    if (autoInitialize) initialize();
  }, [autoInitialize, initialize]);

  useEffect(() => {
    if (context && isInitialized) {
      getBridge().setContext(context);
    }
  }, [context, isInitialized, getBridge]);

  const setContext = useCallback((ctx: EnrollmentMCPContext) => {
    if (isInitialized) getBridge().setContext(ctx);
  }, [getBridge, isInitialized]);

  const executeAndTrack = useCallback(async <T>(executor: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await executor();
      setExecutionHistory(getBridge().getExecutionHistory());
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [getBridge]);

  // Core tools
  const verifyNPI = useCallback((npi: string) => executeAndTrack(() => getBridge().verifyNPI(npi)), [executeAndTrack, getBridge]);
  
  const validateInsurance = useCallback((data: { member_id: string; payer_name: string; group_number?: string }) => 
    executeAndTrack(() => getBridge().validateInsurance(data)), [executeAndTrack, getBridge]);
  
  const checkCredentialing = useCallback((data: { provider_npi: string; specialty?: string }) => 
    executeAndTrack(() => getBridge().checkCredentialing(data)), [executeAndTrack, getBridge]);
  
  const getSmartRouting = useCallback((data: { current_section: string; completed_fields?: string[] }) => 
    executeAndTrack(() => getBridge().getSmartRouting(data)), [executeAndTrack, getBridge]);
  
  const trackAnalytics = useCallback((data: { session_id: string; event_type: string; metadata?: any }) => 
    executeAndTrack(() => getBridge().trackAnalytics(data)), [executeAndTrack, getBridge]);
  
  const executeTool = useCallback((toolName: string, args: any) => 
    executeAndTrack(() => getBridge().executeTool(toolName, args)), [executeAndTrack, getBridge]);

  // Real-time DB Sync
  const syncSectionToDatabase = useCallback((enrollmentId: string, section: string, data: Record<string, any>) => 
    executeAndTrack(() => getBridge().syncSectionToDatabase(enrollmentId, section, data)), [executeAndTrack, getBridge]);
  
  const syncFieldToDatabase = useCallback((enrollmentId: string, section: string, fieldName: string, fieldValue: any) => 
    executeAndTrack(() => getBridge().syncFieldToDatabase(enrollmentId, section, fieldName, fieldValue)), [executeAndTrack, getBridge]);
  
  const updateEnrollmentProgress = useCallback((enrollmentId: string, currentSection: string, progressPercentage: number, additionalData?: Record<string, any>) => 
    executeAndTrack(() => getBridge().updateEnrollmentProgress(enrollmentId, currentSection, progressPercentage, additionalData)), [executeAndTrack, getBridge]);

  // CRM Integration
  const syncToSalesforce = useCallback((enrollmentId: string, objectType: string, data: Record<string, any>) => 
    executeAndTrack(() => getBridge().syncToSalesforce(enrollmentId, objectType, data)), [executeAndTrack, getBridge]);
  
  const syncToVeeva = useCallback((enrollmentId: string, objectType: string, data: Record<string, any>, territory?: string) => 
    executeAndTrack(() => getBridge().syncToVeeva(enrollmentId, objectType, data, territory)), [executeAndTrack, getBridge]);
  
  const syncToHubSpot = useCallback((enrollmentId: string, objectType: string, data: Record<string, any>) => 
    executeAndTrack(() => getBridge().syncToHubSpot(enrollmentId, objectType, data)), [executeAndTrack, getBridge]);
  
  const syncToConfiguredCRM = useCallback((enrollmentId: string, data: Record<string, any>, objectType?: string) => 
    executeAndTrack(() => getBridge().syncToConfiguredCRM(enrollmentId, data, objectType)), [executeAndTrack, getBridge]);

  // Info methods
  const getAvailableTools = useCallback(() => getBridge().getAvailableTools(), [getBridge]);
  const getServerInfo = useCallback(() => getBridge().getServerInfo(), [getBridge]);
  const getPrompts = useCallback(() => getBridge().getPrompts(), [getBridge]);
  const getResources = useCallback(() => getBridge().getResources(), [getBridge]);
  const clearHistory = useCallback(() => { getBridge().clearHistory(); setExecutionHistory([]); }, [getBridge]);

  return {
    isInitialized, isLoading, error, executionHistory,
    initialize, setContext,
    verifyNPI, validateInsurance, checkCredentialing, getSmartRouting, trackAnalytics, executeTool,
    syncSectionToDatabase, syncFieldToDatabase, updateEnrollmentProgress,
    syncToSalesforce, syncToVeeva, syncToHubSpot, syncToConfiguredCRM,
    getAvailableTools, getServerInfo, getPrompts, getResources, clearHistory
  };
};

export default useEnrollmentMCPBridge;
