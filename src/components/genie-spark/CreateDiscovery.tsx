/**
 * CreateDiscovery — Category browser + chain gallery for GenieSpark
 *
 * Wires useCapabilityDiscovery to glass-morphism UI:
 * - 9 category tiles with icons, taglines, chain counts
 * - Chain gallery cards with output highlights
 * - Search across capabilities
 * - Input type filter
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useCapabilityDiscovery } from '@/hooks/useCapabilityDiscovery';
import { GlassCard, GlassCardContent } from '@/components/ui/glass-primitives';
import { GlassInput } from '@/components/ui/glass-primitives';
import { GlassBadge } from '@/components/ui/glass-primitives';
import { LiquidGlassCard } from '@/components/shared/LiquidGlassCard';
import {
  Video, Mic, Users, Globe, GraduationCap, Share2, RefreshCw,
  FileText, Radio, Search, ArrowRight, Zap, ChevronLeft, Layers,
  type LucideIcon,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { DiscoveryCategory, ChainGalleryCard } from '@/services/capabilityDiscoveryEngine';

// Map icon string → Lucide component
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  video: Video,
  mic: Mic,
  users: Users,
  globe: Globe,
  'graduation-cap': GraduationCap,
  share: Share2,
  refresh: RefreshCw,
  'file-text': FileText,
  radio: Radio,
};

const BADGE_COLORS: Record<string, string> = {
  popular: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  new: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pro: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  enterprise: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  free: 'bg-green-500/10 text-green-400 border-green-500/20',
};

interface CreateDiscoveryProps {
  onChainSelect: (chainId: string) => void;
  className?: string;
}

export const CreateDiscovery: React.FC<CreateDiscoveryProps> = ({
  onChainSelect,
  className,
}) => {
  const {
    categories,
    selectedCategory,
    selectCategory,
    gallery,
    selectChain,
    searchQuery,
    search,
    searchResults,
    engineStats,
  } = useCapabilityDiscovery();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Engine stats banner */}
      <div className="glass-panel rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <strong className="text-foreground">{engineStats.totalChains}</strong> pipelines
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <strong className="text-foreground">{engineStats.totalAtomicSteps}</strong> AI steps
          </span>
          <span className="flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 text-emerald-400" />
            <strong className="text-foreground">{engineStats.totalOutputFormats}</strong> output formats
          </span>
        </div>
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <GlassInput
            placeholder="Search capabilities..."
            value={searchQuery}
            onChange={(e) => search(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Search results overlay */}
      {searchResults && (
        <div className="glass-elevated rounded-xl p-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            Found {searchResults.chains.length} chains, {searchResults.categories.length} categories, {searchResults.outputs.length} outputs
          </p>
          {searchResults.chains.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.chains.slice(0, 6).map((chain) => (
                <ChainCard
                  key={chain.chainId}
                  chain={chain}
                  onSelect={() => onChainSelect(chain.chainId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Back button when category selected */}
      {selectedCategory && !searchResults && (
        <button
          onClick={() => selectCategory(null)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          All categories
        </button>
      )}

      {/* Category grid or chain gallery */}
      {!selectedCategory && !searchResults ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon] || Zap;
            return (
              <LiquidGlassCard
                key={cat.id}
                variant="default"
                className="cursor-pointer group"
                onClick={() => selectCategory(cat.id)}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {cat.tagline}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                  <span className="text-[10px] text-muted-foreground">
                    {cat.chainIds.length} pipelines
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {cat.exampleOutputs.slice(0, 2).map((out) => (
                      <span
                        key={out}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-muted-foreground border border-white/[0.06]"
                      >
                        {out}
                      </span>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            );
          })}
        </div>
      ) : !searchResults ? (
        /* Chain gallery for selected category */
        <div className="space-y-4">
          {/* Category header */}
          {selectedCategory && (() => {
            const cat = categories.find(c => c.id === selectedCategory);
            if (!cat) return null;
            const Icon = CATEGORY_ICONS[cat.icon] || Zap;
            return (
              <div className="glass-panel rounded-xl p-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  <Icon className="h-6 w-6" style={{ color: cat.color }} />
                </div>
                <div>
                  <h2 className="font-bold text-lg">{cat.label}</h2>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </div>
            );
          })()}

          {/* Chain cards */}
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
              {gallery.map((chain) => (
                <ChainCard
                  key={chain.chainId}
                  chain={chain}
                  onSelect={() => onChainSelect(chain.chainId)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
};

/* ─── Chain Gallery Card ────────────────────────────────────────────────── */

const ChainCard: React.FC<{
  chain: ChainGalleryCard;
  onSelect: () => void;
}> = ({ chain, onSelect }) => (
  <GlassCard
    className="cursor-pointer group hover:border-primary/25 transition-all duration-200"
    onClick={onSelect}
  >
    <GlassCardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
            {chain.label}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {chain.tagline}
          </p>
        </div>
        {chain.badge && (
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0',
            BADGE_COLORS[chain.badge] || BADGE_COLORS.free,
          )}>
            {chain.badge}
          </span>
        )}
      </div>

      {/* Input example */}
      <div className="text-[11px] text-muted-foreground">
        <span className="text-foreground/60">Input:</span>{' '}
        <span className="italic">{chain.inputExample}</span>
      </div>

      {/* Output highlights */}
      <div className="flex flex-wrap gap-1">
        {chain.outputHighlights.map((output) => (
          <GlassBadge key={output} className="text-[10px] px-1.5 py-0">
            {output}
          </GlassBadge>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Zap className="h-3 w-3" />
          {chain.pipelineCount} AI pipelines
        </span>
        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          Start <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </GlassCardContent>
  </GlassCard>
);

export default CreateDiscovery;
