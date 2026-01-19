/**
 * Template Recommendation Service - FULLY DYNAMIC
 * Context-aware template matching based on industry, segment, content type, and user request
 * Extensible system - no hardcoded limits, easily add new categories
 */

// ==========================================
// EXTENSIBLE TYPE DEFINITIONS
// ==========================================

export type TemplateStyle = 
  | 'pure-consulting'      // McKinsey, BCG, Bain frameworks only
  | 'consulting-hybrid'    // Consulting frameworks + industry visuals
  | 'industry-focused'     // Industry-specific templates
  | 'creative-narrative'   // Story-driven, visual-heavy
  | 'data-analytical'      // Charts, graphs, data viz focused
  | 'educational'          // Training, learning materials
  | 'investor-pitch'       // VC/Investor focused
  | 'storytelling'         // Narrative arc focused
  | 'mixed-adaptive';      // AI-selected blend

export interface TemplateRecommendation {
  style: TemplateStyle;
  templates: RecommendedTemplate[];
  reasoning: string;
  confidence: number;
  consultingWeight: number;
  visualWeight: number;
  dataWeight: number;
  subOptions?: SubOption[]; // Training videos, manuals, etc.
}

export interface RecommendedTemplate {
  id: string;
  name: string;
  category: string;
  matchScore: number;
  frameworks: string[];
  previewUrl?: string;
  tags: string[];
  subCategory?: string;
}

export interface SubOption {
  id: string;
  label: string;
  description: string;
  isSelected?: boolean;
}

export interface ContextInput {
  industry: string;
  segment: string;
  contentTypes: string[];
  userPrompt?: string;
  keywords?: string[];
  audienceLevel?: 'executive' | 'manager' | 'technical' | 'general' | 'investor' | 'student';
  presentationGoal?: 'inform' | 'persuade' | 'train' | 'analyze' | 'propose' | 'pitch' | 'tell-story';
}

// ==========================================
// DYNAMIC INDUSTRY REGISTRY (Extensible)
// ==========================================

export interface IndustryConfig {
  id: string;
  name: string;
  consulting: number;
  visual: number;
  data: number;
  preferredStyles: TemplateStyle[];
  keywords: string[];
}

// Add new industries here - system auto-adapts
export const INDUSTRY_REGISTRY: IndustryConfig[] = [
  { id: 'consulting', name: 'Consulting', consulting: 90, visual: 30, data: 70, preferredStyles: ['pure-consulting', 'consulting-hybrid'], keywords: ['strategy', 'framework', 'analysis'] },
  { id: 'healthcare', name: 'Healthcare', consulting: 40, visual: 50, data: 60, preferredStyles: ['consulting-hybrid', 'data-analytical', 'industry-focused'], keywords: ['patient', 'clinical', 'treatment'] },
  { id: 'technology', name: 'Technology', consulting: 50, visual: 60, data: 70, preferredStyles: ['data-analytical', 'consulting-hybrid', 'creative-narrative'], keywords: ['software', 'platform', 'innovation'] },
  { id: 'finance', name: 'Finance', consulting: 70, visual: 30, data: 80, preferredStyles: ['pure-consulting', 'data-analytical', 'investor-pitch'], keywords: ['investment', 'roi', 'financial'] },
  { id: 'pharma', name: 'Pharmaceutical', consulting: 50, visual: 40, data: 75, preferredStyles: ['data-analytical', 'consulting-hybrid', 'industry-focused'], keywords: ['clinical', 'trials', 'research'] },
  { id: 'biotech', name: 'Biotechnology', consulting: 45, visual: 50, data: 80, preferredStyles: ['data-analytical', 'industry-focused'], keywords: ['research', 'genomics', 'therapeutics'] },
  { id: 'education', name: 'Education', consulting: 20, visual: 70, data: 40, preferredStyles: ['educational', 'creative-narrative', 'storytelling'], keywords: ['learning', 'curriculum', 'students'] },
  { id: 'marketing', name: 'Marketing', consulting: 30, visual: 85, data: 45, preferredStyles: ['creative-narrative', 'mixed-adaptive', 'storytelling'], keywords: ['campaign', 'brand', 'audience'] },
  { id: 'manufacturing', name: 'Manufacturing', consulting: 55, visual: 35, data: 65, preferredStyles: ['industry-focused', 'consulting-hybrid', 'data-analytical'], keywords: ['production', 'supply chain', 'operations'] },
  { id: 'retail', name: 'Retail', consulting: 40, visual: 70, data: 55, preferredStyles: ['creative-narrative', 'data-analytical', 'mixed-adaptive'], keywords: ['customer', 'sales', 'experience'] },
  { id: 'travel', name: 'Travel & Hospitality', consulting: 25, visual: 80, data: 35, preferredStyles: ['creative-narrative', 'industry-focused', 'storytelling'], keywords: ['destination', 'experience', 'journey'] },
  { id: 'oil-gas', name: 'Oil & Gas', consulting: 60, visual: 30, data: 75, preferredStyles: ['data-analytical', 'consulting-hybrid', 'industry-focused'], keywords: ['energy', 'exploration', 'production'] },
  { id: 'veterinary', name: 'Veterinary', consulting: 30, visual: 60, data: 50, preferredStyles: ['industry-focused', 'educational'], keywords: ['animal', 'care', 'clinic'] },
  { id: 'legal', name: 'Legal', consulting: 65, visual: 25, data: 55, preferredStyles: ['pure-consulting', 'data-analytical'], keywords: ['compliance', 'regulation', 'contract'] },
  { id: 'real-estate', name: 'Real Estate', consulting: 45, visual: 75, data: 50, preferredStyles: ['creative-narrative', 'investor-pitch', 'mixed-adaptive'], keywords: ['property', 'investment', 'development'] },
  { id: 'nonprofit', name: 'Non-Profit', consulting: 35, visual: 65, data: 40, preferredStyles: ['storytelling', 'creative-narrative'], keywords: ['impact', 'mission', 'community'] },
  { id: 'government', name: 'Government', consulting: 55, visual: 35, data: 60, preferredStyles: ['consulting-hybrid', 'data-analytical'], keywords: ['policy', 'public', 'regulation'] },
  { id: 'startup', name: 'Startup', consulting: 40, visual: 70, data: 55, preferredStyles: ['investor-pitch', 'creative-narrative', 'storytelling'], keywords: ['growth', 'funding', 'innovation'] },
];

