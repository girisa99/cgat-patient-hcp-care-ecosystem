/**
 * Context Registry - Industries, Frameworks, Visuals, Outputs
 * 
 * JSON-based registry enabling ecosystem-wide updates without code changes.
 * Supports dynamic loading and hot-reloading from backend.
 */

import { Heart, DollarSign, Cpu, Rocket, Building2, GraduationCap, Factory, Plane, PawPrint, Briefcase, Droplets, BarChart3, Zap, Users, Globe, ShoppingBag, Truck, Home, Gamepad2, Camera, Palette, Utensils, Music, Clapperboard, Radio, Newspaper, Shield, Scale, Stethoscope, Pill } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// ==========================================
// TYPES
// ==========================================

export interface RegistryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string; // Icon name string
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface IndustryItem extends RegistryItem {
  subcategories: string[];
  defaultFrameworks: string[];
  complianceRequirements?: string[];
}

export interface FrameworkItem extends RegistryItem {
  type: 'strategy' | 'analysis' | 'diagram' | 'comparison' | 'process';
  source: string;
  dataTypes: string[];
  compatibleOutputs: string[];
}

export interface VisualFeatureItem extends RegistryItem {
  category: 'charts' | 'diagrams' | 'media' | 'interactive' | '3d' | 'animation';
  providers: string[];
  tier: 'free' | 'pro' | 'enterprise';
  compatibleOutputs: string[];
}

export interface OutputTypeItem extends RegistryItem {
  category: 'document' | 'static' | 'video' | 'immersive' | 'interactive';
  extensions: string[];
  providers: string[];
  tier: 'free' | 'pro' | 'enterprise';
  supportsVoice: boolean;
  supportsAnimation: boolean;
}

// ==========================================
// INDUSTRY REGISTRY
// ==========================================

