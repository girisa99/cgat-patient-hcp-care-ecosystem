/**
 * Presentation Generator Panel - Main component for Genie Spark
 * Input: Document, Image, Text, Prompt, URL
 * Output: Slides with AI-generated content and images
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
  Video
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
  universalPresentationService
} from '@/services/universalPresentationService';

interface PresentationGeneratorPanelProps {
  onComplete?: (presentation: PresentationData) => void;
  onSaveToKnowledgeBase?: (title: string, content: string) => void;
  className?: string;
}

export function PresentationGeneratorPanel({
  onComplete,
  onSaveToKnowledgeBase,
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
  
  // AI Model suggestion
  const [suggestedModel, setSuggestedModel] = useState<AIModelSuggestion | null>(null);
  const [useCustomModel, setUseCustomModel] = useState(false);
  
  // Slides state (editable)
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [presentationTitle, setPresentationTitle] = useState('');
  const [showVideoExport, setShowVideoExport] = useState(false);

  // Get voice providers and image styles
  const voiceProviders = universalPresentationService.getVoiceProviders();
  const imageStyleOptions = universalPresentationService.getImageStyleOptions();

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
  };

  // Toggle image style selection
  const toggleImageStyle = (style: ImageStyleType) => {
    setSelectedImageStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Presentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {/* Collateral Type Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Collateral Type</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'presentation', label: 'Presentation' },
                  { id: 'marketing', label: 'Marketing' },
                  { id: 'website', label: 'Website' },
                  { id: 'conference', label: 'Conference' },
                  { id: 'investor', label: 'Investor Deck' },
                  { id: 'sales', label: 'Sales' },
                  { id: 'training', label: 'Training' },
                  { id: 'product-launch', label: 'Product Launch' },
                  { id: 'case-study', label: 'Case Study' },
                  { id: 'whitepaper', label: 'White Paper' },
                ].map(type => (
                  <Badge
                    key={type.id}
                    variant={collateralType === type.id ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors text-xs',
                      collateralType === type.id && 'bg-primary'
                    )}
                    onClick={() => handleCollateralTypeChange(type.id as CollateralType)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* AI Model Suggestion */}
            {suggestedModel && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs font-medium">Suggested AI Models</p>
                        <p className="text-[10px] text-muted-foreground">{suggestedModel.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {Math.round(suggestedModel.confidence * 100)}% match
                      </Badge>
                      <Switch
                        checked={!useCustomModel}
                        onCheckedChange={(checked) => setUseCustomModel(!checked)}
                      />
                      <Label className="text-[10px]">Use suggested</Label>
                    </div>
                  </div>
                  {!useCustomModel && (
                    <div className="mt-2 flex gap-2 text-[10px]">
                      <Badge variant="outline">Text: {suggestedModel.textModel.split('/')[1]}</Badge>
                      <Badge variant="outline">Image: {suggestedModel.imageModel.split('/')[1]}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Configuration Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Output Format</Label>
                <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pptx">PowerPoint</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="infographic">Infographic</SelectItem>
                    <SelectItem value="whitepaper">White Paper</SelectItem>
                    <SelectItem value="journey-map">Journey Map</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Length</Label>
                <Select value={length} onValueChange={(v) => setLength(v as PresentationLength)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (5-8)</SelectItem>
                    <SelectItem value="standard">Standard (10-15)</SelectItem>
                    <SelectItem value="long">Long (18-25)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Image Source</Label>
                <Select value={imageSource} onValueChange={(v) => setImageSource(v as ImageSourceType)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai-generated">AI Generated</SelectItem>
                    <SelectItem value="stock-upload">Upload Stock</SelectItem>
                    <SelectItem value="placeholder">Placeholders</SelectItem>
                    <SelectItem value="mixed">Mixed (AI + Upload)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Voice Provider</Label>
                <Select value={voiceProvider} onValueChange={(v) => setVoiceProvider(v as VoiceProviderType)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceProviders.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image Style Selection */}
            {imageSource !== 'placeholder' && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Image Styles (select multiple)</Label>
                <div className="flex flex-wrap gap-2">
                  {imageStyleOptions.map(style => (
                    <Badge
                      key={style.id}
                      variant={selectedImageStyles.includes(style.id) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-colors text-xs',
                        selectedImageStyles.includes(style.id) && 'bg-primary',
                        style.bestFor.includes(collateralType) && !selectedImageStyles.includes(style.id) && 'border-primary/50'
                      )}
                      onClick={() => toggleImageStyle(style.id)}
                    >
                      {style.name}
                      {style.bestFor.includes(collateralType) && (
                        <Check className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  ✓ = Recommended for {collateralType}
                </p>
              </div>
            )}

            {/* Additional Options */}
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
                <Label className="text-xs">Visual Style</Label>
                <Select value={imageStyle} onValueChange={setImageStyle}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="infographic">Infographic</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="tech">Tech</SelectItem>
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

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !inputContent.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Presentation...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Presentation
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
