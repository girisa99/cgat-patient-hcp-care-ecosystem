/**
 * useMCPToolExecutor Hook
 * Frontend hook for invoking MCP tools via the mcp-tool-executor edge function.
 * Reads from mcp_servers table, executes tools via edge function proxy.
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface MCPHealthResult {
  status: 'healthy' | 'unhealthy';
  latency_ms: number;
  server_id: string;
  base_url: string;
  error?: string;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, any>;
}

export function useMCPToolExecutor() {
  const [loading, setLoading] = useState(false);
  const { showError } = useMasterToast();

  const invoke = useCallback(async (
    action: 'listTools' | 'executeTool' | 'healthCheck' | 'listResources',
    serverId: string,
    extra?: Record<string, unknown>
  ): Promise<any> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mcp-tool-executor', {
        body: { action, serverId, ...extra },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'MCP request failed');
      return data.data;
    } catch (err: any) {
      console.error('[MCP Tool Executor]', err);
      showError(err?.message || 'MCP tool execution failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const listTools = useCallback(async (serverId: string): Promise<MCPTool[]> => {
    const result = await invoke('listTools', serverId);
    return result?.tools || [];
  }, [invoke]);

  const executeTool = useCallback(async (
    serverId: string,
    toolName: string,
    toolArgs: Record<string, unknown> = {}
  ): Promise<any> => {
    return invoke('executeTool', serverId, { toolName, toolArgs });
  }, [invoke]);

  const healthCheck = useCallback(async (serverId: string): Promise<MCPHealthResult> => {
    return invoke('healthCheck', serverId);
  }, [invoke]);

  const listResources = useCallback(async (serverId: string, resourceUri?: string): Promise<any> => {
    return invoke('listResources', serverId, { resourceUri });
  }, [invoke]);

  return {
    loading,
    listTools,
    executeTool,
    healthCheck,
    listResources,
  };
}
