/**
 * ProviderPipelineBadge — Shows which AI providers process user content.
 *
 * Compact mode: single-line badge strip for headers/toolbars.
 * Expanded mode: full panel with per-capability override dropdowns.
 *
 * Uses useProviderRouting as single source of truth.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Cpu, Globe, ArrowRightLeft } from 'lucide-react';
import {
  type ProviderRoutingResult,
  type ProviderCapability,
  getProviderDisplayName,
  PROVIDER_DISPLAY_NAMES,
} from '@/hooks/useProviderRouting';
import {
  INTEGRATED_PROVIDERS,
} from '@/config/master-provider-routing-registry';
import { GlassBadge } from '@/components/ui/glass-primitives';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============================================
// TYPES
// ============================================
interface ProviderPipelineBadgeProps {
  routing: ProviderRoutingResult;
  mode?: 'compact' | 'expanded';
  showOverrides?: boolean;
  className?: string;
}

interface CapabilityConfig {
  key: ProviderCapability;
  label: string;
  shortLabel: string;
  icon: string;
  providerListKey?: keyof typeof INTEGRATED_PROVIDERS;
}

// ============================================
// CAPABILITY DISPLAY CONFIG
// ============================================
const CAPABILITIES: CapabilityConfig[] = [
  { key: 'llm', label: 'Language Model', shortLabel: 'LLM', icon: '🧠', providerListKey: 'llm' },
  { key: 'tts', label: 'Text-to-Speech', shortLabel: 'TTS', icon: '🔊', providerListKey: 'tts' },
  { key: 'video', label: 'Video Generation', shortLabel: 'Video', icon: '🎬', providerListKey: 'video_generation' },
  { key: 'avatar', label: 'Avatar/Lip-Sync', shortLabel: 'Avatar', icon: '👤', providerListKey: 'avatar' },
  { key: 'image', label: 'Image Generation', shortLabel: 'Image', icon: '🖼️', providerListKey: 'image' },
  { key: 'translation', label: 'Translation', shortLabel: 'Translate', icon: '🌐', providerListKey: 'translation' },
  { key: 'music', label: 'Music', shortLabel: 'Music', icon: '🎵', providerListKey: 'audio' },
  { key: 'stt', label: 'Speech-to-Text', shortLabel: 'STT', icon: '🎤', providerListKey: 'stt' },
  { key: 'threeD', label: '3D Generation', shortLabel: '3D', icon: '🧊', providerListKey: 'threed_vr_ar' },
];

// Zone display names
const ZONE_DISPLAY: Record<string, string> = {
  claude_zone: 'Western / EU',
  alibaba_zone: 'CJK / MENA',
  gemini_zone: 'India / SEA / Africa',
  fallback_zone: 'Global Fallback',
};

// ============================================
// COMPONENT
// ============================================
export function ProviderPipelineBadge({
  routing,
  mode = 'compact',
  showOverrides = true,
  className,
}: ProviderPipelineBadgeProps) {
  const [expanded, setExpanded] = useState(mode === 'expanded');

  const getResolvedProvider = (cap: CapabilityConfig): string => {
    const resolved = routing[cap.key as keyof ProviderRoutingResult];
    if (resolved && typeof resolved === 'object' && 'provider' in resolved) {
      return (resolved as { provider: string }).provider;
    }
    return 'unknown';
  };

  const overrideCount = routing.overrides.size;

  return (
    <div className={cn('glass-panel overflow-hidden max-w-full', className)}>
      {/* Compact header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-2 text-xs text-muted-foreground hover:text-foreground transition-colors min-w-0 overflow-hidden"
      >
        <Cpu className="w-3.5 h-3.5" />
        <span className="font-medium">AI Pipeline</span>
        <span className="text-muted-foreground/60">·</span>
        <Globe className="w-3 h-3" />
        <span>{ZONE_DISPLAY[routing.zone] || routing.zone}</span>

        {routing.isRTL && (
          <GlassBadge className="text-[10px] px-1.5 py-0 border-destructive/30 text-destructive">
            <ArrowRightLeft className="w-2.5 h-2.5 mr-0.5 inline" />
            RTL
          </GlassBadge>
        )}

        {/* Compact provider strip */}
        <div className="flex-1 flex items-center gap-1.5 overflow-hidden">
          {CAPABILITIES.slice(0, 5).map((cap) => {
            const provider = getResolvedProvider(cap);
            const isOverridden = routing.hasOverride(cap.key);
            return (
              <span
                key={cap.key}
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap',
                  isOverridden
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'bg-muted/50 text-muted-foreground',
                )}
              >
                {cap.shortLabel}: {getProviderDisplayName(provider)}
              </span>
            );
          })}
        </div>

        {overrideCount > 0 && (
          <GlassBadge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
            {overrideCount} override{overrideCount > 1 ? 's' : ''}
          </GlassBadge>
        )}

        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        )}
      </button>

      {/* Expanded panel — per-capability overrides */}
      {expanded && (
        <div className="border-t border-border/10 p-3 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {CAPABILITIES.map((cap) => {
              const provider = getResolvedProvider(cap);
              const isOverridden = routing.hasOverride(cap.key);
              const providerList = cap.providerListKey
                ? INTEGRATED_PROVIDERS[cap.providerListKey]
                : [];

              return (
                <div
                  key={cap.key}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-md text-xs',
                    isOverridden ? 'bg-primary/5 border border-primary/15' : 'bg-muted/30',
                  )}
                >
                  <span className="w-5 text-center">{cap.icon}</span>
                  <span className="font-medium min-w-[4rem]">{cap.shortLabel}</span>

                  {showOverrides ? (
                    <Select
                      value={provider}
                      onValueChange={(val) => routing.setOverride(cap.key, val)}
                    >
                      <SelectTrigger className="h-6 text-[11px] flex-1 min-w-0 glass-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providerList.map((p) => (
                          <SelectItem key={p} value={p} className="text-xs">
                            {getProviderDisplayName(p)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-muted-foreground truncate flex-1">
                      {getProviderDisplayName(provider)}
                    </span>
                  )}

                  {isOverridden && (
                    <button
                      onClick={() => routing.clearOverride(cap.key)}
                      className="text-[10px] text-primary hover:text-primary/80 shrink-0"
                      title="Reset to region default"
                    >
                      reset
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* TTS-specific details */}
          <div className="text-[10px] text-muted-foreground/70 flex items-center gap-3 pt-1 border-t border-border/5">
            <span>Locale: {routing.languageCode}</span>
            <span>Viseme: {routing.tts.visemeSupport ? '✓ enabled' : '✗ off'}</span>
            {routing.tts.voiceClone && <span>Clone: {getProviderDisplayName(routing.tts.voiceClone)}</span>}
            <span className="ml-auto">
              Source: Master Registry v2.1.0
              {overrideCount > 0 && ` + ${overrideCount} override${overrideCount > 1 ? 's' : ''}`}
            </span>
          </div>

          {overrideCount > 0 && (
            <button
              onClick={routing.clearAllOverrides}
              className="text-[10px] text-destructive hover:text-destructive/80"
            >
              Clear all overrides → reset to region defaults
            </button>
          )}
        </div>
      )}
    </div>
  );
}
