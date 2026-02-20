/**
 * EnrichmentStatusBadge — Shows what enrichment data is active
 * 
 * Displays compact badges indicating which enrichment layers
 * (product, brand, audience, knowledge, regional) are loaded.
 * Used in generation UIs (SmartContentPipeline, ScriptEditor, PresentationWizard).
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, Package, Palette, Users, Globe, BookOpen } from 'lucide-react';
import type { UniversalEnrichmentResult } from '@/hooks/useUniversalEnrichment';

interface EnrichmentStatusBadgeProps {
  status: UniversalEnrichmentResult['status'];
  isLoading: boolean;
  isAvailable: boolean;
  productName?: string;
  compact?: boolean;
}

export function EnrichmentStatusBadge({
  status,
  isLoading,
  isAvailable,
  productName,
  compact = false,
}: EnrichmentStatusBadgeProps) {
  if (isLoading) {
    return (
      <Badge variant="outline" className="text-xs gap-1 animate-pulse">
        <Sparkles className="h-3 w-3" />
        Loading enrichment…
      </Badge>
    );
  }

  if (!isAvailable) {
    return (
      <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        No enrichment
      </Badge>
    );
  }

  const activeCount = [
    status.hasProductContext,
    status.hasBrandContext,
    status.hasAudienceContext,
    status.hasProductKnowledge,
    status.hasRegionalScript,
  ].filter(Boolean).length;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-xs gap-1 bg-primary/5 border-primary/20 text-primary"
            >
              <Sparkles className="h-3 w-3" />
              {activeCount}/5
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1 text-xs">
              <p className="font-medium">{productName ? `Enrichment: ${productName}` : 'Enrichment Active'}</p>
              <div className="flex flex-wrap gap-1">
                <EnrichmentDot active={status.hasProductContext} label="Product" icon={Package} />
                <EnrichmentDot active={status.hasBrandContext} label="Brand" icon={Palette} />
                <EnrichmentDot active={status.hasAudienceContext} label="Audience" icon={Users} />
                <EnrichmentDot active={status.hasProductKnowledge} label="Knowledge" icon={BookOpen} />
                <EnrichmentDot active={status.hasRegionalScript} label="Regional" icon={Globe} />
              </div>
              {status.approvedScriptCount > 0 && (
                <p className="text-muted-foreground">{status.approvedScriptCount} approved scripts</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <EnrichmentDot active={status.hasProductContext} label="Product" icon={Package} />
      <EnrichmentDot active={status.hasBrandContext} label="Brand" icon={Palette} />
      <EnrichmentDot active={status.hasAudienceContext} label="Audience" icon={Users} />
      <EnrichmentDot active={status.hasProductKnowledge} label="Knowledge" icon={BookOpen} />
      <EnrichmentDot active={status.hasRegionalScript} label="Regional" icon={Globe} />
    </div>
  );
}

function EnrichmentDot({
  active,
  label,
  icon: Icon,
}: {
  active: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] gap-0.5 px-1.5 py-0 ${
        active
          ? 'bg-primary/10 border-primary/30 text-primary'
          : 'bg-muted/50 border-muted text-muted-foreground'
      }`}
    >
      <Icon className="h-2.5 w-2.5" />
      {label}
    </Badge>
  );
}

export default EnrichmentStatusBadge;
