/**
 * Wizard Constants & Types
 * Centralized configuration for the 5-step Presentation Wizard
 * Migrated from EnhancedTemplateWorkflow for cleaner architecture
 */

import React from 'react';
import {
  FileText,
  BookOpen,
  GitBranch,
  Rocket,
  Target,
  BarChart3,
  Building2,
  GraduationCap,
  Users,
  Layers,
  TrendingUp,
  LayoutGrid,
  Image as ImageIcon,
  Columns,
  Heart,
  Droplets,
  DollarSign,
  Cpu,
  Plane,
  Factory,
  PawPrint,
  Briefcase,
} from 'lucide-react';
import { BrandConfig } from './BrandingCustomizer';

// ==================== TYPES ====================

export interface CollateralType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'narrative' | 'business' | 'training' | 'research' | 'visual';
  suggestedSlides: number;
  suggestedTones: string[];
}

export interface IndustryCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  subcategories: string[];
}

export interface ConsultingTemplate {
  id: string;
  name: string;
  description: string;
  source: string;
  type: 'framework' | 'diagram' | 'analysis' | 'comparison';
  previewLayout: SlideLayout[];
  dataTypes: string[];
}

export interface SlideLayout {
  id: string;
  type: 'title' | 'content' | 'two-column' | 'chart' | 'image' | 'comparison' | 'framework' | 'timeline';
  zones: LayoutZone[];
}

export interface LayoutZone {
  id: string;
  type: 'text' | 'image' | 'chart' | 'icon' | 'bullet-list';
  position: { x: number; y: number; width: number; height: number };
  placeholder?: string;
}

export interface AIModelConfig {
  textModel: string;
  imageModel: string;
  voiceModel: string;
  translationModel: string;
}

export interface TemplatePreview {
  slides: PreviewSlide[];
  theme: ThemeConfig;
  brand: BrandConfig;
}

