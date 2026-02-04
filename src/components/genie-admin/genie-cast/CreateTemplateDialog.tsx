/**
 * Create Template Dialog
 * ENHANCED: Fixed z-index, clone from grid, device/platform options, region-language mapping
 */

import React, { useState, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Smartphone,
  Monitor,
  Tablet,
  Languages,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { VideoBlueprint } from '@/hooks/useVideoBlueprints';
import { useVideoBlueprints } from '@/hooks/useVideoBlueprints';

interface CreateTemplateDialogProps {
  onCreated?: () => void;
  templateToClone?: VideoBlueprint | null;
}

// Categories for templates - Full 21 categories
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
  { value: 'ppt', label: 'PPT/Slides', icon: '📊' },
  { value: 'smb', label: 'SMB/Local', icon: '🏪' },
  { value: 'oil_gas', label: 'Oil & Gas', icon: '⛽' },
  { value: 'podcast', label: 'Podcast', icon: '🎙️' },
  { value: 'webcast', label: 'Webcast', icon: '📡' },
  { value: 'hospitality', label: 'Hospitality', icon: '🍽️' },
  { value: 'consulting', label: 'Consulting', icon: '💼' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
  { value: 'technology', label: 'Technology', icon: '💻' },
];

// Video styles - Full 43+ styles
const VIDEO_STYLES = [
  { value: 'photorealistic', label: 'Photorealistic', icon: '📸' },
  { value: 'hyper_real', label: 'Hyper-Realistic 4K', icon: '🎥' },
  { value: 'product_hero', label: 'Product Hero', icon: '🛍️' },
  { value: 'pixar_disney', label: 'Pixar/Disney', icon: '🎪' },
  { value: 'character_vlog', label: 'Character Vlog', icon: '🗣️' },
  { value: 'talking_head', label: 'Talking Head', icon: '👤' },
  { value: 'anime', label: 'Anime', icon: '🎌' },
  { value: 'crayon_sketch', label: 'Crayon/Hand-drawn', icon: '🖍️' },
  { value: 'watercolor', label: 'Watercolor', icon: '🎨' },
  { value: 'stop_motion', label: 'Stop Motion', icon: '🎞️' },
  { value: 'cyberpunk', label: 'Cyberpunk', icon: '🌆' },
  { value: 'neon_synthwave', label: 'Neon Synthwave', icon: '🌃' },
  { value: 'whiteboard', label: 'Whiteboard', icon: '📝' },
  { value: 'explainer', label: 'Explainer', icon: '💡' },
  { value: 'kinetic_typography', label: 'Kinetic Typography', icon: '📝' },
  { value: 'ppt_animation', label: 'PPT Animation', icon: '📊' },
  { value: 'pitch_deck', label: 'Pitch Deck', icon: '📈' },
  { value: 'motion_graphics', label: 'Motion Graphics', icon: '✨' },
  { value: 'documentary', label: 'Documentary', icon: '🎥' },
  { value: 'podcast_visual', label: 'Podcast Visual', icon: '🎙️' },
  { value: 'webcast_broadcast', label: 'Webcast Broadcast', icon: '📡' },
];

// AI Capabilities
const AI_CAPABILITIES = [
  { value: 'text_to_video', label: 'Text-to-Video', icon: '📹' },
  { value: 'image_to_video', label: 'Image-to-Video', icon: '🎞️' },
  { value: '3d_generation', label: '3D Generation', icon: '🧊' },
  { value: 'avatar', label: 'Avatar', icon: '👤' },
  { value: 'lipsync', label: 'Lipsync', icon: '👄' },
  { value: 'tts', label: 'TTS Voiceover', icon: '🎙️' },
  { value: 'stt', label: 'STT Transcription', icon: '📝' },
  { value: 'music_gen', label: 'Music Generation', icon: '🎵' },
  { value: 'sfx_gen', label: 'SFX Generation', icon: '🔊' },
  { value: 'video_effects', label: 'Video Effects', icon: '✨' },
  { value: 'pixar_style', label: 'Pixar Style', icon: '🎨' },
  { value: 'anime_style', label: 'Anime Style', icon: '🎌' },
  { value: 'ppt_animation', label: 'PPT Animation', icon: '📊' },
  { value: 'slideshow', label: 'Slideshow', icon: '🖼️' },
  { value: 'voice_clone', label: 'Voice Clone', icon: '🗣️' },
  { value: 'multi_language', label: 'Multi-Language', icon: '🌍' },
  { value: 'regional_tts', label: 'Regional TTS', icon: '🗣️' },
];

// Regions with LANGUAGES - Enhanced with TTS providers
const REGIONS_WITH_LANGUAGES = [
  { 
    value: 'western', 
    label: 'Western', 
    flag: '🌎',
    languages: ['en', 'es', 'fr'],
    ttsProvider: 'ElevenLabs',
    sttProvider: 'Deepgram',
  },
  { 
    value: 'europe', 
    label: 'Europe', 
    flag: '🌍',
    languages: ['en', 'de', 'fr', 'it', 'es', 'pt', 'nl', 'pl'],
    ttsProvider: 'ElevenLabs',
    sttProvider: 'Deepgram',
  },
  { 
    value: 'cjk', 
    label: 'CJK', 
    flag: '🌏',
    languages: ['zh', 'ja', 'ko'],
    ttsProvider: 'Alibaba CosyVoice',
    sttProvider: 'Alibaba Paraformer',
  },
  { 
    value: 'india', 
    label: 'India', 
    flag: '🇮🇳',
    languages: ['hi', 'te', 'kn', 'ta', 'mr', 'as', 'bn', 'gu', 'pa', 'ml'],
    ttsProvider: 'Azure Neural',
    sttProvider: 'Azure STT',
  },
  { 
    value: 'mena', 
    label: 'MENA', 
    flag: '🏜️',
    languages: ['ar', 'he', 'fa', 'tr'],
    ttsProvider: 'Azure Neural',
    sttProvider: 'Azure STT',
  },
  { 
    value: 'africa', 
    label: 'Africa', 
    flag: '🌍',
    languages: ['en', 'sw', 'yo', 'ha', 'am', 'zu', 'ig', 'fr'],
    ttsProvider: 'Azure Neural',
    sttProvider: 'Azure STT',
  },
  { 
    value: 'latam', 
    label: 'Latin America', 
    flag: '🌎',
    languages: ['es', 'pt'],
    ttsProvider: 'ElevenLabs',
    sttProvider: 'Deepgram',
  },
  { 
    value: 'sea', 
    label: 'Southeast Asia', 
    flag: '🌴',
    languages: ['id', 'ms', 'th', 'vi', 'tl'],
    ttsProvider: 'Azure Neural',
    sttProvider: 'Azure STT',
  },
  { 
    value: 'pakistan', 
    label: 'Pakistan', 
    flag: '🇵🇰',
    languages: ['ur', 'pa', 'sd', 'ps'],
    ttsProvider: 'Azure Neural',
    sttProvider: 'Azure STT',
  },
  { 
    value: 'bangladesh', 
    label: 'Bangladesh', 
    flag: '🇧🇩',
    languages: ['bn'],
    ttsProvider: 'Azure Neural',
    sttProvider: 'Azure STT',
  },
  { 
    value: 'indonesia', 
    label: 'Indonesia', 
    flag: '🇮🇩',
    languages: ['id', 'jv', 'su'],
    ttsProvider: 'Azure Neural',
    sttProvider: 'Azure STT',
  },
];

// Language code to name mapping
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
  pt: 'Portuguese', nl: 'Dutch', pl: 'Polish', zh: 'Chinese', ja: 'Japanese',
  ko: 'Korean', hi: 'Hindi', te: 'Telugu', kn: 'Kannada', ta: 'Tamil',
  mr: 'Marathi', as: 'Assamese', bn: 'Bengali', gu: 'Gujarati', pa: 'Punjabi',
  ml: 'Malayalam', ar: 'Arabic', he: 'Hebrew', fa: 'Persian', tr: 'Turkish',
  sw: 'Swahili', yo: 'Yoruba', ha: 'Hausa', am: 'Amharic', zu: 'Zulu',
  ig: 'Igbo', id: 'Indonesian', ms: 'Malay', th: 'Thai', vi: 'Vietnamese',
  tl: 'Tagalog', ur: 'Urdu', sd: 'Sindhi', ps: 'Pashto', jv: 'Javanese', su: 'Sundanese',
};

