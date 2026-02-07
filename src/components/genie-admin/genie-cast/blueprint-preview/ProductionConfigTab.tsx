/**
 * Blueprint Preview Modal - Production Config Preview Tab
 * Structured read-only summary replacing raw JSON dump
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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VideoBlueprint } from '@/hooks/useVideoBlueprints';

interface ProductionConfigTabProps {
  blueprint: VideoBlueprint;
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
};

export function ProductionConfigTab({ blueprint }: ProductionConfigTabProps) {
  const defaultSettings = blueprint.default_settings as Record<string, any> || {};
  const stylePreset = blueprint.style_preset as Record<string, any> || {};
  const styleIntent = blueprint.style_intent || stylePreset.style_intent || 'cinematic';
  const toneModifier = blueprint.tone_modifier || stylePreset.tone_modifier || 'neutral';
  const aestheticKeywords = blueprint.aesthetic_keywords || stylePreset.aesthetic_keywords || [];
  const targetRegions = blueprint.target_regions || [];

  const styleConfig = STYLE_INTENT_CONFIG[styleIntent] || STYLE_INTENT_CONFIG.cinematic;

  // Extract capability flags
  const capabilities = {
    avatar: defaultSettings.avatarEnabled || false,
    '3d': defaultSettings['3dEnabled'] || false,
    animation: defaultSettings.animationEnabled || false,
    arVr: defaultSettings.arvrEnabled || false,
    lipsync: defaultSettings.lipsyncEnabled || false,
  };

  // Extract aspect ratios from platforms
  const aspectRatios = new Set<string>();
  (blueprint.target_platform || []).forEach(p => {
    if (['tiktok', 'instagram_reels', 'youtube_shorts'].includes(p)) aspectRatios.add('9:16');
    if (['youtube', 'linkedin', 'facebook'].includes(p)) aspectRatios.add('16:9');
    if (['instagram_post', 'twitter'].includes(p)) aspectRatios.add('1:1');
  });
  if (aspectRatios.size === 0) aspectRatios.add('16:9');

  return (
    <div className="p-6 space-y-6">
      {/* Section Header */}
      <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Settings2 className="h-3.5 w-3.5" />
          This preview shows the template's default configuration. All settings can be customized in <span className="font-medium text-foreground">Production Setup</span> after selecting this template.
        </p>
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

      {/* Capabilities */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Capabilities
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(capabilities).map(([key, enabled]) => (
            <div
              key={key}
              className={cn(
                "rounded-lg p-3 border text-center transition-colors",
                enabled 
                  ? "bg-primary/5 border-primary/30" 
                  : "bg-muted/20 border-border/30 opacity-50"
              )}
            >
              {key === 'avatar' && <Sparkles className="h-5 w-5 mx-auto mb-1 text-primary" />}
              {key === '3d' && <Box className="h-5 w-5 mx-auto mb-1 text-primary" />}
              {key === 'animation' && <Wand2 className="h-5 w-5 mx-auto mb-1 text-primary" />}
              {key === 'arVr' && <Globe2 className="h-5 w-5 mx-auto mb-1 text-primary" />}
              {key === 'lipsync' && <Volume2 className="h-5 w-5 mx-auto mb-1 text-primary" />}
              <p className="text-[10px] font-medium capitalize">{key === 'arVr' ? 'AR/VR' : key === '3d' ? '3D' : key}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {enabled ? '✅ Enabled' : '—'}
              </p>
            </div>
          ))}
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
              <p className="text-sm font-medium">{blueprint.target_platform?.length || 0} targeted</p>
            </div>
          </div>
        </div>
      </div>

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
