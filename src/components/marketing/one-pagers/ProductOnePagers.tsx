import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface ProductOnePagerProps {
  product: 'spark' | 'mind' | 'vibe' | 'arc' | 'deck' | 'askGenie';
}

const PRODUCT_DATA = {
  spark: {
    name: 'Genie Spark',
    tagline: 'Ignite Your Ideas',
    icon: '✨',
    color: 'from-amber-500/20 to-orange-500/10',
    description: 'Transform creative sparks into brilliant content. Generate scripts, stories, and compelling narratives with AI-powered inspiration.',
    useCases: [
      'Blog post → Video script in 30 seconds',
      'Rough idea → Full storyboard',
      'Product brief → Marketing copy',
      'Meeting notes → Executive summary',
    ],
    features: [
      'AI Script Generation',
      'Story Development Engine',
      'Multi-format Writing',
      'Tone & Style Matching',
      'Brand Voice Learning',
      'Outline Templates',
    ],
    metrics: [
      { value: '10x', label: 'Faster Writing' },
      { value: '50+', label: 'Templates' },
      { value: '25+', label: 'Tones' },
    ],
    integrations: ['Mind (RAG)', 'Vibe (Recording)', 'Deck (Slides)'],
  },
  mind: {
    name: 'Genie Mind',
    tagline: 'AI That Understands',
    icon: '🧠',
    color: 'from-purple-500/20 to-violet-500/10',
    description: 'Your intelligent AI companion that truly understands context, learns from interactions, and provides meaningful insights across your creative journey.',
    useCases: [
      'Upload brand guidelines → On-brand content',
      'Import past work → Consistent style',
      'Add research → Subject expertise',
      'Train on products → Sales enablement',
    ],
    features: [
      'Knowledge Base (RAG)',
      'Multi-modal Understanding',
      'Context Memory',
      'Smart Recommendations',
      'Cross-product Learning',
      'Personalized Insights',
    ],
    metrics: [
      { value: '95%', label: 'Accuracy' },
      { value: '100+', label: 'Doc Types' },
      { value: '∞', label: 'Memory' },
    ],
    integrations: ['Spark (Scripts)', 'Deck (Presentations)', 'Arc (Workflows)'],
  },
  vibe: {
    name: 'Genie Vibe',
    tagline: 'Script to Screen',
    icon: '🎬',
    color: 'from-pink-500/20 to-rose-500/10',
    description: 'Bring your scripts to life with seamless audio and video recording, editing, and production tools that capture the perfect vibe.',
    useCases: [
      'Record with teleprompter → Polished takes',
      'One video → 70+ language dubs',
      'Long-form → Social cuts automatically',
      'Raw footage → Published in minutes',
    ],
    features: [
      'Teleprompter Recording',
      'Multi-track Editing',
      'Voice Dubbing (70+ langs)',
      'Lip-sync Technology',
      'Auto Social Cuts',
      'Real-time Effects',
    ],
    metrics: [
      { value: '70+', label: 'Languages' },
      { value: '4K', label: 'Export' },
      { value: '80%', label: 'Faster' },
    ],
    integrations: ['Spark (Scripts)', 'Arc (Scheduling)', 'Publishing'],
  },
  arc: {
    name: 'Genie Arc',
    tagline: 'Infinite Possibilities',
    icon: '🎯',
    color: 'from-blue-500/20 to-cyan-500/10',
    description: 'Orchestrate your production workflow with powerful scheduling, team collaboration, and show management tools built for creative teams.',
    useCases: [
      'Plan content calendars → Auto-scheduling',
      'Assign team tasks → Track progress',
      'Batch process → Bulk production',
      'Coordinate live → Real-time collaboration',
    ],
    features: [
      'Show Scheduling',
      'Team Collaboration',
      'Production Pipeline',
      'Resource Management',
      'Kanban Boards',
      'Live Coordination',
    ],
    metrics: [
      { value: '5x', label: 'Team Efficiency' },
      { value: '100+', label: 'Integrations' },
      { value: '24/7', label: 'Automation' },
    ],
    integrations: ['All Products', 'Calendar', 'Slack/Teams'],
  },
  deck: {
    name: 'Genie Deck',
    tagline: 'Ideas to Impact',
    icon: '📊',
    color: 'from-green-500/20 to-emerald-500/10',
    description: 'Transform your ideas into stunning presentations with AI-powered slide generation, multi-language support, and smart visual design.',
    useCases: [
      'Document → Presentation in minutes',
      'Data → Visualized charts automatically',
      'Outline → Full pitch deck',
      'One deck → 120+ language exports',
    ],
    features: [
      'AI Slide Generation',
      '120+ Language Export',
      'Smart Visual Design',
      'Template Library',
      'Real-time Collaboration',
      'Multi-format Export (PPTX/PDF)',
    ],
    metrics: [
      { value: '120+', label: 'Languages' },
      { value: '50+', label: 'Templates' },
      { value: '10min', label: 'To Publish' },
    ],
    integrations: ['Mind (Context)', 'Spark (Content)', 'Vibe (Video)'],
  },
  askGenie: {
    name: 'Ask Genie',
    tagline: 'Your Wish Is My Command',
    icon: '🧞',
    color: 'from-indigo-500/20 to-purple-500/10',
    description: 'Your intelligent AI companion that guides you through the entire Genie Studio experience with empathy, creativity, and a touch of magic.',
    useCases: [
      '"Create a video about..."  → Full workflow',
      '"Help me dub this in Spanish" → Instant action',
      '"What should I do next?" → Smart suggestions',
      '"Export for LinkedIn" → Auto-formatting',
    ],
    features: [
      'Natural Language Commands',
      'Cross-product Navigation',
      'Contextual Suggestions',
      'Workflow Automation',
      'Learning Memory',
      'Multi-modal Understanding',
    ],
    metrics: [
      { value: '∞', label: 'Commands' },
      { value: '100%', label: 'Coverage' },
      { value: '24/7', label: 'Available' },
    ],
    integrations: ['All Products', 'Voice', 'Chat'],
  },
};