export const INDUSTRIES: IndustryItem[] = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'Heart',
    subcategories: ['Hospitals', 'Clinics', 'Pharma', 'Biotech', 'Medical Devices', 'Telehealth'],
    defaultFrameworks: ['swot-analysis', 'value-chain', 'comparison-matrix'],
    complianceRequirements: ['HIPAA', 'FDA', 'GDPR'],
    tags: ['regulated', 'patient-centric', 'clinical'],
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: 'DollarSign',
    subcategories: ['Banking', 'Insurance', 'Investment', 'Fintech', 'Crypto', 'Wealth Management'],
    defaultFrameworks: ['growth-share-matrix', 'swot-analysis', 'funnel-analysis'],
    complianceRequirements: ['SOX', 'PCI-DSS', 'GDPR'],
    tags: ['regulated', 'data-driven', 'risk-management'],
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: 'Cpu',
    subcategories: ['SaaS', 'AI/ML', 'Cybersecurity', 'Cloud', 'Hardware', 'DevTools'],
    defaultFrameworks: ['technology-lifecycle', 'mece-structure', 'strategic-roadmap'],
    tags: ['innovation', 'agile', 'scalable'],
  },
  {
    id: 'startup',
    name: 'Startup & VC',
    icon: 'Rocket',
    subcategories: ['Seed Stage', 'Series A-C', 'Late Stage', 'Accelerator', 'Angel'],
    defaultFrameworks: ['pyramid-principle', 'growth-share-matrix', 'funnel-analysis'],
    tags: ['growth', 'pitch', 'metrics'],
  },
  {
    id: 'consulting',
    name: 'Consulting',
    icon: 'Briefcase',
    subcategories: ['Strategy', 'Management', 'Technology', 'HR', 'Operations'],
    defaultFrameworks: ['seven-elements', 'mece-structure', 'pyramid-principle'],
    tags: ['frameworks', 'analysis', 'advisory'],
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    subcategories: ['K-12', 'Higher Ed', 'EdTech', 'Corporate Training', 'Online Learning'],
    defaultFrameworks: ['circular-flow', 'comparison-matrix', 'strategic-roadmap'],
    tags: ['learning', 'engagement', 'outcomes'],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: 'Factory',
    subcategories: ['Automotive', 'Aerospace', 'Electronics', 'Industrial', 'Consumer Goods'],
    defaultFrameworks: ['value-chain', 'gear-diagram', 'comparison-matrix'],
    tags: ['operations', 'supply-chain', 'efficiency'],
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: 'Droplets',
    subcategories: ['Oil & Gas', 'Renewable', 'Utilities', 'Mining', 'Nuclear'],
    defaultFrameworks: ['swot-analysis', 'strategic-roadmap', 'value-chain'],
    complianceRequirements: ['EPA', 'OSHA'],
    tags: ['sustainability', 'infrastructure', 'transition'],
  },
  {
    id: 'retail',
    name: 'Retail & E-commerce',
    icon: 'ShoppingBag',
    subcategories: ['Fashion', 'Electronics', 'Grocery', 'Luxury', 'D2C', 'Marketplace'],
    defaultFrameworks: ['funnel-analysis', 'comparison-matrix', 'growth-share-matrix'],
    tags: ['conversion', 'customer-experience', 'omnichannel'],
  },
  {
    id: 'travel',
    name: 'Travel & Hospitality',
    icon: 'Plane',
    subcategories: ['Airlines', 'Hotels', 'Tourism', 'Cruise', 'Events', 'OTA'],
    defaultFrameworks: ['value-chain', 'funnel-analysis', 'comparison-matrix'],
    tags: ['experience', 'booking', 'seasonal'],
  },
  {
    id: 'logistics',
    name: 'Logistics & Supply Chain',
    icon: 'Truck',
    subcategories: ['Shipping', 'Warehousing', '3PL', 'Last Mile', 'Freight'],
    defaultFrameworks: ['value-chain', 'gear-diagram', 'strategic-roadmap'],
    tags: ['operations', 'tracking', 'optimization'],
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: 'Home',
    subcategories: ['Commercial', 'Residential', 'PropTech', 'REIT', 'Property Management'],
    defaultFrameworks: ['comparison-matrix', 'swot-analysis', 'funnel-analysis'],
    tags: ['investment', 'development', 'portfolio'],
  },
  {
    id: 'media',
    name: 'Media & Entertainment',
    icon: 'Clapperboard',
    subcategories: ['Streaming', 'Gaming', 'News', 'Advertising', 'Social Media'],
    defaultFrameworks: ['funnel-analysis', 'technology-lifecycle', 'comparison-matrix'],
    tags: ['content', 'engagement', 'monetization'],
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: 'Scale',
    subcategories: ['Law Firms', 'Corporate Legal', 'LegalTech', 'Compliance'],
    defaultFrameworks: ['mece-structure', 'comparison-matrix', 'pyramid-principle'],
    complianceRequirements: ['ABA', 'GDPR'],
    tags: ['risk', 'contracts', 'litigation'],
  },
  {
    id: 'nonprofit',
    name: 'Nonprofit & NGO',
    icon: 'Heart',
    subcategories: ['Charity', 'Foundation', 'Advocacy', 'International Aid'],
    defaultFrameworks: ['pyramid-principle', 'circular-flow', 'funnel-analysis'],
    tags: ['impact', 'fundraising', 'mission'],
  },
];

// ==========================================
// FRAMEWORK REGISTRY
// ==========================================

