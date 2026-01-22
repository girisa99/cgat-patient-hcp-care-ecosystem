/**
 * Unified Metrics Engine
 * 
 * Single source of truth for metrics across all Provider Matrix tabs.
 * Ensures consistent calculations for scenarios, use cases, providers, and LLMs
 * whether filtering by category or showing all data.
 * 
 * Tracks:
 * - Inherited data (from FEATURE_USE_CASES, CROSS_FUNCTIONAL_MAPPINGS)
 * - New identified data (from Generation Coverage registry)
 * - Gaps and opportunities
 */

import { 
  ALL_FEATURES,
  FEATURE_USE_CASES,
  CROSS_FUNCTIONAL_MAPPINGS,
  LLM_COMPARISONS,
  FEATURE_IMPLEMENTATION_MATRIX,
  PROVIDER_SUMMARIES
} from '../matrixData';
import {
  INDUSTRY_CAPABILITY_MAPPINGS,
  FRAMEWORK_CAPABILITY_MAPPINGS,
  VISUAL_CAPABILITY_MAPPINGS,
  OUTPUT_CAPABILITY_MAPPINGS,
  FEATURE_CONTEXT_MAPPINGS
} from './generationCoverageRegistry';
import type { FeatureCategory, ProviderId } from '../types';

// ==========================================
// UNIFIED METRICS TYPES
// ==========================================

export interface UnifiedCategoryMetrics {
  category: FeatureCategory | 'all';
  
  // Feature counts
  features: {
    total: number;
    implemented: number;
    partial: number;
    planned: number;
    notStarted: number;
  };
  
  // Scenarios & Use Cases - BROKEN DOWN by source
  scenarios: {
    total: number;
    fromFeatureUseCases: number;   // From FEATURE_USE_CASES
    fromCrossFunctional: number;   // From CROSS_FUNCTIONAL_MAPPINGS
    fromGenerationCoverage: number; // From Generation Coverage registry (new identified)
    unique: Set<string>;
  };
  
  useCases: {
    total: number;
    fromFeatureUseCases: number;   // From FEATURE_USE_CASES (bestFor)
    fromCrossFunctional: number;   // From CROSS_FUNCTIONAL_MAPPINGS
    fromGenerationCoverage: number; // From Generation Coverage registry (new identified)
    unique: Set<string>;
  };
  
  // Providers - from actual implementations
  providers: {
    total: number;
    implemented: number; // Actually have implementations
    available: number;   // Available but not implemented
    unique: Set<ProviderId>;
  };
  
  // LLMs - from LLM_COMPARISONS
  llms: {
    total: number;
    forCategory: number;
    unique: Set<string>;
  };
  
  // Gaps & Opportunities
  gaps: {
    total: number;
    features: string[];
    providers: string[];
    scenarios: string[];
  };
  
  opportunities: {
    total: number;
    newScenarios: string[];
    newUseCases: string[];
    potentialProviders: string[];
  };
  
  // Coverage percentage
  coverage: number;
}

// ==========================================
// UNIFIED METRICS CALCULATOR
// ==========================================

