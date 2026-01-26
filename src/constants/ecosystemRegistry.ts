/**
 * GENIE ECOSYSTEM REGISTRY
 * 
 * Single source of truth for the entire ecosystem.
 * Provides validation, counts, and extensibility patterns.
 * 
 * HOW TO ADD NEW PIPELINES OR PRODUCTS:
 * 
 * 1. ADD NEW PRODUCT:
 *    - Add to GenieProduct type in genie-products.ts
 *    - Add entry to GENIE_PRODUCTS object
 *    - Add to PRODUCT_KEYS and PRODUCT_DISPLAY_ORDER arrays
 *    - Update PRODUCT_PIPELINE_SUMMARY in pipelineProductMapping.ts
 * 
 * 2. ADD NEW PIPELINE CATEGORY:
 *    - Add to PIPELINE_CATEGORY_MAPPING in pipelineProductMapping.ts
 *    - Specify primaryProduct and sharedProducts
 *    - Update pipelineCount for affected products
 * 
 * 3. ADD NEW CROSS-FUNCTIONAL CAPABILITY:
 *    - Add to CROSS_FUNCTIONAL_CAPABILITIES in crossFunctionalCapabilities.ts
 *    - Map to compatibleProducts
 *    - Define providers and tier requirements
 */

import { GENIE_PRODUCTS, GenieProduct, PRODUCT_KEYS, ASK_GENIE } from './genie-products';
import { 
  PIPELINE_CATEGORY_MAPPING, 
  PRODUCT_PIPELINE_SUMMARY,
  PipelineCategoryMapping
} from './pipelineProductMapping';
import { 
  CROSS_FUNCTIONAL_CAPABILITIES, 
  CrossFunctionalCapability,
  CapabilityCategory
} from './crossFunctionalCapabilities';

// ============================================
// ECOSYSTEM COUNTS & SUMMARY
// ============================================

export interface EcosystemSummary {
  products: {
    total: number;
    list: GenieProduct[];
  };
  pipelines: {
    total: number;
    categories: number;
    byProduct: Record<GenieProduct, number>;
  };
  capabilities: {
    total: number;
    categories: number;
    byCategory: Record<CapabilityCategory, number>;
  };
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

/**
 * Get complete ecosystem summary with validation
 */
export const getEcosystemSummary = (): EcosystemSummary => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Count products
  const productCount = PRODUCT_KEYS.length;
  
  // Count pipeline categories
  const categoryCount = PIPELINE_CATEGORY_MAPPING.length;
  
  // Calculate total pipelines
  const totalPipelines = PIPELINE_CATEGORY_MAPPING.reduce(
    (sum, cat) => sum + cat.pipelineCount, 
    0
  );

  // Count by product
  const pipelinesByProduct: Record<GenieProduct, number> = {} as Record<GenieProduct, number>;
  PRODUCT_KEYS.forEach(product => {
    pipelinesByProduct[product] = PRODUCT_PIPELINE_SUMMARY[product]?.totalAccess || 0;
  });

  // Count capabilities
  const capabilityCount = CROSS_FUNCTIONAL_CAPABILITIES.length;
  
  // Capabilities by category
  const capabilitiesByCategory: Record<CapabilityCategory, number> = {
    avatar: 0,
    immersive: 0,
    audio: 0,
    video: 0,
    localization: 0,
    collaboration: 0,
    distribution: 0,
  };
  
  CROSS_FUNCTIONAL_CAPABILITIES.forEach(cap => {
    capabilitiesByCategory[cap.category]++;
  });

  // Validation checks
  // 1. Check all products have pipeline summaries
  PRODUCT_KEYS.forEach(product => {
    if (!PRODUCT_PIPELINE_SUMMARY[product]) {
      errors.push(`Missing pipeline summary for product: ${product}`);
    }
  });

  // 2. Check all categories have valid products
  PIPELINE_CATEGORY_MAPPING.forEach(cat => {
    if (!PRODUCT_KEYS.includes(cat.primaryProduct)) {
      errors.push(`Invalid primaryProduct "${cat.primaryProduct}" in category: ${cat.categoryId}`);
    }
    cat.sharedProducts.forEach(shared => {
      if (!PRODUCT_KEYS.includes(shared)) {
        errors.push(`Invalid sharedProduct "${shared}" in category: ${cat.categoryId}`);
      }
    });
  });