// ==========================================
// DYNAMIC CONTENT TYPE REGISTRY (Extensible)
// ==========================================

export interface ContentTypeConfig {
  id: string;
  name: string;
  icon?: string;
  boostConsulting: number;
  boostVisual: number;
  boostData: number;
  suggestedFrameworks: string[];
  subOptions?: SubOption[];
}

// Add new content types here - system auto-adapts
export const CONTENT_TYPE_REGISTRY: ContentTypeConfig[] = [
  // Strategic
  { id: 'strategic', name: 'Strategic', boostConsulting: 30, boostVisual: -10, boostData: 20, suggestedFrameworks: ['SWOT', 'Porter\'s Five Forces', 'BCG Matrix', 'Ansoff Matrix', 'Value Chain'] },
  
  // Marketing
  { id: 'marketing', name: 'Marketing', boostConsulting: -10, boostVisual: 30, boostData: 10, suggestedFrameworks: ['4Ps', 'Customer Journey', 'Brand Funnel', 'AIDA', 'STP'] },
  
  // Research
  { id: 'research', name: 'Research', boostConsulting: 20, boostVisual: 0, boostData: 40, suggestedFrameworks: ['Literature Review', 'Methodology', 'Findings Matrix', 'Statistical Analysis'] },
  
  // Training - WITH SUB-OPTIONS
  { 
    id: 'training', 
    name: 'Training', 
    boostConsulting: -20, 
    boostVisual: 50, 
    boostData: 10, 
    suggestedFrameworks: ['Learning Objectives', 'Module Structure', 'Assessment Rubric', 'Competency Matrix'],
    subOptions: [
      { id: 'training-video', label: 'Training Video', description: 'Video-based learning content with voiceover' },
      { id: 'training-manual', label: 'Training Manual', description: 'Comprehensive written documentation' },
      { id: 'training-quickref', label: 'Quick Reference Guide', description: 'Condensed key points for easy reference' },
      { id: 'training-workshop', label: 'Workshop Materials', description: 'Interactive session materials' },
      { id: 'training-elearning', label: 'E-Learning Module', description: 'Self-paced online course content' },
      { id: 'training-certification', label: 'Certification Program', description: 'Formal certification materials' }
    ]
  },
  
  // Storytelling - NEW
  { 
    id: 'storytelling', 
    name: 'Storytelling', 
    boostConsulting: -15, 
    boostVisual: 60, 
    boostData: -20, 
    suggestedFrameworks: ['Hero\'s Journey', 'Story Arc', 'Problem-Solution', 'Before-After-Bridge', 'Pixar Story Spine'],
    subOptions: [
      { id: 'story-case', label: 'Case Study Narrative', description: 'Customer success story format' },
      { id: 'story-origin', label: 'Origin Story', description: 'Company/product founding narrative' },
      { id: 'story-vision', label: 'Vision Story', description: 'Future state narrative' },
      { id: 'story-transformation', label: 'Transformation Story', description: 'Change journey narrative' }
    ]
  },
  
  // Investor/VC - NEW
  { 
    id: 'investor', 
    name: 'Investor & VC', 
    boostConsulting: 25, 
    boostVisual: 35, 
    boostData: 45, 
    suggestedFrameworks: ['Problem-Solution-Market', 'Traction Metrics', 'Unit Economics', 'TAM-SAM-SOM', 'Competitive Moat'],
    subOptions: [
      { id: 'investor-seed', label: 'Seed Round Pitch', description: 'Early-stage funding pitch' },
      { id: 'investor-series', label: 'Series A/B Pitch', description: 'Growth-stage investment deck' },
      { id: 'investor-update', label: 'Investor Update', description: 'Monthly/quarterly progress report' },
      { id: 'investor-due-diligence', label: 'Due Diligence Package', description: 'Comprehensive investor materials' }
    ]
  },
  
  // Business
  { 
    id: 'business', 
    name: 'Business', 
    boostConsulting: 15, 
    boostVisual: 15, 
    boostData: 25, 
    suggestedFrameworks: ['Executive Summary', 'Business Model Canvas', 'OKRs', 'RACI', 'Gantt Chart'],
    subOptions: [
      { id: 'business-plan', label: 'Business Plan', description: 'Comprehensive business strategy' },
      { id: 'business-proposal', label: 'Business Proposal', description: 'Client/partner proposal' },
      { id: 'business-review', label: 'Business Review', description: 'Quarterly/annual performance review' }
    ]
  },
  
  // Compliance
  { 
    id: 'compliance', 
    name: 'Compliance', 
    boostConsulting: 35, 
    boostVisual: -25, 
    boostData: 30, 
    suggestedFrameworks: ['Checklist', 'Process Flow', 'Risk Matrix', 'Audit Trail', 'Control Framework'],
    subOptions: [
      { id: 'compliance-policy', label: 'Policy Document', description: 'Formal policy presentation' },
      { id: 'compliance-audit', label: 'Audit Report', description: 'Compliance audit findings' },
      { id: 'compliance-training', label: 'Compliance Training', description: 'Regulatory training materials' }
    ]
  },
  
  // Narrative
  { id: 'narrative', name: 'Narrative', boostConsulting: -15, boostVisual: 50, boostData: -20, suggestedFrameworks: ['Story Arc', 'Visual Narrative', 'Emotional Journey'] },
  
  // Visual
  { id: 'visual', name: 'Visual', boostConsulting: -20, boostVisual: 60, boostData: 10, suggestedFrameworks: ['Infographics', 'Data Viz', 'Icon Story'] },
  
  // Creative
  { id: 'creative', name: 'Creative', boostConsulting: -25, boostVisual: 70, boostData: -15, suggestedFrameworks: ['Mood Board', 'Brand Story', 'Concept Exploration'] },
  
  // Technical
  { id: 'technical', name: 'Technical', boostConsulting: 10, boostVisual: 15, boostData: 45, suggestedFrameworks: ['Architecture Diagram', 'Process Flow', 'Technical Specs', 'API Documentation'] },
  
  // Proposal
  { id: 'proposal', name: 'Proposal', boostConsulting: 20, boostVisual: 20, boostData: 25, suggestedFrameworks: ['Executive Summary', 'Solution Architecture', 'Timeline', 'Pricing Model'] },
  
  // Operational
  { id: 'operational', name: 'Operational', boostConsulting: 15, boostVisual: 0, boostData: 30, suggestedFrameworks: ['Process Map', 'RACI', 'KPIs Dashboard', 'Gantt Chart', 'Workflow'] },
];