export const FRAMEWORKS: FrameworkItem[] = [
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis',
    description: 'Strengths, weaknesses, opportunities, threats assessment',
    type: 'analysis',
    source: 'Strategy',
    dataTypes: ['quadrant', 'comparison'],
    compatibleOutputs: ['presentation', 'pdf', 'video'],
  },
  {
    id: 'seven-elements',
    name: '7 Elements Framework',
    description: 'Organizational effectiveness analysis',
    type: 'strategy',
    source: 'Strategy',
    dataTypes: ['diagram', 'comparison'],
    compatibleOutputs: ['presentation', 'pdf'],
  },
  {
    id: 'mece-structure',
    name: 'MECE Structure',
    description: 'Mutually exclusive, collectively exhaustive breakdown',
    type: 'strategy',
    source: 'Strategy',
    dataTypes: ['tree', 'hierarchy'],
    compatibleOutputs: ['presentation', 'pdf', 'infographic'],
  },
  {
    id: 'pyramid-principle',
    name: 'Pyramid Principle',
    description: 'Top-down communication with key message first',
    type: 'strategy',
    source: 'Strategy',
    dataTypes: ['pyramid', 'hierarchy'],
    compatibleOutputs: ['presentation', 'pdf', 'video'],
  },
  {
    id: 'growth-share-matrix',
    name: 'Growth-Share Matrix',
    description: 'Portfolio analysis: Stars, Cash Cows, Question Marks, Dogs',
    type: 'analysis',
    source: 'Analysis',
    dataTypes: ['quadrant', 'scatter'],
    compatibleOutputs: ['presentation', 'pdf', 'interactive'],
  },
  {
    id: 'value-chain',
    name: 'Value Chain',
    description: 'Primary and support activities for competitive advantage',
    type: 'diagram',
    source: 'Diagram',
    dataTypes: ['flow', 'process'],
    compatibleOutputs: ['presentation', 'pdf', 'infographic'],
  },
  {
    id: 'strategic-roadmap',
    name: 'Strategic Roadmap',
    description: 'Timeline-based strategy execution with milestones',
    type: 'diagram',
    source: 'Diagram',
    dataTypes: ['timeline', 'gantt'],
    compatibleOutputs: ['presentation', 'pdf', 'interactive'],
  },
  {
    id: 'technology-lifecycle',
    name: 'Technology Lifecycle',
    description: 'Innovation trigger through plateau of productivity',
    type: 'diagram',
    source: 'Diagram',
    dataTypes: ['curve', 'timeline'],
    compatibleOutputs: ['presentation', 'pdf', 'video'],
  },
  {
    id: 'funnel-analysis',
    name: 'Funnel Analysis',
    description: 'Conversion stages from awareness to action',
    type: 'diagram',
    source: 'Diagram',
    dataTypes: ['funnel', 'flow'],
    compatibleOutputs: ['presentation', 'pdf', 'video', 'interactive'],
  },
  {
    id: 'comparison-matrix',
    name: 'Comparison Matrix',
    description: 'Side-by-side feature or option comparison',
    type: 'comparison',
    source: 'Comparison',
    dataTypes: ['table', 'comparison'],
    compatibleOutputs: ['presentation', 'pdf', 'infographic'],
  },
  {
    id: 'circular-flow',
    name: 'Circular Flow',
    description: 'Continuous improvement cycle or feedback loop',
    type: 'process',
    source: 'Diagram',
    dataTypes: ['cycle', 'circular'],
    compatibleOutputs: ['presentation', 'pdf', 'video'],
  },
  {
    id: 'gear-diagram',
    name: 'Gear Diagram',
    description: 'Interconnected processes and dependencies',
    type: 'diagram',
    source: 'Diagram',
    dataTypes: ['gears', 'process'],
    compatibleOutputs: ['presentation', 'pdf', '3d'],
  },
];

// ==========================================
// OUTPUT TYPE REGISTRY
// ==========================================

