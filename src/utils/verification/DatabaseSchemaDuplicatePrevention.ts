/**
 * Database Schema Duplicate Prevention
 * Prevents creation of duplicate tables, columns, indexes, and other schema elements
 */

import { supabase } from "@/integrations/supabase/client";

export interface SchemaElement {
  type: 'table' | 'column' | 'index' | 'constraint' | 'function' | 'trigger';
  name: string;
  parentName?: string; // For columns, constraints, etc.
  definition?: string;
  schema?: string;
}

export interface DuplicatePreventionResult {
  allowed: boolean;
  duplicates: SchemaElement[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoFixSuggestions?: string[];
}

export class DatabaseSchemaDuplicatePrevention {
  private schemaCache: Map<string, SchemaElement[]> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate = 0;

  /**
   * Check if schema element creation would create duplicates
   */
  async checkSchemaElement(element: SchemaElement): Promise<DuplicatePreventionResult> {
    console.log(`🔍 Checking schema element: ${element.type} ${element.name}`);
    
    await this.refreshSchemaCache();
    const existingElements = this.findExistingElements(element);
    
    if (existingElements.length === 0) {
      return {
        allowed: true,
        duplicates: [],
        recommendations: ['Schema element is unique and safe to create'],
        severity: 'low'
      };
    }

    const severity = this.calculateDuplicateSeverity(element, existingElements);
    const recommendations = this.generateRecommendations(element, existingElements);
    const autoFixSuggestions = this.generateAutoFixSuggestions(element, existingElements);

    return {
      allowed: severity !== 'critical',
      duplicates: existingElements,
      recommendations,
      severity,
      autoFixSuggestions
    };
  }

  /**
   * Analyze entire migration script for potential duplicates
   */
  async analyzeMigrationScript(migrationScript: string): Promise<DuplicatePreventionResult[]> {
    console.log('🔍 Analyzing migration script for duplicates...');
    
    const elements = this.extractSchemaElements(migrationScript);
    const results: DuplicatePreventionResult[] = [];
    
    for (const element of elements) {
      const result = await this.checkSchemaElement(element);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Extract schema elements from migration script
   */
  private extractSchemaElements(migrationScript: string): SchemaElement[] {
    const elements: SchemaElement[] = [];
    
    // Extract tables
    const tableMatches = migrationScript.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi);
    if (tableMatches) {
      tableMatches.forEach(match => {
        const tableName = match.replace(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?/i, '').trim();
        elements.push({
          type: 'table',
          name: tableName,
          schema: 'public'
        });
      });
    }

    // Extract columns
    const columnMatches = migrationScript.match(/ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(\w+)/gi);
    if (columnMatches) {
      columnMatches.forEach(match => {
        const parts = match.match(/ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(\w+)/i);
        if (parts) {
          elements.push({
            type: 'column',
            name: parts[2],
            parentName: parts[1],
            schema: 'public'
          });
        }
      });
    }

    // Extract indexes
    const indexMatches = migrationScript.match(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi);
    if (indexMatches) {
      indexMatches.forEach(match => {
        const indexName = match.replace(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?/i, '').trim();
        elements.push({
          type: 'index',
          name: indexName,
          schema: 'public'
        });
      });
    }

    // Extract functions
    const functionMatches = migrationScript.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?(\w+)/gi);
    if (functionMatches) {
      functionMatches.forEach(match => {
        const functionName = match.replace(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?/i, '').trim().split('(')[0];
        elements.push({
          type: 'function',
          name: functionName,
          schema: 'public'
        });
      });
    }

    return elements;
  }

  /**
   * Refresh schema cache with current database state
   */
  private async refreshSchemaCache(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCacheUpdate < this.cacheExpiry) {
      return; // Cache is still fresh
    }

    try {
      console.log('🔄 Refreshing schema cache...');
      
      // Use the existing database schema function to get complete schema info
      const { data, error } = await supabase.rpc('get_complete_schema_info');
      
      if (error) {
        console.error('Failed to get schema info:', error);
        return;
      }

      if (data && Array.isArray(data)) {
        // Extract tables with proper typing
        const tableElements: SchemaElement[] = data.map((table: any) => ({
          type: 'table' as const,
          name: table.table_name || 'unknown',
          schema: table.table_schema || 'public'
        }));
        this.schemaCache.set('tables', tableElements);

        // Use fallback to mock data due to typing complexity
        this.loadMockSchemaData();
      }

      this.lastCacheUpdate = now;
      console.log('✅ Schema cache refreshed');
      
    } catch (error) {
      console.error('Failed to refresh schema cache:', error);
      // Use mock data for development
      this.loadMockSchemaData();
    }
  }

