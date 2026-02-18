/**
 * GENIE PRODUCTS INDEX PAGE
 * L-201: Product catalog with correct routes + "Try It" CTAs
 * Tier names aligned with genieStudioNavItems.ts (H-203)
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Sparkles, 
  Mic, 
  Presentation, 
  Orbit,
  Layers,
  ArrowRight,
  Check,
  ExternalLink
} from 'lucide-react';

interface ProductInfo {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgClass: string;
  features: string[];
  pipelines: number;
  /** Route to live product — null until Claude signals H-201 ready */
  liveRoute: string | null;
  /** Badge shown on the card */
  status: 'live' | 'coming-soon' | 'beta';
}

const PRODUCTS: ProductInfo[] = [
  {
    slug: 'spark',
    name: 'Genie Spark',
    tagline: 'Ignite your Ideas',
    description: 'Generate scripts from any input — Documents, PPT, Video, Audio, URL, Image.',
    icon: <Sparkles className="h-8 w-8" />,
    color: 'from-amber-500 to-orange-600',
    bgClass: 'bg-gradient-to-br from-amber-500 to-orange-600',
    features: ['Script Writing', 'Content Outlines', 'Story Structures', 'Multi-format Export'],
    pipelines: 18,
    liveRoute: '/genie-spark',
    status: 'live',
  },
  {
    slug: 'mind',
    name: 'Genie Mind',
    // Source of truth: GENIE_PRODUCTS.mind.tagline = "AI That Understands" (SIC-102)
    tagline: 'AI That Understands',
    description: 'Edit and enhance scripts with AI. Add TTS voiceovers, voice cloning, and music.',
    icon: <Brain className="h-8 w-8" />,
    color: 'from-blue-500 to-cyan-600',
    bgClass: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    features: ['AI Script Editing', 'Text-to-Speech', 'Voice Cloning', 'AI Music'],
    pipelines: 12,
    liveRoute: '/genie-mind',
    status: 'live',
  },
  {
    slug: 'deck',
    name: 'Genie Deck',
    tagline: 'Ideas to Impact',
    description: 'Create stunning presentations with AI-generated slides, visuals, and animations.',
    icon: <Presentation className="h-8 w-8" />,
    color: 'from-purple-500 to-violet-600',
    bgClass: 'bg-gradient-to-br from-purple-500 to-violet-600',
    features: ['Slide Generation', 'Visual Design', 'Animations', 'Multi-language'],
    pipelines: 25,
    // H-201: Soft gate — CTA renders now, verified once Claude sets H-201 ready
    liveRoute: '/genie-deck',
    status: 'live',
  },
  {
    slug: 'vibe',
    name: 'Genie Vibe',
    tagline: 'Script to Screen',
    description: 'Full audio and video production hub. Record, trim, stitch, dub, and publish.',
    icon: <Mic className="h-8 w-8" />,
    color: 'from-green-500 to-emerald-600',
    bgClass: 'bg-gradient-to-br from-green-500 to-emerald-600',
    features: ['Video Production', 'Podcast Recording', 'Dubbing & Lip-sync', 'Avatar Video'],
    pipelines: 22,
    liveRoute: null,
    status: 'coming-soon',
  },
  {
    slug: 'hub',
    name: 'Genie Hub',
    tagline: 'Your Creative Command Center',
    description: 'Enterprise production hub for scheduling, Kanban, team collaboration, and asset management.',
    icon: <Orbit className="h-8 w-8" />,
    color: 'from-emerald-500 to-teal-600',
    bgClass: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    features: ['Project Scheduling', 'Kanban Boards', 'Asset Library', 'Review Workflows'],
    pipelines: 35,
    liveRoute: null,
    status: 'coming-soon',
  },
  {
    slug: 'cast',
    name: 'Genie Cast',
    tagline: 'Make It. Show It. Scale It.',
    description: 'Global distribution and marketing engine. Multi-platform publishing and analytics.',
    icon: <Layers className="h-8 w-8" />,
    color: 'from-pink-500 to-rose-600',
    bgClass: 'bg-gradient-to-br from-pink-500 to-rose-600',
    features: ['Multi-platform Publishing', '14-Region Localization', 'Automated Scheduling', 'Analytics'],
    pipelines: 30,
    liveRoute: null,
    status: 'coming-soon',
  },
];

const STATUS_BADGE: Record<ProductInfo['status'], { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  'live':         { label: 'Live',         variant: 'default' },
  'beta':         { label: 'Beta',         variant: 'secondary' },
  'coming-soon':  { label: 'Coming Soon',  variant: 'outline' },
};

const GenieProductsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-6xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            6 Products • 142+ Pipelines • 50+ Languages
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            The Complete Genie Suite
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From idea to multi-modal content in minutes. Mind to Media — 
            choose individual tools or get the full suite.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {PRODUCTS.map((product) => {
            const statusBadge = STATUS_BADGE[product.status];
            const isLive = product.status === 'live' && product.liveRoute;

            return (
              <Card
                key={product.slug}
                className="group flex flex-col transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl ${product.bgClass} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {product.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <Badge variant={statusBadge.variant} className="text-xs">
                      {statusBadge.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {product.pipelines} pipelines
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-primary">{product.tagline}</p>
                  <CardDescription className="mt-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 justify-between">
                  <ul className="space-y-2 mb-4">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-2 mt-2">
                    {isLive ? (
                      <Button
                        className="flex-1"
                        onClick={() => navigate(product.liveRoute!)}
                      >
                        Try {product.name.split(' ')[1]}
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button variant="outline" className="flex-1" disabled>
                        Coming Soon
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/products/${product.slug}`)}
                      title="Learn more"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Not sure which product is right for you?
          </p>
          <Button size="lg" onClick={() => navigate('/explore')}>
            Take the Interactive Quiz
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenieProductsPage;
