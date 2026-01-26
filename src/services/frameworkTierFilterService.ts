/**
 * Framework Tier Filter Service
 * 
 * Provides tier-based filtering for frameworks in the wizard.
 * Frameworks have tier: 1 | 2 | 3 which maps to Standard/Advanced/Premium.
 */

import { 
  EXPANDED_FRAMEWORK_CATEGORIES, 
  Framework, 
  FrameworkCategory,
  getFrameworksByType,
  getAllFrameworks
} from '@/components/genie-studio/presentation-generator/constants/expandedFrameworks';
import { GlobalTier } from '@/services/shared/globalTierService';

export interface FilteredFrameworkCategory extends FrameworkCategory {
  totalCount: number;
  filteredCount: number;
  hasLockedItems: boolean;
}

export interface FrameworkFilterResult {
  categories: FilteredFrameworkCategory[];
  totalFrameworks: number;
  availableFrameworks: number;
  lockedFrameworks: number;
}

// Convert GlobalTier to numeric for comparison
const tierToNumeric = (tier: GlobalTier): number => {
  switch (tier) {
    case 'standard': return 1;
    case 'advanced': return 2;
    case 'premium': return 3;
  }
};

/**
 * Filter frameworks by user's tier level
 */
export function filterFrameworksByTier(
  tier: GlobalTier | 1 | 2 | 3
): FrameworkFilterResult {
  const numericTier = typeof tier === 'number' ? tier : tierToNumeric(tier);
  
  let totalFrameworks = 0;
  let availableFrameworks = 0;
  
  const categories = EXPANDED_FRAMEWORK_CATEGORIES.map(category => {
    const totalCount = category.frameworks.length;
    totalFrameworks += totalCount;
    
    const filteredFrameworks = category.frameworks.filter(fw => fw.tier <= numericTier);
    const filteredCount = filteredFrameworks.length;
    availableFrameworks += filteredCount;
    
    return {
      ...category,
      frameworks: filteredFrameworks,
      totalCount,
      filteredCount,
      hasLockedItems: filteredCount < totalCount,
    };
  });
  
  return {
    categories,
    totalFrameworks,
    availableFrameworks,
    lockedFrameworks: totalFrameworks - availableFrameworks,
  };
}

/**
 * Get all frameworks for a tier (flat list)
 */
export function getFrameworksForTier(tier: GlobalTier | 1 | 2 | 3): Framework[] {
  const numericTier = typeof tier === 'number' ? tier : tierToNumeric(tier);
  return getAllFrameworks().filter(fw => fw.tier <= numericTier);
}

/**
 * Check if a specific framework is available for a tier
 */
export function isFrameworkAvailable(
  frameworkId: string, 
  tier: GlobalTier | 1 | 2 | 3
): boolean {
  const numericTier = typeof tier === 'number' ? tier : tierToNumeric(tier);
  const framework = getAllFrameworks().find(fw => fw.id === frameworkId);
  return framework ? framework.tier <= numericTier : false;
}

/**
 * Get framework categories by type with tier filtering
 */
export function getFilteredFrameworksByType(
  type: FrameworkCategory['type'],
  tier: GlobalTier | 1 | 2 | 3
): FilteredFrameworkCategory[] {
  const numericTier = typeof tier === 'number' ? tier : tierToNumeric(tier);
  const categories = getFrameworksByType(type);
  
  return categories.map(category => {
    const totalCount = category.frameworks.length;
    const filteredFrameworks = category.frameworks.filter(fw => fw.tier <= numericTier);
    
    return {
      ...category,
      frameworks: filteredFrameworks,
      totalCount,
      filteredCount: filteredFrameworks.length,
      hasLockedItems: filteredFrameworks.length < totalCount,
    };
  });
}

/**
 * Get tier badge info for display
 */
export function getFrameworkTierBadge(tier: 1 | 2 | 3): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (tier) {
    case 1:
      return { label: 'Standard', color: 'text-slate-600', bgColor: 'bg-slate-100' };
    case 2:
      return { label: 'Advanced', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    case 3:
      return { label: 'Premium', color: 'text-purple-600', bgColor: 'bg-purple-100' };
  }
}

/**
 * Get upgrade prompt for locked frameworks
 */
export function getFrameworkUpgradePrompt(requiredTier: 1 | 2 | 3): {
  title: string;
  description: string;
  cta: string;
  targetTier: GlobalTier;
} {
  switch (requiredTier) {
    case 2:
      return {
        title: 'Upgrade to Advanced',
        description: 'Unlock advanced frameworks for deeper analysis and specialized methodologies.',
        cta: 'Upgrade to Pro',
        targetTier: 'advanced',
      };
    case 3:
      return {
        title: 'Upgrade to Premium',
        description: 'Access premium frameworks including regional strategies and enterprise methodologies.',
        cta: 'Upgrade to Business',
        targetTier: 'premium',
      };
    default:
      return {
        title: 'Upgrade Your Plan',
        description: 'Unlock more frameworks with a higher tier subscription.',
        cta: 'View Plans',
        targetTier: 'advanced',
      };
  }
}

/**
 * Get recommended frameworks based on industry and tier
 */
export function getRecommendedFrameworks(
  industry: string,
  tier: GlobalTier | 1 | 2 | 3,
  limit: number = 5
): Framework[] {
  const numericTier = typeof tier === 'number' ? tier : tierToNumeric(tier);
  const availableFrameworks = getAllFrameworks().filter(fw => fw.tier <= numericTier);
  
  // Industry-specific recommendations
  const industryMap: Record<string, string[]> = {
    healthcare: ['patient-journey', 'value-based-care', 'hipaa-compliance', 'swot'],
    finance: ['risk-assessment', 'regulatory', 'balanced-scorecard', 'porter-five'],
    technology: ['lean-startup', 'design-thinking', 'saas-metrics', 'okr'],
    manufacturing: ['lean-manufacturing', 'six-sigma', 'kaizen', 'value-chain'],
    retail: ['omnichannel', 'customer-lifecycle', 'nps', 'pirate-metrics'],
    consulting: ['mece', 'pyramid', 'swot', 'porter-five', 'growth-share-matrix'],
  };
  
  const recommendedIds = industryMap[industry.toLowerCase()] || ['swot', 'porter-five', 'okr'];
  
  // Get recommended frameworks that are available
  const recommended = recommendedIds
    .map(id => availableFrameworks.find(fw => fw.id === id))
    .filter((fw): fw is Framework => !!fw);
  
  // Fill remaining slots with other available frameworks
  const remaining = availableFrameworks
    .filter(fw => !recommendedIds.includes(fw.id))
    .slice(0, limit - recommended.length);
  
  return [...recommended, ...remaining].slice(0, limit);
}

export const frameworkTierFilterService = {
  filterFrameworksByTier,
  getFrameworksForTier,
  isFrameworkAvailable,
  getFilteredFrameworksByType,
  getFrameworkTierBadge,
  getFrameworkUpgradePrompt,
  getRecommendedFrameworks,
};

export default frameworkTierFilterService;
