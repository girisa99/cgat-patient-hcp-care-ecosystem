import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize2, Download, FileText, Presentation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePresentationExporter } from '@/hooks/usePresentationExporter';
import './PresentationStyles.css';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  animation: 'fade' | 'slide' | 'zoom' | 'flip';
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Treatment Center AI Implementation Guide",
    subtitle: "Complete AI agent automation platform for treatment center onboarding and AI implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center animate-pulse">
            <div className="text-4xl">🤖</div>
          </div>
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete 21-slide AI automation platform for treatment centers featuring advanced AI agent platform 
              with autonomous decision-making, intelligent automation, and seamless integration
            </p>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 2,
    title: "Complete AI Agent Architecture",
    subtitle: "Comprehensive System Design & Interactive Data Flow",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-2 border-blue-500/30">
            <h4 className="font-bold text-blue-700 text-base mb-2">Frontend Layer</h4>
            <p className="text-sm text-muted-foreground">Visual Agent Builder</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30">
            <h4 className="font-bold text-green-700 text-base mb-2">Protocol Layer</h4>
            <p className="text-sm text-muted-foreground">MCP Integration Hub</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-2 border-purple-500/30">
            <h4 className="font-bold text-purple-700 text-base mb-2">AI Processing</h4>
            <p className="text-sm text-muted-foreground">Small LLMs + RAG</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30">
            <h4 className="font-bold text-orange-700 text-base mb-2">Data Layer</h4>
            <p className="text-sm text-muted-foreground">Supabase + Vector DB</p>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 3,
    title: "Agent Creation Journey Overview",
    subtitle: "5-Step Process for Building AI Agents",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-5 gap-4">
          {[1,2,3,4,5].map((step) => (
            <Card key={step} className="p-4 text-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm">{step}</span>
              </div>
              <div className="text-sm font-medium">Step {step}</div>
            </Card>
          ))}
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 4,
    title: "Step 1: Wizard Setup & Initial Configuration",
    subtitle: "Getting Started with Agent Creation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Initial Configuration Wizard</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Agent name and description setup</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Template selection and customization</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Initial configuration parameters</span>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 5,
    title: "Step 2: Canvas Design & Visual Branding",
    subtitle: "Creating the Visual Interface",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Visual Design System</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Canvas Features</h4>
              <ul className="space-y-2 text-sm">
                <li>• Drag-and-drop interface</li>
                <li>• Component library</li>
                <li>• Real-time preview</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Branding Options</h4>
              <ul className="space-y-2 text-sm">
                <li>• Custom colors and themes</li>
                <li>• Logo integration</li>
                <li>• Typography selection</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 6,
    title: "Step 3: Actions Configuration & System Integration",
    subtitle: "Connecting to Backend Systems",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">System Integration Setup</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>API endpoint configuration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Database connections</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Authentication setup</span>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 7,
    title: "Step 4: AI Assignment, Task Execution & Multi-Channel Deployment",
    subtitle: "Configuring AI Models and Tasks",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">AI Configuration</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">AI Models</h4>
              <ul className="space-y-2 text-sm">
                <li>• Small Language Models</li>
                <li>• Vision systems</li>
                <li>• Custom trained models</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Task Assignment</h4>
              <ul className="space-y-2 text-sm">
                <li>• Automated workflows</li>
                <li>• Decision trees</li>
                <li>• Response generation</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 8,
    title: "Step 5: Multi-Channel Deployment",
    subtitle: "Deploying Across All Platforms",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-2xl mb-2">💬</div>
            <h4 className="font-bold">Chat Platforms</h4>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl mb-2">📱</div>
            <h4 className="font-bold">Mobile Apps</h4>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl mb-2">🌐</div>
            <h4 className="font-bold">Web Interface</h4>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 9,
    title: "MCP Protocol & Small Language Models",
    subtitle: "Model Context Protocol Integration",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">MCP Integration</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Cross-model communication</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Context sharing and session management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Optimized small language models</span>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 10,
    title: "Knowledge Base & RAG System",
    subtitle: "Retrieval Augmented Generation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">RAG Implementation</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Vector embeddings and semantic search</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Real-time knowledge retrieval</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Dynamic context enhancement</span>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 11,
    title: "AI Model Selection & Assignment",
    subtitle: "Choosing the Right AI for Each Task",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-bold mb-3">Model Types</h4>
            <ul className="space-y-2 text-sm">
              <li>• Conversational AI</li>
              <li>• Document processing</li>
              <li>• Vision recognition</li>
              <li>• Decision making</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold mb-3">Assignment Criteria</h4>
            <ul className="space-y-2 text-sm">
              <li>• Task complexity</li>
              <li>• Response time requirements</li>
              <li>• Accuracy needs</li>
              <li>• Resource constraints</li>
            </ul>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 12,
    title: "Template Configuration Deep Dive",
    subtitle: "Advanced Template Customization",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Template Features</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span>Pre-built healthcare templates</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span>Custom workflow builders</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span>Dynamic form generation</span>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 13,
    title: "Actions, Tasks & AI Autosuggest",
    subtitle: "Intelligent Task Automation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Automation Features</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Automated task execution</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>AI-powered suggestions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Smart workflow optimization</span>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 14,
    title: "Template Configuration & Channel Deployment",
    subtitle: "Final Configuration and Deployment",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-bold mb-3">Configuration</h4>
            <ul className="space-y-2 text-sm">
              <li>• Final template review</li>
              <li>• Testing and validation</li>
              <li>• Performance optimization</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold mb-3">Deployment</h4>
            <ul className="space-y-2 text-sm">
              <li>• Channel-specific setup</li>
              <li>• Load balancing</li>
              <li>• Monitoring activation</li>
            </ul>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 15,
    title: "Complete Implementation Results",
    subtitle: "Successful AI Agent Deployment",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-3 gap-6 text-center">
          <Card className="p-6">
            <div className="text-3xl font-bold text-green-600">95%</div>
            <div className="text-sm">Success Rate</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-blue-600">65%</div>
            <div className="text-sm">Time Savings</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-purple-600">85%</div>
            <div className="text-sm">User Satisfaction</div>
          </Card>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 16,
    title: "Advanced AI Models, Vision Systems & Studio Labeling",
    subtitle: "Next-Generation AI Capabilities",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Advanced Features</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span>Computer vision integration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span>Studio labeling system</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span>Advanced model training</span>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 17,
    title: "Real-Time Performance Analytics & Monitoring",
    subtitle: "Comprehensive System Monitoring",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-bold mb-3">Performance Metrics</h4>
            <ul className="space-y-2 text-sm">
              <li>• Response time tracking</li>
              <li>• Accuracy measurements</li>
              <li>• Usage analytics</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold mb-3">Monitoring Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>• Real-time dashboards</li>
              <li>• Alert systems</li>
              <li>• Performance reports</li>
            </ul>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 18,
    title: "Scalability & Enterprise Integration",
    subtitle: "Built for Growth and Enterprise Needs",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Enterprise Features</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Horizontal scaling capabilities</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Enterprise security compliance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Multi-tenant architecture</span>
            </div>
          </div>
        </Card>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 19,
    title: "ROI & Business Impact Analysis",
    subtitle: "Measurable Business Results",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-3 gap-6 text-center">
          <Card className="p-6">
            <div className="text-3xl font-bold text-green-600">400%</div>
            <div className="text-sm">ROI Increase</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-blue-600">$2.1M</div>
            <div className="text-sm">Cost Savings</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-purple-600">6 Mo</div>
            <div className="text-sm">Payback Period</div>
          </Card>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 20,
    title: "Implementation Roadmap & Next Steps",
    subtitle: "Your Path to AI Implementation",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6">
            <h4 className="font-bold text-blue-600 mb-3">Phase 1: Setup</h4>
            <ul className="space-y-2 text-sm">
              <li>• Initial configuration</li>
              <li>• Team training</li>
              <li>• Basic implementation</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-green-600 mb-3">Phase 2: Deploy</h4>
            <ul className="space-y-2 text-sm">
              <li>• AI agent deployment</li>
              <li>• System integration</li>
              <li>• Testing and validation</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-purple-600 mb-3">Phase 3: Optimize</h4>
            <ul className="space-y-2 text-sm">
              <li>• Performance tuning</li>
              <li>• Advanced features</li>
              <li>• Continuous improvement</li>
            </ul>
          </Card>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 21,
    title: "Contact & Support Information",
    subtitle: "Get Started with AI Implementation Today",
    content: (
      <div className="h-full overflow-y-auto space-y-6 animate-fade-in">
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center animate-pulse">
            <div className="text-4xl">🚀</div>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-primary">Ready to Transform Your Operations?</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Contact us today to start your AI implementation journey
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-2xl mb-2">📧</div>
            <h4 className="font-bold">Email</h4>
            <p className="text-sm">info@aitreatment.com</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl mb-2">📞</div>
            <h4 className="font-bold">Phone</h4>
            <p className="text-sm">1-800-AI-CARE</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl mb-2">🌐</div>
            <h4 className="font-bold">Website</h4>
            <p className="text-sm">www.aitreatment.com</p>
          </Card>
        </div>
      </div>
    ),
    animation: 'fade'
  }
];