export interface PreviewSlide {
  id: string;
  layout: SlideLayout;
  placeholders: Record<string, string>;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface Segment {
  id: string;
  name: string;
  description: string;
}

export interface AIProviderRecommendation {
  textModel: string;
  imageModel: string;
  voiceModel: string;
  translationModel: string;
  videoModel?: string;
  reason: string;
  confidence: number;
  alternativeTextModels?: string[];
  alternativeImageModels?: string[];
}

export interface FinalWorkflowConfig {
  collateralType: CollateralType | null;
  industryCategory: string;
  segment?: string;
  consultingTemplate?: ConsultingTemplate;
  languages: string[];
  brandConfig: BrandConfig;
  theme: ThemeConfig;
  aiModels: AIModelConfig;
  slideCount: number;
  includeNotes: boolean;
  includeVoiceover: boolean;
  aiRecommendation?: AIProviderRecommendation;
}

// ==================== COLLATERAL TYPES ====================

export const COLLATERAL_TYPES: CollateralType[] = [
  // Narrative Category
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Narrative-driven presentation with emotional arc',
    icon: React.createElement(BookOpen, { className: 'h-5 w-5' }),
    category: 'narrative',
    suggestedSlides: 15,
    suggestedTones: ['storytelling', 'empathetic', 'inspirational']
  },
  {
    id: 'case-study',
    name: 'Case Study',
    description: 'Problem-solution narrative with results',
    icon: React.createElement(FileText, { className: 'h-5 w-5' }),
    category: 'narrative',
    suggestedSlides: 12,
    suggestedTones: ['storytelling', 'persuasive', 'scientific']
  },
  {
    id: 'customer-journey',
    name: 'Customer Journey',
    description: 'Visual journey mapping with touchpoints',
    icon: React.createElement(GitBranch, { className: 'h-5 w-5' }),
    category: 'narrative',
    suggestedSlides: 10,
    suggestedTones: ['empathetic', 'conversational']
  },
  // Business Category
  {
    id: 'investor-pitch',
    name: 'Investor Pitch',
    description: 'Startup/funding pitch deck',
    icon: React.createElement(Rocket, { className: 'h-5 w-5' }),
    category: 'business',
    suggestedSlides: 12,
    suggestedTones: ['persuasive', 'professional', 'confident']
  },
  {
    id: 'sales-deck',
    name: 'Sales Deck',
    description: 'Product/service sales presentation',
    icon: React.createElement(Target, { className: 'h-5 w-5' }),
    category: 'business',
    suggestedSlides: 15,
    suggestedTones: ['persuasive', 'engaging', 'confident']
  },
  {
    id: 'quarterly-review',
    name: 'Quarterly Review',
    description: 'Business performance report',
    icon: React.createElement(BarChart3, { className: 'h-5 w-5' }),
    category: 'business',
    suggestedSlides: 20,
    suggestedTones: ['professional', 'analytical']
  },
  {
    id: 'board-presentation',
    name: 'Board Presentation',
    description: 'Executive summary for board meetings',
    icon: React.createElement(Building2, { className: 'h-5 w-5' }),
    category: 'business',
    suggestedSlides: 10,
    suggestedTones: ['professional', 'concise', 'strategic']
  },
  // Training Category
  {
    id: 'training-module',
    name: 'Training Module',
    description: 'Educational content with exercises',
    icon: React.createElement(GraduationCap, { className: 'h-5 w-5' }),
    category: 'training',
    suggestedSlides: 25,
    suggestedTones: ['educational', 'conversational', 'encouraging']
  },
  {
    id: 'onboarding',
    name: 'Onboarding',
    description: 'New employee/customer onboarding',
    icon: React.createElement(Users, { className: 'h-5 w-5' }),
    category: 'training',
    suggestedSlides: 15,
    suggestedTones: ['welcoming', 'clear', 'encouraging']
  },
  {
    id: 'workshop',
    name: 'Workshop',
    description: 'Interactive workshop materials',
    icon: React.createElement(Layers, { className: 'h-5 w-5' }),
    category: 'training',
    suggestedSlides: 30,
    suggestedTones: ['engaging', 'interactive', 'educational']
  },
  // Research Category
  {
    id: 'research-report',
    name: 'Research Report',
    description: 'Data-driven research findings',
    icon: React.createElement(BarChart3, { className: 'h-5 w-5' }),
    category: 'research',
    suggestedSlides: 20,
    suggestedTones: ['scientific', 'analytical', 'objective']
  },
  {
    id: 'market-analysis',
    name: 'Market Analysis',
    description: 'Industry and market research',
    icon: React.createElement(TrendingUp, { className: 'h-5 w-5' }),
    category: 'research',
    suggestedSlides: 18,
    suggestedTones: ['analytical', 'strategic', 'insightful']
  },
  {
    id: 'whitepaper',
    name: 'Whitepaper',
    description: 'In-depth technical/business document',
    icon: React.createElement(FileText, { className: 'h-5 w-5' }),
    category: 'research',
    suggestedSlides: 25,
    suggestedTones: ['scientific', 'authoritative', 'detailed']
  },
  // Visual Category
  {
    id: 'infographic-deck',
    name: 'Infographic Deck',
    description: 'Visual-heavy data presentation',
    icon: React.createElement(LayoutGrid, { className: 'h-5 w-5' }),
    category: 'visual',
    suggestedSlides: 12,
    suggestedTones: ['visual', 'concise', 'impactful']
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Product features and benefits',
    icon: React.createElement(ImageIcon, { className: 'h-5 w-5' }),
    category: 'visual',
    suggestedSlides: 15,
    suggestedTones: ['engaging', 'visual', 'persuasive']
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Work samples and achievements',
    icon: React.createElement(Columns, { className: 'h-5 w-5' }),
    category: 'visual',
    suggestedSlides: 20,
    suggestedTones: ['professional', 'visual', 'impressive']
  },
];

// ==================== INDUSTRY CATEGORIES ====================
// NOTE: This is a legacy export for backward compatibility.
// The authoritative source is: src/components/genie-studio/presentation-generator/registry/contextRegistry.ts
// Import from there for new code: import { INDUSTRIES } from './registry';

import { INDUSTRIES as REGISTRY_INDUSTRIES, getIconComponent } from './registry/contextRegistry';

// Map registry industries to legacy format with React icons
export const INDUSTRY_CATEGORIES: IndustryCategory[] = REGISTRY_INDUSTRIES.map(industry => ({
  id: industry.id,
  name: industry.name,
  icon: React.createElement(
    getIconComponent(industry.icon || 'Briefcase') || Briefcase, 
    { className: 'h-5 w-5' }
  ),
  subcategories: industry.subcategories
}));