export const ProductOnePager: React.FC<ProductOnePagerProps> = ({ product }) => {
  const data = PRODUCT_DATA[product];

  return (
    <div 
      className="bg-background text-foreground p-8 max-w-[816px] mx-auto"
      style={{ minHeight: '1056px' }}
      data-pdf-page={`product-${product}`}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${data.color} rounded-lg p-6 mb-6`}>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{data.icon}</span>
          <div>
            <h1 className="text-3xl font-bold">{data.name}</h1>
            <p className="text-lg text-muted-foreground">{data.tagline}</p>
          </div>
        </div>
        <p className="mt-4 text-muted-foreground">{data.description}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {data.metrics.map((metric) => (
          <div key={metric.label} className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-3xl font-bold text-primary">{metric.value}</div>
            <div className="text-sm text-muted-foreground">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Use Cases */}
        <div>
          <h3 className="text-lg font-semibold mb-3">💡 Use Cases</h3>
          <div className="space-y-2">
            {data.useCases.map((useCase, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{useCase}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-lg font-semibold mb-3">⚡ Features</h3>
          <div className="grid grid-cols-2 gap-2">
            {data.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">🔗 Works With</h3>
        <div className="flex flex-wrap gap-2">
          {data.integrations.map((integration) => (
            <Badge key={integration} variant="secondary" className="text-sm">
              {integration}
            </Badge>
          ))}
        </div>
      </div>

      {/* Part of Genie Studio */}
      <div className="bg-muted/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-center text-muted-foreground">
          <strong>{data.name}</strong> is part of the Genie Studio Suite—a unified 
          AI-native media production platform. All products work together seamlessly.
        </p>
      </div>

      {/* CTA */}
      <div className="bg-primary text-primary-foreground rounded-lg p-4 text-center">
        <p className="font-semibold mb-1">Try {data.name} Today</p>
        <p className="text-sm opacity-90">Included in all Genie Studio plans → geniestudio.ai</p>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
        © 2026 Genie Studio | geniestudio.ai | hello@geniestudio.ai
      </div>
    </div>
  );
};

// Export all product one-pagers
export const SparkOnePager = () => <ProductOnePager product="spark" />;
export const MindOnePager = () => <ProductOnePager product="mind" />;
export const VibeOnePager = () => <ProductOnePager product="vibe" />;
export const ArcOnePager = () => <ProductOnePager product="arc" />;
export const DeckOnePager = () => <ProductOnePager product="deck" />;
export const AskGenieOnePager = () => <ProductOnePager product="askGenie" />;

export default ProductOnePager;
