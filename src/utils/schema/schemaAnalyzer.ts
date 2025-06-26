
/**
 * Schema Analysis Utilities
 */

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default?: any;
}

export interface SchemaAnalysis {
  tableName: string;
  columns: ColumnInfo[];
  suggestedModuleName: string;
  suggestedRequiredFields: string[];
  suggestedOptionalFields: string[];
  hasCreatedAt: boolean;
  hasUpdatedAt: boolean;
  hasStatus: boolean;
  hasId: boolean;
}

export const analyzeTable = async (tableName: string): Promise<SchemaAnalysis | null> => {
  // Since we can't execute raw SQL, we'll return mock analysis for known tables
  const mockAnalyses: Record<string, SchemaAnalysis> = {
    profiles: {
      tableName: 'profiles',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'email', type: 'text', nullable: false },
        { name: 'first_name', type: 'text', nullable: true },
        { name: 'last_name', type: 'text', nullable: true },
        { name: 'phone', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: false },
        { name: 'updated_at', type: 'timestamp', nullable: false }
      ],
      suggestedModuleName: 'Profiles',
      suggestedRequiredFields: ['email'],
      suggestedOptionalFields: ['first_name', 'last_name', 'phone'],
      hasCreatedAt: true,
      hasUpdatedAt: true,
      hasStatus: false,
      hasId: true
    },
    roles: {
      tableName: 'roles',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'name', type: 'text', nullable: false },
        { name: 'description', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: false }
      ],
      suggestedModuleName: 'Roles',
      suggestedRequiredFields: ['name'],
      suggestedOptionalFields: ['description'],
      hasCreatedAt: true,
      hasUpdatedAt: false,
      hasStatus: false,
      hasId: true
    },
    permissions: {
      tableName: 'permissions',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'name', type: 'text', nullable: false },
        { name: 'description', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: false }
      ],
      suggestedModuleName: 'Permissions',
      suggestedRequiredFields: ['name'],
      suggestedOptionalFields: ['description'],
      hasCreatedAt: true,
      hasUpdatedAt: false,
      hasStatus: false,
      hasId: true
    }
  };

  return mockAnalyses[tableName] || null;
};

export const calculateConfidence = (analysis: SchemaAnalysis): number => {
  let confidence = 0.5; // Base confidence
  
  // Higher confidence for tables with standard fields
  if (analysis.hasId) confidence += 0.2;
  if (analysis.hasCreatedAt) confidence += 0.1;
  if (analysis.suggestedRequiredFields.length > 0) confidence += 0.2;
  
  return Math.min(confidence, 1.0);
};

export const toPascalCase = (str: string): string => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};