  // 3. Check capabilities reference valid products
  CROSS_FUNCTIONAL_CAPABILITIES.forEach(cap => {
    cap.compatibleProducts.forEach(product => {
      if (!PRODUCT_KEYS.includes(product)) {
        errors.push(`Invalid product "${product}" in capability: ${cap.id}`);
      }
    });
  });

  // 4. Verify pipeline counts match expected
  const expectedPipelines = 181;
  if (totalPipelines !== expectedPipelines) {
    warnings.push(`Pipeline count mismatch: expected ${expectedPipelines}, got ${totalPipelines}`);
  }

  // 5. Check Cast is included
  if (!PRODUCT_KEYS.includes('cast')) {
    errors.push('Genie Cast is missing from PRODUCT_KEYS');
  }

  return {
    products: {
      total: productCount,
      list: PRODUCT_KEYS,
    },
    pipelines: {
      total: totalPipelines,
      categories: categoryCount,
      byProduct: pipelinesByProduct,
    },
    capabilities: {
      total: capabilityCount,
      categories: Object.keys(capabilitiesByCategory).length,
      byCategory: capabilitiesByCategory,
    },
    validation: {
      isValid: errors.length === 0,
      errors,
      warnings,
    },
  };
};

// ============================================
// CATEGORY REGISTRY
// ============================================

/**
 * CATEGORY_REGISTRY - 21 Categories across 7 Products
 * 
 * Total: 181 pipelines | 21 categories
 * 
 * Distribution:
 * - SPARK: 3 categories, 28 pipelines (Input → Script)
 * - MIND: 4 categories, 30 pipelines (Script → Enhancement)
 * - VIBE: 6 categories, 64 pipelines (Script → Screen)
 * - DECK: 3 categories, 34 pipelines (Visual → Presentation)
 * - ARC: 2 categories, 14 pipelines (Production Journey)
 * - CAST: 3 categories, 26 pipelines (Distribution → Scale)
 * - STUDIO: Orchestrator (all pipelines access)
 */
export const CATEGORY_REGISTRY = {
  // SPARK Categories (3) - "Ignite your Ideas"
  'input-processing': { product: 'spark', pipelines: 8, edgeFunction: 'document-processor' },
  'script-generation': { product: 'spark', pipelines: 12, edgeFunction: 'ai-universal-processor' },
  'content-extraction': { product: 'spark', pipelines: 8, edgeFunction: 'azure-form-recognizer' },
  
  // MIND Categories (4) - "AI That Understands"
  'script-enhancement': { product: 'mind', pipelines: 10, edgeFunction: 'enhance-script' },
  'tts-generation': { product: 'mind', pipelines: 8, edgeFunction: 'elevenlabs-voice' },
  'music-generation': { product: 'mind', pipelines: 6, edgeFunction: 'multi-provider-music' },
  'translation': { product: 'mind', pipelines: 6, edgeFunction: 'translation-service' },
  
  // VIBE Categories (6) - "Script to Screen"
  'video-generation': { product: 'vibe', pipelines: 15, edgeFunction: 'ai-video-generator' },
  'video-editing': { product: 'vibe', pipelines: 15, edgeFunction: 'pipeline-editor-processor' },
  'audio-production': { product: 'vibe', pipelines: 10, edgeFunction: 'audio-mixer' },
  'podcast-webcast': { product: 'vibe', pipelines: 16, edgeFunction: 'extract-video-audio' },
  'avatar-lipsync': { product: 'vibe', pipelines: 10, edgeFunction: 'ai-video-generator' },
  'dubbing': { product: 'vibe', pipelines: 8, edgeFunction: 'multi-language-audio-orchestrator' },
  
  // DECK Categories (3) - "Ideas to Impact"
  'presentation': { product: 'deck', pipelines: 12, edgeFunction: 'share-presentation' },
  'visual-design': { product: 'deck', pipelines: 10, edgeFunction: 'ai-image-generator' },
  '3d-immersive': { product: 'deck', pipelines: 12, edgeFunction: 'modelslab-media' },
  
  // ARC Categories (2) - "Production Journey"
  'scheduling': { product: 'arc', pipelines: 8, edgeFunction: 'calendar-sync' },
  'collaboration': { product: 'arc', pipelines: 6, edgeFunction: 'workspace-collaboration' },
  
  // CAST Categories (3) - "Make It. Show It. Scale It."
  'distribution': { product: 'cast', pipelines: 12, edgeFunction: 'social-publish' },
  'marketing': { product: 'cast', pipelines: 8, edgeFunction: 'marketing-auto-scheduler' },
  'analytics': { product: 'cast', pipelines: 6, edgeFunction: 'analytics-dashboard' },
} as const;