// ==========================================
// CONSULTING FRAMEWORK TEMPLATES (Dynamic)
// ==========================================

export interface ConsultingFramework {
  id: string;
  name: string;
  firm: 'mckinsey' | 'bcg' | 'bain' | 'deloitte' | 'kpmg' | 'generic';
  frameworks: string[];
  tags: string[];
  useCase: string[];
  visualStyle: 'minimal' | 'data-heavy' | 'balanced';
}

export const CONSULTING_FRAMEWORKS: ConsultingFramework[] = [
  // McKinsey
  { id: 'mckinsey-7s', name: 'McKinsey 7S Framework', firm: 'mckinsey', frameworks: ['7S Model', 'MECE', 'Pyramid Principle'], tags: ['organization', 'alignment', 'strategy'], useCase: ['strategic', 'business'], visualStyle: 'minimal' },
  { id: 'mckinsey-horizon', name: 'Three Horizons of Growth', firm: 'mckinsey', frameworks: ['Horizon Model', 'Growth Strategy'], tags: ['growth', 'innovation', 'planning'], useCase: ['strategic', 'investor'], visualStyle: 'balanced' },
  { id: 'mckinsey-influence', name: 'Influence Model', firm: 'mckinsey', frameworks: ['Change Management', 'Leadership'], tags: ['change', 'transformation'], useCase: ['training', 'business'], visualStyle: 'minimal' },
  
  // BCG
  { id: 'bcg-matrix', name: 'BCG Growth-Share Matrix', firm: 'bcg', frameworks: ['BCG Matrix', 'Portfolio Analysis', 'Experience Curve'], tags: ['portfolio', 'growth', 'investment'], useCase: ['strategic', 'investor'], visualStyle: 'data-heavy' },
  { id: 'bcg-advantage', name: 'BCG Advantage Matrix', firm: 'bcg', frameworks: ['Competitive Advantage', 'Market Position'], tags: ['competition', 'strategy'], useCase: ['strategic'], visualStyle: 'balanced' },
  { id: 'bcg-digital', name: 'Digital Acceleration Index', firm: 'bcg', frameworks: ['Digital Maturity', 'Transformation'], tags: ['digital', 'technology'], useCase: ['technical', 'business'], visualStyle: 'data-heavy' },
  
  // Bain
  { id: 'bain-nps', name: 'Bain Net Promoter System', firm: 'bain', frameworks: ['NPS', 'Customer Loyalty', 'Results Delivery'], tags: ['customer', 'loyalty', 'metrics'], useCase: ['marketing', 'business'], visualStyle: 'data-heavy' },
  { id: 'bain-diamond', name: 'Bain Strategy Diamond', firm: 'bain', frameworks: ['Strategic Choices', 'Execution'], tags: ['strategy', 'execution'], useCase: ['strategic'], visualStyle: 'minimal' },
  
  // Generic/Universal
  { id: 'porter-five-forces', name: 'Porter\'s Five Forces', firm: 'generic', frameworks: ['Five Forces', 'Competitive Analysis', 'Industry Analysis'], tags: ['competition', 'industry', 'analysis'], useCase: ['strategic', 'research'], visualStyle: 'balanced' },
  { id: 'swot-analysis', name: 'SWOT Analysis', firm: 'generic', frameworks: ['SWOT', 'Strategic Planning'], tags: ['analysis', 'planning'], useCase: ['strategic', 'proposal'], visualStyle: 'minimal' },
  { id: 'pestle-analysis', name: 'PESTLE Analysis', firm: 'generic', frameworks: ['PESTLE', 'Macro Environment'], tags: ['environment', 'external'], useCase: ['strategic', 'research'], visualStyle: 'balanced' },
  { id: 'value-chain', name: 'Value Chain Analysis', firm: 'generic', frameworks: ['Value Chain', 'Operations'], tags: ['operations', 'value'], useCase: ['operational', 'strategic'], visualStyle: 'data-heavy' },
  { id: 'balanced-scorecard', name: 'Balanced Scorecard', firm: 'generic', frameworks: ['KPIs', 'Performance Management'], tags: ['performance', 'metrics'], useCase: ['business', 'operational'], visualStyle: 'data-heavy' },
  { id: 'ansoff-matrix', name: 'Ansoff Growth Matrix', firm: 'generic', frameworks: ['Growth Strategy', 'Market Expansion'], tags: ['growth', 'market'], useCase: ['strategic', 'investor'], visualStyle: 'minimal' },
  { id: 'blue-ocean', name: 'Blue Ocean Strategy', firm: 'generic', frameworks: ['Value Innovation', 'Strategy Canvas'], tags: ['innovation', 'differentiation'], useCase: ['strategic', 'creative'], visualStyle: 'balanced' },
];

