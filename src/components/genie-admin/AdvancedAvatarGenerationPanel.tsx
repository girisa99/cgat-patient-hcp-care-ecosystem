/**
 * ADVANCED AVATAR & 3D GENERATION PANEL
 * 
 * Admin interface for generating avatars, animations, and 3D content using:
 * - Alibaba: Wan2.2-Animate, Wan2.2-S2V, TaoAvatar, MACH, OmniAvatar
 * - Meshy: Text-to-3D, Image-to-3D, AI Texturing
 * - ModelsLab: AnimateDiff, SVD, Text-to-Video
 * - DeepSeek: Vision analysis for avatar/scene planning
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  User, Box, Sparkles, Video, Mic2, 
  Loader2, Play, Download, RefreshCw,
  Upload, Wand2, Camera, Layers
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ALIBABA_AVATAR_MODELS,
  MESHY_3D_MODELS,
  MODELSLAB_MODELS,
  DEEPSEEK_CAPABILITIES,
  AVATAR_PROVIDER_ROUTING,
  type AlibabaAvatarModel,
  type AvatarGenerationType
} from '@/config/avatar-3d-provider-matrix';

interface GenerationJob {
  id: string;
  model: string;
  provider: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number;
  outputUrl?: string;
  error?: string;
  startedAt: Date;
}

export const AdvancedAvatarGenerationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('alibaba');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  
  // Generation options
  const [options, setOptions] = useState({
    perspective: 'bust' as 'portrait' | 'bust' | 'full_body',
    resolution: '1080p' as '720p' | '1080p' | '4k',
    duration: 10,
    fps: 30,
    enableRelighting: true,
    enableLipSync: true,
    outputFormat: 'mp4' as 'mp4' | 'webm' | 'glb' | 'gltf',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAudioFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedModel) {
      toast.error('Please select a model');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    const jobId = `job-${Date.now()}`;
    const newJob: GenerationJob = {
      id: jobId,
      model: selectedModel,
      provider: activeTab,
      status: 'processing',
      progress: 0,
      startedAt: new Date(),
    };

    setJobs(prev => [newJob, ...prev]);

    try {
      // Determine which edge function to call based on provider
      let functionName = '';
      let requestBody: Record<string, unknown> = {};

      switch (activeTab) {
        case 'alibaba':
          functionName = 'alibaba-avatar-generator';
          requestBody = {
            model: selectedModel,
            prompt,
            sourceImage,
            audioBase64: audioFile,
            perspective: options.perspective,
            resolution: options.resolution,
            duration: options.duration,
            fps: options.fps,
            enableRelighting: options.enableRelighting,
            outputFormat: options.outputFormat,
          };
          break;
        case 'meshy':
          functionName = 'modelslab-media';
          requestBody = {
            type: '3d',
            prompt,
            init_image: sourceImage,
          };
          break;
        case 'modelslab':
          functionName = 'modelslab-media';
          requestBody = {
            type: selectedModel.includes('3d') ? '3d' : 'video',
            prompt,
            init_image: sourceImage,
            duration: options.duration,
            fps: options.fps,
          };
          break;
        case 'deepseek':
          functionName = 'deepseek-vision';
          requestBody = {
            prompt,
            image: sourceImage,
            task: 'avatar_planning',
          };
          break;
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody,
      });

      clearInterval(progressInterval);

      if (error) throw error;

      setProgress(100);
      setJobs(prev => prev.map(j => 
        j.id === jobId 
          ? { ...j, status: 'complete', progress: 100, outputUrl: data?.outputUrl }
          : j
      ));
      toast.success(`${selectedModel} generation complete!`);
    } catch (error) {
      console.error('Generation error:', error);
      setJobs(prev => prev.map(j => 
        j.id === jobId 
          ? { ...j, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
          : j
      ));
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const getModelsForProvider = () => {
    switch (activeTab) {
      case 'alibaba':
        return ALIBABA_AVATAR_MODELS;
      case 'meshy':
        return MESHY_3D_MODELS;
      case 'modelslab':
        return MODELSLAB_MODELS;
      case 'deepseek':
        return DEEPSEEK_CAPABILITIES;
      default:
        return [];
    }
  };

  const renderModelCapabilities = (model: AlibabaAvatarModel) => (
    <div className="space-y-2 mt-2">
      <p className="text-sm text-muted-foreground">{model.description}</p>
      <div className="flex flex-wrap gap-1">
        {model.capabilities.slice(0, 4).map((cap, i) => (
          <Badge key={i} variant="outline" className="text-xs">
            {cap}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2 text-xs text-muted-foreground">
        <span>Latency: {model.latency}</span>
        <span>•</span>
        <span>Tier: {model.tier}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Provider & Model Selection */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Avatar & 3D Studio
          </CardTitle>
          <CardDescription>
            Generate avatars, animations, and 3D with multi-provider AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedModel(''); }}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="alibaba" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                Alibaba
              </TabsTrigger>
              <TabsTrigger value="meshy" className="text-xs">
                <Box className="w-3 h-3 mr-1" />
                Meshy
              </TabsTrigger>
              <TabsTrigger value="modelslab" className="text-xs">
                <Video className="w-3 h-3 mr-1" />
                Models
              </TabsTrigger>
              <TabsTrigger value="deepseek" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                DeepSeek
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label>Select Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a model..." />
              </SelectTrigger>
              <SelectContent>
                {getModelsForProvider().map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {'tier' in model && (
                        <Badge variant="outline" className="text-xs ml-2">
                          {model.tier}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show model details */}
          {selectedModel && activeTab === 'alibaba' && (
            <div className="p-3 bg-muted/50 rounded-lg">
              {renderModelCapabilities(
                ALIBABA_AVATAR_MODELS.find(m => m.id === selectedModel)!
              )}
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label>Prompt / Description</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the avatar, animation, or 3D model..."
              rows={3}
            />
          </div>

          {/* Source Image Upload */}
          <div className="space-y-2">
            <Label>Source Image (Optional)</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs"
              />
              {sourceImage && (
                <Badge variant="outline" className="text-emerald-600">
                  ✓ Uploaded
                </Badge>
              )}
            </div>
          </div>

          {/* Audio Upload (for S2V models) */}
          {(selectedModel === 'wan2.2-s2v' || selectedModel === 'omni-avatar') && (
            <div className="space-y-2">
              <Label>Audio Input (Required)</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="text-xs"
                />
                {audioFile && (
                  <Badge variant="outline" className="text-emerald-600">
                    <Mic2 className="w-3 h-3 mr-1" />
                    Audio Ready
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Middle: Options & Preview */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Generation Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Perspective */}
          <div className="space-y-2">
            <Label>Perspective</Label>
            <Select 
              value={options.perspective} 
              onValueChange={(v: 'portrait' | 'bust' | 'full_body') => 
                setOptions(prev => ({ ...prev, perspective: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Portrait (Head only)</SelectItem>
                <SelectItem value="bust">Bust (Head & Shoulders)</SelectItem>
                <SelectItem value="full_body">Full Body</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <Label>Resolution</Label>
            <Select 
              value={options.resolution} 
              onValueChange={(v: '720p' | '1080p' | '4k') => 
                setOptions(prev => ({ ...prev, resolution: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720p">720p (Fast)</SelectItem>
                <SelectItem value="1080p">1080p (Recommended)</SelectItem>
                <SelectItem value="4k">4K (Premium)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration: {options.duration}s</Label>
            <Input
              type="range"
              min="5"
              max="60"
              value={options.duration}
              onChange={(e) => setOptions(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            />
          </div>

          {/* FPS */}
          <div className="space-y-2">
            <Label>FPS: {options.fps}</Label>
            <Input
              type="range"
              min="24"
              max="60"
              step="6"
              value={options.fps}
              onChange={(e) => setOptions(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="relighting">Enable Relighting (LoRA)</Label>
              <Switch
                id="relighting"
                checked={options.enableRelighting}
                onCheckedChange={(c) => setOptions(prev => ({ ...prev, enableRelighting: c }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="lipsync">Enable Lip-Sync</Label>
              <Switch
                id="lipsync"
                checked={options.enableLipSync}
                onCheckedChange={(c) => setOptions(prev => ({ ...prev, enableLipSync: c }))}
              />
            </div>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select 
              value={options.outputFormat} 
              onValueChange={(v: 'mp4' | 'webm' | 'glb' | 'gltf') => 
                setOptions(prev => ({ ...prev, outputFormat: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4 Video</SelectItem>
                <SelectItem value="webm">WebM Video</SelectItem>
                <SelectItem value="glb">GLB (3D)</SelectItem>
                <SelectItem value="gltf">glTF (3D)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button 
            className="w-full" 
            onClick={handleGenerate}
            disabled={isGenerating || !selectedModel}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>

          {isGenerating && (
            <Progress value={progress} className="w-full" />
          )}
        </CardContent>
      </Card>

      {/* Right: Job History */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Generation Queue
          </CardTitle>
          <CardDescription>
            Recent generation jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[450px]">
            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Camera className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground text-sm">
                  No generations yet. Select a model and generate!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div 
                    key={job.id}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{job.model}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {job.provider}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          job.status === 'complete' ? 'default' :
                          job.status === 'error' ? 'destructive' :
                          'outline'
                        }
                        className="text-xs"
                      >
                        {job.status}
                      </Badge>
                    </div>
                    
                    {job.status === 'processing' && (
                      <Progress value={job.progress} className="h-1" />
                    )}
                    
                    {job.status === 'complete' && job.outputUrl && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Play className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}
                    
                    {job.status === 'error' && (
                      <p className="text-xs text-destructive">{job.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAvatarGenerationPanel;