export const OUTPUT_TYPES: OutputTypeItem[] = [
  // Document
  {
    id: 'pdf',
    name: 'PDF Document',
    category: 'document',
    extensions: ['.pdf'],
    providers: ['jspdf', 'pdfmake'],
    tier: 'free',
    supportsVoice: false,
    supportsAnimation: false,
  },
  {
    id: 'pptx',
    name: 'PowerPoint',
    category: 'document',
    extensions: ['.pptx'],
    providers: ['pptxgenjs'],
    tier: 'free',
    supportsVoice: false,
    supportsAnimation: true,
  },
  {
    id: 'docx',
    name: 'Word Document',
    category: 'document',
    extensions: ['.docx'],
    providers: ['docx'],
    tier: 'free',
    supportsVoice: false,
    supportsAnimation: false,
  },
  
  // Static
  {
    id: 'presentation',
    name: 'Web Presentation',
    category: 'static',
    extensions: ['.html'],
    providers: ['reveal.js', 'custom'],
    tier: 'free',
    supportsVoice: true,
    supportsAnimation: true,
  },
  {
    id: 'infographic',
    name: 'Infographic',
    category: 'static',
    extensions: ['.png', '.svg'],
    providers: ['html2canvas', 'svg'],
    tier: 'pro',
    supportsVoice: false,
    supportsAnimation: false,
  },
  
  // Video
  {
    id: 'video-mp4',
    name: 'Video (MP4)',
    category: 'video',
    extensions: ['.mp4'],
    providers: ['modelslab', 'replicate', 'ffmpeg'],
    tier: 'pro',
    supportsVoice: true,
    supportsAnimation: true,
  },
  {
    id: 'video-webm',
    name: 'Video (WebM)',
    category: 'video',
    extensions: ['.webm'],
    providers: ['ffmpeg'],
    tier: 'pro',
    supportsVoice: true,
    supportsAnimation: true,
  },
  {
    id: 'animated-gif',
    name: 'Animated GIF',
    category: 'video',
    extensions: ['.gif'],
    providers: ['gif.js'],
    tier: 'free',
    supportsVoice: false,
    supportsAnimation: true,
  },
  
  // Immersive
  {
    id: '3d-presentation',
    name: '3D Presentation',
    category: 'immersive',
    extensions: ['.glb', '.html'],
    providers: ['three.js', 'modelslab'],
    tier: 'enterprise',
    supportsVoice: true,
    supportsAnimation: true,
  },
  {
    id: 'vr-experience',
    name: 'VR Experience',
    category: 'immersive',
    extensions: ['.html'],
    providers: ['aframe', 'three.js'],
    tier: 'enterprise',
    supportsVoice: true,
    supportsAnimation: true,
  },
  
  // Interactive
  {
    id: 'interactive-web',
    name: 'Interactive Web',
    category: 'interactive',
    extensions: ['.html'],
    providers: ['react', 'd3'],
    tier: 'pro',
    supportsVoice: true,
    supportsAnimation: true,
  },
  {
    id: 'embed-widget',
    name: 'Embed Widget',
    category: 'interactive',
    extensions: ['.html', '.js'],
    providers: ['iframe', 'web-component'],
    tier: 'pro',
    supportsVoice: false,
    supportsAnimation: true,
  },
];

// ==========================================
// VISUAL FEATURES REGISTRY
// ==========================================

export const VISUAL_FEATURES: VisualFeatureItem[] = [
  // Charts
  { id: 'bar-chart', name: 'Bar Chart', category: 'charts', providers: ['recharts', 'd3'], tier: 'free', compatibleOutputs: ['presentation', 'pdf', 'video'] },
  { id: 'line-chart', name: 'Line Chart', category: 'charts', providers: ['recharts', 'd3'], tier: 'free', compatibleOutputs: ['presentation', 'pdf', 'video'] },
  { id: 'pie-chart', name: 'Pie Chart', category: 'charts', providers: ['recharts', 'd3'], tier: 'free', compatibleOutputs: ['presentation', 'pdf', 'video'] },
  { id: 'scatter-plot', name: 'Scatter Plot', category: 'charts', providers: ['recharts', 'd3'], tier: 'pro', compatibleOutputs: ['presentation', 'pdf', 'interactive'] },
  { id: 'heatmap', name: 'Heatmap', category: 'charts', providers: ['d3', 'plotly'], tier: 'pro', compatibleOutputs: ['presentation', 'interactive'] },
  
  // Diagrams
  { id: 'flowchart', name: 'Flowchart', category: 'diagrams', providers: ['reactflow', 'mermaid'], tier: 'free', compatibleOutputs: ['presentation', 'pdf', 'infographic'] },
  { id: 'org-chart', name: 'Org Chart', category: 'diagrams', providers: ['reactflow', 'd3'], tier: 'free', compatibleOutputs: ['presentation', 'pdf'] },
  { id: 'mind-map', name: 'Mind Map', category: 'diagrams', providers: ['d3', 'custom'], tier: 'pro', compatibleOutputs: ['presentation', 'interactive'] },
  { id: 'timeline', name: 'Timeline', category: 'diagrams', providers: ['d3', 'custom'], tier: 'free', compatibleOutputs: ['presentation', 'pdf', 'video'] },
  
  // Media
  { id: 'ai-images', name: 'AI Generated Images', category: 'media', providers: ['modelslab', 'replicate', 'dalle'], tier: 'pro', compatibleOutputs: ['presentation', 'pdf', 'video', 'infographic'] },
  { id: 'stock-photos', name: 'Stock Photos', category: 'media', providers: ['unsplash', 'pexels'], tier: 'free', compatibleOutputs: ['presentation', 'pdf', 'video'] },
  { id: 'icons', name: 'Icons', category: 'media', providers: ['lucide', 'heroicons'], tier: 'free', compatibleOutputs: ['presentation', 'pdf', 'infographic'] },
  
  // Animation
  { id: 'slide-transitions', name: 'Slide Transitions', category: 'animation', providers: ['framer-motion'], tier: 'free', compatibleOutputs: ['presentation', 'video'] },
  { id: 'element-animations', name: 'Element Animations', category: 'animation', providers: ['framer-motion', 'gsap'], tier: 'pro', compatibleOutputs: ['presentation', 'video', 'interactive'] },
  { id: 'data-animations', name: 'Data Animations', category: 'animation', providers: ['d3', 'framer-motion'], tier: 'pro', compatibleOutputs: ['presentation', 'video', 'interactive'] },
  
  // 3D
  { id: '3d-charts', name: '3D Charts', category: '3d', providers: ['three.js', 'plotly'], tier: 'enterprise', compatibleOutputs: ['3d-presentation', 'interactive'] },
  { id: '3d-models', name: '3D Models', category: '3d', providers: ['modelslab', 'three.js'], tier: 'enterprise', compatibleOutputs: ['3d-presentation', 'vr-experience'] },
  { id: '3d-scenes', name: '3D Scenes', category: '3d', providers: ['three.js', 'babylon'], tier: 'enterprise', compatibleOutputs: ['3d-presentation', 'vr-experience'] },
  
  // Interactive
  { id: 'clickable-hotspots', name: 'Clickable Hotspots', category: 'interactive', providers: ['custom'], tier: 'pro', compatibleOutputs: ['interactive-web', 'presentation'] },
  { id: 'data-filters', name: 'Data Filters', category: 'interactive', providers: ['react', 'd3'], tier: 'pro', compatibleOutputs: ['interactive-web'] },
  { id: 'embedded-forms', name: 'Embedded Forms', category: 'interactive', providers: ['react-hook-form'], tier: 'pro', compatibleOutputs: ['interactive-web', 'embed-widget'] },
];

