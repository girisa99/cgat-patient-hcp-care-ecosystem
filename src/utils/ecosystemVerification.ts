/**
 * ECOSYSTEM VERIFICATION UTILITY
 * 
 * Run-time verification that all 21 categories, 181 pipelines,
 * 7 products, and 25 capabilities are properly wired.
 * 
 * Usage:
 *   import { verifyEcosystem, logEcosystemVerification } from '@/utils/ecosystemVerification';
 *   
 *   // Get full report
 *   const report = verifyEcosystem();
 *   console.log(report.summary);
 *   
 *   // Quick health check
 *   if (!isEcosystemHealthy()) {
 *     console.error('Ecosystem connection issues detected!');
 *   }
 *   
 *   // Log to console (dev mode)
 *   logEcosystemVerification();
 * 
 * AUTOMATED TESTS:
 *   Run `npm test src/test/ecosystemVerification.test.ts` to verify all connections.
 * 
 * DEV INDICATOR:
 *   Add <EcosystemHealthIndicator /> to your layout for real-time monitoring.
 */

import { getEcosystemSummary, CATEGORY_REGISTRY } from '@/constants/ecosystemRegistry';
import { 
  OUTPUT_TO_CATEGORY_MAP, 
  VISUAL_FEATURE_TO_CATEGORY_MAP,
  PIPELINE_CATEGORIES_DROPDOWN,
  OUTPUT_TYPES,
  VISUAL_FEATURES,
  INDUSTRIES,
  FRAMEWORKS 
} from '@/components/genie-studio/presentation-generator/registry';
import { GENIE_PRODUCTS, GenieProduct } from '@/constants/genie-products';

export interface VerificationReport {
  timestamp: string;
  summary: string;
  counts: {
    products: number;
    categories: number;
    pipelines: number;
    capabilities: number;
    industries: number;
    frameworks: number;
    outputTypes: number;
    visualFeatures: number;
  };
  connections: {
    outputsToCategories: { connected: number; missing: string[] };
    visualsToCategories: { connected: number; missing: string[] };
    categoriesToProducts: { connected: number; missing: string[] };
    categoriesToEdgeFunctions: { connected: number; missing: string[] };
  };
  dropdowns: {
    industries: boolean;
    frameworks: boolean;
    outputs: boolean;
    visuals: boolean;
    pipelineCategories: boolean;
  };
  errors: string[];
  warnings: string[];
  status: 'healthy' | 'warning' | 'error';
}

/**
 * Verify the complete ecosystem is properly connected
 */
