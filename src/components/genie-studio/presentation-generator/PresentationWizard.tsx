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
import { AIModelConfigPanel } from './AIModelConfigPanel';
import { ConfigurationPanel } from './ConfigurationPanel';
import { TemplateBrandingPanelV2 as TemplateBrandingPanel, BrandConfig } from './TemplateBrandingPanelV2';
import { AgentSelectorDialog, AgentCard, AgentModelConfig } from './AgentSelectorDialog';
import { AgentLanguageConfigPanel } from './AgentLanguageConfigPanel';
import { InlineTrainAIFeedback } from '../InlineTrainAIFeedback';
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

// Wizard Steps - 6-Step standardized workflow (with Output Type)
const WIZARD_STEPS = [
  { id: 'input', label: 'Input', icon: Type, description: 'Add your source material and context' },
  { id: 'configure', label: 'Configure', icon: Settings2, description: 'Select industry, segment & content type' },
  { id: 'template', label: 'Template & Branding', icon: Layout, description: 'Choose templates, themes and branding' },
  { id: 'output', label: 'Output Type', icon: Layers, description: 'Choose 2D, 3D, Video or Interactive output' },
  { id: 'agents', label: 'Agents & Languages', icon: Brain, description: 'Configure AI agents and multi-language settings' },
  { id: 'generate', label: 'Generate', icon: Wand2, description: 'Review and create your presentation' },
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
  
  // All available providers from modelAlignmentService
  const ALL_TEXT_PROVIDERS = [
    { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', strengths: ['Speed', 'Multilingual'] },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', strengths: ['Complex reasoning', 'Long context'] },
    { id: 'openai/gpt-5', name: 'GPT-5', strengths: ['Premium quality', 'Nuance'] },
    { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', strengths: ['Balanced', 'Cost-effective'] },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', strengths: ['Nuanced writing', 'Safety'] },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek', strengths: ['Technical', 'Reasoning'] },
  ];
  
  const ALL_IMAGE_PROVIDERS = [
    { id: 'modelslab', name: 'ModelsLab', styles: ['photorealistic', 'artistic', 'corporate'] },
    { id: 'flux-pro', name: 'Flux Pro', styles: ['photorealistic', 'artistic'] },
    { id: 'flux-schnell', name: 'Flux Schnell', styles: ['fast', 'artistic'] },
    { id: 'gemini-image', name: 'Gemini Image', styles: ['balanced', 'professional'] },
    { id: 'dall-e-3', name: 'DALL-E 3', styles: ['photorealistic', 'infographic'] },
    { id: 'stability', name: 'Stability AI', styles: ['artistic', 'abstract'] },
    { id: 'stock', name: 'Stock Images', styles: ['professional', 'corporate'] },
  ];
  
  const ALL_VOICE_PROVIDERS = [
    { id: 'elevenlabs-multilingual', name: 'ElevenLabs', quality: 'premium', languages: 100 },
    { id: 'openai-tts-hd', name: 'OpenAI TTS HD', quality: 'neural', languages: 9 },
    { id: 'google-wavenet', name: 'Google WaveNet', quality: 'neural', languages: 200 },
    { id: 'azure-neural', name: 'Azure Neural', quality: 'premium', languages: 300 },
    { id: 'aws-polly', name: 'AWS Polly', quality: 'neural', languages: 60 },
    { id: 'alibaba-tts', name: 'Alibaba TTS', quality: 'neural', languages: 50 },
  ];
  
  const ALL_TRANSLATION_PROVIDERS = [
    { id: 'deepl', name: 'DeepL', regions: ['Europe', 'Americas'], quality: 'native' },
    { id: 'google-translate', name: 'Google Translate', regions: ['Global'], quality: 'high' },
    { id: 'qwen-mt', name: 'Qwen-MT', regions: ['Asia', 'China'], quality: 'native' },
    { id: 'azure', name: 'Azure Translator', regions: ['Global'], quality: 'high' },
    { id: 'nllb', name: 'NLLB (Meta)', regions: ['Africa', 'India'], quality: 'high' },
    { id: 'alibaba', name: 'Alibaba Translation', regions: ['Asia'], quality: 'high' },
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

  // Credit & Refresh tracking
  const { credits, refreshCredits, useCredits, canAfford } = useAICredits();
  const [creditsUsedThisSession, setCreditsUsedThisSession] = useState(0);
  const [isDeductingCredits, setIsDeductingCredits] = useState(false);
  
  const refreshCapsHook = useRefreshCaps({ 
    userTier: 'professional', // TODO: Get from user profile
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
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Nuanced & creative' },
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
  const isStepComplete = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: return inputContent.trim().length > 0;
      case 1: return !!collateralType && !!outputFormat;
      case 2: return !!imageSource;
      case 3: return true; // Advanced is optional
      case 4: return slides.length > 0;
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

    const request = {
      inputSource,
      content: processedContent,
      contentType: uploadedFile?.type,
      collateralType,
      outputFormat,
      length,
      imageSource,
      imageStyles: selectedImageStyles,
      generateImages: imageSource !== 'placeholder',
      includeJourneyMaps,
      includeInfographics,
      targetAudience: targetAudience || undefined,
      voiceProvider,
      tones: selectedTones,
      contentEnhancements: allEnhancements,
      languages: generateMultipleLanguages ? [primaryLanguage, ...selectedLanguages.filter(l => l !== primaryLanguage)] : [primaryLanguage],
      primaryLanguage,
    } as PresentationRequest;

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
    } else {
      setGenerationPhase('analyzing');
      setSlideStatuses([]);
      onError?.('Generation did not complete successfully. Please try again with different content or settings.');
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
      {/* Left Panel - Wizard Steps */}
      <div className="w-[480px] min-w-[440px] flex-shrink-0 flex flex-col border-r bg-background">
        {/* Compact Progress Header */}
        <div className="px-5 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold">Create Presentation</h2>
              <Badge variant="outline" className="text-xs">
                Step {currentStep + 1}/{WIZARD_STEPS.length}
              </Badge>
            </div>
            {lastSaved && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        {/* Step Navigator - Vertical Sidebar */}
        <div className="flex flex-1 min-h-0">
          {/* Step Icons */}
          <div className="w-14 border-r bg-muted/20 py-3 flex flex-col items-center gap-1">
            {WIZARD_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = currentStep === idx;
              const isComplete = isStepComplete(idx);
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(idx)}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                    isActive && "bg-primary text-primary-foreground shadow-sm",
                    !isActive && isComplete && "bg-green-100 text-green-600 dark:bg-green-900/30",
                    !isActive && !isComplete && "hover:bg-muted text-muted-foreground"
                  )}
                  title={step.label}
                >
                  {isComplete && !isActive ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Step Content - No nested ScrollArea */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">
            {/* Step 0: Content Input */}
            {currentStep === 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="h-4 w-4 text-primary" />
                    <span>Content Input</span>
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      — Add your source material
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Input Type Selection - Clear labels with descriptions */}
                  <Label className="text-xs font-medium text-foreground">Choose how to add your content:</Label>
                  <Tabs value={inputSource} onValueChange={(v) => setInputSource(v as InputSource)}>
                    <TabsList className="!grid !grid-cols-5 !w-full !h-10 !p-1 !bg-muted !rounded-lg !gap-0 !min-h-0 !overflow-visible !border-0 !shadow-none">
                      <TabsTrigger value="prompt" className="!text-xs !font-medium !h-8 !rounded-md !px-2 !py-1 !min-w-0 !scale-100 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-sm data-[state=active]:!scale-100 !text-foreground !border-0">Describe</TabsTrigger>
                      <TabsTrigger value="text" className="!text-xs !font-medium !h-8 !rounded-md !px-2 !py-1 !min-w-0 !scale-100 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-sm data-[state=active]:!scale-100 !text-foreground !border-0">Paste</TabsTrigger>
                      <TabsTrigger value="document" className="!text-xs !font-medium !h-8 !rounded-md !px-2 !py-1 !min-w-0 !scale-100 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-sm data-[state=active]:!scale-100 !text-foreground !border-0">Upload</TabsTrigger>
                      <TabsTrigger value="image" className="!text-xs !font-medium !h-8 !rounded-md !px-2 !py-1 !min-w-0 !scale-100 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-sm data-[state=active]:!scale-100 !text-foreground !border-0">Image</TabsTrigger>
                      <TabsTrigger value="url" className="!text-xs !font-medium !h-8 !rounded-md !px-2 !py-1 !min-w-0 !scale-100 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-sm data-[state=active]:!scale-100 !text-foreground !border-0">Link</TabsTrigger>
                    </TabsList>

                    <TabsContent value="prompt" className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">Describe your presentation topic and the AI will generate content for you.</p>
                      <Textarea
                        placeholder="Example: Create a presentation about renewable energy trends in 2024, focusing on solar and wind power adoption rates..."
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        rows={6}
                        className="resize-none text-sm bg-background text-foreground placeholder:text-muted-foreground border-input"
                      />
                    </TabsContent>

                    <TabsContent value="text" className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">Paste existing content like notes, articles, or outlines to transform into slides.</p>
                      <Textarea
                        placeholder="Paste your text content here. The AI will analyze and structure it into presentation slides..."
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        rows={8}
                        className="resize-none text-sm bg-background text-foreground placeholder:text-muted-foreground border-input"
                      />
                    </TabsContent>

                    <TabsContent value="document" className="mt-3 space-y-2">
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

                    <TabsContent value="image" className="mt-3 space-y-2">
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

                    <TabsContent value="url" className="mt-3 space-y-2">
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
                    <Label className="text-xs font-medium text-foreground flex items-center gap-2">
                      <Globe className="h-3 w-3 text-primary" />
                      Language Settings
                    </Label>
                    
                    {/* Input Language Selection - Now Searchable */}
                    <div className="space-y-2">
                      <Label className="text-[10px] text-muted-foreground">You're typing in:</Label>
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
                      <Label className="text-[10px] text-muted-foreground">Generate presentation in:</Label>
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

                    {/* Multi-language hint - configure in Step 3 */}
                    <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 text-xs text-muted-foreground">
                      <Languages className="h-3 w-3 flex-shrink-0" />
                      <span>Need multiple output languages? Configure in <strong>Step 3: Languages</strong></span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 1: Industry, Segment & Collateral Type */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Step Header */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Presentation className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Configure Your Presentation</h3>
                    <p className="text-xs text-muted-foreground">
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
              </div>
            )}

            {/* Step 2: Template & Branding */}
            {currentStep === 2 && (
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
              />
            )}

            {/* Step 3: Output Type Selection */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Step Header */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Output Type & Structure</h3>
                    <p className="text-xs text-muted-foreground">
                      Choose your output format: 2D slides, 3D scenes, video, or interactive
                    </p>
                  </div>
                </div>
                
                <OutputTypePanel
                  value={outputSettings}
                  onChange={setOutputSettings}
                  suggestedSlideCount={10}
                  contentType={contentCategory || workflowConfig?.collateralType?.id}
                />
              </div>
            )}

            {/* Step 4: AI Agents & Multi-Language - Enhanced Panel */}
            {currentStep === 4 && (
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
              />
            )}

            {/* Step 5: Review & Generate */}
            {currentStep === 5 && (
              <div className="space-y-6">
                {/* Step Header */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Wand2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Review & Generate</h3>
                    <p className="text-sm text-muted-foreground">
                      Review your configuration and start generation
                    </p>
                  </div>
                </div>

                {/* Configuration Summary */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" />
                      Configuration Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Content Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Industry</p>
                        <p className="text-sm font-medium">{INDUSTRY_CATEGORIES.find(i => i.id === workflowConfig?.industryCategory)?.name || 'Not selected'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Segment</p>
                        <p className="text-sm font-medium">{workflowConfig?.segment || 'Not selected'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Content Type</p>
                        <p className="text-sm font-medium">{workflowConfig?.collateralType?.name || (contentCategory === 'ai-generated' ? 'AI Generated' : 'Not selected')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Languages</p>
                        <p className="text-sm font-medium">{selectedLanguages.length} language(s)</p>
                      </div>
                    </div>

                    <Separator />

                    {/* AI Models Summary */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">AI Models</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          Text: {workflowConfig?.aiRecommendation?.textModel?.split('/').pop() || 'Auto'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Image: {workflowConfig?.aiRecommendation?.imageModel || 'Auto'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Voice: {workflowConfig?.aiRecommendation?.voiceModel || 'Auto'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Translation: {workflowConfig?.aiRecommendation?.translationModel || 'Auto'}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* Features Summary */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {includeInfographics && <Badge variant="secondary" className="text-xs">✓ Infographics</Badge>}
                        {includeJourneyMaps && <Badge variant="secondary" className="text-xs">✓ Journey Maps</Badge>}
                        {includeTables && <Badge variant="secondary" className="text-xs">✓ Tables</Badge>}
                        {includeCharts && <Badge variant="secondary" className="text-xs">✓ Charts</Badge>}
                        {includeVoiceover && <Badge variant="secondary" className="text-xs">✓ Voiceover</Badge>}
                        {useAgenticGeneration && <Badge variant="secondary" className="text-xs">✓ Multi-Agent</Badge>}
                        {!includeInfographics && !includeJourneyMaps && !includeTables && !includeCharts && !includeVoiceover && (
                          <span className="text-xs text-muted-foreground">No additional features selected</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Check Option */}
                {workflowConfig?.industryCategory && ['healthcare', 'pharma', 'finance', 'legal'].includes(workflowConfig.industryCategory) && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Compliance Check
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
                        <div>
                          <p className="text-sm font-medium">Enable Compliance Verification</p>
                          <p className="text-xs text-muted-foreground">
                            Verify content against industry regulations
                          </p>
                        </div>
                        <Switch checked={showComplianceCheck} onCheckedChange={setShowComplianceCheck} />
                      </div>
                    </CardContent>
                  </Card>
                )}

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

                {/* Generate Button */}
                <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Ready to Generate</h3>
                        <p className="text-sm text-muted-foreground">
                          Your presentation will be generated with {outputSettings.slideCount} slides (max 20) in {selectedLanguages.length || 1} language(s)
                        </p>
                      </div>
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !inputContent.trim()}
                        className="w-full max-w-md h-12 text-base"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Generate Presentation
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Generation Progress - simplified */}
                {isGenerating && (
                  <Card className="border-primary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <div>
                          <p className="text-sm font-medium">Generating presentation...</p>
                          <p className="text-xs text-muted-foreground">This may take a few moments</p>
                        </div>
                      </div>
                      <Progress value={50} className="mt-3" />
                    </CardContent>
                  </Card>
                )}
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
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                {/* Enhanced Empty State */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full blur-2xl" />
                  <div className="relative bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
                    <Presentation className="h-16 w-16 mx-auto text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ready to Create Your Presentation
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Transform your ideas into professional slides with AI-powered generation
                </p>
                
                {/* Getting Started Steps */}
                <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3 border">
                  <p className="text-xs font-medium text-foreground uppercase tracking-wide">Getting Started</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-medium">1</span>
                      <span className="text-muted-foreground">Enter your content, notes, or paste a document</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-medium">2</span>
                      <span className="text-muted-foreground">Choose your brand style and template</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-medium">3</span>
                      <span className="text-muted-foreground">Generate and customize your slides</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Your presentation will appear here once generated
                </p>
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
                      model: 'gemini-2.0-flash',
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
                        model: 'gemini-2.0-flash',
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