// ==========================================
// CORE RECOMMENDATION ENGINE
// ==========================================

/**
 * Analyze user prompt for content intent
 */
function analyzePromptIntent(prompt: string): {
  isConsultingFocused: boolean;
  isDataHeavy: boolean;
  isVisualHeavy: boolean;
  isInvestorFocused: boolean;
  isTrainingFocused: boolean;
  isStoryFocused: boolean;
  detectedKeywords: string[];
} {
  const lowerPrompt = prompt.toLowerCase();
  
  const keywordSets = {
    consulting: ['strategy', 'analysis', 'framework', 'mckinsey', 'bcg', 'bain', 'swot', 'porter', 'competitive', 'market analysis', 'due diligence', 'mece'],
    data: ['data', 'analytics', 'metrics', 'kpi', 'roi', 'financial', 'numbers', 'statistics', 'trends', 'forecast', 'dashboard'],
    visual: ['creative', 'visual', 'design', 'brand', 'beautiful', 'engaging', 'modern', 'stunning'],
    investor: ['investor', 'vc', 'venture', 'funding', 'pitch', 'series', 'seed', 'valuation', 'cap table', 'traction'],
    training: ['training', 'learning', 'course', 'curriculum', 'workshop', 'certification', 'onboarding', 'manual', 'guide'],
    story: ['story', 'narrative', 'journey', 'case study', 'testimonial', 'transformation', 'success story']
  };
  
  const matchKeywords = (keywords: string[]) => keywords.filter(k => lowerPrompt.includes(k));
  
  const consulting = matchKeywords(keywordSets.consulting);
  const data = matchKeywords(keywordSets.data);
  const visual = matchKeywords(keywordSets.visual);
  const investor = matchKeywords(keywordSets.investor);
  const training = matchKeywords(keywordSets.training);
  const story = matchKeywords(keywordSets.story);

  return {
    isConsultingFocused: consulting.length >= 2,
    isDataHeavy: data.length >= 2,
    isVisualHeavy: visual.length >= 2,
    isInvestorFocused: investor.length >= 1,
    isTrainingFocused: training.length >= 1,
    isStoryFocused: story.length >= 1,
    detectedKeywords: [...consulting, ...data, ...visual, ...investor, ...training, ...story]
  };
}

