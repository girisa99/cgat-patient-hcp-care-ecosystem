/**
 * Blueprint Preview Modal - Production Config Preview Tab
 * Structured read-only summary with all data properly displayed
 * Shows what users will configure in Production Setup
 */

import React from 'react';
import {
  Settings2,
  Palette,
  Sparkles,
  Monitor,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Wand2,
  Volume2,
  Box,
  Clock,
  Target,
  Layers,
  Zap,
  User,
  Mic,
  Image as ImageIcon,
  Film,
  Languages,
  FileText,
  Mic2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VideoBlueprint } from '@/hooks/useVideoBlueprints';
import { useCastCapabilities } from '@/hooks/useCastRegistry';
interface ProductionConfigTabProps {
  blueprint: VideoBlueprint;
  selectedVideoStyles?: any[];
}

// Style intent display mapping
const STYLE_INTENT_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  photorealistic: { label: 'Photorealistic', color: 'bg-blue-500/20 text-blue-400', description: 'High-fidelity real-world visuals' },
  cinematic: { label: 'Cinematic', color: 'bg-amber-500/20 text-amber-400', description: 'Film-quality with dramatic lighting' },
  'ugc-authentic': { label: 'UGC Authentic', color: 'bg-green-500/20 text-green-400', description: 'User-generated content feel' },
  corporate: { label: 'Corporate', color: 'bg-slate-500/20 text-slate-400', description: 'Clean, professional business style' },
  animated: { label: 'Animated', color: 'bg-purple-500/20 text-purple-400', description: 'Motion graphics & illustration' },
  editorial: { label: 'Editorial', color: 'bg-rose-500/20 text-rose-400', description: 'Magazine/publication quality' },
  minimal: { label: 'Minimal', color: 'bg-neutral-500/20 text-neutral-400', description: 'Clean, whitespace-focused' },
  retro: { label: 'Retro', color: 'bg-orange-500/20 text-orange-400', description: 'Vintage & nostalgic aesthetics' },
  motion_graphics: { label: 'Motion Graphics', color: 'bg-indigo-500/20 text-indigo-400', description: 'Dynamic animated visuals' },
  hyper_real: { label: 'Hyper-Realistic 4K', color: 'bg-cyan-500/20 text-cyan-400', description: 'Ultra-high resolution realism' },
  product_hero: { label: 'Product Hero', color: 'bg-pink-500/20 text-pink-400', description: 'Product-focused showcase' },
  pixar_disney: { label: 'Pixar/Disney', color: 'bg-yellow-500/20 text-yellow-400', description: '3D animated storytelling' },
  talking_head: { label: 'Talking Head', color: 'bg-teal-500/20 text-teal-400', description: 'Presenter/avatar driven' },
  anime: { label: 'Anime', color: 'bg-red-500/20 text-red-400', description: 'Japanese anime style' },
  whiteboard: { label: 'Whiteboard', color: 'bg-gray-500/20 text-gray-400', description: 'Hand-drawn explainer' },
  explainer: { label: 'Explainer', color: 'bg-lime-500/20 text-lime-400', description: 'Educational explainer' },
  documentary: { label: 'Documentary', color: 'bg-stone-500/20 text-stone-400', description: 'Documentary/reportage style' },
  ppt_animation: { label: 'PPT/Deck', color: 'bg-violet-500/20 text-violet-400', description: 'Presentation animation' },
  ppt_slides: { label: 'PPT Slides', color: 'bg-violet-500/20 text-violet-400', description: 'Static slides' },
  pitch_deck: { label: 'Pitch Deck', color: 'bg-fuchsia-500/20 text-fuchsia-400', description: 'Investor pitch presentation' },
  banner_static: { label: 'Static Banner', color: 'bg-emerald-500/20 text-emerald-400', description: 'Marketing banners' },
  banner_animated: { label: 'Animated Banner', color: 'bg-emerald-500/20 text-emerald-400', description: 'Animated display ads' },
  infographic: { label: 'Infographic', color: 'bg-sky-500/20 text-sky-400', description: 'Data visualization' },
  social_card: { label: 'Social Card', color: 'bg-pink-500/20 text-pink-400', description: 'Social media cards' },
  avatar_presenter: { label: 'Avatar Presenter', color: 'bg-teal-500/20 text-teal-400', description: 'AI avatar narration' },
  '3d_product': { label: '3D Product', color: 'bg-cyan-500/20 text-cyan-400', description: '3D product showcase' },
  vr_experience: { label: 'VR/AR', color: 'bg-violet-500/20 text-violet-400', description: 'Immersive experience' },
};

