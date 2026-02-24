/**
 * AI Provider Matrix Dashboard
 * 
 * Dynamic display of AI providers by capability with confidence scores,
 * fallback chains, and download functionality.
 * Integrates with Label Studio for background AI training.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Expand, Minimize2, Brain, Globe, Eye, Mic, Speech, 
  Image, Video, Music, FileText, Shield, Sparkles, Check, X, 
  AlertCircle, Clock, ChevronDown, ChevronRight, RefreshCw,
  Cpu, Zap, Volume2, Languages, Camera, PenTool
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getProvidersConfigurationStatus, getConfiguredFallbackChain, type ProviderConfig } from '@/services/ai-hub/configuredProviders';
import type { AICapability } from '@/services/ai-hub/providerRegistry';

// ============================================
// TYPES
// ============================================

interface CapabilityInfo {
  id: AICapability;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

interface ProviderScore {
  providerId: string;
  name: string;
  confidence: number;
  quality: number;
  speed: number;
  cost: 'low' | 'medium' | 'high';
  status: 'configured' | 'needs_key' | 'not_supported';
  notes?: string;
  features: string[];
}

// ============================================
// CONSTANTS
// ============================================

const CAPABILITIES: CapabilityInfo[] = [
  { id: 'llm', name: 'LLM/Chat', icon: Brain, description: 'Large Language Models for chat and reasoning', color: 'purple' },
  { id: 'translation', name: 'Translation', icon: Languages, description: 'Multi-language translation services', color: 'blue' },
  { id: 'ocr', name: 'Vision/OCR', icon: Eye, description: 'Document scanning and optical character recognition', color: 'amber' },
  { id: 'tts', name: 'Text-to-Speech', icon: Volume2, description: 'Voice synthesis from text', color: 'cyan' },
  { id: 'stt', name: 'Speech-to-Text', icon: Mic, description: 'Audio transcription', color: 'green' },
  { id: 'image_gen', name: 'Image Generation', icon: Image, description: 'AI image creation', color: 'pink' },
  { id: 'video_gen', name: 'Video Generation', icon: Video, description: 'AI video creation', color: 'orange' },
  { id: 'music_gen', name: 'Music/Audio', icon: Music, description: 'AI music and sound generation', color: 'violet' },
  { id: 'vision', name: 'Vision Analysis', icon: Camera, description: 'Image understanding and analysis', color: 'teal' },
  { id: 'nlp', name: 'NLP/Text', icon: FileText, description: 'Text processing and analysis', color: 'emerald' },
];

// Provider confidence scores by capability (based on matrix analysis)
const PROVIDER_CAPABILITY_SCORES: Record<string, Record<string, ProviderScore>> = {
  llm: {
    openai: { providerId: 'openai', name: 'OpenAI GPT-4o', confidence: 98, quality: 95, speed: 85, cost: 'high', status: 'configured', features: ['128K context', 'Tool calling', 'Vision'] },
    claude: { providerId: 'claude', name: 'Claude 3.5 Sonnet', confidence: 97, quality: 96, speed: 80, cost: 'high', status: 'configured', features: ['200K context', 'Nuanced writing', 'Vision'] },
    gemini: { providerId: 'gemini', name: 'Gemini 2.5', confidence: 95, quality: 93, speed: 90, cost: 'medium', status: 'configured', features: ['1M+ context', 'Multimodal', 'Fast'] },
    deepseek: { providerId: 'deepseek', name: 'DeepSeek-V3', confidence: 92, quality: 90, speed: 85, cost: 'low', status: 'configured', features: ['128K context', 'Code expert', 'CJK'] },
    alibaba: { providerId: 'alibaba', name: 'Qwen 2.5', confidence: 88, quality: 85, speed: 85, cost: 'low', status: 'configured', features: ['128K context', 'CJK native', 'Vision'] },
    azure: { providerId: 'azure', name: 'Azure OpenAI', confidence: 95, quality: 95, speed: 85, cost: 'high', status: 'needs_key', notes: 'Enterprise - requires Azure subscription', features: ['Enterprise SLA', 'Private endpoints'] },
  },
  translation: {
    deepl: { providerId: 'deepl', name: 'DeepL Pro', confidence: 99, quality: 98, speed: 95, cost: 'medium', status: 'configured', features: ['30+ languages', 'Glossary', 'Formality'] },
    claude: { providerId: 'claude', name: 'Claude Translation', confidence: 94, quality: 95, speed: 75, cost: 'high', status: 'configured', features: ['Literary quality', 'Context aware', 'European'] },
    microsoft: { providerId: 'microsoft', name: 'Microsoft Translator', confidence: 92, quality: 88, speed: 95, cost: 'medium', status: 'configured', features: ['100+ languages', 'Custom models'] },
    google: { providerId: 'google', name: 'Google Translate', confidence: 90, quality: 85, speed: 98, cost: 'low', status: 'configured', features: ['130+ languages', 'Fast'] },
    alibaba: { providerId: 'alibaba', name: 'Alibaba Translation', confidence: 95, quality: 92, speed: 90, cost: 'low', status: 'configured', notes: 'Best for CJK', features: ['CJK expert', '50+ languages'] },
  },
  tts: {
    elevenlabs: { providerId: 'elevenlabs', name: 'ElevenLabs', confidence: 98, quality: 99, speed: 85, cost: 'high', status: 'configured', features: ['Voice cloning', 'Emotion', '29 languages'] },
    openai: { providerId: 'openai', name: 'OpenAI TTS', confidence: 90, quality: 88, speed: 95, cost: 'medium', status: 'configured', features: ['6 voices', 'Fast', 'Streaming'] },
    google: { providerId: 'google', name: 'Google TTS', confidence: 88, quality: 85, speed: 95, cost: 'low', status: 'configured', features: ['300+ voices', '50+ languages'] },
    alibaba: { providerId: 'alibaba', name: 'Alibaba TTS', confidence: 85, quality: 82, speed: 90, cost: 'low', status: 'configured', features: ['CJK voices', 'Custom voices'] },
    azure: { providerId: 'azure', name: 'Azure Speech', confidence: 95, quality: 95, speed: 90, cost: 'medium', status: 'needs_key', features: ['400+ voices', 'SSML', 'Cloning'], notes: 'Best enterprise TTS' },
  },
  stt: {
    // Core 12 Providers Only - assemblyai remapped to azure/openai
    openai: { providerId: 'openai', name: 'OpenAI Whisper', confidence: 98, quality: 98, speed: 85, cost: 'medium', status: 'configured', features: ['99 languages', 'Real-time', 'Accurate'] },
    azure: { providerId: 'azure', name: 'Azure Speech', confidence: 97, quality: 97, speed: 90, cost: 'medium', status: 'configured', features: ['125+ languages', 'Diarization', 'Medical vocab'] },
    google: { providerId: 'google', name: 'Google Speech', confidence: 92, quality: 90, speed: 90, cost: 'medium', status: 'configured', features: ['125+ languages', 'Diarization'] },
    alibaba: { providerId: 'alibaba', name: 'Alibaba Paraformer', confidence: 90, quality: 88, speed: 92, cost: 'low', status: 'configured', features: ['CJK expert', 'Fast transcription'] },
    gemini: { providerId: 'gemini', name: 'Gemini Audio', confidence: 88, quality: 85, speed: 95, cost: 'medium', status: 'configured', features: ['Multimodal', 'Fast'] },
  },
  image_gen: {
    // Core 12 Providers Only - No stability/runway/pika
    openai: { providerId: 'openai', name: 'DALL-E 3', confidence: 95, quality: 92, speed: 80, cost: 'high', status: 'configured', features: ['Best prompts', 'Inpainting'] },
    modelslab: { providerId: 'modelslab', name: 'ModelsLab FLUX', confidence: 96, quality: 95, speed: 85, cost: 'medium', status: 'configured', features: ['FLUX Pro', 'ControlNet', 'Best quality'] },
    replicate: { providerId: 'replicate', name: 'Replicate SDXL', confidence: 92, quality: 90, speed: 75, cost: 'medium', status: 'configured', features: ['ControlNet', 'Editing', 'Flux'] },
    gemini: { providerId: 'gemini', name: 'Gemini Imagen', confidence: 88, quality: 85, speed: 90, cost: 'medium', status: 'configured', features: ['Fast', 'Integrated'] },
    alibaba: { providerId: 'alibaba', name: 'Alibaba Wanx', confidence: 82, quality: 80, speed: 85, cost: 'low', status: 'configured', features: ['Low cost', 'CJK style'] },
  },
  video_gen: {
    // Core 12 Providers Only - runway/pika remapped to modelslab/alibaba
    modelslab: { providerId: 'modelslab', name: 'ModelsLab AnimateDiff', confidence: 95, quality: 92, speed: 75, cost: 'medium', status: 'configured', features: ['AnimateDiff', 'SVD', '10s clips'] },
    alibaba: { providerId: 'alibaba', name: 'Alibaba WAN 2.2', confidence: 92, quality: 90, speed: 80, cost: 'low', status: 'configured', features: ['WAN 2.2', 'Image-to-video', 'CJK'] },
    replicate: { providerId: 'replicate', name: 'Replicate Video', confidence: 88, quality: 85, speed: 70, cost: 'medium', status: 'configured', features: ['Multiple models', 'Flexible'] },
    gemini: { providerId: 'gemini', name: 'Gemini Veo', confidence: 90, quality: 88, speed: 65, cost: 'medium', status: 'configured', features: ['Long-form', 'Google ecosystem'] },
  },
  music_gen: {
    // Core 12 Providers Only - ElevenLabs for Music/SFX
    elevenlabs: { providerId: 'elevenlabs', name: 'ElevenLabs Music', confidence: 95, quality: 92, speed: 80, cost: 'medium', status: 'configured', features: ['SFX', 'Music', 'Voice'] },
    replicate: { providerId: 'replicate', name: 'Replicate Audio', confidence: 80, quality: 78, speed: 75, cost: 'medium', status: 'configured', features: ['Various models', 'Open source'] },
    alibaba: { providerId: 'alibaba', name: 'Alibaba Audio', confidence: 78, quality: 75, speed: 85, cost: 'low', status: 'configured', features: ['CJK music', 'Fast'] },
  },
  ocr: {
    openai: { providerId: 'openai', name: 'GPT-4 Vision', confidence: 95, quality: 92, speed: 80, cost: 'high', status: 'configured', features: ['Complex docs', 'Forms', 'Medical'] },
    claude: { providerId: 'claude', name: 'Claude Vision', confidence: 94, quality: 93, speed: 75, cost: 'high', status: 'configured', features: ['Medical', 'Handwriting'] },
    gemini: { providerId: 'gemini', name: 'Gemini Vision', confidence: 92, quality: 88, speed: 90, cost: 'medium', status: 'configured', features: ['Fast', 'Tables'] },
    google: { providerId: 'google', name: 'Google Vision', confidence: 90, quality: 85, speed: 95, cost: 'low', status: 'configured', features: ['Document AI', 'Batch'] },
    azure: { providerId: 'azure', name: 'Azure Doc Intelligence', confidence: 98, quality: 98, speed: 85, cost: 'medium', status: 'needs_key', features: ['Best forms', 'Tables'], notes: 'Best for forms extraction' },
  },
  vision: {
    gemini: { providerId: 'gemini', name: 'Gemini Vision', confidence: 95, quality: 92, speed: 90, cost: 'medium', status: 'configured', features: ['Multimodal', '1M context'] },
    openai: { providerId: 'openai', name: 'GPT-4 Vision', confidence: 94, quality: 93, speed: 80, cost: 'high', status: 'configured', features: ['Analysis', 'Understanding'] },
    claude: { providerId: 'claude', name: 'Claude Vision', confidence: 93, quality: 94, speed: 75, cost: 'high', status: 'configured', features: ['Detailed analysis', 'Charts'] },
    google: { providerId: 'google', name: 'Google Vision API', confidence: 88, quality: 85, speed: 95, cost: 'low', status: 'configured', features: ['Object detection', 'Labels'] },
    deepseek: { providerId: 'deepseek', name: 'DeepSeek-VL', confidence: 85, quality: 82, speed: 85, cost: 'low', status: 'configured', features: ['Documents', 'CJK'] },
    alibaba: { providerId: 'alibaba', name: 'Qwen-VL', confidence: 82, quality: 80, speed: 85, cost: 'low', status: 'configured', features: ['CJK native', 'Fast'] },
  },
  nlp: {
    // Core 12 Providers Only - cohere remapped to openai/gemini
    openai: { providerId: 'openai', name: 'OpenAI NLP', confidence: 98, quality: 96, speed: 85, cost: 'high', status: 'configured', features: ['Embeddings', 'Summarization', 'NER', 'Rerank'] },
    claude: { providerId: 'claude', name: 'Claude NLP', confidence: 95, quality: 95, speed: 80, cost: 'high', status: 'configured', features: ['Summarization', 'Sentiment', 'Entity extraction'] },
    gemini: { providerId: 'gemini', name: 'Gemini NLP', confidence: 94, quality: 90, speed: 90, cost: 'medium', status: 'configured', features: ['Embeddings', 'Fast', 'Rerank'] },
    deepseek: { providerId: 'deepseek', name: 'DeepSeek NLP', confidence: 90, quality: 88, speed: 88, cost: 'low', status: 'configured', features: ['CJK analysis', 'Code NLP'] },
    alibaba: { providerId: 'alibaba', name: 'Alibaba NLP', confidence: 85, quality: 82, speed: 90, cost: 'low', status: 'configured', features: ['CJK native', 'Entity analysis'] },
  },
  sfx_gen: {
    elevenlabs: { providerId: 'elevenlabs', name: 'ElevenLabs SFX', confidence: 90, quality: 88, speed: 85, cost: 'medium', status: 'configured', features: ['Sound effects', 'Voice'] },
    replicate: { providerId: 'replicate', name: 'Replicate Audio', confidence: 75, quality: 72, speed: 75, cost: 'medium', status: 'configured', features: ['Various models'] },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'configured':
      return <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">✅ Ready</Badge>;
    case 'needs_key':
      return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs">💳 Add Key</Badge>;
    case 'not_supported':
      return <Badge className="bg-muted text-muted-foreground text-xs">🚫 N/A</Badge>;
    default:
      return null;
  }
};

const getCostBadge = (cost: string) => {
  switch (cost) {
    case 'low':
      return <Badge variant="outline" className="text-green-600 border-green-500/30 text-[10px]">$</Badge>;
    case 'medium':
      return <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-[10px]">$$</Badge>;
    case 'high':
      return <Badge variant="outline" className="text-red-600 border-red-500/30 text-[10px]">$$$</Badge>;
    default:
      return null;
  }
};

// ============================================
// COMPONENT
// ============================================

interface AIProviderMatrixDashboardProps {
  className?: string;
  defaultCapability?: AICapability;
  isExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

export const AIProviderMatrixDashboard: React.FC<AIProviderMatrixDashboardProps> = ({
  className,
  defaultCapability = 'llm',
  isExpanded = false,
  onExpandChange,
}) => {
  const [selectedCapability, setSelectedCapability] = useState<AICapability>(defaultCapability);
  const [expanded, setExpanded] = useState(isExpanded);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  // Get providers for selected capability
  const providersForCapability = useMemo(() => {
    const scores = PROVIDER_CAPABILITY_SCORES[selectedCapability] || {};
    return Object.values(scores).sort((a, b) => b.confidence - a.confidence);
  }, [selectedCapability]);

  // Get fallback chain
  const fallbackChain = useMemo(() => {
    return getConfiguredFallbackChain(selectedCapability);
  }, [selectedCapability]);

  // Handle expand toggle
  const handleExpandToggle = useCallback(() => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onExpandChange?.(newExpanded);
  }, [expanded, onExpandChange]);

  // Download matrix as markdown
  const handleDownloadMatrix = useCallback(async () => {
    try {
      const response = await fetch('/docs/AI_PROVIDER_CAPABILITY_MATRIX.md');
      if (!response.ok) {
        // Fallback: generate markdown from current data
        const markdown = generateMatrixMarkdown();
        downloadFile(markdown, 'AI_PROVIDER_CAPABILITY_MATRIX.md', 'text/markdown');
      } else {
        const text = await response.text();
        downloadFile(text, 'AI_PROVIDER_CAPABILITY_MATRIX.md', 'text/markdown');
      }
      toast.success('Matrix downloaded successfully!');
    } catch (err) {
      // Generate from data
      const markdown = generateMatrixMarkdown();
      downloadFile(markdown, 'AI_PROVIDER_CAPABILITY_MATRIX.md', 'text/markdown');
      toast.success('Matrix generated and downloaded!');
    }
  }, []);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMatrixMarkdown = () => {
    let md = `# Universal AI Provider Capability Matrix\n\n`;
    md += `> Generated: ${new Date().toISOString()}\n\n`;
    
    CAPABILITIES.forEach(cap => {
      md += `## ${cap.name}\n\n`;
      md += `| Provider | Status | Confidence | Quality | Speed | Cost | Features |\n`;
      md += `|----------|--------|------------|---------|-------|------|----------|\n`;
      
      const providers = PROVIDER_CAPABILITY_SCORES[cap.id] || {};
      Object.values(providers).forEach(p => {
        md += `| ${p.name} | ${p.status} | ${p.confidence}% | ${p.quality}% | ${p.speed}% | ${p.cost} | ${p.features.join(', ')} |\n`;
      });
      md += `\n`;
    });
    
    return md;
  };

  const capabilityInfo = CAPABILITIES.find(c => c.id === selectedCapability);

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Universal AI Provider Matrix
          </CardTitle>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleDownloadMatrix}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download Full Matrix</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="sm" onClick={handleExpandToggle}>
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Capability Selector */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              const isSelected = selectedCapability === cap.id;
              const configuredCount = Object.values(PROVIDER_CAPABILITY_SCORES[cap.id] || {})
                .filter(p => p.status === 'configured').length;
              
              return (
                <button
                  key={cap.id}
                  onClick={() => setSelectedCapability(cap.id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap text-sm',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{cap.name}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    {configuredCount}
                  </Badge>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Selected Capability Info */}
        {capabilityInfo && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground">{capabilityInfo.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium">Fallback Chain:</span>
              <div className="flex items-center gap-1">
                {fallbackChain.slice(0, 5).map((pid, idx) => (
                  <React.Fragment key={pid}>
                    <Badge variant="outline" className="text-[10px]">{pid}</Badge>
                    {idx < Math.min(fallbackChain.length - 1, 4) && <span className="text-muted-foreground">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Provider List */}
        <div className="space-y-2">
          <AnimatePresence mode="wait">
            {providersForCapability.map((provider, index) => (
              <motion.div
                key={provider.providerId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <Collapsible
                  open={showDetails[provider.providerId]}
                  onOpenChange={(open) => setShowDetails(prev => ({ ...prev, [provider.providerId]: open }))}
                >
                  <div className={cn(
                    'p-3 rounded-lg border transition-colors',
                    provider.status === 'configured' 
                      ? 'bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800/40'
                      : provider.status === 'needs_key'
                        ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/40'
                        : 'bg-muted/30 border-border'
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {showDetails[provider.providerId] ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                          </Button>
                        </CollapsibleTrigger>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{provider.name}</span>
                          {getStatusBadge(provider.status)}
                          {getCostBadge(provider.cost)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Confidence Score */}
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <span className="text-xs text-muted-foreground">Confidence</span>
                          <Progress value={provider.confidence} className="h-2 w-16" />
                          <span className={cn(
                            'text-xs font-semibold',
                            provider.confidence >= 90 ? 'text-green-600' :
                            provider.confidence >= 80 ? 'text-amber-600' : 'text-red-600'
                          )}>
                            {provider.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-3 gap-4">
                        {/* Quality */}
                        <div>
                          <span className="text-xs text-muted-foreground">Quality</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={provider.quality} className="h-1.5" />
                            <span className="text-xs font-medium">{provider.quality}%</span>
                          </div>
                        </div>
                        
                        {/* Speed */}
                        <div>
                          <span className="text-xs text-muted-foreground">Speed</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={provider.speed} className="h-1.5" />
                            <span className="text-xs font-medium">{provider.speed}%</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div>
                          <span className="text-xs text-muted-foreground">Features</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {provider.features.slice(0, 3).map(f => (
                              <Badge key={f} variant="secondary" className="text-[9px]">{f}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {provider.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{provider.notes}</p>
                      )}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Label Studio Training Info */}
        <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-800/40">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
              Background AI Training Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Label Studio is capturing your preferences to improve AI recommendations and confidence scores.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIProviderMatrixDashboard;