// Device/Platform options
const DEVICE_OPTIONS = [
  { value: 'mobile', label: 'Mobile', icon: Smartphone },
  { value: 'desktop', label: 'Desktop', icon: Monitor },
  { value: 'tablet', label: 'Tablet', icon: Tablet },
];

// Platform options
const PLATFORM_OPTIONS = [
  { value: 'tiktok', label: 'TikTok', aspect: '9:16' },
  { value: 'instagram_reels', label: 'Instagram Reels', aspect: '9:16' },
  { value: 'instagram_feed', label: 'Instagram Feed', aspect: '1:1' },
  { value: 'youtube', label: 'YouTube', aspect: '16:9' },
  { value: 'youtube_shorts', label: 'YouTube Shorts', aspect: '9:16' },
  { value: 'facebook', label: 'Facebook', aspect: '16:9' },
  { value: 'linkedin', label: 'LinkedIn', aspect: '16:9' },
  { value: 'x_twitter', label: 'X/Twitter', aspect: '16:9' },
  { value: 'whatsapp_status', label: 'WhatsApp Status', aspect: '9:16' },
  { value: 'snapchat', label: 'Snapchat', aspect: '9:16' },
  { value: 'douyin', label: 'Douyin', aspect: '9:16' },
  { value: 'wechat', label: 'WeChat', aspect: '9:16' },
];