/**
 * Get industry config dynamically
 */
function getIndustryConfig(industryId: string): IndustryConfig {
  const found = INDUSTRY_REGISTRY.find(i => 
    i.id.toLowerCase() === industryId.toLowerCase() || 
    i.name.toLowerCase() === industryId.toLowerCase()
  );
  
  return found || {
    id: 'custom',
    name: industryId,
    consulting: 50,
    visual: 50,
    data: 50,
    preferredStyles: ['mixed-adaptive', 'consulting-hybrid'],
    keywords: []
  };
}

/**
 * Get content type config dynamically
 */
function getContentTypeConfig(contentTypeId: string): ContentTypeConfig | null {
  return CONTENT_TYPE_REGISTRY.find(c => 
    c.id.toLowerCase() === contentTypeId.toLowerCase() || 
    c.name.toLowerCase() === contentTypeId.toLowerCase()
  ) || null;
}

/**
 * Determine template style based on weighted scores
 */
function determineTemplateStyle(
  consultingScore: number,
  visualScore: number,
  dataScore: number,
  context: ContextInput
): TemplateStyle {
  // Check for specific content type overrides
  const hasInvestor = context.contentTypes.some(ct => ct.toLowerCase().includes('investor'));
  const hasTraining = context.contentTypes.some(ct => ct.toLowerCase().includes('training'));
  const hasStorytelling = context.contentTypes.some(ct => 
    ct.toLowerCase().includes('story') || ct.toLowerCase().includes('narrative')
  );
  
  if (hasInvestor || context.presentationGoal === 'pitch') {
    return 'investor-pitch';
  }
  
  if (hasStorytelling || context.presentationGoal === 'tell-story') {
    return 'storytelling';
  }
  
  if (hasTraining || context.presentationGoal === 'train') {
    return 'educational';
  }
  
  // Score-based determination
  if (consultingScore >= 80 && visualScore < 40) {
    return 'pure-consulting';
  }
  
  if (consultingScore >= 60 && (visualScore >= 40 || dataScore >= 50)) {
    return 'consulting-hybrid';
  }
  
  if (dataScore >= 70 && consultingScore < 50) {
    return 'data-analytical';
  }
  
  if (visualScore >= 70) {
    return 'creative-narrative';
  }
  
  if (consultingScore < 40 && visualScore < 40 && dataScore < 40) {
    return 'industry-focused';
  }
  
  return 'mixed-adaptive';
}

