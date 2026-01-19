/**
 * ENHANCED TEMPLATE WORKFLOW
 * 
 * Complete redesign of template selection and customization:
 * 1. Input → Languages → Template Selection → Branding → Preview → Generate
 * 2. Expanded collateral types with storytelling
 * 3. AI model selection per task
 * 4. Category-based template browsing
 * 5. Logo upload with color extraction
 * 6. Template preview BEFORE content generation
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Sparkles,
  Palette,
  Layout,
  BarChart3,
  Image as ImageIcon,
  Type,
  Table,
  PieChart,
  TrendingUp,
  Calendar,
  Users,
  Quote,
  Zap,
  Check,
  Star,
  Settings2,
  Wand2,
  RefreshCw,
  Grid3X3,
  Layers,
  Target,
  Book,
  Briefcase,
  Heart,
  Cpu,
  DollarSign,
  GraduationCap,
  Upload,
  Eye,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  FileText,
  Video,
  Mic,
  Globe,
  Building2,
  Plane,
  Stethoscope,
  Factory,
  Droplets,
  Pill,
  Rocket,
  Hotel,
  PawPrint,
  Activity,
  Building,
  Presentation,
  BookOpen,
  Triangle,
  Circle,
  Cog,
  GitBranch,
  Minimize2,
  Maximize2,
  LayoutGrid,
  Columns,
  Play,
  X,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
  source: string; // McKinsey, BCG, Bain, etc.
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

export interface BrandConfig {
  logoUrl?: string;
  extractedColors: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tagline: string;
  fontFamily: string;
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

// ==================== COLLATERAL TYPES ====================

export const COLLATERAL_TYPES: CollateralType[] = [
  // Narrative Category
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Narrative-driven presentation with emotional arc',
    icon: <BookOpen className="h-5 w-5" />,
    category: 'narrative',
    suggestedSlides: 15,
    suggestedTones: ['storytelling', 'empathetic', 'inspirational']
  },
  {
    id: 'case-study',
    name: 'Case Study',
    description: 'Problem-solution narrative with results',
    icon: <FileText className="h-5 w-5" />,
    category: 'narrative',
    suggestedSlides: 12,
    suggestedTones: ['storytelling', 'persuasive', 'scientific']
  },
  {
    id: 'customer-journey',
    name: 'Customer Journey',
    description: 'Visual journey mapping with touchpoints',
    icon: <GitBranch className="h-5 w-5" />,
    category: 'narrative',
    suggestedSlides: 10,
    suggestedTones: ['empathetic', 'conversational']
  },
  // Business Category
  {
    id: 'investor-pitch',
    name: 'Investor Pitch',
    description: 'Startup/funding pitch deck',
    icon: <Rocket className="h-5 w-5" />,
    category: 'business',
    suggestedSlides: 12,
    suggestedTones: ['persuasive', 'professional', 'confident']
  },
  {
    id: 'sales-deck',
    name: 'Sales Deck',
    description: 'Product/service sales presentation',
    icon: <Target className="h-5 w-5" />,
    category: 'business',
    suggestedSlides: 15,
    suggestedTones: ['persuasive', 'engaging', 'confident']
  },
  {
    id: 'quarterly-review',
    name: 'Quarterly Review',
    description: 'Business performance report',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'business',
    suggestedSlides: 20,
    suggestedTones: ['professional', 'analytical']
  },
  {
    id: 'board-presentation',
    name: 'Board Presentation',
    description: 'Executive summary for board meetings',
    icon: <Building2 className="h-5 w-5" />,
    category: 'business',
    suggestedSlides: 10,
    suggestedTones: ['professional', 'concise', 'strategic']
  },
  // Training Category
  {
    id: 'training-module',
    name: 'Training Module',
    description: 'Educational content with exercises',
    icon: <GraduationCap className="h-5 w-5" />,
    category: 'training',
    suggestedSlides: 25,
    suggestedTones: ['educational', 'conversational', 'encouraging']
  },
  {
    id: 'onboarding',
    name: 'Onboarding',
    description: 'New employee/customer onboarding',
    icon: <Users className="h-5 w-5" />,
    category: 'training',
    suggestedSlides: 15,
    suggestedTones: ['welcoming', 'clear', 'encouraging']
  },
  {
    id: 'workshop',
    name: 'Workshop',
    description: 'Interactive workshop materials',
    icon: <Layers className="h-5 w-5" />,
    category: 'training',
    suggestedSlides: 30,
    suggestedTones: ['engaging', 'interactive', 'educational']
  },
  // Research Category
  {
    id: 'research-report',
    name: 'Research Report',
    description: 'Data-driven research findings',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'research',
    suggestedSlides: 20,
    suggestedTones: ['scientific', 'analytical', 'objective']
  },
  {
    id: 'market-analysis',
    name: 'Market Analysis',
    description: 'Industry and market research',
    icon: <TrendingUp className="h-5 w-5" />,
    category: 'research',
    suggestedSlides: 18,
    suggestedTones: ['analytical', 'strategic', 'insightful']
  },
  {
    id: 'whitepaper',
    name: 'Whitepaper',
    description: 'In-depth technical/business document',
    icon: <FileText className="h-5 w-5" />,
    category: 'research',
    suggestedSlides: 25,
    suggestedTones: ['scientific', 'authoritative', 'detailed']
  },
  // Visual Category
  {
    id: 'infographic-deck',
    name: 'Infographic Deck',
    description: 'Visual-heavy data presentation',
    icon: <LayoutGrid className="h-5 w-5" />,
    category: 'visual',
    suggestedSlides: 12,
    suggestedTones: ['visual', 'concise', 'impactful']
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Product features and benefits',
    icon: <ImageIcon className="h-5 w-5" />,
    category: 'visual',
    suggestedSlides: 15,
    suggestedTones: ['engaging', 'visual', 'persuasive']
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Work samples and achievements',
    icon: <Columns className="h-5 w-5" />,
    category: 'visual',
    suggestedSlides: 20,
    suggestedTones: ['professional', 'visual', 'impressive']
  },
];

// ==================== INDUSTRY CATEGORIES ====================

export const INDUSTRY_CATEGORIES: IndustryCategory[] = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: <Heart className="h-5 w-5" />,
    subcategories: ['Hospitals', 'Clinics', 'Nursing', 'Pharma', 'Biotech', 'Medical Devices']
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: <Droplets className="h-5 w-5" />,
    subcategories: ['Oil & Gas', 'Renewable', 'Utilities', 'Mining']
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: <DollarSign className="h-5 w-5" />,
    subcategories: ['Banking', 'Insurance', 'Investment', 'Fintech', 'Crypto']
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: <Cpu className="h-5 w-5" />,
    subcategories: ['SaaS', 'AI/ML', 'Cybersecurity', 'Cloud', 'Hardware']
  },
  {
    id: 'startup',
    name: 'Startup & VC',
    icon: <Rocket className="h-5 w-5" />,
    subcategories: ['Seed Stage', 'Series A-C', 'Late Stage', 'Accelerator']
  },
  {
    id: 'travel',
    name: 'Travel & Hospitality',
    icon: <Plane className="h-5 w-5" />,
    subcategories: ['Airlines', 'Hotels', 'Tourism', 'Cruise', 'Events']
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: <Factory className="h-5 w-5" />,
    subcategories: ['Automotive', 'Aerospace', 'Electronics', 'Industrial']
  },
  {
    id: 'veterinary',
    name: 'Veterinary & Pets',
    icon: <PawPrint className="h-5 w-5" />,
    subcategories: ['Vet Clinics', 'Pet Products', 'Animal Health']
  },
  {
    id: 'consulting',
    name: 'Consulting',
    icon: <Briefcase className="h-5 w-5" />,
    subcategories: ['Strategy', 'Management', 'Technology', 'HR']
  },
  {
    id: 'education',
    name: 'Education',
    icon: <GraduationCap className="h-5 w-5" />,
    subcategories: ['K-12', 'Higher Ed', 'EdTech', 'Corporate Training']
  },
];

// ==================== FRAMEWORK TEMPLATES (Generic - No Branded Names) ====================

export const CONSULTING_TEMPLATES: ConsultingTemplate[] = [
  // Strategy Frameworks
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
  // Analysis Templates
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
  // Diagram Templates
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
  // Comparison Templates
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

export interface Segment {
  id: string;
  name: string;
  description: string;
}

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

export interface AIProviderRecommendation {
  textModel: string;
  imageModel: string;
  voiceModel: string;
  translationModel: string;
  reason: string;
}

export function getRecommendedProviders(
  industry: string,
  segment: string,
  collateralType: string,
  languages: string[]
): AIProviderRecommendation {
  // Default recommendations
  let recommendation: AIProviderRecommendation = {
    textModel: 'gemini-1.5-pro',
    imageModel: 'flux-pro',
    voiceModel: 'elevenlabs-multilingual',
    translationModel: 'deepl',
    reason: 'Balanced quality and speed'
  };

  // Healthcare/Pharma/Biotech - prioritize accuracy
  if (['healthcare', 'pharma', 'biotech'].includes(industry) || 
      ['pharma', 'biotech', 'hospitals', 'clinics'].includes(segment)) {
    recommendation = {
      textModel: 'claude-3.5-sonnet',
      imageModel: 'flux-pro',
      voiceModel: 'elevenlabs-multilingual',
      translationModel: 'deepl',
      reason: 'High accuracy for medical content'
    };
  }

  // Investor pitch - prioritize persuasive content
  if (['startup', 'investor-pitch'].includes(industry) || collateralType === 'investor-pitch') {
    recommendation = {
      textModel: 'gpt-4o',
      imageModel: 'dall-e-3',
      voiceModel: 'elevenlabs-multilingual',
      translationModel: 'deepl',
      reason: 'Optimized for persuasive business content'
    };
  }

  // Training/Education - prioritize clarity
  if (['education', 'training-module', 'workshop'].includes(industry) || 
      ['training-module', 'onboarding', 'workshop'].includes(collateralType)) {
    recommendation = {
      textModel: 'gemini-1.5-pro',
      imageModel: 'flux-schnell',
      voiceModel: 'google-wavenet',
      translationModel: 'google-translate',
      reason: 'Clear and educational tone'
    };
  }

  // Multi-language support - prioritize translation quality
  if (languages.length > 3) {
    recommendation.translationModel = 'deepl';
    recommendation.reason += ' + DeepL for multi-language accuracy';
  }

  // CJK languages - use specialized providers
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

// ==================== AI MODELS (Lovable AI Compatible) ====================

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

// ==================== COMPONENT PROPS ====================

interface EnhancedTemplateWorkflowProps {
  onComplete: (config: FinalWorkflowConfig) => void;
  onCancel: () => void;
  initialInput?: {
    content?: string;
    url?: string;
    files?: File[];
  };
  className?: string;
}

export interface FinalWorkflowConfig {
  collateralType: CollateralType;
  industryCategory: string;
  segment?: string;
  consultingTemplate?: ConsultingTemplate;
  languages: string[];
  brand: BrandConfig;
  theme: ThemeConfig;
  aiModels: AIModelConfig;
  slideCount: number;
  includeNotes: boolean;
  includeVoiceover: boolean;
  aiRecommendation?: AIProviderRecommendation;
}

// ==================== MAIN COMPONENT ====================

export function EnhancedTemplateWorkflow({
  onComplete,
  onCancel,
  initialInput,
  className
}: EnhancedTemplateWorkflowProps) {
  // Workflow step state
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Collateral', 'Category', 'Template', 'Branding', 'Preview', 'Generate'];
  
  // Selection states
  const [selectedCollateral, setSelectedCollateral] = useState<CollateralType | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ConsultingTemplate | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig>(THEME_PRESETS[1]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  
  // AI provider recommendation
  const [aiRecommendation, setAiRecommendation] = useState<AIProviderRecommendation | null>(null);
  
  // Brand configuration
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    extractedColors: [],
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    accentColor: '#f59e0b',
    tagline: '',
    fontFamily: 'Inter'
  });
  
  // AI model configuration
  const [aiModels, setAiModels] = useState<AIModelConfig>({
    textModel: 'gpt-4o',
    imageModel: 'dall-e-3',
    voiceModel: 'elevenlabs-multilingual',
    translationModel: 'deepl'
  });
  
  // Output settings
  const [slideCount, setSlideCount] = useState(12);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeVoiceover, setIncludeVoiceover] = useState(false);
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewSlides, setPreviewSlides] = useState<PreviewSlide[]>([]);
  
  // File upload
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  
  // Handle logo upload and color extraction
  const handleLogoUpload = useCallback(async (file: File) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setLogoPreview(dataUrl);
      setBrandConfig(prev => ({ ...prev, logoUrl: dataUrl }));
      
      // Extract colors from logo
      setIsExtractingColors(true);
      try {
        const colors = await extractColorsFromImage(dataUrl);
        setBrandConfig(prev => ({
          ...prev,
          extractedColors: colors,
          primaryColor: colors[0] || prev.primaryColor,
          secondaryColor: colors[1] || prev.secondaryColor,
          accentColor: colors[2] || prev.accentColor
        }));
        toast.success('Colors extracted from logo!');
      } catch (error) {
        console.error('Color extraction failed:', error);
      } finally {
        setIsExtractingColors(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);
  
  // Simple color extraction from image
  const extractColorsFromImage = async (imageUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(['#1e40af', '#3b82f6', '#f59e0b']);
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorCounts: Record<string, number> = {};
        
        // Sample pixels
        for (let i = 0; i < imageData.length; i += 40) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];
          
          if (a < 128) continue; // Skip transparent
          
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }
        
        const sortedColors = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([color]) => color)
          .filter(color => {
            // Filter out very light/dark colors
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness > 30 && brightness < 225;
          })
          .slice(0, 5);
        
        resolve(sortedColors.length >= 3 ? sortedColors : ['#1e40af', '#3b82f6', '#f59e0b']);
      };
      img.onerror = () => resolve(['#1e40af', '#3b82f6', '#f59e0b']);
      img.src = imageUrl;
    });
  };
  
  // Generate template preview
  const generatePreview = useCallback(() => {
    if (!selectedCollateral || !selectedTheme) return;
    
    const slides: PreviewSlide[] = [];
    const count = slideCount || selectedCollateral.suggestedSlides;
    
    // Title slide
    slides.push({
      id: 'title',
      layout: { id: 'title', type: 'title', zones: [] },
      placeholders: { title: 'Your Presentation Title', subtitle: brandConfig.tagline || 'Subtitle goes here' }
    });
    
    // Content slides based on template type
    for (let i = 1; i < count - 1; i++) {
      slides.push({
        id: `slide-${i}`,
        layout: { id: `content-${i}`, type: i % 3 === 0 ? 'chart' : i % 2 === 0 ? 'two-column' : 'content', zones: [] },
        placeholders: { title: `Section ${i}`, content: 'Content will be generated here...' }
      });
    }
    
    // Closing slide
    slides.push({
      id: 'closing',
      layout: { id: 'closing', type: 'title', zones: [] },
      placeholders: { title: 'Thank You', subtitle: 'Questions?' }
    });
    
    setPreviewSlides(slides);
    setShowPreview(true);
  }, [selectedCollateral, selectedTheme, slideCount, brandConfig.tagline]);
  
  // Handle final generation
  const handleComplete = useCallback(() => {
    if (!selectedCollateral) {
      toast.error('Please select a collateral type');
      return;
    }
    
    onComplete({
      collateralType: selectedCollateral,
      industryCategory: selectedIndustry?.id || 'general',
      consultingTemplate: selectedTemplate || undefined,
      languages: selectedLanguages,
      brand: brandConfig,
      theme: selectedTheme,
      aiModels,
      slideCount,
      includeNotes,
      includeVoiceover
    });
  }, [selectedCollateral, selectedIndustry, selectedTemplate, selectedLanguages, brandConfig, selectedTheme, aiModels, slideCount, includeNotes, includeVoiceover, onComplete]);
  
  // Navigation
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: return selectedCollateral !== null;
      case 1: return selectedIndustry !== null;
      case 2: return true; // Template is optional
      case 3: return true; // Branding is optional
      case 4: return true; // Preview is optional
      default: return true;
    }
  }, [currentStep, selectedCollateral, selectedIndustry]);
  
  const goNext = () => {
    if (canProceed && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span className={cn(
              "ml-2 text-sm hidden sm:inline",
              index === currentStep ? "font-medium text-foreground" : "text-muted-foreground"
            )}>
              {step}
            </span>
            {index < steps.length - 1 && (
              <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
      
      {/* Step Content */}
      <ScrollArea className="flex-1 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 0: Collateral Type Selection */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">What type of content are you creating?</h2>
                  <p className="text-muted-foreground">Choose the collateral type that best matches your goals</p>
                </div>
                
                {/* Category Tabs */}
                <Tabs defaultValue="narrative" className="w-full">
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="narrative" className="text-xs">Narrative</TabsTrigger>
                    <TabsTrigger value="business" className="text-xs">Business</TabsTrigger>
                    <TabsTrigger value="training" className="text-xs">Training</TabsTrigger>
                    <TabsTrigger value="research" className="text-xs">Research</TabsTrigger>
                    <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
                  </TabsList>
                  
                  {['narrative', 'business', 'training', 'research', 'visual'].map(category => (
                    <TabsContent key={category} value={category} className="mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {COLLATERAL_TYPES.filter(c => c.category === category).map(collateral => (
                          <Card
                            key={collateral.id}
                            className={cn(
                              "cursor-pointer transition-all hover:border-primary/50",
                              selectedCollateral?.id === collateral.id && "border-primary ring-2 ring-primary/20"
                            )}
                            onClick={() => {
                              setSelectedCollateral(collateral);
                              setSlideCount(collateral.suggestedSlides);
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  selectedCollateral?.id === collateral.id ? "bg-primary/10 text-primary" : "bg-muted"
                                )}>
                                  {collateral.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm">{collateral.name}</h4>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {collateral.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                      ~{collateral.suggestedSlides} slides
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
            
            {/* Step 1: Industry Category & Segment */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Select your industry & segment</h2>
                  <p className="text-muted-foreground">This helps us choose the right tone, terminology, templates, and AI providers</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {INDUSTRY_CATEGORIES.map(industry => (
                    <Card
                      key={industry.id}
                      className={cn(
                        "cursor-pointer transition-all hover:border-primary/50",
                        selectedIndustry?.id === industry.id && "border-primary ring-2 ring-primary/20"
                      )}
                      onClick={() => {
                        setSelectedIndustry(industry);
                        setSelectedSubcategory(null);
                        setSelectedSegment(null);
                        // Update AI recommendations when industry changes
                        const rec = getRecommendedProviders(
                          industry.id,
                          '',
                          selectedCollateral?.id || '',
                          selectedLanguages
                        );
                        setAiRecommendation(rec);
                        setAiModels({
                          textModel: rec.textModel,
                          imageModel: rec.imageModel,
                          voiceModel: rec.voiceModel,
                          translationModel: rec.translationModel,
                        });
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={cn(
                          "mx-auto p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2",
                          selectedIndustry?.id === industry.id ? "bg-primary/10 text-primary" : "bg-muted"
                        )}>
                          {industry.icon}
                        </div>
                        <h4 className="font-medium text-sm">{industry.name}</h4>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Segments - Industry specific */}
                {selectedIndustry && SEGMENTS[selectedIndustry.id] && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Select Segment
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {SEGMENTS[selectedIndustry.id].map(segment => (
                        <Card
                          key={segment.id}
                          className={cn(
                            "cursor-pointer transition-all hover:border-primary/50 p-3",
                            selectedSegment === segment.id && "border-primary ring-2 ring-primary/20"
                          )}
                          onClick={() => {
                            setSelectedSegment(segment.id === selectedSegment ? null : segment.id);
                            // Update AI recommendations when segment changes
                            const rec = getRecommendedProviders(
                              selectedIndustry.id,
                              segment.id,
                              selectedCollateral?.id || '',
                              selectedLanguages
                            );
                            setAiRecommendation(rec);
                            setAiModels({
                              textModel: rec.textModel,
                              imageModel: rec.imageModel,
                              voiceModel: rec.voiceModel,
                              translationModel: rec.translationModel,
                            });
                          }}
                        >
                          <h5 className="font-medium text-sm">{segment.name}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{segment.description}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* AI Recommendation Preview */}
                {aiRecommendation && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">AI Provider Recommendation</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{aiRecommendation.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Type className="h-3 w-3 mr-1" />
                          {AI_MODELS.text.find(m => m.id === aiRecommendation.textModel)?.name || aiRecommendation.textModel}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {AI_MODELS.image.find(m => m.id === aiRecommendation.imageModel)?.name || aiRecommendation.imageModel}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Mic className="h-3 w-3 mr-1" />
                          {AI_MODELS.voice.find(m => m.id === aiRecommendation.voiceModel)?.name || aiRecommendation.voiceModel}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          {AI_MODELS.translation.find(m => m.id === aiRecommendation.translationModel)?.name || aiRecommendation.translationModel}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {/* Step 2: Template Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Choose a consulting framework</h2>
                  <p className="text-muted-foreground">Professional templates inspired by top consulting firms</p>
                </div>
                
                <Tabs defaultValue="framework">
                  <TabsList>
                    <TabsTrigger value="framework">Frameworks</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="diagram">Diagrams</TabsTrigger>
                    <TabsTrigger value="comparison">Comparison</TabsTrigger>
                  </TabsList>
                  
                  {['framework', 'analysis', 'diagram', 'comparison'].map(type => (
                    <TabsContent key={type} value={type} className="mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {CONSULTING_TEMPLATES.filter(t => t.type === type).map(template => (
                          <Card
                            key={template.id}
                            className={cn(
                              "cursor-pointer transition-all hover:border-primary/50",
                              selectedTemplate?.id === template.id && "border-primary ring-2 ring-primary/20"
                            )}
                            onClick={() => setSelectedTemplate(
                              selectedTemplate?.id === template.id ? null : template
                            )}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">{template.name}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {template.source}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {template.description}
                              </p>
                              {/* Mini preview placeholder */}
                              <div className="mt-3 h-16 bg-gradient-to-br from-muted to-muted/50 rounded flex items-center justify-center">
                                <LayoutGrid className="h-6 w-6 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  Template selection is optional. You can skip to create a custom layout.
                </div>
              </div>
            )}
            
            {/* Step 3: Branding */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Customize branding</h2>
                  <p className="text-muted-foreground">Upload your logo to extract brand colors, or customize manually</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Logo</CardTitle>
                      <CardDescription>Upload your logo to extract colors automatically</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                      />
                      
                      {logoPreview ? (
                        <div className="relative">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="max-h-32 mx-auto object-contain rounded"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0"
                            onClick={() => {
                              setLogoFile(null);
                              setLogoPreview(null);
                              setBrandConfig(prev => ({ ...prev, logoUrl: undefined }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-32"
                          onClick={() => logoInputRef.current?.click()}
                        >
                          <Upload className="h-6 w-6 mr-2" />
                          Upload Logo
                        </Button>
                      )}
                      
                      {isExtractingColors && (
                        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Extracting colors...
                        </div>
                      )}
                      
                      {brandConfig.extractedColors.length > 0 && (
                        <div className="mt-4">
                          <Label className="text-xs">Extracted Colors</Label>
                          <div className="flex gap-2 mt-2">
                            {brandConfig.extractedColors.map((color, i) => (
                              <div
                                key={i}
                                className="w-8 h-8 rounded cursor-pointer ring-offset-2 hover:ring-2 ring-primary"
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  if (i === 0) setBrandConfig(prev => ({ ...prev, primaryColor: color }));
                                  else if (i === 1) setBrandConfig(prev => ({ ...prev, secondaryColor: color }));
                                  else setBrandConfig(prev => ({ ...prev, accentColor: color }));
                                }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Manual Color Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Colors & Tagline</CardTitle>
                      <CardDescription>Fine-tune your brand colors and add a tagline</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Primary</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="color"
                              value={brandConfig.primaryColor}
                              onChange={(e) => setBrandConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <Input
                              value={brandConfig.primaryColor}
                              onChange={(e) => setBrandConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                              className="text-xs h-8"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Secondary</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="color"
                              value={brandConfig.secondaryColor}
                              onChange={(e) => setBrandConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <Input
                              value={brandConfig.secondaryColor}
                              onChange={(e) => setBrandConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                              className="text-xs h-8"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Accent</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="color"
                              value={brandConfig.accentColor}
                              onChange={(e) => setBrandConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <Input
                              value={brandConfig.accentColor}
                              onChange={(e) => setBrandConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                              className="text-xs h-8"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Tagline</Label>
                        <Input
                          value={brandConfig.tagline}
                          onChange={(e) => setBrandConfig(prev => ({ ...prev, tagline: e.target.value }))}
                          placeholder="Your company tagline"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Theme Selection */}
                <div className="space-y-3">
                  <Label>Select Base Theme</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {THEME_PRESETS.map(theme => (
                      <Card
                        key={theme.id}
                        className={cn(
                          "cursor-pointer transition-all hover:border-primary/50",
                          selectedTheme.id === theme.id && "border-primary ring-2 ring-primary/20"
                        )}
                        onClick={() => setSelectedTheme(theme)}
                      >
                        <CardContent className="p-3">
                          <div className="flex gap-1 mb-2">
                            {Object.values(theme.colors).slice(0, 4).map((color, i) => (
                              <div
                                key={i}
                                className="flex-1 h-4 rounded-sm"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <p className="text-xs font-medium text-center">{theme.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 4: Preview */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Preview Template Structure</h2>
                    <p className="text-muted-foreground">Review the slide layout before generating content</p>
                  </div>
                  <Button onClick={generatePreview}>
                    <Eye className="h-4 w-4 mr-2" />
                    Generate Preview
                  </Button>
                </div>
                
                {previewSlides.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {previewSlides.map((slide, index) => (
                      <Card key={slide.id} className="overflow-hidden">
                        <div
                          className="aspect-video flex items-center justify-center p-4"
                          style={{ backgroundColor: selectedTheme.colors.background }}
                        >
                          <div className="text-center">
                            <div
                              className="font-semibold text-sm mb-1"
                              style={{ color: selectedTheme.colors.foreground }}
                            >
                              {slide.placeholders.title}
                            </div>
                            {slide.placeholders.subtitle && (
                              <div
                                className="text-xs"
                                style={{ color: selectedTheme.colors.primary }}
                              >
                                {slide.placeholders.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-2 bg-muted/50 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Slide {index + 1}</span>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {slide.layout.type}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                      <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Click "Generate Preview" to see your template structure</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {/* Step 5: Final Configuration & Generate */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Configure AI & Generate</h2>
                  <p className="text-muted-foreground">Select AI models and finalize settings</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AI Model Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI Models
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Text Model */}
                      <div>
                        <Label className="text-xs flex items-center gap-2">
                          <Type className="h-3 w-3" /> Text Generation
                        </Label>
                        <Select
                          value={aiModels.textModel}
                          onValueChange={(v) => setAiModels(prev => ({ ...prev, textModel: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AI_MODELS.text.map(model => (
                              <SelectItem key={model.id} value={model.id}>
                                <div className="flex items-center gap-2">
                                  {model.name}
                                  <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Image Model */}
                      <div>
                        <Label className="text-xs flex items-center gap-2">
                          <ImageIcon className="h-3 w-3" /> Image Generation
                        </Label>
                        <Select
                          value={aiModels.imageModel}
                          onValueChange={(v) => setAiModels(prev => ({ ...prev, imageModel: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AI_MODELS.image.map(model => (
                              <SelectItem key={model.id} value={model.id}>
                                <div className="flex items-center gap-2">
                                  {model.name}
                                  <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Voice Model */}
                      <div>
                        <Label className="text-xs flex items-center gap-2">
                          <Mic className="h-3 w-3" /> Voice (Narration)
                        </Label>
                        <Select
                          value={aiModels.voiceModel}
                          onValueChange={(v) => setAiModels(prev => ({ ...prev, voiceModel: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AI_MODELS.voice.map(model => (
                              <SelectItem key={model.id} value={model.id}>
                                <div className="flex items-center gap-2">
                                  {model.name}
                                  <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Translation Model */}
                      <div>
                        <Label className="text-xs flex items-center gap-2">
                          <Globe className="h-3 w-3" /> Translation
                        </Label>
                        <Select
                          value={aiModels.translationModel}
                          onValueChange={(v) => setAiModels(prev => ({ ...prev, translationModel: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AI_MODELS.translation.map(model => (
                              <SelectItem key={model.id} value={model.id}>
                                <div className="flex items-center gap-2">
                                  {model.name}
                                  <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Output Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-blue-500" />
                        Output Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs">Number of Slides: {slideCount}</Label>
                        <input
                          type="range"
                          min="5"
                          max="40"
                          value={slideCount}
                          onChange={(e) => setSlideCount(parseInt(e.target.value))}
                          className="w-full mt-2"
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Include Speaker Notes</Label>
                          <Switch checked={includeNotes} onCheckedChange={setIncludeNotes} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Generate Voiceover</Label>
                          <Switch checked={includeVoiceover} onCheckedChange={setIncludeVoiceover} />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Summary */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Collateral:</span>
                          <span className="font-medium">{selectedCollateral?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Industry:</span>
                          <span className="font-medium">{selectedIndustry?.name}</span>
                        </div>
                        {selectedTemplate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Template:</span>
                            <span className="font-medium">{selectedTemplate.name}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Theme:</span>
                          <span className="font-medium">{selectedTheme.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Languages:</span>
                          <span className="font-medium">{selectedLanguages.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>
      
      {/* Navigation Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
        <Button variant="ghost" onClick={currentStep === 0 ? onCancel : goBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        
        <div className="flex items-center gap-2">
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleComplete} className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Presentation
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!canProceed}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnhancedTemplateWorkflow;
