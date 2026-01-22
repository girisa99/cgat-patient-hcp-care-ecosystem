/**
 * Layer 2: SMART PIPELINE
 * Auto Mode | Custom Mode | Pipeline Preview | Pipeline Templates
 */

import React, { useState, useMemo } from 'react';
import {
  Wand2, Settings2, Clock, Coins, BarChart3, ChevronDown,
  Play, Pause, SkipForward, Check, AlertCircle, Loader2,
  ArrowRight, Zap, Sparkles, Eye, Edit3, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEditor } from '../context/EditorContext';
import type { 
  PipelineTemplate, 
  PipelineStage, 
  PipelineCategory, 
  PipelineMode,
  ActivePipeline 
} from '../types';

// ============================================================================
// MOCK PIPELINE TEMPLATES
// ============================================================================

const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: 'ppt-to-video',
    name: 'Presentation to Video',
    description: 'Convert PowerPoint/PDF to engaging video with AI voiceover',
    category: 'video-production',
    inputTypes: ['presentation', 'document'],
    outputTypes: ['video-standard', 'video-4k'],
    stages: [
      { id: 's1', name: 'Extract Content', description: 'Parse slides and text', type: 'content-extraction', estimatedTime: 30, estimatedCredits: 5, status: 'pending', isEditable: false, isOptional: false },
      { id: 's2', name: 'Generate Script', description: 'AI writes narration script', type: 'ai-generation', estimatedTime: 60, estimatedCredits: 20, status: 'pending', isEditable: true, isOptional: false },
      { id: 's3', name: 'Synthesize Voice', description: 'Text-to-speech with ElevenLabs', type: 'ai-generation', provider: 'ElevenLabs', estimatedTime: 45, estimatedCredits: 15, status: 'pending', isEditable: true, isOptional: false },
      { id: 's4', name: 'Animate Slides', description: 'Add motion graphics', type: 'transformation', estimatedTime: 120, estimatedCredits: 25, status: 'pending', isEditable: true, isOptional: true },
      { id: 's5', name: 'Render Video', description: 'Compile final video', type: 'rendering', estimatedTime: 180, estimatedCredits: 10, status: 'pending', isEditable: false, isOptional: false },
    ],
    estimatedTotalTime: 7,
    estimatedTotalCredits: 75,
    qualityLevel: 'advanced',
    popularity: 2450,
    tags: ['popular', 'video', 'presentation'],
  },
  {
    id: 'doc-to-social',
    name: 'Document to Social Posts',
    description: 'Transform documents into platform-optimized social content',
    category: 'social-media',
    inputTypes: ['document', 'text'],
    outputTypes: ['social-post', 'image'],
    stages: [
      { id: 's1', name: 'Extract Key Points', description: 'AI identifies main topics', type: 'content-extraction', estimatedTime: 45, estimatedCredits: 10, status: 'pending', isEditable: true, isOptional: false },
      { id: 's2', name: 'Generate Copy', description: 'Platform-specific captions', type: 'ai-generation', estimatedTime: 30, estimatedCredits: 15, status: 'pending', isEditable: true, isOptional: false },
      { id: 's3', name: 'Create Visuals', description: 'AI-generated graphics', type: 'ai-generation', provider: 'FLUX', estimatedTime: 60, estimatedCredits: 25, status: 'pending', isEditable: true, isOptional: false },
      { id: 's4', name: 'Optimize Formats', description: 'Resize for each platform', type: 'transformation', estimatedTime: 30, estimatedCredits: 5, status: 'pending', isEditable: false, isOptional: false },
    ],
    estimatedTotalTime: 3,
    estimatedTotalCredits: 55,
    qualityLevel: 'standard',
    popularity: 1890,
    tags: ['marketing', 'social'],
  },
  {
    id: 'video-to-shorts',
    name: 'Long Video to Shorts',
    description: 'Extract viral moments from long-form video content',
    category: 'repurposing',
    inputTypes: ['video'],
    outputTypes: ['video-shorts', 'video-vertical'],
    stages: [
      { id: 's1', name: 'Transcribe Video', description: 'Speech-to-text with Whisper', type: 'content-extraction', provider: 'OpenAI', estimatedTime: 120, estimatedCredits: 15, status: 'pending', isEditable: false, isOptional: false },
      { id: 's2', name: 'Detect Highlights', description: 'AI finds engaging moments', type: 'ai-generation', estimatedTime: 90, estimatedCredits: 20, status: 'pending', isEditable: true, isOptional: false },
      { id: 's3', name: 'Auto-Crop & Reframe', description: 'Smart vertical reframing', type: 'transformation', estimatedTime: 60, estimatedCredits: 10, status: 'pending', isEditable: true, isOptional: false },
      { id: 's4', name: 'Add Captions', description: 'Animated subtitles', type: 'enhancement', estimatedTime: 45, estimatedCredits: 10, status: 'pending', isEditable: true, isOptional: true },
      { id: 's5', name: 'Export Clips', description: 'Generate multiple shorts', type: 'export', estimatedTime: 90, estimatedCredits: 5, status: 'pending', isEditable: false, isOptional: false },
    ],
    estimatedTotalTime: 8,
    estimatedTotalCredits: 60,
    qualityLevel: 'advanced',
    popularity: 3120,
    tags: ['popular', 'shorts', 'tiktok', 'reels'],
  },
  {
    id: 'training-module',
    name: 'Training Module Creator',
    description: 'Build SCORM-compliant training from any content',
    category: 'training',
    inputTypes: ['document', 'presentation', 'video'],
    outputTypes: ['scorm', 'interactive-html'],
    stages: [
      { id: 's1', name: 'Structure Analysis', description: 'Identify learning objectives', type: 'content-extraction', estimatedTime: 60, estimatedCredits: 15, status: 'pending', isEditable: true, isOptional: false },
      { id: 's2', name: 'Generate Quizzes', description: 'AI creates assessments', type: 'ai-generation', estimatedTime: 45, estimatedCredits: 20, status: 'pending', isEditable: true, isOptional: false },
      { id: 's3', name: 'Add Interactivity', description: 'Click-to-reveal, hotspots', type: 'enhancement', estimatedTime: 60, estimatedCredits: 15, status: 'pending', isEditable: true, isOptional: true },
      { id: 's4', name: 'Package SCORM', description: 'LMS-ready export', type: 'export', estimatedTime: 30, estimatedCredits: 5, status: 'pending', isEditable: false, isOptional: false },
    ],
    estimatedTotalTime: 4,
    estimatedTotalCredits: 55,
    qualityLevel: 'premium',
    popularity: 890,
    tags: ['enterprise', 'lms', 'training'],
  },
];