/**
 * Build template recommendations based on style
 */
function buildTemplateList(
  style: TemplateStyle,
  context: ContextInput,
  consultingScore: number,
  visualScore: number,
  dataScore: number
): RecommendedTemplate[] {
  const templates: RecommendedTemplate[] = [];
  
  // Add consulting frameworks based on style
  if (style === 'pure-consulting' || style === 'consulting-hybrid' || style === 'investor-pitch') {
    const relevantFrameworks = CONSULTING_FRAMEWORKS.filter(f => {
      // Match by use case
      const useCaseMatch = f.useCase.some(uc => 
        context.contentTypes.some(ct => ct.toLowerCase().includes(uc))
      );
      // Match by visual style preference
      const visualMatch = visualScore > 60 ? f.visualStyle !== 'minimal' : true;
      return useCaseMatch || visualMatch;
    });
    
    relevantFrameworks.forEach(f => {
      templates.push({
        id: f.id,
        name: f.name,
        category: f.firm,
        matchScore: Math.round(consultingScore * 0.8 + Math.random() * 20),
        frameworks: f.frameworks,
        tags: f.tags,
        subCategory: f.firm
      });
    });
  }
  
  // Add storytelling templates
  if (style === 'storytelling' || style === 'creative-narrative') {
    templates.push(
      { id: 'story-arc', name: 'Story Arc Template', category: 'storytelling', matchScore: Math.round(visualScore * 0.9), frameworks: ['Hero\'s Journey', 'Three-Act Structure'], tags: ['narrative', 'engaging'] },
      { id: 'case-study', name: 'Case Study Narrative', category: 'storytelling', matchScore: Math.round(visualScore * 0.85), frameworks: ['Problem-Solution', 'Results'], tags: ['success', 'customer'] },
      { id: 'transformation', name: 'Transformation Story', category: 'storytelling', matchScore: Math.round(visualScore * 0.8), frameworks: ['Before-After-Bridge', 'Change Journey'], tags: ['change', 'impact'] }
    );
  }
  
  // Add investor templates
  if (style === 'investor-pitch') {
    templates.push(
      { id: 'seed-pitch', name: 'Seed Round Pitch', category: 'investor', matchScore: Math.round((consultingScore + dataScore) / 2 * 0.9), frameworks: ['Problem-Solution-Market', 'Ask'], tags: ['funding', 'early-stage'] },
      { id: 'series-pitch', name: 'Series A/B Pitch', category: 'investor', matchScore: Math.round((consultingScore + dataScore) / 2 * 0.85), frameworks: ['Traction', 'Unit Economics', 'Expansion'], tags: ['growth', 'scale'] },
      { id: 'investor-update', name: 'Investor Update', category: 'investor', matchScore: Math.round(dataScore * 0.9), frameworks: ['Metrics Dashboard', 'Milestones'], tags: ['reporting', 'progress'] }
    );
  }
  
  // Add educational/training templates
  if (style === 'educational') {
    templates.push(
      { id: 'course-module', name: 'Course Module', category: 'training', matchScore: Math.round(visualScore * 0.9), frameworks: ['Learning Objectives', 'Assessment'], tags: ['learning', 'curriculum'] },
      { id: 'workshop', name: 'Workshop Template', category: 'training', matchScore: Math.round(visualScore * 0.85), frameworks: ['Interactive', 'Exercises'], tags: ['hands-on', 'practice'] },
      { id: 'quick-guide', name: 'Quick Reference Guide', category: 'training', matchScore: Math.round(visualScore * 0.8), frameworks: ['Key Points', 'Checklists'], tags: ['reference', 'summary'] }
    );
  }
  
  // Add data-focused templates
  if (style === 'data-analytical') {
    templates.push(
      { id: 'dashboard', name: 'Analytics Dashboard', category: 'data', matchScore: Math.round(dataScore * 0.9), frameworks: ['KPIs', 'Trends', 'Comparisons'], tags: ['metrics', 'visualization'] },
      { id: 'research-report', name: 'Research Report', category: 'data', matchScore: Math.round(dataScore * 0.85), frameworks: ['Methodology', 'Findings', 'Analysis'], tags: ['research', 'insights'] },
      { id: 'financial-model', name: 'Financial Overview', category: 'data', matchScore: Math.round(dataScore * 0.8), frameworks: ['P&L', 'Projections', 'ROI'], tags: ['finance', 'numbers'] }
    );
  }
  
  // Sort by match score
  return templates.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
}

