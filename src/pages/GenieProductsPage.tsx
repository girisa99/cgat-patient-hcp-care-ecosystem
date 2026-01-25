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
    slug: 'mind',
    name: 'Genie Mind',
    tagline: 'AI Knowledge Base',
    description: 'Build intelligent knowledge bases with semantic search, RAG, and AI-powered Q&A.',
    icon: <Brain className="h-8 w-8" />,
    color: 'from-purple-500 to-indigo-600',
    features: ['Semantic Search', 'Document Q&A', 'Knowledge Graphs', 'Auto-categorization'],
    pipelines: 12,
  },
  {
    slug: 'spark',
    name: 'Genie Spark',
    tagline: 'AI Script Generation',
    description: 'Generate scripts, outlines, and structured content with intelligent AI assistance.',
    icon: <Sparkles className="h-8 w-8" />,
    color: 'from-amber-500 to-orange-600',
    features: ['Script Writing', 'Content Outlines', 'Story Structures', 'Multi-format Export'],
    pipelines: 18,
  },
  {
    slug: 'vibe',
    name: 'Genie Vibe',
    tagline: 'AI Recording Studio',
    description: 'Record, transcribe, clone voices, and transform audio/video with AI enhancement.',
    icon: <Mic className="h-8 w-8" />,
    color: 'from-green-500 to-emerald-600',
    features: ['Voice Cloning', 'Transcription', 'Audio Enhancement', 'Podcast Production'],
    pipelines: 22,
  },
  {
    slug: 'deck',
    name: 'Genie Deck',
    tagline: 'AI Presentation Builder',
    description: 'Create stunning presentations with AI-generated slides, visuals, and animations.',
    icon: <Presentation className="h-8 w-8" />,
    color: 'from-blue-500 to-cyan-600',
    features: ['Slide Generation', 'Visual Design', 'Animations', 'Multi-language'],
    pipelines: 25,
  },
  {
    slug: 'arc',
    name: 'Genie Arc',
    tagline: 'AI Production Hub',
    description: 'Orchestrate complex multi-modal content production with 119+ pipelines.',
    icon: <Orbit className="h-8 w-8" />,
    color: 'from-rose-500 to-pink-600',
    features: ['Video Production', 'Avatar Generation', '3D Assets', 'Multi-modal Workflows'],
    pipelines: 35,
  },
  {
    slug: 'studio',
    name: 'Genie Studio',
    tagline: 'Complete Creative Suite',
    description: 'The full Genie experience: all tools, all pipelines, unlimited possibilities.',
    icon: <Layers className="h-8 w-8" />,
    color: 'from-violet-500 to-purple-600',
    features: ['All Products', 'Priority Support', 'Team Collaboration', 'API Access'],
    pipelines: 119,
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
            6 Products • 119+ Pipelines • 70+ Languages
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            The Complete AI Creative Suite
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From idea to multi-modal content in minutes. Choose individual tools 
            or get the full Studio experience.
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
