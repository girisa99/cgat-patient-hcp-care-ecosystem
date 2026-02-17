/**
 * Video Export Panel - Convert presentation to video with voiceover
 * Part of Genie Spark - Mind to Media Production
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Video,
  Mic,
  Music,
  Play,
  Pause,
  Share2,
  Loader2,
  Check,
  Volume2,
  Youtube,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Link,
  Download,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePresentationToVideo, VOICE_OPTIONS } from '@/hooks/usePresentationToVideo';
import { PresentationSlide } from './types';
import { PublishTarget } from '@/services/presentationToVideoService';

interface VideoExportPanelProps {
  slides: PresentationSlide[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (videoUrl: string) => void;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: <Youtube className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  tiktok: <Music className="h-4 w-4" />,
  vimeo: <Video className="h-4 w-4" />,
  custom: <Link className="h-4 w-4" />,
};

export function VideoExportPanel({
  slides,
  title,
  isOpen,
  onClose,
  onComplete,
}: VideoExportPanelProps) {
  const {
    isGenerating,
    isPublishing,
    progress,
    currentStep,
    result,
    publishResults,
    generateVideo,
    publishToTargets,
    getVoiceOptions,
    reset,
  } = usePresentationToVideo();

  // Configuration state
  const [voiceProvider, setVoiceProvider] = useState<'openai' | 'elevenlabs' | 'amazon-polly'>('openai');
  const [voiceId, setVoiceId] = useState('alloy');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [backgroundMusic, setBackgroundMusic] = useState(true);
  const [musicStyle, setMusicStyle] = useState<'corporate' | 'upbeat' | 'calm' | 'none'>('corporate');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('16:9');
  const [slideDuration, setSlideDuration] = useState(5);

  // Publishing state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showPublishOptions, setShowPublishOptions] = useState(false);

  // Preview state
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get available voices for selected provider
  const availableVoices = getVoiceOptions(voiceProvider);

  // Handle provider change
  const handleProviderChange = (provider: 'openai' | 'elevenlabs' | 'amazon-polly') => {
    setVoiceProvider(provider);
    setVoiceId(VOICE_OPTIONS[provider][0].id);
  };

  // Handle generate video
  const handleGenerateVideo = async () => {
    const slideData = slides.filter(s => !s.isSkipped).map(s => ({
      id: s.id,
      title: s.title,
      content: {
        bullets: s.content.bullets?.map(b => b.text) || [],
        speakerNotes: s.speakerNotes,
      },
      image: s.image ? { url: s.image.url, base64: s.image.base64 } : undefined,
    }));

    await generateVideo({
      slides: slideData,
      title,
      voiceProvider,
      voiceId,
      voiceSpeed,
      backgroundMusic,
      musicStyle: backgroundMusic ? musicStyle : 'none',
      resolution,
      aspectRatio,
      slideDuration,
    });
  };

  // Handle play preview
  const handlePlayPreview = (audioUrl: string) => {
    if (previewAudio) {
      previewAudio.pause();
    }

    const audio = new Audio(audioUrl);
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setPreviewAudio(audio);
    setIsPlaying(true);
  };

  // Handle stop preview
  const handleStopPreview = () => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // Toggle platform selection
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Handle publish
  const handlePublish = async () => {
    if (!result?.slideAudios || selectedPlatforms.length === 0) {
      toast.error('Please generate video and select platforms first');
      return;
    }

    const targets: PublishTarget[] = selectedPlatforms.map(platform => ({
      platform: platform as PublishTarget['platform'],
      options: {
        title,
        visibility: 'public',
      },
    }));

    await publishToTargets('video-url', targets);
    toast.success('Published to all selected platforms!');
  };

  // Handle download all audio
  const handleDownloadAudio = () => {
    if (!result?.slideAudios) return;

    result.slideAudios.forEach((audio, index) => {
      const link = document.createElement('a');
      link.href = audio.audioUrl;
      link.download = `${title}-slide-${index + 1}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    toast.success('Audio files downloaded!');
  };

  // Handle close
  const handleClose = () => {
    handleStopPreview();
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Convert to Video
          </DialogTitle>
          <DialogDescription>
            Generate video with voiceover and publish anywhere
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Voice Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mic className="h-4 w-4 text-purple-500" />
                  Voiceover Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Voice Provider */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Voice Provider</Label>
                    <Select value={voiceProvider} onValueChange={handleProviderChange}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI TTS</SelectItem>
                        <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                        <SelectItem value="amazon-polly">Amazon Polly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Voice Selection */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Voice</Label>
                    <Select value={voiceId} onValueChange={setVoiceId}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVoices.map(voice => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name} ({voice.style})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Speed */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Speed: {voiceSpeed}x</Label>
                    <Slider
                      value={[voiceSpeed]}
                      onValueChange={([v]) => setVoiceSpeed(v)}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Background Music */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Music className="h-4 w-4 text-pink-500" />
                  Background Music
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={backgroundMusic} onCheckedChange={setBackgroundMusic} />
                    <Label className="text-sm">Enable background music</Label>
                  </div>

                  {backgroundMusic && (
                    <Select value={musicStyle} onValueChange={(v) => setMusicStyle(v as typeof musicStyle)}>
                      <SelectTrigger className="w-40 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="upbeat">Upbeat</SelectItem>
                        <SelectItem value="calm">Calm</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Video Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-500" />
                  Video Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Resolution</Label>
                    <Select value={resolution} onValueChange={(v) => setResolution(v as typeof resolution)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p HD</SelectItem>
                        <SelectItem value="1080p">1080p Full HD</SelectItem>
                        <SelectItem value="4k">4K Ultra HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as typeof aspectRatio)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Slide Duration: {slideDuration}s</Label>
                    <Slider
                      value={[slideDuration]}
                      onValueChange={([v]) => setSlideDuration(v)}
                      min={3}
                      max={15}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generation Progress */}
            {isGenerating && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        {currentStep}
                      </span>
                      <span className="text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {result?.success && result.slideAudios && (
              <>
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                      <Check className="h-4 w-4" />
                      Video Generated Successfully
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">
                        {result.slideAudios.length} slides
                      </Badge>
                      <Badge variant="outline">
                        {Math.ceil(result.duration || 0)} seconds
                      </Badge>
                      <Badge variant="outline">
                        {resolution}
                      </Badge>
                    </div>

                    {/* Preview slides */}
                    <div className="space-y-2">
                      <Label className="text-xs">Preview Audio:</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {result.slideAudios.slice(0, 4).map((audio, idx) => (
                          <Button
                            key={audio.slideId}
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => isPlaying ? handleStopPreview() : handlePlayPreview(audio.audioUrl)}
                          >
                            {isPlaying ? (
                              <Pause className="h-3 w-3 mr-2" />
                            ) : (
                              <Play className="h-3 w-3 mr-2" />
                            )}
                            Slide {idx + 1} ({Math.ceil(audio.duration)}s)
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Publish Options */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-cyan-500" />
                      Publish to Platforms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { platform: 'youtube', name: 'YouTube' },
                        { platform: 'linkedin', name: 'LinkedIn' },
                        { platform: 'twitter', name: 'Twitter/X' },
                        { platform: 'facebook', name: 'Facebook' },
                        { platform: 'instagram', name: 'Instagram' },
                        { platform: 'tiktok', name: 'TikTok' },
                        { platform: 'vimeo', name: 'Vimeo' },
                      ].map(({ platform, name }) => (
                        <Button
                          key={platform}
                          variant={selectedPlatforms.includes(platform) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => togglePlatform(platform)}
                          className={cn(
                            'gap-2',
                            selectedPlatforms.includes(platform) && 'bg-primary'
                          )}
                        >
                          {PLATFORM_ICONS[platform]}
                          {name}
                          {selectedPlatforms.includes(platform) && (
                            <Check className="h-3 w-3" />
                          )}
                        </Button>
                      ))}
                    </div>

                    {/* Publish Results */}
                    {publishResults.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs">Published:</Label>
                        {publishResults.map((result, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                            <span className="flex items-center gap-2 text-sm">
                              {PLATFORM_ICONS[result.platform]}
                              {result.platform}
                            </span>
                            {result.success ? (
                              <Badge className="bg-green-500 text-white">
                                <Check className="h-3 w-3 mr-1" />
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Failed</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>

          <div className="flex items-center gap-2">
            {result?.success && (
              <>
                <Button variant="outline" onClick={handleDownloadAudio}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Audio
                </Button>

                {selectedPlatforms.length > 0 && (
                  <Button onClick={handlePublish} disabled={isPublishing}>
                    {isPublishing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4 mr-2" />
                    )}
                    Publish ({selectedPlatforms.length})
                  </Button>
                )}
              </>
            )}

            {!result?.success && (
              <Button onClick={handleGenerateVideo} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
