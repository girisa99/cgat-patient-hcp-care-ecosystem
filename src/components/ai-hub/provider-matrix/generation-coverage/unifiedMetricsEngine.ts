/**
 * Unified Metrics Engine
 * 
 * Single source of truth for metrics across all Provider Matrix tabs.
 * Ensures consistent calculations for scenarios, use cases, providers, and LLMs
 * whether filtering by category or showing all data.
 * 
 * UPDATED: Now provides comprehensive aggregation of ALL scenarios and use cases
 * from ALL data sources (FEATURE_USE_CASES, CROSS_FUNCTIONAL_MAPPINGS, 
 * INDUSTRY/FRAMEWORK/VISUAL/OUTPUT mappings, and FEATURE_CONTEXT_MAPPINGS).
 * 
 * Tracks:
 * - Inherited data (from FEATURE_USE_CASES, CROSS_FUNCTIONAL_MAPPINGS)
 * - Context-level data (from Industry, Framework, Visual, Output mappings)
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
    fromContextMappings: number;   // From Industry/Framework/Visual/Output mappings
    unique: Set<string>;
    list: string[];                // Array for iteration
  };
  
  useCases: {
    total: number;
    fromFeatureUseCases: number;   // From FEATURE_USE_CASES (bestFor)
    fromCrossFunctional: number;   // From CROSS_FUNCTIONAL_MAPPINGS
    fromGenerationCoverage: number; // From Generation Coverage registry (new identified)
    fromContextMappings: number;   // From Industry/Framework/Visual/Output mappings
    unique: Set<string>;
    list: string[];                // Array for iteration
  };
  
  // Providers - from actual implementations
  providers: {
    total: number;
    implemented: number; // Actually have implementations
    available: number;   // Available but not implemented
    unique: Set<ProviderId>;
    list: ProviderId[];  // Array for iteration
  };
  
  // LLMs - from LLM_COMPARISONS
  llms: {
    total: number;
    forCategory: number;
    unique: Set<string>;
    list: string[];      // Array for iteration
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
  // 2. SCENARIOS - From all sources (including context mappings)
  // ==========================================
  const scenariosFromUseCases = new Set<string>();
  const scenariosFromCrossFunctional = new Set<string>();
  const scenariosFromGenerationCoverage = new Set<string>();
  const scenariosFromContextMappings = new Set<string>();
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
  
  // From Context Mappings (Industry, Framework, Visual, Output)
  const contextMappings = [
    ...INDUSTRY_CAPABILITY_MAPPINGS,
    ...FRAMEWORK_CAPABILITY_MAPPINGS,
    ...VISUAL_CAPABILITY_MAPPINGS,
    ...OUTPUT_CAPABILITY_MAPPINGS,
  ].filter(m => categoryFilter === 'all' || 
    m.requiredFeatures.some(rf => rf.category === categoryFilter || featureIds.has(rf.featureId))
  );
  
  contextMappings.forEach(m => {
    m.scenarios?.forEach(s => {
      if (!scenariosFromUseCases.has(s) && !scenariosFromCrossFunctional.has(s)) {
        scenariosFromContextMappings.add(s);
      }
      allScenarios.add(s);
    });
  });
  
  // From FEATURE_CONTEXT_MAPPINGS (generation coverage feature-level)
  const relevantFeatureMappings = FEATURE_CONTEXT_MAPPINGS.filter(mapping => {
    if (categoryFilter === 'all') return true;
    return mapping.category === categoryFilter;
  });
  
  relevantFeatureMappings.forEach(m => {
    m.scenarios?.forEach(s => {
      if (!scenariosFromUseCases.has(s) && !scenariosFromCrossFunctional.has(s) && !scenariosFromContextMappings.has(s)) {
        scenariosFromGenerationCoverage.add(s);
      }
      allScenarios.add(s);
    });
  });
  
  // ==========================================
  // 3. USE CASES - From all sources (including context mappings)
  // ==========================================
  const useCasesFromUseCases = new Set<string>();
  const useCasesFromCrossFunctional = new Set<string>();
  const useCasesFromGenerationCoverage = new Set<string>();
  const useCasesFromContextMappings = new Set<string>();
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
  
  // From Context Mappings (Industry, Framework, Visual, Output)
  contextMappings.forEach(m => {
    m.useCases?.forEach(u => {
      if (!useCasesFromUseCases.has(u) && !useCasesFromCrossFunctional.has(u)) {
        useCasesFromContextMappings.add(u);
      }
      allUseCases.add(u);
    });
  });
  
  // From FEATURE_CONTEXT_MAPPINGS (new identified)
  relevantFeatureMappings.forEach(m => {
    m.useCases?.forEach(u => {
      if (!useCasesFromUseCases.has(u) && !useCasesFromCrossFunctional.has(u) && !useCasesFromContextMappings.has(u)) {
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
      fromContextMappings: scenariosFromContextMappings.size,
      unique: allScenarios,
      list: Array.from(allScenarios)
    },
    useCases: {
      total: allUseCases.size,
      fromFeatureUseCases: useCasesFromUseCases.size,
      fromCrossFunctional: useCasesFromCrossFunctional.size,
      fromGenerationCoverage: useCasesFromGenerationCoverage.size,
      fromContextMappings: useCasesFromContextMappings.size,
      unique: allUseCases,
      list: Array.from(allUseCases)
    },
    providers: {
      total: allProviders.size,
      implemented: implementedProviders.size,
      available: availableProviders.size,
      unique: allProviders,
      list: Array.from(allProviders)
    },
    llms: {
      total: LLM_COMPARISONS.length,
      forCategory: categoryLLMs.size,
      unique: categoryLLMs,
      list: Array.from(categoryLLMs)
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
// Now properly filters context mappings by which features they require
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
  // Include mappings where:
  // 1. Any requiredFeature's featureId matches our category's features, OR
  // 2. Any requiredFeature's category matches our filter
  const filteredIndustries = categoryFilter === 'all' 
    ? INDUSTRY_CAPABILITY_MAPPINGS
    : INDUSTRY_CAPABILITY_MAPPINGS.filter(m =>
        m.requiredFeatures.some(rf => 
          featureIds.has(rf.featureId) || rf.category === categoryFilter
        )
      );
  
  const filteredFrameworks = categoryFilter === 'all'
    ? FRAMEWORK_CAPABILITY_MAPPINGS
    : FRAMEWORK_CAPABILITY_MAPPINGS.filter(m =>
        m.requiredFeatures.some(rf => 
          featureIds.has(rf.featureId) || rf.category === categoryFilter
        )
      );
  
  const filteredVisuals = categoryFilter === 'all'
    ? VISUAL_CAPABILITY_MAPPINGS
    : VISUAL_CAPABILITY_MAPPINGS.filter(m =>
        m.requiredFeatures.some(rf => 
          featureIds.has(rf.featureId) || rf.category === categoryFilter
        )
      );
  
  const filteredOutputs = categoryFilter === 'all'
    ? OUTPUT_CAPABILITY_MAPPINGS
    : OUTPUT_CAPABILITY_MAPPINGS.filter(m =>
        m.requiredFeatures.some(rf => 
          featureIds.has(rf.featureId) || rf.category === categoryFilter
        )
      );
  
  const filteredFeatures = categoryFilter === 'all'
    ? FEATURE_CONTEXT_MAPPINGS
    : FEATURE_CONTEXT_MAPPINGS.filter(f => f.category === categoryFilter);
  
  // Collect unique values from FILTERED FEATURE mappings only (NOT context mappings)
  // Context mappings (industries, frameworks, etc.) count contexts, NOT scenarios/useCases
  const allScenarios = new Set<string>();
  const allUseCases = new Set<string>();
  const allProviders = new Set<string>();
  const allModels = new Set<string>();
  const baselineScenarios = new Set<string>();
  const baselineUseCases = new Set<string>();
  
  // Get baseline from FEATURE_USE_CASES (for this category only)
  categoryFeatures.forEach(f => {
    const uc = FEATURE_USE_CASES[f.id];
    if (uc?.scenarios) uc.scenarios.forEach(s => baselineScenarios.add(s));
    if (uc?.bestFor) uc.bestFor.forEach(b => baselineUseCases.add(b));
  });
  
  // FIXED: Only aggregate providers/models from context mappings, NOT scenarios/useCases
  // Scenarios and useCases belong at the FEATURE level, not the context level
  [...filteredIndustries, ...filteredFrameworks, ...filteredVisuals, ...filteredOutputs].forEach(m => {
    // Don't add m.scenarios or m.useCases - those are context-specific, not generation-level
    Object.values(m.recommendedProviders).forEach(pList => {
      if (pList) pList.forEach(p => p.providers.forEach(provider => allProviders.add(provider)));
    });
    m.recommendedModels.forEach(model => model.modelIds.forEach(id => allModels.add(id)));
  });
  
  // Feature mappings (already filtered by category) - these DO have scenarios/useCases
  filteredFeatures.forEach(f => {
    if (f.scenarios) f.scenarios.forEach(s => allScenarios.add(s));
    if (f.useCases) f.useCases.forEach(u => allUseCases.add(u));
    if (f.recommendedProviders) f.recommendedProviders.forEach(p => allProviders.add(p));
    if (f.recommendedLLMs) f.recommendedLLMs.forEach(l => allModels.add(l));
  });
  
  // Calculate new (not in baseline) - these are Generation Coverage's unique contributions
  // FIXED: Now this only counts feature-level scenarios, not context scenarios
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

// ==========================================
// BLOCKER DATA FOR DEPENDENCY ANALYSIS
// Provides unified blocker information across all sources
// ==========================================

export interface BlockedItem {
  id: string;
  name: string;
  type: 'feature' | 'context';
  contextType?: 'industry' | 'framework' | 'visual' | 'output';
  category: FeatureCategory | 'all';
  blockedBy: {
    featureId: string;
    featureName: string;
    category: FeatureCategory;
  }[];
  blocksCount: number;
  blocks: string[];
  criticalPath: boolean;
  source: 'cross-functional' | 'feature-matrix' | 'gen-coverage';
}

export interface ReadyItem {
  id: string;
  name: string;
  type: 'feature' | 'context';
  contextType?: 'industry' | 'framework' | 'visual' | 'output';
  category: FeatureCategory | 'all';
  unlocksCount: number;
  unlocks: string[];
  effort: 'low' | 'medium' | 'high';
  priority: 'critical' | 'high' | 'medium' | 'low';
  source: 'cross-functional' | 'feature-matrix' | 'gen-coverage';
}

export function getBlockerAnalysisData(
  categoryFilter: FeatureCategory | 'all' = 'all'
): {
  blockedItems: BlockedItem[];
  readyItems: ReadyItem[];
  stats: {
    total: number;
    blocked: number;
    ready: number;
    implemented: number;
    criticalBlockers: number;
  };
} {
  const blockedItems: BlockedItem[] = [];
  const readyItems: ReadyItem[] = [];
  
  const categoryFeatures = categoryFilter === 'all'
    ? ALL_FEATURES
    : ALL_FEATURES.filter(f => f.category === categoryFilter);
  
  const featureIds = new Set(categoryFeatures.map(f => f.id));
  
  // Build dependency graph from CROSS_FUNCTIONAL_MAPPINGS
  const reverseDepMap = new Map<string, Set<string>>(); // feature → features that depend on it
  const forwardDepMap = new Map<string, Set<string>>(); // feature → features it depends on
  
  CROSS_FUNCTIONAL_MAPPINGS.forEach(m => {
    if (categoryFilter !== 'all' && m.primaryCategory !== categoryFilter && !featureIds.has(m.primaryFeatureId)) {
      return;
    }
    
    m.relatedFeatures?.forEach(rf => {
      if (rf.relationship === 'requires') {
        // m.primaryFeatureId requires rf.featureId
        if (!forwardDepMap.has(m.primaryFeatureId)) {
          forwardDepMap.set(m.primaryFeatureId, new Set());
        }
        forwardDepMap.get(m.primaryFeatureId)!.add(rf.featureId);
        
        // rf.featureId is required by m.primaryFeatureId
        if (!reverseDepMap.has(rf.featureId)) {
          reverseDepMap.set(rf.featureId, new Set());
        }
        reverseDepMap.get(rf.featureId)!.add(m.primaryFeatureId);
      }
    });
  });
  
  // Also add blockers from Generation Coverage context mappings
  const contextMappings = [
    ...INDUSTRY_CAPABILITY_MAPPINGS.map(m => ({ ...m, ctxType: 'industry' as const })),
    ...FRAMEWORK_CAPABILITY_MAPPINGS.map(m => ({ ...m, ctxType: 'framework' as const })),
    ...VISUAL_CAPABILITY_MAPPINGS.map(m => ({ ...m, ctxType: 'visual' as const })),
    ...OUTPUT_CAPABILITY_MAPPINGS.map(m => ({ ...m, ctxType: 'output' as const })),
  ];
  
  // Process context mappings for blockers
  contextMappings.forEach(mapping => {
    // Check if context matches category filter
    const matchesCategory = categoryFilter === 'all' || 
      mapping.requiredFeatures.some(rf => rf.category === categoryFilter || featureIds.has(rf.featureId));
    
    if (!matchesCategory) return;
    
    const missingCritical = mapping.requiredFeatures.filter(rf => {
      if (rf.priority !== 'critical') return false;
      const featureMapping = FEATURE_CONTEXT_MAPPINGS.find(f => f.featureId === rf.featureId);
      return !featureMapping?.recommendedProviders?.length;
    });
    
    const contextId = `${mapping.ctxType}:${mapping.contextId}`;
    
    if (missingCritical.length > 0) {
      blockedItems.push({
        id: contextId,
        name: mapping.contextName,
        type: 'context',
        contextType: mapping.ctxType,
        category: categoryFilter,
        blockedBy: missingCritical.map(rf => ({
          featureId: rf.featureId,
          featureName: rf.featureId,
          category: rf.category as FeatureCategory
        })),
        blocksCount: 0,
        blocks: [],
        criticalPath: missingCritical.length >= 2,
        source: 'gen-coverage'
      });
    } else {
      // This context is ready to implement
      readyItems.push({
        id: contextId,
        name: mapping.contextName,
        type: 'context',
        contextType: mapping.ctxType,
        category: categoryFilter,
        unlocksCount: 0,
        unlocks: [],
        effort: mapping.requiredFeatures.length > 3 ? 'medium' : 'low',
        priority: 'medium',
        source: 'gen-coverage'
      });
    }
  });
  
  // Process features
  categoryFeatures.forEach(feature => {
    const featureImpl = FEATURE_IMPLEMENTATION_MATRIX[feature.id];
    const isImplemented = featureImpl && Object.values(featureImpl).some(p => p?.implementation === 'implemented');
    
    if (isImplemented) return; // Skip implemented features
    
    const blockedByFeatures = forwardDepMap.get(feature.id);
    const blocksFeatures = reverseDepMap.get(feature.id);
    
    // Check which blockers are not implemented
    const unresolvedBlockers: { featureId: string; featureName: string; category: FeatureCategory }[] = [];
    
    if (blockedByFeatures) {
      blockedByFeatures.forEach(blockerId => {
        const blockerImpl = FEATURE_IMPLEMENTATION_MATRIX[blockerId];
        const blockerIsImplemented = blockerImpl && Object.values(blockerImpl).some(p => p?.implementation === 'implemented');
        
        if (!blockerIsImplemented) {
          const blockerFeature = ALL_FEATURES.find(f => f.id === blockerId);
          unresolvedBlockers.push({
            featureId: blockerId,
            featureName: blockerFeature?.name || blockerId,
            category: blockerFeature?.category as FeatureCategory || 'INPUT'
          });
        }
      });
    }
    
    if (unresolvedBlockers.length > 0) {
      blockedItems.push({
        id: feature.id,
        name: feature.name,
        type: 'feature',
        category: feature.category,
        blockedBy: unresolvedBlockers,
        blocksCount: blocksFeatures?.size || 0,
        blocks: blocksFeatures ? Array.from(blocksFeatures) : [],
        criticalPath: (blocksFeatures?.size || 0) >= 3,
        source: 'cross-functional'
      });
    } else {
      // Feature is ready to implement
      readyItems.push({
        id: feature.id,
        name: feature.name,
        type: 'feature',
        category: feature.category,
        unlocksCount: blocksFeatures?.size || 0,
        unlocks: blocksFeatures ? Array.from(blocksFeatures) : [],
        effort: feature.priority === 'critical' ? 'high' : 'medium',
        priority: feature.priority as 'critical' | 'high' | 'medium' | 'low',
        source: 'cross-functional'
      });
    }
  });
  
  // Sort by impact
  blockedItems.sort((a, b) => b.blocksCount - a.blocksCount);
  readyItems.sort((a, b) => b.unlocksCount - a.unlocksCount);
  
  return {
    blockedItems,
    readyItems,
    stats: {
      total: categoryFeatures.length + contextMappings.filter(m => 
        categoryFilter === 'all' || m.requiredFeatures.some(rf => rf.category === categoryFilter)
      ).length,
      blocked: blockedItems.length,
      ready: readyItems.length,
      implemented: categoryFeatures.filter(f => {
        const impl = FEATURE_IMPLEMENTATION_MATRIX[f.id];
        return impl && Object.values(impl).some(p => p?.implementation === 'implemented');
      }).length,
      criticalBlockers: blockedItems.filter(b => b.criticalPath).length
    }
  };
}

export default calculateUnifiedMetrics;
