import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Maximize2,
  Check,
  X,
  Zap,
  Globe,
  Brain,
  TrendingUp,
  Users,
  Shield,
  DollarSign
} from 'lucide-react';
import { useUniversalExport } from '@/hooks/useUniversalExport';

interface SlideProps {
  children: React.ReactNode;
  className?: string;
}

const Slide: React.FC<SlideProps> = ({ children, className = '' }) => (
  <div 
    className={`aspect-[16/9] bg-gradient-to-br from-background to-muted/30 rounded-lg p-8 flex flex-col ${className}`}
    data-slide
  >
    {children}
  </div>
);

export const GenieStudioPitchDeck: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { exportToPPTX, exportToPDF, isExporting } = useUniversalExport();

  const slides = [
    // Slide 1: Title
    <Slide key="title" className="items-center justify-center text-center">
      <span className="text-6xl mb-4">🧞</span>
      <h1 className="text-4xl font-bold mb-2">Genie Studio</h1>
      <p className="text-xl text-muted-foreground mb-6">Mind to Media</p>
      <Badge className="text-lg px-4 py-2">The AI-Native Media Production Platform</Badge>
      <p className="mt-8 text-sm text-muted-foreground">Investor Presentation | 2026</p>
    </Slide>,

    // Slide 2: Problem
    <Slide key="problem">
      <h2 className="text-2xl font-bold mb-6 text-destructive">The Problem</h2>
      <div className="flex-1 grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Tool Overload</h3>
          <p className="text-muted-foreground">
            The average creator uses <strong>5-6 different tools</strong> to produce one video:
          </p>
          <ul className="space-y-2 text-sm">
            {['Canva for graphics', 'Descript for editing', 'VidIQ for SEO', 'Buffer for scheduling', 'Synthesia for avatars'].map((tool) => (
              <li key={tool} className="flex items-center gap-2">
                <X className="h-4 w-4 text-destructive" />
                {tool}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-destructive/10 rounded-lg p-6 flex flex-col justify-center">
          <div className="text-4xl font-bold text-destructive mb-2">$200+/mo</div>
          <p className="text-muted-foreground">Combined tool costs</p>
          <div className="text-4xl font-bold text-destructive mt-4 mb-2">6+</div>
          <p className="text-muted-foreground">Learning curves</p>
          <div className="text-4xl font-bold text-destructive mt-4 mb-2">Hours</div>
          <p className="text-muted-foreground">Lost to context switching</p>
        </div>
      </div>
    </Slide>,

    // Slide 3: Solution
    <Slide key="solution">
      <h2 className="text-2xl font-bold mb-6 text-primary">Our Solution</h2>
      <div className="flex-1 flex items-center gap-8">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-4">One Platform. Unlimited Possibilities.</h3>
          <ul className="space-y-3">
            {[
              'Write scripts with AI that understands your brand',
              'Record with professional teleprompter & studio tools',
              'Dub in 70+ languages with native-quality voices',
              'Auto-generate thumbnails, SEO tags, and social cuts',
              'Publish to all platforms simultaneously',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-64 bg-primary/10 rounded-lg p-6 text-center">
          <div className="text-5xl font-bold text-primary mb-2">1</div>
          <p className="font-semibold">Unified Platform</p>
          <div className="text-3xl font-bold text-primary mt-4 mb-2">80%</div>
          <p className="text-sm text-muted-foreground">Faster Production</p>
          <div className="text-3xl font-bold text-primary mt-4 mb-2">50-70%</div>
          <p className="text-sm text-muted-foreground">Cost Savings</p>
        </div>
      </div>
    </Slide>,

    // Slide 4: Product Suite
    <Slide key="products">
      <h2 className="text-2xl font-bold mb-6">The 6-Product Ecosystem</h2>
      <div className="flex-1 grid grid-cols-3 gap-4">
        {[
          { icon: '✨', name: 'Spark', desc: 'AI ideation & scripts' },
          { icon: '🧠', name: 'Mind', desc: 'Intelligence & RAG' },
          { icon: '🎬', name: 'Vibe', desc: 'Recording & video' },
          { icon: '🎯', name: 'Arc', desc: 'Production hub' },
          { icon: '📊', name: 'Deck', desc: 'Presentations' },
          { icon: '🧞', name: 'Ask Genie', desc: 'AI companion' },
        ].map((product) => (
          <Card key={product.name} className="p-4 text-center hover:shadow-lg transition-shadow">
            <span className="text-3xl block mb-2">{product.icon}</span>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.desc}</p>
          </Card>
        ))}
      </div>
      <p className="text-center text-muted-foreground mt-4">
        All products work together seamlessly through the Genie Deck orchestrator
      </p>
    </Slide>,

    // Slide 5: Key Differentiators
    <Slide key="differentiators">
      <h2 className="text-2xl font-bold mb-6">Key Differentiators</h2>
      <div className="flex-1 grid grid-cols-2 gap-6">
        {[
          { icon: Globe, title: '4-Zone AI Routing', desc: 'Best AI for each region: Claude (West), Alibaba (Asia), Gemini (India/SEA)', color: 'text-blue-600' },
          { icon: Brain, title: 'Knowledge Base (RAG)', desc: 'Upload brand guidelines → AI writes on-brand content automatically', color: 'text-purple-600' },
          { icon: Zap, title: '107+ Pipelines', desc: 'Text-to-Video, Doc-to-Deck, Long-to-Short, and 100+ more', color: 'text-amber-600' },
          { icon: Shield, title: 'Enterprise Ready', desc: 'HIPAA-ready, SOC2, SSO, white-label, custom retention', color: 'text-green-600' },
        ].map((item) => (
          <div key={item.title} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
            <item.icon className={`h-8 w-8 ${item.color} shrink-0`} />
            <div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Slide>,

    // Slide 6: Competitive Landscape
    <Slide key="competition">
      <h2 className="text-2xl font-bold mb-4">Competitive Landscape</h2>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Feature</th>
              <th className="text-center p-2 bg-primary/10 font-bold">Genie</th>
              <th className="text-center p-2">CapCut</th>
              <th className="text-center p-2">Descript</th>
              <th className="text-center p-2">Synthesia</th>
              <th className="text-center p-2">Canva</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Script-to-Video', '✅', '❌', '❌', '⚠️', '❌'],
              ['70+ Language Dubs', '✅', '❌', '❌', '✅', '❌'],
              ['Knowledge Base/RAG', '✅', '❌', '❌', '❌', '❌'],
              ['Auto Social Cuts', '✅', '⚠️', '❌', '❌', '❌'],
              ['Voice Cloning', '✅', '❌', '⚠️', '✅', '❌'],
              ['HIPAA Ready', '✅', '❌', '❌', '⚠️', '❌'],
              ['Unified Platform', '✅', '❌', '❌', '❌', '❌'],
            ].map((row, i) => (
              <tr key={i} className="border-b">
                <td className="p-2 font-medium">{row[0]}</td>
                <td className="p-2 text-center bg-primary/5 text-green-600 font-bold">{row[1]}</td>
                <td className="p-2 text-center">{row[2]}</td>
                <td className="p-2 text-center">{row[3]}</td>
                <td className="p-2 text-center">{row[4]}</td>
                <td className="p-2 text-center">{row[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Slide>,

    // Slide 7: Market Opportunity
    <Slide key="market">
      <h2 className="text-2xl font-bold mb-6">Market Opportunity</h2>
      <div className="flex-1 grid grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
          <div className="text-3xl font-bold">$15B+</div>
          <p className="text-muted-foreground">Video Creation Market</p>
          <p className="text-sm text-primary mt-2">Growing 15% CAGR</p>
        </Card>
        <Card className="p-6 text-center">
          <Users className="h-10 w-10 text-primary mx-auto mb-4" />
          <div className="text-3xl font-bold">50M+</div>
          <p className="text-muted-foreground">Content Creators</p>
          <p className="text-sm text-primary mt-2">Globally</p>
        </Card>
        <Card className="p-6 text-center">
          <DollarSign className="h-10 w-10 text-primary mx-auto mb-4" />
          <div className="text-3xl font-bold">$200+/mo</div>
          <p className="text-muted-foreground">Avg. Tool Spend</p>
          <p className="text-sm text-primary mt-2">Per creator</p>
        </Card>
      </div>
      <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
        <p className="font-semibold">Target: Capture 2% of creators = <span className="text-primary">1M users × $30 ARPU = $360M ARR</span></p>
      </div>
    </Slide>,

    // Slide 8: Pricing
    <Slide key="pricing">
      <h2 className="text-2xl font-bold mb-6">Business Model</h2>
      <div className="flex-1 grid grid-cols-4 gap-4">
        {[
          { tier: 'Starter', price: '$9.99', users: 'Creators', features: ['5 dubs/mo', 'No watermark', 'Basic AI'] },
          { tier: 'Business', price: '$29.99', users: 'Teams', features: ['20 dubs/mo', 'Collaboration', 'Analytics'] },
          { tier: 'Pro', price: '$79.99', users: 'Agencies', features: ['100 dubs/mo', 'Voice clone', 'API access'] },
          { tier: 'Enterprise', price: 'Custom', users: 'Corporations', features: ['Unlimited', 'HIPAA', 'White-label'] },
        ].map((plan) => (
          <Card key={plan.tier} className="p-4 text-center">
            <Badge variant="secondary" className="mb-2">{plan.users}</Badge>
            <h3 className="font-semibold text-lg">{plan.tier}</h3>
            <div className="text-2xl font-bold text-primary my-2">{plan.price}</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <div className="mt-4 text-center text-muted-foreground">
        <strong>Blended ARPU:</strong> $30/mo | <strong>Gross Margin:</strong> 75%+ | <strong>LTV:CAC:</strong> 5:1 Target
      </div>
    </Slide>,

    // Slide 9: Thank You
    <Slide key="cta" className="items-center justify-center text-center">
      <span className="text-6xl mb-4">🚀</span>
      <h2 className="text-3xl font-bold mb-4">Let's Transform Content Creation Together</h2>
      <p className="text-xl text-muted-foreground mb-8">One platform. Unlimited possibilities.</p>
      <div className="space-y-2">
        <p className="text-lg"><strong>Website:</strong> geniestudio.ai</p>
        <p className="text-lg"><strong>Contact:</strong> hello@geniestudio.ai</p>
      </div>
      <Badge className="mt-8 text-lg px-4 py-2">Thank You</Badge>
    </Slide>,
  ];

  const handleExportPPTX = async () => {
    const slideData = slides.map((_, index) => ({
      id: `slide-${index + 1}`,
      type: 'content' as const,
      slideNumber: index + 1,
      title: `Slide ${index + 1}`,
      content: { type: 'bullets' as const, bullets: ['Genie Studio Pitch Deck'] },
    }));
    await exportToPPTX({ title: 'Genie Studio Pitch Deck', slides: slideData });
  };

  const handleExportPDF = async () => {
    const slideData = slides.map((_, index) => ({
      id: `slide-${index + 1}`,
      type: 'content' as const,
      slideNumber: index + 1,
      title: `Slide ${index + 1}`,
      content: { type: 'bullets' as const, bullets: ['Genie Studio Pitch Deck'] },
    }));
    await exportToPDF({ title: 'Genie Studio Pitch Deck', slides: slideData });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {currentSlide + 1} / {slides.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPPTX} disabled={isExporting}>
            <Download className="h-4 w-4 mr-1" /> PPTX
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting}>
            <Download className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      {/* Current Slide */}
      <div className="border rounded-lg overflow-hidden">
        {slides[currentSlide]}
      </div>

      {/* Slide Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`shrink-0 w-24 aspect-[16/9] rounded border-2 overflow-hidden transition-all ${
              currentSlide === index ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <div className="transform scale-[0.15] origin-top-left w-[640px]">
              {slide}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenieStudioPitchDeck;
