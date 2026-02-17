/**
 * Blueprint Preview Modal - AI Models Tab
 * Shows real providers from MASTER_ECOSYSTEM_REGISTRY, per-task routing, 
 * interactive zone display, prompt-based thumbnail regeneration,
 * AND per-task provider override dropdowns with auto-suggest based on region
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Cpu,
  Globe2,
  Wand2,
  Zap,
  Video,
  Mic,
  Image as ImageIcon,
  MessageSquare,
  Box,
  Sparkles,
  RefreshCw,
  Send,
  ChevronDown,
  Check,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  MASTER_AI_PROVIDERS,
  ZONE_ROUTING_CONFIG,
  getProvidersByCapability,
  getZoneForRegion,
  type ProviderCapability,
  type RoutingZone,
  type AIProviderEntry,
} from '@/config/master-ecosystem-registry';
import type { VideoBlueprint } from '@/hooks/useVideoBlueprints';

interface AIModelsTabProps {
  blueprint: VideoBlueprint;
  onRegenerateThumbnail?: (prompt: string) => void;
  isRegenerating?: boolean;
  /** User's selected region for auto-suggest */
  region?: string;
  /** Callback when user overrides provider per capability */
  onProviderOverrides?: (overrides: Record<string, string>) => void;
  /** Current provider overrides */
  providerOverrides?: Record<string, string>;
}

// Capability display configuration
const CAPABILITY_SECTIONS: {
  capability: ProviderCapability;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  { capability: 'video_gen', label: 'Video Generation', icon: <Video className="h-4 w-4" />, description: 'Text/Image to video creation' },
  { capability: 'image_gen', label: 'Image Generation', icon: <ImageIcon className="h-4 w-4" />, description: 'Thumbnails, backgrounds, assets' },
  { capability: 'tts', label: 'Text-to-Speech', icon: <Mic className="h-4 w-4" />, description: 'Voiceover & narration' },
  { capability: 'llm', label: 'LLM / Script Writing', icon: <MessageSquare className="h-4 w-4" />, description: 'Content generation & transcreation' },
  { capability: 'avatar', label: 'Avatar / Presenter', icon: <Sparkles className="h-4 w-4" />, description: 'AI avatar generation' },
  { capability: '3d_gen', label: '3D Generation', icon: <Box className="h-4 w-4" />, description: '3D models & environments' },
  { capability: 'lipsync', label: 'Lip Sync', icon: <Mic className="h-4 w-4" />, description: 'Audio-visual synchronization' },
];

// Zone colors
const ZONE_COLORS: Record<RoutingZone, { bg: string; text: string; border: string }> = {
  claude: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  alibaba: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  gemini: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  fallback: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
};

// Tier badge styles
const TIER_STYLES: Record<string, string> = {
  primary: 'bg-primary/20 text-primary border-primary/30',
  specialized: 'bg-accent/20 text-accent-foreground border-accent/30',
  fallback: 'bg-muted text-muted-foreground border-border',
};

