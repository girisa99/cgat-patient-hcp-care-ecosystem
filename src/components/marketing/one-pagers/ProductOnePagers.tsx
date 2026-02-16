import React from 'react';
import { Check, ArrowRight, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react';

interface ProductOnePagerProps {
  product: 'spark' | 'mind' | 'vibe' | 'arc' | 'deck' | 'askGenie';
}

const PRODUCT_DATA = {
  spark: {
    name: 'Genie Spark',
    tagline: 'Ignite Your Ideas',
    icon: '✨',
    accentColor: 'amber',
    description: 'Transform your creative sparks into brilliant content. Generate scripts, stories, and compelling narratives with AI-powered inspiration. Never face a blank canvas again.',
    problemStatement: 'The average content creator spends 3+ hours writing scripts and developing story outlines before production can begin.',
    solutionStatement: 'Spark reduces script development from hours to minutes with intelligent AI that understands your brand voice, audience, and content goals.',
    useCases: [
      { from: 'Blog post', to: 'Video script', time: '30 seconds' },
      { from: 'Product brief', to: 'Marketing copy', time: '2 minutes' },
      { from: 'Rough idea', to: 'Full storyboard', time: '5 minutes' },
      { from: 'Meeting notes', to: 'Executive summary', time: '1 minute' },
    ],
    features: [
      'AI Script Generation with multi-format outputs',
      'Story Development Engine with narrative arcs',
      'Tone & Style Matching (25+ presets)',
      'Brand Voice Learning from uploaded content',
      'Template Library (50+ starting points)',
      'Real-time collaboration with team',
    ],
    metrics: [
      { value: '10x', label: 'Faster Writing', comparison: 'vs. manual' },
      { value: '50+', label: 'Templates', comparison: 'ready to use' },
      { value: '25+', label: 'Tones', comparison: 'adjustable styles' },
    ],
    integrations: ['Mind (RAG context)', 'Vibe (Recording)', 'Deck (Slides)', 'Arc (Scheduling)'],
    differentiator: 'Unlike ChatGPT or Claude alone, Spark is purpose-built for media production with direct integration into recording, dubbing, and publishing workflows.',
  },
  mind: {
    name: 'Genie Mind',
    tagline: 'AI That Understands',
    icon: '🧠',
    accentColor: 'purple',
    description: 'Your intelligent AI companion that truly understands context, learns from interactions, and provides meaningful insights across your creative journey.',
    problemStatement: 'Generic AI tools produce generic content. Without brand context and institutional knowledge, outputs require extensive manual editing.',
    solutionStatement: 'Mind uses Retrieval-Augmented Generation (RAG) to learn your brand, products, and style—ensuring every output is on-brand automatically.',
    useCases: [
      { from: 'Brand guidelines', to: 'On-brand content', time: 'Automatic' },
      { from: 'Past content', to: 'Consistent style', time: 'Learned' },
      { from: 'Research docs', to: 'Subject expertise', time: 'Instant' },
      { from: 'Product catalog', to: 'Sales enablement', time: 'On-demand' },
    ],
    features: [
      'Knowledge Base (RAG) with multi-modal input',
      'Document understanding (100+ formats)',
      'Context Memory across sessions',
      'Smart Recommendations based on usage',
      'Cross-product intelligence sharing',
      'Enterprise-grade data security',
    ],
    metrics: [
      { value: '95%', label: 'Accuracy', comparison: 'context-aware' },
      { value: '100+', label: 'Doc Types', comparison: 'supported' },
      { value: '∞', label: 'Memory', comparison: 'persistent' },
    ],
    integrations: ['Spark (Scripts)', 'Deck (Presentations)', 'Arc (Workflows)', 'Vibe (Content)'],
    differentiator: 'Unlike generic AI, Mind becomes YOUR AI—learning your brand voice, product knowledge, and style preferences over time.',
  },
  vibe: {
    name: 'Genie Vibe',
    tagline: 'Script to Screen',
    icon: '🎬',
    accentColor: 'rose',
    description: 'Bring your scripts to life with seamless audio and video recording, editing, and production tools that capture the perfect vibe.',
    problemStatement: 'Video production requires 4-6 different tools: recording, editing, dubbing, subtitles, and publishing. Each handoff wastes time and quality.',
    solutionStatement: 'Vibe is the complete video production studio—from teleprompter to published content in a single unified workflow.',
    useCases: [
      { from: 'Script', to: 'Polished video', time: '15 minutes' },
      { from: 'One video', to: '70+ language dubs', time: '5 minutes' },
      { from: 'Long-form', to: 'Social cuts', time: 'Automatic' },
      { from: 'Raw footage', to: 'Published', time: '10 minutes' },
    ],
    features: [
      'Teleprompter recording with smart scrolling',
      'Multi-track editing with real-time effects',
      'Voice Dubbing in 70+ languages',
      'AI Lip-sync technology (Pro tier)',
      'Auto Social Cuts for all platforms',
      '4K export with compression optimization',
    ],
    metrics: [
      { value: '70+', label: 'Languages', comparison: 'dubbing support' },
      { value: '4K', label: 'Export', comparison: 'maximum quality' },
      { value: '80%', label: 'Faster', comparison: 'than multi-tool' },
    ],
    integrations: ['Spark (Scripts)', 'Arc (Scheduling)', 'Publishing (Multi-platform)', 'Mind (Captions)'],
    differentiator: 'Competitors offer pieces: HeyGen for avatars, Descript for editing, ElevenLabs for voice. Vibe delivers the complete pipeline at 70% lower cost.',
  },
  arc: {
    name: 'Genie Hub',
    tagline: 'Your Creative Command Center',
    icon: '🎯',
    accentColor: 'blue',
    description: 'Orchestrate your production workflow with powerful scheduling, team collaboration, and show management tools built for creative teams.',
    problemStatement: 'Creative teams juggle content calendars across multiple tools, losing track of deadlines, assignments, and production status.',
    solutionStatement: 'Arc provides a unified production command center—plan, assign, track, and publish all content from a single dashboard.',
    useCases: [
      { from: 'Content calendar', to: 'Auto-scheduling', time: 'Continuous' },
      { from: 'Team tasks', to: 'Progress tracking', time: 'Real-time' },
      { from: 'Batch content', to: 'Bulk production', time: 'Parallel' },
      { from: 'Live events', to: 'Coordination', time: 'Synchronized' },
    ],
    features: [
      'Content calendar with AI optimization',
      'Team collaboration with role-based access',
      'Production pipeline visualization',
      'Resource management and allocation',
      'Kanban boards with drag-and-drop',
      'Slack/Teams integration',
    ],
    metrics: [
      { value: '5x', label: 'Efficiency', comparison: 'team productivity' },
      { value: '100+', label: 'Integrations', comparison: 'available' },
      { value: '24/7', label: 'Automation', comparison: 'scheduling' },
    ],
    integrations: ['All Products', 'Google Calendar', 'Slack/Teams', 'Notion/Asana'],
    differentiator: 'Arc is the only production orchestrator that natively integrates with AI content generation, recording, and multi-platform publishing.',
  },
  deck: {
    name: 'Genie Deck',
    tagline: 'Ideas to Impact',
    icon: '📊',
    accentColor: 'emerald',
    description: 'Transform your ideas into stunning presentations with AI-powered slide generation, multi-language support, and smart visual design.',
    problemStatement: 'Creating professional presentations takes hours. Translating them for global audiences adds days of additional work.',
    solutionStatement: 'Deck generates complete presentations from documents or outlines, then exports to 120+ languages with proper font and layout preservation.',
    useCases: [
      { from: 'Document', to: 'Presentation', time: '5 minutes' },
      { from: 'Data', to: 'Visualized charts', time: 'Automatic' },
      { from: 'Outline', to: 'Full pitch deck', time: '10 minutes' },
      { from: 'One deck', to: '120+ languages', time: '2 minutes' },
    ],
    features: [
      'AI Slide Generation from any input',
      '120+ Language Export with native fonts',
      'Smart Visual Design with brand templates',
      'Template Library (50+ professional designs)',
      'Real-time collaboration editing',
      'Multi-format export (PPTX, PDF, HTML, MP4)',
    ],
    metrics: [
      { value: '120+', label: 'Languages', comparison: 'export support' },
      { value: '50+', label: 'Templates', comparison: 'professional' },
      { value: '10min', label: 'To Publish', comparison: 'end-to-end' },
    ],
    integrations: ['Mind (Context)', 'Spark (Content)', 'Vibe (Video presentations)', 'Publishing'],
    differentiator: 'Unlike Canva or PowerPoint, Deck generates slides FROM content (not templates), with native CJK, RTL, and Indic script support.',
  },
  askGenie: {
    name: 'Ask Genie',
    tagline: 'Your Wish Is My Command',
    icon: '🧞',
    accentColor: 'indigo',
    description: 'Your intelligent AI companion that guides you through the entire Genie Suite experience with empathy, creativity, and a touch of magic.',
    problemStatement: 'Complex software requires training. Users struggle to discover features and optimize workflows across multiple products.',
    solutionStatement: 'Ask Genie provides natural language access to the entire platform—describe what you want, and Genie executes across all products.',
    useCases: [
      { from: '"Create a video about..."', to: 'Full workflow', time: 'Automated' },
      { from: '"Dub this in Spanish"', to: 'Instant action', time: 'Immediate' },
      { from: '"What should I do next?"', to: 'Smart suggestions', time: 'Contextual' },
      { from: '"Export for LinkedIn"', to: 'Auto-formatting', time: 'One command' },
    ],
    features: [
      'Natural Language Commands (any request)',
      'Cross-product Navigation and execution',
      'Contextual Suggestions based on history',
      'Workflow Automation with memory',
      'Multi-modal understanding (voice/text/image)',
      'Personalized learning over time',
    ],
    metrics: [
      { value: '∞', label: 'Commands', comparison: 'natural language' },
      { value: '100%', label: 'Coverage', comparison: 'all products' },
      { value: '24/7', label: 'Available', comparison: 'always ready' },
    ],
    integrations: ['All Products', 'Voice Interface', 'Chat Interface', 'Mobile App'],
    differentiator: 'Ask Genie is the only AI assistant that can execute multi-step content workflows across writing, recording, editing, dubbing, and publishing.',
  },
};

const ACCENT_CLASSES = {
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dark: 'bg-amber-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dark: 'bg-purple-600' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dark: 'bg-rose-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dark: 'bg-blue-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dark: 'bg-emerald-600' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dark: 'bg-indigo-600' },
};

export const ProductOnePager: React.FC<ProductOnePagerProps> = ({ product }) => {
  const data = PRODUCT_DATA[product];
  const accent = ACCENT_CLASSES[data.accentColor as keyof typeof ACCENT_CLASSES];

  return (
    <div 
      className="bg-white text-slate-900 max-w-[816px] mx-auto font-sans"
      style={{ minHeight: '1056px', padding: '40px 48px' }}
      data-pdf-page={`product-${product}`}
    >
      {/* Enterprise Header */}
      <header className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${accent.dark} rounded-lg flex items-center justify-center`}>
            <span className="text-2xl">{data.icon}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{data.name.toUpperCase()}</h1>
            <p className="text-sm font-medium text-slate-600 tracking-wide">{data.tagline}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Brief</div>
          <div className="text-xs text-slate-400">Genie Suite</div>
        </div>
      </header>

      {/* Problem / Solution */}
      <section className="grid grid-cols-2 gap-4 mb-5">
        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r">
          <h3 className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">The Problem</h3>
          <p className="text-xs text-slate-700 leading-relaxed">{data.problemStatement}</p>
        </div>
        <div className={`p-3 ${accent.bg} border-l-4 ${accent.border} rounded-r`}>
          <h3 className={`text-[10px] font-bold ${accent.text} uppercase tracking-wider mb-1`}>The Solution</h3>
          <p className="text-xs text-slate-700 leading-relaxed">{data.solutionStatement}</p>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="grid grid-cols-3 gap-3 mb-5">
        {data.metrics.map((metric) => (
          <div key={metric.label} className="text-center p-3 border border-slate-200 rounded-lg bg-white">
            <div className={`text-2xl font-bold ${accent.text}`}>{metric.value}</div>
            <div className="text-xs font-semibold text-slate-700">{metric.label}</div>
            <div className="text-[9px] text-slate-500">{metric.comparison}</div>
          </div>
        ))}
      </section>

      {/* Use Case Transformations */}
      <section className="mb-5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <TrendingUp className="h-3 w-3" /> Use Case Transformations
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {data.useCases.map((uc, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded">
              <span className="text-[10px] font-medium text-slate-700 flex-1">{uc.from}</span>
              <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="text-[10px] font-semibold text-slate-900 flex-1">{uc.to}</span>
              <span className={`text-[9px] px-1.5 py-0.5 ${accent.bg} ${accent.text} rounded font-medium`}>{uc.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features & Integrations */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Zap className="h-3 w-3" /> Core Features
          </h3>
          <div className="space-y-1">
            {data.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]">
                <Check className={`h-3 w-3 ${accent.text} shrink-0 mt-0.5`} />
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <BarChart3 className="h-3 w-3" /> Platform Integrations
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {data.integrations.map((integration) => (
              <span key={integration} className="text-[9px] px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium">
                {integration}
              </span>
            ))}
          </div>
          
          <div className={`mt-3 p-3 ${accent.bg} border ${accent.border} rounded`}>
            <h4 className={`text-[10px] font-bold ${accent.text} uppercase mb-1`}>Key Differentiator</h4>
            <p className="text-[10px] text-slate-700 leading-relaxed">{data.differentiator}</p>
          </div>
        </section>
      </div>

      {/* Part of Suite */}
      <section className="mb-5">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-900">Part of the Genie Suite</h4>
              <p className="text-[10px] text-slate-600">All products work together seamlessly through unified AI intelligence.</p>
            </div>
            <div className="flex gap-2">
              {['✨', '🧠', '🎬', '🎯', '📊', '🧞'].map((emoji, i) => (
                <span key={i} className={`w-6 h-6 flex items-center justify-center rounded ${emoji === data.icon ? accent.bg + ' ' + accent.border + ' border-2' : 'bg-slate-100'}`}>
                  <span className="text-sm">{emoji}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={`${accent.dark} text-white rounded-lg p-4 text-center mb-4`}>
        <p className="text-sm font-semibold mb-1">Experience {data.name}</p>
        <p className="text-xs opacity-90">Included in all Genie Suite plans starting at $9.99/mo</p>
        <div className="mt-2 flex items-center justify-center gap-6 text-xs opacity-90">
          <span>🌐 genieaisuite.com</span>
          <span>📧 hello@genieaisuite.com</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-[9px] text-slate-400 border-t border-slate-200 pt-2">
        © 2026 Genie Suite Inc. | Confidential | Not for Distribution
      </footer>
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
