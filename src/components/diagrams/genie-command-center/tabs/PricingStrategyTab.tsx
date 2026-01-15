/**
 * Genie Command Center - Pricing Strategy Tab
 * Interactive pricing explorer with calculator and segment analysis
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calculator, Users, Layers, DollarSign, Sparkles,
  Check, X, TrendingUp, Zap, Crown, Gift, Building,
  Heart, GraduationCap, Plane, Camera, BookOpen,
  Smartphone, ChevronRight, Target, BarChart3
} from 'lucide-react';
import {
  segmentPricingProfiles,
  pricingModels,
  productModules,
  pricingPermutations,
  pricingRecommendations,
  segmentBundles,
  aiModelTokenInfo,
  ttsVoiceInfo,
  type SegmentPricingProfile,
  type PricingPermutation,
} from '../data/pricing-options-data';

// Mobile app specific pricing
const mobileAppPricing = {
  freemium: {
    name: 'Free',
    price: 0,
    features: [
      '3 videos/month',
      'Basic editing',
      '720p export',
      'Watermark',
      '5 TTS voices',
      'Offline recording',
    ],
    limitations: ['Watermark', '3 exports/mo', '720p max'],
  },
  pro: {
    name: 'Mobile Pro',
    price: 4.99,
    features: [
      'Unlimited videos',
      'Full editing suite',
      '4K export',
      'No watermark',
      'All TTS voices',
      'Cloud sync',
      'Location Story Mode',
      'Quick Templates',
    ],
    limitations: [],
  },
  bundle: {
    name: 'Desktop + Mobile',
    price: 12.99,
    savings: '$2/mo',
    description: 'Full access on all platforms',
  },
};

// Segment icons mapping
const segmentIcons: Record<string, React.ReactNode> = {
  creator: <Camera className="w-5 h-5" />,
  influencer: <Users className="w-5 h-5" />,
  knowledge: <BookOpen className="w-5 h-5" />,
  traveler: <Plane className="w-5 h-5" />,
  smb: <Building className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  healthcare: <Heart className="w-5 h-5" />,
  enterprise: <Crown className="w-5 h-5" />,
};

// Calculator Component
const PricingCalculator: React.FC = () => {
  const [scriptsPerMonth, setScriptsPerMonth] = useState(50);
  const [ttsMinutes, setTtsMinutes] = useState(30);
  const [teamMembers, setTeamMembers] = useState(1);
  const [selectedSegment, setSelectedSegment] = useState('creator');
  const [needsHIPAA, setNeedsHIPAA] = useState(false);
  const [needsAPI, setNeedsAPI] = useState(false);
  const [includeMobile, setIncludeMobile] = useState(false);

  const recommendedTier = useMemo(() => {
    let tier = 'starter';
    let price = 9.99;
    let reasoning = [];

    if (needsHIPAA) {
      tier = 'healthcare';
      price = 49.99;
      reasoning.push('HIPAA compliance required');
    } else if (teamMembers > 5 || needsAPI) {
      tier = 'pro';
      price = 79.99;
      reasoning.push(teamMembers > 5 ? `${teamMembers} team members` : 'API access needed');
    } else if (scriptsPerMonth > 100 || teamMembers > 1) {
      tier = 'business';
      price = 29.99;
      reasoning.push(scriptsPerMonth > 100 ? 'High script volume' : 'Team collaboration');
    } else {
      reasoning.push('Best for individual creators');
    }

    if (includeMobile) {
      price += 2.99; // Bundle discount
      reasoning.push('Mobile app included');
    }

    const monthlyCost = price;
    const yearlyCost = price * 10; // 2 months free
    const yearlySavings = price * 2;

    return { tier, price: monthlyCost, yearly: yearlyCost, savings: yearlySavings, reasoning };
  }, [scriptsPerMonth, ttsMinutes, teamMembers, needsHIPAA, needsAPI, includeMobile]);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Interactive Pricing Calculator
        </CardTitle>
        <CardDescription>
          Tell us about your needs and we'll recommend the perfect plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Scripts per month</span>
              <Badge variant="secondary">{scriptsPerMonth}</Badge>
            </Label>
            <Slider
              value={[scriptsPerMonth]}
              onValueChange={(v) => setScriptsPerMonth(v[0])}
              min={5}
              max={500}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">AI-generated video scripts</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>TTS Minutes</span>
              <Badge variant="secondary">{ttsMinutes}</Badge>
            </Label>
            <Slider
              value={[ttsMinutes]}
              onValueChange={(v) => setTtsMinutes(v[0])}
              min={5}
              max={300}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Text-to-speech narration</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center justify-between">
              <span>Team Members</span>
              <Badge variant="secondary">{teamMembers}</Badge>
            </Label>
            <Slider
              value={[teamMembers]}
              onValueChange={(v) => setTeamMembers(v[0])}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Collaborative workspace</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="hipaa" checked={needsHIPAA} onCheckedChange={setNeedsHIPAA} />
            <Label htmlFor="hipaa" className="text-sm">HIPAA Compliance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="api" checked={needsAPI} onCheckedChange={setNeedsAPI} />
            <Label htmlFor="api" className="text-sm">API Access</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="mobile" checked={includeMobile} onCheckedChange={setIncludeMobile} />
            <Label htmlFor="mobile" className="text-sm flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> Mobile App
            </Label>
          </div>
        </div>

        {/* Recommendation */}
        <motion.div
          key={recommendedTier.tier}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Recommended Plan</p>
              <h3 className="text-2xl font-bold text-foreground capitalize">{recommendedTier.tier}</h3>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">${recommendedTier.price.toFixed(2)}<span className="text-sm text-muted-foreground">/mo</span></p>
              <p className="text-sm text-muted-foreground">or ${recommendedTier.yearly.toFixed(2)}/yr (save ${recommendedTier.savings.toFixed(2)})</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedTier.reasoning.map((reason, idx) => (
              <Badge key={idx} variant="outline" className="bg-background">
                <Check className="w-3 h-3 mr-1 text-green-500" />
                {reason}
              </Badge>
            ))}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

