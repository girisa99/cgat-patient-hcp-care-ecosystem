/**
 * GENIE PRODUCTS INDEX PAGE
 * Overview of all Genie products with navigation to individual product pages
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
  Check
} from 'lucide-react';

interface ProductInfo {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  pipelines: number;
}

const PRODUCTS: ProductInfo[] = [
  {
    slug: 'spark',
    name: 'Genie Spark',
    tagline: 'Ignite your Ideas',
    description: 'Generate scripts from any input - Documents, PPT, Video, Audio, URL, Image.',
    icon: <Sparkles className="h-8 w-8" />,
    color: 'from-amber-500 to-orange-600',
    features: ['Script Writing', 'Content Outlines', 'Story Structures', 'Multi-format Export'],
    pipelines: 18,
  },
  {
    slug: 'mind',
    name: 'Genie Mind',
    tagline: 'AI That Understands',
    description: 'Edit and enhance scripts with AI. Add TTS voiceovers, voice cloning, and music.',
    icon: <Brain className="h-8 w-8" />,
    color: 'from-blue-500 to-cyan-600',
    features: ['AI Script Editing', 'Text-to-Speech', 'Voice Cloning', 'AI Music'],
    pipelines: 12,
  },
  {
    slug: 'vibe',
    name: 'Genie Vibe',
    tagline: 'Script to Screen',
    description: 'Full audio and video production hub. Record, trim, stitch, dub, and publish.',
    icon: <Mic className="h-8 w-8" />,
    color: 'from-green-500 to-emerald-600',
    features: ['Video Production', 'Podcast Recording', 'Dubbing & Lip-sync', 'Avatar Video'],
    pipelines: 22,
  },
  {
    slug: 'deck',
    name: 'Genie Deck',
    tagline: 'Ideas to Impact',
    description: 'Create stunning presentations with AI-generated slides, visuals, and animations.',
    icon: <Presentation className="h-8 w-8" />,
    color: 'from-purple-500 to-violet-600',
    features: ['Slide Generation', 'Visual Design', 'Animations', 'Multi-language'],
    pipelines: 25,
  },
  {
    slug: 'hub',
    name: 'Genie Hub',
    tagline: 'Your Creative Command Center',
    description: 'Enterprise production hub for scheduling, Kanban, team collaboration, and asset management.',
    icon: <Orbit className="h-8 w-8" />,
    color: 'from-emerald-500 to-teal-600',
    features: ['Project Scheduling', 'Kanban Boards', 'Asset Library', 'Review Workflows'],
    pipelines: 35,
  },
  {
    slug: 'cast',
    name: 'Genie Cast',
    tagline: 'Make It. Show It. Scale It.',
    description: 'Global distribution and marketing engine. Multi-platform publishing and analytics.',
    icon: <Layers className="h-8 w-8" />,
    color: 'from-pink-500 to-rose-600',
    features: ['Multi-platform Publishing', '14-Region Localization', 'Automated Scheduling', 'Analytics'],
    pipelines: 30,
  },
];

const GenieProductsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="container max-w-6xl py-12">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            7 Products • 206+ Pipelines • 140+ Languages
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
          {PRODUCTS.map((product) => (
            <Card 
              key={product.slug}
              className="group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
              onClick={() => navigate(`/products/${product.slug}`)}
            >
              <CardHeader>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {product.icon}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {product.pipelines} pipelines
                  </Badge>
                </div>
                <p className="text-sm font-medium text-primary">{product.tagline}</p>
                <CardDescription className="mt-2">{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Learn More <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
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
