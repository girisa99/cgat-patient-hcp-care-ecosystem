/**
 * CONTENT REPURPOSING PANEL
 * Transform videos into shorts, clips, thumbnails, and other formats
 * Wires dormant pipelines: video-shorts, video-thumbnail, video-captioning
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Video,
  Image,
  Scissors,
  Subtitles,
  Wand2,
  Play,
  Loader2,
  CheckCircle,
  Clock,
  Sparkles,
  LayoutGrid,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ProductionArtifacts } from '@/hooks/useGenieCastSession';

// ──────────────────────────────────────────────────────────────────────────────
// SESSION PROPS — connects PRODUCE → PUBLISH repurposing
// ──────────────────────────────────────────────────────────────────────────────

export interface ContentRepurposingSessionProps {
  /** Production artifacts from castSession (assembled video, scene videos, etc.) */
  productionArtifacts?: ProductionArtifacts | null;
  /** Title of the current session's content */
  sessionTitle?: string;
  /** Primary platform for format optimization hints */
  primaryPlatform?: string;
  /** Selected aspect ratio from CREATE */
  selectedAspectRatio?: string;
}

// Repurposing pipelines (activating dormant pipelines from registry)
const REPURPOSE_PIPELINES = [
  {
    id: 'video-shorts',
    name: 'AI Shorts',
    description: 'Create vertical shorts for TikTok, Reels, Shorts',
    icon: Smartphone,
    outputFormat: '9:16',
    duration: '15-60s',
    platforms: ['TikTok', 'Reels', 'Shorts'],
  },
  {
    id: 'video-clips',
    name: 'Key Clips',
    description: 'Extract highlight clips from long videos',
    icon: Scissors,
    outputFormat: '16:9',
    duration: '30-90s',
    platforms: ['YouTube', 'LinkedIn', 'Twitter'],
  },
  {
    id: 'video-thumbnails',
    name: 'Thumbnails',
    description: 'Generate AI-optimized thumbnails',
    icon: Image,
    outputFormat: '16:9 / 1:1',
    duration: 'Static',
    platforms: ['All platforms'],
  },
  {
    id: 'video-captioning',
    name: 'Auto Captions',
    description: 'Add multi-language captions to videos',
    icon: Subtitles,
    outputFormat: 'SRT/VTT',
    duration: 'Same as source',
    platforms: ['All platforms'],
  },
  {
    id: 'video-square',
    name: 'Square Format',
    description: 'Convert to 1:1 for Instagram/Facebook feed',
    icon: LayoutGrid,
    outputFormat: '1:1',
    duration: 'Same as source',
    platforms: ['Instagram', 'Facebook'],
  },
];

interface VideoSource {
  id: string;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
}

interface RepurposeJob {
  id: string;
  sourceVideoId: string;
  pipelineId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  createdAt: Date;
}

