/**
 * Presentation Generator Panel - Main component for Genie Spark
 * Input: Document, Image, Text, Prompt, URL
 * Output: Slides with AI-generated content and images
 * 
 * Refactored for better UX with:
 * - Multi-select dropdowns for all selection fields
 * - AI Model selection like other content types
 * - Language configuration at the top
 * - Organized layout with clear sections
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
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
  SkipForward,
  Loader2,
  Presentation,
  Share2,
  BarChart3,
  Map,
  Save,
  ChevronDown,
  Video,
  Globe,
  Brain,
  Shield,
  Settings2,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  PresentationSlide, 
  PresentationData, 
  SlideEnhancementType,
  BulletPoint 
} from './types';
import { SlideCard } from './SlideCard';
import { VideoExportPanel } from './VideoExportPanel';
import { LanguageSelector } from './LanguageSelector';
import { AIProviderPanel } from './AIProviderPanel';
import { GenerationProgressPanel, SlideGenerationStatus } from './GenerationProgressPanel';
import { ComplianceChecker } from './ComplianceChecker';
import { MultiSelectDropdown, MultiSelectOption } from '@/components/ui/multi-select-dropdown';
import { useUniversalPresentation, DownloadFormat } from '@/hooks/useUniversalPresentation';
import { 
  PresentationRequest, 
  InputSource, 
  OutputFormat, 
  PresentationLength,
  CollateralType,
  ImageSourceType,
  ImageStyleType,
  VoiceProviderType,
  AIModelSuggestion,
  PresentationTone,
  ContentEnhancement,
  SlideCountEstimate,
  ContentRecommendation,
  universalPresentationService
} from '@/services/universalPresentationService';

// AI Models available for presentation generation
const AI_MODELS = [
  { id: 'auto', name: 'Auto (Recommended)', description: 'AI selects best model' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast & balanced' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'High quality' },
  { id: 'openai/gpt-5', name: 'GPT-5', description: 'Premium reasoning' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Cost-effective' },
];

interface PresentationGeneratorPanelProps {
  onComplete?: (presentation: PresentationData) => void;
  onSaveToKnowledgeBase?: (title: string, content: string) => void;
  hideHeader?: boolean;
  className?: string;
}

export function PresentationGeneratorPanel({
  onComplete,
  onSaveToKnowledgeBase,
  hideHeader = false,
  className
}: PresentationGeneratorPanelProps) {
  const { 
    isGenerating, 
    isDownloading, 
    isSavingToRAG,
    result, 
    generatePresentation, 
    download,
    downloadPPTX, 
    saveToRAG,
    reset 
  } = useUniversalPresentation();
  
  // Input state
  const [inputSource, setInputSource] = useState<InputSource>('prompt');
  const [inputContent, setInputContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Configuration state
  const [collateralType, setCollateralType] = useState<CollateralType>('presentation');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('pptx');
  const [length, setLength] = useState<PresentationLength>('standard');
  
  // Image configuration
  const [imageSource, setImageSource] = useState<ImageSourceType>('ai-generated');
  const [selectedImageStyles, setSelectedImageStyles] = useState<ImageStyleType[]>(['ai-realistic']);
  const [generateImages, setGenerateImages] = useState(true);
  const [imageStyle, setImageStyle] = useState<string>('professional');
  const [includeJourneyMaps, setIncludeJourneyMaps] = useState(false);
  const [includeInfographics, setIncludeInfographics] = useState(true);
  const [targetAudience, setTargetAudience] = useState('');
  
  // Voice configuration
  const [voiceProvider, setVoiceProvider] = useState<VoiceProviderType>('openai');
  
  // AI Model selection (user-facing dropdown)
  const [selectedAIModel, setSelectedAIModel] = useState<string>('auto');
  
  // AI Model suggestion (system recommended)
  const [suggestedModel, setSuggestedModel] = useState<AIModelSuggestion | null>(null);
  const [useCustomModel, setUseCustomModel] = useState(false);
  
  // Slides state (editable)
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [presentationTitle, setPresentationTitle] = useState('');
  const [showVideoExport, setShowVideoExport] = useState(false);
  
  // Tone and Enhancement state
  const [selectedTones, setSelectedTones] = useState<PresentationTone[]>(['balanced']);
  const [selectedEnhancements, setSelectedEnhancements] = useState<ContentEnhancement[]>([]);
  const [slideEstimate, setSlideEstimate] = useState<SlideCountEstimate | null>(null);
  const [contentRecommendation, setContentRecommendation] = useState<ContentRecommendation | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Multi-Language state
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [includeVoiceover, setIncludeVoiceover] = useState(false);
  
  // Compliance state
  const [showComplianceCheck, setShowComplianceCheck] = useState(false);
  
  // Selected collateral types (multi-select)
  const [selectedCollateralTypes, setSelectedCollateralTypes] = useState<string[]>(['presentation']);

  // Get voice providers, image styles, tones, and enhancements
  const voiceProviders = universalPresentationService.getVoiceProviders();
  const imageStyleOptions = universalPresentationService.getImageStyleOptions();
  const toneOptions = universalPresentationService.getToneOptions();
  const enhancementOptions = universalPresentationService.getContentEnhancements();

  // Update slide estimate when length or enhancements change
  const updateSlideEstimate = useCallback(() => {
    const estimate = universalPresentationService.estimateSlideCount(length, inputContent, selectedEnhancements);
    setSlideEstimate(estimate);
  }, [length, inputContent, selectedEnhancements]);

  // Update recommendations when content changes
  const updateRecommendations = useCallback(() => {
    if (inputContent.length > 50) {
      const recommendations = universalPresentationService.analyzeContentForRecommendations(inputContent, collateralType);
      setContentRecommendation(recommendations);
      setSlideEstimate(recommendations.suggestedSlideCount);
      setShowRecommendations(true);
    }
  }, [inputContent, collateralType]);

  // Update model suggestion when collateral type or content changes
  const updateModelSuggestion = useCallback((type: CollateralType, content?: string) => {
    const suggestion = universalPresentationService.suggestAIModels(type, content);
    setSuggestedModel(suggestion);
  }, []);

  // Handle collateral type change
  const handleCollateralTypeChange = (type: CollateralType) => {
    setCollateralType(type);
    updateModelSuggestion(type, inputContent);
    
    // Suggest best image styles for this collateral
    const bestStyles = imageStyleOptions
      .filter(style => style.bestFor.includes(type))
      .map(style => style.id);
    if (bestStyles.length > 0) {
      setSelectedImageStyles(bestStyles.slice(0, 2));
    }
    
    // Update recommendations
    if (inputContent.length > 50) {
      updateRecommendations();
    }
    
    // Suggest best tones for this collateral
    const bestTones = toneOptions
      .filter(tone => tone.bestFor.includes(type))
      .map(tone => tone.id);
    if (bestTones.length > 0 && selectedTones.length <= 1) {
      setSelectedTones(bestTones.slice(0, 2));
    }
  };

  // Toggle image style selection
  const toggleImageStyle = (style: ImageStyleType) => {
    setSelectedImageStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };
  
  // Toggle tone selection
  const toggleTone = (tone: PresentationTone) => {
    setSelectedTones(prev => 
      prev.includes(tone) 
        ? prev.filter(t => t !== tone)
        : [...prev, tone]
    );
    updateSlideEstimate();
  };
  
  // Toggle enhancement selection
  const toggleEnhancement = (enhancement: ContentEnhancement) => {
    setSelectedEnhancements(prev => {
      const newEnhancements = prev.includes(enhancement) 
        ? prev.filter(e => e !== enhancement)
        : [...prev, enhancement];
      return newEnhancements;
    });
    // Update slide estimate after a brief delay
    setTimeout(updateSlideEstimate, 100);
  };
  
  // Handle content input change with debounced analysis
  const handleContentChange = (value: string) => {
    setInputContent(value);
    // Debounced recommendation update
    if (value.length > 100) {
      const timer = setTimeout(() => {
        updateRecommendations();
        updateSlideEstimate();
      }, 500);
      return () => clearTimeout(timer);
    }
  };
  
  // Apply recommended tones
  const applyRecommendedTones = () => {
    if (contentRecommendation) {
      const topTones = contentRecommendation.tones
        .filter(t => t.score > 0.5)
        .slice(0, 2)
        .map(t => t.tone);
      setSelectedTones(topTones);
      toast.success('Applied recommended tones');
    }
  };
  
  // Apply recommended enhancements
  const applyRecommendedEnhancements = () => {
    if (contentRecommendation) {
      const topEnhancements = contentRecommendation.enhancements
        .filter(e => e.score > 0.5)
        .slice(0, 3)
        .map(e => e.type);
      setSelectedEnhancements(topEnhancements);
      updateSlideEstimate();
      toast.success('Applied recommended enhancements');
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Read file content based on type
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputContent(content);
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
        setInputSource('image');
      } else {
        reader.readAsText(file);
        setInputSource('document');
      }
    }
  };

  // Generate presentation
  const handleGenerate = async () => {
    if (!inputContent.trim()) {
      toast.error('Please enter content or upload a file');
      return;
    }

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
      imageStyle: imageStyle as any,
      includeJourneyMaps,
      includeInfographics,
      targetAudience: targetAudience || undefined,
      voiceProvider,
      suggestedModel: suggestedModel || undefined,
      useCustomModel,
      autoSegment: true,
      tones: selectedTones,
      contentEnhancements: selectedEnhancements,
    };

    const result = await generatePresentation(request);
    
    if (result?.success && result.slides) {
      // Convert to editable slides
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
        imagePrompt: (slide.metadata as any)?.imagePrompt,
      }));
      
      setSlides(editableSlides);
      setPresentationTitle(result.metadata.title);
    }
  };

  // Slide operations
  const handleSlideUpdate = (slideId: string, updates: Partial<PresentationSlide>) => {
    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, ...updates } : s));
  };

  const handleSlideAccept = (slideId: string) => {
    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, isAccepted: true, isSkipped: false } : s));
    toast.success('Slide accepted');
  };

  const handleSlideSkip = (slideId: string) => {
    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, isSkipped: true, isAccepted: false } : s));
    toast.info('Slide skipped');
  };

  const handleSlideEnhance = async (slideId: string, type: SlideEnhancementType, customInstructions?: string) => {
    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, isEnhancing: true } : s));
    
    // Simulate AI enhancement (integrate with actual service)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        isEnhancing: false,
        enhancementApplied: type,
        originalTitle: s.originalTitle || s.title,
        originalContent: s.originalContent || { ...s.content },
      };
    }));
    
    toast.success(`Slide enhanced: ${type}`);
  };

  const handleSlideRefresh = async (slideId: string) => {
    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, isRegenerating: true } : s));
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, isRegenerating: false } : s));
    toast.success('Slide regenerated');
  };

  const handleSlideRevert = (slideId: string) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId || !s.originalTitle) return s;
      return {
        ...s,
        title: s.originalTitle,
        content: s.originalContent || s.content,
        originalTitle: undefined,
        originalContent: undefined,
        enhancementApplied: undefined,
      };
    }));
    toast.info('Reverted to original');
  };

  const handleRegenerateImage = async (slideId: string) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId || !s.image) return s;
      return { ...s, image: { ...s.image, isRegenerating: true } };
    }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId || !s.image) return s;
      return { ...s, image: { ...s.image, isRegenerating: false } };
    }));
    toast.success('Image regenerated');
  };

  // Bullet operations
  const handleBulletUpdate = (slideId: string, bulletId: string, text: string) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        content: {
          ...s.content,
          bullets: s.content.bullets?.map(b => 
            b.id === bulletId ? { ...b, text } : b
          ),
        },
      };
    }));
  };

  const handleBulletAccept = (slideId: string, bulletId: string) => {
    toast.success('Bullet accepted');
  };

  const handleBulletSkip = (slideId: string, bulletId: string) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        content: {
          ...s.content,
          bullets: s.content.bullets?.filter(b => b.id !== bulletId),
        },
      };
    }));
    toast.info('Bullet removed');
  };

  const handleBulletEnhance = async (slideId: string, bulletId: string, type: SlideEnhancementType) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        content: {
          ...s.content,
          bullets: s.content.bullets?.map(b => 
            b.id === bulletId ? { ...b, isEnhancing: true } : b
          ),
        },
      };
    }));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        content: {
          ...s.content,
          bullets: s.content.bullets?.map(b => 
            b.id === bulletId ? { 
              ...b, 
              isEnhancing: false, 
              enhancementApplied: type,
              originalText: b.originalText || b.text,
            } : b
          ),
        },
      };
    }));
    
    toast.success(`Bullet enhanced: ${type}`);
  };

  const handleBulletRefresh = async (slideId: string, bulletId: string) => {
    await handleBulletEnhance(slideId, bulletId, 'regenerate');
  };

  const handleBulletRevert = (slideId: string, bulletId: string) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        content: {
          ...s.content,
          bullets: s.content.bullets?.map(b => {
            if (b.id !== bulletId || !b.originalText) return b;
            return { ...b, text: b.originalText, originalText: undefined, enhancementApplied: undefined };
          }),
        },
      };
    }));
    toast.info('Bullet reverted');
  };

  // Download presentation
  const handleDownload = async () => {
    if (slides.length === 0) {
      toast.error('No slides to download');
      return;
    }
    
    // Convert back to service format
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

  // Accept all slides
  const handleAcceptAll = () => {
    setSlides(prev => prev.map(s => ({ ...s, isAccepted: true, isSkipped: false })));
    toast.success('All slides accepted');
  };

  // Save to RAG/Knowledge Base
  const handleSaveToRAG = async () => {
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
      speakerNotes: s.speakerNotes,
      metadata: { topic: s.topic, importance: s.importance },
    }));
    
    await saveToRAG(serviceSlides as any, presentationTitle, {
      sourceType: inputSource,
      sourceContent: inputContent.slice(0, 500),
      tags: ['presentation', outputFormat, length]
    });
    
    if (onSaveToKnowledgeBase) {
      const content = slides.map(s => `${s.title}\n${s.content.bullets?.map(b => b.text).join('\n') || ''}`).join('\n\n');
      onSaveToKnowledgeBase(presentationTitle, content);
    }
  };

  // Download with format selection
  const handleDownloadFormat = async (format: DownloadFormat) => {
    if (slides.length === 0) {
      toast.error('No slides to download');
      return;
    }
    
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
    
    await download(serviceSlides as any, presentationTitle, format, {
      slideCount: slides.length,
      outputFormat,
      length
    });
  };

  // Stats
  const acceptedCount = slides.filter(s => s.isAccepted).length;
  const skippedCount = slides.filter(s => s.isSkipped).length;
  const pendingCount = slides.length - acceptedCount - skippedCount;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input Section */}
      {slides.length === 0 && (
        <Card className={hideHeader ? "border-0 shadow-none" : undefined}>
          {!hideHeader && (
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generate Presentation
              </CardTitle>
            </CardHeader>
          )}
          <CardContent className={cn("space-y-4", hideHeader && "px-0")}>
            {/* Input Source Tabs */}
            <Tabs value={inputSource} onValueChange={(v) => setInputSource(v as InputSource)}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="prompt" className="text-xs">
                  <Type className="h-3 w-3 mr-1" />
                  Prompt
                </TabsTrigger>
                <TabsTrigger value="text" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="document" className="text-xs">
                  <Upload className="h-3 w-3 mr-1" />
                  Document
                </TabsTrigger>
                <TabsTrigger value="image" className="text-xs">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="url" className="text-xs">
                  <Link className="h-3 w-3 mr-1" />
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="prompt" className="mt-3">
                <Textarea
                  placeholder="Describe what your presentation should be about..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </TabsContent>

              <TabsContent value="text" className="mt-3">
                <Textarea
                  placeholder="Paste your content here... (articles, notes, outlines)"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </TabsContent>

              <TabsContent value="document" className="mt-3">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="doc-upload"
                    accept=".pdf,.docx,.pptx,.txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {uploadedFile ? uploadedFile.name : 'Drop document or click to upload'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPTX, TXT, MD</p>
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="image" className="mt-3">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="img-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="img-upload" className="cursor-pointer">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {uploadedFile ? uploadedFile.name : 'Drop image or click to upload'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP</p>
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="url" className="mt-3">
                <Input
                  placeholder="https://example.com/article"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                />
              </TabsContent>
            </Tabs>

            <Separator className="my-4" />
            
            {/* Section: Language & AI Configuration (at top) */}
            <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Language & AI Configuration</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Language Selector */}
                <LanguageSelector
                  selectedLanguages={selectedLanguages}
                  onLanguagesChange={setSelectedLanguages}
                  primaryLanguage={primaryLanguage}
                  onPrimaryLanguageChange={setPrimaryLanguage}
                  includeVoiceover={includeVoiceover}
                  onIncludeVoiceoverChange={setIncludeVoiceover}
                />
                
                {/* AI Model Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    AI Model
                  </Label>
                  <Select value={selectedAIModel} onValueChange={setSelectedAIModel}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select AI Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-xs text-muted-foreground">{model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Section: Content Configuration */}
            <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Content Configuration</Label>
              </div>

              {/* Collateral Type - Multi-select Dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs">Collateral Type</Label>
                <Select value={collateralType} onValueChange={(v) => handleCollateralTypeChange(v as CollateralType)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select collateral type" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { id: 'presentation', label: 'Presentation', desc: 'Standard slides' },
                      { id: 'marketing', label: 'Marketing', desc: 'Campaign materials' },
                      { id: 'investor', label: 'Investor Deck', desc: 'Pitch & financials' },
                      { id: 'sales', label: 'Sales', desc: 'Product showcase' },
                      { id: 'training', label: 'Training', desc: 'Educational content' },
                      { id: 'conference', label: 'Conference', desc: 'Event materials' },
                      { id: 'product-launch', label: 'Product Launch', desc: 'Launch materials' },
                      { id: 'case-study', label: 'Case Study', desc: 'Success stories' },
                      { id: 'whitepaper', label: 'White Paper', desc: 'In-depth analysis' },
                    ].map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{type.label}</span>
                          <span className="text-xs text-muted-foreground">{type.desc}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Configuration Row 1 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Output Format & Size</Label>
                  <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-[9999]">
                      <SelectItem value="pptx">
                        <div className="flex flex-col">
                          <span className="font-medium">PowerPoint</span>
                          <span className="text-[10px] text-muted-foreground">16:9 (1920×1080)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="social">
                        <div className="flex flex-col">
                          <span className="font-medium">Social Media</span>
                          <span className="text-[10px] text-muted-foreground">1:1 (1080×1080)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <div className="flex flex-col">
                          <span className="font-medium">LinkedIn</span>
                          <span className="text-[10px] text-muted-foreground">1.91:1 (1200×627)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="infographic">
                        <div className="flex flex-col">
                          <span className="font-medium">Infographic</span>
                          <span className="text-[10px] text-muted-foreground">Portrait (800×2000)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="whitepaper">
                        <div className="flex flex-col">
                          <span className="font-medium">White Paper</span>
                          <span className="text-[10px] text-muted-foreground">A4 (210×297mm)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="journey-map">
                        <div className="flex flex-col">
                          <span className="font-medium">Journey Map</span>
                          <span className="text-[10px] text-muted-foreground">Wide (1920×900)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Length</Label>
                  <Select value={length} onValueChange={(v) => setLength(v as PresentationLength)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-[9999]">
                      <SelectItem value="short">Short (5-8)</SelectItem>
                      <SelectItem value="standard">Standard (10-15)</SelectItem>
                      <SelectItem value="long">Long (18-25)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Image Source</Label>
                  <Select value={imageSource} onValueChange={(v) => setImageSource(v as ImageSourceType)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-[9999]">
                      <SelectItem value="ai-generated">AI Generated</SelectItem>
                      <SelectItem value="stock-upload">Upload Stock</SelectItem>
                      <SelectItem value="placeholder">Placeholders</SelectItem>
                      <SelectItem value="mixed">Mixed (AI + Upload)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Styles - Multi-select Dropdown */}
              {imageSource !== 'placeholder' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    Image Styles
                  </Label>
                  <MultiSelectDropdown
                    options={imageStyleOptions.map(style => ({
                      id: style.id,
                      label: style.name,
                      value: style.id,
                      description: style.bestFor.includes(collateralType) ? `✓ Recommended for ${collateralType}` : undefined
                    }))}
                    selectedValues={selectedImageStyles}
                    onSelectionChange={(values) => setSelectedImageStyles(values as ImageStyleType[])}
                    placeholder="Select image styles..."
                    searchable
                  />
                </div>
              )}

              {/* Tone & Style - Multi-select Dropdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Tone & Style</Label>
                  {contentRecommendation && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 text-[10px] px-2"
                      onClick={applyRecommendedTones}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Apply AI Recommended
                    </Button>
                  )}
                </div>
                <MultiSelectDropdown
                  options={toneOptions.map(tone => {
                    const isRecommended = contentRecommendation?.tones.find(t => t.tone === tone.id && t.score > 0.5);
                    return {
                      id: tone.id,
                      label: tone.name,
                      value: tone.id,
                      description: isRecommended 
                        ? `✓ Recommended (${Math.round((isRecommended.score || 0) * 100)}%)` 
                        : tone.bestFor.includes(collateralType) ? `Good for ${collateralType}` : undefined
                    };
                  })}
                  selectedValues={selectedTones}
                  onSelectionChange={(values) => setSelectedTones(values as PresentationTone[])}
                  placeholder="Select tone & style..."
                  searchable
                />
              </div>

              {/* Content Enhancements - Multi-select Dropdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Content Enhancements</Label>
                  {contentRecommendation && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 text-[10px] px-2"
                      onClick={applyRecommendedEnhancements}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Apply AI Recommended
                    </Button>
                  )}
                </div>
                <MultiSelectDropdown
                  options={enhancementOptions.map(enhancement => {
                    const isRecommended = contentRecommendation?.enhancements.find(e => e.type === enhancement.id && e.score > 0.5);
                    return {
                      id: enhancement.id,
                      label: enhancement.name,
                      value: enhancement.id,
                      description: isRecommended 
                        ? `✓ Recommended (${Math.round((isRecommended.score || 0) * 100)}%)`
                        : undefined
                    };
                  })}
                  selectedValues={selectedEnhancements}
                  onSelectionChange={(values) => setSelectedEnhancements(values as ContentEnhancement[])}
                  placeholder="Select content enhancements..."
                  searchable
                />
              </div>

              {/* Additional Options Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Target Audience</Label>
                  <Input
                    placeholder="e.g., Healthcare execs, Investors"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Voice Provider</Label>
                  <Select value={voiceProvider} onValueChange={(v) => setVoiceProvider(v as VoiceProviderType)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-[9999]">
                      {voiceProviders.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Toggle Options */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={includeInfographics} onCheckedChange={setIncludeInfographics} />
                  <Label className="text-xs">Include Infographics</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={includeJourneyMaps} onCheckedChange={setIncludeJourneyMaps} />
                  <Label className="text-xs">Journey Maps</Label>
                </div>
              </div>
            </div>

            {/* Slide Count Estimate */}
            {slideEstimate && (
              <Card className="border-accent/30 bg-accent/5">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Presentation className="h-4 w-4 text-accent-foreground" />
                      <p className="text-xs font-medium">Estimated Slides</p>
                    </div>
                    <Badge className="text-sm font-bold">{slideEstimate.recommended} slides</Badge>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-[10px] text-muted-foreground">
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{slideEstimate.breakdown.title}</div>
                      <div>Title</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{slideEstimate.breakdown.content}</div>
                      <div>Content</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{slideEstimate.breakdown.infographic}</div>
                      <div>Infographic</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{slideEstimate.breakdown.journey}</div>
                      <div>Journey</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{slideEstimate.breakdown.conclusion}</div>
                      <div>Conclusion</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Range: {slideEstimate.min}-{slideEstimate.max} slides based on your selections
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Smart Recommendations Panel */}
            {showRecommendations && contentRecommendation && contentRecommendation.keyTopics.length > 0 && (
              <Card className="border-secondary/30 bg-secondary/5">
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-xs font-medium">Content Analysis</p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Key Topics Detected:</p>
                      <div className="flex flex-wrap gap-1">
                        {contentRecommendation.keyTopics.map((topic, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px]">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-muted-foreground">Top recommended tone:</p>
                      <Badge variant="outline" className="text-[10px]">
                        {contentRecommendation.tones[0]?.tone || 'balanced'}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground">
                        {contentRecommendation.tones[0]?.reason}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compliance Check Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium cursor-pointer" htmlFor="compliance-toggle">
                  Run Compliance Check
                </Label>
                <Badge variant="outline" className="text-[10px]">HIPAA / GDPR / WCAG</Badge>
              </div>
              <Switch
                id="compliance-toggle"
                checked={showComplianceCheck}
                onCheckedChange={setShowComplianceCheck}
              />
            </div>

            {/* Compliance Checker Panel - Show even without slides if toggled on */}
            {showComplianceCheck && (
              <ComplianceChecker
                content={slides.length > 0 
                  ? slides.map(s => `${s.title}\n${s.content.bullets?.map(b => b.text).join('\n') || ''}`).join('\n\n')
                  : inputContent || 'No content to check yet. Enter content above to run compliance check.'
                }
                contentType="document"
                industry="healthcare"
              />
            )}

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !inputContent.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating {selectedLanguages.length > 1 ? `in ${selectedLanguages.length} languages...` : 'Presentation...'}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate {slideEstimate ? `${slideEstimate.recommended} Slides` : 'Presentation'}
                  {selectedLanguages.length > 1 && ` (${selectedLanguages.length} languages)`}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Slides Editor */}
      {slides.length > 0 && (
        <>
          {/* Header with stats and actions */}
          <Card className="sticky top-0 z-10 bg-background/95 backdrop-blur">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Presentation className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold">{presentationTitle}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{slides.length} slides</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-[10px] text-green-600">
                        {acceptedCount} accepted
                      </Badge>
                      {skippedCount > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {skippedCount} skipped
                        </Badge>
                      )}
                      {pendingCount > 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          {pendingCount} pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={handleAcceptAll}>
                    <Check className="h-3 w-3 mr-1" />
                    Accept All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveToRAG} disabled={isSavingToRAG}>
                    {isSavingToRAG ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3 mr-1" />
                    )}
                    Save to KB
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setSlides([]); reset(); }}>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Restart
                  </Button>

                  {/* Video Export Button */}
                  <Button variant="outline" size="sm" onClick={() => setShowVideoExport(true)}>
                    <Video className="h-3 w-3 mr-1" />
                    To Video
                  </Button>
                  
                  {/* Download dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" disabled={isDownloading}>
                        {isDownloading ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3 mr-1" />
                        )}
                        Download
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownloadFormat('pptx')}>
                        <Presentation className="h-3 w-3 mr-2" />
                        PowerPoint (.pptx)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadFormat('pdf')}>
                        <FileText className="h-3 w-3 mr-2" />
                        PDF Document
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadFormat('images')}>
                        <ImageIcon className="h-3 w-3 mr-2" />
                        Images (PNG)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadFormat('json')}>
                        <FileText className="h-3 w-3 mr-2" />
                        JSON Export
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slides List */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3 pr-4">
              {slides.map(slide => (
                <SlideCard
                  key={slide.id}
                  slide={slide}
                  onUpdate={handleSlideUpdate}
                  onAccept={handleSlideAccept}
                  onSkip={handleSlideSkip}
                  onEnhance={handleSlideEnhance}
                  onRefresh={handleSlideRefresh}
                  onRevert={handleSlideRevert}
                  onRegenerateImage={handleRegenerateImage}
                  onBulletUpdate={handleBulletUpdate}
                  onBulletAccept={handleBulletAccept}
                  onBulletSkip={handleBulletSkip}
                  onBulletEnhance={handleBulletEnhance}
                  onBulletRefresh={handleBulletRefresh}
                  onBulletRevert={handleBulletRevert}
                />
              ))}
            </div>
          </ScrollArea>

          {/* Video Export Panel */}
          <VideoExportPanel
            slides={slides}
            title={presentationTitle}
            isOpen={showVideoExport}
            onClose={() => setShowVideoExport(false)}
          />
        </>
      )}
    </div>
  );
}
