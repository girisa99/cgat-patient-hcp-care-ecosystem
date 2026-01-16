/**
 * Guided Generation Steps - P2 Generation Features
 * Implements remaining P2 scenarios as guided workflow steps:
 * - P3-GEN-03: Multi-Language Quick Dub
 * - P3-GEN-04: Content Recycling Engine
 * - P3-GEN-05: Template Variant Generation
 * - P3-GEN-06: Voice Cloning for Dubs
 * 
 * These are presented as guided steps, not cluttered UI
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe,
  Recycle,
  LayoutTemplate,
  Mic2,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2,
  Sparkles,
  Play,
  ArrowRight,
  Info,
  AlertCircle,
  Languages,
  FileVideo,
  Copy,
  Settings2,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

export type GenerationFeature = 
  | 'multi-language-dub'
  | 'content-recycling'
  | 'template-variants'
  | 'voice-cloning';

export interface GenerationStepConfig {
  id: GenerationFeature;
  name: string;
  description: string;
  icon: React.ReactNode;
  scenarioId: string;
  steps: StepDefinition[];
  requiredInputs: string[];
  outputs: string[];
}

interface StepDefinition {
  id: string;
  title: string;
  description: string;
  isOptional?: boolean;
}

export interface GenerationContext {
  sourceScript?: string;
  sourceVideo?: File | null;
  sourceAudio?: File | null;
  metadata?: Record<string, unknown>;
}

export interface GenerationResult {
  featureId: GenerationFeature;
  success: boolean;
  outputs: Record<string, unknown>;
  duration: number;
}

// =============================================================================
// FEATURE CONFIGURATIONS
// =============================================================================

const GENERATION_FEATURES: GenerationStepConfig[] = [
  {
    id: 'multi-language-dub',
    name: 'Multi-Language Quick Dub',
    description: 'Automatically dub your content into multiple languages with AI voices',
    icon: <Globe className="h-5 w-5" />,
    scenarioId: 'P3-GEN-03',
    steps: [
      { id: 'select-source', title: 'Select Source', description: 'Choose video/audio to dub' },
      { id: 'choose-languages', title: 'Choose Languages', description: 'Select target languages' },
      { id: 'voice-matching', title: 'Voice Matching', description: 'AI matches voice characteristics' },
      { id: 'generate-dubs', title: 'Generate Dubs', description: 'Create dubbed versions' },
      { id: 'review-export', title: 'Review & Export', description: 'Review and download' },
    ],
    requiredInputs: ['video', 'audio', 'script'],
    outputs: ['dubbedVideos', 'dubbedAudios', 'subtitles'],
  },
  {
    id: 'content-recycling',
    name: 'Content Recycling Engine',
    description: 'Transform existing content into new formats for different platforms',
    icon: <Recycle className="h-5 w-5" />,
    scenarioId: 'P3-GEN-04',
    steps: [
      { id: 'import-content', title: 'Import Content', description: 'Load existing content' },
      { id: 'analyze-segments', title: 'Analyze Segments', description: 'AI identifies reusable parts' },
      { id: 'select-formats', title: 'Select Formats', description: 'Choose output platforms' },
      { id: 'optimize-content', title: 'Optimize', description: 'AI adapts for each platform' },
      { id: 'export-variants', title: 'Export Variants', description: 'Download recycled content' },
    ],
    requiredInputs: ['existingContent', 'contentType'],
    outputs: ['shorts', 'reels', 'clips', 'quotes'],
  },
  {
    id: 'template-variants',
    name: 'Template Variant Generation',
    description: 'Generate multiple script variations from a single template',
    icon: <LayoutTemplate className="h-5 w-5" />,
    scenarioId: 'P3-GEN-05',
    steps: [
      { id: 'select-template', title: 'Select Template', description: 'Choose base template' },
      { id: 'define-variables', title: 'Define Variables', description: 'Set variable placeholders' },
      { id: 'input-variations', title: 'Input Variations', description: 'Provide variation values' },
      { id: 'generate-variants', title: 'Generate', description: 'Create all variants' },
      { id: 'review-variants', title: 'Review', description: 'Review and select variants' },
    ],
    requiredInputs: ['templateScript', 'variables'],
    outputs: ['variants', 'templateBundle'],
  },
  {
    id: 'voice-cloning',
    name: 'Voice Cloning for Dubs',
    description: 'Clone your voice for consistent dubbing across languages',
    icon: <Mic2 className="h-5 w-5" />,
    scenarioId: 'P3-GEN-06',
    steps: [
      { id: 'record-sample', title: 'Record Sample', description: 'Provide 30s voice sample' },
      { id: 'verify-identity', title: 'Verify Identity', description: 'Consent & verification' },
      { id: 'train-clone', title: 'Train Clone', description: 'AI learns your voice' },
      { id: 'test-clone', title: 'Test Clone', description: 'Preview cloned voice' },
      { id: 'apply-to-dubs', title: 'Apply to Dubs', description: 'Use for dubbing' },
    ],
    requiredInputs: ['voiceSample', 'consent'],
    outputs: ['voiceCloneId', 'voiceProfile'],
  },
];

// =============================================================================
// SUPPORTED LANGUAGES
// =============================================================================

const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

const RECYCLING_FORMATS = [
  { id: 'youtube-shorts', name: 'YouTube Shorts', duration: '60s', aspectRatio: '9:16' },
  { id: 'instagram-reels', name: 'Instagram Reels', duration: '90s', aspectRatio: '9:16' },
  { id: 'tiktok', name: 'TikTok', duration: '60s', aspectRatio: '9:16' },
  { id: 'linkedin-clip', name: 'LinkedIn Clip', duration: '30s', aspectRatio: '1:1' },
  { id: 'twitter-clip', name: 'X/Twitter Clip', duration: '140s', aspectRatio: '16:9' },
  { id: 'podcast-snippet', name: 'Podcast Snippet', duration: '120s', aspectRatio: 'audio' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface GuidedGenerationStepsProps {
  feature: GenerationFeature;
  context?: GenerationContext;
  onComplete?: (result: GenerationResult) => void;
  onCancel?: () => void;
  className?: string;
}

export function GuidedGenerationSteps({
  feature,
  context,
  onComplete,
  onCancel,
  className,
}: GuidedGenerationStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepData, setStepData] = useState<Record<string, unknown>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const config = GENERATION_FEATURES.find(f => f.id === feature);
  
  if (!config) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p>Unknown generation feature: {feature}</p>
        </CardContent>
      </Card>
    );
  }
  const currentStepConfig = config.steps[currentStep];
  const totalSteps = config.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleStepComplete = useCallback((data: Record<string, unknown>) => {
    setStepData(prev => ({ ...prev, ...data }));
    setCompletedSteps(prev => new Set([...prev, currentStepConfig.id]));
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - trigger completion
      const startTime = Date.now();
      setIsProcessing(true);
      
      // Simulate processing (in real implementation, call actual services)
      setTimeout(() => {
        setIsProcessing(false);
        onComplete?.({
          featureId: feature,
          success: true,
          outputs: stepData,
          duration: Date.now() - startTime,
        });
        toast.success(`${config.name} completed successfully!`);
      }, 2000);
    }
  }, [currentStep, totalSteps, currentStepConfig, stepData, feature, config.name, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onCancel?.();
    }
  }, [currentStep, onCancel]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {config.icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{config.name}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {config.scenarioId}
          </Badge>
        </div>
        
        {/* Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      {/* Step Navigation */}
      <div className="border-b bg-muted/30">
        <ScrollArea className="w-full">
          <div className="flex p-2 gap-1">
            {config.steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => index <= currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors",
                  index === currentStep && "bg-primary text-primary-foreground",
                  index < currentStep && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
                  index > currentStep && "text-muted-foreground opacity-50"
                )}
              >
                {completedSteps.has(step.id) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full border text-xs">
                    {index + 1}
                  </span>
                )}
                {step.title}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Step Content */}
      <CardContent className="p-6">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Processing {config.name}...</p>
          </div>
        ) : (
          <StepContent
            feature={feature}
            step={currentStepConfig}
            stepData={stepData}
            context={context}
            onComplete={handleStepComplete}
          />
        )}
      </CardContent>

      {/* Footer Actions */}
      <div className="border-t p-4 flex justify-between items-center bg-muted/20">
        <Button variant="outline" onClick={handleBack} disabled={isProcessing}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>{currentStepConfig.description}</span>
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// STEP CONTENT RENDERER
// =============================================================================

