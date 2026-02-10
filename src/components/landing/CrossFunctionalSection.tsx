/**
 * CROSS-FUNCTIONAL CAPABILITIES SECTION
 * Shows 25+ cross-functional AI capabilities — positioned as unique platform strengths
 */
import React, { useState } from 'react';
import { 
  User, 
  Box, 
  Mic2, 
  Languages, 
  Video,
  Sparkles,
  Layers,
  Wand2,
  Music,
  Image,
  FileText,
  BarChart3,
  Play,
  ArrowRight,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const CAPABILITIES = [
  {
    category: 'Avatar & Characters',
    items: [
      { name: 'AI Avatar', icon: User, tier: 'Pro', desc: 'Photorealistic digital presenters that represent your brand across every market' },
      { name: 'Full-Body Avatar', icon: User, tier: 'Enterprise', desc: 'Complete body motion capture — your global spokesperson, available 24/7' },
      { name: 'Lip-Sync', icon: Mic2, tier: 'Pro', desc: 'Pixel-perfect mouth sync across 140+ languages — your avatar speaks natively' },
    ]
  },
  {
    category: '3D & Immersive',
    items: [
      { name: 'Text-to-3D', icon: Box, tier: 'Pro', desc: 'Turn product descriptions into interactive 3D models in minutes' },
      { name: 'Image-to-3D', icon: Box, tier: 'Pro', desc: 'Transform flat images into rotating 3D assets for any platform' },
      { name: 'AR/VR Export', icon: Layers, tier: 'Enterprise', desc: 'Deploy immersive experiences directly to AR/VR channels' },
    ]
  },
  {
    category: 'Audio & Voice',
    items: [
      { name: 'Voice Clone', icon: Mic2, tier: 'Pro', desc: 'Your brand voice, cloned and ready for every language and region' },
      { name: 'Music Generation', icon: Music, tier: 'Creator', desc: 'Original AI-composed scores tailored to your content mood' },
      { name: 'Sound Effects', icon: Music, tier: 'Creator', desc: 'Contextual SFX that match your scenes automatically' },
    ]
  },
  {
    category: 'Visual & Animation',
    items: [
      { name: 'Image Generation', icon: Image, tier: 'Free', desc: 'Studio-quality visuals generated from text — no stock photos needed' },
      { name: 'Animation', icon: Sparkles, tier: 'Creator', desc: 'Bring static assets to life with AI-driven motion' },
      { name: 'Video Generation', icon: Video, tier: 'Pro', desc: 'Script-to-screen video production with one click' },
    ]
  },
];

const VALUE_PROPOSITIONS = [
  {
    name: 'One Brand Voice, Every Language',
    description: 'Produce content once — Genie transcreates it for 140+ languages while keeping your brand tone consistent.',
    steps: ['Your Script', 'AI Transcreation', 'Regional TTS', 'Lip-Synced Video'],
    icon: Globe,
  },
  {
    name: 'From Idea to Global Distribution',
    description: 'Go from concept to published, multi-regional content without hiring agencies or freelancers.',
    steps: ['Genie Spark', 'Genie Vibe', 'Genie Cast', 'Global Publish'],
    icon: Zap,
  },
  {
    name: 'Enterprise-Grade, Creator-Simple',
    description: 'Built for compliance-heavy industries with SOC 2 readiness, HIPAA awareness, and GDPR support.',
    steps: ['Compliance Check', 'Brand Guard', 'Auto QA', 'Secure Delivery'],
    icon: Shield,
  },
];

export const CrossFunctionalSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(CAPABILITIES[0].category);

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-primary/5" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Strong branded header */}
        <div className="text-center mb-4">
          <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            Genie Suite Platform
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Everything You Need. Nothing You Don't.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            25+ production capabilities under one roof — <span className="text-primary font-bold">no plugins, no third-party tools, no hidden costs</span>.
            Just create, produce, and publish.
          </p>
        </div>

        {/* Value promise strip */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {VALUE_PROPOSITIONS.map((vp) => {
            const Icon = vp.icon;
            return (
              <div key={vp.name} className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">{vp.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{vp.description}</p>
                <div className="flex flex-wrap gap-1">
                  {vp.steps.map((step, i) => (
                    <React.Fragment key={step}>
                      <span className="px-2 py-1 bg-primary/10 rounded text-xs text-primary font-medium">
                        {step}
                      </span>
                      {i < vp.steps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground self-center" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {CAPABILITIES.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-4 py-2 rounded-full transition ${
                activeCategory === cat.category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Capability grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {CAPABILITIES.find(c => c.category === activeCategory)?.items.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.name}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                  </div>
                  <Badge variant={item.tier === 'Free' ? 'secondary' : 'outline'}>
                    {item.tier}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            All capabilities included. Start free — scale when you're ready.
          </p>
          <Link to="/explore/demo">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Play className="h-4 w-4 mr-2" />
              Explore All Capabilities
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CrossFunctionalSection;