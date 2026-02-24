/**
 * MarketingFrameworkCards — Visual cards for 10 marketing frameworks
 *
 * Each card shows framework name, icon, core pillars, best tiers,
 * and a brief description. Click to select and apply to content strategy.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Target,
  Heart,
  DollarSign,
  Megaphone,
  Brain,
  Zap,
  BookOpen,
  Star,
  TrendingUp,
  Lightbulb,
  Crown,
  ChevronRight,
} from 'lucide-react';
import {
  BUSINESS_TIER_CONFIG,
  type MarketingFramework,
  type BusinessTier,
} from '@/services/brand-intelligence';
import { cn } from '@/lib/utils';

interface MarketingFrameworkCardsProps {
  selectedFramework?: MarketingFramework;
  businessTier?: BusinessTier;
  onSelect?: (framework: MarketingFramework) => void;
  className?: string;
}

interface FrameworkDetail {
  id: MarketingFramework;
  name: string;
  icon: React.ReactNode;
  pillars: string[];
  description: string;
  bestFor: string;
  origin: string;
  complexity: 'simple' | 'moderate' | 'advanced';
  tiers: BusinessTier[];
  color: string;
}

const FRAMEWORK_DETAILS: FrameworkDetail[] = [
  {
    id: '4ps',
    name: '4Ps Marketing Mix',
    icon: <Target className="h-5 w-5" />,
    pillars: ['Product', 'Price', 'Place', 'Promotion'],
    description:
      'The classic marketing mix framework. Define what you sell, at what price, where you sell it, and how you promote it. Time-tested for structured marketing planning.',
    bestFor: 'Established businesses needing structured marketing plans',
    origin: 'E. Jerome McCarthy (1960)',
    complexity: 'moderate',
    tiers: ['small', 'medium', 'large', 'enterprise'],
    color: 'bg-blue-500',
  },
  {
    id: '4es',
    name: '4Es Experience',
    icon: <Heart className="h-5 w-5" />,
    pillars: ['Experience', 'Exchange', 'Everyplace', 'Evangelism'],
    description:
      'Modern evolution of the 4Ps. Focus on customer experience over product, value exchange over price, omni-presence over place, and advocacy over promotion.',
    bestFor: 'Customer-centric brands building loyalty and community',
    origin: 'Brian Fetherstonhaugh / Ogilvy',
    complexity: 'moderate',
    tiers: ['medium', 'large', 'enterprise'],
    color: 'bg-pink-500',
  },
  {
    id: '4cs',
    name: '4Cs Customer Focus',
    icon: <DollarSign className="h-5 w-5" />,
    pillars: ['Customer', 'Cost', 'Convenience', 'Communication'],
    description:
      'Reframes marketing from the customer perspective. Instead of what you sell, focus on what the customer needs. Instead of price, think total cost to the customer.',
    bestFor: 'Service businesses and customer-first brands',
    origin: 'Robert F. Lauterborn (1990)',
    complexity: 'moderate',
    tiers: ['small', 'medium', 'large', 'enterprise'],
    color: 'bg-green-500',
  },
  {
    id: 'stp',
    name: 'STP Segmentation',
    icon: <TrendingUp className="h-5 w-5" />,
    pillars: ['Segmentation', 'Targeting', 'Positioning'],
    description:
      'Divide your market into segments, choose which to target, and position your brand uniquely for each. Essential for focused marketing with limited resources.',
    bestFor: 'Businesses entering new markets or refining positioning',
    origin: 'Philip Kotler',
    complexity: 'advanced',
    tiers: ['small', 'medium', 'large', 'enterprise'],
    color: 'bg-purple-500',
  },
  {
    id: 'aida',
    name: 'AIDA Funnel',
    icon: <Megaphone className="h-5 w-5" />,
    pillars: ['Attention', 'Interest', 'Desire', 'Action'],
    description:
      'The customer journey through your marketing: grab Attention, build Interest, create Desire, drive Action. Perfect for structuring ads, landing pages, and video scripts.',
    bestFor: 'Ad campaigns, sales pages, video scripts, social content',
    origin: 'Elmo Lewis (1898)',
    complexity: 'simple',
    tiers: ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'],
    color: 'bg-orange-500',
  },
  {
    id: 'value_prop',
    name: 'Value Proposition Canvas',
    icon: <Lightbulb className="h-5 w-5" />,
    pillars: ['Customer Jobs', 'Pains', 'Gains', 'Pain Relievers', 'Gain Creators', 'Products & Services'],
    description:
      'Map what your customers are trying to do (jobs), what frustrates them (pains), and what they want (gains). Then design your offering to match perfectly.',
    bestFor: 'Product-market fit validation and messaging alignment',
    origin: 'Alexander Osterwalder (Strategyzer)',
    complexity: 'moderate',
    tiers: ['small', 'medium', 'large', 'enterprise'],
    color: 'bg-teal-500',
  },
  {
    id: 'jobs_to_done',
    name: 'Jobs-To-Be-Done',
    icon: <Brain className="h-5 w-5" />,
    pillars: ['Functional Job', 'Emotional Job', 'Social Job', 'Desired Outcome'],
    description:
      'Customers do not buy products -- they hire them to get a job done. Understand the underlying job your product is hired for, and you will never misposition your brand.',
    bestFor: 'Innovation-driven companies and product differentiation',
    origin: 'Clayton Christensen (Harvard)',
    complexity: 'advanced',
    tiers: ['medium', 'large', 'enterprise'],
    color: 'bg-indigo-500',
  },
  {
    id: 'lean_canvas',
    name: 'Lean Canvas',
    icon: <Zap className="h-5 w-5" />,
    pillars: ['Problem', 'Solution', 'Key Metrics', 'Unique Value', 'Unfair Advantage', 'Channels', 'Customer Segments', 'Cost Structure', 'Revenue Streams'],
    description:
      'One-page business plan for startups. Captures everything from problem to revenue model. Great for quickly validating a business idea and aligning a team.',
    bestFor: 'Startups, new product launches, business model validation',
    origin: 'Ash Maurya (Running Lean)',
    complexity: 'moderate',
    tiers: ['medium', 'large', 'enterprise'],
    color: 'bg-yellow-500',
  },
  {
    id: 'brand_key',
    name: 'Brand Key',
    icon: <Crown className="h-5 w-5" />,
    pillars: ['Root Strengths', 'Competitive Environment', 'Target', 'Insight', 'Benefits', 'Values & Personality', 'Reason to Believe', 'Brand Essence'],
    description:
      'Unilever\'s comprehensive brand strategy framework. Defines every dimension of your brand from root strengths to essence. The gold standard for Fortune 500 brand management.',
    bestFor: 'Large brands needing comprehensive brand governance',
    origin: 'Unilever',
    complexity: 'advanced',
    tiers: ['large', 'enterprise'],
    color: 'bg-amber-600',
  },
  {
    id: 'storm',
    name: 'STORM Framework',
    icon: <Star className="h-5 w-5" />,
    pillars: ['Story', 'Trust', 'Offer', 'Reach', 'Momentum'],
    description:
      'GenieSuite\'s own simplified framework designed for SMBs and micro-businesses. No MBA required. Tell your Story, build Trust, make your Offer, expand Reach, build Momentum.',
    bestFor: 'Small businesses, solo entrepreneurs, informal economy',
    origin: 'GenieSuite (Original)',
    complexity: 'simple',
    tiers: ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'],
    color: 'bg-violet-500',
  },
];

const COMPLEXITY_LABELS: Record<string, { label: string; color: string }> = {
  simple: { label: 'Simple', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  moderate: { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  advanced: { label: 'Advanced', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const TIER_LABELS: Record<BusinessTier, string> = {
  nano: 'Nano',
  micro: 'Micro',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  enterprise: 'Enterprise',
};

export function MarketingFrameworkCards({
  selectedFramework,
  businessTier,
  onSelect,
  className,
}: MarketingFrameworkCardsProps) {
  const [expandedId, setExpandedId] = useState<MarketingFramework | null>(null);

  const filteredFrameworks = businessTier
    ? FRAMEWORK_DETAILS.filter((f) => f.tiers.includes(businessTier))
    : FRAMEWORK_DETAILS;

  const recommendedFrameworks = businessTier
    ? BUSINESS_TIER_CONFIG[businessTier].frameworks
    : [];

  const handleSelect = (id: MarketingFramework) => {
    onSelect?.(id);
  };

  const handleToggleExpand = (id: MarketingFramework) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {businessTier && recommendedFrameworks.length > 0 && (
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 dark:border-violet-800 dark:bg-violet-950/30">
          <p className="text-sm text-violet-700 dark:text-violet-300">
            <Star className="mr-1 inline h-4 w-4" />
            <strong>Recommended for {TIER_LABELS[businessTier]} businesses:</strong>{' '}
            {recommendedFrameworks
              .map((fId) => FRAMEWORK_DETAILS.find((f) => f.id === fId)?.name || fId)
              .join(', ')}
          </p>
        </div>
      )}

      <ScrollArea className="h-full">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredFrameworks.map((framework) => {
            const isSelected = selectedFramework === framework.id;
            const isExpanded = expandedId === framework.id;
            const isRecommended = recommendedFrameworks.includes(framework.id);
            const complexityInfo = COMPLEXITY_LABELS[framework.complexity];

            return (
              <Card
                key={framework.id}
                className={cn(
                  'group relative cursor-pointer transition-all duration-200 hover:shadow-lg',
                  isSelected && 'ring-2 ring-violet-500 shadow-lg',
                  isRecommended && !isSelected && 'ring-1 ring-violet-300 dark:ring-violet-700',
                )}
                onClick={() => handleToggleExpand(framework.id)}
              >
                {isRecommended && (
                  <div className="absolute -top-2 right-3 z-10">
                    <Badge className="bg-violet-500 text-white text-xs px-2 py-0.5">
                      Recommended
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg text-white',
                          framework.color,
                        )}
                      >
                        {framework.icon}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold leading-tight">
                          {framework.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{framework.origin}</p>
                      </div>
                    </div>
                    <Badge className={cn('text-xs shrink-0', complexityInfo.color)} variant="secondary">
                      {complexityInfo.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {framework.pillars.slice(0, isExpanded ? undefined : 4).map((pillar) => (
                      <Badge
                        key={pillar}
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {pillar}
                      </Badge>
                    ))}
                    {!isExpanded && framework.pillars.length > 4 && (
                      <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                        +{framework.pillars.length - 4} more
                      </Badge>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {framework.description}
                      </p>

                      <div className="rounded-md bg-muted/50 p-2.5">
                        <p className="text-xs font-medium text-foreground">Best for:</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{framework.bestFor}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Available tiers:</p>
                        <div className="flex flex-wrap gap-1">
                          {framework.tiers.map((tier) => (
                            <Badge
                              key={tier}
                              variant="secondary"
                              className={cn(
                                'text-xs',
                                tier === businessTier && 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
                              )}
                            >
                              {TIER_LABELS[tier]}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full mt-2"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(framework.id);
                        }}
                      >
                        {isSelected ? (
                          <>Selected</>
                        ) : (
                          <>
                            Apply Framework <ChevronRight className="ml-1 h-3 w-3" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {!isExpanded && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {framework.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
