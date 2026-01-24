/**
 * Expanded Framework Categories
 * Regional + Industry-Specific + Methodology Types + Content Frameworks
 * Generic names (no trademarked firm names)
 * 
 * Now integrated with ContentFrameworksRegistry for full coverage:
 * - Business Presentation Frameworks (14 frameworks)
 * - Video Content Frameworks (12 frameworks)
 * - Training Content Frameworks (12 frameworks)
 * - Marketing Content Frameworks (12 frameworks)
 * - Regional Framework Preferences (14 regions)
 */

import {
  ContentFrameworksRegistry,
  BUSINESS_PRESENTATION_FRAMEWORKS,
  VIDEO_CONTENT_FRAMEWORKS,
  TRAINING_CONTENT_FRAMEWORKS,
  MARKETING_CONTENT_FRAMEWORKS,
  REGIONAL_FRAMEWORK_PREFERENCES
} from '@/services/contentFrameworksRegistry';

export interface Framework {
  id: string;
  name: string;
  description: string;
  tier: 1 | 2 | 3;
}

export interface FrameworkCategory {
  id: string;
  name: string;
  subtitle?: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  type: 'consulting' | 'industry' | 'methodology' | 'regional' | 'business' | 'video' | 'training' | 'marketing';
  frameworks: Framework[];
}

// ==================== LEGACY FRAMEWORK CATEGORIES ====================
// These are the original consulting/industry/methodology frameworks