// ==========================================
// REGISTRY HELPERS
// ==========================================

export function getIndustry(id: string): IndustryItem | undefined {
  return INDUSTRIES.find(i => i.id === id);
}

export function getFramework(id: string): FrameworkItem | undefined {
  return FRAMEWORKS.find(f => f.id === id);
}

export function getOutputType(id: string): OutputTypeItem | undefined {
  return OUTPUT_TYPES.find(o => o.id === id);
}

export function getVisualFeature(id: string): VisualFeatureItem | undefined {
  return VISUAL_FEATURES.find(v => v.id === id);
}

// Get frameworks compatible with an industry
export function getIndustryFrameworks(industryId: string): FrameworkItem[] {
  const industry = getIndustry(industryId);
  if (!industry) return FRAMEWORKS;
  
  return FRAMEWORKS.filter(f => 
    industry.defaultFrameworks.includes(f.id) ||
    industry.tags?.some(tag => f.tags?.includes(tag))
  );
}

// Get visual features compatible with output type
export function getCompatibleVisuals(outputId: string): VisualFeatureItem[] {
  return VISUAL_FEATURES.filter(v => v.compatibleOutputs.includes(outputId));
}

// Get output types by tier
export function getOutputsByTier(tier: 'free' | 'pro' | 'enterprise'): OutputTypeItem[] {
  const tierOrder = { free: 0, pro: 1, enterprise: 2 };
  return OUTPUT_TYPES.filter(o => tierOrder[o.tier] <= tierOrder[tier]);
}

// ==========================================
// ICON MAPPING
// ==========================================

const ICON_MAP: Record<string, LucideIcon> = {
  Heart, DollarSign, Cpu, Rocket, Building2, GraduationCap, Factory, Plane, 
  PawPrint, Briefcase, Droplets, BarChart3, Zap, Users, Globe, ShoppingBag,
  Truck, Home, Gamepad2, Camera, Palette, Utensils, Music, Clapperboard,
  Radio, Newspaper, Shield, Scale, Stethoscope, Pill
};

export function getIconComponent(iconName: string): LucideIcon | undefined {
  return ICON_MAP[iconName];
}
