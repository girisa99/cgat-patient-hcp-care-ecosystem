/**
 * Metrics Explainer Component - V2
 * 
 * Explains to users:
 * 1. WHY scenario/use case numbers differ across tabs
 * 2. What the DELTA represents (existing vs new opportunities)
 * 3. WHERE each new item was discovered from
 * 4. What needs to be IMPLEMENTED (gaps vs opportunities)
 */

import React, { useState } from 'react';
import { 
  Info, ChevronDown, ChevronUp, ArrowRight, 
  CheckCircle2, Plus, AlertTriangle, HelpCircle,
  Layers, Zap, Target, Check, Sparkles
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MetricsExplainerProps {
  scenarios: {
    base: number;
    newFromCross: number;
    newFromGen: number;
    total: number;
  };
  useCases: {
    base: number;
    newFromCross: number;
    newFromGen: number;
    total: number;
  };
  categoryLabel: string;
  onNavigate?: (tab: string, filter?: string) => void;
}

export const MetricsExplainer: React.FC<MetricsExplainerProps> = ({
  scenarios,
  useCases,
  categoryLabel,
  onNavigate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate what percentage each source contributes
  const scenarioContributions = {
    base: scenarios.total > 0 ? Math.round((scenarios.base / scenarios.total) * 100) : 0,
    cross: scenarios.total > 0 ? Math.round((scenarios.newFromCross / scenarios.total) * 100) : 0,
    gen: scenarios.total > 0 ? Math.round((scenarios.newFromGen / scenarios.total) * 100) : 0,
  };

  const useCaseContributions = {
    base: useCases.total > 0 ? Math.round((useCases.base / useCases.total) * 100) : 0,
    cross: useCases.total > 0 ? Math.round((useCases.newFromCross / useCases.total) * 100) : 0,
    gen: useCases.total > 0 ? Math.round((useCases.newFromGen / useCases.total) * 100) : 0,
  };

  // Are there NEW opportunities?
  const hasNewOpportunities = scenarios.newFromCross > 0 || scenarios.newFromGen > 0 || 
                              useCases.newFromCross > 0 || useCases.newFromGen > 0;

  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-2">
      {/* Collapsible Header - Updated Text */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-[9px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-3 w-3 text-blue-500" />
          <span>What do the Scenario & Use Case differences mean?</span>
          {hasNewOpportunities && (
            <Badge variant="secondary" className="text-[7px] bg-blue-500/10 text-blue-600">
              <Sparkles className="h-2 w-2 mr-0.5" />
              New opportunities found
            </Badge>
          )}
        </div>
        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-border/30 space-y-3">
          {/* Explanation */}
          <div className="text-[8px] text-muted-foreground leading-relaxed">
            <p className="mb-1.5">
              <strong className="text-foreground">The numbers are consistent and correct.</strong> Here's how they work:
            </p>
            <ul className="space-y-1 ml-2">
              <li className="flex items-start gap-1">
                <span className="text-emerald-500 mt-0.5">●</span>
                <span><strong>Feature Matrix</strong> shows BASE scenarios/use cases defined for each feature</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-purple-500 mt-0.5">●</span>
                <span><strong>Cross-Functional</strong> identifies NEW scenarios discovered through feature dependencies</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-blue-500 mt-0.5">●</span>
                <span><strong>Gen Coverage</strong> finds NEW scenarios by mapping to Industries, Frameworks, Visuals, Outputs</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-primary mt-0.5">●</span>
                <span><strong>Total</strong> is the DEDUPLICATED union (removes duplicates across all sources)</span>
              </li>
            </ul>
          </div>

          {/* Visual Derivation */}
          <div className="grid grid-cols-2 gap-3">
            {/* Scenarios */}
            <DerivationCard
              title="Scenarios"
              base={scenarios.base}
              newCross={scenarios.newFromCross}
              newGen={scenarios.newFromGen}
              total={scenarios.total}
              contributions={scenarioContributions}
              onNavigate={onNavigate}
            />

            {/* Use Cases */}
            <DerivationCard
              title="Use Cases"
              base={useCases.base}
              newCross={useCases.newFromCross}
              newGen={useCases.newFromGen}
              total={useCases.total}
              contributions={useCaseContributions}
              onNavigate={onNavigate}
            />
          </div>

          {/* Key Insight */}
          <div className="bg-primary/5 border border-primary/20 rounded p-2 text-[8px]">
            <div className="flex items-start gap-1.5">
              <Info className="h-3 w-3 text-primary mt-0.5 shrink-0" />
              <div>
                <strong className="text-foreground">Key Insight for {categoryLabel}:</strong>
                <p className="text-muted-foreground mt-0.5">
                  {scenarios.newFromGen > 0 || useCases.newFromGen > 0 ? (
                    <>
                      Generation Coverage discovered <strong className="text-blue-500">+{scenarios.newFromGen} scenarios</strong> and <strong className="text-blue-500">+{useCases.newFromGen} use cases</strong> by 
                      analyzing how {categoryLabel} features apply to different industries, frameworks, and outputs. 
                      These represent <strong>new implementation opportunities</strong> not captured in base feature definitions.
                    </>
                  ) : (
                    <>
                      All scenarios and use cases for {categoryLabel} are already captured in the Feature Matrix. 
                      No additional opportunities were discovered through cross-functional or context analysis.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// DERIVATION CARD
// ============================================

interface DerivationCardProps {
  title: string;
  base: number;
  newCross: number;
  newGen: number;
  total: number;
  contributions: { base: number; cross: number; gen: number };
  onNavigate?: (tab: string, filter?: string) => void;
}

const DerivationCard: React.FC<DerivationCardProps> = ({
  title,
  base,
  newCross,
  newGen,
  total,
  contributions,
  onNavigate
}) => (
  <div className="bg-card rounded border border-border/50 p-2">
    <div className="text-[9px] font-semibold mb-1.5">{title} Breakdown</div>
    
    {/* Visual Stack */}
    <div className="space-y-1">
      {/* Base */}
      <SourceRow
        color="emerald"
        icon={<Check className="h-2.5 w-2.5" />}
        label="Base (Feature Matrix)"
        value={base}
        percentage={contributions.base}
        onClick={() => onNavigate?.('matrix')}
      />
      
      {/* Cross-Functional */}
      <SourceRow
        color="purple"
        icon={<Zap className="h-2.5 w-2.5" />}
        label="+New (Cross-Func)"
        value={newCross}
        percentage={contributions.cross}
        isNew
        onClick={() => onNavigate?.('crossfunc')}
      />
      
      {/* Gen Coverage */}
      <SourceRow
        color="blue"
        icon={<Layers className="h-2.5 w-2.5" />}
        label="+New (Gen Coverage)"
        value={newGen}
        percentage={contributions.gen}
        isNew
        onClick={() => onNavigate?.('coverage')}
      />
    </div>
    
    {/* Arrow */}
    <div className="flex justify-center my-1">
      <ArrowRight className="h-3 w-3 text-muted-foreground/50 rotate-90" />
    </div>
    
    {/* Total */}
    <div 
      className="flex items-center justify-between bg-primary/10 rounded px-1.5 py-1 cursor-pointer hover:bg-primary/20"
      onClick={() => onNavigate?.('gaps')}
    >
      <div className="flex items-center gap-1">
        <Target className="h-2.5 w-2.5 text-primary" />
        <span className="text-[8px] font-medium text-foreground">Total (Deduplicated)</span>
      </div>
      <span className="text-[10px] font-bold text-primary">{total}</span>
    </div>
    
    {/* Deduplication Note */}
    {base + newCross + newGen > total && (
      <div className="mt-1 text-[7px] text-muted-foreground/70 flex items-center gap-1">
        <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
        <span>{base + newCross + newGen - total} duplicates removed during deduplication</span>
      </div>
    )}
  </div>
);

// ============================================
// SOURCE ROW
// ============================================

interface SourceRowProps {
  color: 'emerald' | 'purple' | 'blue';
  icon: React.ReactNode;
  label: string;
  value: number;
  percentage: number;
  isNew?: boolean;
  onClick?: () => void;
}

const SourceRow: React.FC<SourceRowProps> = ({
  color,
  icon,
  label,
  value,
  percentage,
  isNew,
  onClick
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-600 hover:bg-purple-500/20',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20',
  };

  const dotColors = {
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
  };

  return (
    <div 
      className={`flex items-center justify-between rounded px-1.5 py-0.5 border cursor-pointer transition-colors ${colorClasses[color]}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color]}`} />
        <span className="text-[7px]">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[9px] font-semibold">{value}</span>
        <span className="text-[7px] text-muted-foreground">({percentage}%)</span>
      </div>
    </div>
  );
};

// ============================================
// DETAILED BREAKDOWN DIALOG
// ============================================

interface MetricsBreakdownDialogProps {
  scenarios: {
    base: number;
    newFromCross: number;
    newFromGen: number;
    total: number;
    // Add actual scenario strings for drill-down
    baseItems?: string[];
    crossItems?: string[];
    genItems?: string[];
  };
  useCases: {
    base: number;
    newFromCross: number;
    newFromGen: number;
    total: number;
    baseItems?: string[];
    crossItems?: string[];
    genItems?: string[];
  };
  categoryLabel: string;
}

export const MetricsBreakdownDialog: React.FC<MetricsBreakdownDialogProps> = ({
  scenarios,
  useCases,
  categoryLabel
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-[8px] text-blue-500 hover:underline flex items-center gap-0.5">
          <Info className="h-2.5 w-2.5" />
          View detailed breakdown
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-sm">
            Metrics Breakdown for {categoryLabel}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Scenarios Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold flex items-center gap-2">
                Scenarios
                <Badge variant="secondary" className="text-[9px]">
                  {scenarios.total} unique
                </Badge>
              </h3>
              
              <BreakdownSection
                title="From Feature Matrix (Base)"
                count={scenarios.base}
                color="emerald"
                items={scenarios.baseItems}
              />
              
              <BreakdownSection
                title="New from Cross-Functional"
                count={scenarios.newFromCross}
                color="purple"
                items={scenarios.crossItems}
                isNew
              />
              
              <BreakdownSection
                title="New from Gen Coverage"
                count={scenarios.newFromGen}
                color="blue"
                items={scenarios.genItems}
                isNew
              />
            </div>

            {/* Use Cases Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold flex items-center gap-2">
                Use Cases
                <Badge variant="secondary" className="text-[9px]">
                  {useCases.total} unique
                </Badge>
              </h3>
              
              <BreakdownSection
                title="From Feature Matrix (Base)"
                count={useCases.base}
                color="emerald"
                items={useCases.baseItems}
              />
              
              <BreakdownSection
                title="New from Cross-Functional"
                count={useCases.newFromCross}
                color="purple"
                items={useCases.crossItems}
                isNew
              />
              
              <BreakdownSection
                title="New from Gen Coverage"
                count={useCases.newFromGen}
                color="blue"
                items={useCases.genItems}
                isNew
              />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// BREAKDOWN SECTION
// ============================================

interface BreakdownSectionProps {
  title: string;
  count: number;
  color: 'emerald' | 'purple' | 'blue';
  items?: string[];
  isNew?: boolean;
}

const BreakdownSection: React.FC<BreakdownSectionProps> = ({
  title,
  count,
  color,
  items,
  isNew
}) => {
  const colorClasses = {
    emerald: 'border-emerald-500/30 bg-emerald-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
  };

  const badgeColors = {
    emerald: 'bg-emerald-500/20 text-emerald-700',
    purple: 'bg-purple-500/20 text-purple-700',
    blue: 'bg-blue-500/20 text-blue-700',
  };

  return (
    <div className={`rounded-lg border p-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium">{title}</span>
        <Badge className={`text-[9px] ${badgeColors[color]}`}>
          {isNew ? '+' : ''}{count}
        </Badge>
      </div>
      {items && items.length > 0 && (
        <div className="grid grid-cols-2 gap-1 mt-2">
          {items.slice(0, 10).map((item, i) => (
            <div key={i} className="text-[8px] text-muted-foreground truncate">
              • {item}
            </div>
          ))}
          {items.length > 10 && (
            <div className="text-[8px] text-muted-foreground italic">
              ...and {items.length - 10} more
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricsExplainer;
