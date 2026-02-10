/**
 * ScriptPreviewPanel - TTS Script Preview with Audio Playback
 * 
 * Workflow: Approved Messaging → Script Generation → TTS Preview → Edit → Approve → Video Assembly
 * 
 * Features:
 * - Auto-compose scripts from approved messaging (hooks, CTAs, benefits, pain points)
 * - Manual script override/editing
 * - TTS audio preview with regional provider routing
 * - Chapter-by-chapter script view
 * - Approval workflow before video stitching
 */

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Edit3, 
  Check, 
  X, 
  RefreshCw, 
  Wand2,
  FileText,
  Mic,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Copy,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GENIE_PRODUCTS, type GenieProductId } from '@/services/marketing/productVersionTrackingService';
import { useRegionalDetection } from '@/hooks/useRegionalDetection';

// Chapter structure for video scripts
interface ChapterScript {
  id: string;
  chapterId: string;
  chapterName: string;
  productId?: GenieProductId;
  scriptText: string;
  editedText?: string;
  isEditing: boolean;
  ttsAudioUrl?: string;
  ttsStatus: 'pending' | 'generating' | 'ready' | 'error';
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';
  durationEstimate: number; // seconds
  sourceType: 'messaging' | 'custom' | 'template';
}

// Product script bundle
interface ProductScript {
  productId: GenieProductId;
  language: string;
  chapters: ChapterScript[];
  overallStatus: 'draft' | 'pending' | 'approved';
  totalDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

// TTS Provider options based on regional routing
const TTS_PROVIDERS = {
  'elevenlabs': { name: 'ElevenLabs', region: 'western', quality: 'premium' },
  'azure': { name: 'Azure Neural', region: 'global', quality: 'high' },
  'google': { name: 'Google TTS', region: 'global', quality: 'standard' },
  'alibaba': { name: 'Qwen TTS (Singapore)', region: 'cjk', quality: 'premium' },
  'alibaba-qwen3-tts': { name: 'Qwen3-TTS (China)', region: 'china', quality: 'premium' },
} as const;

// Voice options per provider
const VOICE_OPTIONS = {
  'elevenlabs': [
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (UK Male)' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (US Female)' },
    { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel (US Male)' },
  ],
  'azure': [
    { id: 'en-US-JennyNeural', name: 'Jenny (US Female)' },
    { id: 'en-US-GuyNeural', name: 'Guy (US Male)' },
    { id: 'en-GB-SoniaNeural', name: 'Sonia (UK Female)' },
  ],
  'google': [
    { id: 'en-US-Neural2-D', name: 'David (US Male)' },
    { id: 'en-US-Neural2-C', name: 'Claire (US Female)' },
  ],
  'alibaba': [
    { id: 'longxiaochun', name: 'Xiaochun (Chinese Female)' },
    { id: 'longxiaoxia', name: 'Xiaoxia (Chinese Female)' },
    { id: 'longyue', name: 'Yue (Japanese Female)' },
    { id: 'longfei', name: 'Fei (Korean Female)' },
  ],
  'alibaba-qwen3-tts': [
    { id: 'qwen3-tts-flash', name: 'Qwen3-TTS Flash (CJK)' },
    { id: 'qwen3-tts-pro', name: 'Qwen3-TTS Pro (Premium)' },
  ],
};

// Default chapter templates
const DEFAULT_CHAPTERS = [
  { id: 'opening', name: 'Opening Hook', defaultDuration: 15 },
  { id: 'spark', name: 'Genie Spark', defaultDuration: 45 },
  { id: 'mind', name: 'Genie Mind', defaultDuration: 45 },
  { id: 'vibe', name: 'Genie Vibe', defaultDuration: 45 },
  { id: 'deck', name: 'Genie Deck', defaultDuration: 45 },
  { id: 'arc', name: 'Genie Arc', defaultDuration: 45 },
  { id: 'cast', name: 'Genie Cast', defaultDuration: 45 },
  { id: 'ask', name: 'Ask Genie', defaultDuration: 45 },
  { id: 'closing', name: 'Closing CTA', defaultDuration: 20 },
];

interface ScriptPreviewPanelProps {
  selectedProduct?: GenieProductId;
  approvedMessaging?: Record<string, any>;
  onScriptApproved?: (script: ProductScript) => void;
}

export function ScriptPreviewPanel({ 
  selectedProduct, 
  approvedMessaging,
  onScriptApproved 
}: ScriptPreviewPanelProps) {
  const { detectedRegion, selectedRegion } = useRegionalDetection();
  
  // State
  const [activeTab, setActiveTab] = useState<'generate' | 'preview' | 'approved'>('generate');
  const [scripts, setScripts] = useState<ProductScript[]>([]);
  const [currentScript, setCurrentScript] = useState<ProductScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playingChapter, setPlayingChapter] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<keyof typeof TTS_PROVIDERS>('elevenlabs');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS.elevenlabs[0].id);
  const [useApprovedMessaging, setUseApprovedMessaging] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get recommended TTS provider based on region
  const getRecommendedProvider = useCallback(() => {
    // Map region to zone
    const cjkRegions = ['zh', 'ja', 'ko'];
    const menaRegions = ['ar'];
    
    if (cjkRegions.includes(selectedRegion)) return 'alibaba';
    if (menaRegions.includes(selectedRegion)) return 'azure';
    return 'elevenlabs';
  }, [selectedRegion]);

  // Generate script from approved messaging
  const composeScriptFromMessaging = useCallback((productId: GenieProductId, messaging: any): string => {
    const product = GENIE_PRODUCTS[productId];
    if (!messaging) {
      return `Discover ${product.name} - ${product.tagline}. Transform your workflow with intelligent AI-powered tools.`;
    }

    const parts: string[] = [];
    
    // Opening hook
    if (messaging.hook) {
      parts.push(messaging.hook);
    }
    
    // Value proposition
    if (messaging.valueProposition) {
      parts.push(messaging.valueProposition);
    }
    
    // Pain points to benefits transition
    if (messaging.painPoints?.length && messaging.benefits?.length) {
      parts.push(`Stop struggling with ${messaging.painPoints[0]?.toLowerCase() || 'inefficient workflows'}.`);
      parts.push(`With ${product.name}, you'll ${messaging.benefits[0]?.toLowerCase() || 'achieve more in less time'}.`);
    }
    
    // Medium script if available
    if (messaging.mediumScript) {
      parts.push(messaging.mediumScript);
    } else if (messaging.shortScript) {
      parts.push(messaging.shortScript);
    }
    
    // Closing CTA
    if (messaging.cta) {
      parts.push(messaging.cta);
    }
    
    return parts.join(' ');
  }, []);

  // Generate scripts for all chapters
  const generateScripts = useCallback(async () => {
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }

    setIsGenerating(true);

    try {
      const chapters: ChapterScript[] = DEFAULT_CHAPTERS.map((chapter) => {
        let scriptText = '';
        let sourceType: 'messaging' | 'custom' | 'template' = 'template';

        // Map chapter to product for product-specific scripts
        const chapterProductMap: Record<string, GenieProductId> = {
          'spark': 'spark',
          'mind': 'mind',
          'vibe': 'vibe',
          'deck': 'deck',
          'arc': 'arc',
          'cast': 'cast',
          'ask': 'ask_genie',
        };

        const chapterProductId = chapterProductMap[chapter.id];

        if (chapter.id === 'opening') {
          // Opening hook from messaging
          if (useApprovedMessaging && approvedMessaging?.hook) {
            scriptText = `${approvedMessaging.hook} ${approvedMessaging.openingLine || 'Welcome to Genie Studio.'}`;
            sourceType = 'messaging';
          } else {
            scriptText = 'Stop struggling with content creation. What if AI could do it all? Welcome to Genie Studio - where your wish is our command.';
          }
        } else if (chapter.id === 'closing') {
          // Closing CTA from messaging
          if (useApprovedMessaging && approvedMessaging?.cta) {
            const differentiator = approvedMessaging.differentiators?.[0] || '';
            scriptText = `${differentiator} ${approvedMessaging.closingLine || ''} ${approvedMessaging.cta}`;
            sourceType = 'messaging';
          } else {
            scriptText = 'The only platform with 206 AI pipelines across 70+ languages. Your wish is our command. Try Genie Studio free today.';
          }
        } else if (chapterProductId) {
          // Product-specific chapter
          const productConfig = GENIE_PRODUCTS[chapterProductId];
          if (useApprovedMessaging && approvedMessaging) {
            scriptText = composeScriptFromMessaging(chapterProductId, approvedMessaging);
            sourceType = 'messaging';
          } else {
            scriptText = `${productConfig.name}: ${productConfig.tagline}. ${productConfig.name} transforms your ${productConfig.name.toLowerCase()} workflow with intelligent AI assistance.`;
          }
        }

        return {
          id: `${selectedProduct}-${chapter.id}-${Date.now()}`,
          chapterId: chapter.id,
          chapterName: chapter.name,
          productId: chapterProductMap[chapter.id] as GenieProductId | undefined,
          scriptText,
          isEditing: false,
          ttsStatus: 'pending' as const,
          approvalStatus: 'draft' as const,
          durationEstimate: chapter.defaultDuration,
          sourceType,
        };
      });

      const newScript: ProductScript = {
        productId: selectedProduct,
        language: selectedLanguage,
        chapters,
        overallStatus: 'draft',
        totalDuration: chapters.reduce((acc, ch) => acc + ch.durationEstimate, 0),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setCurrentScript(newScript);
      setActiveTab('preview');
      toast.success('Scripts generated from messaging!');
    } catch (error) {
      console.error('[ScriptPreview] Generation error:', error);
      toast.error('Failed to generate scripts');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedProduct, approvedMessaging, useApprovedMessaging, selectedLanguage, composeScriptFromMessaging]);

  // Generate TTS for a chapter
  const generateTTS = useCallback(async (chapterId: string) => {
    if (!currentScript) return;

    const chapter = currentScript.chapters.find(c => c.chapterId === chapterId);
    if (!chapter) return;

    // Update status to generating
    setCurrentScript(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: prev.chapters.map(c => 
          c.chapterId === chapterId ? { ...c, ttsStatus: 'generating' as const } : c
        ),
      };
    });

    try {
      const text = chapter.editedText || chapter.scriptText;
      
      // Call appropriate TTS edge function based on provider
      let response;
      if (selectedProvider === 'elevenlabs') {
        response = await supabase.functions.invoke('elevenlabs-tts', {
          body: { text, voiceId: selectedVoice },
        });
      } else if (selectedProvider === 'google') {
        response = await supabase.functions.invoke('google-tts', {
          body: { text, voice: selectedVoice },
        });
      } else if (selectedProvider === 'alibaba' || selectedProvider === 'alibaba-qwen3-tts') {
        // Route to ai-universal-processor for Alibaba TTS
        response = await supabase.functions.invoke('ai-universal-processor', {
          body: { 
            action: 'tts',
            provider: 'alibaba',
            text,
            voice: selectedVoice,
            language: selectedLanguage,
            region: selectedProvider === 'alibaba-qwen3-tts' ? 'china' : 'singapore',
          },
        });
      } else {
        // Fallback to multi-provider
        response = await supabase.functions.invoke('multi-provider-tts', {
          body: { 
            text, 
            provider: selectedProvider,
            voiceId: selectedVoice,
            language: selectedLanguage,
          },
        });
      }

      if (response.error) throw response.error;

      // Create audio URL from base64
      const audioContent = response.data?.audioContent || response.data?.audio;
      if (!audioContent) throw new Error('No audio content received');

      const audioUrl = `data:audio/mpeg;base64,${audioContent}`;

      setCurrentScript(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map(c => 
            c.chapterId === chapterId 
              ? { ...c, ttsStatus: 'ready' as const, ttsAudioUrl: audioUrl } 
              : c
          ),
        };
      });

      toast.success(`TTS generated for ${chapter.chapterName}`);
    } catch (error) {
      console.error('[ScriptPreview] TTS error:', error);
      setCurrentScript(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map(c => 
            c.chapterId === chapterId ? { ...c, ttsStatus: 'error' as const } : c
          ),
        };
      });
      toast.error(`TTS failed for ${chapter.chapterName}`);
    }
  }, [currentScript, selectedProvider, selectedVoice, selectedLanguage]);

  // Generate TTS for all chapters
  const generateAllTTS = useCallback(async () => {
    if (!currentScript) return;

    toast.info('Generating TTS for all chapters...');

    for (const chapter of currentScript.chapters) {
      await generateTTS(chapter.chapterId);
    }

    toast.success('All TTS audio generated!');
  }, [currentScript, generateTTS]);

  // Play/pause audio
  const togglePlayback = useCallback((chapterId: string, audioUrl?: string) => {
    if (!audioUrl) {
      toast.error('Generate TTS first');
      return;
    }

    if (playingChapter === chapterId) {
      audioRef.current?.pause();
      setPlayingChapter(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingChapter(null);
      setPlayingChapter(chapterId);
    }
  }, [playingChapter]);

  // Edit chapter script
  const toggleEdit = useCallback((chapterId: string) => {
    setCurrentScript(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: prev.chapters.map(c => 
          c.chapterId === chapterId 
            ? { ...c, isEditing: !c.isEditing, editedText: c.editedText || c.scriptText } 
            : c
        ),
      };
    });
  }, []);

  // Save edited script
  const saveEdit = useCallback((chapterId: string, newText: string) => {
    setCurrentScript(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: prev.chapters.map(c => 
          c.chapterId === chapterId 
            ? { ...c, isEditing: false, editedText: newText, sourceType: 'custom' as const, ttsStatus: 'pending' as const } 
            : c
        ),
        updatedAt: new Date(),
      };
    });
    toast.success('Script saved');
  }, []);

  // Approve chapter
  const approveChapter = useCallback((chapterId: string) => {
    setCurrentScript(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        chapters: prev.chapters.map(c => 
          c.chapterId === chapterId ? { ...c, approvalStatus: 'approved' as const } : c
        ),
      };
      // Check if all approved
      const allApproved = updated.chapters.every(c => c.approvalStatus === 'approved');
      return { ...updated, overallStatus: allApproved ? 'approved' : 'pending' };
    });
  }, []);

  // Approve all chapters
  const approveAll = useCallback(() => {
    if (!currentScript) return;

    // Check all have TTS
    const allHaveTTS = currentScript.chapters.every(c => c.ttsStatus === 'ready');
    if (!allHaveTTS) {
      toast.error('Generate TTS for all chapters before approving');
      return;
    }

    setCurrentScript(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: prev.chapters.map(c => ({ ...c, approvalStatus: 'approved' as const })),
        overallStatus: 'approved',
      };
    });

    if (onScriptApproved && currentScript) {
      const approved = {
        ...currentScript,
        chapters: currentScript.chapters.map(c => ({ ...c, approvalStatus: 'approved' as const })),
        overallStatus: 'approved' as const,
      };
      onScriptApproved(approved);
    }

    toast.success('All scripts approved! Ready for video assembly.');
    setActiveTab('approved');
  }, [currentScript, onScriptApproved]);

  // Copy script to clipboard
  const copyScript = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }, []);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Preview & Edit
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Approved
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Script Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Region Detection Banner */}
              {detectedRegion && (
                <div className="p-3 bg-accent/30 rounded-lg flex items-center gap-3">
                  <Badge variant="outline">{detectedRegion.toUpperCase()}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Recommended TTS: <strong>{TTS_PROVIDERS[getRecommendedProvider()].name}</strong>
                  </span>
                </div>
              )}

              {/* Messaging Source Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Use Approved Messaging</Label>
                  <p className="text-xs text-muted-foreground">
                    Auto-compose scripts from hooks, CTAs, and benefits
                  </p>
                </div>
                <Switch 
                  checked={useApprovedMessaging} 
                  onCheckedChange={setUseApprovedMessaging}
                />
              </div>

              {/* Language Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="ko">Korean</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>TTS Provider</Label>
                  <Select 
                    value={selectedProvider} 
                    onValueChange={(v) => {
                      setSelectedProvider(v as keyof typeof TTS_PROVIDERS);
                      setSelectedVoice(VOICE_OPTIONS[v as keyof typeof VOICE_OPTIONS]?.[0]?.id || '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TTS_PROVIDERS).map(([id, provider]) => (
                        <SelectItem key={id} value={id}>
                          {provider.name} ({provider.quality})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Voice Selection */}
              <div className="space-y-2">
                <Label>Voice</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_OPTIONS[selectedProvider]?.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generateScripts} 
                disabled={isGenerating || !selectedProduct}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Scripts...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate 9-Chapter Script
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview & Edit Tab */}
        <TabsContent value="preview" className="space-y-4">
          {currentScript ? (
            <>
              {/* Overview Stats */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        {currentScript.chapters.length} Chapters
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        ~{Math.round(currentScript.totalDuration / 60)}min
                      </Badge>
                      <Badge 
                        variant={currentScript.overallStatus === 'approved' ? 'default' : 'secondary'}
                      >
                        {currentScript.overallStatus}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={generateAllTTS}>
                        <Mic className="h-4 w-4 mr-2" />
                        Generate All TTS
                      </Button>
                      <Button size="sm" onClick={approveAll}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chapter List */}
              <ScrollArea className="h-[500px]">
                <div className="space-y-3 pr-4">
                  {currentScript.chapters.map((chapter, index) => (
                    <Card 
                      key={chapter.chapterId}
                      className={chapter.approvalStatus === 'approved' ? 'border-primary/30' : ''}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">#{index + 1}</span>
                            <h4 className="font-medium">{chapter.chapterName}</h4>
                            <Badge variant="outline" className="text-xs">
                              {chapter.sourceType}
                            </Badge>
                            {chapter.approvalStatus === 'approved' && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {/* TTS Status */}
                            {chapter.ttsStatus === 'ready' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => togglePlayback(chapter.chapterId, chapter.ttsAudioUrl)}
                              >
                                {playingChapter === chapter.chapterId ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            ) : chapter.ttsStatus === 'generating' ? (
                              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : chapter.ttsStatus === 'error' ? (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => generateTTS(chapter.chapterId)}
                              >
                                <Volume2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            )}

                            {/* Edit Toggle */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleEdit(chapter.chapterId)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>

                            {/* Copy */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyScript(chapter.editedText || chapter.scriptText)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            {/* Approve */}
                            {chapter.approvalStatus !== 'approved' && chapter.ttsStatus === 'ready' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => approveChapter(chapter.chapterId)}
                              >
                                <Check className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Script Text */}
                        {chapter.isEditing ? (
                          <div className="space-y-2">
                            <Textarea
                              value={chapter.editedText || chapter.scriptText}
                              onChange={(e) => {
                                const newText = e.target.value;
                                setCurrentScript(prev => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    chapters: prev.chapters.map(c =>
                                      c.chapterId === chapter.chapterId
                                        ? { ...c, editedText: newText }
                                        : c
                                    ),
                                  };
                                });
                              }}
                              rows={4}
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(chapter.chapterId, chapter.editedText || chapter.scriptText)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleEdit(chapter.chapterId)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {chapter.editedText || chapter.scriptText}
                          </p>
                        )}

                        {/* Duration estimate */}
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          ~{chapter.durationEstimate}s
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scripts generated yet.</p>
                <p className="text-sm">Go to the Generate tab to create scripts.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-4">
          {currentScript?.overallStatus === 'approved' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Script Approved - Ready for Video Assembly
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-accent/30 rounded-lg text-center">
                      <div className="text-2xl font-bold">{currentScript.chapters.length}</div>
                      <div className="text-sm text-muted-foreground">Chapters</div>
                    </div>
                    <div className="p-4 bg-accent/30 rounded-lg text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(currentScript.totalDuration / 60)}m
                      </div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                    <div className="p-4 bg-accent/30 rounded-lg text-center">
                      <div className="text-2xl font-bold">{currentScript.language.toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground">Language</div>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Proceed to Video Assembly
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No approved scripts yet.</p>
                <p className="text-sm">Preview and approve scripts first.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ScriptPreviewPanel;
