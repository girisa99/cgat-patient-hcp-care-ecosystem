/**
 * Presentation Wizard - Two-Panel Split Layout
 * Left: Guided step-by-step configuration
 * Right: Live preview & editing
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePresentationSession, PresentationSessionConfig } from '@/hooks/usePresentationSession';
import { ImageModelSelector, ImageModelType, IMAGE_MODELS } from '../ImageModelSelector';
import { LanguageSelector } from './LanguageSelector';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { SlideCard } from './SlideCard';
import { ComplianceChecker } from './ComplianceChecker';
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
  PresentationTone,
  ContentEnhancement,
  universalPresentationService,
} from '@/services/universalPresentationService';
import { PresentationSlide, SlideEnhancementType } from './types';

// Wizard Steps
const WIZARD_STEPS = [
  { id: 'input', label: 'Content Input', icon: Type, description: 'Add your content' },
  { id: 'type', label: 'Output Type', icon: Presentation, description: 'Choose format & style' },
  { id: 'images', label: 'Image Settings', icon: ImageIcon, description: 'Configure visuals' },
  { id: 'advanced', label: 'Advanced', icon: Settings2, description: 'Fine-tune options' },
  { id: 'generate', label: 'Generate', icon: Wand2, description: 'Create your presentation' },
];

interface PresentationWizardProps {
  sessionId?: string;
  onComplete?: (presentation: any) => void;
  className?: string;
}

export function PresentationWizard({
  sessionId,
  onComplete,
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
    downloadPPTX,
    download,
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
  const [selectedImageStyles, setSelectedImageStyles] = useState<ImageStyleType[]>(['ai-realistic']);
  const [selectedTones, setSelectedTones] = useState<PresentationTone[]>(['balanced']);
  const [selectedEnhancements, setSelectedEnhancements] = useState<ContentEnhancement[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [targetAudience, setTargetAudience] = useState('');
  const [voiceProvider, setVoiceProvider] = useState<VoiceProviderType>('openai');
  const [includeInfographics, setIncludeInfographics] = useState(true);
  const [includeJourneyMaps, setIncludeJourneyMaps] = useState(false);
  const [includeVoiceover, setIncludeVoiceover] = useState(false);
  const [selectedAIModel, setSelectedAIModel] = useState('auto');
  const [showComplianceCheck, setShowComplianceCheck] = useState(false);

  // Slides state
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [presentationTitle, setPresentationTitle] = useState('');
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);

  // Get options from service
  const imageStyleOptions = universalPresentationService.getImageStyleOptions();
  const toneOptions = universalPresentationService.getToneOptions();
  const enhancementOptions = universalPresentationService.getContentEnhancements();
  const voiceProviders = universalPresentationService.getVoiceProviders();

  // AI Models for text generation
  const AI_MODELS = [
    { id: 'auto', name: 'Auto (Recommended)', description: 'AI selects best model' },
    { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast & balanced' },
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'High quality' },
    { id: 'openai/gpt-5', name: 'GPT-5', description: 'Premium reasoning' },
    { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Cost-effective' },
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

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
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
      toast.error('Please enter content first');
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
      includeJourneyMaps,
      includeInfographics,
      targetAudience: targetAudience || undefined,
      voiceProvider,
      tones: selectedTones,
      contentEnhancements: selectedEnhancements,
    };

    const result = await generatePresentation(request);

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

      // Save to session
      saveSession({
        slidesData: editableSlides,
        status: 'completed',
      });

      toast.success(`Generated ${editableSlides.length} slides!`);
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
    await download(serviceSlides as any, presentationTitle, format, {});
  };

  const progressPercent = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className={cn("flex h-full gap-4", className)}>
      {/* Left Panel - Wizard Steps */}
      <div className="w-[400px] flex-shrink-0 flex flex-col border-r pr-4">
        {/* Progress Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Create Presentation</h2>
            {lastSaved && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Step {currentStep + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep].label}
          </p>
        </div>

        {/* Step Navigator */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
          {WIZARD_STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = currentStep === idx;
            const isComplete = isStepComplete(idx);
            return (
              <Button
                key={step.id}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => goToStep(idx)}
                className={cn(
                  "flex-shrink-0 gap-1 px-2",
                  isComplete && !isActive && "text-green-600"
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
                <span className="text-xs">{step.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Step Content */}
        <ScrollArea className="flex-1">
          <div className="pr-4 space-y-4">
            {/* Step 0: Content Input */}
            {currentStep === 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Content Input
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={inputSource} onValueChange={(v) => setInputSource(v as InputSource)}>
                    <TabsList className="grid grid-cols-5 h-8">
                      <TabsTrigger value="prompt" className="text-xs px-2">Prompt</TabsTrigger>
                      <TabsTrigger value="text" className="text-xs px-2">Text</TabsTrigger>
                      <TabsTrigger value="document" className="text-xs px-2">Doc</TabsTrigger>
                      <TabsTrigger value="image" className="text-xs px-2">Image</TabsTrigger>
                      <TabsTrigger value="url" className="text-xs px-2">URL</TabsTrigger>
                    </TabsList>

                    <TabsContent value="prompt" className="mt-3">
                      <Textarea
                        placeholder="Describe what your presentation should be about..."
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        rows={6}
                        className="resize-none text-sm"
                      />
                    </TabsContent>

                    <TabsContent value="text" className="mt-3">
                      <Textarea
                        placeholder="Paste your content here..."
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        rows={8}
                        className="resize-none text-sm"
                      />
                    </TabsContent>

                    <TabsContent value="document" className="mt-3">
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <input
                          type="file"
                          id="doc-upload"
                          accept=".pdf,.docx,.pptx,.txt,.md"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label htmlFor="doc-upload" className="cursor-pointer">
                          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {uploadedFile ? uploadedFile.name : 'Upload document'}
                          </p>
                        </label>
                      </div>
                    </TabsContent>

                    <TabsContent value="image" className="mt-3">
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <input
                          type="file"
                          id="img-upload"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <label htmlFor="img-upload" className="cursor-pointer">
                          <ImageIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {uploadedFile ? uploadedFile.name : 'Upload image'}
                          </p>
                        </label>
                      </div>
                    </TabsContent>

                    <TabsContent value="url" className="mt-3">
                      <Input
                        placeholder="https://example.com/article"
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        className="text-sm"
                      />
                    </TabsContent>
                  </Tabs>

                  {inputContent.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {inputContent.length} characters entered
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 1: Output Type */}
            {currentStep === 1 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Presentation className="h-4 w-4" />
                    Output Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Collateral Type</Label>
                    <Select value={collateralType} onValueChange={(v) => setCollateralType(v as CollateralType)}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { id: 'presentation', label: 'Presentation', desc: 'Standard slides' },
                          { id: 'marketing', label: 'Marketing', desc: 'Campaign materials' },
                          { id: 'investor', label: 'Investor Deck', desc: 'Pitch & financials' },
                          { id: 'sales', label: 'Sales', desc: 'Product showcase' },
                          { id: 'training', label: 'Training', desc: 'Educational' },
                          { id: 'whitepaper', label: 'White Paper', desc: 'In-depth analysis' },
                          { id: 'case-study', label: 'Case Study', desc: 'Success stories' },
                        ].map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{type.label}</span>
                              <span className="text-xs text-muted-foreground">{type.desc}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Output Format & Size</Label>
                    <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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

                  <div className="space-y-2">
                    <Label className="text-xs">Presentation Length</Label>
                    <Select value={length} onValueChange={(v) => setLength(v as PresentationLength)}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (5-8 slides)</SelectItem>
                        <SelectItem value="standard">Standard (10-15 slides)</SelectItem>
                        <SelectItem value="long">Long (18-25 slides)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs">AI Model for Content</Label>
                    <Select value={selectedAIModel} onValueChange={setSelectedAIModel}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_MODELS.map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{model.name}</span>
                              <span className="text-xs text-muted-foreground">{model.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Image Settings */}
            {currentStep === 2 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Image Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Image Source</Label>
                    <Select value={imageSource} onValueChange={(v) => setImageSource(v as ImageSourceType)}>
                      <SelectTrigger className="h-9 text-sm">
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

                  {imageSource !== 'placeholder' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          Image Generation Model
                        </Label>
                        <ImageModelSelector
                          selectedModel={imageModel}
                          onModelChange={setImageModel}
                          showLabel={false}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Image Styles</Label>
                        <MultiSelectDropdown
                          options={imageStyleOptions.map(style => ({
                            id: style.id,
                            label: style.name,
                            value: style.id,
                            description: style.bestFor.includes(collateralType) 
                              ? `✓ Recommended` 
                              : undefined
                          }))}
                          selectedValues={selectedImageStyles}
                          onSelectionChange={(values) => setSelectedImageStyles(values as ImageStyleType[])}
                          placeholder="Select image styles..."
                          searchable
                        />
                      </div>
                    </>
                  )}

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Include Infographics</Label>
                      <Switch checked={includeInfographics} onCheckedChange={setIncludeInfographics} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Include Journey Maps</Label>
                      <Switch checked={includeJourneyMaps} onCheckedChange={setIncludeJourneyMaps} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Advanced Settings */}
            {currentStep === 3 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Advanced Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Tone & Style</Label>
                    <MultiSelectDropdown
                      options={toneOptions.map(tone => ({
                        id: tone.id,
                        label: tone.name,
                        value: tone.id,
                        description: tone.bestFor.includes(collateralType) 
                          ? `Good for ${collateralType}` 
                          : undefined
                      }))}
                      selectedValues={selectedTones}
                      onSelectionChange={(values) => setSelectedTones(values as PresentationTone[])}
                      placeholder="Select tone..."
                      searchable
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Content Enhancements</Label>
                    <MultiSelectDropdown
                      options={enhancementOptions.map(e => ({
                        id: e.id,
                        label: e.name,
                        value: e.id,
                      }))}
                      selectedValues={selectedEnhancements}
                      onSelectionChange={(values) => setSelectedEnhancements(values as ContentEnhancement[])}
                      placeholder="Select enhancements..."
                      searchable
                    />
                  </div>

                  <Separator />

                  <LanguageSelector
                    selectedLanguages={selectedLanguages}
                    onLanguagesChange={setSelectedLanguages}
                    primaryLanguage={primaryLanguage}
                    onPrimaryLanguageChange={setPrimaryLanguage}
                    includeVoiceover={includeVoiceover}
                    onIncludeVoiceoverChange={setIncludeVoiceover}
                  />

                  <div className="space-y-2">
                    <Label className="text-xs">Target Audience</Label>
                    <Input
                      placeholder="e.g., Healthcare executives"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <Label className="text-xs">Run Compliance Check</Label>
                    </div>
                    <Switch checked={showComplianceCheck} onCheckedChange={setShowComplianceCheck} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Generate */}
            {currentStep === 4 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Generate Presentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <h4 className="text-sm font-medium">Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-muted-foreground">Type:</div>
                      <div className="font-medium capitalize">{collateralType}</div>
                      <div className="text-muted-foreground">Format:</div>
                      <div className="font-medium uppercase">{outputFormat}</div>
                      <div className="text-muted-foreground">Length:</div>
                      <div className="font-medium capitalize">{length}</div>
                      <div className="text-muted-foreground">Images:</div>
                      <div className="font-medium capitalize">{imageSource}</div>
                      <div className="text-muted-foreground">Model:</div>
                      <div className="font-medium">{IMAGE_MODELS.find(m => m.id === imageModel)?.name || 'Auto'}</div>
                    </div>
                  </div>

                  {showComplianceCheck && (
                    <ComplianceChecker
                      content={inputContent || 'No content to check yet.'}
                      contentType="document"
                      industry="healthcare"
                    />
                  )}

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !inputContent.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Presentation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t">
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
            <Button
              size="sm"
              onClick={() => handleDownload('pptx')}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview
          </h3>
          {slides.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{slides.length} slides</Badge>
              <Button variant="ghost" size="sm" onClick={() => { setSlides([]); reset(); }}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          {slides.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Presentation className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Your presentation preview will appear here</p>
                <p className="text-xs mt-1">Complete the steps on the left to generate</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {slides.map((slide) => (
                <SlideCard
                  key={slide.id}
                  slide={slide}
                  isSelected={selectedSlideId === slide.id}
                  onSelect={() => setSelectedSlideId(slide.id)}
                  onUpdate={(updates: Partial<PresentationSlide>) => handleSlideUpdate(slide.id, updates)}
                  onAccept={() => handleSlideAccept(slide.id)}
                  onSkip={() => handleSlideSkip(slide.id)}
                  onEnhance={async (slideId: string, type: SlideEnhancementType) => {}}
                  onRefresh={async (slideId: string) => {}}
                  onRevert={() => {}}
                  onRegenerateImage={async (slideId: string) => {}}
                  onBulletUpdate={(slideId: string, bulletId: string, text: string) => {}}
                  onBulletAccept={(slideId: string, bulletId: string) => {}}
                  onBulletSkip={(slideId: string, bulletId: string) => {}}
                  onBulletEnhance={async (slideId: string, bulletId: string, type: SlideEnhancementType) => {}}
                  onBulletRefresh={async (slideId: string, bulletId: string) => {}}
                  onBulletRevert={(slideId: string, bulletId: string) => {}}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