// Icon mapping for dynamic capabilities from DB
const CAPABILITY_ICON_MAP: Record<string, React.ReactNode> = {
  avatar_generation: <User className="h-5 w-5 mx-auto mb-1 text-primary" />,
  '3d_generation': <Box className="h-5 w-5 mx-auto mb-1 text-primary" />,
  animation: <Wand2 className="h-5 w-5 mx-auto mb-1 text-primary" />,
  video_generation: <Film className="h-5 w-5 mx-auto mb-1 text-primary" />,
  image_generation: <ImageIcon className="h-5 w-5 mx-auto mb-1 text-primary" />,
  tts: <Volume2 className="h-5 w-5 mx-auto mb-1 text-primary" />,
  lip_sync: <Mic2 className="h-5 w-5 mx-auto mb-1 text-primary" />,
  voice_cloning: <Mic className="h-5 w-5 mx-auto mb-1 text-primary" />,
  translation: <Languages className="h-5 w-5 mx-auto mb-1 text-primary" />,
  transcription: <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />,
};

// Helper to format default_settings values for display (no raw JSON)
function formatSettingValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? '✅' : '❌';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined) return '—';
  // For objects, show a summary instead of raw JSON
  return `${Object.keys(value as object).length} settings`;
}

export function ProductionConfigTab({ blueprint, selectedVideoStyles = [] }: ProductionConfigTabProps) {
  const defaultSettings = blueprint.default_settings as Record<string, any> || {};
  const stylePreset = blueprint.style_preset as Record<string, any> || {};
  const styleIntent = blueprint.style_intent || stylePreset.style_intent || 'cinematic';
  const toneModifier = blueprint.tone_modifier || stylePreset.tone_modifier || 'neutral';
  const aestheticKeywords = blueprint.aesthetic_keywords || stylePreset.aesthetic_keywords || [];
  const targetRegions = blueprint.target_regions || [];

  const styleConfig = STYLE_INTENT_CONFIG[styleIntent] || STYLE_INTENT_CONFIG.cinematic;

  // Fetch full capabilities list from DB
  const { data: dbCapabilities = [] } = useCastCapabilities();

  // Derive which capabilities are enabled from blueprint defaults + selected styles
  const styleRequiresAvatar = selectedVideoStyles.some((s: any) => 
    s?.avatarProvider || s?.id?.includes('avatar') || s?.label?.toLowerCase()?.includes('avatar')
  );
  const styleRequires3D = selectedVideoStyles.some((s: any) => 
    s?.id?.includes('3d') || s?.label?.toLowerCase()?.includes('3d') || s?.label?.toLowerCase()?.includes('pixar')
  );
  const styleRequiresAnimation = selectedVideoStyles.some((s: any) => 
    s?.animationProvider || s?.id?.includes('anim') || s?.label?.toLowerCase()?.includes('animated')
  );
  const styleRequiresLipsync = selectedVideoStyles.some((s: any) =>
    s?.id?.includes('lipsync') || styleRequiresAvatar
  );

  // Map DB capabilities to enabled state using blueprint defaults + style derivation
  const capabilityEnabledMap: Record<string, boolean> = {
    avatar_generation: defaultSettings.avatarEnabled || styleRequiresAvatar,
    '3d_generation': defaultSettings['3dEnabled'] || styleRequires3D,
    animation: defaultSettings.animationEnabled || styleRequiresAnimation,
    lip_sync: defaultSettings.lipsyncEnabled || styleRequiresLipsync,
    video_generation: !!(defaultSettings.videoProvider),
    image_generation: true, // always available
    tts: true, // always available
    voice_cloning: false,
    translation: true,
    transcription: false,
  };

  // Also check the capabilities array from default_settings
  const settingsCapabilities = (defaultSettings.capabilities as string[]) || [];
  settingsCapabilities.forEach(cap => {
    const normalizedKey = cap.replace(/-/g, '_').replace('ar_vr', 'ar_vr').replace('text_to_3d', '3d_generation').replace('image_to_3d', '3d_generation');
    if (normalizedKey in capabilityEnabledMap) {
      capabilityEnabledMap[normalizedKey] = true;
    }
  });

  // Extract aspect ratios from platforms
  const aspectRatios = new Set<string>();
  (blueprint.target_platform || []).forEach(p => {
    if (['tiktok', 'instagram_reels', 'youtube_shorts'].includes(p)) aspectRatios.add('9:16');
    if (['youtube', 'linkedin', 'facebook'].includes(p)) aspectRatios.add('16:9');
    if (['instagram_post', 'twitter'].includes(p)) aspectRatios.add('1:1');
    if (['landing_page'].includes(p)) aspectRatios.add('21:9');
    if (['instagram_post'].includes(p)) aspectRatios.add('4:5');
    if (['digital_signage'].includes(p)) aspectRatios.add('32:9');
  });
  if (aspectRatios.size === 0) aspectRatios.add('16:9');

  // Extract more data from blueprint
  const scenes = blueprint.scenes || [];
  const category = blueprint.category || 'general';
  const industryTags = blueprint.industry_tags || [];

  return (
    <div className="p-6 space-y-6">
      {/* Section Header */}
      <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Settings2 className="h-3.5 w-3.5" />
          This preview shows the template's default configuration. All settings can be customized in <span className="font-medium text-foreground">Production Setup</span> after selecting this template.
        </p>
      </div>

      {/* Quick Summary Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-card/50 rounded-lg p-3 border border-border/50 text-center">
          <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold">{blueprint.estimated_duration_seconds}s</p>
          <p className="text-[10px] text-muted-foreground">Duration</p>
        </div>
        <div className="bg-card/50 rounded-lg p-3 border border-border/50 text-center">
          <Target className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold">{blueprint.target_platform?.length || 0}</p>
          <p className="text-[10px] text-muted-foreground">Platforms</p>
        </div>
        <div className="bg-card/50 rounded-lg p-3 border border-border/50 text-center">
          <Layers className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold capitalize">{category}</p>
          <p className="text-[10px] text-muted-foreground">Category</p>
        </div>
        <div className="bg-card/50 rounded-lg p-3 border border-border/50 text-center">
          <Zap className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold">{Object.values(capabilityEnabledMap).filter(Boolean).length}</p>
          <p className="text-[10px] text-muted-foreground">Capabilities</p>
        </div>
      </div>

      {/* Style Intent */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Visual Style
        </h3>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50 space-y-3">
          <div className="flex items-center gap-3">
            <Badge className={cn("text-xs px-3 py-1", styleConfig.color)}>
              {styleConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground">{styleConfig.description}</span>
          </div>
          
          {/* Tone */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tone:</span>
            <Badge variant="outline" className="text-xs capitalize">{toneModifier}</Badge>
          </div>

          {/* Selected Video Styles */}
          {selectedVideoStyles.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground block mb-1.5">Selected Video Styles</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedVideoStyles.map((style: any, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-[10px]">
                    {style?.title || style?.label || style?.id || `Style ${idx + 1}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Aesthetic Keywords */}
          {aestheticKeywords.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground block mb-1.5">Aesthetic Keywords</span>
              <div className="flex flex-wrap gap-1.5">
                {aestheticKeywords.map((keyword: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-[10px]">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Capabilities — Full list from DB */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Capabilities ({dbCapabilities.length})
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {dbCapabilities.map((cap) => {
            const isEnabled = capabilityEnabledMap[cap.value] ?? false;
            return (
              <div
                key={cap.value}
                className={cn(
                  "rounded-lg p-3 border text-center transition-colors",
                  isEnabled 
                    ? "bg-primary/5 border-primary/30" 
                    : "bg-muted/20 border-border/30 opacity-50"
                )}
              >
                {CAPABILITY_ICON_MAP[cap.value] || <Sparkles className="h-5 w-5 mx-auto mb-1 text-primary" />}
                <p className="text-[10px] font-medium">{cap.label}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {isEnabled ? '✅ Enabled' : '—'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Output Format */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          Output Format
        </h3>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Aspect Ratios</span>
              <div className="flex flex-wrap gap-1">
                {Array.from(aspectRatios).map(ratio => (
                  <Badge key={ratio} variant="secondary" className="text-xs">{ratio}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Duration</span>
              <p className="text-sm font-medium">{blueprint.estimated_duration_seconds}s</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Platforms</span>
              <div className="flex flex-wrap gap-1">
                {(blueprint.target_platform || []).slice(0, 4).map(p => (
                  <Badge key={p} variant="outline" className="text-[10px] capitalize">
                    {p.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {(blueprint.target_platform?.length || 0) > 4 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{(blueprint.target_platform?.length || 0) - 4} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Tags */}
      {industryTags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Industry Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {industryTags.map((tag: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs capitalize">
                {tag.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Regional Support */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Globe2 className="h-4 w-4" />
          Regional Support
        </h3>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          {targetRegions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {targetRegions.map((region: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs capitalize">
                  {region}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-2">
              <Globe2 className="h-6 w-6 mx-auto text-muted-foreground/50 mb-1" />
              <p className="text-xs text-muted-foreground">Global — All 14+ regions supported</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Configure specific regions in Production Setup
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Default Settings (Raw) */}
      {Object.keys(defaultSettings).length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Template Defaults
          </h3>
          <div className="bg-card/50 rounded-lg p-4 border border-border/50">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(defaultSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <Badge variant="outline" className="text-[10px] max-w-[200px] truncate">
                    {formatSettingValue(value)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* What's Customizable Note */}
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
        <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5">
          <ArrowRight className="h-3.5 w-3.5 text-primary" />
          Customizable in Production Setup
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            Visual style & tone overrides
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            Target platform selection
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            Brand assets (logos, colors)
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            Regional & language config
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            AI provider preferences
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            Scene duration & ordering
          </div>
        </div>
      </div>
    </div>
  );
}