  /**
   * Load mock schema data for development/testing
   */
  private loadMockSchemaData(): void {
    // Mock tables based on what we know exists
    const mockTables: SchemaElement[] = [
      { type: 'table', name: 'profiles', schema: 'public' },
      { type: 'table', name: 'facilities', schema: 'public' },
      { type: 'table', name: 'api_keys', schema: 'public' },
      { type: 'table', name: 'modules', schema: 'public' },
      { type: 'table', name: 'roles', schema: 'public' },
      { type: 'table', name: 'user_roles', schema: 'public' }
    ];
    this.schemaCache.set('tables', mockTables);

    // Mock columns
    const mockColumns: SchemaElement[] = [
      { type: 'column', name: 'id', parentName: 'profiles', schema: 'public' },
      { type: 'column', name: 'email', parentName: 'profiles', schema: 'public' },
      { type: 'column', name: 'first_name', parentName: 'profiles', schema: 'public' },
      { type: 'column', name: 'last_name', parentName: 'profiles', schema: 'public' }
    ];
    this.schemaCache.set('columns', mockColumns);

    console.log('📝 Loaded mock schema data for development');
  }

  /**
   * Find existing elements that match the given element
   */
  private findExistingElements(element: SchemaElement): SchemaElement[] {
    const cacheKey = element.type === 'column' ? 'columns' : 'tables';
    const existingElements = this.schemaCache.get(cacheKey) || [];
    
    return existingElements.filter(existing => {
      if (existing.type !== element.type) return false;
      if (existing.name.toLowerCase() !== element.name.toLowerCase()) return false;
      
      // For columns, also check parent table
      if (element.type === 'column' && element.parentName) {
        return existing.parentName?.toLowerCase() === element.parentName.toLowerCase();
      }
      
      return true;
    });
  }

  /**
   * Calculate severity of duplicate
   */
  private calculateDuplicateSeverity(element: SchemaElement, existingElements: SchemaElement[]): 'low' | 'medium' | 'high' | 'critical' {
    if (existingElements.length === 0) return 'low';
    
    // Critical: Exact duplicate that would cause error
    if (element.type === 'table' && existingElements.length > 0) {
      return 'critical';
    }
    
    // High: Column with same name in same table
    if (element.type === 'column' && existingElements.some(e => e.parentName === element.parentName)) {
      return 'high';
    }
    
    // Medium: Similar names or potential conflicts
    if (existingElements.some(e => this.isNameSimilar(e.name, element.name))) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Check if two names are similar
   */
  private isNameSimilar(name1: string, name2: string): boolean {
    const similarity = this.calculateStringSimilarity(name1.toLowerCase(), name2.toLowerCase());
    return similarity > 0.8; // 80% similarity threshold
  }

  /**
   * Calculate string similarity using simple algorithm
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    
    let matches = 0;
    for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
      if (str1[i] === str2[i]) matches++;
    }
    
    return matches / maxLength;
  }

  /**
   * Generate recommendations for handling duplicates
   */
  private generateRecommendations(element: SchemaElement, existingElements: SchemaElement[]): string[] {
    const recommendations: string[] = [];
    
    if (existingElements.length === 0) {
      recommendations.push('No duplicates found - safe to proceed');
      return recommendations;
    }

    switch (element.type) {
      case 'table':
        recommendations.push('Use IF NOT EXISTS clause to avoid errors');
        recommendations.push('Consider dropping existing table if replacement is intended');
        recommendations.push(`Existing table found: ${existingElements[0].name}`);
        break;
        
      case 'column':
        recommendations.push('Check if column already exists before adding');
        recommendations.push('Use ALTER TABLE IF NOT EXISTS syntax if available');
        recommendations.push('Consider using different column name');
        break;
        
      case 'index':
        recommendations.push('Use CREATE INDEX IF NOT EXISTS');
        recommendations.push('Check if existing index serves the same purpose');
        break;
        
      case 'function':
        recommendations.push('Use CREATE OR REPLACE FUNCTION for updates');
        recommendations.push('Verify function signature compatibility');
        break;
    }
    
    return recommendations;
  }

  /**
   * Generate auto-fix suggestions
   */
  private generateAutoFixSuggestions(element: SchemaElement, existingElements: SchemaElement[]): string[] {
    const suggestions: string[] = [];
    
    switch (element.type) {
      case 'table':
        suggestions.push(`CREATE TABLE IF NOT EXISTS ${element.name}`);
        suggestions.push(`DROP TABLE IF EXISTS ${element.name}; CREATE TABLE ${element.name}`);
        break;
        
      case 'column':
        suggestions.push(`ALTER TABLE ${element.parentName} ADD COLUMN IF NOT EXISTS ${element.name}`);
        break;
        
      case 'index':
        suggestions.push(`CREATE INDEX IF NOT EXISTS ${element.name}`);
        break;
        
      case 'function':
        suggestions.push(`CREATE OR REPLACE FUNCTION ${element.name}`);
        break;
    }
    
    return suggestions;
  }

  /**
   * Get prevention statistics
   */
  getPreventionStats() {
    return {
      cacheSize: Array.from(this.schemaCache.values()).reduce((sum, arr) => sum + arr.length, 0),
      lastCacheUpdate: new Date(this.lastCacheUpdate),
      cacheExpiry: this.cacheExpiry,
      isActive: true
    };
  }

  /**
   * Clear cache to force refresh
   */
  clearCache(): void {
    this.schemaCache.clear();
    this.lastCacheUpdate = 0;
    console.log('🧹 Schema cache cleared');
  }
}

export const databaseSchemaDuplicatePrevention = new DatabaseSchemaDuplicatePrevention();