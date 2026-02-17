/**
 * Template Recommendation Service - FULLY DYNAMIC
 * Context-aware template matching based on industry, segment, content type, and user request
 * Extensible system - no hardcoded limits, easily add new categories
 */

// ==========================================
// EXTENSIBLE TYPE DEFINITIONS
// ==========================================

export type TemplateStyle = 
  // Consulting & Strategy
  | 'pure-consulting'      // McKinsey, BCG, Bain frameworks only
  | 'consulting-hybrid'    // Consulting frameworks + industry visuals
  | 'strategy-planning'    // Strategic planning focused
  | 'growth-portfolio'     // Growth & portfolio management
  // Industry & Vertical
  | 'industry-focused'     // Industry-specific templates
  | 'healthcare-clinical'  // Medical/clinical presentations
  | 'pharma-biotech'       // Pharmaceutical/biotech focus
  | 'tech-innovation'      // Technology & innovation
  | 'finance-investment'   // Financial services
  // Creative & Visual
  | 'creative-narrative'   // Story-driven, visual-heavy
  | 'visual-immersive'     // Heavy imagery, minimal text
  | 'motion-graphics'      // Animation-focused
  | 'cinematic'            // Film/video style
  // Data & Analytics
  | 'data-analytical'      // Charts, graphs, data viz focused
  | 'dashboard-style'      // Dashboard/metrics focused
  | 'research-academic'    // Research paper style
  // Communication Types
  | 'educational'          // Training, learning materials
  | 'investor-pitch'       // VC/Investor focused
  | 'sales-enablement'     // Sales decks
  | 'internal-comms'       // Internal communications
  | 'executive-summary'    // C-suite briefings
  // Narrative
  | 'storytelling'         // Narrative arc focused
  | 'case-study'           // Case study format
  | 'before-after'         // Transformation stories
  // Interactive & Modern
  | 'interactive-web'      // Web-based interactive
  | '3d-immersive'         // 3D/spatial presentations
  | 'video-hybrid'         // Video + slides
  // Adaptive
  | 'mixed-adaptive';      // AI-selected blend

// Template style metadata for UI
export interface TemplateStyleConfig {
  id: TemplateStyle;
  name: string;
  description: string;
  category: 'consulting' | 'industry' | 'creative' | 'data' | 'communication' | 'narrative' | 'interactive';
  icon: string;
  outputTypes: string[]; // Compatible output types
}

