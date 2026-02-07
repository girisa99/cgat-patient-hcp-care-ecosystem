/**
 * Smart Template Recommender
 * AI-powered template suggestion based on product, audience, and platform context
 * Uses scoring algorithm against blueprint metadata for instant recommendations
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Target,
  Users,
  Monitor,
  Clock,
  Layers,
  ChevronRight,
  Zap,
  TrendingUp,
  RefreshCw,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VideoBlueprint } from '@/hooks/useVideoBlueprints';

interface SmartTemplateRecommenderProps {
  blueprints: VideoBlueprint[];
  onSelectBlueprint: (blueprint: VideoBlueprint) => void;
  onCompare?: (blueprintIds: string[]) => void;
  className?: string;
}

// Product context options (aligned with registry)
const PRODUCT_CONTEXTS = [
  { value: 'saas', label: 'SaaS / Tech Product' },
  { value: 'healthcare', label: 'Healthcare / Medical' },
  { value: 'education', label: 'Education / Training' },
  { value: 'ecommerce', label: 'E-Commerce / Retail' },
  { value: 'finance', label: 'Finance / Fintech' },
  { value: 'travel', label: 'Travel / Hospitality' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'corporate', label: 'Corporate / Enterprise' },
  { value: 'entertainment', label: 'Entertainment / Media' },
  { value: 'smb', label: 'Small Business' },
];

// Audience segments
const AUDIENCE_SEGMENTS = [
  { value: 'b2b_decision_makers', label: 'B2B Decision Makers' },
  { value: 'b2c_consumers', label: 'B2C Consumers' },
  { value: 'developers', label: 'Developers / Technical' },
  { value: 'creators', label: 'Content Creators' },
  { value: 'students', label: 'Students / Learners' },
  { value: 'patients', label: 'Patients / Caregivers' },
  { value: 'enterprise', label: 'Enterprise Teams' },
  { value: 'general', label: 'General Audience' },
];

// Platform targets
const PLATFORM_TARGETS = [
  { value: 'youtube', label: 'YouTube (16:9)' },
  { value: 'tiktok', label: 'TikTok (9:16)' },
  { value: 'instagram', label: 'Instagram (1:1 / 9:16)' },
  { value: 'linkedin', label: 'LinkedIn (16:9)' },
  { value: 'facebook', label: 'Facebook (16:9)' },
  { value: 'website', label: 'Website / Landing Page' },
  { value: 'presentation', label: 'Presentation / Deck' },
  { value: 'email', label: 'Email Campaign' },
];

interface RecommendationScore {
  blueprint: VideoBlueprint;
  score: number;
  reasons: string[];
  matchType: 'exact' | 'strong' | 'partial';
}

// Scoring engine: rank blueprints based on context
function scoreBlueprints(
  blueprints: VideoBlueprint[],
  product: string,
  audience: string,
  platform: string,
  goal: string,
): RecommendationScore[] {
  return blueprints
    .map(bp => {
      let score = 0;
      const reasons: string[] = [];
      const nameLC = bp.name.toLowerCase();
      const descLC = (bp.description || '').toLowerCase();
      const tags = (bp.industry_tags || []).map(t => t.toLowerCase());
      const platforms = (bp.target_platform || []).map(p => p.toLowerCase());
      const category = bp.category.toLowerCase();
      const settings = bp.default_settings as any || {};

      // Product match (0-35 points)
      if (product) {
        const productMap: Record<string, string[]> = {
          saas: ['saas', 'tech', 'software', 'product demo', 'app'],
          healthcare: ['healthcare', 'medical', 'health', 'patient', 'clinical', 'nursing', 'homecare'],
          education: ['educational', 'training', 'learning', 'tutorial', 'course'],
          ecommerce: ['retail', 'ecommerce', 'product', 'shop', 'store'],
          finance: ['finance', 'fintech', 'banking', 'investment'],
          travel: ['travel', 'tourism', 'hospitality', 'destination'],
          food: ['food', 'restaurant', 'recipe', 'culinary', 'coffee'],
          corporate: ['corporate', 'enterprise', 'business', 'company'],
          entertainment: ['entertainment', 'media', 'gaming', 'music'],
          smb: ['smb', 'small business', 'local', 'shop'],
        };
        const keywords = productMap[product] || [];
        const categoryMatch = keywords.some(kw => category.includes(kw));
        const tagMatch = keywords.some(kw => tags.some(t => t.includes(kw)));
        const nameMatch = keywords.some(kw => nameLC.includes(kw) || descLC.includes(kw));

        if (categoryMatch) { score += 35; reasons.push('Category match'); }
        else if (tagMatch) { score += 25; reasons.push('Industry match'); }
        else if (nameMatch) { score += 15; reasons.push('Content match'); }
      }

      // Audience match (0-25 points)
      if (audience) {
        const audienceMap: Record<string, string[]> = {
          b2b_decision_makers: ['corporate', 'enterprise', 'roi', 'case study', 'demo'],
          b2c_consumers: ['consumer', 'lifestyle', 'social', 'ugc', 'hook'],
          developers: ['tech', 'api', 'developer', 'tutorial', 'code'],
          creators: ['creator', 'ugc', 'content', 'influencer', 'social'],
          students: ['educational', 'learning', 'tutorial', 'explainer'],
          patients: ['healthcare', 'patient', 'health', 'wellness'],
          enterprise: ['enterprise', 'corporate', 'compliance', 'security'],
          general: ['marketing', 'announcement', 'brand'],
        };
        const keywords = audienceMap[audience] || [];
        if (keywords.some(kw => nameLC.includes(kw) || descLC.includes(kw) || category.includes(kw))) {
          score += 25;
          reasons.push('Audience fit');
        }
      }

      // Platform match (0-20 points)
      if (platform) {
        const platformMatch = platforms.some(p => p.toLowerCase().includes(platform));
        if (platformMatch) {
          score += 20;
          reasons.push(`${platform} optimized`);
        }
        // Duration heuristic for platform
        if (platform === 'tiktok' && bp.estimated_duration_seconds <= 60) {
          score += 10;
          reasons.push('Short-form fit');
        }
        if (platform === 'youtube' && bp.estimated_duration_seconds >= 60) {
          score += 10;
          reasons.push('Long-form fit');
        }
      }

      // Goal/keyword match (0-15 points)
      if (goal) {
        const goalWords = goal.toLowerCase().split(/\s+/);
        const matches = goalWords.filter(w =>
          w.length > 2 && (nameLC.includes(w) || descLC.includes(w) || tags.some(t => t.includes(w)))
        );
        if (matches.length > 0) {
          score += Math.min(15, matches.length * 5);
          reasons.push(`Keyword: ${matches.slice(0, 2).join(', ')}`);
        }
      }

      // Popularity boost (0-5 points)
      if (bp.usage_count > 10) {
        score += 5;
        reasons.push('Popular template');
      }

      // Capability bonus
      if (settings.avatarEnabled) { score += 3; }
      if (settings['3dEnabled']) { score += 2; }

      const matchType: 'exact' | 'strong' | 'partial' =
        score >= 60 ? 'exact' : score >= 30 ? 'strong' : 'partial';

      return { blueprint: bp, score, reasons, matchType };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6); // Top 6 recommendations
}

export function SmartTemplateRecommender({
  blueprints,
  onSelectBlueprint,
  onCompare,
  className,
}: SmartTemplateRecommenderProps) {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [platform, setPlatform] = useState('');
  const [goal, setGoal] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const recommendations = useMemo(() => {
    if (!product && !audience && !platform && !goal) return [];
    return scoreBlueprints(blueprints, product, audience, platform, goal);
  }, [blueprints, product, audience, platform, goal]);

  const handleRecommend = useCallback(() => {
    setShowResults(true);
    setIsExpanded(true);
  }, []);

  const handleReset = useCallback(() => {
    setProduct('');
    setAudience('');
    setPlatform('');
    setGoal('');
    setShowResults(false);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const hasContext = product || audience || platform || goal;

  return (
    <Card className={cn("border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Smart Recommendations</h3>
              <p className="text-xs text-muted-foreground">AI suggests best templates for your context</p>
            </div>
          </div>
          {hasContext && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs gap-1">
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>

        {/* Context Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Select value={product} onValueChange={setProduct}>
            <SelectTrigger className="h-8 text-xs">
              <Target className="h-3 w-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Product type" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CONTEXTS.map(p => (
                <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className="h-8 text-xs">
              <Users className="h-3 w-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent>
              {AUDIENCE_SEGMENTS.map(a => (
                <SelectItem key={a.value} value={a.value} className="text-xs">{a.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="h-8 text-xs">
              <Monitor className="h-3 w-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORM_TARGETS.map(p => (
                <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1">
            <Input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="Goal keywords..."
              className="h-8 text-xs flex-1"
              onKeyDown={e => e.key === 'Enter' && handleRecommend()}
            />
            <Button
              size="sm"
              className="h-8 px-2.5"
              onClick={handleRecommend}
              disabled={!hasContext}
            >
              <Zap className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Results */}
        {showResults && recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Top {Math.min(recommendations.length, 3)} Recommendations
              </span>
              {onCompare && recommendations.length >= 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] gap-1"
                  onClick={() => onCompare(recommendations.slice(0, 3).map(r => r.blueprint.id))}
                >
                  <Layers className="h-3 w-3" />
                  Compare Top 3
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recommendations.slice(0, 3).map((rec, idx) => (
                <div
                  key={rec.blueprint.id}
                  className={cn(
                    "relative rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md",
                    idx === 0 ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border/50 bg-card/50",
                    "hover:border-primary/40"
                  )}
                  onClick={() => onSelectBlueprint(rec.blueprint)}
                >
                  {/* Rank badge */}
                  <div className={cn(
                    "absolute -top-2 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
                    idx === 0 ? "bg-primary text-primary-foreground" :
                    idx === 1 ? "bg-secondary text-secondary-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {idx + 1}
                  </div>

                  {/* Match indicator */}
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] h-4",
                        rec.matchType === 'exact' ? 'border-green-500/50 text-green-500 bg-green-500/10' :
                        rec.matchType === 'strong' ? 'border-primary/50 text-primary bg-primary/10' :
                        'border-muted-foreground/50 text-muted-foreground'
                      )}
                    >
                      <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                      {rec.score}% match
                    </Badge>
                    <Badge variant="outline" className="text-[9px] capitalize h-4">
                      {rec.blueprint.category}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-medium line-clamp-1">{rec.blueprint.name}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                    {rec.blueprint.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDuration(rec.blueprint.estimated_duration_seconds)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Layers className="h-2.5 w-2.5" />
                      {rec.blueprint.target_platform?.length || 0} platforms
                    </span>
                  </div>

                  {/* Match reasons */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.reasons.slice(0, 3).map((reason, i) => (
                      <span key={i} className="text-[9px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded">
                        {reason}
                      </span>
                    ))}
                  </div>

                  {/* Action */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 h-7 text-xs gap-1"
                    onClick={e => { e.stopPropagation(); onSelectBlueprint(rec.blueprint); }}
                  >
                    Preview Template
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Additional recommendations */}
            {recommendations.length > 3 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                <span className="text-[10px] text-muted-foreground">Also relevant:</span>
                {recommendations.slice(3, 6).map(rec => (
                  <Button
                    key={rec.blueprint.id}
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1"
                    onClick={() => onSelectBlueprint(rec.blueprint)}
                  >
                    {rec.blueprint.name}
                    <Badge variant="outline" className="text-[8px] h-3 ml-1">{rec.score}%</Badge>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No results */}
        {showResults && recommendations.length === 0 && hasContext && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">No strong matches found</p>
            <p className="text-xs mt-1">Try adjusting your context or browse the full library below</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SmartTemplateRecommender;