export const AgenticAIPresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { exportHTML, exportPDF, exportPPT } = usePresentationExporter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const resetPresentation = () => {
    setCurrentSlide(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClass = cn(
    "bg-background border rounded-lg",
    isFullscreen ? "fixed inset-0 z-50" : "max-w-6xl mx-auto"
  );

  return (
    <div className={containerClass} data-presentation-content data-current-slide={currentSlide}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Badge variant="secondary">{currentSlide + 1} / {slides.length}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportHTML(slides, setCurrentSlide)}>
            <Download className="w-4 h-4 mr-2" />
            HTML
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportPDF(slides, setCurrentSlide)}>
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportPPT(slides, setCurrentSlide)}>
            <Presentation className="w-4 h-4 mr-2" />
            PPT
          </Button>
          <Button variant="outline" size="sm" onClick={resetPresentation}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[700px]'}`}>
        <div
          key={currentSlide}
          className="absolute inset-0 p-6 flex flex-col transition-opacity duration-500 overflow-y-auto"
          data-slide-content
          data-slide-index={currentSlide}
        >
          <div className="text-center mb-6 flex-shrink-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              {slides[currentSlide].title}
            </h1>
            {slides[currentSlide].subtitle && (
              <p className="text-lg lg:text-xl text-muted-foreground">
                {slides[currentSlide].subtitle}
              </p>
            )}
          </div>
          <div className="flex-1">
            {slides[currentSlide].content}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-t">
        <Button variant="outline" size="sm" onClick={prevSlide}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={togglePlay}>
            {isPlaying ? (
              <Pause className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>
        
        <Button variant="outline" size="sm" onClick={nextSlide}>
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};