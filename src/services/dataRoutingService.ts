/**
 * DATA ROUTING SERVICE
 * Routes extracted enrollment data to different target systems
 * Patient data → Salesforce, Provider data → Veeva, etc.
 */

import { supabase } from '@/integrations/supabase/client';
import { mcpCrmToolsService } from './mcpCrmToolsService';
import {
  RoutingRule,
  RoutingResult,
  DataRoutingExecution,
  DEFAULT_ROUTING_RULES,
  FieldTransform,
  TargetSystemType
} from '@/types/dataRoutingTypes';

interface ExtractedField {
  fieldId: string;
  fieldLabel: string;
  fieldValue: string | boolean | number | null;
  fieldType: string;
  sectionTitle: string;
  sectionKey: string;
  required: boolean;
  confidence: number;
  verified: boolean;
}

interface ExtractionResult {
  extractionId: string;
  sessionId: string;
  formIdentification: any;
  allFields: ExtractedField[];
  fieldsBySection: Record<string, ExtractedField[]>;
}

class DataRoutingService {
  private rules: RoutingRule[] = DEFAULT_ROUTING_RULES;

  /**
   * Set custom routing rules
   */
  setRules(rules: RoutingRule[]) {
    this.rules = rules;
  }

  /**
   * Get active rules
   */
  getRules(): RoutingRule[] {
    return this.rules.filter(r => r.isActive);
  }

  /**
   * Apply field transformation
   */
  private applyTransform(value: any, transform: FieldTransform): any {
    if (value === null || value === undefined) return value;
    
    const strValue = String(value);
    
    switch (transform) {
      case 'uppercase':
        return strValue.toUpperCase();
      case 'lowercase':
        return strValue.toLowerCase();
      case 'trim':
        return strValue.trim();
      case 'date_iso':
        try {
          return new Date(strValue).toISOString().split('T')[0];
        } catch {
          return strValue;
        }
      case 'date_us':
        try {
          const d = new Date(strValue);
          return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
        } catch {
          return strValue;
        }
      case 'phone_e164':
        return strValue.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1');
      case 'phone_us':
        const digits = strValue.replace(/\D/g, '');
        if (digits.length === 10) {
          return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
        }
        return strValue;
      case 'ssn_mask':
        return strValue.replace(/^\d{5}/, 'XXX-XX-');
      case 'currency_cents':
        return Math.round(parseFloat(strValue.replace(/[^0-9.]/g, '')) * 100);
      case 'boolean_yn':
        return value ? 'Y' : 'N';
      default:
        return value;
    }
  }

