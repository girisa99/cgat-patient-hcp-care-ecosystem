/**
 * Template Recommendation Service
 * Context-aware template matching based on industry, segment, content type, and user request
 */

export type TemplateStyle = 
  | 'pure-consulting'      // McKinsey, BCG, Bain frameworks only
  | 'consulting-hybrid'    // Consulting frameworks + industry visuals
  | 'industry-focused'     // Industry-specific templates
  | 'creative-narrative'   // Story-driven, visual-heavy
  | 'data-analytical'      // Charts, graphs, data viz focused
  | 'educational'          // Training, learning materials
  | 'mixed-adaptive';      // AI-selected blend

export interface TemplateRecommendation {
  style: TemplateStyle;
  templates: RecommendedTemplate[];
  reasoning: string;
  confidence: number; // 0-100
  consultingWeight: number; // 0-100, how much consulting influence
  visualWeight: number; // 0-100, how visual/creative
}

export interface RecommendedTemplate {
  id: string;
  name: string;
  category: string;
  matchScore: number;
  frameworks: string[];
  previewUrl?: string;
  tags: string[];
}

export interface ContextInput {
  industry: string;
  segment: string;
  contentTypes: string[];
  userPrompt?: string;
  keywords?: string[];
  audienceLevel?: 'executive' | 'manager' | 'technical' | 'general';
  presentationGoal?: 'inform' | 'persuade' | 'train' | 'analyze' | 'propose';
}

// Industry to template style mapping with weights
const INDUSTRY_TEMPLATE_WEIGHTS: Record<string, {
  consulting: number;
  visual: number;
  data: number;
  preferredStyles: TemplateStyle[];
}> = {
  'consulting': {
    consulting: 90,
    visual: 30,
    data: 70,
    preferredStyles: ['pure-consulting', 'consulting-hybrid']
  },
  'healthcare': {
    consulting: 40,
    visual: 50,
    data: 60,
    preferredStyles: ['consulting-hybrid', 'data-analytical', 'industry-focused']
  },
  'technology': {
    consulting: 50,
    visual: 60,
    data: 70,
    preferredStyles: ['data-analytical', 'consulting-hybrid', 'creative-narrative']
  },
  'finance': {
    consulting: 70,
    visual: 30,
    data: 80,
    preferredStyles: ['pure-consulting', 'data-analytical']
  },
  'pharma': {
    consulting: 50,
    visual: 40,
    data: 75,
    preferredStyles: ['data-analytical', 'consulting-hybrid', 'industry-focused']
  },
  'education': {
    consulting: 20,
    visual: 70,
    data: 40,
    preferredStyles: ['educational', 'creative-narrative']
  },
  'marketing': {
    consulting: 30,
    visual: 85,
    data: 45,
    preferredStyles: ['creative-narrative', 'mixed-adaptive']
  },
  'manufacturing': {
    consulting: 55,
    visual: 35,
    data: 65,
    preferredStyles: ['industry-focused', 'consulting-hybrid', 'data-analytical']
  },
  'retail': {
    consulting: 40,
    visual: 70,
    data: 55,
    preferredStyles: ['creative-narrative', 'data-analytical', 'mixed-adaptive']
  },
  'travel': {
    consulting: 25,
    visual: 80,
    data: 35,
    preferredStyles: ['creative-narrative', 'industry-focused']
  },
  'default': {
    consulting: 50,
    visual: 50,
    data: 50,
    preferredStyles: ['mixed-adaptive', 'consulting-hybrid']
  }
};