// ==================== FRAMEWORK TEMPLATES ====================

export const CONSULTING_TEMPLATES: ConsultingTemplate[] = [
  {
    id: 'seven-elements',
    name: '7 Elements Framework',
    description: 'Organizational effectiveness analysis with strategy, structure, systems, style, staff, skills, and shared values',
    source: 'Strategy',
    type: 'framework',
    previewLayout: [],
    dataTypes: ['diagram', 'comparison']
  },
  {
    id: 'mece-structure',
    name: 'MECE Structure',
    description: 'Mutually exclusive, collectively exhaustive problem breakdown',
    source: 'Strategy',
    type: 'framework',
    previewLayout: [],
    dataTypes: ['tree', 'hierarchy']
  },
  {
    id: 'pyramid-principle',
    name: 'Pyramid Principle',
    description: 'Top-down communication with key message first, supporting points below',
    source: 'Strategy',
    type: 'framework',
    previewLayout: [],
    dataTypes: ['pyramid', 'hierarchy']
  },
  {
    id: 'growth-share-matrix',
    name: 'Growth-Share Matrix',
    description: 'Portfolio analysis with 4 quadrants: Stars, Cash Cows, Question Marks, Dogs',
    source: 'Analysis',
    type: 'analysis',
    previewLayout: [],
    dataTypes: ['quadrant', 'scatter']
  },
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis',
    description: 'Strengths, weaknesses, opportunities, threats assessment',
    source: 'Analysis',
    type: 'analysis',
    previewLayout: [],
    dataTypes: ['quadrant', 'comparison']
  },
  {
    id: 'market-quadrant',
    name: 'Market Quadrant',
    description: 'Market positioning with leaders, challengers, visionaries, niche players',
    source: 'Analysis',
    type: 'analysis',
    previewLayout: [],
    dataTypes: ['quadrant', 'scatter']
  },
  {
    id: 'maturity-assessment',
    name: 'Maturity Assessment',
    description: 'Capability maturity levels from initial to optimized',
    source: 'Analysis',
    type: 'analysis',
    previewLayout: [],
    dataTypes: ['levels', 'progression']
  },
  {
    id: 'value-chain',
    name: 'Value Chain',
    description: 'Primary and support activities for competitive advantage',
    source: 'Diagram',
    type: 'diagram',
    previewLayout: [],
    dataTypes: ['flow', 'process']
  },
  {
    id: 'strategic-roadmap',
    name: 'Strategic Roadmap',
    description: 'Timeline-based strategy execution with milestones',
    source: 'Diagram',
    type: 'diagram',
    previewLayout: [],
    dataTypes: ['timeline', 'gantt']
  },
  {
    id: 'technology-lifecycle',
    name: 'Technology Lifecycle',
    description: 'Innovation trigger through plateau of productivity',
    source: 'Diagram',
    type: 'diagram',
    previewLayout: [],
    dataTypes: ['curve', 'timeline']
  },
  {
    id: 'funnel-analysis',
    name: 'Funnel Analysis',
    description: 'Conversion stages from awareness to action',
    source: 'Diagram',
    type: 'diagram',
    previewLayout: [],
    dataTypes: ['funnel', 'flow']
  },
  {
    id: 'gear-diagram',
    name: 'Gear Diagram',
    description: 'Interconnected processes and dependencies',
    source: 'Diagram',
    type: 'diagram',
    previewLayout: [],
    dataTypes: ['gears', 'process']
  },
  {
    id: 'circular-flow',
    name: 'Circular Flow',
    description: 'Continuous improvement cycle or feedback loop',
    source: 'Diagram',
    type: 'diagram',
    previewLayout: [],
    dataTypes: ['cycle', 'circular']
  },
  {
    id: 'comparison-matrix',
    name: 'Comparison Matrix',
    description: 'Side-by-side feature or option comparison',
    source: 'Comparison',
    type: 'comparison',
    previewLayout: [],
    dataTypes: ['table', 'comparison']
  },
  {
    id: 'stacked-analysis',
    name: 'Stacked Analysis',
    description: 'Multi-variable breakdown with waterfall or stacked bars',
    source: 'Comparison',
    type: 'analysis',
    previewLayout: [],
    dataTypes: ['stacked-bar', 'waterfall']
  },
  {
    id: 'pros-cons',
    name: 'Pros & Cons',
    description: 'Two-column advantages and disadvantages layout',
    source: 'Comparison',
    type: 'comparison',
    previewLayout: [],
    dataTypes: ['two-column', 'list']
  },
  {
    id: 'timeline-comparison',
    name: 'Timeline Comparison',
    description: 'Before/after or phased comparison over time',
    source: 'Comparison',
    type: 'comparison',
    previewLayout: [],
    dataTypes: ['timeline', 'before-after']
  },
];