// Segment Profile Card
const SegmentProfileCard: React.FC<{ segment: SegmentPricingProfile }> = ({ segment }) => {
  const bundle = segmentBundles.find(b => b.segment === segment.id);
  
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {segmentIcons[segment.id] || <Users className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {segment.name}
              <Badge variant={segment.priority === 'P0' ? 'default' : segment.priority === 'P1' ? 'secondary' : 'outline'}>
                {segment.priority}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">{segment.marketSize}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50 italic text-sm">
          "{segment.voiceOfCustomer}"
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Current Spend</p>
            <p className="font-medium">{segment.currentSpend}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Price Threshold</p>
            <p className="font-medium">{segment.priceThreshold}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Competitors</p>
            <p className="font-medium text-xs">{segment.competitorPrice}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Decision Maker</p>
            <p className="font-medium">{segment.decisionMaker}</p>
          </div>
        </div>

        {bundle && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{bundle.bundleName}</span>
              <Badge variant="default" className="bg-green-600">{bundle.price}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{bundle.valueProposition}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{bundle.competitorSavings}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Pricing Model Comparison Card
const PricingModelCard: React.FC<{ model: typeof pricingModels[0] }> = ({ model }) => (
  <Card className="h-full">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">{model.name}</CardTitle>
        <Badge variant={model.complexity === 'Low' ? 'secondary' : model.complexity === 'Medium' ? 'outline' : 'destructive'}>
          {model.complexity} Complexity
        </Badge>
      </div>
      <CardDescription>{model.description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="p-2 rounded bg-muted/50 font-mono text-sm">{model.example}</div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-green-600 mb-2">Pros</p>
          <ul className="space-y-1">
            {model.pros.slice(0, 3).map((pro, idx) => (
              <li key={idx} className="text-xs flex items-start gap-1">
                <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-red-600 mb-2">Cons</p>
          <ul className="space-y-1">
            {model.cons.slice(0, 3).map((con, idx) => (
              <li key={idx} className="text-xs flex items-start gap-1">
                <X className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {model.bestFor.map((segment, idx) => (
          <Badge key={idx} variant="outline" className="text-xs">{segment}</Badge>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Mobile App Pricing Section
const MobileAppPricingSection: React.FC = () => (
  <Card className="border-2 border-primary/30">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Smartphone className="w-5 h-5 text-primary" />
        Mobile App Pricing Strategy
      </CardTitle>
      <CardDescription>
        iOS & Android app pricing - standalone or bundled with desktop
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Free Tier */}
        <div className="p-4 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold">{mobileAppPricing.freemium.name}</h4>
          </div>
          <p className="text-2xl font-bold text-foreground mb-4">Free</p>
          <ul className="space-y-2">
            {mobileAppPricing.freemium.features.map((f, idx) => (
              <li key={idx} className="text-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-4 p-2 rounded bg-amber-100 dark:bg-amber-950/30">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Limitations: {mobileAppPricing.freemium.limitations.join(', ')}
            </p>
          </div>
        </div>

        {/* Pro Tier */}
        <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 relative">
          <Badge className="absolute -top-2 right-4">Popular</Badge>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">{mobileAppPricing.pro.name}</h4>
          </div>
          <p className="text-2xl font-bold text-primary mb-4">
            ${mobileAppPricing.pro.price}<span className="text-sm text-muted-foreground">/mo</span>
          </p>
          <ul className="space-y-2">
            {mobileAppPricing.pro.features.map((f, idx) => (
              <li key={idx} className="text-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Bundle */}
        <div className="p-4 rounded-xl border bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-amber-500" />
            <h4 className="font-semibold">{mobileAppPricing.bundle.name}</h4>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            ${mobileAppPricing.bundle.price}<span className="text-sm text-muted-foreground">/mo</span>
          </p>
          <Badge variant="secondary" className="mb-4">Save {mobileAppPricing.bundle.savings}</Badge>
          <p className="text-sm text-muted-foreground">{mobileAppPricing.bundle.description}</p>
          <ul className="space-y-2 mt-4">
            <li className="text-sm flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Full desktop access
            </li>
            <li className="text-sm flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Full mobile access
            </li>
            <li className="text-sm flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Cross-device sync
            </li>
            <li className="text-sm flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Cloud projects
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-muted/50">
        <h5 className="font-medium mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Mobile App Target Segments
        </h5>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <Plane className="w-3 h-3 mr-1" /> Travelers (P1)
          </Badge>
          <Badge variant="outline">
            <Camera className="w-3 h-3 mr-1" /> Creators (P0)
          </Badge>
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" /> Influencers (P0)
          </Badge>
          <Badge variant="outline">
            <BookOpen className="w-3 h-3 mr-1" /> Knowledge Sharers (P0)
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Mobile-first users who need quick content creation on-the-go. 
          Travelers especially benefit from Location Story Mode and offline recording.
        </p>
      </div>
    </CardContent>
  </Card>
);

// Main Tab Component
export const PricingStrategyTab: React.FC = () => {
  const [subTab, setSubTab] = useState('calculator');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            Pricing Strategy & Permutations
          </h2>
          <p className="text-muted-foreground mt-1">
            8 segments • 6 pricing models • Interactive calculator
          </p>
        </div>
        <div className="flex gap-2">
          {pricingRecommendations.slice(0, 2).map((rec, idx) => (
            <Badge key={idx} variant={idx === 0 ? 'default' : 'secondary'}>
              #{rec.priority}: {rec.option.split(':')[0]}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Sub-tabs */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="calculator" className="flex items-center gap-1">
            <Calculator className="w-4 h-4" /> Calculator
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center gap-1">
            <Users className="w-4 h-4" /> Segments
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-1">
            <Layers className="w-4 h-4" /> Models
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-1">
            <Smartphone className="w-4 h-4" /> Mobile
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" /> Compare
          </TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="mt-6">
          <PricingCalculator />
          
          {/* AI Cost Transparency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Model Costs (Transparency)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {aiModelTokenInfo.map((model, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{model.provider} {model.model}</span>
                          <Badge variant="outline" className="text-xs">{model.contextWindow}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <span>Input: {model.inputCostPer1K}/1K</span>
                          <span>Output: {model.outputCostPer1K}/1K</span>
                        </div>
                        <p className="text-xs mt-1">{model.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🎙️ TTS Voice Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {ttsVoiceInfo.map((tts, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{tts.provider}</span>
                          <Badge variant={
                            tts.quality === 'Ultra' ? 'default' : 
                            tts.quality === 'Premium' ? 'secondary' : 'outline'
                          }>{tts.quality}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <span>{tts.voiceCount} voices</span>
                          <span>{tts.languages} languages</span>
                          <span>{tts.costPerMinute}/min</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tts.tierAvailability.slice(0, 3).map((tier, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{tier}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {segmentPricingProfiles.map((segment) => (
              <SegmentProfileCard key={segment.id} segment={segment} />
            ))}
          </div>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingModels.map((model) => (
              <PricingModelCard key={model.id} model={model} />
            ))}
          </div>
        </TabsContent>

        {/* Mobile Tab */}
        <TabsContent value="mobile" className="mt-6">
          <MobileAppPricingSection />
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="mt-6">
          <div className="space-y-6">
            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Strategic Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pricingRecommendations.map((rec) => (
                    <div 
                      key={rec.priority} 
                      className={`p-4 rounded-lg border ${
                        rec.priority === 1 ? 'border-primary bg-primary/5' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={rec.priority === 1 ? 'default' : 'secondary'}>
                            #{rec.priority}
                          </Badge>
                          <h4 className="font-semibold">{rec.option}</h4>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{rec.implementationComplexity} Complexity</Badge>
                          <Badge variant="outline">{rec.timeToMarket}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Permutation Overview */}
            <Card>
              <CardHeader>
                <CardTitle>All Pricing Permutations</CardTitle>
                <CardDescription>6 different pricing models analyzed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pricingPermutations.map((perm) => (
                    <div 
                      key={perm.id}
                      className={`p-4 rounded-lg border ${
                        perm.recommendation === 'Strong' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
                        perm.recommendation === 'Medium' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' :
                        'border-red-500 bg-red-50 dark:bg-red-950/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{perm.name}</h4>
                        <Badge variant={
                          perm.recommendation === 'Strong' ? 'default' :
                          perm.recommendation === 'Medium' ? 'secondary' : 'destructive'
                        }>{perm.recommendation}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{perm.structure}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span>Conversion: {perm.estimatedConversion}</span>
                        <span>{perm.tiers.length} tiers</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingStrategyTab;