export function calculateUnifiedMetrics(
  categoryFilter: FeatureCategory | 'all' = 'all',
  localMatrix?: typeof FEATURE_IMPLEMENTATION_MATRIX
): UnifiedCategoryMetrics {
  const matrix = localMatrix || FEATURE_IMPLEMENTATION_MATRIX;
  
  // Get features for this category
  const categoryFeatures = categoryFilter === 'all'
    ? ALL_FEATURES
    : ALL_FEATURES.filter(f => f.category === categoryFilter);
  
  const featureIds = new Set(categoryFeatures.map(f => f.id));
  
  // ==========================================
  // 1. FEATURE COUNTS
  // ==========================================
  let implemented = 0, partial = 0, planned = 0, notStarted = 0;
  
  categoryFeatures.forEach(feature => {
    const featureImpl = matrix[feature.id];
    if (!featureImpl || Object.keys(featureImpl).length === 0) {
      notStarted++;
      return;
    }
    
    const statuses = Object.values(featureImpl).map(p => p?.implementation);
    if (statuses.includes('implemented')) {
      implemented++;
    } else if (statuses.includes('partial')) {
      partial++;
    } else if (statuses.includes('planned')) {
      planned++;
    } else {
      notStarted++;
    }
  });
  
  // ==========================================
  // 2. SCENARIOS - From all sources
  // ==========================================
  const scenariosFromUseCases = new Set<string>();
  const scenariosFromCrossFunctional = new Set<string>();
  const scenariosFromGenerationCoverage = new Set<string>();
  const allScenarios = new Set<string>();
  
  // From FEATURE_USE_CASES
  categoryFeatures.forEach(f => {
    const uc = FEATURE_USE_CASES[f.id];
    if (uc?.scenarios) {
      uc.scenarios.forEach(s => {
        scenariosFromUseCases.add(s);
        allScenarios.add(s);
      });
    }
  });
  
  // From CROSS_FUNCTIONAL_MAPPINGS
  const relevantCFM = CROSS_FUNCTIONAL_MAPPINGS.filter(m =>
    categoryFilter === 'all' || m.primaryCategory === categoryFilter || featureIds.has(m.primaryFeatureId)
  );
  
  relevantCFM.forEach(m => {
    m.scenarios?.forEach(s => {
      if (!scenariosFromUseCases.has(s)) {
        scenariosFromCrossFunctional.add(s);
      }
      allScenarios.add(s);
    });
  });
  
  // From Generation Coverage (NEW IDENTIFIED - not in other sources)
  const relevantContextMappings = [
    ...INDUSTRY_CAPABILITY_MAPPINGS,
    ...FRAMEWORK_CAPABILITY_MAPPINGS,
    ...VISUAL_CAPABILITY_MAPPINGS,
    ...OUTPUT_CAPABILITY_MAPPINGS
  ].filter(mapping => {
    // Filter by category: check if any required feature matches the category
    if (categoryFilter === 'all') return true;
    return mapping.requiredFeatures.some(rf => {
      const feature = ALL_FEATURES.find(f => f.id === rf.featureId);
      return feature?.category === categoryFilter;
    });
  });
  
  relevantContextMappings.forEach(m => {
    m.scenarios.forEach(s => {
      if (!scenariosFromUseCases.has(s) && !scenariosFromCrossFunctional.has(s)) {
        scenariosFromGenerationCoverage.add(s);
      }
      allScenarios.add(s);
    });
  });
  
  // ==========================================
  // 3. USE CASES - From all sources
  // ==========================================
  const useCasesFromUseCases = new Set<string>();
  const useCasesFromCrossFunctional = new Set<string>();
  const useCasesFromGenerationCoverage = new Set<string>();
  const allUseCases = new Set<string>();
  
  // From FEATURE_USE_CASES (bestFor field)
  categoryFeatures.forEach(f => {
    const uc = FEATURE_USE_CASES[f.id];
    if (uc?.bestFor) {
      uc.bestFor.forEach(b => {
        useCasesFromUseCases.add(b);
        allUseCases.add(b);
      });
    }
  });
  
  // From CROSS_FUNCTIONAL_MAPPINGS
  relevantCFM.forEach(m => {
    m.useCases?.forEach(u => {
      if (!useCasesFromUseCases.has(u)) {
        useCasesFromCrossFunctional.add(u);
      }
      allUseCases.add(u);
    });
  });
  
  // From Generation Coverage (NEW IDENTIFIED)
  relevantContextMappings.forEach(m => {
    m.useCases.forEach(u => {
      if (!useCasesFromUseCases.has(u) && !useCasesFromCrossFunctional.has(u)) {
        useCasesFromGenerationCoverage.add(u);
      }
      allUseCases.add(u);
    });
  });
  
  // ==========================================
  // 4. PROVIDERS - From implementations
  // ==========================================
  const implementedProviders = new Set<ProviderId>();
  const availableProviders = new Set<ProviderId>();
  
  categoryFeatures.forEach(f => {
    const featureImpl = matrix[f.id];
    if (featureImpl) {
      Object.entries(featureImpl).forEach(([providerId, impl]) => {
        if (impl?.implementation === 'implemented') {
          implementedProviders.add(providerId as ProviderId);
        } else if (impl?.implementation === 'partial') {
          implementedProviders.add(providerId as ProviderId);
        }
      });
    }
  });
  
  // Add providers from CROSS_FUNCTIONAL_MAPPINGS
  relevantCFM.forEach(m => {
    m.recommendedProviders?.forEach(p => {
      if (!implementedProviders.has(p)) {
        availableProviders.add(p);
      }
    });
  });
  
  // All unique providers
  const allProviders = new Set([...implementedProviders, ...availableProviders]);
  
  // ==========================================
  // 5. LLMs - From LLM_COMPARISONS
  // ==========================================
  const categoryLLMs = new Set<string>();
  
  // LLMs that have implementations for this category's features
  implementedProviders.forEach(providerId => {
    const llmMatch = LLM_COMPARISONS.find(l => l.providerId === providerId);
    if (llmMatch) {
      categoryLLMs.add(llmMatch.model);
    }
  });
  
  // Also add from CROSS_FUNCTIONAL_MAPPINGS
  relevantCFM.forEach(m => {
    m.recommendedLLMs?.forEach(l => categoryLLMs.add(l));
  });
  
  // ==========================================
  // 6. GAPS - Missing implementations
  // ==========================================
  const gapFeatures: string[] = [];
  const gapProviders: string[] = [];
  const gapScenarios: string[] = [];
  
  categoryFeatures.forEach(f => {
    const featureImpl = matrix[f.id];
    if (!featureImpl || Object.keys(featureImpl).length === 0) {
      gapFeatures.push(f.name);
    }
  });
  
  // Providers that have no implementations for this category
  PROVIDER_SUMMARIES.forEach(p => {
    if (!implementedProviders.has(p.id)) {
      gapProviders.push(p.name);
    }
  });
  
  // ==========================================
  // 7. OPPORTUNITIES - New identified
  // ==========================================
  const newScenarios = Array.from(scenariosFromGenerationCoverage).slice(0, 10);
  const newUseCases = Array.from(useCasesFromGenerationCoverage).slice(0, 10);
  const potentialProviders = Array.from(availableProviders).slice(0, 5);
  
  // ==========================================
  // 8. COVERAGE CALCULATION
  // ==========================================
  const totalFeatures = categoryFeatures.length;
  const coverage = totalFeatures > 0
    ? Math.round(((implemented + partial * 0.5) / totalFeatures) * 100)
    : 0;
  
  return {
    category: categoryFilter,
    features: {
      total: totalFeatures,
      implemented,
      partial,
      planned,
      notStarted
    },
    scenarios: {
      total: allScenarios.size,
      fromFeatureUseCases: scenariosFromUseCases.size,
      fromCrossFunctional: scenariosFromCrossFunctional.size,
      fromGenerationCoverage: scenariosFromGenerationCoverage.size,
      unique: allScenarios
    },
    useCases: {
      total: allUseCases.size,
      fromFeatureUseCases: useCasesFromUseCases.size,
      fromCrossFunctional: useCasesFromCrossFunctional.size,
      fromGenerationCoverage: useCasesFromGenerationCoverage.size,
      unique: allUseCases
    },
    providers: {
      total: allProviders.size,
      implemented: implementedProviders.size,
      available: availableProviders.size,
      unique: allProviders
    },
    llms: {
      total: LLM_COMPARISONS.length,
      forCategory: categoryLLMs.size,
      unique: categoryLLMs
    },
    gaps: {
      total: gapFeatures.length + gapProviders.length,
      features: gapFeatures,
      providers: gapProviders,
      scenarios: gapScenarios
    },
    opportunities: {
      total: newScenarios.length + newUseCases.length,
      newScenarios,
      newUseCases,
      potentialProviders
    },
    coverage
  };
}

