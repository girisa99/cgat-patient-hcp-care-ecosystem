import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    title: "Agentic AI & Automation",
    subtitle: "Revolutionizing Treatment Center Onboarding",
    content: (
      <div className="text-center space-y-8 animate-fade-in">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center animate-pulse">
          <div className="text-4xl">🤖</div>
        </div>
        <div className="space-y-4">
          <p className="text-xl text-muted-foreground">
            Intelligent automation transforming healthcare onboarding processes
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2">AI-Powered</Badge>
            <Badge variant="secondary" className="px-4 py-2">Automated</Badge>
            <Badge variant="secondary" className="px-4 py-2">Scalable</Badge>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 2,
    title: "System Overview",
    content: (
      <div className="grid grid-cols-2 gap-8 animate-slide-in-left">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-primary">Key Components</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Master Authentication System</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span>Intelligent Module Detection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span>Automated Code Generation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Real-time Verification Engine</span>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-secondary">Architecture Benefits</h3>
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10">
              <p className="font-semibold">99.9% Uptime</p>
              <p className="text-sm text-muted-foreground">Robust automation ensures continuous operation</p>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-secondary/10 to-accent/10">
              <p className="font-semibold">80% Faster Setup</p>
              <p className="text-sm text-muted-foreground">Automated module generation and configuration</p>
            </Card>
            <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10">
              <p className="font-semibold">Zero Code Duplication</p>
              <p className="text-sm text-muted-foreground">Intelligent template reuse and optimization</p>
            </Card>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 3,
    title: "Onboarding Journey",
    subtitle: "From Registration to Full System Access",
    content: (
      <div className="space-y-8 animate-zoom-in">
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
          <div className="relative flex justify-between">
            {[
              { step: 1, title: "Registration", icon: "📝", color: "bg-primary" },
              { step: 2, title: "AI Analysis", icon: "🤖", color: "bg-secondary" },
              { step: 3, title: "Auto-Setup", icon: "⚙️", color: "bg-accent" },
              { step: 4, title: "Verification", icon: "✅", color: "bg-primary" },
              { step: 5, title: "Activation", icon: "🚀", color: "bg-secondary" }
            ].map((item, index) => (
              <div
                key={item.step}
                className="flex flex-col items-center animate-bounce"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center text-2xl shadow-lg`}>
                  {item.icon}
                </div>
                <p className="mt-2 font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">Step {item.step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 mt-12">
          <Card className="p-6 bg-gradient-to-br from-primary/20 to-primary/5">
            <h4 className="font-bold text-primary mb-2">Traditional Process</h4>
            <p className="text-sm text-muted-foreground">Manual setup, multiple steps, 2-3 weeks completion time</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-secondary/20 to-secondary/5">
            <h4 className="font-bold text-secondary mb-2">AI-Powered Process</h4>
            <p className="text-sm text-muted-foreground">Automated analysis, intelligent configuration, 24-48 hours completion</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-accent/20 to-accent/5">
            <h4 className="font-bold text-accent mb-2">Result</h4>
            <p className="text-sm text-muted-foreground">90% time reduction, 100% accuracy, zero manual errors</p>
          </Card>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 4,
    title: "High-Level Architecture",
    subtitle: "Single Source of Truth Design",
    content: (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="relative mx-auto w-full max-w-4xl">
            <svg viewBox="0 0 800 500" className="w-full h-auto">
              {/* Background */}
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary) / 0.1)" />
                  <stop offset="100%" stopColor="hsl(var(--secondary) / 0.1)" />
                </linearGradient>
              </defs>
              <rect width="800" height="500" fill="url(#bgGradient)" rx="20" />
              
              {/* Master Dashboard Layer */}
              <rect x="300" y="50" width="200" height="60" rx="10" fill="hsl(var(--primary))" />
              <text x="400" y="85" textAnchor="middle" fill="white" className="text-sm font-bold">Master Dashboard</text>
              
              {/* Master Hooks Layer */}
              <rect x="50" y="150" width="150" height="40" rx="8" fill="hsl(var(--secondary))" />
              <text x="125" y="175" textAnchor="middle" fill="white" className="text-xs">useMasterAuth</text>
              
              <rect x="250" y="150" width="150" height="40" rx="8" fill="hsl(var(--secondary))" />
              <text x="325" y="175" textAnchor="middle" fill="white" className="text-xs">useMasterData</text>
              
              <rect x="450" y="150" width="150" height="40" rx="8" fill="hsl(var(--secondary))" />
              <text x="525" y="175" textAnchor="middle" fill="white" className="text-xs">useAutomation</text>
              
              <rect x="600" y="150" width="150" height="40" rx="8" fill="hsl(var(--secondary))" />
              <text x="675" y="175" textAnchor="middle" fill="white" className="text-xs">useMasterToast</text>
              
              {/* Automation Engine */}
              <rect x="200" y="250" width="400" height="80" rx="15" fill="hsl(var(--accent))" />
              <text x="400" y="285" textAnchor="middle" fill="white" className="text-lg font-bold">Automation Engine</text>
              <text x="400" y="305" textAnchor="middle" fill="white" className="text-xs">Schema Detection • Code Generation • Verification</text>
              
              {/* Database Layer */}
              <rect x="100" y="380" width="600" height="60" rx="10" fill="hsl(var(--primary) / 0.8)" />
              <text x="400" y="415" textAnchor="middle" fill="white" className="text-lg font-bold">Supabase Database + Real-time Sync</text>
              
              {/* Connection Lines */}
              <path d="M400 110 L400 150" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" />
              <path d="M125 190 L300 250" stroke="hsl(var(--secondary))" strokeWidth="2" fill="none" />
              <path d="M325 190 L350 250" stroke="hsl(var(--secondary))" strokeWidth="2" fill="none" />
              <path d="M525 190 L450 250" stroke="hsl(var(--secondary))" strokeWidth="2" fill="none" />
              <path d="M675 190 L500 250" stroke="hsl(var(--secondary))" strokeWidth="2" fill="none" />
              <path d="M400 330 L400 380" stroke="hsl(var(--accent))" strokeWidth="3" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    ),
    animation: 'fade'
  },
  {
    id: 5,
    title: "AI Features Deep Dive",
    subtitle: "Intelligent Automation Capabilities",
    content: (
      <div className="grid grid-cols-2 gap-8 animate-slide-in-right">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-primary">Detection & Analysis</h3>
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary">
              <h4 className="font-bold text-primary">🔍 Schema Scanning</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Automatically detects new database tables every 30 seconds and analyzes structure
              </p>
              <div className="mt-2 text-xs">
                <Badge variant="outline">Real-time</Badge>
                <Badge variant="outline" className="ml-2">90% Accuracy</Badge>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 border-l-4 border-secondary">
              <h4 className="font-bold text-secondary">🤖 Pattern Recognition</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Identifies common patterns like timestamps, user references, and status fields
              </p>
              <div className="mt-2 text-xs">
                <Badge variant="outline">AI-Powered</Badge>
                <Badge variant="outline" className="ml-2">95% Confidence</Badge>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-accent/10 to-accent/5 border-l-4 border-accent">
              <h4 className="font-bold text-accent">📊 Confidence Scoring</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Calculates confidence scores for auto-registration decisions
              </p>
              <div className="mt-2 text-xs">
                <Badge variant="outline">Smart Threshold</Badge>
                <Badge variant="outline" className="ml-2">80%+ Auto-register</Badge>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-secondary">Generation & Optimization</h3>
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary">
              <h4 className="font-bold text-primary">⚡ Code Generation</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Generates complete TypeScript hooks and components automatically
              </p>
              <div className="mt-2 text-xs">
                <Badge variant="outline">Type-Safe</Badge>
                <Badge variant="outline" className="ml-2">Zero Boilerplate</Badge>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-secondary/10 to-accent/10 border-l-4 border-secondary">
              <h4 className="font-bold text-secondary">🔧 Template Adaptation</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Adapts universal templates based on table structure and requirements
              </p>
              <div className="mt-2 text-xs">
                <Badge variant="outline">Dynamic</Badge>
                <Badge variant="outline" className="ml-2">Reusable</Badge>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 border-l-4 border-accent">
              <h4 className="font-bold text-accent">✅ Auto-Verification</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Validates generated code and ensures compilation success
              </p>
              <div className="mt-2 text-xs">
                <Badge variant="outline">100% Tested</Badge>
                <Badge variant="outline" className="ml-2">Error-Free</Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 6,
    title: "Implementation Steps",
    subtitle: "How It All Works Together",
    content: (
      <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 gap-6">
          {[
            {
              step: "01",
              title: "Database Monitoring",
              description: "Continuous scanning of Supabase schema for new tables and changes",
              details: ["Real-time detection", "Schema analysis", "Change tracking"],
              color: "primary"
            },
            {
              step: "02", 
              title: "AI Analysis",
              description: "Intelligent pattern recognition and confidence scoring",
              details: ["Structure analysis", "Pattern matching", "Confidence calculation"],
              color: "secondary"
            },
            {
              step: "03",
              title: "Code Generation",
              description: "Automatic creation of hooks, components, and TypeScript interfaces",
              details: ["Template selection", "Code generation", "Type safety"],
              color: "accent"
            },
            {
              step: "04",
              title: "Verification & Testing",
              description: "Automated validation and compilation checks",
              details: ["Code validation", "Compilation test", "Error detection"],
              color: "primary"
            },
            {
              step: "05",
              title: "Registration & Deployment",
              description: "Module registration and live system integration",
              details: ["Module registry", "Live deployment", "Status monitoring"],
              color: "secondary"
            }
          ].map((item, index) => (
            <div
              key={item.step}
              className="flex gap-6 items-start"
            >
              <div className={`w-16 h-16 bg-${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                {item.step}
              </div>
              <div className="flex-1">
                <h4 className={`text-xl font-bold text-${item.color} mb-2`}>{item.title}</h4>
                <p className="text-muted-foreground mb-3">{item.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {item.details.map((detail, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {detail}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    animation: 'slide'
  },
  {
    id: 7,
    title: "Results & Impact",
    subtitle: "Transforming Healthcare Technology",
    content: (
      <div className="space-y-8 animate-zoom-in">
        <div className="grid grid-cols-3 gap-8">
          <Card className="p-6 text-center bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary">90%</div>
              <h4 className="text-lg font-semibold">Time Reduction</h4>
              <p className="text-sm text-muted-foreground">From weeks to hours setup time</p>
            </div>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20">
            <div className="space-y-4">
              <div className="text-4xl font-bold text-secondary">100%</div>
              <h4 className="text-lg font-semibold">Accuracy</h4>
              <p className="text-sm text-muted-foreground">Zero manual configuration errors</p>
            </div>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-accent/20 to-accent/5 border-accent/20">
            <div className="space-y-4">
              <div className="text-4xl font-bold text-accent">∞</div>
              <h4 className="text-lg font-semibold">Scalability</h4>
              <p className="text-sm text-muted-foreground">Unlimited modules and tenants</p>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">Before Implementation</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Manual module creation (2-3 weeks)</span>
              </div>
              <div className="flex items-center gap-3 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Code duplication and inconsistency</span>
              </div>
              <div className="flex items-center gap-3 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>High error rate in setup</span>
              </div>
              <div className="flex items-center gap-3 text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Limited scalability</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">After Implementation</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Automated setup (24-48 hours)</span>
              </div>
              <div className="flex items-center gap-3 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Consistent, reusable templates</span>
              </div>
              <div className="flex items-center gap-3 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Zero configuration errors</span>
              </div>
              <div className="flex items-center gap-3 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Infinite scalability</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    animation: 'zoom'
  },
  {
    id: 8,
    title: "Future Roadmap",
    subtitle: "Continuing Innovation",
    content: (
      <div className="text-center space-y-8 animate-fade-in">
        <div className="space-y-6">
          <div className="text-6xl">🚀</div>
          <h3 className="text-3xl font-bold text-primary">The Journey Continues</h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our Agentic AI system continues to evolve, bringing even more intelligent automation 
            to healthcare technology infrastructure.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
            <h4 className="text-xl font-bold text-primary mb-4">Next Phase</h4>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Q2 2024</Badge>
                <span className="text-sm">Predictive Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Q3 2024</Badge>
                <span className="text-sm">Natural Language Interface</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Q4 2024</Badge>
                <span className="text-sm">Advanced ML Integration</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-secondary/10 to-accent/10">
            <h4 className="text-xl font-bold text-secondary mb-4">Long-term Vision</h4>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <Badge variant="outline">2025</Badge>
                <span className="text-sm">Full AI Orchestration</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">2025</Badge>
                <span className="text-sm">Cross-platform Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">2026</Badge>
                <span className="text-sm">Industry Standard</span>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="text-center">
          <p className="text-lg text-muted-foreground italic">
            "Transforming healthcare technology, one intelligent automation at a time."
          </p>
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000); // 5 seconds per slide
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background" 
    : "w-full max-w-6xl mx-auto";

  return (
    <div className={containerClass}>
      {/* Presentation Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-primary">Agentic AI Presentation</h2>
          <Badge variant="secondary">{currentSlide + 1} / {slides.length}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetPresentation}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Slide Container */}
      <div className={`relative overflow-hidden ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[600px]'}`}>
        <div
          key={currentSlide}
          className="absolute inset-0 p-8 flex flex-col justify-center transition-opacity duration-500"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">
              {slides[currentSlide].title}
            </h1>
            {slides[currentSlide].subtitle && (
              <p className="text-xl text-muted-foreground">
                {slides[currentSlide].subtitle}
              </p>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            {slides[currentSlide].content}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between p-4 border-t">
        <Button variant="outline" onClick={prevSlide} disabled={currentSlide === 0}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide 
                  ? 'bg-primary' 
                  : 'bg-muted hover:bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
        
        <Button variant="outline" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};