  /**
   * Check if a field matches a pattern (supports wildcards)
   */
  private fieldMatchesPattern(fieldKey: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return fieldKey.toLowerCase().startsWith(prefix.toLowerCase());
    }
    return fieldKey.toLowerCase() === pattern.toLowerCase();
  }

  /**
   * Check if a field matches any pattern in the list
   */
  private fieldMatchesPatterns(fieldKey: string, patterns: string[]): boolean {
    if (!patterns || patterns.length === 0) return true;
    return patterns.some(p => this.fieldMatchesPattern(fieldKey, p));
  }

  /**
   * Get fields that match a routing rule
   */
  getFieldsForRule(extraction: ExtractionResult, rule: RoutingRule): ExtractedField[] {
    const matchingFields: ExtractedField[] = [];

    // Filter by sections
    const sectionsToInclude = rule.sourceSections.length > 0
      ? rule.sourceSections
      : Object.keys(extraction.fieldsBySection);

    for (const sectionKey of sectionsToInclude) {
      const sectionFields = extraction.fieldsBySection[sectionKey] || [];
      
      for (const field of sectionFields) {
        // Check field pattern match
        const fieldKey = field.fieldId.split('_field_')[0] + '_' + field.fieldLabel.toLowerCase().replace(/\s+/g, '_');
        
        if (this.fieldMatchesPatterns(fieldKey, rule.sourceFieldPatterns || ['*'])) {
          matchingFields.push(field);
        }
      }
    }

    return matchingFields;
  }

  /**
   * Build payload for target system
   */
  buildPayload(fields: ExtractedField[], rule: RoutingRule): Record<string, any> {
    const payload: Record<string, any> = {};

    for (const mapping of rule.fieldMappings) {
      // Find matching field
      const field = fields.find(f => {
        const normalizedLabel = f.fieldLabel.toLowerCase().replace(/\s+/g, '_');
        const normalizedSource = mapping.sourceFieldKey.toLowerCase();
        return normalizedLabel.includes(normalizedSource) || 
               f.fieldId.toLowerCase().includes(normalizedSource);
      });

      if (field && field.fieldValue !== null) {
        payload[mapping.targetFieldKey] = this.applyTransform(
          field.fieldValue,
          mapping.transform || 'none'
        );
      } else if (mapping.required && mapping.defaultValue) {
        payload[mapping.targetFieldKey] = mapping.defaultValue;
      }
    }

    return payload;
  }

  /**
   * Route to Salesforce via MCP
   */
  private async routeToSalesforce(
    payload: Record<string, any>,
    targetObject: string
  ): Promise<{ success: boolean; externalId?: string; error?: string }> {
    try {
      const result = await mcpCrmToolsService.exportToCrm('salesforce', payload, {
        sobject: targetObject,
        operation: 'create'
      });
      
      return {
        success: result.success,
        externalId: result.id,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Salesforce export failed'
      };
    }
  }

  /**
   * Route to Veeva via MCP
   */
  private async routeToVeeva(
    payload: Record<string, any>,
    targetObject: string
  ): Promise<{ success: boolean; externalId?: string; error?: string }> {
    try {
      const result = await mcpCrmToolsService.exportToCrm('veeva', payload, {
        objectType: targetObject,
        operation: 'create'
      });
      
      return {
        success: result.success,
        externalId: result.id,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Veeva export failed'
      };
    }
  }

  /**
   * Route to HubSpot via MCP
   */
  private async routeToHubSpot(
    payload: Record<string, any>
  ): Promise<{ success: boolean; externalId?: string; error?: string }> {
    try {
      const result = await mcpCrmToolsService.exportToCrm('hubspot', payload);
      
      return {
        success: result.success,
        externalId: result.id,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HubSpot export failed'
      };
    }
  }

  /**
   * Route to local Supabase
   */
  private async routeToSupabase(
    extraction: ExtractionResult,
    _targetObject: string
  ): Promise<{ success: boolean; externalId?: string; error?: string }> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(`${supabaseUrl}/rest/v1/enrollment_form_extractions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: extraction.extractionId,
          session_id: extraction.sessionId,
          form_identification: extraction.formIdentification,
          all_fields: extraction.allFields,
          fields_by_section: extraction.fieldsBySection,
          status: 'routed',
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Supabase save failed: ${response.status}`);
      }

      return {
        success: true,
        externalId: extraction.extractionId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Supabase save failed'
      };
    }
  }

  /**
   * Export to JSON file
   */
  exportToJson(extraction: ExtractionResult, rules?: RoutingRule[]): string {
    const exportData: Record<string, any> = {
      extractionId: extraction.extractionId,
      exportedAt: new Date().toISOString(),
      formIdentification: extraction.formIdentification
    };

    if (rules && rules.length > 0) {
      for (const rule of rules) {
        const fields = this.getFieldsForRule(extraction, rule);
        const payload = this.buildPayload(fields, rule);
        exportData[rule.targetSystem] = {
          targetObject: rule.targetObject,
          data: payload
        };
      }
    } else {
      exportData.allFields = extraction.allFields;
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export to CSV format
   */
  exportToCsv(extraction: ExtractionResult, targetSystem?: TargetSystemType): string {
    let fields = extraction.allFields;
    
    if (targetSystem) {
      const rule = this.rules.find(r => r.targetSystem === targetSystem && r.isActive);
      if (rule) {
        fields = this.getFieldsForRule(extraction, rule);
      }
    }

    // Build CSV
    const headers = ['Field Label', 'Field Value', 'Field Type', 'Section', 'Confidence', 'Verified'];
    const rows = fields.map(f => [
      `"${f.fieldLabel}"`,
      `"${f.fieldValue ?? ''}"`,
      f.fieldType,
      f.sectionTitle,
      f.confidence.toFixed(2),
      f.verified ? 'Yes' : 'No'
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Execute routing for all active rules
   */
  async executeRouting(
    extraction: ExtractionResult,
    enabledSystems?: TargetSystemType[]
  ): Promise<DataRoutingExecution> {
    const results: RoutingResult[] = [];
    let totalFieldsProcessed = 0;

    const activeRules = this.rules
      .filter(r => r.isActive)
      .filter(r => !enabledSystems || enabledSystems.includes(r.targetSystem))
      .sort((a, b) => a.priority - b.priority);

    for (const rule of activeRules) {
      const fields = this.getFieldsForRule(extraction, rule);
      const payload = this.buildPayload(fields, rule);
      totalFieldsProcessed += fields.length;

      let routeResult: { success: boolean; externalId?: string; error?: string };

      try {
        switch (rule.targetSystem) {
          case 'salesforce':
            routeResult = await this.routeToSalesforce(payload, rule.targetObject || 'Contact');
            break;
          case 'veeva':
            routeResult = await this.routeToVeeva(payload, rule.targetObject || 'Account_vod__c');
            break;
          case 'hubspot':
            routeResult = await this.routeToHubSpot(payload);
            break;
          case 'supabase':
            routeResult = await this.routeToSupabase(extraction, rule.targetObject || 'enrollment_form_extractions');
            break;
          default:
            routeResult = { success: false, error: `Unsupported target system: ${rule.targetSystem}` };
        }
      } catch (error) {
        routeResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Routing failed'
        };
      }

      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        targetSystem: rule.targetSystem,
        targetObject: rule.targetObject,
        fieldsRouted: fields.length,
        success: routeResult.success,
        error: routeResult.error,
        externalId: routeResult.externalId,
        timestamp: new Date().toISOString()
      });
    }

    return {
      extractionId: extraction.extractionId,
      executedAt: new Date().toISOString(),
      results,
      totalFieldsProcessed,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length
    };
  }

  /**
   * Route to specific systems only
   */
  async routeToSystems(
    extraction: ExtractionResult,
    systems: { salesforce?: boolean; veeva?: boolean; hubspot?: boolean; supabase?: boolean }
  ): Promise<DataRoutingExecution> {
    const enabledSystems: TargetSystemType[] = [];
    if (systems.salesforce) enabledSystems.push('salesforce');
    if (systems.veeva) enabledSystems.push('veeva');
    if (systems.hubspot) enabledSystems.push('hubspot');
    if (systems.supabase) enabledSystems.push('supabase');

    return this.executeRouting(extraction, enabledSystems);
  }
}

export const dataRoutingService = new DataRoutingService();