export const LEGACY_FRAMEWORK_CATEGORIES: FrameworkCategory[] = [
  // ==================== CONSULTING STYLES (Generic Names) ====================
  { id: 'tier1-strategy', name: 'Tier 1 Strategy', subtitle: 'Executive Consulting', icon: 'Building2', color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Strategic analysis frameworks', type: 'consulting',
    frameworks: [
      { id: '7s', name: '7S Framework', description: 'Organization alignment', tier: 1 },
      { id: 'mece', name: 'MECE Principle', description: 'Mutually exclusive, collectively exhaustive', tier: 1 },
      { id: 'pyramid', name: 'Pyramid Principle', description: 'Structured communication', tier: 1 },
      { id: 'three-horizons', name: 'Three Horizons', description: 'Growth strategy', tier: 2 },
      { id: 'influence-model', name: 'Influence Model', description: 'Change management', tier: 2 }
    ]},
  { id: 'portfolio-analysis', name: 'Portfolio Analysis', subtitle: 'Growth & Investment', icon: 'TrendingUp', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Portfolio and market analysis', type: 'consulting',
    frameworks: [
      { id: 'growth-share-matrix', name: 'Growth-Share Matrix', description: 'Portfolio management', tier: 1 },
      { id: 'market-positioning', name: 'Market Positioning', description: 'Competitive positioning', tier: 1 },
      { id: 'experience-curve', name: 'Experience Curve', description: 'Cost optimization', tier: 2 },
      { id: 'advantage-matrix', name: 'Advantage Matrix', description: 'Competitive advantage', tier: 2 }
    ]},
  { id: 'results-driven', name: 'Results-Driven', subtitle: 'Outcome-Focused', icon: 'Target', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Results and outcomes focused', type: 'consulting',
    frameworks: [
      { id: 'nps', name: 'NPS Analysis', description: 'Customer loyalty', tier: 1 },
      { id: 'full-potential', name: 'Full Potential', description: 'Value creation', tier: 2 },
      { id: 'decision-insights', name: 'Decision Insights', description: 'Data-driven decisions', tier: 2 }
    ]},
  { id: 'universal', name: 'Universal Frameworks', subtitle: 'Industry Standard', icon: 'BarChart3', color: 'text-purple-600', bgColor: 'bg-purple-50', description: 'Widely-used business frameworks', type: 'consulting',
    frameworks: [
      { id: 'swot', name: 'SWOT Analysis', description: 'Strengths, weaknesses, opportunities, threats', tier: 1 },
      { id: 'porter-five', name: "Porter's Five Forces", description: 'Industry analysis', tier: 1 },
      { id: 'value-chain', name: 'Value Chain', description: 'Activity analysis', tier: 1 },
      { id: 'competitive-analysis', name: 'Competitive Analysis', description: 'Market comparison', tier: 1 }
    ]},

  // ==================== METHODOLOGY TYPES ====================
  { id: 'strategy', name: 'Strategy Frameworks', icon: 'Compass', color: 'text-indigo-600', bgColor: 'bg-indigo-50', description: 'Strategic planning methodologies', type: 'methodology',
    frameworks: [
      { id: 'swot', name: 'SWOT Analysis', description: 'Strengths, weaknesses, opportunities, threats', tier: 1 },
      { id: 'porter-five', name: "Porter's Five Forces", description: 'Industry analysis', tier: 1 },
      { id: 'pestle', name: 'PESTLE', description: 'Macro-environment analysis', tier: 1 },
      { id: 'value-chain', name: 'Value Chain', description: 'Activity analysis', tier: 1 },
      { id: 'ansoff', name: 'Ansoff Matrix', description: 'Growth strategies', tier: 2 },
      { id: 'blue-ocean', name: 'Blue Ocean', description: 'Market creation', tier: 2 },
      { id: 'balanced-scorecard', name: 'Balanced Scorecard', description: 'Performance management', tier: 2 }
    ]},
  { id: 'innovation', name: 'Innovation Frameworks', icon: 'Lightbulb', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Innovation methodologies', type: 'methodology',
    frameworks: [
      { id: 'design-thinking', name: 'Design Thinking', description: 'Human-centered design', tier: 1 },
      { id: 'lean-startup', name: 'Lean Startup', description: 'Build-measure-learn', tier: 1 },
      { id: 'jobs-to-be-done', name: 'Jobs To Be Done', description: 'Customer needs', tier: 2 },
      { id: 'stage-gate', name: 'Stage-Gate', description: 'Product development', tier: 2 }
    ]},
  { id: 'agile', name: 'Agile & Lean', icon: 'Zap', color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'Agile methodologies', type: 'methodology',
    frameworks: [
      { id: 'scrum', name: 'Scrum', description: 'Sprint-based delivery', tier: 1 },
      { id: 'kanban', name: 'Kanban', description: 'Visual workflow', tier: 1 },
      { id: 'safe', name: 'SAFe', description: 'Scaled Agile', tier: 2 },
      { id: 'okr', name: 'OKRs', description: 'Objectives and key results', tier: 1 }
    ]},

  // ==================== INDUSTRY-SPECIFIC ====================
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart', color: 'text-pink-600', bgColor: 'bg-pink-50', description: 'Healthcare industry frameworks', type: 'industry',
    frameworks: [
      { id: 'patient-journey', name: 'Patient Journey', description: 'Care pathway mapping', tier: 1 },
      { id: 'value-based-care', name: 'Value-Based Care', description: 'Outcome-focused care', tier: 2 },
      { id: 'care-model', name: 'Care Model Canvas', description: 'Care delivery design', tier: 2 },
      { id: 'hipaa-compliance', name: 'HIPAA Compliance', description: 'Privacy framework', tier: 1 }
    ]},
  { id: 'fintech', name: 'Finance & FinTech', icon: 'Wallet', color: 'text-emerald-600', bgColor: 'bg-emerald-50', description: 'Financial services frameworks', type: 'industry',
    frameworks: [
      { id: 'risk-assessment', name: 'Risk Assessment', description: 'Financial risk analysis', tier: 1 },
      { id: 'regulatory', name: 'Regulatory Compliance', description: 'Financial regulations', tier: 2 },
      { id: 'fintech-stack', name: 'FinTech Stack', description: 'Technology architecture', tier: 2 }
    ]},
  { id: 'saas', name: 'SaaS & Tech', icon: 'Cloud', color: 'text-sky-600', bgColor: 'bg-sky-50', description: 'Software/SaaS frameworks', type: 'industry',
    frameworks: [
      { id: 'saas-metrics', name: 'SaaS Metrics', description: 'MRR, ARR, Churn', tier: 1 },
      { id: 'product-led', name: 'Product-Led Growth', description: 'PLG strategy', tier: 2 },
      { id: 'pirate-metrics', name: 'AARRR Metrics', description: 'Pirate metrics', tier: 1 }
    ]},
  { id: 'retail', name: 'Retail & E-commerce', icon: 'ShoppingCart', color: 'text-amber-600', bgColor: 'bg-amber-50', description: 'Retail industry frameworks', type: 'industry',
    frameworks: [
      { id: 'omnichannel', name: 'Omnichannel Strategy', description: 'Multi-channel retail', tier: 1 },
      { id: 'customer-lifecycle', name: 'Customer Lifecycle', description: 'CLV optimization', tier: 2 },
      { id: 'retail-analytics', name: 'Retail Analytics', description: 'Store performance', tier: 2 }
    ]},
  { id: 'manufacturing', name: 'Manufacturing', icon: 'Factory', color: 'text-slate-600', bgColor: 'bg-slate-50', description: 'Manufacturing frameworks', type: 'industry',
    frameworks: [
      { id: 'lean-manufacturing', name: 'Lean Manufacturing', description: 'Waste reduction', tier: 1 },
      { id: 'six-sigma', name: 'Six Sigma', description: 'Quality management', tier: 2 },
      { id: 'industry-4', name: 'Industry 4.0', description: 'Digital transformation', tier: 2 }
    ]},

  // ==================== REGIONAL ====================
  { id: 'apac', name: 'Asia-Pacific', icon: 'Globe', color: 'text-rose-600', bgColor: 'bg-rose-50', description: 'APAC business frameworks', type: 'regional',
    frameworks: [
      { id: 'guanxi', name: 'Guanxi Networks', description: 'Relationship-based business', tier: 2 },
      { id: 'kaizen', name: 'Kaizen', description: 'Continuous improvement', tier: 1 },
      { id: 'keiretsu', name: 'Keiretsu Model', description: 'Business networks', tier: 2 },
      { id: 'china-market', name: 'China Market Entry', description: 'China strategy', tier: 2 }
    ]},
  { id: 'emea', name: 'Europe & MEA', icon: 'Globe', color: 'text-violet-600', bgColor: 'bg-violet-50', description: 'EMEA frameworks', type: 'regional',
    frameworks: [
      { id: 'gdpr', name: 'GDPR Compliance', description: 'Data privacy', tier: 1 },
      { id: 'eu-sustainability', name: 'EU Sustainability', description: 'ESG frameworks', tier: 2 },
      { id: 'mena-market', name: 'MENA Market Entry', description: 'Middle East strategy', tier: 2 }
    ]},
  { id: 'americas', name: 'Americas', icon: 'Globe', color: 'text-cyan-600', bgColor: 'bg-cyan-50', description: 'Americas frameworks', type: 'regional',
    frameworks: [
      { id: 'us-market', name: 'US Market Entry', description: 'US expansion', tier: 1 },
      { id: 'latam-growth', name: 'LATAM Growth', description: 'Latin America strategy', tier: 2 },
      { id: 'soc2', name: 'SOC 2 Compliance', description: 'Security compliance', tier: 2 }
    ]}
];