// AI Providers
const AI_PROVIDERS = [
  { value: 'gemini', label: 'Gemini 3.0', icon: '🔮', category: 'llm' },
  { value: 'openai', label: 'OpenAI GPT-4o', icon: '🧠', category: 'llm' },
  { value: 'claude', label: 'Claude 4', icon: '🎭', category: 'llm' },
  { value: 'deepseek', label: 'DeepSeek V3', icon: '🌊', category: 'llm' },
  { value: 'sora2', label: 'Sora 2', icon: '🌟', category: 'video' },
  { value: 'veo', label: 'Google Veo 3', icon: '🎬', category: 'video' },
  { value: 'alibaba_wan', label: 'Alibaba Wan 2.6', icon: '🌊', category: 'video' },
  { value: 'modelslab_flux', label: 'ModelsLab FLUX', icon: '⚡', category: 'image' },
  { value: 'dalle3', label: 'DALL-E 3', icon: '🎨', category: 'image' },
  { value: 'huggingface', label: 'HuggingFace FLUX', icon: '🤗', category: 'image' },
  { value: 'replicate', label: 'Replicate SDXL', icon: '🔄', category: 'image' },
  { value: 'elevenlabs', label: 'ElevenLabs', icon: '🎙️', category: 'tts' },
  { value: 'azure_tts', label: 'Azure Neural TTS', icon: '☁️', category: 'tts' },
  { value: 'alibaba_cosyvoice', label: 'Alibaba CosyVoice', icon: '🗣️', category: 'tts' },
  { value: 'meshy_3d', label: 'Meshy 3D', icon: '🧊', category: '3d' },
];

