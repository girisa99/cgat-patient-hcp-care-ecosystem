/**
 * Enrollment MCP Bridge Service
 * Bridges between UniversalAI hook and MCP enrollment tools
 * Includes real-time DB sync and CRM integration (Salesforce, Veeva, HubSpot)
 */

import { 
  EnrollmentMCPServer, 
  createEnrollmentMCPServer, 
  EnrollmentMCPContext,
  DBSyncResult,
  CRMSyncResult,
  SECTION_TABLE_MAPPING 
} from '@/integrations/mcp/enrollment-server';
import { supabase } from '@/integrations/supabase/client';
import { enrollmentTableMappings, saveEnrollmentSection } from '@/components/patient-enrollment/EnrollmentFieldMapper';

export interface MCPBridgeConfig {
  enableNPIVerification?: boolean;
  enableCredentialing?: boolean;
  enableInsuranceVerification?: boolean;
  enableSmartRouting?: boolean;
  enableAnalytics?: boolean;
  enableDBSync?: boolean;
  enableCRMSync?: boolean;
  crmType?: 'salesforce' | 'veeva' | 'hubspot' | 'none';
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
      enableDBSync: true,
      enableCRMSync: false,
      crmType: 'none',
      ...config
    };

    this.server = createEnrollmentMCPServer({
      name: "enrollment-mcp-bridge",
      version: "1.0.0",
      description: "Bridge service connecting UniversalAI to enrollment MCP tools with DB and CRM sync"
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await this.server.start();
    this.isInitialized = true;
    console.log("✅ Enrollment MCP Bridge initialized with DB sync and CRM integration");
  }

  setContext(context: EnrollmentMCPContext): void {
    this.server.setContext(context);
  }

  getAvailableTools(): string[] {
    const tools: string[] = [];
    if (this.config.enableNPIVerification) tools.push('verify-npi');
    if (this.config.enableInsuranceVerification) tools.push('validate-insurance');
    if (this.config.enableCredentialing) tools.push('credentialing-check');
    if (this.config.enableSmartRouting) tools.push('smart-field-routing');
    if (this.config.enableAnalytics) tools.push('enrollment-analytics');
    if (this.config.enableDBSync) {
      tools.push('sync-section-to-db', 'sync-field-to-db');
    }
    if (this.config.enableCRMSync) {
      tools.push('sync-to-salesforce', 'sync-to-veeva', 'sync-to-hubspot', 'get-crm-record');
    }
    return tools;
  }

  async executeTool(toolName: string, args: any): Promise<MCPToolResult> {
    if (!this.isInitialized) await this.initialize();

    try {
      const toolResult = await this.server.executeTool(toolName, args);
      const result: MCPToolResult = { success: true, tool: toolName, result: toolResult, timestamp: new Date().toISOString() };
      this.toolExecutionHistory.push(result);
      return result;
    } catch (error) {
      const result: MCPToolResult = {
        success: false, tool: toolName, result: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      this.toolExecutionHistory.push(result);
      return result;
    }
  }

  // ===== Real-time DB Sync Methods =====

  /**
   * Sync entire section data to Supabase database
   */
  async syncSectionToDatabase(
    enrollmentId: string,
    section: string,
    data: Record<string, any>
  ): Promise<DBSyncResult> {
    console.log(`📊 Syncing section ${section} to database for enrollment ${enrollmentId}`);
    
    try {
      // Use the EnrollmentFieldMapper for proper field mapping
      const tableName = SECTION_TABLE_MAPPING[section];
      if (!tableName) {
        return { success: false, table: section, operation: 'upsert', error: `Unknown section: ${section}`, syncedAt: new Date().toISOString() };
      }

      // Transform and save using existing mapper
      const saveResult = await saveEnrollmentSection(enrollmentId, tableName.replace('enrollment_', ''), data);
      
      if (!saveResult.success) {
        return { success: false, table: tableName, operation: 'upsert', error: saveResult.error, syncedAt: new Date().toISOString() };
      }

      // Also execute MCP tool for tracking
      await this.executeTool('sync-section-to-db', { enrollment_id: enrollmentId, section, data, operation: 'upsert' });

      return { success: true, table: tableName, operation: 'upsert', recordId: enrollmentId, syncedAt: new Date().toISOString() };
    } catch (error) {
      console.error('DB sync error:', error);
      return { success: false, table: section, operation: 'upsert', error: error instanceof Error ? error.message : 'Unknown error', syncedAt: new Date().toISOString() };
    }
  }

  /**
   * Sync individual field value to database immediately
   */
  async syncFieldToDatabase(
    enrollmentId: string,
    section: string,
    fieldName: string,
    fieldValue: any
  ): Promise<DBSyncResult> {
    console.log(`📝 Syncing field ${fieldName} to database for enrollment ${enrollmentId}`);
    
    try {
      const tableName = SECTION_TABLE_MAPPING[section];
      if (!tableName) {
        return { success: false, table: section, operation: 'update', error: `Unknown section: ${section}`, syncedAt: new Date().toISOString() };
      }

      // Get field mapping
      const mapping = enrollmentTableMappings[tableName.replace('enrollment_', '')];
      const fieldConfig = mapping?.fields?.[fieldName];
      const columnName = fieldConfig?.column || fieldName;

      // Update single field in database
      const { error } = await supabase
        .from(tableName as any)
        .update({ [columnName]: fieldValue, updated_at: new Date().toISOString() })
        .eq('enrollment_id', enrollmentId);

      if (error) {
        console.error('Field sync error:', error);
        return { success: false, table: tableName, operation: 'update', error: error.message, syncedAt: new Date().toISOString() };
      }

      // Track via MCP tool
      await this.executeTool('sync-field-to-db', { enrollment_id: enrollmentId, section, field_name: fieldName, field_value: fieldValue });

      return { success: true, table: tableName, operation: 'update', recordId: enrollmentId, syncedAt: new Date().toISOString() };
    } catch (error) {
      return { success: false, table: section, operation: 'update', error: error instanceof Error ? error.message : 'Unknown error', syncedAt: new Date().toISOString() };
    }
  }

  /**
   * Update enrollment progress in real-time
   */
  async updateEnrollmentProgress(
    enrollmentId: string,
    currentSection: string,
    progressPercentage: number,
    additionalData?: Record<string, any>
  ): Promise<DBSyncResult> {
    try {
      const { error } = await supabase
        .from('patient_enrollments')
        .update({
          current_section: currentSection,
          progress_percentage: progressPercentage,
          updated_at: new Date().toISOString(),
          ...(additionalData || {})
        })
        .eq('id', enrollmentId);

      if (error) throw error;

      return { success: true, table: 'patient_enrollments', operation: 'update', recordId: enrollmentId, syncedAt: new Date().toISOString() };
    } catch (error) {
      return { success: false, table: 'patient_enrollments', operation: 'update', error: error instanceof Error ? error.message : 'Unknown error', syncedAt: new Date().toISOString() };
    }
  }

  // ===== CRM Integration Methods =====

  /**
   * Sync enrollment data to Salesforce
   */
  async syncToSalesforce(
    enrollmentId: string,
    objectType: string,
    data: Record<string, any>,
    operation: 'create' | 'update' | 'upsert' = 'upsert'
  ): Promise<CRMSyncResult> {
    console.log(`☁️ Syncing enrollment ${enrollmentId} to Salesforce ${objectType}`);
    
    // Execute MCP tool (in production, this would call actual Salesforce API)
    const result = await this.executeTool('sync-to-salesforce', { enrollment_id: enrollmentId, object_type: objectType, data, operation });
    
    if (!result.success) {
      return { success: false, crmType: 'salesforce', error: result.error, syncedAt: new Date().toISOString() };
    }

    // Log CRM sync to database for audit trail
    await this.logCRMSync(enrollmentId, 'salesforce', objectType, result.result?.recordId);

    return { success: true, crmType: 'salesforce', recordId: result.result?.recordId, syncedAt: new Date().toISOString() };
  }

  /**
   * Sync enrollment data to Veeva CRM
   */
  async syncToVeeva(
    enrollmentId: string,
    objectType: string,
    data: Record<string, any>,
    territory?: string
  ): Promise<CRMSyncResult> {
    console.log(`💊 Syncing enrollment ${enrollmentId} to Veeva ${objectType}`);
    
    const result = await this.executeTool('sync-to-veeva', { enrollment_id: enrollmentId, object_type: objectType, data, territory });
    
    if (!result.success) {
      return { success: false, crmType: 'veeva', error: result.error, syncedAt: new Date().toISOString() };
    }

    await this.logCRMSync(enrollmentId, 'veeva', objectType, result.result?.recordId);

    return { success: true, crmType: 'veeva', recordId: result.result?.recordId, syncedAt: new Date().toISOString() };
  }

  /**
   * Sync enrollment data to HubSpot
   */
  async syncToHubSpot(
    enrollmentId: string,
    objectType: string,
    data: Record<string, any>
  ): Promise<CRMSyncResult> {
    console.log(`🟠 Syncing enrollment ${enrollmentId} to HubSpot ${objectType}`);
    
    const result = await this.executeTool('sync-to-hubspot', { enrollment_id: enrollmentId, object_type: objectType, data });
    
    if (!result.success) {
      return { success: false, crmType: 'hubspot', error: result.error, syncedAt: new Date().toISOString() };
    }

    await this.logCRMSync(enrollmentId, 'hubspot', objectType, result.result?.recordId);

    return { success: true, crmType: 'hubspot', recordId: result.result?.recordId, syncedAt: new Date().toISOString() };
  }

  /**
   * Sync to configured CRM based on bridge config
   */
  async syncToConfiguredCRM(
    enrollmentId: string,
    data: Record<string, any>,
    objectType?: string
  ): Promise<CRMSyncResult | null> {
    if (!this.config.enableCRMSync || this.config.crmType === 'none') {
      return null;
    }

    switch (this.config.crmType) {
      case 'salesforce':
        return this.syncToSalesforce(enrollmentId, objectType || 'Lead', data);
      case 'veeva':
        return this.syncToVeeva(enrollmentId, objectType || 'Patient_vod__c', data);
      case 'hubspot':
        return this.syncToHubSpot(enrollmentId, objectType || 'contacts', data);
      default:
        return null;
    }
  }

  private async logCRMSync(enrollmentId: string, crmType: string, objectType: string, recordId?: string): Promise<void> {
    try {
      // Log to enrollment_real_time_sync table if it exists
      await supabase.from('enrollment_real_time_sync' as any).insert({
        enrollment_id: enrollmentId,
        sync_type: 'crm',
        target_system: crmType,
        target_object: objectType,
        external_record_id: recordId,
        sync_status: 'completed',
        synced_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Could not log CRM sync:', error);
    }
  }

  // ===== Existing Methods =====

  async verifyNPI(npi: string): Promise<MCPToolResult> {
    return this.executeTool('verify-npi', { npi, include_details: true });
  }

  async validateInsurance(data: { member_id: string; payer_name: string; group_number?: string }): Promise<MCPToolResult> {
    return this.executeTool('validate-insurance', data);
  }

  async checkCredentialing(data: { provider_npi: string; specialty?: string }): Promise<MCPToolResult> {
    return this.executeTool('credentialing-check', data);
  }

  async getSmartRouting(data: { current_section: string; completed_fields?: string[] }): Promise<MCPToolResult> {
    return this.executeTool('smart-field-routing', data);
  }

  async trackAnalytics(data: { session_id: string; event_type: string; metadata?: any }): Promise<MCPToolResult> {
    return this.executeTool('enrollment-analytics', data);
  }

  getExecutionHistory(): MCPToolResult[] {
    return [...this.toolExecutionHistory];
  }

  clearHistory(): void {
    this.toolExecutionHistory = [];
  }

  getServerInfo() {
    return this.server.getServerInfo();
  }

  getPrompts() {
    return this.server.getPrompts();
  }

  getResources() {
    return this.server.getResources();
  }

  async shutdown(): Promise<void> {
    await this.server.stop();
    this.isInitialized = false;
  }
}

// Singleton instance
let bridgeInstance: EnrollmentMCPBridge | null = null;

export const getEnrollmentMCPBridge = (config?: MCPBridgeConfig): EnrollmentMCPBridge => {
  if (!bridgeInstance) {
    bridgeInstance = new EnrollmentMCPBridge(config);
  }
  return bridgeInstance;
};

export const resetEnrollmentMCPBridge = (): void => {
  if (bridgeInstance) {
    bridgeInstance.shutdown();
    bridgeInstance = null;
  }
};

export { EnrollmentMCPBridge };
