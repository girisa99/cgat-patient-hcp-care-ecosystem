/**
 * GENIE EXPLORE DEMO PAGE
 * 
 * Interactive mini-demo based on selected use case from Explore page
 * Shows actual AI generation capabilities
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Play, 
  Loader2, 
  Check,
  Wand2,
  FileText,
  Video,
  Mic,
  Brain,
  Share2,
  Calendar,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import genieSuiteLogo from '@/assets/logos/genie-studio-suite-logo.png';

// Product logos
import genieSparkLogo from '@/assets/logos/products/genie-spark.png';
import genieMindLogo from '@/assets/logos/products/genie-mind.png';
import genieVibeLogo from '@/assets/logos/products/genie-vibe.png';
import genieDeckLogo from '@/assets/logos/products/genie-deck.png';
import genieArcLogo from '@/assets/logos/products/genie-arc.png';
import genieCastLogo from '@/assets/logos/products/genie-cast.png';

// ============================================
// TYPES & DATA
// ============================================

interface DemoStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // seconds
}

interface UseCaseDemo {
  title: string;
  description: string;
  logo: string;
  prompt: string;
  steps: DemoStep[];
  output: {
    type: string;
    preview: string;
    description: string;
  };
  products: string[];
}

const USE_CASE_DEMOS: Record<string, UseCaseDemo> = {
  presentations: {
    title: 'AI Presentation Generator',
    description: 'Watch AI create a complete slide deck from a simple prompt',
    logo: genieDeckLogo,
    prompt: 'Create a 10-slide presentation about sustainable energy solutions for corporate leaders',
    steps: [
      { title: 'Understanding Intent', description: 'Analyzing topic, audience, and structure...', icon: <Brain className="h-5 w-5" />, duration: 2 },
      { title: 'Generating Outline', description: 'Creating optimal flow and key points...', icon: <FileText className="h-5 w-5" />, duration: 3 },
      { title: 'Creating Visuals', description: 'Designing slides with AI-generated graphics...', icon: <Wand2 className="h-5 w-5" />, duration: 4 },
      { title: 'Polishing Content', description: 'Refining text and adding speaker notes...', icon: <Sparkles className="h-5 w-5" />, duration: 2 },
    ],
    output: {
      type: 'Presentation',
      preview: '10 slides generated • 95% confidence score',
      description: 'Professional deck ready for download in PPTX, PDF, or Google Slides',
    },
    products: ['Genie Deck', 'Genie Spark'],
  },
  'video-content': {
    title: 'AI Video Creator',
    description: 'Transform your script into a professional video with AI avatars',
    logo: genieVibeLogo,
    prompt: 'Create a 60-second product demo video for a fintech app with an AI presenter',
    steps: [
      { title: 'Script Generation', description: 'Creating compelling narrative from input...', icon: <FileText className="h-5 w-5" />, duration: 3 },
      { title: 'Voice Synthesis', description: 'Generating natural voiceover with ElevenLabs...', icon: <Volume2 className="h-5 w-5" />, duration: 4 },
      { title: 'Avatar Animation', description: 'Animating AI presenter with Alibaba Wan2.2...', icon: <Video className="h-5 w-5" />, duration: 5 },
      { title: 'Video Composition', description: 'Combining elements and adding effects...', icon: <Sparkles className="h-5 w-5" />, duration: 3 },
    ],
    output: {
      type: 'Video',
      preview: '60s video • 1080p • AI Avatar presenter',
      description: 'Export in MP4, WebM, or publish directly to social platforms',
    },
    products: ['Genie Vibe', 'Genie Arc'],
  },
  'voice-audio': {
    title: 'AI Voice Studio',
    description: 'Clone voices, generate audio, and create podcast content',
    logo: genieSparkLogo,
    prompt: 'Generate a 2-minute podcast intro with custom voice clone',
    steps: [
      { title: 'Voice Analysis', description: 'Learning voice characteristics from sample...', icon: <Mic className="h-5 w-5" />, duration: 3 },
      { title: 'Script Enhancement', description: 'Optimizing text for natural speech...', icon: <FileText className="h-5 w-5" />, duration: 2 },
      { title: 'Voice Synthesis', description: 'Generating audio with cloned voice...', icon: <Volume2 className="h-5 w-5" />, duration: 4 },
      { title: 'Audio Mastering', description: 'Applying EQ, compression, and noise removal...', icon: <Sparkles className="h-5 w-5" />, duration: 2 },
    ],
    output: {
      type: 'Audio',
      preview: '2:00 audio • Voice clone • Podcast-ready',
      description: 'Download as MP3, WAV, or integrate into video production',
    },
    products: ['Genie Vibe', 'Genie Spark'],
  },
  'knowledge-base': {
    title: 'AI Knowledge Manager',
    description: 'Build intelligent Q&A systems from your documents',
    logo: genieMindLogo,
    prompt: 'Create a knowledge base from 50 product documentation PDFs',
    steps: [
      { title: 'Document Ingestion', description: 'Processing PDFs and extracting content...', icon: <FileText className="h-5 w-5" />, duration: 4 },
      { title: 'Semantic Indexing', description: 'Creating vector embeddings for search...', icon: <Brain className="h-5 w-5" />, duration: 3 },
      { title: 'Knowledge Graph', description: 'Building relationships between concepts...', icon: <Share2 className="h-5 w-5" />, duration: 3 },
      { title: 'Q&A Training', description: 'Optimizing for natural language queries...', icon: <Sparkles className="h-5 w-5" />, duration: 2 },
    ],
    output: {
      type: 'Knowledge Base',
      preview: '50 docs indexed • 2,500 concepts • RAG-ready',
      description: 'Deploy as chatbot, API, or integrate with Ask Genie',
    },
    products: ['Genie Mind'],
  },
  marketing: {
    title: 'AI Marketing Suite',
    description: 'Generate multi-platform campaigns in seconds',
    logo: genieCastLogo,
    prompt: 'Create a product launch campaign for 5 social platforms',
    steps: [
      { title: 'Brand Analysis', description: 'Understanding tone, style, and audience...', icon: <Brain className="h-5 w-5" />, duration: 2 },
      { title: 'Content Generation', description: 'Creating platform-specific copy and visuals...', icon: <Wand2 className="h-5 w-5" />, duration: 4 },
      { title: 'Asset Creation', description: 'Generating images, videos, and carousels...', icon: <Video className="h-5 w-5" />, duration: 4 },
      { title: 'Campaign Setup', description: 'Preparing assets for each platform...', icon: <Share2 className="h-5 w-5" />, duration: 2 },
    ],
    output: {
      type: 'Campaign',
      preview: '5 platforms • 15 assets • Ready to schedule',
      description: 'Publish to LinkedIn, Twitter, Instagram, TikTok, and YouTube',
    },
    products: ['Genie Cast', 'Genie Spark', 'Genie Deck'],
  },
  production: {
    title: 'AI Production Manager',
    description: 'Orchestrate complex content production workflows',
    logo: genieArcLogo,
    prompt: 'Plan and schedule a 12-video training series production',
    steps: [
      { title: 'Project Planning', description: 'Creating timeline and milestones...', icon: <Calendar className="h-5 w-5" />, duration: 2 },
      { title: 'Task Breakdown', description: 'Generating detailed production tasks...', icon: <FileText className="h-5 w-5" />, duration: 3 },
      { title: 'Resource Allocation', description: 'Assigning AI agents and workflows...', icon: <Brain className="h-5 w-5" />, duration: 2 },
      { title: 'Schedule Optimization', description: 'Balancing workload and dependencies...', icon: <Sparkles className="h-5 w-5" />, duration: 2 },
    ],
    output: {
      type: 'Project Plan',
      preview: '12 videos • 48 tasks • 4-week timeline',
      description: 'Gantt chart, Kanban board, and automated status updates',
    },
    products: ['Genie Arc', 'Genie Vibe', 'Genie Deck'],
  },
};

// ============================================
// COMPONENT
// ============================================

const GenieExploreDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const useCaseId = searchParams.get('useCase') || 'presentations';
  
  const [demoState, setDemoState] = useState<'idle' | 'running' | 'complete'>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');

  const demo = USE_CASE_DEMOS[useCaseId] || USE_CASE_DEMOS.presentations;

  useEffect(() => {
    setCustomPrompt(demo.prompt);
  }, [demo.prompt]);

  const runDemo = async () => {
    setDemoState('running');
    setCurrentStep(0);
    setStepProgress(0);

    for (let i = 0; i < demo.steps.length; i++) {
      setCurrentStep(i);
      const step = demo.steps[i];
      
      // Animate progress for this step
      for (let p = 0; p <= 100; p += 5) {
        setStepProgress(p);
        await new Promise(resolve => setTimeout(resolve, (step.duration * 1000) / 20));
      }
    }

    setDemoState('complete');
    toast.success('Demo complete! See what Genie can create for you.');
  };

  const resetDemo = () => {
    setDemoState('idle');
    setCurrentStep(0);
    setStepProgress(0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/genie-landing" className="flex items-center gap-2">
            <img src={genieSuiteLogo} alt="Genie Suite" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Genie Suite
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/explore')} className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Button>
            <Link to="/genie-studio-auth">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-xl bg-white shadow-lg flex items-center justify-center p-2 border border-border">
                <img src={demo.logo} alt={demo.title} className="w-full h-full object-contain" />
              </div>
            </div>
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Interactive Demo
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-foreground">
              {demo.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {demo.description}
            </p>
          </div>

          {/* Demo Area */}
          <Card className="mb-8 border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Your Prompt
              </CardTitle>
              <CardDescription>
                Modify the prompt or use the example to see AI in action
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter your content brief..."
                className="min-h-[100px] resize-none"
                disabled={demoState === 'running'}
              />
              
              <div className="flex justify-center">
                {demoState === 'idle' && (
                  <Button size="lg" onClick={runDemo} className="gap-2 bg-primary">
                    <Play className="h-5 w-5" />
                    Run Demo
                  </Button>
                )}
                {demoState === 'running' && (
                  <Button size="lg" disabled className="gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </Button>
                )}
                {demoState === 'complete' && (
                  <div className="flex gap-4">
                    <Button size="lg" variant="outline" onClick={resetDemo} className="gap-2">
                      <ArrowLeft className="h-5 w-5" />
                      Try Again
                    </Button>
                    <Button size="lg" onClick={() => navigate('/genie-studio-auth')} className="gap-2 bg-primary">
                      Start Creating
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Steps Visualization */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI Pipeline</CardTitle>
              <CardDescription>
                Watch the generation process step by step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demo.steps.map((step, index) => {
                  const isActive = demoState === 'running' && currentStep === index;
                  const isComplete = demoState === 'complete' || (demoState === 'running' && currentStep > index);
                  
                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border transition-all ${
                        isActive 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : isComplete 
                            ? 'border-green-500/50 bg-green-500/5' 
                            : 'border-border bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isComplete 
                            ? 'bg-green-500 text-white' 
                            : isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {isComplete ? (
                            <Check className="h-5 w-5" />
                          ) : isActive ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{step.title}</p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {isActive && (
                            <Progress value={stepProgress} className="mt-2 h-1" />
                          )}
                        </div>
                        <Badge variant={isComplete ? 'default' : 'outline'} className={isComplete ? 'bg-green-500' : ''}>
                          {step.duration}s
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Output Preview (when complete) */}
          {demoState === 'complete' && (
            <Card className="mb-8 border-2 border-green-500/50 bg-green-500/5 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  Output Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl">
                    {demo.output.type === 'Presentation' && <FileText className="h-8 w-8" />}
                    {demo.output.type === 'Video' && <Video className="h-8 w-8" />}
                    {demo.output.type === 'Audio' && <Volume2 className="h-8 w-8" />}
                    {demo.output.type === 'Knowledge Base' && <Brain className="h-8 w-8" />}
                    {demo.output.type === 'Campaign' && <Share2 className="h-8 w-8" />}
                    {demo.output.type === 'Project Plan' && <Calendar className="h-8 w-8" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-foreground">{demo.output.type}</p>
                    <p className="text-primary font-medium">{demo.output.preview}</p>
                    <p className="text-sm text-muted-foreground">{demo.output.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Powered by:</p>
                  <div className="flex flex-wrap gap-2">
                    {demo.products.map((product) => (
                      <Badge key={product} variant="outline" className="bg-card">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              This is just a preview. Sign up to create real content with 206 AI pipelines.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/explore')}>
                Try Another Demo
              </Button>
              <Button className="bg-primary" onClick={() => navigate('/genie-studio-auth')}>
                Start Creating Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenieExploreDemoPage;
