/**
 * Slide Count Recommendation - Dynamic slide count based on content type
 * Shows market-data-backed recommendations with user override capability
 */

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Info,
  Sparkles,
  AlertTriangle,
  Check,
  BarChart3,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// CONTENT TYPE SLIDE RECOMMENDATIONS
// Based on industry research and best practices
// ==========================================

export interface SlideRecommendation {
  contentType: string;
  recommendedMin: number;
  recommendedMax: number;
  optimal: number;
  absoluteMax: number;
  reasoning: string;
  marketData: string;
  attentionSpan: string; // Average viewer attention minutes
}

export const SLIDE_RECOMMENDATIONS: Record<string, SlideRecommendation> = {
  // Storytelling & Narrative
  'storytelling': {
    contentType: 'Storytelling',
    recommendedMin: 8,
    recommendedMax: 15,
    optimal: 12,
    absoluteMax: 20,
    reasoning: 'Story arcs need setup, conflict, and resolution - typically 3-act structure',
    marketData: 'TED talks average 18 slides over 15 minutes (1.2 slides/min)',
    attentionSpan: '12-15 min',
  },
  'case-study': {
    contentType: 'Case Study',
    recommendedMin: 12,
    recommendedMax: 18,
    optimal: 15,
    absoluteMax: 25,
    reasoning: 'Detailed analysis requires context, problem, solution, and results sections',
    marketData: 'McKinsey case studies average 15-20 slides',
    attentionSpan: '15-20 min',
  },
  
  // Investor & Business
  'investor-pitch': {
    contentType: 'Investor Pitch',
    recommendedMin: 10,
    recommendedMax: 15,
    optimal: 12,
    absoluteMax: 20,
    reasoning: 'Guy Kawasaki 10/20/30 rule: 10 slides, 20 minutes, 30pt font minimum',
    marketData: 'Sequoia template: 12 slides, Y Combinator: 10-15 slides',
    attentionSpan: '8-12 min',
  },
  'board-deck': {
    contentType: 'Board Deck',
    recommendedMin: 15,
    recommendedMax: 25,
    optimal: 20,
    absoluteMax: 35,
    reasoning: 'Comprehensive reporting with metrics, updates, and strategic decisions',
    marketData: 'Average board meeting deck: 20-30 slides over 60 minutes',
    attentionSpan: '45-60 min',
  },
  
  // Training & Education
  'training': {
    contentType: 'Training',
    recommendedMin: 15,
    recommendedMax: 30,
    optimal: 20,
    absoluteMax: 50,
    reasoning: 'Instructional design recommends chunking into 5-7 concept modules',
    marketData: 'E-learning average: 2-3 slides per minute of content',
    attentionSpan: '20-30 min',
  },
  'workshop': {
    contentType: 'Workshop',
    recommendedMin: 20,
    recommendedMax: 40,
    optimal: 30,
    absoluteMax: 60,
    reasoning: 'Interactive sessions need instruction slides + activity guides',
    marketData: 'Half-day workshop: 30-50 slides with exercises',
    attentionSpan: '3-4 hours',
  },
  
  // Visual & Infographic
  'infographic': {
    contentType: 'Infographic',
    recommendedMin: 5,
    recommendedMax: 12,
    optimal: 8,
    absoluteMax: 15,
    reasoning: 'Dense visual information - fewer slides with high impact',
    marketData: 'Optimal infographic engagement: 5-7 key data points',
    attentionSpan: '2-5 min',
  },
  'whitepaper': {
    contentType: 'Whitepaper',
    recommendedMin: 25,
    recommendedMax: 50,
    optimal: 35,
    absoluteMax: 80,
    reasoning: 'In-depth research requires comprehensive coverage',
    marketData: 'B2B whitepapers average 6-12 pages, ~3 slides per page',
    attentionSpan: '30-45 min',
  },
  
  // Marketing & Creative
  'marketing-campaign': {
    contentType: 'Marketing Campaign',
    recommendedMin: 12,
    recommendedMax: 20,
    optimal: 15,
    absoluteMax: 25,
    reasoning: 'Balance between strategy overview and execution details',
    marketData: 'Agency pitch decks: 15-25 slides',
    attentionSpan: '15-20 min',
  },
  'product-launch': {
    contentType: 'Product Launch',
    recommendedMin: 15,
    recommendedMax: 25,
    optimal: 20,
    absoluteMax: 35,
    reasoning: 'Cover features, benefits, go-to-market, and competitive positioning',
    marketData: 'Apple keynotes: 50+ slides over 2 hours, but product-specific: 20-30',
    attentionSpan: '20-30 min',
  },
  
  // Research & Analysis
  'research-report': {
    contentType: 'Research Report',
    recommendedMin: 20,
    recommendedMax: 40,
    optimal: 30,
    absoluteMax: 60,
    reasoning: 'Methodology, findings, analysis, and recommendations',
    marketData: 'Gartner/Forrester reports: 30-50 slides',
    attentionSpan: '30-45 min',
  },
  'competitive-analysis': {
    contentType: 'Competitive Analysis',
    recommendedMin: 15,
    recommendedMax: 25,
    optimal: 20,
    absoluteMax: 35,
    reasoning: 'Market overview, competitor profiles, and strategic implications',
    marketData: 'Standard competitive analysis: 15-25 slides',
    attentionSpan: '20-30 min',
  },
  
  // Quick Formats
  'executive-summary': {
    contentType: 'Executive Summary',
    recommendedMin: 3,
    recommendedMax: 8,
    optimal: 5,
    absoluteMax: 10,
    reasoning: 'Concise overview for time-pressed executives',
    marketData: 'C-suite attention span: 5-7 minutes',
    attentionSpan: '3-5 min',
  },
  'quick-update': {
    contentType: 'Quick Update',
    recommendedMin: 3,
    recommendedMax: 6,
    optimal: 4,
    absoluteMax: 8,
    reasoning: 'Status updates should be brief and focused',
    marketData: 'Weekly standup slides: 3-5',
    attentionSpan: '2-3 min',
  },
  
  // Default fallback
  'default': {
    contentType: 'General Presentation',
    recommendedMin: 8,
    recommendedMax: 15,
    optimal: 10,
    absoluteMax: 20,
    reasoning: 'General presentations follow the 10-slide rule for engagement',
    marketData: 'Average attention span for presentations: 10-15 minutes',
    attentionSpan: '10-15 min',
  },
};

