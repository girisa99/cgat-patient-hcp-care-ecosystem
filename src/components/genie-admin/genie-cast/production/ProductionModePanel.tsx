/**
 * B-022 + B-023: Production Mode Panel — Multi-Mode Controls
 *
 * Surfaces the correct production controls based on the selected video styles:
 *   - Avatar mode: gender, style (photorealistic/3D/2D), placement, regional wardrobe
 *   - 3D mode: poly count, texture quality, AR optimization, output format (GLB/USDZ)
 *   - Animation mode: style, frame rate, motion intensity
 *   - Cinematic mode: color grading, aspect ratio, HDR toggle
 *   - VR/AR mode: spatial rendering, 90fps, USDZ export
 *   - Audio/TTS: voice provider routing, speed, pitch, emotion
 *   - Music/SFX: background music, sound effects, ducking
 *
 * Reads from StyleDrivenProductionConfig's `deriveProductionRequirements()`
 * to decide which panels to show.
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  User,
  Box,
  Sparkles,
  Mic,
  Music,
  Volume2,
  Eye,
  Glasses,
  Film,
  Palette,
  Settings2,
  ChevronDown,
  Gauge,
  Monitor,
  Smartphone,
  Clapperboard,
  Headphones,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { deriveProductionRequirements } from '../StyleDrivenProductionConfig';
import type { VideoStyleType } from '../VideoStyleCards';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ProductionModeSettings {
  // Avatar
  avatarGender: 'male' | 'female';
  avatarStyle: 'photorealistic' | '3d_pixar' | '2d_animated' | 'full_body' | 'digital_twin';
  avatarPlacement: 'intro_outro' | 'chapter_intros' | 'throughout';
  avatarSize: 'small' | 'medium' | 'large';

  // 3D
  threeDQuality: 'draft' | 'standard' | 'high';
  threeDFormat: 'glb' | 'gltf' | 'usdz' | 'fbx';
  enableAR: boolean;

  // Animation
  animationFps: 24 | 30 | 60;
  motionIntensity: number; // 0-100

  // Cinematic
  colorGrading: 'none' | 'warm' | 'cool' | 'vintage' | 'noir' | 'vivid';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3' | '21:9';

  // Audio
  ttsSpeed: number;    // 0.5-2.0
  ttsPitch: number;    // -20 to 20
  ttsEmotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'serious' | 'whisper';

  // Music/SFX
  enableMusic: boolean;
  musicMood: 'energetic' | 'calm' | 'corporate' | 'emotional' | 'upbeat' | 'dramatic';
  musicVolume: number;  // 0-100
  enableSFX: boolean;
  enableDucking: boolean;

  // Quality
  renderQuality: 'preview' | 'production' | 'cinematic';
}

interface ProductionModePanelProps {
  selectedStyles: VideoStyleType[];
  settings: ProductionModeSettings;
  onSettingsChange: (settings: Partial<ProductionModeSettings>) => void;
  selectedLanguage: string;
  disabled?: boolean;
  className?: string;
}

// ─── Mode Section Components ────────────────────────────────────────────────

function AvatarSection({
  settings,
  onChange,
  disabled,
}: {
  settings: ProductionModeSettings;
  onChange: (s: Partial<ProductionModeSettings>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <User className="w-4 h-4 text-blue-500" />
        Avatar & Presenter
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Gender</Label>
          <Select value={settings.avatarGender} onValueChange={v => onChange({ avatarGender: v as any })} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Style</Label>
          <Select value={settings.avatarStyle} onValueChange={v => onChange({ avatarStyle: v as any })} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="photorealistic">Photorealistic</SelectItem>
              <SelectItem value="3d_pixar">3D Pixar</SelectItem>
              <SelectItem value="2d_animated">2D Animated</SelectItem>
              <SelectItem value="full_body">Full Body</SelectItem>
              <SelectItem value="digital_twin">Digital Twin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Placement</Label>
          <Select value={settings.avatarPlacement} onValueChange={v => onChange({ avatarPlacement: v as any })} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="throughout">Throughout</SelectItem>
              <SelectItem value="intro_outro">Intro & Outro</SelectItem>
              <SelectItem value="chapter_intros">Chapter Intros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Size</Label>
          <Select value={settings.avatarSize} onValueChange={v => onChange({ avatarSize: v as any })} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="small">PIP Small</SelectItem>
              <SelectItem value="medium">PIP Medium</SelectItem>
              <SelectItem value="large">Full Frame</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function ThreeDSection({
  settings,
  onChange,
  disabled,
}: {
  settings: ProductionModeSettings;
  onChange: (s: Partial<ProductionModeSettings>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Box className="w-4 h-4 text-orange-500" />
        3D Rendering
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Quality</Label>
          <Select value={settings.threeDQuality} onValueChange={v => onChange({ threeDQuality: v as any })} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft (fast)</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="high">High (slow)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Export Format</Label>
          <Select value={settings.threeDFormat} onValueChange={v => onChange({ threeDFormat: v as any })} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="glb">GLB (Web)</SelectItem>
              <SelectItem value="gltf">glTF</SelectItem>
              <SelectItem value="usdz">USDZ (Apple)</SelectItem>
              <SelectItem value="fbx">FBX (Unity)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-xs flex items-center gap-1.5">
          <Glasses className="w-3.5 h-3.5" />
          AR Optimized (90fps)
        </Label>
        <Switch
          checked={settings.enableAR}
          onCheckedChange={v => onChange({ enableAR: v })}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function AnimationSection({
  settings,
  onChange,
  disabled,
}: {
  settings: ProductionModeSettings;
  onChange: (s: Partial<ProductionModeSettings>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="w-4 h-4 text-pink-500" />
        Animation
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Frame Rate</Label>
          <Select
            value={String(settings.animationFps)}
            onValueChange={v => onChange({ animationFps: Number(v) as 24 | 30 | 60 })}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24 fps (Film)</SelectItem>
              <SelectItem value="30">30 fps (Web)</SelectItem>
              <SelectItem value="60">60 fps (Smooth)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Motion Intensity: {settings.motionIntensity}%</Label>
          <Slider
            value={[settings.motionIntensity]}
            onValueChange={([v]) => onChange({ motionIntensity: v })}
            max={100}
            step={5}
            disabled={disabled}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}

function CinematicSection({
  settings,
  onChange,
  disabled,
}: {
  settings: ProductionModeSettings;
  onChange: (s: Partial<ProductionModeSettings>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clapperboard className="w-4 h-4 text-amber-500" />
        Cinematic
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Color Grading</Label>
          <Select value={settings.colorGrading} onValueChange={v => onChange({ colorGrading: v as any })} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cool">Cool</SelectItem>
              <SelectItem value="vintage">Vintage</SelectItem>
              <SelectItem value="noir">Film Noir</SelectItem>
              <SelectItem value="vivid">Vivid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Aspect Ratio</Label>
          <Select value={settings.aspectRatio} onValueChange={v => onChange({ aspectRatio: v as any })} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9 (YouTube)</SelectItem>
              <SelectItem value="9:16">9:16 (TikTok/Reels)</SelectItem>
              <SelectItem value="1:1">1:1 (Instagram)</SelectItem>
              <SelectItem value="4:3">4:3 (Presentation)</SelectItem>
              <SelectItem value="21:9">21:9 (CinemaScope)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function AudioSection({
  settings,
  onChange,
  disabled,
}: {
  settings: ProductionModeSettings;
  onChange: (s: Partial<ProductionModeSettings>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Mic className="w-4 h-4 text-emerald-500" />
        Voice & TTS
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Speed: {settings.ttsSpeed.toFixed(1)}x</Label>
          <Slider
            value={[settings.ttsSpeed * 100]}
            onValueChange={([v]) => onChange({ ttsSpeed: v / 100 })}
            min={50} max={200} step={10}
            disabled={disabled}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-xs">Pitch: {settings.ttsPitch > 0 ? '+' : ''}{settings.ttsPitch}</Label>
          <Slider
            value={[settings.ttsPitch + 20]}
            onValueChange={([v]) => onChange({ ttsPitch: v - 20 })}
            min={0} max={40} step={1}
            disabled={disabled}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-xs">Emotion</Label>
          <Select value={settings.ttsEmotion} onValueChange={v => onChange({ ttsEmotion: v as any })} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="happy">Happy</SelectItem>
              <SelectItem value="excited">Excited</SelectItem>
              <SelectItem value="serious">Serious</SelectItem>
              <SelectItem value="sad">Sad</SelectItem>
              <SelectItem value="whisper">Whisper</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function MusicSection({
  settings,
  onChange,
  disabled,
}: {
  settings: ProductionModeSettings;
  onChange: (s: Partial<ProductionModeSettings>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Music className="w-4 h-4 text-violet-500" />
        Music & Sound
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Background Music</Label>
          <Switch
            checked={settings.enableMusic}
            onCheckedChange={v => onChange({ enableMusic: v })}
            disabled={disabled}
          />
        </div>

        {settings.enableMusic && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Mood</Label>
              <Select value={settings.musicMood} onValueChange={v => onChange({ musicMood: v as any })} disabled={disabled}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="emotional">Emotional</SelectItem>
                  <SelectItem value="upbeat">Upbeat</SelectItem>
                  <SelectItem value="dramatic">Dramatic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Volume: {settings.musicVolume}%</Label>
              <Slider
                value={[settings.musicVolume]}
                onValueChange={([v]) => onChange({ musicVolume: v })}
                max={100} step={5}
                disabled={disabled}
                className="mt-2"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label className="text-xs">Sound Effects</Label>
          <Switch
            checked={settings.enableSFX}
            onCheckedChange={v => onChange({ enableSFX: v })}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs flex items-center gap-1.5">
            <Volume2 className="w-3 h-3" />
            Auto-Duck Music Under Voice
          </Label>
          <Switch
            checked={settings.enableDucking}
            onCheckedChange={v => onChange({ enableDucking: v })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ProductionModePanel({
  selectedStyles,
  settings,
  onSettingsChange,
  selectedLanguage,
  disabled = false,
  className,
}: ProductionModePanelProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const requirements = useMemo(
    () => deriveProductionRequirements(selectedStyles),
    [selectedStyles],
  );

  const activeModes = useMemo(() => {
    const modes: string[] = [];
    if (requirements.needsAvatar) modes.push('avatar');
    if (requirements.needs3D) modes.push('3d');
    if (requirements.needsAnimation) modes.push('animation');
    // Cinematic if quality is cinematic OR any style is cinematic/documentary
    if (settings.renderQuality === 'cinematic' || selectedStyles.some(s =>
      s.includes('cinematic') || s.includes('documentary') || s.includes('short_film')
    )) modes.push('cinematic');
    return modes;
  }, [requirements, settings.renderQuality, selectedStyles]);

  if (selectedStyles.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings2 className="w-5 h-5 text-primary" />
              Production Mode Controls
            </CardTitle>
            <CardDescription>
              {activeModes.length > 0
                ? `Active: ${activeModes.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(' + ')}`
                : 'AI Video generation mode'}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* Quality selector */}
            <Select
              value={settings.renderQuality}
              onValueChange={v => onSettingsChange({ renderQuality: v as any })}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 w-32 text-xs">
                <Gauge className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preview">Preview (Fast)</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="cinematic">Cinematic (4K)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active mode badges */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {requirements.needsAvatar && (
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 text-[10px]">
              <User className="w-3 h-3 mr-1" /> Avatar
            </Badge>
          )}
          {requirements.needs3D && (
            <Badge className="bg-orange-500/10 text-orange-600 border-orange-200 text-[10px]">
              <Box className="w-3 h-3 mr-1" /> 3D
            </Badge>
          )}
          {requirements.needsAnimation && (
            <Badge className="bg-pink-500/10 text-pink-600 border-pink-200 text-[10px]">
              <Sparkles className="w-3 h-3 mr-1" /> Animation
            </Badge>
          )}
          {activeModes.includes('cinematic') && (
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 text-[10px]">
              <Clapperboard className="w-3 h-3 mr-1" /> Cinematic
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px]">
            <Film className="w-3 h-3 mr-1" /> AI Video
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            <Headphones className="w-3 h-3 mr-1" /> TTS + Audio
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Conditional mode sections */}
        {requirements.needsAvatar && (
          <>
            <AvatarSection settings={settings} onChange={onSettingsChange} disabled={disabled} />
            <Separator />
          </>
        )}

        {requirements.needs3D && (
          <>
            <ThreeDSection settings={settings} onChange={onSettingsChange} disabled={disabled} />
            <Separator />
          </>
        )}

        {requirements.needsAnimation && (
          <>
            <AnimationSection settings={settings} onChange={onSettingsChange} disabled={disabled} />
            <Separator />
          </>
        )}

        {activeModes.includes('cinematic') && (
          <>
            <CinematicSection settings={settings} onChange={onSettingsChange} disabled={disabled} />
            <Separator />
          </>
        )}

        {/* Audio is always shown */}
        <AudioSection settings={settings} onChange={onSettingsChange} disabled={disabled} />

        {/* Advanced: Music/SFX — collapsible */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between h-7 text-xs" disabled={disabled}>
              <span className="flex items-center gap-1.5">
                <Music className="w-3 h-3" />
                Music & Sound Effects
              </span>
              <ChevronDown className={cn('w-3 h-3 transition-transform', showAdvanced && 'rotate-180')} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <MusicSection settings={settings} onChange={onSettingsChange} disabled={disabled} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// ─── Default Settings Factory ───────────────────────────────────────────────

export function getDefaultProductionSettings(): ProductionModeSettings {
  return {
    avatarGender: 'female',
    avatarStyle: 'photorealistic',
    avatarPlacement: 'throughout',
    avatarSize: 'medium',
    threeDQuality: 'standard',
    threeDFormat: 'glb',
    enableAR: false,
    animationFps: 30,
    motionIntensity: 50,
    colorGrading: 'none',
    aspectRatio: '16:9',
    ttsSpeed: 1.0,
    ttsPitch: 0,
    ttsEmotion: 'neutral',
    enableMusic: true,
    musicMood: 'corporate',
    musicVolume: 30,
    enableSFX: false,
    enableDucking: true,
    renderQuality: 'production',
  };
}

export default ProductionModePanel;