export function AIModelsTab({
  blueprint,
  onRegenerateThumbnail,
  isRegenerating = false,
  region,
  onProviderOverrides,
  providerOverrides = {},
}: AIModelsTabProps) {
  const [activeZone, setActiveZone] = useState<RoutingZone | 'all'>('all');
  const [thumbnailPrompt, setThumbnailPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [localOverrides, setLocalOverrides] = useState<Record<string, string>>(providerOverrides);

  // Detect zone from region
  const detectedZone = useMemo(() => {
    if (!region || region === 'global') return 'fallback';
    return getZoneForRegion(region);
  }, [region]);

  // Get all active providers from registry
  const activeProviders = useMemo(() => 
    MASTER_AI_PROVIDERS.filter(p => p.status === 'active' && p.wiredToGenieCast),
    []
  );

  // Get recommended (auto-suggested) provider for a capability based on zone
  const getRecommendedProvider = useCallback((capability: ProviderCapability): AIProviderEntry | undefined => {
    const zoneConfig = ZONE_ROUTING_CONFIG[detectedZone];
    const providers = activeProviders
      .filter(p => p.capabilities.includes(capability))
      .sort((a, b) => {
        // Prefer providers in the detected zone
        const aInZone = a.zones.includes(detectedZone) ? 1 : 0;
        const bInZone = b.zones.includes(detectedZone) ? 1 : 0;
        if (aInZone !== bInZone) return bInZone - aInZone;
        // Then by tier
        const tierOrder = { primary: 0, specialized: 1, fallback: 2, deprecated: 3 };
        if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier];
        // Then by quality
        return b.qualityScore - a.qualityScore;
      });
    return providers[0];
  }, [activeProviders, detectedZone]);

  // Group providers by capability for current view
  const getProvidersForCapability = (capability: ProviderCapability) => {
    let providers = activeProviders.filter(p => p.capabilities.includes(capability));
    if (activeZone !== 'all') {
      providers = providers.filter(p => p.zones.includes(activeZone));
    }
    return providers.sort((a, b) => {
      const tierOrder = { primary: 0, specialized: 1, fallback: 2, deprecated: 3 };
      return tierOrder[a.tier] - tierOrder[b.tier];
    });
  };

  const handleProviderChange = (capability: string, providerId: string) => {
    const updated = { ...localOverrides, [capability]: providerId };
    setLocalOverrides(updated);
    onProviderOverrides?.(updated);
  };

  // Extract thumbnail provider info from style_preset
  const stylePreset = blueprint.style_preset as any || {};
  const thumbnailProvider = stylePreset.thumbnail_provider;
  const thumbnailGeneratedAt = stylePreset.thumbnail_generated_at;

  const handleRegenerate = () => {
    const prompt = thumbnailPrompt.trim() || `High quality ${blueprint.category} template thumbnail for "${blueprint.name}"`;
    onRegenerateThumbnail?.(prompt);
    setShowPromptInput(false);
    setThumbnailPrompt('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Auto-Suggest Banner */}
      {region && region !== 'global' && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-medium text-foreground">Auto-Suggest Active</span>
            <span className="text-muted-foreground"> — Region: <span className="font-medium capitalize">{region}</span> → Zone: <span className="font-medium capitalize">{detectedZone}</span>. Recommended providers are pre-selected below. You can override any.</span>
          </div>
        </div>
      )}

      {/* Per-Task Provider Selection — THE KEY NEW FEATURE */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Provider Selection per Task
          <Badge variant="outline" className="text-[10px]">Auto-Suggest + Override</Badge>
        </h3>
        <div className="space-y-3">
          {CAPABILITY_SECTIONS.map(({ capability, label, icon, description }) => {
            const providers = getProvidersForCapability(capability);
            if (providers.length === 0) return null;
            
            const recommended = getRecommendedProvider(capability);
            const selectedId = localOverrides[capability] || recommended?.id || providers[0]?.id;
            const selectedProvider = activeProviders.find(p => p.id === selectedId);
            const isOverridden = !!localOverrides[capability] && localOverrides[capability] !== recommended?.id;

            return (
              <div
                key={capability}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                  isOverridden
                    ? "border-accent/50 bg-accent/5"
                    : "border-border/50 bg-card/30"
                )}
              >
                {/* Task Label */}
                <div className="flex items-center gap-2 w-40 flex-shrink-0">
                  <div className="text-muted-foreground">{icon}</div>
                  <div>
                    <p className="text-xs font-medium">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{description}</p>
                  </div>
                </div>

                {/* Provider Dropdown */}
                <div className="flex-1 min-w-0">
                  <Select
                    value={selectedId}
                    onValueChange={(val) => handleProviderChange(capability, val)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background/80">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent className="z-[100000] bg-popover border-border shadow-lg">
                      {providers.map(p => {
                        const isRecommended = p.id === recommended?.id;
                        return (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              <span>{p.name}</span>
                              <Badge variant="outline" className={cn("text-[8px] h-3.5 px-1", TIER_STYLES[p.tier])}>
                                {p.tier}
                              </Badge>
                              {isRecommended && (
                                <Badge className="text-[8px] h-3.5 px-1 bg-primary/20 text-primary border-primary/30">
                                  ★ Suggested
                                </Badge>
                              )}
                              <span className="text-[9px] text-muted-foreground ml-auto">
                                Q:{p.qualityScore} S:{p.speedScore}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Zone Dots */}
                <div className="flex gap-1 flex-shrink-0">
                  {selectedProvider?.zones.map(z => (
                    <div
                      key={z}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        z === 'claude' && 'bg-blue-400',
                        z === 'alibaba' && 'bg-orange-400',
                        z === 'gemini' && 'bg-green-400',
                        z === 'fallback' && 'bg-purple-400',
                      )}
                      title={`${z} zone`}
                    />
                  ))}
                </div>

                {/* Override indicator */}
                {isOverridden && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const updated = { ...localOverrides };
                      delete updated[capability];
                      setLocalOverrides(updated);
                      onProviderOverrides?.(updated);
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Thumbnail Generation Section */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Thumbnail Generation
        </h3>
        
        {blueprint.thumbnail_url ? (
          <div className="bg-card/50 rounded-lg p-4 border border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={blueprint.thumbnail_url} 
                  alt="Current thumbnail" 
                  className="w-16 h-10 rounded object-cover border border-border/50"
                />
                <div>
                  <p className="text-sm font-medium">
                    {thumbnailProvider ? 
                      activeProviders.find(p => p.id === thumbnailProvider)?.name || thumbnailProvider 
                      : 'AI Generated'
                    }
                  </p>
                  {thumbnailGeneratedAt && (
                    <p className="text-xs text-muted-foreground">
                      Generated: {new Date(thumbnailGeneratedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setShowPromptInput(!showPromptInput)}
                disabled={isRegenerating}
              >
                <RefreshCw className={cn("h-3 w-3", isRegenerating && "animate-spin")} />
                {isRegenerating ? 'Generating...' : 'Regenerate'}
              </Button>
            </div>

            {showPromptInput && (
              <div className="space-y-2 pt-2 border-t border-border/30">
                <label className="text-xs text-muted-foreground">Custom prompt (optional)</label>
                <div className="flex gap-2">
                  <Textarea
                    value={thumbnailPrompt}
                    onChange={(e) => setThumbnailPrompt(e.target.value)}
                    placeholder={`e.g., "Make it more futuristic with neon colors"`}
                    className="h-16 text-xs resize-none"
                  />
                  <Button 
                    size="sm" 
                    className="h-16 px-3"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card/50 rounded-lg p-4 border border-border/50 border-dashed space-y-3">
            <div className="text-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No thumbnail generated yet</p>
            </div>
            <div className="space-y-2">
              <Textarea
                value={thumbnailPrompt}
                onChange={(e) => setThumbnailPrompt(e.target.value)}
                placeholder={`Describe the thumbnail style`}
                className="h-16 text-xs resize-none"
              />
              <Button 
                size="sm" 
                className="w-full gap-1.5"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                <Wand2 className="h-3.5 w-3.5" />
                {isRegenerating ? 'Generating...' : 'Generate Thumbnail'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Zone Filter */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Globe2 className="h-4 w-4" />
          Regional Routing Zones
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={activeZone === 'all' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setActiveZone('all')}
          >
            All Zones ({activeProviders.length})
          </Button>
          {(Object.entries(ZONE_ROUTING_CONFIG) as [RoutingZone, typeof ZONE_ROUTING_CONFIG[RoutingZone]][]).map(([zone, config]) => {
            const zoneProviders = activeProviders.filter(p => p.zones.includes(zone));
            const colors = ZONE_COLORS[zone];
            const isDetected = zone === detectedZone;
            return (
              <Button
                key={zone}
                variant={activeZone === zone ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "h-7 text-xs",
                  activeZone !== zone && `${colors.border}`,
                  isDetected && activeZone !== zone && "ring-1 ring-primary/50"
                )}
                onClick={() => setActiveZone(zone)}
              >
                {config.name.split(' (')[0]} ({zoneProviders.length})
                {isDetected && <span className="ml-1 text-[9px]">📍</span>}
              </Button>
            );
          })}
        </div>

        {/* Zone Details */}
        {activeZone !== 'all' && ZONE_ROUTING_CONFIG[activeZone] && (
          <div className={cn(
            "rounded-lg p-3 border mb-4",
            ZONE_COLORS[activeZone].bg,
            ZONE_COLORS[activeZone].border
          )}>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Primary LLM</span>
                <span className="font-medium capitalize">{ZONE_ROUTING_CONFIG[activeZone].primaryLLM}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Primary TTS</span>
                <span className="font-medium capitalize">{ZONE_ROUTING_CONFIG[activeZone].primaryTTS}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Translation</span>
                <span className="font-medium capitalize">{ZONE_ROUTING_CONFIG[activeZone].primaryTranslation}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium">Regions:</span> {ZONE_ROUTING_CONFIG[activeZone].regions.join(', ')}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium">Languages:</span> {ZONE_ROUTING_CONFIG[activeZone].languages.join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* Provider Grid by Capability (detailed view) */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          All Providers by Task ({activeProviders.length} Integrated)
        </h3>
        <div className="space-y-4">
          {CAPABILITY_SECTIONS.map(({ capability, label, icon, description }) => {
            const providers = getProvidersForCapability(capability);
            if (providers.length === 0) return null;

            return (
              <div key={capability}>
                <div className="flex items-center gap-2 mb-2">
                  {icon}
                  <span className="text-xs font-medium">{label}</span>
                  <span className="text-[10px] text-muted-foreground">— {description}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {providers.map((provider) => {
                    const isSelected = localOverrides[capability] === provider.id;
                    const isRecommended = getRecommendedProvider(capability)?.id === provider.id;
                    return (
                      <div
                        key={provider.id}
                        className={cn(
                          "p-2.5 rounded-lg border bg-card/30 flex items-center justify-between cursor-pointer transition-colors hover:border-primary/40",
                          isSelected && "border-primary/50 bg-primary/5",
                          isRecommended && !isSelected && "border-primary/20"
                        )}
                        onClick={() => handleProviderChange(capability, provider.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div>
                            <p className="text-xs font-medium truncate flex items-center gap-1">
                              {provider.name}
                              {isRecommended && <span className="text-primary text-[9px]">★</span>}
                              {isSelected && <Check className="h-3 w-3 text-primary" />}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Badge 
                                variant="outline" 
                                className={cn("text-[9px] h-3.5 px-1", TIER_STYLES[provider.tier])}
                              >
                                {provider.tier}
                              </Badge>
                              <span className="text-[9px] text-muted-foreground">
                                Q:{provider.qualityScore} S:{provider.speedScore}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {provider.zones.map(z => (
                            <div
                              key={z}
                              className={cn(
                                "w-2 h-2 rounded-full",
                                z === 'claude' && 'bg-blue-400',
                                z === 'alibaba' && 'bg-orange-400',
                                z === 'gemini' && 'bg-green-400',
                                z === 'fallback' && 'bg-purple-400',
                              )}
                              title={`${z} zone`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground bg-muted/20 rounded-md p-2">
        <span className="font-medium">Zones:</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Claude (Western)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" /> Alibaba (CJK/MENA)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Gemini (South Asia/SEA)</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> Fallback</span>
      </div>
    </div>
  );
}
