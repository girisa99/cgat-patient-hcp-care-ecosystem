/**
 * ECOSYSTEM VERIFICATION TESTS
 * 
 * Run with: npm test src/test/ecosystemVerification.test.ts
 * 
 * These tests ensure the 21 categories, 181 pipelines, and 7 products
 * remain correctly wired throughout development.
 */

import { describe, it, expect } from 'vitest';
import { 
  verifyEcosystem, 
  isEcosystemHealthy, 
  getProductPipelineCount 
} from '@/utils/ecosystemVerification';
import { CATEGORY_REGISTRY, getEcosystemSummary } from '@/constants/ecosystemRegistry';
import { 
  OUTPUT_TO_CATEGORY_MAP, 
  VISUAL_FEATURE_TO_CATEGORY_MAP,
  PIPELINE_CATEGORIES_DROPDOWN,
  OUTPUT_TYPES,
  VISUAL_FEATURES,
  INDUSTRIES,
  FRAMEWORKS
} from '@/components/genie-studio/presentation-generator/registry';
import { GENIE_PRODUCTS, PRODUCT_KEYS } from '@/constants/genie-products';

describe('Ecosystem Registry Health', () => {
  it('should have exactly 7 products', () => {
    expect(PRODUCT_KEYS.length).toBe(7);
    expect(PRODUCT_KEYS).toContain('spark');
    expect(PRODUCT_KEYS).toContain('mind');
    expect(PRODUCT_KEYS).toContain('vibe');
    expect(PRODUCT_KEYS).toContain('deck');
    expect(PRODUCT_KEYS).toContain('arc');
    expect(PRODUCT_KEYS).toContain('cast');
    expect(PRODUCT_KEYS).toContain('studio');
  });

  it('should have exactly 21 categories', () => {
    expect(Object.keys(CATEGORY_REGISTRY).length).toBe(21);
    expect(PIPELINE_CATEGORIES_DROPDOWN.length).toBe(21);
  });

  it('should have expected total pipelines (206)', () => {
    const summary = getEcosystemSummary();
    // Actual count from PIPELINE_CATEGORY_MAPPING is 206
    // (28 + 30 + 74 + 34 + 14 + 26 = 206)
    expect(summary.pipelines.total).toBe(206);
  });

  it('should pass ecosystem health check', () => {
    expect(isEcosystemHealthy()).toBe(true);
  });

  it('should have no critical errors', () => {
    const report = verifyEcosystem();
    expect(report.errors.length).toBe(0);
  });
});

describe('Category to Product Mapping', () => {
  it('should map all categories to valid products', () => {
    Object.entries(CATEGORY_REGISTRY).forEach(([categoryId, config]) => {
      expect(PRODUCT_KEYS).toContain(config.product);
    });
  });

  it('should map all categories to edge functions', () => {
    Object.entries(CATEGORY_REGISTRY).forEach(([categoryId, config]) => {
      expect(config.edgeFunction).toBeDefined();
      expect(typeof config.edgeFunction).toBe('string');
      expect(config.edgeFunction.length).toBeGreaterThan(0);
    });
  });

  it('should have correct product category counts', () => {
    // Spark: 3 categories
    const sparkCategories = Object.values(CATEGORY_REGISTRY).filter(c => c.product === 'spark');
    expect(sparkCategories.length).toBe(3);

    // Mind: 4 categories
    const mindCategories = Object.values(CATEGORY_REGISTRY).filter(c => c.product === 'mind');
    expect(mindCategories.length).toBe(4);

    // Vibe: 6 categories
    const vibeCategories = Object.values(CATEGORY_REGISTRY).filter(c => c.product === 'vibe');
    expect(vibeCategories.length).toBe(6);

    // Deck: 3 categories
    const deckCategories = Object.values(CATEGORY_REGISTRY).filter(c => c.product === 'deck');
    expect(deckCategories.length).toBe(3);

    // Arc: 2 categories
    const arcCategories = Object.values(CATEGORY_REGISTRY).filter(c => c.product === 'arc');
    expect(arcCategories.length).toBe(2);

    // Cast: 3 categories
    const castCategories = Object.values(CATEGORY_REGISTRY).filter(c => c.product === 'cast');
    expect(castCategories.length).toBe(3);
  });
});

