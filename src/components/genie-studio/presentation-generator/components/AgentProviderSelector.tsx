/**
 * Agent Provider Selector Dropdown
 * Select AI provider for each agent with recommendations
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AIProviderOption,
  AGENT_PROVIDER_MAP,
  TIER_COLORS,
  TIER_LABELS,
  getRecommendedProvider,
} from '../constants/aiProviderConstants';

interface AgentProviderSelectorProps {
  agentType: string;
  value: string;
  onChange: (providerId: string) => void;
  showLabel?: boolean;
  className?: string;
}

export function AgentProviderSelector({
  agentType,
  value,
  onChange,
  showLabel = true,
  className,
}: AgentProviderSelectorProps) {
  const providers = AGENT_PROVIDER_MAP[agentType] || [];
  const recommended = getRecommendedProvider(agentType);
  const selectedProvider = providers.find(p => p.id === value);

  // Group by tier
  const groupedProviders = providers.reduce((acc, provider) => {
    if (!acc[provider.tier]) acc[provider.tier] = [];
    acc[provider.tier].push(provider);
    return acc;
  }, {} as Record<string, AIProviderOption[]>);

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
          AI Provider
        </Label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs bg-background">
          <SelectValue>
            {selectedProvider ? (
              <div className="flex items-center gap-2">
                <span>{selectedProvider.icon}</span>
                <span className="truncate">{selectedProvider.shortName}</span>
                {selectedProvider.recommended && (
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                )}
              </div>
            ) : (
              'Select provider...'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border shadow-lg z-50 max-h-[300px]">
          {Object.entries(groupedProviders).map(([tier, tierProviders]) => (
            <SelectGroup key={tier}>
              <SelectLabel className="text-[10px] text-muted-foreground flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn('text-[9px] px-1 py-0', TIER_COLORS[tier])}
                >
                  {TIER_LABELS[tier]}
                </Badge>
              </SelectLabel>
              {tierProviders.map(provider => (
                <SelectItem
                  key={provider.id}
                  value={provider.id}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-base shrink-0">{provider.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium truncate">
                          {provider.name}
                        </span>
                        {provider.recommended && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Compact inline version for tight spaces
export function AgentProviderBadge({
  providerId,
  agentType,
  onClick,
}: {
  providerId: string;
  agentType: string;
  onClick?: () => void;
}) {
  const providers = AGENT_PROVIDER_MAP[agentType] || [];
  const provider = providers.find(p => p.id === providerId);

  if (!provider) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] gap-1 cursor-pointer hover:bg-muted transition-colors',
        TIER_COLORS[provider.tier]
      )}
      onClick={onClick}
    >
      <span>{provider.icon}</span>
      {provider.shortName}
      {provider.recommended && <Zap className="h-2.5 w-2.5" />}
    </Badge>
  );
}
