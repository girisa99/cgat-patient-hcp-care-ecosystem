/**
 * HERO PRODUCT SHOWCASE
 * Animated product showcase with regional content preview
 * Replaces random sample videos with actual product demonstration
 */
import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Globe, Mic, Video, Presentation, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroProductShowcaseProps {
  region: string;
  theme: string;
  languageCount: string;
}

// Product showcase steps - demonstrating the AI pipeline
const PIPELINE_STEPS = [
  { icon: Wand2, label: 'Input', description: 'Text, URL, or Upload', color: 'text-orange-500' },
  { icon: Sparkles, label: 'AI Process', description: 'Script + Visual Generation', color: 'text-purple-500' },
  { icon: Mic, label: 'Voice', description: 'Multi-language TTS', color: 'text-blue-500' },
  { icon: Video, label: 'Render', description: '4K Video + Avatar', color: 'text-green-500' },
  { icon: Globe, label: 'Distribute', description: 'Global Publishing', color: 'text-pink-500' },
];

// Sample outputs by region
const REGIONAL_OUTPUTS = {
  NAM: { title: 'Healthcare Training Video', format: '4K MP4', duration: '3:45' },
  EUR: { title: 'Compliance Presentation', format: 'PPTX + Video', duration: '5:20' },
  MENA: { title: 'رؤية 2030 عرض تقديمي', format: 'Arabic RTL', duration: '4:15' },
  IND: { title: 'EdTech Course Module', format: '22 Languages', duration: '6:30' },
  AFR: { title: 'Fintech Onboarding', format: 'Swahili + English', duration: '2:45' },
  APAC: { title: 'E-commerce Product Demo', format: 'CJK Optimized', duration: '3:00' },
  LATAM: { title: 'Tourism Campaign', format: 'Spanish + Portuguese', duration: '4:00' },
  CARIB: { title: 'Hospitality Training', format: 'Multi-lingual', duration: '3:30' },
};

export const HeroProductShowcase: React.FC<HeroProductShowcaseProps> = ({ 
  region, 
  theme, 
  languageCount 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const output = REGIONAL_OUTPUTS[region as keyof typeof REGIONAL_OUTPUTS] || REGIONAL_OUTPUTS.NAM;

  // Auto-animate through pipeline steps
  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div 
      className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border bg-card"
      onMouseEnter={() => setIsAnimating(false)}
      onMouseLeave={() => setIsAnimating(true)}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main content */}
      <div className="relative aspect-video p-6 md:p-8 flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Demo: {theme}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">{output.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-primary/20 rounded text-xs text-primary font-medium">{output.format}</span>
            <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">{output.duration}</span>
          </div>
        </div>

        {/* Pipeline visualization */}
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="flex items-center gap-2 md:gap-4">
            {PIPELINE_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isPast = index < activeStep;
              
              return (
                <React.Fragment key={step.label}>
                  <button
                    onClick={() => setActiveStep(index)}
                    className={`flex flex-col items-center p-3 md:p-4 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground scale-110 shadow-lg' 
                        : isPast 
                          ? 'bg-green-500/20 text-green-600'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon className={`h-5 w-5 md:h-6 md:w-6 ${isActive ? '' : step.color}`} />
                    <span className="text-xs mt-1 font-medium hidden md:block">{step.label}</span>
                  </button>
                  
                  {index < PIPELINE_STEPS.length - 1 && (
                    <div className={`w-4 md:w-8 h-0.5 transition-colors ${
                      isPast ? 'bg-green-500' : 'bg-border'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Current step description */}
        <div className="text-center mb-4">
          <p className="text-lg font-medium text-foreground">
            {PIPELINE_STEPS[activeStep].label}: {PIPELINE_STEPS[activeStep].description}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Powered by 12 AI providers • 95% confidence guarantee
          </p>
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-4">
          <Link to="/explore/demo">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <Play className="h-4 w-4 mr-2" />
              Try Interactive Demo
            </Button>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">🌍 {languageCount} Languages</span>
            <span className="text-muted-foreground">⚡ 4 min avg</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-500/20 rounded text-xs text-green-600 font-medium">
              ✓ 95% AI Confidence
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroProductShowcase;
