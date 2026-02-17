/**
 * RegionalProviderInfo — Shows which AI models/providers power each capability
 * per region, with confidence scores and fallback chains.
 * 
 * Displays inline in each demo card or as a standalone info panel.
 * Uses the production routing registry (provider-routing-immutable-v5).
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Zap, ChevronRight } from 'lucide-react';

// ============================================
// PROVIDER ROUTING REGISTRY (production-stable)
// ============================================

export interface ProviderInfo {
  name: string;
  confidence: number; // 0-100
  role: 'primary' | 'secondary' | 'fallback';
  badge?: string;
}

export interface CapabilityProviders {
  tts: ProviderInfo[];
  stt: ProviderInfo[];
  translation: ProviderInfo[];
  transcreation: ProviderInfo[];
}

const GLOBAL_PROVIDERS: CapabilityProviders = {
  tts: [
    { name: 'Azure Neural', confidence: 97, role: 'primary', badge: 'Viseme + Lip-sync' },
    { name: 'ElevenLabs', confidence: 92, role: 'secondary' },
    { name: 'Qwen3-TTS', confidence: 88, role: 'fallback' },
  ],
  stt: [
    { name: 'Deepgram Nova 2', confidence: 96, role: 'primary', badge: '<100ms latency' },
    { name: 'Azure STT', confidence: 93, role: 'secondary' },
    { name: 'OpenAI Whisper', confidence: 90, role: 'fallback' },
  ],
  translation: [
    { name: 'DeepL', confidence: 95, role: 'primary', badge: 'GDPR compliant' },
    { name: 'Azure Translator', confidence: 91, role: 'secondary' },
    { name: 'Google Translate', confidence: 89, role: 'fallback' },
  ],
  transcreation: [
    { name: 'Gemini 3 Pro', confidence: 94, role: 'primary' },
    { name: 'Claude-4', confidence: 93, role: 'secondary' },
    { name: 'GPT-4o', confidence: 91, role: 'fallback' },
  ],
};

const REGIONAL_OVERRIDES: Record<string, Partial<CapabilityProviders>> = {
  mena: {
    transcreation: [
      { name: 'Qwen-Max', confidence: 96, role: 'primary', badge: 'Arabic specialist' },
      { name: 'GPT-4o', confidence: 93, role: 'secondary' },
      { name: 'Gemini 3 Pro', confidence: 91, role: 'fallback' },
    ],
    tts: [
      { name: 'Azure Neural', confidence: 98, role: 'primary', badge: '7 Arabic dialects' },
      { name: 'ElevenLabs', confidence: 90, role: 'secondary' },
    ],
  },
  india: {
    transcreation: [
      { name: 'Gemini 3 Pro', confidence: 96, role: 'primary', badge: '11 Indian languages' },
      { name: 'Claude-4', confidence: 91, role: 'secondary' },
      { name: 'GPT-4o', confidence: 89, role: 'fallback' },
    ],
    tts: [
      { name: 'Azure Neural', confidence: 97, role: 'primary', badge: 'Code-mixing support' },
      { name: 'Qwen3-TTS', confidence: 85, role: 'fallback' },
    ],
  },
  apac: {
    transcreation: [
      { name: 'Qwen-Max', confidence: 97, role: 'primary', badge: 'CJK specialist' },
      { name: 'Gemini 3 Pro', confidence: 93, role: 'secondary' },
      { name: 'DeepSeek', confidence: 90, role: 'fallback' },
    ],
    tts: [
      { name: 'Azure Neural', confidence: 96, role: 'primary', badge: 'Tonal TTS' },
      { name: 'Sambert', confidence: 89, role: 'secondary', badge: 'CJK native' },
    ],
  },
  africa: {
    transcreation: [
      { name: 'Gemini 3 Pro', confidence: 93, role: 'primary', badge: 'African languages' },
      { name: 'Claude-4', confidence: 89, role: 'secondary' },
      { name: 'GPT-4o', confidence: 87, role: 'fallback' },
    ],
  },
  latam: {
    transcreation: [
      { name: 'Claude-4', confidence: 95, role: 'primary', badge: 'LATAM variants' },
      { name: 'Gemini 3 Pro', confidence: 92, role: 'secondary' },
      { name: 'GPT-4o', confidence: 90, role: 'fallback' },
    ],
  },
  europe: {
    transcreation: [
      { name: 'Claude-4', confidence: 95, role: 'primary', badge: 'EU compliant' },
      { name: 'Gemini 3 Pro', confidence: 93, role: 'secondary' },
      { name: 'DeepL', confidence: 91, role: 'fallback' },
    ],
    translation: [
      { name: 'DeepL', confidence: 97, role: 'primary', badge: 'EU-hosted' },
      { name: 'Azure Translator', confidence: 92, role: 'secondary' },
    ],
  },
  nam: {
    transcreation: [
      { name: 'Claude-4', confidence: 94, role: 'primary' },
      { name: 'GPT-4o', confidence: 93, role: 'secondary' },
      { name: 'Gemini 3 Pro', confidence: 91, role: 'fallback' },
    ],
  },
};

Object.freeze(GLOBAL_PROVIDERS);
Object.freeze(REGIONAL_OVERRIDES);

// ============================================
// GET PROVIDERS FOR REGION + CAPABILITY
// ============================================

export function getProvidersForCapability(
  capability: keyof CapabilityProviders,
  region?: string
): ProviderInfo[] {
  if (region && REGIONAL_OVERRIDES[region]?.[capability]) {
    return REGIONAL_OVERRIDES[region][capability]!;
  }
  return GLOBAL_PROVIDERS[capability];
}

export function getPrimaryProvider(
  capability: keyof CapabilityProviders,
  region?: string
): ProviderInfo {
  const providers = getProvidersForCapability(capability, region);
  return providers.find(p => p.role === 'primary') || providers[0];
}

// ============================================
// INLINE PROVIDER BADGE (compact, for card headers)
// ============================================

interface ProviderBadgeProps {
  capability: keyof CapabilityProviders;
  region?: string;
  showConfidence?: boolean;
  className?: string;
}

export const ProviderBadge: React.FC<ProviderBadgeProps> = ({
  capability, region, showConfidence = true, className = '',
}) => {
  const primary = getPrimaryProvider(capability, region);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={`text-[10px] gap-1 cursor-help ${className}`}>
            <Zap className="h-2.5 w-2.5" />
            {primary.name}
            {showConfidence && (
              <span className="text-primary font-bold">{primary.confidence}%</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <ProviderChainTooltip capability={capability} region={region} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================
// PROVIDER CHAIN (expanded, for tooltips or panels)
// ============================================

interface ProviderChainTooltipProps {
  capability: keyof CapabilityProviders;
  region?: string;
}

const ProviderChainTooltip: React.FC<ProviderChainTooltipProps> = ({ capability, region }) => {
  const providers = getProvidersForCapability(capability, region);

  return (
    <div className="space-y-1.5 py-1">
      <p className="text-xs font-semibold text-foreground capitalize">{capability} Providers</p>
      {providers.map((p, i) => (
        <div key={p.name} className="flex items-center gap-1.5 text-xs">
          <span className={`w-1.5 h-1.5 rounded-full ${
            p.role === 'primary' ? 'bg-green-500' : p.role === 'secondary' ? 'bg-yellow-500' : 'bg-muted-foreground'
          }`} />
          <span className="font-medium">{p.name}</span>
          <span className="text-muted-foreground">({p.confidence}%)</span>
          {p.badge && <span className="text-primary text-[10px]">• {p.badge}</span>}
          {i < providers.length - 1 && <ChevronRight className="h-2.5 w-2.5 text-muted-foreground ml-auto" />}
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
        <Shield className="h-2.5 w-2.5" /> Auto-fallback if primary unavailable
      </p>
    </div>
  );
};

// ============================================
// FULL PROVIDER PANEL (for display inside cards)
// ============================================

interface ProviderPanelProps {
  capability: keyof CapabilityProviders;
  region?: string;
  compact?: boolean;
}

export const ProviderPanel: React.FC<ProviderPanelProps> = ({ capability, region, compact }) => {
  const providers = getProvidersForCapability(capability, region);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {providers.map((p, i) => (
          <React.Fragment key={p.name}>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${
                p.role === 'primary' ? 'bg-green-500' : p.role === 'secondary' ? 'bg-yellow-500' : 'bg-muted-foreground'
              }`} />
              <span className="text-xs text-foreground">{p.name}</span>
              <span className="text-[10px] text-primary font-semibold">{p.confidence}%</span>
            </div>
            {i < providers.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
      <div className="flex items-center gap-1.5">
        <Shield className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground capitalize">{capability} Provider Chain</span>
        {region && <Badge variant="outline" className="text-[9px] ml-auto">{region.toUpperCase()}</Badge>}
      </div>
      {providers.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${
            p.role === 'primary' ? 'bg-green-500' : p.role === 'secondary' ? 'bg-yellow-500' : 'bg-muted-foreground'
          }`} />
          <span className="text-sm font-medium text-foreground flex-1">{p.name}</span>
          {p.badge && <Badge variant="outline" className="text-[9px]">{p.badge}</Badge>}
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  p.confidence >= 95 ? 'bg-green-500' : p.confidence >= 90 ? 'bg-primary' : 'bg-yellow-500'
                }`}
                style={{ width: `${p.confidence}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground w-8 text-right">{p.confidence}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProviderBadge;
