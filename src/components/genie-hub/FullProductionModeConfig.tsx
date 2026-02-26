/**
 * FULL PRODUCTION MODE CONFIGURATION
 * 
 * Adds AI Avatar, Animated Transitions, and 3D Product Showcases
 * throughout the Genie Cast marketing videos.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Sparkles,
  Box,
  Palette,
  Clock,
  Zap,
  Crown,
  ChevronRight,
  PlayCircle,
  RotateCcw,
  Star,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Avatar presenter options per region
export const REGIONAL_AVATARS = {
  'en': { male: 'James', female: 'Sarah', style: 'professional_western', provider: 'Alibaba Wan2.2' },
  'ar': { male: 'Ahmed', female: 'Fatima', style: 'professional_mena', provider: 'Alibaba Wan2.2' },
  'hi': { male: 'Raj', female: 'Priya', style: 'professional_south_asian', provider: 'Alibaba Wan2.2' },
  'zh': { male: 'Wei', female: 'Ming', style: 'professional_cjk', provider: 'Alibaba Wan2.2' },
  'ja': { male: 'Kenji', female: 'Yuki', style: 'professional_cjk', provider: 'Alibaba Wan2.2' },
  'ko': { male: 'Joon', female: 'Soo', style: 'professional_cjk', provider: 'Alibaba Wan2.2' },
  'es': { male: 'Carlos', female: 'Maria', style: 'professional_western', provider: 'Alibaba Wan2.2' },
  'fr': { male: 'Pierre', female: 'Sophie', style: 'professional_western', provider: 'Alibaba Wan2.2' },
  'de': { male: 'Hans', female: 'Anna', style: 'professional_western', provider: 'Alibaba Wan2.2' },
  'pt': { male: 'Pedro', female: 'Ana', style: 'professional_latam', provider: 'Alibaba Wan2.2' },
  'sw': { male: 'Juma', female: 'Amina', style: 'professional_african', provider: 'Alibaba Wan2.2' },
  'bn': { male: 'Rafiq', female: 'Aisha', style: 'professional_south_asian', provider: 'Alibaba Wan2.2' },
  'te': { male: 'Ravi', female: 'Lakshmi', style: 'professional_south_asian', provider: 'Alibaba Wan2.2' },
  'ta': { male: 'Kumar', female: 'Devi', style: 'professional_south_asian', provider: 'Alibaba Wan2.2' },
  'ur': { male: 'Ali', female: 'Zara', style: 'professional_south_asian', provider: 'Alibaba Wan2.2' },
  'id': { male: 'Budi', female: 'Siti', style: 'professional_sea', provider: 'Alibaba Wan2.2' },
};

// Animation transition styles
export const TRANSITION_STYLES = [
  { id: 'kinetic', name: 'Kinetic Typography', description: 'Animated text reveals', icon: '✨', provider: 'ModelsLab' },
  { id: 'slide', name: 'Slide Transitions', description: 'Smooth slide movements', icon: '📊', provider: 'CSS/Framer' },
  { id: 'particle', name: 'Particle Effects', description: 'Sparkle and glow effects', icon: '🌟', provider: 'ModelsLab' },
  { id: 'morph', name: 'Shape Morphing', description: 'Element transformations', icon: '🔄', provider: 'ModelsLab' },
  { id: 'glass', name: 'Glass Morphism', description: 'Modern blur effects', icon: '💎', provider: 'CSS/Framer' },
];

// 3D showcase options
export const THREED_STYLES = [
  { id: 'rotating', name: 'Rotating Logo', description: '3D logo rotation', icon: '🎯', provider: 'Meshy AI' },
  { id: 'floating', name: 'Floating Cards', description: 'Levitating product cards', icon: '🃏', provider: 'Meshy AI' },
  { id: 'hologram', name: 'Hologram Effect', description: 'Futuristic hologram', icon: '👁️', provider: 'Meshy AI' },
  { id: 'explode', name: 'Exploded View', description: 'Components expand', icon: '💥', provider: 'Meshy AI' },
];

export interface ProductionModeConfig {
  // Avatar Settings
  enableAvatar: boolean;
  avatarGender: 'male' | 'female';
  avatarPlacement: 'intro_outro' | 'chapter_intros' | 'throughout';
  avatarSize: 'small' | 'medium' | 'large';
  
  // Animation Settings
  enableAnimations: boolean;
  transitionStyle: string;
  animationIntensity: number; // 0-100
  
  // 3D Settings
  enable3D: boolean;
  threeDStyle: string;
  renderQuality: 'standard' | 'high' | 'premium';
  
  // Estimated time multiplier
  estimatedTimeMultiplier: number;
}

export const DEFAULT_PRODUCTION_CONFIG: ProductionModeConfig = {
  enableAvatar: true,
  avatarGender: 'female',
  avatarPlacement: 'intro_outro',
  avatarSize: 'medium',
  enableAnimations: true,
  transitionStyle: 'kinetic',
  animationIntensity: 70,
  enable3D: true,
  threeDStyle: 'rotating',
  renderQuality: 'high',
  estimatedTimeMultiplier: 3,
};

interface FullProductionModeConfigProps {
  config: ProductionModeConfig;
  onConfigChange: (config: ProductionModeConfig) => void;
  selectedLanguage: string;
  disabled?: boolean;
}

export const FullProductionModeConfig: React.FC<FullProductionModeConfigProps> = ({
  config,
  onConfigChange,
  selectedLanguage,
  disabled = false,
}) => {
  const avatarConfig = REGIONAL_AVATARS[selectedLanguage as keyof typeof REGIONAL_AVATARS] || REGIONAL_AVATARS.en;
  const selectedTransition = TRANSITION_STYLES.find(t => t.id === config.transitionStyle);
  const selected3D = THREED_STYLES.find(t => t.id === config.threeDStyle);

  // Calculate estimated generation time
  const baseTime = 7; // minutes for basic video
  const avatarTime = config.enableAvatar ? (config.avatarPlacement === 'throughout' ? 15 : 5) : 0;
  const animationTime = config.enableAnimations ? 3 : 0;
  const threeDTime = config.enable3D ? (config.renderQuality === 'premium' ? 10 : 5) : 0;
  const totalEstimate = baseTime + avatarTime + animationTime + threeDTime;

  const updateConfig = (partial: Partial<ProductionModeConfig>) => {
    onConfigChange({ ...config, ...partial });
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white gap-1">
            <Crown className="w-3 h-3" />
            Full Production Mode
          </Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <Clock className="w-3 h-3" />
            ~{totalEstimate} min estimated
          </Badge>
        </div>

        {/* Avatar Configuration */}
        <Card className={cn("border-2 transition-all", config.enableAvatar ? "border-purple-500/50 bg-purple-500/5" : "opacity-60")}>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" />
                AI Avatar Presenter
              </CardTitle>
              <Switch
                checked={config.enableAvatar}
                onCheckedChange={(v) => updateConfig({ enableAvatar: v })}
                disabled={disabled}
              />
            </div>
            <CardDescription className="text-xs">
              Regional avatar host with lip-synced voiceover
            </CardDescription>
          </CardHeader>
          {config.enableAvatar && (
            <CardContent className="pt-0 space-y-3">
              {/* Avatar Preview */}
              <div className="flex items-center gap-3 p-2 bg-background/50 rounded-lg">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                  config.avatarGender === 'male' ? "bg-blue-100" : "bg-pink-100"
                )}>
                  {config.avatarGender === 'male' ? '👨‍💼' : '👩‍💼'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {config.avatarGender === 'male' ? avatarConfig.male : avatarConfig.female}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {avatarConfig.style.replace(/_/g, ' ')}
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {avatarConfig.provider}
                </Badge>
              </div>

              {/* Gender Selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateConfig({ avatarGender: 'male' })}
                  disabled={disabled}
                  className={cn(
                    "p-2 rounded-lg border text-xs transition-all",
                    config.avatarGender === 'male' 
                      ? "border-blue-500 bg-blue-500/10 text-blue-600" 
                      : "hover:bg-muted"
                  )}
                >
                  👨‍💼 Male ({avatarConfig.male})
                </button>
                <button
                  onClick={() => updateConfig({ avatarGender: 'female' })}
                  disabled={disabled}
                  className={cn(
                    "p-2 rounded-lg border text-xs transition-all",
                    config.avatarGender === 'female' 
                      ? "border-pink-500 bg-pink-500/10 text-pink-600" 
                      : "hover:bg-muted"
                  )}
                >
                  👩‍💼 Female ({avatarConfig.female})
                </button>
              </div>

              {/* Placement */}
              <div className="space-y-1">
                <Label className="text-xs">Placement</Label>
                <Select 
                  value={config.avatarPlacement} 
                  onValueChange={(v) => updateConfig({ avatarPlacement: v as any })}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intro_outro">Intro & Outro only (fastest)</SelectItem>
                    <SelectItem value="chapter_intros">Chapter Intros</SelectItem>
                    <SelectItem value="throughout">Throughout video (longest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Avatar Size */}
              <div className="space-y-1">
                <Label className="text-xs">Avatar Size</Label>
                <div className="flex gap-1">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => updateConfig({ avatarSize: size })}
                      disabled={disabled}
                      className={cn(
                        "flex-1 p-1.5 rounded text-[10px] capitalize border transition-all",
                        config.avatarSize === size 
                          ? "border-purple-500 bg-purple-500/10" 
                          : "hover:bg-muted"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Animated Transitions */}
        <Card className={cn("border-2 transition-all", config.enableAnimations ? "border-amber-500/50 bg-amber-500/5" : "opacity-60")}>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Animated Transitions
              </CardTitle>
              <Switch
                checked={config.enableAnimations}
                onCheckedChange={(v) => updateConfig({ enableAnimations: v })}
                disabled={disabled}
              />
            </div>
            <CardDescription className="text-xs">
              Motion graphics and kinetic typography
            </CardDescription>
          </CardHeader>
          {config.enableAnimations && (
            <CardContent className="pt-0 space-y-3">
              {/* Style Selection */}
              <div className="grid grid-cols-5 gap-1.5">
                {TRANSITION_STYLES.map(style => (
                  <Tooltip key={style.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => updateConfig({ transitionStyle: style.id })}
                        disabled={disabled}
                        className={cn(
                          "p-2 rounded-lg border text-center transition-all",
                          config.transitionStyle === style.id 
                            ? "border-amber-500 bg-amber-500/10" 
                            : "hover:bg-muted"
                        )}
                      >
                        <span className="text-lg">{style.icon}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <div className="font-medium">{style.name}</div>
                        <div className="text-muted-foreground">{style.description}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              {/* Selected Style Info */}
              {selectedTransition && (
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg text-xs">
                  <span className="text-lg">{selectedTransition.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{selectedTransition.name}</div>
                    <div className="text-muted-foreground">{selectedTransition.description}</div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {selectedTransition.provider}
                  </Badge>
                </div>
              )}

              {/* Intensity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label className="text-xs">Animation Intensity</Label>
                  <span className="text-xs text-muted-foreground">{config.animationIntensity}%</span>
                </div>
                <Slider
                  value={[config.animationIntensity]}
                  onValueChange={([v]) => updateConfig({ animationIntensity: v })}
                  max={100}
                  step={10}
                  disabled={disabled}
                  className="py-2"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* 3D Product Showcases */}
        <Card className={cn("border-2 transition-all", config.enable3D ? "border-cyan-500/50 bg-cyan-500/5" : "opacity-60")}>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Box className="w-4 h-4 text-cyan-500" />
                3D Product Showcases
              </CardTitle>
              <Switch
                checked={config.enable3D}
                onCheckedChange={(v) => updateConfig({ enable3D: v })}
                disabled={disabled}
              />
            </div>
            <CardDescription className="text-xs">
              Rotating 3D logos and product cards
            </CardDescription>
          </CardHeader>
          {config.enable3D && (
            <CardContent className="pt-0 space-y-3">
              {/* 3D Style Selection */}
              <div className="grid grid-cols-4 gap-1.5">
                {THREED_STYLES.map(style => (
                  <Tooltip key={style.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => updateConfig({ threeDStyle: style.id })}
                        disabled={disabled}
                        className={cn(
                          "p-2 rounded-lg border text-center transition-all",
                          config.threeDStyle === style.id 
                            ? "border-cyan-500 bg-cyan-500/10" 
                            : "hover:bg-muted"
                        )}
                      >
                        <span className="text-lg">{style.icon}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <div className="font-medium">{style.name}</div>
                        <div className="text-muted-foreground">{style.description}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              {/* Selected 3D Info */}
              {selected3D && (
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg text-xs">
                  <span className="text-lg">{selected3D.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{selected3D.name}</div>
                    <div className="text-muted-foreground">{selected3D.description}</div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {selected3D.provider}
                  </Badge>
                </div>
              )}

              {/* Render Quality */}
              <div className="space-y-1">
                <Label className="text-xs">Render Quality</Label>
                <div className="flex gap-1">
                  {[
                    { id: 'standard', label: 'Standard', time: '+5 min' },
                    { id: 'high', label: 'High', time: '+7 min' },
                    { id: 'premium', label: 'Premium', time: '+10 min' },
                  ].map(q => (
                    <button
                      key={q.id}
                      onClick={() => updateConfig({ renderQuality: q.id as any })}
                      disabled={disabled}
                      className={cn(
                        "flex-1 p-1.5 rounded text-[10px] border transition-all flex flex-col items-center",
                        config.renderQuality === q.id 
                          ? "border-cyan-500 bg-cyan-500/10" 
                          : "hover:bg-muted"
                      )}
                    >
                      <span className="font-medium">{q.label}</span>
                      <span className="text-muted-foreground">{q.time}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-purple-500/10 via-amber-500/10 to-cyan-500/10 border-primary/20">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  Production Summary
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                  {config.enableAvatar && (
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3 h-3" /> Avatar
                    </span>
                  )}
                  {config.enableAnimations && (
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Animations
                    </span>
                  )}
                  {config.enable3D && (
                    <span className="inline-flex items-center gap-1">
                      <Box className="w-3 h-3" /> 3D
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">~{totalEstimate} min</div>
                <div className="text-[10px] text-muted-foreground">per language</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default FullProductionModeConfig;
