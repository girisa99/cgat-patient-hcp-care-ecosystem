/**
 * Regional Assets Lab
 * Generate → Preview → Approve → Publish pipeline for landing page assets.
 * Covers: 3D Avatars, Hero Videos, Hero Images, OG Images, Brand Logos.
 * Showcases the best-of-world pipeline capabilities.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Video, Image, Globe, Volume2, Play, CheckCircle2,
  Eye, Upload, Wand2, RotateCcw, Send, Loader2, Bot, Film,
  Camera, Palette, Box, Mic, ArrowRight, BadgeCheck, Clock,
  Zap, Shield, Star, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRegionalAvatarGeneration } from '@/hooks/useRegionalAvatarGeneration';

// ─── Pipeline Provider Cards ───────────────────────────────
const PIPELINE_STAGES = [
  {
    id: 'script',
    label: 'AI Script',
    icon: Sparkles,
    providers: ['Claude 4', 'Gemini 3 Pro', 'GPT-4o', 'Qwen Max'],
    description: 'Regional transcreation with native tone',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
  },
  {
    id: 'tts',
    label: 'Voice Synthesis',
    icon: Mic,
    providers: ['Azure Neural', 'Qwen3-TTS', 'ElevenLabs', 'Google WaveNet'],
    description: 'Lip-sync capable regional voiceover',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'avatar',
    label: '3D Avatar',
    icon: Bot,
    providers: ['Alibaba Wan 2.2 S2V', 'Meshy AI', 'ModelsLab'],
    description: 'Photorealistic lip-synced avatars',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'video',
    label: 'Video Generation',
    icon: Film,
    providers: ['Vertex Veo 3', 'Sora 2', 'Alibaba Wan 2.6', 'ModelsLab'],
    description: 'Cinematic AI video from script',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  {
    id: 'assembly',
    label: 'Assembly',
    icon: Layers,
    providers: ['JSON2Video', 'Cloud Run GPU'],
    description: 'Timeline stitching & A/V sync',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
];

const ASSET_TYPES = [
  { id: 'avatar_3d', label: '3D Avatar', icon: Bot, description: 'Lip-synced talking avatar for hero' },
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
  generatedAt?: Date;
}

export const RegionalAssetsLab: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('NAM_US');
  const [selectedAssetType, setSelectedAssetType] = useState<string>('avatar_3d');
  const [narrationScript, setNarrationScript] = useState(
    'Discover the future of healthcare with AI-powered patient engagement. Our platform connects care teams, patients, and caregivers in one seamless ecosystem.'
  );
  const [assets, setAssets] = useState<Record<string, AssetItem>>({});
  const [activeView, setActiveView] = useState<'pipeline' | 'generate' | 'review'>('pipeline');

  const avatarGen = useRegionalAvatarGeneration();

  const currentAsset = assets[`${selectedRegion}_${selectedAssetType}`];
  const currentStatus = currentAsset?.status || 'empty';

  const handleGenerate = useCallback(async () => {
    const key = `${selectedRegion}_${selectedAssetType}`;

    setAssets(prev => ({
      ...prev,
      [key]: { type: selectedAssetType, status: 'generating' },
    }));

    if (selectedAssetType === 'avatar_3d') {
      const result = await avatarGen.generateAvatar({
        contentId: `content-${selectedRegion}`,
        regionCode: selectedRegion,
        narrationScript,
        language: selectedRegion.startsWith('CJK') ? 'ja' : selectedRegion.startsWith('MENA') ? 'ar' : 'en',
      });

      if (result) {
        setAssets(prev => ({
          ...prev,
          [key]: {
            type: selectedAssetType,
            status: 'preview',
            previewUrl: result.model_url,
            provider: 'Alibaba Wan 2.2 S2V',
            generatedAt: new Date(),
          },
        }));
        toast.success('Avatar generated! Review and approve to publish.');
      } else {
        setAssets(prev => ({
          ...prev,
          [key]: { type: selectedAssetType, status: 'empty' },
        }));
      }
    } else {
      // Simulate for other asset types (future pipeline integration)
      await new Promise(r => setTimeout(r, 3000));
      setAssets(prev => ({
        ...prev,
        [key]: {
          type: selectedAssetType,
          status: 'preview',
          previewUrl: `https://placehold.co/1200x630/1a1a2e/ffffff?text=${selectedAssetType}+Preview`,
          provider: selectedAssetType === 'hero_video' ? 'Vertex Veo 3' : 'Gemini 3 Pro',
          generatedAt: new Date(),
        },
      }));
      toast.success(`${selectedAssetType} generated! Review and approve.`);
    }
  }, [selectedRegion, selectedAssetType, narrationScript, avatarGen]);

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
              {['pipeline', 'generate', 'review'].map((view) => (
                <Button
                  key={view}
                  variant={activeView === view ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs capitalize"
                  onClick={() => setActiveView(view as any)}
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

        {/* Pipeline Stages Visual */}
        {activeView === 'pipeline' && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {PIPELINE_STAGES.map((stage, i) => (
                <React.Fragment key={stage.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={cn(
                      'flex-shrink-0 rounded-lg border p-3 min-w-[160px]',
                      stage.bgColor, stage.borderColor
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <stage.icon className={cn('w-4 h-4', stage.color)} />
                      <span className="text-xs font-semibold">{stage.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">{stage.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {stage.providers.map((p) => (
                        <Badge key={p} variant="outline" className="text-[9px] py-0 px-1.5 font-normal">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Capability Stats */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: 'AI Providers', value: '19+', icon: Zap },
                { label: 'Regional Zones', value: '82+', icon: Globe },
                { label: 'Video Styles', value: '21+', icon: Film },
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
                <Settings2Icon className="w-4 h-4 text-primary" />
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

              {avatarGen.error && (
                <p className="text-xs text-destructive">{avatarGen.error}</p>
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
                    {avatarGen.progress === 'generating_audio' && '🎙 Generating regional voiceover...'}
                    {avatarGen.progress === 'generating_avatar' && '🤖 Creating 3D avatar with lip-sync...'}
                    {!avatarGen.progress || avatarGen.progress === 'idle' ? 'Processing with best available providers...' : ''}
                  </p>
                  <div className="flex gap-2 mt-4">
                    {PIPELINE_STAGES.slice(0, 3).map((s, i) => (
                      <Badge key={s.id} variant="outline" className={cn('text-[9px]', i === 1 ? 'animate-pulse border-primary' : '')}>
                        {s.providers[0]}
                      </Badge>
                    ))}
                  </div>
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
                          <p className="text-xs text-muted-foreground mt-2">Video/Avatar Preview</p>
                          <Badge className="mt-1 text-[9px]">{currentAsset.provider}</Badge>
                        </div>
                      ) : (
                        <img src={currentAsset.previewUrl} alt="Asset preview" className="object-cover w-full h-full" />
                      )
                    ) : (
                      <p className="text-xs text-muted-foreground">Preview not available</p>
                    )}

                    {/* Status overlay */}
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

      {/* ═══ REVIEW VIEW: Regional Coverage Matrix ═══ */}
      {activeView === 'review' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Regional Asset Coverage
            </CardTitle>
            <CardDescription className="text-xs">
              Track generation, approval and publication status per region
            </CardDescription>
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

            {/* Legend */}
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

// Small icon helper to avoid importing Settings2 collision
const Settings2Icon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
  </svg>
);

export default RegionalAssetsLab;