export const ContentRepurposingPanel: React.FC<ContentRepurposingSessionProps> = ({
  productionArtifacts,
  sessionTitle,
  primaryPlatform,
  selectedAspectRatio,
} = {}) => {
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [selectedPipelines, setSelectedPipelines] = useState<string[]>([]);
  const [jobs, setJobs] = useState<RepurposeJob[]>([]);
  const queryClient = useQueryClient();

  // Session-derived video source (from PRODUCE phase)
  const sessionVideoSource: VideoSource | null = productionArtifacts?.assembledVideoUrl ? {
    id: 'session-current',
    title: sessionTitle || 'Current Session Video',
    video_url: productionArtifacts.assembledVideoUrl,
    thumbnail_url: productionArtifacts.thumbnailUrls?.[0] || null,
    duration_seconds: null,
  } : null;

  // Fetch source videos from DB (fallback / additional options)
  const { data: dbVideos = [], isLoading } = useQuery({
    queryKey: ['repurpose-source-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_videos')
        .select('id, title, video_url, thumbnail_url')
        .eq('generation_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as VideoSource[];
    },
  });

  // Merge session video with DB videos (session first, no duplicates)
  const sourceVideos = sessionVideoSource
    ? [sessionVideoSource, ...dbVideos.filter(v => v.video_url !== sessionVideoSource.video_url)]
    : dbVideos;

  // Auto-select session video if available and nothing selected yet
  React.useEffect(() => {
    if (sessionVideoSource && !selectedVideo) {
      setSelectedVideo(sessionVideoSource.id);
    }
  }, [sessionVideoSource?.id]);

  // Toggle pipeline selection
  const togglePipeline = (pipelineId: string) => {
    setSelectedPipelines(prev => 
      prev.includes(pipelineId) 
        ? prev.filter(p => p !== pipelineId)
        : [...prev, pipelineId]
    );
  };

  // Map pipeline IDs to edge function + params
  const PIPELINE_EDGE_MAP: Record<string, {
    edgeFn: string;
    buildPayload: (videoUrl: string) => Record<string, unknown>;
  }> = {
    'video-shorts': {
      edgeFn: 'shorts-generator',
      buildPayload: (videoUrl) => ({
        action: 'generate',
        sourceVideoUrl: videoUrl,
        platform: 'all',
        options: { maxClips: 3, minDuration: 15, maxDuration: 60, aspectRatio: '9:16' as const, includeSubtitles: true, subtitleStyle: 'bold', addHooks: true, addCTA: true },
      }),
    },
    'video-clips': {
      edgeFn: 'magic-clips-generator',
      buildPayload: (videoUrl) => ({
        sourceVideoUrl: videoUrl,
        platforms: ['youtube_shorts', 'linkedin', 'twitter'],
        mode: 'auto',
        addCaptions: true,
        language: 'en',
      }),
    },
    'video-thumbnails': {
      edgeFn: 'auto-thumbnail-generator',
      buildPayload: (videoUrl) => ({ videoUrl, count: 4, style: 'engagement' }),
    },
    'video-captioning': {
      edgeFn: 'ai-caption-generator',
      buildPayload: (videoUrl) => ({ videoUrl, language: 'en', format: 'srt' }),
    },
    'video-square': {
      edgeFn: 'ai-universal-processor',
      buildPayload: (videoUrl) => ({
        action: 'transcode_video',
        videoUrl,
        preset: 'square',
        width: 1080,
        height: 1080,
        codec: 'h264',
        fps: 30,
      }),
    },
  };

  // Start repurposing job — calls real edge functions
  const startRepurposing = async () => {
    if (!selectedVideo || selectedPipelines.length === 0) {
      toast.error('Please select a video and at least one pipeline');
      return;
    }

    const video = sourceVideos.find(v => v.id === selectedVideo);
    if (!video?.video_url) {
      toast.error('Selected video has no URL');
      return;
    }

    // Create jobs for each selected pipeline
    const newJobs: RepurposeJob[] = selectedPipelines.map(pipelineId => ({
      id: `job-${Date.now()}-${pipelineId}`,
      sourceVideoId: selectedVideo,
      pipelineId,
      status: 'queued' as const,
      progress: 0,
      createdAt: new Date(),
    }));

    setJobs(prev => [...newJobs, ...prev]);
    toast.success(`Started ${newJobs.length} repurposing job(s)`);

    // Fire real edge function calls in parallel
    for (const job of newJobs) {
      processJobViaEdgeFunction(job.id, job.pipelineId, video.video_url!);
    }

    // Reset selection
    setSelectedPipelines([]);
  };

  // Call the real edge function for a repurposing pipeline
  const processJobViaEdgeFunction = async (jobId: string, pipelineId: string, videoUrl: string) => {
    const mapping = PIPELINE_EDGE_MAP[pipelineId];
    if (!mapping) {
      setJobs(prev => prev.map(j =>
        j.id === jobId ? { ...j, status: 'failed', progress: 0 } : j
      ));
      toast.error(`Unknown pipeline: ${pipelineId}`);
      return;
    }

    // Mark as processing
    setJobs(prev => prev.map(j =>
      j.id === jobId ? { ...j, status: 'processing', progress: 20 } : j
    ));

    try {
      const { data, error } = await supabase.functions.invoke(mapping.edgeFn, {
        body: mapping.buildPayload(videoUrl),
      });

      if (error) throw error;

      // Extract output URL from response (different shapes per edge fn)
      const outputUrl = data?.clips?.[0]?.clipUrl
        || data?.generatedClips?.[0]?.outputUrl
        || data?.thumbnails?.[0]?.url
        || data?.captionUrl
        || data?.outputUrl
        || data?.url
        || null;

      setJobs(prev => prev.map(j =>
        j.id === jobId
          ? { ...j, status: 'completed', progress: 100, outputUrl: outputUrl || undefined }
          : j
      ));

      toast.success(`${pipelineId.replace('video-', '').replace('-', ' ')} completed`);
    } catch (err) {
      console.error(`Pipeline ${pipelineId} failed:`, err);
      setJobs(prev => prev.map(j =>
        j.id === jobId ? { ...j, status: 'failed', progress: 0 } : j
      ));
      toast.error(`${pipelineId} failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Content Repurposing
              </CardTitle>
              <CardDescription>
                Transform your videos into shorts, clips, and platform-optimized formats
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {sessionVideoSource && (
                <Badge variant="outline" className="text-xs text-primary border-primary/40">
                  Session Linked
                </Badge>
              )}
              <Badge className="bg-primary/10 text-primary">
                {REPURPOSE_PIPELINES.length} Pipelines Active
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Selection */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Source Video</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedVideo} onValueChange={setSelectedVideo}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a video..." />
              </SelectTrigger>
              <SelectContent>
                {sourceVideos.map((video) => (
                  <SelectItem key={video.id} value={video.id}>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span className="truncate max-w-[200px]">{video.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}

            {!isLoading && sourceVideos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No completed videos available</p>
                <p className="text-xs">Generate videos first in PRODUCE tab</p>
              </div>
            )}

            {selectedVideo && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Selected</p>
                <p className="text-xs text-muted-foreground truncate">
                  {sourceVideos.find(v => v.id === selectedVideo)?.title}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Selection */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Select Pipelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {REPURPOSE_PIPELINES.map((pipeline) => {
                const Icon = pipeline.icon;
                const isSelected = selectedPipelines.includes(pipeline.id);
                return (
                  <div
                    key={pipeline.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => togglePipeline(pipeline.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={isSelected}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{pipeline.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {pipeline.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {pipeline.outputFormat}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {pipeline.duration}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={startRepurposing}
                disabled={!selectedVideo || selectedPipelines.length === 0}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Repurposing ({selectedPipelines.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Repurposing Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {jobs.map((job) => {
                  const pipeline = REPURPOSE_PIPELINES.find(p => p.id === job.pipelineId);
                  const video = sourceVideos.find(v => v.id === job.sourceVideoId);
                  const Icon = pipeline?.icon || FileText;
                  
                  return (
                    <div 
                      key={job.id}
                      className="p-4 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{pipeline?.name}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {video?.title}
                          </span>
                        </div>
                        <Badge 
                          variant="outline"
                          className={cn(
                            job.status === 'completed' && 'text-green-600 border-green-200',
                            job.status === 'processing' && 'text-blue-600 border-blue-200',
                            job.status === 'queued' && 'text-gray-600 border-gray-200',
                            job.status === 'failed' && 'text-red-600 border-red-200',
                          )}
                        >
                          {job.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {job.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                          {job.status}
                        </Badge>
                      </div>
                      
                      {job.status === 'processing' && (
                        <Progress value={job.progress} className="h-2" />
                      )}
                      
                      {job.status === 'completed' && job.outputUrl && (
                        <Button size="sm" variant="outline" className="mt-2">
                          <Play className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
