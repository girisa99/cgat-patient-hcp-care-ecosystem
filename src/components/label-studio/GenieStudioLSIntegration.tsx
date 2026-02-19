/**
 * Genie Suite Label Studio Integration
 * Comprehensive integration across all Genie Suite workflows:
 * - Scripts: Quality, structure, tone annotation
 * - Video: Trimming, stitching, best moments, scene detection
 * - Audio: Voice quality, emotion, transcription accuracy
 * - Clips: AI-selected clips ranking (RLHF)
 * - Content: Custom taxonomy and competitive labeling
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLabelStudio, type LSProject, type LSTask } from '@/hooks/useLabelStudio';
import { useMasterToast } from '@/hooks/useMasterToast';
import { 
  FileText, Video, Mic2, Scissors, Layers, Tag,
  Sparkles, Brain, Target, Upload, Download, RefreshCw,
  ChevronDown, Loader2, CheckCircle2, Star, ThumbsUp,
  ThumbsDown, Wand2, BarChart3, Zap, Award
} from 'lucide-react';
import { toast } from 'sonner';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type LSIntegrationType = 
  | 'script_quality' 
  | 'video_trimming' 
  | 'scene_detection'
  | 'audio_quality' 
  | 'voice_emotion'
  | 'transcription_accuracy'
  | 'clip_ranking' 
  | 'content_tagging'
  | 'competitive_analysis';

export interface LSAnnotationTask {
  id: string;
  type: LSIntegrationType;
  data: any;
  metadata?: Record<string, any>;
  status: 'pending' | 'annotated' | 'reviewed';
  createdAt: string;
}

export interface LSIntegrationConfig {
  type: LSIntegrationType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'script' | 'video' | 'audio' | 'content';
  labelConfig: string;
  competitiveDifferentiator: string;
}

// =============================================================================
// INTEGRATION CONFIGURATIONS
// =============================================================================

export const LS_INTEGRATIONS: LSIntegrationConfig[] = [
  // Script Integrations
  {
    type: 'script_quality',
    name: 'Script Quality Analysis',
    description: 'Rate script structure, engagement, clarity, and call-to-action effectiveness',
    icon: FileText,
    category: 'script',
    competitiveDifferentiator: 'AI learns your brand voice and improves script suggestions over time',
    labelConfig: `
      <View>
        <Text name="script" value="$script"/>
        <Choices name="structure" toName="script" choice="single">
          <Choice value="Excellent - Clear intro, body, conclusion"/>
          <Choice value="Good - Minor structure improvements needed"/>
          <Choice value="Fair - Significant restructuring needed"/>
          <Choice value="Poor - Complete rewrite needed"/>
        </Choices>
        <Rating name="engagement" toName="script" maxRating="5"/>
        <Rating name="clarity" toName="script" maxRating="5"/>
        <Rating name="cta_effectiveness" toName="script" maxRating="5"/>
        <TextArea name="improvements" toName="script" placeholder="Suggested improvements..."/>
        <Labels name="tone" toName="script">
          <Label value="Professional"/>
          <Label value="Casual"/>
          <Label value="Humorous"/>
          <Label value="Urgent"/>
          <Label value="Educational"/>
        </Labels>
      </View>
    `,
  },
  
  // Video Integrations
  {
    type: 'video_trimming',
    name: 'Video Trim Points',
    description: 'Mark optimal start/end points, dead air, and filler content for auto-trimming',
    icon: Scissors,
    category: 'video',
    competitiveDifferentiator: 'Trains AI to auto-trim like a professional editor',
    labelConfig: `
      <View>
        <Video name="video" value="$video"/>
        <TimeSeriesLabels name="segments" toName="video">
          <Label value="Keep" background="#22c55e"/>
          <Label value="Trim" background="#ef4444"/>
          <Label value="Maybe" background="#f59e0b"/>
          <Label value="Dead Air" background="#6b7280"/>
          <Label value="Filler" background="#8b5cf6"/>
        </TimeSeriesLabels>
        <Choices name="trim_quality" toName="video">
          <Choice value="Professional - No trimming needed"/>
          <Choice value="Good - Minor trims"/>
          <Choice value="Needs Work - Significant trimming"/>
        </Choices>
      </View>
    `,
  },
  {
    type: 'scene_detection',
    name: 'Scene & Transition Detection',
    description: 'Label scene boundaries, transition types, and chapter markers',
    icon: Layers,
    category: 'video',
    competitiveDifferentiator: 'Auto-generates YouTube chapters and smart scene navigation',
    labelConfig: `
      <View>
        <Video name="video" value="$video"/>
        <TimeSeriesLabels name="scenes" toName="video">
          <Label value="Scene Start" background="#3b82f6"/>
          <Label value="Scene End" background="#1d4ed8"/>
          <Label value="Transition" background="#8b5cf6"/>
          <Label value="Chapter Marker" background="#22c55e"/>
          <Label value="Highlight Moment" background="#f59e0b"/>
          <Label value="B-Roll Opportunity" background="#ec4899"/>
        </TimeSeriesLabels>
        <TextArea name="chapter_title" toName="video" placeholder="Chapter title suggestion..."/>
      </View>
    `,
  },
  
  // Audio Integrations
  {
    type: 'audio_quality',
    name: 'Audio Quality Assessment',
    description: 'Rate audio clarity, background noise, volume consistency',
    icon: Mic2,
    category: 'audio',
    competitiveDifferentiator: 'AI learns optimal audio settings for different content types',
    labelConfig: `
      <View>
        <Audio name="audio" value="$audio"/>
        <Choices name="clarity" toName="audio">
          <Choice value="Crystal Clear"/>
          <Choice value="Good"/>
          <Choice value="Acceptable"/>
          <Choice value="Needs Enhancement"/>
          <Choice value="Poor - Re-record"/>
        </Choices>
        <Rating name="background_noise" toName="audio" maxRating="5"/>
        <Rating name="volume_consistency" toName="audio" maxRating="5"/>
        <Labels name="issues" toName="audio">
          <Label value="Echo"/>
          <Label value="Clipping"/>
          <Label value="Low Volume"/>
          <Label value="Background Noise"/>
          <Label value="Pops/Clicks"/>
          <Label value="Breath Sounds"/>
        </Labels>
      </View>
    `,
  },
  {
    type: 'voice_emotion',
    name: 'Voice Emotion Analysis',
    description: 'Label emotional tone, pacing, and delivery quality',
    icon: Sparkles,
    category: 'audio',
    competitiveDifferentiator: 'Emotion-aware TTS and voice coaching suggestions',
    labelConfig: `
      <View>
        <Audio name="audio" value="$audio"/>
        <TimeSeriesLabels name="emotion" toName="audio">
          <Label value="Neutral" background="#6b7280"/>
          <Label value="Happy" background="#22c55e"/>
          <Label value="Excited" background="#f59e0b"/>
          <Label value="Serious" background="#3b82f6"/>
          <Label value="Sad" background="#8b5cf6"/>
          <Label value="Urgent" background="#ef4444"/>
        </TimeSeriesLabels>
        <Choices name="pacing" toName="audio">
          <Choice value="Too Fast"/>
          <Choice value="Perfect"/>
          <Choice value="Too Slow"/>
        </Choices>
        <Rating name="delivery" toName="audio" maxRating="5"/>
      </View>
    `,
  },
  {
    type: 'transcription_accuracy',
    name: 'Transcription Accuracy',
    description: 'Verify and correct AI-generated transcriptions',
    icon: FileText,
    category: 'audio',
    competitiveDifferentiator: 'Continuously improving domain-specific transcription',
    labelConfig: `
      <View>
        <Audio name="audio" value="$audio"/>
        <Text name="ai_transcription" value="$ai_transcription"/>
        <TextArea name="corrected" toName="audio" placeholder="Correct the transcription if needed..."/>
        <Choices name="accuracy" toName="audio">
          <Choice value="Perfect - No corrections"/>
          <Choice value="Minor errors"/>
          <Choice value="Significant errors"/>
          <Choice value="Unusable - Major rewrite"/>
        </Choices>
        <Labels name="error_types" toName="audio">
          <Label value="Medical Terms"/>
          <Label value="Names"/>
          <Label value="Technical Jargon"/>
          <Label value="Accents"/>
          <Label value="Mumbling"/>
        </Labels>
      </View>
    `,
  },
  
  // Clip & Content Integrations
  {
    type: 'clip_ranking',
    name: 'Best Clips Ranking (RLHF)',
    description: 'Rank AI-selected clips to train better highlight detection',
    icon: Award,
    category: 'content',
    competitiveDifferentiator: 'RLHF-trained highlight reel generation unique to your content style',
    labelConfig: `
      <View>
        <Video name="clip_a" value="$clip_a"/>
        <Video name="clip_b" value="$clip_b"/>
        <Pairwise name="preference" toName="clip_a,clip_b">
          <Choice value="Clip A is better"/>
          <Choice value="Clip B is better"/>
          <Choice value="Equal"/>
        </Pairwise>
        <Choices name="reason" toName="clip_a">
          <Choice value="Better content"/>
          <Choice value="Better timing"/>
          <Choice value="Better visual quality"/>
          <Choice value="More engaging"/>
          <Choice value="Better audio"/>
        </Choices>
      </View>
    `,
  },
  {
    type: 'content_tagging',
    name: 'Smart Content Tagging',
    description: 'Apply custom taxonomy for searchable media library',
    icon: Tag,
    category: 'content',
    competitiveDifferentiator: 'AI auto-tags new content based on your custom taxonomy',
    labelConfig: `
      <View>
        <Video name="content" value="$content"/>
        <Labels name="category" toName="content">
          <Label value="Tutorial"/>
          <Label value="Interview"/>
          <Label value="Testimonial"/>
          <Label value="Product Demo"/>
          <Label value="Announcement"/>
          <Label value="Behind the Scenes"/>
        </Labels>
        <Labels name="mood" toName="content">
          <Label value="Professional"/>
          <Label value="Casual"/>
          <Label value="Energetic"/>
          <Label value="Calm"/>
          <Label value="Inspirational"/>
        </Labels>
        <Labels name="audience" toName="content">
          <Label value="B2B"/>
          <Label value="B2C"/>
          <Label value="Internal"/>
          <Label value="Healthcare"/>
          <Label value="Education"/>
        </Labels>
        <TextArea name="custom_tags" toName="content" placeholder="Custom tags..."/>
      </View>
    `,
  },
  {
    type: 'competitive_analysis',
    name: 'Competitive Differentiation',
    description: 'Analyze what makes your content unique vs competitors',
    icon: Target,
    category: 'content',
    competitiveDifferentiator: 'AI learns your competitive advantages and emphasizes them',
    labelConfig: `
      <View>
        <Video name="your_content" value="$your_content"/>
        <Video name="competitor" value="$competitor"/>
        <Choices name="differentiator" toName="your_content" choice="multiple">
          <Choice value="Better production quality"/>
          <Choice value="More engaging"/>
          <Choice value="Clearer messaging"/>
          <Choice value="Better call-to-action"/>
          <Choice value="More professional"/>
          <Choice value="More authentic"/>
          <Choice value="Better pacing"/>
        </Choices>
        <Rating name="overall_advantage" toName="your_content" maxRating="5"/>
        <TextArea name="insights" toName="your_content" placeholder="What makes this content stand out?"/>
      </View>
    `,
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface GenieStudioLSIntegrationProps {
  onTrainingComplete?: (type: LSIntegrationType, taskCount: number) => void;
  defaultCategory?: 'script' | 'video' | 'audio' | 'content';
}

export function GenieStudioLSIntegration({
  onTrainingComplete,
  defaultCategory = 'video',
}: GenieStudioLSIntegrationProps) {
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [selectedIntegration, setSelectedIntegration] = useState<LSIntegrationConfig | null>(null);
  const [pendingTasks, setPendingTasks] = useState<LSAnnotationTask[]>([]);
  const [projects, setProjects] = useState<LSProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [autoCapture, setAutoCapture] = useState(false);
  
  const { loading, listProjects, bulkImportTasks, getProjectStats } = useLabelStudio();
  const { showSuccess, showError } = useMasterToast();

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load LS projects:', error);
    }
  };

  const categoryIntegrations = LS_INTEGRATIONS.filter(i => i.category === activeCategory);

  // Add task to pending queue
  const addAnnotationTask = useCallback((type: LSIntegrationType, data: any, metadata?: Record<string, any>) => {
    const task: LSAnnotationTask = {
      id: `${type}-${Date.now()}`,
      type,
      data,
      metadata,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setPendingTasks(prev => [...prev, task]);
    return task.id;
  }, []);

  // Upload to Label Studio
  const uploadTasks = async () => {
    if (!selectedProjectId || pendingTasks.length === 0) {
      showError('Select a project and add tasks first');
      return;
    }

    setIsUploading(true);
    try {
      const tasks = pendingTasks.map(task => ({
        data: task.data,
        meta: { ...task.metadata, type: task.type },
      }));

      await bulkImportTasks(parseInt(selectedProjectId), tasks);
      
      const taskCount = pendingTasks.length;
      const type = pendingTasks[0]?.type;
      
      showSuccess(`${taskCount} tasks uploaded to Label Studio`);
      setPendingTasks([]);
      
      if (onTrainingComplete && type) {
        onTrainingComplete(type, taskCount);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload tasks');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Genie Suite × Label Studio
        </CardTitle>
        <CardDescription>
          Train AI to match your style across scripts, video, audio, and content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="script" className="gap-1">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Scripts</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-1">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="gap-1">
              <Mic2 className="w-4 h-4" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
          </TabsList>

          {['script', 'video', 'audio', 'content'].map(category => (
            <TabsContent key={category} value={category} className="space-y-4 mt-4">
              <div className="grid gap-3">
                {LS_INTEGRATIONS.filter(i => i.category === category).map(integration => (
                  <Card 
                    key={integration.type}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      selectedIntegration?.type === integration.type ? 'border-primary ring-1 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedIntegration(integration)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <integration.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{integration.name}</h4>
                            <Badge variant="outline" className="text-[10px]">
                              {category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {integration.description}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                            <Zap className="w-3 h-3" />
                            <span>{integration.competitiveDifferentiator}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Selected Integration Details */}
        {selectedIntegration && (
          <Card className="border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <selectedIntegration.icon className="w-4 h-4" />
                {selectedIntegration.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Selection */}
              <div className="space-y-2">
                <Label className="text-sm">Target Label Studio Project</Label>
                <div className="flex gap-2">
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.title || `Project ${project.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={loadProjects} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Auto-Capture Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <div>
                    <Label className="text-sm">Auto-Capture During Workflow</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically capture data for training
                    </p>
                  </div>
                </div>
                <Switch checked={autoCapture} onCheckedChange={setAutoCapture} />
              </div>

              {/* Pending Tasks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Pending Tasks</Label>
                  <Badge variant={pendingTasks.length > 0 ? 'default' : 'secondary'}>
                    {pendingTasks.filter(t => t.type === selectedIntegration.type).length} items
                  </Badge>
                </div>
              </div>

              {/* Upload Button */}
              <Button
                onClick={uploadTasks}
                disabled={isUploading || pendingTasks.length === 0 || !selectedProjectId}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to Label Studio
                  </>
                )}
              </Button>

              {/* Competitive Differentiator Highlight */}
              <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-start gap-2">
                  <Award className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-primary">Competitive Edge</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedIntegration.competitiveDifferentiator}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Scripts Trained', value: '24', icon: FileText },
            { label: 'Videos Analyzed', value: '156', icon: Video },
            { label: 'Audio Samples', value: '89', icon: Mic2 },
            { label: 'Content Tagged', value: '312', icon: Tag },
          ].map(stat => (
            <Card key={stat.label} className="p-3 text-center">
              <stat.icon className="w-4 h-4 mx-auto text-muted-foreground" />
              <div className="text-lg font-bold mt-1">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// HELPER HOOKS FOR SPECIFIC WORKFLOWS
// =============================================================================

/**
 * Hook for Script Quality Training
 */
export function useScriptTraining() {
  const addTask = useCallback((script: string, metadata?: Record<string, any>) => {
    return {
      id: `script-${Date.now()}`,
      type: 'script_quality' as LSIntegrationType,
      data: { script },
      metadata: { ...metadata, source: 'genie_studio' },
    };
  }, []);

  return { addScriptForTraining: addTask };
}

/**
 * Hook for Video Trimming Training
 */
export function useVideoTrimmingTraining() {
  const addTask = useCallback((videoUrl: string, duration: number, metadata?: Record<string, any>) => {
    return {
      id: `trim-${Date.now()}`,
      type: 'video_trimming' as LSIntegrationType,
      data: { video: videoUrl, duration },
      metadata: { ...metadata, source: 'recording_studio' },
    };
  }, []);

  return { addVideoForTrimTraining: addTask };
}

/**
 * Hook for Clip Ranking (RLHF)
 */
export function useClipRanking() {
  const addComparison = useCallback((clipA: string, clipB: string, metadata?: Record<string, any>) => {
    return {
      id: `rank-${Date.now()}`,
      type: 'clip_ranking' as LSIntegrationType,
      data: { clip_a: clipA, clip_b: clipB },
      metadata: { ...metadata, comparison_type: 'rlhf' },
    };
  }, []);

  return { addClipComparison: addComparison };
}

/**
 * Hook for Audio Quality Training
 */
export function useAudioTraining() {
  const addAudioSample = useCallback((audioUrl: string, transcription?: string, metadata?: Record<string, any>) => {
    return {
      id: `audio-${Date.now()}`,
      type: 'audio_quality' as LSIntegrationType,
      data: { audio: audioUrl, ai_transcription: transcription },
      metadata: { ...metadata, source: 'voice_recording' },
    };
  }, []);

  return { addAudioForTraining: addAudioSample };
}

/**
 * Hook for Content Tagging
 */
export function useContentTagging() {
  const addContent = useCallback((contentUrl: string, suggestedTags?: string[], metadata?: Record<string, any>) => {
    return {
      id: `content-${Date.now()}`,
      type: 'content_tagging' as LSIntegrationType,
      data: { content: contentUrl, suggested_tags: suggestedTags },
      metadata: { ...metadata, auto_tagged: !!suggestedTags?.length },
    };
  }, []);

  return { addContentForTagging: addContent };
}