/**
 * Get sub-options based on content types selected
 */
function getSubOptions(contentTypes: string[]): SubOption[] {
  const subOptions: SubOption[] = [];
  
  contentTypes.forEach(ct => {
    const config = getContentTypeConfig(ct);
    if (config?.subOptions) {
      subOptions.push(...config.subOptions);
    }
  });
  
  return subOptions;
}

/**
 * Generate human-readable reasoning
 */
function generateRecommendationReasoning(
  context: ContextInput,
  style: TemplateStyle,
  consultingScore: number,
  visualScore: number,
  dataScore: number
): string {
  const parts: string[] = [];
  const industryConfig = getIndustryConfig(context.industry);
  
  // Style-specific reasoning
  switch (style) {
    case 'pure-consulting':
      parts.push(`Prioritizing consulting frameworks (McKinsey, BCG, Bain) for your ${industryConfig.name} presentation.`);
      break;
    case 'consulting-hybrid':
      parts.push(`Blending consulting rigor with ${industryConfig.name}-specific visuals for balanced impact.`);
      break;
    case 'investor-pitch':
      parts.push(`Optimized for investor audiences with clear metrics, traction, and ask sections.`);
      break;
    case 'storytelling':
      parts.push(`Story-driven approach with narrative arc to maximize audience engagement.`);
      break;
    case 'educational':
      parts.push(`Training-optimized with clear learning objectives and progressive content.`);
      break;
    case 'data-analytical':
      parts.push(`Data visualization focus with charts, graphs, and metrics dashboards.`);
      break;
    case 'creative-narrative':
      parts.push(`Visual-forward design with creative layouts and engaging graphics.`);
      break;
    default:
      parts.push(`AI-optimized blend based on your ${industryConfig.name} context.`);
  }
  
  // Content type influence
  if (context.contentTypes.length > 0) {
    const types = context.contentTypes.slice(0, 2).join(' + ');
    parts.push(`Tailored for ${types} content.`);
  }
  
  // Audience adjustment
  if (context.audienceLevel === 'executive') {
    parts.push(`Executive-level formatting with clear takeaways.`);
  } else if (context.audienceLevel === 'investor') {
    parts.push(`VC-ready with metrics and growth narrative.`);
  } else if (context.audienceLevel === 'technical') {
    parts.push(`Technical depth with detailed specifications.`);
  }
  
  return parts.join(' ');
}

// ==========================================
// MAIN EXPORT FUNCTION
// ==========================================

/**
 * Get template recommendations based on full context
 */
