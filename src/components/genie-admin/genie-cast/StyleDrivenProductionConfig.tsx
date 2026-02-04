/**
 * STYLE-DRIVEN PRODUCTION CONFIG
 * 
 * Auto-derives production settings from selected video styles.
 * Replaces manual toggles with smart, style-based configuration.
 * 
 * v2: Shows ALL selected styles with their individual requirements
 */

import React, { useMemo } from 'react';
import {
  User,
  Box,
  Sparkles,
  Check,
  Clock,
  Palette,
  ArrowRight,
  Settings2,
  Film,
  Mic,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { 
  VIDEO_STYLE_PROVIDERS, 
  styleRequiresAvatar, 
  styleRequires3D,
} from '@/config/video-style-pipeline-mapping';
import type { VideoStyleType } from './VideoStyleCards';
import { REGIONAL_AVATARS } from '../FullProductionModeConfig';

interface StyleDrivenConfigProps {
  selectedStyles: VideoStyleType[];
  selectedLanguage: string;
  onNavigateToOverview: () => void;
  // Optional overrides for fine-tuning
  avatarGender: 'male' | 'female';
  onAvatarGenderChange: (gender: 'male' | 'female') => void;
  quality: 'preview' | 'production' | 'cinematic';
  disabled?: boolean;
}

// Style display names - use Partial since not all styles need explicit mapping
const STYLE_DISPLAY_NAMES: Partial<Record<VideoStyleType, string>> = {
  smart_storytelling: 'Smart Storytelling',
  hook_videos: 'Hook Videos',
  micro_drama: 'Micro-Drama',
  ugc_avatar_photorealistic: 'Photorealistic Avatar',
  ugc_avatar_3d_pixar: '3D Pixar Avatar',
  ugc_avatar_2d_animated: '2D Animated Avatar',
  talking_photos: 'Talking Photos',
  anime: 'Anime Style',
  image_to_life: 'Image to Life',
  explainer_3d: '3D Explainer',
  educational: 'Educational',
  interactive_quiz: 'Quiz Overlay',
  cta_videos: 'CTA Videos',
  social: 'Social Media',
  video_ads: 'Video Ads',
  product_demo: 'Product Demo',
};

// Helper to get style display name with fallback
const getStyleDisplayName = (styleId: VideoStyleType): string => {
  return STYLE_DISPLAY_NAMES[styleId] || styleId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Derive what production features are needed from styles
export function deriveProductionRequirements(styles: VideoStyleType[]) {
  const requirements = {
    needsAvatar: false,
    needsAnimation: false,
    needs3D: false,
    avatarProviders: new Set<string>(),
    animationProviders: new Set<string>(),
    threeDProviders: new Set<string>(),
    videoProviders: new Set<string>(),
    pacing: 'normal' as 'slow' | 'normal' | 'fast' | 'dynamic',
    ttsStyles: new Set<string>(),
    // Track which styles contribute what
    styleBreakdown: [] as Array<{
      style: VideoStyleType;
      needsAvatar: boolean;
      needsAnimation: boolean;
      needs3D: boolean;
      provider?: string;
    }>,
  };

  styles.forEach(style => {
    const config = VIDEO_STYLE_PROVIDERS[style];
    if (!config) return;

    const styleReq = {
      style,
      needsAvatar: !!config.avatarProvider,
      needsAnimation: !!config.animationProvider,
      needs3D: styleRequires3D(style),
      provider: config.avatarProvider || config.animationProvider || config.videoProvider,
    };
    requirements.styleBreakdown.push(styleReq);

    // Video providers
    requirements.videoProviders.add(config.videoProvider);

    // Avatar
    if (config.avatarProvider) {
      requirements.needsAvatar = true;
      requirements.avatarProviders.add(config.avatarProvider);
    }

    // Animation
    if (config.animationProvider) {
      requirements.needsAnimation = true;
      requirements.animationProviders.add(config.animationProvider);
    }

    // 3D
    if (styleRequires3D(style)) {
      requirements.needs3D = true;
      requirements.threeDProviders.add(config.animationProvider || 'meshy');
    }

    // TTS and pacing
    if (config.ttsStyle) requirements.ttsStyles.add(config.ttsStyle);
    if (config.pacing === 'fast' || config.pacing === 'dynamic') {
      requirements.pacing = config.pacing;
    }
  });

  return requirements;
}

// Estimate generation time based on requirements
export function estimateGenerationTime(
  requirements: ReturnType<typeof deriveProductionRequirements>,
  quality: 'preview' | 'production' | 'cinematic'
): number {
  let baseMinutes = 3;

  // Quality multiplier
  const qualityMultiplier = quality === 'cinematic' ? 2 : quality === 'production' ? 1.5 : 1;

  // Add time for features
  if (requirements.needsAvatar) baseMinutes += 8;
  if (requirements.needsAnimation) baseMinutes += 3;
  if (requirements.needs3D) baseMinutes += 10;

  return Math.round(baseMinutes * qualityMultiplier);
}

export const StyleDrivenProductionConfig: React.FC<StyleDrivenConfigProps> = ({
  selectedStyles,
  selectedLanguage,
  onNavigateToOverview,
  avatarGender,
  onAvatarGenderChange,
  quality,
  disabled = false,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const requirements = useMemo(
    () => deriveProductionRequirements(selectedStyles),
    [selectedStyles]
  );

  const estimatedTime = useMemo(
    () => estimateGenerationTime(requirements, quality),
    [requirements, quality]
  );

  const avatarConfig = REGIONAL_AVATARS[selectedLanguage as keyof typeof REGIONAL_AVATARS] || REGIONAL_AVATARS.en;

  // No styles selected
  if (selectedStyles.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 text-center">
        <Palette className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">No styles selected</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNavigateToOverview}
          className="text-xs"
        >
          Select Styles in Overview
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selected Styles with Requirements */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Auto-Configured from Styles
          </span>
          <Badge variant="secondary" className="text-[10px]">
            <Clock className="w-2.5 h-2.5 mr-1" />
            ~{estimatedTime} min
          </Badge>
        </div>

        {/* Individual Style Breakdown */}
        <div className="space-y-2 mb-3">
          {requirements.styleBreakdown.map(({ style, needsAvatar, needsAnimation, needs3D }) => (
            <div 
              key={style}
              className="flex items-center justify-between py-1.5 px-2 rounded bg-background/50 border border-border/50"
            >
              <div className="flex items-center gap-2">
                <Film className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {STYLE_DISPLAY_NAMES[style] || style}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {needsAvatar && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 gap-0.5">
                    <User className="w-2.5 h-2.5" />
                    Avatar
                  </Badge>
                )}
                {needsAnimation && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    Anim
                  </Badge>
                )}
                {needs3D && (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 gap-0.5">
                    <Box className="w-2.5 h-2.5" />
                    3D
                  </Badge>
                )}
                {!needsAvatar && !needsAnimation && !needs3D && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                    Basic
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Aggregated Feature Pills */}
        <div className="flex flex-wrap gap-2">
          {requirements.needsAvatar && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/30">
              <User className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium">Avatar</span>
              <Check className="w-3 h-3 text-green-500" />
            </div>
          )}
          {requirements.needsAnimation && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/10 border border-accent/30">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium">Animations</span>
              <Check className="w-3 h-3 text-green-500" />
            </div>
          )}
          {requirements.needs3D && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50 border border-secondary">
              <Box className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium">3D Elements</span>
              <Check className="w-3 h-3 text-green-500" />
            </div>
          )}
          {!requirements.needsAvatar && !requirements.needsAnimation && !requirements.needs3D && (
            <div className="text-xs text-muted-foreground">
              Basic video generation (no advanced features required)
            </div>
          )}
        </div>

        {/* Provider Attribution */}
        {(requirements.needsAvatar || requirements.needs3D || requirements.needsAnimation) && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="flex flex-wrap gap-1.5">
              {Array.from(requirements.avatarProviders).map(p => (
                <Badge key={`avatar-${p}`} variant="outline" className="text-[9px] px-1.5 py-0 gap-1">
                  <User className="w-2 h-2" />
                  {p}
                </Badge>
              ))}
              {Array.from(requirements.threeDProviders).map(p => (
                <Badge key={`3d-${p}`} variant="outline" className="text-[9px] px-1.5 py-0 gap-1">
                  <Box className="w-2 h-2" />
                  {p}
                </Badge>
              ))}
              {Array.from(requirements.animationProviders).filter(p => 
                !requirements.avatarProviders.has(p) && !requirements.threeDProviders.has(p)
              ).map(p => (
                <Badge key={`anim-${p}`} variant="outline" className="text-[9px] px-1.5 py-0 gap-1">
                  <Sparkles className="w-2 h-2" />
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TTS Style Summary */}
      {requirements.ttsStyles.size > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border">
          <Mic className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Voice styles:</span>
          <div className="flex flex-wrap gap-1">
            {Array.from(requirements.ttsStyles).map(tts => (
              <Badge key={tts} variant="secondary" className="text-[10px]">
                {tts}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Options (Collapsible) - Only show if avatar is needed */}
      {requirements.needsAvatar && (
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between h-7 text-xs"
              disabled={disabled}
            >
              <span className="flex items-center gap-1.5">
                <Settings2 className="w-3 h-3" />
                Fine-tune Avatar Options
              </span>
              <ArrowRight className={cn(
                "w-3 h-3 transition-transform",
                showAdvanced && "rotate-90"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="p-3 rounded-lg bg-muted/30 space-y-3">
              {/* Avatar Gender */}
              <div className="flex items-center justify-between">
                <Label className="text-xs">Presenter</Label>
                <Select 
                  value={avatarGender} 
                  onValueChange={(v) => onAvatarGenderChange(v as 'male' | 'female')}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">
                      {avatarConfig.female} (Female)
                    </SelectItem>
                    <SelectItem value="male">
                      {avatarConfig.male} (Male)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Regional Style Info */}
              <div className="text-[10px] text-muted-foreground">
                Style: {avatarConfig.style.replace(/_/g, ' ')} • Provider: {avatarConfig.provider}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Style Summary */}
      <div className="text-[10px] text-muted-foreground">
        {selectedStyles.length} style{selectedStyles.length > 1 ? 's' : ''} selected
        {requirements.pacing !== 'normal' && ` • ${requirements.pacing} pacing`}
      </div>
    </div>
  );
};

export default StyleDrivenProductionConfig;
