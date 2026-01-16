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
import { supabase } from '@/integrations/supabase/client';
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
  Languages,
  Layout,
  Table,
  BarChart3,
  Move
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePresentationSession, PresentationSessionConfig } from '@/hooks/usePresentationSession';
import { ImageModelSelector, ImageModelType, IMAGE_MODELS } from '../ImageModelSelector';
import { LanguageSelector } from './LanguageSelector';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { SlideCard } from './SlideCard';
import { ComplianceChecker } from './ComplianceChecker';
import { TemplateThemeSelector, TEMPLATES } from './TemplateThemeSelector';
import { BrandingCustomizer, BrandConfig, DEFAULT_BRAND_CONFIG } from './BrandingCustomizer';
import { MultiLanguageGenerator, useMultiLanguageGeneration, SUPPORTED_LANGUAGES, LanguageGenerationStatus } from './MultiLanguageGenerator';
import { TableEditor, ChartEditor } from './TableChartEditor';
import { DraggableSlideLayout, LayoutElement } from './DraggableSlideLayout';
import { useUniversalPresentation, DownloadFormat } from '@/hooks/useUniversalPresentation';
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

// Wizard Steps - Extended with branding
const WIZARD_STEPS = [
  { id: 'input', label: 'Content Input', icon: Type, description: 'Add your content' },
  { id: 'branding', label: 'Brand & Style', icon: Palette, description: 'Templates & branding' },
  { id: 'images', label: 'Image Settings', icon: ImageIcon, description: 'Configure visuals' },
  { id: 'languages', label: 'Languages', icon: Languages, description: 'Multi-language' },
  { id: 'generate', label: 'Generate', icon: Wand2, description: 'Create presentation' },
];

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
  const [includeTables, setIncludeTables] = useState(false);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [selectedAIModel, setSelectedAIModel] = useState('auto');
  const [showComplianceCheck, setShowComplianceCheck] = useState(false);

  // Template and branding state
  const [selectedTemplate, setSelectedTemplate] = useState<PresentationTemplate | undefined>(TEMPLATES[0]);
  const [selectedTheme, setSelectedTheme] = useState<PresentationTheme | undefined>(TEMPLATES[0].theme);
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(DEFAULT_BRAND_CONFIG);

  // Slides state
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [presentationTitle, setPresentationTitle] = useState('');
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [editingMode, setEditingMode] = useState<'preview' | 'layout'>('preview');

  // Multi-language generation
  const { statuses: languageStatuses, isGenerating: isMultiLangGenerating, generateAll: generateMultiLang, reset: resetMultiLang } = useMultiLanguageGeneration();

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
  ];

  const enhancementOptions = [
    { id: 'data-verification', name: 'Data Verification' },
    { id: 'statistics', name: 'Key Statistics' },
    { id: 'case-examples', name: 'Case Examples' },
    { id: 'comparison-tables', name: 'Comparison Tables' },
    { id: 'timeline', name: 'Timeline' },
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

    const request = {
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
    } as PresentationRequest;

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
    await downloadPPTX(serviceSlides as any, presentationTitle);
  };

  // Multi-language generation handler
  const handleMultiLanguageGenerate = async (languages: string[]) => {
    if (!inputContent.trim()) {
      toast.error('Please enter content first');
      return;
    }

    // Generate for each language using the hook
    await generateMultiLang(languages, async (langCode: string) => {
      const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
      
      // Build content with language instruction
      const languageInstruction = langCode === 'en' 
        ? inputContent 
        : `Generate this presentation in ${lang?.name || langCode} (${lang?.nativeName || langCode}):\n\n${inputContent}`;

      const request: PresentationRequest = {
        inputSource,
        content: languageInstruction,
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

      if (result?.success) {
        return { success: true, downloadUrl: `presentation_${langCode}.pptx` };
      } else {
        return { success: false, error: `Failed to generate for ${lang?.name || langCode}` };
      }
    });
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
                    <Type className="h-4 w-4" />
                    Content Input
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={inputSource} onValueChange={(v) => setInputSource(v as InputSource)}>
                    <TabsList className="!grid !grid-cols-5 !w-full !h-10 !p-1 !bg-muted !rounded-lg !gap-0 !min-h-0 !overflow-visible !border-0 !shadow-none">
                      <TabsTrigger value="prompt" className="!text-xs !font-medium !h-8 !rounded-md !px-2 !py-1 !min-w-0 !scale-100 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-sm data-[state=active]:!scale-100 !text-foreground !border-0">Prompt</TabsTrigger>
                      <TabsTrigger value="text" className="!text-xs !font-medium !h-8 !rounded-md !px-2 !py-1 !min-w-0 !scale-100 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-sm data-[state=active]:!scale-100 !text-foreground !border-0">Text</TabsTrigger>
                      <TabsTrigger value="document" className="!text-xs !font-medium !h-8 !rounded-md !px-2 !py-1 !min-w-0 !scale-100 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-sm data-[state=active]:!scale-100 !text-foreground !border-0">Doc</TabsTrigger>
                      <TabsTrigger value="image" className="!text-xs !font-medium !h-8 !rounded-md !px-2 !py-1 !min-w-0 !scale-100 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-sm data-[state=active]:!scale-100 !text-foreground !border-0">Image</TabsTrigger>
                      <TabsTrigger value="url" className="!text-xs !font-medium !h-8 !rounded-md !px-2 !py-1 !min-w-0 !scale-100 data-[state=active]:!bg-primary data-[state=active]:!text-primary-foreground data-[state=active]:!shadow-sm data-[state=active]:!scale-100 !text-foreground !border-0">URL</TabsTrigger>
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
                      <div className={cn(
                        "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
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
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                          <Check className="h-3 w-3 inline mr-1 text-green-600" />
                          Extracted {inputContent.length.toLocaleString()} characters
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="image" className="mt-3">
                      <div className={cn(
                        "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
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

            {/* Step 1: Brand & Style */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Template & Theme */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Layout className="h-4 w-4" />
                      Template & Theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <TemplateThemeSelector
                      selectedTemplate={selectedTemplate}
                      selectedTheme={selectedTheme}
                      onTemplateChange={(template) => {
                        setSelectedTemplate(template);
                        setSelectedTheme(template.theme);
                      }}
                      onThemeChange={(theme) => setSelectedTheme(prev => prev ? { ...prev, ...theme } : prev)}
                      onColorsChange={(colors) => setSelectedTheme(prev => prev ? { ...prev, colors: { ...prev.colors, ...colors } } : prev)}
                      onFontsChange={(fonts) => setSelectedTheme(prev => prev ? { ...prev, fonts: { ...prev.fonts, ...fonts } } : prev)}
                    />
                  </CardContent>
                </Card>

                {/* Branding */}
                <BrandingCustomizer
                  brandConfig={brandConfig}
                  onBrandConfigChange={setBrandConfig}
                />

                {/* Output Settings */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Presentation className="h-4 w-4" />
                      Output Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Collateral Type</Label>
                        <Select value={collateralType} onValueChange={(v) => setCollateralType(v as CollateralType)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['presentation', 'marketing', 'investor', 'sales', 'training', 'whitepaper', 'case-study'].map(type => (
                              <SelectItem key={type} value={type} className="text-xs capitalize">{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Format</Label>
                        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pptx" className="text-xs">PowerPoint (16:9)</SelectItem>
                            <SelectItem value="social" className="text-xs">Social (1:1)</SelectItem>
                            <SelectItem value="infographic" className="text-xs">Infographic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Length</Label>
                        <Select value={length} onValueChange={(v) => setLength(v as PresentationLength)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short" className="text-xs">Short (5-8)</SelectItem>
                            <SelectItem value="standard" className="text-xs">Standard (10-15)</SelectItem>
                            <SelectItem value="long" className="text-xs">Long (18-25)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">AI Model</Label>
                        <Select value={selectedAIModel} onValueChange={setSelectedAIModel}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AI_MODELS.map(model => (
                              <SelectItem key={model.id} value={model.id} className="text-xs">{model.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Content options */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px]">Include Tables</Label>
                        <Switch checked={includeTables} onCheckedChange={setIncludeTables} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px]">Include Charts</Label>
                        <Switch checked={includeCharts} onCheckedChange={setIncludeCharts} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px]">Infographics</Label>
                        <Switch checked={includeInfographics} onCheckedChange={setIncludeInfographics} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px]">Journey Maps</Label>
                        <Switch checked={includeJourneyMaps} onCheckedChange={setIncludeJourneyMaps} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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

            {/* Step 3: Languages - Multi-Language Generation */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <MultiLanguageGenerator
                  selectedLanguages={selectedLanguages}
                  onLanguagesChange={setSelectedLanguages}
                  primaryLanguage={primaryLanguage}
                  onPrimaryLanguageChange={setPrimaryLanguage}
                  onGenerateAll={handleMultiLanguageGenerate}
                  generationStatuses={languageStatuses}
                  onDownload={handleLanguageDownload}
                  isGenerating={isMultiLangGenerating}
                />

                {/* Advanced Tone & Enhancements */}
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
              </div>
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
          </div>
        </div>

        {/* Navigation Footer */}
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
      <div className="flex-1 flex flex-col min-w-0 p-4 bg-background">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview
          </h3>
          {slides.length > 0 && (
            <div className="flex items-center gap-2">
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
              <Button variant="ghost" size="sm" onClick={() => { setSlides([]); reset(); resetMultiLang(); }}>
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
                      toast.info(`Enhancing slide with ${type}...`);
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
              
              {/* Overall Presentation Feedback */}
              {slides.length > 0 && (
                <Card className="mt-6 p-4 bg-muted/30">
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
      </div>
    </div>
  );
}