// ==================== SEGMENTS ====================

export const SEGMENTS: Record<string, Segment[]> = {
  healthcare: [
    { id: 'hospitals', name: 'Hospitals', description: 'Acute care facilities' },
    { id: 'clinics', name: 'Clinics', description: 'Outpatient care centers' },
    { id: 'nursing', name: 'Nursing', description: 'Long-term care facilities' },
    { id: 'pharma', name: 'Pharma', description: 'Pharmaceutical companies' },
    { id: 'biotech', name: 'Biotech', description: 'Biotechnology research' },
    { id: 'medtech', name: 'MedTech', description: 'Medical devices and technology' },
    { id: 'telehealth', name: 'Telehealth', description: 'Remote healthcare services' },
  ],
  energy: [
    { id: 'oil-gas', name: 'Oil & Gas', description: 'Upstream, midstream, downstream' },
    { id: 'renewable', name: 'Renewable', description: 'Solar, wind, hydro energy' },
    { id: 'utilities', name: 'Utilities', description: 'Electric and gas utilities' },
    { id: 'mining', name: 'Mining', description: 'Resource extraction' },
    { id: 'nuclear', name: 'Nuclear', description: 'Nuclear power generation' },
  ],
  finance: [
    { id: 'banking', name: 'Banking', description: 'Retail and commercial banking' },
    { id: 'insurance', name: 'Insurance', description: 'Life, health, property insurance' },
    { id: 'investment', name: 'Investment', description: 'Asset management and trading' },
    { id: 'fintech', name: 'Fintech', description: 'Financial technology startups' },
    { id: 'crypto', name: 'Crypto', description: 'Blockchain and cryptocurrency' },
  ],
  technology: [
    { id: 'saas', name: 'SaaS', description: 'Software as a service' },
    { id: 'ai-ml', name: 'AI/ML', description: 'Artificial intelligence and machine learning' },
    { id: 'cybersecurity', name: 'Cybersecurity', description: 'Security solutions' },
    { id: 'cloud', name: 'Cloud', description: 'Cloud infrastructure and services' },
    { id: 'hardware', name: 'Hardware', description: 'Consumer and enterprise hardware' },
  ],
  startup: [
    { id: 'seed', name: 'Seed Stage', description: 'Pre-product or early MVP' },
    { id: 'series-a', name: 'Series A', description: 'Product-market fit stage' },
    { id: 'series-b', name: 'Series B', description: 'Scaling operations' },
    { id: 'series-c', name: 'Series C+', description: 'Late-stage growth' },
    { id: 'accelerator', name: 'Accelerator', description: 'Accelerator or incubator' },
  ],
  travel: [
    { id: 'airlines', name: 'Airlines', description: 'Commercial aviation' },
    { id: 'hotels', name: 'Hotels', description: 'Hospitality and lodging' },
    { id: 'tourism', name: 'Tourism', description: 'Tour operators and destinations' },
    { id: 'cruise', name: 'Cruise', description: 'Cruise lines and maritime' },
    { id: 'events', name: 'Events', description: 'Conferences and events' },
  ],
  manufacturing: [
    { id: 'automotive', name: 'Automotive', description: 'Vehicle manufacturing' },
    { id: 'aerospace', name: 'Aerospace', description: 'Aviation and space' },
    { id: 'electronics', name: 'Electronics', description: 'Consumer and industrial electronics' },
    { id: 'industrial', name: 'Industrial', description: 'Heavy machinery and equipment' },
  ],
  veterinary: [
    { id: 'vet-clinics', name: 'Vet Clinics', description: 'Veterinary practices' },
    { id: 'pet-products', name: 'Pet Products', description: 'Pet food and supplies' },
    { id: 'animal-health', name: 'Animal Health', description: 'Animal pharmaceuticals' },
  ],
  consulting: [
    { id: 'strategy', name: 'Strategy', description: 'Strategic advisory' },
    { id: 'management', name: 'Management', description: 'Operations and organization' },
    { id: 'technology-consulting', name: 'Technology', description: 'IT and digital transformation' },
    { id: 'hr-consulting', name: 'HR', description: 'Human resources and talent' },
  ],
  education: [
    { id: 'k12', name: 'K-12', description: 'Primary and secondary education' },
    { id: 'higher-ed', name: 'Higher Ed', description: 'Universities and colleges' },
    { id: 'edtech', name: 'EdTech', description: 'Educational technology' },
    { id: 'corporate-training', name: 'Corporate Training', description: 'Enterprise learning' },
  ],
};

