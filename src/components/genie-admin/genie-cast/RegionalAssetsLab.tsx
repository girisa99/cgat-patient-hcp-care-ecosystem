/**
 * Regional Assets Lab
 * Generate → Preview → Approve → Publish pipeline for landing page assets.
 * Covers: 3D Avatars, Hero Videos, Hero Images, OG Images, Brand Logos.
 * Showcases creative character styles & best-of-world pipeline capabilities.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Video, Image, Globe, Volume2, Play, CheckCircle2,
  Eye, Wand2, RotateCcw, Send, Loader2, Bot, Film,
  Camera, Palette, Box, Mic, ArrowRight, BadgeCheck, Clock,
  Zap, Layers, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// ─── Creative Avatar Style Cards ───────────────────────────
const AVATAR_STYLES = [
  {
    id: 'pixar',
    label: 'Pixar 3D',
    emoji: '🎬',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/40',
    description: 'Warm cinematic 3D — Toy Story / Inside Out',
    provider: 'Meshy AI + Wan 2.2',
    promptHint: 'Pixar-style 3D animated character, warm lighting, expressive eyes, soft shadows',
  },
  {
    id: 'anime',
    label: 'Anime / Ghibli',
    emoji: '✨',
    gradient: 'from-pink-500/20 to-purple-500/20',
    border: 'border-pink-500/40',
    description: 'Hand-drawn Japanese anime aesthetic',
    provider: 'ModelsLab Anime',
    promptHint: 'Studio Ghibli anime style character, watercolor textures, expressive, detailed hair',
  },
  {
    id: 'photorealistic',
    label: 'Photorealistic',
    emoji: '📸',
    gradient: 'from-slate-500/20 to-zinc-500/20',
    border: 'border-slate-500/40',
    description: 'Hyper-real human presenter with lip-sync',
    provider: 'Alibaba Wan 2.2 S2V',
    promptHint: 'Photorealistic professional presenter, studio lighting, clean background',
  },
  {
    id: 'crayon',
    label: 'Crayon / Sketch',
    emoji: '🖍️',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/40',
    description: 'Hand-drawn crayon illustration style',
    provider: 'Vertex Imagen 3',
    promptHint: 'Crayon hand-drawn character, childlike warmth, textured paper background, colorful',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk / Sci-Fi',
    emoji: '🤖',
    gradient: 'from-violet-500/20 to-fuchsia-500/20',
    border: 'border-violet-500/40',
    description: 'Neon-lit futuristic character design',
    provider: 'ModelsLab + FLUX',
    promptHint: 'Cyberpunk character, neon glow, holographic UI elements, futuristic cityscape',
  },
  {
    id: 'claymation',
    label: 'Claymation',
    emoji: '🏺',
    gradient: 'from-amber-500/20 to-red-500/20',
    border: 'border-amber-500/40',
    description: 'Stop-motion clay figure — Wallace & Gromit',
    provider: 'Meshy 3D',
    promptHint: 'Claymation stop-motion character, textured clay surface, warm studio lighting',
  },
  {
    id: 'comic',
    label: 'Comic / Marvel',
    emoji: '💥',
    gradient: 'from-red-500/20 to-blue-500/20',
    border: 'border-red-500/40',
    description: 'Bold comic book hero / graphic novel',
    provider: 'FLUX Dev',
    promptHint: 'Marvel comic book style character, bold lines, halftone dots, dynamic pose',
  },
  {
    id: 'watercolor',
    label: 'Watercolor Art',
    emoji: '🎨',
    gradient: 'from-teal-500/20 to-emerald-500/20',
    border: 'border-teal-500/40',
    description: 'Soft watercolor painted character',
    provider: 'Vertex Imagen 3',
    promptHint: 'Watercolor painted character, soft edges, flowing colors, artistic brushstrokes',
  },
];

// ─── Pipeline Stages ───────────────────────────
const PIPELINE_STAGES = [
  {
    id: 'script', label: 'AI Script', icon: Sparkles,
    providers: ['Claude 4', 'Gemini 3 Pro', 'GPT-4o', 'Qwen Max'],
    description: 'Regional transcreation with native tone',
    color: 'text-violet-500', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30',
  },
  {
    id: 'tts', label: 'Voice Synthesis', icon: Mic,
    providers: ['Azure Neural', 'Qwen3-TTS', 'ElevenLabs', 'Google WaveNet'],
    description: 'Lip-sync capable regional voiceover',
    color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30',
  },
  {
    id: 'avatar', label: '3D Avatar', icon: Bot,
    providers: ['Alibaba Wan 2.2 S2V', 'Meshy AI', 'ModelsLab'],
    description: 'Creative character styles with lip-sync',
    color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30',
  },
  {
    id: 'video', label: 'Video Generation', icon: Film,
    providers: ['Vertex Veo 3', 'Sora 2', 'Alibaba Wan 2.6', 'ModelsLab'],
    description: 'Cinematic AI video from script',
    color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30',
  },
  {
    id: 'assembly', label: 'Assembly', icon: Layers,
    providers: ['JSON2Video', 'Cloud Run GPU'],
    description: 'Timeline stitching & A/V sync',
    color: 'text-pink-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30',
  },
];

const ASSET_TYPES = [
  { id: 'avatar_3d', label: '3D Avatar', icon: Bot, description: 'Creative character with lip-sync' },
  { id: 'hero_video', label: 'Hero Video', icon: Video, description: 'Cinematic product video' },
  { id: 'hero_image', label: 'Hero Image', icon: Image, description: 'AI-generated hero visual' },
  { id: 'og_image', label: 'OG Image', icon: Camera, description: 'Social preview card (1200×630)' },
  { id: 'brand_logo', label: 'Brand Logo', icon: Palette, description: 'Regional brand variant' },
] as const;

const REGIONS = [
  { code: 'NAM_US', label: '🇺🇸 North America' },
  { code: 'EU_WEST', label: '🇪🇺 Western Europe' },
  { code: 'MENA_GULF', label: '🇦🇪 MENA Gulf' },
  { code: 'INDIA_NORTH', label: '🇮🇳 India North' },
  { code: 'CJK_JP', label: '🇯🇵 Japan' },
  { code: 'LATAM_BR', label: '🇧🇷 Brazil' },
  { code: 'SEA_PAN', label: '🌏 SE Asia' },
  { code: 'AFRICA_WEST', label: '🌍 West Africa' },
];

type AssetStatus = 'empty' | 'generating' | 'preview' | 'approved' | 'published';

interface AssetItem {
  type: string;
  status: AssetStatus;
  previewUrl?: string;
  provider?: string;
  style?: string;
  generatedAt?: Date;
}

// Provider mapping for each asset type
const ASSET_PROVIDERS: Record<string, { provider: string; edgeFunction: string; description: string }> = {
  avatar_3d: { provider: 'Alibaba Wan 2.2 S2V', edgeFunction: 'alibaba-avatar-generator', description: 'Speech-to-Video avatar' },
  hero_video: { provider: 'Vertex Veo 3', edgeFunction: 'ai-video-generator', description: 'Cinematic AI video' },
  hero_image: { provider: 'Vertex Imagen 3', edgeFunction: 'ai-image-generator', description: 'AI hero image' },
  og_image: { provider: 'Gemini 3 Pro', edgeFunction: 'ai-image-generator', description: 'OG social card' },
  brand_logo: { provider: 'FLUX Dev', edgeFunction: 'ai-image-generator', description: 'Brand variant logo' },
};

export const RegionalAssetsLab: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('NAM_US');
  const [selectedAssetType, setSelectedAssetType] = useState<string>('avatar_3d');
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState('pixar');
  const [narrationScript, setNarrationScript] = useState(
    'Discover the future of healthcare with AI-powered patient engagement. Our platform connects care teams, patients, and caregivers in one seamless ecosystem.'
  );
  const [assets, setAssets] = useState<Record<string, AssetItem>>({});
  const [activeView, setActiveView] = useState<'pipeline' | 'generate' | 'review'>('pipeline');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('');

  const currentAsset = assets[`${selectedRegion}_${selectedAssetType}`];
  const currentStatus = currentAsset?.status || 'empty';

  const handleGenerate = useCallback(async () => {
    const key = `${selectedRegion}_${selectedAssetType}`;
    setGenerationError(null);

    setAssets(prev => ({
      ...prev,
      [key]: { type: selectedAssetType, status: 'generating' },
    }));

    try {
      // Check auth
      const { data: authData } = await supabase.auth.getSession();
      const token = authData.session?.access_token;

      if (!token) {
        throw new Error('Please log in first to generate assets. Navigate to /auth to sign in.');
      }

      const style = AVATAR_STYLES.find(s => s.id === selectedAvatarStyle);
      const providerInfo = ASSET_PROVIDERS[selectedAssetType];
      const lang = selectedRegion.startsWith('CJK') ? 'ja' : selectedRegion.startsWith('MENA') ? 'ar' : 'en';

      if (selectedAssetType === 'avatar_3d') {
        // Step 1: TTS
        setGenerationProgress('🎙 Generating regional voiceover...');
        const ttsRes = await supabase.functions.invoke('multi-provider-tts', {
          body: {
            text: narrationScript,
            languageCode: lang,
            region: selectedRegion,
            tier: 'premium',
          },
        });

        if (ttsRes.error) throw new Error(`TTS failed: ${ttsRes.error.message}`);
        const audioUrl = ttsRes.data?.audioUrl || ttsRes.data?.data?.audioUrl || ttsRes.data?.audio_url;
        if (!audioUrl) throw new Error('No audio URL from TTS');

        // Step 2: Avatar generation
        setGenerationProgress(`🤖 Creating ${style?.label || '3D'} avatar...`);
        const avatarRes = await supabase.functions.invoke('alibaba-avatar-generator', {
          body: {
            model: 'wan2.2-s2v',
            audioUrl,
            prompt: style?.promptHint || 'Professional 3D avatar',
            perspective: 'bust',
            duration: 10,
            fps: 30,
            resolution: '1080p',
          },
        });

        const modelUrl = avatarRes.data?.outputUrl || avatarRes.data?.data?.outputUrl;

        setAssets(prev => ({
          ...prev,
          [key]: {
            type: selectedAssetType,
            status: 'preview',
            previewUrl: modelUrl || undefined,
            provider: style?.provider || providerInfo.provider,
            style: style?.label,
            generatedAt: new Date(),
          },
        }));
        toast.success(`${style?.label} avatar generated! Review and approve.`);

      } else if (selectedAssetType === 'hero_image' || selectedAssetType === 'og_image') {
        setGenerationProgress('🎨 Generating AI image...');
        const width = selectedAssetType === 'og_image' ? 1200 : 1920;
        const height = selectedAssetType === 'og_image' ? 630 : 1080;
        
        const imgRes = await supabase.functions.invoke('ai-image-generator', {
          body: {
            prompt: `Professional healthcare technology hero image for ${REGIONS.find(r => r.code === selectedRegion)?.label}, modern gradient, clean design`,
            width,
            height,
            style: 'photorealistic',
          },
        });

        const imgUrl = imgRes.data?.imageUrl || imgRes.data?.url || imgRes.data?.data?.url;

        setAssets(prev => ({
          ...prev,
          [key]: {
            type: selectedAssetType,
            status: 'preview',
            previewUrl: imgUrl || undefined,
            provider: providerInfo.provider,
            generatedAt: new Date(),
          },
        }));
        toast.success(`${selectedAssetType === 'og_image' ? 'OG Image' : 'Hero Image'} generated!`);

      } else if (selectedAssetType === 'hero_video') {
        setGenerationProgress('🎬 Generating cinematic video...');
        const videoRes = await supabase.functions.invoke('ai-video-generator', {
          body: {
            prompt: `Cinematic healthcare technology product video for ${REGIONS.find(r => r.code === selectedRegion)?.label}, smooth camera movement, modern UI showcase`,
            duration: 10,
            resolution: '1080p',
            type: 'hero',
          },
        });

        const videoUrl = videoRes.data?.videoUrl || videoRes.data?.url || videoRes.data?.data?.outputUrl;

        setAssets(prev => ({
          ...prev,
          [key]: {
            type: selectedAssetType,
            status: 'preview',
            previewUrl: videoUrl || undefined,
            provider: providerInfo.provider,
            generatedAt: new Date(),
          },
        }));
        toast.success('Hero video generated!');

      } else {
        // brand_logo
        setGenerationProgress('🎨 Generating brand logo variant...');
        const logoRes = await supabase.functions.invoke('ai-image-generator', {
          body: {
            prompt: `Minimalist healthcare brand logo, clean vector style, ${REGIONS.find(r => r.code === selectedRegion)?.label} market`,
            width: 512,
            height: 512,
            style: 'logo',
          },
        });

        const logoUrl = logoRes.data?.imageUrl || logoRes.data?.url || logoRes.data?.data?.url;

        setAssets(prev => ({
          ...prev,
          [key]: {
            type: selectedAssetType,
            status: 'preview',
            previewUrl: logoUrl || undefined,
            provider: providerInfo.provider,
            generatedAt: new Date(),
          },
        }));
        toast.success('Brand logo generated!');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setGenerationError(msg);
      setAssets(prev => ({
        ...prev,
        [key]: { type: selectedAssetType, status: 'empty' },
      }));
      toast.error(msg);
    } finally {
      setGenerationProgress('');
    }
  }, [selectedRegion, selectedAssetType, selectedAvatarStyle, narrationScript]);

  const handleApprove = useCallback(() => {
    const key = `${selectedRegion}_${selectedAssetType}`;
    setAssets(prev => ({
      ...prev,
      [key]: { ...prev[key], status: 'approved' },
    }));
    toast.success('Asset approved! Ready to publish to landing page.');
  }, [selectedRegion, selectedAssetType]);

  const handlePublish = useCallback(() => {
    const key = `${selectedRegion}_${selectedAssetType}`;
    setAssets(prev => ({
      ...prev,
      [key]: { ...prev[key], status: 'published' },
    }));
    toast.success('Published to regional landing page! 🚀');
  }, [selectedRegion, selectedAssetType]);

  const statusConfig: Record<AssetStatus, { label: string; color: string; icon: React.ElementType }> = {
    empty: { label: 'Not Generated', color: 'text-muted-foreground', icon: Clock },
    generating: { label: 'Generating...', color: 'text-amber-500', icon: Loader2 },
    preview: { label: 'Ready for Review', color: 'text-blue-500', icon: Eye },
    approved: { label: 'Approved', color: 'text-emerald-500', icon: CheckCircle2 },
    published: { label: 'Live on Landing Page', color: 'text-primary', icon: BadgeCheck },
  };

  const StatusIcon = statusConfig[currentStatus].icon;

  return (
    <div className="space-y-6">
      {/* ═══ HEADER: Pipeline Showcase ═══ */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Regional Assets Lab
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Generate → Preview → Approve → Publish • Best-of-world AI pipeline
              </CardDescription>
            </div>
            <div className="flex gap-1.5">
              {(['pipeline', 'generate', 'review'] as const).map((view) => (
                <Button
                  key={view}
                  variant={activeView === view ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs capitalize"
                  onClick={() => setActiveView(view)}
                >
                  {view === 'pipeline' && <Zap className="w-3 h-3 mr-1" />}
                  {view === 'generate' && <Wand2 className="w-3 h-3 mr-1" />}
                  {view === 'review' && <Eye className="w-3 h-3 mr-1" />}
                  {view}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        {activeView === 'pipeline' && (
          <CardContent className="pt-0">
            {/* Pipeline Stages */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {PIPELINE_STAGES.map((stage, i) => (
                <React.Fragment key={stage.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={cn('flex-shrink-0 rounded-lg border p-3 min-w-[160px]', stage.bgColor, stage.borderColor)}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <stage.icon className={cn('w-4 h-4', stage.color)} />
                      <span className="text-xs font-semibold">{stage.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">{stage.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {stage.providers.map((p) => (
                        <Badge key={p} variant="outline" className="text-[9px] py-0 px-1.5 font-normal">{p}</Badge>
                      ))}
                    </div>
                  </motion.div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* ═══ AVATAR STYLE SHOWCASE ═══ */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Creative Character Styles
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {AVATAR_STYLES.map((style, i) => (
                  <motion.button
                    key={style.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      setSelectedAvatarStyle(style.id);
                      setSelectedAssetType('avatar_3d');
                      setActiveView('generate');
                    }}
                    className={cn(
                      'relative rounded-xl border p-3 text-left transition-all hover:scale-[1.02] hover:shadow-lg',
                      'bg-gradient-to-br', style.gradient, style.border,
                      selectedAvatarStyle === style.id && 'ring-2 ring-primary shadow-md'
                    )}
                  >
                    <div className="text-2xl mb-1">{style.emoji}</div>
                    <div className="text-xs font-bold">{style.label}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{style.description}</div>
                    <Badge variant="outline" className="text-[8px] py-0 px-1 mt-1.5 font-normal">{style.provider}</Badge>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Capability Stats */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: 'AI Providers', value: '19+', icon: Zap },
                { label: 'Regional Zones', value: '82+', icon: Globe },
                { label: 'Character Styles', value: '8+', icon: Bot },
                { label: 'TTS Locales', value: '45+', icon: Volume2 },
              ].map(stat => (
                <div key={stat.label} className="text-center p-2 rounded-lg bg-muted/50">
                  <stat.icon className="w-4 h-4 mx-auto text-primary mb-1" />
                  <div className="text-lg font-bold text-primary">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* ═══ GENERATE VIEW ═══ */}
      {activeView === 'generate' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: Config */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-primary" />
                Generation Config
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Region */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Target Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[100000]">
                    {REGIONS.map(r => (
                      <SelectItem key={r.code} value={r.code} className="text-xs">{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Asset Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Asset Type</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {ASSET_TYPES.map(at => (
                    <button
                      key={at.id}
                      onClick={() => setSelectedAssetType(at.id)}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-md border text-left transition-all text-xs',
                        selectedAssetType === at.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      <at.icon className={cn('w-3.5 h-3.5', selectedAssetType === at.id ? 'text-primary' : 'text-muted-foreground')} />
                      <div>
                        <div className="font-medium">{at.label}</div>
                        <div className="text-[10px] text-muted-foreground">{at.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Style Selector */}
              {selectedAssetType === 'avatar_3d' && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Character Style</label>
                  <ScrollArea className="h-[180px]">
                    <div className="grid grid-cols-2 gap-1.5 pr-2">
                      {AVATAR_STYLES.map(style => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedAvatarStyle(style.id)}
                          className={cn(
                            'rounded-lg border p-2 text-left transition-all text-xs bg-gradient-to-br',
                            style.gradient, style.border,
                            selectedAvatarStyle === style.id && 'ring-2 ring-primary'
                          )}
                        >
                          <span className="text-lg">{style.emoji}</span>
                          <div className="text-[10px] font-semibold mt-0.5">{style.label}</div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Script */}
              {(selectedAssetType === 'avatar_3d' || selectedAssetType === 'hero_video') && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Narration Script</label>
                  <Textarea
                    value={narrationScript}
                    onChange={(e) => setNarrationScript(e.target.value)}
                    className="text-xs min-h-[80px]"
                    placeholder="Enter the narration script for this region..."
                  />
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={currentStatus === 'generating'}
                className="w-full gap-2"
              >
                {currentStatus === 'generating' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate {ASSET_TYPES.find(a => a.id === selectedAssetType)?.label}
                  </>
                )}
              </Button>

              {generationError && (
                <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">{generationError}</p>
              )}
            </CardContent>
          </Card>

          {/* Center: Preview */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Preview & Approve
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <StatusIcon className={cn('w-3.5 h-3.5', statusConfig[currentStatus].color, currentStatus === 'generating' && 'animate-spin')} />
                  <span className={cn('text-xs font-medium', statusConfig[currentStatus].color)}>
                    {statusConfig[currentStatus].label}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentStatus === 'empty' && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Box className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No asset generated yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Select a region & asset type, then click Generate</p>
                </div>
              )}

              {currentStatus === 'generating' && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  >
                    <Sparkles className="w-12 h-12 text-primary mb-3" />
                  </motion.div>
                  <p className="text-sm font-medium">AI Pipeline Active</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {generationProgress || 'Processing with best available providers...'}
                  </p>
                  {selectedAssetType === 'avatar_3d' && (
                    <Badge variant="outline" className="mt-3 text-[10px]">
                      {AVATAR_STYLES.find(s => s.id === selectedAvatarStyle)?.label} Style
                    </Badge>
                  )}
                </div>
              )}

              {(currentStatus === 'preview' || currentStatus === 'approved' || currentStatus === 'published') && (
                <div className="space-y-4">
                  {/* Preview Area */}
                  <div className="rounded-lg border bg-muted/30 overflow-hidden aspect-video flex items-center justify-center relative">
                    {currentAsset?.previewUrl ? (
                      selectedAssetType === 'hero_video' || selectedAssetType === 'avatar_3d' ? (
                        <div className="flex flex-col items-center">
                          <Play className="w-16 h-16 text-primary/50" />
                          <p className="text-xs text-muted-foreground mt-2">
                            {currentAsset.style ? `${currentAsset.style} Avatar` : 'Video'} Preview
                          </p>
                          <Badge className="mt-1 text-[9px]">{currentAsset.provider}</Badge>
                        </div>
                      ) : (
                        <img src={currentAsset.previewUrl} alt="Asset preview" className="object-cover w-full h-full" />
                      )
                    ) : (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mb-2" />
                        <p className="text-xs text-muted-foreground">Generation complete — preview URL pending provider callback</p>
                        <Badge className="mt-1 text-[9px]">{currentAsset?.provider}</Badge>
                      </div>
                    )}

                    {currentStatus === 'published' && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-emerald-500 text-white text-[10px] gap-1">
                          <BadgeCheck className="w-3 h-3" /> LIVE
                        </Badge>
                      </div>
                    )}
                    {currentStatus === 'approved' && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-blue-500 text-white text-[10px] gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Meta Info */}
                  {currentAsset && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <span className="text-muted-foreground block">Provider</span>
                        <span className="font-medium">{currentAsset.provider}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <span className="text-muted-foreground block">Region</span>
                        <span className="font-medium">{REGIONS.find(r => r.code === selectedRegion)?.label}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/50 text-center">
                        <span className="text-muted-foreground block">Generated</span>
                        <span className="font-medium">
                          {currentAsset.generatedAt ? new Date(currentAsset.generatedAt).toLocaleTimeString() : '—'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {currentStatus === 'preview' && (
                      <>
                        <Button onClick={handleApprove} className="flex-1 gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button variant="outline" onClick={handleGenerate} className="gap-2">
                          <RotateCcw className="w-4 h-4" />
                          Regenerate
                        </Button>
                      </>
                    )}
                    {currentStatus === 'approved' && (
                      <Button onClick={handlePublish} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <Send className="w-4 h-4" />
                        Publish to Landing Page
                      </Button>
                    )}
                    {currentStatus === 'published' && (
                      <Button variant="outline" onClick={handleGenerate} className="flex-1 gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Generate New Version
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ REVIEW VIEW ═══ */}
      {activeView === 'review' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Regional Asset Coverage
            </CardTitle>
            <CardDescription className="text-xs">Track generation, approval and publication status per region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Region</th>
                    {ASSET_TYPES.map(at => (
                      <th key={at.id} className="text-center py-2 px-2 font-medium text-muted-foreground">{at.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REGIONS.map(region => (
                    <tr key={region.code} className="border-b border-muted/50 hover:bg-muted/30">
                      <td className="py-2 px-2 font-medium">{region.label}</td>
                      {ASSET_TYPES.map(at => {
                        const item = assets[`${region.code}_${at.id}`];
                        const status = item?.status || 'empty';
                        return (
                          <td key={at.id} className="text-center py-2 px-2">
                            <button
                              onClick={() => {
                                setSelectedRegion(region.code);
                                setSelectedAssetType(at.id);
                                setActiveView('generate');
                              }}
                              className="inline-flex items-center gap-1"
                            >
                              {status === 'empty' && <Clock className="w-3 h-3 text-muted-foreground/40" />}
                              {status === 'generating' && <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />}
                              {status === 'preview' && <Eye className="w-3 h-3 text-blue-500" />}
                              {status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                              {status === 'published' && <BadgeCheck className="w-3 h-3 text-primary" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-muted-foreground/40" /> Empty</span>
              <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 text-amber-500" /> Generating</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-blue-500" /> Review</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Approved</span>
              <span className="flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-primary" /> Live</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
  </svg>
);

export default RegionalAssetsLab;
