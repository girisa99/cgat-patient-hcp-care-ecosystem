import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HealthcareAIRequest {
  context: 'facility' | 'clinical' | 'compliance' | 'integration' | 'security' | 'general';
  query: string;
  facilityId?: string;
  includeContext?: string[];
}

export interface HealthcareAIResponse {
  success: boolean;
  response?: string;
  context?: string;
  metadata?: {
    model: string;
    context_items: number;
    timestamp: string;
  };
  error?: string;
}

export interface MCPRequest {
  method: string;
  params?: any;
}

export interface MCPResponse {
  id: string;
  type: string;
  method: string;
  result?: any;
  error?: any;
}

export const useHealthcareAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<HealthcareAIResponse | null>(null);

  const queryHealthcareAI = useCallback(async (request: HealthcareAIRequest): Promise<HealthcareAIResponse> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('healthcare-context-ai', {
        body: {
          ...request,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) {
        throw new Error(error.message || 'Healthcare AI query failed');
      }

      const response = data as HealthcareAIResponse;
      setLastResponse(response);

      if (response.success) {
        toast.success("Healthcare AI query processed successfully");
      } else {
        throw new Error(response.error || 'Unknown error');
      }

      return response;

    } catch (error: any) {
      const errorResponse: HealthcareAIResponse = {
        success: false,
        error: error.message || 'Healthcare AI query failed'
      };
      
      setLastResponse(errorResponse);
      
      toast.error(error.message || 'Failed to process healthcare query');

      return errorResponse;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const executeMCPRequest = useCallback(async (request: MCPRequest): Promise<MCPResponse> => {
    setIsLoading(true);
    
    try {
      const user = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('mcp-protocol-handler', {
        body: {
          message: {
            id: crypto.randomUUID(),
            type: 'request',
            method: request.method,
            params: request.params
          },
          context: {
            user_id: user.data.user?.id,
            session_id: crypto.randomUUID(),
            permissions: ['read', 'write'], // You may want to make this dynamic
            compliance_level: 'enhanced' as const
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'MCP request failed');
      }

      const response = data as MCPResponse;

      if (response.error) {
        throw new Error(response.error.message || 'MCP protocol error');
      }

      toast.success(`MCP Request Complete: ${request.method}`);

      return response;

    } catch (error: any) {
      toast.error(error.message || 'Failed to execute MCP request');

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Convenience methods for common healthcare queries
  const queryFacilities = useCallback((filters?: any) => {
    return executeMCPRequest({
      method: 'healthcare.facility.list',
      params: { filter: filters }
    });
  }, [executeMCPRequest]);

  const queryClinicalTrials = useCallback((filters?: any) => {
    return executeMCPRequest({
      method: 'healthcare.clinical.trials',
      params: { filter: filters }
    });
  }, [executeMCPRequest]);

  const checkComplianceStatus = useCallback((facilityId?: string, testType?: string) => {
    return executeMCPRequest({
      method: 'healthcare.compliance.status',
      params: { facility_id: facilityId, test_type: testType }
    });
  }, [executeMCPRequest]);

  const getAPIIntegrations = useCallback((status?: string) => {
    return executeMCPRequest({
      method: 'healthcare.api.integrations',
      params: { status }
    });
  }, [executeMCPRequest]);

  const getOnboardingStatus = useCallback((statusFilter?: string) => {
    return executeMCPRequest({
      method: 'healthcare.onboarding.status',
      params: { status_filter: statusFilter }
    });
  }, [executeMCPRequest]);

  const getSecurityEvents = useCallback((severityFilter?: string) => {
    return executeMCPRequest({
      method: 'healthcare.security.events',
      params: { severity_filter: severityFilter }
    });
  }, [executeMCPRequest]);

  const queryAuditLogs = useCallback((tableName?: string, actionFilter?: string) => {
    return executeMCPRequest({
      method: 'healthcare.audit.query',
      params: { table_name: tableName, action_filter: actionFilter }
    });
  }, [executeMCPRequest]);

  const executeTestSuite = useCallback((suiteType?: string, batchSize?: number) => {
    return executeMCPRequest({
      method: 'healthcare.test.execution',
      params: { suite_type: suiteType, batch_size: batchSize }
    });
  }, [executeMCPRequest]);

  return {
    // Core functions
    queryHealthcareAI,
    executeMCPRequest,
    
    // Convenience methods
    queryFacilities,
    queryClinicalTrials,
    checkComplianceStatus,
    getAPIIntegrations,
    getOnboardingStatus,
    getSecurityEvents,
    queryAuditLogs,
    executeTestSuite,
    
    // State
    isLoading,
    lastResponse
  };
};