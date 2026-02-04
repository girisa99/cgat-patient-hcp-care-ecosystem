/**
 * Create Template Dialog
 * Supports: AI-Assisted Creation, Clone & Customize, Visual Builder
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Wand2,
  Copy,
  Layers,
  Sparkles,
  Globe2,
  Video,
  Box,
  User,
  Music,
  Mic,
  Loader2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { VideoBlueprint } from '@/hooks/useVideoBlueprints';

interface CreateTemplateDialogProps {
  onCreated?: () => void;
  templateToClone?: VideoBlueprint | null;
}

// Categories for templates
const TEMPLATE_CATEGORIES = [
  { value: 'marketing', label: 'Marketing', icon: '📈' },
  { value: 'educational', label: 'Educational', icon: '📚' },
  { value: 'storytelling', label: 'Storytelling', icon: '📖' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'corporate', label: 'Corporate', icon: '🏢' },
  { value: 'animation', label: 'Animation', icon: '🎨' },
  { value: '3d', label: '3D/VR', icon: '🧊' },
  { value: 'avatar', label: 'Avatar', icon: '👤' },
  { value: 'interactive', label: 'Interactive', icon: '🎮' },
];

// Video styles for selection
const VIDEO_STYLES = [
  { value: 'photorealistic', label: 'Photorealistic', icon: '📸' },
  { value: 'pixar', label: 'Pixar/Disney', icon: '🎪' },
  { value: 'anime', label: 'Anime', icon: '🎌' },
  { value: 'crayon', label: 'Crayon/Hand-drawn', icon: '🖍️' },
  { value: 'microworld', label: 'Microworld', icon: '🔬' },
  { value: 'whiteboard', label: 'Whiteboard', icon: '📝' },
  { value: 'cyber', label: 'Cyberpunk', icon: '🌆' },
  { value: 'stop_motion', label: 'Stop Motion', icon: '🎞️' },
  { value: 'motion_graphics', label: 'Motion Graphics', icon: '✨' },
  { value: 'documentary', label: 'Documentary', icon: '🎥' },
  { value: 'character_vlog', label: 'Character Vlog', icon: '🗣️' },
  { value: 'explainer', label: 'Explainer', icon: '💡' },
];

// AI Capabilities
const AI_CAPABILITIES = [
  { value: 'text_to_video', label: 'Text-to-Video', icon: '📹' },
  { value: 'image_to_video', label: 'Image-to-Video', icon: '🎞️' },
  { value: '3d_generation', label: '3D Generation', icon: '🧊' },
  { value: 'avatar', label: 'Avatar', icon: '👤' },
  { value: 'lipsync', label: 'Lipsync', icon: '👄' },
  { value: 'tts', label: 'TTS Voiceover', icon: '🎙️' },
  { value: 'music_gen', label: 'Music Generation', icon: '🎵' },
  { value: 'video_effects', label: 'Video Effects', icon: '✨' },
  { value: 'pixar_style', label: 'Pixar Style', icon: '🎨' },
  { value: 'anime_style', label: 'Anime Style', icon: '🎌' },
];

// Regions
const REGIONS = [
  { value: 'western', label: 'Western', flag: '🌎' },
  { value: 'europe', label: 'Europe', flag: '🌍' },
  { value: 'cjk', label: 'CJK (Asia)', flag: '🌏' },
  { value: 'india', label: 'India', flag: '🇮🇳' },
  { value: 'mena', label: 'MENA', flag: '🏜️' },
  { value: 'africa', label: 'Africa', flag: '🌍' },
  { value: 'latam', label: 'Latin America', flag: '🌎' },
  { value: 'sea', label: 'Southeast Asia', flag: '🌴' },
  { value: 'caribbean', label: 'Caribbean', flag: '🏝️' },
];

// AI Providers
const AI_PROVIDERS = [
  { value: 'vertex_veo', label: 'Vertex AI Veo', icon: '🎬' },
  { value: 'sora2', label: 'Sora 2', icon: '🌟' },
  { value: 'alibaba_wan', label: 'Alibaba Wan', icon: '🌊' },
  { value: 'meshy_3d', label: 'Meshy 3D', icon: '🧊' },
  { value: 'modelslab', label: 'ModelsLab', icon: '⚡' },
  { value: 'deepseek', label: 'DeepSeek', icon: '🔍' },
  { value: 'elevenlabs', label: 'ElevenLabs TTS', icon: '🎙️' },
];

export function CreateTemplateDialog({ onCreated, templateToClone }: CreateTemplateDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(templateToClone ? 'clone' : 'ai');

  // Form state
  const [formData, setFormData] = useState({
    name: templateToClone?.name ? `${templateToClone.name} (Copy)` : '',
    description: templateToClone?.description || '',
    category: templateToClone?.category || 'marketing',
    videoStyle: 'motion_graphics',
    duration: templateToClone?.estimated_duration_seconds || 60,
    capabilities: [] as string[],
    regions: ['western'] as string[],
    providers: ['modelslab'] as string[],
    aiPrompt: '',
  });

  // Toggle capability
  const toggleCapability = (cap: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap]
    }));
  };

  // Toggle region
  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

  // Toggle provider
  const toggleProvider = (provider: string) => {
    setFormData(prev => ({
      ...prev,
      providers: prev.providers.includes(provider)
        ? prev.providers.filter(p => p !== provider)
        : [...prev.providers, provider]
    }));
  };

  // AI-Assisted Generation
  const generateWithAI = async () => {
    if (!formData.aiPrompt.trim()) {
      toast({ title: 'Please describe what template you want', variant: 'destructive' });
      return;
    }

    setAiGenerating(true);
    try {
      // Call AI to generate template structure
      const { data, error } = await supabase.functions.invoke('generate-template-ai', {
        body: { prompt: formData.aiPrompt }
      });

      if (error) throw error;

      // Update form with AI suggestions
      if (data?.template) {
        setFormData(prev => ({
          ...prev,
          name: data.template.name || prev.name,
          description: data.template.description || prev.description,
          category: data.template.category || prev.category,
          videoStyle: data.template.videoStyle || prev.videoStyle,
          capabilities: data.template.capabilities || prev.capabilities,
          regions: data.template.regions || prev.regions,
        }));
        toast({ title: 'AI generated template structure!', description: 'Review and customize as needed.' });
      }
    } catch (err: any) {
      console.error('AI generation failed:', err);
      toast({ title: 'AI generation failed', description: err.message, variant: 'destructive' });
    } finally {
      setAiGenerating(false);
    }
  };

  // Create template
  const createTemplate = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Template name is required', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const { data: user } = await supabase.auth.getUser();

      const templateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        estimated_duration_seconds: formData.duration,
        target_platform: ['youtube', 'tiktok', 'instagram'],
        industry_tags: [formData.category, formData.videoStyle],
        default_settings: {
          videoStyle: formData.videoStyle,
          providers: formData.providers,
        },
        style_preset: {
          style: formData.videoStyle,
          capabilities: formData.capabilities,
        },
        is_system_default: false,
        created_by: user?.user?.id || null,
        is_active: true,
        is_public: true,
        usage_count: 0,
        // Store extended metadata as JSON
        ai_capabilities: formData.capabilities,
        regional_variants: formData.regions.reduce((acc, region) => {
          acc[region] = { enabled: true };
          return acc;
        }, {} as Record<string, any>),
        primary_model: formData.providers[0] || 'modelslab',
        secondary_models: formData.providers.slice(1),
      };

      const { error } = await supabase
        .from('video_blueprints')
        .insert(templateData);

      if (error) throw error;

      toast({ title: 'Template created!', description: formData.name });
      setOpen(false);
      onCreated?.();

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'marketing',
        videoStyle: 'motion_graphics',
        duration: 60,
        capabilities: [],
        regions: ['western'],
        providers: ['modelslab'],
        aiPrompt: '',
      });
    } catch (err: any) {
      console.error('Create failed:', err);
      toast({ title: 'Failed to create template', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {templateToClone ? 'Clone Template' : 'Create Template'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Create New Template
          </DialogTitle>
          <DialogDescription>
            Build a custom video template using AI assistance or manual configuration
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="ai" className="gap-2">
              <Wand2 className="h-4 w-4" />
              AI-Assisted
            </TabsTrigger>
            <TabsTrigger value="clone" className="gap-2">
              <Copy className="h-4 w-4" />
              Clone & Customize
            </TabsTrigger>
            <TabsTrigger value="visual" className="gap-2">
              <Layers className="h-4 w-4" />
              Visual Builder
            </TabsTrigger>
          </TabsList>

          {/* AI-Assisted Tab */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Describe your template</Label>
              <Textarea
                placeholder="E.g., Create a Pixar-style educational video template for teaching kids about space exploration, with animated characters and fun music..."
                value={formData.aiPrompt}
                onChange={(e) => setFormData(prev => ({ ...prev, aiPrompt: e.target.value }))}
                className="min-h-[100px]"
              />
              <Button
                onClick={generateWithAI}
                disabled={aiGenerating}
                className="w-full gap-2"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Template Structure
                  </>
                )}
              </Button>
            </div>

            {/* Show form after AI generation or for manual editing */}
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Template"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this template is for..."
                />
              </div>
            </div>
          </TabsContent>

          {/* Clone & Customize Tab */}
          <TabsContent value="clone" className="space-y-4 mt-4">
            {templateToClone ? (
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Cloning from:</p>
                <p className="font-medium">{templateToClone.name}</p>
                <p className="text-sm text-muted-foreground">{templateToClone.description}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a template from the grid and click "Clone" to customize it.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Custom Template"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                />
              </div>
            </div>
          </TabsContent>

          {/* Visual Builder Tab */}
          <TabsContent value="visual" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Custom Template"
                />
              </div>
              <div className="space-y-2">
                <Label>Video Style</Label>
                <Select
                  value={formData.videoStyle}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, videoStyle: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VIDEO_STYLES.map(style => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.icon} {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* AI Capabilities Selection */}
            <div className="space-y-2">
              <Label>AI Capabilities</Label>
              <div className="flex flex-wrap gap-2">
                {AI_CAPABILITIES.map(cap => (
                  <Badge
                    key={cap.value}
                    variant={formData.capabilities.includes(cap.value) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleCapability(cap.value)}
                  >
                    {cap.icon} {cap.label}
                    {formData.capabilities.includes(cap.value) && (
                      <Check className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Regions Selection */}
            <div className="space-y-2">
              <Label>Target Regions</Label>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map(region => (
                  <Badge
                    key={region.value}
                    variant={formData.regions.includes(region.value) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleRegion(region.value)}
                  >
                    {region.flag} {region.label}
                    {formData.regions.includes(region.value) && (
                      <Check className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* AI Providers Selection */}
            <div className="space-y-2">
              <Label>AI Providers</Label>
              <div className="flex flex-wrap gap-2">
                {AI_PROVIDERS.map(provider => (
                  <Badge
                    key={provider.value}
                    variant={formData.providers.includes(provider.value) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleProvider(provider.value)}
                  >
                    {provider.icon} {provider.label}
                    {formData.providers.includes(provider.value) && (
                      <Check className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this template is for..."
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={createTemplate} disabled={creating} className="gap-2">
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Create Template
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