// ==================== CONTENT FRAMEWORK CATEGORIES (NEW) ====================
// These are mapped from the ContentFrameworksRegistry

export const CONTENT_FRAMEWORK_CATEGORIES: FrameworkCategory[] = [
  // Business Presentation Frameworks
  {
    id: 'business-presentation',
    name: 'Business Presentation',
    subtitle: 'Slides & Decks',
    icon: 'Presentation',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Frameworks for business presentations and pitches',
    type: 'business',
    frameworks: BUSINESS_PRESENTATION_FRAMEWORKS.map(f => ({
      id: f.id,
      name: f.name,
      description: f.structure,
      tier: f.tier
    }))
  },
  // Video Content Frameworks
  {
    id: 'video-content',
    name: 'Video Content',
    subtitle: 'Videos & Ads',
    icon: 'Video',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Frameworks for video content creation',
    type: 'video',
    frameworks: VIDEO_CONTENT_FRAMEWORKS.map(f => ({
      id: f.id,
      name: f.name,
      description: f.structure,
      tier: f.tier
    }))
  },
  // Training Content Frameworks
  {
    id: 'training-content',
    name: 'Training & L&D',
    subtitle: 'Learning & Development',
    icon: 'GraduationCap',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Frameworks for training and educational content',
    type: 'training',
    frameworks: TRAINING_CONTENT_FRAMEWORKS.map(f => ({
      id: f.id,
      name: f.name,
      description: f.structure,
      tier: f.tier
    }))
  },
  // Marketing Content Frameworks
  {
    id: 'marketing-content',
    name: 'Marketing & Sales',
    subtitle: 'Campaigns & Funnels',
    icon: 'Megaphone',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Frameworks for marketing and sales content',
    type: 'marketing',
    frameworks: MARKETING_CONTENT_FRAMEWORKS.map(f => ({
      id: f.id,
      name: f.name,
      description: f.structure,
      tier: f.tier
    }))
  }
];

// ==================== COMBINED FRAMEWORK CATEGORIES ====================

export const EXPANDED_FRAMEWORK_CATEGORIES: FrameworkCategory[] = [
  ...CONTENT_FRAMEWORK_CATEGORIES,
  ...LEGACY_FRAMEWORK_CATEGORIES
];

// Helper functions
export const getFrameworksByType = (type: FrameworkCategory['type']) => 
  EXPANDED_FRAMEWORK_CATEGORIES.filter(c => c.type === type);

export const getAllFrameworks = () => 
  EXPANDED_FRAMEWORK_CATEGORIES.flatMap(c => c.frameworks);

export const getContentFrameworks = () => CONTENT_FRAMEWORK_CATEGORIES;

export const getLegacyFrameworks = () => LEGACY_FRAMEWORK_CATEGORIES;

export const FRAMEWORK_TYPE_LABELS = {
  // Content types (new)
  business: 'Business Presentation',
  video: 'Video Content',
  training: 'Training & L&D',
  marketing: 'Marketing & Sales',
  // Legacy types
  consulting: 'Top Consulting Firms',
  methodology: 'Methodology Types', 
  industry: 'Industry-Specific',
  regional: 'Regional Frameworks'
};

// Re-export from ContentFrameworksRegistry for convenience
export { ContentFrameworksRegistry, REGIONAL_FRAMEWORK_PREFERENCES };