export const TEMPLATE_STYLE_CONFIGS: TemplateStyleConfig[] = [
  { id: 'pure-consulting', name: 'Pure Consulting', description: 'Strategic frameworks, minimal visuals', category: 'consulting', icon: 'Briefcase', outputTypes: ['2d-static', '2d-animated'] },
  { id: 'consulting-hybrid', name: 'Consulting Hybrid', description: 'Frameworks + industry visuals', category: 'consulting', icon: 'Layers', outputTypes: ['2d-static', '2d-animated'] },
  { id: 'strategy-planning', name: 'Strategic Planning', description: 'Long-term strategy focus', category: 'consulting', icon: 'Target', outputTypes: ['2d-static', '2d-animated', 'interactive'] },
  { id: 'growth-portfolio', name: 'Growth & Portfolio', description: 'Growth matrices, portfolio analysis', category: 'consulting', icon: 'TrendingUp', outputTypes: ['2d-static', '2d-animated'] },
  { id: 'industry-focused', name: 'Industry Focused', description: 'Sector-specific templates', category: 'industry', icon: 'Building2', outputTypes: ['2d-static', '2d-animated', 'video-intro'] },
  { id: 'healthcare-clinical', name: 'Healthcare/Clinical', description: 'Medical & clinical style', category: 'industry', icon: 'Heart', outputTypes: ['2d-static', '3d-scene', 'video-intro'] },
  { id: 'pharma-biotech', name: 'Pharma/Biotech', description: 'Scientific & regulatory', category: 'industry', icon: 'FlaskConical', outputTypes: ['2d-static', '3d-animated', 'video-full'] },
  { id: 'tech-innovation', name: 'Tech/Innovation', description: 'Modern tech aesthetics', category: 'industry', icon: 'Cpu', outputTypes: ['2d-animated', '3d-scene', 'interactive', 'video-intro'] },
  { id: 'finance-investment', name: 'Finance/Investment', description: 'Financial services style', category: 'industry', icon: 'DollarSign', outputTypes: ['2d-static', '2d-animated', 'interactive'] },
  { id: 'creative-narrative', name: 'Creative Narrative', description: 'Story-driven, visual-heavy', category: 'creative', icon: 'Palette', outputTypes: ['2d-animated', '3d-animated', 'video-full'] },
  { id: 'visual-immersive', name: 'Visual Immersive', description: 'Full-bleed imagery', category: 'creative', icon: 'Image', outputTypes: ['2d-static', '2d-animated', 'video-intro'] },
  { id: 'motion-graphics', name: 'Motion Graphics', description: 'Animation-focused', category: 'creative', icon: 'Sparkles', outputTypes: ['2d-animated', '3d-animated', 'video-full'] },
  { id: 'cinematic', name: 'Cinematic', description: 'Film/video aesthetic', category: 'creative', icon: 'Film', outputTypes: ['video-intro', 'video-full', '3d-animated'] },
  { id: 'data-analytical', name: 'Data Analytical', description: 'Charts, graphs, data viz', category: 'data', icon: 'BarChart3', outputTypes: ['2d-static', '2d-animated', 'interactive'] },
  { id: 'dashboard-style', name: 'Dashboard Style', description: 'Metrics & KPIs focused', category: 'data', icon: 'LayoutDashboard', outputTypes: ['2d-static', 'interactive'] },
  { id: 'research-academic', name: 'Research/Academic', description: 'Academic paper style', category: 'data', icon: 'GraduationCap', outputTypes: ['2d-static'] },
  { id: 'educational', name: 'Educational', description: 'Training & learning', category: 'communication', icon: 'BookOpen', outputTypes: ['2d-static', '2d-animated', 'video-full', 'interactive'] },
  { id: 'investor-pitch', name: 'Investor Pitch', description: 'VC/Investor focused', category: 'communication', icon: 'Rocket', outputTypes: ['2d-static', '2d-animated', 'video-intro'] },
  { id: 'sales-enablement', name: 'Sales Enablement', description: 'Sales team decks', category: 'communication', icon: 'Megaphone', outputTypes: ['2d-static', '2d-animated', 'interactive'] },
  { id: 'internal-comms', name: 'Internal Comms', description: 'Internal updates', category: 'communication', icon: 'Users', outputTypes: ['2d-static', '2d-animated'] },
  { id: 'executive-summary', name: 'Executive Summary', description: 'C-suite briefings', category: 'communication', icon: 'Crown', outputTypes: ['2d-static'] },
  { id: 'storytelling', name: 'Storytelling', description: 'Narrative arc', category: 'narrative', icon: 'BookMarked', outputTypes: ['2d-animated', 'video-full', '3d-animated'] },
  { id: 'case-study', name: 'Case Study', description: 'Problem-solution format', category: 'narrative', icon: 'FileText', outputTypes: ['2d-static', '2d-animated', 'video-intro'] },
  { id: 'before-after', name: 'Before/After', description: 'Transformation stories', category: 'narrative', icon: 'ArrowRightLeft', outputTypes: ['2d-static', '2d-animated', 'video-intro'] },
  { id: 'interactive-web', name: 'Interactive Web', description: 'Web-based interactive', category: 'interactive', icon: 'MousePointerClick', outputTypes: ['interactive', '2d-animated'] },
  { id: '3d-immersive', name: '3D Immersive', description: '3D/spatial presentations', category: 'interactive', icon: 'Box', outputTypes: ['3d-scene', '3d-animated', 'interactive'] },
  { id: 'video-hybrid', name: 'Video Hybrid', description: 'Video + slides combined', category: 'interactive', icon: 'Video', outputTypes: ['video-intro', 'video-full', '2d-animated'] },
  { id: 'mixed-adaptive', name: 'AI Mixed', description: 'AI-selected best blend', category: 'interactive', icon: 'Wand2', outputTypes: ['mixed'] }
];

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
  // Strategic - WITH SUB-OPTIONS
  { 
    id: 'strategic', 
    name: 'Strategic', 
    boostConsulting: 30, 
    boostVisual: -10, 
    boostData: 20, 
    suggestedFrameworks: ['SWOT', 'Porter\'s Five Forces', 'BCG Matrix', 'Ansoff Matrix', 'Value Chain'],
    subOptions: [
      { id: 'strategic-corporate', label: 'Corporate Strategy', description: 'Enterprise-level strategy' },
      { id: 'strategic-it', label: 'IT Strategy', description: 'Technology roadmap & planning' },
      { id: 'strategic-digital', label: 'Digital Transformation', description: 'Digital strategy & roadmap' },
      { id: 'strategic-growth', label: 'Growth Strategy', description: 'Business expansion planning' },
      { id: 'strategic-operations', label: 'Operations Strategy', description: 'Operational excellence plan' },
      { id: 'strategic-market-entry', label: 'Market Entry', description: 'New market expansion' },
      { id: 'strategic-ma', label: 'M&A Strategy', description: 'Merger & acquisition planning' },
      { id: 'strategic-turnaround', label: 'Turnaround Plan', description: 'Business recovery strategy' }
    ]
  },
  
  // Marketing - WITH SUB-OPTIONS
  { 
    id: 'marketing', 
    name: 'Marketing', 
    boostConsulting: -10, 
    boostVisual: 30, 
    boostData: 10, 
    suggestedFrameworks: ['4Ps', 'Customer Journey', 'Brand Funnel', 'AIDA', 'STP'],
    subOptions: [
      { id: 'marketing-campaign', label: 'Campaign Deck', description: 'Marketing campaign overview' },
      { id: 'marketing-brand', label: 'Brand Guidelines', description: 'Brand identity & standards' },
      { id: 'marketing-launch', label: 'Product Launch', description: 'Go-to-market strategy' },
      { id: 'marketing-content', label: 'Content Strategy', description: 'Content planning & calendar' },
      { id: 'marketing-social', label: 'Social Media Strategy', description: 'Social media planning' },
      { id: 'marketing-performance', label: 'Performance Report', description: 'Campaign metrics & ROI' },
      { id: 'marketing-partner', label: 'Partner/Co-Marketing', description: 'Partnership marketing deck' }
    ]
  },
  
  // Research - WITH SUB-OPTIONS
  { 
    id: 'research', 
    name: 'Research', 
    boostConsulting: 20, 
    boostVisual: 0, 
    boostData: 40, 
    suggestedFrameworks: ['Literature Review', 'Methodology', 'Findings Matrix', 'Statistical Analysis'],
    subOptions: [
      { id: 'research-market', label: 'Market Research', description: 'Market analysis & sizing' },
      { id: 'research-competitive', label: 'Competitive Analysis', description: 'Competitor landscape study' },
      { id: 'research-user', label: 'User Research', description: 'User insights & personas' },
      { id: 'research-data', label: 'Data Analysis Report', description: 'Statistical findings & insights' },
      { id: 'research-academic', label: 'Academic Research', description: 'Literature review & methodology' },
      { id: 'research-industry', label: 'Industry Report', description: 'Industry trends & outlook' },
      { id: 'research-feasibility', label: 'Feasibility Study', description: 'Project viability analysis' }
    ]
  },
  
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
      { id: 'training-certification', label: 'Certification Program', description: 'Formal certification materials' },
      { id: 'training-onboarding', label: 'Onboarding Guide', description: 'New employee/customer onboarding' }
    ]
  },
  
  // Storytelling - WITH SUB-OPTIONS
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
      { id: 'story-transformation', label: 'Transformation Story', description: 'Change journey narrative' },
      { id: 'story-testimonial', label: 'Testimonial Compilation', description: 'Customer testimonial stories' },
      { id: 'story-impact', label: 'Impact Report', description: 'Social/business impact narrative' }
    ]
  },
  
  // Investor/VC - WITH SUB-OPTIONS
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
      { id: 'investor-due-diligence', label: 'Due Diligence Package', description: 'Comprehensive investor materials' },
      { id: 'investor-board', label: 'Board Deck', description: 'Board meeting presentation' },
      { id: 'investor-exit', label: 'Exit Strategy', description: 'M&A or IPO presentation' }
    ]
  },
  
  // Business - WITH SUB-OPTIONS
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
      { id: 'business-review', label: 'Business Review', description: 'Quarterly/annual performance review' },
      { id: 'business-case', label: 'Business Case', description: 'Investment justification' },
      { id: 'business-update', label: 'Status Update', description: 'Project/business status' },
      { id: 'business-executive', label: 'Executive Summary', description: 'C-suite briefing deck' }
    ]
  },
  
  // Compliance - WITH SUB-OPTIONS
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
      { id: 'compliance-training', label: 'Compliance Training', description: 'Regulatory training materials' },
      { id: 'compliance-hipaa', label: 'HIPAA Compliance', description: 'Healthcare privacy compliance' },
      { id: 'compliance-gdpr', label: 'GDPR/Privacy', description: 'Data privacy compliance' },
      { id: 'compliance-sox', label: 'SOX Compliance', description: 'Financial compliance' },
      { id: 'compliance-security', label: 'Security Compliance', description: 'Cybersecurity standards' }
    ]
  },
  
  // Narrative
  { 
    id: 'narrative', 
    name: 'Narrative', 
    boostConsulting: -15, 
    boostVisual: 50, 
    boostData: -20, 
    suggestedFrameworks: ['Story Arc', 'Visual Narrative', 'Emotional Journey'],
    subOptions: [
      { id: 'narrative-keynote', label: 'Keynote Speech', description: 'Keynote presentation format' },
      { id: 'narrative-ted', label: 'TED-Style Talk', description: 'Idea-driven presentation' },
      { id: 'narrative-story', label: 'Story Presentation', description: 'Narrative-driven format' }
    ]
  },
  
  // Visual
  { 
    id: 'visual', 
    name: 'Visual', 
    boostConsulting: -20, 
    boostVisual: 60, 
    boostData: 10, 
    suggestedFrameworks: ['Infographics', 'Data Viz', 'Icon Story'],
    subOptions: [
      { id: 'visual-infographic', label: 'Infographic Deck', description: 'Data visualization focus' },
      { id: 'visual-photo', label: 'Photo Essay', description: 'Image-driven storytelling' },
      { id: 'visual-diagram', label: 'Diagram Collection', description: 'Technical diagrams & flows' },
      { id: 'visual-chart', label: 'Chart Gallery', description: 'Charts & graphs focus' }
    ]
  },
  
  // Creative
  { 
    id: 'creative', 
    name: 'Creative', 
    boostConsulting: -25, 
    boostVisual: 70, 
    boostData: -15, 
    suggestedFrameworks: ['Mood Board', 'Brand Story', 'Concept Exploration'],
    subOptions: [
      { id: 'creative-concept', label: 'Concept Deck', description: 'Creative concepts & ideas' },
      { id: 'creative-mood', label: 'Mood Board', description: 'Visual inspiration board' },
      { id: 'creative-portfolio', label: 'Portfolio Showcase', description: 'Work samples & projects' },
      { id: 'creative-campaign', label: 'Creative Campaign', description: 'Ad campaign concepts' },
      { id: 'creative-brand', label: 'Brand Story', description: 'Brand narrative & identity' }
    ]
  },
  
  // Technical
  { 
    id: 'technical', 
    name: 'Technical', 
    boostConsulting: 10, 
    boostVisual: 15, 
    boostData: 45, 
    suggestedFrameworks: ['Architecture Diagram', 'Process Flow', 'Technical Specs', 'API Documentation'],
    subOptions: [
      { id: 'technical-architecture', label: 'Architecture Overview', description: 'System architecture documentation' },
      { id: 'technical-api', label: 'API Documentation', description: 'API reference & usage' },
      { id: 'technical-specs', label: 'Technical Specifications', description: 'Detailed technical specs' },
      { id: 'technical-integration', label: 'Integration Guide', description: 'System integration documentation' }
    ]
  },
  
  // Proposal
  { 
    id: 'proposal', 
    name: 'Proposal', 
    boostConsulting: 20, 
    boostVisual: 20, 
    boostData: 25, 
    suggestedFrameworks: ['Executive Summary', 'Solution Architecture', 'Timeline', 'Pricing Model'],
    subOptions: [
      { id: 'proposal-rfp', label: 'RFP Response', description: 'Request for proposal response' },
      { id: 'proposal-sales', label: 'Sales Proposal', description: 'Sales pitch & pricing' },
      { id: 'proposal-partnership', label: 'Partnership Proposal', description: 'Strategic partnership pitch' },
      { id: 'proposal-project', label: 'Project Proposal', description: 'Project scope & timeline' }
    ]
  },
  
  // Operational
  { 
    id: 'operational', 
    name: 'Operational', 
    boostConsulting: 15, 
    boostVisual: 0, 
    boostData: 30, 
    suggestedFrameworks: ['Process Map', 'RACI', 'KPIs Dashboard', 'Gantt Chart', 'Workflow'],
    subOptions: [
      { id: 'operational-process', label: 'Process Documentation', description: 'Process flows & procedures' },
      { id: 'operational-sop', label: 'Standard Operating Procedures', description: 'SOPs & guidelines' },
      { id: 'operational-dashboard', label: 'Operations Dashboard', description: 'KPIs & metrics' },
      { id: 'operational-report', label: 'Operations Report', description: 'Performance & efficiency report' }
    ]
  },
];

