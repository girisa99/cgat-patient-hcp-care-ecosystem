/**
 * BrandIntelligencePanel — Comprehensive dashboard that surfaces the
 * Brand Intelligence Engine in Cast's UI.
 *
 * Six sections:
 *  1. Business Profile Card (tier, industry, region, description)
 *  2. Marketing Framework Selector (10 frameworks)
 *  3. Audience Personas
 *  4. Regional Creative Preview
 *  5. Competitive Positioning
 *  6. Content Recommendations (use-case templates + production cost)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building2,
  Users,
  Target,
  Globe,
  BarChart3,
  Lightbulb,
  Crown,
  Sparkles,
  ChevronRight,
  MapPin,
  Music,
  Palette,
  MessageSquare,
  TrendingUp,
  Shield,
  Zap,
  BookOpen,
  Brain,
  Megaphone,
  Heart,
  DollarSign,
  Star,
} from 'lucide-react';
import {
  inferBusinessTier,
  createDefaultProfile,
  BUSINESS_TIER_CONFIG,
  enrichPromptWithRegion,
  getRegionalMusicPrompt,
  getRegionalNarrativeStyle,
  getRegionalCompanionCreature,
  getStyleForRegion,
  getAllStyleFamilies,
  CREATIVE_STYLES,
  ALL_BUSINESS_ARCHETYPES,
  findArchetypesByRegion,
  findArchetypesByType,
  getIntelligenceBus,
  IntelligenceBus,
  USE_CASE_TEMPLATES,
  getTemplatesForTier,
  estimateProductionCost,
  ONBOARDING_QUESTIONS,
  inferProfileFromDescription,
  type BrandIntelligenceProfile,
  type BusinessTier,
  type MarketingFramework,
  type AudiencePersona,
} from '@/services/brand-intelligence';
import { cn } from '@/lib/utils';
import { MarketingFrameworkCards } from './MarketingFrameworkCards';
import { RegionalCreativeShowcase } from './RegionalCreativeShowcase';

// ─── Props ──────────────────────────────────────────────────────────────────

interface BrandIntelligencePanelProps {
  businessDescription?: string;
  selectedRegion?: string;
  selectedTier?: BusinessTier;
  onProfileGenerated?: (profile: BrandIntelligenceProfile) => void;
  className?: string;
}

// ─── Tier UI helpers ─────────────────────────────────────────────────────────

const TIER_ICONS: Record<BusinessTier, React.ReactNode> = {
  nano: <Zap className="h-4 w-4" />,
  micro: <Star className="h-4 w-4" />,
  small: <Building2 className="h-4 w-4" />,
  medium: <TrendingUp className="h-4 w-4" />,
  large: <Crown className="h-4 w-4" />,
  enterprise: <Shield className="h-4 w-4" />,
};

const TIER_COLORS: Record<BusinessTier, string> = {
  nano: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  micro: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  small: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  medium: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  large: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  enterprise: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const MARKET_POSITION_LABELS: Record<string, string> = {
  leader: 'Market Leader',
  challenger: 'Challenger',
  niche: 'Niche Player',
  disruptor: 'Disruptor',
  value: 'Value Player',
  emerging: 'Emerging',
};

// ─── Main Component ─────────────────────────────────────────────────────────

export function BrandIntelligencePanel({
  businessDescription: initialDescription,
  selectedRegion: initialRegion,
  selectedTier: initialTier,
  onProfileGenerated,
  className,
}: BrandIntelligencePanelProps) {
  // ─── State ─────────────────────────────
  const [description, setDescription] = useState(initialDescription || '');
  const [location, setLocation] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [profile, setProfile] = useState<Partial<BrandIntelligenceProfile> | null>(null);
  const [inferredTier, setInferredTier] = useState<BusinessTier | null>(initialTier || null);
  const [confidence, setConfidence] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<MarketingFramework | undefined>();
  const [selectedRegion, setSelectedRegion] = useState(initialRegion || '');
  const [activeTab, setActiveTab] = useState('profile');
  const [isGenerating, setIsGenerating] = useState(false);

  // ─── Profile Generation ────────────────
  const handleGenerate = useCallback(() => {
    if (!description.trim()) return;

    setIsGenerating(true);

    // Simulate a brief processing delay for UX feel
    setTimeout(() => {
      const result = inferProfileFromDescription(description, location || undefined, undefined);

      const profileData = result.profile;
      const tier = profileData.identity?.businessTier || 'small';

      // Enrich with speciality
      if (speciality && profileData.marketing) {
        profileData.marketing = {
          ...profileData.marketing,
          valueProposition: {
            ...profileData.marketing.valueProposition,
            uniqueness: speciality,
          },
        };
      }

      // Add inferred audience personas
      if (profileData.identity) {
        const region = profileData.identity.primaryMarkets?.[0] || 'NAM_US';
        const archetypes = findArchetypesByRegion(region);
        const personas: AudiencePersona[] = archetypes.slice(0, 2).map((arch, idx) => ({
          id: `persona-${idx + 1}`,
          name: `${arch.name} Customer`,
          tier: arch.tier,
          demographics: {
            ageRange: [25, 55] as [number, number],
            regions: arch.regions.slice(0, 3),
            languages: ['en'],
            education: tier === 'nano' || tier === 'micro' ? 'secondary' : 'university',
            techSavviness: tier === 'nano' ? 2 : tier === 'micro' ? 3 : 4,
            internetAccess: tier === 'nano' ? 'mobile_only' : 'broadband',
          },
          psychographics: {
            goals: [`Find quality ${arch.typicalProducts[0] || 'products'}`, 'Save time and money', 'Support local businesses'],
            painPoints: [arch.biggestChallenge, 'Limited options in the area', 'Inconsistent quality from competitors'],
            motivations: ['Quality', 'Convenience', 'Trust', 'Value for money'],
            fears: ['Wasting money on poor quality', 'Missing out on deals'],
            dailyRoutine: arch.marketingReality,
          },
          businessContext: {
            industry: arch.type.replace(/_/g, ' '),
            businessType: arch.type,
            monthlyRevenue: `${arch.typicalRevenue.currency} ${arch.typicalRevenue.min}-${arch.typicalRevenue.max}/${arch.typicalRevenue.period}`,
            employeeCount: tier === 'nano' ? '0-1' : tier === 'micro' ? '1-5' : '5-50',
            marketingBudget: tier === 'nano' ? 'zero' : tier === 'micro' ? 'minimal' : 'modest',
            currentTools: arch.contentNeeds.slice(0, 3),
            biggestChallenge: arch.biggestChallenge,
          },
          contentPreferences: {
            preferredFormats: ['video', 'image', 'whatsapp'],
            attentionSpan: tier === 'nano' ? 'seconds' : 'short',
            bestReachChannel: arch.contentNeeds[0] || 'social media',
            languagePreference: profileData.identity?.originLanguage || 'en',
            deviceType: tier === 'nano' ? 'low_end_smartphone' : 'smartphone',
          },
        }));

        if (!profileData.audience) {
          profileData.audience = {
            primaryPersonas: personas,
            totalAddressableMarket: tier === 'nano' ? 'Local neighborhood' : tier === 'micro' ? 'City-level' : 'Regional',
            geographicReach: tier === 'nano' ? 'hyperlocal' : tier === 'micro' ? 'local' : 'city',
            customerAcquisition: ['walk-by traffic', 'word of mouth', 'social media'],
            loyaltyDrivers: ['quality', 'price', 'convenience'],
          };
        } else {
          profileData.audience.primaryPersonas = personas;
        }

        // Add competitive position if missing
        if (profileData.marketing && !profileData.marketing.competitivePosition.primaryDifferentiator) {
          profileData.marketing.competitivePosition = {
            primaryDifferentiator: speciality || 'Quality and service',
            competitorNames: [],
            marketPosition: tier === 'nano' || tier === 'micro' ? 'value' : 'challenger',
            pricePosition: tier === 'nano' ? 'value' : 'mid',
            uniqueAdvantages: speciality ? [speciality] : ['Quality products', 'Good customer service'],
            vulnerabilities: ['Limited marketing budget', 'Low brand awareness'],
          };
        }

        // Set content strategy
        const tierConfig = BUSINESS_TIER_CONFIG[tier];
        if (!profileData.contentStrategy) {
          profileData.contentStrategy = {
            primaryChannels: tierConfig.defaultContentFormats.slice(0, 4),
            contentFrequency: tier === 'nano' ? 'as_needed' : tier === 'micro' ? 'weekly' : 'daily',
            contentTypes: tierConfig.defaultContentFormats,
            callToAction: {
              primary: 'Visit us today!',
              urgencyLevel: 'gentle',
            },
            seasonalEvents: [],
          };
        }

        setSelectedRegion(region);
      }

      setProfile(profileData);
      setInferredTier(profileData.identity?.businessTier || 'small');
      setConfidence(result.confidence);
      setWarnings(result.warnings);
      setSelectedFramework(profileData.marketing?.activeFrameworks?.[0]);
      setIsGenerating(false);

      if (profileData && onProfileGenerated) {
        onProfileGenerated(profileData as BrandIntelligenceProfile);
      }
    }, 400);
  }, [description, location, speciality, onProfileGenerated]);

  // ─── Derived Data ──────────────────────
  const tierConfig = inferredTier ? BUSINESS_TIER_CONFIG[inferredTier] : null;

  const availableTemplates = useMemo(() => {
    if (!inferredTier) return [];
    return getTemplatesForTier(inferredTier);
  }, [inferredTier]);

  const bus = useMemo(() => getIntelligenceBus(), []);

  // ─── Build a rough production plan for cost estimate ────
  const costEstimate = useMemo(() => {
    if (!profile || !inferredTier) return null;
    try {
      bus.setRegion(selectedRegion || 'NAM_US');
      const plan = bus.quickPromptToPlan(description || 'Sample video production');
      return estimateProductionCost(plan);
    } catch {
      return null;
    }
  }, [profile, inferredTier, selectedRegion, description, bus]);

  // ─── Render ────────────────────────────

  return (
    <div className={cn('space-y-6', className)}>
      {/* ─── Input Section ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-violet-500" />
            Brand Intelligence Engine
          </CardTitle>
          <CardDescription>
            Describe your business in natural language. We will infer your tier, industry, audience,
            and recommend frameworks, content types, and regional adaptations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bi-description">Tell me about your business</Label>
            <Textarea
              id="bi-description"
              placeholder='e.g. "I sell samosas near the station in Mumbai" or "We provide cloud security for banks across Europe"'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bi-location">Where are you located?</Label>
              <Input
                id="bi-location"
                placeholder="e.g. Mumbai, India or Austin, TX"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bi-special">What makes you special?</Label>
              <Input
                id="bi-special"
                placeholder="e.g. Grandmother's secret recipe since 1985"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!description.trim() || isGenerating}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Intelligence Profile
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ─── Profile Results ──────────────────────────────────────────── */}
      {profile && inferredTier && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="profile" className="text-xs">
              <Building2 className="mr-1 h-3.5 w-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="frameworks" className="text-xs">
              <Target className="mr-1 h-3.5 w-3.5" />
              Frameworks
            </TabsTrigger>
            <TabsTrigger value="personas" className="text-xs">
              <Users className="mr-1 h-3.5 w-3.5" />
              Personas
            </TabsTrigger>
            <TabsTrigger value="regional" className="text-xs">
              <Globe className="mr-1 h-3.5 w-3.5" />
              Regional
            </TabsTrigger>
            <TabsTrigger value="competitive" className="text-xs">
              <BarChart3 className="mr-1 h-3.5 w-3.5" />
              Competitive
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs">
              <Lightbulb className="mr-1 h-3.5 w-3.5" />
              Content
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Business Profile Card ─── */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {profile.identity?.businessName || 'Your Business'}
                    </CardTitle>
                    <CardDescription className="text-sm mt-0.5">
                      {profile.identity?.industry || 'Industry will be inferred'}
                    </CardDescription>
                  </div>
                  <Badge className={cn('text-xs', TIER_COLORS[inferredTier])}>
                    {TIER_ICONS[inferredTier]}
                    <span className="ml-1">{tierConfig?.displayName}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Confidence */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Inference Confidence</span>
                    <span className="text-xs font-medium">{Math.round(confidence * 100)}%</span>
                  </div>
                  <Progress value={confidence * 100} className="h-2" />
                </div>

                {warnings.length > 0 && (
                  <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                    {warnings.map((w, i) => (
                      <p key={i} className="text-xs text-amber-700 dark:text-amber-300">{w}</p>
                    ))}
                  </div>
                )}

                {/* Tier Description */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tier Description</p>
                  <p className="text-sm">{tierConfig?.description}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border p-2.5 text-center">
                    <p className="text-xs text-muted-foreground">AI Model</p>
                    <p className="text-sm font-semibold mt-0.5 capitalize">{tierConfig?.aiModelTier}</p>
                  </div>
                  <div className="rounded-lg border p-2.5 text-center">
                    <p className="text-xs text-muted-foreground">Token Budget</p>
                    <p className="text-sm font-semibold mt-0.5">
                      {tierConfig ? (tierConfig.tokenBudget / 1000).toFixed(0) + 'K' : '-'}
                    </p>
                  </div>
                  <div className="rounded-lg border p-2.5 text-center">
                    <p className="text-xs text-muted-foreground">Concurrent Jobs</p>
                    <p className="text-sm font-semibold mt-0.5">{tierConfig?.maxConcurrentJobs}</p>
                  </div>
                  <div className="rounded-lg border p-2.5 text-center">
                    <p className="text-xs text-muted-foreground">Onboarding</p>
                    <p className="text-sm font-semibold mt-0.5 capitalize">
                      {tierConfig?.onboardingStyle.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Available Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tierConfig && Object.entries(tierConfig.features).map(([feature, enabled]) => (
                      <Badge
                        key={feature}
                        variant={enabled ? 'default' : 'outline'}
                        className={cn(
                          'text-xs',
                          !enabled && 'opacity-40',
                        )}
                      >
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Region & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border p-2.5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Region
                    </p>
                    <p className="text-sm font-medium mt-0.5">
                      {profile.identity?.primaryMarkets?.[0]?.replace(/_/g, ' ') || 'Not set'}
                    </p>
                  </div>
                  <div className="rounded-lg border p-2.5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Language
                    </p>
                    <p className="text-sm font-medium mt-0.5">
                      {profile.identity?.originLanguage || 'en'}
                    </p>
                  </div>
                </div>

                {/* Voice & Tone */}
                {profile.voice && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Voice & Tone</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {profile.voice.primary}
                      </Badge>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {profile.voice.secondary}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Formality: {profile.voice.formalityLevel}/5
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        Reading: {profile.voice.readingLevel}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Default Content Formats */}
                {tierConfig && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Default Content Formats</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tierConfig.defaultContentFormats.map((format) => (
                        <Badge key={format} variant="outline" className="text-xs capitalize">
                          {format.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 2: Marketing Frameworks ─── */}
          <TabsContent value="frameworks" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Marketing Frameworks
                </CardTitle>
                <CardDescription>
                  Select a strategic lens for your content. Recommended frameworks are highlighted based on your tier.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MarketingFrameworkCards
                  selectedFramework={selectedFramework}
                  businessTier={inferredTier}
                  onSelect={setSelectedFramework}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 3: Audience Personas ─── */}
          <TabsContent value="personas" className="space-y-4 mt-4">
            {profile.audience?.primaryPersonas && profile.audience.primaryPersonas.length > 0 ? (
              profile.audience.primaryPersonas.map((persona) => (
                <Card key={persona.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          {persona.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {persona.businessContext.industry} | {persona.businessContext.employeeCount} employees
                        </CardDescription>
                      </div>
                      <Badge className={cn('text-xs', TIER_COLORS[persona.tier])}>
                        {BUSINESS_TIER_CONFIG[persona.tier].displayName}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Demographics */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Demographics</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Age</p>
                          <p className="font-medium">{persona.demographics.ageRange[0]}-{persona.demographics.ageRange[1]}</p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Education</p>
                          <p className="font-medium capitalize">{persona.demographics.education}</p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Tech Savviness</p>
                          <p className="font-medium">{persona.demographics.techSavviness}/5</p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Internet</p>
                          <p className="font-medium capitalize">{persona.demographics.internetAccess.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Psychographics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Goals</p>
                        <ul className="space-y-1">
                          {persona.psychographics.goals.map((g, i) => (
                            <li key={i} className="text-xs flex items-start gap-1.5">
                              <ChevronRight className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Pain Points</p>
                        <ul className="space-y-1">
                          {persona.psychographics.painPoints.map((p, i) => (
                            <li key={i} className="text-xs flex items-start gap-1.5">
                              <ChevronRight className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Motivations & Fears */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Motivations</p>
                        <div className="flex flex-wrap gap-1">
                          {persona.psychographics.motivations.map((m, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{m}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Fears</p>
                        <div className="flex flex-wrap gap-1">
                          {persona.psychographics.fears.map((f, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Content Preferences */}
                    <Separator />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Content Preferences</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Formats</p>
                          <p className="font-medium capitalize">{persona.contentPreferences.preferredFormats.join(', ')}</p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Attention</p>
                          <p className="font-medium capitalize">{persona.contentPreferences.attentionSpan}</p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Device</p>
                          <p className="font-medium capitalize">{persona.contentPreferences.deviceType.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Channel</p>
                          <p className="font-medium">{persona.contentPreferences.bestReachChannel}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No personas generated yet. Generate a profile first with more business details.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ─── Tab 4: Regional Creative Preview ─── */}
          <TabsContent value="regional" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Regional Creative Adaptations
                </CardTitle>
                <CardDescription>
                  Preview how your content adapts to different regions — companion creatures, music, narrative style, color palettes, and more.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegionalCreativeShowcase
                  basePrompt={description || 'Create a marketing video for my business'}
                  selectedRegion={selectedRegion}
                  onRegionSelect={setSelectedRegion}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 5: Competitive Positioning ─── */}
          <TabsContent value="competitive" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Competitive Positioning
                </CardTitle>
                <CardDescription>
                  Your brand's market position, differentiators, and potential vulnerabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.marketing?.competitivePosition ? (
                  <>
                    {/* Market Position */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
                        <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {MARKET_POSITION_LABELS[profile.marketing.competitivePosition.marketPosition] ||
                            profile.marketing.competitivePosition.marketPosition}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Price Position:{' '}
                          <span className="font-medium capitalize">{profile.marketing.competitivePosition.pricePosition}</span>
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Primary Differentiator */}
                    <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3">
                      <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Primary Differentiator</p>
                      <p className="text-sm">{profile.marketing.competitivePosition.primaryDifferentiator || 'Not yet defined'}</p>
                    </div>

                    {/* Unique Advantages */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Unique Advantages</p>
                      {profile.marketing.competitivePosition.uniqueAdvantages.length > 0 ? (
                        <ul className="space-y-1.5">
                          {profile.marketing.competitivePosition.uniqueAdvantages.map((adv, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <Shield className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              {adv}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">Add more details about your business to identify advantages.</p>
                      )}
                    </div>

                    {/* Vulnerabilities */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Potential Vulnerabilities</p>
                      {profile.marketing.competitivePosition.vulnerabilities.length > 0 ? (
                        <ul className="space-y-1.5">
                          {profile.marketing.competitivePosition.vulnerabilities.map((vul, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                              {vul}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">No vulnerabilities identified.</p>
                      )}
                    </div>

                    {/* Value Proposition */}
                    {profile.marketing.valueProposition && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Value Proposition</p>
                          <div className="space-y-2">
                            {profile.marketing.valueProposition.forCustomer && (
                              <div className="rounded border p-2.5">
                                <p className="text-xs text-muted-foreground">For Customers</p>
                                <p className="text-sm mt-0.5">{profile.marketing.valueProposition.forCustomer}</p>
                              </div>
                            )}
                            {profile.marketing.valueProposition.forMarket && (
                              <div className="rounded border p-2.5">
                                <p className="text-xs text-muted-foreground">For the Market</p>
                                <p className="text-sm mt-0.5">{profile.marketing.valueProposition.forMarket}</p>
                              </div>
                            )}
                            {profile.marketing.valueProposition.uniqueness && (
                              <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-2.5">
                                <p className="text-xs text-violet-700 dark:text-violet-300 font-medium">What Makes You Unique</p>
                                <p className="text-sm mt-0.5">{profile.marketing.valueProposition.uniqueness}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Competitive data will appear once a profile is generated.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 6: Content Recommendations ─── */}
          <TabsContent value="content" className="space-y-4 mt-4">
            {/* Cost Estimate */}
            {costEstimate && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    Production Cost Estimate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Est. Tokens</p>
                      <p className="text-lg font-bold mt-0.5">{(costEstimate.tokens / 1000).toFixed(1)}K</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Est. Cost</p>
                      <p className="text-lg font-bold mt-0.5">${costEstimate.usd.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Est. Time</p>
                      <p className="text-lg font-bold mt-0.5">{costEstimate.minutes} min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Templates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Recommended Content Templates
                </CardTitle>
                <CardDescription>
                  Use-case templates available for your business tier ({tierConfig?.displayName}).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableTemplates.length > 0 ? (
                  <ScrollArea className="max-h-[500px]">
                    <div className="space-y-3">
                      {availableTemplates.map((template) => (
                        <div
                          key={template.useCase}
                          className="rounded-lg border p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-semibold">{template.name}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs capitalize shrink-0 ml-2">
                              {template.suggestedQuality}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">Scenes:</span>{' '}
                              <span className="font-medium">{template.typicalSceneCount.min}-{template.typicalSceneCount.max}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duration:</span>{' '}
                              <span className="font-medium">{template.typicalDuration.min}-{template.typicalDuration.max}s</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Mode:</span>{' '}
                              <span className="font-medium capitalize">{template.suggestedMode.replace(/_/g, ' ')}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Inputs:</span>{' '}
                              <span className="font-medium capitalize">
                                {template.suggestedInputs.slice(0, 2).join(', ')}
                                {template.suggestedInputs.length > 2 ? ` +${template.suggestedInputs.length - 2}` : ''}
                              </span>
                            </div>
                          </div>

                          {/* Scene templates preview */}
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-1.5">Scene Flow:</p>
                            <div className="flex flex-wrap gap-1">
                              {template.sceneTemplates.map((scene, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">
                                  {i + 1}. {scene.title}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Supported styles */}
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Supported Styles:</p>
                            <div className="flex flex-wrap gap-1">
                              {template.supportedStyles.slice(0, 5).map((style) => (
                                <Badge key={style} variant="outline" className="text-[10px] capitalize">
                                  {style.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                              {template.supportedStyles.length > 5 && (
                                <Badge variant="outline" className="text-[10px]">
                                  +{template.supportedStyles.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-6">
                    <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No templates available. Generate a profile first.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Strategy Summary */}
            {profile.contentStrategy && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    Content Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Primary Channels</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.contentStrategy.primaryChannels.map((ch) => (
                          <Badge key={ch} variant="secondary" className="text-xs capitalize">
                            {ch.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {profile.contentStrategy.contentFrequency.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  {profile.contentStrategy.callToAction && (
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5">Call to Action</p>
                      <p className="text-sm">{profile.contentStrategy.callToAction.primary}</p>
                      <Badge variant="outline" className="text-xs mt-1 capitalize">
                        Urgency: {profile.contentStrategy.callToAction.urgencyLevel}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