const CATEGORY_LABELS: Record<PipelineCategory, { label: string; emoji: string }> = {
  'presentation': { label: 'Presentations', emoji: '📊' },
  'video-production': { label: 'Video Production', emoji: '🎬' },
  'repurposing': { label: 'Content Repurposing', emoji: '♻️' },
  'training': { label: 'Training & E-Learning', emoji: '📚' },
  'marketing': { label: 'Marketing', emoji: '📢' },
  'social-media': { label: 'Social Media', emoji: '📱' },
  'sales': { label: 'Sales Enablement', emoji: '💼' },
  'localization': { label: 'Localization', emoji: '🌍' },
  'documentation': { label: 'Documentation', emoji: '📝' },
  'data-visualization': { label: 'Data & Charts', emoji: '📈' },
  'interactive': { label: 'Interactive', emoji: '🎮' },
  'immersive': { label: 'VR/AR/3D', emoji: '🥽' },
  'custom': { label: 'Custom', emoji: '⚙️' },
};

// ============================================================================
// PIPELINE TEMPLATE CARD
// ============================================================================

interface PipelineTemplateCardProps {
  template: PipelineTemplate;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

function PipelineTemplateCard({ 
  template, 
  isSelected, 
  onSelect,
  className 
}: PipelineTemplateCardProps) {
  const category = CATEGORY_LABELS[template.category];
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary border-primary",
        className
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{category.emoji}</span>
            <div>
              <h4 className="font-medium text-sm">{template.name}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {template.description}
              </p>
            </div>
          </div>
          {isSelected && (
            <div className="p-1 rounded-full bg-primary text-primary-foreground">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{template.estimatedTotalTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="h-3 w-3" />
            <span>{template.estimatedTotalCredits} credits</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            <span>{template.popularity.toLocaleString()} uses</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          <Badge variant="secondary" className="text-[10px] capitalize">
            {template.qualityLevel}
          </Badge>
          {template.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PIPELINE STAGE ROW
// ============================================================================

interface PipelineStageRowProps {
  stage: PipelineStage;
  index: number;
  isActive: boolean;
  isEditable: boolean;
  onEdit?: () => void;
  onSkip?: () => void;
  className?: string;
}

function PipelineStageRow({
  stage,
  index,
  isActive,
  isEditable,
  onEdit,
  onSkip,
  className
}: PipelineStageRowProps) {
  const statusIcons = {
    pending: <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />,
    running: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
    completed: <Check className="h-4 w-4 text-green-500" />,
    failed: <AlertCircle className="h-4 w-4 text-destructive" />,
    skipped: <SkipForward className="h-4 w-4 text-muted-foreground" />,
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg transition-all",
      isActive && "bg-primary/5 border border-primary/20",
      stage.status === 'completed' && "opacity-60",
      stage.status === 'skipped' && "opacity-40",
      className
    )}>
      <div className="flex items-center justify-center w-6 h-6">
        {statusIcons[stage.status]}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{stage.name}</span>
          {stage.isOptional && (
            <Badge variant="outline" className="text-[9px]">Optional</Badge>
          )}
          {stage.provider && (
            <Badge variant="secondary" className="text-[9px]">{stage.provider}</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{stage.description}</p>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{stage.estimatedTime}s</span>
        <span>•</span>
        <span>{stage.estimatedCredits}c</span>
      </div>
      
      {isEditable && stage.isEditable && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
          <Edit3 className="h-3 w-3" />
        </Button>
      )}
      
      {stage.isOptional && stage.status === 'pending' && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onSkip}>
          <SkipForward className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// PIPELINE PREVIEW PANEL
// ============================================================================

interface PipelinePreviewPanelProps {
  pipeline: ActivePipeline;
  mode: PipelineMode;
  onModeChange: (mode: PipelineMode) => void;
  onStart: () => void;
  onStageEdit: (stageId: string) => void;
  className?: string;
}

function PipelinePreviewPanel({
  pipeline,
  mode,
  onModeChange,
  onStart,
  onStageEdit,
  className
}: PipelinePreviewPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const totalCredits = pipeline.stages.reduce((sum, s) => sum + s.estimatedCredits, 0);
  const totalTime = pipeline.stages.reduce((sum, s) => sum + s.estimatedTime, 0);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Pipeline Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mode:</span>
            <div className="flex items-center gap-2 bg-muted rounded-full p-1">
              <Button
                variant={mode === 'auto' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-xs rounded-full"
                onClick={() => onModeChange('auto')}
              >
                <Wand2 className="h-3 w-3 mr-1" />
                Auto
              </Button>
              <Button
                variant={mode === 'custom' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-xs rounded-full"
                onClick={() => onModeChange('custom')}
              >
                <Settings2 className="h-3 w-3 mr-1" />
                Custom
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">{pipeline.stages.length}</p>
            <p className="text-[10px] text-muted-foreground">Stages</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">{Math.ceil(totalTime / 60)}m</p>
            <p className="text-[10px] text-muted-foreground">Est. Time</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">{totalCredits}</p>
            <p className="text-[10px] text-muted-foreground">Credits</p>
          </div>
        </div>
        
        {/* Stage List */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="text-xs font-medium">Pipeline Stages</span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-1">
            {pipeline.stages.map((stage, index) => (
              <PipelineStageRow
                key={stage.id}
                stage={stage}
                index={index}
                isActive={pipeline.currentStageIndex === index}
                isEditable={mode === 'custom'}
                onEdit={() => onStageEdit(stage.id)}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
        
        {/* Progress (if running) */}
        {pipeline.status === 'running' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Processing...</span>
              <span>{pipeline.overallProgress}%</span>
            </div>
            <Progress value={pipeline.overallProgress} />
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onStart}>
            <Play className="h-4 w-4 mr-2" />
            Start Pipeline
          </Button>
          <Button variant="outline" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPLETE LAYER 2 COMPONENT
// ============================================================================

interface Layer2PipelineProps {
  onComplete: () => void;
  className?: string;
}

export function Layer2Pipeline({ onComplete, className }: Layer2PipelineProps) {
  const { project, setPipeline, startPipeline } = useEditor();
  const [selectedCategory, setSelectedCategory] = useState<PipelineCategory | 'all'>('all');
  const [pipelineMode, setPipelineMode] = useState<PipelineMode>('auto');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return PIPELINE_TEMPLATES;
    return PIPELINE_TEMPLATES.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  const selectedTemplate = PIPELINE_TEMPLATES.find(t => t.id === selectedTemplateId);

  const handleTemplateSelect = (template: PipelineTemplate) => {
    setSelectedTemplateId(template.id);
    setPipeline(template);
  };

  const handleStart = async () => {
    await startPipeline();
    onComplete();
  };

  return (
    <div className={cn("grid lg:grid-cols-[1fr,360px] gap-6", className)}>
      {/* Left: Template Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Select Pipeline</h3>
          <Badge variant="outline">{filteredTemplates.length} templates</Badge>
        </div>

        {/* Category Filter */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            <Button
              variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {Object.entries(CATEGORY_LABELS).slice(0, 6).map(([key, { label, emoji }]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(key as PipelineCategory)}
              >
                {emoji} {label}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Template Grid */}
        <div className="grid sm:grid-cols-2 gap-3">
          {filteredTemplates.map((template) => (
            <PipelineTemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              onSelect={() => handleTemplateSelect(template)}
            />
          ))}
        </div>
      </div>

      {/* Right: Pipeline Preview */}
      <div className="space-y-4">
        {project.pipeline ? (
          <PipelinePreviewPanel
            pipeline={project.pipeline}
            mode={pipelineMode}
            onModeChange={setPipelineMode}
            onStart={handleStart}
            onStageEdit={(id) => console.log('Edit stage:', id)}
          />
        ) : (
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              Select a pipeline template to see the preview
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Layer2Pipeline;