export function verifyEcosystem(): VerificationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Get ecosystem summary
  const ecosystem = getEcosystemSummary();
  
  // 1. Check outputs mapped to categories
  const outputsConnected: string[] = [];
  const outputsMissing: string[] = [];
  OUTPUT_TYPES.forEach(output => {
    if (OUTPUT_TO_CATEGORY_MAP[output.id]) {
      outputsConnected.push(output.id);
    } else {
      outputsMissing.push(output.id);
      warnings.push(`Output type '${output.id}' not mapped to a category`);
    }
  });
  
  // 2. Check visuals mapped to categories
  const visualsConnected: string[] = [];
  const visualsMissing: string[] = [];
  VISUAL_FEATURES.forEach(visual => {
    if (VISUAL_FEATURE_TO_CATEGORY_MAP[visual.id]) {
      visualsConnected.push(visual.id);
    } else {
      visualsMissing.push(visual.id);
      warnings.push(`Visual feature '${visual.id}' not mapped to a category`);
    }
  });
  
  // 3. Check categories mapped to products
  const categoryProducts: string[] = [];
  const categoryMissing: string[] = [];
  Object.entries(CATEGORY_REGISTRY).forEach(([id, config]) => {
    if (config.product && GENIE_PRODUCTS[config.product as GenieProduct]) {
      categoryProducts.push(id);
    } else {
      categoryMissing.push(id);
      errors.push(`Category '${id}' has invalid product: ${config.product}`);
    }
  });
  
  // 4. Check categories have edge functions
  const categoryEdgeFunctions: string[] = [];
  const edgeFunctionsMissing: string[] = [];
  Object.entries(CATEGORY_REGISTRY).forEach(([id, config]) => {
    if (config.edgeFunction) {
      categoryEdgeFunctions.push(id);
    } else {
      edgeFunctionsMissing.push(id);
      errors.push(`Category '${id}' missing edgeFunction`);
    }
  });
  
  // 5. Verify dropdown data exists
  const dropdowns = {
    industries: INDUSTRIES.length > 0,
    frameworks: FRAMEWORKS.length > 0,
    outputs: OUTPUT_TYPES.length > 0,
    visuals: VISUAL_FEATURES.length > 0,
    pipelineCategories: PIPELINE_CATEGORIES_DROPDOWN.length > 0,
  };
  
  Object.entries(dropdowns).forEach(([name, exists]) => {
    if (!exists) {
      errors.push(`Dropdown data missing: ${name}`);
    }
  });
  
  // 6. Verify pipeline counts (206 = 28+30+74+34+14+26)
  const expectedPipelines = 206;
  const expectedCategories = 21;
  
  if (ecosystem.pipelines.total !== expectedPipelines) {
    warnings.push(`Pipeline count: expected ${expectedPipelines}, got ${ecosystem.pipelines.total}`);
  }
  
  if (Object.keys(CATEGORY_REGISTRY).length !== expectedCategories) {
    warnings.push(`Category count: expected ${expectedCategories}, got ${Object.keys(CATEGORY_REGISTRY).length}`);
  }
  
  // Include ecosystem errors
  errors.push(...ecosystem.validation.errors);
  warnings.push(...ecosystem.validation.warnings);
  
  // Determine status
  const status = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'healthy';
  
  // Build summary
  const summary = `
Genie Ecosystem Verification Report
====================================
Status: ${status.toUpperCase()}

Products: ${ecosystem.products.total} (Spark, Mind, Vibe, Deck, Arc, Cast, Studio)
Categories: ${Object.keys(CATEGORY_REGISTRY).length} / 21 expected
Pipelines: ${ecosystem.pipelines.total} / 206 expected
Capabilities: ${ecosystem.capabilities.total}

Wizard Dropdowns:
- Industries: ${INDUSTRIES.length} options
- Frameworks: ${FRAMEWORKS.length} options
- Output Types: ${OUTPUT_TYPES.length} options
- Visual Features: ${VISUAL_FEATURES.length} options
- Pipeline Categories: ${PIPELINE_CATEGORIES_DROPDOWN.length} options

Connections:
- Outputs → Categories: ${outputsConnected.length}/${OUTPUT_TYPES.length} connected
- Visuals → Categories: ${visualsConnected.length}/${VISUAL_FEATURES.length} connected
- Categories → Products: ${categoryProducts.length}/${Object.keys(CATEGORY_REGISTRY).length} connected
- Categories → Edge Functions: ${categoryEdgeFunctions.length}/${Object.keys(CATEGORY_REGISTRY).length} connected

${errors.length > 0 ? `\nErrors (${errors.length}):\n${errors.map(e => `  ❌ ${e}`).join('\n')}` : ''}
${warnings.length > 0 ? `\nWarnings (${warnings.length}):\n${warnings.map(w => `  ⚠️ ${w}`).join('\n')}` : ''}
${status === 'healthy' ? '\n✅ All systems connected and operational!' : ''}
  `.trim();
  
  return {
    timestamp: new Date().toISOString(),
    summary,
    counts: {
      products: ecosystem.products.total,
      categories: Object.keys(CATEGORY_REGISTRY).length,
      pipelines: ecosystem.pipelines.total,
      capabilities: ecosystem.capabilities.total,
      industries: INDUSTRIES.length,
      frameworks: FRAMEWORKS.length,
      outputTypes: OUTPUT_TYPES.length,
      visualFeatures: VISUAL_FEATURES.length,
    },
    connections: {
      outputsToCategories: { connected: outputsConnected.length, missing: outputsMissing },
      visualsToCategories: { connected: visualsConnected.length, missing: visualsMissing },
      categoriesToProducts: { connected: categoryProducts.length, missing: categoryMissing },
      categoriesToEdgeFunctions: { connected: categoryEdgeFunctions.length, missing: edgeFunctionsMissing },
    },
    dropdowns,
    errors,
    warnings,
    status,
  };
}

/**
 * Quick health check - returns true if ecosystem is connected
 */
export function isEcosystemHealthy(): boolean {
  const report = verifyEcosystem();
  return report.status !== 'error';
}

/**
 * Get specific product pipeline count
 */
export function getProductPipelineCount(product: GenieProduct): number {
  return Object.values(CATEGORY_REGISTRY)
    .filter(cat => cat.product === product)
    .reduce((sum, cat) => sum + cat.pipelines, 0);
}

/**
 * Console log the full verification report
 */
export function logEcosystemVerification(): void {
  const report = verifyEcosystem();
  console.log(report.summary);
}

export default verifyEcosystem;