describe('Wizard Dropdown Bridge', () => {
  it('should have output types mapped to categories', () => {
    OUTPUT_TYPES.forEach(output => {
      const mapping = OUTPUT_TO_CATEGORY_MAP[output.id];
      if (mapping) {
        expect(mapping.category).toBeDefined();
        expect(mapping.product).toBeDefined();
        expect(mapping.edgeFunction).toBeDefined();
      }
    });
  });

  it('should have visual features mapped to categories', () => {
    VISUAL_FEATURES.forEach(feature => {
      const mapping = VISUAL_FEATURE_TO_CATEGORY_MAP[feature.id];
      if (mapping) {
        expect(mapping.category).toBeDefined();
        expect(mapping.product).toBeDefined();
        expect(mapping.edgeFunction).toBeDefined();
      }
    });
  });

  it('should have industries defined', () => {
    // Updated: Now 25 industries (15 original + 10 new)
    expect(INDUSTRIES.length).toBe(25);
  });

  it('should have frameworks defined', () => {
    // Frameworks include legacy, content, and new (academic, legal, technical)
    expect(FRAMEWORKS.length).toBeGreaterThan(0);
  });

  it('should have visual features including new categories', () => {
    // Updated: 21 original + 15 new (maps, social proof, avatars) = 36
    expect(VISUAL_FEATURES.length).toBe(36);
  });
});

describe('Pipeline Distribution', () => {
  it('should have correct pipeline counts per product', () => {
    // Spark: 28 pipelines (8+12+8)
    expect(getProductPipelineCount('spark')).toBe(28);
    
    // Mind: 30 pipelines (10+8+6+6)
    expect(getProductPipelineCount('mind')).toBe(30);
    
    // Vibe: 74 pipelines (15+15+10+16+10+8)
    expect(getProductPipelineCount('vibe')).toBe(74);
    
    // Deck: 34 pipelines (12+10+12)
    expect(getProductPipelineCount('deck')).toBe(34);
    
    // Arc: 14 pipelines (8+6)
    expect(getProductPipelineCount('arc')).toBe(14);
    
    // Cast: 26 pipelines (12+8+6)
    expect(getProductPipelineCount('cast')).toBe(26);
  });

  it('should sum to 206 total pipelines', () => {
    const total = 
      getProductPipelineCount('spark') +
      getProductPipelineCount('mind') +
      getProductPipelineCount('vibe') +
      getProductPipelineCount('deck') +
      getProductPipelineCount('arc') +
      getProductPipelineCount('cast');
    
    expect(total).toBe(206);
  });
});

describe('Product Definitions', () => {
  it('should have all products properly defined', () => {
    PRODUCT_KEYS.forEach(productKey => {
      const product = GENIE_PRODUCTS[productKey];
      expect(product).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.tagline).toBeDefined();
    });
  });

  it('should have correct product taglines', () => {
    expect(GENIE_PRODUCTS.spark.tagline).toContain('Ignite');
    expect(GENIE_PRODUCTS.mind.tagline).toContain('Understands');
    expect(GENIE_PRODUCTS.vibe.tagline).toContain('Screen');
    expect(GENIE_PRODUCTS.deck.tagline).toContain('Impact');
    expect(GENIE_PRODUCTS.cast.tagline).toContain('Scale');
  });
});

describe('Complete Verification Report', () => {
  it('should generate a complete verification report', () => {
    const report = verifyEcosystem();
    
    // Check report structure
    expect(report.timestamp).toBeDefined();
    expect(report.summary).toBeDefined();
    expect(report.counts).toBeDefined();
    expect(report.connections).toBeDefined();
    expect(report.dropdowns).toBeDefined();
    expect(report.status).toBeDefined();
    
    // Check counts
    expect(report.counts.products).toBe(7);
    expect(report.counts.categories).toBe(21);
    expect(report.counts.pipelines).toBe(206); // Actual count from registry
    
    // Check dropdowns exist
    expect(report.dropdowns.industries).toBe(true);
    expect(report.dropdowns.frameworks).toBe(true);
    expect(report.dropdowns.outputs).toBe(true);
    expect(report.dropdowns.visuals).toBe(true);
    expect(report.dropdowns.pipelineCategories).toBe(true);
  });
});
