import React from 'react';
import { SubscriptionProvider, SubscriptionStatus } from '@/components/subscription';
import { EnhancedPricingSection } from '@/components/subscription/EnhancedPricingSection';
import { HorizontalProductShowcase } from '@/components/subscription/HorizontalProductShowcase';
import { GenieStudioLayout } from '@/components/layout/GenieStudioLayout';
import { CreditCard, TrendingUp, Users, Zap, Shield, Package, Sparkles, Check, Play, Brain, Mic, Film, Target, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import suite logo
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

const SubscriptionPage = () => {
  const keyDifferentiators = [
    { icon: <Brain className="h-4 w-4" />, text: 'Mind → Media Pipeline', desc: 'Full pre-to-post workflow' },
    { icon: <Shield className="h-4 w-4" />, text: 'HIPAA Compliant', desc: 'Healthcare-ready under $100/mo' },
    { icon: <Mic className="h-4 w-4" />, text: 'AI Voice Cloning', desc: 'ElevenLabs integration' },
    { icon: <Target className="h-4 w-4" />, text: '6 Industries', desc: 'Creator to Enterprise' },
  ];

  return (
    <SubscriptionProvider>
      <GenieStudioLayout variant="topbar">
        <div className="min-h-screen">
          {/* Enhanced Hero Header */}
          <div className="relative border-b border-border/50 bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="relative container mx-auto py-8 px-4 sm:px-6 lg:px-8">
              {/* Top Row: Logo + Badge */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <img 
                    src={genieSuiteLogo} 
                    alt="Genie Suite" 
                    className="h-12 w-auto"
                  />
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-amber-500 bg-clip-text text-transparent">
                      Genie Suite
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      AI-Powered Content Creation Platform
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    New Features
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <CreditCard className="h-3 w-3" />
                    Plans & Pricing
                  </Badge>
                </div>
              </div>
              
              {/* Value Proposition Banner */}
              <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-amber-500/10 rounded-xl p-4 border border-primary/20 mb-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  <div className="text-center lg:text-left">
                    <h2 className="text-lg font-semibold text-foreground">
                      From Idea to Published Video in Minutes
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      The only platform that combines AI knowledge, script generation, voice synthesis, and video production
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {keyDifferentiators.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-background/80 rounded-full border border-border text-xs">
                        <span className="text-primary">{item.icon}</span>
                        <span className="font-medium text-foreground">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-lg bg-background/50 border border-border">
                  <div className="text-2xl font-bold text-primary">$11B+</div>
                  <div className="text-xs text-muted-foreground">TAM Opportunity</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50 border border-border">
                  <div className="text-2xl font-bold text-purple-500">6</div>
                  <div className="text-xs text-muted-foreground">Industry Segments</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50 border border-border">
                  <div className="text-2xl font-bold text-amber-500">5</div>
                  <div className="text-xs text-muted-foreground">Integrated Products</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50 border border-border">
                  <div className="text-2xl font-bold text-emerald-500">&lt;$80</div>
                  <div className="text-xs text-muted-foreground">Full Suite/Month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Sequential Layout */}
          <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-10">
            
            {/* Section 0: Why Genie - Competitive Advantages */}
            <section className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Why Choose Genie Suite?</h2>
                <p className="text-sm text-muted-foreground">What sets us apart from competitors</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                <CompetitiveAdvantageCard
                  title="All-in-One Pipeline"
                  description="Unlike Loom or Descript, we offer end-to-end: from knowledge extraction to published video"
                  vsCompetitor="vs. Loom, Descript"
                  advantage="Mind → Spark → Vibe → Publish"
                  icon={<Film className="h-5 w-5" />}
                />
                <CompetitiveAdvantageCard
                  title="HIPAA Under $100/mo"
                  description="Healthcare compliance at a fraction of enterprise pricing"
                  vsCompetitor="vs. Synthesia ($600+)"
                  advantage="Pro plan includes full compliance"
                  icon={<Shield className="h-5 w-5" />}
                />
                <CompetitiveAdvantageCard
                  title="AI Voice Cloning"
                  description="Create content with your own cloned voice, not generic TTS"
                  vsCompetitor="vs. CapCut, Canva"
                  advantage="ElevenLabs integration included"
                  icon={<Mic className="h-5 w-5" />}
                />
                <CompetitiveAdvantageCard
                  title="6 Industry Templates"
                  description="Purpose-built for Creators, Education, Healthcare, Enterprise & more"
                  vsCompetitor="vs. Generic tools"
                  advantage="Segment-specific workflows"
                  icon={<Target className="h-5 w-5" />}
                />
                <CompetitiveAdvantageCard
                  title="Knowledge-Powered AI"
                  description="RAG-enabled agents that understand your documents and brand"
                  vsCompetitor="vs. Standalone chatbots"
                  advantage="Genie Mind semantic search"
                  icon={<Brain className="h-5 w-5" />}
                />
                <CompetitiveAdvantageCard
                  title="Team Collaboration"
                  description="Multi-guest sessions, approval workflows, and production hub"
                  vsCompetitor="vs. Solo creator tools"
                  advantage="Genie Hub"
                  icon={<Users className="h-5 w-5" />}
                />
              </div>
            </section>

            {/* Section 1: Complete Genie Suite - Horizontal Scroll */}
            <section>
              <HorizontalProductShowcase />
            </section>

            {/* Section 2: Subscription Plans */}
            <section>
              <EnhancedPricingSection />
            </section>

            {/* Section 3: Current Status & Usage */}
            <section className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Your Subscription</h2>
                <p className="text-sm text-muted-foreground">Current plan status and usage metrics</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {/* Subscription Status */}
                <div>
                  <SubscriptionStatus />
                </div>
                
                {/* Account Segment */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <SegmentBadge 
                        label="Account Type" 
                        value="Healthcare Professional" 
                        icon={<Shield className="h-4 w-4" />}
                      />
                      <SegmentBadge 
                        label="Organization" 
                        value="Individual" 
                        icon={<Users className="h-4 w-4" />}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subscription tier determines feature access. Segments customize your experience.
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Usage Metrics */}
              <div className="max-w-5xl mx-auto">
                <h3 className="text-lg font-semibold text-foreground mb-4">Usage Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <UsageMetric 
                    title="API Calls" 
                    used={2847} 
                    limit={10000} 
                    icon={<Zap className="h-4 w-4" />}
                    color="blue"
                  />
                  <UsageMetric 
                    title="Storage" 
                    used={12.5} 
                    limit={50} 
                    icon={<Package className="h-4 w-4" />}
                    unit="GB"
                    color="purple"
                  />
                  <UsageMetric 
                    title="Agents" 
                    used={8} 
                    limit={25} 
                    icon={<Users className="h-4 w-4" />}
                    color="amber"
                  />
                  <UsageMetric 
                    title="Documents" 
                    used={1250} 
                    limit={10000}
                    icon={<TrendingUp className="h-4 w-4" />}
                    color="emerald"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </GenieStudioLayout>
    </SubscriptionProvider>
  );
};

// Segment Badge Component
interface SegmentBadgeProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const SegmentBadge = ({ label, value, icon }: SegmentBadgeProps) => (
  <div className="p-3 rounded-lg bg-muted/50 border border-border">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

// Competitive Advantage Card Component
interface CompetitiveAdvantageCardProps {
  title: string;
  description: string;
  vsCompetitor: string;
  advantage: string;
  icon: React.ReactNode;
}

const CompetitiveAdvantageCard = ({ title, description, vsCompetitor, advantage, icon }: CompetitiveAdvantageCardProps) => (
  <Card className="border-border hover:border-primary/30 transition-colors">
    <CardContent className="pt-4 pb-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
        <div className="space-y-1.5">
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className="text-[10px] py-0.5 text-muted-foreground">
              {vsCompetitor}
            </Badge>
            <Badge className="text-[10px] py-0.5 bg-primary/10 text-primary border-primary/20">
              {advantage}
            </Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Usage Metric Component
interface UsageMetricProps {
  title: string;
  used: number;
  limit: number;
  icon: React.ReactNode;
  unit?: string;
  color: 'blue' | 'purple' | 'amber' | 'emerald';
}

const UsageMetric = ({ title, used, limit, icon, unit = '', color }: UsageMetricProps) => {
  const percentage = Math.round((used / limit) * 100);
  
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10'
  };

  const progressColors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500'
  };

  return (
    <Card className="border-border">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className={cn("p-1.5 rounded-md", colorClasses[color])}>
            {icon}
          </div>
          <span className="text-xs text-muted-foreground">{percentage}%</span>
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500", progressColors[color])}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{used.toLocaleString()}{unit ? ` ${unit}` : ''}</span>
            <span>{limit.toLocaleString()}{unit ? ` ${unit}` : ''}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPage;
