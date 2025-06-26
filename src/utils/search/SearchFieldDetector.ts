
/**
 * Utility for detecting searchable fields in database tables
 */

export class SearchFieldDetector {
  /**
   * Auto-detects searchable fields from table structure
   */
  static async detectSearchableFields(tableName: string): Promise<string[]> {
    // Define common searchable field patterns
    const textFields = ['name', 'title', 'description', 'email', 'first_name', 'last_name', 'phone'];
    const searchableTypes = ['text', 'varchar', 'character varying'];
    
    try {
      // In a real implementation, this would query the information schema
      // For now, we'll use common patterns based on table names
      const commonFields = this.getCommonFieldsForTable(tableName);
      return commonFields.filter(field => 
        textFields.some(pattern => field.toLowerCase().includes(pattern.toLowerCase()))
      );
      
    } catch (error) {
      console.warn(`⚠️ Could not detect fields for ${tableName}:`, error);
      return this.getCommonFieldsForTable(tableName);
    }
  }

  /**
   * Returns common fields based on table name patterns
   */
  private static getCommonFieldsForTable(tableName: string): string[] {
    const commonFieldsMap: Record<string, string[]> = {
      'profiles': ['first_name', 'last_name', 'email', 'phone'],
      'users': ['first_name', 'last_name', 'email', 'phone'],
      'patients': ['first_name', 'last_name', 'email', 'phone'],
      'facilities': ['name', 'address', 'email', 'phone'],
      'modules': ['name', 'description'],
      'roles': ['name', 'description'],
      'permissions': ['name', 'description']
    };

    return commonFieldsMap[tableName] || ['name', 'description', 'email'];
  }
}