// ==========================================
// CONSULTING FRAMEWORK TEMPLATES (Dynamic)
// ==========================================

export interface ConsultingFramework {
  id: string;
  name: string;
  firm: 'tier1-strategy' | 'tier1-growth' | 'tier1-operations' | 'universal' | 'custom';
  frameworks: string[];
  tags: string[];
  useCase: string[];
  visualStyle: 'minimal' | 'data-heavy' | 'balanced';
}

// Generic consulting frameworks - NO TRADEMARKED NAMES
// Using descriptive names that represent the methodology, not specific firms
export const CONSULTING_FRAMEWORKS: ConsultingFramework[] = [
  // ==========================================
  // STRATEGY FRAMEWORKS
  // ==========================================
  { id: 'org-7-elements', name: '7-Element Alignment Model', firm: 'tier1-strategy', frameworks: ['Organizational Alignment', 'MECE Principle', 'Pyramid Structure'], tags: ['organization', 'alignment', 'strategy'], useCase: ['strategic', 'business'], visualStyle: 'minimal' },
  { id: 'three-horizons', name: 'Three Horizons Growth Model', firm: 'tier1-strategy', frameworks: ['Horizon Planning', 'Growth Strategy'], tags: ['growth', 'innovation', 'planning'], useCase: ['strategic', 'investor'], visualStyle: 'balanced' },
  { id: 'change-influence', name: 'Change Influence Framework', firm: 'tier1-strategy', frameworks: ['Change Management', 'Leadership Alignment'], tags: ['change', 'transformation'], useCase: ['training', 'business'], visualStyle: 'minimal' },
  { id: 'strategic-choice-cascade', name: 'Strategic Choice Cascade', firm: 'tier1-strategy', frameworks: ['Winning Aspirations', 'Where to Play', 'How to Win'], tags: ['strategy', 'choices', 'competitive'], useCase: ['strategic'], visualStyle: 'minimal' },
  { id: 'vision-mission-values', name: 'Vision-Mission-Values Framework', firm: 'tier1-strategy', frameworks: ['Vision Statement', 'Mission', 'Core Values', 'Strategic Objectives'], tags: ['corporate', 'culture', 'identity'], useCase: ['strategic', 'business'], visualStyle: 'minimal' },
  { id: 'scenario-planning', name: 'Scenario Planning Matrix', firm: 'tier1-strategy', frameworks: ['Future Scenarios', 'Risk Assessment', 'Strategic Options'], tags: ['planning', 'risk', 'futures'], useCase: ['strategic', 'research'], visualStyle: 'balanced' },
  
  // ==========================================
  // BUSINESS ANALYSIS FRAMEWORKS
  // ==========================================
  { id: 'five-forces', name: 'Five Forces Industry Analysis', firm: 'universal', frameworks: ['Industry Analysis', 'Competitive Dynamics', 'Market Structure'], tags: ['competition', 'industry', 'analysis'], useCase: ['strategic', 'research'], visualStyle: 'balanced' },
  { id: 'swot-analysis', name: 'SWOT Strategic Analysis', firm: 'universal', frameworks: ['SWOT', 'Strategic Planning'], tags: ['analysis', 'planning'], useCase: ['strategic', 'proposal'], visualStyle: 'minimal' },
  { id: 'pestle-macro', name: 'PESTLE Macro Analysis', firm: 'universal', frameworks: ['PESTLE', 'External Environment'], tags: ['environment', 'external'], useCase: ['strategic', 'research'], visualStyle: 'balanced' },
  { id: 'value-chain', name: 'Value Chain Analysis', firm: 'universal', frameworks: ['Value Chain', 'Operations Mapping'], tags: ['operations', 'value'], useCase: ['operational', 'strategic'], visualStyle: 'data-heavy' },
  { id: 'root-cause-analysis', name: 'Root Cause Analysis (5 Whys)', firm: 'universal', frameworks: ['Problem Analysis', 'Fishbone Diagram', 'Issue Tree'], tags: ['problem-solving', 'analysis'], useCase: ['operational', 'business'], visualStyle: 'balanced' },
  { id: 'gap-analysis', name: 'Gap Analysis Framework', firm: 'universal', frameworks: ['Current State', 'Future State', 'Gap Identification', 'Action Plan'], tags: ['analysis', 'improvement'], useCase: ['strategic', 'operational'], visualStyle: 'balanced' },
  { id: 'stakeholder-mapping', name: 'Stakeholder Analysis & Mapping', firm: 'universal', frameworks: ['Power/Interest Grid', 'Stakeholder Engagement', 'Influence Mapping'], tags: ['stakeholders', 'governance'], useCase: ['business', 'proposal'], visualStyle: 'data-heavy' },
  { id: 'competitive-benchmarking', name: 'Competitive Benchmarking', firm: 'universal', frameworks: ['Competitor Profiles', 'Feature Comparison', 'Market Positioning'], tags: ['competition', 'benchmarking'], useCase: ['strategic', 'research'], visualStyle: 'data-heavy' },
  
  // ==========================================
  // GROWTH & PORTFOLIO FRAMEWORKS
  // ==========================================
  { id: 'growth-share-matrix', name: 'Growth-Share Portfolio Matrix', firm: 'tier1-growth', frameworks: ['Portfolio Analysis', 'Experience Curve', 'Market Share'], tags: ['portfolio', 'growth', 'investment'], useCase: ['strategic', 'investor'], visualStyle: 'data-heavy' },
  { id: 'competitive-advantage', name: 'Competitive Advantage Matrix', firm: 'tier1-growth', frameworks: ['Competitive Position', 'Market Dynamics'], tags: ['competition', 'strategy'], useCase: ['strategic'], visualStyle: 'balanced' },
  { id: 'digital-maturity', name: 'Digital Maturity Index', firm: 'tier1-growth', frameworks: ['Digital Transformation', 'Technology Adoption'], tags: ['digital', 'technology'], useCase: ['technical', 'business'], visualStyle: 'data-heavy' },
  { id: 'growth-matrix', name: 'Market-Product Growth Matrix', firm: 'tier1-growth', frameworks: ['Growth Strategy', 'Market Expansion', 'Product Development'], tags: ['growth', 'market'], useCase: ['strategic', 'investor'], visualStyle: 'minimal' },
  { id: 'blue-ocean', name: 'Blue Ocean Value Innovation', firm: 'tier1-growth', frameworks: ['Value Innovation', 'Strategy Canvas', 'Four Actions Framework'], tags: ['innovation', 'differentiation'], useCase: ['strategic', 'creative'], visualStyle: 'balanced' },
  { id: 'market-entry', name: 'Market Entry Strategy', firm: 'tier1-growth', frameworks: ['Market Assessment', 'Entry Mode', 'Go-to-Market Plan'], tags: ['expansion', 'market', 'growth'], useCase: ['strategic', 'investor'], visualStyle: 'balanced' },
  { id: 'product-lifecycle', name: 'Product Lifecycle Management', firm: 'tier1-growth', frameworks: ['Introduction', 'Growth', 'Maturity', 'Decline', 'Extension'], tags: ['product', 'lifecycle'], useCase: ['strategic', 'marketing'], visualStyle: 'balanced' },
  { id: 'innovation-funnel', name: 'Innovation Funnel & Pipeline', firm: 'tier1-growth', frameworks: ['Ideation', 'Validation', 'Development', 'Launch'], tags: ['innovation', 'r&d'], useCase: ['strategic', 'technical'], visualStyle: 'balanced' },
  
  // ==========================================
  // OPERATIONS FRAMEWORKS
  // ==========================================
  { id: 'loyalty-promoter', name: 'Customer Loyalty & Promoter System', firm: 'tier1-operations', frameworks: ['Customer Loyalty', 'Results Delivery', 'NPS Methodology'], tags: ['customer', 'loyalty', 'metrics'], useCase: ['marketing', 'business'], visualStyle: 'data-heavy' },
  { id: 'strategy-diamond', name: 'Strategic Choice Diamond', firm: 'tier1-operations', frameworks: ['Strategic Choices', 'Execution Planning'], tags: ['strategy', 'execution'], useCase: ['strategic'], visualStyle: 'minimal' },
  { id: 'balanced-scorecard', name: 'Balanced Scorecard KPIs', firm: 'tier1-operations', frameworks: ['KPIs', 'Performance Management', 'Four Perspectives'], tags: ['performance', 'metrics'], useCase: ['business', 'operational'], visualStyle: 'data-heavy' },
  { id: 'okr-framework', name: 'OKR Goal Framework', firm: 'tier1-operations', frameworks: ['Objectives', 'Key Results', 'Alignment'], tags: ['goals', 'performance'], useCase: ['business', 'operational'], visualStyle: 'minimal' },
  { id: 'lean-six-sigma', name: 'Lean Six Sigma DMAIC', firm: 'tier1-operations', frameworks: ['Define', 'Measure', 'Analyze', 'Improve', 'Control'], tags: ['process', 'improvement', 'quality'], useCase: ['operational'], visualStyle: 'balanced' },
  { id: 'raci-matrix', name: 'RACI Responsibility Matrix', firm: 'tier1-operations', frameworks: ['Responsible', 'Accountable', 'Consulted', 'Informed'], tags: ['governance', 'roles', 'process'], useCase: ['operational', 'business'], visualStyle: 'data-heavy' },
  { id: 'process-mapping', name: 'Business Process Mapping', firm: 'tier1-operations', frameworks: ['Current State', 'Process Flow', 'Optimization', 'Future State'], tags: ['process', 'workflow'], useCase: ['operational'], visualStyle: 'balanced' },
  { id: 'capacity-planning', name: 'Capacity & Resource Planning', firm: 'tier1-operations', frameworks: ['Demand Forecasting', 'Resource Allocation', 'Gap Analysis'], tags: ['capacity', 'resources', 'planning'], useCase: ['operational', 'strategic'], visualStyle: 'data-heavy' },
  
  // ==========================================
  // TRANSFORMATION FRAMEWORKS
  // ==========================================
  { id: 'change-management-8step', name: '8-Step Change Model', firm: 'tier1-strategy', frameworks: ['Create Urgency', 'Build Coalition', 'Vision', 'Communicate', 'Empower', 'Quick Wins', 'Consolidate', 'Anchor'], tags: ['change', 'transformation', 'leadership'], useCase: ['training', 'business'], visualStyle: 'balanced' },
  { id: 'organizational-design', name: 'Organizational Design Framework', firm: 'tier1-operations', frameworks: ['Structure', 'Governance', 'Capabilities', 'Culture'], tags: ['organization', 'design', 'structure'], useCase: ['strategic', 'business'], visualStyle: 'balanced' },
  { id: 'digital-transformation', name: 'Digital Transformation Roadmap', firm: 'tier1-strategy', frameworks: ['Digital Vision', 'Technology Stack', 'Change Management', 'Value Realization'], tags: ['digital', 'transformation', 'technology'], useCase: ['strategic', 'technical'], visualStyle: 'balanced' },
  { id: 'culture-change', name: 'Culture Change Framework', firm: 'tier1-operations', frameworks: ['Values Audit', 'Behavior Change', 'Leadership Modeling', 'Reinforcement'], tags: ['culture', 'change', 'hr'], useCase: ['training', 'business'], visualStyle: 'minimal' },
  { id: 'turnaround-restructuring', name: 'Turnaround & Restructuring', firm: 'tier1-strategy', frameworks: ['Financial Stabilization', 'Operational Improvement', 'Strategic Repositioning'], tags: ['turnaround', 'crisis', 'restructuring'], useCase: ['strategic', 'investor'], visualStyle: 'data-heavy' },
  { id: 'ma-integration', name: 'M&A Integration Playbook', firm: 'tier1-strategy', frameworks: ['Due Diligence', 'Day 1 Readiness', 'Synergy Capture', 'Integration Management'], tags: ['m&a', 'integration', 'merger'], useCase: ['strategic', 'investor'], visualStyle: 'balanced' },
  
  // ==========================================
  // UNIVERSAL / CUSTOM FRAMEWORKS
  // ==========================================
  { id: 'business-model-canvas', name: 'Business Model Canvas', firm: 'universal', frameworks: ['Value Proposition', 'Revenue Model', 'Customer Segments', 'Channels', 'Key Activities'], tags: ['business-model', 'startup'], useCase: ['investor', 'strategic'], visualStyle: 'balanced' },
  { id: 'lean-canvas', name: 'Lean Canvas (Startup)', firm: 'universal', frameworks: ['Problem', 'Solution', 'Key Metrics', 'Unfair Advantage', 'Channels'], tags: ['startup', 'lean', 'mvp'], useCase: ['investor', 'strategic'], visualStyle: 'minimal' },
  { id: 'customer-journey', name: 'Customer Journey Mapping', firm: 'universal', frameworks: ['Awareness', 'Consideration', 'Purchase', 'Retention', 'Advocacy'], tags: ['customer', 'experience', 'journey'], useCase: ['marketing', 'business'], visualStyle: 'balanced' },
  { id: 'design-thinking', name: 'Design Thinking Process', firm: 'universal', frameworks: ['Empathize', 'Define', 'Ideate', 'Prototype', 'Test'], tags: ['innovation', 'design', 'ux'], useCase: ['creative', 'technical'], visualStyle: 'balanced' },
  { id: 'agile-scrum', name: 'Agile/Scrum Framework', firm: 'universal', frameworks: ['Sprints', 'User Stories', 'Backlog', 'Retrospectives'], tags: ['agile', 'development', 'project'], useCase: ['technical', 'operational'], visualStyle: 'minimal' },
  { id: 'risk-assessment', name: 'Risk Assessment Matrix', firm: 'universal', frameworks: ['Risk Identification', 'Impact Analysis', 'Probability', 'Mitigation'], tags: ['risk', 'governance', 'compliance'], useCase: ['strategic', 'operational'], visualStyle: 'data-heavy' },
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
  
  // ALWAYS add at least some base templates regardless of style
  // This prevents "0 templates" scenario
  
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
    
    // If no frameworks match, add all as fallback
    const frameworksToAdd = relevantFrameworks.length > 0 ? relevantFrameworks : CONSULTING_FRAMEWORKS.slice(0, 4);
    
    frameworksToAdd.forEach(f => {
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
  
  // FALLBACK: If still no templates, add universal defaults
  if (templates.length === 0) {
    templates.push(
      { id: 'universal-business', name: 'Business Professional', category: 'universal', matchScore: Math.round((consultingScore + visualScore) / 2), frameworks: ['Overview', 'Details', 'Summary'], tags: ['professional', 'versatile'] },
      { id: 'universal-modern', name: 'Modern Clean', category: 'universal', matchScore: Math.round((visualScore + dataScore) / 2), frameworks: ['Introduction', 'Content', 'Conclusion'], tags: ['modern', 'clean'] },
      { id: 'universal-corporate', name: 'Corporate Standard', category: 'universal', matchScore: Math.round(consultingScore * 0.7), frameworks: ['Executive Summary', 'Analysis', 'Recommendations'], tags: ['corporate', 'formal'] },
      { id: 'universal-dynamic', name: 'Dynamic Presentation', category: 'universal', matchScore: Math.round(visualScore * 0.8), frameworks: ['Hook', 'Story', 'Call to Action'], tags: ['dynamic', 'engaging'] }
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
    'strategy-planning': 'Strategic Planning',
    'growth-portfolio': 'Growth & Portfolio',
    'industry-focused': 'Industry Specific',
    'healthcare-clinical': 'Healthcare/Clinical',
    'pharma-biotech': 'Pharma/Biotech',
    'tech-innovation': 'Tech/Innovation',
    'finance-investment': 'Finance/Investment',
    'creative-narrative': 'Creative & Visual',
    'visual-immersive': 'Visual Immersive',
    'motion-graphics': 'Motion Graphics',
    'cinematic': 'Cinematic',
    'data-analytical': 'Data & Analytics',
    'dashboard-style': 'Dashboard Style',
    'research-academic': 'Research/Academic',
    'educational': 'Training & Education',
    'investor-pitch': 'Investor Pitch',
    'sales-enablement': 'Sales Enablement',
    'internal-comms': 'Internal Comms',
    'executive-summary': 'Executive Summary',
    'storytelling': 'Storytelling',
    'case-study': 'Case Study',
    'before-after': 'Before/After',
    'interactive-web': 'Interactive Web',
    '3d-immersive': '3D Immersive',
    'video-hybrid': 'Video Hybrid',
    'mixed-adaptive': 'AI Adaptive'
  };
  return labels[style] || style;
}

function getStyleDescription(style: TemplateStyle): string {
  const descriptions: Record<TemplateStyle, string> = {
    'pure-consulting': 'McKinsey, BCG, Bain frameworks',
    'consulting-hybrid': 'Frameworks + industry visuals',
    'strategy-planning': 'Long-term strategic planning',
    'growth-portfolio': 'Growth matrices & portfolios',
    'industry-focused': 'Tailored to your sector',
    'healthcare-clinical': 'Medical & clinical style',
    'pharma-biotech': 'Scientific & regulatory',
    'tech-innovation': 'Modern tech aesthetics',
    'finance-investment': 'Financial services style',
    'creative-narrative': 'Story-driven, visual-heavy',
    'visual-immersive': 'Full-bleed imagery, minimal text',
    'motion-graphics': 'Animation-focused layouts',
    'cinematic': 'Film/video production style',
    'data-analytical': 'Charts, graphs, metrics',
    'dashboard-style': 'KPIs & dashboard layouts',
    'research-academic': 'Academic paper format',
    'educational': 'Learning-optimized layouts',
    'investor-pitch': 'VC-ready with traction metrics',
    'sales-enablement': 'Sales team-ready decks',
    'internal-comms': 'Internal communication style',
    'executive-summary': 'C-suite executive briefings',
    'storytelling': 'Narrative arc, engaging flow',
    'case-study': 'Problem-solution-results format',
    'before-after': 'Transformation story format',
    'interactive-web': 'Web-based interactivity',
    '3d-immersive': '3D spatial presentations',
    'video-hybrid': 'Video + slides combined',
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

/**
 * Get templates for a specific style - used when user manually selects a style
 */
export function getTemplatesForStyle(
  style: TemplateStyle,
  context: ContextInput
): RecommendedTemplate[] {
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
  
  // Normalize scores (0-100)
  consultingScore = Math.max(0, Math.min(100, consultingScore));
  visualScore = Math.max(0, Math.min(100, visualScore));
  dataScore = Math.max(0, Math.min(100, dataScore));
  
  return buildTemplateList(style, context, consultingScore, visualScore, dataScore);
}