export function getTemplateRecommendations(context: ContextInput): TemplateRecommendation {
  // Get industry weights
  const industryConfig = getIndustryConfig(context.industry);
  
  let consultingScore = industryConfig.consulting;
  let visualScore = industryConfig.visual;
  let dataScore = industryConfig.data;
  
  // Apply content type influences
  context.contentTypes.forEach(contentType => {
    const config = getContentTypeConfig(contentType);
    if (config) {
      consultingScore += config.boostConsulting;
      visualScore += config.boostVisual;
      dataScore += config.boostData;
    }
  });
  
  // Analyze user prompt
  if (context.userPrompt) {
    const analysis = analyzePromptIntent(context.userPrompt);
    if (analysis.isConsultingFocused) consultingScore += 25;
    if (analysis.isDataHeavy) dataScore += 25;
    if (analysis.isVisualHeavy) visualScore += 25;
    if (analysis.isInvestorFocused) { consultingScore += 15; dataScore += 20; }
    if (analysis.isTrainingFocused) visualScore += 20;
    if (analysis.isStoryFocused) visualScore += 30;
  }
  
  // Audience adjustments
  switch (context.audienceLevel) {
    case 'executive': consultingScore += 15; visualScore -= 10; break;
    case 'investor': consultingScore += 10; dataScore += 20; break;
    case 'technical': dataScore += 25; consultingScore -= 10; break;
    case 'student': visualScore += 20; consultingScore -= 20; break;
    case 'general': visualScore += 15; break;
  }
  
  // Goal adjustments
  switch (context.presentationGoal) {
    case 'pitch': consultingScore += 15; dataScore += 15; break;
    case 'train': visualScore += 25; break;
    case 'tell-story': visualScore += 30; consultingScore -= 15; break;
    case 'analyze': dataScore += 25; break;
  }
  
  // Normalize scores (0-100)
  consultingScore = Math.max(0, Math.min(100, consultingScore));
  visualScore = Math.max(0, Math.min(100, visualScore));
  dataScore = Math.max(0, Math.min(100, dataScore));
  
  // Determine style
  const style = determineTemplateStyle(consultingScore, visualScore, dataScore, context);
  
  // Build templates
  const templates = buildTemplateList(style, context, consultingScore, visualScore, dataScore);
  
  // Get sub-options
  const subOptions = getSubOptions(context.contentTypes);
  
  // Generate reasoning
  const reasoning = generateRecommendationReasoning(context, style, consultingScore, visualScore, dataScore);
  
  // Calculate confidence
  const confidence = Math.round(
    (Math.max(consultingScore, visualScore, dataScore) + 
     (consultingScore + visualScore + dataScore) / 3) / 2
  );
  
  return {
    style,
    templates,
    reasoning,
    confidence,
    consultingWeight: Math.round(consultingScore),
    visualWeight: Math.round(visualScore),
    dataWeight: Math.round(dataScore),
    subOptions: subOptions.length > 0 ? subOptions : undefined
  };
}

/**
 * Get quick style suggestions for UI display
 */
export function getQuickStyleSuggestions(industry: string): Array<{
  style: TemplateStyle;
  label: string;
  description: string;
}> {
  const config = getIndustryConfig(industry);
  
  return config.preferredStyles.map(style => ({
    style,
    label: formatStyleLabel(style),
    description: getStyleDescription(style)
  }));
}

function formatStyleLabel(style: TemplateStyle): string {
  const labels: Record<TemplateStyle, string> = {
    'pure-consulting': 'Pure Consulting',
    'consulting-hybrid': 'Consulting + Industry',
    'industry-focused': 'Industry Specific',
    'creative-narrative': 'Creative & Visual',
    'data-analytical': 'Data & Analytics',
    'educational': 'Training & Education',
    'investor-pitch': 'Investor Pitch',
    'storytelling': 'Storytelling',
    'mixed-adaptive': 'AI Adaptive'
  };
  return labels[style] || style;
}

function getStyleDescription(style: TemplateStyle): string {
  const descriptions: Record<TemplateStyle, string> = {
    'pure-consulting': 'McKinsey, BCG, Bain frameworks',
    'consulting-hybrid': 'Frameworks + industry visuals',
    'industry-focused': 'Tailored to your sector',
    'creative-narrative': 'Story-driven, visual-heavy',
    'data-analytical': 'Charts, graphs, metrics',
    'educational': 'Learning-optimized layouts',
    'investor-pitch': 'VC-ready with traction metrics',
    'storytelling': 'Narrative arc, engaging flow',
    'mixed-adaptive': 'AI selects optimal blend'
  };
  return descriptions[style] || '';
}

// ==========================================
// UTILITY EXPORTS
// ==========================================

export const getAvailableIndustries = () => INDUSTRY_REGISTRY.map(i => ({ id: i.id, name: i.name }));
export const getAvailableContentTypes = () => CONTENT_TYPE_REGISTRY.map(c => ({ id: c.id, name: c.name, subOptions: c.subOptions }));
export const getConsultingFrameworks = (firm?: string) => 
  firm ? CONSULTING_FRAMEWORKS.filter(f => f.firm === firm) : CONSULTING_FRAMEWORKS;