// ==================== AI PROVIDER RECOMMENDATIONS ====================

export function getRecommendedProviders(
  industry: string,
  segment: string,
  collateralType: string,
  languages: string[]
): AIProviderRecommendation {
  let recommendation: AIProviderRecommendation = {
    textModel: 'google/gemini-3-flash-preview',
    imageModel: 'flux-pro',
    voiceModel: 'elevenlabs-multilingual',
    translationModel: 'deepl',
    videoModel: 'runway',
    reason: 'Balanced quality and speed',
    confidence: 85,
    alternativeTextModels: ['openai/gpt-5-mini', 'google/gemini-2.5-flash'],
    alternativeImageModels: ['stable-diffusion-xl', 'dall-e-3'],
  };

  // Healthcare/Pharma/Biotech
  if (['healthcare', 'pharma', 'biotech'].includes(industry) || 
      ['pharma', 'biotech', 'hospitals', 'clinics', 'nursing', 'medtech', 'telehealth'].includes(segment)) {
    recommendation = {
      textModel: 'openai/gpt-5',
      imageModel: 'flux-pro',
      voiceModel: 'elevenlabs-multilingual',
      translationModel: 'deepl',
      videoModel: 'runway',
      reason: 'High accuracy for medical content with compliance focus',
      confidence: 92,
      alternativeTextModels: ['google/gemini-2.5-pro', 'anthropic/claude-3.5-sonnet'],
      alternativeImageModels: ['dall-e-3', 'modelslab-realvision'],
    };
  }

  // Energy/Manufacturing
  if (['energy', 'manufacturing'].includes(industry) || 
      ['oil-gas', 'renewable', 'automotive', 'aerospace', 'industrial'].includes(segment)) {
    recommendation = {
      textModel: 'google/gemini-2.5-pro',
      imageModel: 'flux-pro',
      voiceModel: 'azure-neural',
      translationModel: 'deepl',
      videoModel: 'modelslab-video',
      reason: 'Technical content with industry-specific terminology',
      confidence: 88,
      alternativeTextModels: ['openai/gpt-5', 'google/gemini-3-flash-preview'],
      alternativeImageModels: ['stable-diffusion-xl', 'flux-schnell'],
    };
  }

  // Finance/Fintech
  if (['finance'].includes(industry) || 
      ['banking', 'insurance', 'investment', 'fintech', 'crypto'].includes(segment)) {
    recommendation = {
      textModel: 'openai/gpt-5',
      imageModel: 'dall-e-3',
      voiceModel: 'elevenlabs-multilingual',
      translationModel: 'deepl',
      videoModel: 'runway',
      reason: 'Precision for financial data and regulatory content',
      confidence: 90,
      alternativeTextModels: ['google/gemini-2.5-pro', 'anthropic/claude-3.5-sonnet'],
      alternativeImageModels: ['flux-pro', 'stable-diffusion-xl'],
    };
  }

  // Startup/VC
  if (['startup'].includes(industry) || collateralType === 'investor-pitch') {
    recommendation = {
      textModel: 'openai/gpt-5',
      imageModel: 'dall-e-3',
      voiceModel: 'elevenlabs-multilingual',
      translationModel: 'deepl',
      videoModel: 'runway',
      reason: 'Optimized for persuasive business content and investor engagement',
      confidence: 91,
      alternativeTextModels: ['google/gemini-2.5-pro', 'anthropic/claude-3.5-sonnet'],
      alternativeImageModels: ['flux-pro', 'midjourney'],
    };
  }

  // Technology/AI
  if (['technology'].includes(industry) || 
      ['saas', 'ai-ml', 'cybersecurity', 'cloud'].includes(segment)) {
    recommendation = {
      textModel: 'google/gemini-3-flash-preview',
      imageModel: 'flux-pro',
      voiceModel: 'openai-tts-hd',
      translationModel: 'deepl',
      videoModel: 'runway',
      reason: 'Latest models for tech-savvy audiences',
      confidence: 89,
      alternativeTextModels: ['openai/gpt-5', 'google/gemini-2.5-pro'],
      alternativeImageModels: ['dall-e-3', 'stable-diffusion-xl'],
    };
  }

  // Training/Education
  if (['education'].includes(industry) || 
      ['training-module', 'onboarding', 'workshop'].includes(collateralType)) {
    recommendation = {
      textModel: 'google/gemini-2.5-flash',
      imageModel: 'flux-schnell',
      voiceModel: 'google-wavenet',
      translationModel: 'google-translate',
      videoModel: 'modelslab-video',
      reason: 'Clear and educational tone with fast generation',
      confidence: 87,
      alternativeTextModels: ['openai/gpt-5-mini', 'google/gemini-3-flash-preview'],
      alternativeImageModels: ['flux-pro', 'stable-diffusion-xl'],
    };
  }

  // Consulting
  if (['consulting'].includes(industry) || 
      ['strategy', 'management'].includes(segment)) {
    recommendation = {
      textModel: 'openai/gpt-5',
      imageModel: 'dall-e-3',
      voiceModel: 'elevenlabs-multilingual',
      translationModel: 'deepl',
      videoModel: 'runway',
      reason: 'Professional consulting frameworks with polished output',
      confidence: 92,
      alternativeTextModels: ['google/gemini-2.5-pro', 'anthropic/claude-3.5-sonnet'],
      alternativeImageModels: ['flux-pro', 'modelslab-realvision'],
    };
  }

  // Travel/Hospitality
  if (['travel'].includes(industry) || 
      ['airlines', 'hotels', 'tourism', 'cruise'].includes(segment)) {
    recommendation = {
      textModel: 'google/gemini-3-flash-preview',
      imageModel: 'flux-pro',
      voiceModel: 'elevenlabs-multilingual',
      translationModel: 'deepl',
      videoModel: 'runway',
      reason: 'Visually stunning content for travel and hospitality',
      confidence: 88,
      alternativeTextModels: ['openai/gpt-5-mini', 'google/gemini-2.5-flash'],
      alternativeImageModels: ['dall-e-3', 'stable-diffusion-xl'],
    };
  }

  // Research/Whitepaper
  if (['research-report', 'whitepaper', 'market-analysis'].includes(collateralType)) {
    recommendation = {
      textModel: 'google/gemini-2.5-pro',
      imageModel: 'flux-pro',
      voiceModel: 'azure-neural',
      translationModel: 'deepl',
      videoModel: 'modelslab-video',
      reason: 'Research-grade accuracy with data visualization focus',
      confidence: 90,
      alternativeTextModels: ['openai/gpt-5', 'anthropic/claude-3.5-sonnet'],
      alternativeImageModels: ['stable-diffusion-xl', 'dall-e-3'],
    };
  }

  // Visual content types
  if (['infographic-deck', 'product-showcase', 'portfolio'].includes(collateralType)) {
    recommendation.imageModel = 'dall-e-3';
    recommendation.alternativeImageModels = ['flux-pro', 'midjourney', 'stable-diffusion-xl'];
    recommendation.reason += ' + Premium image generation';
    recommendation.confidence = Math.min(recommendation.confidence + 3, 95);
  }

  // Multi-language support
  if (languages.length > 3) {
    recommendation.translationModel = 'deepl';
    recommendation.reason += ' + DeepL for multi-language accuracy';
    recommendation.confidence = Math.min(recommendation.confidence + 2, 95);
  }

  // CJK languages
  const hasCJK = languages.some(l => ['zh', 'zh-TW', 'ja', 'ko'].includes(l));
  if (hasCJK) {
    recommendation.translationModel = 'qwen-mt';
    recommendation.voiceModel = 'azure-neural';
    recommendation.reason += ' + CJK-optimized providers';
  }

  // Indian languages
  const hasIndian = languages.some(l => ['hi', 'te', 'ta', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'].includes(l));
  if (hasIndian) {
    recommendation.voiceModel = 'azure-neural';
    recommendation.translationModel = 'google-translate';
    recommendation.reason += ' + Indian language support';
  }

  // Arabic
  const hasArabic = languages.some(l => l.startsWith('ar'));
  if (hasArabic) {
    recommendation.voiceModel = 'azure-neural';
    recommendation.translationModel = 'azure-translator';
    recommendation.reason += ' + Arabic RTL support';
  }

  return recommendation;
}

// ==================== AI MODELS ====================

export const AI_MODELS = {
  text: [
    { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'Google', tier: 'standard', recommended: true },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', tier: 'premium' },
    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', tier: 'standard' },
    { id: 'openai/gpt-5', name: 'GPT-5', provider: 'OpenAI', tier: 'premium' },
    { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI', tier: 'standard' },
    { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', provider: 'OpenAI', tier: 'economy' },
  ],
  image: [
    { id: 'flux-pro', name: 'Flux Pro', provider: 'Black Forest', tier: 'premium', recommended: true },
    { id: 'flux-schnell', name: 'Flux Schnell', provider: 'Black Forest', tier: 'standard' },
    { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI', tier: 'premium' },
    { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', provider: 'Stability AI', tier: 'standard' },
    { id: 'modelslab-realvision', name: 'RealVision', provider: 'ModelsLab', tier: 'standard' },
  ],
  voice: [
    { id: 'elevenlabs-multilingual', name: 'ElevenLabs Multilingual', provider: 'ElevenLabs', tier: 'premium', recommended: true },
    { id: 'elevenlabs-turbo', name: 'ElevenLabs Turbo', provider: 'ElevenLabs', tier: 'standard' },
    { id: 'google-wavenet', name: 'Google WaveNet', provider: 'Google', tier: 'premium' },
    { id: 'azure-neural', name: 'Azure Neural', provider: 'Microsoft', tier: 'premium' },
    { id: 'openai-tts-hd', name: 'OpenAI TTS HD', provider: 'OpenAI', tier: 'premium' },
  ],
  translation: [
    { id: 'deepl', name: 'DeepL', provider: 'DeepL', tier: 'premium', recommended: true },
    { id: 'google-translate', name: 'Google Translate', provider: 'Google', tier: 'standard' },
    { id: 'azure-translator', name: 'Azure Translator', provider: 'Microsoft', tier: 'premium' },
    { id: 'qwen-mt', name: 'Qwen MT', provider: 'Alibaba', tier: 'standard' },
    { id: 'nllb', name: 'NLLB', provider: 'Meta', tier: 'economy' },
  ],
};

// ==================== THEME PRESETS ====================

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'professional-dark',
    name: 'Professional Dark',
    colors: { primary: '#3b82f6', secondary: '#1e40af', accent: '#f59e0b', background: '#0f172a', foreground: '#f8fafc' },
    fonts: { heading: 'Inter', body: 'Inter' }
  },
  {
    id: 'professional-light',
    name: 'Professional Light',
    colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#f59e0b', background: '#ffffff', foreground: '#1f2937' },
    fonts: { heading: 'Inter', body: 'Inter' }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    colors: { primary: '#18181b', secondary: '#52525b', accent: '#a1a1aa', background: '#fafafa', foreground: '#18181b' },
    fonts: { heading: 'Helvetica Neue', body: 'Helvetica Neue' }
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    colors: { primary: '#ec4899', secondary: '#8b5cf6', accent: '#22d3ee', background: '#fef3c7', foreground: '#1f2937' },
    fonts: { heading: 'Poppins', body: 'Inter' }
  },
  {
    id: 'tech',
    name: 'Tech Modern',
    colors: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#22d3ee', background: '#0f172a', foreground: '#f8fafc' },
    fonts: { heading: 'JetBrains Mono', body: 'Inter' }
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    colors: { primary: '#0891b2', secondary: '#06b6d4', accent: '#14b8a6', background: '#ffffff', foreground: '#134e4a' },
    fonts: { heading: 'Lato', body: 'Open Sans' }
  },
];
