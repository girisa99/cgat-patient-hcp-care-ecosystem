
/**
 * Pre-Implementation Verification Types
 * Common interfaces used across the verification system
 */

import { Database } from '@/integrations/supabase/types';

type DatabaseTables = keyof Database['public']['Tables'];

export interface PreImplementationCheckResult {
  canProceed: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
  existingComponents: ComponentScanResult;
  typescriptValidation: TypeScriptValidationResult;
  databaseAlignment: DatabaseAlignmentResult;
  templateEnforcement: PatternEnforcementResult;
}

export interface ComponentScanResult {
  existingHooks: string[];
  existingComponents: string[];
  existingTemplates: string[];
  reuseOpportunities: string[];
}

export interface TypeScriptValidationResult {
  isValid: boolean;
  missingTypes: string[];
  conflictingTypes: string[];
  schemaAlignment: boolean;
}

export interface DatabaseAlignmentResult {
  tablesExist: boolean;
  missingTables: string[];
  rlsPoliciesValid: boolean;
  foreignKeysValid: boolean;
}

export interface TemplateRecommendation {
  templateName: string;
  templatePath: string;
  reason: string;
  confidence: number;
  usage: string;
  example: string;
}

export interface PatternEnforcementResult {
  shouldUseTemplate: boolean;
  recommendedTemplate: TemplateRecommendation | null;
  alternatives: TemplateRecommendation[];
  violations: string[];
  enforcements: string[];
}

export interface VerificationRequest {
  tableName?: string;
  moduleName?: string;
  componentType: 'hook' | 'component' | 'module' | 'template';
  description: string;
}