export type CategoryId = keyof typeof CATEGORY_REGISTRY;

// ============================================
// EXTENSIBILITY HELPERS
// ============================================

/**
 * Add a new pipeline category to the registry
 * Use this pattern when extending the ecosystem
 */
export interface NewCategoryConfig {
  categoryId: string;
  categoryName: string;
  primaryProduct: GenieProduct;
  sharedProducts: GenieProduct[];
  pipelineCount: number;
  description: string;
  wizardSteps: number[];
  editorMode: 'canvas' | 'timeline' | 'document' | 'hybrid';
}

/**
 * Validate a new category configuration before adding
 */
export const validateNewCategory = (config: NewCategoryConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required fields
  if (!config.categoryId) errors.push('categoryId is required');
  if (!config.categoryName) errors.push('categoryName is required');
  if (!config.primaryProduct) errors.push('primaryProduct is required');
  if (!PRODUCT_KEYS.includes(config.primaryProduct)) {
    errors.push(`Invalid primaryProduct: ${config.primaryProduct}`);
  }
  if (config.pipelineCount < 1) errors.push('pipelineCount must be >= 1');

  // Check for duplicate
  const existingIds = PIPELINE_CATEGORY_MAPPING.map(c => c.categoryId);
  if (existingIds.includes(config.categoryId)) {
    errors.push(`Category already exists: ${config.categoryId}`);
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Add a new capability to the registry
 */
export interface NewCapabilityConfig {
  id: string;
  name: string;
  description: string;
  category: CapabilityCategory;
  tier: 'free' | 'pro' | 'enterprise';
  compatibleProducts: GenieProduct[];
  primaryProviders: string[];
  fallbackProviders: string[];
  pipelineIds: string[];
  editorType: 'canvas' | 'timeline' | 'hybrid' | 'none';
  wizardSteps: number[];
  creditMultiplier: number;
}

/**
 * Validate a new capability configuration before adding
 */
export const validateNewCapability = (config: NewCapabilityConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.id) errors.push('id is required');
  if (!config.name) errors.push('name is required');
  if (config.compatibleProducts.length === 0) {
    errors.push('At least one compatible product is required');
  }

  // Check products exist
  config.compatibleProducts.forEach(product => {
    if (!PRODUCT_KEYS.includes(product)) {
      errors.push(`Invalid product: ${product}`);
    }
  });

  // Check for duplicate
  const existingIds = CROSS_FUNCTIONAL_CAPABILITIES.map(c => c.id);
  if (existingIds.includes(config.id)) {
    errors.push(`Capability already exists: ${config.id}`);
  }

  return { valid: errors.length === 0, errors };
};

// ============================================
// QUICK REFERENCE EXPORT
// ============================================

/**
 * Get formatted markdown summary of the ecosystem
 */
export const getEcosystemMarkdownSummary = (): string => {
  const summary = getEcosystemSummary();
  
  return `
# Genie Ecosystem Registry

## Products (${summary.products.total})
${summary.products.list.map(p => `- **${GENIE_PRODUCTS[p].name}**: ${GENIE_PRODUCTS[p].tagline}`).join('\n')}
- **Ask Genie**: ${ASK_GENIE.tagline}

## Pipeline Categories (${summary.pipelines.categories})
Total Pipelines: **${summary.pipelines.total}**

### By Product
${Object.entries(summary.pipelines.byProduct)
  .map(([product, count]) => `- **${GENIE_PRODUCTS[product as GenieProduct].name}**: ${count} pipelines`)
  .join('\n')}

## Cross-Functional Capabilities (${summary.capabilities.total})
${Object.entries(summary.capabilities.byCategory)
  .filter(([_, count]) => count > 0)
  .map(([category, count]) => `- **${category}**: ${count} capabilities`)
  .join('\n')}

## Validation Status
${summary.validation.isValid ? '✅ All checks passed' : '❌ Errors found'}
${summary.validation.errors.length > 0 ? `\n### Errors\n${summary.validation.errors.map(e => `- ${e}`).join('\n')}` : ''}
${summary.validation.warnings.length > 0 ? `\n### Warnings\n${summary.validation.warnings.map(w => `- ${w}`).join('\n')}` : ''}
  `.trim();
};

// Export all for convenience
export {
  GENIE_PRODUCTS,
  PIPELINE_CATEGORY_MAPPING,
  PRODUCT_PIPELINE_SUMMARY,
  CROSS_FUNCTIONAL_CAPABILITIES,
};
