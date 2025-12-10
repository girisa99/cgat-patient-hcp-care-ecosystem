/**
 * Enrollment MCP Bridge Service
 * Bridges between UniversalAI hook and MCP enrollment tools
 */

import { EnrollmentMCPServer, createEnrollmentMCPServer, EnrollmentMCPContext, EnrollmentMCPUtils } from '@/integrations/mcp/enrollment-server';

export interface MCPBridgeConfig {
  enableNPIVerification?: boolean;
  enableCredentialing?: boolean;
  enableInsuranceVerification?: boolean;
  enableSmartRouting?: boolean;
  enableAnalytics?: boolean;
}

export interface MCPToolResult {
  success: boolean;
  tool: string;
  result: any;
  error?: string;
  timestamp: string;
}

/**
 * Enrollment MCP Bridge
 * Provides a unified interface between enrollment agents and MCP tools
 */
class EnrollmentMCPBridge {
  private server: EnrollmentMCPServer;
  private config: MCPBridgeConfig;
  private isInitialized: boolean = false;
  private toolExecutionHistory: MCPToolResult[] = [];

  constructor(config: MCPBridgeConfig = {}) {
    this.config = {
      enableNPIVerification: true,
      enableCredentialing: true,
      enableInsuranceVerification: true,
      enableSmartRouting: true,
      enableAnalytics: true,
      ...config
    };

    this.server = createEnrollmentMCPServer({
      name: "enrollment-mcp-bridge",
      version: "1.0.0",
      description: "Bridge service connecting UniversalAI to enrollment MCP tools"
    });
  }

  /**
   * Initialize the bridge and start the MCP server
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    await this.server.start();
    this.isInitialized = true;
    console.log("✅ Enrollment MCP Bridge initialized");
  }

  /**
   * Update enrollment context
   */
  setContext(context: EnrollmentMCPContext): void {
    this.server.setContext(context);
  }

  /**
   * Get available tools based on configuration
   */
  getAvailableTools(): string[] {
    const tools: string[] = [];
    
    if (this.config.enableNPIVerification) tools.push('verify-npi');
    if (this.config.enableInsuranceVerification) tools.push('validate-insurance');
    if (this.config.enableCredentialing) tools.push('credentialing-check');
    if (this.config.enableSmartRouting) tools.push('smart-field-routing');
    if (this.config.enableAnalytics) tools.push('enrollment-analytics');
    
    tools.push('generate-consent-form'); // Always available
    
    return tools;
  }

  /**
   * Execute an MCP tool
   */
  async executeTool(toolName: string, args: any): Promise<MCPToolResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const availableTools = this.getAvailableTools();
    if (!availableTools.includes(toolName)) {
      const result: MCPToolResult = {
        success: false,
        tool: toolName,
        result: null,
        error: `Tool "${toolName}" is not enabled in current configuration`,
        timestamp: new Date().toISOString()
      };
      this.toolExecutionHistory.push(result);
      return result;
    }

    try {
      const toolResult = await this.server.executeTool(toolName, args);
      const result: MCPToolResult = {
        success: true,
        tool: toolName,
        result: toolResult,
        timestamp: new Date().toISOString()
      };
      this.toolExecutionHistory.push(result);
      return result;
    } catch (error) {
      const result: MCPToolResult = {
        success: false,
        tool: toolName,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      this.toolExecutionHistory.push(result);
      return result;
    }
  }

  /**
   * Verify NPI number
   */
  async verifyNPI(npi: string): Promise<MCPToolResult> {
    return this.executeTool('verify-npi', { npi, include_details: true });
  }

  /**
   * Validate insurance information
   */
  async validateInsurance(data: {
    member_id: string;
    payer_name: string;
    group_number?: string;
    subscriber_dob?: string;
  }): Promise<MCPToolResult> {
    return this.executeTool('validate-insurance', data);
  }

  /**
   * Check provider credentialing
   */
  async checkCredentialing(data: {
    provider_npi: string;
    specialty?: string;
    state?: string;
  }): Promise<MCPToolResult> {
    return this.executeTool('credentialing-check', data);
  }

  /**
   * Get smart field routing recommendations
   */
  async getSmartRouting(data: {
    current_section: string;
    completed_fields?: string[];
    patient_type?: 'new' | 'returning' | 'transfer';
  }): Promise<MCPToolResult> {
    return this.executeTool('smart-field-routing', data);
  }

  /**
   * Generate consent form
   */
  async generateConsentForm(data: {
    consent_type: 'hipaa' | 'treatment' | 'billing' | 'research' | 'telehealth';
    patient_name: string;
    facility_id?: string;
    language?: 'en' | 'es' | 'fr' | 'zh';
  }): Promise<MCPToolResult> {
    return this.executeTool('generate-consent-form', data);
  }

  /**
   * Track enrollment analytics event
   */
  async trackAnalytics(data: {
    session_id: string;
    event_type: 'step_started' | 'step_completed' | 'validation_error' | 'dropout' | 'completion';
    metadata?: any;
  }): Promise<MCPToolResult> {
    return this.executeTool('enrollment-analytics', data);
  }

  /**
   * Get tool execution history
   */
  getExecutionHistory(): MCPToolResult[] {
    return [...this.toolExecutionHistory];
  }

  /**
   * Clear tool execution history
   */
  clearHistory(): void {
    this.toolExecutionHistory = [];
  }

  /**
   * Get server info
   */
  getServerInfo() {
    return this.server.getServerInfo();
  }

  /**
   * Get available prompts for AI guidance
   */
  getPrompts() {
    return this.server.getPrompts();
  }

  /**
   * Get available resources
   */
  getResources() {
    return this.server.getResources();
  }

  /**
   * Shutdown the bridge
   */
  async shutdown(): Promise<void> {
    await this.server.stop();
    this.isInitialized = false;
    console.log("🛑 Enrollment MCP Bridge shutdown");
  }
}

// Singleton instance
let bridgeInstance: EnrollmentMCPBridge | null = null;

/**
 * Get or create the enrollment MCP bridge instance
 */
export const getEnrollmentMCPBridge = (config?: MCPBridgeConfig): EnrollmentMCPBridge => {
  if (!bridgeInstance) {
    bridgeInstance = new EnrollmentMCPBridge(config);
  }
  return bridgeInstance;
};

/**
 * Reset the bridge instance (for testing)
 */
export const resetEnrollmentMCPBridge = (): void => {
  if (bridgeInstance) {
    bridgeInstance.shutdown();
    bridgeInstance = null;
  }
};

export { EnrollmentMCPBridge, EnrollmentMCPUtils };