export function CreateTemplateDialog({ onCreated, templateToClone }: CreateTemplateDialogProps) {
  const { toast } = useToast();
  const { blueprints } = useVideoBlueprints();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(templateToClone ? 'clone' : 'ai');
  const [lastUsedProvider, setLastUsedProvider] = useState<string | null>(null);
  const [cloneSearchQuery, setCloneSearchQuery] = useState('');
  const [selectedCloneTemplate, setSelectedCloneTemplate] = useState<VideoBlueprint | null>(templateToClone || null);

  // Form state
  const [formData, setFormData] = useState({
    name: templateToClone?.name ? `${templateToClone.name} (Copy)` : '',
    description: templateToClone?.description || '',
    category: templateToClone?.category || 'marketing',
    videoStyle: 'motion_graphics',
    duration: templateToClone?.estimated_duration_seconds || 60,
    capabilities: [] as string[],
    regions: ['western'] as string[],
    languages: ['en'] as string[],
    providers: ['huggingface', 'replicate'] as string[],
    devices: ['mobile', 'desktop'] as string[],
    platforms: ['youtube', 'tiktok', 'instagram_reels'] as string[],
    aiPrompt: '',
  });

  // Update languages when regions change
  useEffect(() => {
    const selectedRegions = REGIONS_WITH_LANGUAGES.filter(r => formData.regions.includes(r.value));
    const availableLanguages = [...new Set(selectedRegions.flatMap(r => r.languages))];
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => availableLanguages.includes(l)) || availableLanguages.slice(0, 1),
    }));
  }, [formData.regions]);

  // Toggle helper
  const toggleArrayItem = (key: keyof typeof formData, item: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(item)
        ? (prev[key] as string[]).filter(i => i !== item)
        : [...(prev[key] as string[]), item]
    }));
  };

  // Get available languages based on selected regions
  const availableLanguages = [...new Set(
    REGIONS_WITH_LANGUAGES
      .filter(r => formData.regions.includes(r.value))
      .flatMap(r => r.languages)
  )];

  // Get TTS/STT providers for selected regions
  const getProvidersForRegions = () => {
    const selectedRegions = REGIONS_WITH_LANGUAGES.filter(r => formData.regions.includes(r.value));
    const ttsProviders = [...new Set(selectedRegions.map(r => r.ttsProvider))];
    const sttProviders = [...new Set(selectedRegions.map(r => r.sttProvider))];
    return { ttsProviders, sttProviders };
  };

  // Filtered templates for clone tab
  const filteredCloneTemplates = blueprints.filter(bp =>
    bp.name.toLowerCase().includes(cloneSearchQuery.toLowerCase()) ||
    bp.description?.toLowerCase().includes(cloneSearchQuery.toLowerCase())
  ).slice(0, 20);

  // Select template to clone
  const selectTemplateToClone = (template: VideoBlueprint) => {
    setSelectedCloneTemplate(template);
    setFormData(prev => ({
      ...prev,
      name: `${template.name} (Copy)`,
      description: template.description || '',
      category: template.category,
      duration: template.estimated_duration_seconds,
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
      const { data, error } = await supabase.functions.invoke('generate-template-ai', {
        body: { 
          prompt: formData.aiPrompt,
          region: formData.regions[0] || 'western',
        }
      });

      if (error) throw error;

      if (data?.provider) setLastUsedProvider(data.provider);

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
        toast({ title: `✨ Template generated!`, description: 'Review and customize as needed.' });
      }
    } catch (err: any) {
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
      const { ttsProviders, sttProviders } = getProvidersForRegions();

      const templateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        estimated_duration_seconds: formData.duration,
        target_platform: formData.platforms,
        industry_tags: [formData.category, formData.videoStyle, ...formData.devices],
        default_settings: {
          videoStyle: formData.videoStyle,
          providers: formData.providers,
          devices: formData.devices,
          platforms: formData.platforms,
          languages: formData.languages,
          ttsProviders,
          sttProviders,
        },
        style_preset: {
          style: formData.videoStyle,
          capabilities: formData.capabilities,
          devices: formData.devices,
        },
        is_system_default: false,
        created_by: user?.user?.id || null,
        is_active: true,
        is_public: true,
        usage_count: 0,
      };

      const { error } = await supabase.from('video_blueprints').insert(templateData);
      if (error) throw error;

      toast({ title: 'Template created!', description: formData.name });
      setOpen(false);
      onCreated?.();

      // Reset form
      setFormData({
        name: '', description: '', category: 'marketing', videoStyle: 'motion_graphics',
        duration: 60, capabilities: [], regions: ['western'], languages: ['en'],
        providers: ['huggingface', 'replicate'], devices: ['mobile', 'desktop'],
        platforms: ['youtube', 'tiktok', 'instagram_reels'], aiPrompt: '',
      });
    } catch (err: any) {
      toast({ title: 'Failed to create template', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const { ttsProviders, sttProviders } = getProvidersForRegions();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {templateToClone ? 'Clone Template' : 'Create Template'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden z-[100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Create New Template
          </DialogTitle>
          <DialogDescription>
            Build a custom video template with regional languages, devices, and platforms
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
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
                  placeholder="E.g., Create a podcast thumbnail template for Telugu audience with professional studio look..."
                  value={formData.aiPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, aiPrompt: e.target.value }))}
                  className="min-h-[100px]"
                />
                <Button onClick={generateWithAI} disabled={aiGenerating} className="w-full gap-2">
                  {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {aiGenerating ? 'Generating...' : 'Generate Template Structure'}
                </Button>
              </div>
            </TabsContent>

            {/* Clone & Customize Tab - NEW: Template selection grid */}
            <TabsContent value="clone" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Search templates to clone</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or description..."
                    value={cloneSearchQuery}
                    onChange={(e) => setCloneSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {filteredCloneTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => selectTemplateToClone(template)}
                    className={cn(
                      "p-2 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                      selectedCloneTemplate?.id === template.id && "border-primary bg-primary/10"
                    )}
                  >
                    <p className="font-medium text-sm truncate">{template.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{template.category}</p>
                  </div>
                ))}
              </div>

              {selectedCloneTemplate && (
                <div className="p-3 border rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Cloning:</p>
                  <p className="font-medium">{selectedCloneTemplate.name}</p>
                </div>
              )}
            </TabsContent>

            {/* Visual Builder Tab - ENHANCED */}
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
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="z-[150]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[200] max-h-[300px]">
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
                <Label>Video Style</Label>
                <Select
                  value={formData.videoStyle}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, videoStyle: value }))}
                >
                  <SelectTrigger className="z-[150]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[200] max-h-[300px]">
                    {VIDEO_STYLES.map(style => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.icon} {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Devices */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" /> Devices
                </Label>
                <div className="flex flex-wrap gap-2">
                  {DEVICE_OPTIONS.map(device => (
                    <Badge
                      key={device.value}
                      variant={formData.devices.includes(device.value) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => toggleArrayItem('devices', device.value)}
                    >
                      <device.icon className="h-3 w-3 mr-1" />
                      {device.label}
                      {formData.devices.includes(device.value) && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4" /> Target Platforms
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORM_OPTIONS.map(platform => (
                    <Badge
                      key={platform.value}
                      variant={formData.platforms.includes(platform.value) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => toggleArrayItem('platforms', platform.value)}
                    >
                      {platform.label} ({platform.aspect})
                      {formData.platforms.includes(platform.value) && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* AI Capabilities */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> AI Capabilities
                </Label>
                <div className="flex flex-wrap gap-2">
                  {AI_CAPABILITIES.map(cap => (
                    <Badge
                      key={cap.value}
                      variant={formData.capabilities.includes(cap.value) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => toggleArrayItem('capabilities', cap.value)}
                    >
                      {cap.icon} {cap.label}
                      {formData.capabilities.includes(cap.value) && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Regions with Languages - ENHANCED */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4" /> Target Regions
                </Label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS_WITH_LANGUAGES.map(region => (
                    <Badge
                      key={region.value}
                      variant={formData.regions.includes(region.value) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => toggleArrayItem('regions', region.value)}
                    >
                      {region.flag} {region.label}
                      {formData.regions.includes(region.value) && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
                
                {/* TTS/STT Provider Info */}
                {formData.regions.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    TTS: {ttsProviders.join(', ')} | STT: {sttProviders.join(', ')}
                  </div>
                )}
              </div>

              {/* Languages dropdown - shows based on selected regions */}
              {availableLanguages.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Languages className="h-4 w-4" /> Languages ({availableLanguages.length} available)
                  </Label>
                  <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
                    {availableLanguages.map(lang => (
                      <Badge
                        key={lang}
                        variant={formData.languages.includes(lang) ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() => toggleArrayItem('languages', lang)}
                      >
                        {LANGUAGE_NAMES[lang] || lang}
                        {formData.languages.includes(lang) && <Check className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Providers */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" /> AI Providers
                </Label>
                <div className="flex flex-wrap gap-2">
                  {AI_PROVIDERS.map(provider => (
                    <Badge
                      key={provider.value}
                      variant={formData.providers.includes(provider.value) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => toggleArrayItem('providers', provider.value)}
                    >
                      {provider.icon} {provider.label}
                      {formData.providers.includes(provider.value) && <Check className="h-3 w-3 ml-1" />}
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

          {/* Common form fields for AI and Clone tabs */}
          {(activeTab === 'ai' || activeTab === 'clone') && (
            <div className="border-t pt-4 mt-4 space-y-4">
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
                    <SelectContent className="z-[200]">
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
          )}
        </ScrollArea>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={createTemplate} disabled={creating} className="gap-2">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {creating ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
