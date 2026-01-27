/**
 * CROSS-FUNCTIONAL CAPABILITIES SECTION
 * Shows 25+ cross-functional AI capabilities available across all products
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
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const CAPABILITIES = [
  {
    category: 'Avatar & Characters',
    items: [
      { name: 'AI Avatar', icon: User, tier: 'Pro', desc: 'Photorealistic digital presenters' },
      { name: 'Full-Body Avatar', icon: User, tier: 'Enterprise', desc: 'Complete body motion capture' },
      { name: 'Lip-Sync', icon: Mic2, tier: 'Pro', desc: 'Accurate mouth movement sync' },
    ]
  },
  {
    category: '3D & Immersive',
    items: [
      { name: 'Text-to-3D', icon: Box, tier: 'Pro', desc: 'Generate 3D models from descriptions' },
      { name: 'Image-to-3D', icon: Box, tier: 'Pro', desc: 'Convert images to 3D objects' },
      { name: 'AR/VR Export', icon: Layers, tier: 'Enterprise', desc: 'Immersive experience outputs' },
    ]
  },
  {
    category: 'Audio & Voice',
    items: [
      { name: 'Voice Clone', icon: Mic2, tier: 'Pro', desc: 'Clone any voice in minutes' },
      { name: 'Music Generation', icon: Music, tier: 'Creator', desc: 'AI-composed background music' },
      { name: 'Sound Effects', icon: Music, tier: 'Creator', desc: 'Contextual SFX generation' },
    ]
  },
  {
    category: 'Visual & Animation',
    items: [
      { name: 'Image Generation', icon: Image, tier: 'Free', desc: 'FLUX-powered visuals' },
      { name: 'Animation', icon: Sparkles, tier: 'Creator', desc: 'Animate static images' },
      { name: 'Video Generation', icon: Video, tier: 'Pro', desc: 'Text-to-video production' },
    ]
  },
];

const COMBINATION_EXAMPLES = [
  {
    name: '3D Product + Avatar Narrator',
    description: 'Spinning 3D product with AI presenter explaining features',
    steps: ['Text Input', 'Meshy 3D', 'Alibaba Avatar', 'ModelsLab Composite'],
    tier: 'Pro'
  },
  {
    name: 'Multilingual Video Course',
    description: 'Educational content in 22 languages with lip-synced avatar',
    steps: ['Script', 'Azure TTS', 'Lip-Sync', 'Render'],
    tier: 'Studio'
  },
  {
    name: 'Data-Driven Presentation',
    description: 'Animated charts with voiceover narration',
    steps: ['Data Upload', 'Chart Gen', 'Script', 'ElevenLabs Voice'],
    tier: 'Creator'
  },
];

export const CrossFunctionalSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(CAPABILITIES[0].category);

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-primary/5" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            25+ Cross-Functional Capabilities
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Mix and match AI capabilities to create <span className="text-primary font-bold">unlimited combinations</span>
          </p>
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
        <div className="grid md:grid-cols-3 gap-4 mb-16">
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

        {/* Combination examples */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
            Popular Combinations
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {COMBINATION_EXAMPLES.map((combo) => (
              <div key={combo.name} className="bg-muted/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{combo.name}</h4>
                  <Badge variant="outline">{combo.tier}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{combo.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {combo.steps.map((step, i) => (
                    <React.Fragment key={step}>
                      <span className="px-2 py-1 bg-primary/10 rounded text-xs text-primary">
                        {step}
                      </span>
                      {i < combo.steps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground self-center" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link to="/explore/demo">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Play className="h-4 w-4 mr-2" />
                Try Combination Builder
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CrossFunctionalSection;
