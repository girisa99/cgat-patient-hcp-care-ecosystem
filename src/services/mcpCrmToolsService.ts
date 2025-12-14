/**
 * MCP CRM Tools Service
 * 
 * Client-side service for interacting with MCP CRM tools following proper JSON-RPC protocol.
 * Handles tool discovery, execution, and confirmation flow.
 */

import { supabase } from '@/integrations/supabase/client';

// MCP Tool interface
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

// Tool execution result
export interface MCPToolResult {
  success: boolean;
  mock?: boolean;
  id?: string;
  message?: string;
  error?: string;
  sobject?: string;
  objectType?: string;
}

// JSON-RPC request/response types
interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id: string | number;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

class MCPCrmToolsService {
  private requestId = 0;
  private cachedTools: MCPTool[] | null = null;

  /**
   * Generate unique request ID
   */
  private getRequestId(): number {
    return ++this.requestId;
  }

  /**
   * Execute JSON-RPC call to MCP CRM tools edge function
   */
  private async executeRpc(method: string, params?: any): Promise<JsonRpcResponse> {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: this.getRequestId()
    };

    console.log('[MCP-CRM-Client] Sending request:', request);

    const { data, error } = await supabase.functions.invoke('mcp-crm-tools', {
      body: request
    });

    if (error) {
      console.error('[MCP-CRM-Client] RPC error:', error);
      throw new Error(error.message);
    }

    console.log('[MCP-CRM-Client] Received response:', data);
    return data as JsonRpcResponse;
  }

  /**
   * Step A: Discover available tools from MCP server
   */
  async discoverTools(): Promise<MCPTool[]> {
    if (this.cachedTools) {
      return this.cachedTools;
    }

    const response = await this.executeRpc('tools/list');
    
    if (response.error) {
      throw new Error(response.error.message);
    }

    this.cachedTools = response.result?.tools || [];
    console.log('[MCP-CRM-Client] Discovered tools:', this.cachedTools);
    
    return this.cachedTools;
  }

  /**
   * Step B: Execute a specific tool with arguments
   */
  async executeTool(toolName: string, args: Record<string, any>): Promise<MCPToolResult> {
    console.log(`[MCP-CRM-Client] Executing tool: ${toolName}`, args);

    const response = await this.executeRpc('tools/call', {
      name: toolName,
      arguments: args
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message
      };
    }

    // Parse result from MCP response
    const content = response.result?.content?.[0];
    if (content?.type === 'text') {
      try {
        return JSON.parse(content.text);
      } catch {
        return { success: true, message: content.text };
      }
    }

    return { success: true, message: 'Operation completed' };
  }

  /**
   * Insert record into Salesforce
   */
  async insertSalesforceRecord(sobject: string, fields: Record<string, any>): Promise<MCPToolResult> {
    return this.executeTool('insert_salesforce_record', { sobject, fields });
  }

  /**
   * Update record in Salesforce
   */
  async updateSalesforceRecord(sobject: string, recordId: string, fields: Record<string, any>): Promise<MCPToolResult> {
    return this.executeTool('update_salesforce_record', { sobject, recordId, fields });
  }

  /**
   * Create contact in HubSpot
   */
  async createHubSpotContact(properties: Record<string, any>): Promise<MCPToolResult> {
    return this.executeTool('create_hubspot_contact', { properties });
  }

  /**
   * Create deal in HubSpot
   */
  async createHubSpotDeal(properties: Record<string, any>, associations?: any[]): Promise<MCPToolResult> {
    return this.executeTool('create_hubspot_deal', { properties, associations });
  }

  /**
   * Create record in Veeva Vault
   */
  async createVeevaRecord(objectType: string, fields: Record<string, any>): Promise<MCPToolResult> {
    return this.executeTool('create_veeva_record', { objectType, fields });
  }

  /**
   * High-level export function that routes to appropriate CRM
   */
  async exportToCrm(
    target: 'salesforce' | 'hubspot' | 'veeva',
    data: Record<string, any>,
    options?: {
      sobject?: string;
      objectType?: string;
      recordId?: string;
      operation?: 'create' | 'update';
    }
  ): Promise<MCPToolResult> {
    const { sobject, objectType, recordId, operation = 'create' } = options || {};

    switch (target) {
      case 'salesforce':
        if (operation === 'update' && recordId) {
          return this.updateSalesforceRecord(sobject || 'Custom_Object__c', recordId, data);
        }
        return this.insertSalesforceRecord(sobject || 'Custom_Object__c', data);

      case 'hubspot':
        // Determine if it's a contact or deal based on data
        if (data.dealname || data.amount) {
          return this.createHubSpotDeal(data);
        }
        return this.createHubSpotContact(data);

      case 'veeva':
        return this.createVeevaRecord(objectType || 'document__v', data);

      default:
        return { success: false, error: `Unknown CRM target: ${target}` };
    }
  }

  /**
   * Clear cached tools (useful when server tools may have changed)
   */
  clearCache(): void {
    this.cachedTools = null;
  }
}

export const mcpCrmToolsService = new MCPCrmToolsService();