interface StepContentProps {
  feature: GenerationFeature;
  step: StepDefinition;
  stepData: Record<string, unknown>;
  context?: GenerationContext;
  onComplete: (data: Record<string, unknown>) => void;
}

function StepContent({ feature, step, stepData, context, onComplete }: StepContentProps) {
  // Route to appropriate step component based on feature and step
  switch (feature) {
    case 'multi-language-dub':
      return <MultiLanguageDubStep step={step} stepData={stepData} context={context} onComplete={onComplete} />;
    case 'content-recycling':
      return <ContentRecyclingStep step={step} stepData={stepData} context={context} onComplete={onComplete} />;
    case 'template-variants':
      return <TemplateVariantsStep step={step} stepData={stepData} context={context} onComplete={onComplete} />;
    case 'voice-cloning':
      return <VoiceCloningStep step={step} stepData={stepData} context={context} onComplete={onComplete} />;
    default:
      return <div>Unknown feature step</div>;
  }
}

// =============================================================================
// MULTI-LANGUAGE DUB STEPS
// =============================================================================

function MultiLanguageDubStep({ step, stepData, context, onComplete }: Omit<StepContentProps, 'feature'>) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>((stepData.languages as string[]) || []);
  const [preserveTiming, setPreserveTiming] = useState(true);
  const [lipSync, setLipSync] = useState(false);

  const handleContinue = () => {
    onComplete({
      languages: selectedLanguages,
      preserveTiming,
      lipSync,
    });
  };

  if (step.id === 'select-source') {
    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <FileVideo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {context?.sourceVideo ? 'Video loaded from context' : 'Drag & drop video or audio file'}
          </p>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Select File
          </Button>
        </div>
        <Button className="w-full" onClick={() => onComplete({ sourceLoaded: true })}>
          Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step.id === 'choose-languages') {
    return (
      <div className="space-y-4">
        <Label>Select Target Languages</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguages(prev => 
                prev.includes(lang.code) 
                  ? prev.filter(l => l !== lang.code)
                  : [...prev, lang.code]
              )}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                selectedLanguages.includes(lang.code) 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {selectedLanguages.includes(lang.code) && (
                <CheckCircle className="h-4 w-4 text-primary ml-auto" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <Label htmlFor="preserve-timing">Preserve Original Timing</Label>
          <Switch id="preserve-timing" checked={preserveTiming} onCheckedChange={setPreserveTiming} />
        </div>
        <Button 
          className="w-full" 
          disabled={selectedLanguages.length === 0}
          onClick={handleContinue}
        >
          Continue with {selectedLanguages.length} languages <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step.id === 'voice-matching') {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium">AI Voice Matching</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Our AI will analyze the original voice and match similar characteristics in each target language.
          </p>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <Label htmlFor="lip-sync">Enable Lip Sync (Premium)</Label>
          <Switch id="lip-sync" checked={lipSync} onCheckedChange={setLipSync} />
        </div>
        <Button className="w-full" onClick={() => onComplete({ voiceMatching: 'auto', lipSync })}>
          Start Voice Matching <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step.id === 'generate-dubs') {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <Languages className="h-12 w-12 mx-auto text-primary mb-4" />
          <p className="font-medium mb-2">Ready to Generate Dubs</p>
          <p className="text-sm text-muted-foreground">
            This will create {selectedLanguages.length || 'multiple'} dubbed versions of your content.
          </p>
        </div>
        <Button className="w-full" onClick={() => onComplete({ dubsGenerated: true })}>
          <Play className="h-4 w-4 mr-2" />
          Generate Dubs
        </Button>
      </div>
    );
  }

  // Review step
  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-700 dark:text-green-300">Dubs Generated Successfully</span>
        </div>
        <p className="text-sm text-green-600 dark:text-green-400">
          All dubbed versions are ready for download.
        </p>
      </div>
      <Button className="w-full" onClick={() => onComplete({ exported: true })}>
        Export All Dubs <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// =============================================================================
// CONTENT RECYCLING STEPS
// =============================================================================

function ContentRecyclingStep({ step, stepData, onComplete }: Omit<StepContentProps, 'feature'>) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

  if (step.id === 'import-content') {
    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Recycle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Import existing content to recycle</p>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Import Content
          </Button>
        </div>
        <Button className="w-full" onClick={() => onComplete({ contentImported: true })}>
          Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step.id === 'analyze-segments') {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium">AI Segment Analysis</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI will identify the most engaging segments suitable for recycling into short-form content.
          </p>
        </div>
        <Button className="w-full" onClick={() => onComplete({ segmentsAnalyzed: true })}>
          Analyze Segments <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step.id === 'select-formats') {
    return (
      <div className="space-y-4">
        <Label>Select Output Formats</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {RECYCLING_FORMATS.map(format => (
            <button
              key={format.id}
              onClick={() => setSelectedFormats(prev => 
                prev.includes(format.id) 
                  ? prev.filter(f => f !== format.id)
                  : [...prev, format.id]
              )}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-colors text-left",
                selectedFormats.includes(format.id) 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <div>
                <div className="font-medium">{format.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format.duration} • {format.aspectRatio}
                </div>
              </div>
              {selectedFormats.includes(format.id) && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
        <Button 
          className="w-full" 
          disabled={selectedFormats.length === 0}
          onClick={() => onComplete({ formats: selectedFormats })}
        >
          Continue with {selectedFormats.length} formats <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step.id === 'optimize-content') {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <span className="font-medium">Platform Optimization</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI will optimize each clip for maximum engagement on its target platform.
          </p>
        </div>
        <Button className="w-full" onClick={() => onComplete({ optimized: true })}>
          Optimize Content <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-700 dark:text-green-300">Content Recycled</span>
        </div>
        <p className="text-sm text-green-600 dark:text-green-400">
          All recycled variants are ready for export.
        </p>
      </div>
      <Button className="w-full" onClick={() => onComplete({ exported: true })}>
        Export All Variants <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// =============================================================================
// TEMPLATE VARIANTS STEPS
// =============================================================================

function TemplateVariantsStep({ step, stepData, onComplete }: Omit<StepContentProps, 'feature'>) {
  const [templateScript, setTemplateScript] = useState('');
  const [variables, setVariables] = useState<{name: string; values: string[]}[]>([
    { name: 'productName', values: [] },
  ]);

  if (step.id === 'select-template') {
    return (
      <div className="space-y-4">
        <Label>Base Template Script</Label>
        <Textarea 
          value={templateScript}
          onChange={(e) => setTemplateScript(e.target.value)}
          placeholder="Enter your template script with {{variables}} for dynamic content..."
          className="min-h-[200px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Use &#123;&#123;variableName&#125;&#125; syntax for dynamic placeholders
        </p>
        <Button className="w-full" onClick={() => onComplete({ template: templateScript })}>
          Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step.id === 'define-variables') {
    return (
      <div className="space-y-4">
        <Label>Define Variables</Label>
        <div className="space-y-2">
          {variables.map((v, i) => (
            <div key={i} className="flex gap-2">
              <Input 
                value={v.name}
                onChange={(e) => {
                  const newVars = [...variables];
                  newVars[i].name = e.target.value;
                  setVariables(newVars);
                }}
                placeholder="Variable name"
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setVariables(prev => prev.filter((_, idx) => idx !== i))}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={() => setVariables(prev => [...prev, { name: '', values: [] }])}>
          Add Variable
        </Button>
        <Button className="w-full" onClick={() => onComplete({ variables })}>
          Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step.id === 'input-variations') {
    return (
      <div className="space-y-4">
        <Label>Input Variation Values</Label>
        <Textarea 
          placeholder="Enter values, one per line..."
          className="min-h-[150px]"
        />
        <p className="text-xs text-muted-foreground">
          Each line creates a new variant
        </p>
        <Button className="w-full" onClick={() => onComplete({ variationsInput: true })}>
          Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step.id === 'generate-variants') {
    return (
      <div className="space-y-4 text-center py-8">
        <Copy className="h-12 w-12 mx-auto text-primary" />
        <p className="font-medium">Ready to Generate Variants</p>
        <p className="text-sm text-muted-foreground">
          AI will create all script variants from your template.
        </p>
        <Button className="w-full" onClick={() => onComplete({ variantsGenerated: true })}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Variants
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
        <span className="font-medium text-green-700 dark:text-green-300">Variants Generated</span>
      </div>
      <Button className="w-full" onClick={() => onComplete({ exported: true })}>
        Export Variants <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// =============================================================================
// VOICE CLONING STEPS
// =============================================================================

function VoiceCloningStep({ step, stepData, onComplete }: Omit<StepContentProps, 'feature'>) {
  const [consentGiven, setConsentGiven] = useState(false);

  if (step.id === 'record-sample') {
    return (
      <div className="space-y-4 text-center">
        <Mic2 className="h-16 w-16 mx-auto text-primary" />
        <p className="font-medium">Record Voice Sample</p>
        <p className="text-sm text-muted-foreground">
          Record at least 30 seconds of clear speech for best results.
        </p>
        <Button size="lg" className="gap-2">
          <Mic2 className="h-5 w-5" />
          Start Recording
        </Button>
        <Button variant="outline" className="w-full" onClick={() => onComplete({ sampleRecorded: true })}>
          Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step.id === 'verify-identity') {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 mb-2" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Voice cloning requires your explicit consent. This voice clone will only be used for your content.
          </p>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <Switch id="consent" checked={consentGiven} onCheckedChange={setConsentGiven} />
          <Label htmlFor="consent" className="text-sm">
            I confirm this is my voice and consent to cloning
          </Label>
        </div>
        <Button 
          className="w-full" 
          disabled={!consentGiven}
          onClick={() => onComplete({ consentGiven: true })}
        >
          Confirm & Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step.id === 'train-clone') {
    return (
      <div className="space-y-4 text-center py-8">
        <Sparkles className="h-12 w-12 mx-auto text-primary animate-pulse" />
        <p className="font-medium">Training Voice Clone</p>
        <p className="text-sm text-muted-foreground">
          AI is learning your voice characteristics...
        </p>
        <Button className="w-full" onClick={() => onComplete({ cloneTrained: true })}>
          Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  if (step.id === 'test-clone') {
    return (
      <div className="space-y-4">
        <Label>Test Your Voice Clone</Label>
        <Textarea placeholder="Enter text to test..." className="min-h-[100px]" />
        <Button variant="outline" className="w-full gap-2">
          <Play className="h-4 w-4" />
          Preview Clone
        </Button>
        <Button className="w-full" onClick={() => onComplete({ cloneTested: true })}>
          Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
        <span className="font-medium text-green-700 dark:text-green-300">Voice Clone Ready</span>
        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
          Your voice clone is ready to use for dubbing.
        </p>
      </div>
      <Button className="w-full" onClick={() => onComplete({ cloneReady: true })}>
        Use for Dubbing <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// =============================================================================
// FEATURE SELECTOR (Entry Point)
// =============================================================================

interface GenerationFeatureSelectorProps {
  onSelectFeature: (feature: GenerationFeature) => void;
  className?: string;
}

export function GenerationFeatureSelector({ onSelectFeature, className }: GenerationFeatureSelectorProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {GENERATION_FEATURES.map(feature => (
        <Card 
          key={feature.id}
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onSelectFeature(feature.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                {feature.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{feature.name}</h3>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {feature.scenarioId}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {feature.description}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <span>{feature.steps.length} steps</span>
                  <span>•</span>
                  <span>Guided workflow</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { GENERATION_FEATURES, SUPPORTED_LANGUAGES, RECYCLING_FORMATS };