// Output type adjustments
export const OUTPUT_TYPE_ADJUSTMENTS: Record<string, { multiplier: number; reason: string }> = {
  '2d-static': { multiplier: 1.0, reason: 'Standard slide format' },
  '2d-animated': { multiplier: 0.9, reason: 'Animations add engagement, fewer slides needed' },
  '3d-scene': { multiplier: 0.7, reason: '3D scenes are more immersive, reduce count' },
  '3d-animated': { multiplier: 0.6, reason: 'High engagement means fewer slides needed' },
  'video-intro': { multiplier: 0.3, reason: 'Video intros are 30-60 seconds max' },
  'video-full': { multiplier: 0.8, reason: 'Video format supports slightly fewer scenes' },
  'interactive': { multiplier: 0.75, reason: 'Interactive elements increase dwell time' },
};

interface SlideCountRecommendationProps {
  contentType: string;
  outputType: string;
  currentCount: number;
  onCountChange: (count: number) => void;
  minSlides?: number;
  maxSlides?: number;
  className?: string;
}

export function SlideCountRecommendation({
  contentType,
  outputType,
  currentCount,
  onCountChange,
  minSlides = 3,
  maxSlides = 20,
  className,
}: SlideCountRecommendationProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Get recommendation based on content type
  const baseRecommendation = useMemo(() => {
    // Try exact match first
    const exactMatch = SLIDE_RECOMMENDATIONS[contentType.toLowerCase().replace(/\s+/g, '-')];
    if (exactMatch) return exactMatch;
    
    // Try partial matching
    for (const [key, rec] of Object.entries(SLIDE_RECOMMENDATIONS)) {
      if (contentType.toLowerCase().includes(key) || key.includes(contentType.toLowerCase())) {
        return rec;
      }
    }
    
    return SLIDE_RECOMMENDATIONS['default'];
  }, [contentType]);
  
  // Adjust for output type
  const outputAdjustment = OUTPUT_TYPE_ADJUSTMENTS[outputType] || OUTPUT_TYPE_ADJUSTMENTS['2d-static'];
  
  const adjustedRecommendation = useMemo(() => {
    const multiplier = outputAdjustment.multiplier;
    return {
      ...baseRecommendation,
      recommendedMin: Math.max(minSlides, Math.round(baseRecommendation.recommendedMin * multiplier)),
      recommendedMax: Math.min(maxSlides, Math.round(baseRecommendation.recommendedMax * multiplier)),
      optimal: Math.round(baseRecommendation.optimal * multiplier),
    };
  }, [baseRecommendation, outputAdjustment, minSlides, maxSlides]);
  
  // Determine status
  const isOptimal = currentCount >= adjustedRecommendation.recommendedMin && 
                    currentCount <= adjustedRecommendation.recommendedMax;
  const isBelowRecommended = currentCount < adjustedRecommendation.recommendedMin;
  const isAboveRecommended = currentCount > adjustedRecommendation.recommendedMax;
  const isAboveAbsoluteMax = currentCount > adjustedRecommendation.absoluteMax;

  // Quick select options
  const quickOptions = [
    { label: 'Minimal', value: adjustedRecommendation.recommendedMin },
    { label: 'Optimal', value: adjustedRecommendation.optimal },
    { label: 'Detailed', value: adjustedRecommendation.recommendedMax },
    { label: 'Max', value: maxSlides },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Slide Count</span>
        </div>
        <Badge variant="outline" className={cn(
          "text-[10px]",
          isOptimal ? "border-success text-success" :
          isAboveAbsoluteMax ? "border-destructive text-destructive" :
          "border-warning text-warning"
        )}>
          {isOptimal ? (
            <><Check className="h-2.5 w-2.5 mr-1" /> Optimal</>
          ) : isBelowRecommended ? (
            <><TrendingDown className="h-2.5 w-2.5 mr-1" /> Below Rec.</>
          ) : isAboveAbsoluteMax ? (
            <><AlertTriangle className="h-2.5 w-2.5 mr-1" /> Too Many</>
          ) : (
            <><TrendingUp className="h-2.5 w-2.5 mr-1" /> Above Rec.</>
          )}
        </Badge>
      </div>

      {/* Current Count Display */}
      <div className="flex items-center justify-center py-2">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{currentCount}</div>
          <div className="text-xs text-muted-foreground">slides</div>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <Slider
          value={[currentCount]}
          onValueChange={([v]) => onCountChange(v)}
          min={minSlides}
          max={maxSlides}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{minSlides}</span>
          <span className="text-primary font-medium">
            Rec: {adjustedRecommendation.recommendedMin}-{adjustedRecommendation.recommendedMax}
          </span>
          <span>{maxSlides}</span>
        </div>
      </div>

      {/* Quick Select */}
      <div className="grid grid-cols-4 gap-2">
        {quickOptions.map((opt) => (
          <Button
            key={opt.label}
            size="sm"
            variant={currentCount === opt.value ? "default" : "outline"}
            onClick={() => onCountChange(opt.value)}
            className="text-[10px] h-7 px-2"
          >
            {opt.label}
            <span className="ml-1 opacity-70">{opt.value}</span>
          </Button>
        ))}
      </div>

      {/* Recommendation Details - Compact */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Info className="h-3 w-3" />
              Why this recommendation?
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[280px] p-3">
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-medium">Content Type:</span> {adjustedRecommendation.contentType}
              </div>
              <div className="text-muted-foreground">{adjustedRecommendation.reasoning}</div>
              <div className="flex items-start gap-1 text-muted-foreground">
                <BarChart3 className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <span className="line-clamp-2">{adjustedRecommendation.marketData}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Target className="h-3 w-3 text-primary shrink-0" />
                <span>Attention span: {adjustedRecommendation.attentionSpan}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Warnings - Compact */}
      {isAboveAbsoluteMax && (
        <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded-md text-[10px]">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-destructive">High slide count</span>
            <p className="text-muted-foreground mt-0.5 line-clamp-2">
              {currentCount} slides may cause viewer fatigue. Consider splitting into multiple presentations.
            </p>
          </div>
        </div>
      )}
      
      {isBelowRecommended && currentCount >= minSlides && (
        <div className="flex items-start gap-2 p-2 bg-warning/10 rounded-md text-[10px]">
          <Info className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-warning">Below recommended</span>
            <p className="text-muted-foreground mt-0.5 line-clamp-2">
              {adjustedRecommendation.contentType} typically needs {adjustedRecommendation.recommendedMin}+ slides.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function to get recommended slide count
export function getRecommendedSlideCount(
  contentType: string,
  outputType: string
): SlideRecommendation & { adjusted: { min: number; max: number; optimal: number } } {
  const base = SLIDE_RECOMMENDATIONS[contentType.toLowerCase().replace(/\s+/g, '-')] 
    || SLIDE_RECOMMENDATIONS['default'];
  const adjustment = OUTPUT_TYPE_ADJUSTMENTS[outputType] || OUTPUT_TYPE_ADJUSTMENTS['2d-static'];
  
  return {
    ...base,
    adjusted: {
      min: Math.round(base.recommendedMin * adjustment.multiplier),
      max: Math.round(base.recommendedMax * adjustment.multiplier),
      optimal: Math.round(base.optimal * adjustment.multiplier),
    },
  };
}

export default SlideCountRecommendation;