// Content type influence on template style
const CONTENT_TYPE_INFLUENCE: Record<string, {
  boostConsulting: number;
  boostVisual: number;
  boostData: number;
  suggestedFrameworks: string[];
}> = {
  'strategic': {
    boostConsulting: 30,
    boostVisual: -10,
    boostData: 20,
    suggestedFrameworks: ['SWOT', 'Porter\'s Five Forces', 'BCG Matrix', 'Ansoff Matrix']
  },
  'marketing': {
    boostConsulting: -10,
    boostVisual: 30,
    boostData: 10,
    suggestedFrameworks: ['4Ps', 'Customer Journey', 'Brand Funnel']
  },
  'research': {
    boostConsulting: 20,
    boostVisual: 0,
    boostData: 40,
    suggestedFrameworks: ['Literature Review', 'Methodology', 'Findings Matrix']
  },
  'financial': {
    boostConsulting: 25,
    boostVisual: -20,
    boostData: 50,
    suggestedFrameworks: ['P&L Analysis', 'Cash Flow', 'ROI Models', 'Break-even']
  },
  'educational': {
    boostConsulting: -20,
    boostVisual: 40,
    boostData: 0,
    suggestedFrameworks: ['Learning Objectives', 'Module Structure', 'Assessment Rubric']
  },
  'narrative': {
    boostConsulting: -15,
    boostVisual: 50,
    boostData: -20,
    suggestedFrameworks: ['Story Arc', 'Hero\'s Journey', 'Problem-Solution']
  },
  'compliance': {
    boostConsulting: 35,
    boostVisual: -25,
    boostData: 30,
    suggestedFrameworks: ['Checklist', 'Process Flow', 'Risk Matrix', 'Audit Trail']
  },
  'proposal': {
    boostConsulting: 20,
    boostVisual: 20,
    boostData: 25,
    suggestedFrameworks: ['Executive Summary', 'Solution Architecture', 'Timeline', 'Pricing']
  },
  'technical': {
    boostConsulting: 10,
    boostVisual: 15,
    boostData: 35,
    suggestedFrameworks: ['Architecture Diagram', 'Process Flow', 'Technical Specs']
  },
  'operational': {
    boostConsulting: 15,
    boostVisual: 0,
    boostData: 30,
    suggestedFrameworks: ['Process Map', 'RACI', 'KPIs Dashboard', 'Gantt Chart']
  }
};

// Consulting framework templates
const CONSULTING_TEMPLATES: RecommendedTemplate[] = [
  {
    id: 'mckinsey-7s',
    name: 'McKinsey 7S Framework',
    category: 'consulting',
    matchScore: 0,
    frameworks: ['7S Model', 'MECE', 'Pyramid Principle'],
    tags: ['strategy', 'organization', 'alignment']
  },
  {
    id: 'bcg-matrix',
    name: 'BCG Growth-Share Matrix',
    category: 'consulting',
    matchScore: 0,
    frameworks: ['BCG Matrix', 'Portfolio Analysis', 'Experience Curve'],
    tags: ['portfolio', 'growth', 'investment']
  },
  {
    id: 'bain-nps',
    name: 'Bain Results Framework',
    category: 'consulting',
    matchScore: 0,
    frameworks: ['NPS', 'Results Delivery', 'Decision Insights'],
    tags: ['customer', 'results', 'decisions']
  },
  {
    id: 'porter-five-forces',
    name: 'Porter\'s Five Forces',
    category: 'consulting',
    matchScore: 0,
    frameworks: ['Five Forces', 'Competitive Analysis'],
    tags: ['competition', 'industry', 'analysis']
  },
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis',
    category: 'consulting',
    matchScore: 0,
    frameworks: ['SWOT', 'Strategic Planning'],
    tags: ['strengths', 'weaknesses', 'opportunities', 'threats']
  }
];

// Industry-specific templates
const INDUSTRY_TEMPLATES: Record<string, RecommendedTemplate[]> = {
  'healthcare': [
    {
      id: 'healthcare-compliance',
      name: 'Healthcare Compliance',
      category: 'healthcare',
      matchScore: 0,
      frameworks: ['HIPAA', 'Clinical Workflow', 'Patient Journey'],
      tags: ['compliance', 'patient', 'clinical']
    },
    {
      id: 'clinical-research',
      name: 'Clinical Research',
      category: 'healthcare',
      matchScore: 0,
      frameworks: ['Trial Phases', 'Efficacy Analysis', 'Safety Data'],
      tags: ['research', 'trials', 'data']
    }
  ],
  'technology': [
    {
      id: 'tech-architecture',
      name: 'Technical Architecture',
      category: 'technology',
      matchScore: 0,
      frameworks: ['System Design', 'API Flow', 'Cloud Architecture'],
      tags: ['architecture', 'systems', 'technical']
    },
    {
      id: 'product-roadmap',
      name: 'Product Roadmap',
      category: 'technology',
      matchScore: 0,
      frameworks: ['Agile', 'Sprint Planning', 'Feature Matrix'],
      tags: ['product', 'roadmap', 'features']
    }
  ],
  'finance': [
    {
      id: 'financial-model',
      name: 'Financial Model',
      category: 'finance',
      matchScore: 0,
      frameworks: ['DCF', 'Valuation', 'Sensitivity Analysis'],
      tags: ['valuation', 'model', 'analysis']
    }
  ]
};

