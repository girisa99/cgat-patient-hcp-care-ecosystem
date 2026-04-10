/**
 * Presentation Wizard - Two-Panel Split Layout
 * Left: Guided step-by-step configuration
 * Right: Live preview & editing
 * 
 * Features:
 * - Templates, colors, fonts customization
 * - Logo upload and branding
 * - Tables and charts support
 * - Multi-language parallel generation
 * - Drag-and-drop layout editing
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SocialPublisher } from '@/components/publish/SocialPublisher';
import { supabase } from '@/integrations/supabase/client';
import { useUniversalEnrichment } from '@/services/enrichment';
import { useGenieStudioNavigation } from '@/hooks/useGenieStudioNavigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Sparkles,
  FileText,
  Image as ImageIcon,
  Type,
  Link,
  Upload,
  Wand2,
  Download,
  RefreshCw,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Presentation,
  Save,
  Globe,
  Brain,
  Palette,
  Settings2,
  Shield,
  Eye,
  Edit3,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Languages,
  Layout,
  Table,
  BarChart3,
  Move,
  X,
  Share2,
  Linkedin,
  Youtube,
  Film,
  Video,
  Building2,
  Target,
  Mic,
  Triangle,
  GitBranch,
  Columns,
  Grid3X3,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePresentationSession, PresentationSessionConfig } from '@/hooks/usePresentationSession';
import { ImageModelSelector, ImageModelType, VideoModelSelector, VideoModelType, IMAGE_MODELS, VIDEO_MODELS } from '../ImageModelSelector';
import { LanguageSelector } from './LanguageSelector';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { translationService } from '@/services/translationService';
import { SlideCard } from './SlideCard';
import { ComplianceChecker } from './ComplianceChecker';
import { TemplateThemeSelector, TEMPLATES } from './TemplateThemeSelector';
import { BrandingCustomizer, DEFAULT_BRAND_CONFIG } from './BrandingCustomizer';
import { MultiLanguageGenerator, useMultiLanguageGeneration, SUPPORTED_LANGUAGES, LanguageGenerationStatus } from './MultiLanguageGenerator';
import { TableEditor, ChartEditor } from './TableChartEditor';
import { DraggableSlideLayout, LayoutElement } from './DraggableSlideLayout';
import { useUniversalPresentation, DownloadFormat } from '@/hooks/useUniversalPresentation';
import { GenerationProgressPanel, SlideGenerationStatus, ChapterGenerationStatus } from './GenerationProgressPanel';
import { OutputTypePanel, getDefaultOutputSettings, OutputTypeSettings } from './OutputTypePanel';
import { OUTPUT_SLIDE_TEMPLATES, OutputType } from './types';
import { LanguageConfigPopup } from './LanguageConfigPopup';
import { GenerationSummaryPanel } from './GenerationSummaryPanel';
import { VersionComparisonPanel } from './VersionComparisonPanel';
import { SlideEnhancerPanel } from './SlideEnhancerPanel';
import { CreditBurnDisplay, CREDIT_MULTIPLIERS, calculateCredits } from './components/CreditBurnDisplay';
import { RefreshCapsDisplay } from './components/RefreshCapsDisplay';
import { useAICredits } from '@/hooks/useAICredits';
import { useRefreshCaps } from '@/hooks/useRefreshCaps';
import { RealTimeSlideStreamer } from './RealTimeSlideStreamer';
import { useAgentPresentationGenerator, LanguageGenerationState } from '@/hooks/useAgentPresentationGenerator';
import { LanguageModelConfig } from '@/services/agentPresentationGeneratorService';
import { AGENT_CATALOG, AGENT_TYPES } from './AgentArchitecture';
import { TokenBalanceHeader } from './components/TokenBalanceHeader';
import { TokenUsageDashboard } from './components/TokenUsageDashboard';
import { AutoTranslateInput } from './components/AutoTranslateInput';
import { 
  COLLATERAL_TYPES,
  INDUSTRY_CATEGORIES,
  CONSULTING_TEMPLATES,
  SEGMENTS,
  THEME_PRESETS,
  getRecommendedProviders,
  type FinalWorkflowConfig,
  type AIModelConfig as WorkflowAIModelConfig,
  type CollateralType as WorkflowCollateralType,
} from './wizardConstants';
import { ContentTypeSelector, CONTENT_CATEGORIES, EXTENDED_COLLATERAL_TYPES } from './ContentTypeSelector';
// Phase 6E: Unified video/animation style selector (shared with Cast)
import { DeckVideoStyleSelector } from './DeckVideoStyleSelector';
import { AIModelConfigPanel } from './AIModelConfigPanel';
import { ConfigurationPanel } from './ConfigurationPanel';
import { TemplateBrandingPanelV2 as TemplateBrandingPanel, BrandConfig } from './TemplateBrandingPanelV2';
import { AgentSelectorDialog, AgentCard, AgentModelConfig } from './AgentSelectorDialog';
import { AgentLanguageConfigPanel } from './AgentLanguageConfigPanel';
import { InlineTrainAIFeedback } from '../InlineTrainAIFeedback';
import { StepGuidancePanel } from './components/StepGuidancePanel';
import { EmbeddedEditorPanel } from './components/EmbeddedEditorPanel';
import { useA2ACoordinatorService } from '@/hooks/useA2ACoordinatorService';
import { StepAlertBanner, getStepAlerts } from './components/StepAlertBanner';
import { StepFeedbackPanel } from './components/StepFeedbackPanel';
import { HelpTooltip, SmartTooltip } from './components/SmartTooltip';
import { PreGenerationConfirmationPanel, GenerationContextSummary } from './components/PreGenerationConfirmationPanel';
import { GlobalTierFilter } from './components/GlobalTierFilter';
import { VisualizationRecommendationBadges } from './components/VisualizationRecommendationBadges';
import { 
  PresentationRequest,
  InputSource,
  OutputFormat,
  PresentationLength,
  CollateralType,
  ImageSourceType,
  ImageStyleType,
  VoiceProviderType,
  PresentationTone,
  ContentEnhancement,
} from '@/services/universalPresentationService';
import { getRegionalConfig, isRTLLanguage, toLangBCP47 } from '@/components/landing/demo-hub/regionalDemoRouting';
import { 
  PresentationSlide, 
  SlideEnhancementType, 
  PresentationTemplate, 
  PresentationTheme,
} from './types';

// Confidence scoring types
export interface SlideConfidence {
  overall: number;           // 0-100 score
  contentAccuracy: number;   // Content quality
  visualRelevance: number;   // Image relevance
  languageQuality: number;   // Grammar/clarity
  model: string;             // Model used
  suggestedModel?: string;   // Better model if available
}

// Calculate confidence score based on model and content
const calculateSlideConfidence = (
  slide: PresentationSlide,
  model: string = 'auto'
): SlideConfidence => {
  // Base scores by model
  const modelScores: Record<string, number> = {
    'auto': 85,
    'google/gemini-3-flash-preview': 90,
    'google/gemini-2.5-pro': 95,
    'openai/gpt-5': 98,
  };

  const baseScore = modelScores[model] || 80;

  // Content quality factors
  const hasTitle = slide.title ? 10 : 0;
  const hasBullets = (slide.content?.bullets?.length || 0) > 0 ? 10 : 0;
  const hasImage = slide.image ? 10 : 0;
  const hasNotes = slide.speakerNotes ? 5 : 0;

  const contentScore = Math.min(100, baseScore + hasTitle + hasBullets);
  const visualScore = hasImage ? baseScore + 10 : baseScore - 10;
  const languageScore = baseScore + hasNotes;

  const overall = Math.round((contentScore + visualScore + languageScore) / 3);

  return {
    overall: Math.min(100, overall),
    contentAccuracy: Math.min(100, contentScore),
    visualRelevance: Math.min(100, visualScore),
    languageQuality: Math.min(100, languageScore),
    model,
    suggestedModel: overall < 85 ? 'google/gemini-2.5-pro' : undefined,
  };
};

// Confidence badge color based on score
const getConfidenceColor = (score: number): string => {
  if (score >= 90) return 'text-green-500 bg-green-500/10';
  if (score >= 75) return 'text-yellow-500 bg-yellow-500/10';
  if (score >= 60) return 'text-orange-500 bg-orange-500/10';
  return 'text-red-500 bg-red-500/10';
};

// Wizard Steps - 8-Step standardized workflow (with Voice & Publishing)
const WIZARD_STEPS = [
  { id: 'input', label: 'Input', icon: Type, description: 'Add your source material and context' },
  { id: 'configure', label: 'Configure', icon: Settings2, description: 'Select industry, segment & content type' },
  { id: 'template', label: 'Template & Branding', icon: Layout, description: 'Choose templates, themes and branding' },
  { id: 'output', label: 'Output Type', icon: Layers, description: 'Choose 2D, 3D, Video or Interactive output' },
  { id: 'agents', label: 'Agents & Languages', icon: Brain, description: 'Configure AI agents and multi-language settings' },
  { id: 'voice', label: 'Voice & Music', icon: Mic, description: 'Configure voiceover and background music' },
  { id: 'produce', label: 'Produce', icon: Wand2, description: 'Review blueprint, edit & generate your presentation' },
  { id: 'publish', label: 'Publish', icon: Share2, description: 'Finalize, export and distribute your content' },
];

// Helper to categorize languages for searchable dropdown
const getLanguageCategory = (code: string): string => {
  const european = ['en', 'es', 'fr', 'de', 'it', 'pt', 'pt-PT', 'nl', 'pl', 'ru', 'uk', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sr', 'sl', 'el', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt', 'is', 'ga', 'cy', 'mt', 'sq', 'mk', 'bs', 'ca', 'eu', 'gl', 'be'];
  const asian = ['zh', 'zh-TW', 'ja', 'ko', 'hi', 'te', 'ta', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'vi', 'th', 'id', 'ms', 'tl', 'my', 'km'];
  const middleEastern = ['ar', 'he', 'fa', 'tr'];
  const african = ['sw', 'af', 'am'];

  if (european.includes(code)) return '🌍 European';
  if (asian.includes(code)) return '🌏 Asian';
  if (middleEastern.includes(code)) return '🌍 Middle Eastern';
  if (african.includes(code)) return '🌍 African';
  return '🌐 Other';
};

// Convert slide to layout elements for drag-and-drop
const slideToLayoutElements = (slide: PresentationSlide): import('./DraggableSlideLayout').LayoutElement[] => {
  const elements: import('./DraggableSlideLayout').LayoutElement[] = [];
  let yOffset = 20;

  if (slide.title) {
    elements.push({
      id: `${slide.id}-title`,
      type: 'title',
      content: slide.title,
      position: { x: 20, y: yOffset },
      size: { width: 560, height: 50 },
      zIndex: 1,
      locked: false,
      alignment: 'left'
    });
    yOffset += 60;
  }

  if (slide.subtitle) {
    elements.push({
      id: `${slide.id}-subtitle`,
      type: 'subtitle',
      content: slide.subtitle,
      position: { x: 20, y: yOffset },
      size: { width: 560, height: 30 },
      zIndex: 1,
      locked: false,
      alignment: 'left'
    });
    yOffset += 40;
  }

  if (slide.content?.bullets && slide.content.bullets.length > 0) {
    elements.push({
      id: `${slide.id}-bullets`,
      type: 'bullet-list',
      content: slide.content.bullets.map(b => b.text),
      position: { x: 20, y: yOffset },
      size: { width: 350, height: Math.min(slide.content.bullets.length * 28, 200) },
      zIndex: 1,
      locked: false,
      alignment: 'left'
    });
  }

  if (slide.image?.url || slide.image?.base64) {
    elements.push({
      id: `${slide.id}-image`,
      type: 'image',
      content: { url: slide.image.base64 || slide.image.url, alt: slide.image.alt },
      position: { x: 390, y: yOffset },
      size: { width: 200, height: 150 },
      zIndex: 1,
      locked: false
    });
  }

  if (slide.content?.table) {
    elements.push({
      id: `${slide.id}-table`,
      type: 'table',
      content: slide.content.table,
      position: { x: 20, y: yOffset + 20 },
      size: { width: 400, height: 150 },
      zIndex: 1,
      locked: false
    });
  }

  if (slide.content?.chart) {
    elements.push({
      id: `${slide.id}-chart`,
      type: 'chart',
      content: slide.content.chart,
      position: { x: 20, y: yOffset + 20 },
      size: { width: 300, height: 200 },
      zIndex: 1,
      locked: false
    });
  }

  return elements;
};

interface PresentationWizardProps {
  sessionId?: string;
  onComplete?: (presentation: any) => void;
  onError?: (errorMessage: string) => void;
  className?: string;
}

export function PresentationWizard({
  sessionId,
  onComplete,
  onError,
  className,
}: PresentationWizardProps) {
  // Universal enrichment — product knowledge, brand, audience, regional context
  const { additionalContext: enrichmentContext, enrichmentContext: structuredEnrichment } = useUniversalEnrichment({ productName: 'Genie Deck' });
  const { userTier } = useGenieStudioNavigation();

  const {
    session,
    isLoading: isSessionLoading,
    isSaving,
    createSession,
    saveSession,
    updateConfig,
    updateInputContent,
    updateCurrentStep,
    updateSlides,
    autoSave,
    lastSaved,
  } = usePresentationSession(sessionId);

  const {
    isGenerating,
    isDownloading,
    isSavingToRAG,
    generatePresentation,
    download,
    downloadPPTX,
    downloadPDF,
    saveToRAG,
    reset,
  } = useUniversalPresentation();

  // Local state for form fields
  const [currentStep, setCurrentStep] = useState(0);
  const [inputSource, setInputSource] = useState<InputSource>('prompt');
  const [inputContent, setInputContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Configuration state
  const [collateralType, setCollateralType] = useState<CollateralType>('presentation');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('pptx');
  const [length, setLength] = useState<PresentationLength>('standard');
  const [imageSource, setImageSource] = useState<ImageSourceType>('ai-generated');
  const [imageModel, setImageModel] = useState<ImageModelType>('auto');
  const [videoModel, setVideoModel] = useState<VideoModelType>('auto');
  const [includeVideo, setIncludeVideo] = useState(false);
  const [selectedImageStyles, setSelectedImageStyles] = useState<ImageStyleType[]>(['ai-realistic']);
  // Phase 6E: Unified video/animation production styles (shared with Cast)
  const [selectedVideoStyles, setSelectedVideoStyles] = useState<string[]>([]);
  const [selectedTones, setSelectedTones] = useState<PresentationTone[]>(['balanced']);
  const [selectedEnhancements, setSelectedEnhancements] = useState<ContentEnhancement[]>([]);
  
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [inputLanguage, setInputLanguage] = useState('en'); // Language user is typing in
  const [autoTranslateFromEnglish, setAutoTranslateFromEnglish] = useState(true);
  const [generateMultipleLanguages, setGenerateMultipleLanguages] = useState(false);
  const [targetAudience, setTargetAudience] = useState('');
  const [voiceProvider, setVoiceProvider] = useState<VoiceProviderType>('openai');
  const [includeInfographics, setIncludeInfographics] = useState(true);
  const [includeJourneyMaps, setIncludeJourneyMaps] = useState(false);
  const [includeVoiceover, setIncludeVoiceover] = useState(false);
  const [includeTables, setIncludeTables] = useState(false);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [selectedAIModel, setSelectedAIModel] = useState('auto');
  const [showComplianceCheck, setShowComplianceCheck] = useState(false);
  const [contentCategory, setContentCategory] = useState<string>('ai-generated');
  const [frameworkCategory, setFrameworkCategory] = useState<string>('framework');
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [isAutoSelectModels, setIsAutoSelectModels] = useState(true);
  
  // NEW: Per-step AI Auto/Custom mode tracking (independent per step)
  const [step1Mode, setStep1Mode] = useState<'ai' | 'custom'>('ai');
  const [step2Mode, setStep2Mode] = useState<'ai' | 'custom'>('ai');
  
  // NEW: Global Tier Filter (1=Standard, 2=Advanced, 3=Premium)
  // Affects all models: Text, Image, Video, Voice, Music, SFX
  const [globalTier, setGlobalTier] = useState<1 | 2 | 3>(2);
  
  // NEW: Voice/Audio configuration from VoiceAudioConfigPanel
  const [voiceConfig, setVoiceConfig] = useState({
    enabled: false,
    provider: 'openai',
    voiceId: 'alloy',
    persona: 'professional',
    speed: 1.0,
    pitch: 0,
    stability: 0.5,
    clarity: 0.75,
    backgroundMusic: false,
    musicVolume: 30,
    pauseBetweenSlides: 1,
  });
  
  // Sync isAutoSelectModels with step1Mode for backward compatibility
  React.useEffect(() => {
    setIsAutoSelectModels(step1Mode === 'ai');
  }, [step1Mode]);
  
  // NEW: Lifted state from TemplateBrandingPanel for complete data flow
  const [visualFeatureSelections, setVisualFeatureSelections] = useState<Array<{ featureId: string; subOptions: string[] }>>([]);
  const [selectedFrameworkCategories, setSelectedFrameworkCategories] = useState<string[]>([]);
  const [selectedFrameworkIds, setSelectedFrameworkIds] = useState<string[]>([]);
  
  // NEW: Model selections from OutputModelSelector (Primary + Override + Multi-Select)
  const [modelSelections, setModelSelections] = useState<Record<string, { primaryId: string; overrideIds: string[]; mode: 'ai-auto' | 'user-override' | 'multi-select' }>>({});
  
  // All available providers from modelAlignmentService - Updated with Gap Analysis 2025
  const ALL_TEXT_PROVIDERS = [
    // Tier 1 - Core (Lovable AI Gateway)
    { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', strengths: ['Speed', 'Multilingual'], tier: 1 },
    { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro', strengths: ['Next-gen reasoning', 'Complex tasks'], tier: 1 },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', strengths: ['1M context', 'Complex reasoning'], tier: 1 },
    { id: 'openai/gpt-5', name: 'GPT-5', strengths: ['Premium quality', 'Nuance'], tier: 1 },
    { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', strengths: ['Balanced', 'Cost-effective'], tier: 1 },
    { id: 'openai/gpt-5.2', name: 'GPT-5.2', strengths: ['Enhanced reasoning', 'Latest'], tier: 1 },
    // Tier 2 - Enterprise
    { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', strengths: ['Best nuance', '200k context'], tier: 2 },
    { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', strengths: ['Balanced', 'Compliance'], tier: 2 },
    { id: 'azure/gpt-4o', name: 'Azure GPT-4o', strengths: ['Enterprise SLA', 'HIPAA'], tier: 2 },
    // Tier 3 - Budget/Regional
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', strengths: ['Technical', 'Low cost'], tier: 3 },
    { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder', strengths: ['Code', 'Technical'], tier: 3 },
    { id: 'alibaba/qwen-max', name: 'Qwen Max', strengths: ['CJK excellence', 'Full-stack'], tier: 3 },
    { id: 'alibaba/qwen-2.5', name: 'Qwen 2.5', strengths: ['Asian optimized', 'Low cost'], tier: 3 },
  ];
  
  const ALL_IMAGE_PROVIDERS = [
    // Tier 1 - Core (ModelsLab Hub + Lovable AI)
    { id: 'gemini-nano-banana', name: 'Gemini Nano Image', styles: ['fast', 'balanced'], tier: 1 },
    { id: 'gemini-3-pro-image', name: 'Gemini 3 Pro Image', styles: ['highest-quality', 'professional'], tier: 1 },
    { id: 'modelslab', name: 'ModelsLab Hub', styles: ['photorealistic', 'artistic', 'corporate'], tier: 1 },
    { id: 'modelslab-realvision', name: 'ModelsLab RealVision', styles: ['photorealistic', 'lifelike'], tier: 1 },
    { id: 'modelslab-civitai', name: 'CivitAI Models', styles: ['artistic', 'anime', 'stylized'], tier: 1 },
    // Tier 2 - Premium
    { id: 'flux-pro', name: 'Flux Pro', styles: ['photorealistic', 'artistic'], tier: 2 },
    { id: 'flux-schnell', name: 'Flux Schnell', styles: ['fast', 'artistic'], tier: 2 },
    { id: 'gpt-image-1', name: 'GPT Image 1', styles: ['text-rendering', 'infographic'], tier: 2 },
    { id: 'stability', name: 'Stability AI', styles: ['artistic', 'abstract', 'controlnet'], tier: 2 },
    // Tier 3 - Budget/Regional
    { id: 'alibaba-wanx', name: 'Alibaba Wanx', styles: ['asian-aesthetics', 'low-cost'], tier: 3 },
    { id: 'replicate', name: 'Replicate Models', styles: ['open-source', 'varied'], tier: 3 },
    { id: 'stock', name: 'Stock Images', styles: ['professional', 'corporate'], tier: 3 },
  ];

  // NEW: Video Providers with AnimateDiff, Sora, Wanx
  const ALL_VIDEO_PROVIDERS = [
    // Tier 1 - Core (ModelsLab + OpenAI)
    { id: 'openai-sora', name: 'OpenAI Sora', quality: 'premium', duration: 20, tier: 1 },
    { id: 'modelslab-animatediff', name: 'AnimateDiff', quality: 'high', duration: 8, tier: 1 },
    { id: 'modelslab-svd', name: 'Stable Video Diffusion', quality: 'high', duration: 4, tier: 1 },
    // Tier 2 - Premium
    { id: 'gemini-veo', name: 'Gemini Veo', quality: 'premium', duration: 8, tier: 2 },
    { id: 'runway-gen3', name: 'Runway Gen-3', quality: 'premium', duration: 10, tier: 2 },
    { id: 'pika-labs', name: 'Pika Labs', quality: 'high', duration: 4, tier: 2 },
    // Tier 3 - Regional/Budget
    { id: 'alibaba-wanx-video', name: 'Alibaba Wanx Video', quality: 'high', duration: 6, tier: 3 },
    { id: 'replicate-video', name: 'Replicate Video', quality: 'standard', duration: 5, tier: 3 },
  ];

  // NEW: 3D Mesh Generation Providers
  const ALL_3D_PROVIDERS = [
    // Tier 1 - Core (ModelsLab)
    { id: 'modelslab-3d', name: 'ModelsLab 3D', formats: ['glb', 'obj', 'fbx'], tier: 1 },
    // Tier 2 - Specialized
    { id: 'meshy-ai', name: 'Meshy AI', formats: ['glb', 'obj', 'stl'], tier: 2 },
    { id: 'triposr', name: 'TripoSR', formats: ['glb', 'obj'], tier: 2 },
    { id: 'point-e', name: 'Point-E (OpenAI)', formats: ['ply', 'obj'], tier: 2 },
    // Tier 3 - Budget
    { id: 'replicate-3d', name: 'Replicate 3D', formats: ['glb', 'obj'], tier: 3 },
  ];
  
  const ALL_VOICE_PROVIDERS = [
    // Tier 1 - Premium
    { id: 'elevenlabs-multilingual', name: 'ElevenLabs', quality: 'premium', languages: 100, cloning: true, tier: 1 },
    { id: 'azure-neural', name: 'Azure Neural TTS', quality: 'premium', languages: 300, cloning: false, tier: 1 },
    // Tier 2 - Standard
    { id: 'openai-tts-hd', name: 'OpenAI TTS HD', quality: 'neural', languages: 9, cloning: false, tier: 2 },
    { id: 'google-wavenet', name: 'Google WaveNet', quality: 'neural', languages: 200, cloning: false, tier: 2 },
    // Tier 3 - Budget/Regional
    { id: 'alibaba-qwen3-tts', name: 'Alibaba Qwen3-TTS', quality: 'neural', languages: 50, cloning: true, tier: 3 },
    { id: 'alibaba-tts', name: 'Alibaba DashScope TTS', quality: 'neural', languages: 50, cloning: false, tier: 3 },
    { id: 'aws-polly', name: 'AWS Polly', quality: 'neural', languages: 60, cloning: false, tier: 3 },
  ];

  // NEW: STT (Speech-to-Text) Providers
  const ALL_STT_PROVIDERS = [
    // Tier 1 - Premium (Deepgram primary for real-time)
    { id: 'deepgram', name: 'Deepgram Nova', quality: 'premium', languages: 36, realtime: true, tier: 1 },
    { id: 'azure-speech', name: 'Azure Speech Services', quality: 'premium', languages: 100, realtime: true, tier: 1 },
    { id: 'openai-whisper', name: 'OpenAI Whisper', quality: 'premium', languages: 99, realtime: false, tier: 1 },
    // Tier 2 - Standard
    { id: 'google-stt', name: 'Google Speech-to-Text', quality: 'high', languages: 125, realtime: true, tier: 2 },
    // Tier 3 - Regional
    { id: 'alibaba-paraformer', name: 'Alibaba Paraformer', quality: 'high', languages: 20, realtime: true, tier: 3 },
  ];

  // NEW: OCR/Document Processing Providers
  const ALL_OCR_PROVIDERS = [
    // Tier 1 - Enterprise
    { id: 'azure-form-recognizer', name: 'Azure Form Recognizer', types: ['invoices', 'receipts', 'ids', 'tables'], tier: 1 },
    { id: 'azure-document-intelligence', name: 'Azure Document Intelligence', types: ['documents', 'contracts', 'forms'], tier: 1 },
    // Tier 2 - AI-powered
    { id: 'deepseek-vl', name: 'DeepSeek VL', types: ['documents', 'multilingual', 'complex'], tier: 2 },
    { id: 'gemini-vision', name: 'Gemini Vision OCR', types: ['general', 'handwriting', 'diagrams'], tier: 2 },
    { id: 'gpt-4o', name: 'GPT-4o', types: ['general', 'complex-layouts'], tier: 2 },
    // Tier 3 - Budget
    { id: 'tesseract', name: 'Tesseract OCR', types: ['basic', 'print'], tier: 3 },
  ];
  
  const ALL_TRANSLATION_PROVIDERS = [
    // Tier 1 - Highest Quality
    { id: 'deepl', name: 'DeepL', regions: ['Europe', 'Americas'], quality: 'native', tier: 1 },
    { id: 'google-translate', name: 'Google Translate', regions: ['Global'], quality: 'high', tier: 1 },
    // Tier 2 - Enterprise/Specialized
    { id: 'qwen-mt', name: 'Qwen-MT', regions: ['Asia', 'China'], quality: 'native', tier: 2 },
    { id: 'azure-translator', name: 'Azure Translator', regions: ['Global'], quality: 'high', tier: 2 },
    { id: 'aws-translate', name: 'AWS Translate', regions: ['Global'], quality: 'high', tier: 2 },
    // Tier 3 - AI-based / Open
    { id: 'gemini-translate', name: 'Gemini Translate', regions: ['Global'], quality: 'context-aware', tier: 3 },
    { id: 'alibaba-translate', name: 'Alibaba Translation', regions: ['Asia'], quality: 'high', tier: 3 },
    { id: 'nllb', name: 'NLLB (Meta)', regions: ['Africa', 'India'], quality: 'high', tier: 3 },
  ];

  // Template and branding state
  const [selectedTemplate, setSelectedTemplate] = useState<PresentationTemplate | undefined>(TEMPLATES[0]);
  const [selectedTheme, setSelectedTheme] = useState<PresentationTheme | undefined>(TEMPLATES[0].theme);
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(DEFAULT_BRAND_CONFIG);
  
  // Enhanced workflow config (industry, segment, AI recommendations)
  const [workflowConfig, setWorkflowConfig] = useState<FinalWorkflowConfig | null>(null);

  // Slides state
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [presentationTitle, setPresentationTitle] = useState('');
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [editingMode, setEditingMode] = useState<'preview' | 'layout'>('preview');

  // Multi-language generation - Legacy hook
  const { statuses: languageStatuses, isGenerating: isMultiLangGenerating, generateAll: generateMultiLang, reset: resetMultiLang } = useMultiLanguageGeneration();

  // Agent-based multi-language generation - New agentic system
  const agentGenerator = useAgentPresentationGenerator();
  
  // Language model configurations per language
  const [languageModelConfigs, setLanguageModelConfigs] = useState<LanguageModelConfig[]>([]);
  const [showLanguageConfigPopup, setShowLanguageConfigPopup] = useState<string | null>(null);
  const [showVersionComparison, setShowVersionComparison] = useState(false);
  const [showSlideEnhancer, setShowSlideEnhancer] = useState(false);
  const [selectedEnhancerSlide, setSelectedEnhancerSlide] = useState<string | null>(null);
  const [useAgenticGeneration, setUseAgenticGeneration] = useState(true);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(Object.keys(AGENT_CATALOG)); // All agents selected by default
  const [agentModelConfigs, setAgentModelConfigs] = useState<AgentModelConfig[]>([]);
  const [showAgentConfigDialog, setShowAgentConfigDialog] = useState<string | null>(null);
  const [showPublishPanel, setShowPublishPanel] = useState(false);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  // Generation progress tracking
  const [generationPhase, setGenerationPhase] = useState<'analyzing' | 'structuring' | 'generating' | 'images' | 'animations' | '3d-modeling' | '3d-rendering' | 'video-scenes' | 'video-compositing' | 'audio-tts' | 'audio-music' | 'interactive' | 'finalizing' | 'complete'>('analyzing');
  const [slideStatuses, setSlideStatuses] = useState<SlideGenerationStatus[]>([]);
  const [chapterStatuses, setChapterStatuses] = useState<ChapterGenerationStatus[]>([]);
  
  // Output Type settings (2D, 3D, Video, Interactive)
  const [outputSettings, setOutputSettings] = useState<OutputTypeSettings>(getDefaultOutputSettings(10));

  // Auto-enable voice for video/3D output types (must be after outputSettings declaration)
  React.useEffect(() => {
    const requiresVoice = ['video-full', 'video-intro', '3d-animated', '2d-animated'].includes(outputSettings.outputType);
    if (requiresVoice && !voiceConfig.enabled) {
      setVoiceConfig(prev => ({ ...prev, enabled: true }));
      setIncludeVoiceover(true);
    }
    const requiresMusic = ['video-full', '3d-animated'].includes(outputSettings.outputType);
    if (requiresMusic && !voiceConfig.backgroundMusic) {
      setVoiceConfig(prev => ({ ...prev, backgroundMusic: true }));
    }
  }, [outputSettings.outputType, voiceConfig.enabled, voiceConfig.backgroundMusic]);

  // Credit & Refresh tracking
  const { credits, refreshCredits, useCredits, canAfford } = useAICredits();
  const [creditsUsedThisSession, setCreditsUsedThisSession] = useState(0);
  const [isDeductingCredits, setIsDeductingCredits] = useState(false);
  
  const refreshCapsHook = useRefreshCaps({
    userTier,
    onCapReached: (capType) => {
      toast.warning(`${capType} refresh limit reached. Upgrade for more.`);
    }
  });

  // Inline options (to avoid service method type issues)
  const imageStyleOptions = [
    { id: 'ai-realistic', name: 'AI Photorealistic', bestFor: ['marketing', 'investor'] },
    { id: 'sketch', name: 'Hand-drawn Sketches', bestFor: ['training', 'presentation'] },
    { id: 'illustration', name: 'Illustrations', bestFor: ['website', 'sales'] },
    { id: 'infographic', name: 'Infographic Style', bestFor: ['whitepaper', 'case-study'] },
    { id: 'icons', name: 'Icon-based', bestFor: ['presentation', 'website'] },
  ];

  const toneOptions = [
    { id: 'professional', name: 'Professional', bestFor: ['investor', 'sales'] },
    { id: 'balanced', name: 'Balanced', bestFor: ['presentation', 'training'] },
    { id: 'engagement', name: 'Engaging', bestFor: ['marketing', 'conference'] },
    { id: 'scientific', name: 'Scientific', bestFor: ['whitepaper', 'case-study'] },
    { id: 'inspirational', name: 'Inspirational', bestFor: ['conference', 'product-launch'] },
    { id: 'storytelling', name: 'Storytelling', bestFor: ['marketing', 'training', 'conference'] },
    { id: 'empathetic', name: 'Empathetic', bestFor: ['healthcare', 'training', 'case-study'] },
    { id: 'conversational', name: 'Conversational', bestFor: ['marketing', 'training'] },
    { id: 'persuasive', name: 'Persuasive', bestFor: ['sales', 'investor', 'marketing'] },
    { id: 'educational', name: 'Educational', bestFor: ['training', 'whitepaper'] },
  ];

  const enhancementOptions = [
    { id: 'data-verification', name: 'Data Verification' },
    { id: 'statistics', name: 'Key Statistics' },
    { id: 'case-examples', name: 'Case Examples' },
    { id: 'comparison-tables', name: 'Comparison Tables' },
    { id: 'timeline', name: 'Timeline' },
    { id: 'storytelling', name: 'Storytelling' },
    { id: 'empathy-focus', name: 'Empathy Focus' },
    { id: 'emotional-hooks', name: 'Emotional Hooks' },
  ];

  const voiceProviders = [
    { id: 'openai', name: 'OpenAI TTS' },
    { id: 'elevenlabs', name: 'ElevenLabs' },
  ];

  const AI_MODELS = [
    { id: 'auto', name: 'Auto (Recommended)', description: 'AI selects best model' },
    { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast & balanced' },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'High quality' },
    { id: 'openai/gpt-5', name: 'GPT-5', description: 'Premium reasoning' },
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', description: 'Nuanced & creative' },
  ];

  // Initialize session
  useEffect(() => {
    if (!sessionId && !session) {
      createSession('Untitled Presentation');
    }
  }, [sessionId, session, createSession]);

  // Sync session state to local state
  useEffect(() => {
    if (session) {
      setCurrentStep(session.currentStep);
      setInputContent(session.inputContent);
      const config = session.configuration;
      setInputSource(config.inputSource as InputSource);
      setCollateralType(config.collateralType as CollateralType);
      setOutputFormat(config.outputFormat as OutputFormat);
      setLength(config.length as PresentationLength);
      setImageSource(config.imageSource as ImageSourceType);
      setImageModel(config.imageModel as ImageModelType);
      setSelectedImageStyles(config.imageStyles as ImageStyleType[]);
      setSelectedTones(config.selectedTones as PresentationTone[]);
      setSelectedEnhancements(config.selectedEnhancements as ContentEnhancement[]);
      setSelectedLanguages(config.selectedLanguages);
      setPrimaryLanguage(config.primaryLanguage);
      setTargetAudience(config.targetAudience);
      setVoiceProvider(config.voiceProvider as VoiceProviderType);
      setIncludeInfographics(config.includeInfographics);
      setIncludeJourneyMaps(config.includeJourneyMaps);
      setIncludeVoiceover(config.includeVoiceover);
      setSelectedAIModel(config.selectedAIModel);
      setSlides(session.slidesData as PresentationSlide[] || []);
    }
  }, [session]);

  // Auto-save on config changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (session?.id) {
        saveSession({
          inputContent,
          currentStep,
          configuration: {
            inputSource,
            collateralType,
            outputFormat,
            length,
            imageSource,
            imageStyles: selectedImageStyles,
            // videoStyles: selectedVideoStyles, // TODO: add to PresentationSessionConfig when ready
            imageModel,
            selectedTones,
            selectedEnhancements,
            selectedLanguages,
            primaryLanguage,
            targetAudience,
            voiceProvider,
            includeInfographics,
            includeJourneyMaps,
            includeVoiceover,
            selectedAIModel,
          },
        });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [inputContent, currentStep, inputSource, collateralType, outputFormat, length, imageSource, selectedImageStyles, imageModel, selectedTones, selectedEnhancements, selectedLanguages, primaryLanguage, targetAudience, voiceProvider, includeInfographics, includeJourneyMaps, includeVoiceover, selectedAIModel, session?.id]);

  // Navigation
  const goToStep = (step: number) => {
    if (step >= 0 && step < WIZARD_STEPS.length) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => goToStep(currentStep - 1);

  // Check if step is complete
  // 8-Step validation for the updated wizard
  const isStepComplete = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: return inputContent.trim().length > 0; // Input
      case 1: return !!workflowConfig?.industryCategory; // Configure
      case 2: return true; // Template & Branding (optional)
      case 3: return !!outputSettings.outputType; // Output Type
      case 4: return selectedLanguages.length > 0; // Agents & Languages
      case 5: return true; // Voice & Music (optional)
      case 6: return true; // Generate (always accessible if prior steps ok)
      case 7: return true; // Publish (final step)
      default: return false;
    }
  };

  // File upload handler - uses existing document-processor edge function
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFile(file);
    setIsProcessingFile(true);
    
    try {
      // For images, use base64
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setInputContent(content);
          setInputSource('image');
          setIsProcessingFile(false);
        };
        reader.readAsDataURL(file);
        return;
      }
      
      // For plain text files, read directly
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setInputContent(content);
          setInputSource('document');
          setIsProcessingFile(false);
        };
        reader.readAsText(file);
        return;
      }
      
      // For PDF, DOCX, PPTX, XLSX - use document-processor edge function
      const fileBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = (e.target?.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });
      
      toast.info(`Processing ${file.name}...`);
      
      const { data, error } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'process',
          file: fileBase64,
          fileName: file.name,
          mimeType: file.type,
          extractText: true,
        }
      });
      
      if (error) {
        console.error('Document processing error:', error);
        toast.error('Failed to process document. Using filename as reference.');
        setInputContent(`Document: ${file.name}\n\nPlease generate a presentation based on this ${file.type.split('/')[1]?.toUpperCase() || 'document'} file.`);
      } else if (data?.extractedText || data?.content) {
        const extractedContent = data.extractedText || data.content || '';
        setInputContent(extractedContent);
        toast.success(`Extracted ${extractedContent.length} characters from ${file.name}`);
      } else {
        // Fallback - use RAG processor for knowledge extraction
        const { data: ragData, error: ragError } = await supabase.functions.invoke('rag-knowledge-processor', {
          body: {
            action: 'add_knowledge',
            content: `Document: ${file.name}`,
            metadata: { fileName: file.name, fileType: file.type }
          }
        });
        
        if (ragData?.processedContent) {
          setInputContent(ragData.processedContent);
        } else {
          setInputContent(`Document: ${file.name}\n\nPlease analyze and create a presentation from this file.`);
        }
      }
      
      setInputSource('document');
    } catch (err) {
      console.error('File processing error:', err);
      toast.error('Error processing file');
      onError?.('Failed to process the uploaded file. Please try a different file format.');
      setInputContent(`Document: ${file.name}`);
      setInputSource('document');
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Generate presentation
  const handleGenerate = async () => {
    if (!inputContent.trim()) {
      toast.error('Please enter content first');
      return;
    }

    // Calculate required credits before generation
    const estimatedCredits = calculateCredits({
      outputType: outputSettings.outputType,
      slideCount: outputSettings.slideCount,
      includeVoiceover: outputSettings.includeVoiceover,
      includeMusic: outputSettings.includeMusic,
      resolution: outputSettings.resolution as '720p' | '1080p' | '4k',
      languageCount: generateMultipleLanguages ? selectedLanguages.length + 1 : 1,
    });

    // Check if user has enough credits
    if (credits && credits.credits_balance < estimatedCredits) {
      toast.error(`Insufficient credits. Need ${estimatedCredits}, have ${credits.credits_balance}. Please purchase more credits.`);
      return;
    }

    // Deduct credits before starting generation
    setIsDeductingCredits(true);
    const deductionResult = await useCredits('presentation_generation', estimatedCredits, {
      outputType: outputSettings.outputType,
      slideCount: outputSettings.slideCount,
      languages: generateMultipleLanguages ? selectedLanguages.length + 1 : 1,
    });
    setIsDeductingCredits(false);

    if (!deductionResult.success) {
      toast.error(deductionResult.error || 'Failed to deduct credits. Please try again.');
      return;
    }

    // Track credits used this session
    setCreditsUsedThisSession(prev => prev + (deductionResult.credits_deducted || 0));
    toast.success(`${deductionResult.credits_deducted} credits deducted. Starting generation...`);

    // Initialize progress tracking
    setGenerationPhase('analyzing');
    setSlideStatuses([]);

    // Build content with language and style instructions
    let processedContent = inputContent;
    
    // Add tone/style instructions to content
    const styleTones = selectedTones.filter(t => 
      ['storytelling', 'empathetic', 'persuasive', 'educational', 'conversational'].includes(t)
    );
    if (styleTones.length > 0) {
      const toneInstructions = styleTones.map(tone => {
        switch (tone) {
          case 'storytelling': return 'Use a narrative storytelling approach with a clear beginning, middle, and end';
          case 'empathetic': return 'Emphasize empathy and emotional connection with the audience';
          case 'persuasive': return 'Use persuasive techniques with strong calls-to-action';
          case 'educational': return 'Structure content for learning with clear explanations';
          case 'conversational': return 'Use a conversational, friendly tone';
          default: return '';
        }
      }).filter(Boolean).join('. ');
      
      processedContent = `[Tone & Style: ${toneInstructions}]\n\n${processedContent}`;
    }

    // FIX #2: Add visual feature sub-options to AI prompt for granular generation
    if (visualFeatureSelections.length > 0) {
      const visualInstructions = visualFeatureSelections
        .filter(vf => vf.subOptions && vf.subOptions.length > 0)
        .map(vf => {
          const featureLabel = vf.featureId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          return `${featureLabel}: ${vf.subOptions.join(', ')}`;
        });
      
      if (visualInstructions.length > 0) {
        processedContent = `[Visual Elements Required: ${visualInstructions.join('; ')}]\n\n${processedContent}`;
      }
    }

    // FIX #3: Unified chart/table detection from visualFeatureSelections
    const hasChartsFromFeatures = visualFeatureSelections.some(vf => 
      vf.featureId === 'charts' || vf.featureId === 'data-visualizations'
    );
    const hasTablesFromFeatures = visualFeatureSelections.some(vf => 
      vf.featureId === 'data-tables' || vf.featureId === 'tables'
    );
    const hasInfographicsFromFeatures = visualFeatureSelections.some(vf => 
      vf.featureId === 'infographics'
    );
    const hasJourneyMapsFromFeatures = visualFeatureSelections.some(vf => 
      vf.featureId === 'journey-maps'
    );

      // Merge with explicit toggles (if either is true, include it)
    const finalIncludeCharts = includeCharts || hasChartsFromFeatures;
    const finalIncludeTables = includeTables || hasTablesFromFeatures;
    const finalIncludeInfographics = includeInfographics || hasInfographicsFromFeatures;
    const finalIncludeJourneyMaps = includeJourneyMaps || hasJourneyMapsFromFeatures;

    // Regional routing - zone-aware provider selection
    const regionalConfig = getRegionalConfig(undefined, primaryLanguage);
    console.log('[Generation] Regional routing:', {
      zone: regionalConfig.zone,
      llm: `${regionalConfig.llmProvider}/${regionalConfig.llmModel}`,
      tts: regionalConfig.ttsProvider,
      translation: regionalConfig.translationProvider,
      isRTL: isRTLLanguage(primaryLanguage),
    });

    // Add translation instructions if needed
    if (inputLanguage === 'en' && primaryLanguage !== 'en' && autoTranslateFromEnglish) {
      const targetLang = SUPPORTED_LANGUAGES.find(l => l.code === primaryLanguage);
      processedContent = `[Translate from English to ${targetLang?.name || primaryLanguage}]\n\n${processedContent}`;
    } else if (inputLanguage !== 'en' && primaryLanguage !== inputLanguage) {
      const sourceLang = SUPPORTED_LANGUAGES.find(l => l.code === inputLanguage);
      const targetLang = SUPPORTED_LANGUAGES.find(l => l.code === primaryLanguage);
      processedContent = `[Translate from ${sourceLang?.name || inputLanguage} to ${targetLang?.name || primaryLanguage}]\n\n${processedContent}`;
    } else if (primaryLanguage !== 'en') {
      const targetLang = SUPPORTED_LANGUAGES.find(l => l.code === primaryLanguage);
      processedContent = `[Generate in ${targetLang?.name || primaryLanguage} (${targetLang?.nativeName || primaryLanguage})]\n\n${processedContent}`;
    }

    // Use enhancements directly (no content styles to merge anymore)
    const allEnhancements = selectedEnhancements;
    // FIX #1: Get all output types for multi-format generation
    const allOutputTypes = outputSettings.outputTypes?.length > 0 
      ? outputSettings.outputTypes 
      : [outputSettings.outputType];

    const request = {
      inputSource,
      content: enrichmentContext ? `${processedContent}\n\n--- Product & Brand Enrichment ---\n${enrichmentContext}` : processedContent,
      contentType: uploadedFile?.type,
      collateralType,
      outputFormat,
      length,
      imageSource,
      imageStyles: selectedImageStyles,
            videoStyles: selectedVideoStyles,
      generateImages: imageSource !== 'placeholder',
      // FIX #3: Use unified detection results
      includeJourneyMaps: finalIncludeJourneyMaps,
      includeInfographics: finalIncludeInfographics,
      includeCharts: finalIncludeCharts,
      includeTables: finalIncludeTables,
      targetAudience: targetAudience || undefined,
      voiceProvider,
      tones: selectedTones,
      contentEnhancements: allEnhancements,
      languages: generateMultipleLanguages ? [primaryLanguage, ...selectedLanguages.filter(l => l !== primaryLanguage)] : [primaryLanguage],
      primaryLanguage,
      
      // ========== Complete Workflow Context ==========
      workflowContext: {
        industryCategory: workflowConfig?.industryCategory || '',
        segment: workflowConfig?.segment || '',
        contentCategory,
        selectedContentTypes,
        aiModels: workflowConfig?.aiModels,
        isAIAutoMode: isAutoSelectModels,
        aiRecommendation: workflowConfig?.aiRecommendation,
        // Per-step mode tracking for dynamic AI Auto/Custom
        step1Mode,
        step2Mode,
        // NEW: Model selections from OutputModelSelector (Many-to-Many with guardrails)
        modelSelections,
        // Regional routing context
        regionalRouting: {
          zone: regionalConfig.zone,
          llmProvider: regionalConfig.llmProvider,
          llmModel: regionalConfig.llmModel,
          ttsProvider: regionalConfig.ttsProvider,
          translationProvider: regionalConfig.translationProvider,
          imageProvider: regionalConfig.imageProvider,
          videoProvider: regionalConfig.videoProvider,
          avatarProvider: regionalConfig.avatarProvider,
          isRTL: isRTLLanguage(primaryLanguage),
          bcp47: toLangBCP47(primaryLanguage),
        },
      },
      
      templateContext: {
        selectedTemplateId: selectedTemplate?.id,
        selectedThemeId: selectedTheme?.id,
        brandConfig: brandConfig as any,
        // Complete data flow from TemplateBrandingPanel
        selectedFrameworkCategories,
        selectedFrameworkIds,
        visualFeatures: visualFeatureSelections,
        // FIX #2: Include sub-options count for token estimation accuracy
        visualFeatureSubOptionsCount: visualFeatureSelections.reduce(
          (sum, vf) => sum + (vf.subOptions?.length || 0), 0
        ),
        step2Mode, // Also include in template context for template-specific logic
      },
      
      agentContext: {
        architectureType: useAgenticGeneration ? 'agentic' : 'single',
        selectedAgentIds: selectedAgents,
        // Use correct AgentModelConfig structure (agentKey, enabled, model)
        agentModelConfigs: agentModelConfigs.map(config => ({
          agentKey: config.agentKey,
          enabled: config.enabled,
          model: config.model,
        })),
        languageVoiceConfigs: languageModelConfigs.map(c => ({
          languageCode: c.languageCode,
          voiceProvider: (c as any).provider || (c as any).voiceProvider || '',
          voiceId: c.voiceId,
        })),
      },
      
      // Output configuration - FIX #1: Include outputTypes array
      outputConfig: {
        outputType: outputSettings.outputType,
        outputTypes: allOutputTypes, // NEW: Multi-format support
        structureMode: outputSettings.structureMode,
        slideCount: outputSettings.slideCount,
        chapterCount: outputSettings.chapterCount || 3,
        slidesPerChapter: outputSettings.slidesPerChapter || 5,
        includeVoiceover: outputSettings.includeVoiceover || voiceConfig.enabled,
        includeMusic: outputSettings.includeMusic || voiceConfig.backgroundMusic,
        animationIntensity: 50,
        resolution: outputSettings.resolution as '720p' | '1080p' | '4k',
        aspectRatio: outputSettings.aspectRatio as '16:9' | '4:3' | '9:16' | '1:1',
      },
      
      // NEW: Global tier and voice configuration (Gap Analysis Fix)
      globalTier,
      voiceConfig: voiceConfig.enabled ? {
        provider: voiceConfig.provider,
        voiceId: voiceConfig.voiceId,
        persona: voiceConfig.persona,
        speed: voiceConfig.speed,
        pitch: voiceConfig.pitch,
        stability: voiceConfig.stability,
        clarity: voiceConfig.clarity,
        backgroundMusic: voiceConfig.backgroundMusic,
        musicVolume: voiceConfig.musicVolume,
        pauseBetweenSlides: voiceConfig.pauseBetweenSlides,
      } : undefined,
    } as PresentationRequest;

    console.log('[Generation] Complete request context:', {
      workflowContext: request.workflowContext,
      templateContext: request.templateContext,
      agentContext: request.agentContext,
      outputConfig: request.outputConfig,
    });

    // Simulate progress phases
    const progressTimer = setInterval(() => {
      setGenerationPhase(prev => {
        if (prev === 'analyzing') return 'structuring';
        if (prev === 'structuring') return 'generating';
        if (prev === 'generating' && imageSource !== 'placeholder') return 'images';
        return prev;
      });
    }, 3000);

    const result = await generatePresentation(request);
    clearInterval(progressTimer);

    if (result?.success && result.slides) {
      const editableSlides: PresentationSlide[] = result.slides.map((slide, idx) => ({
        id: slide.id || `slide-${idx}`,
        slideNumber: slide.slideNumber,
        type: slide.type as any,
        title: slide.title,
        subtitle: slide.subtitle,
        content: {
          type: slide.content.type as any,
          bullets: slide.content.bullets?.map((b, i) => ({
            id: `bullet-${idx}-${i}`,
            text: b,
          })) || [],
          stats: slide.content.stats,
          journeySteps: slide.content.journeySteps,
        },
        image: slide.image ? {
          url: slide.image.url,
          base64: slide.image.base64,
          alt: slide.image.alt,
          type: slide.image.type as any,
          prompt: slide.image.prompt,
        } : undefined,
        speakerNotes: slide.speakerNotes,
        topic: slide.metadata?.topic,
        importance: slide.metadata?.importance as any,
      }));

      setSlides(editableSlides);
      setPresentationTitle(result.metadata.title);
      setGenerationPhase('complete');
      
      // Create completed slide statuses
      setSlideStatuses(editableSlides.map((s, i) => ({
        slideNumber: i + 1,
        title: s.title,
        type: s.type,
        status: 'complete' as const,
      })));

      // Save to session
      saveSession({
        slidesData: editableSlides,
        status: 'completed',
      });

      toast.success(`Generated ${editableSlides.length} slides!`);

      // Notify parent that generation completed successfully
      onComplete?.({ slides: editableSlides, title: result.metadata.title, metadata: result.metadata });
    } else {
      setGenerationPhase('analyzing');
      setSlideStatuses([]);
      onError?.('Genie Deck: Generation did not complete successfully. Please try again with different content or settings.');
    }
  };

  // Slide operations
  const handleSlideUpdate = (slideId: string, updates: Partial<PresentationSlide>) => {
    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, ...updates } : s));
  };

  const handleSlideAccept = (slideId: string) => {
    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, isAccepted: true, isSkipped: false } : s));
  };

  const handleSlideSkip = (slideId: string) => {
    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, isSkipped: true, isAccepted: false } : s));
  };

  // Download
  const handleDownload = async (format: DownloadFormat) => {
    if (slides.length === 0) return;
    const serviceSlides = slides.filter(s => !s.isSkipped).map(s => ({
      id: s.id,
      slideNumber: s.slideNumber,
      type: s.type,
      title: s.title,
      subtitle: s.subtitle,
      content: {
        type: s.content.type,
        bullets: s.content.bullets?.map(b => b.text) || [],
        stats: s.content.stats,
        journeySteps: s.content.journeySteps,
      },
      image: s.image,
      speakerNotes: s.speakerNotes,
      metadata: { topic: s.topic, importance: s.importance },
    }));
    await downloadPPTX(serviceSlides as any, presentationTitle);
  };

  // Multi-language generation handler - Updated to use agentic system
  const handleMultiLanguageGenerate = async (languages: string[]) => {
    if (!inputContent.trim()) {
      toast.error('Please enter content first');
      return;
    }

    if (useAgenticGeneration) {
      // Use new agent-based generation
      const request: PresentationRequest = {
        inputSource,
        content: inputContent,
        contentType: uploadedFile?.type,
        collateralType,
        outputFormat,
        length,
        imageSource,
        imageStyles: selectedImageStyles,
            videoStyles: selectedVideoStyles,
        generateImages: imageSource !== 'placeholder',
        includeJourneyMaps,
        includeInfographics,
        targetAudience: targetAudience || undefined,
        voiceProvider,
        tones: selectedTones,
        contentEnhancements: selectedEnhancements,
      };

      await agentGenerator.startGeneration({
        presentationId: session?.id || `pres-${Date.now()}`,
        userId: 'current-user', // Would come from auth
        request,
        languages,
        primaryLanguage,
        modelConfigs: languageModelConfigs.length > 0 
          ? languageModelConfigs 
          : languages.map(lang => ({
              languageCode: lang,
              textModel: 'google/gemini-3-flash-preview',
              imageModel: 'google/gemini-2.5-flash-image-preview',
              voiceModel: 'openai',
              voiceId: 'alloy',
            })),
      });
      return;
    }

    // Legacy generation for each language using the hook
    await generateMultiLang(languages, async (langCode: string) => {
      const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
      
      // Build content with tone and language instructions
      let processedContent = inputContent;
      
      // Add tone/style instructions based on selected tones
      const styleTones = selectedTones.filter(t => 
        ['storytelling', 'empathetic', 'persuasive', 'educational', 'conversational'].includes(t)
      );
      if (styleTones.length > 0) {
        const toneInstructions = styleTones.map(tone => {
          switch (tone) {
            case 'storytelling': return 'Use a narrative storytelling approach';
            case 'empathetic': return 'Emphasize empathy and emotional connection';
            case 'persuasive': return 'Use persuasive techniques';
            case 'educational': return 'Structure content for learning';
            case 'conversational': return 'Use a conversational, friendly tone';
            default: return '';
          }
        }).filter(Boolean).join('. ');
        
        processedContent = `[Tone & Style: ${toneInstructions}]\n\n${processedContent}`;
      }
      
      // Add language instruction
      if (langCode !== 'en') {
        processedContent = `Generate this presentation in ${lang?.name || langCode} (${lang?.nativeName || langCode}):\n\n${processedContent}`;
      }

      // Use enhancements directly
      const allEnhancements = selectedEnhancements;

      const request: PresentationRequest = {
        inputSource,
        content: processedContent,
        contentType: uploadedFile?.type,
        collateralType,
        outputFormat,
        length,
        imageSource,
        imageStyles: selectedImageStyles,
            videoStyles: selectedVideoStyles,
        generateImages: imageSource !== 'placeholder',
        includeJourneyMaps,
        includeInfographics,
        targetAudience: targetAudience || undefined,
        voiceProvider,
        tones: selectedTones,
        contentEnhancements: allEnhancements,
      };

      const result = await generatePresentation(request);

      if (result?.success) {
        return { success: true, downloadUrl: `presentation_${langCode}.pptx` };
      } else {
        return { success: false, error: `Failed to generate for ${lang?.name || langCode}` };
      }
    });
  };

  // Handle language config update
  const handleLanguageConfigUpdate = (langCode: string, config: LanguageModelConfig) => {
    setLanguageModelConfigs(prev => {
      const existing = prev.findIndex(c => c.languageCode === langCode);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = config;
        return updated;
      }
      return [...prev, config];
    });
    setShowLanguageConfigPopup(null);
  };

  // Handle slide enhancement
  const handleSlideEnhance = async (slideId: string, enhancementType: string) => {
    setSelectedEnhancerSlide(slideId);
    setShowSlideEnhancer(true);
  };

  // Download specific language version
  const handleLanguageDownload = async (languageCode: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
    toast.success(`Downloading ${lang?.name || languageCode} version...`);
    await handleDownload('pptx');
  };

  // Layout elements for drag-and-drop editing
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);

  // Convert selected slide to layout elements when editing mode changes
  useEffect(() => {
    if (editingMode === 'layout' && selectedSlideId) {
      const slide = slides.find(s => s.id === selectedSlideId);
      if (slide) {
        setLayoutElements(slideToLayoutElements(slide));
      }
    }
  }, [editingMode, selectedSlideId, slides]);

  // Update slide from layout elements
  const handleLayoutElementsChange = (elements: LayoutElement[]) => {
    setLayoutElements(elements);
    // Optionally sync back to slide data
  };

  const progressPercent = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className={cn("flex h-full", className)}>
      {/* Left Panel - Wizard Steps - WIDER for better spacing */}
      <div className="w-[55%] min-w-[520px] max-w-[680px] flex-shrink-0 flex flex-col border-r bg-background">
        {/* Compact Progress Header with Token Balance & Global Tier */}
        <div className="px-6 py-4 border-b bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">Create Presentation</h2>
              <Badge variant="outline" className="text-xs font-medium">
                Step {currentStep + 1}/{WIZARD_STEPS.length}
              </Badge>
              {/* Global Tier Filter - affects all AI models */}
              <GlobalTierFilter
                value={globalTier}
                onChange={setGlobalTier}
                compact={false}
                showLegend={false}
              />
            </div>
            <div className="flex items-center gap-3">
              {/* Token Balance & Usage Dashboard */}
              <TokenBalanceHeader 
                estimatedCost={calculateCredits({
                  outputType: outputSettings.outputType,
                  slideCount: outputSettings.slideCount,
                  includeVoiceover: outputSettings.includeVoiceover || voiceConfig.enabled,
                  includeMusic: outputSettings.includeMusic || voiceConfig.backgroundMusic,
                  resolution: outputSettings.resolution as '720p' | '1080p' | '4k',
                  languageCount: selectedLanguages.length,
                })}
                isGenerating={isGenerating}
                creditsUsed={creditsUsedThisSession}
              />
              <TokenUsageDashboard />
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Step Navigator - Vertical Sidebar with better spacing */}
        <div className="flex flex-1 min-h-0">
          {/* Step Icons - Wider with labels */}
          <div className="w-16 border-r bg-muted/10 py-4 flex flex-col items-center gap-2">
            {WIZARD_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = currentStep === idx;
              const isComplete = isStepComplete(idx);
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(idx)}
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                    isActive && "bg-primary text-primary-foreground shadow-md",
                    !isActive && isComplete && "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
                    !isActive && !isComplete && "hover:bg-muted/80 text-muted-foreground"
                  )}
                  title={step.label}
                >
                  {isComplete && !isActive ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Step Content - FLAT design, no nested cards */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
            {/* Step 0: Content Input */}
            {currentStep === 0 && (
              <div className="space-y-5">
                {/* Proactive Alerts for Step 0 */}
                <StepAlertBanner 
                  alerts={getStepAlerts(0, { 
                    inputContent, 
                    hasUploadedFile: !!uploadedFile 
                  })} 
                />

                {/* Step Header - Flat design */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Type className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground">Content Input</h3>
                    <p className="text-sm text-muted-foreground">
                      Add your source material
                    </p>
                  </div>
                </div>

                {/* Input Type Selection - Flat consistent tabs with tooltips */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-foreground">Choose how to add your content:</Label>
                    <HelpTooltip tooltipId="wizard.step0" size="sm" />
                  </div>
                  <Tabs value={inputSource} onValueChange={(v) => setInputSource(v as InputSource)}>
                    <TabsList className="inline-flex h-10 items-center justify-start gap-1 rounded-lg bg-muted p-1 w-full">
                      <SmartTooltip tooltipId="input.describe" showIcon={false} side="bottom">
                        <TabsTrigger 
                          value="prompt" 
                          className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                        >
                          Describe
                        </TabsTrigger>
                      </SmartTooltip>
                      <SmartTooltip tooltipId="input.paste" showIcon={false} side="bottom">
                        <TabsTrigger 
                          value="text" 
                          className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                        >
                          Paste
                        </TabsTrigger>
                      </SmartTooltip>
                      <SmartTooltip tooltipId="input.upload" showIcon={false} side="bottom">
                        <TabsTrigger 
                          value="document" 
                          className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                        >
                          Upload
                        </TabsTrigger>
                      </SmartTooltip>
                      <SmartTooltip tooltipId="input.image" showIcon={false} side="bottom">
                        <TabsTrigger 
                          value="image" 
                          className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                        >
                          Image
                        </TabsTrigger>
                      </SmartTooltip>
                      <SmartTooltip tooltipId="input.url" showIcon={false} side="bottom">
                        <TabsTrigger 
                          value="url" 
                          className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                        >
                          Link
                        </TabsTrigger>
                      </SmartTooltip>
                    </TabsList>

                    <TabsContent value="prompt" className="mt-4 space-y-3 border-0 p-0">
                      <p className="text-sm text-muted-foreground">Describe your presentation topic and the AI will generate content for you.</p>
                      {inputLanguage !== primaryLanguage ? (
                        <AutoTranslateInput
                          value={inputContent}
                          onChange={setInputContent}
                          inputLanguage={inputLanguage}
                          outputLanguage={primaryLanguage}
                          placeholder="Example: Create a presentation about renewable energy trends in 2024, focusing on solar and wind power adoption rates..."
                          minHeight={160}
                        />
                      ) : (
                        <Textarea
                          placeholder="Example: Create a presentation about renewable energy trends in 2024, focusing on solar and wind power adoption rates..."
                          value={inputContent}
                          onChange={(e) => setInputContent(e.target.value)}
                          rows={6}
                          className="resize-none text-sm bg-background text-foreground placeholder:text-muted-foreground border-input"
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="text" className="mt-4 space-y-3 border-0 p-0">
                      <p className="text-xs text-muted-foreground">Paste existing content like notes, articles, or outlines to transform into slides.</p>
                      {inputLanguage !== primaryLanguage ? (
                        <AutoTranslateInput
                          value={inputContent}
                          onChange={setInputContent}
                          inputLanguage={inputLanguage}
                          outputLanguage={primaryLanguage}
                          placeholder="Paste your text content here. The AI will analyze and structure it into presentation slides..."
                          minHeight={180}
                        />
                      ) : (
                        <Textarea
                          placeholder="Paste your text content here. The AI will analyze and structure it into presentation slides..."
                          value={inputContent}
                          onChange={(e) => setInputContent(e.target.value)}
                          rows={8}
                          className="resize-none text-sm bg-background text-foreground placeholder:text-muted-foreground border-input"
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="document" className="mt-4 space-y-3 border-0 p-0">
                      <p className="text-xs text-muted-foreground">Upload a document and we'll extract and convert the content into slides.</p>
                      <div className={cn(
                        "border-2 border-dashed rounded-lg p-4 text-center transition-colors bg-background",
                        isProcessingFile && "border-primary bg-primary/5"
                      )}>
                        <input
                          type="file"
                          id="doc-upload"
                          accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.md,.rtf"
                          onChange={handleFileUpload}
                          disabled={isProcessingFile}
                          className="hidden"
                        />
                        <label htmlFor="doc-upload" className={cn("cursor-pointer", isProcessingFile && "cursor-wait")}>
                          {isProcessingFile ? (
                            <Loader2 className="h-6 w-6 mx-auto mb-2 text-primary animate-spin" />
                          ) : (
                            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          )}
                          <p className="text-xs text-muted-foreground">
                            {isProcessingFile 
                              ? 'Processing document...' 
                              : uploadedFile 
                                ? uploadedFile.name 
                                : 'Upload document'}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            PDF, Word, PowerPoint, Excel, TXT, MD
                          </p>
                        </label>
                      </div>
                      {uploadedFile && inputContent && !isProcessingFile && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-foreground">
                          <Check className="h-3 w-3 inline mr-1 text-green-600" />
                          Extracted {inputContent.length.toLocaleString()} characters
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="image" className="mt-4 space-y-3 border-0 p-0">
                      <p className="text-xs text-muted-foreground">Upload an image (chart, diagram, or visual) to base your presentation on.</p>
                      <div className={cn(
                        "border-2 border-dashed rounded-lg p-4 text-center transition-colors bg-background",
                        isProcessingFile && "border-primary bg-primary/5"
                      )}>
                        <input
                          type="file"
                          id="img-upload"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isProcessingFile}
                          className="hidden"
                        />
                        <label htmlFor="img-upload" className={cn("cursor-pointer", isProcessingFile && "cursor-wait")}>
                          {isProcessingFile ? (
                            <Loader2 className="h-6 w-6 mx-auto mb-2 text-primary animate-spin" />
                          ) : (
                            <ImageIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          )}
                          <p className="text-xs text-muted-foreground">
                            {uploadedFile ? uploadedFile.name : 'Upload image'}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            JPG, PNG, WEBP, GIF
                          </p>
                        </label>
                      </div>
                      {uploadedFile && inputContent && inputContent.startsWith('data:image') && (
                        <div className="mt-2 rounded overflow-hidden border">
                          <img src={inputContent} alt="Preview" className="max-h-24 mx-auto object-contain" />
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="url" className="mt-4 space-y-3 border-0 p-0">
                      <p className="text-xs text-muted-foreground">Enter a webpage URL and we'll extract the content for your presentation.</p>
                      <Input
                        placeholder="https://example.com/article-to-convert"
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        className="text-sm bg-background text-foreground placeholder:text-muted-foreground border-input"
                      />
                    </TabsContent>
                  </Tabs>

                  {inputContent.length > 0 && (
                    <div className="text-xs text-foreground font-medium bg-muted/50 rounded px-2 py-1 inline-flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-600" />
                      {inputContent.length.toLocaleString()} characters ready
                    </div>
                  )}

                  <Separator className="my-3" />

                  {/* Language Input & Translation Options */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-medium text-foreground flex items-center gap-2">
                        <Globe className="h-3 w-3 text-primary" />
                        Language Settings
                      </Label>
                      <HelpTooltip tooltipId="input.inputLanguage" size="sm" />
                    </div>
                    
                    {/* Input Language Selection - Now Searchable */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label className="text-[10px] text-muted-foreground">You're typing in:</Label>
                        <HelpTooltip tooltipId="input.inputLanguage" size="sm" />
                      </div>
                      <SearchableSelect
                        value={inputLanguage}
                        onValueChange={setInputLanguage}
                        placeholder="Search languages..."
                        groupByCategory
                        options={SUPPORTED_LANGUAGES.map(lang => ({
                          value: lang.code,
                          label: `${lang.flag} ${lang.name}`,
                          description: lang.nativeName,
                          icon: <span>{lang.flag}</span>,
                          category: getLanguageCategory(lang.code),
                        }))}
                      />
                    </div>

                    {/* Primary Output Language - Now Searchable */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Label className="text-[10px] text-muted-foreground">Generate presentation in:</Label>
                        <HelpTooltip tooltipId="input.outputLanguage" size="sm" />
                      </div>
                      <SearchableSelect
                        value={primaryLanguage}
                        onValueChange={setPrimaryLanguage}
                        placeholder="Search languages..."
                        groupByCategory
                        options={SUPPORTED_LANGUAGES.map(lang => ({
                          value: lang.code,
                          label: `${lang.flag} ${lang.name}`,
                          description: lang.nativeName,
                          icon: <span>{lang.flag}</span>,
                          category: getLanguageCategory(lang.code),
                        }))}
                      />
                    </div>

                    {/* Translation Provider Pairing - Shows when languages differ */}
                    {inputLanguage !== primaryLanguage && (
                      <div className="p-2.5 rounded-lg border bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                        <div className="flex items-start gap-2">
                          <Languages className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0 space-y-1">
                            {(() => {
                              const providerDetails = translationService.getRecommendedProviderWithDetails(inputLanguage, primaryLanguage);
                              const providerNames: Record<string, string> = {
                                google_translate: 'Google Translate',
                                deepl: 'DeepL',
                                microsoft: 'Microsoft Azure',
                                amazon: 'Amazon Translate',
                                qwen_mt: 'Qwen-MT (Asian)',
                                meta_nllb: 'Meta NLLB',
                                ai_gemini: 'Gemini AI',
                                ai_gpt: 'GPT AI',
                                ai_claude: 'Claude AI',
                              };
                              
                              return (
                                <>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-medium text-foreground">Translation Provider:</span>
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-[9px] px-1.5 py-0",
                                        providerDetails.isFallback 
                                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30" 
                                          : "bg-primary/10 text-primary border-primary/30"
                                      )}
                                    >
                                      {providerNames[providerDetails.provider] || providerDetails.provider}
                                    </Badge>
                                    {providerDetails.isFallback && (
                                      <Badge variant="outline" className="text-[8px] px-1 py-0 bg-amber-500/5 text-amber-600 border-amber-500/20">
                                        Fallback
                                      </Badge>
                                    )}
                                  </div>
                                  {providerDetails.isFallback && (
                                    <p className="text-[9px] text-amber-600">
                                      ⚠️ {providerDetails.fallbackReason} - Using {providerNames[providerDetails.provider]} instead
                                    </p>
                                  )}
                                  <p className="text-[9px] text-muted-foreground">
                                    {SUPPORTED_LANGUAGES.find(l => l.code === inputLanguage)?.name} → {SUPPORTED_LANGUAGES.find(l => l.code === primaryLanguage)?.name} • 
                                    Confidence: {Math.round(providerDetails.confidence * 100)}%
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Auto-translate toggle */}
                    {inputLanguage === 'en' && primaryLanguage !== 'en' && (
                      <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                        <div className="space-y-0.5">
                          <Label className="text-xs">Auto-translate from English</Label>
                          <p className="text-[10px] text-muted-foreground">
                            Content will be translated to {SUPPORTED_LANGUAGES.find(l => l.code === primaryLanguage)?.name}
                          </p>
                        </div>
                        <Switch checked={autoTranslateFromEnglish} onCheckedChange={setAutoTranslateFromEnglish} />
                      </div>
                    )}

                    {/* Multi-language hint - configure in Step 4 (Agents & Languages) */}
                    <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 text-xs text-muted-foreground">
                      <Languages className="h-3 w-3 flex-shrink-0" />
                      <span>Need multiple output languages? Configure in <strong>Step 4: Agents & Languages</strong></span>
                    </div>
                  </div>
                </div>

                {/* Step Feedback for Step 0 */}
                <StepFeedbackPanel 
                  stepNumber={0} 
                  stepName="Content Input" 
                  variant="compact" 
                />
              </div>
            )}

            {/* Step 1: Industry, Segment & Collateral Type */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Proactive Alerts for Step 1 */}
                <StepAlertBanner 
                  alerts={getStepAlerts(1, { 
                    industryCategory: workflowConfig?.industryCategory 
                  })} 
                />

                {/* Step Header - Flat design */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Presentation className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground">Configure Your Presentation</h3>
                    <p className="text-sm text-muted-foreground">
                      AI models will be optimized based on your selections
                    </p>
                  </div>
                </div>

                {/* Unified Configuration Panel - AI Auto vs Custom */}
                <ConfigurationPanel
                  workflowConfig={workflowConfig}
                  setWorkflowConfig={setWorkflowConfig}
                  selectedAIModel={selectedAIModel}
                  setSelectedAIModel={setSelectedAIModel}
                  setImageModel={setImageModel}
                  selectedLanguages={selectedLanguages}
                  isAutoSelect={isAutoSelectModels}
                  setIsAutoSelect={setIsAutoSelectModels}
                  contentCategory={contentCategory}
                  setContentCategory={setContentCategory}
                  selectedContentTypes={selectedContentTypes}
                  setSelectedContentTypes={setSelectedContentTypes}
                />

                {/* Step Feedback */}
                <StepFeedbackPanel 
                  stepNumber={1} 
                  stepName="Configure" 
                  variant="compact" 
                />
              </div>
            )}

            {/* Step 2: Template & Branding */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {/* Proactive Alerts for Step 2 */}
                <StepAlertBanner 
                  alerts={getStepAlerts(2, { 
                    selectedTemplate 
                  })} 
                />

                <TemplateBrandingPanel
                  selectedTemplate={selectedTemplate}
                  onTemplateChange={setSelectedTemplate}
                  selectedTheme={selectedTheme}
                  onThemeChange={setSelectedTheme}
                  brandConfig={brandConfig}
                  onBrandConfigChange={setBrandConfig}
                  includeInfographics={includeInfographics}
                  onIncludeInfographicsChange={setIncludeInfographics}
                  includeJourneyMaps={includeJourneyMaps}
                  onIncludeJourneyMapsChange={setIncludeJourneyMaps}
                  includeTables={includeTables}
                  onIncludeTablesChange={setIncludeTables}
                  includeCharts={includeCharts}
                  onIncludeChartsChange={setIncludeCharts}
                  industryFilter={workflowConfig?.industryCategory}
                  segmentFilter={workflowConfig?.segment}
                  contentTypeFilter={selectedContentTypes}
                  // NEW: Lifted state callbacks for complete data flow
                  visualFeatureSelections={visualFeatureSelections}
                  onVisualFeatureSelectionsChange={setVisualFeatureSelections}
                  selectedFrameworkCategories={selectedFrameworkCategories}
                  onSelectedFrameworkCategoriesChange={setSelectedFrameworkCategories}
                  selectedFrameworkIds={selectedFrameworkIds}
                  onSelectedFrameworkIdsChange={setSelectedFrameworkIds}
                  // NEW: For visualization recommendations (Gap Analysis Fix)
                  globalTier={globalTier}
                  outputType={outputSettings.outputType}
                  // NEW: Pass output types for compatibility checking
                  selectedOutputTypes={outputSettings.outputTypes || [outputSettings.outputType]}
                />

                {/* Step Feedback */}
                <StepFeedbackPanel 
                  stepNumber={2} 
                  stepName="Template & Branding" 
                  variant="compact" 
                />
              </div>
            )}

            {/* Step 3: Output Type Selection */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Proactive Alerts for Step 3 */}
                <StepAlertBanner 
                  alerts={getStepAlerts(3, { 
                    outputSettings 
                  })} 
                />

                {/* Step Header - Flat design */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground">Output Type & Structure</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose your output format: 2D slides, 3D scenes, video, or interactive
                    </p>
                  </div>
                </div>
                
                <OutputTypePanel
                  value={outputSettings}
                  onChange={setOutputSettings}
                  suggestedSlideCount={10}
                  contentType={contentCategory || workflowConfig?.collateralType?.id}
                  globalTier={globalTier}
                  industry={workflowConfig?.industryCategory}
                  languageCode={primaryLanguage}
                  modelSelections={modelSelections}
                  onModelSelectionsChange={setModelSelections}
                />

                {/* Phase 6E: Video/Animation Production Style Selector (shared with Cast) */}
                <DeckVideoStyleSelector
                  selectedStyles={selectedVideoStyles}
                  onStyleToggle={(styleId) => {
                    setSelectedVideoStyles(prev =>
                      prev.includes(styleId)
                        ? prev.filter(s => s !== styleId)
                        : [...prev, styleId]
                    );
                    // Auto-enable video when a video style is selected
                    if (!includeVideo) setIncludeVideo(true);
                  }}
                  onStylesClear={() => setSelectedVideoStyles([])}
                  maxSelections={5}
                  showRecommended={true}
                />

                {/* Step Feedback */}
                <StepFeedbackPanel
                  stepNumber={3}
                  stepName="Output Type"
                  variant="compact"
                />
              </div>
            )}

            {/* Step 4: AI Agents & Multi-Language - Enhanced Panel */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {/* Proactive Alerts for Step 4 */}
                <StepAlertBanner 
                  alerts={getStepAlerts(4, { 
                    selectedLanguages,
                    useAgenticGeneration,
                    primaryLanguage,
                    includeVoiceover: outputSettings.includeVoiceover || includeVoiceover
                  })} 
                />

                <AgentLanguageConfigPanel
                  useAgenticGeneration={useAgenticGeneration}
                  onUseAgenticGenerationChange={setUseAgenticGeneration}
                  selectedAgents={selectedAgents}
                  onSelectedAgentsChange={setSelectedAgents}
                  agentModelConfigs={agentModelConfigs}
                  onAgentModelConfigsChange={setAgentModelConfigs}
                  selectedLanguages={selectedLanguages}
                  onSelectedLanguagesChange={setSelectedLanguages}
                  primaryLanguage={primaryLanguage}
                  onPrimaryLanguageChange={setPrimaryLanguage}
                  includeVoiceover={outputSettings.includeVoiceover || includeVoiceover}
                  onIncludeVoiceoverChange={setIncludeVoiceover}
                  selectedOutputTypes={outputSettings.outputTypes || [outputSettings.outputType]}
                />

                {/* Step Feedback */}
                <StepFeedbackPanel 
                  stepNumber={4} 
                  stepName="Agents & Languages" 
                  variant="compact" 
                />
              </div>
            )}

            {/* Step 5: Voice & Music (NEW) */}
            {currentStep === 5 && (
              <div className="space-y-6">
                {/* Proactive Alerts for Step 5 */}
                <StepAlertBanner 
                  alerts={getStepAlerts(5, {})} 
                />

                {/* Step Header - Flat design */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Mic className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground">Voice & Music</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure voiceover narration and background music
                    </p>
                  </div>
                </div>

                {/* Voice Configuration */}
                {(() => {
                  const regionalVoiceConfig = getRegionalConfig(undefined, primaryLanguage);
                  const recommendedTTS = regionalVoiceConfig.ttsProvider === 'alibaba_qwen3_tts' 
                    ? 'Qwen3-TTS' 
                    : 'Azure Neural';
                  return (
                <Card className="border border-border/50">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mic className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Enable Voiceover</p>
                          <p className="text-sm text-muted-foreground">
                            Add AI-generated narration
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={includeVoiceover}
                        onCheckedChange={setIncludeVoiceover}
                      />
                    </div>

                    {/* Regional TTS Recommendation */}
                    <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px]">{regionalVoiceConfig.zone.toUpperCase()} Zone</Badge>
                        <span className="text-xs text-muted-foreground">
                          Recommended: <span className="font-medium text-foreground">{recommendedTTS}</span>
                        </span>
                      </div>
                      {isRTLLanguage(primaryLanguage) && (
                        <p className="text-[10px] text-muted-foreground mt-1">RTL layout will be applied</p>
                      )}
                    </div>

                    {includeVoiceover && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label>Voice Provider</Label>
                          <Select value={voiceProvider} onValueChange={(v) => setVoiceProvider(v as typeof voiceProvider)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="elevenlabs">
                                <div className="flex items-center gap-2">
                                  <span>ElevenLabs</span>
                                  <Badge variant="outline" className="text-[9px]">Premium</Badge>
                                </div>
                              </SelectItem>
                              <SelectItem value="azure">Azure Neural TTS {regionalVoiceConfig.ttsProvider === 'azure' ? '⭐' : ''}</SelectItem>
                              <SelectItem value="alibaba_qwen3_tts">Qwen3-TTS {regionalVoiceConfig.ttsProvider === 'alibaba_qwen3_tts' ? '⭐' : ''}</SelectItem>
                              <SelectItem value="google">Google WaveNet</SelectItem>
                              <SelectItem value="openai">OpenAI TTS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedLanguages.length > 1 && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Multi-Language Voice
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Voices will be auto-selected per zone for each of your {selectedLanguages.length} languages
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedLanguages.map(lang => {
                                const langConfig = getRegionalConfig(undefined, lang);
                                return (
                                  <Badge key={lang} variant="outline" className="text-[9px]">
                                    {lang.toUpperCase()}: {langConfig.ttsProvider === 'alibaba_qwen3_tts' ? 'Qwen3-TTS' : 'Azure Neural'}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                  );
                })()}

                {/* Background Music */}
                <Card className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Film className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Background Music</p>
                          <p className="text-sm text-muted-foreground">
                            Add ambient music to your presentation
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={outputSettings.includeMusic || false}
                        onCheckedChange={(checked) => setOutputSettings(prev => ({
                          ...prev,
                          includeMusic: checked
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Step Feedback */}
                <StepFeedbackPanel 
                  stepNumber={5} 
                  stepName="Voice & Music" 
                  variant="compact" 
                />
              </div>
            )}

            {/* Step 6: Review & Generate */}
            {currentStep === 6 && (
              <div className="space-y-4">
                {/* Step Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Wand2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground">Produce</h3>
                    <p className="text-sm text-muted-foreground">
                      Review blueprint, brand assets &amp; regional config, then generate
                    </p>
                  </div>
                </div>

                {/* Produce Tabs */}
                <Tabs defaultValue="blueprint" className="w-full">
                  <TabsList className="inline-flex h-9 items-center justify-start gap-1 rounded-lg bg-muted p-1 w-full">
                    <TabsTrigger value="blueprint" className="flex-1 text-xs gap-1">
                      <Eye className="h-3 w-3" />Blueprint
                    </TabsTrigger>
                    <TabsTrigger value="brand" className="flex-1 text-xs gap-1">
                      <Palette className="h-3 w-3" />Brand
                    </TabsTrigger>
                    <TabsTrigger value="regional" className="flex-1 text-xs gap-1">
                      <Globe className="h-3 w-3" />Regional
                    </TabsTrigger>
                    <TabsTrigger value="generate" className="flex-1 text-xs gap-1">
                      <Wand2 className="h-3 w-3" />Generate
                    </TabsTrigger>
                  </TabsList>

                  {/* ─── BLUEPRINT TAB ─── */}
                  <TabsContent value="blueprint" className="mt-3 space-y-3 border-0 p-0">
                    <PreGenerationConfirmationPanel
                      summary={{
                        inputSource,
                        inputContentPreview: inputContent.slice(0, 200) + (inputContent.length > 200 ? '...' : ''),
                        inputContentLength: inputContent.length,
                        hasUploadedFile: !!uploadedFile,
                        industryCategory: workflowConfig?.industryCategory || '',
                        industryName: INDUSTRY_CATEGORIES.find(i => i.id === workflowConfig?.industryCategory)?.name || '',
                        segment: workflowConfig?.segment || '',
                        contentTypes: selectedContentTypes,
                        isAIAutoMode: isAutoSelectModels,
                        step1Mode,
                        templateId: selectedTemplate?.id || '',
                        templateName: selectedTemplate?.name || 'Default',
                        themeName: selectedTheme?.name || 'Default',
                        brandColors: brandConfig.colors || { primary: '#3b82f6', secondary: '#64748b', accent: '#f59e0b' },
                        hasLogo: !!brandConfig.logo?.url,
                        selectedFrameworkCategories,
                        selectedFrameworkIds,
                        visualFeatures: visualFeatureSelections,
                        step2Mode,
                        outputSettings,
                        useAgenticGeneration,
                        selectedAgents,
                        selectedLanguages,
                        primaryLanguage,
                        includeVoiceover: outputSettings.includeVoiceover || includeVoiceover,
                        voiceProvider,
                        aiModels: {
                          textModel: workflowConfig?.aiModels?.textModel || workflowConfig?.aiRecommendation?.textModel || 'Auto',
                          imageModel: workflowConfig?.aiModels?.imageModel || workflowConfig?.aiRecommendation?.imageModel || 'Auto',
                          voiceModel: workflowConfig?.aiModels?.voiceModel || workflowConfig?.aiRecommendation?.voiceModel || 'Auto',
                          translationModel: workflowConfig?.aiModels?.translationModel || workflowConfig?.aiRecommendation?.translationModel || 'Auto',
                        },
                        aiRecommendation: workflowConfig?.aiRecommendation ? {
                          textModel: workflowConfig.aiRecommendation.textModel,
                          imageModel: workflowConfig.aiRecommendation.imageModel,
                          voiceModel: workflowConfig.aiRecommendation.voiceModel,
                          translationModel: workflowConfig.aiRecommendation.translationModel,
                          reason: workflowConfig.aiRecommendation.reason,
                          confidence: workflowConfig.aiRecommendation.confidence,
                          alternativeTextModels: workflowConfig.aiRecommendation.alternativeTextModels,
                          alternativeImageModels: workflowConfig.aiRecommendation.alternativeImageModels,
                        } : undefined,
                        includeCharts,
                        includeTables,
                        includeInfographics,
                        includeJourneyMaps,
                      }}
                      onConfirm={handleGenerate}
                      onEdit={(stepIndex) => setCurrentStep(stepIndex)}
                      isGenerating={isGenerating}
                      currentBalance={credits?.credits_balance || 0}
                      creditEstimate={calculateCredits({
                        outputType: outputSettings.outputType,
                        slideCount: outputSettings.slideCount,
                        includeVoiceover: outputSettings.includeVoiceover,
                        includeMusic: outputSettings.includeMusic,
                        resolution: outputSettings.resolution as '720p' | '1080p' | '4k',
                        languageCount: selectedLanguages.length,
                      })}
                    />
                  </TabsContent>

                  {/* ─── BRAND ASSETS TAB ─── */}
                  <TabsContent value="brand" className="mt-3 space-y-3 border-0 p-0">
                    {/* Brand Colors */}
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-3">
                        <Palette className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Brand Colors</span>
                        <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => setCurrentStep(2)}>
                          <Edit3 className="h-3 w-3 mr-1" />Edit
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        {[
                          { label: 'Primary', color: brandConfig.colors?.primary || '#3b82f6' },
                          { label: 'Secondary', color: brandConfig.colors?.secondary || '#64748b' },
                          { label: 'Accent', color: brandConfig.colors?.accent || '#f59e0b' },
                        ].map(c => (
                          <div key={c.label} className="flex items-center gap-2 text-xs">
                            <div className="w-6 h-6 rounded-md border shadow-sm" style={{ backgroundColor: c.color }} />
                            <div>
                              <p className="font-medium">{c.label}</p>
                              <p className="text-muted-foreground">{c.color}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Typography */}
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <Type className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Typography</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-muted-foreground">Headings</p>
                          <p className="font-medium">{brandConfig.typography?.headingFont || 'System Default'}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-muted-foreground">Body</p>
                          <p className="font-medium">{brandConfig.typography?.bodyFont || 'System Default'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Logo */}
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <Presentation className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Logo &amp; Template</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-muted-foreground">Template</p>
                          <p className="font-medium">{selectedTemplate?.name || 'Default'}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-muted-foreground">Theme</p>
                          <p className="font-medium">{selectedTheme?.name || 'Default'}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-muted-foreground">Logo</p>
                          <p className="font-medium">{brandConfig.logo?.url ? 'Uploaded' : 'Not set'}</p>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <p className="text-muted-foreground">Frameworks</p>
                          <p className="font-medium">{selectedFrameworkIds.length > 0 ? `${selectedFrameworkIds.length} selected` : 'None'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Enrichment Context */}
                    {structuredEnrichment && (
                      <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Product Enrichment</span>
                          <Badge variant="secondary" className="text-[10px] h-5">Auto</Badge>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          {structuredEnrichment.product?.name && (
                            <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span className="font-medium">{structuredEnrichment.product.name}</span></div>
                          )}
                          {structuredEnrichment.product?.tagline && (
                            <div className="flex justify-between"><span className="text-muted-foreground">Tagline</span><span className="font-medium truncate ml-4">{structuredEnrichment.product.tagline}</span></div>
                          )}
                          {structuredEnrichment.audience?.label && (
                            <div className="flex justify-between"><span className="text-muted-foreground">Audience</span><span className="font-medium">{structuredEnrichment.audience.label}</span></div>
                          )}
                          {structuredEnrichment.knowledge?.valueProposition && (
                            <div className="mt-2 p-2 rounded bg-muted/50">
                              <p className="text-muted-foreground mb-1">Value Proposition</p>
                              <p className="text-xs leading-relaxed">{structuredEnrichment.knowledge.valueProposition.slice(0, 200)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Visual Features */}
                    {visualFeatureSelections.length > 0 && (
                      <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <Layers className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Visual Features</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {visualFeatureSelections.map(vf => (
                            <Badge key={vf.featureId} variant="outline" className="text-[10px]">
                              {vf.featureId.replace(/-/g, ' ')}
                              {vf.subOptions.length > 0 && ` (${vf.subOptions.length})`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* ─── REGIONAL CONFIG TAB ─── */}
                  <TabsContent value="regional" className="mt-3 space-y-3 border-0 p-0">
                    {/* Languages */}
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <Languages className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Languages</span>
                        <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => setCurrentStep(4)}>
                          <Edit3 className="h-3 w-3 mr-1" />Edit
                        </Button>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Primary</span>
                          <Badge variant="default" className="text-[10px]">
                            {SUPPORTED_LANGUAGES.find(l => l.code === primaryLanguage)?.name || primaryLanguage}
                          </Badge>
                        </div>
                        {selectedLanguages.length > 1 && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Additional</span>
                            <div className="flex flex-wrap gap-1 justify-end">
                              {selectedLanguages.filter(l => l !== primaryLanguage).map(l => (
                                <Badge key={l} variant="outline" className="text-[10px]">
                                  {SUPPORTED_LANGUAGES.find(lang => lang.code === l)?.name || l}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Regional Routing */}
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">AI Model Routing</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {[
                          { label: 'Text', value: workflowConfig?.aiModels?.textModel || workflowConfig?.aiRecommendation?.textModel || 'Auto' },
                          { label: 'Image', value: workflowConfig?.aiModels?.imageModel || workflowConfig?.aiRecommendation?.imageModel || 'Auto' },
                          { label: 'Voice', value: workflowConfig?.aiModels?.voiceModel || workflowConfig?.aiRecommendation?.voiceModel || 'Auto' },
                          { label: 'Translation', value: workflowConfig?.aiModels?.translationModel || workflowConfig?.aiRecommendation?.translationModel || 'Auto' },
                        ].map(m => (
                          <div key={m.label} className="flex justify-between items-center">
                            <span className="text-muted-foreground">{m.label}</span>
                            <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">{m.value.split('/').pop()}</span>
                          </div>
                        ))}
                      </div>
                      {workflowConfig?.aiRecommendation && (
                        <div className="mt-2 p-2 rounded bg-primary/5 text-[10px]">
                          <span className="text-primary font-medium">AI Confidence: {Math.round((workflowConfig.aiRecommendation.confidence || 0) * 100)}%</span>
                          {workflowConfig.aiRecommendation.reason && (
                            <p className="text-muted-foreground mt-0.5">{workflowConfig.aiRecommendation.reason}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Voice & TTS Config */}
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <Mic className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Voice &amp; TTS</span>
                        <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => setCurrentStep(5)}>
                          <Edit3 className="h-3 w-3 mr-1" />Edit
                        </Button>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-muted-foreground">Voiceover</span><Badge variant={includeVoiceover ? 'default' : 'secondary'} className="text-[10px]">{includeVoiceover ? 'Enabled' : 'Disabled'}</Badge></div>
                        {includeVoiceover && <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><span className="font-medium">{voiceProvider}</span></div>}
                        <div className="flex justify-between"><span className="text-muted-foreground">Background Music</span><Badge variant={outputSettings.includeMusic ? 'default' : 'secondary'} className="text-[10px]">{outputSettings.includeMusic ? 'Enabled' : 'Disabled'}</Badge></div>
                      </div>
                    </div>

                    {/* Enrichment: Regional Script */}
                    {structuredEnrichment?.regional && (
                      <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Regional Context</span>
                          <Badge variant="secondary" className="text-[10px] h-5">Auto</Badge>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span className="font-medium">{structuredEnrichment.regional.region || 'Global'}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Language</span><span className="font-medium">{structuredEnrichment.regional.language || 'en'}</span></div>
                          {structuredEnrichment.regional.approvedScript && (
                            <div className="mt-2 p-2 rounded bg-green-500/5 border border-green-500/20">
                              <p className="text-green-700 font-medium mb-1">Approved Script Available</p>
                              <p className="text-muted-foreground line-clamp-2">{structuredEnrichment.regional.approvedScript.slice(0, 150)}...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Compliance */}
                    {workflowConfig?.industryCategory && ['healthcare', 'pharma', 'finance', 'legal'].includes(workflowConfig.industryCategory) && (
                      <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Compliance</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>Enable Compliance Verification</span>
                          <Switch checked={showComplianceCheck} onCheckedChange={setShowComplianceCheck} />
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* ─── GENERATE TAB ─── */}
                  <TabsContent value="generate" className="mt-3 space-y-3 border-0 p-0">
                    {/* Credit Burn Estimate */}
                    <CreditBurnDisplay
                      currentBalance={credits?.credits_balance || 0}
                      outputType={outputSettings.outputType}
                      slideCount={outputSettings.slideCount}
                      includeVoiceover={outputSettings.includeVoiceover}
                      includeMusic={outputSettings.includeMusic}
                      resolution={outputSettings.resolution}
                      languageCount={selectedLanguages.length}
                    />

                    {/* Output Summary */}
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Output Summary</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Type</span><p className="font-medium">{outputSettings.outputType}</p></div>
                        <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Slides</span><p className="font-medium">{outputSettings.slideCount}</p></div>
                        <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Resolution</span><p className="font-medium">{outputSettings.resolution}</p></div>
                        <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Languages</span><p className="font-medium">{selectedLanguages.length}</p></div>
                      </div>
                    </div>

                    {/* Generate Button */}
                    {!isGenerating && slides.length === 0 && (
                      <Button
                        onClick={handleGenerate}
                        className="w-full h-12 text-base font-semibold"
                        disabled={!inputContent.trim() || isGenerating}
                      >
                        <Wand2 className="h-5 w-5 mr-2" />
                        Generate Presentation
                      </Button>
                    )}

                    {/* Re-Generate Button (after generation) */}
                    {!isGenerating && slides.length > 0 && (
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">{slides.length} slides generated</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Edit slides in the preview panel, then go to Publish to export.</p>
                        </div>
                        <Button
                          onClick={handleGenerate}
                          variant="outline"
                          className="w-full"
                          disabled={isGenerating}
                        >
                          <Wand2 className="h-4 w-4 mr-2" />
                          Re-Generate
                        </Button>
                      </div>
                    )}

                    {/* Generation Progress */}
                    {isGenerating && (
                      <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <div>
                            <p className="text-sm font-medium">Generating presentation...</p>
                            <p className="text-xs text-muted-foreground">
                              {generationPhase === 'analyzing' ? 'Analyzing your content...' :
                               generationPhase === 'structuring' ? 'Structuring slides with brand context...' :
                               generationPhase === 'generating' ? 'Generating slide content...' :
                               generationPhase === 'images' ? 'Creating brand-aware images...' :
                               generationPhase === 'finalizing' ? 'Applying template styles...' :
                               'Processing...'}
                            </p>
                          </div>
                        </div>
                        <Progress value={
                          generationPhase === 'analyzing' ? 15 :
                          generationPhase === 'structuring' ? 35 :
                          generationPhase === 'generating' ? 60 :
                          generationPhase === 'images' ? 85 :
                          generationPhase === 'finalizing' ? 95 :
                          generationPhase === 'complete' ? 100 : 50
                        } className="mt-3" />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Step Feedback */}
                <StepFeedbackPanel
                  stepNumber={6}
                  stepName="Produce"
                  variant="compact"
                />
              </div>
            )}

            {/* Step 7: Publish — Finalize, Export & Distribute */}
            {currentStep === 7 && (
              <div className="space-y-4">
                {/* Step Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Share2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground">Publish</h3>
                    <p className="text-sm text-muted-foreground">
                      Finalize, export and distribute your presentation
                    </p>
                  </div>
                </div>

                {slides.length === 0 ? (
                  <div className="p-6 rounded-lg border border-dashed text-center space-y-3">
                    <Wand2 className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Generate your presentation in the Produce step first
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setCurrentStep(6)}>
                      <ArrowLeft className="h-4 w-4 mr-1" />Go to Produce
                    </Button>
                  </div>
                ) : (
                  <Tabs defaultValue="finalize" className="w-full">
                    <TabsList className="inline-flex h-9 items-center justify-start gap-1 rounded-lg bg-muted p-1 w-full">
                      <TabsTrigger value="finalize" className="flex-1 text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" />Finalize
                      </TabsTrigger>
                      <TabsTrigger value="export" className="flex-1 text-xs gap-1">
                        <Download className="h-3 w-3" />Export
                      </TabsTrigger>
                      <TabsTrigger value="share" className="flex-1 text-xs gap-1">
                        <Share2 className="h-3 w-3" />Share
                      </TabsTrigger>
                    </TabsList>

                    {/* ─── FINALIZE TAB ─── */}
                    <TabsContent value="finalize" className="mt-3 space-y-3 border-0 p-0">
                      {/* Slide Summary */}
                      <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <Presentation className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Presentation Summary</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="p-2 rounded bg-muted/50 text-center">
                            <p className="text-lg font-bold text-primary">{slides.length}</p>
                            <p className="text-muted-foreground">Total Slides</p>
                          </div>
                          <div className="p-2 rounded bg-muted/50 text-center">
                            <p className="text-lg font-bold text-green-600">{slides.filter(s => s.isAccepted).length}</p>
                            <p className="text-muted-foreground">Accepted</p>
                          </div>
                          <div className="p-2 rounded bg-muted/50 text-center">
                            <p className="text-lg font-bold text-orange-500">{slides.filter(s => s.isSkipped).length}</p>
                            <p className="text-muted-foreground">Skipped</p>
                          </div>
                        </div>
                      </div>

                      {/* Edit Reminder */}
                      {slides.some(s => !s.isAccepted && !s.isSkipped) && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                          <div className="flex items-center gap-2">
                            <Edit3 className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-700">
                              {slides.filter(s => !s.isAccepted && !s.isSkipped).length} slides pending review
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Review each slide in the preview panel — accept, edit, or skip before exporting.
                          </p>
                        </div>
                      )}

                      {/* Brand Check */}
                      <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <Palette className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Brand Applied</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          {[
                            { label: 'Colors', active: !!brandConfig.colors?.primary },
                            { label: 'Logo', active: !!brandConfig.logo?.url },
                            { label: 'Template', active: !!selectedTemplate },
                          ].map(c => (
                            <div key={c.label} className="flex items-center gap-1">
                              {c.active ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
                              <span className={c.active ? 'font-medium' : 'text-muted-foreground'}>{c.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Save to RAG */}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast.success('Presentation saved to knowledge base');
                        }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save to Knowledge Base
                      </Button>
                    </TabsContent>

                    {/* ─── EXPORT TAB ─── */}
                    <TabsContent value="export" className="mt-3 space-y-3 border-0 p-0">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="h-16 flex-col gap-1"
                          onClick={() => handleDownload('pptx')}
                          disabled={isDownloading}
                        >
                          <Download className="h-5 w-5" />
                          <span className="text-xs">PPTX</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-16 flex-col gap-1"
                          onClick={() => handleDownload('pdf')}
                          disabled={isDownloading}
                        >
                          <Download className="h-5 w-5" />
                          <span className="text-xs">PDF</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-16 flex-col gap-1"
                          onClick={() => handleDownload('images')}
                          disabled={isDownloading}
                        >
                          <Download className="h-5 w-5" />
                          <span className="text-xs">Images</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-16 flex-col gap-1"
                          onClick={() => handleDownload('json')}
                          disabled={isDownloading}
                        >
                          <Download className="h-5 w-5" />
                          <span className="text-xs">JSON</span>
                        </Button>
                      </div>
                      {isDownloading && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />Preparing download...
                        </div>
                      )}
                    </TabsContent>

                    {/* ─── SHARE TAB ─── */}
                    <TabsContent value="share" className="mt-3 space-y-3 border-0 p-0">
                      {/* Cloud Publishing */}
                      <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Web Hosting</span>
                          </div>
                          <Button
                            variant={showPublishPanel ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setShowPublishPanel(!showPublishPanel)}
                          >
                            {showPublishPanel ? 'Configured' : 'Configure'}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Get a shareable link to your presentation
                        </p>
                      </div>

                      {/* Social Platforms */}
                      <div className="p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <Share2 className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Social Platforms</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                            <Linkedin className="h-3 w-3 mr-1 text-blue-600" />LinkedIn
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                            <Youtube className="h-3 w-3 mr-1 text-red-500" />YouTube
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer hover:bg-muted opacity-50">
                            More Coming
                          </Badge>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {/* Step Feedback */}
                <StepFeedbackPanel
                  stepNumber={7}
                  stepName="Publish"
                  variant="compact"
                />
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Navigation Footer with Download & Publish */}
        <div className="flex items-center justify-between p-4 border-t bg-background">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button
              size="sm"
              onClick={nextStep}
              disabled={!isStepComplete(currentStep)}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : slides.length > 0 && (
            <div className="flex items-center gap-2">
              {/* Download Dropdown */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => handleDownload('pptx')}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5 mr-1" />
                  )}
                  PPTX
                </Button>
                <Separator orientation="vertical" className="h-5" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => handleDownload('pdf')}
                  disabled={isDownloading}
                >
                  PDF
                </Button>
              </div>
              
              {/* Publish Button */}
              <Button
                size="sm"
                variant={showPublishPanel ? 'default' : 'outline'}
                className="gap-2"
                onClick={() => setShowPublishPanel(!showPublishPanel)}
              >
                <Share2 className="h-4 w-4" />
                Publish
                <div className="flex items-center gap-0.5 ml-1">
                  <Linkedin className="h-3 w-3 text-blue-600" />
                  <Youtube className="h-3 w-3 text-red-500" />
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col min-w-0 p-4 bg-background">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview
          </h3>
          <div className="flex items-center gap-2">
            {/* Version Comparison Toggle - only when multiple language versions exist */}
            {agentGenerator.completedVersions.length > 1 && (
              <Button
                variant={showVersionComparison ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setShowVersionComparison(!showVersionComparison)}
              >
                <Languages className="h-3 w-3 mr-1" />
                Compare Versions
              </Button>
            )}
            
            {slides.length > 0 && (
              <>
                {/* Editing Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <Button
                    variant={editingMode === 'preview' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setEditingMode('preview')}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant={editingMode === 'layout' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setEditingMode('layout')}
                    disabled={!selectedSlideId}
                  >
                    <Move className="h-3 w-3 mr-1" />
                    Layout
                  </Button>
                </div>
                <Badge variant="outline">{slides.length} slides</Badge>
                <Button variant="ghost" size="sm" onClick={() => { setSlides([]); reset(); resetMultiLang(); agentGenerator.reset(); }}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          {/* Real-Time Slide Streamer - Full Agentic Generation Display */}
          {useAgenticGeneration && agentGenerator.isGenerating && (
            <div className="pr-4 mb-4">
              <RealTimeSlideStreamer
                languageStates={agentGenerator.languageStates}
                streamingSlides={agentGenerator.streamingSlides}
                primaryLanguage={agentGenerator.primaryLanguage}
                totalSlides={agentGenerator.totalSlides}
                onSlideClick={(languageCode, slideNumber) => {
                  const state = agentGenerator.languageStates.get(languageCode);
                  if (state && state.slides[slideNumber - 1]) {
                    const slide = state.slides[slideNumber - 1];
                    // Convert and show in preview
                    toast.info(`Viewing ${state.languageName} - Slide ${slideNumber}`);
                  }
                }}
                onDownload={(languageCode) => {
                  handleLanguageDownload(languageCode);
                }}
                onPreview={(languageCode) => {
                  const version = agentGenerator.completedVersions.find(v => v.languageCode === languageCode);
                  if (version) {
                    const editableSlides: PresentationSlide[] = version.slidesData.map((slide, idx) => ({
                      id: slide.id || `slide-${idx}`,
                      slideNumber: slide.slideNumber,
                      type: slide.type as any,
                      title: slide.title,
                      subtitle: slide.subtitle,
                      content: {
                        type: slide.content.type as any,
                        bullets: slide.content.bullets?.map((b, i) => ({
                          id: `bullet-${idx}-${i}`,
                          text: b,
                        })) || [],
                      },
                      image: slide.image ? {
                        url: slide.image.url,
                        base64: slide.image.base64,
                        alt: slide.image.alt,
                        type: slide.image.type as any,
                        prompt: slide.image.prompt || '',
                      } : undefined,
                      speakerNotes: slide.speakerNotes,
                    }));
                    setSlides(editableSlides);
                    toast.success(`Loaded ${SUPPORTED_LANGUAGES.find(l => l.code === languageCode)?.name} version`);
                  }
                }}
                className="mb-4"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => agentGenerator.cancelGeneration()}
              >
                Cancel Generation
              </Button>
            </div>
          )}
          
          {/* Standard Generation Progress Panel - for non-agentic mode */}
          {!useAgenticGeneration && isGenerating && (
            <div className="pr-4 mb-4">
              <GenerationProgressPanel
                isGenerating={isGenerating}
                totalSlides={slideStatuses.length || 8}
                currentSlide={slideStatuses.filter(s => s.status === 'complete').length + 1}
                slideStatuses={slideStatuses.length > 0 ? slideStatuses : Array.from({ length: 8 }, (_, i) => ({
                  slideNumber: i + 1,
                  type: ['title', 'content', 'content', 'stats', 'content', 'journey', 'content', 'conclusion'][i] || 'content',
                  status: i < 2 ? 'generating' as const : 'pending' as const,
                }))}
                phase={generationPhase}
                overallProgress={
                  generationPhase === 'analyzing' ? 10 :
                  generationPhase === 'structuring' ? 30 :
                  generationPhase === 'generating' ? 60 :
                  generationPhase === 'images' ? 85 :
                  100
                }
              />
            </div>
          )}

          {/* Version Comparison Panel - simplified */}
          {showVersionComparison && agentGenerator.completedVersions.length > 1 && (
            <div className="pr-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Compare Language Versions
                    <Button variant="ghost" size="sm" className="ml-auto h-6 px-2" onClick={() => setShowVersionComparison(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {agentGenerator.completedVersions.map((version) => {
                      const lang = SUPPORTED_LANGUAGES.find(l => l.code === version.languageCode);
                      return (
                        <div 
                          key={version.id}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary",
                            version.isPrimary && "border-primary bg-primary/5"
                          )}
                          onClick={() => {
                            const editableSlides: PresentationSlide[] = version.slidesData.map((slide, idx) => ({
                              id: slide.id || `slide-${idx}`,
                              slideNumber: slide.slideNumber,
                              type: slide.type as any,
                              title: slide.title,
                              subtitle: slide.subtitle,
                              content: {
                                type: slide.content.type as any,
                                bullets: slide.content.bullets?.map((b, i) => ({
                                  id: `bullet-${idx}-${i}`,
                                  text: b,
                                })) || [],
                              },
                              image: slide.image ? {
                                url: slide.image.url,
                                base64: slide.image.base64,
                                alt: slide.image.alt,
                                type: slide.image.type as any,
                                prompt: slide.image.prompt || '',
                              } : undefined,
                              speakerNotes: slide.speakerNotes,
                            }));
                            setSlides(editableSlides);
                            setShowVersionComparison(false);
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{lang?.flag}</span>
                            <span className="text-sm font-medium">{lang?.name}</span>
                            {version.isPrimary && <Badge variant="default" className="text-[10px]">Primary</Badge>}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{version.slidesData.length} slides</span>
                            <Badge variant="outline" className="text-[10px]">
                              {Math.round(version.confidenceScores.overall)}% confidence
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLanguageDownload(version.languageCode);
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {slides.length === 0 && !isGenerating && !agentGenerator.isGenerating ? (
            <div className="h-full flex flex-col p-4 gap-4">
              {/* Dynamic Step Guidance Panel */}
              <StepGuidancePanel currentStep={currentStep} />
              
              {/* Quick Start Summary */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-2xl" />
                    <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
                      <Presentation className="h-12 w-12 mx-auto text-primary" />
                    </div>
                  </div>
                  
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    Ready to Create Your Presentation
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Follow the guidance above • Real-time AI translation • Multi-language output
                  </p>
                  
                  {/* RLHF Feedback for guidance quality */}
                  <InlineTrainAIFeedback
                    data={{
                      context: 'slide_generation',
                      product: 'deck',
                      contentId: `guidance_step_${currentStep}`,
                      metadata: { step: currentStep, stepName: WIZARD_STEPS[currentStep]?.label }
                    }}
                    variant="minimal"
                    showTextFeedback={false}
                  />
                </div>
              </div>
            </div>
          ) : editingMode === 'layout' && selectedSlideId ? (
            // Draggable Layout Mode
            <div className="pr-4">
              <div className="mb-4 p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Editing: {slides.find(s => s.id === selectedSlideId)?.title || 'Slide'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingMode('preview');
                      setSelectedSlideId(null);
                    }}
                  >
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Back to Preview
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Drag elements to reposition. Use alignment tools for precision.
                </p>
              </div>
              <DraggableSlideLayout
                elements={layoutElements}
                onElementsChange={handleLayoutElementsChange}
                slideSize={{ width: 600, height: 340 }}
                showGrid
              />
            </div>
          ) : (
            // Standard Preview Mode
            <div className="space-y-4 pr-4">
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedSlideId === slide.id && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => setSelectedSlideId(slide.id)}
                >
                  <SlideCard
                    slide={slide}
                    confidence={calculateSlideConfidence(slide, selectedAIModel)}
                    brandColors={brandConfig?.colors as { primary: string; secondary: string; accent: string } | undefined}
                    onUpdate={(slideId: string, updates: Partial<PresentationSlide>) => handleSlideUpdate(slideId, updates)}
                    onAccept={(slideId: string) => handleSlideAccept(slideId)}
                    onSkip={(slideId: string) => handleSlideSkip(slideId)}
                    onEnhance={async (slideId: string, type: SlideEnhancementType) => {
                      setSelectedEnhancerSlide(slideId);
                      setShowSlideEnhancer(true);
                      toast.info(`Opening enhancer for ${type}...`);
                    }}
                    onRefresh={async (slideId: string) => {
                      toast.info('Refreshing slide...');
                    }}
                    onRevert={(slideId: string) => {
                      toast.info('Reverting slide...');
                    }}
                    onRegenerateImage={async (slideId: string) => {
                      toast.info('Regenerating image...');
                    }}
                    onBulletUpdate={(slideId: string, bulletId: string, text: string) => {
                      setSlides(prev => prev.map(s => {
                        if (s.id === slideId && s.content?.bullets) {
                          return {
                            ...s,
                            content: {
                              ...s.content,
                              bullets: s.content.bullets.map(b => 
                                b.id === bulletId ? { ...b, text } : b
                              )
                            }
                          };
                        }
                        return s;
                      }));
                    }}
                    onBulletAccept={(slideId: string, bulletId: string) => {
                      toast.success('Bullet accepted');
                    }}
                    onBulletSkip={(slideId: string, bulletId: string) => {
                      setSlides(prev => prev.map(s => {
                        if (s.id === slideId && s.content?.bullets) {
                          return {
                            ...s,
                            content: {
                              ...s.content,
                              bullets: s.content.bullets.filter(b => b.id !== bulletId)
                            }
                          };
                        }
                        return s;
                      }));
                    }}
                    onBulletEnhance={async (slideId: string, bulletId: string, type: SlideEnhancementType) => {
                      toast.info(`Enhancing bullet with ${type}...`);
                    }}
                    onBulletRefresh={async (slideId: string, bulletId: string) => {
                      toast.info('Refreshing bullet...');
                    }}
                    onBulletRevert={(slideId: string, bulletId: string) => {
                      toast.info('Reverting bullet...');
                    }}
                  />
                </div>
              ))}
              
              {/* AI Disclaimer */}
              {slides.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300">AI-Generated Content</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                        This presentation was created by AI and may contain inaccuracies. Please review and verify all content, data, and claims before use.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Overall Presentation Feedback */}
              {slides.length > 0 && (
                <Card className="mt-4 p-4 bg-muted/30">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Rate this presentation</h4>
                      <p className="text-xs text-muted-foreground">Help improve Genie Deck AI</p>
                    </div>
                    <InlineTrainAIFeedback
                      data={{
                        context: 'presentation_complete',
                        product: 'deck',
                        contentId: presentationTitle || 'presentation',
                        originalContent: slides.map(s => s.title).join(', '),
                        metadata: {
                          slideCount: slides.length,
                          template: selectedTemplate?.name,
                          model: selectedAIModel,
                          languages: selectedLanguages
                        }
                      }}
                      variant="compact"
                      showTextFeedback={true}
                    />
                  </div>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Full Slide Enhancer Panel Integration */}
        {showSlideEnhancer && selectedEnhancerSlide && (
          <div className="absolute bottom-4 right-4 w-96 z-50">
            <SlideEnhancerPanel
              slides={slides.map(s => {
                // Map slide type to GeneratedSlide compatible types
                const typeMap: Record<string, 'title' | 'content' | 'section' | 'infographic' | 'journey' | 'stats' | 'conclusion' | 'cta'> = {
                  title: 'title',
                  content: 'content',
                  section: 'section',
                  infographic: 'infographic',
                  journey: 'journey',
                  stats: 'stats',
                  conclusion: 'conclusion',
                  cta: 'cta',
                  chart: 'content',
                  table: 'content',
                  image: 'content',
                  quote: 'content',
                  comparison: 'content',
                  timeline: 'content',
                };
                const mappedType = typeMap[s.type || 'content'] || 'content';
                
                // Map content type
                const contentTypeMap: Record<string, 'bullets' | 'paragraphs' | 'stats' | 'journey' | 'comparison' | 'timeline' | 'quote'> = {
                  bullets: 'bullets',
                  paragraphs: 'paragraphs',
                  stats: 'stats',
                  journey: 'journey',
                  comparison: 'comparison',
                  timeline: 'timeline',
                  quote: 'quote',
                  chart: 'bullets',
                };
                const mappedContentType = contentTypeMap[s.content?.type || 'bullets'] || 'bullets';
                
                return {
                  id: s.id,
                  slideNumber: s.slideNumber || 1,
                  title: s.title || '',
                  subtitle: s.subtitle,
                  type: mappedType,
                  content: {
                    type: mappedContentType,
                    bullets: s.content?.bullets?.map(b => typeof b === 'string' ? b : b.text) || [],
                  },
                  speakerNotes: s.speakerNotes,
                  image: s.image ? {
                    url: s.image.url || '',
                    alt: s.image.alt || '',
                    type: (s.image.type || 'hero') as 'hero' | 'illustration' | 'icon' | 'infographic' | 'chart',
                    prompt: s.image.prompt || '',
                  } : undefined,
                };
              })}
              primarySlides={undefined}
              languageCode={agentGenerator.primaryLanguage || 'en'}
              languageName={SUPPORTED_LANGUAGES.find(l => l.code === (agentGenerator.primaryLanguage || 'en'))?.name || 'English'}
              isPrimary={true}
              confidenceScores={slides.map((s, idx) => ({
                slideNumber: idx + 1,
                score: calculateSlideConfidence(s, selectedAIModel).overall,
                issues: [],
              }))}
              onSlideUpdate={(slideIndex, updates) => {
                const slideId = slides[slideIndex]?.id;
                if (slideId) {
                  handleSlideUpdate(slideId, {
                    title: updates.title,
                    content: updates.content ? {
                      type: updates.content.type as any,
                      bullets: updates.content.bullets?.map((b, i) => ({
                        id: `bullet-${slideIndex}-${i}`,
                        text: b,
                      })),
                    } : undefined,
                  });
                }
              }}
              onEnhanceSlide={async (slideIndex, type, customInstructions) => {
                const slideId = slides[slideIndex]?.id;
                if (!slideId) return;
                
                const slide = slides[slideIndex];
                toast.info(`Enhancing slide ${slideIndex + 1} with ${type}...`);
                
                try {
                  const enhancementPrompts: Record<string, string> = {
                    'polish': 'Improve the writing quality, fix grammar, and make the content more professional and engaging.',
                    'expand': 'Add more detail, examples, and supporting points to make the content more comprehensive.',
                    'simplify': 'Simplify the language, reduce jargon, and make the content easier to understand.',
                    'visualize': 'Suggest visual elements, icons, or diagrams that would enhance understanding.',
                    'tone-professional': 'Adjust the tone to be more formal and business-appropriate.',
                    'tone-casual': 'Adjust the tone to be more conversational and approachable.',
                  };
                  
                  const prompt = `Enhance this slide content. ${enhancementPrompts[type] || customInstructions || 'Improve overall quality.'}
                  
Current slide:
Title: ${slide.title}
Bullets: ${slide.content?.bullets?.map(b => b.text).join(', ') || 'None'}
Speaker Notes: ${slide.speakerNotes || 'None'}

Respond with JSON:
{
  "title": "enhanced title",
  "bullets": ["enhanced point 1", "enhanced point 2", "enhanced point 3"],
  "speakerNotes": "enhanced speaker notes"
}`;

                  const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
                    body: {
                      provider: 'gemini',
                      model: 'gemini-2.5-flash',
                      prompt,
                      systemPrompt: 'You are a presentation enhancement expert. Improve slide content while maintaining the core message. Always respond with valid JSON.',
                    },
                  });

                  if (error) throw error;

                  const content = data?.content || data?.response;
                  if (content) {
                    try {
                      const jsonMatch = content.match(/\{[\s\S]*\}/);
                      if (jsonMatch) {
                        const enhanced = JSON.parse(jsonMatch[0]);
                        handleSlideUpdate(slideId, {
                          title: enhanced.title || slide.title,
                          content: {
                            type: slide.content?.type || 'bullets',
                            bullets: enhanced.bullets?.map((b: string, i: number) => ({
                              id: `bullet-${slideIndex}-${i}`,
                              text: b,
                            })) || slide.content?.bullets,
                          },
                          speakerNotes: enhanced.speakerNotes || slide.speakerNotes,
                        });
                        toast.success(`Slide ${slideIndex + 1} enhanced!`);
                      }
                    } catch (parseError) {
                      console.error('Failed to parse enhancement response:', parseError);
                      toast.error('Failed to parse AI response');
                    }
                  }
                } catch (err) {
                  console.error('Enhancement error:', err);
                  toast.error('Failed to enhance slide');
                }
              }}
              onEnhanceAll={async (type, customInstructions) => {
                toast.info(`Enhancing all ${slides.length} slides with ${type}...`);
                
                // Process all slides sequentially
                for (let i = 0; i < slides.length; i++) {
                  const slide = slides[i];
                  if (!slide.id) continue;
                  
                  try {
                    const enhancementPrompts: Record<string, string> = {
                      'polish': 'Improve writing quality and professionalism.',
                      'expand': 'Add more detail and examples.',
                      'simplify': 'Simplify language and reduce jargon.',
                    };
                    
                    const prompt = `Enhance this slide. ${enhancementPrompts[type] || customInstructions || 'Improve quality.'}
                    
Title: ${slide.title}
Bullets: ${slide.content?.bullets?.map(b => b.text).join(', ') || 'None'}

Respond with JSON: { "title": "...", "bullets": ["...", "..."], "speakerNotes": "..." }`;

                    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
                      body: {
                        provider: 'gemini',
                        model: 'gemini-2.5-flash',
                        prompt,
                        systemPrompt: 'You are a presentation enhancement expert. Always respond with valid JSON.',
                      },
                    });

                    if (!error && data?.content) {
                      const jsonMatch = data.content.match(/\{[\s\S]*\}/);
                      if (jsonMatch) {
                        const enhanced = JSON.parse(jsonMatch[0]);
                        handleSlideUpdate(slide.id, {
                          title: enhanced.title || slide.title,
                          content: {
                            type: slide.content?.type || 'bullets',
                            bullets: enhanced.bullets?.map((b: string, idx: number) => ({
                              id: `bullet-${i}-${idx}`,
                              text: b,
                            })) || slide.content?.bullets,
                          },
                          speakerNotes: enhanced.speakerNotes || slide.speakerNotes,
                        });
                      }
                    }
                  } catch (err) {
                    console.error(`Failed to enhance slide ${i + 1}:`, err);
                  }
                }
                
                toast.success('All slides enhanced!');
              }}
              onAnalyze={async () => {
                toast.info('Analyzing presentation...');
                // Mock analysis result
                return {
                  overallScore: 85,
                  suggestions: slides.map((s, idx) => ({
                    slideIndex: idx,
                    type: 'suggestion' as const,
                    message: `Slide ${idx + 1} looks good!`,
                    autoFixAvailable: false,
                  })),
                  comparisons: [],
                };
              }}
              onRevertSlide={(slideIndex) => {
                toast.info(`Reverting slide ${slideIndex + 1}...`);
              }}
              className="shadow-xl border-2"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-background border shadow-sm"
              onClick={() => { setShowSlideEnhancer(false); setSelectedEnhancerSlide(null); }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Social Publish Panel - LinkedIn & YouTube */}
        {showPublishPanel && slides.length > 0 && (
          <div className="absolute bottom-20 right-4 w-[420px] z-50">
            <Card className="shadow-xl border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Publish Presentation
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowPublishPanel(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SocialPublisher
                  videoUrl={exportedVideoUrl || undefined}
                  defaultTitle={presentationTitle || 'AI-Generated Presentation'}
                  defaultDescription={`${slides.length} slides covering key insights and visual content.`}
                  onPublishComplete={(platforms) => {
                    toast.success(`Published to ${platforms.length} platform(s)!`);
                    setShowPublishPanel(false);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