// ==========================================
// CATEGORY-SPECIFIC GENERATION COVERAGE STATS
// ==========================================

export function getGenerationCoverageStatsForCategory(
  categoryFilter: FeatureCategory | 'all' = 'all'
): {
  industries: number;
  frameworks: number;
  visuals: number;
  outputs: number;
  features: number;
  scenarios: number;
  useCases: number;
  providers: number;
  models: number;
  newScenarios: number;
  newUseCases: number;
  gaps: number;
  opportunities: number;
} {
  const categoryFeatures = categoryFilter === 'all'
    ? ALL_FEATURES
    : ALL_FEATURES.filter(f => f.category === categoryFilter);
  
  const featureIds = new Set(categoryFeatures.map(f => f.id));
  
  // Filter context mappings by category
  const filterByCategory = (mappings: typeof INDUSTRY_CAPABILITY_MAPPINGS) => {
    if (categoryFilter === 'all') return mappings;
    return mappings.filter(m =>
      m.requiredFeatures.some(rf => featureIds.has(rf.featureId))
    );
  };
  
  const filteredIndustries = filterByCategory(INDUSTRY_CAPABILITY_MAPPINGS);
  const filteredFrameworks = filterByCategory(FRAMEWORK_CAPABILITY_MAPPINGS);
  const filteredVisuals = filterByCategory(VISUAL_CAPABILITY_MAPPINGS);
  const filteredOutputs = filterByCategory(OUTPUT_CAPABILITY_MAPPINGS);
  const filteredFeatures = categoryFilter === 'all'
    ? FEATURE_CONTEXT_MAPPINGS
    : FEATURE_CONTEXT_MAPPINGS.filter(f => f.category === categoryFilter);
  
  // Collect unique values
  const allScenarios = new Set<string>();
  const allUseCases = new Set<string>();
  const allProviders = new Set<string>();
  const allModels = new Set<string>();
  const baselineScenarios = new Set<string>();
  const baselineUseCases = new Set<string>();
  
  // Get baseline from FEATURE_USE_CASES
  categoryFeatures.forEach(f => {
    const uc = FEATURE_USE_CASES[f.id];
    if (uc?.scenarios) uc.scenarios.forEach(s => baselineScenarios.add(s));
    if (uc?.bestFor) uc.bestFor.forEach(b => baselineUseCases.add(b));
  });
  
  // Aggregate from filtered mappings
  [...filteredIndustries, ...filteredFrameworks, ...filteredVisuals, ...filteredOutputs].forEach(m => {
    m.scenarios.forEach(s => allScenarios.add(s));
    m.useCases.forEach(u => allUseCases.add(u));
    Object.values(m.recommendedProviders).forEach(pList => {
      if (pList) pList.forEach(p => p.providers.forEach(provider => allProviders.add(provider)));
    });
    m.recommendedModels.forEach(model => model.modelIds.forEach(id => allModels.add(id)));
  });
  
  // Feature mappings
  filteredFeatures.forEach(f => {
    if (f.scenarios) f.scenarios.forEach(s => allScenarios.add(s));
    if (f.useCases) f.useCases.forEach(u => allUseCases.add(u));
    if (f.recommendedProviders) f.recommendedProviders.forEach(p => allProviders.add(p));
    if (f.recommendedLLMs) f.recommendedLLMs.forEach(l => allModels.add(l));
  });
  
  // Calculate new (not in baseline)
  const newScenarios = Array.from(allScenarios).filter(s => !baselineScenarios.has(s)).length;
  const newUseCases = Array.from(allUseCases).filter(u => !baselineUseCases.has(u)).length;
  
  // Count gaps and opportunities from features
  let gaps = 0;
  let opportunities = 0;
  
  filteredFeatures.forEach(f => {
    const hasProviders = (f.recommendedProviders?.length || 0) > 0;
    const hasContexts = f.usedByIndustries.length + f.usedByFrameworks.length > 0;
    
    if (!hasProviders && !hasContexts) gaps++;
    if (hasProviders && !hasContexts) opportunities++;
  });
  
  return {
    industries: filteredIndustries.length,
    frameworks: filteredFrameworks.length,
    visuals: filteredVisuals.length,
    outputs: filteredOutputs.length,
    features: filteredFeatures.length,
    scenarios: allScenarios.size,
    useCases: allUseCases.size,
    providers: allProviders.size,
    models: allModels.size,
    newScenarios,
    newUseCases,
    gaps,
    opportunities
  };
}

export default calculateUnifiedMetrics;