// Creative/Visual templates
const CREATIVE_TEMPLATES: RecommendedTemplate[] = [
  {
    id: 'storytelling',
    name: 'Visual Storytelling',
    category: 'creative',
    matchScore: 0,
    frameworks: ['Story Arc', 'Visual Narrative', 'Emotional Journey'],
    tags: ['story', 'visual', 'narrative']
  },
  {
    id: 'pitch-deck',
    name: 'Startup Pitch Deck',
    category: 'creative',
    matchScore: 0,
    frameworks: ['Problem-Solution', 'Traction', 'Ask'],
    tags: ['pitch', 'startup', 'investor']
  },
  {
    id: 'brand-presentation',
    name: 'Brand Presentation',
    category: 'creative',
    matchScore: 0,
    frameworks: ['Brand Story', 'Visual Identity', 'Value Proposition'],
    tags: ['brand', 'identity', 'marketing']
  }
];

/**
 * Analyze user prompt for content intent
 */
function analyzePromptIntent(prompt: string): {
  isConsultingFocused: boolean;
  isDataHeavy: boolean;
  isVisualHeavy: boolean;
  detectedKeywords: string[];
} {
  const consultingKeywords = ['strategy', 'analysis', 'framework', 'mckisney', 'bcg', 'bain', 'swot', 'porter', 'competitive', 'market analysis', 'due diligence'];
  const dataKeywords = ['data', 'analytics', 'metrics', 'kpi', 'roi', 'financial', 'numbers', 'statistics', 'trends', 'forecast'];
  const visualKeywords = ['creative', 'visual', 'story', 'narrative', 'design', 'brand', 'marketing', 'pitch', 'engaging'];

  const lowerPrompt = prompt.toLowerCase();
  
  const consultingMatches = consultingKeywords.filter(k => lowerPrompt.includes(k));
  const dataMatches = dataKeywords.filter(k => lowerPrompt.includes(k));
  const visualMatches = visualKeywords.filter(k => lowerPrompt.includes(k));

  return {
    isConsultingFocused: consultingMatches.length >= 2,
    isDataHeavy: dataMatches.length >= 2,
    isVisualHeavy: visualMatches.length >= 2,
    detectedKeywords: [...consultingMatches, ...dataMatches, ...visualMatches]
  };
}

/**
 * Calculate template style based on context
 */
function determineTemplateStyle(
  consultingScore: number,
  visualScore: number,
  dataScore: number
): TemplateStyle {
  // Pure consulting if consulting is dominant
  if (consultingScore >= 80 && visualScore < 40) {
    return 'pure-consulting';
  }
  
  // Consulting hybrid if consulting is high but visual/data also matter
  if (consultingScore >= 60 && (visualScore >= 40 || dataScore >= 50)) {
    return 'consulting-hybrid';
  }
  
  // Data-focused
  if (dataScore >= 70 && consultingScore < 50) {
    return 'data-analytical';
  }
  
  // Creative/visual focused
  if (visualScore >= 70) {
    return 'creative-narrative';
  }
  
  // Educational
  if (visualScore >= 50 && consultingScore < 30 && dataScore < 40) {
    return 'educational';
  }
  
  // Industry-focused for specific industries
  if (consultingScore < 50 && visualScore < 50 && dataScore < 50) {
    return 'industry-focused';
  }
  
  // Default to adaptive mix
  return 'mixed-adaptive';
}

/**
 * Main recommendation function
 */
