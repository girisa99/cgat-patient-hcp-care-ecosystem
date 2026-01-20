/**
 * Pre-Generation Confirmation Panel
 * Shows complete summary of all selections across Steps 0-5 before generation
 * Includes TokenBreakdownPanel for detailed cost estimation
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Check,
  AlertCircle,
  FileText,
  Settings2,
  Layout,
  Layers,
  Brain,
  Wand2,
  Globe,
  Sparkles,
  Image as ImageIcon,
  Mic,
  Languages,
  ChevronDown,
  ChevronRight,
  Calculator,
  Coins,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { VisualFeatureSelection } from './VisualFeaturesDropdown';
import type { OutputTypeSettings } from '../OutputTypePanel';
import { TokenBreakdownPanel } from './TokenBreakdownPanel';
import { 
  estimateTokens, 
  createEstimationConfigFromWizard,
  type TokenEstimate,
  type EstimationConfig,
  type OptimizationSuggestion,
} from '../services/tokenEstimationService';

// Model Tier Definitions - Based on ConfigurationPanel.tsx
export interface ModelTierInfo {
  tier: 1 | 2 | 3;
  tierName: string;
  description: string;
  costMultiplier: number; // 1x = baseline
  qualityScore: number; // 0-100
  speedScore: number; // 0-100
}

export const MODEL_TIERS: Record<string, ModelTierInfo> = {
  // ==================== TEXT / LLM MODELS ====================
  // Tier 1 - Core/Primary (Best quality + speed, available via Lovable AI)
  'google/gemini-3-flash-preview': { tier: 1, tierName: 'Tier 1 - Core', description: 'Fastest multimodal via Lovable AI', costMultiplier: 1.0, qualityScore: 90, speedScore: 95 },
  'google/gemini-3-pro-preview': { tier: 1, tierName: 'Tier 1 - Core', description: 'Next-gen reasoning', costMultiplier: 1.2, qualityScore: 95, speedScore: 85 },
  'google/gemini-2.5-pro': { tier: 1, tierName: 'Tier 1 - Core', description: '1M context, complex reasoning', costMultiplier: 1.5, qualityScore: 95, speedScore: 80 },
  'google/gemini-2.5-flash': { tier: 1, tierName: 'Tier 1 - Core', description: 'Fast balanced multimodal', costMultiplier: 0.8, qualityScore: 88, speedScore: 92 },
  'openai/gpt-5': { tier: 1, tierName: 'Tier 1 - Core', description: 'Premium quality, strong reasoning', costMultiplier: 2.0, qualityScore: 98, speedScore: 75 },
  'openai/gpt-5-mini': { tier: 1, tierName: 'Tier 1 - Core', description: 'Cost-effective GPT-5', costMultiplier: 1.0, qualityScore: 90, speedScore: 88 },
  'openai/gpt-5.2': { tier: 1, tierName: 'Tier 1 - Core', description: 'Enhanced reasoning', costMultiplier: 2.2, qualityScore: 99, speedScore: 72 },
  // Tier 2 - Enterprise/Specialized
  'anthropic/claude-opus-4': { tier: 2, tierName: 'Tier 2 - Enterprise', description: 'Best nuance, 200k context', costMultiplier: 2.5, qualityScore: 97, speedScore: 70 },
  'anthropic/claude-sonnet-4': { tier: 2, tierName: 'Tier 2 - Enterprise', description: 'Balanced Claude quality', costMultiplier: 1.8, qualityScore: 93, speedScore: 78 },
  'anthropic/claude-3.5-sonnet': { tier: 2, tierName: 'Tier 2 - Enterprise', description: 'Compliance-sensitive', costMultiplier: 1.5, qualityScore: 92, speedScore: 80 },
  'azure/gpt-4o': { tier: 2, tierName: 'Tier 2 - Enterprise', description: 'Enterprise SLA, HIPAA', costMultiplier: 2.0, qualityScore: 94, speedScore: 75 },
  // Tier 3 - Budget/Regional
  'deepseek/deepseek-chat': { tier: 3, tierName: 'Tier 3 - Budget', description: 'Best Chinese, very low cost', costMultiplier: 0.3, qualityScore: 85, speedScore: 90 },
  'deepseek/deepseek-coder': { tier: 3, tierName: 'Tier 3 - Budget', description: 'Technical/code content', costMultiplier: 0.3, qualityScore: 88, speedScore: 88 },
  'alibaba/qwen-max': { tier: 3, tierName: 'Tier 3 - Regional', description: 'Excellent CJK, full-stack', costMultiplier: 0.5, qualityScore: 88, speedScore: 85 },
  'alibaba/qwen-2.5': { tier: 3, tierName: 'Tier 3 - Regional', description: 'Asian language optimized', costMultiplier: 0.4, qualityScore: 85, speedScore: 88 },
  'alibaba/qwen-turbo': { tier: 3, tierName: 'Tier 3 - Regional', description: 'Fast, very low cost', costMultiplier: 0.2, qualityScore: 80, speedScore: 95 },

  // ==================== IMAGE GENERATION ====================
  // Tier 1 - Core (Lovable AI + ModelsLab Hub)
  'gemini-nano-banana': { tier: 1, tierName: 'Tier 1 - Core', description: 'Fast image gen via Lovable AI', costMultiplier: 0.5, qualityScore: 88, speedScore: 95 },
  'gemini-3-pro-image': { tier: 1, tierName: 'Tier 1 - Core', description: 'Highest quality via Lovable AI', costMultiplier: 1.0, qualityScore: 95, speedScore: 80 },
  'modelslab': { tier: 1, tierName: 'Tier 1 - Core', description: 'Multi-model hub: Image/Video/3D', costMultiplier: 1.0, qualityScore: 90, speedScore: 85 },
  'modelslab-realvision': { tier: 1, tierName: 'Tier 1 - Core', description: 'Photorealistic images', costMultiplier: 1.2, qualityScore: 94, speedScore: 80 },
  'modelslab-civitai': { tier: 1, tierName: 'Tier 1 - Core', description: 'CivitAI community models', costMultiplier: 1.0, qualityScore: 92, speedScore: 82 },
  // Tier 2 - Premium
  'flux-pro': { tier: 2, tierName: 'Tier 2 - Premium', description: 'High quality, fine control', costMultiplier: 1.5, qualityScore: 95, speedScore: 75 },
  'flux-schnell': { tier: 2, tierName: 'Tier 2 - Premium', description: 'Fast generation', costMultiplier: 0.8, qualityScore: 88, speedScore: 92 },
  'dall-e-3': { tier: 2, tierName: 'Tier 2 - Premium', description: 'Excellent text rendering', costMultiplier: 2.0, qualityScore: 95, speedScore: 70 },
  'stability': { tier: 2, tierName: 'Tier 2 - Premium', description: 'ControlNet, fine control', costMultiplier: 1.0, qualityScore: 90, speedScore: 82 },
  // Tier 3 - Budget/Open Source
  'alibaba-wanx': { tier: 3, tierName: 'Tier 3 - Regional', description: 'Asian aesthetics, low cost', costMultiplier: 0.3, qualityScore: 82, speedScore: 88 },
  'replicate': { tier: 3, tierName: 'Tier 3 - Budget', description: 'Open source models', costMultiplier: 0.5, qualityScore: 85, speedScore: 80 },
  'huggingface': { tier: 3, tierName: 'Tier 3 - Budget', description: 'Open models, customizable', costMultiplier: 0.4, qualityScore: 82, speedScore: 78 },
  'stock': { tier: 3, tierName: 'Tier 3 - Budget', description: 'Pre-existing stock photos', costMultiplier: 0.1, qualityScore: 75, speedScore: 99 },

  // ==================== VIDEO GENERATION ====================
  // Tier 1 - Core (OpenAI Sora + ModelsLab)
  'openai-sora': { tier: 1, tierName: 'Tier 1 - Core', description: 'OpenAI Sora, 20s, 4K quality', costMultiplier: 5.0, qualityScore: 98, speedScore: 50 },
  'modelslab-animatediff': { tier: 1, tierName: 'Tier 1 - Core', description: 'AnimateDiff, smooth motion', costMultiplier: 2.0, qualityScore: 88, speedScore: 75 },
  'modelslab-svd': { tier: 1, tierName: 'Tier 1 - Core', description: 'Stable Video Diffusion', costMultiplier: 2.0, qualityScore: 90, speedScore: 70 },
  'modelslab-video': { tier: 1, tierName: 'Tier 1 - Core', description: '1080p, up to 30s, AnimateDiff', costMultiplier: 2.0, qualityScore: 88, speedScore: 75 },
  // Tier 2 - Premium video
  'gemini-veo': { tier: 2, tierName: 'Tier 2 - Premium', description: 'Gemini Veo, 8s, via Lovable AI', costMultiplier: 2.5, qualityScore: 88, speedScore: 70 },
  'runway': { tier: 2, tierName: 'Tier 2 - Premium', description: 'Gen-3, 4K quality, 10s max', costMultiplier: 4.0, qualityScore: 98, speedScore: 50 },
  'runway-gen3': { tier: 2, tierName: 'Tier 2 - Premium', description: 'Runway Gen-3 Alpha', costMultiplier: 4.0, qualityScore: 98, speedScore: 50 },
  'pika': { tier: 2, tierName: 'Tier 2 - Premium', description: 'Pika Labs, 4s max', costMultiplier: 3.0, qualityScore: 92, speedScore: 65 },
  'pika-labs': { tier: 2, tierName: 'Tier 2 - Premium', description: 'Pika Labs, creative videos', costMultiplier: 3.0, qualityScore: 92, speedScore: 65 },
  'gemini-video': { tier: 2, tierName: 'Tier 2 - Premium', description: '1080p, 60s max via Lovable AI', costMultiplier: 2.5, qualityScore: 88, speedScore: 70 },
  // Tier 3 - Regional/Budget
  'alibaba-wanx-video': { tier: 3, tierName: 'Tier 3 - Regional', description: 'Alibaba Wanx Video, CJK optimized', costMultiplier: 1.5, qualityScore: 82, speedScore: 75 },
  'replicate-video': { tier: 3, tierName: 'Tier 3 - Budget', description: 'Open source video models', costMultiplier: 1.0, qualityScore: 80, speedScore: 70 },

  // ==================== 3D MESH GENERATION ====================
  // Tier 1 - ModelsLab is primary 3D hub
  'modelslab-3d': { tier: 1, tierName: 'Tier 1 - Core', description: 'Text-to-mesh, 3D models', costMultiplier: 3.0, qualityScore: 85, speedScore: 60 },
  // Tier 2 - Specialized 3D
  'meshy-ai': { tier: 2, tierName: 'Tier 2 - Specialized', description: 'Meshy AI, high-quality mesh', costMultiplier: 3.5, qualityScore: 92, speedScore: 55 },
  'triposr': { tier: 2, tierName: 'Tier 2 - Specialized', description: 'TripoSR, fast 3D from image', costMultiplier: 2.5, qualityScore: 88, speedScore: 70 },
  'point-e': { tier: 2, tierName: 'Tier 2 - Specialized', description: 'OpenAI Point-E, point clouds', costMultiplier: 2.0, qualityScore: 80, speedScore: 75 },
  // Tier 3 - Budget
  'replicate-3d': { tier: 3, tierName: 'Tier 3 - Budget', description: 'Open source 3D models', costMultiplier: 1.5, qualityScore: 75, speedScore: 65 },

  // ==================== OCR / DOCUMENT PROCESSING ====================
  // Tier 1 - Enterprise
  'azure-form-recognizer': { tier: 1, tierName: 'Tier 1 - Enterprise', description: 'Invoices, receipts, IDs, tables', costMultiplier: 1.5, qualityScore: 98, speedScore: 90 },
  'azure-document-intelligence': { tier: 1, tierName: 'Tier 1 - Enterprise', description: 'Complex documents, contracts', costMultiplier: 1.5, qualityScore: 98, speedScore: 88 },
  // Tier 2 - AI-powered
  'deepseek-vl': { tier: 2, tierName: 'Tier 2 - AI', description: 'Multilingual, complex layouts', costMultiplier: 0.5, qualityScore: 90, speedScore: 85 },
  'gemini-vision': { tier: 2, tierName: 'Tier 2 - AI', description: 'General OCR, handwriting', costMultiplier: 0.8, qualityScore: 88, speedScore: 88 },
  'gpt-4-vision': { tier: 2, tierName: 'Tier 2 - AI', description: 'Complex layouts, reasoning', costMultiplier: 1.2, qualityScore: 92, speedScore: 80 },

  // ==================== TRANSLATION ====================
  // Tier 1 - Highest quality
  'deepl': { tier: 1, tierName: 'Tier 1 - Core', description: 'Highest quality EU translation', costMultiplier: 1.2, qualityScore: 98, speedScore: 90 },
  'google-translate': { tier: 1, tierName: 'Tier 1 - Core', description: '249+ languages, reliable', costMultiplier: 0.5, qualityScore: 88, speedScore: 95 },
  // Tier 2 - Enterprise/Specialized
  'qwen-mt': { tier: 2, tierName: 'Tier 2 - Specialized', description: 'Best CJK translation', costMultiplier: 0.8, qualityScore: 95, speedScore: 90 },
  'azure': { tier: 2, tierName: 'Tier 2 - Enterprise', description: '135+ languages, enterprise', costMultiplier: 1.0, qualityScore: 90, speedScore: 88 },
  'azure-translator': { tier: 2, tierName: 'Tier 2 - Enterprise', description: 'Enterprise, RTL support', costMultiplier: 1.0, qualityScore: 90, speedScore: 88 },
  'aws-translate': { tier: 2, tierName: 'Tier 2 - Enterprise', description: 'High volume, custom terms', costMultiplier: 0.8, qualityScore: 88, speedScore: 90 },
  // Tier 3 - AI-based / Open source
  'gemini-translate': { tier: 3, tierName: 'Tier 3 - AI', description: 'Context-aware via Lovable AI', costMultiplier: 0.6, qualityScore: 85, speedScore: 80 },
  'gpt-translate': { tier: 3, tierName: 'Tier 3 - AI', description: 'Context-aware, creative', costMultiplier: 1.0, qualityScore: 88, speedScore: 75 },
  'claude-translate': { tier: 3, tierName: 'Tier 3 - AI', description: 'Literary, nuanced', costMultiplier: 1.2, qualityScore: 90, speedScore: 70 },
  'nllb': { tier: 3, tierName: 'Tier 3 - Open', description: '200 languages, open source', costMultiplier: 0.2, qualityScore: 78, speedScore: 85 },
  'alibaba-translate': { tier: 3, tierName: 'Tier 3 - Regional', description: 'Asian optimized', costMultiplier: 0.3, qualityScore: 85, speedScore: 88 },

  // ==================== VOICE / TTS ====================
  // Tier 1 - Premium
  'elevenlabs-multilingual': { tier: 1, tierName: 'Tier 1 - Core', description: 'Most natural, voice cloning', costMultiplier: 1.5, qualityScore: 98, speedScore: 85 },
  'azure-neural': { tier: 1, tierName: 'Tier 1 - Core', description: '300+ voices, SSML, enterprise', costMultiplier: 1.0, qualityScore: 92, speedScore: 90 },
  'azure-speech': { tier: 1, tierName: 'Tier 1 - Core', description: 'Azure Speech Services, full-featured', costMultiplier: 1.0, qualityScore: 94, speedScore: 92 },
  // Tier 2 - Standard
  'google-wavenet': { tier: 2, tierName: 'Tier 2 - Standard', description: 'WaveNet, 200+ languages', costMultiplier: 0.6, qualityScore: 88, speedScore: 90 },
  'openai-tts-hd': { tier: 2, tierName: 'Tier 2 - Standard', description: 'Simple API, good quality', costMultiplier: 0.8, qualityScore: 88, speedScore: 92 },
  // Tier 3 - Budget/Regional
  'alibaba-cosyvoice': { tier: 3, tierName: 'Tier 3 - Regional', description: 'Best Chinese voices, cloning', costMultiplier: 0.3, qualityScore: 88, speedScore: 88 },
  'alibaba-tts': { tier: 3, tierName: 'Tier 3 - Regional', description: 'DashScope, Asian optimized', costMultiplier: 0.3, qualityScore: 82, speedScore: 90 },
  'amazon-polly': { tier: 3, tierName: 'Tier 3 - Budget', description: 'Neural voices, AWS', costMultiplier: 0.5, qualityScore: 82, speedScore: 92 },
  'aws-polly': { tier: 3, tierName: 'Tier 3 - Budget', description: 'Neural voices, AWS', costMultiplier: 0.5, qualityScore: 82, speedScore: 92 },

  // ==================== STT (Speech-to-Text) ====================
  // Tier 1 - Premium
  'azure-stt': { tier: 1, tierName: 'Tier 1 - Core', description: 'Azure Speech, real-time', costMultiplier: 1.0, qualityScore: 95, speedScore: 92 },
  'openai-whisper': { tier: 1, tierName: 'Tier 1 - Core', description: 'Whisper, 99 languages', costMultiplier: 0.8, qualityScore: 95, speedScore: 85 },
  // Tier 2 - Standard
  'google-stt': { tier: 2, tierName: 'Tier 2 - Standard', description: 'Google STT, 125 languages', costMultiplier: 0.6, qualityScore: 90, speedScore: 90 },
  'deepgram': { tier: 2, tierName: 'Tier 2 - Standard', description: 'Deepgram Nova, real-time', costMultiplier: 0.5, qualityScore: 88, speedScore: 95 },
  // Tier 3 - Regional
  'alibaba-paraformer': { tier: 3, tierName: 'Tier 3 - Regional', description: 'Best for CJK languages', costMultiplier: 0.3, qualityScore: 90, speedScore: 88 },
};

// Get tier info for a model, with fallback
export function getModelTierInfo(modelId: string): ModelTierInfo {
  return MODEL_TIERS[modelId] || { tier: 2, tierName: 'Tier 2', description: 'Standard provider', costMultiplier: 1.0, qualityScore: 80, speedScore: 80 };
}

export interface AIRecommendation {
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

export interface GenerationContextSummary {
  // Step 0: Input
  inputSource: string;
  inputContentPreview: string;
  inputContentLength: number; // NEW: Full length for token calc
  hasUploadedFile: boolean;
  
  // Step 1: Configuration - NOW with independent mode tracking
  industryCategory: string;
  industryName: string;
  segment: string;
  contentTypes: string[];
  isAIAutoMode: boolean; // Legacy - kept for backward compat
  step1Mode: 'ai' | 'custom'; // NEW: Independent Step 1 mode
  
  // Step 2: Template & Branding - NOW with independent mode tracking
  templateId: string;
  templateName: string;
  themeName: string;
  brandColors: { primary: string; secondary: string; accent: string };
  hasLogo: boolean;
  selectedFrameworkCategories: string[];
  selectedFrameworkIds: string[];
  visualFeatures: VisualFeatureSelection[];
  step2Mode: 'ai' | 'custom'; // NEW: Independent Step 2 mode
  
  // Step 3: Output Type
  outputSettings: OutputTypeSettings;
  
  // Step 4: Agents & Languages
  useAgenticGeneration: boolean;
  selectedAgents: string[];
  selectedLanguages: string[];
  primaryLanguage: string;
  includeVoiceover: boolean;
  voiceProvider: string;
  
  // AI Models - Current selections
  aiModels: {
    textModel: string;
    imageModel: string;
    voiceModel: string;
    translationModel: string;
    videoModel?: string;
  };
  
  // NEW: AI Recommendation with confidence
  aiRecommendation?: AIRecommendation;
  
  // NEW: Additional feature flags for token estimation
  includeCharts?: boolean;
  includeTables?: boolean;
  includeInfographics?: boolean;
  includeJourneyMaps?: boolean;
}

interface PreGenerationConfirmationPanelProps {
  summary: GenerationContextSummary;
  onConfirm: () => void;
  onEdit: (stepIndex: number) => void;
  isGenerating: boolean;
  currentBalance: number; // NEW: User's current credit balance
  creditEstimate?: number;
  className?: string;
  // NEW: Model override callbacks
  onModelOverride?: (modelType: 'text' | 'image' | 'voice' | 'translation', newModel: string) => void;
  // NEW: Optimization action callbacks
  onApplyOptimization?: (suggestion: OptimizationSuggestion) => void;
  availableModels?: {
    text: Array<{ id: string; name: string; tier: number }>;
    image: Array<{ id: string; name: string; tier: number }>;
    voice: Array<{ id: string; name: string; tier: number }>;
    translation: Array<{ id: string; name: string; tier: number }>;
  };
}

// Visual feature labels
const VISUAL_FEATURE_LABELS: Record<string, string> = {
  'infographics': 'Infographics',
  'journey-maps': 'Journey Maps',
  'data-tables': 'Data Tables',
  'charts': 'Charts',
  'timelines': 'Timelines',
  'diagrams': 'Diagrams',
  'quote-blocks': 'Quote Blocks',
  'icon-sets': 'Icon Sets',
};

// Model Card Component
function ModelCard({ type, icon, label, model, recommended, alternatives, onOverride, isRecommendationActive }: {
  type: 'text' | 'image' | 'voice' | 'translation';
  icon: React.ReactNode;
  label: string;
  model: string;
  recommended?: string;
  alternatives?: string[];
  onOverride?: (type: 'text' | 'image' | 'voice' | 'translation', model: string) => void;
  isRecommendationActive: boolean;
}) {
  const tierInfo = getModelTierInfo(model);
  const isUsingRecommended = model === recommended;
  const tierColor = tierInfo.tier === 1 ? 'bg-green-500' : tierInfo.tier === 2 ? 'bg-blue-500' : 'bg-amber-500';
  
  return (
    <div className="p-2 rounded-lg border bg-card/50 space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <div className={cn("w-2 h-2 rounded-full", tierColor)} title={tierInfo.tierName} />
      </div>
      <div className="text-xs font-mono truncate" title={model}>
        {model?.split('/').pop() || 'Auto'}
      </div>
      {isRecommendationActive && isUsingRecommended && (
        <Badge variant="secondary" className="text-[10px] h-4">✓ Recommended</Badge>
      )}
      <div className="flex gap-1 text-[10px] text-muted-foreground">
        <span>Q:{tierInfo.qualityScore}</span>
        <span>S:{tierInfo.speedScore}</span>
        <span>{tierInfo.costMultiplier}x</span>
      </div>
    </div>
  );
}

// Cost Optimization Summary
function CostOptimizationSummary({ textModel, imageModel, voiceModel, translationModel }: {
  textModel: string; imageModel: string; voiceModel: string; translationModel: string;
}) {
  const textTier = getModelTierInfo(textModel);
  const imageTier = getModelTierInfo(imageModel);
  const voiceTier = getModelTierInfo(voiceModel);
  const translationTier = getModelTierInfo(translationModel);
  
  const avgQuality = Math.round((textTier.qualityScore + imageTier.qualityScore + voiceTier.qualityScore + translationTier.qualityScore) / 4);
  const avgCost = ((textTier.costMultiplier + imageTier.costMultiplier + voiceTier.costMultiplier + translationTier.costMultiplier) / 4).toFixed(1);
  
  return (
    <div className="flex items-center gap-4 text-xs p-2 rounded bg-muted/30">
      <div><span className="text-muted-foreground">Avg Quality:</span> <span className="font-medium">{avgQuality}/100</span></div>
      <div><span className="text-muted-foreground">Cost Factor:</span> <span className="font-medium">{avgCost}x</span></div>
      <div><span className="text-muted-foreground">Optimization:</span> <Badge variant="outline" className="text-[10px] h-4 ml-1">Balanced</Badge></div>
    </div>
  );
}

export function PreGenerationConfirmationPanel({
  summary,
  onConfirm,
  onEdit,
  isGenerating,
  currentBalance = 0,
  creditEstimate,
  className,
  onModelOverride,
  onApplyOptimization,
}: PreGenerationConfirmationPanelProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['input', 'config', 'template', 'output', 'agents']));
  const [showTokenBreakdown, setShowTokenBreakdown] = React.useState(false);

  // Calculate token estimation from all wizard state
  const tokenEstimate = React.useMemo<TokenEstimate>(() => {
    const config: EstimationConfig = {
      // Step 0
      slideCount: summary.outputSettings.slideCount || 10,
      contentLength: summary.inputContentLength || summary.inputContentPreview.length * 5,
      hasUploadedFile: summary.hasUploadedFile,
      inputSource: summary.inputSource as 'prompt' | 'document' | 'url' | 'image',
      
      // Step 1
      industryCategory: summary.industryCategory,
      segment: summary.segment,
      contentTypes: summary.contentTypes,
      
      // Step 2
      selectedFrameworkIds: summary.selectedFrameworkIds,
      visualFeatures: summary.visualFeatures.map(vf => vf.featureId),
      visualFeatureSubOptions: summary.visualFeatures.reduce((sum, vf) => sum + vf.subOptions.length, 0),
      hasCustomLogo: summary.hasLogo,
      hasCustomColors: summary.brandColors.primary !== '#3b82f6',
      
      // Step 3
      outputType: summary.outputSettings.outputType,
      outputTypes: summary.outputSettings.outputTypes,
      resolution: (summary.outputSettings.resolution || '1080p') as '720p' | '1080p' | '4k',
      aspectRatio: summary.outputSettings.aspectRatio,
      structureMode: (summary.outputSettings.structureMode || 'flat') as 'flat' | 'chapters',
      chapterCount: summary.outputSettings.chapterCount,
      
      // Step 4
      languageCount: summary.selectedLanguages.length,
      includeVoiceover: summary.includeVoiceover,
      voiceoverLanguages: summary.includeVoiceover ? Math.min(summary.selectedLanguages.length, 3) : 0,
      useAgenticGeneration: summary.useAgenticGeneration,
      selectedAgentCount: summary.selectedAgents.length,
      
      // Features
      includeMusic: summary.outputSettings.includeMusic || false,
      includeCharts: summary.includeCharts ? Math.ceil((summary.outputSettings.slideCount || 10) * 0.2) : 0,
      includeTables: summary.includeTables ? Math.ceil((summary.outputSettings.slideCount || 10) * 0.15) : 0,
      includeInteractive: summary.outputSettings.outputType === 'interactive',
      includeInfographics: summary.includeInfographics || false,
      includeJourneyMaps: summary.includeJourneyMaps || false,
      
      // Frameworks
      frameworkCount: summary.selectedFrameworkIds.length,
      
      // Models
      textModel: summary.aiModels.textModel || 'auto',
      imageModel: summary.aiModels.imageModel || 'auto',
      voiceModel: summary.aiModels.voiceModel || 'auto',
      translationModel: summary.aiModels.translationModel || 'auto',
      videoModel: summary.aiModels.videoModel,
    };
    
    return estimateTokens(config);
  }, [summary]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const hasValidation = (section: string): boolean => {
    switch (section) {
      case 'input':
        return summary.inputContentPreview.length > 0;
      case 'config':
        return !!summary.industryCategory && summary.contentTypes.length > 0;
      case 'template':
        return !!summary.templateId;
      case 'output':
        return !!summary.outputSettings.outputType;
      case 'agents':
        return summary.selectedLanguages.length > 0;
      default:
        return true;
    }
  };

  const sections = [
    { id: 'input', title: 'Step 0: Input', icon: FileText, step: 0 },
    { id: 'config', title: 'Step 1: Configuration', icon: Settings2, step: 1 },
    { id: 'template', title: 'Step 2: Template & Branding', icon: Layout, step: 2 },
    { id: 'output', title: 'Step 3: Output Type', icon: Layers, step: 3 },
    { id: 'agents', title: 'Step 4: Agents & Languages', icon: Brain, step: 4 },
  ];

  const hasEnoughCredits = currentBalance >= tokenEstimate.totalCredits;

  return (
    <Card className={cn('border-primary/30', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wand2 className="h-5 w-5 text-primary" />
          Pre-Generation Review
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review all your selections before generating. Click any section to edit.
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sections.map((section) => (
              <Collapsible
                key={section.id}
                open={expandedSections.has(section.id)}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className={cn(
                    'flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors',
                    !hasValidation(section.id) && 'border-destructive/50'
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-1.5 rounded-md',
                        hasValidation(section.id) ? 'bg-primary/10' : 'bg-destructive/10'
                      )}>
                        <section.icon className={cn(
                          'h-4 w-4',
                          hasValidation(section.id) ? 'text-primary' : 'text-destructive'
                        )} />
                      </div>
                      <span className="font-medium text-sm">{section.title}</span>
                      {hasValidation(section.id) ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(section.step);
                        }}
                      >
                        Edit
                      </Button>
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="p-3 pt-2 ml-6 border-l-2 border-muted space-y-2">
                    {section.id === 'input' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Source:</span>
                            <Badge variant="outline" className="ml-2">{summary.inputSource}</Badge>
                          </div>
                          {summary.hasUploadedFile && (
                            <div>
                              <Badge variant="secondary" className="text-xs">📎 File Uploaded</Badge>
                            </div>
                          )}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Content Preview:</span>
                          <p className="mt-1 text-xs bg-muted/50 p-2 rounded line-clamp-2">
                            {summary.inputContentPreview || 'No content entered'}
                          </p>
                        </div>
                      </>
                    )}

                    {section.id === 'config' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Industry:</span>
                            <span className="ml-2 font-medium">{summary.industryName || 'Not selected'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Segment:</span>
                            <span className="ml-2 font-medium">{summary.segment || 'Not selected'}</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Content Types:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {summary.contentTypes.length > 0 ? (
                              summary.contentTypes.map(ct => (
                                <Badge key={ct} variant="secondary" className="text-xs">{ct}</Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">None selected</span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Step 1 Mode:</span>
                          <Badge variant={summary.step1Mode === 'ai' ? 'default' : 'outline'} className="ml-2">
                            {summary.step1Mode === 'ai' ? '🤖 AI Auto' : '🔧 Custom'}
                          </Badge>
                        </div>
                      </>
                    )}

                    {section.id === 'template' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Template:</span>
                            <span className="ml-2 font-medium">{summary.templateName || 'Default'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Theme:</span>
                            <span className="ml-2 font-medium">{summary.themeName || 'Default'}</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Step 2 Mode:</span>
                          <Badge variant={summary.step2Mode === 'ai' ? 'default' : 'outline'} className="ml-2">
                            {summary.step2Mode === 'ai' ? '🤖 AI Auto' : '🔧 Custom'}
                          </Badge>
                        </div>
                        {summary.selectedFrameworkCategories.length > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Frameworks:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {summary.selectedFrameworkCategories.map(fc => (
                                <Badge key={fc} variant="outline" className="text-xs">{fc}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="text-muted-foreground">Visual Features:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {summary.visualFeatures.length > 0 ? (
                              summary.visualFeatures.map(vf => (
                                <Badge key={vf.featureId} variant="secondary" className="text-xs">
                                  {VISUAL_FEATURE_LABELS[vf.featureId] || vf.featureId}
                                  {vf.subOptions.length > 0 && ` (+${vf.subOptions.length})`}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">None selected</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <div 
                            className="h-6 w-6 rounded border" 
                            style={{ backgroundColor: summary.brandColors.primary }}
                            title="Primary"
                          />
                          <div 
                            className="h-6 w-6 rounded border" 
                            style={{ backgroundColor: summary.brandColors.secondary }}
                            title="Secondary"
                          />
                          <div 
                            className="h-6 w-6 rounded border" 
                            style={{ backgroundColor: summary.brandColors.accent }}
                            title="Accent"
                          />
                          {summary.hasLogo && (
                            <Badge variant="outline" className="text-xs">📷 Logo</Badge>
                          )}
                        </div>
                      </>
                    )}

                    {section.id === 'output' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Output Type:</span>
                            <Badge variant="default" className="ml-2">{summary.outputSettings.outputType}</Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Structure:</span>
                            <span className="ml-2 font-medium">{summary.outputSettings.structureMode}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Slides:</span>
                            <span className="ml-2 font-medium">{summary.outputSettings.slideCount}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Resolution:</span>
                            <span className="ml-2 font-medium">{summary.outputSettings.resolution}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap text-sm">
                          {summary.outputSettings.includeVoiceover && (
                            <Badge variant="secondary" className="text-xs">🎙️ Voiceover</Badge>
                          )}
                          {summary.outputSettings.includeMusic && (
                            <Badge variant="secondary" className="text-xs">🎵 Music</Badge>
                          )}
                        </div>
                      </>
                    )}

                    {section.id === 'agents' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Architecture:</span>
                            <Badge variant={summary.useAgenticGeneration ? 'default' : 'outline'} className="ml-2">
                              {summary.useAgenticGeneration ? 'Multi-Agent' : 'Single Agent'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Languages:</span>
                            <span className="ml-2 font-medium">{summary.selectedLanguages.length}</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Selected Languages:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {summary.selectedLanguages.map(lang => (
                              <Badge 
                                key={lang} 
                                variant={lang === summary.primaryLanguage ? 'default' : 'outline'} 
                                className="text-xs"
                              >
                                {lang.toUpperCase()}
                                {lang === summary.primaryLanguage && ' (Primary)'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {summary.includeVoiceover && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Voice Provider:</span>
                            <Badge variant="outline" className="ml-2">{summary.voiceProvider}</Badge>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            {/* Enhanced AI Models Section with Confidence, Tiers & Override */}
            <div className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-accent/5 space-y-4">
              {/* Header with Confidence Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">AI Model Configuration</span>
                </div>
                {summary.aiRecommendation && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs bg-primary/90">
                      {summary.aiRecommendation.confidence}% Confidence
                    </Badge>
                    {summary.step1Mode === 'ai' && (
                      <Badge variant="secondary" className="text-xs">AI Auto</Badge>
                    )}
                  </div>
                )}
              </div>

              {/* AI Recommendation Reasoning */}
              {summary.aiRecommendation && (
                <div className="p-2 rounded bg-muted/50 border border-muted">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Why these models?</span>{' '}
                    {summary.aiRecommendation.reason}
                  </p>
                </div>
              )}

              {/* Model Cards with Tier Info */}
              <div className="grid grid-cols-2 gap-3">
                {/* Text Model */}
                <ModelCard
                  type="text"
                  icon={<FileText className="h-3.5 w-3.5" />}
                  label="Text"
                  model={summary.aiModels.textModel}
                  recommended={summary.aiRecommendation?.textModel}
                  alternatives={summary.aiRecommendation?.alternativeTextModels}
                  onOverride={onModelOverride}
                  isRecommendationActive={summary.step1Mode === 'ai'}
                />
                
                {/* Image Model */}
                <ModelCard
                  type="image"
                  icon={<ImageIcon className="h-3.5 w-3.5" />}
                  label="Image"
                  model={summary.aiModels.imageModel}
                  recommended={summary.aiRecommendation?.imageModel}
                  alternatives={summary.aiRecommendation?.alternativeImageModels}
                  onOverride={onModelOverride}
                  isRecommendationActive={summary.step1Mode === 'ai'}
                />
                
                {/* Voice Model */}
                <ModelCard
                  type="voice"
                  icon={<Mic className="h-3.5 w-3.5" />}
                  label="Voice"
                  model={summary.aiModels.voiceModel}
                  recommended={summary.aiRecommendation?.voiceModel}
                  onOverride={onModelOverride}
                  isRecommendationActive={summary.step1Mode === 'ai'}
                />
                
                {/* Translation Model */}
                <ModelCard
                  type="translation"
                  icon={<Languages className="h-3.5 w-3.5" />}
                  label="Translation"
                  model={summary.aiModels.translationModel}
                  recommended={summary.aiRecommendation?.translationModel}
                  onOverride={onModelOverride}
                  isRecommendationActive={summary.step1Mode === 'ai'}
                />
              </div>

              {/* Cost/Quality Optimization Summary */}
              <CostOptimizationSummary
                textModel={summary.aiModels.textModel}
                imageModel={summary.aiModels.imageModel}
                voiceModel={summary.aiModels.voiceModel}
                translationModel={summary.aiModels.translationModel}
              />
              
              {/* Tier Legend - Using semantic color classes */}
              <div className="flex items-center gap-4 pt-2 border-t border-muted">
                <span className="text-xs text-muted-foreground font-medium">Tiers:</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">T1 Core</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-xs text-muted-foreground">T2 Enterprise</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span className="text-xs text-muted-foreground">T3 Budget</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        {/* Credit Estimate & Confirm */}
        <div className="flex items-center justify-between">
          {creditEstimate !== undefined && (
            <div className="text-sm">
              <span className="text-muted-foreground">Estimated Credits:</span>
              <Badge variant="outline" className="ml-2 font-mono">{creditEstimate}</Badge>
            </div>
          )}
          <Button 
            onClick={onConfirm}
            disabled={isGenerating}
            className="ml-auto"
          >
            {isGenerating ? 'Generating...' : 'Confirm & Generate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