export function getTemplateRecommendations(context: ContextInput): TemplateRecommendation {
  // Get base weights from industry
  const industryWeights = INDUSTRY_TEMPLATE_WEIGHTS[context.industry.toLowerCase()] 
    || INDUSTRY_TEMPLATE_WEIGHTS['default'];
  
  let consultingScore = industryWeights.consulting;
  let visualScore = industryWeights.visual;
  let dataScore = industryWeights.data;
  
  // Apply content type influences
  context.contentTypes.forEach(contentType => {
    const influence = CONTENT_TYPE_INFLUENCE[contentType.toLowerCase()];
    if (influence) {
      consultingScore += influence.boostConsulting;
      visualScore += influence.boostVisual;
      dataScore += influence.boostData;
    }
  });
  
  // Analyze user prompt if provided
  if (context.userPrompt) {
    const promptAnalysis = analyzePromptIntent(context.userPrompt);
    if (promptAnalysis.isConsultingFocused) consultingScore += 25;
    if (promptAnalysis.isDataHeavy) dataScore += 25;
    if (promptAnalysis.isVisualHeavy) visualScore += 25;
  }
  
  // Adjust for audience level
  if (context.audienceLevel === 'executive') {
    consultingScore += 15;
    visualScore -= 10;
  } else if (context.audienceLevel === 'technical') {
    dataScore += 20;
    consultingScore -= 10;
  } else if (context.audienceLevel === 'general') {
    visualScore += 15;
    consultingScore -= 15;
  }
  
  // Normalize scores (0-100)
  consultingScore = Math.max(0, Math.min(100, consultingScore));
  visualScore = Math.max(0, Math.min(100, visualScore));
  dataScore = Math.max(0, Math.min(100, dataScore));
  
  // Determine style
  const style = determineTemplateStyle(consultingScore, visualScore, dataScore);
  
  // Build template list based on style
  const templates: RecommendedTemplate[] = [];
  
  if (style === 'pure-consulting' || style === 'consulting-hybrid') {
    templates.push(...CONSULTING_TEMPLATES.map(t => ({
      ...t,
      matchScore: Math.round(consultingScore * 0.9 + Math.random() * 10)
    })));
  }
  
  if (style === 'industry-focused' || style === 'consulting-hybrid' || style === 'mixed-adaptive') {
    const industryTemplates = INDUSTRY_TEMPLATES[context.industry.toLowerCase()] || [];
    templates.push(...industryTemplates.map(t => ({
      ...t,
      matchScore: Math.round((consultingScore + dataScore) / 2 + Math.random() * 10)
    })));
  }
  
  if (style === 'creative-narrative' || style === 'mixed-adaptive') {
    templates.push(...CREATIVE_TEMPLATES.map(t => ({
      ...t,
      matchScore: Math.round(visualScore * 0.9 + Math.random() * 10)
    })));
  }
  
  // Sort by match score
  templates.sort((a, b) => b.matchScore - a.matchScore);
  
  // Generate reasoning
  const reasoning = generateRecommendationReasoning(context, style, consultingScore, visualScore);
  
  return {
    style,
    templates: templates.slice(0, 6), // Top 6 recommendations
    reasoning,
    confidence: Math.round((consultingScore + visualScore + dataScore) / 3),
    consultingWeight: Math.round(consultingScore),
    visualWeight: Math.round(visualScore)
  };
}

function generateRecommendationReasoning(
  context: ContextInput,
  style: TemplateStyle,
  consultingScore: number,
  visualScore: number
): string {
  const parts: string[] = [];
  
  if (context.industry === 'consulting') {
    parts.push(`As a consulting presentation, frameworks like McKinsey 7S and BCG Matrix are prioritized.`);
  } else if (consultingScore >= 60) {
    parts.push(`Your ${context.industry} context with ${context.contentTypes.join(', ')} content benefits from consulting frameworks.`);
  }
  
  if (style === 'consulting-hybrid') {
    parts.push(`Blending consulting rigor with ${context.industry}-specific visuals for maximum impact.`);
  } else if (style === 'creative-narrative') {
    parts.push(`Story-driven approach recommended for engaging your audience.`);
  } else if (style === 'data-analytical') {
    parts.push(`Data visualization templates selected for analytical depth.`);
  }
  
  if (context.audienceLevel === 'executive') {
    parts.push(`Executive-level formatting with clear takeaways.`);
  }
  
  return parts.join(' ') || 'AI-optimized template selection based on your context.';
}

/**
 * Get quick style suggestions for UI display
 */
export function getStyleSuggestions(industry: string): {
  primary: TemplateStyle;
  alternatives: TemplateStyle[];
  description: string;
}[] {
  const weights = INDUSTRY_TEMPLATE_WEIGHTS[industry.toLowerCase()] || INDUSTRY_TEMPLATE_WEIGHTS['default'];
  
  return weights.preferredStyles.map((style, index) => ({
    primary: style,
    alternatives: weights.preferredStyles.filter(s => s !== style).slice(0, 2),
    description: getStyleDescription(style)
  }));
}

function getStyleDescription(style: TemplateStyle): string {
  const descriptions: Record<TemplateStyle, string> = {
    'pure-consulting': 'Professional consulting frameworks (McKinsey, BCG, Bain)',
    'consulting-hybrid': 'Consulting frameworks with industry-specific visuals',
    'industry-focused': 'Templates tailored for your specific industry',
    'creative-narrative': 'Story-driven, visually engaging presentations',
    'data-analytical': 'Data-heavy with charts, graphs, and metrics',
    'educational': 'Training and learning-focused layouts',
    'mixed-adaptive': 'AI-selected blend based on your content'
  };
  return descriptions[style];
}
